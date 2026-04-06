# SUMMARY: Phase 0 - Starter Template Hardening

## What Was Built

| Wave | Task | Artifact                                                                                         | Status |
| ---- | ---- | ------------------------------------------------------------------------------------------------ | ------ |
| 1    | 1.1  | `app/routes/auth/callback.tsx` - Fixed OAuth callback error handling                             | Done   |
| 1    | 1.2  | `app/routes/auth/reset-password.tsx` - Added loader with session check                           | Done   |
| 1    | 1.3  | `app/routes/auth/login.tsx`, `signup.tsx`, `forgot-password.tsx` - Rate limiting                 | Done   |
| 1    | 1.4  | `app/lib/server/rate-limit.ts` - Fixed IP spoofing (x-real-ip priority, last x-forwarded-for)    | Done   |
| 1    | 1.5  | `vercel.json` - Security headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) | Done   |
| 1    | 1.6  | `app/lib/db/index.ts` - pgBouncer config (max: 1, prepare: false)                                | Done   |
| 2    | 2.1  | `.claude/hooks/riff/test-gate.sh` - PostToolUse test runner                                      | Done   |
| 2    | 2.2  | `.claude/hooks/riff/security-scan.sh` - Added test suite to pre-commit                           | Done   |
| 2    | 2.3  | `.claude/settings.json` - Wired test-gate.sh hook                                                | Done   |
| 3    | 3.1  | `.claude/agents/riff/verifier.md` - Added Levels 4-5 (tests + automation)                        | Done   |
| 3    | 3.2  | `.claude/agents/riff/planner.md` - Auto test/story ACs                                           | Done   |
| 3    | 3.3  | `taste.md` - Updated Testing section (Kent C. Dodds Testing Trophy)                              | Done   |
| 3    | 3.4  | `vitest.config.ts` - passWithNoTests: false                                                      | Done   |
| 4    | 4.1  | `.claude/hooks/riff/notify-human.sh` - Telegram notification utility                             | Done   |

## Test Results

- **Vitest**: 50 tests pass (was 48, +2 new rate-limit IP tests)
- **TypeScript**: Pre-existing TS2307 errors for React Router generated types (need `npm run dev` to generate)
- **Biome**: All files formatted (auto-fixed by hook)

## Deviations

| Type | Description                                                  |
| ---- | ------------------------------------------------------------ |
| R2   | Added `npm install` step - node_modules was missing at start |

## Decisions

- Rate limit test for "prefers x-real-ip" uses distinct IPs across headers to prove bucket separation, rather than testing same IP in both headers
- Biome auto-formatter runs via PostToolUse hook, so all formatting is handled automatically
