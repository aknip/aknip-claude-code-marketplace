<purpose>
Execute all plans in a sprint using sub-sprint-based parallel execution with use case verification.
</purpose>

<core_principle>
The orchestrator's job is coordination, not execution. Each uc-executor loads the full plan and task context. Orchestrator discovers plans, groups into sub-sprints, spawns agents, handles checkpoints, collects results, then spawns uc-verifier.
</core_principle>

<process>

<step name="resolve_model_profile">
Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

**Model lookup table:**

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| uc-executor | opus | sonnet | sonnet |
| uc-verifier | sonnet | sonnet | haiku |
</step>

<step name="validate_phase">
Confirm sprint exists and has plans:

```bash
PADDED_SPRINT=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
SPRINT_DIR=$(ls -d .planning/sprints/${PADDED_SPRINT}-* .planning/sprints/${PHASE_ARG}-* 2>/dev/null | head -1)

if [ -z "$SPRINT_DIR" ]; then
  echo "ERROR: No sprint directory matching '${PHASE_ARG}'"
  exit 1
fi

PLAN_COUNT=$(ls -1 "$SPRINT_DIR"/*-PLAN.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$PLAN_COUNT" -eq 0 ]; then
  echo "ERROR: No plans found in $SPRINT_DIR"
  exit 1
fi
```
</step>

<step name="discover_plans">
List all plans and extract metadata:

```bash
ls -1 "$SPRINT_DIR"/*-PLAN.md 2>/dev/null | sort
ls -1 "$SPRINT_DIR"/*-SUMMARY.md 2>/dev/null | sort
```

For each plan, read frontmatter to extract:
- `sub-sprint: N` - Execution sub-sprint
- `autonomous: true/false` - Whether plan has checkpoints
- `use_cases: [UC-EP-XXX]` - Epic use cases this implements
- `tasks: [UC-TK-XXX]` - Tasks this implements

Skip completed plans (have SUMMARY.md).
</step>

<step name="group_by_wave">
Read `sub-sprint` from each plan's frontmatter and group by sub-sprint number.

No dependency analysis needed. Sub-Sprint numbers are pre-computed during `/esf:plan-sprint`.
</step>

<step name="execute_waves">
Execute each sub-sprint in sequence. Autonomous plans within a sub-sprint run in parallel.

**For each sub-sprint:**

1. **Describe what's being built (BEFORE spawning)**

2. **Spawn uc-executor agents in parallel:**

   ```
   Task(prompt="
   <task>
   Read ./agents/uc-executor.md for your role and instructions.

   Execute plan at ${PLAN_PATH}.
   </task>

   <plan>
   [inlined plan content]
   </plan>

   <tasks>
   [inlined task documents]
   </tasks>

   <context>
   @.planning/PROJECT.md
   @.planning/PROJECT-STATUS.md
   </context>

   <tdd_context>
   Milestone version: ${MILESTONE_VERSION}
   E2E test directory: tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/
   Max fix attempts: ${MAX_FIX_ATTEMPTS:-5}

   TDD Loop:
   1. Load E2E test file from PLAN.md <e2e_tests> section
   2. Flesh out test skeletons with concrete selectors/assertions
   3. Run tests (RED sprint) - tests should fail
   4. Implement feature code per task spec
   5. Run tests again
   6. If FAIL: fix → agent-browser verify (FAST) → re-run E2E
   7. Repeat until GREEN (max attempts)
   8. Run sprint regression: npx playwright test tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/
   </tdd_context>
   ", subagent_type="uc-executor", model="${executor_model}", description="Execute ${PLAN_ID}")
   ```

3. **Wait for all agents in sub-sprint to complete**

4. **Report completion with use case status AND E2E test results**

5. **Handle failures:** Ask user how to proceed

6. **Execute checkpoint plans between sub-sprints if needed**

7. **Proceed to next sub-sprint**
</step>

<step name="verify_scenarios">
After all plans complete, spawn uc-verifier to verify Epic scenarios:

```
Task(prompt="
<task>
Read ./agents/uc-verifier.md for your role and instructions.

Verify Epic use case scenarios for Sprint ${PHASE_ARG}.
</task>

<phase_context>
Sprint: ${SPRINT_NAME}
Sprint Directory: ${SPRINT_DIR}
</phase_context>

<use_cases>
[Epic use cases for this sprint]
</use_cases>

<tasks>
[Task use cases]
</tasks>

<summaries>
[Plan summaries]
</summaries>

<e2e_regression>
MANDATORY at sprint verification:
1. Create sprint completion test: tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/${PADDED_SPRINT}-sprint.spec.ts
2. Run sprint completion test
3. Run full regression: npx playwright test tests/e2e/
4. ALL tests must pass for COMPLETE status
5. Report all E2E results in VERIFICATION.md
</e2e_regression>
", subagent_type="uc-verifier", model="${verifier_model}", description="Verify scenarios")
```

**Route by verification status:**

| Status | Action |
|--------|--------|
| `COMPLETE` | Update roadmap, offer next sprint |
| `GAPS FOUND` | Present gaps, offer `/esf:plan-sprint {sprint} --gaps` |
</step>

<step name="update_roadmap">
Update PROJECT-PLAN.md to reflect sprint completion.

Commit sprint completion artifacts.
</step>

<step name="offer_next">
Present next steps based on verification status:

**If verification COMPLETE:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► SPRINT {N} COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Use Case Status

| Epic | Scenarios | Verified |
|-----------|-----------|----------|
| UC-EP-001 | 4/4 | ✓ |
| UC-EP-002 | 3/3 | ✓ |

## ▶ Next Up

/esf:plan-sprint {N+1}
```

**If GAPS found:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► SPRINT {N} GAPS FOUND ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Gaps Identified

[From VERIFICATION.md]

## ▶ Action Required

/esf:plan-sprint {N} --gaps
```
</step>

</process>

<success_criteria>
- All plans executed
- Each task committed atomically (including E2E test files)
- E2E tests run in TDD mode (RED → implement → GREEN)
- TDD fix loop used (agent-browser first, then E2E)
- Sprint regression tests pass after each plan
- SUMMARY.md created for each plan (with E2E test results)
- uc-verifier spawned and completed
- Sprint completion test created ({NN}-sprint.spec.ts)
- Full regression passes (all milestones/sprints)
- VERIFICATION.md created with E2E and regression results
- Use case statuses updated
- Clear outcome communicated
</success_criteria>
