# Plan Phase Workflow — Phase Planning

> This workflow is executed by `/lean:plan`.
> It spawns the `lean-planner` agent to create PLAN.md files for a target phase.
> No checker loop, no revision protocol. If the plan is bad, user reviews and re-runs.

---

## Prerequisites

Agent definition:
- @~/.claude/lean-gsd/agents/lean-planner.md — the planner agent prompt

Templates available at:
- @~/.claude/lean-gsd/templates/plan.md — PLAN.md template
- @~/.claude/lean-gsd/templates/summary.md — SUMMARY.md template (for reference by planner)

---

## Step 1: Load Project State

Read these core files from the project root:

```bash
cat ./PROJECT.md
cat ./ROADMAP.md
cat ./STATE.md
```

Also check for design documents:

```bash
ls .planning/design/*.md 2>/dev/null
```

And check for codebase documentation:

```bash
ls .planning/codebase/*.md 2>/dev/null
```

And load the config:

```bash
cat .planning/config.json 2>/dev/null
```

**Extract from these files:**
- Project name, end goal, tech stack
- All phase definitions from ROADMAP.md (names, goals, features, statuses)
- Current position from STATE.md (current phase, plan, wave, status)
- Design documents content (pages.md, data-model.md, architecture.md — if they exist)
- Any decisions and blockers from STATE.md

**Fail fast:** If PROJECT.md or ROADMAP.md do not exist, stop and tell the user to run `/lean:start` first.

---

## Step 2: Resolve Target Phase

Parse the command arguments to determine which phase to plan.

### If phase-number was provided:

Use that phase number. Find the matching phase in ROADMAP.md.

```
Target phase = Phase {phase-number} from ROADMAP.md
```

**Validation:**
- Phase must exist in ROADMAP.md
- Phase status should not already be "completed" (warn the user if it is and ask for confirmation)

### If phase-number was NOT provided:

Determine the target phase from STATE.md and ROADMAP.md:

1. Check STATE.md `Current Position` — if a phase is listed and its status is not "completed", use that phase
2. Otherwise, find the first phase in ROADMAP.md with status "not started" or "in progress"
3. If all phases are completed, inform the user: "All phases are complete. Nothing left to plan."

```
Target phase = first incomplete phase from ROADMAP.md
```

### Extract Phase Details

From ROADMAP.md, extract for the target phase:
- Phase number and name (e.g., `01-auth-and-landing`)
- Phase goal
- Features assigned to this phase
- Phase status

Construct the phase directory path:

```bash
PHASE_DIR=".planning/phases/{PHASE_NUMBER}-{PHASE_SLUG}"
mkdir -p "$PHASE_DIR"
```

### Check for Existing Plans

```bash
ls "$PHASE_DIR"/*-PLAN.md 2>/dev/null
```

**If plans already exist:**
- List them to the user
- Ask: "Plans already exist for this phase. Do you want to re-plan (overwrites existing plans) or skip?"
- If skip, stop the workflow
- If re-plan, proceed (the planner will overwrite)

---

## Step 3: Optional Research (--research flag)

**Only execute this step if the `--research` flag was provided in the command arguments.**

If `--research` is NOT set, skip to Step 4.

### Spawn Research Agent

Create the research output directory:

```bash
mkdir -p "$PHASE_DIR"
```

Spawn a general-purpose research agent via the Task tool:

```
Task:
  description: "Research for Phase {PHASE_NUMBER}: {PHASE_NAME}"
  prompt: |
    You are a research agent preparing context for a planning phase.

    ## Phase Context
    **Phase:** {PHASE_NUMBER} — {PHASE_NAME}
    **Goal:** {PHASE_GOAL}
    **Features:** {PHASE_FEATURES}

    ## Project Context
    **Project:** {PROJECT_NAME}
    **Stack:** {TECH_STACK_FROM_PROJECT_MD}

    ## Your Task

    Research the libraries, APIs, patterns, and approaches relevant to this
    phase's goal and features. Focus on:
    - Library documentation and current best practices for the stack
    - API patterns and integration approaches for the features
    - Known gotchas, breaking changes, or migration notes
    - Code examples and recommended patterns

    Use WebSearch and WebFetch to find real, current information.
    Use Context7 (resolve-library-id + query-docs) for library-specific docs.

    ## Output

    Write your findings to `{PHASE_DIR}/RESEARCH.md` with this structure:

    # Phase {PHASE_NUMBER} Research: {PHASE_NAME}

    > Generated: {DATE}

    ## Key Findings
    {Organized by topic area relevant to the phase}

    ## Library Notes
    {Version requirements, API patterns, gotchas}

    ## Recommended Patterns
    {Code patterns to follow, with examples}

    ## Pitfalls to Avoid
    {Known issues, anti-patterns, breaking changes}

    Be specific to THIS phase and THIS stack. Write the file when complete.
```

Wait for the research agent to complete before proceeding.

---

## Step 4: Gather Prior Phase Context

Check for completed prior phases that the planner might need:

```bash
ls .planning/phases/*/\*-SUMMARY.md 2>/dev/null
```

**Build a list of prior SUMMARY file paths** — only those from phases with status "completed" in ROADMAP.md.

The planner agent will decide which summaries are actually relevant (shared subsystems, dependencies, pattern decisions). Pass the file paths, not the contents.

---

## Step 5: Spawn Planner Agent

Spawn the `lean-planner` agent via the Task tool. Pass FILE PATHS, not file contents.

```
Task:
  description: "Plan Phase {PHASE_NUMBER}: {PHASE_NAME}"
  prompt: |
    You are the lean-planner agent.
    @~/.claude/lean-gsd/agents/lean-planner.md

    ## Assignment

    Plan Phase {PHASE_NUMBER}: {PHASE_NAME}

    **Goal:** {PHASE_GOAL}
    **Features:** {PHASE_FEATURES}

    ## Context Files (Read these)

    - Project definition: `./PROJECT.md`
    - Roadmap: `./ROADMAP.md`
    - Design documents (read if they exist):
      - `.planning/design/pages.md`
      - `.planning/design/data-model.md`
      - `.planning/design/architecture.md`
    {IF RESEARCH_EXISTS}
    - Phase research: `{PHASE_DIR}/RESEARCH.md`
    {/IF}
    {IF PRIOR_SUMMARIES_EXIST}
    - Prior phase summaries (read ONLY if relevant to this phase's work):
    {FOR EACH SUMMARY_PATH}
      - `{SUMMARY_PATH}`
    {/FOR}
    {/IF}
    {IF CODEBASE_DOCS_EXIST}
    - Codebase documentation (read relevant ones):
    {FOR EACH CODEBASE_DOC}
      - `{CODEBASE_DOC_PATH}`
    {/FOR}
    {/IF}

    ## Plan Template

    Use the plan template structure from:
    @~/.claude/lean-gsd/templates/plan.md

    ## Output

    Write PLAN.md files to: `{PHASE_DIR}/`

    Naming convention: `{PHASE_NUMBER}-{PHASE_SLUG}-{NN}-PLAN.md`
    Example: `01-auth-01-PLAN.md`, `01-auth-02-PLAN.md`

    Follow your execution flow:
    1. Load project state from the files above
    2. Identify the phase and its scope
    3. Perform inline research if needed (new libraries, unfamiliar APIs)
    4. Read prior summaries only if relevant
    5. Break work into tasks, build dependency graph, assign waves
    6. Group tasks into plans (2-3 tasks each, ~50% context target)
    7. Derive must-haves using goal-backward methodology
    8. Write PLAN.md files with full frontmatter and XML task structure
    9. Commit plan files and updated ROADMAP.md
    10. Return the PLANNING COMPLETE structured response
```

Wait for the planner agent to complete.

---

## Step 6: Verify Plan Output

After the planner returns, verify the output:

```bash
ls "$PHASE_DIR"/*-PLAN.md 2>/dev/null
```

**Validation checks:**
- At least one PLAN.md file exists
- Each PLAN.md has valid YAML frontmatter (phase, plan, type, wave, depends_on, files_modified, autonomous, must_haves)
- Wave numbers are consistent (dependencies in lower waves than dependents)

If validation fails, report the issue to the user. Do not auto-fix — the user can re-run `/lean:plan`.

---

## Step 7: Update State

Update STATE.md to reflect that planning is complete for this phase:

- Set `Phase` to the target phase number and name
- Set `Plan` to "Planned — {N} plan(s)"
- Set `Wave` to "Ready"
- Set `Status` to "Planned"
- Update `Last Updated` to today's date

---

## Step 8: Display Plan Summary

Parse the planner's structured return or read the created PLAN.md files to display:

```markdown
---

## Planning Complete

**Phase:** {PHASE_NUMBER} — {PHASE_NAME}
**Plans:** {N} plan(s) in {M} wave(s)

### Wave Structure

| Wave | Plans | Autonomous |
|------|-------|------------|
| 1 | {plan-list} | {yes/no per plan} |
| 2 | {plan-list} | {yes/no per plan} |

### Plans Created

| Plan | Objective | Tasks | Wave | Files |
|------|-----------|-------|------|-------|
| {phase}-01 | {brief} | {count} | {wave} | {key files} |
| {phase}-02 | {brief} | {count} | {wave} | {key files} |

### File Ownership

Verify no file conflicts between same-wave plans:

| File | Owned By |
|------|----------|
| {file-path} | {plan-id} |

---

### Next Up

Execute the phase plans:

```
/lean:build {PHASE_NUMBER}
```

Clear your context window first for fresh execution with full 200k context per agent.

---
```

---

*This workflow handles phase planning for the Lean GSD framework.*
*No checker loop, no revision protocol — one pass, done.*
*Referenced by: `~/.claude/lean-gsd/commands/plan.md`*
