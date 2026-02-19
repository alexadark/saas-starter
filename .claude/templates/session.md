# Session {{SESSION_NUMBER}}: {{SESSION_SLUG}}

> Date: {{DATE}}
> Phase: {{PHASE_NUMBER}} — {{PHASE_NAME}}
> Plan: {{PLAN_ID}}

---

## Session Summary

{{SESSION_SUMMARY}}

---

## Context

| Field | Value |
|-------|-------|
| Phase | {{PHASE_NUMBER}} — {{PHASE_NAME}} |
| Plans Executed | {{PLANS_EXECUTED}} |
| Waves Completed | {{WAVES_COMPLETED}} |
| Duration | {{DURATION}} |

---

## Decisions Made

{{#EACH DECISION}}
- **{{DECISION_TITLE}}:** {{DECISION_DETAIL}} — *Rationale: {{RATIONALE}}*
{{/EACH}}

---

## Deviations Encountered

{{#EACH DEVIATION}}
- **[Rule {{RULE_NUMBER}}]** {{DEVIATION_DESCRIPTION}} — *Impact: {{IMPACT}}*
{{/EACH}}

---

## Blockers Hit

{{#EACH BLOCKER}}
- **{{BLOCKER_TITLE}}:** {{BLOCKER_DETAIL}} — *Status: {{BLOCKER_STATUS}}*
{{/EACH}}

---

## Verification Results

{{VERIFICATION_SUMMARY}}

---

## Next Steps

{{#EACH NEXT_STEP}}
- {{STEP}}
{{/EACH}}

### Suggested Command
```
{{SUGGESTED_COMMAND}}
```

---

*Filename format: `NNN-YYYY-MM-DD-slug.md`*
*Stored in: `.planning/sessions/`*
*Created by `/lean:build` and `/lean:quick` after completion*
*Read by `/lean:resume` to restore context*
