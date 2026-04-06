---
description: Manual verification and security review
allowed-tools: Bash, Read, Glob, Grep, Write, Agent
args: "[phase-number]"
---

# /riff:check

Manual trigger for verification + security review. Use when you want to check the state of things yourself, not as part of the automatic /riff:next loop.

## Arguments

- No args: check the most recent phase (or the whole project if all phases done)
- `[phase-number]`: check a specific phase

## What You Do

### Phase Check (when phase-number provided or most recent)

1. **Spawn verifier agent** with:
   - PLAN.md for the target phase
   - SUMMARY.md if exists
   - Full codebase access

2. **Spawn security-reviewer agent** with:
   - Files modified in the target phase (from SUMMARY.md or git diff)
   - Full OWASP checklist

3. **Report** both results to the user

### Full Project Check (when all phases done)

1. **Cross-phase wiring check:**
   - Do all phases connect? (phase 1 output used by phase 2, etc.)
   - Any orphaned code from earlier phases that later phases didn't connect?

2. **Full security scan:**
   - All routes have auth
   - All inputs validated
   - No IDOR anywhere
   - No hardcoded secrets
   - Environment validated at startup
   - Error responses are safe

3. **taste.md compliance:**
   - Does the codebase follow the rules in taste.md?
   - Any violations to flag?

4. **Report** with overall project health score

## Output

```
# RIFF Check - Phase {{N}}

## Verification: {{PASS/FAIL/PASS WITH ISSUES}}
{{verification details}}

## Security: {{PASS/ISSUES FOUND}}
{{security findings by severity}}

## Recommended Actions
{{what to fix, if anything}}
```
