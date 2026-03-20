---
phase: quick
plan: "007"
subsystem: server-utilities
tags: [server, utilities, events, logger, form, rate-limit, in-memory]
dependency_graph:
  requires: []
  provides:
    - app/lib/server/events.ts
    - app/lib/server/logger.ts
    - app/lib/server/form.ts
    - app/lib/server/rate-limit.ts
  affects:
    - CLAUDE.md
tech_stack:
  added: []
  patterns:
    - in-process event bus with module augmentation
    - structured logging with ANSI dev / JSON prod
    - FormData → Zod validation pipeline
    - in-memory sliding-window rate limiter
key_files:
  created:
    - app/lib/server/events.ts
    - app/lib/server/logger.ts
    - app/lib/server/form.ts
    - app/lib/server/rate-limit.ts
  modified:
    - CLAUDE.md
decisions:
  - Used module augmentation pattern for AppEvents to keep type safety across modules
  - logger.error returns errorId (UUID) so callers can surface it to users for support tickets
  - formDataToObject tries JSON.parse on values that match JSON-like patterns (regex guard)
  - createRateLimiter stores max on RateLimitResult so getRateLimitHeaders needs no extra args
  - setInterval cleanup uses unref() guard to avoid blocking Node.js exit in test environments
metrics:
  duration: "~10 minutes"
  completed: "2026-02-23"
---

# Phase quick Plan 007: Server Utilities Summary

Four standalone server utility modules with zero external dependencies added to the SaaS starter template.

## Tasks Completed

| #   | Task                                  | Status | Commit  |
| --- | ------------------------------------- | ------ | ------- |
| 1   | Create `app/lib/server/events.ts`     | Done   | 766ea4f |
| 2   | Create `app/lib/server/logger.ts`     | Done   | 766ea4f |
| 3   | Create `app/lib/server/form.ts`       | Done   | 766ea4f |
| 4   | Create `app/lib/server/rate-limit.ts` | Done   | 766ea4f |
| 5   | Update CLAUDE.md                      | Done   | 766ea4f |
| 6   | Run checks and commit                 | Done   | 766ea4f |

## What Was Built

### Event Bus (`app/lib/server/events.ts`)

Typed in-process pub/sub using `Map<string, Set<EventHandler>>`. Consumers augment `AppEvents` to declare typed events. `emit()` runs each handler via `queueMicrotask()` with individual try/catch so one failing handler cannot block others. `on()` returns an unsubscribe function. `removeAllListeners()` accepts an optional event name.

### Logger (`app/lib/server/logger.ts`)

Structured logger respecting `LOG_LEVEL` env var (default: `info`). Levels: `debug=0`, `info=1`, `warn=2`, `error=3`. Dev mode pretty-prints with ANSI color. Production outputs single-line JSON. `logger.error()` generates a UUID `errorId` and returns it — pass to users for support. Warnings and errors write to `console.error`; others to `console.log`.

### Form Validation (`app/lib/server/form.ts`)

`formDataToObject(formData)` converts FormData to a plain object, collapsing repeated keys into arrays and JSON-parsing values that match a regex guard (`{`, `[`, `"`, booleans, null, numbers). `parseFormData(request, schema)` wraps the full flow: read FormData, convert, Zod safeParse, return typed success or field-level error map compatible with React Router action patterns.

### Rate Limiter (`app/lib/server/rate-limit.ts`)

`createRateLimiter({ windowMs, max })` returns a per-request function. IP is extracted from `x-forwarded-for`, `x-real-ip`, or falls back to `"unknown"`. Uses a sliding window (`Map<ip, { count, windowStart }>`). A `setInterval` cleanup runs every 60s to evict expired windows. The `max` value is stored on `RateLimitResult` so `getRateLimitHeaders()` emits all four standard headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` when blocked) with a single argument.

## Verification Results

- `npx biome check` (4 new files): passed
- `npm run typecheck`: passed (0 errors)
- `npm run test`: passed (no test files, exits 0)
- All files Biome-formatted (tabs, double quotes, semicolons)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Biome formatting (spaces vs tabs)**

- **Found during:** Task 6 (lint check)
- **Issue:** Files were written with 2-space indentation; Biome project config requires tabs
- **Fix:** Ran `npx biome format --write` on all four new files before committing
- **Files modified:** all four new server utility files
- **Commit:** 766ea4f

**2. [Rule 2 - Missing] Added `max` field to `RateLimitResult`**

- **Found during:** Task 4
- **Issue:** `getRateLimitHeaders` needed the limiter's `max` value to emit `X-RateLimit-Limit`, but `RateLimitResult` as specced had no `max` field, requiring callers to thread it separately
- **Fix:** Added `max: number` to `RateLimitResult` — stored once by the factory, available to `getRateLimitHeaders` without extra arguments; simpler call site
- **Files modified:** `app/lib/server/rate-limit.ts`
- **Commit:** 766ea4f

**3. [Rule 2 - Missing] Added `unref()` guard on setInterval**

- **Found during:** Task 4
- **Issue:** `setInterval` in Node.js keeps the process alive; in test/serverless environments this blocks clean exit
- **Fix:** Added a type-guarded `unref()` call — only invoked if the return value is an object with `unref` (Node.js `Timeout`), safe in edge runtimes that return a number
- **Files modified:** `app/lib/server/rate-limit.ts`
- **Commit:** 766ea4f

**4. [Rule 2 - Missing] Zod v4 import path in `form.ts`**

- **Found during:** Task 3 (typecheck)
- **Issue:** Project uses Zod v4 (`"zod": "^4.3.6"`); the correct import is `from "zod/v4"` for the type
- **Fix:** Used `import type { z } from "zod/v4"` to match installed package structure
- **Files modified:** `app/lib/server/form.ts`
- **Commit:** 766ea4f

## Self-Check: PASSED

Files verified:

- `app/lib/server/events.ts` — FOUND
- `app/lib/server/logger.ts` — FOUND
- `app/lib/server/form.ts` — FOUND
- `app/lib/server/rate-limit.ts` — FOUND
- `CLAUDE.md` — FOUND (updated)

Commit verified:

- `766ea4f` — FOUND (feat: add event bus, logger, form validation, and rate limiter utilities)
