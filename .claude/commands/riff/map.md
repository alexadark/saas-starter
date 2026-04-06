---
description: Brownfield codebase exploration and RIFF onboarding
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
args: "[directory] [--focus=area] [--quick]"
---

# /riff:map

Brownfield entry point. Analyzes an existing codebase and produces the planning artifacts RIFF needs to work on it. After this command, the project is ready for `/riff:next`, `/riff:debug`, and all other RIFF workflows.

## Prerequisites

- A git repository must exist
- The codebase must have actual code in it (not an empty repo)

## Arguments

| Arg            | Description                                                              | Default          |
| -------------- | ------------------------------------------------------------------------ | ---------------- |
| `[directory]`  | Specific directory to focus on                                           | Entire project   |
| `--focus=area` | Explore one concern deeply: `frontend`, `backend`, `api`, `auth`, `data` | All concerns     |
| `--quick`      | Fast scan - stack detection + architecture mapping only (Steps 1-2)      | Full exploration |

Examples:

- `/riff:map` - full exploration of the entire project
- `/riff:map src/api --focus=backend` - deep dive into the API layer
- `/riff:map --quick` - fast overview before deciding what to explore deeper

## What You Do

### Step 1: Check Existing State

Look for `.planning/architecture.md`.

- **If found:** Ask the human - is this a re-map (overwrite) or do they want to explore a specific area?
- **If not found:** Proceed with full exploration.

### Step 2: Ensure Directory Structure

If `.planning/` doesn't exist, create it:

```
.planning/
  specs/
  phases/
  expertise/
  seeds/
  debug/
  quick/
```

Do NOT run full `/riff:init`. Just create the directories needed for exploration output.

### Step 3: Spawn Explorer Agent

Run the explorer agent from `agents/explorer.md`.

- If `--quick` flag: run Steps 1-2 only (stack detection + architecture mapping)
- If `--focus=area`: run all steps but scoped to the specified concern
- Otherwise: run the full 6-step exploration

### Step 4: Post-Exploration Review

After the explorer agent finishes:

1. Present the summary to the human (stack, architecture, key risks, open questions)
2. Ask for corrections - the human knows the project better than the code reveals
3. Apply corrections to `taste.md` and `.planning/architecture.md`
4. If `taste.md` was generated, remove the "extracted, not invented" header after human review

### Step 5: RIFF-Ready Confirmation

```
Codebase mapped. RIFF is ready to work on this project.

Stack: {{STACK_SUMMARY}}
Architecture: {{ARCHITECTURE_PATTERN}}
Risks found: {{RISK_COUNT}} ({{CRITICAL_COUNT}} critical)
Specs backfilled: {{SPEC_COUNT}}

Next steps:
- Review taste.md and correct any misidentified conventions
- Review .planning/risks.md for critical issues
- Run /riff:next to start working on the project
- Run /riff:map --focus=<area> to explore a specific concern deeper
```

## Output Files

| File                        | Content                                                        |
| --------------------------- | -------------------------------------------------------------- |
| `.planning/architecture.md` | Stack summary, directory map, data flow, external dependencies |
| `taste.md`                  | Extracted conventions, sectioned by concern                    |
| `.planning/risks.md`        | Dependency issues, tech debt, security concerns                |
| `.planning/specs/*.md`      | One spec per major feature/module (skipped with `--quick`)     |
| `SUMMARY.md`                | Key findings, recommendations, open questions                  |
| `STATE.md`                  | Updated: mapped, ready for planning                            |

## Anti-Patterns

- Don't run `/riff:init` - this command handles its own directory setup
- Don't generate a ROADMAP.yaml - that's the human's decision after reviewing findings
- Don't start fixing issues found during exploration - just document them
- Don't skip the human review step - the explorer extracts, the human corrects
