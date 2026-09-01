# Tree Project Plan

Status: implementation  
Last updated: 2026-09-01

This document is the living implementation plan for Tree. Decisions should be
recorded here before large implementation changes begin.

## Product direction

Tree is a vocabulary-learning application built around an English dictionary,
personal learning progress, saved articles, and visual exploration of vocabulary.

Planned product areas:

- authentication and user-owned data;
- a searchable English dictionary with multilingual translations;
- separate word senses when spelling, meaning, part of speech, or CEFR level differs;
- article/content storage with vocabulary highlighting and sentence annotations;
- a PixiJS progress tree in which every clickable dot represents one word sense;
- backend-controlled material analysis through the OpenAI API;
- future review scheduling and learning-event history.

## Current state

- React, TypeScript, and Vite provide the browser application in `client/`.
- PostgreSQL is the application database.
- The Kotlin Spring Boot API lives in `server/` and owns database access.
- Flyway has adopted the existing schema, and the first Kotlin endpoints preserve
  health, statistics, word search, and word-sense reads.
- Spring Security now provides email/password and optional Google OIDC login,
  PostgreSQL-backed sessions, CSRF protection, invitation controls, and user-owned data.
- The temporary TypeScript backend and integration adapter have been removed.

## Frontend architecture decision

The React application uses a pragmatic Feature-Sliced Design structure (FSD-lite).
The initial layers are `app`, `pages`, `entities`, and `shared`; `features` and
`widgets` are added only when reusable product interactions or large reusable UI
blocks exist.

Frontend dependencies flow in one direction:

```text
app -> pages -> features -> entities -> shared
```

Slices expose a small public API. Same-layer slices must not import each other's
internals. Page-only code stays in its page slice until reuse or business value
justifies promotion. The `word` entity owns vocabulary senses, lookup services,
and reusable word-information UI because identical spellings can represent
different meanings, parts of speech, and CEFR levels. The `article` entity owns
article content, highlights, metadata presentation, and article-detail reads.

Selected frontend foundations:

| Area          | Selection                                                             |
| ------------- | --------------------------------------------------------------------- |
| Routing       | React Router with browser routing and server-side SPA fallback        |
| Client state  | Zustand, colocated with the owning page or feature                    |
| Server state  | TanStack Query with entity-owned query hooks and keys                 |
| HTTP client   | A shared Axios instance; requests live in entity/feature API segments |
| UI primitives | React Aria Components, styled with vanilla SCSS                       |
| Styling       | Global tokens plus colocated SCSS; no Tailwind or CSS-in-JS           |

Zustand is not a replacement for all React state. Temporary component state stays
local, URL-shareable filters should move to search parameters, and PostgreSQL/API
data must not be duplicated into a Zustand or page-local store. TanStack Query owns
remote request state, caching, cancellation, and freshness. Entity query hooks own
their query keys and API calls; page hooks compose those queries with page-specific
state. The Library grid/list preference is the first persisted Zustand state.

Library items and reading progress are server data owned by the authenticated
user. They must remain in TanStack Query and must not be duplicated in local
storage or Zustand. Cover images remain stable asset paths until object storage is
introduced.

Axios is accessed through `shared/api/api-client.ts`; pages must not create their
own Axios instances. React Aria Components should be wrapped in `shared/ui` when a
Tree-specific reusable component API or styling convention is needed.

Component files contain one React component each. Additional components must be
moved into separate files. Non-trivial calculation and transformation helpers
belong in a colocated `utils/` folder, with one exported utility per file and a
filename that exactly matches the utility name.

Leaf action components must not accept surrounding domain state only to decide
whether they render. Their parent owns conditional composition and renders the
action only when it is available. Leaf component props should describe the
rendered action's behavior or genuine visual variants, not make the component
silently return `null`.

Do not put multi-part boolean expressions, comparisons, optional-chain fallbacks,
negations, or ternaries directly in JSX props or conditional rendering. Compute
derived conditions and prop values as descriptively named variables before the
component's `return`, then pass those variables to JSX. Direct props, state values,
constants, and simple event handlers may remain inline.

Do not place SVG markup directly inside another React component. Keep static SVGs
in standalone `.svg` asset files, and keep SVGs that need React behavior, props, or
`currentColor` styling in a dedicated React component file. Each React SVG icon or
illustration must have its own component file.

## Permanent backend decision

The selected long-term backend direction is **Kotlin with Spring Boot**.

The reason for choosing Kotlin is stronger domain modeling, compile-time null
safety, exhaustive enum handling, safer refactoring, and access to the mature JVM
ecosystem. Node.js is capable of running the production application, so this is a
product and maintainability choice rather than a performance-motivated rewrite.

### Target stack

| Area                    | Selection                                                |
| ----------------------- | -------------------------------------------------------- |
| Language                | Kotlin                                                   |
| Framework               | Spring Boot                                              |
| HTTP model              | Spring MVC, not WebFlux                                  |
| Database                | PostgreSQL                                               |
| SQL access              | jOOQ                                                     |
| Migrations              | Flyway                                                   |
| Authentication          | Spring Security with OIDC                                |
| API contract            | OpenAPI                                                  |
| Browser type generation | OpenAPI-generated TypeScript transport models            |
| Tests                   | JUnit and Testcontainers                                 |
| Build                   | Gradle Kotlin DSL                                        |
| Monitoring              | Spring Boot Actuator and Micrometer-compatible telemetry |

Exact supported versions of Kotlin, the JDK, Spring Boot, and dependencies must be
chosen and pinned when implementation starts.

## Authentication decision

- Spring Security owns authentication and authorization.
- Email passwords are hashed with Argon2id and are never returned to the client.
- Optional Google login uses OIDC and stores Google's immutable `sub` identifier,
  not an email address, as the provider identity.
- Browser authentication uses an opaque HTTP-only, SameSite=Lax session cookie;
  PostgreSQL-backed Spring Session supports restarts and multiple server instances.
- State-changing browser requests require the CSRF cookie/header pair. Tokens and
  credentials are never stored in local storage or Zustand.
- Registration is permanently invitation-only for the current product phase.
  Invitations are bound to an email address, single-use, expire after 24 hours,
  and are stored only as SHA-256 hashes.
- The first account is bootstrapped from secret environment variables, receives
  the internal `manage_invitations` authority, and claims the existing library and
  learning progress. Ordinary accounts have no role. Invited users receive
  independent progress initialized as `new`, see only their own library records,
  and retain no restriction or relationship to the inviter after registration.
- The API exposes only the `canManageInvitations` capability to the browser. The
  internal authority is admission control, not an account hierarchy or user badge.
- Password reset and email verification are intentionally deferred until an email
  delivery provider is selected.

### Why Spring Boot instead of Ktor

Ktor is a valid lightweight framework, but Spring Boot is preferred for this
project because the planned application needs authentication, authorization,
database transactions, background work, scheduling, audit trails, health checks,
and production monitoring. Spring provides consistent conventions and mature
integrations for these requirements.

### Why jOOQ instead of JPA/Hibernate

The vocabulary database is normalized and uses explicit joins, aggregates, search,
and transactional mutations. jOOQ preserves control over SQL while generating
typed Kotlin representations of tables and columns. JPA/Hibernate is not planned
for the main vocabulary access layer.

## Target architecture

```text
React application
        |
        v
Kotlin Spring Boot API
        |
        +-- Authentication module
        +-- Vocabulary module
        +-- Learning module
        +-- Articles module
        +-- Progress module
        +-- Background workers
        |
        v
PostgreSQL

Kotlin background worker
        |
        v
OpenAI API
```

The Kotlin API is the single authority for validation, authorization,
transactions, status changes, and audit logging. Neither the React browser client
nor an AI model receives PostgreSQL credentials or connects directly to PostgreSQL.
For material analysis, Kotlin sends approved source content to the OpenAI API,
validates structured output, and stores it as a reviewable draft.

## Suggested Kotlin module layout

```text
server/
  build.gradle.kts
  src/main/kotlin/.../
    auth/
    vocabulary/
    learning/
    articles/
    progress/
    assistant/
    db/
    configuration/
  src/main/resources/
    db/migration/
  src/test/kotlin/.../
```

Within each module, HTTP controllers should be thin. Controllers validate and
authorize requests, call application services, and serialize responses. Business
rules belong in services/domain types, and SQL belongs in repository classes.

## Domain modeling principles

- A headword represents the written spelling.
- A word sense represents a specific meaning and may have its own effective CEFR
  level, definition, transcription, and learning progress.
- Headwords and senses form one shared vocabulary catalogue. Oxford, Cambridge
  EVP, ESL Lounge, manual additions, and future sources are provenance records,
  not separate word databases.
- CEFR is a classification system rather than a vocabulary source. Every imported
  classification records the organization or list that assigned it.
- Conflicting source levels are retained side by side. Oxford is the preferred
  effective level when available, followed by an authorized Cambridge EVP record,
  ESL Lounge, and then a manual classification.
- Separate source entries and meanings must not be merged only because they share
  the same spelling.
- A word sense can have multiple parts of speech when the source entry requires it.
- Translations remain separate records identified by language code so additional
  languages can be added without changing the sense table.
- Learning status should be a closed domain type initially, with transitions
  controlled by application services rather than arbitrary database updates.
- Manual status changes must remain distinguishable from imported or inferred
  statuses.
- Future review activity should be recorded as append-only learning events; the
  current status is a derived or cached current-state view.
- Catalogue provenance should remain available for auditing.

Initial status vocabulary:

```text
NOT_STARTED
LEARNING
REVIEWING
LEARNED
KNOWN
```

Status names and transition rules must be reviewed before the production learning
engine is implemented.

## API boundaries

The browser API and background analysis workers share application services. Only
the Kotlin backend may call external AI services or mutate stored analysis data.

Expected API areas:

- health and readiness;
- authentication/session management;
- word search, filtering, and sense details;
- user-specific learning status and review activity;
- article CRUD, document content, highlights, and annotations;
- compact progress-tree data;
- background material-analysis jobs and reviewable AI suggestions;
- audit history for assistant changes.

All request input must be validated. SQL must remain parameterized. Mutation
endpoints should continue using transactions and optimistic concurrency where an
assistant or multiple clients could update the same record.

DictionaryAPI.dev definitions are read directly by the browser because that API
does not require credentials. Yandex Dictionary requests pass through Kotlin so
`YANDEX_KEY` is never exposed to the React client.

OpenAPI is the contract between Kotlin and React. The neutral contract lives in
`api-contract/openapi.yaml`; Kotlin DTOs and TypeScript request/response types are
generated from it instead of being manually duplicated. Request methods remain
handwritten in their owning backend controllers and frontend API modules.

## Media storage and caching

Image and audio files must be treated separately from their application metadata:

- actual media files should live in S3-compatible object storage and be delivered
  through a CDN rather than stored as PostgreSQL binary or base64 data;
- PostgreSQL should store the media record, object key, owner, media and MIME type,
  dimensions or duration, alternative text, attribution, version, and timestamps;
- Kotlin should authorize private media access and return public or time-limited
  signed URLs as part of API response DTOs;
- TanStack Query should cache media metadata and URLs, not large `Blob` objects or
  the image and audio bytes themselves;
- the browser HTTP cache and CDN should cache the downloaded bytes; app-owned static
  assets can continue to use Vite's asset pipeline;
- immutable, versioned object keys or URLs should be used when media is replaced so
  browsers do not display an outdated cached file;
- audio delivery should support range requests, and clients should normally use
  `preload="metadata"` rather than eagerly downloading every recording;
- uploads should use multipart API requests or signed direct uploads, followed by a
  TanStack Query mutation that updates or invalidates the associated metadata query;
- future offline media support should use a service worker and Cache Storage rather
  than extending the in-memory TanStack Query cache.

Dictionary and translation responses may contain media URLs and remain valid query
data. Rendering an `<img>` or `<audio>` element lets the browser fetch and cache the
underlying file independently.

## Progress tree requirements

- PixiJS runs only in the React client.
- The API returns stable sense IDs and compact visualization data.
- Every dot is clickable and opens the word-sense detail panel.
- The first version colors dots by learning status only.
- All vocabulary entries can be displayed with zoom, pan, search, and filters.
- The first version uses an organic tree layout without grouping words by branch.
- CEFR rings or branch grouping may be evaluated later but are not part of the
  initial implementation.
- Layout coordinates may eventually be precomputed and persisted if deterministic
  placement or performance requires it.

## Article/content requirements

- Store the editor's structured document format and a normalized plain-text
  representation for vocabulary matching and search.
- Store highlights and annotations separately from the article body so they retain
  ownership, color, range/anchor information, and future collaboration metadata.
- Vocabulary matching must resolve displayed tokens to word senses without
  silently merging ambiguous senses.
- Unknown vocabulary highlighting is user-specific and based on learning status.
- Article images should eventually live in S3-compatible object storage rather
  than in PostgreSQL or the Git repository.

The editor library and durable annotation-anchor format remain open decisions.

## Kotlin migration status

1. The React/Vite application has moved to `client/`.
2. The Kotlin Spring Boot backend has replaced the temporary Node API in `server/`.
3. Flyway baselines the populated PostgreSQL schema at version 3 and owns future
   migrations.
4. Health, statistics, word search, and word-sense reads are the first migrated
   endpoints.
5. Authentication and user ownership are implemented. OpenAPI now generates
   shared transport models; status mutations and material analysis remain future
   modules.

## Production requirements

Before public deployment:

- terminate traffic with HTTPS and set `SESSION_COOKIE_SECURE=true` so the session
  cookie is never sent over an unencrypted connection;
- use a supported LTS JDK and pinned dependency versions;
- package the Kotlin API as a reproducible container or JVM artifact;
- keep secrets exclusively in environment/secret management and out of Git;
- retain `.env` in `.gitignore` and never log secret values;
- complete per-user ownership for future highlights, annotations, and settings;
- apply least-privilege database roles for migrations and runtime access;
- add request IDs, structured logging, metrics, and centralized error reporting;
- define liveness and readiness checks;
- add rate limiting, request-size limits, and appropriate CORS/CSRF protections;
- automate migrations, backups, restore tests, and rollback procedures;
- run unit, integration, contract, lint/static-analysis, and production-build checks
  in CI;
- process imports, article analysis, image acquisition, and AI work through
  background jobs rather than long-running HTTP requests.

## Decisions still required

- Email-delivery provider and account-recovery flow.
- Production hosting provider and deployment topology.
- S3-compatible object-storage provider.
- Editor library and stored document format.
- Durable text-highlight anchoring method.
- Final learning-status transitions and review algorithm.
- Background-job implementation and whether PostgreSQL alone is sufficient for
  the initial queue.
- Search implementation: PostgreSQL indexing first, with a separate search engine
  only if measured requirements justify it.
- Progress-tree coordinate generation and persistence strategy.
- API versioning and deprecation policy.

## Implementation rule

Continue the Kotlin backend one module at a time. Finalize each module's domain
rules and OpenAPI contract before adding mutations, and cover new behavior with
tests.
