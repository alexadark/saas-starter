# Product Design Modules

> These modules bridge the gap between PROJECT.md (vision) and PLAN.md (execution).
> Each module uses a "draft-first" approach: AI generates from PROJECT.md, user validates and adjusts.
> Outputs are saved to `.planning/design/` and loaded by the planner agent as context.

---

## Design Principles

1. **AI proposes, user validates** — Generate a complete draft, don't ask 20 questions
2. **Lead with key decisions** — Surface the 2-4 most important choices first, details after
3. **Responsibility tagging** — Mark each feature as (Frontend), (Backend), or (Background Job)
4. **Priority indicators** — Mark items as essential, consider, or skip
5. **Context-aware** — If existing code/schema exists in the project, analyze it BEFORE recommending changes

---

## Module 1: Pages & Functionality

**Purpose:** Define every page, its route, features, and responsibility layer. Gives the planner precise specs for what each page does.

**Output:** `.planning/design/pages.md`

### How to Generate

1. **Extract pages from PROJECT.md** — Read user types, core functionalities, and user stories. Each distinct screen or view becomes a page.

2. **For each page, define:**

```markdown
### Page: {{PAGE_NAME}}

**Route:** `/{{ROUTE_PATH}}`
**Access:** {{USER_ROLES_WITH_ACCESS}}
**Priority:** essential | consider | skip

#### Features
| Feature | Layer | Priority | Notes |
|---------|-------|----------|-------|
| {{FEATURE}} | Frontend / Backend / Background Job | essential / consider / skip | {{NOTES}} |

#### Key Interactions
- {{INTERACTION_DESCRIPTION}}
```

3. **Group pages by user flow** — Not alphabetically, but by how users navigate. Start with auth flow, then primary workflow, then settings.

4. **Surface route decisions** — Present the top 2-4 routing decisions to the user:
   - "Should the dashboard be the landing page or a separate `/dashboard`?"
   - "Nested routes or flat routes for settings?"
   - "Public vs authenticated page boundary?"

### Validation Questions
- Does every user story from PROJECT.md map to at least one page?
- Does every core functionality from PROJECT.md appear in at least one page's feature list?
- Are there pages with no essential features? (candidate for removal)

---

## Module 2: Data Model Strategy

**Purpose:** Map features to database tables and surface key schema decisions upfront. Prevents mid-build schema redesigns.

**Output:** `.planning/design/data-model.md`

### How to Generate

1. **Extract entities from PROJECT.md** — Users, the things they create, the things they interact with, the relationships between them.

2. **For each entity, define:**

```markdown
### Entity: {{ENTITY_NAME}}

**Maps to features:** {{FEATURES_LIST}}
**Owned by:** {{USER_ROLE}} (or system)

#### Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | uuid/cuid | yes | Primary key |
| {{FIELD}} | {{TYPE}} | yes/no | {{NOTES}} |

#### Relationships
- {{RELATIONSHIP_DESCRIPTION}} (one-to-many, many-to-many, etc.)

#### Key Decisions
- {{DECISION_QUESTION}} → {{PROPOSED_ANSWER}}
```

3. **Build the feature-to-table relationship matrix:**

```markdown
## Feature → Table Map

| Feature | Tables Involved | Primary Table | Type |
|---------|----------------|---------------|------|
| {{FEATURE}} | {{TABLES}} | {{PRIMARY}} | CRUD / Read-only / Aggregation |
```

4. **Surface schema decisions** — Present the top 2-4 schema decisions to the user:
   - "Soft delete or hard delete for user accounts?"
   - "Separate `profiles` table or keep everything in `users`?"
   - "Store pricing in the database or in code?"

### Validation Questions
- Does every "Backend" feature from the Pages module have a corresponding table?
- Are there tables with no features mapping to them? (dead tables)
- Are there features that need data but have no table? (missing entities)

---

## Module 3: System Architecture

**Purpose:** Generate a visual map of component relationships, external services, and risk areas. Gives the planner and executor context on system boundaries.

**Output:** `.planning/design/architecture.md`

### How to Generate

1. **Identify components from PROJECT.md + previous modules:**
   - Frontend app (pages from Module 1)
   - API layer (backend features from Module 1)
   - Database (entities from Module 2)
   - External services (auth provider, payment gateway, email service, etc.)
   - Background jobs (features tagged as "Background Job" in Module 1)

2. **Generate Mermaid diagram:**

```mermaid
graph TB
    subgraph Frontend
        {{PAGES}}
    end

    subgraph API
        {{API_ROUTES}}
    end

    subgraph Database
        {{TABLES}}
    end

    subgraph External
        {{EXTERNAL_SERVICES}}
    end

    subgraph Background
        {{BACKGROUND_JOBS}}
    end

    %% Connections
    {{CONNECTIONS}}
```

3. **For each external service, define:**

```markdown
### External: {{SERVICE_NAME}}

**Purpose:** {{WHY_NEEDED}}
**Provider:** {{PROVIDER_OR_TBD}}
**Integration type:** SDK / REST API / Webhook
**Risk level:** low / medium / high

#### Integration Points
- {{WHAT_CONNECTS_TO_IT}}

#### Failure Mode
- {{WHAT_HAPPENS_IF_IT_GOES_DOWN}}
```

4. **Identify risk areas:**

```markdown
## Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| {{COMPONENT}} | {{WHAT_COULD_GO_WRONG}} | {{HOW_TO_HANDLE}} |
```

5. **Surface architecture decisions** — Present the top 2-4 architecture decisions:
   - "Server-side rendering or client-side for this page?"
   - "WebSockets or polling for real-time updates?"
   - "Queue for background jobs or inline processing?"

### Validation Questions
- Does every external service have a failure mode defined?
- Are there components with no connections? (orphaned)
- Does data flow from user action to storage have a clear path?

---

## Cross-Module Validation

After all selected modules are complete, verify consistency:

1. **Pages → Data Model:** Every page that displays data has a corresponding entity
2. **Data Model → Architecture:** Every entity is stored in a component shown in the architecture diagram
3. **Architecture → Pages:** Every external service connection is visible in at least one page's features
4. **Feature coverage:** Every v1 feature from PROJECT.md appears in at least one module's output

---

*These modules are original implementations — not ported from GSD or any external framework.*
*Created for `/lean:start` Stage 3 (Product Design).*
*Referenced by: `~/.claude/lean-gsd/workflows/start.md`*
