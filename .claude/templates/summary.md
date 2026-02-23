---
phase: {{PHASE_NUMBER}}-{{PHASE_NAME}}
plan: {{PLAN_NUMBER}}
subsystem: {{SUBSYSTEM}}
tags: [{{TAGS}}]

# Dependency graph
requires:
  {{#EACH REQUIREMENT}}
  - phase: {{REQUIRED_PHASE}}
    provides: {{WHAT_IT_PROVIDES}}
  {{/EACH}}
provides:
  {{#EACH PROVIDED}}
  - {{PROVIDED_ITEM}}
  {{/EACH}}
affects: [{{AFFECTED_PHASES}}]

# Tech tracking
tech-stack:
  added: [{{ADDED_TECH}}]
  patterns: [{{PATTERNS}}]

key-files:
  created: [{{CREATED_FILES}}]
  modified: [{{MODIFIED_FILES}}]

key-decisions:
  {{#EACH DECISION}}
  - "{{DECISION_TEXT}}"
  {{/EACH}}

patterns-established:
  {{#EACH PATTERN}}
  - "{{PATTERN_NAME}}: {{PATTERN_DESCRIPTION}}"
  {{/EACH}}

# Metrics
duration: {{DURATION}}
completed: {{COMPLETED_DATE}}
---

# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}} — Plan {{PLAN_NUMBER}} Summary

**{{SUBSTANTIVE_ONE_LINER}}**

> One-liner rules: Must describe what actually shipped.
> Good: "JWT auth with refresh rotation using jose library"
> Bad: "Authentication implemented" or "Phase complete"

## Performance

- **Duration:** {{DURATION}}
- **Started:** {{START_TIMESTAMP}}
- **Completed:** {{END_TIMESTAMP}}
- **Tasks:** {{TASK_COUNT}}
- **Files modified:** {{FILE_COUNT}}

## Accomplishments

{{#EACH ACCOMPLISHMENT}}

- {{ACCOMPLISHMENT_TEXT}}
  {{/EACH}}

## Task Commits

Each task was committed atomically:

{{#EACH TASK_COMMIT}}
{{TASK_NUMBER}}. **Task {{TASK_NUMBER}}: {{TASK_NAME}}** - `{{COMMIT_HASH}}` ({{COMMIT_TYPE}})
{{/EACH}}

**Plan metadata:** `{{METADATA_HASH}}` (docs: complete plan)

_Note: TDD tasks may have multiple commits (test -> feat -> refactor)_

## Files Created/Modified

{{#EACH FILE_CHANGE}}

- `{{FILE_PATH}}` - {{FILE_DESCRIPTION}}
  {{/EACH}}

## Decisions Made

{{DECISIONS_SECTION}}

> Key decisions with brief rationale, or "None - followed plan as specified"

## Deviations from Plan

{{DEVIATIONS_SECTION}}

> If no deviations: "None - plan executed exactly as written"

### Auto-fixed Issues

{{#EACH DEVIATION}}
**{{DEVIATION_NUMBER}}. [Rule {{RULE_NUMBER}} - {{RULE_CATEGORY}}] {{BRIEF_DESCRIPTION}}**

- **Found during:** Task {{TASK_NUMBER}} ({{TASK_NAME}})
- **Issue:** {{ISSUE_DESCRIPTION}}
- **Fix:** {{FIX_DESCRIPTION}}
- **Files modified:** {{FIX_FILES}}
- **Verification:** {{FIX_VERIFICATION}}
- **Committed in:** {{FIX_COMMIT}} (part of task commit)
  {{/EACH}}

---

**Total deviations:** {{DEVIATION_COUNT}} auto-fixed ({{DEVIATION_BREAKDOWN}})
**Impact on plan:** {{DEVIATION_IMPACT}}

## Issues Encountered

{{ISSUES_SECTION}}

> "Deviations from Plan" = unplanned work via deviation rules.
> "Issues Encountered" = problems during planned work.

## User Setup Required

{{USER_SETUP_SECTION}}

> If USER-SETUP.md was generated: link to it.
> If none: "None - no external service configuration required."

## Next Phase Readiness

{{NEXT_PHASE_READINESS}}

---

## Self-Check

{{SELF_CHECK_RESULT}}

> Self-check verifies: all claimed files exist, all commits exist.
> Append `## Self-Check: PASSED` or `## Self-Check: FAILED`.
> Do NOT proceed if self-check fails.

---

_Phase: {{PHASE_NUMBER}}-{{PHASE_NAME}}_
_Completed: {{COMPLETED_DATE}}_
_Template: `~/.claude/lean-gsd/templates/summary.md`_
