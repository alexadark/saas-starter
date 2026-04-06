---
description: The core loop - plan, build, verify the next phase
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion
args: "[--plan-only] [phase-number]"
---

# /riff:next

The heartbeat of RIFF. Picks the next task from ROADMAP.yaml, plans it, executes it, verifies it, and commits. One command to rule them all.

## Arguments

- No args: pick the next task automatically (highest priority, dependencies met, not blocked)
- `--plan-only`: create the plan but don't execute. Useful for reviewing before building.
- `[phase-number]`: explicitly target a specific phase instead of auto-picking

## The Loop

```
Read state → Pick next → Confidence gate → Plan → Execute → Verify → Commit → Update state
```

### Step 1: Read State

Read these files:

1. `ROADMAP.yaml` - all phases and their status
2. `STATE.md` - current position, blockers, decisions
3. `PROJECT.md` - project context (skim, don't deep-read every time)
4. Previous `SUMMARY.md` and `VERIFICATION.md` if they exist

### Step 2: Pick Next Phase

Selection logic:

1. Filter phases where `status: todo` and all `depends_on` phases are `done`
2. Sort by `priority` (P0 first)
3. If running in Ralph loop (AFK): filter to `mode: AFK` only
4. If no eligible phases: report completion or blockage

If the last phase's VERIFICATION.md has `FAIL`:

- Don't pick a new phase
- Instead, create a fix plan based on the verification failures
- Update the failed phase's status to `in-progress`
- Check out the existing branch: `git checkout riff/phase-N-slug` (it was not merged)

**Seed trigger check:** Before picking, scan `.planning/seeds/`. For each seed, read its `trigger:` field and evaluate against current state (phase count, stack changes, ROADMAP status). If a trigger is met:

- Surface it to the user: "Seed `seed-NNNN.md` trigger met: {{trigger}}. Promote to ROADMAP?"
- If yes: add as a new phase in ROADMAP.yaml, archive the seed
- If no: skip, leave the seed for later
- In AFK mode: log the triggered seed in STATE.md but don't promote (human decides)

### Step 2b: Create Phase Branch

Before planning, create a dedicated branch for this phase:

```bash
git checkout -b riff/phase-N-slug
```

Branch naming: `riff/phase-{id}-{slug}` (e.g., `riff/phase-2-billing`).

This gives each phase a clean git history and enables PR-based review/rollback.

**Important:** All subsequent work (planning, execution, verification) happens on this branch.

### Step 3: Confidence Gate

Before planning, score confidence on:

1. **Scope** - Is the phase description clear enough to plan from?
2. **Codebase** - Do I understand the current state of the code well enough?
3. **Dependencies** - Are all prerequisite phases truly complete and working?
4. **Risk** - Is there anything about this phase that could go wrong?

If ANY dimension < 0.7:

- Surface specific questions with confidence levels (Confident/Likely/Unclear)
- Wait for human input (or STOP if in AFK mode)

### Step 4: Plan (Planner Agent)

Spawn the planner agent in a fresh context with:

- ROADMAP.yaml (the phase to plan)
- PROJECT.md
- STATE.md
- CONTEXT.md
- taste.md (Architecture section + relevant section)
- Previous SUMMARY.md files
- `.planning/expertise/planner.md` if exists

The planner writes: `.planning/phases/N-slug/PLAN.md`

If `--plan-only` was passed: STOP here. Show the plan to the user and exit.

### Step 5: Execute (Executor Agent)

Spawn the executor agent in a fresh context with:

- The PLAN.md just created
- taste.md (Architecture + relevant section)
- `.planning/expertise/executor.md` if exists
- Access to the codebase

The executor:

- Implements each task with atomic commits
- Follows R1-R4 deviation rules
- Writes `.planning/phases/N-slug/SUMMARY.md`

If the executor hits R3 (architecture change needed):

- Execution pauses
- The issue is surfaced to the human
- Wait for decision before continuing

### Step 6: Verify (Verifier Agent)

Spawn the verifier agent in a fresh context with:

- PLAN.md (what was supposed to happen)
- SUMMARY.md (what the executor claims happened)
- Access to the codebase

The verifier:

- Runs the 3-level check (exists/substantive/wired)
- Checks acceptance criteria with actual evidence
- Runs security checklist
- Writes `.planning/phases/N-slug/VERIFICATION.md`

### Step 7: Security Review (Security Reviewer Agent)

Spawn the security-reviewer agent to scan the changes made in this phase:

- Focus on new/modified files listed in SUMMARY.md
- OWASP top 10 check
- IDOR check on any new data access
- Auth check on any new routes

If CRITICAL or HIGH findings: mark phase as `blocked` and report.

### Step 7b: Create PR and Merge

After security review passes, create a pull request and merge:

1. **Push the branch:**

   ```bash
   git push -u origin riff/phase-N-slug
   ```

2. **Create a PR:**

   ```bash
   gh pr create --title "riff(phase-N): PHASE_TITLE" --body "## Phase N: PHASE_TITLE\n\n### Built\n- artifacts from SUMMARY.md\n\n### Verification\n- PASS/FAIL from VERIFICATION.md\n\n### Security\n- PASS/issues from security review"
   ```

3. **Merge the PR:**

   ```bash
   gh pr merge --squash --delete-branch
   ```

4. **Return to main:**
   ```bash
   git checkout main
   git pull origin main
   ```

If verification or security FAILED: do NOT create the PR. Leave the branch open for fix iterations. The next `/riff:next` call will pick up the failed phase and continue on the same branch.

**In AFK mode (Ralph loop):** PR creation, merge, and branch cleanup are automatic. No human review required for AFK phases.

**In interactive mode:** Create the PR but wait for human confirmation before merging (unless the human has pre-approved auto-merge).

### Step 8: Update State

If verification PASSED:

- Update ROADMAP.yaml: phase `status: done`
- Update STATE.md: next phase info, decisions from this phase

If verification FAILED:

- Update ROADMAP.yaml: phase stays `in-progress`
- Update STATE.md: blocker = verification failures
- Next `/riff:next` will create a fix plan

### Step 8b: Learn (runs after PASS or FAIL)

Three self-improvement mechanisms run after every phase:

#### 1. Expertise files (`.planning/expertise/`)

Each agent that ran in this phase writes to its expertise file (`planner.md`, `executor.md`, `verifier.md`, `security-reviewer.md`). Use the template format:

```markdown
### [phase-N] Short title

- **What happened:** concrete situation (file, error, surprise)
- **Lesson:** what to do differently / what worked well
- **Impact:** HIGH | MEDIUM | LOW
```

Rules:

- Only write lessons that a future agent in a fresh context would benefit from
- Don't log routine successes ("task completed as planned") - only surprises
- On FAIL: the lesson is mandatory (what went wrong and why)
- On PASS with R1/R2 deviations: log what the plan missed
- Cap at 15 entries per file. When full, compress: merge similar entries, drop LOW-impact ones
- If the expertise file doesn't exist yet, create it from `~/DEV/frameworks/riff/templates/expertise.md`

#### 2. Taste proposals

After execution, review the phase for patterns that could become taste rules:

- Did a deviation (R1/R2) reveal a recurring codebase pattern? (e.g. "every loader needs error boundary")
- Did the security reviewer flag something structural? (e.g. "all API routes need rate limiting")
- Did the verifier catch a repeated wiring issue? (e.g. "new components always forget to register in barrel")

If a pattern is found:

1. Append it to `taste.md` in the relevant section with a `<!-- PENDING -->` marker:
   ```
   N. **Rule name** - Description. (Source: phase-N learning) <!-- PENDING -->
   ```
2. Log in STATE.md: "taste.md: 1 pending rule proposed (section: Frontend)"
3. The human validates at `/riff:status` (remove `<!-- PENDING -->` to accept, delete the line to reject)

Rules:

- Only propose rules that apply to FUTURE phases, not one-time fixes
- Must cite source: which phase, what evidence
- Auto-review: after adding, count total rules per section. If any section exceeds 10, flag for compression
- Never propose a rule that duplicates an existing one in taste.md

#### 3. Seed review

Check `.planning/seeds/` for seeds written during this phase (R4 deviations). For each:

- Ensure it has a `trigger:` field (if missing, add one based on context)
- Ensure it has enough detail for a future planner to understand the idea

### Step 9: Report

Show the user:

```
Phase N: {{TITLE}} - {{VERDICT}}

Built:
- {{artifact 1}}
- {{artifact 2}}

Deviations: {{count}} (R1: {{n}}, R2: {{n}}, R3: {{n}}, R4: {{n}})
Security: {{PASS/issues found}}

Next: Phase {{N+1}}: {{NEXT_TITLE}} ({{NEXT_PRIORITY}}, {{NEXT_MODE}})
```

## AFK Mode (Ralph Loop)

When called from the Ralph loop:

- Skip human interaction entirely
- On Confident/Likely assumptions: proceed
- On Unclear assumptions: STOP the loop, notify via Telegram
- On R3 deviation: STOP the loop, notify via Telegram
- On verification FAIL: STOP the loop, notify via Telegram
- On security CRITICAL/HIGH: STOP the loop, notify via Telegram
- On all phases complete: STOP the loop, notify "BUILD COMPLETE"

## Anti-Patterns

- Don't skip the confidence gate even if the phase seems obvious
- Don't run planner, executor, and verifier in the same context - each gets a FRESH context
- Don't continue to the next phase if verification failed - fix first
- Don't skip the security review - it's automatic, not optional
- Don't batch multiple phases in one /riff:next call - one phase at a time
