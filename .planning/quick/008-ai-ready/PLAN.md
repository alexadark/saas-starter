---
type: quick
task_number: "008"
task_slug: ai-ready
created: 2026-03-08T00:00:00Z
files_modified:
  - app/lib/server/index.ts
  - app/lib/server/__tests__/events.test.ts
  - app/lib/server/__tests__/logger.test.ts
  - app/lib/server/__tests__/rate-limit.test.ts
  - app/lib/server/__tests__/config.test.ts
  - app/lib/server/__tests__/features.test.ts
  - app/lib/server/__tests__/form.test.ts
  - CLAUDE.md
autonomous: true
---

# Quick Task 008: Make Starter AI-Ready (Deep Modules)

> Apply Matt Pocock's "deep modules" philosophy: barrel exports, unit tests for all server utilities, and documented service layer pattern. The goal is to give AI agents proper feedback loops (tests) and navigability (barrel exports + documentation).

## Context

- Project: SaaS starter template (React Router 7, Drizzle, Supabase, Vitest)
- 6 server utilities exist but have ZERO unit tests
- No barrel export — AI must guess import paths
- No service layer pattern documented for when users build features

## Phase 1: Barrel Export + Server Utility Tests (Wave 1-2)

### Wave 1: Barrel export (trivial, unblocks nothing but good first commit)

<task type="auto">
  <name>Create server barrel export</name>
  <files>app/lib/server/index.ts</files>
  <action>
    Create barrel export re-exporting all public APIs from the 6 server utilities.
    Import from each file, export named exports.
  </action>
  <verify>npm run typecheck passes</verify>
</task>

### Wave 2: Server utility tests (6 files, all independent — parallel)

<task type="auto">
  <name>Test events.ts</name>
  <files>app/lib/server/__tests__/events.test.ts</files>
  <action>
    Test: on() registers handler, emit() fires handlers, unsubscribe works,
    removeAllListeners clears all, handlers run via microtask (async),
    failing handler doesn't break others, emit with no handlers is safe.
  </action>
  <verify>npm run test -- events.test passes</verify>
</task>

<task type="auto">
  <name>Test logger.ts</name>
  <files>app/lib/server/__tests__/logger.test.ts</files>
  <action>
    Test: info/debug/warn/error output, LOG_LEVEL filtering, error() returns errorId,
    error() includes stack trace from Error objects, production mode outputs JSON,
    dev mode uses colors.
  </action>
  <verify>npm run test -- logger.test passes</verify>
</task>

<task type="auto">
  <name>Test rate-limit.ts</name>
  <files>app/lib/server/__tests__/rate-limit.test.ts</files>
  <action>
    Test: allows requests under limit, blocks at limit, resets after window,
    different IPs tracked separately, getRateLimitHeaders returns correct headers,
    Retry-After only present when blocked.
  </action>
  <verify>npm run test -- rate-limit.test passes</verify>
</task>

<task type="auto">
  <name>Test config.ts</name>
  <files>app/lib/server/__tests__/config.test.ts</files>
  <action>
    Test with mocked Drizzle DB: getConfig returns typed value, returns null when
    not found, getConfigCascade resolves in order, setConfig upserts,
    deleteConfig removes. Mock the DB select/insert/update/delete.
  </action>
  <verify>npm run test -- config.test passes</verify>
</task>

<task type="auto">
  <name>Test features.ts</name>
  <files>app/lib/server/__tests__/features.test.ts</files>
  <action>
    Test with mocked DB: isEnabled returns true/false, respects orgId override,
    getEnabledFlags returns Set of enabled keys, missing flag returns false.
  </action>
  <verify>npm run test -- features.test passes</verify>
</task>

<task type="auto">
  <name>Test form.ts</name>
  <files>app/lib/server/__tests__/form.test.ts</files>
  <action>
    Test: parseFormData with valid data returns success, invalid data returns
    field-level errors, formDataToObject handles multiple values,
    JSON-like strings are parsed, non-JSON strings kept as-is.
  </action>
  <verify>npm run test -- form.test passes</verify>
</task>

## Phase 2: Documentation (Wave 3)

### Wave 3: Update CLAUDE.md with service layer pattern

<task type="auto">
  <name>Document deep module / service layer pattern in CLAUDE.md</name>
  <files>CLAUDE.md</files>
  <action>
    Add a "## Building Features (Deep Module Pattern)" section showing:
    1. How to organize a feature as a deep module (folder with index.ts interface)
    2. Example structure for a "billing" service
    3. Convention: every service gets tests that lock behavior
    4. Barrel import pattern from ~/lib/server
    This is documentation only — no code changes.
  </action>
  <verify>CLAUDE.md contains the new section</verify>
</task>

## Success Criteria

- `app/lib/server/index.ts` barrel export exists and typechecks
- All 6 server utilities have unit tests that pass
- `npm run test` passes with all new tests
- `npm run typecheck` passes
- `npm run lint` passes
- CLAUDE.md documents the deep module pattern for building features
- Zero changes to existing source code (tests + docs only, plus 1 new barrel file)
