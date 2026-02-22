---
description: Execute small ad-hoc tasks with UC guarantees
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>

Execute small, ad-hoc tasks with use case driven guarantees (atomic commits, traceability) while bypassing optional agents like researchers and verifiers.

**Use when:**
- Task is clear and well-understood
- Work is small enough to skip research/verification
- Task doesn't fit into a planned phase
- Bug fixes, tweaks, or one-off changes

**Flow:**
1. Ask for task description
2. Spawn uc-planner (quick mode) → creates focused plan
3. Spawn uc-executor → implements plan
4. Update STATE.md with completion

**Creates:**
- `.planning/quick/NNN-slug/NNN-PLAN.md` — Focused plan (1-3 tasks)
- `.planning/quick/NNN-slug/NNN-SUMMARY.md` — Execution summary
- Updated STATE.md "Quick Tasks" table

**Note:** Quick tasks are tracked separately from phase milestones. Use phase workflow for significant features.

</objective>

<execution_context>

@./agents/uc-planner.md
@./agents/uc-executor.md
@./use-case-driven/references/model-profiles.md

</execution_context>

<process>

## Phase 1: Load Config

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

**Resolve models:**

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| uc-planner (quick) | opus | sonnet | sonnet |
| uc-executor | opus | sonnet | sonnet |

## Phase 2: Pre-flight Checks

**Verify project initialized:**

```bash
if [ ! -f .planning/ROADMAP.md ]; then
  echo "ERROR: Project not initialized. Run /esf:new-project first."
  exit 1
fi
```

**Create quick directory if needed:**

```bash
mkdir -p .planning/quick
```

## Phase 3: Get Task Description

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► QUICK TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick tasks bypass research and verification while maintaining:
- Atomic commits with traceability
- STATE.md tracking
- Use case context awareness
```

**Ask for task:**

Ask inline: "What's the quick task?"

Wait for response. The description should be:
- Clear and actionable
- Small enough to complete in one session
- Not a major feature that needs phased planning

**If task seems too large:**

Suggest: "This looks like it might need full phase planning. Would you prefer to use `/esf:plan-phase` instead?"

Use AskUserQuestion:
- header: "Task Scope"
- question: "This task seems substantial. How would you like to proceed?"
- options:
  - "Keep as quick task" — Proceed with streamlined workflow
  - "Use phase planning" — Exit and suggest /esf:plan-phase

## Phase 4: Calculate Task Number

```bash
# Find highest existing quick task number
EXISTING=$(ls -d .planning/quick/[0-9][0-9][0-9]-* 2>/dev/null | sort -r | head -1)
if [ -n "$EXISTING" ]; then
  LAST_NUM=$(basename "$EXISTING" | grep -o '^[0-9]*')
  TASK_NUM=$(printf "%03d" $((10#$LAST_NUM + 1)))
else
  TASK_NUM="001"
fi

# Create slug from task description
SLUG=$(echo "${TASK_DESCRIPTION}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | cut -c1-30)
TASK_DIR=".planning/quick/${TASK_NUM}-${SLUG}"

mkdir -p "$TASK_DIR"
echo "Created: $TASK_DIR"
```

## Phase 5: Planning

**Display stage:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PLANNING QUICK TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-planner (quick mode)...
```

**Spawn uc-planner in quick mode:**

```
Task(prompt="
<task>
Read ./agents/uc-planner.md for your role.

Create a FOCUSED plan for this quick task. Quick mode means:
- 1-3 tasks maximum
- No subfunction use case creation (use existing or skip)
- Reference existing use cases where relevant
- Skip research and verification phases
</task>

<quick_task>
Task: ${TASK_DESCRIPTION}
Task ID: ${TASK_NUM}
Output Directory: ${TASK_DIR}
</quick_task>

<context>
@.planning/PROJECT.md
@.planning/use-cases/index.md
</context>

<constraints>
- Maximum 3 tasks
- Each task should be completable in minutes
- Reference existing UC-SF-* if the work relates to them
- No new use case documents needed
- Commit message format: fix|feat|chore(quick-${TASK_NUM}): description
</constraints>

<output>
Create ${TASK_DIR}/${TASK_NUM}-PLAN.md with:
- objective: Brief description
- tasks: 1-3 focused tasks
- related_use_cases: Any existing UC-* this relates to (optional)
- wave: 1 (always single wave for quick)
- autonomous: true (no checkpoints for quick tasks)

Return PLANNING COMPLETE.
</output>
", subagent_type="uc-planner", model="${planner_model}", description="Quick task planning")
```

## Phase 6: Execution

**Display stage:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► EXECUTING QUICK TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-executor...
```

**Spawn uc-executor:**

```
Task(prompt="
<task>
Read ./agents/uc-executor.md for your role.

Execute this quick task plan.
</task>

<plan>
@${TASK_DIR}/${TASK_NUM}-PLAN.md
</plan>

<context>
@.planning/PROJECT.md
</context>

<quick_mode>
- Execute all tasks sequentially
- Atomic commits per task
- Commit format: fix|feat|chore(quick-${TASK_NUM}): description
- No verification phase after
- Create SUMMARY.md when done
</quick_mode>

<output>
1. Implement each task
2. Commit atomically
3. Create ${TASK_DIR}/${TASK_NUM}-SUMMARY.md with results
4. Return EXECUTION COMPLETE with commit hashes
</output>
", subagent_type="uc-executor", model="${executor_model}", description="Quick task execution")
```

## Phase 7: Finalize

**Update STATE.md:**

Add or update "Quick Tasks" section:

```markdown
## Quick Tasks

| ID | Description | Status | Date | Commits |
|----|-------------|--------|------|---------|
| ${TASK_NUM} | ${TASK_DESCRIPTION} | ✓ Done | ${DATE} | ${COMMIT_HASHES} |
```

**Commit tracking:**

```bash
git add .planning/quick/${TASK_NUM}-*/
git add .planning/STATE.md
git commit -m "docs(quick-${TASK_NUM}): track completion

Task: ${TASK_DESCRIPTION}
Commits: ${COMMIT_HASHES}"
```

## Phase 8: Complete

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► QUICK TASK COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task ${TASK_NUM}: ${TASK_DESCRIPTION}**

## Results

| Task | Status | Commit |
|------|--------|--------|
| [Task 1] | ✓ | abc123 |
| [Task 2] | ✓ | def456 |

## Files

- ${TASK_DIR}/${TASK_NUM}-PLAN.md
- ${TASK_DIR}/${TASK_NUM}-SUMMARY.md

───────────────────────────────────────────────────────

Quick task completed and tracked in STATE.md.

<sub>For larger features, use /esf:plan-phase</sub>
```

</process>

<success_criteria>

- [ ] Project initialized (ROADMAP.md exists)
- [ ] Task description captured
- [ ] Task numbered sequentially (001, 002, ...)
- [ ] Task directory created in .planning/quick/
- [ ] uc-planner spawned (quick mode)
- [ ] PLAN.md created with 1-3 focused tasks
- [ ] uc-executor spawned
- [ ] Tasks implemented with atomic commits
- [ ] SUMMARY.md created with results
- [ ] STATE.md "Quick Tasks" table updated
- [ ] All artifacts committed
- [ ] Clear completion summary shown

</success_criteria>
