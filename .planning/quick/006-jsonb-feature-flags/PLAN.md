---
type: quick
task_number: "006"
task_slug: jsonb-feature-flags
created: 2026-02-23T00:00:00Z
files_modified:
  - /Users/webstantly/DEV/templates/saas-starter/app/lib/db/schema.ts
  - /Users/webstantly/DEV/templates/saas-starter/app/lib/server/features.ts
  - /Users/webstantly/DEV/templates/saas-starter/app/lib/server/config.ts
  - /Users/webstantly/DEV/templates/saas-starter/CLAUDE.md
autonomous: true
---

# Quick Task 006: Feature Flags + JSONB Config Infrastructure

> Add a feature_flags table, a JSONB-first app_config table, and typed server utilities for both. Every future project cloned from this starter gets flexible config out of the box.

## Context

- Project: `/Users/webstantly/DEV/templates/saas-starter`
- Stack: React Router 7, Supabase Auth, Drizzle ORM, Zod 4, Biome
- Current schema: empty placeholder in `app/lib/db/schema.ts`
- No `app/lib/server/` directory exists yet — create it
- Zod is already in package.json (`^4.3.6`) but unused
- Drizzle supports JSONB via `jsonb()` from `drizzle-orm/pg-core`

## Design Decisions

### Feature Flags Table

- Simple boolean `enabled` + JSONB `metadata` for per-org overrides
- Metadata structure: `{ orgs?: Record<string, boolean> }` for targeted rollout
- Global flag first, org-level override second (checked in `isEnabled()`)

### App Config Table (JSONB-first)

- Scoped key-value store: scope + key → JSONB value
- Scope convention: `"global"`, `"org:{orgId}"`, `"user:{userId}"`
- Cascading resolution: user → org → global (most specific wins)
- Every value validated at runtime with Zod — no raw `unknown` escapes

## Boundaries

- Do NOT add UI components (admin panel, settings page) — that's project-specific
- Do NOT add seed data — templates ship empty
- Do NOT modify existing auth or route files
- Keep the schema clean — only these two tables

## Tasks

<task type="auto">
  <name>Add feature_flags and app_config tables to schema</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/app/lib/db/schema.ts</files>
  <action>
    Replace the placeholder schema with two tables:

    **feature_flags table:**
    - `id` serial primary key
    - `key` text, not null, unique — the flag identifier (e.g. "beta-dashboard")
    - `enabled` boolean, not null, default false — global toggle
    - `description` text, nullable — human-readable purpose
    - `metadata` jsonb, typed as `Record<string, unknown>`, default `{}`
    - `created_at` timestamp with timezone, not null, default now
    - `updated_at` timestamp with timezone, not null, default now

    **app_config table:**
    - `id` serial primary key
    - `scope` text, not null — scoping key (e.g. "global", "org:abc123")
    - `key` text, not null — config key (e.g. "theme", "billing.plan")
    - `value` jsonb, typed as `unknown`, not null, default `{}`
    - `created_at` timestamp with timezone, not null, default now
    - `updated_at` timestamp with timezone, not null, default now
    - Unique constraint on (scope, key)

    Import from `drizzle-orm/pg-core`: pgTable, serial, text, boolean, jsonb, timestamp, unique

  </action>
  <verify>
    `npm run typecheck` passes. Schema exports both tables.
  </verify>
  <done>Schema has feature_flags and app_config tables with JSONB columns</done>
</task>

<task type="auto">
  <name>Create feature flag server utility</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/app/lib/server/features.ts</files>
  <action>
    Create `app/lib/server/` directory and `features.ts` with:

    **`isEnabled(db, flagKey, options?)`**
    - Takes DB instance, flag key string, optional `{ orgId?: string }`
    - Resolution: check metadata.orgs[orgId] first (if orgId provided), then global `enabled`
    - Returns false if flag doesn't exist
    - Uses `eq()` from drizzle-orm for queries

    **`getEnabledFlags(db, options?)`**
    - Returns `Set<string>` of all enabled flag keys
    - Respects org-level overrides (exclude flags disabled for the org)
    - Useful for passing flag set to client or batch-checking

    Type the DB parameter as `PostgresJsDatabase<typeof schema>` from drizzle-orm/postgres-js

  </action>
  <verify>
    `npm run typecheck` passes. File exports both functions.
  </verify>
  <done>Feature flag utility with isEnabled() and getEnabledFlags()</done>
</task>

<task type="auto">
  <name>Create JSONB config server utility</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/app/lib/server/config.ts</files>
  <action>
    Create `config.ts` with four functions:

    **`getConfig<T>(db, scope, key, zodSchema)`**
    - Query app_config by scope + key
    - Validate value with Zod schema via `safeParse()`
    - Return typed T or null (if not found or validation fails)

    **`getConfigCascade<T>(db, key, zodSchema, scopes[])`**
    - Check scopes in order (most specific first)
    - Example: `getConfigCascade(db, "theme", ThemeSchema, ["user:abc", "org:xyz", "global"])`
    - Return first valid match, or null

    **`setConfig(db, scope, key, value)`**
    - Upsert: check existing by scope+key, update if exists, insert if not
    - Set updatedAt on update

    **`deleteConfig(db, scope, key)`**
    - Delete by scope + key

    Use `and()`, `eq()` from drizzle-orm. Type Zod schemas as `z.ZodType<T>`.

  </action>
  <verify>
    `npm run typecheck` passes. File exports all four functions.
  </verify>
  <done>JSONB config utility with cascading scope resolution and Zod validation</done>
</task>

<task type="auto">
  <name>Update CLAUDE.md to document new patterns</name>
  <files>/Users/webstantly/DEV/templates/saas-starter/CLAUDE.md</files>
  <action>
    Add a new section after "## Auth" called "## Server Utilities":

    ```markdown
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
    ```

    Also update the Structure section to include `server/` under `lib/`:
    ```
    lib/
      db/              Drizzle ORM client + schema
      server/          Server utilities (features, config)
      supabase/        Supabase clients
    ```

  </action>
  <verify>
    CLAUDE.md contains the new documentation sections.
  </verify>
  <done>CLAUDE.md documents feature flags and config patterns</done>
</task>

<task type="auto">
  <name>Run all checks and commit</name>
  <files>all modified files</files>
  <action>
    1. Run `npm run lint` — must pass (Biome)
    2. Run `npm run typecheck` — must pass
    3. Run `npm run test` — must pass
    4. Stage specific files:
       - `app/lib/db/schema.ts`
       - `app/lib/server/features.ts`
       - `app/lib/server/config.ts`
       - `CLAUDE.md`
    5. Commit: `feat: add feature flags and JSONB config infrastructure`
    6. Push to remote
  </action>
  <verify>
    All checks pass. Commit exists in git log.
  </verify>
  <done>All checks green, committed and pushed</done>
</task>

## Success Criteria

- `feature_flags` table with JSONB metadata for per-org overrides
- `app_config` table with scoped JSONB storage and unique(scope, key)
- `isEnabled()` with global + org-level resolution
- `getConfig()` with Zod validation at runtime
- `getConfigCascade()` for user → org → global fallback
- `setConfig()` / `deleteConfig()` for CRUD
- CLAUDE.md documents both patterns
- All lint/typecheck/test checks pass
