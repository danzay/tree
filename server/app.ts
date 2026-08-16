import Fastify, { type FastifyInstance } from 'fastify'
import type pg from 'pg'
import { z } from 'zod'
import { CEFR_LEVEL_SCHEMA, normalizeHeadword, PROGRESS_STATUS_SCHEMA } from './lib/vocabulary.ts'
import { registerMcpApi } from './routes/mcp-api.ts'

const LIST_QUERY_SCHEMA = z.object({
  q: z.string().trim().max(100).optional(),
  level: CEFR_LEVEL_SCHEMA.optional(),
  status: PROGRESS_STATUS_SCHEMA.optional(),
  partOfSpeech: z
    .string()
    .trim()
    .regex(/^[a-z_]+$/)
    .optional(),
  language: z
    .string()
    .trim()
    .regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/)
    .default('ru'),
  includeNeedsReview: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
})

const ID_PARAMS_SCHEMA = z.object({ id: z.coerce.number().int().positive() })

interface WordRow {
  id: string
  word: string
  definition: string | null
  transcription: string | null
  level: string
  reviewStatus: string
  status: string
  partsOfSpeech: string[]
  translations: Array<{ language: string; text: string }>
  collocations: string[]
  total: string
}

const SELECT_WORD_FIELDS = `
  SELECT s.id::text,
         h.word,
         s.definition_en AS definition,
         s.transcription,
         s.cefr_level AS level,
         s.review_status AS "reviewStatus",
         sp.status,
         COALESCE(pos.values, '[]'::json) AS "partsOfSpeech",
         COALESCE(translations.values, '[]'::json) AS translations,
         COALESCE(collocations.values, '[]'::json) AS collocations,
         count(*) OVER()::text AS total
  FROM senses s
  JOIN headwords h ON h.id = s.headword_id
  JOIN sense_progress sp ON sp.sense_id = s.id
  LEFT JOIN LATERAL (
    SELECT json_agg(spos.part_of_speech_code ORDER BY spos.part_of_speech_code) AS values
    FROM sense_parts_of_speech spos
    WHERE spos.sense_id = s.id
  ) pos ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(
      json_build_object('language', st.language_code, 'text', st.translation)
      ORDER BY st.language_code, st.position
    ) AS values
    FROM sense_translations st
    WHERE st.sense_id = s.id AND st.language_code = $1
  ) translations ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(sc.text ORDER BY sc.position) AS values
    FROM sense_collocations sc
    WHERE sc.sense_id = s.id
  ) collocations ON true
`

function publicWord(row: WordRow) {
  return {
    id: row.id,
    word: row.word,
    definition: row.definition,
    transcription: row.transcription,
    level: row.level,
    reviewStatus: row.reviewStatus,
    status: row.status,
    partsOfSpeech: row.partsOfSpeech,
    translations: row.translations,
    collocations: row.collocations,
  }
}

export function buildApp(pool: pg.Pool): FastifyInstance {
  const app = Fastify({ logger: true })

  app.setErrorHandler((error, request, reply) => {
    request.log.error(
      { errorName: error instanceof Error ? error.name : 'UnknownError' },
      'Request failed',
    )
    return reply.status(500).send({ error: 'Internal server error' })
  })

  app.get('/api/health', async (_request, reply) => {
    await pool.query('SELECT 1')
    return reply.send({ status: 'ok', database: 'reachable' })
  })

  app.get('/api/stats', async (_request, reply) => {
    const [summary, levels, statuses, reconciliation] = await Promise.all([
      pool.query<{ senses: string; headwords: string }>(`
        SELECT count(*)::text AS senses,
               count(DISTINCT headword_id)::text AS headwords
        FROM senses
      `),
      pool.query<{ level: string; count: string }>(`
        SELECT cefr_level AS level, count(*)::text AS count
        FROM senses GROUP BY cefr_level ORDER BY cefr_level
      `),
      pool.query<{ status: string; count: string }>(`
        SELECT status, count(*)::text AS count
        FROM sense_progress GROUP BY status ORDER BY status
      `),
      pool.query<{ type: string; count: string }>(`
        SELECT issue_type AS type, count(*)::text AS count
        FROM reconciliation_items WHERE status = 'open'
        GROUP BY issue_type ORDER BY issue_type
      `),
    ])

    return reply.send({
      senses: Number(summary.rows[0]?.senses ?? 0),
      headwords: Number(summary.rows[0]?.headwords ?? 0),
      byLevel: Object.fromEntries(levels.rows.map((row) => [row.level, Number(row.count)])),
      byStatus: Object.fromEntries(statuses.rows.map((row) => [row.status, Number(row.count)])),
      reconciliation: Object.fromEntries(
        reconciliation.rows.map((row) => [row.type, Number(row.count)]),
      ),
    })
  })

  app.get('/api/words', async (request, reply) => {
    const parsed = LIST_QUERY_SCHEMA.safeParse(request.query)
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: 'Invalid query parameters', details: parsed.error.flatten() })
    }

    const query = parsed.data
    const values: unknown[] = [query.language]
    const filters: string[] = query.includeNeedsReview ? [] : [`s.review_status <> 'needs_review'`]
    const ordering: string[] = []
    const parameter = (value: unknown) => {
      values.push(value)
      return `$${values.length}`
    }

    if (query.q) {
      const searchParameter = parameter(normalizeHeadword(query.q))
      filters.push(`strpos(h.normalized_word, ${searchParameter}) > 0`)
      ordering.push(`CASE
        WHEN h.normalized_word = ${searchParameter} THEN 0
        WHEN h.normalized_word = 'to ' || ${searchParameter} THEN 1
        WHEN strpos(h.normalized_word, ${searchParameter}) = 1 THEN 2
        ELSE 3
      END`)
    }

    if (query.level) {
      filters.push(`s.cefr_level = ${parameter(query.level)}`)
    }

    if (query.status) {
      filters.push(`sp.status = ${parameter(query.status)}`)
    }

    if (query.partOfSpeech) {
      filters.push(`EXISTS (
        SELECT 1 FROM sense_parts_of_speech filter_pos
        WHERE filter_pos.sense_id = s.id
          AND filter_pos.part_of_speech_code = ${parameter(query.partOfSpeech)}
      )`)
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const orderBy = [...ordering, 'h.normalized_word', 's.sense_order', 's.id'].join(', ')
    const limitParameter = parameter(query.limit)
    const offsetParameter = parameter(query.offset)
    const result = await pool.query<WordRow>(
      `${SELECT_WORD_FIELDS}
       ${where}
       ORDER BY ${orderBy}
       LIMIT ${limitParameter} OFFSET ${offsetParameter}`,
      values,
    )

    return reply.send({
      items: result.rows.map(publicWord),
      total: Number(result.rows[0]?.total ?? 0),
      limit: query.limit,
      offset: query.offset,
    })
  })

  app.get('/api/words/:id', async (request, reply) => {
    const params = ID_PARAMS_SCHEMA.safeParse(request.params)
    const language = z
      .string()
      .regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/)
      .safeParse((request.query as { language?: unknown }).language ?? 'ru')
    if (!params.success || !language.success) {
      return reply.status(400).send({ error: 'Invalid word ID or language' })
    }

    const result = await pool.query<WordRow>(`${SELECT_WORD_FIELDS} WHERE s.id = $2`, [
      language.data,
      params.data.id,
    ])
    const row = result.rows[0]
    if (!row) {
      return reply.status(404).send({ error: 'Word sense not found' })
    }

    return reply.send(publicWord(row))
  })

  app.register(async (mcpApi) => {
    await registerMcpApi(mcpApi, pool, process.env.MCP_API_TOKEN)
  })

  return app
}
