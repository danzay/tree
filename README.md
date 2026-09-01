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
BOOTSTRAP_ADMIN_EMAIL=administrator@example.com
BOOTSTRAP_ADMIN_PASSWORD=replace-with-at-least-12-characters
BOOTSTRAP_ADMIN_DISPLAY_NAME=Tree Administrator
```

`.env` and `.env.*` are ignored by Git. Do not put `DATABASE_URL` in a `VITE_` variable because Vite exposes those values to browser code.

The bootstrap administrator is created only when the user table is empty. That
first account claims the existing vocabulary progress and library records and is
the only account initially granted the internal `manage_invitations` authority.
This authority only permits creating invitations; it is not a user role or badge.
The password must contain 12–128 characters, is hashed with Argon2id, and is never
logged. After the account exists, changing or removing the bootstrap variables
does not modify it. Legacy `BOOTSTRAP_OWNER_*` variables remain accepted so an
existing local `.env` does not need to be exposed or rewritten immediately.

Email/password login works without an external provider. To enable Google login,
also configure:

```dotenv
GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/login/oauth2/code/google
CLIENT_BASE_URL=http://localhost:5173
```

Register `http://localhost:5173/login/oauth2/code/google` as an authorized Google
redirect URI. The callback passes through Vite so it retains the same localhost
session cookie used by the React app. Do not mix `localhost` and `127.0.0.1` in a
single login flow because browser cookies are host-specific. Production must use
its exact public HTTPS callback, set `SESSION_COOKIE_SECURE=true`, and set
`CLIENT_BASE_URL` to the public client URL. The public client and API must both be
served through HTTPS; forwarded proxy headers are enabled so Spring can recognize
the original secure request.

For the remote environment, include at least:

```dotenv
CLIENT_BASE_URL=https://your-tree-client.example
GOOGLE_REDIRECT_URI=https://your-tree-client.example/login/oauth2/code/google
SESSION_COOKIE_SECURE=true
```

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

The client runs at `http://localhost:5173` and proxies `/api` plus the OAuth callback
paths to the Kotlin API at `http://127.0.0.1:3001`.

Open `http://localhost:5173/login` and sign in with the bootstrap administrator.
Registration is always invitation-only. The administrator can create email-bound,
single-use links that expire after 24 hours, link Google, and sign out on the
Account page. After registration, invited accounts are independent ordinary users
and have no lasting relationship to the inviter.

Google provides a verified email during Google registration. Password registration
currently requires the entered email to match the invitation but does not verify
mailbox ownership because email delivery is not configured yet. Add email
verification before relying on password invitations as proof that the recipient
owns the address; otherwise a person holding a forwarded unused link could enter
the invited address and register.

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
- `GET /api/auth/config` returns public login configuration.
- `GET /api/auth/csrf` initializes CSRF protection for browser mutations.
- `POST /api/auth/login`, `/register`, and `/logout` manage the server-side session.
- `GET /api/auth/me` returns only the current account's safe profile fields.
- `POST /api/auth/invitations` creates an email-bound, single-use invitation and
  requires the internal invitation-management authority.
- `GET /api/stats` returns vocabulary totals by level and status.
- `GET /api/words` searches and filters word senses.
- `GET /api/words/{id}` returns one word sense.
- `GET /api/translations?text=...` securely retrieves English-Russian dictionary entries from Yandex.
- `GET /api/library-items` returns the saved Library catalogue.
- `GET /api/library-items/{id}` returns one item and its ordered article blocks.

Search parameters are validated, and database values are passed through named SQL parameters. Separate senses and duplicate spellings remain separate records. Library metadata is stored separately from article blocks so future stories, videos, podcasts, and notes can share the same catalogue.

All vocabulary, statistics, and library endpoints except health and public auth
configuration require an authenticated session. Sessions are opaque HTTP-only
cookies backed by PostgreSQL; the browser does not store access tokens. State-changing
requests use a CSRF cookie/header pair. Vocabulary progress and library ownership
are resolved for the authenticated user in parameterized queries.

Article word definitions are loaded by the React client from DictionaryAPI.dev.
Translations are requested through the Kotlin endpoint so `YANDEX_KEY` remains
server-side and is never included in the browser bundle or response payload.

## Data model and migrations

The existing PostgreSQL schema remains the source of truth. Flyway migrations are forward-only; add a new numbered migration rather than editing a migration already applied by Flyway. Back up production data before a destructive schema change.

Because routing now uses real browser paths, production hosting must rewrite
unknown client routes such as `/login` and `/dictionary` to `client/dist/index.html`.
API and OAuth paths must continue to route to the Kotlin server.

Future material analysis will be initiated by the Kotlin backend through the OpenAI API. The backend will validate structured results and store them as reviewable drafts instead of allowing a model to connect directly to PostgreSQL.
