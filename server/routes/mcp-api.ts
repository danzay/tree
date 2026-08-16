import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance, FastifyReply } from 'fastify'
import type pg from 'pg'
import { z } from 'zod'
import {
  CEFR_LEVEL_SCHEMA,
  PART_OF_SPEECH_SCHEMA,
  PROGRESS_STATUS_SCHEMA,
} from '../lib/vocabulary.ts'

const SENSE_PARAMS_SCHEMA = z.object({ id: z.coerce.number().int().positive() })
const EXPECTED_UPDATE_SCHEMA = z.object({
  expectedUpdatedAt: z.iso.datetime(),
})
const DEFINITION_SCHEMA = EXPECTED_UPDATE_SCHEMA.extend({
  definition: z.string().trim().min(1).max(4_000).nullable(),
})
const TRANSCRIPTION_SCHEMA = EXPECTED_UPDATE_SCHEMA.extend({
  transcription: z.string().trim().min(1).max(300).nullable(),
})
const LEVEL_SCHEMA = EXPECTED_UPDATE_SCHEMA.extend({ level: CEFR_LEVEL_SCHEMA })
const TRANSLATION_PARAMS_SCHEMA = SENSE_PARAMS_SCHEMA.extend({
  language: z
    .string()
    .trim()
    .regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/),
})
const TRANSLATION_SCHEMA = EXPECTED_UPDATE_SCHEMA.extend({
  translation: z.string().trim().min(1).max(4_000),
  languageName: z.string().trim().min(1).max(100).optional(),
})
const COLLOCATION_SCHEMA = EXPECTED_UPDATE_SCHEMA.extend({
  collocation: z.string().trim().min(1).max(500),
})
const PARTS_OF_SPEECH_SCHEMA = EXPECTED_UPDATE_SCHEMA.extend({
  partsOfSpeech: z
    .array(PART_OF_SPEECH_SCHEMA)
    .min(1)
    .max(12)
    .transform((values) => [...new Set(values)]),
})
const STATUS_SCHEMA = EXPECTED_UPDATE_SCHEMA.extend({ status: PROGRESS_STATUS_SCHEMA })

class MutationError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

function authorized(header: string | undefined, configuredToken: string | undefined): boolean {
  if (!configuredToken || !header?.startsWith('Bearer ')) {
    return false
  }

  const supplied = Buffer.from(header.slice('Bearer '.length))
  const expected = Buffer.from(configuredToken)
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

async function mutateSense(
  pool: pg.Pool,
  senseId: number,
  expectedUpdatedAt: string,
  toolName: string,
  mutation: (client: pg.PoolClient) => Promise<{ before: unknown; after: unknown }>,
): Promise<{ updatedAt: string; before: unknown; after: unknown }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const sense = await client.query<{ updated_at: Date }>(
      'SELECT updated_at FROM senses WHERE id = $1 FOR UPDATE',
      [senseId],
    )
    const current = sense.rows[0]
    if (!current) {
      throw new MutationError(404, 'Word sense not found')
    }

    if (current.updated_at.toISOString() !== new Date(expectedUpdatedAt).toISOString()) {
      throw new MutationError(409, 'Word sense changed; fetch it again before updating')
    }

    const change = await mutation(client)
    const updated = await client.query<{ updated_at: Date }>(
      'UPDATE senses SET updated_at = clock_timestamp() WHERE id = $1 RETURNING updated_at',
      [senseId],
    )
    const updatedAt = updated.rows[0]?.updated_at.toISOString()
    if (!updatedAt) {
      throw new Error('Failed to update word sense timestamp')
    }

    await client.query(
      `INSERT INTO assistant_changes
        (sense_id, client, tool_name, before_data, after_data)
       VALUES ($1, 'local_mcp', $2, $3, $4)`,
      [senseId, toolName, JSON.stringify(change.before), JSON.stringify(change.after)],
    )
    await client.query('COMMIT')
    return { updatedAt, ...change }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function invalid(reply: FastifyReply, details: unknown) {
  return reply.status(400).send({ error: 'Invalid request', details })
}

async function sendMutation(
  reply: FastifyReply,
  operation: () => Promise<{ updatedAt: string; before: unknown; after: unknown }>,
) {
  try {
    return reply.send(await operation())
  } catch (error) {
    if (error instanceof MutationError) {
      return reply.status(error.statusCode).send({ error: error.message })
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return reply
        .status(409)
        .send({ error: 'The requested value conflicts with existing vocabulary data' })
    }

    throw error
  }
}

export async function registerMcpApi(
  app: FastifyInstance,
  pool: pg.Pool,
  configuredToken: string | undefined,
) {
  app.addHook('preHandler', async (request, reply) => {
    if (!configuredToken) {
      return reply.status(503).send({ error: 'Local MCP API is not configured' })
    }

    if (!authorized(request.headers.authorization, configuredToken)) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  app.get('/api/mcp/health', async (_request, reply) => {
    await pool.query('SELECT 1')
    return reply.send({ status: 'ok', service: 'vocabulary-mcp-proxy' })
  })

  app.get('/api/mcp/word-senses/:id', async (request, reply) => {
    const params = SENSE_PARAMS_SCHEMA.safeParse(request.params)
    if (!params.success) {
      return invalid(reply, params.error.flatten())
    }

    const result = await pool.query<{
      id: string
      word: string
      definition: string | null
      transcription: string | null
      level: string
      reviewStatus: string
      status: string
      statusOrigin: string
      updatedAt: Date
      partsOfSpeech: string[]
      translations: Array<{ language: string; text: string }>
      collocations: Array<{ id: string; text: string }>
      examples: Array<{ sentence: string; translations: Array<{ language: string; text: string }> }>
      sourceCategories: string[]
    }>(
      `SELECT s.id::text,
              h.word,
              s.definition_en AS definition,
              s.transcription,
              s.cefr_level AS level,
              s.review_status AS "reviewStatus",
              sp.status,
              sp.status_origin AS "statusOrigin",
              s.updated_at AS "updatedAt",
              COALESCE(pos.values, '[]'::json) AS "partsOfSpeech",
              COALESCE(translations.values, '[]'::json) AS translations,
              COALESCE(collocations.values, '[]'::json) AS collocations,
              COALESCE(examples.values, '[]'::json) AS examples,
              COALESCE(sources.values, '[]'::json) AS "sourceCategories"
       FROM senses s
       JOIN headwords h ON h.id = s.headword_id
       JOIN sense_progress sp ON sp.sense_id = s.id
       LEFT JOIN LATERAL (
         SELECT json_agg(spos.part_of_speech_code ORDER BY spos.part_of_speech_code) AS values
         FROM sense_parts_of_speech spos WHERE spos.sense_id = s.id
       ) pos ON true
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object('language', st.language_code, 'text', st.translation)
                         ORDER BY st.language_code, st.position) AS values
         FROM sense_translations st WHERE st.sense_id = s.id
       ) translations ON true
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object('id', sc.id::text, 'text', sc.text)
                         ORDER BY sc.position) AS values
         FROM sense_collocations sc WHERE sc.sense_id = s.id
       ) collocations ON true
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object(
           'sentence', se.sentence,
           'translations', COALESCE(et.values, '[]'::json)
         ) ORDER BY se.position) AS values
         FROM sense_examples se
         LEFT JOIN LATERAL (
           SELECT json_agg(json_build_object('language', language_code, 'text', translation)
                           ORDER BY language_code) AS values
           FROM example_translations WHERE example_id = se.id
         ) et ON true
         WHERE se.sense_id = s.id
       ) examples ON true
       LEFT JOIN LATERAL (
         SELECT json_agg(ss.source_category ORDER BY ss.source_category) AS values
         FROM sense_sources ss WHERE ss.sense_id = s.id
       ) sources ON true
       WHERE s.id = $1`,
      [params.data.id],
    )
    const row = result.rows[0]
    if (!row) {
      return reply.status(404).send({ error: 'Word sense not found' })
    }

    return reply.send({ ...row, updatedAt: row.updatedAt.toISOString() })
  })

  app.patch('/api/mcp/word-senses/:id/definition', async (request, reply) => {
    const params = SENSE_PARAMS_SCHEMA.safeParse(request.params)
    const body = DEFINITION_SCHEMA.safeParse(request.body)
    if (!params.success || !body.success) {
      return invalid(reply, { params: params.error?.flatten(), body: body.error?.flatten() })
    }

    return sendMutation(reply, () =>
      mutateSense(
        pool,
        params.data.id,
        body.data.expectedUpdatedAt,
        'set_definition',
        async (client) => {
          const before = await client.query<{ definition: string | null }>(
            'SELECT definition_en AS definition FROM senses WHERE id = $1',
            [params.data.id],
          )
          await client.query('UPDATE senses SET definition_en = $2 WHERE id = $1', [
            params.data.id,
            body.data.definition,
          ])
          return { before: before.rows[0], after: { definition: body.data.definition } }
        },
      ),
    )
  })

  app.patch('/api/mcp/word-senses/:id/transcription', async (request, reply) => {
    const params = SENSE_PARAMS_SCHEMA.safeParse(request.params)
    const body = TRANSCRIPTION_SCHEMA.safeParse(request.body)
    if (!params.success || !body.success) {
      return invalid(reply, { params: params.error?.flatten(), body: body.error?.flatten() })
    }

    return sendMutation(reply, () =>
      mutateSense(
        pool,
        params.data.id,
        body.data.expectedUpdatedAt,
        'set_transcription',
        async (client) => {
          const before = await client.query<{ transcription: string | null }>(
            'SELECT transcription FROM senses WHERE id = $1',
            [params.data.id],
          )
          await client.query('UPDATE senses SET transcription = $2 WHERE id = $1', [
            params.data.id,
            body.data.transcription,
          ])
          return { before: before.rows[0], after: { transcription: body.data.transcription } }
        },
      ),
    )
  })

  app.patch('/api/mcp/word-senses/:id/level', async (request, reply) => {
    const params = SENSE_PARAMS_SCHEMA.safeParse(request.params)
    const body = LEVEL_SCHEMA.safeParse(request.body)
    if (!params.success || !body.success) {
      return invalid(reply, { params: params.error?.flatten(), body: body.error?.flatten() })
    }

    return sendMutation(reply, () =>
      mutateSense(
        pool,
        params.data.id,
        body.data.expectedUpdatedAt,
        'set_cefr_level',
        async (client) => {
          const before = await client.query<{ level: string }>(
            'SELECT cefr_level AS level FROM senses WHERE id = $1',
            [params.data.id],
          )
          await client.query('UPDATE senses SET cefr_level = $2 WHERE id = $1', [
            params.data.id,
            body.data.level,
          ])
          return { before: before.rows[0], after: { level: body.data.level } }
        },
      ),
    )
  })

  app.put('/api/mcp/word-senses/:id/translations/:language', async (request, reply) => {
    const params = TRANSLATION_PARAMS_SCHEMA.safeParse(request.params)
    const body = TRANSLATION_SCHEMA.safeParse(request.body)
    if (!params.success || !body.success) {
      return invalid(reply, { params: params.error?.flatten(), body: body.error?.flatten() })
    }

    return sendMutation(reply, () =>
      mutateSense(
        pool,
        params.data.id,
        body.data.expectedUpdatedAt,
        'set_translation',
        async (client) => {
          if (body.data.languageName) {
            await client.query(
              `INSERT INTO languages (code, name) VALUES ($1, $2)
           ON CONFLICT (code) DO NOTHING`,
              [params.data.language, body.data.languageName],
            )
          }

          const language = await client.query(
            'SELECT 1 FROM languages WHERE code = $1 AND is_active',
            [params.data.language],
          )
          if (!language.rowCount) {
            throw new MutationError(
              400,
              'Language is not configured; provide languageName to create it',
            )
          }

          const before = await client.query<{ translation: string }>(
            'SELECT translation FROM sense_translations WHERE sense_id = $1 AND language_code = $2 AND position = 1',
            [params.data.id, params.data.language],
          )
          await client.query(
            `INSERT INTO sense_translations (sense_id, language_code, translation, position)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (sense_id, language_code, position)
         DO UPDATE SET translation = EXCLUDED.translation`,
            [params.data.id, params.data.language, body.data.translation],
          )
          return {
            before: {
              language: params.data.language,
              translation: before.rows[0]?.translation ?? null,
            },
            after: { language: params.data.language, translation: body.data.translation },
          }
        },
      ),
    )
  })

  app.post('/api/mcp/word-senses/:id/collocations', async (request, reply) => {
    const params = SENSE_PARAMS_SCHEMA.safeParse(request.params)
    const body = COLLOCATION_SCHEMA.safeParse(request.body)
    if (!params.success || !body.success) {
      return invalid(reply, { params: params.error?.flatten(), body: body.error?.flatten() })
    }

    return sendMutation(reply, () =>
      mutateSense(
        pool,
        params.data.id,
        body.data.expectedUpdatedAt,
        'add_collocation',
        async (client) => {
          const existing = await client.query<{ id: string; text: string }>(
            'SELECT id::text, text FROM sense_collocations WHERE sense_id = $1 AND lower(text) = lower($2)',
            [params.data.id, body.data.collocation],
          )
          if (existing.rows[0]) {
            return { before: existing.rows[0], after: existing.rows[0] }
          }

          const inserted = await client.query<{ id: string; text: string }>(
            `INSERT INTO sense_collocations (sense_id, text, position, source)
         VALUES ($1, $2, (SELECT COALESCE(max(position), 0) + 1 FROM sense_collocations WHERE sense_id = $1), 'local_mcp')
         RETURNING id::text, text`,
            [params.data.id, body.data.collocation],
          )
          return { before: null, after: inserted.rows[0] }
        },
      ),
    )
  })

  app.put('/api/mcp/word-senses/:id/parts-of-speech', async (request, reply) => {
    const params = SENSE_PARAMS_SCHEMA.safeParse(request.params)
    const body = PARTS_OF_SPEECH_SCHEMA.safeParse(request.body)
    if (!params.success || !body.success) {
      return invalid(reply, { params: params.error?.flatten(), body: body.error?.flatten() })
    }

    return sendMutation(reply, () =>
      mutateSense(
        pool,
        params.data.id,
        body.data.expectedUpdatedAt,
        'set_parts_of_speech',
        async (client) => {
          const before = await client.query<{ code: string }>(
            'SELECT part_of_speech_code AS code FROM sense_parts_of_speech WHERE sense_id = $1 ORDER BY code',
            [params.data.id],
          )
          await client.query('DELETE FROM sense_parts_of_speech WHERE sense_id = $1', [
            params.data.id,
          ])
          for (const code of body.data.partsOfSpeech) {
            await client.query(
              'INSERT INTO sense_parts_of_speech (sense_id, part_of_speech_code) VALUES ($1, $2)',
              [params.data.id, code],
            )
          }

          return {
            before: { partsOfSpeech: before.rows.map((row) => row.code) },
            after: { partsOfSpeech: body.data.partsOfSpeech },
          }
        },
      ),
    )
  })

  app.put('/api/mcp/word-senses/:id/status', async (request, reply) => {
    const params = SENSE_PARAMS_SCHEMA.safeParse(request.params)
    const body = STATUS_SCHEMA.safeParse(request.body)
    if (!params.success || !body.success) {
      return invalid(reply, { params: params.error?.flatten(), body: body.error?.flatten() })
    }

    return sendMutation(reply, () =>
      mutateSense(
        pool,
        params.data.id,
        body.data.expectedUpdatedAt,
        'set_learning_status',
        async (client) => {
          const before = await client.query<{ status: string; origin: string }>(
            'SELECT status, status_origin AS origin FROM sense_progress WHERE sense_id = $1',
            [params.data.id],
          )
          await client.query(
            `UPDATE sense_progress SET status = $2, status_origin = 'manual', updated_at = now()
         WHERE sense_id = $1`,
            [params.data.id, body.data.status],
          )
          return { before: before.rows[0], after: { status: body.data.status, origin: 'manual' } }
        },
      ),
    )
  })
}
