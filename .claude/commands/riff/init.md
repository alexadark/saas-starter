---
description: Install RIFF framework into the current project
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
---

# /riff:init

Install the RIFF framework into the current project directory using a centralized clone + symlinks approach.

## What You Do

1. **Check prerequisites:**
   - Confirm we're in a git repository
   - Confirm there's no existing `.riff/` directory (if there is, ask before overwriting)
   - Confirm there's no existing `.planning/` directory (if there is, ask before overwriting)

2. **Clone the RIFF framework:**

```bash
git clone https://github.com/alexadark/riff.git .riff
```

If the clone fails (no access, offline), fall back to copying from `~/DEV/frameworks/riff/`:

```bash
cp -r ~/DEV/frameworks/riff/ .riff/
cd .riff && git init && git add -A && git commit -m "init: local copy of RIFF framework"
```

3. **Create the directory structure:**

```
.planning/
  phases/
  expertise/
  seeds/
  debug/
  quick/
  specs/
.claude/
  commands/riff/
  agents/riff/
  hooks/riff/
```

4. **Create symlinks (commands + agents):**

```bash
# Commands - symlink each .md file
for f in .riff/commands/*.md; do
  ln -sf "../../.riff/commands/$(basename $f)" ".claude/commands/riff/$(basename $f)"
done

# Agents - symlink each .md file EXCEPT CLAUDE.md
for f in .riff/agents/*.md; do
  ln -sf "../../.riff/agents/$(basename $f)" ".claude/agents/riff/$(basename $f)"
done

# Loop script
ln -sf .riff/riff-loop.sh riff-loop.sh
chmod +x riff-loop.sh
```

**Symlinks use relative paths** so they work regardless of where the project is cloned.

5. **Create local-only files (copies, not symlinks):**

These files are project-specific and should NOT be symlinked:

- `.claude/agents/riff/CLAUDE.md` - Copy from `.riff/CLAUDE.md`. This file contains project-specific execution rules that may diverge from the framework.
- `.claude/hooks/riff/banner.sh` - Copy from `.riff/templates/banner.sh`, `chmod +x`

6. **Install git hooks:**
   - Copy `.riff/hooks/security-scan.sh` → `.git/hooks/pre-commit`
   - Copy `.riff/hooks/commit-msg.sh` → `.git/hooks/commit-msg`
   - Make both executable (`chmod +x`)
   - If hooks already exist, append RIFF's code to them (don't overwrite)

7. **Install Claude Code hooks:**
   - If `.claude/settings.json` exists: merge the hooks from `.riff/templates/settings.json` into it
   - If it doesn't exist: copy the template as-is

8. **Create project-level files from templates:**
   - `STATE.md` from `.riff/templates/STATE.md`
   - Replace `{{PROJECT_NAME}}` with the directory name

9. **Add to `.gitignore` (if not already present):**

```
# RIFF framework (cloned repo - not committed to project)
.riff/

# RIFF debug sessions (may contain sensitive debugging info)
.planning/debug/
```

10. **Update the project's CLAUDE.md:**

If CLAUDE.md exists: append the RIFF section at the end. If it doesn't exist: create it.

The RIFF section to add:

```markdown
## RIFF Framework

This project uses the RIFF framework for structured development.

### Commands

- `/riff:start` - Discovery pipeline (questions → wireframes → roadmap → taste.md)
- `/riff:next` - Pick next task → plan → execute → verify → commit
- `/riff:loop [N]` - Run N phases autonomously (Ralph loop, AFK mode)
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

### Git Workflow

Each phase runs on its own branch with a PR:

```
main
  └─ riff/phase-1-slug   → PR → squash merge → main
  └─ riff/phase-2-slug   → PR → squash merge → main
```

- Branch created before planning: `riff/phase-N-slug`
- Each task gets an atomic commit on the branch
- PR created after verification + security review pass
- Squash merge into main with branch cleanup
- Failed phases keep their branch open for fix iterations

### Wave Parallelization

Tasks within a phase are grouped into waves by the planner:
- Tasks in the same wave have **zero file overlap** and run in parallel (via Agent subagents)
- Tasks in different waves run sequentially (Wave 2 depends on Wave 1)

### Framework Updates

RIFF is installed in `.riff/` (git clone). To update:

```bash
cd .riff && git pull
```

After each phase, RIFF checks if agents made modifications to the framework. These are proposed as HITL decisions - you review and approve before they're pushed upstream.

### Files

- `PROJECT.md` - Product definition, wireframes, architecture
- `ROADMAP.yaml` - Phases with status, priority, mode, dependencies
- `STATE.md` - Current position and blockers
- `CONTEXT.md` - Locked decisions
- `taste.md` - Architectural rules (sectioned by concern)
- `.riff/` - Framework source (clone, gitignored)
```

11. **Display the RIFF banner and confirm installation:**

```bash
bash .riff/templates/banner.sh
```

Then print:

```
RIFF installed in {{PROJECT_PATH}}.

Framework source: .riff/ (clone of alexadark/riff)
Symlinks: .claude/commands/riff/ → .riff/commands/
           .claude/agents/riff/  → .riff/agents/

Next steps:
  - New project:      /riff:start   (discovery pipeline)
  - Existing project:  /riff:map     (codebase exploration)
  - Quick task:        /riff:quick   (no phase overhead)
```

## Updating RIFF

To pull the latest framework changes into a project:

```bash
cd .riff && git pull origin main
```

Symlinks automatically point to the updated files. No re-init needed.

## Important

- Do NOT create PROJECT.md, ROADMAP.yaml, CONTEXT.md, or taste.md - those are created by `/riff:start`
- Do NOT initialize a git repo - the project should already have one
- Do NOT install dependencies or modify package.json
- `.riff/` is gitignored - the framework is NOT committed to the project repo
- Symlinks ARE committed to the project repo (they use relative paths)
- `.claude/agents/riff/CLAUDE.md` is a COPY (not symlink) - it's project-specific
