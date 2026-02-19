---
phase: {{PHASE_NUMBER}}-{{PHASE_NAME}}
plan: {{PLAN_NUMBER}}
type: {{PLAN_TYPE}}
wave: {{WAVE_NUMBER}}
depends_on: {{DEPENDS_ON}}
files_modified: {{FILES_MODIFIED}}
autonomous: {{AUTONOMOUS}}
must_haves:
  truths:
    {{#EACH TRUTH}}
    - "{{TRUTH_STATEMENT}}"
    {{/EACH}}
  artifacts:
    {{#EACH ARTIFACT}}
    - path: {{ARTIFACT_PATH}}
      provides: {{ARTIFACT_PROVIDES}}
      min_lines: {{MIN_LINES}}
    {{/EACH}}
  key_links:
    {{#EACH KEY_LINK}}
    - from: {{FROM}}
      to: {{TO}}
      via: {{VIA}}
      pattern: {{PATTERN}}
    {{/EACH}}
---

# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}} — Plan {{PLAN_NUMBER}}

> {{PLAN_DESCRIPTION}}

---

## Context

{{CONTEXT_SECTION}}

> **Context rules:**
> - Only include files this plan's tasks will actually read or modify
> - Use `@path/to/file` syntax for file references
> - Include prior SUMMARY.md files only if this plan depends on their output
> - Keep context minimal — each file added costs token budget

---

## Tasks

<task type="auto">
  <name>{{TASK_NAME}}</name>
  <files>{{TASK_FILES}}</files>
  <action>
    {{TASK_ACTION}}
  </action>
  <verify>
    {{TASK_VERIFY}}
  </verify>
  <done>{{TASK_DONE_CRITERIA}}</done>
</task>

<task type="checkpoint:human-verify">
  <name>{{CHECKPOINT_NAME}}</name>
  <files>{{CHECKPOINT_FILES}}</files>
  <action>
    {{CHECKPOINT_ACTION}}
  </action>
  <verify>
    {{CHECKPOINT_VERIFY}}
  </verify>
  <done>{{CHECKPOINT_DONE_CRITERIA}}</done>
</task>

<task type="checkpoint:decision">
  <name>{{DECISION_NAME}}</name>
  <files>{{DECISION_FILES}}</files>
  <action>
    {{DECISION_ACTION}}
  </action>
  <verify>
    {{DECISION_VERIFY}}
  </verify>
  <done>{{DECISION_DONE_CRITERIA}}</done>
</task>

<task type="checkpoint:human-action">
  <name>{{HUMAN_ACTION_NAME}}</name>
  <files>{{HUMAN_ACTION_FILES}}</files>
  <action>
    {{HUMAN_ACTION_ACTION}}
  </action>
  <verify>
    {{HUMAN_ACTION_VERIFY}}
  </verify>
  <done>{{HUMAN_ACTION_DONE_CRITERIA}}</done>
</task>

---

## Task Type Reference

| Type | Frequency | When to Use |
|------|-----------|-------------|
| `auto` | 99% | Standard automated task — executor handles independently |
| `checkpoint:human-verify` | ~90% of checkpoints | User must visually verify or approve output |
| `checkpoint:decision` | ~9% of checkpoints | User must choose between options |
| `checkpoint:human-action` | ~1% of checkpoints | User must perform an external action (e.g., create API key) |

---

## Task XML Format Reference

Each task MUST have these 4 fields:
- `<files>` — Which files this task creates or modifies
- `<action>` — Step-by-step instructions for the executor
- `<verify>` — How to confirm the task succeeded (test, build, grep, etc.)
- `<done>` — Observable criteria proving completion

---

*Template: `~/.claude/lean-gsd/templates/plan.md`*
*Created by: `lean-planner` agent*
*Executed by: `lean-executor` agent*
