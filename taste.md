# taste.md

> Extracted from codebase analysis, not invented. Review and correct before relying on this.

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
- Every component: `.tsx` + `.stories.tsx` + `.test.tsx` (not yet implemented for existing components)

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

## Auth

- Supabase handles all auth (no custom JWT)
- Server: `createSupabaseServerClient(request)` returns `{ supabase, headers }`
- Browser: `getSupabaseBrowserClient()`
- Cookie-based sessions via `@supabase/ssr`
- Protected routes: check auth in loader, redirect if no user
- Always propagate headers from server client back to response

## Database

- Drizzle ORM + postgres.js (direct PostgreSQL, no Prisma)
- Schema in `app/lib/db/schema.ts`
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

## Testing

- Vitest + Testing Library + MSW for unit/integration
- Playwright for E2E
- Storybook 10 for component exploration
- MSW handlers in `test/mocks/handlers.ts`
- Test user behavior (`getByRole`), not implementation (`querySelector`)
- E2E tests require Supabase env vars

## State Management

- No Redux/Zustand — React Router data flow only
- Loader data, action data, navigation state
- No client-side state management library
