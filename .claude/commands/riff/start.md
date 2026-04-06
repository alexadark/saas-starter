---
description: Discovery pipeline - define the product before building it
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, AskUserQuestion, Agent
---

# /riff:start

The discovery pipeline. This is where you define WHAT to build before any code is written. The output is a complete project definition: PROJECT.md, ROADMAP.yaml, CONTEXT.md, and taste.md.

## Prerequisites

- RIFF must be installed (`/riff:init` already run)
- A git repository must exist

## The Pipeline (5 Stages)

### Stage 1: Product Discovery (Interactive)

Ask the user about their project. Start broad, go deep. Use AskUserQuestion for structured choices.

**Round 1 - The basics:**

- What is this project? (one sentence)
- Who is the target user? (persona)
- What problem does it solve?
- Is this greenfield or brownfield?

**Round 2 - Features & User Stories:**

- Core features (must-have for v1)
- Nice-to-have features (v2+)
- What this project explicitly does NOT do (scope boundaries)
- For each core feature: push the user to think of edge cases and user flows
- For each core feature: write 1-3 user stories in the format: "As a [persona], I want to [action] so that [outcome]"
  - Focus on behavior, not implementation
  - Include the primary happy path + key edge cases (error states, empty states, permissions)
  - These user stories become acceptance criteria seeds for the planner

**Round 3 - Technical:**

- Stack preferences (or let Claude decide based on requirements)
- External integrations (APIs, payment, auth providers)
  - For each external API: note it for `/api-discovery` before the relevant phase begins
  - Record API endpoints, auth method, and expected data in PROJECT.md
- Deployment target
- Performance/scale expectations

**Adaptive behavior:**

- If the user says "skip" or "you decide" on any question: make the decision, state it clearly, move on
- If the user is in an unfamiliar domain: ask more product questions, fewer technical ones
- If the user has strong opinions: push back on feature creep, ask "do you NEED this for v1?"
- Minimum 2 rounds of questions. Maximum 4 rounds. Don't over-interview.

### Stage 2: Architecture Design

Based on the answers, propose:

1. **Tech stack** with justification (or confirm the user's choice)
2. **Data model** as a Mermaid ER diagram
3. **Architecture diagram** as Mermaid (showing main components and their relationships)
4. **Key technical decisions** (auth approach, state management, API style, etc.)

Present this to the user for validation. They should correct what's wrong, confirm what's right.

### Stage 3: Wireframes

For each key screen/page, generate an ASCII wireframe:

```
+----------------------------------+
|  Logo        Nav    [Login]      |
+----------------------------------+
|                                  |
|  Hero Section                    |
|  "Main value proposition"        |
|                                  |
|  [Primary CTA]                   |
|                                  |
+----------------------------------+
|  Feature 1  |  Feature 2  |  F3 |
+----------------------------------+
```

- Cover the main user flow (3-8 screens depending on complexity)
- Include responsive notes where relevant
- Ask the user to validate or adjust

### Stage 4: Roadmap Generation

Break the project into phases. Each phase is a vertical slice (not a horizontal layer):

**Phase sizing rules:**

- Each phase should be completable in 1-3 build sessions
- Each phase produces something testable and demonstrable
- Phase 1 is ALWAYS the tracer bullet (thin end-to-end slice)
- Auth/payment/public API phases are always HITL

Write `ROADMAP.yaml` with all phases, ordered by dependency and priority.

### Stage 5: taste.md Bootstrap

Based on the stack and architecture decisions, generate an initial `taste.md`:

1. Read the relevant starter/template if the user has one
2. **Verify current best practices:** Use `ref_search_documentation` to check the chosen framework's latest conventions. Do NOT rely solely on training data.
3. If the user points to reference repos or books: extract rules from them
4. Section the rules: Architecture, Frontend, Backend, Security, Testing
5. Keep it to 10-15 rules initially - it grows over time
6. If Ref returns no results for the chosen stack, fall back to `npx ctx7 docs <framework> <topic>`

## Output Files

At the end of the pipeline, these files should exist:

| File           | Content                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PROJECT.md`   | Vision, users, features, user stories, wireframes, architecture diagrams, data model, stack, constraints, out of scope |
| `ROADMAP.yaml` | All phases with status/priority/mode/depends_on                                                                        |
| `CONTEXT.md`   | All locked decisions from the discovery conversation                                                                   |
| `taste.md`     | Initial architectural rules, sectioned by concern                                                                      |
| `STATE.md`     | Updated: phase 1, status: ready                                                                                        |

## After Completion

```
Discovery complete. Project defined:
- {{N}} features across {{M}} phases
- Phase 1 (tracer bullet): {{PHASE_1_TITLE}}
- Estimated total phases: {{M}}

Run /riff:next to start building phase 1.
```

## Anti-Patterns

- Don't skip wireframes for web projects - they catch UX issues before code
- Don't create more than 10 phases - if there are more, the project scope is too big for v1
- Don't plan horizontal phases ("all database first") - every phase is a vertical slice
- Don't generate code during discovery - this is planning only
- Don't create the .planning/phases/ directory yet - that happens during /riff:next
