# Tree API contract

`openapi.yaml` is the single source of truth for Tree's HTTP request and response models.

- The Kotlin server generates transport models into `server/build/generated/openapi`.
- The React client generates TypeScript transport models into
  `client/src/shared/api/generated/api-types.ts`.
- Server controllers and client request functions remain handwritten in their owning modules;
  generation does not move or replace API methods.
- Generated files must not be edited manually.
- Database records, domain-only models, OAuth browser redirects, and third-party APIs are outside
  this contract.

After changing the contract, run `./gradlew openApiGenerate` in `server/` and
`npm run api:generate` in `client/`, then run both verification suites.
