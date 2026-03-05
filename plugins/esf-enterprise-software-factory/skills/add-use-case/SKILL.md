---
description: Manually add a new use case
argument-hint: "[summary|epic|task]"
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
---

<objective>

Manually add a new use case at any level. Interactive prompts gather information and generate the use case document from template.

**Arguments:**
- `summary` — Add Objectives use case
- `epic` — Add Epic-Level use case
- `task` — Add Task-Level use case

</objective>

<process>

## Determine Level

```bash
LEVEL="${1:-epic}"  # Default to epic
```

## Gather Information

**For Objectives:**

```
questions: [
  {
    header: "Name",
    question: "What is the use case name? (Verb-Noun format)",
    freeform: true
  },
  {
    header: "Goal",
    question: "What business capability does this deliver?",
    freeform: true
  },
  {
    header: "Actor",
    question: "Who is the primary actor?",
    options: [existing actors from PROJECT.md]
  },
  {
    header: "Priority",
    question: "What is the priority?",
    options: ["Must", "Should", "Could"]
  }
]
```

**For Epic-Level:**

Additional questions:
- Parent Summary use case
- Sprint assignment
- Trigger event

**For Task-Level:**

Additional questions:
- Parent Epic use case
- Type (Validation/Transformation/Persistence/UI/Integration)
- Execution context (Client/Server/Background)

## Generate ID

```bash
# Find next available ID
LEVEL_PREFIX="UC-S"  # or UC-UG or UC-SF
COUNT=$(ls .planning/use-cases/${LEVEL_DIR}/*.md 2>/dev/null | wc -l)
NEXT_NUM=$((COUNT + 1))
NEW_ID=$(printf "${LEVEL_PREFIX}-%03d" $NEXT_NUM)
```

## Create Document

Read template from `.planning/templates/UC-{LEVEL}.md`.

Fill in gathered information.

Write to appropriate directory:
- Summary: `.planning/use-cases/summary/${NEW_ID}-${kebab-name}.md`
- Epic: `.planning/use-cases/epic/${NEW_ID}-${kebab-name}.md`
- Task: `.planning/use-cases/task/${NEW_ID}-${kebab-name}.md`

## Update Index

Add new use case to `.planning/use-cases/index.md`.

**For Epic:** Also update PROJECT-PLAN.md if sprint assigned.

## Commit

```bash
git add .planning/use-cases/
git commit -m "docs: add use case ${NEW_ID} ${NAME}"
```

## Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► USE CASE ADDED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**${NEW_ID}: ${NAME}**
Level: ${LEVEL}
File: .planning/use-cases/${LEVEL_DIR}/${NEW_ID}-${kebab-name}.md

{If Epic and sprint assigned:}
Assigned to: Sprint ${SPRINT}

Edit the document to complete all sections.
```

</process>

<success_criteria>

- [ ] Level determined
- [ ] Information gathered via prompts
- [ ] ID assigned (unique, sequential)
- [ ] Document created from template
- [ ] index.md updated
- [ ] PROJECT-PLAN.md updated (if applicable)
- [ ] Committed to git

</success_criteria>
