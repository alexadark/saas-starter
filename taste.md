# Architectural Taste - Code Quality Rules

> Reference: SignalFinder 2 taste.md. Stack: React Router 7 + Drizzle + Supabase + shadcn/ui + Hexagonal Architecture (when providers are needed).
> Sources: Epic Stack (Kent Dodds), Forge 42 Base Stack, Philosophy of Software Design (Ousterhout), Pragmatic Programmer, Extreme Programming (Kent Beck), Matt Pocock's repos.

## 14 Rules

1. **Tracer bullets first** - New features and new integrations start with a minimal end-to-end flow touching 2+ layers (DB + service, API + UI, schema + route). Bug fixes and small changes don't need a tracer bullet. (Pragmatic Programmer)

2. **Deep modules** - A module's interface must be simpler than its implementation. If the function signature is nearly as complex as the body, the abstraction is wrong. A service with 3 public methods hiding 500 lines of logic is better than 20 tiny exported helpers. (Ousterhout)

3. **Source of truth** - Types in `app/lib/db/schema.ts` (Drizzle = single schema source). Provider interfaces in `app/server/providers/types.ts` when hexagonal arch is used. No ad-hoc inline types for things that already have a definition.

4. **YAGNI** - Specify what you DON'T want. No generic "extensibility" unless the PRD asks for it. No abstraction for a single use case. Three similar lines are better than a premature helper. (Beck)

5. **Test-first for services** - Backend services get tests BEFORE implementation (red-green-refactor). TDD should be vertical - a test that calls the service and checks the DB result is better than mocking the DB. Front-end routes get tested via Playwright E2E, not unit tests on loaders. (Beck)

6. **Zero broken windows** - No `any`. No `console.log` in committed code. No TODO without a GitHub issue. No commented-out code. Each one left behind signals "this codebase tolerates mess." (Pragmatic Programmer)

7. **The "require" escalation pattern** - For auth and access control, always provide a soft check and a hard check: `getUserId(request)` -> `string | null`, `requireUserId(request)` -> `string` (throws redirect). (Epic Stack)

8. **Throw Response, don't return errors** - Use `throw new Response()` or `throw redirect()` for flow control in loaders/actions. Let ErrorBoundary handle it. No `{ error: string }` return types cluttering every loader. (Epic Stack)

9. **Validate environment at startup** - All env vars validated with Zod on server start. Crash early with a clear message, not in production when a user hits a page. (Forge 42, Epic Stack)

10. **Strategic over tactical** - Every 5th phase, run `/audit-codebase` or `/simplify` to fight entropy. The agent is tactical by default - you are the strategic thinker. (Ousterhout, Beck)

11. **Define errors out of existence** - Redesign interfaces so error cases are impossible. Branded types (`UserId`, `OrgId`) give type-level guarantees over runtime validation. If you're writing lots of defensive checks, the interface is wrong. (Ousterhout)

12. **Orthogonality as metric** - If a change touches loader + component + util simultaneously, the modules are not orthogonal enough. Each change should affect one layer. Orthogonal modules let agents work on one file without breaking others. (Pragmatic Programmer)

13. **Four rules of simple design** - Code must: (1) pass all tests, (2) reveal intention, (3) have zero duplication, (4) have minimum elements. Use as acceptance criteria for agent-generated code. (Beck)

14. **Design It Twice for critical interfaces** - Before implementing a new port, adapter interface, or public API, produce 2-3 competing designs with different trade-offs. Never go with the first design for interfaces that will be hard to change. (Ousterhout)

## Formatting

- Biome: tabs (width 2), double quotes, semicolons always, line width 100
- Organized imports enabled
- No ESLint, no Prettier

## Components

- `const` arrow functions, not `function` declarations
- shadcn/ui pattern: Radix primitives + Tailwind + CVA variants
- `data-slot` attributes on components
- Polymorphic `asChild` prop via Radix Slot where applicable
- `cn()` utility for class merging (clsx + tailwind-merge)
- Every component: `.tsx` + `.stories.tsx` + `.test.tsx`

## Routing

- React Router 7 framework mode with SSR
- Route config in `app/routes.ts` (layout nesting)
- Loaders for data fetching, actions for mutations
- `useLoaderData<typeof loader>()` for type-safe data access
- `useActionData<typeof action>()` for form feedback
- `useNavigation()` for loading/submitting state
- Headers propagation required for auth (Set-Cookie)

## Server Utilities

- Deep module pattern: barrel export from `~/lib/server`
- Never import from individual files (e.g., `~/lib/server/logger`)
- Each module gets tests in `__tests__/` directory
- Mock the DB chain, not the module (see config.test.ts pattern)
- Zod validation at all boundaries
- Modules independent of each other (pass deps as params if needed)

## Barrel Export Convention

Barrel exports (`index.ts`) are REQUIRED for every module directory. They must be **curated public APIs**, not `export * from './every-file'`. The barrel IS the "simple interface" from the deep modules rule.

```typescript
// GOOD: curated barrel (app/lib/server/index.ts)
export { logger, emit, on, isEnabled, parseFormData } from "./module";
export type { AppEvents } from "./events";

// BAD: re-export everything
export * from "./config";
export * from "./events";
export * from "./features";
```

## Auth

- Supabase handles all auth (no custom JWT)
- Server: `createSupabaseServerClient(request)` returns `{ supabase, headers }`
- Browser: `getSupabaseBrowserClient()`
- Cookie-based sessions via `@supabase/ssr`
- Protected routes: check auth in loader, redirect if no user
- Always propagate headers from server client back to response
- Use the "require" escalation pattern (rule 7)

## Database

- Drizzle ORM + postgres.js (direct PostgreSQL, no Prisma)
- Schema in `app/lib/db/schema.ts` (single source of truth - rule 3)
- Client in `app/lib/db/index.ts`
- `db:push` strategy (no migration files)
- Supabase transaction pooler (port 6543)
- SQL injection prevented by Drizzle parameterization

## Styling

- Tailwind CSS 4 with `@theme inline` for design tokens
- CSS variables for colors, radii, fonts in `globals.css`
- tw-animate-css for animations
- No CSS modules, no styled-components

## Naming

- Routes: kebab-case (`forgot-password.tsx`)
- Components: PascalCase files, PascalCase exports
- Utilities: camelCase files, camelCase exports
- Tests: `[source].test.ts`
- Directories: kebab-case
- Path alias: `~/` maps to `app/`

## File Conventions

| Suffix             | Meaning                                  | Example                           |
| ------------------ | ---------------------------------------- | --------------------------------- |
| `.server.ts`       | Server-only, never bundled to client     | `env.server.ts`                   |
| `.test.ts`         | Co-located test file                     | `config.test.ts`                  |
| `resources/` route | Non-page endpoint (API, webhook, toggle) | `routes/resources/revalidate.tsx` |

## Testing

- Vitest + Testing Library + MSW for unit/integration
- Playwright for E2E
- Storybook 10 for component exploration
- MSW handlers in `test/mocks/handlers.ts`
- Test user behavior (`getByRole`), not implementation (`querySelector`)
- TDD for backend services (rule 5), Playwright for routes

## State Management

- No Redux/Zustand - React Router data flow only
- Loader data, action data, navigation state
- No client-side state management library

## Decision Capture

When making a non-obvious architectural choice during a build, document it in a `## Decisions` section of SUMMARY.md. Format: "Chose X over Y because Z." This prevents re-litigating the same decisions in future phases.

## Review Checklist (post-agent)

After every agent-generated code, check:

- [ ] Are modules deep? (simple interface, rich implementation)
- [ ] Any information leaks? (internal details exposed in exports)
- [ ] Any change amplification? (one change requires touching too many files)
- [ ] Does it follow hexagonal arch? (providers don't leak into services, services don't leak into routes)
- [ ] Do I understand why each line exists? (no "programming by coincidence")
- [ ] Is there YAGNI code to remove?
- [ ] Tests exist and pass?
- [ ] Provider-agnostic? (no provider name in schema or service layer)
- [ ] Can any errors be eliminated by design? (branded types, narrower interfaces)
- [ ] Are barrel exports curated (not `export *`)?
- [ ] Would a new developer (or agent) understand the module boundary from `index.ts` alone?

## Architecture Red Flags

Watch for these in agent-generated code:

1. **Shallow module** - A wrapper that just passes through to another function with the same signature (Ousterhout)
2. **Pass-through method** - A function that delegates to another with no added logic (Ousterhout)
3. **Conjoined methods** - Two methods that always get called together (should be one)
4. **Overexposure** - Service exports 15 functions when consumers only use 3 (Ousterhout)
5. **Temporal coupling** - Code that only works if called in a specific order without enforcing it
6. **Temporal decomposition** - Code organized by execution order instead of responsibility (Ousterhout)
7. **Missing barrel** - A directory with 5+ files but no `index.ts` curating the public API
8. **Friction blindness** - When reading agent-generated code, friction IS the signal. Don't dismiss it as unfamiliarity - investigate it. (Pocock)
