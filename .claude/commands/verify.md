---
name: verify
description: Goal-backward verification of built work
allowed-tools:
  - Read
  - Bash
  - Task
  - Glob
  - Grep
---

# /lean:verify — Phase Verification

Accepts args: `[phase-number] [--review]`

- `phase-number` (optional) — which phase to verify. If omitted, resolves from STATE.md current position.
- `--review` (optional) — EA pattern: compare PLAN.md tasks against SUMMARY.md outcomes for drift detection.

---

## Step 1: Resolve Target Phase

```bash
# If phase-number provided, use it directly
# Otherwise, read STATE.md for current position
```

1. If a phase number was provided as argument, use that.
2. If no argument, read `./STATE.md` and extract the current phase number.
3. Determine the phase directory:
   ```bash
   PHASE_DIR=$(ls -d .planning/phases/${PHASE_NUM}-* 2>/dev/null | head -1)
   ```
4. If no phase directory found, report error and suggest `/lean:plan` first.

---

## Step 2: Collect Plan Files

```bash
ls "$PHASE_DIR"/*-PLAN.md 2>/dev/null
ls "$PHASE_DIR"/*-SUMMARY.md 2>/dev/null
```

Collect all PLAN.md files for the target phase. These are the inputs for the verifier agent.

If no PLAN.md files exist, report that the phase has not been planned yet and suggest `/lean:plan [phase]`.

---

## Step 3: Spawn Verifier Agent

Spawn the `lean-verifier` agent via the Task tool:

```
Task:
  description: "Verify Phase ${PHASE_NUM}: ${PHASE_NAME}"
  prompt: |
    You are the lean-verifier agent.
    @~/.claude/lean-gsd/agents/lean-verifier.md

    ## Phase to Verify

    Phase directory: ${PHASE_DIR}

    ## Plan Files

    ${LIST_OF_PLAN_PATHS}

    ## Instructions

    Perform full goal-backward verification on this phase:
    1. Check for previous VERIFICATION.md (re-verification mode if found)
    2. Load all PLAN.md files and extract phase goals
    3. Establish must-haves (from frontmatter or derived)
    4. Run three-level artifact verification (exists, substantive, wired)
    5. Check key links and run stub detection
    6. Verify observable truths
    7. Create VERIFICATION.md in the phase directory

    Return the verification status and summary when complete.
```

---

## Step 4: Display Results

After the verifier agent completes:

1. Read the generated `${PHASE_DIR}/${PHASE_NUM}-VERIFICATION.md`
2. Display the verification summary:

```markdown
---

## Verification Results

**Phase:** ${PHASE_NUM} — ${PHASE_NAME}
**Status:** ${STATUS}
**Score:** ${SCORE}

### Must-Haves
| # | Truth | Status |
|---|-------|--------|
${TRUTHS_TABLE}

### Artifacts
| Artifact | Exists | Substantive | Wired | Status |
|----------|--------|-------------|-------|--------|
${ARTIFACTS_TABLE}

### Key Links
| From | To | Status |
|------|-----|--------|
${KEY_LINKS_TABLE}

---
```

3. If `status: gaps_found`:
   - List the gaps clearly
   - Suggest: "Run `/lean:plan ${PHASE_NUM} --gaps` to create fix plans for the gaps found."

4. If `status: passed`:
   - Congratulate and suggest moving to the next phase or running `/lean:build` for the next phase.

5. If `status: human_needed`:
   - List items requiring human verification with specific instructions.

---

## Step 5: Review Mode (--review flag)

If the `--review` flag was provided, perform drift detection AFTER the standard verification:

For each plan in the phase:

1. Read the PLAN.md — extract task names, files, actions, done criteria
2. Read the corresponding SUMMARY.md — extract accomplishments, deviations, files modified
3. Compare side-by-side:

```markdown
### Plan vs Outcome: ${PLAN_ID}

| Aspect     | Planned          | Actual             | Drift                |
| ---------- | ---------------- | ------------------ | -------------------- |
| Tasks      | ${PLANNED_TASKS} | ${COMPLETED_TASKS} | ${DRIFT_OR_MATCH}    |
| Files      | ${PLANNED_FILES} | ${ACTUAL_FILES}    | ${DRIFT_OR_MATCH}    |
| Deviations | 0                | ${DEVIATION_COUNT} | ${DEVIATION_SUMMARY} |
```

4. Highlight significant drift:
   - Tasks that were planned but not completed
   - Tasks that were added but not in the plan
   - Files modified that were not in the plan's `files_modified`
   - Deviations that changed the plan's intent

5. Display overall drift assessment:

```markdown
### Drift Summary

**Plans reviewed:** ${PLAN_COUNT}
**Plans with drift:** ${DRIFT_COUNT}
**Significant drift:** ${SIGNIFICANT_DRIFT_LIST}

**Assessment:** ${OVERALL_DRIFT_ASSESSMENT}
```

---

_This command spawns the `lean-verifier` agent for goal-backward verification._
_The `--review` flag adds plan-vs-outcome drift detection._
_Referenced by: `~/.claude/lean-gsd/commands/verify.md`_
