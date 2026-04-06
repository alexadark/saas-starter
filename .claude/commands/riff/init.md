---
description: Install RIFF framework into the current project
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
---

# /riff:init

Install the RIFF framework into the current project directory.

## What You Do

1. **Check prerequisites:**
   - Confirm we're in a git repository
   - Confirm there's no existing `.planning/` directory (if there is, ask before overwriting)

2. **Create the directory structure:**

```
.planning/
  phases/
  expertise/
  seeds/
  debug/
  quick/
```

3. **Copy framework files into the project's `.claude/` directory:**
   - Copy all agent files from `~/DEV/frameworks/riff/agents/` → `.claude/agents/riff/`
   - Copy all command files from `~/DEV/frameworks/riff/commands/` → `.claude/commands/riff/`
   - Copy all hook scripts from `~/DEV/frameworks/riff/hooks/` → `.claude/hooks/riff/`
   - Copy `~/DEV/frameworks/riff/CLAUDE.md` → `.claude/agents/riff/CLAUDE.md` (execution rules reference)

4. **Install git hooks:**
   - Copy `~/DEV/frameworks/riff/hooks/security-scan.sh` → `.git/hooks/pre-commit`
   - Copy `~/DEV/frameworks/riff/hooks/commit-msg.sh` → `.git/hooks/commit-msg`
   - Make both executable (`chmod +x`)
   - If hooks already exist, append RIFF's code to them (don't overwrite)

5. **Install Claude Code hooks:**
   - If `.claude/settings.json` exists: merge the hooks from `~/DEV/frameworks/riff/templates/settings.json` into it
   - If it doesn't exist: copy the template as-is
   - These hooks provide: destructive command guard (PreToolUse:Bash), boundary check (PostToolUse:Edit/Write), typecheck gate (PostToolUse:Edit/Write)

6. **Create project-level files from templates:**
   - `STATE.md` from `~/DEV/frameworks/riff/templates/STATE.md`
   - Replace `{{PROJECT_NAME}}` with the directory name

7. **Add to `.gitignore` (if not already present):**

```
# RIFF debug sessions (may contain sensitive debugging info)
.planning/debug/
```

8. **Update the project's CLAUDE.md:**
   - If CLAUDE.md exists: append the RIFF section at the end
   - If CLAUDE.md doesn't exist: create it with the RIFF framework rules

   The RIFF section to add:

```markdown
## RIFF Framework

This project uses the RIFF framework for structured development.

### Commands

- `/riff:start` - Discovery pipeline (questions → wireframes → roadmap → taste.md)
- `/riff:next` - Pick next task → plan → execute → verify → commit
- `/riff:status` - Where am I + what's next
- `/riff:quick <task>` - Ad-hoc task, no phase overhead
- `/riff:check` - Manual verification + security review
- `/riff:debug <issue>` - Structured debugging

### Execution Rules

- Read taste.md before any code changes (Architecture section always, relevant section for the task)
- Confidence gate before any execution (scope, target, output, risk)
- Assumptions mode before any planning (Confident/Likely/Unclear)
- Atomic commits per task (never git add .)
- R1-R4 deviation rules during execution
- Security review after every build phase

### Files

- `PROJECT.md` - Product definition, wireframes, architecture
- `ROADMAP.yaml` - Phases with status, priority, mode, dependencies
- `STATE.md` - Current position and blockers
- `CONTEXT.md` - Locked decisions
- `taste.md` - Architectural rules (sectioned by concern)
```

9. **Display the RIFF banner and confirm installation:**

Run the banner script to display the RIFF ASCII art in turquoise gradient:

```bash
bash ~/DEV/frameworks/riff/templates/banner.sh
```

Then print:

```
RIFF installed in {{PROJECT_PATH}}.

Next steps:
  - New project:      /riff:start   (discovery pipeline)
  - Existing project:  /riff:map     (codebase exploration)
  - Quick task:        /riff:quick   (no phase overhead)
```

## Important

- Do NOT create PROJECT.md, ROADMAP.yaml, CONTEXT.md, or taste.md - those are created by `/riff:start`
- Do NOT initialize a git repo - the project should already have one
- Do NOT install dependencies or modify package.json
- Do NOT copy the Ralph loop script - that runs from the framework directory, not per-project
