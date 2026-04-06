---
description: Ad-hoc task execution without phase overhead
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
args: "<task description>"
---

# /riff:quick

For small tasks that don't deserve a full phase. Bug fixes, style tweaks, config changes, small features. Same quality guarantees, zero phase overhead.

## Arguments

The task description is passed as the argument. Example:

- `/riff:quick fix the login button not redirecting after auth`
- `/riff:quick add dark mode toggle to the header`
- `/riff:quick update the footer copyright year`

## What You Do

### Step 1: Assess

Is this actually a quick task? Quick = can be done in 1-3 files, doesn't require architectural decisions, doesn't affect other features.

If it's NOT quick (would touch 5+ files, requires new data model, changes auth flow):

- Tell the user: "This isn't a quick task. It should be a new phase in ROADMAP.yaml."
- Suggest adding it as a phase and running `/riff:next`
- Don't proceed

### Step 2: Confidence Gate (Fast Version)

Same 4 dimensions but faster:

1. Scope: clear from the description? If not, ask ONE clarifying question
2. Target: know which files to change?
3. Output: know what "done" looks like?
4. Risk: any chance this breaks something?

### Step 3: Assumptions Mode (Fast Version)

State what you intend to do in 2-3 bullet points with confidence levels. Wait for correction.

If the user says "just do it": proceed immediately.

### Step 4: Execute

- Read the relevant files
- Make the changes
- Follow taste.md rules (read relevant section)
- Follow code quality rules (no any, no console.log, validate input, etc.)

### Step 5: Verify (Inline)

- Run tests if they exist for the modified files
- Verify the change does what was asked
- Quick security check on modified code

### Step 6: Commit

- Stage explicitly (no `git add .`)
- Commit: `riff(quick): <description>`

### Step 7: Log

Write a brief record to `.planning/quick/quick-NNNN.md`:

```markdown
# Quick: {{DESCRIPTION}}

Date: {{DATE}}
Files: {{FILE_LIST}}
What: {{WHAT_WAS_DONE}}
```

## Anti-Patterns

- Don't use /riff:quick for tasks that should be phases
- Don't skip the confidence gate
- Don't skip the inline verification
- Don't combine multiple unrelated changes in one /riff:quick
