---
name: uc:analyze-requirements
description: Extract use cases from existing requirements
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
---

<objective>

Extract use cases from existing REQUIREMENTS.md or other requirement sources. Use this for projects that started with feature-based requirements and want to adopt use case driven methodology.

**Input:** Existing requirements (REQUIREMENTS.md, user stories, etc.)

**Creates:**
- Use case documents at Summary and User-Goal levels
- Updated index.md

</objective>

<process>

## Load Existing Requirements

```bash
cat .planning/REQUIREMENTS.md
```

## Spawn Analyst

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► ANALYZING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-analyst...
```

```
Task(prompt="
<task>
Read ./.claude/agents/uc-analyst.md for your role and instructions.

Extract use cases from existing requirements.
</task>

<requirements>
@.planning/REQUIREMENTS.md
</requirements>

<project_context>
@.planning/PROJECT.md
</project_context>

<output>
1. Map requirement categories to Summary-Level use cases
2. Map individual requirements to User-Goal use cases
3. Create use case documents
4. Create index.md with requirement traceability
5. Return ANALYSIS COMPLETE
</output>
", subagent_type="uc-analyst", description="Extract use cases from requirements")
```

## Present Mapping

```
## Requirement → Use Case Mapping

| Requirement | Use Case | Level |
|-------------|----------|-------|
| AUTH-01 | UC-UG-001: Create Account | User-Goal |
| AUTH-02 | UC-UG-002: Login | User-Goal |
| AUTH-01,02,03 | UC-S-001: Authenticate Users | Summary |
```

## Commit

```bash
git add .planning/use-cases/
git commit -m "docs: extract use cases from requirements"
```

</process>

<success_criteria>

- [ ] Existing requirements loaded
- [ ] uc-analyst spawned
- [ ] Requirements mapped to use cases
- [ ] Use case documents created
- [ ] Traceability preserved
- [ ] Committed to git

</success_criteria>
