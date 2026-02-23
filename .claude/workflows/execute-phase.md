# Execute Phase Workflow — Wave-Based Parallel Execution

> This workflow is executed by `/lean:build`.
> It discovers PLAN.md files, groups them into waves, spawns `lean-executor` agents in parallel,
> monitors progress, handles checkpoints, and updates project state on completion.
> This is the core execution engine of the Lean GSD framework.

---

## Prerequisites

Agent definitions:

- @~/.claude/lean-gsd/agents/lean-executor.md — the executor agent prompt
- @~/.claude/lean-gsd/agents/lean-verifier.md — the verifier agent prompt (optional post-execution)

Templates:

- @~/.claude/lean-gsd/templates/summary.md — SUMMARY.md template (used by executors)
- @~/.claude/lean-gsd/templates/session.md — session snapshot template
- @~/.claude/lean-gsd/templates/state.md — STATE.md template

---

## Step 1: Load Project State and Resolve Target Phase

### Load Core Files

```bash
cat ./PROJECT.md
cat ./ROADMAP.md
cat ./STATE.md
cat .planning/config.json 2>/dev/null
```

**Extract:**

- Project name
- All phase definitions and statuses from ROADMAP.md
- Current position from STATE.md
- Config preferences (especially `auto_verify` and `auto_commit`)

**Fail fast:** If PROJECT.md or ROADMAP.md do not exist, stop and tell the user to run `/lean:start` first.

### Resolve Target Phase

**If phase-number was provided as argument:** Use that phase number.

**If phase-number was NOT provided:** Derive from STATE.md:

1. If STATE.md status is "Planned" — use that phase (ready to execute)
2. If STATE.md status is "In Progress" — use that phase (resume execution)
3. Otherwise, find the first phase in ROADMAP.md with status "planned" or "in progress"
4. If no planned phases exist, tell the user: "No planned phases found. Run `/lean:plan` first."

### Construct Phase Path

```bash
PHASE_DIR=".planning/phases/{PHASE_NUMBER}-{PHASE_SLUG}"
```

**Validate the phase directory exists:**

```bash
ls "$PHASE_DIR" 2>/dev/null
```

If missing, stop: "Phase directory not found. Run `/lean:plan {PHASE_NUMBER}` first."

---

## Step 2: Discover and Parse Plan Files

### Find All Plans for Target Phase

```bash
ls "$PHASE_DIR"/*-PLAN.md 2>/dev/null
```

**If no PLAN.md files found:** Stop and tell the user to run `/lean:plan {PHASE_NUMBER}` first.

### Parse Each Plan's Frontmatter

For each PLAN.md file, extract from YAML frontmatter:

- `plan` — plan number
- `wave` — wave assignment (1, 2, 3...)
- `depends_on` — list of plan IDs this plan requires
- `files_modified` — files this plan touches
- `autonomous` — true/false (whether plan has checkpoints)

Build the plan registry:

```
PLANS = []
for each PLAN_FILE in $PHASE_DIR/*-PLAN.md:
  parse frontmatter
  PLANS.append({
    id: "{phase}-{plan_number}",
    file: PLAN_FILE,
    wave: wave_number,
    depends_on: [dep_ids],
    files_modified: [file_paths],
    autonomous: true/false,
    status: "pending"
  })
```

### Group Plans by Wave

```
WAVES = {}
for each plan in PLANS:
  if plan.wave not in WAVES:
    WAVES[plan.wave] = []
  WAVES[plan.wave].append(plan)

WAVE_ORDER = sorted(WAVES.keys())  # [1, 2, 3, ...]
```

### Display Execution Plan

```markdown
## Execution Plan

**Phase:** {PHASE_NUMBER} — {PHASE_NAME}
**Plans:** {TOTAL_PLANS} in {TOTAL_WAVES} wave(s)

| Wave | Plans      | Autonomous | Dependencies |
| ---- | ---------- | ---------- | ------------ |
| 1    | {plan-ids} | {yes/no}   | none         |
| 2    | {plan-ids} | {yes/no}   | {dep-ids}    |
```

### Record Execution Start Time

```bash
EXEC_START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EXEC_START_EPOCH=$(date +%s)
```

---

## Step 3: Wave Execution Loop

Process waves in order. Within each wave, spawn executors in parallel.

```
for CURRENT_WAVE in WAVE_ORDER:
  plans_in_wave = WAVES[CURRENT_WAVE]

  ## 3a: Pre-Wave Validation
  ## 3b: Spawn Executors in Parallel
  ## 3c: Monitor Execution
  ## 3d: Post-Wave Spot-Check
  ## 3e: Advance to Next Wave
```

### Step 3a: Pre-Wave Validation

Before spawning any executors for this wave, verify all dependencies are satisfied:

```
for each plan in plans_in_wave:
  for each dep_id in plan.depends_on:
    dep_plan = find_plan_by_id(dep_id)
    if dep_plan.status != "completed":
      ABORT: "Cannot start wave {CURRENT_WAVE}: dependency {dep_id} is not complete (status: {dep_plan.status})"
```

Also collect SUMMARY paths from completed dependencies — these are passed to executors:

```
for each plan in plans_in_wave:
  DEPENDENCY_SUMMARIES = []
  for each dep_id in plan.depends_on:
    summary_path = find_summary_for_plan(dep_id)  # {PHASE_DIR}/{dep_id}-SUMMARY.md
    if summary_path exists:
      DEPENDENCY_SUMMARIES.append(summary_path)
```

### Step 3b: Spawn Executors in Parallel

For each plan in the current wave, spawn a `lean-executor` agent using the Task tool with `run_in_background: true`.

**Spawn ALL executors in the wave simultaneously:**

```
TASK_HANDLES = []

for each plan in plans_in_wave:

  handle = Task(run_in_background: true):
    description: "Execute {plan.id}"
    prompt: |
      You are the lean-executor agent.
      @~/.claude/lean-gsd/agents/lean-executor.md

      ## Assignment

      Execute the following plan completely.

      **Plan file:** `{plan.file}`

      Read the plan file above. It contains:
      - Frontmatter with phase, plan, wave, dependencies, must_haves
      - Context section with @file references to read
      - Tasks in XML format with files, action, verify, done
      - Verification and success criteria sections

      {IF DEPENDENCY_SUMMARIES}
      ## Prior Plan Summaries (from dependencies)

      These plans completed before yours. Read them for context on what was
      already built, patterns established, and decisions made:
      {FOR EACH SUMMARY_PATH}
      - `{SUMMARY_PATH}`
      {/FOR}
      {/IF}

      ## Instructions

      1. Read the plan file
      2. Record start time
      3. Auto-detect test framework
      4. Determine execution pattern (autonomous vs checkpoint)
      5. Execute each task:
         - Implement the work described in <action>
         - Run the <verify> check
         - Confirm the <done> criteria
         - Commit the task atomically (never `git add .`)
         - Track the commit hash
      6. Apply deviation rules automatically (R1-R3 auto-fix, R4 stop)
      7. If checkpoint task encountered: STOP and return CHECKPOINT REACHED
      8. After all tasks: create SUMMARY.md, run self-check, final commit
      9. Return PLAN COMPLETE with all commit hashes

      ## Output Location

      Write SUMMARY.md to: `{PHASE_DIR}/{plan.id}-SUMMARY.md`

  TASK_HANDLES.append({plan_id: plan.id, handle: handle})
```

### Step 3c: Monitor Execution

Wait for all executor agents in the current wave to complete.

```
COMPLETED = []
CHECKPOINTED = []
FAILED = []

for each {plan_id, handle} in TASK_HANDLES:
  result = wait_for(handle)  # TaskOutput

  if result contains "## PLAN COMPLETE":
    plan.status = "completed"
    COMPLETED.append(plan_id)

  elif result contains "## CHECKPOINT REACHED":
    plan.status = "checkpointed"
    CHECKPOINTED.append({plan_id: plan_id, checkpoint: parse_checkpoint(result)})

  else:
    plan.status = "failed"
    FAILED.append({plan_id: plan_id, error: result})
```

### Step 3c-1: Handle Checkpoints

If any executors returned a checkpoint, handle them one at a time:

```
for each {plan_id, checkpoint} in CHECKPOINTED:

  ## Display checkpoint to user
  Display the full checkpoint message:
  - Type (human-verify | decision | human-action)
  - Plan ID and progress
  - Completed tasks with commits
  - Current task status and blocker
  - What the user needs to do

  ## Wait for user response
  Prompt the user for their input based on checkpoint type:

  **For checkpoint:human-verify:**
  Ask the user to verify and report back (pass/fail/notes).

  **For checkpoint:decision:**
  Present the options from the checkpoint and ask the user to choose.

  **For checkpoint:human-action:**
  Tell the user the manual action required and wait for confirmation.

  ## Resume the executor as a continuation agent
  Once the user responds, spawn a NEW executor agent as a continuation:

  Task:
    description: "Resume {plan_id} after checkpoint"
    prompt: |
      You are the lean-executor agent (continuation).
      @~/.claude/lean-gsd/agents/lean-executor.md

      ## Continuation Context

      You are resuming execution of a plan that was paused at a checkpoint.

      **Plan file:** `{plan.file}`

      <completed_tasks>
      {LIST_OF_COMPLETED_TASKS_WITH_COMMIT_HASHES}
      </completed_tasks>

      **Resume from:** Task {NEXT_TASK_NUMBER}

      **Checkpoint type:** {checkpoint.type}
      **User response:** {USER_RESPONSE}

      ## Instructions

      1. Verify previous commits exist: `git log --oneline -5`
      2. DO NOT redo completed tasks
      3. Resume from Task {NEXT_TASK_NUMBER}
      {IF checkpoint.type == "human-action"}
      4. Verify the manual action was successful before continuing
      {ELIF checkpoint.type == "decision"}
      4. Implement the user's selected option: {SELECTED_OPTION}
      {ELIF checkpoint.type == "human-verify"}
      4. Continue with the next task
      {/IF}
      5. Complete remaining tasks, create SUMMARY.md, self-check, final commit
      6. Return PLAN COMPLETE with ALL commits (previous + new)

  Wait for the continuation agent to complete.
  Update the plan status based on the result (may checkpoint again — handle recursively).
```

### Step 3c-2: Handle Failures

If any executors failed:

```
for each {plan_id, error} in FAILED:
  Display the failure to the user:
  "Plan {plan_id} failed: {error}"
  "You can retry with `/lean:build {PHASE_NUMBER}` after addressing the issue."

  ## Determine impact on remaining waves
  Check if any plans in later waves depend on the failed plan.
  If yes, those plans cannot execute — mark them as "blocked".
  If no, later waves can proceed without the failed plan.
```

### Step 3d: Post-Wave Spot-Check

After all executors in the wave have completed (or been handled), verify the output:

```bash
# For each completed plan in this wave:
for PLAN_ID in {COMPLETED_PLAN_IDS}; do
  SUMMARY_FILE="$PHASE_DIR/${PLAN_ID}-SUMMARY.md"

  # Check SUMMARY.md exists
  if [ -f "$SUMMARY_FILE" ]; then
    echo "FOUND: $SUMMARY_FILE"
  else
    echo "MISSING: $SUMMARY_FILE"
  fi

  # Check for self-check result
  grep -q "Self-Check: PASSED" "$SUMMARY_FILE" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "SELF-CHECK: PASSED for $PLAN_ID"
  else
    echo "SELF-CHECK: NOT PASSED for $PLAN_ID"
  fi
done
```

**If any SUMMARY.md is missing or self-check is not PASSED:**

- Report to the user: "Plan {plan_id} completed but SUMMARY verification failed."
- Do NOT block subsequent waves — this is informational.

### Step 3e: Display Wave Results and Advance

```markdown
### Wave {CURRENT_WAVE} Complete

| Plan      | Status    | Tasks   | Commits        | Self-Check |
| --------- | --------- | ------- | -------------- | ---------- |
| {plan_id} | completed | {N}/{N} | {commit_count} | PASSED     |
| {plan_id} | completed | {N}/{N} | {commit_count} | PASSED     |
```

Advance to the next wave in `WAVE_ORDER`. Repeat from Step 3a.

---

## Step 4: Post-Execution — Optional Verification

After all waves are complete, check if verification should run.

### Check Config

```bash
AUTO_VERIFY=$(cat .planning/config.json 2>/dev/null | grep -o '"auto_verify":\s*\w*' | grep -o 'true\|false')
```

### If auto_verify is true (or user requested verification):

Spawn the `lean-verifier` agent via Task tool:

```
Task:
  description: "Verify Phase {PHASE_NUMBER}: {PHASE_NAME}"
  prompt: |
    You are the lean-verifier agent.
    @~/.claude/lean-gsd/agents/lean-verifier.md

    ## Assignment

    Verify Phase {PHASE_NUMBER}: {PHASE_NAME}

    **Phase goal:** {PHASE_GOAL}
    **Phase directory:** `{PHASE_DIR}`

    Read the PLAN.md and SUMMARY.md files in the phase directory.
    Extract must_haves from the PLAN frontmatter.
    Run three-level verification (exists, substantive, wired) on all artifacts.
    Check key links. Detect stubs and anti-patterns.
    Write VERIFICATION.md to the phase directory.
    Return the verification status (passed / gaps_found / human_needed).
```

Wait for the verifier to complete.

**If verification status is `gaps_found`:**

- Display the gaps to the user
- Suggest: "Run `/lean:verify {PHASE_NUMBER}` for a detailed report, or fix the gaps and re-verify."

**If verification status is `passed`:**

- Display: "Phase {PHASE_NUMBER} verified successfully."

### If auto_verify is false:

Skip verification. Display:
"Verification skipped (auto_verify is off). Run `/lean:verify {PHASE_NUMBER}` to verify manually."

---

## Step 5: Update ROADMAP.md

Read the current ROADMAP.md and update the target phase's status:

**If all plans completed successfully:**

- Set phase status to `completed`
- Update the Progress Summary section:
  - Increment `Completed`
  - Update `In Progress` to the next incomplete phase (or "All complete")
  - Decrement `Remaining`

**If some plans failed or are blocked:**

- Set phase status to `partial` with a note on what completed
- Do NOT increment `Completed`

Write the updated ROADMAP.md.

---

## Step 6: Update STATE.md

Read the current STATE.md and update:

- `Last Updated` — current timestamp
- `Phase` — current phase number and name
- `Plan` — "{completed_count}/{total_count} plans complete"
- `Wave` — "{total_waves}/{total_waves} waves complete" (or partial)
- `Status` — "Completed" (if all plans passed) or "Partial — {details}" (if some failed)

**If the phase is fully completed:**

- Advance `Phase` to the next incomplete phase (or "All phases complete")
- Set `Plan` to "Not started"
- Set `Wave` to "N/A"
- Set `Status` to "Ready to plan"

**Add any decisions made** during execution (extracted from SUMMARY.md files) to the Decisions table.

**Add any blockers encountered** (from failures or checkpoints) to the Blockers section.

Write the updated STATE.md.

---

## Step 7: Create Session Snapshot

Create a numbered session snapshot file in `.planning/sessions/`.

### Determine Session Number

```bash
LAST_SESSION=$(ls .planning/sessions/*.md 2>/dev/null | sort | tail -1 | grep -oE '[0-9]{3}' | head -1)
if [ -z "$LAST_SESSION" ]; then
  NEXT_SESSION="001"
else
  NEXT_SESSION=$(printf "%03d" $((10#$LAST_SESSION + 1)))
fi
```

### Construct Session File

Use the session template: @~/.claude/lean-gsd/templates/session.md

```bash
SESSION_DATE=$(date +"%Y-%m-%d")
SESSION_SLUG="{PHASE_SLUG}"
SESSION_FILE=".planning/sessions/${NEXT_SESSION}-${SESSION_DATE}-${SESSION_SLUG}.md"
```

Fill the template:

- `SESSION_NUMBER` — the computed session number
- `SESSION_SLUG` — phase slug
- `DATE` — today's date
- `PHASE_NUMBER` — target phase number
- `PHASE_NAME` — target phase name
- `PLAN_ID` — list of all plans executed
- `SESSION_SUMMARY` — concise summary of what was built (1-3 sentences)
- `PLANS_EXECUTED` — count of plans
- `WAVES_COMPLETED` — count of waves
- `DURATION` — elapsed time from EXEC_START_TIME to now
- `DECISIONS_MADE` — key decisions extracted from SUMMARY.md files
- `DEVIATIONS_ENCOUNTERED` — deviations extracted from SUMMARY.md files (with rule numbers)
- `BLOCKERS_HIT` — any blockers or failures
- `VERIFICATION_SUMMARY` — verification result (if auto_verify ran) or "Not run"
- `NEXT_STEPS` — what to do next (verify, plan next phase, fix gaps)
- `SUGGESTED_COMMAND` — the next command to run

Write to the session file path. Also update STATE.md's `Latest session` field to point to this file.

```bash
mkdir -p .planning/sessions
```

### Commit State Updates

```bash
git add ./ROADMAP.md
git add ./STATE.md
git add "$SESSION_FILE"
git commit -m "docs({PHASE_SLUG}): update roadmap, state, and session snapshot

- Phase {PHASE_NUMBER} status: {STATUS}
- Plans completed: {COMPLETED_COUNT}/{TOTAL_COUNT}
- Session: ${NEXT_SESSION}
"
```

---

## Step 8: Display Results

Present the final execution results to the user:

```markdown
---

## Phase {PHASE_NUMBER}: {PHASE_NAME} — Execution Complete

**Status:** {completed | partial}
**Duration:** {DURATION}
**Plans:** {COMPLETED_COUNT}/{TOTAL_COUNT} completed
**Waves:** {WAVES_COMPLETED}/{TOTAL_WAVES}

### Plan Results

| Plan | Status | Tasks | Key Files | Self-Check |
|------|--------|-------|-----------|------------|
| {plan_id} | {status} | {completed}/{total} | {key files} | {PASSED/FAILED} |

### Commits

| Hash | Message |
|------|---------|
| {hash} | {message} |

### Verification

{verification_result_or_skipped}

### Deviations

{count} auto-fixed across all plans:
- {deviation summaries}

### Session Snapshot

Saved to: `{SESSION_FILE}`

---

### Next Up

{IF phase_completed AND next_phase_exists}
Plan the next phase:
```

/lean:plan {NEXT_PHASE_NUMBER}

```
{ELIF phase_completed AND verification_not_run}
Reconcile plan vs actual, then verify:
```

/lean:unify {PHASE_NUMBER}

```
_(Then run `/lean:verify {PHASE_NUMBER}` after reconciling.)_
{ELIF phase_partial}
Review failures and retry:
```

/lean:build {PHASE_NUMBER}

```
{ELIF all_phases_completed}
All phases complete! Run verification:
```

/lean:verify {PHASE_NUMBER}

```
{/IF}

---
```

---

## Error Recovery

### If an executor crashes (no output at all):

- Mark the plan as "failed"
- Check git log for any partial commits from that executor
- Report to user with the last known state
- Allow re-execution: `/lean:build {PHASE_NUMBER}` will skip completed plans and retry failed ones

### If the entire build is interrupted:

- STATE.md tracks current position (phase, wave)
- SUMMARY.md files exist for completed plans
- Re-running `/lean:build {PHASE_NUMBER}` should detect completed plans (via existing SUMMARY.md with "Self-Check: PASSED") and only execute remaining plans

### Detecting Already-Completed Plans on Re-run

When starting Step 2, for each discovered PLAN.md:

```bash
PLAN_ID="{extracted plan id}"
SUMMARY="$PHASE_DIR/${PLAN_ID}-SUMMARY.md"
if [ -f "$SUMMARY" ] && grep -q "Self-Check: PASSED" "$SUMMARY"; then
  echo "SKIP: $PLAN_ID already completed"
  plan.status = "completed"  # Skip this plan
fi
```

Plans already completed are excluded from wave execution. If all plans in a wave are already complete, skip the entire wave.

---

_This workflow is the core execution engine of the Lean GSD framework._
_It handles wave-based parallel execution, checkpoint protocols, state management, and session snapshots._
_Referenced by: `~/.claude/lean-gsd/commands/build.md`_
