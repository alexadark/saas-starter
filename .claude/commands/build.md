---
name: build
description: Execute a phase with wave-based parallel agents
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
  - Glob
  - Grep
---

# /lean:build — Phase Execution

Accepts args: `[phase-number]`

- `phase-number` (optional) — which phase to execute. If omitted, resolves from STATE.md current position.

Load and follow the execute workflow exactly:
@~/.claude/lean-gsd/workflows/execute-phase.md
