# RIFF Framework

## Execution Rules

### Confidence Gate (before any execution)

Before starting any task, score confidence on 4 dimensions:

1. **Scope** - Is it clear what to do (plan vs execute vs investigate)?
2. **Target** - Is the file/system/module understood?
3. **Output** - Is the expected result defined?
4. **Risk** - Could this action be destructive or irreversible?

Any "no" → surface specific questions before proceeding. Do NOT guess.

### Assumptions Mode (before any planning)

1. Read the codebase and existing files
2. Surface what you intend to do with confidence levels: **Confident** / **Likely** / **Unclear**
3. Wait for human correction before proceeding
4. Only ask interview-style questions for product/feature decisions on new projects, NOT for code/architecture decisions

### Deviation Rules (R1-R4)

During execution, when reality doesn't match the plan:

- **R1 (Minor bug)** - Fix it, log in SUMMARY.md. No need to ask.
- **R2 (Missing piece)** - Add it if clearly needed, log in SUMMARY.md. No need to ask.
- **R3 (Architecture change)** - STOP. Ask the human. Never make architectural decisions autonomously.
- **R4 (Out of scope)** - Log in seeds/ with trigger condition. Do NOT implement.

### Atomic Commits

- Every task ends in exactly one git commit
- Never `git add .` or `git add -A` - stage files explicitly
- Commit message format: `riff(phase-N/task-M): description`
- Pre-commit hook must pass before commit is accepted

### Code Quality (Non-Negotiable)

- No `any` types in TypeScript
- No `console.log` in committed code
- No hardcoded secrets or API keys
- No `// TODO` without a matching seed or issue
- Validate all user input at system boundaries
- Auth checks on every protected route
- No IDOR: always scope queries to the authenticated user

## taste.md

- Sectioned by concern: `## Architecture` (always read), `## Frontend`, `## Backend`, `## Security`, `## Testing`
- Read `## Architecture` + the section relevant to the current task only (save tokens)
- Agents CAN add rules after a phase, but:
  - New rules must cite their source (book, repo, or lesson learned)
  - After any addition, auto-review: deduplicate, compress, cap at ~20 rules
  - Human validates additions at next `/riff:status`

## Context Awareness

- **FRESH (60-100%)** - Batch aggressively, minimal overhead
- **MODERATE (40-60%)** - Re-read key files before architectural decisions
- **DEPLETED (<40%)** - Checkpoint progress, prepare handoff, summarize before acting

## Security

The user's backend/security skill is self-assessed at 2.5-5/10. The framework compensates:

- Pre-commit hook blocks secrets, `any` types, console.log
- Security-reviewer agent runs automatically after every build phase
- Auth, payment, and public API phases are always HITL (never AFK)
