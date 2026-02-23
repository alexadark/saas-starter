---
type: quick
task_number: "007"
task_slug: server-utilities
created: 2026-02-23T00:00:00Z
files_modified:
  - /Users/webstantly/DEV/templates/saas-starter/app/lib/server/events.ts
  - /Users/webstantly/DEV/templates/saas-starter/app/lib/server/logger.ts
  - /Users/webstantly/DEV/templates/saas-starter/app/lib/server/form.ts
  - /Users/webstantly/DEV/templates/saas-starter/app/lib/server/rate-limit.ts
  - /Users/webstantly/DEV/templates/saas-starter/CLAUDE.md
autonomous: true
---

# Quick Task 007: Server Utilities (Event Bus, Logger, Form Validation, Rate Limiter)

> Add four foundational server utilities that every SaaS project needs. These complement the feature flags and config from quick-006.

## Context

- Project: `/Users/webstantly/DEV/templates/saas-starter`
- Stack: React Router 7, Supabase Auth, Drizzle ORM, Zod 4, Biome
- Quick-006 adds `app/lib/server/features.ts` and `app/lib/server/config.ts`
- This plan adds 4 more utilities to the same `app/lib/server/` directory
- All utilities are standalone — no dependencies between them
- Zod is already in package.json (`^4.3.6`)

## Design Decisions

### Event Bus

- Typed, synchronous, in-process pub/sub — NOT a message queue
- Fire-and-forget: emitters don't await handlers, handlers don't block the request
- Listeners registered at import time, not at runtime
- Perfect for: audit logs, analytics, notifications, webhook triggers
- Uses `queueMicrotask()` for fire-and-forget to avoid blocking the response

### Structured Logger

- Replaces `console.log` with structured JSON output
- Each log entry has: `level`, `message`, `timestamp`, `errorId` (for errors), `context`
- Error IDs are UUIDs — show to user ("Error ID: abc-123") so they can report issues
- Respects `LOG_LEVEL` env var (debug < info < warn < error)
- In dev: pretty-prints. In prod: JSON for log aggregators

### Form Validation Helper

- One-liner to parse FormData with Zod: `parseFormData(request, schema)`
- Returns `{ success: true, data }` or `{ success: false, errors }` (field-level)
- Errors shaped for React Router actions — return as `json({ errors })` directly
- Replaces raw `formData.get()` + manual validation everywhere

### Rate Limiter

- IP-based, in-memory sliding window
- Configurable per route: `rateLimit({ windowMs: 60000, max: 10 })`
- Returns a middleware-like function for use in loaders/actions
- Resets on deploy (in-memory) — fine at starter scale
- Returns 429 with `Retry-After` header when exceeded

## Boundaries

- Do NOT add Redis/external dependencies — in-memory only
- Do NOT create middleware wrappers — these are utility functions called in loaders/actions
- Do NOT modify existing route files — just provide the tools
- Do NOT add tests — the starter ships without example tests (projects add their own)

## Tasks

<task type="auto">
  <name>Create typed event bus</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/app/lib/server/events.ts</files>
  <action>
    Create `events.ts` with a typed event emitter pattern:

    **Type system:**
    ```typescript
    // Projects define their event map by augmenting this interface
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AppEvents {}

    type EventHandler<T> = (payload: T) => void | Promise<void>;
    ```

    **`on<K>(event, handler)`**
    - Register a handler for an event type
    - Returns an unsubscribe function
    - Handlers stored in a Map<string, Set<EventHandler>>

    **`emit<K>(event, payload)`**
    - Fire all handlers for the event type
    - Uses `queueMicrotask()` to run handlers without blocking
    - Wraps each handler in try/catch — one failing handler doesn't break others
    - Does NOT await handlers — true fire-and-forget

    **`removeAllListeners(event?)`**
    - Clear handlers for one event or all events
    - Useful for testing cleanup

    Export the three functions + the AppEvents interface for type augmentation.

    Add a JSDoc example at the top showing how to declare events:
    ```typescript
    // In your project, augment the AppEvents interface:
    // declare module "~/lib/server/events" {
    //   interface AppEvents {
    //     "user.created": { userId: string; email: string };
    //     "payment.received": { amount: number; currency: string };
    //   }
    // }
    //
    // Then use:
    // emit("user.created", { userId: "123", email: "a@b.com" });
    // on("user.created", (payload) => { /* payload is typed */ });
    ```

  </action>
  <verify>
    `npm run typecheck` passes. File exports on(), emit(), removeAllListeners().
  </verify>
  <done>Typed fire-and-forget event bus with queueMicrotask execution</done>
</task>

<task type="auto">
  <name>Create structured logger</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/app/lib/server/logger.ts</files>
  <action>
    Create `logger.ts` with:

    **Log levels:** `debug`, `info`, `warn`, `error` (respects `LOG_LEVEL` env var, default: `info`)

    **`logger.info(message, context?)`** (same for debug, warn, error)
    - Outputs structured JSON: `{ level, message, timestamp, ...context }`
    - In development (`NODE_ENV !== "production"`): pretty-print with colors
    - In production: single-line JSON for log aggregators

    **`logger.error(message, error?, context?)`**
    - Generates a unique `errorId` (crypto.randomUUID())
    - Includes `errorId`, `stack` (if Error provided), and context
    - Returns the errorId so callers can show it to users

    **Implementation notes:**
    - Use `process.env.LOG_LEVEL` for threshold (default "info")
    - Use `process.env.NODE_ENV` for format detection
    - Level order: debug=0, info=1, warn=2, error=3
    - Only output if message level >= configured level
    - Use `console.log` / `console.error` under the hood (for compatibility with all runtimes)

    Export `logger` as a named export (not default).

  </action>
  <verify>
    `npm run typecheck` passes. Logger exports with all 4 methods.
  </verify>
  <done>Structured logger with error IDs and environment-aware formatting</done>
</task>

<task type="auto">
  <name>Create Zod form validation helper</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/app/lib/server/form.ts</files>
  <action>
    Create `form.ts` with:

    **`parseFormData<T>(request, schema)`**
    - Reads request.formData()
    - Converts FormData to plain object (handles nested keys like "address.city")
    - Runs Zod safeParse
    - Returns discriminated union:
      ```typescript
      type ParseResult<T> =
        | { success: true; data: T }
        | { success: false; errors: Record<string, string[]> };
      ```
    - Error format: `{ fieldName: ["error message 1", "error message 2"] }`
    - This shape works directly with React Router action returns

    **`formDataToObject(formData)`** (internal helper, exported for testing)
    - Converts FormData to Record<string, unknown>
    - Handles: strings, multiple values (same key → array), JSON strings (tries parse)
    - Does NOT handle file uploads — just text fields

    **Usage in a route action:**
    ```typescript
    export async function action({ request }: ActionFunctionArgs) {
      const result = await parseFormData(request, MySchema);
      if (!result.success) return json({ errors: result.errors }, { status: 400 });
      // result.data is typed as MySchema
    }
    ```

  </action>
  <verify>
    `npm run typecheck` passes. File exports parseFormData and formDataToObject.
  </verify>
  <done>Zod form validation helper with field-level error extraction</done>
</task>

<task type="auto">
  <name>Create IP-based rate limiter</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/app/lib/server/rate-limit.ts</files>
  <action>
    Create `rate-limit.ts` with:

    **`createRateLimiter(options)`**
    - Options: `{ windowMs: number, max: number }` (e.g. 60s window, 10 requests max)
    - Returns a function: `(request: Request) => RateLimitResult`
    - Result: `{ allowed: boolean; remaining: number; resetAt: Date }`

    **Implementation: sliding window counter**
    - Store: `Map<string, { count: number; windowStart: number }>`
    - Key: IP from request headers (check `x-forwarded-for`, then `x-real-ip`, fallback "unknown")
    - If current time > windowStart + windowMs → reset the window
    - If count >= max → `{ allowed: false, remaining: 0, resetAt }`
    - Else → increment, return `{ allowed: true, remaining: max - count, resetAt }`

    **`getRateLimitHeaders(result)`**
    - Returns headers object: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` (if blocked)

    **Cleanup:** Run a cleanup every 60 seconds to prune expired entries (use setInterval, cleared on process exit)

    **Usage in a route:**
    ```typescript
    const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

    export async function action({ request }: ActionFunctionArgs) {
      const result = limiter(request);
      if (!result.allowed) {
        return json({ error: "Too many requests" }, {
          status: 429,
          headers: getRateLimitHeaders(result),
        });
      }
      // ... normal logic
    }
    ```

  </action>
  <verify>
    `npm run typecheck` passes. File exports createRateLimiter and getRateLimitHeaders.
  </verify>
  <done>IP-based in-memory rate limiter with sliding window and standard headers</done>
</task>

<task type="auto">
  <name>Update CLAUDE.md with all server utilities</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/CLAUDE.md</files>
  <action>
    Extend the "## Server Utilities" section added by quick-006 with the new utilities:

    ```markdown
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
    ```

    Also update the Structure tree:
    ```
    lib/
      db/              Drizzle ORM client + schema
      server/          Server utilities (features, config, events, logger, form, rate-limit)
      supabase/        Supabase clients
    ```

  </action>
  <verify>
    CLAUDE.md contains documentation for all 6 server utilities (features, config, events, logger, form, rate-limit).
  </verify>
  <done>CLAUDE.md fully documents all server utilities</done>
</task>

<task type="auto">
  <name>Run all checks and commit</name>
  <files>all modified files</files>
  <action>
    1. Run `npm run lint` — must pass
    2. Run `npm run typecheck` — must pass
    3. Run `npm run test` — must pass
    4. Stage specific files:
       - `app/lib/server/events.ts`
       - `app/lib/server/logger.ts`
       - `app/lib/server/form.ts`
       - `app/lib/server/rate-limit.ts`
       - `CLAUDE.md`
    5. Commit: `feat: add event bus, logger, form validation, and rate limiter utilities`
    6. Push to remote
  </action>
  <verify>
    All checks pass. Commit exists in git log.
  </verify>
  <done>All checks green, committed and pushed</done>
</task>

## Success Criteria

- Event bus: typed emit/on with fire-and-forget execution via queueMicrotask
- Logger: structured JSON in prod, pretty in dev, error IDs on errors
- Form validation: parseFormData() returns typed data or field-level errors
- Rate limiter: IP-based sliding window with standard headers
- CLAUDE.md documents all 6 server utilities
- All lint/typecheck/test checks pass
- Zero external dependencies added (all in-memory / built-in)
