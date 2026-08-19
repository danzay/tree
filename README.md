# Tree

Tree is a React vocabulary application backed by a Kotlin Spring Boot API and PostgreSQL. The browser communicates only with the API and never receives database credentials.

## Repository layout

```text
client/  React, TypeScript, Vite, Zustand, React Aria, and SCSS
server/  Kotlin, Spring Boot, JDBC, Flyway, and PostgreSQL
```

## Requirements

- Node.js 22.13.x or 24+
- JDK 17+
- PostgreSQL 14+

## Environment

Copy `.env.example` to `.env` and configure the local database URL:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/vocabulary
PORT=3001
```

`.env` and `.env.*` are ignored by Git. Do not put `DATABASE_URL` in a `VITE_` variable because Vite exposes those values to browser code.

## Run locally

Start the Kotlin API from the repository root:

```bash
cd server
./gradlew bootRun
```

For local development, Spring loads the ignored root `.env` file automatically. Deployed environments should provide the same values through their secret manager or process environment.

Flyway baselines the existing populated database at version 3 and applies future migrations. On a new empty database, Flyway creates the complete schema from `server/src/main/resources/db/migration`.

In a second terminal, start the React client:

```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173` and proxies `/api` to the Kotlin API at `http://127.0.0.1:3001`.

## Checks

```bash
cd client
npm run format
npm run lint
npm test
npm run build
```

```bash
cd server
./gradlew test
./gradlew build
```

## Vocabulary catalogue sources

Words and senses live in one shared catalogue. Source-specific CEFR classifications
are stored separately, so Oxford, ESL Lounge, an authorized Cambridge EVP import,
and future manual entries can disagree without overwriting one another. Oxford is
the preferred effective level where it is available.

After the server has applied all Flyway migrations, import or refresh the public
ESL Lounge A1-C2 classifications with:

```bash
python3 server/scripts/import_esl_lounge.py
```

The importer is idempotent. It maps source entries to existing senses and creates
`needs_review` placeholder senses only when no compatible existing entry is found.
It reads `DATABASE_URL` without printing it. Cambridge EVP data must only be added
from an authorized export or licensed integration.

## API

- `GET /api/health` checks API and database reachability.
- `GET /api/stats` returns vocabulary totals by level and status.
- `GET /api/words` searches and filters word senses.
- `GET /api/words/{id}` returns one word sense.
- `GET /api/library-items` returns the saved Library catalogue.
- `GET /api/library-items/{id}` returns one item and its ordered article blocks.

Search parameters are validated, and database values are passed through named SQL parameters. Separate senses and duplicate spellings remain separate records. Library metadata is stored separately from article blocks so future stories, videos, podcasts, and notes can share the same catalogue.

## Data model and migrations

The existing PostgreSQL schema remains the source of truth. Flyway migrations are forward-only; add a new numbered migration rather than editing a migration already applied by Flyway. Back up production data before a destructive schema change.

Future material analysis will be initiated by the Kotlin backend through the OpenAI API. The backend will validate structured results and store them as reviewable drafts instead of allowing a model to connect directly to PostgreSQL.
