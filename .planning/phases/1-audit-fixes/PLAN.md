# PLAN: Phase 1 - Starter Audit Fixes

> Goal: Fix all 15 findings from the post-phase-0 audit. Every issue resolved, from CRITICAL to LOW.

## Context

Phase 0 hardened test automation and fixed the first wave of security issues. A comprehensive audit revealed 15 remaining gaps across security, validation, DX, and testing. This phase fixes them all.

**Read before executing:**

- `taste.md` (full file)
- `app/lib/supabase/server.ts`
- `app/lib/supabase/client.ts`
- `app/lib/db/index.ts`
- `app/lib/server/config.ts`
- `app/routes/dashboard/_index.tsx`
- `app/routes/auth/login.tsx`, `signup.tsx`, `forgot-password.tsx`, `reset-password.tsx`
- `app/routes/layouts/auth-layout.tsx`, `public-layout.tsx`
- `app/root.tsx`
- `.env.example`
- `playwright.config.ts`
- `CLAUDE.md`

---

## Wave 1: Critical Security (3 tasks)

### Task 1.1: Env validation at startup with Zod

**Boundary:** `app/lib/env.server.ts` (new), `app/lib/db/index.ts`, `app/lib/supabase/server.ts`, `app/lib/supabase/client.ts`

**What:** Create a Zod-based env validation module that crashes at boot with clear errors if vars are missing. Remove all `!` non-null assertions on env vars.

**Implementation:**

1. Create `app/lib/env.server.ts`:

   ```ts
   import { z } from "zod";

   const serverEnvSchema = z.object({
     DATABASE_URL: z.string().url(),
     SUPABASE_SECRET_KEY: z.string().min(1),
     VITE_SUPABASE_URL: z.string().url(),
     VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
   });

   const parsed = serverEnvSchema.safeParse(process.env);

   if (!parsed.success) {
     console.error(
       "Invalid environment variables:",
       parsed.error.flatten().fieldErrors,
     );
     throw new Error(
       "Missing or invalid environment variables. Check .env file.",
     );
   }

   export const env = parsed.data;
   ```

2. Update `app/lib/db/index.ts`: import `env` from `~/lib/env.server`, use `env.DATABASE_URL` instead of `process.env.DATABASE_URL!`
3. Update `app/lib/supabase/server.ts`: import `env`, use `env.VITE_SUPABASE_URL` and `env.SUPABASE_SECRET_KEY` (fix: use secret key for server client)
4. Update `app/lib/supabase/client.ts`: keep using `import.meta.env` (browser-side, validated at build time by Vite)

**AC:**

- [ ] `app/lib/env.server.ts` exists with Zod schema
- [ ] Missing env vars crash at boot with clear error message
- [ ] No `!` non-null assertions on env vars in db/index.ts or supabase/server.ts
- [ ] Server Supabase client uses `SUPABASE_SECRET_KEY` (not publishable key)
- [ ] All existing tests still pass (`npm run test`)

### Task 1.2: CSRF protection on auth forms

**Boundary:** `app/lib/server/csrf.ts` (new), `app/lib/server/index.ts`, `app/routes/auth/login.tsx`, `app/routes/auth/signup.tsx`, `app/routes/auth/forgot-password.tsx`, `app/routes/auth/reset-password.tsx`

**What:** Add CSRF protection to all auth actions using the cookie-to-header double-submit pattern.

**Implementation:**

1. Create `app/lib/server/csrf.ts`:

   ```ts
   import { randomBytes } from "node:crypto";

   const CSRF_COOKIE = "__csrf";
   const CSRF_FIELD = "_csrf";

   export const generateCsrfToken = (): string =>
     randomBytes(32).toString("hex");

   export const setCsrfCookie = (headers: Headers, token: string): void => {
     headers.append(
       "Set-Cookie",
       `${CSRF_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`,
     );
   };

   export const validateCsrf = (request: Request, formData: FormData): void => {
     const cookieHeader = request.headers.get("Cookie") ?? "";
     const cookieToken = cookieHeader
       .split(";")
       .map((c) => c.trim())
       .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
       ?.split("=")[1];

     const formToken = formData.get(CSRF_FIELD) as string | null;

     if (!cookieToken || !formToken || cookieToken !== formToken) {
       throw new Response("Invalid CSRF token", { status: 403 });
     }
   };
   ```

2. Add barrel export in `app/lib/server/index.ts`
3. In each auth route:
   - Add a `loader` (or update existing) that generates a CSRF token, sets the cookie, and returns it
   - In the `action`, call `validateCsrf(request, formData)` before processing
   - In the component, add `<input type="hidden" name="_csrf" value={csrfToken} />` using `useLoaderData`

**AC:**

- [ ] CSRF module exists with generate, setCookie, validate functions
- [ ] All 4 auth actions validate CSRF before processing
- [ ] All 4 auth forms include hidden CSRF input
- [ ] 403 response on missing or mismatched CSRF token
- [ ] Barrel exported from `~/lib/server`
- [ ] All existing tests still pass

### Task 1.3: Server-side password validation with parseFormData

**Boundary:** `app/routes/auth/signup.tsx`, `app/routes/auth/reset-password.tsx`

**What:** Use the existing `parseFormData` utility with Zod schemas for server-side validation. Both routes currently cast `formData.get("password") as string` with zero validation.

**Implementation:**

1. In `signup.tsx` action: create a Zod schema `{ email: z.string().email(), password: z.string().min(8) }`, use `parseFormData(request, schema)`. Return field-level errors on validation failure.
2. In `reset-password.tsx` action: create a Zod schema `{ password: z.string().min(8) }`, use `parseFormData(request, schema)`.
3. Show field-level errors in the forms (not just generic error banner).

**AC:**

- [ ] Signup action validates email + password server-side with Zod
- [ ] Reset-password action validates password server-side with Zod
- [ ] Validation errors shown per-field in the form
- [ ] A curl with 3-char password returns 400 with field error (not Supabase error)
- [ ] All existing tests still pass

---

## Wave 2: High Priority Fixes (3 tasks)

### Task 2.1: Fix dashboard loader headers + route error boundaries

**Boundary:** `app/routes/dashboard/_index.tsx`, `app/routes/auth/login.tsx`, `app/routes/auth/signup.tsx`

**What:**

1. Dashboard loader drops Supabase `headers` - session refresh cookies never set
2. No route-level error boundaries

**Fix:**

1. Dashboard loader: use `data()` helper to return JSON with headers:
   ```ts
   return data({ email: user.email }, { headers });
   ```
2. Add an `ErrorBoundary` export to dashboard route (contextual recovery UI with "Back to home" link)
3. Add an `ErrorBoundary` export to login and signup routes (show error + link to retry)

**AC:**

- [ ] Dashboard loader passes `headers` in response
- [ ] Dashboard has its own `ErrorBoundary` with recovery UI
- [ ] Login and signup have their own `ErrorBoundary`
- [ ] All existing tests still pass

### Task 2.2: 404 catch-all route

**Boundary:** `app/routes/$.tsx` (new)

**What:** Create a proper 404 page with navigation and styling.

**Implementation:** Create a splat route that throws a 404 Response. The root ErrorBoundary handles the rendering, but this ensures proper status code.

```tsx
export const loader = () => {
  throw new Response("Not Found", { status: 404 });
};
```

Also improve root ErrorBoundary: add a "Back to home" link for 404s.

**AC:**

- [ ] `app/routes/$.tsx` exists
- [ ] Visiting `/random-page` returns 404 status
- [ ] Root ErrorBoundary shows "Back to home" link for 404s
- [ ] All existing tests still pass

### Task 2.3: Fix setConfig race condition + getConfigCascade performance

**Boundary:** `app/lib/server/config.ts`, `app/lib/server/__tests__/config.test.ts`

**What:**

1. `setConfig` does SELECT then INSERT/UPDATE - race condition on concurrent calls
2. `getConfigCascade` does N sequential queries instead of 1

**Fix:**

1. `setConfig`: use Drizzle's `onConflictDoUpdate` for atomic upsert:
   ```ts
   await db
     .insert(appConfig)
     .values({ scope, key, value })
     .onConflictDoUpdate({
       target: [appConfig.scope, appConfig.key],
       set: { value, updatedAt: new Date() },
     });
   ```
2. `getConfigCascade`: single query with `WHERE (scope, key) IN (...)`, then resolve priority in memory:

   ```ts
   const rows = await db.select().from(appConfig)
     .where(and(eq(appConfig.key, key), inArray(appConfig.scope, scopes)));
   // Return first match in scopes priority order
   for (const scope of scopes) {
     const row = rows.find(r => r.scope === scope);
     if (row) { ... return validated value }
   }
   ```

3. Update tests to reflect new behavior.

**AC:**

- [ ] `setConfig` uses upsert (single query, no race)
- [ ] `getConfigCascade` uses single query with in-memory priority
- [ ] All config tests pass
- [ ] All existing tests still pass

---

## Wave 3: Medium Priority (3 tasks)

### Task 3.1: Lazy DB connection

**Boundary:** `app/lib/db/index.ts`

**What:** DB connection fires at import time. Make it lazy so imports during typecheck/test don't trigger a connection.

**Fix:** Use a getter or lazy singleton:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "~/lib/env.server";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDb = () => {
  if (!_db) {
    const client = postgres(env.DATABASE_URL, { max: 1, prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
};

// Keep `db` export for backwards compatibility during migration
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  },
});
```

**AC:**

- [ ] Importing `~/lib/db` does NOT trigger a DB connection
- [ ] `db.select(...)` etc. still work (lazy init on first use)
- [ ] All existing tests still pass

### Task 3.2: Brand constant + CLAUDE.md doc fix

**Boundary:** `app/lib/constants.ts` (new), `app/routes/dashboard/_index.tsx`, `app/routes/layouts/auth-layout.tsx`, `app/routes/layouts/public-layout.tsx`, `CLAUDE.md`

**What:**

1. "SaaS Starter" hardcoded in 4 files
2. CLAUDE.md references wrong function name `getSupabaseServerClient`

**Fix:**

1. Create `app/lib/constants.ts` with `export const APP_NAME = "SaaS Starter";`
2. Replace all hardcoded "SaaS Starter" strings with `APP_NAME` import
3. Fix CLAUDE.md: `getSupabaseServerClient` -> `createSupabaseServerClient`

**AC:**

- [ ] `APP_NAME` constant exists and is used in all 3 layout/dashboard files
- [ ] CLAUDE.md auth section references `createSupabaseServerClient`
- [ ] All existing tests still pass

### Task 3.3: Fix Playwright config

**Boundary:** `playwright.config.ts`

**What:** Port 3000 is correct for `react-router-serve` (production build), but the webServer command should be verified.

**Fix:** The config is actually correct - `npm run build && npm run start` runs the production server on port 3000 (react-router-serve default). But add a comment clarifying this, and ensure the start script in package.json uses port 3000.

Check `package.json` start script - if it uses `react-router-serve`, port 3000 is the default. No change needed, just verify.

**AC:**

- [ ] Playwright config verified: port 3000 matches `react-router-serve` default
- [ ] If port mismatch found, fix it

---

## Wave 4: Component Stories + Auth Route Tests (2 tasks)

### Task 4.1: UI component stories

**Boundary:** `app/components/ui/*.stories.tsx` (8 new files)

**What:** Create Storybook stories for all 8 UI components: button, card, dialog, image, input, label, separator, textarea.

**Convention:** Each story file has `Default` + `DarkMode` variants with `MemoryRouter` decorator.

**AC:**

- [ ] 8 `.stories.tsx` files created
- [ ] Each has Default + DarkMode variants
- [ ] `npx storybook build --test` compiles without errors

### Task 4.2: Auth route integration tests

**Boundary:** `app/routes/auth/__tests__/` (new directory, 4 test files)

**What:** Create integration tests for auth routes. Since these are route modules (loaders/actions), test the server-side logic using real function calls with mocked Supabase.

**Tests to write:**

1. `callback.test.ts` - no code redirects to login, failed exchange redirects with error, success redirects to dashboard
2. `login.test.ts` - rate limiting returns 429, successful login redirects, failed login returns error
3. `signup.test.ts` - rate limiting, password validation (server-side), successful signup redirects
4. `reset-password.test.ts` - loader redirects without session, action validates password

**AC:**

- [ ] 4 test files created in `app/routes/auth/__tests__/`
- [ ] Tests cover the critical paths listed above
- [ ] All tests pass (`npm run test`)

---

## Commit Strategy

- Wave 1: 3 commits (one per task)
- Wave 2: 3 commits
- Wave 3: 3 commits (task 3.3 may be verify-only, no commit needed)
- Wave 4: 2 commits

Format: `riff(phase-1/task-N.N): description`

## Verification Criteria

After all waves:

1. `npm run test` passes (including all new tests)
2. `npm run typecheck` passes (after generating types)
3. `npm run lint` passes
4. No `!` assertions on env vars
5. CSRF protection on all auth actions
6. Server-side validation on signup + reset-password
7. Dashboard loader passes headers
8. 404 catch-all route returns proper 404
9. `setConfig` uses upsert
10. `getConfigCascade` uses single query
11. DB connection is lazy
12. `APP_NAME` constant used everywhere
13. CLAUDE.md references correct function names
14. 8 component stories exist
15. 4 auth test files exist and pass
