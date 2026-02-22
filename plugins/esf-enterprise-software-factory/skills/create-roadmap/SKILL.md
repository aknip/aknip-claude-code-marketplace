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

Create or regenerate ROADMAP.md from use case hierarchy. Use this after adding new use cases or to restructure phases.

**Input:** Use cases in .planning/use-cases/

**Creates:**
- `.planning/ROADMAP.md` — Use case driven roadmap
- `.planning/STATE.md` — Use case progress tracking (if new)
- Updated User-Goal use cases with phase assignments

</objective>

<process>

## Load Use Cases

```bash
cat .planning/use-cases/index.md
ls .planning/use-cases/summary/*.md
ls .planning/use-cases/user-goal/*.md
```

## Check for Existing Roadmap

```bash
if [ -f .planning/ROADMAP.md ]; then
  echo "Existing roadmap found. This will regenerate it."
  # Backup existing
  cp .planning/ROADMAP.md .planning/ROADMAP.md.backup
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
2. Group User-Goal use cases into phases
3. Derive success criteria from postconditions
4. Create ROADMAP.md
5. Update STATE.md
6. Update User-Goal use cases with phase assignments
7. Return ROADMAP CREATED
</output>
", subagent_type="uc-modeler", description="Create roadmap")
```

## Present and Approve

Display roadmap summary.

Use AskUserQuestion:
- header: "Roadmap"
- question: "Does this phase structure work?"
- options:
  - "Approve" — Commit roadmap
  - "Adjust" — Tell me what to change

## Commit

```bash
git add .planning/ROADMAP.md .planning/STATE.md .planning/use-cases/
git commit -m "docs: create use case driven roadmap"
```

</process>

<success_criteria>

- [ ] Use case hierarchy loaded
- [ ] uc-modeler spawned
- [ ] Dependencies analyzed
- [ ] Phases created with use case mapping
- [ ] Success criteria from postconditions
- [ ] User approved
- [ ] Committed to git

</success_criteria>
