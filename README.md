# SaaS Starter

Production-ready SaaS template: React Router 7 + Supabase Auth + Drizzle ORM + Tailwind CSS 4.

Built for solo developers and small teams who want a solid foundation without the ceremony.

## Stack

| Layer      | Technology                                                                |
| ---------- | ------------------------------------------------------------------------- |
| Framework  | [React Router 7](https://reactrouter.com) (SSR, framework mode)           |
| Language   | TypeScript (strict)                                                       |
| Styling    | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) (Radix + CVA)         |
| Auth       | [Supabase](https://supabase.com) (email/password, OAuth-ready)            |
| Database   | [Drizzle ORM](https://orm.drizzle.team) + postgres.js → Supabase Postgres |
| Validation | [Zod 4](https://zod.dev)                                                  |
| Testing    | Vitest + Testing Library + MSW + Playwright                               |
| Stories    | Storybook 10 (vitest addon + a11y addon)                                  |
| Linting    | [Biome](https://biomejs.dev) (tabs, double quotes, semicolons)            |
| CI         | GitHub Actions (lint → typecheck → test → build)                          |
| Deploy     | Vercel                                                                    |

## Quick Start

```bash
# 1. Clone and reset git history
git clone git@github.com:YOUR_USER/saas-starter.git my-saas
cd my-saas
rm -rf .git && git init

# 2. Install dependencies
npm install

# 3. Create a Supabase project at https://supabase.com
# 4. Copy and fill in credentials
cp .env.example .env

# 5. Push the database schema
npm run db:push

# 6. Start developing
npm run dev
```

## Dev Commands

```bash
npm run dev          # Dev server (http://localhost:5173)
npm run test         # Vitest unit tests
npm run storybook    # Component explorer (http://localhost:6006)
npm run lint         # Biome lint check
npm run typecheck    # TypeScript check
npm run build        # Production build
npm run db:generate  # Generate Drizzle migration files
npm run db:push      # Push schema directly (no migration files)
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
app/
  components/        UI components (organized by feature)
  lib/
    db/              Drizzle client + schema
    server/          Server utilities (see below)
    supabase/        Supabase client helpers
  routes/
    auth/            Login, signup, forgot/reset password, verify email
    dashboard/       Protected dashboard pages
    layouts/         Public / Auth / Dashboard layout wrappers
  styles/            Global CSS + design tokens
test/
  mocks/             MSW mock handlers
.storybook/          Storybook config
.github/workflows/   CI pipeline
.claude/             Claude Code config + references
```

## Auth

Auth is handled entirely by Supabase.

```ts
// In loaders and actions (server-side)
import { getSupabaseServerClient } from "~/lib/supabase/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw redirect("/auth/login");
  return data({ user }, { headers });
};

// In components (browser-side)
import { getSupabaseBrowserClient } from "~/lib/supabase/browser";

const supabase = getSupabaseBrowserClient();
await supabase.auth.signOut();
```

Sessions are cookie-based via `@supabase/ssr`. Protected routes check auth in the loader and redirect to `/auth/login`.

## Database

Schema lives in [`app/lib/db/schema.ts`](app/lib/db/schema.ts). Drizzle connects to Supabase Postgres via `postgres.js`.

```ts
import { db } from "~/lib/db/client";
import { users } from "~/lib/db/schema";

const allUsers = await db.select().from(users);
```

## Server Utilities

Six zero-dependency utilities in [`app/lib/server/`](app/lib/server/).

### Feature Flags — [`app/lib/server/features.ts`](app/lib/server/features.ts)

DB-backed feature flags with per-org overrides stored as JSONB.

```ts
import { isEnabled, getEnabledFlags } from "~/lib/server/features";

// Check a single flag
const showBilling = await isEnabled(db, "billing");

// Check with org-level override
const canExport = await isEnabled(db, "csv-export", { orgId: "org_123" });

// Get all enabled flags as a Set
const flags = await getEnabledFlags(db);
if (flags.has("new-dashboard")) { ... }
```

Flags are stored in the `feature_flags` table. The `metadata` JSONB column holds per-org overrides:

```json
{ "orgs": { "org_123": true, "org_456": false } }
```

### JSONB Config — [`app/lib/server/config.ts`](app/lib/server/config.ts)

Scoped key/value config stored as JSONB, validated at runtime with Zod.

```ts
import {
  getConfig,
  getConfigCascade,
  setConfig,
  deleteConfig,
} from "~/lib/server/config";
import { z } from "zod";

const ThemeSchema = z.object({ primaryColor: z.string() });

// Get a single config value
const theme = await getConfig(db, "org:org_123", "theme", ThemeSchema);

// Cascade: check user → org → global (first match wins)
const resolved = await getConfigCascade(db, "theme", ThemeSchema, [
  "user:user_456",
  "org:org_123",
  "global",
]);

// Write
await setConfig(db, "global", "theme", { primaryColor: "#6366f1" });

// Delete
await deleteConfig(db, "org:org_123", "theme");
```

Scope convention: `"global"`, `"org:{id}"`, `"user:{id}"`.

### Event Bus — [`app/lib/server/events.ts`](app/lib/server/events.ts)

Typed in-process pub/sub. Handlers run via `queueMicrotask()` — they never block the response.

```ts
// events.d.ts — declare your app's events once
declare module "~/lib/server/events" {
  interface AppEvents {
    "user.created": { userId: string; email: string };
    "payment.received": { amount: number; currency: string };
  }
}

// Register a handler (returns an unsubscribe function)
import { on, emit } from "~/lib/server/events";

const unsub = on("user.created", ({ userId, email }) => {
  // send welcome email, create audit log, etc.
});

// Fire from any loader/action — completely non-blocking
emit("user.created", { userId: "123", email: "user@example.com" });

// Cleanup (useful in tests)
unsub();
// or: removeAllListeners("user.created");
```

Each handler is wrapped in a `try/catch` — one failing handler never breaks others.

### Structured Logger — [`app/lib/server/logger.ts`](app/lib/server/logger.ts)

Replaces `console.log` with structured output. Pretty-prints in dev, emits single-line JSON in production.

```ts
import { logger } from "~/lib/server/logger";

logger.debug("Cache miss", { key: "user:123" });
logger.info("Request processed", { path: "/api/data", ms: 42 });
logger.warn("Deprecated field used", { field: "legacyId" });

// logger.error returns an errorId — show it to users for support
const errorId = logger.error("Payment failed", err, { userId: "123" });
return json(
  { error: `Something went wrong. Error ID: ${errorId}` },
  { status: 500 },
);
```

Respects the `LOG_LEVEL` env var (`debug` | `info` | `warn` | `error`, default: `info`).

### Form Validation — [`app/lib/server/form.ts`](app/lib/server/form.ts)

One-call FormData parsing and Zod validation for React Router actions.

```ts
import { parseFormData } from "~/lib/server/form";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await parseFormData(request, LoginSchema);

  if (!result.success) {
    // result.errors shape: { email: ["Invalid email"], password: ["Too short"] }
    return json({ errors: result.errors }, { status: 400 });
  }

  // result.data is fully typed as { email: string; password: string }
  await signIn(result.data.email, result.data.password);
};
```

Multiple values for the same key become arrays. JSON-like strings are automatically parsed.

### Rate Limiter — [`app/lib/server/rate-limit.ts`](app/lib/server/rate-limit.ts)

IP-based in-memory sliding window. Create a limiter once per route file, call it per request.

```ts
import {
  createRateLimiter,
  getRateLimitHeaders,
} from "~/lib/server/rate-limit";

// Create once at module level
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = limiter(request);

  if (!result.allowed) {
    return json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: getRateLimitHeaders(result) },
    );
  }

  // result.remaining — requests left in this window
  // result.resetAt   — Date when window resets
  // ... normal logic
};
```

IP is extracted from `x-forwarded-for` → `x-real-ip` → `"unknown"`. Resets on deploy (in-memory), which is fine at starter scale.

## Testing

Every component ships three files: `{name}.tsx` + `{name}.stories.tsx` + `{name}.test.tsx`.

Use the `/component` command to scaffold all three at once.

```bash
npm run test          # Run all Vitest tests
npm run test:ui       # Vitest UI
npm run storybook     # Run Storybook
```

- Tests use Vitest + Testing Library + MSW
- MSW mocks live in `test/mocks/handlers.ts`
- Test user behavior via `screen.getByRole()`, not `container.querySelector()`
- Stories always include `Default` + `DarkMode` variants

## Workflow

This project is designed to work with [Get Shit Done (GSD)](https://github.com/gsd-build/get-shit-done) — a spec-driven development system for Claude Code.

```bash
# Install GSD
npx get-shit-done-cc@latest
```

Core commands:

```
/gsd:new-project     → Questions → research → requirements → roadmap
/gsd:discuss-phase N → Shape implementation decisions before planning
/gsd:plan-phase N    → Research → atomic task plans → verification
/gsd:execute-phase N → Wave-based parallel execution with atomic commits
/gsd:verify-work N   → Goal-backward verification of built work
```

See the [GSD documentation](https://github.com/gsd-build/get-shit-done) for the full command list.

## Customization Checklist

After cloning:

- [ ] Update `CLAUDE.md` — project name, overview, structure
- [ ] Update `package.json` — `name` field
- [ ] Update `README.md` — project name, description
- [ ] Create a Supabase project and fill `.env` from `.env.example`
- [ ] Run `npm run db:push` to apply the initial schema
- [ ] Update design tokens in `app/styles/globals.css` (colors, fonts, radii)
- [ ] Install project fonts (`@fontsource/*`) if desired
- [ ] Install GSD: `npx get-shit-done-cc@latest`
- [ ] Run `/gsd:new-project` to begin

## Environment Variables

```bash
# .env (copy from .env.example)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # server-only
DATABASE_URL=postgres://...                       # direct connection string

# Optional
LOG_LEVEL=info     # debug | info | warn | error (default: info)
NODE_ENV=          # set automatically by Vite / Vercel
```
