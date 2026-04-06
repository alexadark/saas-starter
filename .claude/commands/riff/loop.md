---
description: Run multiple phases autonomously (Ralph loop)
allowed-tools: Bash, Read
args: "[N]"
---

# /riff:loop

Launch the RIFF loop to execute multiple phases autonomously. Each phase runs in a fresh Claude Code context via `/riff:next`. The loop stops on failure, R3 decisions, security issues, or when all phases are done.

## Arguments

- No args: run all remaining AFK phases (up to safety limit of 20)
- `[N]`: run exactly N phases, then stop

## What You Do

1. **Check prerequisites:**
   - `riff-loop.sh` exists in project root
   - `ROADMAP.yaml` exists
   - `.planning/` directory exists

2. **Launch the loop:**

```bash
./riff-loop.sh -n {{N}}
```

Where `{{N}}` is the argument provided, or omitted for default (all remaining).

3. **The loop handles everything:**
   - Reads ROADMAP.yaml to find next AFK phase
   - Spawns fresh Claude Code agent per iteration
   - Each agent runs `/riff:next` (which picks highest priority, dependencies-met task)
   - Commits atomically after each phase
   - Sends Telegram notifications on stop conditions
   - Stops on: FAIL, R3, CRITICAL security, all done, or iteration limit

## Stop Conditions

| Condition               | What happens                                                |
| ----------------------- | ----------------------------------------------------------- |
| Verification FAIL       | Loop stops, writes LOOP_STOP to STATE.md, notifies Telegram |
| R3 deviation            | Loop stops, architecture decision needs human               |
| Security CRITICAL/HIGH  | Loop stops, security issue needs human                      |
| All phases done         | Loop stops, notifies "BUILD COMPLETE"                       |
| Only HITL phases remain | Loop stops, notifies human presence required                |
| All remaining blocked   | Loop stops, notifies human intervention needed              |
| Iteration limit reached | Loop stops (safety)                                         |

## Examples

```bash
# Run next 3 phases autonomously
/riff:loop 3

# Run all remaining AFK phases
/riff:loop

# Run just 1 phase (same as /riff:next but via loop script)
/riff:loop 1
```

## Anti-Patterns

- Don't run the loop on HITL phases (auth, payment, public API) - it will skip them automatically
- Don't run without a ROADMAP.yaml - the loop needs phases to pick from
- Don't run if the last phase has LOOP_STOP in STATE.md - fix the issue first
