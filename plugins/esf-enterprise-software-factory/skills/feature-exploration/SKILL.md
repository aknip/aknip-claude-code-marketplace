---
description: Explore implementation feature-scenarios for Objectives use cases
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>

Interactive exploration of implementation feature-scenarios based on Objectives Use Cases. Optional step between `/esf:new-project` and `/esf:use-case-analysis`.

Enables parallel exploration of 1-n implementation feature-scenarios with HTML clickdummies and Mermaid roadmaps before selecting a final feature-scenario as input for `/esf:use-case-analysis`.

**Requires:** `.planning/PROJECT.md` with `## Use Cases (Summary)` section (created by `/esf:new-project`)

**Creates:**
- `.planning/feature-scenarios/FEATURE-SCENARIOS-PROJECT-STATUS.md` — Index of all feature-scenarios + status
- `.planning/feature-scenarios/feature-scenario-NN-[slug]/FEATURE-SCENARIO.md` — Collected ideas, decisions, features
- `.planning/feature-scenarios/feature-scenario-NN-[slug]/HISTORY.md` — Chronological protocol
- `.planning/feature-scenarios/feature-scenario-NN-[slug]/YYYYMMDD_HHMMSS_wireframe.html` — HTML clickdummy
- `.planning/feature-scenarios/feature-scenario-NN-[slug]/roadmap.md` — Mermaid roadmap
- `.planning/feature-scenarios/final/FINAL-FEATURE-SCENARIO.md` — The final, approved feature-scenario

**After this command:** Run `/esf:use-case-analysis` to extract use cases (uses final feature-scenario as context).

</objective>

<execution_context>

@./use-case-driven/references/questioning.md
@./use-case-driven/references/ui-brand.md

</execution_context>

<process>

## Sprint 1: Check Prerequisites

**MANDATORY FIRST STEP — Execute these checks before ANY user interaction:**

1. **Abort if PROJECT.md missing:**
   ```bash
   [ ! -f .planning/PROJECT.md ] && echo "ERROR: No project found. Run /esf:new-project first." && exit 1
   ```

2. **Objectives Use Cases present?**
   - Read `.planning/PROJECT.md`
   - Verify that `## Use Cases (Summary)` section contains at least one UC-OBJ-XXX
   - If not: error with hint to run `/esf:new-project`

3. **Load existing feature-scenarios:**
   ```bash
   if [ -f .planning/feature-scenarios/FEATURE-SCENARIOS-PROJECT-STATUS.md ]; then
     echo "Existing exploration found"
   fi
   ```

## Sprint 2: Main Menu

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► FEATURE EXPLORATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If no feature-scenarios exist:** Go directly to Sprint 3 (Create New Feature-Scenario).

**If feature-scenarios exist:** Show overview and selection menu.

```
## Current Feature-Scenarios

| # | Name | Status | Core Idea | Rounds |
|---|------|--------|-----------|--------|
| 1 | [Name] | Active / Paused | [Core Idea] | [N] |
| 2 | [Name] | Active / Paused | [Core Idea] | [N] |

Final Feature-Scenario: Not yet determined
```

Use AskUserQuestion:
- header: "Action"
- question: "What would you like to do?"
- options:
  - "Continue working on feature-scenario" — Continue developing an existing feature-scenario
  - "Create new feature-scenario" — Start a new implementation idea
  - "Delete feature-scenario" — Remove an existing feature-scenario
  - "Finalize feature-scenario" — Complete exploration and define the final feature-scenario

## Sprint 3: Create New Feature-Scenario

Use AskUserQuestion:
- header: "Feature-Scenario"
- question: "Give the new feature-scenario a short name (e.g. 'Wizard-based', 'Dashboard-First', 'Kanban-Style')."

Then:
- header: "Core Idea"
- question: "Describe the core idea of this feature-scenario in 1-2 sentences."

**Create directory:**
```bash
SCENARIO_NUM=$(printf "%02d" [next available number])
SCENARIO_SLUG=[slug from name, lowercase-with-hyphens]
mkdir -p ".planning/feature-scenarios/feature-scenario-${SCENARIO_NUM}-${SCENARIO_SLUG}"
```

**Create initial files:**

`FEATURE-SCENARIO.md` — Base structure:
```markdown
# Feature-Scenario: [Name]

> Core Idea: [1-2 sentences]
> Created: [Date]
> Last Updated: [Date]

## Mapping to Objectives Use Cases

| UC | Name | Implementation Approach in this Feature-Scenario |
|----|------|------------------------------------------|
| UC-OBJ-001 | [Name] | [Not yet defined] |
| UC-OBJ-002 | [Name] | [Not yet defined] |

## Interaction Concept & User Workflows

[No workflows defined yet]

## Capabilities & Features

| Feature | Description | Related UC | Priority |
|---------|------------|------------|----------|

## UI Concept

[No UI concept defined yet]

## Proposed Epic Use Cases

| ID (Draft) | Name | Related UC-S | Description |
|-------------|------|--------------|-------------|

> Note: IDs with prefix "UG-E" (Exploration) — will be converted
> to official UC-EP-XXX IDs upon finalization.

## Proposed Roadmap Sprints

| Sprint | Goal | Use Cases | Rationale |
|-------|------|-----------|-----------|

## Open Questions & Notes

- [None yet]
```

`HISTORY.md` — Header:
```markdown
# Feature-Scenario [Name] — History
```

**Update FEATURE-SCENARIOS-PROJECT-STATUS.md** (create if not present):
```markdown
# Feature Exploration — Feature-Scenarios

> Project: [Project name from PROJECT.md]
> Created: [Date]
> Last Updated: [Date]

## Feature-Scenarios

| # | Name | Status | Core Idea | Last Modified |
|---|------|--------|-----------|---------------|
| 1 | [Name] | Active | [Core Idea] | [Date] |

## Final Feature-Scenario

Status: Open
Source: —
```

**Git commit:**
```bash
git add ".planning/feature-scenarios/"
git commit -m "docs(exploration): new feature-scenario created — [Name]"
```

**Continue with Sprint 5 (Interactive Work on Feature-Scenario).**

## Sprint 4: Select Feature-Scenario (Continue Working)

**If only 1 feature-scenario:** Select it directly.

**If multiple feature-scenarios:**

Use AskUserQuestion:
- header: "Feature-Scenario"
- question: "Which feature-scenario would you like to continue working on?"
- options: [List of feature-scenarios with Name + Core Idea]

**Load:**
- `FEATURE-SCENARIO.md` — current state
- `HISTORY.md` — previous questions/answers (last 3 rounds as context)

**Show summary:**
```
## Feature-Scenario: [Name]
Core Idea: [...]
Previous Rounds: [N]
Last Discussed: [Topic of last round]

Not yet covered Summary Use Cases: UC-OBJ-003, UC-OBJ-005
```

**Continue with Sprint 5.**

## Sprint 5: Interactive Work on Feature-Scenario (Core Process)

This is the central, iterative process. It repeats until the user switches or exits.

### 5.1 Topic Suggestion & Question

**Analyze the current state of the feature-scenario:**
- Which Objectives UCs are not yet / weakly covered?
- Which areas are missing: interaction concept? Workflows? Features? UI concept?
- What follows logically from previous answers?

**Ask ONE targeted question** (following the questioning.md pattern):
- Questions about interaction, user workflows, capabilities, UI approaches
- Suggest options where appropriate (AskUserQuestion with concrete alternatives)
- Show context: "Regarding UC-OBJ-002 (Assess Risk)..."

**Question areas (non-exhaustive):**

| Area | Example Questions |
|------|-------------------|
| **User Workflow** | "How should the user start a new action — via a form, import, or drag & drop?" |
| **UI Layout** | "Should the interface be more of an overview dashboard or a focused wizard?" |
| **Navigation** | "How does the user navigate between areas — sidebar, tabs, search bar?" |
| **Data Entry** | "Should data be captured in one large form or in logical steps?" |
| **Automation** | "Which steps should happen automatically (e.g. completeness check)?" |
| **Collaboration** | "How should approval/collaboration work?" |
| **Prioritization** | "Which Summary Use Case is most important for you to start with?" |

**Topic Guardrails:**
- No technical architecture questions (Claude decides that later)
- No library/framework questions
- Focus on user-visible behavior, workflows, features

### 5.2 Process Answer & Persist

After EVERY answer:

1. **Update FEATURE-SCENARIO.md** — add new information to the appropriate section
2. **Update HISTORY.md** — log question, answer, and result:
   ```markdown
   ## Round N — [Date, Time]
   **Topic:** [Area]
   **Question:** [Question asked]
   **Answer:** [Summary of user's answer]
   **Result:** [What was updated in FEATURE-SCENARIO.md]
   **Visualization:** [Clickdummy updated: yes/no] [Roadmap updated: yes/no]
   ```
3. **Update FEATURE-SCENARIOS-PROJECT-STATUS.md** — last modified timestamp

### 5.3 Offer Visualization

After each answer, ask:

Use AskUserQuestion:
- header: "Visual"
- question: "Should I update the clickdummy and/or roadmap?"
- options:
  - "Update both" — Regenerate clickdummy + roadmap diagram
  - "Clickdummy only" — Update HTML wireframe
  - "Roadmap only" — Update Mermaid diagram
  - "No, continue with questions" — No visualization, next question

**Alternative:** If the answer contains no visually relevant change (e.g. pure prioritization), the question can be skipped and "No, continue with questions" suggested directly.

### 5.4 Generate HTML Clickdummy

**Format:** Standalone HTML with embedded CSS (shadcn styling) and JavaScript.
- New file per version: `YYYYMMDD_HHMMSS_wireframe.html`
- Directly openable in browser
- Interactive elements: clickable navigation, sample data, tooltips
- Visualizes the collected UI concepts, workflows, and features so far
- Shows the most important screens/views of the feature-scenario
- Uses placeholder `[TBD]` for areas not yet discussed
- German labels (labels, buttons, error messages)
- Desktop-optimized

**Location:**
```
.planning/feature-scenarios/feature-scenario-NN-[slug]/YYYYMMDD_HHMMSS_wireframe.html
```

### 5.5 Generate Mermaid Roadmap

**Format:** Markdown file with Mermaid code block.

```markdown
# Roadmap — Feature-Scenario: [Name]

> Generated: [Date]

## Sprint Overview

```mermaid
gantt
    title Roadmap — [Feature-Scenario Name]
    dateFormat YYYY-MM-DD
    axisFormat %B %Y

    section Sprint 1 — [Goal]
    [Task 1]           :p1t1, 2026-03-01, 2w
    [Task 2]           :p1t2, after p1t1, 1w

    section Sprint 2 — [Goal]
    [Task 3]           :p2t1, after p1t2, 2w
```

## Sprint Details

| Sprint | Goal | Epic UCs (Draft) | Estimated Complexity |
|-------|------|-----------------------|----------------------|
| 1 | [...] | UG-E-001, UG-E-002 | Medium |
| 2 | [...] | UG-E-003, UG-E-004 | High |
```

**Location:** `roadmap.md` in the feature-scenario directory (overwritten on each update).

### 5.6 Choose Next Action

After visualization (or if skipped):

Use AskUserQuestion:
- header: "Next"
- question: "How would you like to continue?"
- options:
  - "Next question" — Continue working on current feature-scenario
  - "Back to main menu" — Switch feature-scenario, create new, delete, or finalize

**On "Next question":** Return to 5.1.
**On "Back to main menu":** Return to Sprint 2.

### 5.7 Git Commits

**Automatic commits at defined points:**
- After every 3rd interaction round (not after each individual one)
- Commit format: `docs(exploration): feature-scenario updated — [Name] (rounds N-M)`

## Sprint 6: Delete Feature-Scenario

Use AskUserQuestion:
- header: "Delete"
- question: "Which feature-scenario would you like to delete?"
- options: [List of feature-scenarios]

**Safety confirmation:**

Use AskUserQuestion:
- header: "Confirm"
- question: "Really delete feature-scenario '[Name]'? All files (including clickdummies) will be removed."
- options:
  - "Yes, delete" — Permanently remove
  - "Cancel" — Back to main menu

**On confirmation:**
```bash
rm -rf ".planning/feature-scenarios/feature-scenario-NN-[slug]"
```
- Update `FEATURE-SCENARIOS-PROJECT-STATUS.md` (remove feature-scenario)
- Git commit: `docs(exploration): feature-scenario deleted — [Name]`
- Return to Sprint 2

## Sprint 7: Set Final Feature-Scenario

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► FINALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Show feature-scenario comparison:**

```
## Feature-Scenarios Compared

| Aspect | Feature-Scenario 1: [Name] | Feature-Scenario 2: [Name] |
|--------|--------------------|-----------------------|
| Core Idea | [...] | [...] |
| UC-OBJ-001 | [...] | [...] |
| Features | [N] | [N] |
| Draft UGs | [N] | [N] |
| Sprints | [N] | [N] |
```

Use AskUserQuestion:
- header: "Finalization"
- question: "How would you like to determine the final feature-scenario?"
- options:
  - "Adopt feature-scenario directly" — Use one of the feature-scenarios 1:1 as the final feature-scenario
  - "Synthesis (dialog-guided)" — Combine elements from multiple feature-scenarios through dialog
  - "Automatic synthesis" — Let Claude generate the best combination automatically

### 7.1 Direct Adoption

Use AskUserQuestion:
- header: "Selection"
- question: "Which feature-scenario should be adopted as the final feature-scenario?"
- options: [List of feature-scenarios]

**Action:**
```bash
mkdir -p ".planning/feature-scenarios/final"
```
- Copy `FEATURE-SCENARIO.md` → `final/FINAL-FEATURE-SCENARIO.md`
- Copy latest clickdummy → `final/`
- Copy `roadmap.md` → `final/`
- Update `FEATURE-SCENARIOS-PROJECT-STATUS.md` (Status: Finalized, Source: Feature-Scenario X)

### 7.2 Dialog-Guided Synthesis

Interactive process comparing feature-scenarios area by area:

**For each area (Workflows, Features, UI Concept, Roadmap):**

1. Show approaches from different feature-scenarios side by side
2. Use AskUserQuestion: "Which approach do you prefer for [area]?"
   - Options: Feature-Scenario 1 / Feature-Scenario 2 / ... / Custom idea
3. Add result to `FINAL-FEATURE-SCENARIO.md`

**After completing all areas:**
- Generate new clickdummy visualizing the synthesis
- Generate new roadmap
- Use AskUserQuestion: "Is the final feature-scenario correct?"
  - "Yes, finalize" — Complete
  - "Adjust" — Which area should be changed?

### 7.3 Automatic Synthesis

Claude analyzes all feature-scenarios and automatically generates an optimal final feature-scenario:

**Criteria:**
- Features with the highest coverage of Objectives UCs
- Most consistent UI concept
- Most pragmatic roadmap (must-have features first)
- No conflicting approaches

**Present result:**
- Show `FINAL-FEATURE-SCENARIO.md` with annotations indicating where each element originated
- Generate clickdummy + roadmap
- Use AskUserQuestion: "Is the automatic synthesis acceptable?"
  - "Yes, finalize" — Complete
  - "Adjust" — Switch to dialog-guided synthesis (7.2)
  - "Regenerate" — Provide different weighting

### 7.4 Complete Finalization

```bash
mkdir -p ".planning/feature-scenarios/final"
git add ".planning/feature-scenarios/"
git commit -m "docs(exploration): final feature-scenario set — [Name/Synthesis]"
```

**Continue with Sprint 8.**

## Sprint 8: Completion

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► FEATURE EXPLORATION COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Project Name]**

| Artifact              | Location                                     |
|-----------------------|----------------------------------------------|
| Final Feature-Scenario        | `.planning/feature-scenarios/final/FINAL-FEATURE-SCENARIO.md` |
| Final Clickdummy      | `.planning/feature-scenarios/final/[timestamp]_wireframe.html` |
| Final Roadmap         | `.planning/feature-scenarios/final/roadmap.md`        |
| Feature-Scenarios Index       | `.planning/feature-scenarios/FEATURE-SCENARIOS-PROJECT-STATUS.md`      |

**[N] feature-scenarios explored** | **Final Feature-Scenario: [Name/Synthesis]** ✓

───────────────────────────────────────────────────────

## ▶ Next Up

**Use Case Analysis & Roadmap** — uses final feature-scenario as additional context

`/esf:use-case-analysis`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────

**Also available:**
- `/esf:feature-exploration` — Reopen exploration (edit feature-scenarios)
- `/esf:progress` — View use case completion status
- `/esf:help` — Show all available commands

───────────────────────────────────────────────────────
```

</process>

<success_criteria>

- [ ] Prerequisites checked (PROJECT.md with Objectives UCs present)
- [ ] Existing feature-scenarios detected and loaded (if present)
- [ ] Main menu with all 4 actions functional
- [ ] Create new feature-scenario: name, core idea, directory, initial files
- [ ] Interactive core process: ask questions, process answers, persist
- [ ] HTML clickdummy: standalone, shadcn styling, interactive, versioned
- [ ] Mermaid roadmap: Gantt diagram with sprints and tasks
- [ ] Interruption possible at any time, no progress lost
- [ ] Delete feature-scenario with safety confirmation
- [ ] Finalization: direct adoption, dialog-guided synthesis OR automatic synthesis
- [ ] Final feature-scenario placed in `.planning/feature-scenarios/final/`
- [ ] FEATURE-SCENARIOS-PROJECT-STATUS.md consistently updated
- [ ] User knows next step is `/esf:use-case-analysis`

</success_criteria>
