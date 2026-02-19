---
name: status
description: Display project progress and suggest next action
allowed-tools:
  - Read
  - Glob
  - Bash
---

# /lean:status — Project Progress Display

No args. This is a lightweight read-only command. **NO agent spawning.**

---

## Step 1: Check Project Exists

```bash
[ -f "./ROADMAP.md" ] && echo "FOUND" || echo "MISSING"
[ -f "./STATE.md" ] && echo "FOUND" || echo "MISSING"
```

If ROADMAP.md or STATE.md is missing:

```markdown
## No Project Found

No ROADMAP.md or STATE.md detected in this directory.

Run `/lean:start` to initialize a new project.
```

Stop here.

---

## Step 2: Parse ROADMAP.md

Read `./ROADMAP.md` and extract:

1. **Project name** — from the title
2. **Phase list** — for each phase: number, name, goal, status
3. **Feature scope** — v1 feature count, later count, out-of-scope count
4. **Progress metrics:**
   - Total phases
   - Completed phases (status contains "complete" or "done")
   - In-progress phases (status contains "in progress" or "executing" or "planned")
   - Not started phases

---

## Step 3: Parse STATE.md

Read `./STATE.md` and extract:

1. **Current position** — phase, plan, wave, status
2. **Last 3 decisions** — from the Decisions Made table (most recent 3)
3. **Current blockers** — any active blockers
4. **Quick tasks completed** — count from Quick Tasks Completed table
5. **Latest session** — session file reference

---

## Step 4: Scan Phase Directories

```bash
ls .planning/phases/*/  2>/dev/null
```

For each phase directory, count:
- PLAN.md files (planned)
- SUMMARY.md files (executed)
- VERIFICATION.md files (verified)

This gives per-phase granularity:
- Plans created vs executed
- Phases verified vs unverified

---

## Step 5: Check Active Debug Sessions

```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved
```

Count active debug sessions (if any).

---

## Step 6: Display Dashboard

Render the full status dashboard:

```markdown
---

## Project Status: ${PROJECT_NAME}

### Overall Progress

${PROGRESS_BAR} ${PERCENTAGE}% (${COMPLETED}/${TOTAL} phases)

### Phase Breakdown

| # | Phase | Plans | Executed | Verified | Status |
|---|-------|-------|----------|----------|--------|
${PHASE_TABLE}

### Current Position

| Field | Value |
|-------|-------|
| Phase | ${CURRENT_PHASE} |
| Plan | ${CURRENT_PLAN} |
| Wave | ${CURRENT_WAVE} |
| Status | ${CURRENT_STATUS} |

### Recent Decisions

${DECISIONS_LIST}

${BLOCKERS_SECTION}

${DEBUG_SECTION}

---

### Next Action

${SUGGESTED_NEXT_ACTION}

---
```

### Progress Bar Format

Overall:
```
████████░░ 80% (4/5 phases)
```

Per-phase in the table:
- Completed: `done`
- Partially executed: `████░ 3/5 plans`
- Planned but not executed: `planned`
- Not started: `--`
- Verified: `done (verified)`

### Progress Bar Generation

```
FILLED = round(COMPLETED / TOTAL * 10)
EMPTY = 10 - FILLED
BAR = "█" * FILLED + "░" * EMPTY
```

### Blockers Section (only if blockers exist)

```markdown
### Active Blockers

- ${BLOCKER_DESCRIPTION}
```

### Debug Section (only if active sessions exist)

```markdown
### Active Debug Sessions

| Session | Status | Hypothesis |
|---------|--------|------------|
${DEBUG_TABLE}
```

---

## Step 7: Suggest Next Action

Based on the current state, suggest the most logical next command:

| State | Suggestion |
|-------|------------|
| No phases planned | "Run `/lean:plan 1` to plan Phase 1" |
| Phase planned, not executed | "Run `/lean:build ${PHASE}` to execute Phase ${PHASE}" |
| Phase executed, not verified | "Run `/lean:verify ${PHASE}` to verify Phase ${PHASE}" |
| Phase verified with gaps | "Run `/lean:plan ${PHASE} --gaps` to fix verification gaps" |
| Phase verified, passed | "Run `/lean:plan ${NEXT_PHASE}` to plan the next phase" |
| All phases complete | "All phases complete. Consider running `/lean:verify` on each phase for final review." |
| Active blockers | "Resolve active blocker before continuing: ${BLOCKER}" |
| Active debug session | "Resume debugging with `/lean:debug ${SESSION_DESCRIPTION}`" |

Pick the FIRST matching state from the table (priority order).

---

*This is a lightweight, read-only command. No agents are spawned.*
*Reads ROADMAP.md, STATE.md, and phase directories to build the dashboard.*
*Referenced by: `~/.claude/lean-gsd/commands/status.md`*
