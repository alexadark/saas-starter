# Start Workflow — Project Initialization

> This workflow is executed by `/lean:start`.
> It has 5 sequential stages. Complete each stage before moving to the next.
> All user choice points MUST use the AskUserQuestion tool.

---

## Prerequisites

Load these references before beginning:

- @~/.claude/lean-gsd/references/stack-defaults.md — default stack context
- @~/.claude/lean-gsd/references/questioning.md — questioning techniques
- @~/.claude/lean-gsd/references/design-modules.md — product design guide

Templates available at:

- @~/.claude/lean-gsd/templates/project.md — PROJECT.md template
- @~/.claude/lean-gsd/templates/roadmap.md — ROADMAP.md template
- @~/.claude/lean-gsd/templates/state.md — STATE.md template
- @~/.claude/lean-gsd/templates/config.json — config.json template

---

## Stage 1: Deep Questioning

### Opening

Start with a warm, direct opener. Do NOT dump a list of questions.

Say something like:

> "What do you want to build?"

Then **follow the thread**. Use the techniques from `@~/.claude/lean-gsd/references/questioning.md`:

- **Follow energy** — Whatever they emphasized, dig into that
- **Challenge vagueness** — Never accept fuzzy answers. "Good" means what? "Users" means who?
- **Make the abstract concrete** — "Walk me through using this." "What does that actually look like?"
- **Clarify ambiguity** — "When you say Z, do you mean A or B?"
- **Surface assumptions** — "You're assuming X — is that true?"
- **Find edges** — "What happens when someone does this wrong?"
- **Reveal motivation** — "Why does this matter to you specifically?"

### What to Extract (Background Checklist)

Weave these naturally into conversation. Do NOT walk through them as a list:

1. **End Goal** — North-Star one-liner. "In one sentence, what does the world look like when this succeeds?"
2. **Specific Problem** — Root pain + quantified consequence. "What happens today without this?"
3. **User Types** — Per role: who they are, frustrations, urgent goals, usage patterns
4. **Business Model** — Revenue strategy, pricing tiers, rationale
5. **MVP Core Functionalities** — By role. "If you could only ship 3 features, which ones?"
6. **Key User Stories** — As a [role], I want [action], so that [value]. Aim for 5-10 high-quality stories.

### Using AskUserQuestion During Questioning

Use AskUserQuestion to help users think by presenting concrete options to react to.

When the user gives a vague answer:

```
AskUserQuestion:
  header: "{{TOPIC}}"
  question: "{{CLARIFYING_QUESTION}}"
  options:
    - label: "{{CONCRETE_OPTION_A}}"
      description: "{{DESCRIPTION_A}}"
    - label: "{{CONCRETE_OPTION_B}}"
      description: "{{DESCRIPTION_B}}"
    - label: "Let me explain"
      description: "I want to describe it differently"
```

Keep options to 2-4. They should be concrete interpretations, not generic categories.

### Anti-Patterns (Do NOT Do These)

- **Checklist walking** — Going through domains regardless of what they said
- **Canned questions** — "What are your success criteria?" regardless of context
- **Interrogation** — Firing questions without building on answers
- **Shallow acceptance** — Taking vague answers without probing
- **Premature constraints** — Asking about tech stack before understanding the idea
- **User skills** — NEVER ask about user's technical experience. Claude builds.

### Decision Gate: Ready for PROJECT.md?

When you have enough clarity to write a PROJECT.md that downstream phases can act on, present the gate:

```
AskUserQuestion:
  header: "Ready?"
  question: "I think I understand what you're after. Ready to create PROJECT.md?"
  options:
    - label: "Create PROJECT.md"
      description: "Let's move forward"
    - label: "Keep exploring"
      description: "I want to share more / ask me more"
```

If "Keep exploring" — ask what they want to add, or identify gaps and probe naturally. Loop until "Create PROJECT.md" is selected.

### Write PROJECT.md

When the user selects "Create PROJECT.md":

1. Read the template: `@~/.claude/lean-gsd/templates/project.md`
2. Fill in all sections from the conversation:
   - `{{PROJECT_NAME}}` — derived from the product name or working title
   - `{{DATE}}` — today's date
   - `{{END_GOAL}}` — the North-Star one-liner
   - `{{ROOT_PAIN}}` — the specific problem being solved
   - `{{CONSEQUENCE}}` — what happens if the problem isn't solved
   - `{{USER_TYPE}}` sections — one per role discovered
   - `{{REVENUE_STRATEGY}}` — how the product makes money
   - `{{PRICING_TIERS}}` — free/paid tier breakdown
   - `{{CORE_FUNCTIONALITIES}}` — per role, the must-haves
   - `{{USER_STORY}}` entries — the key user stories extracted
   - `{{STACK_SECTION}}` — from `@~/.claude/lean-gsd/references/stack-defaults.md`, noting any overrides discussed
   - `{{CONSTRAINTS}}` — any constraints or preferences mentioned
3. Write to `./PROJECT.md` in the project root
4. Confirm: "PROJECT.md created. Let's move to research options."

---

## Stage 2: Research Choice

Present the research options using AskUserQuestion:

```
AskUserQuestion:
  header: "Research"
  question: "Do you need domain or stack research before planning?"
  options:
    - label: "Skip research"
      description: "I know this domain and stack well"
    - label: "Domain research"
      description: "Research what users expect + common pitfalls (2 agents)"
    - label: "Full research"
      description: "Research stack + domain + architecture + pitfalls (4 agents)"
```

### If "Skip research"

Continue to Stage 3.

### If "Domain research"

Create the research output directory:

```bash
mkdir -p .planning/research
```

Spawn **2 research agents in parallel** using the Task tool:

**Agent 1: Features Research**

```
Task:
  description: "Research what users expect from {{PRODUCT_TYPE}} products"
  prompt: |
    {{FEATURES_RESEARCH_PROMPT}}
  subagent_type: "general-purpose"
```

Output: `.planning/research/FEATURES.md`

**Agent 2: Pitfalls Research**

```
Task:
  description: "Research common failures and mistakes in {{PRODUCT_TYPE}} products"
  prompt: |
    {{PITFALLS_RESEARCH_PROMPT}}
  subagent_type: "general-purpose"
```

Output: `.planning/research/PITFALLS.md`

Wait for both agents to complete. Then continue to Stage 3.

### If "Full research"

Create the research output directory:

```bash
mkdir -p .planning/research
```

Spawn **4 research agents in parallel** using the Task tool:

**Agent 1: Stack Research**

```
Task:
  description: "Evaluate stack choices for {{PROJECT_NAME}}"
  prompt: |
    {{STACK_RESEARCH_PROMPT}}
  subagent_type: "general-purpose"
```

Output: `.planning/research/STACK.md`

**Agent 2: Features Research**

```
Task:
  description: "Research what users expect from {{PRODUCT_TYPE}} products"
  prompt: |
    {{FEATURES_RESEARCH_PROMPT}}
  subagent_type: "general-purpose"
```

Output: `.planning/research/FEATURES.md`

**Agent 3: Architecture Research**

```
Task:
  description: "Research architecture patterns for {{PRODUCT_TYPE}}"
  prompt: |
    {{ARCHITECTURE_RESEARCH_PROMPT}}
  subagent_type: "general-purpose"
```

Output: `.planning/research/ARCHITECTURE.md`

**Agent 4: Pitfalls Research**

```
Task:
  description: "Research common failures and mistakes in {{PRODUCT_TYPE}} products"
  prompt: |
    {{PITFALLS_RESEARCH_PROMPT}}
  subagent_type: "general-purpose"
```

Output: `.planning/research/PITFALLS.md`

Wait for all 4 agents to complete.

Then generate a synthesis:

- Read all 4 research outputs
- Write `.planning/research/SUMMARY.md` — a concise synthesis of key findings, conflicts, and recommendations across all research
- Present the top 3-5 insights to the user before continuing

Continue to Stage 3.

---

## Stage 3: Product Design

Present the design module options using AskUserQuestion:

```
AskUserQuestion:
  header: "Product Design"
  question: "Which product design steps do you want before planning?"
  multiSelect: true
  options:
    - label: "Pages & Functionality (Recommended)"
      description: "Define every page, route, and feature — gives planner precise specs"
    - label: "Data Model Strategy"
      description: "Map features to database tables before coding"
    - label: "System Architecture"
      description: "Mermaid diagram of components and connections"
    - label: "Skip all"
      description: "Go straight to roadmap — I know exactly what I'm building"
```

### If "Skip all"

Continue to Stage 4.

### For Each Selected Module

Follow the rules in `@~/.claude/lean-gsd/references/design-modules.md`. The core approach for every module is **draft-first**: AI generates a complete draft from PROJECT.md (and research outputs if available), then the user validates and adjusts.

```bash
mkdir -p .planning/design
```

---

### Module: Pages & Functionality

**When selected**, generate the pages draft:

1. Read PROJECT.md — extract user types, core functionalities, and user stories
2. If research outputs exist, read `.planning/research/FEATURES.md` for additional context
3. Generate the full page map following the format in `@~/.claude/lean-gsd/references/design-modules.md` Module 1:
   - Group pages by user flow (auth flow first, then primary workflow, then settings)
   - For each page: route, access roles, priority, features table (with Layer and Priority columns), key interactions
   - Tag each feature as (Frontend), (Backend), or (Background Job)
   - Mark each feature as essential, consider, or skip

4. Write draft to `.planning/design/pages.md`

5. Surface the top 2-4 routing decisions for the user:

```
AskUserQuestion:
  header: "Page Architecture"
  question: "A few key decisions about your pages:"
  options:
    - label: "{{ROUTING_DECISION_A}}"
      description: "{{DESCRIPTION_A}}"
    - label: "{{ROUTING_DECISION_B}}"
      description: "{{DESCRIPTION_B}}"
    - label: "Looks good as-is"
      description: "The draft covers what I need"
    - label: "Let me review and adjust"
      description: "I want to make specific changes"
```

6. Apply user feedback and update `.planning/design/pages.md`

7. Run validation:
   - Does every user story from PROJECT.md map to at least one page?
   - Does every core functionality appear in at least one page's feature list?
   - Are there pages with no essential features? (flag for removal)

---

### Module: Data Model Strategy

**When selected**, generate the data model draft:

1. Read PROJECT.md — extract entities (users, things they create, things they interact with, relationships)
2. If Pages module was completed, read `.planning/design/pages.md` for features tagged as (Backend)
3. If research outputs exist, read relevant files for additional context
4. Generate the full data model following the format in `@~/.claude/lean-gsd/references/design-modules.md` Module 2:
   - For each entity: fields table, relationships, key decisions
   - Feature-to-table relationship matrix
   - Mark each entity's ownership (which user role or system)

5. Write draft to `.planning/design/data-model.md`

6. Surface the top 2-4 schema decisions for the user:

```
AskUserQuestion:
  header: "Data Model Decisions"
  question: "Key schema decisions to make:"
  options:
    - label: "{{SCHEMA_DECISION_A}}"
      description: "{{DESCRIPTION_A}}"
    - label: "{{SCHEMA_DECISION_B}}"
      description: "{{DESCRIPTION_B}}"
    - label: "Looks good as-is"
      description: "The draft covers what I need"
    - label: "Let me review and adjust"
      description: "I want to make specific changes"
```

7. Apply user feedback and update `.planning/design/data-model.md`

8. Run validation:
   - Does every (Backend) feature from the Pages module have a corresponding table?
   - Are there tables with no features mapping to them? (flag as dead tables)
   - Are there features that need data but have no table? (flag as missing entities)

---

### Module: System Architecture

**When selected**, generate the architecture draft:

1. Read PROJECT.md + any previously generated design files (pages.md, data-model.md)
2. If research outputs exist, read `.planning/research/ARCHITECTURE.md` for patterns
3. Identify components:
   - Frontend app (pages from Pages module or PROJECT.md)
   - API layer (backend features)
   - Database (entities from Data Model or PROJECT.md)
   - External services (auth provider, payment gateway, email service, etc.)
   - Background jobs (features tagged as "Background Job")
4. Generate the full architecture doc following the format in `@~/.claude/lean-gsd/references/design-modules.md` Module 3:
   - Mermaid diagram showing all components and connections
   - For each external service: purpose, provider, integration type, risk level, failure mode
   - Risk areas table

5. Write draft to `.planning/design/architecture.md`

6. Surface the top 2-4 architecture decisions for the user:

```
AskUserQuestion:
  header: "Architecture Decisions"
  question: "Key architecture decisions to make:"
  options:
    - label: "{{ARCH_DECISION_A}}"
      description: "{{DESCRIPTION_A}}"
    - label: "{{ARCH_DECISION_B}}"
      description: "{{DESCRIPTION_B}}"
    - label: "Looks good as-is"
      description: "The draft covers what I need"
    - label: "Let me review and adjust"
      description: "I want to make specific changes"
```

7. Apply user feedback and update `.planning/design/architecture.md`

8. Run validation:
   - Does every external service have a failure mode defined?
   - Are there components with no connections? (flag as orphaned)
   - Does data flow from user action to storage have a clear path?

---

### Cross-Module Validation

If more than one module was selected, run cross-module validation:

1. **Pages -> Data Model:** Every page that displays data has a corresponding entity
2. **Data Model -> Architecture:** Every entity is stored in a component shown in the architecture diagram
3. **Architecture -> Pages:** Every external service connection is visible in at least one page's features
4. **Feature coverage:** Every v1 feature from PROJECT.md appears in at least one module's output

Report any gaps to the user. Fix issues before proceeding.

---

## Stage 4: Feature Scoping

### Extract Features

Gather all features from:

- PROJECT.md — MVP Core Functionalities and Key User Stories
- `.planning/design/pages.md` — features tagged as essential (if it exists)
- `.planning/design/data-model.md` — entity-related features (if it exists)
- `.planning/research/FEATURES.md` — user-expected features (if research was done)

Compile a consolidated feature list. Remove duplicates. Present them grouped by functional area.

### Categorization

Present features to the user for categorization:

```
AskUserQuestion:
  header: "Feature Scoping"
  question: "Let's categorize these features. I've made initial suggestions based on our conversation — adjust as needed."
  multiSelect: true
  options:
    - label: "Review v1 features"
      description: "See and adjust what's in the 'Build Now' list"
    - label: "Review 'Later' features"
      description: "See and adjust what's deferred"
    - label: "Looks good"
      description: "Your categorization matches what I want"
```

**The AI should propose an initial categorization** based on the conversation:

- Features explicitly discussed as MVP -> v1
- Features mentioned as "nice to have" or "eventually" -> Later
- Features explicitly excluded -> Out of Scope
- Features from research that weren't discussed -> Later (default)

Present the proposed categorization clearly:

```markdown
### v1 (Build Now)

- Feature A
- Feature B
- Feature C

### Later

- Feature D
- Feature E

### Out of Scope

- Feature F
```

Use AskUserQuestion to let the user move features between categories:

```
AskUserQuestion:
  header: "Adjust Scope"
  question: "Want to move any features between categories?"
  options:
    - label: "Move something to v1"
      description: "Promote a feature to Build Now"
    - label: "Move something to Later"
      description: "Defer a feature"
    - label: "Move something to Out of Scope"
      description: "Remove a feature entirely"
    - label: "Done — scope is set"
      description: "Proceed with this categorization"
```

Loop until "Done — scope is set" is selected.

**Important:** Simple lists only. No REQ-IDs, no traceability matrices.

---

## Stage 5: Roadmap Generation

### Generate ROADMAP.md

1. Read the template: `@~/.claude/lean-gsd/templates/roadmap.md`
2. Take the v1 features from Stage 4 and decompose them into phases
3. Each phase should be a **vertical slice** — not a horizontal layer:
   - **Good:** "Phase 1: Auth + Landing" (user can sign up and see the app)
   - **Bad:** "Phase 1: Database Setup" (no user-visible outcome)
4. Each phase should result in something demonstrable
5. Order phases by dependency — what must exist before the next can work
6. Assign features to phases

Fill in the template:

- `{{PROJECT_NAME}}` — from PROJECT.md
- `{{DATE}}` / `{{LAST_UPDATED}}` — today's date
- `{{V1_FEATURE}}` entries — from Stage 4
- `{{LATER_FEATURE}}` entries — from Stage 4
- `{{OUT_OF_SCOPE}}` entries — from Stage 4
- `{{TOTAL_PHASES}}` — count of phases
- `{{COMPLETED_PHASES}}` — 0
- `{{CURRENT_PHASE}}` — "Not started"
- `{{REMAINING_PHASES}}` — same as total
- `{{PHASE}}` entries — each with NUMBER, NAME, GOAL, STATUS ("not started"), and FEATURES

Write to `./ROADMAP.md` in the project root.

### Generate STATE.md

1. Read the template: `@~/.claude/lean-gsd/templates/state.md`
2. Fill in initial state:
   - `{{PROJECT_NAME}}` — from PROJECT.md
   - `{{LAST_UPDATED}}` — today's date
   - `{{CURRENT_PHASE_NUMBER}}` — 1
   - `{{CURRENT_PHASE_NAME}}` — name of Phase 1
   - `{{CURRENT_PLAN}}` — "Not started"
   - `{{CURRENT_WAVE}}` — "N/A"
   - `{{STATUS}}` — "Initialized"
   - No decisions, no blockers, no quick tasks, no sessions yet

Write to `./STATE.md` in the project root.

### Generate config.json

1. Read the template: `@~/.claude/lean-gsd/templates/config.json`
2. Fill in:
   - `project_name` — from PROJECT.md
   - Keep other defaults unless the user specified preferences during questioning

Write to `./.planning/config.json`.

### Create Directory Structure

```bash
mkdir -p .planning/phases
mkdir -p .planning/sessions
mkdir -p .planning/design
```

Create phase directories based on the roadmap:

```bash
mkdir -p .planning/phases/01-{{PHASE_1_SLUG}}
mkdir -p .planning/phases/02-{{PHASE_2_SLUG}}
# ... for each phase
```

### Final Summary

Display a summary of everything created:

```markdown
---

## Project Initialized

**Project:** {{PROJECT_NAME}}
**Phases:** {{TOTAL_PHASES}}
**v1 Features:** {{V1_FEATURE_COUNT}}

### Files Created
- `PROJECT.md` — Project vision and context
- `ROADMAP.md` — Phases and feature assignments
- `STATE.md` — Session continuity tracking
- `.planning/config.json` — Workflow preferences
- `.planning/design/` — Product design documents (if selected)
- `.planning/research/` — Research outputs (if selected)
- `.planning/phases/` — Phase directories
- `.planning/sessions/` — Session snapshots

### Phase Overview
| # | Name | Features |
|---|------|----------|
{{PHASE_TABLE}}

---

### Next Up

Run `/lean:plan 1` to create the execution plan for Phase 1: {{PHASE_1_NAME}}.

---
```

---

## Research Agent Prompt Templates

These prompts are used in Stage 2 when research is selected. Each is spawned via the Task tool.

---

### Agent: Stack Research

**Used in:** Full research only
**Output:** `.planning/research/STACK.md`

```
Task:
  description: "Stack Research for {{PROJECT_NAME}}"
  prompt: |
    You are a stack research agent. Your job is to evaluate technology choices
    for a new project and provide actionable recommendations.

    ## Project Context
    {{PROJECT_SUMMARY_FROM_PROJECT_MD}}

    ## Current Default Stack
    {{STACK_DEFAULTS_FROM_REFERENCE}}

    ## Your Task

    Research and evaluate the technology stack for this project. For each layer
    of the stack (framework, database, auth, payments, deployment, UI, email),
    evaluate whether the default choice is appropriate or if an alternative
    would be better for THIS specific project.

    Use WebSearch to find:
    - Current best practices for {{PRODUCT_TYPE}} applications
    - Known limitations of the default stack choices for this use case
    - Alternative technologies that might be better suited
    - Performance benchmarks and comparisons relevant to the project's scale

    ## Output Format

    Write your findings to `.planning/research/STACK.md` with this structure:

    # Stack Research — {{PROJECT_NAME}}

    > Generated: {{DATE}}

    ## Recommendation Summary
    | Layer | Default | Recommendation | Confidence | Why |
    |-------|---------|---------------|------------|-----|

    ## Detailed Analysis

    ### {{LAYER_NAME}}
    **Default:** {{DEFAULT_CHOICE}}
    **Recommendation:** {{RECOMMENDATION}}
    **Confidence:** High / Medium / Low

    **Why:**
    {{REASONING}}

    **Alternatives Considered:**
    - {{ALTERNATIVE}} — {{WHY_NOT}}

    **Sources:**
    - {{SOURCE_URLS}}

    (Repeat for each stack layer)

    ## Key Risks
    - {{RISK_DESCRIPTION}}

    ## Final Stack Recommendation
    {{FINAL_STACK_SUMMARY}}

    IMPORTANT: Be specific to THIS project. Do not give generic advice.
    Use WebSearch and WebFetch to find real, current information.
    Write the output file when complete.
  subagent_type: "general-purpose"
```

---

### Agent: Features Research

**Used in:** Domain research, Full research
**Output:** `.planning/research/FEATURES.md`

```
Task:
  description: "Features Research for {{PROJECT_NAME}}"
  prompt: |
    You are a features research agent. Your job is to research what users
    expect from products similar to the one being built.

    ## Project Context
    {{PROJECT_SUMMARY_FROM_PROJECT_MD}}

    ## User Types
    {{USER_TYPES_FROM_PROJECT_MD}}

    ## Your Task

    Research what users expect from {{PRODUCT_TYPE}} products. Focus on:
    - Features that users take for granted (table stakes)
    - Features that delight users (differentiators)
    - Features that users request but rarely use (traps)
    - Feature gaps in existing competing products

    Use WebSearch to find:
    - Competitor analysis for {{PRODUCT_TYPE}} products
    - User reviews and complaints about existing solutions
    - Feature comparison matrices
    - Product Hunt launches and user feedback for similar products

    ## Output Format

    Write your findings to `.planning/research/FEATURES.md` with this structure:

    # Features Research — {{PROJECT_NAME}}

    > Generated: {{DATE}}

    ## Table Stakes (Must Have)
    Features users will expect without being asked:
    - {{FEATURE}} — {{WHY_EXPECTED}}

    ## Differentiators (Opportunity)
    Features that could set this product apart:
    - {{FEATURE}} — {{WHY_DIFFERENT}}

    ## Feature Traps (Avoid)
    Features that seem important but aren't worth building:
    - {{FEATURE}} — {{WHY_TRAP}}

    ## Competitor Landscape
    | Competitor | Strengths | Weaknesses | Pricing |
    |-----------|-----------|------------|---------|

    ## User Expectations by Role
    ### {{ROLE_NAME}}
    - Expects: {{EXPECTATIONS}}
    - Frustrated by: {{FRUSTRATIONS_IN_EXISTING_TOOLS}}

    ## Recommended Feature Priorities
    1. {{FEATURE}} — {{RATIONALE}}

    ## Sources
    - {{SOURCE_URLS}}

    IMPORTANT: Be specific to THIS project's domain.
    Use WebSearch and WebFetch to find real, current information.
    Write the output file when complete.
  subagent_type: "general-purpose"
```

---

### Agent: Architecture Research

**Used in:** Full research only
**Output:** `.planning/research/ARCHITECTURE.md`

````
Task:
  description: "Architecture Research for {{PROJECT_NAME}}"
  prompt: |
    You are an architecture research agent. Your job is to research
    architecture patterns appropriate for the project being built.

    ## Project Context
    {{PROJECT_SUMMARY_FROM_PROJECT_MD}}

    ## Stack
    {{STACK_FROM_PROJECT_MD_OR_DEFAULTS}}

    ## Your Task

    Research architecture patterns for {{PRODUCT_TYPE}} applications. Focus on:
    - Common architecture patterns used by similar products
    - Scaling considerations for the expected usage pattern
    - Integration patterns for external services (auth, payments, email, etc.)
    - Data flow patterns (real-time vs batch, sync vs async)
    - Deployment architecture (edge, serverless, containers, etc.)

    Use WebSearch to find:
    - Architecture case studies for {{PRODUCT_TYPE}} applications
    - Best practices for the chosen tech stack
    - Common architectural mistakes for this type of application
    - Scaling strategies relevant to the business model

    ## Output Format

    Write your findings to `.planning/research/ARCHITECTURE.md` with this structure:

    # Architecture Research — {{PROJECT_NAME}}

    > Generated: {{DATE}}

    ## Recommended Pattern
    **Pattern:** {{ARCHITECTURE_PATTERN}}
    **Why:** {{REASONING}}

    ## Component Overview
    ```mermaid
    graph TB
        {{RECOMMENDED_ARCHITECTURE_DIAGRAM}}
    ```

    ## Key Architecture Decisions
    | Decision | Recommendation | Alternative | Trade-off |
    |----------|---------------|-------------|-----------|

    ## Integration Patterns
    ### {{SERVICE_NAME}}
    **Pattern:** {{INTEGRATION_PATTERN}}
    **Why:** {{REASONING}}
    **Watch out for:** {{GOTCHAS}}

    ## Scaling Considerations
    - {{SCALING_POINT}}

    ## Anti-Patterns to Avoid
    - {{ANTI_PATTERN}} — {{WHY_BAD}}

    ## Sources
    - {{SOURCE_URLS}}

    IMPORTANT: Be specific to THIS project and THIS stack.
    Use WebSearch and WebFetch to find real, current information.
    Write the output file when complete.
  subagent_type: "general-purpose"
````

---

### Agent: Pitfalls Research

**Used in:** Domain research, Full research
**Output:** `.planning/research/PITFALLS.md`

```
Task:
  description: "Pitfalls Research for {{PROJECT_NAME}}"
  prompt: |
    You are a pitfalls research agent. Your job is to research common
    failures, mistakes, and gotchas for the type of product being built.

    ## Project Context
    {{PROJECT_SUMMARY_FROM_PROJECT_MD}}

    ## Your Task

    Research common failures and mistakes when building {{PRODUCT_TYPE}} products.
    Focus on:
    - Why similar products fail (business reasons)
    - Common technical mistakes (architecture, security, performance)
    - UX anti-patterns specific to this domain
    - Regulatory or compliance gotchas
    - Scaling problems that hit at specific thresholds
    - Integration pitfalls with common services

    Use WebSearch to find:
    - Post-mortems from failed similar products
    - "What I wish I knew" articles from builders in this space
    - Common security vulnerabilities for this type of application
    - Performance bottlenecks specific to the chosen stack
    - Regulatory requirements (GDPR, SOC2, PCI, etc.) if applicable

    ## Output Format

    Write your findings to `.planning/research/PITFALLS.md` with this structure:

    # Pitfalls Research — {{PROJECT_NAME}}

    > Generated: {{DATE}}

    ## Critical Pitfalls (Will Kill the Product)
    - {{PITFALL}} — {{WHY_CRITICAL}} — {{MITIGATION}}

    ## Technical Pitfalls (Will Slow You Down)
    - {{PITFALL}} — {{IMPACT}} — {{MITIGATION}}

    ## UX Pitfalls (Will Lose Users)
    - {{PITFALL}} — {{IMPACT}} — {{MITIGATION}}

    ## Business Pitfalls (Will Waste Time)
    - {{PITFALL}} — {{IMPACT}} — {{MITIGATION}}

    ## Compliance & Security
    - {{REQUIREMENT}} — {{APPLIES_WHEN}} — {{HOW_TO_HANDLE}}

    ## Scaling Thresholds
    | Threshold | What Breaks | Fix |
    |-----------|-------------|-----|

    ## Lessons from Failed Similar Products
    ### {{PRODUCT_NAME}}
    **What happened:** {{DESCRIPTION}}
    **Lesson:** {{TAKEAWAY}}

    ## Top 5 Recommendations
    1. {{RECOMMENDATION}}

    ## Sources
    - {{SOURCE_URLS}}

    IMPORTANT: Be specific to THIS project and THIS domain.
    Use WebSearch and WebFetch to find real, current information.
    Write the output file when complete.
  subagent_type: "general-purpose"
```

---

### Research Summary (Full Research Only)

After all 4 research agents complete, generate a synthesis:

```markdown
# Research Summary — {{PROJECT_NAME}}

> Generated: {{DATE}}
> Research mode: Full

## Key Findings

### Stack

{{TOP_2_3_STACK_INSIGHTS}}

### Features

{{TOP_2_3_FEATURE_INSIGHTS}}

### Architecture

{{TOP_2_3_ARCHITECTURE_INSIGHTS}}

### Pitfalls

{{TOP_2_3_PITFALL_INSIGHTS}}

## Conflicts & Trade-offs

{{ANY_CONTRADICTIONS_BETWEEN_RESEARCH_OUTPUTS}}

## Top Recommendations

1. {{RECOMMENDATION}}
2. {{RECOMMENDATION}}
3. {{RECOMMENDATION}}
4. {{RECOMMENDATION}}
5. {{RECOMMENDATION}}

## Impact on PROJECT.md

{{SUGGESTED_UPDATES_TO_PROJECT_MD_IF_ANY}}
```

Write to `.planning/research/SUMMARY.md`.

Present the top 3-5 insights to the user and ask if they want to update PROJECT.md based on findings:

```
AskUserQuestion:
  header: "Research Complete"
  question: "Research is done. Here are the key findings. Want to update PROJECT.md?"
  options:
    - label: "Update PROJECT.md"
      description: "Incorporate research findings into the project definition"
    - label: "Keep PROJECT.md as-is"
      description: "Noted — I'll use the research during planning instead"
```

If "Update PROJECT.md" — apply relevant findings and rewrite PROJECT.md with the updates.

---

_This workflow is the entry point for every new project._
_Created for `/lean:start` — the most complex command in the framework._
_Referenced by: `~/.claude/lean-gsd/commands/start.md`_
