# Tree project rules

These instructions apply to the entire repository. The React client lives in `client/` and the Kotlin Spring Boot backend lives in `server/`. Preserve existing work and follow the client's current FSD-lite boundaries (`app`, `pages`, `entities`, and `shared`).

## Components and architecture

- Keep components focused. Extract new components when markup or isolated behavior makes a component difficult to scan.
- Keep one React component per component file. Move every additional component to its own file.
- Keep a component's props type in the same file as the component unless several components genuinely share that type.
- Move non-trivial calculation and transformation helpers into a colocated `utils/` folder. Keep one exported utility per file and name the file exactly after the utility.
- Define event handlers as named variables above JSX. Do not place non-trivial inline handlers in JSX.
- Before creating a UI primitive, check React Aria Components and the existing `src/shared/ui` components. Prefer an existing accessible primitive.
- Use React Aria Components directly when they already match the required control. Add a shared wrapper only when it provides meaningful repeated composition, behavior, or Tree-specific styling—not merely prop forwarding.
- Use Zustand for client state that must be shared. Keep local UI state local.
- Use Axios through the shared API client for HTTP requests.

## Styles

- Use vanilla SCSS; do not introduce Tailwind or CSS-in-JS.
- Component-specific styles must be colocated with their component and named `*.module.scss`.
- A component does not need a stylesheet when it has no component-specific styles.
- Group a component and its supporting files in one folder. Keep its stylesheet and `consts.ts` in that folder.
- Move genuinely reused, non-trivial SCSS patterns into a shared mixin. Do not extract one-off declarations.
- Reserve global styles for resets, design tokens, typography defaults, and application-wide layout rules.

## Constants and text

- Name module-level constants, enum-like objects, lookup maps, fixed strings, and fixed numbers in `UPPER_SNAKE_CASE`.
- Move component-specific constants to a colocated `consts.ts` when a component has more than a trivial constant.
- Give repeated punctuation and control symbols (for example separators used by `split`, `join`, or button labels) a named constant instead of scattering literals.
- Put user-facing text behind i18n translation keys. Do not add new hardcoded UI copy.

## TypeScript and JSX

- Do not introduce deprecated library APIs or types in new or edited code. Use the
  library's current purpose-specific replacement. React form submit handlers use
  `SubmitEvent` when the element API accepts it. If a third-party component still
  exposes a deprecated callback type, derive the handler from that component's
  public prop type with `ComponentProps` instead of importing the deprecated type.
- Avoid conditional expressions that return JSX. A one-line conditional expression is acceptable only when it remains immediately readable.
- Split compound conditions into named booleans. Extract any subcondition that performs calculation or needs explanation.
- Never put a complex condition directly in JSX. Compute and name display booleans such as `withTitle`, `withDescription`, or `isEmpty` above the return statement.
- Always use braces for `if` statements. Leave a blank line before and after complete `if` and `switch` statements, except between connected `if`/`else`, `try`/`catch`, or `try`/`finally` branches.
- Leave a blank line before a `return` statement unless it is the first statement in its block.
- Use spaces inside curly braces, as in `{ value }` and `import { value }`.
- Put JSX elements on their own lines when JSX contains more than one child or spans multiple lines.

## Quality checks

- Run `npm run format`, `npm run lint`, `npm run lint:styles`, `npm test`, and `npm run build` from `client/` after a relevant frontend change.
- Run `./gradlew test` and `./gradlew build` from `server/` after a relevant backend change.
- Do not expose `.env` values. Keep `.env` files ignored and browser code separated from direct PostgreSQL access.
