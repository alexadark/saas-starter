# Quick Workflow — Ad-hoc Task Execution

> This workflow is executed by `/lean:quick`.
> It plans and executes an ad-hoc task in one step — no separate plan/build cycle.
> Quick tasks are tracked in STATE.md but do NOT modify ROADMAP.md.

---

## Prerequisites

- Task description passed as argument from the command
- Agent definitions available at:
  - @~/.claude/lean-gsd/agents/lean-executor.md — executor agent
- Templates available at:
  - @~/.claude/lean-gsd/templates/plan.md — PLAN.md format reference
  - @~/.claude/lean-gsd/templates/session.md — session snapshot format
  - @~/.claude/lean-gsd/templates/state.md — STATE.md format reference

---

## Step 1: Create Quick Task Directory

Determine the next task number by scanning existing quick task directories:

```bash
mkdir -p .planning/quick
LAST_NUM=$(ls -d .planning/quick/[0-9][0-9][0-9]-* 2>/dev/null | sort | tail -1 | grep -o '[0-9]\{3\}' | head -1)
if [ -z "$LAST_NUM" ]; then
  NEXT_NUM="001"
else
  NEXT_NUM=$(printf "%03d" $((10#$LAST_NUM + 1)))
fi
```

Generate a slug from the task description:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Max 30 characters

```bash
TASK_DIR=".planning/quick/${NEXT_NUM}-${SLUG}"
mkdir -p "$TASK_DIR"
```

---

## Step 2: Inline Planning

**IMPORTANT:** Do NOT spawn a planner agent. Planning is done inline — directly in this workflow.

### 2a: Understand the Task

Read the task description and identify:
- What needs to change or be created
- Which files are likely involved

### 2b: Discover Relevant Files

Use Glob and Grep to find files related to the task:

```bash
# Search for files matching the task's domain
# Examples: component names, API routes, config files, etc.
```

Read the relevant files to understand the current state and what needs to change.

### 2c: Create Lightweight Plan

Create 1-3 tasks in XML format. Quick plans are simplified:
- **No wave assignment** (single execution, no parallelism)
- **No depends_on** (tasks execute sequentially)
- **Type is always `auto`** (no checkpoints for quick tasks)
- **Frontmatter is minimal** (type: quick, no phase/wave/depends_on)

Write `${TASK_DIR}/PLAN.md`:

```markdown
---
type: quick
task_number: ${NEXT_NUM}
task_slug: ${SLUG}
created: ${ISO_TIMESTAMP}
files_modified: [${FILES_LIST}]
autonomous: true
---

# Quick Task ${NEXT_NUM}: ${TASK_NAME}

> ${TASK_DESCRIPTION}

## Context

${CONTEXT_REFERENCES}

## Tasks

<task type="auto">
  <name>${TASK_1_NAME}</name>
  <files>${TASK_1_FILES}</files>
  <action>
    ${TASK_1_ACTION}
  </action>
  <verify>
    ${TASK_1_VERIFY}
  </verify>
  <done>${TASK_1_DONE_CRITERIA}</done>
</task>

## Success Criteria

${SUCCESS_CRITERIA}
```

**Planning guidelines:**
- Keep it tight: 1-3 tasks, each clearly scoped
- Be specific in `<action>` — the executor needs exact instructions
- Include `<verify>` for every task — even quick tasks need validation
- Context section: only reference files the tasks actually read or modify

---

## Step 3: Spawn Executor Agent

Spawn the `lean-executor` agent via the Task tool:

```
Task:
  description: "Execute quick task: ${TASK_DESCRIPTION}"
  prompt: |
    You are the lean-executor agent.
    @~/.claude/lean-gsd/agents/lean-executor.md

    ## Plan to Execute

    Read and execute the plan at: ${TASK_DIR}/PLAN.md

    ## Quick Task Context

    This is a quick task (ad-hoc, not part of a phase).
    - Use "quick(${NEXT_NUM})" as the commit scope instead of "{phase}-{plan}"
    - Example commit: feat(quick-${NEXT_NUM}): add search to user list
    - Create SUMMARY.md as ${TASK_DIR}/${NEXT_NUM}-quick-SUMMARY.md
    - Follow all standard executor protocols (deviation rules, atomic commits, self-check)

    Execute the plan completely.
```

---

## Step 4: Update STATE.md

After the executor agent completes:

1. Read `./STATE.md`
2. Add a new entry to the **Quick Tasks Completed** table:

```markdown
| ${NEXT_NUM} | ${TASK_DESCRIPTION} | ${RESULT_SUMMARY} | ${DATE} |
```

3. Update `Last Updated` timestamp
4. Write the updated STATE.md

---

## Step 5: Create Session Snapshot

Create a session snapshot for this quick task:

1. Determine the next session number:
   ```bash
   mkdir -p .planning/sessions
   LAST_SESSION=$(ls .planning/sessions/[0-9][0-9][0-9]-*.md 2>/dev/null | sort | tail -1 | grep -o '[0-9]\{3\}' | head -1)
   if [ -z "$LAST_SESSION" ]; then
     SESSION_NUM="001"
   else
     SESSION_NUM=$(printf "%03d" $((10#$LAST_SESSION + 1)))
   fi
   ```

2. Create the session file at `.planning/sessions/${SESSION_NUM}-${DATE}-quick-${SLUG}.md`:

```markdown
# Session ${SESSION_NUM}: quick-${SLUG}

> Date: ${DATE}
> Phase: Quick Task
> Plan: quick-${NEXT_NUM}

---

## Session Summary

Executed quick task: ${TASK_DESCRIPTION}

---

## Context

| Field | Value |
|-------|-------|
| Phase | Quick Task (ad-hoc) |
| Plans Executed | 1 |
| Waves Completed | N/A |
| Duration | ${DURATION} |

---

## Decisions Made

${DECISIONS_FROM_SUMMARY}

---

## Deviations Encountered

${DEVIATIONS_FROM_SUMMARY}

---

## Blockers Hit

(none)

---

## Verification Results

${VERIFICATION_FROM_SUMMARY}

---

## Next Steps

- Continue with current phase work
- Run `/lean:status` to see overall progress

### Suggested Command
```
/lean:status
```

---
```

3. Update STATE.md `Latest session` field to point to the new session file.

---

## Step 6: Display Result Summary

After everything is complete, display a concise summary:

```markdown
---

## Quick Task Complete

**Task:** ${TASK_DESCRIPTION}
**Number:** ${NEXT_NUM}
**Duration:** ${DURATION}

### Result

${RESULT_SUMMARY}

### Commits

${COMMIT_LIST}

### Files

- Plan: `${TASK_DIR}/PLAN.md`
- Summary: `${TASK_DIR}/${NEXT_NUM}-quick-SUMMARY.md`
- Session: `.planning/sessions/${SESSION_FILE}`

---
```

**IMPORTANT:** Do NOT update ROADMAP.md. Quick tasks are separate from phase work and are tracked only in STATE.md.

---

*This workflow handles ad-hoc tasks outside the normal phase cycle.*
*Plans inline (no planner agent), then spawns lean-executor for execution.*
*Results are tracked in STATE.md "Quick Tasks Completed" table.*
*Referenced by: `~/.claude/lean-gsd/commands/quick.md`*
