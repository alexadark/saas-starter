---
description: Show current project status and next action
allowed-tools: Read, Glob, Bash
---

# /riff:status

Quick dashboard: where am I, what's done, what's next, any blockers.

## What You Do

1. **Read STATE.md** - current position and blockers
2. **Read ROADMAP.yaml** - all phases and their status
3. **Check for pending taste.md additions** - any agent-proposed rules waiting for validation
4. **Check for seeds** - any deferred ideas in `.planning/seeds/`

## Output Format

```
# RIFF Status - {{PROJECT_NAME}}

## Progress
{{done_count}}/{{total_count}} phases complete ({{percentage}}%)

| Phase | Title | Status | Priority | Mode |
|-------|-------|--------|----------|------|
| 1 | Auth system | done | P0 | AFK |
| 2 | Data model | done | P0 | AFK |
| 3 | Dashboard UI | in-progress | P0 | HITL |
| 4 | API routes | todo | P1 | AFK |

## Current
Phase {{N}}: {{TITLE}} - {{STATUS}}
{{BLOCKER_INFO if any}}

## Next Action
{{RECOMMENDED_NEXT_ACTION}}

## Pending Reviews
- taste.md: {{N}} proposed rules awaiting validation (grep for <!-- PENDING -->)
- seeds: {{N}} deferred ideas ({{M}} with triggers met)
- expertise: {{planner: N, executor: N, verifier: N, security: N}} entries

## Recent Deviations
{{R1-R4 summary from last SUMMARY.md}}
```

## Suggested Next Actions

Based on the state, recommend ONE of:

- "Run `/riff:next` to start phase N" (if next phase is ready)
- "Run `/riff:next` to fix phase N verification failures" (if last verification failed)
- "Phase N is HITL - review PLAN.md before running `/riff:next`" (if next phase needs human)
- "All phases complete! Run `/riff:check` for final verification" (if all done)
- "Blocked: {{reason}}. Resolve before continuing." (if stuck)

## Taste Validation

If there are `<!-- PENDING -->` rules in taste.md, show each one and ask:

```
Pending taste rules:

1. [Frontend] "New components must be barrel-exported in the parent index.ts" (source: phase-3 verification)
   → Accept / Reject / Edit?

2. [Security] "All API routes must validate request body with Zod" (source: phase-4 security review)
   → Accept / Reject / Edit?
```

On Accept: remove the `<!-- PENDING -->` marker.
On Reject: delete the line.
On Edit: let the human rewrite, then remove the marker.
