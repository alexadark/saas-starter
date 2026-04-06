# Risks

## Critical

### R1: No .env configured

- **Impact**: Project cannot run locally without Supabase credentials
- **Action**: Copy `.env.example` -> `.env`, fill with Supabase project values
- **Blocks**: Dev server, DB push, E2E tests

### R2: Database not initialized

- **Impact**: Schema defined but never pushed to Supabase
- **Action**: Run `npm run db:push` after configuring DATABASE_URL
- **Blocks**: Any feature using feature_flags or app_config tables

## Medium

### R3: Dependency version gaps

- **Details**:
  - React Router 7.12.0 -> 7.14.0 available
  - Supabase SSR 0.8.0 -> 0.10.0 available
  - Lucide React 0.574.0 -> 1.7.0 (major version gap)
- **Action**: Test upgrades incrementally, Lucide 1.x may have breaking changes

### R4: Incomplete test coverage

- **Details**:
  - Server utilities: well tested (6 test files)
  - UI components: no unit tests or stories written yet
  - E2E: stubs exist but need Supabase credentials to run
  - MSW handlers: empty (test/mocks/handlers.ts)
- **Action**: Add component tests + stories as features are built

## Low

### R5: Logger and events tests incomplete

- **Details**: Test file structure exists but bodies may be thin
- **Action**: Flesh out when touching these modules

### R6: No RLS policies verified

- **Details**: Supabase RLS should be configured for feature_flags and app_config
- **Action**: Verify in Supabase dashboard before production use
