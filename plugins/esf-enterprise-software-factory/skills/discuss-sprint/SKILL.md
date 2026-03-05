---
description: Gather sprint context through adaptive questioning before planning
argument-hint: "<sprint>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>

Gather implementation decisions for a sprint through adaptive questioning. Creates a CONTEXT.md that guides planning and execution — capturing your preferences before tasks are extracted.

**Input:** Sprint number (required)

**Creates:**
- `.planning/sprints/NN-*/NN-CONTEXT.md` — Implementation decisions for this sprint

**May update (if decisions change documented behavior):**
- `.planning/use-cases/epic/UC-EP-*.md` — Postconditions, scenarios, acceptance criteria
- `.planning/PROJECT-PLAN.md` — Success criteria derived from postconditions

**After this command:** Run `/esf:plan-sprint N` to create execution plans.

</objective>

<execution_context>

@./use-case-driven/references/questioning.md
@./use-case-driven/references/ui-brand.md

</execution_context>

<process>

## Sprint 1: Validate

**Parse arguments:**

```bash
PHASE_ARG="${1:-}"

if [ -z "$PHASE_ARG" ]; then
  echo "ERROR: Sprint number required. Usage: /esf:discuss-sprint <N>"
  exit 1
fi
```

**Validate sprint exists:**

```bash
PADDED_SPRINT=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
SPRINT_DIR=$(ls -d .planning/sprints/${PADDED_SPRINT}-* .planning/sprints/${PHASE_ARG}-* 2>/dev/null | head -1)

if [ -z "$SPRINT_DIR" ]; then
  echo "ERROR: Sprint ${PHASE_ARG} not found in .planning/sprints/"
  exit 1
fi

SPRINT_NAME=$(basename "$SPRINT_DIR")
echo "Discussing sprint: $SPRINT_NAME"
```

## Sprint 2: Check Existing Context

```bash
CONTEXT_FILE="${SPRINT_DIR}/${PADDED_SPRINT}-CONTEXT.md"

if [ -f "$CONTEXT_FILE" ]; then
  echo "Context file exists: $CONTEXT_FILE"
fi
```

**If CONTEXT.md exists:**

Use AskUserQuestion:
- header: "Context"
- question: "A CONTEXT.md already exists for this sprint. What would you like to do?"
- options:
  - "Update" — Add to or revise existing decisions
  - "View" — Show current context and exit
  - "Replace" — Start fresh discussion

**If "View":** Display contents and exit.

**If "Replace":** Proceed to Sprint 3.

**If "Update":** Load existing context, note what's already decided, focus discussion on gaps.

## Sprint 3: Load Sprint Information

**Load assigned Epic use cases:**

```bash
grep "Sprint ${PHASE_ARG}" .planning/use-cases/index.md | grep "UC-UG"
```

**Read each Epic use case to understand:**
- Scenarios (main success + alternatives)
- Postconditions
- Actor interactions
- Triggers

**Read PROJECT-PLAN.md for sprint goal:**

```bash
cat .planning/PROJECT-PLAN.md | grep -A5 "Sprint ${PHASE_ARG}"
```

## Sprint 4: Identify Gray Areas

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► DISCUSSING SPRINT ${PHASE_ARG}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzing use cases to identify areas needing clarification...
```

**Analyze use cases and identify gray areas based on content:**

| Content Pattern | Gray Areas to Surface |
|-----------------|----------------------|
| **UI interactions** | Layout, component density, animations, empty states, error display, responsive behavior |
| **Form inputs** | Validation rules, required vs optional, error messages, input formats, auto-save |
| **Data display** | Sorting defaults, filtering options, pagination, density, column priority |
| **Workflows** | Step sequencing, confirmation dialogs, undo behavior, progress indication |
| **Persistence** | What to save, when to save, conflict handling, offline behavior |
| **Notifications** | Timing, style, dismissal, persistence, grouping |
| **API interactions** | Error handling, retry behavior, loading states, timeout handling |
| **Validation** | Client-side vs server-side, real-time vs on-submit, message tone |

**Build gray area list:**

From each use case scenario, extract steps that could be implemented multiple ways.

## Sprint 5: Present Gray Areas

**Present discovered gray areas:**

```
## Gray Areas Identified

Based on the use cases for Sprint ${PHASE_ARG}, I've identified areas
where your preferences will shape the implementation:

1. **[Area Name]** — [Brief description of the decision point]
2. **[Area Name]** — [Brief description of the decision point]
3. **[Area Name]** — [Brief description of the decision point]
```

Use AskUserQuestion:
- header: "Discussion"
- question: "Which areas would you like to discuss? (Select all that apply)"
- multiSelect: true
- options: [List identified gray areas]

**IMPORTANT:** User must select at least one area. If they try to skip all, explain that discussing even one area will improve implementation quality.

## Sprint 6: Deep-Dive Questions

**For each selected area, conduct targeted questioning:**

**Questioning approach:**
1. Ask 3-4 targeted questions about the area
2. After answering, ask: "Anything else about [area]?"
3. If yes, continue with 3-4 more questions
4. If no, move to next area

**Question types by gray area:**

**UI Layout:**
- "How dense should the interface be — spacious and minimal, or compact with more visible at once?"
- "Should empty states show illustration/guidance, or just simple text?"
- "How should the layout adapt on mobile — same structure or redesigned?"

**Form Handling:**
- "Should validation happen in real-time as users type, or on form submission?"
- "For errors, should messages appear inline next to fields, or grouped at top?"
- "Should required fields be marked with asterisk, 'required' text, or both?"

**Data Display:**
- "What's the default sorting when data loads — newest first, alphabetical, or custom?"
- "How many items should display before pagination kicks in?"
- "Should filters be visible by default or collapsed behind a button?"

**Workflows:**
- "Should destructive actions (delete, cancel) require confirmation dialogs?"
- "When a task completes, stay on page, redirect, or show inline confirmation?"
- "Should there be undo support, or is confirmation dialog enough?"

**Persistence:**
- "Should form progress auto-save as drafts?"
- "If offline, queue changes or block actions?"
- "How should conflicts be handled if the same item is edited elsewhere?"

**Error Handling:**
- "Should technical errors show friendly messages or include error codes?"
- "On API timeout, retry automatically or prompt user?"
- "Should errors dismiss automatically or require user action?"

**TOPIC GUARDRAILS:**

Do NOT ask about:
- Technical architecture choices (Claude decides)
- Performance optimization strategies
- Code organization patterns
- Library/framework selection
- Database schema design

These are implementation details Claude handles. Only ask about user-visible behavior and preferences.

**SCOPE GUARDRAILS:**

If user suggests features beyond this sprint:
- "That sounds like it belongs in a future sprint. I'll note it, but let's focus on Sprint ${PHASE_ARG} for now."
- Capture suggestion in "Deferred Ideas" section of CONTEXT.md
- Return to current sprint discussion

## Sprint 7: Generate CONTEXT.md

**Write context file:**

```markdown
# Sprint ${PHASE_ARG} Context

> Implementation decisions captured before planning.
> Generated: [timestamp]

## Use Cases Covered

- UC-EP-XXX: [Name]
- UC-EP-XXX: [Name]

## Decisions

### [Gray Area 1]

**Decision:** [Clear, implementable decision]

**Rationale:** [Why this choice]

**Applies to:** [Which use cases/scenarios]

### [Gray Area 2]

**Decision:** [Clear, implementable decision]

**Rationale:** [Why this choice]

**Applies to:** [Which use cases/scenarios]

## Defaults (Not Discussed)

These areas weren't discussed — Claude will use sensible defaults:

- [Area]: Will default to [approach]
- [Area]: Will default to [approach]

## Deferred Ideas

Ideas suggested during discussion that belong in future sprints:

- [Idea] — Potential fit: Sprint N
- [Idea] — Potential fit: New sprint

## Impact on Planning

These decisions will guide:
- Task extraction (what atomic operations to create)
- Task specification (how to implement each task)
- Verification criteria (what to test)
```

**Commit context:**

```bash
git add "${CONTEXT_FILE}"
git commit -m "docs(${PADDED_SPRINT}): capture implementation context

Discussed: [list areas]
Use cases: [list UC-EP-XXX IDs]"
```

## Sprint 8: Impact Analysis

**Analyze decisions against existing artifacts:**

Compare each decision from the discussion against the corresponding use case scenarios, postconditions, and acceptance criteria.

**Build impact table:**

| Decision | Affects | Current State | Impact |
|----------|---------|---------------|--------|
| [Decision 1] | UC-EP-XXX postcondition | "[current text]" | Behavior change / Adds detail / No change |
| [Decision 2] | UC-EP-XXX scenario | "[current text]" | Behavior change / Adds detail / No change |

**If behavioral changes detected:**

Present findings to user:

```
## Impact Analysis

Some decisions may affect existing use case specifications:

| Decision | Document | Current | Proposed Change |
|----------|----------|---------|-----------------|
| [e.g., "Erledigt" section] | UC-EP-004 POST-3 | "Task remains visible in list" | "Task moves to Erledigt section" |
```

Use AskUserQuestion:
- header: "Update?"
- question: "These decisions change documented behavior. Should I update the use cases and roadmap to match?"
- options:
  - "Yes, update all" — Keep use cases as single source of truth (Recommended)
  - "Review each" — Show me each change before applying
  - "No, keep CONTEXT.md only" — Use cases stay abstract, decisions in context

**If "Yes, update all":**
1. Update affected use case postconditions, scenarios, and acceptance criteria
2. Update PROJECT-PLAN.md success criteria if derived from changed postconditions
3. Commit changes with descriptive message

**If "Review each":**
1. For each change, show current vs proposed
2. Use AskUserQuestion to approve/skip each
3. Apply approved changes
4. Commit changes

**If "No, keep CONTEXT.md only":**
- Skip updates
- Note in CONTEXT.md that use cases may be out of sync

**If no behavioral changes detected:**

Skip this step — decisions only add implementation detail, no conflicts with documented behavior.

## Sprint 9: Complete

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► DISCUSSION COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Sprint ${PHASE_ARG}: ${SPRINT_NAME}**

## Context Captured

| Area | Decision |
|------|----------|
| [Area 1] | [Summary] |
| [Area 2] | [Summary] |

## Artifacts Updated

[If updates were made:]
- UC-EP-XXX: [what changed]
- PROJECT-PLAN.md: [what changed]

[If no updates:]
- No behavioral changes — use cases unchanged

## Files

- ${CONTEXT_FILE}

───────────────────────────────────────────────────────

## ▶ Next Up

`/esf:plan-sprint ${PHASE_ARG}` — create execution plans (will use this context)

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────

**Also available:**
- `/esf:progress` — view use case completion status
- `/esf:help` — show all available commands

───────────────────────────────────────────────────────
```

</process>

<success_criteria>

- [ ] Sprint validated (exists in PROJECT-PLAN.md)
- [ ] Epic use cases loaded for sprint
- [ ] Gray areas identified through scenario analysis
- [ ] User selected discussion areas (at least one)
- [ ] Each selected area explored until user satisfied
- [ ] Scope creep redirected appropriately
- [ ] CONTEXT.md contains actionable decisions (not vague preferences)
- [ ] Deferred ideas captured separately
- [ ] CONTEXT.md committed to git
- [ ] Impact analysis performed (decisions vs existing artifacts)
- [ ] If behavioral changes: user offered to update use cases/roadmap
- [ ] If updates approved: artifacts updated and committed
- [ ] User knows next step is `/esf:plan-sprint N`

</success_criteria>
