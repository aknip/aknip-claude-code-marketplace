<purpose>
Execute all plans in a phase using wave-based parallel execution with use case verification.
</purpose>

<core_principle>
The orchestrator's job is coordination, not execution. Each uc-executor loads the full plan and subfunction context. Orchestrator discovers plans, groups into waves, spawns agents, handles checkpoints, collects results, then spawns uc-verifier.
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
Confirm phase exists and has plans:

```bash
PADDED_PHASE=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
PHASE_DIR=$(ls -d .planning/phases/${PADDED_PHASE}-* .planning/phases/${PHASE_ARG}-* 2>/dev/null | head -1)

if [ -z "$PHASE_DIR" ]; then
  echo "ERROR: No phase directory matching '${PHASE_ARG}'"
  exit 1
fi

PLAN_COUNT=$(ls -1 "$PHASE_DIR"/*-PLAN.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$PLAN_COUNT" -eq 0 ]; then
  echo "ERROR: No plans found in $PHASE_DIR"
  exit 1
fi
```
</step>

<step name="discover_plans">
List all plans and extract metadata:

```bash
ls -1 "$PHASE_DIR"/*-PLAN.md 2>/dev/null | sort
ls -1 "$PHASE_DIR"/*-SUMMARY.md 2>/dev/null | sort
```

For each plan, read frontmatter to extract:
- `wave: N` - Execution wave
- `autonomous: true/false` - Whether plan has checkpoints
- `use_cases: [UC-UG-XXX]` - User-Goal use cases this implements
- `subfunctions: [UC-SF-XXX]` - Subfunctions this implements

Skip completed plans (have SUMMARY.md).
</step>

<step name="group_by_wave">
Read `wave` from each plan's frontmatter and group by wave number.

No dependency analysis needed. Wave numbers are pre-computed during `/esf:plan-phase`.
</step>

<step name="execute_waves">
Execute each wave in sequence. Autonomous plans within a wave run in parallel.

**For each wave:**

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

   <subfunctions>
   [inlined subfunction documents]
   </subfunctions>

   <context>
   @.planning/PROJECT.md
   @.planning/STATE.md
   </context>

   <tdd_context>
   Milestone version: ${MILESTONE_VERSION}
   E2E test directory: tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/
   Max fix attempts: ${MAX_FIX_ATTEMPTS:-5}

   TDD Loop:
   1. Load E2E test file from PLAN.md <e2e_tests> section
   2. Flesh out test skeletons with concrete selectors/assertions
   3. Run tests (RED phase) - tests should fail
   4. Implement feature code per subfunction spec
   5. Run tests again
   6. If FAIL: fix → agent-browser verify (FAST) → re-run E2E
   7. Repeat until GREEN (max attempts)
   8. Run phase regression: npx playwright test tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/
   </tdd_context>
   ", subagent_type="uc-executor", model="${executor_model}", description="Execute ${PLAN_ID}")
   ```

3. **Wait for all agents in wave to complete**

4. **Report completion with use case status AND E2E test results**

5. **Handle failures:** Ask user how to proceed

6. **Execute checkpoint plans between waves if needed**

7. **Proceed to next wave**
</step>

<step name="verify_scenarios">
After all plans complete, spawn uc-verifier to verify User-Goal scenarios:

```
Task(prompt="
<task>
Read ./agents/uc-verifier.md for your role and instructions.

Verify User-Goal use case scenarios for Phase ${PHASE_ARG}.
</task>

<phase_context>
Phase: ${PHASE_NAME}
Phase Directory: ${PHASE_DIR}
</phase_context>

<use_cases>
[User-Goal use cases for this phase]
</use_cases>

<subfunctions>
[Subfunction use cases]
</subfunctions>

<summaries>
[Plan summaries]
</summaries>

<e2e_regression>
MANDATORY at phase verification:
1. Create phase completion test: tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/${PADDED_PHASE}-phase.spec.ts
2. Run phase completion test
3. Run full regression: npx playwright test tests/e2e/
4. ALL tests must pass for COMPLETE status
5. Report all E2E results in VERIFICATION.md
</e2e_regression>
", subagent_type="uc-verifier", model="${verifier_model}", description="Verify scenarios")
```

**Route by verification status:**

| Status | Action |
|--------|--------|
| `COMPLETE` | Update roadmap, offer next phase |
| `GAPS FOUND` | Present gaps, offer `/esf:plan-phase {phase} --gaps` |
</step>

<step name="update_roadmap">
Update ROADMAP.md to reflect phase completion.

Commit phase completion artifacts.
</step>

<step name="offer_next">
Present next steps based on verification status:

**If verification COMPLETE:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PHASE {N} COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Use Case Status

| User-Goal | Scenarios | Verified |
|-----------|-----------|----------|
| UC-UG-001 | 4/4 | ✓ |
| UC-UG-002 | 3/3 | ✓ |

## ▶ Next Up

/esf:plan-phase {N+1}
```

**If GAPS found:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PHASE {N} GAPS FOUND ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Gaps Identified

[From VERIFICATION.md]

## ▶ Action Required

/esf:plan-phase {N} --gaps
```
</step>

</process>

<success_criteria>
- All plans executed
- Each subfunction committed atomically (including E2E test files)
- E2E tests run in TDD mode (RED → implement → GREEN)
- TDD fix loop used (agent-browser first, then E2E)
- Phase regression tests pass after each plan
- SUMMARY.md created for each plan (with E2E test results)
- uc-verifier spawned and completed
- Phase completion test created ({NN}-phase.spec.ts)
- Full regression passes (all milestones/phases)
- VERIFICATION.md created with E2E and regression results
- Use case statuses updated
- Clear outcome communicated
</success_criteria>
