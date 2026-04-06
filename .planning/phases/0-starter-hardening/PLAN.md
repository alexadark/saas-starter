# PLAN: Phase 0 - Starter Template Hardening

> Goal: Fix all security issues and wire up full test automation so RIFF's build loop catches everything automatically.

## Context

This is the starter template used to test the RIFF framework. Before building any features, we need the foundation to be solid: security fixes, automated test gates at every level, and the verifier/planner agents updated to actually run tests.

**Read before executing:**

- `taste.md` (full file - this is the reference)
- `.claude/settings.json` (current hooks)
- `.claude/agents/riff/verifier.md`
- `.claude/agents/riff/planner.md`
- `.claude/agents/riff/executor.md`
- `.claude/hooks/riff/security-scan.sh`
- All files in `app/routes/auth/`
- `app/lib/server/rate-limit.ts`
- `app/lib/db/index.ts`

## Wave 1: Security Fixes (4 critical, 2 important)

### Task 1.1: Fix OAuth callback error handling

**Boundary:** `app/routes/auth/callback.tsx`

**What:** The callback always redirects to `/dashboard` even if `code` is missing or `exchangeCodeForSession` fails.

**Fix:**

- If no `code` param: redirect to `/auth/login`
- If `exchangeCodeForSession` returns error: redirect to `/auth/login?error=invalid_callback`
- Only redirect to `/dashboard` on success

**AC:**

- [ ] No-code request to `/auth/callback` redirects to `/auth/login`
- [ ] Failed code exchange redirects to `/auth/login?error=invalid_callback`
- [ ] Successful exchange redirects to `/dashboard`

### Task 1.2: Add loader to reset-password route

**Boundary:** `app/routes/auth/reset-password.tsx`

**What:** No server-side check that user has a valid recovery session before rendering the form.

**Fix:** Add a loader that calls `supabase.auth.getUser()`. If no user, redirect to `/auth/forgot-password`.

**AC:**

- [ ] Direct navigation to `/auth/reset-password` without recovery session redirects to `/auth/forgot-password`
- [ ] With valid recovery session, form renders normally

### Task 1.3: Apply rate limiting to all auth routes

**Boundary:** `app/routes/auth/login.tsx`, `app/routes/auth/signup.tsx`, `app/routes/auth/forgot-password.tsx`

**What:** `createRateLimiter` exists but is not used on any auth endpoint.

**Fix:** Add rate limiter to each auth action:

- Login: 10 req/min
- Signup: 5 req/min
- Forgot password: 5 req/min

Import from `~/lib/server` (barrel export). Use `getRateLimitHeaders` for 429 responses.

**AC:**

- [ ] Each auth action checks rate limit before processing
- [ ] 429 response returned when limit exceeded with proper headers
- [ ] Different limits per route (login=10, signup=5, forgot-password=5)

### Task 1.4: Fix IP spoofing in rate limiter

**Boundary:** `app/lib/server/rate-limit.ts`, `app/lib/server/__tests__/rate-limit.test.ts`

**What:** `extractIp` takes first value of `x-forwarded-for`, which is attacker-controlled on Vercel. Should prefer `x-real-ip` (set by Vercel, not spoofable).

**Fix:**

1. Check `x-real-ip` first
2. Fall back to last value of `x-forwarded-for` (not first)
3. Fall back to `"unknown"`
4. Update existing tests + add test for the new priority order

**AC:**

- [ ] `x-real-ip` header is checked first
- [ ] `x-forwarded-for` uses last value, not first
- [ ] Tests updated and passing

### Task 1.5: Add security headers via vercel.json

**Boundary:** `vercel.json` (new file)

**What:** Zero security headers anywhere.

**Fix:** Create `vercel.json` with headers for all routes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**AC:**

- [ ] `vercel.json` exists with security headers
- [ ] Headers apply to all routes (`/(.*)`)

### Task 1.6: Fix DB pool config for pgBouncer

**Boundary:** `app/lib/db/index.ts`

**What:** Missing `max: 1` and `prepare: false` required for Supabase transaction pooler (pgBouncer).

**Fix:** Add options to `postgres()` call.

**AC:**

- [ ] `postgres(url, { max: 1, prepare: false })` in db/index.ts

---

## Wave 2: Test Automation Hooks

### Task 2.1: Create test-gate.sh (PostToolUse hook)

**Boundary:** `.claude/hooks/riff/test-gate.sh` (new file)

**What:** Run related tests after every .ts/.tsx file edit.

**Implementation:**

```bash
#!/bin/bash
# Run vitest on related tests after .ts/.tsx edits
FILE_PATH="$1"

# Only for .ts/.tsx files (not config, not test files themselves)
if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then exit 0; fi
if [[ "$FILE_PATH" =~ \.(test|spec|config|setup)\. ]]; then exit 0; fi
if [[ "$FILE_PATH" =~ (\.stories\.) ]]; then exit 0; fi

# Check if vitest is available and node_modules exists
if [ ! -d "node_modules" ]; then exit 0; fi

# Run only related tests (fast)
OUTPUT=$(npx vitest run --related "$FILE_PATH" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "RIFF Test Gate: failing tests related to modified file:"
  echo "$OUTPUT" | tail -20
fi

exit 0  # Don't block, just inform
```

**AC:**

- [ ] Script exists and is executable
- [ ] Only triggers on .ts/.tsx files (not test/config/stories)
- [ ] Runs `vitest run --related` (fast, targeted)
- [ ] Doesn't block on failure (informational)

### Task 2.2: Add full test suite to pre-commit

**Boundary:** `.claude/hooks/riff/security-scan.sh`

**What:** Add `vitest run` to the pre-commit security scan. If tests fail, block the commit.

**Implementation:** Add a new check section before the final verdict:

```bash
# Check 7: Tests pass
echo -n "  Running test suite... "
TEST_OUTPUT=$(npx vitest run 2>&1)
TEST_EXIT=$?
if [ $TEST_EXIT -ne 0 ]; then
  echo ""
  echo -e "  ${RED}BLOCKED: Tests failing${NC}"
  echo "$TEST_OUTPUT" | tail -10
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "OK"
fi
```

**AC:**

- [ ] `vitest run` executes as part of pre-commit
- [ ] Failing tests block the commit (ISSUES_FOUND incremented)
- [ ] Output shows last 10 lines of test failure

### Task 2.3: Wire test-gate.sh into settings.json

**Boundary:** `.claude/settings.json`

**What:** Add the test-gate hook to PostToolUse alongside existing typecheck and lint gates.

**AC:**

- [ ] `test-gate.sh` is in PostToolUse hooks for Edit|Write matcher
- [ ] Existing hooks (boundary-check, typecheck-gate, lint-gate) unchanged

---

## Wave 3: Verifier + Planner Agent Updates

### Task 3.1: Update verifier to run actual tests

**Boundary:** `.claude/agents/riff/verifier.md`

**What:** The verifier currently does static code review only. Update it to actually execute tests and detect what needs human attention.

**Add after Level 3 (WIRED):**

```markdown
### Level 4: TESTS PASS

Run the full test suite and capture real output:

1. `npm run test` (Vitest) - capture output as evidence
2. `npm run typecheck` - capture output
3. `npm run lint` - capture output
4. If ANY test file was created/modified: verify tests actually run (not just exist)
5. Evidence: paste actual command output, not "tests pass"

### Level 5: AUTOMATION CHECKS

Detect what needs attention and act accordingly:

1. **New components without stories**: Search for `.tsx` files in `app/components/` created in this phase that have no matching `.stories.tsx`. If found: log as FAIL finding.
2. **Schema changes**: If `app/lib/db/schema.ts` was modified, notify via Telegram: "Schema changed in phase N - run `npm run db:push` when ready". Use: `curl -s -X POST "https://n8n.cutzai.com/webhook/claude-telegram-alert" -H "Content-Type: application/json" -d '{"message": "..."}'`
3. **E2E tests**: If any route file in `app/routes/` was modified, run `npx playwright test` and capture output. If `.env` is missing, skip with note.
4. **Storybook build**: If any component in `app/components/` was modified or created, run `npx storybook build --test` to verify stories compile. If it fails, log as FAIL finding.
```

**Also update the Verdicts section** to include test results and notification actions.

**AC:**

- [ ] Verifier runs `npm run test`, `npm run typecheck`, `npm run lint`
- [ ] Verifier runs `npx playwright test` when route files changed (if .env exists)
- [ ] Verifier runs `npx storybook build --test` when components changed
- [ ] Verifier sends Telegram notification for schema changes only
- [ ] Missing stories on new components = FAIL finding

### Task 3.2: Update planner to auto-include test acceptance criteria

**Boundary:** `.claude/agents/riff/planner.md`

**Add to the "Security Awareness" section (rename to "Automatic Checks"):**

```markdown
## Automatic Checks (included in EVERY plan)

For EVERY plan, the planner MUST add these acceptance criteria automatically:

- **New backend service/utility** → AC includes: "Tests exist in `__tests__/` and pass"
- **New component** → AC includes: "`.stories.tsx` file exists with Default + DarkMode variants"
- **New route** → AC includes: "E2E test covers the happy path"
- **Schema change** → AC includes: "Migration note added to SUMMARY.md"
- **Auth-related change** → AC includes: "Rate limiting applied, auth check in loader"
- **Any code change** → AC includes: "All existing tests still pass (`npm run test`)"

These are non-negotiable. The verifier will check them.
```

**AC:**

- [ ] Planner auto-includes test/stories ACs based on artifact type
- [ ] Existing Security Awareness section preserved (merged into broader "Automatic Checks")

### Task 3.3: Update taste.md testing section

**Boundary:** `taste.md`

**What:** Replace current Testing section with Epic Stack-inspired strategy.

**New content:**

```markdown
## Testing (Kent C. Dodds Testing Trophy)

- "Write tests. Not too many. Mostly integration."
- Target ~70% coverage focused on critical paths, not 100%
- Mock external APIs only (MSW) - never mock your own database
- E2E (Playwright) for route testing - don't unit test loaders/actions
- Unit tests only for complex business logic utilities
- No unit tests for simple presentational components
- Test user behavior (getByRole), not implementation (querySelector)
- Database tests: use PGLite or real test DB, not mocked Drizzle chains
- Per feature target: ~3-5 E2E, ~2-3 integration, unit only if complex logic
- passWithNoTests: false - every test file must have tests
- New components MUST have `.stories.tsx` (Default + DarkMode variants)
- New backend services MUST have `__tests__/*.test.ts`
```

**AC:**

- [ ] Testing section replaced with Epic Stack strategy
- [ ] No other sections modified

### Task 3.4: Fix vitest.config.ts

**Boundary:** `vitest.config.ts`

**What:** Remove `passWithNoTests: true`.

**AC:**

- [ ] `passWithNoTests` removed or set to `false`

---

## Wave 4: Notification Hook for Human Actions

### Task 4.1: Create notify-human.sh utility

**Boundary:** `.claude/hooks/riff/notify-human.sh` (new file)

**What:** A reusable script that sends a Telegram message via the existing n8n webhook.

```bash
#!/bin/bash
# RIFF Human Notification - sends Telegram alert via n8n
# Usage: bash notify-human.sh "Your message here"

MESSAGE="$1"
if [ -z "$MESSAGE" ]; then exit 0; fi

curl -s -X POST "https://n8n.cutzai.com/webhook/claude-telegram-alert" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$MESSAGE\"}" \
  > /dev/null 2>&1

exit 0
```

**AC:**

- [ ] Script exists and is executable
- [ ] Sends JSON payload with message field to n8n webhook
- [ ] Silent on success (no stdout noise)

---

## Commit Strategy

- Wave 1 (6 tasks): one commit per task, format `riff(phase-0/task-1.X): description`
- Wave 2 (3 tasks): one commit per task
- Wave 3 (4 tasks): one commit per task
- Wave 4 (1 task): one commit

Total: 14 atomic commits.

## Verification Criteria (for the verifier)

After all waves complete:

1. `npm run test` passes (including updated rate-limit tests)
2. `npm run typecheck` passes
3. `npm run lint` passes
4. All 4 auth security fixes in place (callback, reset-password, rate limiting, IP fix)
5. `vercel.json` exists with security headers
6. DB pool config correct
7. `test-gate.sh` exists and is executable
8. `security-scan.sh` includes test suite check
9. `settings.json` has test-gate hook wired
10. `verifier.md` includes Levels 4 and 5
11. `planner.md` includes automatic test ACs
12. `taste.md` has updated Testing section
13. `vitest.config.ts` has `passWithNoTests: false`
14. `notify-human.sh` exists and is executable
