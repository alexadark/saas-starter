---
name: debug
description: Scientific debugging with persistent state
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Task
  - Glob
  - Grep
  - WebSearch
---

# /lean:debug — Scientific Debugging

Accepts args: `[issue description]`

- `issue description` (optional) — what is broken or unexpected. If omitted, lists active debug sessions.

---

## Step 1: Check for Active Sessions

```bash
mkdir -p .planning/debug
ls .planning/debug/*.md 2>/dev/null | grep -v resolved
```

### Case A: No args, active sessions exist

Display active sessions:

```markdown
## Active Debug Sessions

| # | Session | Status | Current Hypothesis | Last Updated |
|---|---------|--------|--------------------|--------------|
${SESSIONS_TABLE}

**To resume a session:** `/lean:debug [issue description matching a session]`
**To start a new investigation:** `/lean:debug [describe the new issue]`
```

Stop here. Wait for user input.

### Case B: No args, no active sessions

Display:

```
No active debug sessions. Describe the issue to start investigating.

Usage: /lean:debug [issue description]
Example: /lean:debug "Login button returns 500 error after clicking submit"
```

Stop here. Wait for user input.

### Case C: Args provided, matching active session exists

If the issue description matches an existing session slug (fuzzy match on keywords), this is a **resume**. Proceed to Step 3 with the existing session file path.

### Case D: Args provided, no matching session

This is a new investigation. Proceed to Step 2.

---

## Step 2: Generate Session Slug and File

Generate a URL-safe slug from the issue description:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Max 30 characters

```bash
# Example: "Login button 500 error" -> "login-button-500-error"
SLUG="login-button-500-error"
DEBUG_FILE=".planning/debug/${SLUG}.md"
```

If the file already exists (exact slug match), this is a resume — go to Step 3.

Otherwise, create the initial debug session file:

```markdown
---
status: gathering
trigger: "${VERBATIM_USER_INPUT}"
created: ${ISO_TIMESTAMP}
last_updated: ${ISO_TIMESTAMP}
---

## Current Focus

hypothesis: (none yet)
test: (none yet)
expecting: (none yet)
next_action: gather symptoms from user and codebase

## Symptoms

expected: (to be determined)
actual: (to be determined)
errors: (to be determined)
reproduction: (to be determined)
started: (to be determined)

## Eliminated Hypotheses

(none yet)

## Evidence

(none yet)

## Resolution

root_cause: (empty)
fix: (empty)
verification: (empty)
files_changed: []
```

Proceed to Step 3.

---

## Step 3: Spawn Debugger Agent

Spawn the `lean-debugger` agent via the Task tool:

```
Task:
  description: "Debug: ${ISSUE_DESCRIPTION}"
  prompt: |
    You are the lean-debugger agent.
    @~/.claude/lean-gsd/agents/lean-debugger.md

    ## Debug Session

    Session file: ${DEBUG_FILE}

    ## Issue Description

    ${VERBATIM_USER_INPUT}

    ## Instructions

    ${RESUME_OR_NEW_INSTRUCTIONS}
```

### For new sessions (`RESUME_OR_NEW_INSTRUCTIONS`):

```
This is a NEW debug session. The session file has been created at ${DEBUG_FILE}.

1. Read the session file to confirm initial state
2. Begin symptom gathering (Step 3 in your protocol)
3. Investigate autonomously using scientific method
4. Update the debug file BEFORE every action
5. Fix and verify when root cause is confirmed
6. Archive to resolved/ when complete
```

### For resumed sessions (`RESUME_OR_NEW_INSTRUCTIONS`):

```
This is a RESUMED debug session. An existing session file exists at ${DEBUG_FILE}.

1. Read the session file completely
2. Parse the current status, hypothesis, evidence, and eliminated hypotheses
3. Resume from the next_action in Current Focus
4. DO NOT re-investigate eliminated hypotheses
5. Continue the investigation from where it left off
```

---

## Step 4: Display Results

After the debugger agent completes, read the session file and display the outcome:

### If resolved:

```markdown
---

## Debug Session Complete

**Issue:** ${ISSUE_DESCRIPTION}
**Root Cause:** ${ROOT_CAUSE}
**Fix:** ${FIX_DESCRIPTION}
**Files Changed:** ${FILES_LIST}
**Verification:** ${VERIFICATION_RESULT}

Session archived to: `.planning/debug/resolved/${SLUG}.md`

---
```

### If still investigating (agent hit context limit or checkpoint):

```markdown
---

## Debug Session Paused

**Issue:** ${ISSUE_DESCRIPTION}
**Status:** ${CURRENT_STATUS}
**Current Hypothesis:** ${HYPOTHESIS}
**Evidence Collected:** ${EVIDENCE_COUNT} items
**Hypotheses Eliminated:** ${ELIMINATED_COUNT}

**Next Action:** ${NEXT_ACTION}

Resume with: `/lean:debug ${ISSUE_DESCRIPTION}`

---
```

---

*This command spawns the `lean-debugger` agent for scientific debugging.*
*Debug sessions persist in `.planning/debug/` and survive context resets.*
*Resolved sessions are archived to `.planning/debug/resolved/`.*
*Referenced by: `~/.claude/lean-gsd/commands/debug.md`*
