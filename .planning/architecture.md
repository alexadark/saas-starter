# Architecture

## Stack

| Layer      | Technology                                          | Version         |
| ---------- | --------------------------------------------------- | --------------- |
| Framework  | React Router 7 (SSR, framework mode)                | 7.12.0          |
| Language   | TypeScript (strict)                                 | 5.9.3           |
| Styling    | Tailwind CSS 4 + shadcn/ui (Radix + CVA)            | 4.2.0           |
| Auth       | Supabase (@supabase/ssr)                            | 2.97.0 / 0.8.0  |
| Database   | Drizzle ORM + postgres.js → Supabase Postgres       | 0.45.1 / 3.4.8  |
| Validation | Zod                                                 | 4.3.6           |
| Testing    | Vitest + Testing Library + MSW + Playwright         | 4.0.18 / 1.58.2 |
| Stories    | Storybook 10                                        | 10.2.10         |
| Linting    | Biome                                               | 2.4.2           |
| CI         | GitHub Actions (lint -> typecheck -> test -> build) | -               |
| Deploy     | Vercel                                              | -               |

## Directory Map

```
app/
  components/ui/         8 shadcn/ui components (Button, Card, Dialog, Input, Label, Textarea, Image, Separator)
  lib/
    db/
      schema.ts          Drizzle schema: feature_flags + app_config tables
      index.ts           DB client (postgres.js + drizzle)
    server/
      index.ts           Barrel export (public API)
      config.ts          JSONB config (getConfig, setConfig, getConfigCascade, deleteConfig)
      events.ts          Typed event bus (emit, on)
      features.ts        Feature flags (isEnabled, getEnabledFlags)
      form.ts            Form parsing + Zod validation (parseFormData)
      logger.ts          Structured logging (debug/info/warn/error)
      rate-limit.ts      IP-based sliding window (createRateLimiter)
      __tests__/         6 test files covering all utilities
    supabase/
      client.ts          Browser client
      server.ts          Server client with cookie handling
    utils.ts             cn() utility (clsx + tailwind-merge)
  routes/
    _index.tsx           Home page (public)
    routes.ts            Route config (layouts + nested routes)
    auth/
      login.tsx          Email/password sign-in
      signup.tsx          Account creation + email verification
      callback.tsx       OAuth/email confirmation callback
      forgot-password.tsx
      reset-password.tsx
      verify-email.tsx
    dashboard/
      _index.tsx         Protected dashboard (auth check in loader)
    layouts/
      public-layout.tsx  Header + footer for public pages
      auth-layout.tsx    Centered form container
  styles/
    globals.css          Tailwind directives + CSS design tokens
  root.tsx               Root layout + ErrorBoundary
e2e/                     Playwright tests (auth, dashboard, smoke)
test/mocks/              MSW setup (server.ts + handlers.ts)
.storybook/              Storybook config
.github/workflows/       CI (ci.yml + e2e.yml)
```

## Data Flow

```
PostgreSQL (Supabase)
  -> postgres.js driver
  -> Drizzle ORM (app/lib/db/index.ts)
  -> Server utilities (app/lib/server/)
  -> Route loaders/actions
  -> useLoaderData() / useActionData()
  -> React components
```

## Auth Flow

```
Request -> createSupabaseServerClient(request)
  -> Parse cookies from request headers
  -> supabase.auth.getUser()
  -> If no user: redirect("/auth/login")
  -> If user: return data + Set-Cookie headers
```

## Route Hierarchy

```
root.tsx (HTML shell + ErrorBoundary)
  public-layout.tsx
    / (home)
  auth-layout.tsx
    /auth/login
    /auth/signup
    /auth/callback
    /auth/forgot-password
    /auth/reset-password
    /auth/verify-email
  /dashboard (protected)
```

## External Dependencies

| Service        | Purpose           | Access                             |
| -------------- | ----------------- | ---------------------------------- |
| Supabase       | Auth + PostgreSQL | ENV vars (VITE_SUPABASE_URL, etc.) |
| Vercel         | Deployment        | CLI                                |
| GitHub Actions | CI/CD             | Repo secrets                       |

## Database Schema

**feature_flags**: id, key (unique), enabled, description, metadata (JSONB), created_at, updated_at
**app_config**: id, scope, key, value (JSONB), created_at, updated_at. Unique constraint on (scope, key).

No foreign keys (lookup tables). No migrations run yet (using db:push strategy).
