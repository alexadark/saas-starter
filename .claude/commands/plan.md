---
name: plan
description: Plan the next phase — spawns planner agent to create PLAN.md files
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
  - WebSearch
  - WebFetch
---

# /lean:plan — Phase Planning

Accepts args: `[phase-number] [--research]`

- `phase-number` (optional) — which phase to plan. If omitted, resolves from STATE.md current position.
- `--research` (optional) — spawn a research agent before planning to gather domain/library information.

Load and follow the plan workflow exactly:
@~/.claude/lean-gsd/workflows/plan-phase.md
