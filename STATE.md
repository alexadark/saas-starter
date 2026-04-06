# State - test-riff-saas

## Current Position

- **Phase**: 1 - Starter Audit Fixes
- **Status**: DONE (verified PASS, 19/19 artifacts)
- **Branch**: riff/phase-1-audit-fixes (ready for PR + merge)

## Active Decisions

- taste.md uses SignalFinder 2 reference (14 rules + hexagonal arch)
- Testing strategy: Epic Stack / Kent C. Dodds Testing Trophy
- Full test automation: per-edit, per-commit, per-phase
- Only db:push remains manual (destructive)
- Server Supabase client uses SUPABASE_SECRET_KEY
- DB connection is lazy (Proxy pattern)
- CSRF on all auth routes (cookie double-submit)
- Zod validation on signup + reset-password
- APP_NAME constant for brand name

## Blockers

- No `.env` configured (E2E tests will be skipped until configured)
- Database schema not pushed
- Pre-existing TS2307 errors for React Router generated types (need `npm run dev` to generate `+types/`)
- Pre-existing Biome a11y error in dialog.tsx (shadcn SVG without title)

## Next Action

Create PR for phase 1, merge to main. No more phases in ROADMAP - project is ready for feature work.
