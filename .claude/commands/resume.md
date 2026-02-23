---
name: resume
description: Restore session context from previous work
allowed-tools:
  - Read
  - Glob
  - Bash
---

# /lean:resume — Session Context Restoration

Accepts args: `[session-number]` or `list`

- `session-number` (optional) — load a specific session snapshot by its NNN number.
- `list` — display all available session snapshots.
- No args — auto-detect: load latest session + current state + suggest next action.

---

## Step 1: Route by Arguments

### If args = `list`

Go to **List Mode** (Step 2).

### If args = `[session-number]`

Go to **Load Specific Session** (Step 3).

### If no args

Go to **Auto-Detect Mode** (Step 4).

---

## Step 2: List Mode

```bash
ls .planning/sessions/*.md 2>/dev/null | sort
```

If no sessions exist:

```markdown
## No Sessions Found

No session snapshots in `.planning/sessions/`.

Sessions are created automatically by `/lean:build` and `/lean:quick` after completion.

If this is a new project, run `/lean:start` to initialize.
```

Stop here.

If sessions exist, parse each file and extract: session number (from NNN prefix), date, slug, and summary (first line of Session Summary section).

Display:

```markdown
## Session History

| #   | Date | Description | Phase | Plans Executed |
| --- | ---- | ----------- | ----- | -------------- |

${SESSIONS_TABLE}

**Load a session:** `/lean:resume [number]`
**Load latest:** `/lean:resume` (no args)
```

Stop here.

---

## Step 3: Load Specific Session

```bash
SESSION_FILE=$(ls .planning/sessions/${SESSION_NUMBER}-*.md 2>/dev/null | head -1)
```

If file not found:

```markdown
Session ${SESSION_NUMBER} not found. Run `/lean:resume list` to see available sessions.
```

Stop here.

If found:

1. Read the session file completely
2. Read `./STATE.md` for current position
3. Read `./ROADMAP.md` for phase context

Display the session context:

```markdown
---

## Session Restored: ${SESSION_SLUG}

**Date:** ${SESSION_DATE}
**Phase:** ${PHASE_NUMBER} — ${PHASE_NAME}

### What Happened

${SESSION_SUMMARY}

### Decisions Made

${DECISIONS_LIST}

### Deviations Encountered

${DEVIATIONS_LIST}

### Blockers

${BLOCKERS_LIST}

### Where You Left Off

${NEXT_STEPS}

### Suggested Command
```

${SUGGESTED_COMMAND}

```

---
```

Then go to **Step 5: User Choice**.

---

## Step 4: Auto-Detect Mode

Read the project state and detect what was happening:

### Detection 1: Check if STATE.md exists

```bash
[ -f "./STATE.md" ] && echo "FOUND" || echo "MISSING"
```

If STATE.md is missing:

```markdown
## No Project State Found

No STATE.md detected. This project has not been initialized.

Run `/lean:start` to initialize a new project.
```

Stop here.

### Detection 2: Parse STATE.md

Read `./STATE.md` and extract current phase, plan, wave, and status.

### Detection 3: Check for in-progress work

Run these checks in order (first match determines the state):

**Check A: Active debug sessions**

```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved
```

If active debug sessions exist:

- State = **debugging interrupted**
- Read the debug file(s) for current hypothesis and next action

**Check B: Executing phase (mid-build)**

If STATE.md status contains "executing" or "building":

- State = **mid-build**
- Check which plans have SUMMARY.md vs which are pending:
  ```bash
  ls .planning/phases/${PHASE_DIR}/*-PLAN.md 2>/dev/null
  ls .planning/phases/${PHASE_DIR}/*-SUMMARY.md 2>/dev/null
  ```
- Determine which plans remain to be executed

**Check C: Plans without summaries (planned but not executed)**

```bash
# For the current phase directory, compare PLAN vs SUMMARY files
```

If PLAN.md files exist without corresponding SUMMARY.md files:

- State = **plans pending execution**
- List which plans are ready to execute

**Check D: Phase built, not unified**

If all plans have SUMMARY.md files but no UNIFY.md exists:

- State = **awaiting unify**

**Check E: Phase unified, not verified**

If UNIFY.md exists but no VERIFICATION.md exists:

- State = **awaiting verification**

**Check F: Normal state**

If none of the above, check the latest session snapshot:

```bash
ls .planning/sessions/*.md 2>/dev/null | sort | tail -1
```

### Detection 4: Load context

Based on the detected state, load relevant files:

- Always: `./STATE.md`, `./ROADMAP.md`
- If mid-build: the pending PLAN.md files
- If debugging: the active debug session file(s)
- Latest session snapshot (if exists)

### Display Auto-Detect Results

```markdown
---

## Welcome Back

**Project:** ${PROJECT_NAME}
**Last Updated:** ${LAST_UPDATED}

### Current State

${STATE_DESCRIPTION}

### What Was In Progress

${IN_PROGRESS_DESCRIPTION}

### Recent Decisions

${LAST_3_DECISIONS}

### Pending Items

${PENDING_ITEMS}

### Suggested Next Action

${SUGGESTED_ACTION}

---
```

Then go to **Step 5: User Choice**.

---

## Step 5: User Choice

Present options to the user based on the detected state. Use direct text (not AskUserQuestion since it may not be in allowed-tools). Present the options clearly and ask the user what they want to do:

```markdown
### What would you like to do?

${OPTIONS_BASED_ON_STATE}
```

**Options by state:**

| Detected State          | Options                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Debugging interrupted   | 1. Resume debug session 2. Start fresh — abandon debug session 3. Do something else                   |
| Mid-build               | 1. Continue building (resume execution) 2. Check status first 3. Do something else                    |
| Plans pending execution | 1. Execute the pending plans 2. Review plans first 3. Re-plan the phase 4. Do something else          |
| Awaiting unify          | 1. Run `/lean:unify [phase]` to reconcile plan vs actual 2. Skip to verification 3. Do something else |
| Awaiting verification   | 1. Run verification 2. Move to next phase 3. Do something else                                        |
| Normal (between phases) | 1. Plan next phase 2. Quick task 3. Check status 4. Do something else                                 |

---

_This is a lightweight command. No agents are spawned._
_Reads STATE.md, ROADMAP.md, session snapshots, and phase directories to restore context._
_Session snapshots are created by `/lean:build` and `/lean:quick`._
_Referenced by: `~/.claude/lean-gsd/commands/resume.md`_
