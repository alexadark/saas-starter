# Project: [PROJECT NAME]

<!-- CARL-MANAGED: Do not remove this section -->

## CARL Integration

Follow all rules in <carl-rules> blocks from system-reminders.
These are dynamically injected based on context and MUST be obeyed.

<!-- END CARL-MANAGED -->

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

## Testing Conventions

- **Every component gets three files**: `{name}.tsx` + `{name}.stories.tsx` + `{name}.test.tsx`
- Use `/component category/name` to scaffold all three
- Tests use Vitest + Testing Library + MSW
- Stories always include `Default` + `DarkMode` variants with `MemoryRouter` decorator
- MSW mocks live in `test/mocks/handlers.ts` (shared) or inline in test files (specific)
- Test user behavior, not implementation: `screen.getByRole()` over `container.querySelector()`
- Run `npm run test` before committing — CI will catch failures on push

## Structure

```
app/
  components/      UI components organized by feature
  lib/             Utilities + Supabase clients
  routes/          Route modules
    auth/          Authentication pages
    dashboard/     Protected dashboard
    layouts/       Layout wrappers
  styles/          Global CSS + design tokens
test/
  mocks/           MSW mock handlers
.claude/
  agents/          Lean GSD agents
  commands/        Slash commands (/component, /start, /plan, etc.)
  references/      Reference docs
  templates/       State templates
  workflows/       Workflow definitions
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

This project uses **Lean GSD** — a streamlined framework with 8 commands and 4 agents.

| Command   | Purpose                                                               |
| --------- | --------------------------------------------------------------------- |
| `/start`  | Initialize project: questioning → research → product design → roadmap |
| `/plan`   | Plan next phase: optional research → planner agent → PLAN.md files    |
| `/build`  | Execute phase: wave-based parallel subagents with atomic commits      |
| `/quick`  | Ad-hoc task: plan + execute in one step                               |
| `/verify` | Goal-backward verification of built work                              |
| `/debug`  | Scientific debugging with persistent state                            |
| `/status` | Progress display + next action suggestion                             |
| `/resume` | Restore context from previous session                                 |

## Customization Checklist

After cloning this template:

- [ ] Update this CLAUDE.md (project name, overview, structure)
- [ ] Update `package.json` name field
- [ ] Create a Supabase project and fill `.env` from `.env.example`
- [ ] Update design tokens in `app/styles/globals.css` (colors, fonts, radii)
- [ ] Install project-specific fonts (`@fontsource/*`)
- [ ] Run `/start` to begin the Lean GSD workflow
