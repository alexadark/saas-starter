# Project: [PROJECT NAME]

## Overview

[Brief description of the project]

## Stack

- **Framework**: React Router 7 (framework mode, SSR)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix + CVA)
- **Auth**: Supabase (email/password, OAuth-ready)
- **Database**: Drizzle ORM + postgres.js (schema in `app/lib/db/schema.ts`, connects to Supabase Postgres)
- **Testing**: Vitest + Testing Library + MSW + Playwright
- **Stories**: Storybook 10 (vitest addon + a11y addon)
- **Linting**: Biome (tabs, double quotes, semicolons)
- **CI**: GitHub Actions (lint → typecheck → test → build)
- **Deploy**: Vercel

## Conventions

- All code, comments, and documentation in English
- TypeScript strict mode — no `any`
- Biome handles formatting and linting (not ESLint/Prettier)
- React components use `const` arrow functions (not `function` declarations)

## Auth

- Supabase handles auth (email/password, OAuth)
- Server client: `getSupabaseServerClient(request, headers)` in loaders/actions
- Browser client: `getSupabaseBrowserClient()` in components
- Session is cookie-based via `@supabase/ssr`
- Protected routes check auth in loader → redirect to `/auth/login` if not authenticated

## Server Utilities

### Feature Flags (`app/lib/server/features.ts`)

- `isEnabled(db, "flag-key")` — check if a flag is enabled globally
- `isEnabled(db, "flag-key", { orgId })` — check with org-level override
- `getEnabledFlags(db)` — get Set of all enabled flag keys
- Flags stored in `feature_flags` table with JSONB metadata for per-org overrides

### JSONB Config (`app/lib/server/config.ts`)

- `getConfig(db, scope, key, zodSchema)` — get a typed config value
- `getConfigCascade(db, key, zodSchema, scopes)` — cascading resolution (user → org → global)
- `setConfig(db, scope, key, value)` — upsert a config entry
- `deleteConfig(db, scope, key)` — remove a config entry
- Scope convention: `"global"`, `"org:{id}"`, `"user:{id}"`
- All values validated with Zod at runtime — no raw JSON escapes

### Event Bus (`app/lib/server/events.ts`)

- `emit("event.name", payload)` — fire-and-forget event emission
- `on("event.name", handler)` — register typed handler, returns unsubscribe fn
- Augment `AppEvents` interface to declare your events
- Handlers run via queueMicrotask — never block the response

### Logger (`app/lib/server/logger.ts`)

- `logger.info(msg, context?)`, `.debug()`, `.warn()`, `.error(msg, err?, ctx?)`
- Structured JSON in production, pretty-print in development
- `logger.error()` returns an `errorId` (UUID) — show to users for support
- Respects `LOG_LEVEL` env var (default: "info")

### Form Validation (`app/lib/server/form.ts`)

- `parseFormData(request, zodSchema)` — parse + validate in one call
- Returns `{ success, data }` or `{ success, errors }` (field-level)
- Error shape works directly with React Router action returns

### Rate Limiter (`app/lib/server/rate-limit.ts`)

- `createRateLimiter({ windowMs, max })` — creates a limiter function
- `limiter(request)` → `{ allowed, remaining, resetAt }`
- `getRateLimitHeaders(result)` — standard rate limit headers
- In-memory sliding window — resets on deploy (fine at starter scale)

## Building Features (Deep Module Pattern)

This project follows the "deep module" philosophy: each feature is a self-contained folder with a narrow public interface (barrel export) and rich internal implementation. AI agents and developers alike benefit from discoverable APIs and test-locked behavior.

### Barrel Import

All server utilities are available from a single import path:

```ts
import {
  logger,
  emit,
  on,
  createRateLimiter,
  parseFormData,
  isEnabled,
  getConfig,
} from "~/lib/server";
```

Do NOT import from individual files (e.g., `~/lib/server/logger`) unless you have a specific reason (circular dependency avoidance).

### Feature Structure

When adding a new feature (e.g., "billing"), organize it as a deep module:

```
app/lib/server/
  billing/
    index.ts          # Public API - barrel export (the "narrow interface")
    plans.ts           # Internal: plan management logic
    invoices.ts        # Internal: invoice generation
    stripe.ts          # Internal: Stripe integration
    __tests__/
      plans.test.ts
      invoices.test.ts
      stripe.test.ts
```

Then re-export from the server barrel:

```ts
// app/lib/server/index.ts
export { createSubscription, cancelSubscription, getInvoices } from "./billing";
```

### Conventions

1. **Every module gets tests** - Tests lock behavior so AI agents get fast feedback loops. No untested server code.
2. **Barrel exports are the public API** - If it's not in `index.ts`, it's internal. AI agents should only use exported symbols.
3. **Mock the DB, not the module** - For modules using Drizzle, mock the DB chain (`select/insert/update/delete`) rather than mocking the module itself. See `app/lib/server/__tests__/config.test.ts` for the pattern.
4. **Type-safe all the way** - Use Zod schemas for validation at boundaries. Never pass raw `unknown` through the public API without validation.
5. **Keep modules independent** - Server utilities should not import from each other unless necessary. If module A needs module B, consider whether B's function should be passed as a parameter instead.

## Testing Conventions

- **Every component gets three files**: `{name}.tsx` + `{name}.stories.tsx` + `{name}.test.tsx`
- Tests use Vitest + Testing Library + MSW
- Stories always include `Default` + `DarkMode` variants with `MemoryRouter` decorator
- MSW mocks live in `test/mocks/handlers.ts` (shared) or inline in test files (specific)
- Test user behavior, not implementation: `screen.getByRole()` over `container.querySelector()`
- Run `npm run test` before committing — CI will catch failures on push

## Structure

```
app/
  components/      UI components organized by feature
  lib/
    db/              Drizzle ORM client + schema
    server/          Server utilities (features, config, events, logger, form, rate-limit)
    supabase/        Supabase clients
  routes/          Route modules
    auth/          Authentication pages
    dashboard/     Protected dashboard
    layouts/       Layout wrappers
  styles/          Global CSS + design tokens
test/
  mocks/           MSW mock handlers
.storybook/        Storybook configuration
.github/
  workflows/       CI pipeline
```

## Getting Started

```bash
npm install
npm run dev          # Dev server
npm run test         # Vitest
npm run storybook    # Storybook on :6006
npm run lint         # Biome check
npm run typecheck    # TypeScript check
npm run db:generate  # Generate migrations from schema
npm run db:push      # Push schema directly (no migration files)
npm run db:studio    # Open Drizzle Studio
```

## Workflow

This project is designed to work with [Get Shit Done (GSD)](https://github.com/gsd-build/get-shit-done) — a spec-driven development system for Claude Code.

### Install GSD

```bash
npx get-shit-done-cc@latest
```

### Core Commands

```
/gsd:new-project     → Questions → research → requirements → roadmap
/gsd:discuss-phase N → Shape implementation decisions before planning
/gsd:plan-phase N    → Research → atomic task plans → verification
/gsd:execute-phase N → Wave-based parallel execution with atomic commits
/gsd:verify-work N   → Goal-backward verification of built work
```

See the [GSD documentation](https://github.com/gsd-build/get-shit-done) for the full command list and user guide.

## Customization Checklist

After cloning this template:

- [ ] Update this CLAUDE.md (project name, overview, structure)
- [ ] Update `package.json` name field
- [ ] Create a Supabase project and fill `.env` from `.env.example`
- [ ] Update design tokens in `app/styles/globals.css` (colors, fonts, radii)
- [ ] Install project-specific fonts (`@fontsource/*`)
- [ ] Install GSD: `npx get-shit-done-cc@latest`
- [ ] Run `/gsd:new-project` to begin
