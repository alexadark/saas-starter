# {{PROJECT_NAME}} — State

> Last Updated: {{LAST_UPDATED}}

---

## Current Position

| Field | Value |
|-------|-------|
| Phase | {{CURRENT_PHASE_NUMBER}} — {{CURRENT_PHASE_NAME}} |
| Plan | {{CURRENT_PLAN}} |
| Wave | {{CURRENT_WAVE}} |
| Status | {{STATUS}} |

---

## Decisions Made

| # | Decision | Rationale | Phase |
|---|----------|-----------|-------|
{{#EACH DECISION}}
| {{NUMBER}} | {{DECISION}} | {{RATIONALE}} | {{PHASE}} |
{{/EACH}}

---

## Blockers

### Current
{{CURRENT_BLOCKERS}}

### Resolved
{{#EACH RESOLVED_BLOCKER}}
| Blocker | Resolution | Date |
|---------|------------|------|
| {{DESCRIPTION}} | {{RESOLUTION}} | {{DATE}} |
{{/EACH}}

---

## Quick Tasks Completed

| # | Task | Result | Date |
|---|------|--------|------|
{{#EACH QUICK_TASK}}
| {{NUMBER}} | {{TASK}} | {{RESULT}} | {{DATE}} |
{{/EACH}}

---

## Session History

> Session snapshots are stored as numbered files in `.planning/sessions/`.
> Use `/lean:resume` to restore context from any session.
> Use `/lean:resume list` to view all sessions.

Latest session: {{LATEST_SESSION_FILE}}

---

*Updated by `/lean:build`, `/lean:quick`, `/lean:plan`*
