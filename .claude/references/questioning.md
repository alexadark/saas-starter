<questioning_guide>

Project initialization is dream extraction, not requirements gathering. You're helping the user discover and articulate what they want to build. This isn't a contract negotiation — it's collaborative thinking.

<philosophy>

**You are a thinking partner, not an interviewer.**

The user often has a fuzzy idea. Your job is to help them sharpen it. Ask questions that make them think "oh, I hadn't considered that" or "yes, that's exactly what I mean."

Don't interrogate. Collaborate. Don't follow a script. Follow the thread.

</philosophy>

<the_goal>

By the end of questioning, you need enough clarity to write a PROJECT.md that downstream phases can act on:

- **Research** needs: what domain to research, what the user already knows, what unknowns exist
- **Roadmap** needs: clear enough vision to decompose into phases, what "done" looks like
- **Planning** needs: specific features to break into tasks, context for implementation choices
- **Execution** needs: success criteria to verify against, the "why" behind features
- **Product Design** needs: enough context for AI to draft page maps, data models, and architecture

A vague PROJECT.md forces every downstream phase to guess. The cost compounds.

</the_goal>

<how_to_question>

**Start open.** Let them dump their mental model. Don't interrupt with structure.

**Follow energy.** Whatever they emphasized, dig into that. What excited them? What problem sparked this?

**Challenge vagueness.** Never accept fuzzy answers. "Good" means what? "Users" means who? "Simple" means how?

**Make the abstract concrete.** "Walk me through using this." "What does that actually look like?"

**Clarify ambiguity.** "When you say Z, do you mean A or B?" "You mentioned X — tell me more."

**Surface assumptions.** "You're assuming X — is that true?" "What if Y wasn't available?"

**Find edges.** "What happens when someone does this wrong?" "What about the 10th user vs the first?"

**Reveal motivation.** "Why does this matter to you specifically?" "What would you do if this existed tomorrow?"

**Know when to stop.** When you understand what they want, why they want it, who it's for, and what done looks like — offer to proceed.

</how_to_question>

<question_types>

Use these as inspiration, not a checklist. Pick what's relevant to the thread.

**Motivation — why this exists:**
- "What prompted this?"
- "What are you doing today that this replaces?"
- "What would you do if this existed?"

**Concreteness — what it actually is:**
- "Walk me through using this"
- "You said X — what does that actually look like?"
- "Give me an example"

**Clarification — what they mean:**
- "When you say Z, do you mean A or B?"
- "You mentioned X — tell me more about that"

**Success — how you'll know it's working:**
- "How will you know this is working?"
- "What does done look like?"

**Edges — where it breaks:**
- "What happens when someone does this wrong?"
- "What if there are 1000 of these? What about 1?"

**Assumptions — what's taken for granted:**
- "You're assuming X — is that true?"
- "What if that wasn't the case?"

</question_types>

<structured_product_discovery>

These are the structured fields to extract during questioning. Don't walk through them as a checklist — weave them naturally into conversation. When you have enough to write each section, you're ready for PROJECT.md.

**End Goal (North-Star one-liner):**
- "In one sentence, what does the world look like when this succeeds?"
- "If this works perfectly, what changes?"

**Specific Problem (root pain + quantified consequence):**
- "What specific problem does this solve?"
- "What happens today without this? How much does that cost (time, money, frustration)?"
- "Who suffers most from this problem?"

**User Types (per role):**
- "Who are the different types of people who'll use this?"
- For each role: "What frustrates them today?" "What's their most urgent goal?"
- "How does each role interact with the product differently?"

**Business Model & Revenue Strategy:**
- "How will this make money?" (or "Is this a business or a tool?")
- "What would you charge? Why that number?"
- "Free tier? What's in it vs what's paid?"

**MVP Core Functionalities by Role:**
- "For [role], what are the 3-5 things they absolutely need on day one?"
- "If you could only ship 3 features, which ones?"
- "What's the one thing that, if missing, makes this useless?"

**Key User Stories:**
- Extract naturally from conversation: "So as a [role], they'd want to [action] so they can [value]?"
- Confirm with user: "Did I capture that right?"
- Aim for 5-10 high-quality stories covering core flows

</structured_product_discovery>

<using_askuserquestion>

Use AskUserQuestion to help users think by presenting concrete options to react to.

**Good options:**
- Interpretations of what they might mean
- Specific examples to confirm or deny
- Concrete choices that reveal priorities

**Bad options:**
- Generic categories ("Technical", "Business", "Other")
- Leading options that presume an answer
- Too many options (2-4 is ideal)

**Example — vague answer:**
User says "it should be fast"

- header: "Fast"
- question: "Fast how?"
- options: ["Sub-second response", "Handles large datasets", "Quick to build", "Let me explain"]

**Example — following a thread:**
User mentions "frustrated with current tools"

- header: "Frustration"
- question: "What specifically frustrates you?"
- options: ["Too many clicks", "Missing features", "Unreliable", "Let me explain"]

</using_askuserquestion>

<context_checklist>

Use this as a **background checklist**, not a conversation structure. Check these mentally as you go. If gaps remain, weave questions naturally.

- [ ] What they're building (concrete enough to explain to a stranger)
- [ ] Why it needs to exist (the problem or desire driving it)
- [ ] Who it's for (even if just themselves)
- [ ] What "done" looks like (observable outcomes)
- [ ] How it makes money (if applicable)
- [ ] What's MVP vs what's later

Six things. If they volunteer more, capture it.

</context_checklist>

<decision_gate>

When you could write a clear PROJECT.md, offer to proceed:

- header: "Ready?"
- question: "I think I understand what you're after. Ready to create PROJECT.md?"
- options:
  - "Create PROJECT.md" — Let's move forward
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring" — ask what they want to add or identify gaps and probe naturally.

Loop until "Create PROJECT.md" selected.

</decision_gate>

<anti_patterns>

- **Checklist walking** — Going through domains regardless of what they said
- **Canned questions** — "What's your core value?" "What's out of scope?" regardless of context
- **Corporate speak** — "What are your success criteria?" "Who are your stakeholders?"
- **Interrogation** — Firing questions without building on answers
- **Rushing** — Minimizing questions to get to "the work"
- **Shallow acceptance** — Taking vague answers without probing
- **Premature constraints** — Asking about tech stack before understanding the idea
- **User skills** — NEVER ask about user's technical experience. Claude builds.

</anti_patterns>

</questioning_guide>
