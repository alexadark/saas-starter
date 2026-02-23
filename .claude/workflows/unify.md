# Unify Workflow — Reconcile Plan vs Actual

> This workflow is executed by `/lean:unify`.
> It reads acceptance criteria from PLAN.md files, verifies each AC against the actual
> codebase, and produces a UNIFY.md with a pass/fail table. Lightweight: not a ceremony.

---

## Step 1: Resolve Target Phase

### Load phase argument

```bash
PHASE_ARG="${1:-}"  # phase number from command args
```

**If no arg provided:** Read `./STATE.md` and extract current phase number.

**Construct phase path:**

```bash
PHASE_DIR=".planning/phases/{PHASE_NUMBER}-{PHASE_SLUG}"
```

If the directory doesn't exist, stop: "Phase directory not found. Check `/lean:status`."

---

## Step 2: Read Plans and Acceptance Criteria

```bash
ls "$PHASE_DIR"/*-PLAN.md 2>/dev/null
```

For each PLAN.md found, extract:

- The `<acceptance_criteria>` section (AC-1, AC-2, etc.)
- The plan's task `<done>` fields (to know what each task claimed to satisfy)

Also read corresponding SUMMARY.md files:

```bash
ls "$PHASE_DIR"/*-SUMMARY.md 2>/dev/null
```

Extract from each SUMMARY:

- What was actually built (files list)
- Any deviations logged

---

## Step 3: Verify Each AC Against the Codebase

For each AC found across all plans:

**AC states a file must exist:**

```bash
[ -f "path/to/file" ] && echo "PASS" || echo "FAIL"
```

**AC states a function/route/export must exist:**

```bash
grep -r "functionName\|/api/route\|export.*TypeName" src/ 2>/dev/null | head -3
```

**AC states a behavior (wiring):**

- Check the key connection, not just component existence
- e.g., "component fetches from API" → grep for fetch pattern in the component file

**AC states integration with external service:**

- Check config/env reference exists
- Mark as UNCERTAIN if cannot confirm without running the app

**Status per AC:**

- **PASS** — condition verifiably true in current codebase
- **FAIL** — condition cannot be confirmed
- **UNCERTAIN** — requires human verification

---

## Step 4: Build Deviations Summary

Compare what was planned vs what was built:

1. List files in each PLAN.md's `<boundaries> ## DO NOT CHANGE` — confirm none were touched
2. From SUMMARY.md deviations sections — collect auto-fixed issues (R1-R3) and escalations (R4)
3. Note anything built beyond plan scope (new files not in plan's `files_modified`)
4. Note deferred items (things discovered but explicitly not addressed)

---

## Step 5: Create {PHASE}-UNIFY.md

Write to `{PHASE_DIR}/{PHASE_NUMBER}-UNIFY.md`:

```markdown
---
phase: {PHASE_NUMBER}-{PHASE_NAME}
unified: {ISO_TIMESTAMP}
ac_verdict: passed | failed | human_needed
ac_score: N/M
---

# Phase {PHASE_NUMBER}: {PHASE_NAME} — Unify Report

**Unified:** {timestamp}

## Acceptance Criteria Results

| AC   | Plan      | Description      | Status              | Evidence           |
| ---- | --------- | ---------------- | ------------------- | ------------------ |
| AC-1 | {plan-id} | [criterion text] | PASS/FAIL/UNCERTAIN | [what was checked] |
| AC-2 | {plan-id} | [criterion text] | PASS/FAIL/UNCERTAIN | [what was checked] |

**Verdict:** {passed | failed | human_needed}
**Score:** {N}/{M} ACs passing

---

## Deviations

### Auto-fixed (R1-R3)

{list from SUMMARY.md deviations, or "None"}

### Escalations (R4)

{list from SUMMARY.md, or "None"}

### Scope additions (unplanned work)

{files built beyond plan's files_modified, or "None"}

---

## Deferred Items

{anything discovered but not addressed — parking lot for next plan}

---

## Verdict

{IF all ACs PASS}
**Phase {PHASE_NUMBER} is complete.** All acceptance criteria satisfied.
Next: `/lean:verify {PHASE_NUMBER}` to run deep verification.
{ELIF any AC FAIL}
**Phase {PHASE_NUMBER} has gaps.** The following ACs failed:

- AC-N: [description] — [reason it failed]

Next: `/lean:plan {PHASE_NUMBER}` to create a fix plan for the failing ACs.
{ELIF any AC UNCERTAIN}
**Human verification needed.** The following ACs need manual confirmation:

- AC-N: [description] — [what to check]

Confirm the above, then re-run `/lean:unify {PHASE_NUMBER}`.
{/IF}
```

---

## Step 6: Update STATE.md

Read `./STATE.md` and update:

- Add to the current phase record: `unify: {ac_verdict} ({N}/{M} ACs)`
- Update `Last Updated` timestamp
- If all ACs pass → phase status advances to `unified`

---

## Step 7: Display Results

```markdown
---

## Unify: Phase {PHASE_NUMBER} — {PHASE_NAME}

**AC Verdict:** {passed | failed | human_needed}
**Score:** {N}/{M} ACs

| AC | Description | Status |
|----|-------------|--------|
| AC-1 | [text] | PASS |
| AC-2 | [text] | FAIL |

{IF passed}
All ACs pass. Phase is reconciled.
Next: `/lean:verify {PHASE_NUMBER}`
{ELIF failed}
{N} AC(s) failed. Fix needed.
Next: `/lean:plan {PHASE_NUMBER}` (create a fix plan)
{ELIF human_needed}
Manual verification required for {N} AC(s). See UNIFY.md for details.
{/IF}

Report: `{PHASE_DIR}/{PHASE_NUMBER}-UNIFY.md`

---
```

---

_This is a lightweight reconciliation — not a ceremony._
_No blocking gates. UNIFY is optional but recommended after every build._
_Referenced by: `~/.claude/lean-gsd/commands/unify.md`_
