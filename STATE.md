# State - test-riff-saas

## Current Position

- **Phase**: 0 - Starter Template Hardening
- **Status**: Done (pending verification)
- **Last action**: All 14 tasks executed, 50 tests passing

## Active Decisions

- taste.md uses SignalFinder 2 reference (14 rules + hexagonal arch)
- Testing strategy: Epic Stack / Kent C. Dodds Testing Trophy (updated in taste.md)
- Full test automation: per-edit (test-gate.sh), per-commit (security-scan.sh), per-phase (verifier Level 4-5)
- Only db:push remains manual (destructive)
- IP extraction: x-real-ip > last x-forwarded-for > "unknown"
- Rate limits: login=10/min, signup=5/min, forgot-password=5/min

## Blockers

- No `.env` configured (E2E tests will be skipped until configured)
- Database schema not pushed
- Pre-existing TS2307 errors for React Router generated types (need `npm run dev` to generate `+types/`)

## Next Action

Run verification for phase 0, then proceed to next phase.
