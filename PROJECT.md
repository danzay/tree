# Tree Project Plan

Status: planning  
Last updated: 2026-08-14

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
- controlled GPT/Codex access through a local MCP adapter and protected API;
- future review scheduling and learning-event history.

## Current state

- React, TypeScript, and Vite provide the browser application.
- PostgreSQL is the application database.
- The current MVP API is written in TypeScript with Fastify.
- The current server already uses input validation, parameterized SQL,
  transactions, optimistic concurrency, and assistant-change auditing.
- A local TypeScript MCP server acts as a proxy for vocabulary reads and updates.

The current Node API should remain usable while the permanent backend is built.

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
justifies promotion. `word-sense` is the vocabulary entity because identical
spellings can represent different meanings, parts of speech, and CEFR levels.

Selected frontend foundations:

| Area          | Selection                                                             |
| ------------- | --------------------------------------------------------------------- |
| Routing       | React Router with hash routing for the current Vite deployment        |
| Client state  | Zustand, colocated with the owning page or feature                    |
| HTTP client   | A shared Axios instance; requests live in entity/feature API segments |
| UI primitives | React Aria Components, styled with vanilla SCSS                       |
| Styling       | Global tokens plus colocated SCSS; no Tailwind or CSS-in-JS           |

Zustand is not a replacement for all React state. Temporary component state stays
local, URL-shareable filters should move to search parameters, and PostgreSQL/API
data must not be duplicated into a global client store. The Library grid/list
preference is the first persisted Zustand state.

Until the Kotlin library module is implemented, library item records are stored in
the browser under the versioned `tree.library-items.v1` local-storage key. Stored
data is validated with Zod before it enters the Zustand entity store; missing,
invalid, or incompatible data falls back to the initial sample catalogue. Cover
images are stored as stable cover keys rather than generated asset URLs. This is
temporary single-device MVP persistence and must not be treated as authenticated
user data or synchronized storage.

Axios is accessed through `shared/api/api-client.ts`; pages must not create their
own Axios instances. React Aria Components should be wrapped in `shared/ui` when a
Tree-specific reusable component API or styling convention is needed.

## Permanent backend decision

The selected long-term backend direction is **Kotlin with Spring Boot**.

The reason for choosing Kotlin is stronger domain modeling, compile-time null
safety, exhaustive enum handling, safer refactoring, and access to the mature JVM
ecosystem. Node.js is capable of running the production application, so this is a
product and maintainability choice rather than a performance-motivated rewrite.

### Target stack

| Area                      | Selection                                                |
| ------------------------- | -------------------------------------------------------- |
| Language                  | Kotlin                                                   |
| Framework                 | Spring Boot                                              |
| HTTP model                | Spring MVC, not WebFlux                                  |
| Database                  | PostgreSQL                                               |
| SQL access                | jOOQ                                                     |
| Migrations                | Flyway                                                   |
| Authentication            | Spring Security with OIDC                                |
| API contract              | OpenAPI                                                  |
| Browser client generation | OpenAPI-generated TypeScript client                      |
| Tests                     | JUnit and Testcontainers                                 |
| Build                     | Gradle Kotlin DSL                                        |
| Monitoring                | Spring Boot Actuator and Micrometer-compatible telemetry |

Exact supported versions of Kotlin, the JDK, Spring Boot, and dependencies must be
chosen and pinned when implementation starts.

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

GPT / Codex
        |
        v
Local TypeScript MCP adapter
        |
        v
Protected Kotlin API
```

The Kotlin API is the single authority for validation, authorization,
transactions, status changes, and audit logging. Neither the React browser client
nor GPT/MCP receives PostgreSQL credentials or connects directly to PostgreSQL.

The MCP server may remain TypeScript because it is a small protocol adapter using
the MCP SDK. It must call protected Kotlin endpoints and must not duplicate domain
logic.

## Suggested Kotlin module layout

```text
backend/
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
- A word sense represents a specific meaning and may have its own CEFR level,
  definition, transcription, and learning progress.
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
- Existing source scheduling fields and provenance should remain available for
  auditing until an explicit retention decision is made.

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

The public browser API and protected assistant API should share application
services but have separate authorization policies.

Expected API areas:

- health and readiness;
- authentication/session management;
- word search, filtering, and sense details;
- user-specific learning status and review activity;
- article CRUD, document content, highlights, and annotations;
- compact progress-tree data;
- assistant/MCP reads and controlled mutations;
- audit history for assistant changes.

All request input must be validated. SQL must remain parameterized. Mutation
endpoints should continue using transactions and optimistic concurrency where an
assistant or multiple clients could update the same record.

OpenAPI should be the contract between Kotlin and React. TypeScript request and
response types should be generated from that contract instead of being manually
duplicated.

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

## Migration strategy from the MVP API

1. Document the current routes as an OpenAPI contract.
2. Create the Kotlin backend alongside the existing application.
3. Connect Kotlin to the existing PostgreSQL database; do not create a second copy
   of production data.
4. Adopt or baseline the existing migrations before Flyway becomes authoritative.
5. Implement health and read-only word endpoints first.
6. Add status mutations and protected assistant endpoints.
7. Run contract and integration tests against the Node and Kotlin implementations.
8. Point React and the MCP adapter to the Kotlin API in a test environment.
9. Verify counts, behavior, authorization, concurrency, and audit history.
10. Switch production traffic to Kotlin and retain a rollback path.
11. Remove the Node API only after parity and production verification.

There must be no long-running dual-write arrangement between Node and Kotlin.

## Production requirements

Before public deployment:

- use a supported LTS JDK and pinned dependency versions;
- package the Kotlin API as a reproducible container or JVM artifact;
- keep secrets exclusively in environment/secret management and out of Git;
- retain `.env` in `.gitignore` and never log secret values;
- add per-user ownership to progress, reviews, articles, highlights, and settings;
- use secure HTTP-only authentication cookies or an equivalently secure OIDC flow;
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

- Authentication/OIDC provider and account-recovery flow.
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

Do not begin the Kotlin migration merely by translating route files line by line.
First finalize the domain rules and OpenAPI contract, then implement one module at
a time with tests and observable parity against the existing behavior.
