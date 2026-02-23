# SaaS Starter

Personal SaaS template: React Router 7 + Supabase + Tailwind CSS 4 + Lean GSD workflow.

Extends [web-starter] with authentication, dashboard layout, and project management workflow.

## Quick Start

1. Clone and init:

   ```bash
   git clone git@github.com:YOUR_USER/saas-starter.git my-saas
   cd my-saas
   rm -rf .git && git init
   npm install
   ```

2. Create a Supabase project at https://supabase.com

3. Copy `.env.example` to `.env` and fill in your Supabase credentials

4. Run `/start` to begin the Lean GSD workflow (questioning → research → roadmap)

## What's Included

Everything from web-starter, plus:

- Supabase Auth (email/password, OAuth-ready)
- Protected dashboard route
- Auth pages (login, signup, forgot password, reset password, verify email)
- Public + Auth + Dashboard layouts
- Lean GSD workflow (8 commands, 4 agents)
- Vercel deployment adapter

## Commands

```bash
npm run dev          # Dev server
npm run test         # Unit tests
npm run storybook    # Component explorer
npm run lint         # Lint check
npm run typecheck    # Type check
npm run build        # Production build
```
