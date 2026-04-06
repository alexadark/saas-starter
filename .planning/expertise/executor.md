# Executor Expertise

### [phase-0] Starter Template Hardening

- **What happened:** node_modules was missing at start, had to run npm install before tests could run. RTK (Rust Token Killer) proxy intercepts vitest output and can obscure results - use `--reporter=verbose` for clearer output.
- **Lesson:** Always verify node_modules exists before running tests. Use verbose reporter when RTK is in the path.
- **Impact:** MEDIUM

### [phase-0] Rate limit IP test design

- **What happened:** First version of "prefers x-real-ip" test used the same IP (10.0.0.1) in both x-real-ip and x-forwarded-for, making it impossible to prove which header was actually used for bucketing.
- **Lesson:** When testing priority/precedence logic, use distinct values in each input so you can prove which one was selected. Same values = untestable.
- **Impact:** HIGH

### [phase-0] Biome formatting via hooks

- **What happened:** PostToolUse hooks auto-format files after every Edit/Write. No need to worry about tabs vs spaces during editing - the hook fixes it. But biome check still reports errors on files not yet formatted by hooks (e.g. vitest.config.ts which was only edited once).
- **Lesson:** Run `biome check --write .` once after all edits if you want a clean lint pass, or rely on the hooks to handle it per-file.
- **Impact:** LOW
