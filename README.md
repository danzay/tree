# Oxford vocabulary app

React + TypeScript vocabulary browser backed by a server-side Fastify API and PostgreSQL. The browser never receives the database connection string and never connects directly to PostgreSQL.

## Requirements

- Node.js 22.13.x or 24+
- PostgreSQL 14+
- The source ReWord SQLite dictionary

## Environment

Copy `.env.example` to `.env` and fill in local values:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/vocabulary
PORT=3001
MCP_API_TOKEN=generate-with-npm-run-mcp-token
MCP_API_PORT=3102
SOURCE_SQLITE=/absolute/path/to/reword_en.sqlite
```

`.env` and `.env.*` are ignored by Git; `.env.example` is the only exception and contains placeholders only. Do not use a `VITE_` prefix for `DATABASE_URL`, because Vite exposes such variables to browser code.

## Install and initialize

```bash
npm install
npm run db:setup
```

`db:setup` applies pending migrations and runs the idempotent import. It imports these source categories:

- `oxford3000_a1`
- `oxford3000_a2`
- `oxford3000_b1`
- `oxford3000_b2`
- `oxford5000_b2`
- `oxford5000_c1`

The importer refuses to proceed unless it finds the expected 5,639 category links. Re-running it updates source-backed data without creating duplicate headwords, senses, translations, progress rows, or reconciliation items.

The database migrations also add the 57 official Oxford B1–C1 entries that were absent from those SQLite categories. Oxford's part-of-speech and CEFR distinctions expand them to 60 catalogue senses. They use `oxford_official_wordlist` provenance, begin with `new` learning status, and leave definitions, translations, and transcriptions empty until approved data is supplied.

## Run locally

```bash
npm run dev
```

This starts:

- React/Vite at `http://localhost:5173`
- Fastify at `http://127.0.0.1:3001`

Vite proxies `/api` to Fastify, keeping database access on the server.

For separate processes:

```bash
npm run dev:api
npm run dev:web
```

## Commands

| Command              | Purpose                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| `npm run db:migrate` | Apply unapplied SQL migrations transactionally.                            |
| `npm run db:import`  | Import or refresh SQLite vocabulary data.                                  |
| `npm run db:setup`   | Run migrations followed by the import.                                     |
| `npm test`           | Run transformation tests.                                                  |
| `npm run lint`       | Run ESLint.                                                                |
| `npm run build`      | Type-check the server and client, then create the production client build. |
| `npm run mcp:token`  | Generate the local MCP proxy credential without printing it.               |
| `npm run mcp`        | Start the vocabulary MCP server over STDIO.                                |
| `npm run mcp:smoke`  | Exercise MCP discovery, read, and an audited no-op write.                  |
| `npm start`          | Start only the API using the current `.env`.                               |

## API

### Health

```http
GET /api/health
```

### Statistics

```http
GET /api/stats
```

Returns totals by CEFR level, learning status, and reconciliation type.

### Search senses

```http
GET /api/words?q=sight&level=B1&status=learned&partOfSpeech=noun&language=ru&limit=30&offset=0
```

Supported query parameters:

- `q`: case-insensitive headword prefix, at most 100 characters
- `level`: `A1`, `A2`, `B1`, `B2`, `C1`, or `C2`
- `status`: `new`, `learning`, `reviewing`, `learned`, `known`, or `suspended`
- `partOfSpeech`: normalized grammatical class such as `noun` or `verb`
- `language`: translation language code; defaults to `ru`
- `limit`: 1–100; defaults to 30
- `offset`: 0–100,000
- `includeNeedsReview`: set to `true` to include provisional ambiguous senses

### Get one sense

```http
GET /api/words/123?language=ru
```

All request values are validated before use. SQL data values use PostgreSQL parameters rather than string interpolation.

## Local MCP access for ChatGPT and Codex

The MCP process never connects to PostgreSQL. It calls a private Fastify proxy on `127.0.0.1`, and only that proxy uses `DATABASE_URL`:

```text
ChatGPT/Codex -> local MCP (STDIO) -> authenticated localhost API -> PostgreSQL
```

Generate a credential once, if one is not already configured:

```bash
npm run mcp:token
```

The command stores the generated credential only in the ignored `.env` file and does not print it. The MCP process automatically starts its private API on `MCP_API_PORT` when needed and stops that managed process when MCP exits. The regular browser API may continue to use `PORT` independently.

Register the server globally for local ChatGPT/Codex clients:

```bash
codex mcp add oxford-vocabulary -- /Users/lialis/projects/tree/node_modules/.bin/tsx --env-file=/Users/lialis/projects/tree/.env /Users/lialis/projects/tree/server/mcp.ts
```

This repository is already registered on the current machine. Restart ChatGPT/Codex, or start a new task, if the server does not appear immediately. Ask the model to use `oxford-vocabulary` explicitly when you want it to inspect or change vocabulary.

Available tools are deliberately narrow: search vocabulary, read one sense, and update its definition, transcription, CEFR level, translation, collocations, parts of speech, or learning status. There is no arbitrary SQL or delete tool. Every write:

- targets a sense ID, so duplicate spellings and distinct senses remain separate;
- requires the last observed `updatedAt` value, preventing silent stale overwrites;
- validates input and uses parameterized SQL;
- runs in a transaction and records before/after data in `assistant_changes`.

The MCP instructions tell the model to read a sense before changing it and never invent vocabulary facts. A user should still state the exact intended change; an MCP tool is authorization plumbing, not a source of truth.

## Data model

- `headwords` stores one normalized written form.
- `senses` stores meaning-level data: English definition, transcription, CEFR level, and review state.
- `parts_of_speech` and `sense_parts_of_speech` allow a sense to have multiple grammatical classes.
- `languages` and `sense_translations` support translations in any configured language. Imported Russian text is preserved verbatim.
- `sense_collocations` stores future structured collocations. The source contains none, so it starts empty.
- `sense_examples` and `example_translations` retain source example sentences.
- `sense_progress` stores the current single-learner state for each sense.
- `review_events` is the append-only home for future study activity.
- `assistant_changes` is the audit trail for updates made through the protected MCP proxy.
- `source_import_records`, `sense_sources`, and `import_runs` preserve provenance and raw legacy scheduling evidence without shaping the application model.
- `reconciliation_items` contains unresolved source anomalies, currently the three multi-level SQLite ambiguities. The former 57 official B1–C1 gaps are now first-class catalogue senses.
- `import_issues` records sanitized row-level import warnings or errors.

Definitions remain `NULL` and collocations remain empty until an approved source supplies them. They are never inferred from Russian translations or example sentences.

## Learning status mapping

| Imported source state   | Application status |
| ----------------------- | ------------------ |
| Not started             | `new`              |
| Active learning steps   | `learning`         |
| Learned through review  | `learned`          |
| Marked as already known | `known`            |

The application also supports `reviewing` and `suspended` for future study workflows. Progress is stored per sense so one meaning can be known while another meaning of the same spelling remains new.

The three source records linked to two CEFR levels (`positive`, `cream`, and the container sense of `can`) become provisional level-specific senses. Their original status remains in source provenance; their study status starts as `new` with origin `unresolved`. They are excluded from ordinary word searches until reviewed.

## Migrations

Migration files live in `server/migrations` and are applied in filename order. Each migration runs in a transaction and is recorded in `schema_migrations`. Migrations are forward-only: make a new numbered migration for schema changes instead of editing an already-applied migration. Back up production data before applying destructive future migrations.
