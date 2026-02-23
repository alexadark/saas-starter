---
name: unify
description: Reconcile plan vs actual after build. Compares acceptance criteria against real artifacts.
argument-hint: "[phase]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /lean:unify — Reconcile Plan vs Actual

Accepts args: `[phase-number]` — the phase to reconcile. Defaults to current phase from STATE.md.

---

@~/.claude/lean-gsd/workflows/unify.md
