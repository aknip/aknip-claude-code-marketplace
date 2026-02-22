# PROJECT.md Template

Template for `.planning/PROJECT.md` — the living project context document for use case driven projects.

<template>

```markdown
# [Project Name]

## What This Is

[Current accurate description — 2-3 sentences. What does this product do and who is it for?
Use the user's language and framing. Update whenever reality drifts from this description.]

## Core Value

[The ONE thing that matters most. If everything else fails, this must work.
One sentence that drives prioritization when tradeoffs arise.]

## Actors

| Actor | Type | Primary Goals |
|-------|------|---------------|
| [Actor 1] | End User | [What they want to achieve] |
| [Actor 2] | Administrator | [What they want to achieve] |
| [Actor 3] | External System | [What it provides/consumes] |

## Use Cases (Summary)

[Brief list of Summary-Level use cases identified. Full details in .planning/use-cases/]

- UC-S-001: [Name] — [Brief description]
- UC-S-002: [Name] — [Brief description]

## Context

[Background information that informs implementation:
- Technical environment or ecosystem
- Relevant prior work or experience
- User research or feedback themes
- Known issues to address]

## Constraints

- **[Type]**: [What] — [Why]
- **[Type]**: [What] — [Why]

Common types: Tech stack, Timeline, Budget, Dependencies, Compatibility, Performance, Security

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Choice] | [Why] | [✓ Good / ⚠️ Revisit / — Pending] |

---
*Last updated: [date] after [trigger]*
```

</template>

<guidelines>

**What This Is:**
- Current accurate description of the product
- 2-3 sentences capturing what it does and who it's for
- Use the user's words and framing
- Update when the product evolves beyond this description

**Core Value:**
- The single most important thing
- Everything else can fail; this cannot
- Drives prioritization when tradeoffs arise
- Rarely changes; if it does, it's a significant pivot

**Actors (USE CASE SPECIFIC):**
- Who interacts with the system?
- What type of actor are they? (End User, Administrator, External System)
- What are their primary goals?
- This feeds directly into use case analysis

**Use Cases (Summary):**
- Brief reference to Summary-Level use cases
- Full details live in .planning/use-cases/summary/
- Updated as use cases are added or changed

**Context:**
- Background that informs implementation decisions
- Technical environment, prior work, user feedback
- Known issues or technical debt to address
- Update as new context emerges

**Constraints:**
- Hard limits on implementation choices
- Tech stack, timeline, budget, compatibility, dependencies
- Include the "why" — constraints without rationale get questioned

**Key Decisions:**
- Significant choices that affect future work
- Add decisions as they're made throughout the project
- Track outcome when known:
  - ✓ Good — decision proved correct
  - ⚠️ Revisit — decision may need reconsideration
  - — Pending — too early to evaluate

**Last Updated:**
- Always note when and why the document was updated
- Format: `after Phase 2` or `after UC-UG-001 implemented`
- Triggers review of whether content is still accurate

</guidelines>

<evolution>

PROJECT.md evolves throughout the project lifecycle.

**After each phase transition:**
1. Use cases completed? → Update Use Cases summary
2. New actors discovered? → Add to Actors table
3. Decisions to log? → Add to Key Decisions
4. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Actors check — are all relevant actors listed?
4. Update Context with current state

</evolution>
