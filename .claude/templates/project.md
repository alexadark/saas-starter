# {{PROJECT_NAME}}

> Generated: {{DATE}}
> Status: Draft

---

## End Goal

{{END_GOAL}}

> North-Star one-liner: What does the world look like when this succeeds?

---

## Specific Problem

**Root Pain:** {{ROOT_PAIN}}

**Quantified Consequence:** {{CONSEQUENCE}}

> What happens if this problem isn't solved? Be specific — lost time, lost money, lost users.

---

## User Types

{{#EACH USER_TYPE}}
### {{ROLE_NAME}}

- **Who:** {{WHO_DESCRIPTION}}
- **Current Frustrations:** {{FRUSTRATIONS}}
- **Urgent Goals:** {{URGENT_GOALS}}
- **How They'll Use This:** {{USAGE_PATTERN}}
{{/EACH}}

---

## Business Model

**Revenue Strategy:** {{REVENUE_STRATEGY}}

**Pricing Tiers:**
{{PRICING_TIERS}}

**Rationale:** {{PRICING_RATIONALE}}

---

## MVP Core Functionalities

### By Role

{{#EACH USER_TYPE}}
#### {{ROLE_NAME}}
{{CORE_FUNCTIONALITIES}}
{{/EACH}}

---

## Key User Stories

{{#EACH USER_STORY}}
- As a **{{ROLE}}**, I want **{{ACTION}}**, so that **{{VALUE}}**.
{{/EACH}}

---

## Stack

{{STACK_SECTION}}

> Defaults loaded from `~/.claude/lean-gsd/references/stack-defaults.md` unless overridden during questioning.

---

## Constraints & Preferences

- {{CONSTRAINTS}}

---

*Created by `/lean:start`*
