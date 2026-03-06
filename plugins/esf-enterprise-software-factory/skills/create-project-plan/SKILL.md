---
description: Generate roadmap from use cases
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>

Create or regenerate PROJECT-PLAN.md from use case hierarchy. Use this after adding new use cases or to restructure sprints.

**Input:** Use cases in .planning/use-cases/

**Creates:**
- `.planning/PROJECT-PLAN.md` — Use case driven roadmap
- `.planning/PROJECT-STATUS.md` — Use case progress tracking (if new)
- Updated Epic use cases with sprint assignments

</objective>

<process>

## Load Use Cases

```bash
cat .planning/use-cases/index.md
ls .planning/use-cases/objective/*.md
ls .planning/use-cases/epic/*.md
```

## Check for Existing Roadmap

```bash
if [ -f .planning/PROJECT-PLAN.md ]; then
  echo "Existing roadmap found. This will regenerate it."
  # Backup existing
  cp .planning/PROJECT-PLAN.md .planning/PROJECT-PLAN.md.backup
fi
```

## Spawn Modeler

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► CREATING ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-modeler...
```

```
Task(prompt="
<task>
Read ./agents/uc-modeler.md for your role and instructions.

Create roadmap from use case hierarchy.
</task>

<use_cases>
@.planning/use-cases/index.md
</use_cases>

<project_context>
@.planning/PROJECT.md
@.planning/config.json
</project_context>

<output>
1. Analyze use case dependencies
2. Group Epic use cases into sprints
3. Derive success criteria from postconditions
4. Create PROJECT-PLAN.md
5. Update PROJECT-STATUS.md
6. Update Epic use cases with sprint assignments
7. Return ROADMAP CREATED
</output>
", subagent_type="uc-modeler", description="Create roadmap")
```

## Present and Approve

Display roadmap summary.

Use AskUserQuestion:
- header: "Roadmap"
- question: "Does this sprint structure work?"
- options:
  - "Approve" — Commit roadmap
  - "Adjust" — Tell me what to change

## Commit

```bash
git add .planning/PROJECT-PLAN.md .planning/PROJECT-STATUS.md .planning/use-cases/
git commit -m "docs: create use case driven roadmap"
```

</process>

<success_criteria>

- [ ] Use case hierarchy loaded
- [ ] uc-modeler spawned
- [ ] Dependencies analyzed
- [ ] Sprints created with use case mapping
- [ ] Success criteria from postconditions
- [ ] User approved
- [ ] Committed to git

</success_criteria>
