# Project: [PROJECT NAME]

## Overview

[Brief description of the project]

## Stack

| Layer      | Technology                                                                |
| ---------- | ------------------------------------------------------------------------- |
| Framework  | React Router 7 (framework mode, SSR)                                      |
| Language   | TypeScript (strict)                                                       |
| Styling    | Tailwind CSS 4 + shadcn/ui (Radix + CVA)                                  |
| Auth       | Supabase (email/password, OAuth-ready)                                    |
| Database   | Drizzle ORM + postgres.js → Supabase Postgres                             |
| Validation | Zod 4                                                                     |
| Testing    | Vitest + Testing Library + MSW + Playwright                               |
| Stories    | Storybook 10                                                              |
| Linting    | Biome                                                                     |
| CI         | GitHub Actions                                                            |
| Deploy     | Vercel                                                                    |

## Conventions

- React components are `const` arrow functions, not `function` declarations.
- Server utilities live in `app/lib/server/`. Public API is the barrel (`~/lib/server`); internal files are implementation detail.

## Auth (Supabase)

- Server client: `createSupabaseServerClient(request)` in loaders/actions.
- Browser client: `getSupabaseBrowserClient()` in components.
- Cookie-based sessions via `@supabase/ssr`.
- Protected routes check auth in `loader` → redirect `/auth/login` if unauthenticated.

## Structure

```
app/
  components/    UI components by feature
  lib/
    db/          Drizzle schema + client
    server/      Server utilities (logger, events, config, rate-limit, form, features)
    supabase/    Supabase clients
  routes/        Route modules
test/
  mocks/         MSW handlers
.storybook/
.github/workflows/
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

## Security

- Security headers configured in `vercel.json` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- Env vars validated at boot via Zod (`app/lib/env.server.ts`); app crashes early on misconfiguration.
- DB connection is lazy and pgBouncer-compatible.

## Customization Checklist

After cloning this template:

- [ ] Update this CLAUDE.md (project name, overview)
- [ ] Update `package.json` name field
- [ ] Create a Supabase project and fill `.env` from `.env.example`
- [ ] Run `npm run db:push` to apply the initial schema
- [ ] Update design tokens in `app/styles/globals.css` (colors, fonts, radii)
- [ ] Install project-specific fonts (`@fontsource/*`)
