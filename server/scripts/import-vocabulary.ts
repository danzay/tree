import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { PoolClient } from 'pg'
import { z } from 'zod'
import { createDatabasePool } from '../db.ts'
import {
  decodePartOfSpeech,
  inferImportedStatus,
  normalizeHeadword,
  parseExamples,
  type ImportedStatus,
} from '../lib/vocabulary.ts'

const SOURCE_SYSTEM = 'reword_sqlite'
const IMPORTER_VERSION = '1.0.0'
const EXPECTED_CATEGORY_LINKS = 5_639
const SQL_PLACEHOLDER = '?'
const SQL_PLACEHOLDER_SEPARATOR = ', '
const SELECTED_CATEGORIES = [
  'oxford3000_a1',
  'oxford3000_a2',
  'oxford3000_b1',
  'oxford3000_b2',
  'oxford5000_b2',
  'oxford5000_c1',
] as const

const SOURCE_ROW_SCHEMA = z.object({
  ID: z.number().int(),
  WORD: z.string().trim().min(1),
  RUS: z.string().nullable(),
  TRANSCRIPTION: z.string().nullable(),
  POS: z.number().int().nullable(),
  EXAMPLES_RUS: z.string().nullable(),
  Q_REC: z.number().int(),
  Q_REP: z.number().int(),
  T_REC: z.number().int().nullable(),
  T_REP: z.number().int().nullable(),
  I_REC: z.number().int().nullable(),
  I_REP: z.number().int().nullable(),
  S_REC: z.number().int(),
  S_REP: z.number().int(),
  E_REC: z.number(),
  E_REP: z.number(),
  F_REC: z.number().int(),
  F_REP: z.number().int(),
  CATEGORY_ID: z.enum(SELECTED_CATEGORIES),
})

type SourceRow = z.infer<typeof SOURCE_ROW_SCHEMA>

function categoryLevel(category: SourceRow['CATEGORY_ID']): string {
  return category.slice(category.lastIndexOf('_') + 1).toUpperCase()
}

async function queryId(client: PoolClient, text: string, values: unknown[]): Promise<number> {
  const result = await client.query<{ id: string }>(text, values)
  const id = result.rows[0]?.id
  if (!id) {
    throw new Error('Expected an inserted or updated row ID')
  }

  return Number(id)
}

const sourcePath = process.env.SOURCE_SQLITE
if (!sourcePath) {
  throw new Error('SOURCE_SQLITE is required')
}

const sourceBytes = await readFile(sourcePath)
const sourceHash = createHash('sha256').update(sourceBytes).digest('hex')
const database = new DatabaseSync(sourcePath, { readOnly: true })
const pool = createDatabasePool()

const placeholders = SELECTED_CATEGORIES.map(() => SQL_PLACEHOLDER).join(SQL_PLACEHOLDER_SEPARATOR)
const rawRows = database
  .prepare(
    `
  SELECT w.ID, w.WORD, w.RUS, w.TRANSCRIPTION, w.POS, w.EXAMPLES_RUS,
         w.Q_REC, w.Q_REP, w.T_REC, w.T_REP, w.I_REC, w.I_REP,
         w.S_REC, w.S_REP, w.E_REC, w.E_REP, w.F_REC, w.F_REP,
         wc.CATEGORY_ID
  FROM WORD w
  JOIN WORD_CATEGORY wc ON wc.WORD_ID = w.ID
  WHERE wc.CATEGORY_ID IN (${placeholders})
  ORDER BY w.ID, wc.CATEGORY_ID
`,
  )
  .all(...SELECTED_CATEGORIES)

const rows = rawRows.map((row) => SOURCE_ROW_SCHEMA.parse(row))
if (rows.length !== EXPECTED_CATEGORY_LINKS) {
  throw new Error(`Expected ${EXPECTED_CATEGORY_LINKS} Oxford category links; found ${rows.length}`)
}

const rowsBySourceId = new Map<number, SourceRow[]>()
for (const row of rows) {
  const group = rowsBySourceId.get(row.ID) ?? []
  group.push(row)
  rowsBySourceId.set(row.ID, group)
}

const ambiguousSourceRecords = [...rowsBySourceId.values()].filter(
  (group) => group.length > 1,
).length

const runResult = await pool.query<{ id: string }>(
  `INSERT INTO import_runs
    (source_type, source_filename, source_sha256, importer_version, status)
   VALUES ($1, $2, $3, $4, 'running')
   RETURNING id`,
  [SOURCE_SYSTEM, path.basename(sourcePath), sourceHash, IMPORTER_VERSION],
)
const importRunId = Number(runResult.rows[0]?.id)
let rejectedCount = 0
let warningCount = 0

const client = await pool.connect()
try {
  await client.query('BEGIN')

  for (const [sourceId, sourceRows] of rowsBySourceId) {
    const first = sourceRows[0]
    if (!first) {
      continue
    }

    let inferredStatus: ImportedStatus
    try {
      inferredStatus = inferImportedStatus({
        qRec: first.Q_REC,
        qRep: first.Q_REP,
        sRec: first.S_REC,
        sRep: first.S_REP,
        eRec: first.E_REC,
        eRep: first.E_REP,
      })
    } catch (error) {
      rejectedCount += 1
      await client.query(
        `INSERT INTO import_issues
          (import_run_id, source_id, severity, issue_code, details)
         VALUES ($1, $2, 'error', 'unclassified_status', $3)`,
        [
          importRunId,
          sourceId,
          JSON.stringify({ message: error instanceof Error ? error.message : 'Unknown error' }),
        ],
      )
      continue
    }

    const rawScheduling = {
      qRec: first.Q_REC,
      qRep: first.Q_REP,
      tRec: first.T_REC,
      tRep: first.T_REP,
      iRec: first.I_REC,
      iRep: first.I_REP,
      sRec: first.S_REC,
      sRep: first.S_REP,
      eRec: first.E_REC,
      eRep: first.E_REP,
      fRec: first.F_REC,
      fRep: first.F_REP,
    }

    const sourceRecordId = await queryId(
      client,
      `INSERT INTO source_import_records
        (import_run_id, source_system, source_id, source_word, source_translation,
         source_pos_code, inferred_status, raw_scheduling)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (source_system, source_id) DO UPDATE SET
         import_run_id = EXCLUDED.import_run_id,
         source_word = EXCLUDED.source_word,
         source_translation = EXCLUDED.source_translation,
         source_pos_code = EXCLUDED.source_pos_code,
         inferred_status = EXCLUDED.inferred_status,
         raw_scheduling = EXCLUDED.raw_scheduling,
         updated_at = now()
       RETURNING id`,
      [
        importRunId,
        SOURCE_SYSTEM,
        sourceId,
        first.WORD,
        first.RUS,
        first.POS,
        inferredStatus,
        JSON.stringify(rawScheduling),
      ],
    )

    const headwordId = await queryId(
      client,
      `INSERT INTO headwords (word, normalized_word)
       VALUES ($1, $2)
       ON CONFLICT (normalized_word) DO UPDATE SET word = EXCLUDED.word, updated_at = now()
       RETURNING id`,
      [first.WORD, normalizeHeadword(first.WORD)],
    )

    const isAmbiguous = sourceRows.length > 1
    let examples: ReturnType<typeof parseExamples> = []
    try {
      examples = parseExamples(first.EXAMPLES_RUS)
    } catch (error) {
      warningCount += 1
      await client.query(
        `INSERT INTO import_issues
          (import_run_id, source_id, severity, issue_code, details)
         VALUES ($1, $2, 'warning', 'invalid_examples_json', $3)`,
        [
          importRunId,
          sourceId,
          JSON.stringify({ message: error instanceof Error ? error.message : 'Unknown error' }),
        ],
      )
    }

    const decodedPos = decodePartOfSpeech(first.POS)
    if (decodedPos.unknownBits > 0) {
      warningCount += 1
      await client.query(
        `INSERT INTO import_issues
          (import_run_id, source_id, severity, issue_code, details)
         VALUES ($1, $2, 'warning', 'unknown_pos_bits', $3)`,
        [
          importRunId,
          sourceId,
          JSON.stringify({ sourceCode: first.POS, unknownBits: decodedPos.unknownBits }),
        ],
      )
    }

    for (const [senseIndex, row] of sourceRows.entries()) {
      const level = categoryLevel(row.CATEGORY_ID)
      const senseId = await queryId(
        client,
        `INSERT INTO senses
          (headword_id, source_import_record_id, definition_en, transcription,
           cefr_level, sense_order, review_status)
         VALUES ($1, $2, NULL, $3, $4, $5, $6)
         ON CONFLICT (source_import_record_id, cefr_level) DO UPDATE SET
           headword_id = EXCLUDED.headword_id,
           transcription = EXCLUDED.transcription,
           sense_order = EXCLUDED.sense_order,
           review_status = EXCLUDED.review_status,
           updated_at = now()
         RETURNING id`,
        [
          headwordId,
          sourceRecordId,
          first.TRANSCRIPTION,
          level,
          senseIndex + 1,
          isAmbiguous ? 'needs_review' : 'imported',
        ],
      )

      await client.query(
        `INSERT INTO sense_sources (sense_id, source_import_record_id, source_category)
         VALUES ($1, $2, $3)
         ON CONFLICT (sense_id, source_category) DO UPDATE SET
           source_import_record_id = EXCLUDED.source_import_record_id`,
        [senseId, sourceRecordId, row.CATEGORY_ID],
      )

      await client.query('DELETE FROM sense_parts_of_speech WHERE sense_id = $1', [senseId])
      for (const posCode of decodedPos.codes) {
        await client.query(
          `INSERT INTO sense_parts_of_speech (sense_id, part_of_speech_code)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [senseId, posCode],
        )
      }

      await client.query(
        `DELETE FROM sense_translations WHERE sense_id = $1 AND language_code = 'ru'`,
        [senseId],
      )
      if (first.RUS?.trim()) {
        await client.query(
          `INSERT INTO sense_translations (sense_id, language_code, translation, position)
           VALUES ($1, 'ru', $2, 1)`,
          [senseId, first.RUS],
        )
      }

      await client.query('DELETE FROM sense_examples WHERE sense_id = $1', [senseId])
      for (const [exampleIndex, example] of examples.entries()) {
        const exampleId = await queryId(
          client,
          `INSERT INTO sense_examples (sense_id, sentence, position)
           VALUES ($1, $2, $3) RETURNING id`,
          [senseId, example.o, exampleIndex + 1],
        )
        if (example.t) {
          await client.query(
            `INSERT INTO example_translations (example_id, language_code, translation)
             VALUES ($1, 'ru', $2)`,
            [exampleId, example.t],
          )
        }
      }

      await client.query(
        `INSERT INTO sense_progress (sense_id, status, status_origin)
         VALUES ($1, $2, $3)
         ON CONFLICT (sense_id) DO UPDATE SET
           status = CASE WHEN sense_progress.status_origin IN ('imported', 'unresolved') THEN EXCLUDED.status ELSE sense_progress.status END,
           status_origin = CASE WHEN sense_progress.status_origin IN ('imported', 'unresolved') THEN EXCLUDED.status_origin ELSE sense_progress.status_origin END,
           updated_at = now()`,
        [senseId, isAmbiguous ? 'new' : inferredStatus, isAmbiguous ? 'unresolved' : 'imported'],
      )
    }

    if (isAmbiguous) {
      const levels = sourceRows.map((row) => categoryLevel(row.CATEGORY_ID))
      await client.query(
        `INSERT INTO reconciliation_items
          (source_key, issue_type, headword, official_level, source_import_record_id, notes, checked_at)
         VALUES ($1, 'ambiguous_levels', $2, $3, $4, $5, CURRENT_DATE)
         ON CONFLICT (source_key) DO UPDATE SET
           headword = EXCLUDED.headword,
           official_level = EXCLUDED.official_level,
           source_import_record_id = EXCLUDED.source_import_record_id,
           notes = EXCLUDED.notes,
           updated_at = now()`,
        [
          `source-multilevel:${sourceId}`,
          first.WORD,
          levels.join(' / '),
          sourceRecordId,
          'One source record is linked to multiple CEFR levels. Provisional senses require English definitions and manual separation.',
        ],
      )
    }
  }

  await client.query('COMMIT')

  await pool.query(
    `UPDATE import_runs SET
       status = 'completed', completed_at = now(), source_records = $2,
       senses_written = $3, rejected_count = $4,
       details = $5
     WHERE id = $1`,
    [
      importRunId,
      rowsBySourceId.size,
      rows.length,
      rejectedCount,
      JSON.stringify({
        categoryLinks: rows.length,
        ambiguousSourceRecords,
        warningCount,
      }),
    ],
  )

  console.log(
    `Import completed: ${rowsBySourceId.size} source records, ${rows.length} senses, ` +
      `${rejectedCount} rejected records, ${warningCount} warnings`,
  )
} catch (error) {
  await client.query('ROLLBACK')
  await pool.query(
    `UPDATE import_runs SET status = 'failed', completed_at = now(), rejected_count = $2
     WHERE id = $1`,
    [importRunId, rejectedCount],
  )
  throw error
} finally {
  client.release()
  database.close()
  await pool.end()
}
