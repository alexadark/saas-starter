---
description: Structured debugging with mandatory failure-point checklist
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebSearch
args: "<issue description>"
---

# /riff:debug

Structured debugging mode. Exists because the #3 friction source in real usage is superficial debugging - fixing the first symptom without understanding the root cause.

## The Rule (Non-Negotiable)

**You MUST map ALL possible failure points BEFORE touching any code.**

No shortcuts. No "I think I see the bug." Map the chain first, test hypotheses second, fix third.

## Arguments

The issue description. Example:

- `/riff:debug users can see other users' data on the dashboard`
- `/riff:debug the build fails with "Cannot find module" after adding the new component`
- `/riff:debug webhook handler returns 500 intermittently`

## What You Do

### Step 0: Quick Triage

Before launching the full protocol, assess: is this a simple error or a deep investigation?

- **Simple** (typo, wrong import path, missing env var, syntax error): fix it directly, log in session file, skip to Step 4.
- **Deep** (unclear cause, intermittent, multi-component, or 2+ failed fix attempts): proceed with the full protocol below.

When debugging AI-generated code, apply extra scrutiny - AI code can look correct while being subtly wrong. Default to "deep" if the code was recently generated.

### Step 1: Check for Existing Session

Look in `.planning/debug/` for an existing session about this issue. If found:

- Read it
- Resume from where it left off
- Don't restart the investigation

### Step 2: Create Debug Session

If no existing session, create `.planning/debug/session-NNNN.md` with:

- Issue description
- Reproduction steps (if known)
- Timestamp

### Step 3: Spawn Debugger Agent

Use the debugger agent from `agents/debugger.md`. It will:

1. Understand the symptom
2. Map the full call chain
3. Enumerate 3+ hypotheses
4. Test each hypothesis with evidence
5. Fix the root cause (with rigorous verification)
6. Document everything in the session file

### Step 4: After Fix

- Verify the original issue is resolved (with evidence)
- Verify no new issues introduced
- Run relevant tests
- Commit: `riff(debug): fix <description>`
- Update the session file with resolution
- If the bug reveals a pattern: write to `.planning/mistakes/mistake-NNNN.md`

## Session Persistence

Debug sessions survive across conversations. The session file in `.planning/debug/` IS the investigation thread. Always check for existing sessions before starting a new one.

## Escalation

If the debugger agent has been through 2+ full hypothesis cycles without resolution, or the bug involves unfamiliar library/framework behavior, escalate to `/debug` (the debug-like-expert skill) for deep analysis mode with comprehensive methodology and domain-specific expertise.

## Anti-Patterns

- Don't skip the hypothesis enumeration step
- Don't fix the first thing that looks wrong
- Don't start a new session if one already exists for this issue
- Don't debug without reading the actual error output first
