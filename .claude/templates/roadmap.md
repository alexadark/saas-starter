# {{PROJECT_NAME}} — Roadmap

> Generated: {{DATE}}
> Last Updated: {{LAST_UPDATED}}

---

## Scope

### v1 (Build Now)

{{#EACH V1_FEATURE}}

- {{FEATURE_NAME}}
  {{/EACH}}

### Later

{{#EACH LATER_FEATURE}}

- {{FEATURE_NAME}}
  {{/EACH}}

### Out of Scope

{{#EACH OUT_OF_SCOPE}}

- {{FEATURE_NAME}}
  {{/EACH}}

---

## Progress Summary

| Metric       | Value                |
| ------------ | -------------------- |
| Total Phases | {{TOTAL_PHASES}}     |
| Completed    | {{COMPLETED_PHASES}} |
| In Progress  | {{CURRENT_PHASE}}    |
| Remaining    | {{REMAINING_PHASES}} |

---

## Phases

| #   | Name | Goal | Status | Features |
| --- | ---- | ---- | ------ | -------- |

{{#EACH PHASE}}
| {{NUMBER}} | {{NAME}} | {{GOAL}} | {{STATUS}} | {{FEATURES}} |
{{/EACH}}

### Phase Details

{{#EACH PHASE}}

### Phase {{NUMBER}}: {{NAME}}

**Goal:** {{GOAL}}
**Status:** {{STATUS}}

**Features:**
{{#EACH FEATURES}}

- {{FEATURE_NAME}}
  {{/EACH}}

{{/EACH}}

---

_Created by `/lean:start` | Updated by `/lean:build`_
