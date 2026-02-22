---
name: uc:execute-phase
description: Execute phase plans with use case verification
argument-hint: "[N]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>

Execute all plans in a phase, implementing Subfunction use cases and verifying User-Goal scenarios are achievable.

**Input:** Phase number (required)

**Flow:**
1. Load plans grouped by wave
2. Spawn uc-executor for each plan (parallel within wave)
3. After all plans complete, spawn uc-verifier
4. Generate VERIFICATION.md with scenario results

**Creates:**
- Implementation code per Subfunction specification
- `.planning/phases/NN-*/NN-XX-SUMMARY.md` — Execution summaries
- `.planning/phases/NN-*/NN-VERIFICATION.md` — Scenario verification report
- Updated use case statuses in index.md

**After this command:** Phase complete if verification passes, or run `/uc:plan-phase N --gaps` to close gaps.

</objective>

<execution_context>

@./.claude/agents/uc-executor.md
@./.claude/agents/uc-verifier.md
@./.claude/use-case-driven/workflows/execute-phase.md
@./.claude/use-case-driven/references/model-profiles.md

</execution_context>

<process>

## Phase 1: Validate and Load

**Parse arguments:**

```bash
PHASE_ARG="${1:-}"
if [ -z "$PHASE_ARG" ]; then
  echo "ERROR: Phase number required. Usage: /uc:execute-phase N"
  exit 1
fi
```

**Find phase directory:**

```bash
PADDED_PHASE=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
PHASE_DIR=$(ls -d .planning/phases/${PADDED_PHASE}-* .planning/phases/${PHASE_ARG}-* 2>/dev/null | head -1)

if [ -z "$PHASE_DIR" ]; then
  echo "ERROR: Phase ${PHASE_ARG} not found"
  exit 1
fi

PHASE_NAME=$(basename "$PHASE_DIR")
```

**Check for PLAN.md files:**

```bash
PLAN_COUNT=$(ls "${PHASE_DIR}"/*-PLAN.md 2>/dev/null | wc -l)
if [ "$PLAN_COUNT" -eq 0 ]; then
  echo "ERROR: No PLAN.md files found. Run /uc:plan-phase ${PHASE_ARG} first."
  exit 1
fi
```

**Load config:**

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
DO_VERIFY=$(cat .planning/config.json 2>/dev/null | grep -o '"verifier"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
PARALLELIZATION=$(cat .planning/config.json 2>/dev/null | grep -o '"parallelization"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
MILESTONE_VERSION=$(cat .planning/config.json 2>/dev/null | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "1.0.0")
E2E_ENABLED=$(cat .planning/config.json 2>/dev/null | grep -o '"e2e"[[:space:]]*:' | head -1)
MAX_FIX_ATTEMPTS=$(cat .planning/config.json 2>/dev/null | grep -o '"max_fix_attempts"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' || echo "5")
```

**Resolve models:**

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| uc-executor | opus | sonnet | sonnet |
| uc-verifier | sonnet | sonnet | haiku |

## Phase 2: Discover Plans and Waves

**Parse plan metadata:**

```bash
for plan_file in "${PHASE_DIR}"/*-PLAN.md; do
  PLAN_NUM=$(basename "$plan_file" | sed 's/.*-\([0-9]*\)-PLAN.md/\1/')
  WAVE=$(sed -n '/^wave:/p' "$plan_file" | head -1 | awk '{print $2}')
  AUTONOMOUS=$(sed -n '/^autonomous:/p' "$plan_file" | head -1 | awk '{print $2}')
  echo "Plan ${PLAN_NUM}: wave=${WAVE}, autonomous=${AUTONOMOUS}"
done
```

**Group by wave:**

```
Wave 1: [plan-01, plan-02]
Wave 2: [plan-03]
```

## Phase 3: Execute Plans

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► EXECUTING PHASE ${PHASE_ARG}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase: ${PHASE_NAME}
Plans: ${PLAN_COUNT}
Waves: ${WAVE_COUNT}
```

**For each wave (sequentially):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WAVE ${WAVE_NUM} of ${WAVE_COUNT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning ${PLAN_COUNT_IN_WAVE} executor(s)...
```

**If parallelization enabled:**

Spawn ALL plans in this wave simultaneously using multiple Task calls in one message:

```
Task(prompt="
<task>
Read ./.claude/agents/uc-executor.md for your role and instructions.

Execute plan ${PLAN_NUM}.
</task>

<plan>
@${PHASE_DIR}/${PADDED_PHASE}-${PLAN_NUM}-PLAN.md
</plan>

<subfunctions>
[for each UC-SF referenced in plan]
@.planning/use-cases/subfunction/UC-SF-XXX.md
</subfunctions>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
</context>

<output>
1. **Load E2E test file** from PLAN.md `<e2e_tests>` section
2. **Flesh out E2E test skeletons** with concrete selectors and assertions — see <detail_assertion_requirements> below
   ⚠️ **MANDATORY: Remove ALL `// TODO: Implement during execution` markers!**
   ⚠️ **Every test body MUST contain at least one `expect()` or `await page.` call**
3. **Run Skeleton Gate** — verify no TODOs remain:
   ```bash
   grep -rn "TODO: Implement during execution" ${TEST_FILE}
   # MUST return 0 matches. If not: go back to step 2!
   ```
4. **Run E2E tests (RED phase)** — tests should fail before implementation
5. Implement each task per subfunction specification
6. **Run E2E tests after each task** — TDD green phase
7. **If tests fail → TDD Fix Loop:**
   a) Fix the code
   b) Verify fix with agent-browser (fast single-case check)
   c) Only after agent-browser confirms → re-run E2E test
   d) Max ${MAX_FIX_ATTEMPTS:-5} attempts
8. Verify against subfunction criteria (store checks, API checks)
9. Run "Agent Browser Test:" commands from PLAN.md verification section (if present)
10. Capture screenshots as evidence in .planning/phases/NN-*/screenshots/
11. **Run Skeleton Gate AGAIN before commit** — `grep "TODO: Implement" ${TEST_FILE}` MUST return 0
12. Commit atomically per subfunction (include E2E test files!)
13. **Run phase regression:** `npx playwright test tests/e2e/v{VERSION}/phase-{NN}/`
14. Update subfunction status to Implemented
15. Create ${PADDED_PHASE}-${PLAN_NUM}-SUMMARY.md with E2E test results and screenshot references
16. Return EXECUTION COMPLETE
</output>

<tdd_strategy>
CRITICAL: Every sub-phase plan follows Test-Driven Development.

**TDD Loop:**
```
1. Load E2E test from <e2e_tests> section
2. Flesh out test with real selectors/assertions
   ⚠️ Remove ALL "TODO: Implement during execution" markers!
   ⚠️ Every test body MUST have real expect()/page. calls!
3. SKELETON GATE: grep "TODO: Implement" → MUST return 0 matches
4. Run test → should FAIL (RED)
5. Implement feature code
6. Run test → should PASS (GREEN)
7. If FAIL:
   a) Fix code
   b) Quick-check with agent-browser
   c) Re-run E2E test only after agent-browser confirms
   d) Repeat until GREEN (max 5 attempts)
8. SKELETON GATE again before commit
9. Commit implementation + test together
10. Run regression for all sub-phases so far
```

**Fix Strategy (Efficiency):**
- Agent-browser is FAST for checking a single fix
- Playwright E2E is SLOW but authoritative
- Fix → agent-browser verify → only then E2E
- This saves significant time on each fix cycle

**Detail Assertion Depth:**
- When fleshing out test skeletons, implement ALL bullet-point detail checks from the PLAN.md
- Every numeric value → `expect(value).toBeCloseTo(expected, precision)` or `expect(value).toBe(expected)`
- Every status/text → `expect(element).toContainText('exact German text')`
- Every count → `expect(rows).toHaveLength(exactNumber)`
- Every cross-view check → read value in view A, switch, read in view B, compare
- Do NOT skip detail checks or replace them with weaker assertions

**Regression after each plan:**
```bash
npx playwright test tests/e2e/v{VERSION}/phase-{NN}/
```

**E2E test file location:**
```bash
VERSION=$(cat .planning/config.json | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
TEST_FILE="tests/e2e/v${VERSION}/phase-${PADDED_PHASE}/${PADDED_PHASE}-${PLAN_NUM}.spec.ts"
```
</tdd_strategy>

<agent_browser_execution>
IMPORTANT: After implementing tasks, execute the "Agent Browser Test:" section from the PLAN.md.

**Screenshot Naming Convention:**
All screenshots MUST use timestamp prefix format: `YYYY-MM-DD_HHMMSS_description.png`
Example: `2026-01-31_185500_UC-UG-001_step-1-dialog-opened.png`
Save screenshots to: `.planning/phases/NN-*/screenshots/`

The executor should:
1. Start dev servers if not running (npm run dev, backend if needed)
2. Execute agent-browser commands from the verification section
3. Save screenshots to `.planning/phases/NN-*/screenshots/` with timestamp prefix
4. Include screenshot paths in SUMMARY.md
5. Stop if tests fail - do not commit broken code

Agent-browser is installed locally at: node_modules/agent-browser/bin/agent-browser
</agent_browser_execution>

<detail_assertion_requirements>
CRITICAL: When fleshing out E2E test skeletons, the executor MUST convert every bullet-point detail check from the PLAN.md into a concrete Playwright assertion.

**Assertion mapping rules:**

| Detail Check Type | Playwright Assertion Pattern |
|-------------------|------------------------------|
| Exact numeric value | `expect(parseFloat(text)).toBeCloseTo(expected, precision)` |
| Numeric with tolerance | `expect(value).toBeGreaterThan(min); expect(value).toBeLessThan(max)` |
| Exact text (German) | `expect(locator).toContainText('Bereit zum Start')` |
| Row/item count | `expect(rows).toHaveLength(4)` |
| Attribute value | `expect(locator).toHaveAttribute('data-zone', 'yellow')` |
| Visibility check | `expect(locator).toBeVisible()` / `expect(locator).toBeHidden()` |
| Format check (date) | `expect(text).toMatch(/\d{2}\.\d{2}\.\d{4}/)` |
| Cross-view invariance | Read values in view A, switch to B, compare: `expect(valueB).toBeCloseTo(valueA, 0)` |
| Survives reload | Assert value, `page.reload()`, wait, assert same value again |
| Sum/total verification | Read individual values, sum them, compare to displayed total |

**Regression detail checks (for tests promoted to regression suite):**

Regression tests MUST include at minimum:
- **Data integrity spot-checks**: At least 3 specific data point verifications per test (e.g., specific cell values in tables, specific KPI numbers after known state changes)
- **Calculation verification**: For any feature involving computed values, verify at least 2 concrete calculation results with known inputs/outputs
- **Display formatting**: At least 1 format assertion per test (date format, number format, German text)
- **State consistency**: After any state-changing action, verify the change is reflected in ALL views that show that data

**Example — fleshed-out test from skeleton:**

```typescript
// Skeleton from planner:
// Detail checks:
// - LCC displays "31%" (±5% tolerance)
// - BC displays "44%" (±20% tolerance)
// - Zone indicator shows "yellow"

// Fleshed out by executor:
const lccText = await page.locator('[data-testid="lcc-value"]').textContent();
const lcc = parseFloat(lccText!.match(/(-?\d+\.?\d*)/)?.[1] ?? 'NaN');
expect(lcc).toBeGreaterThanOrEqual(26);  // 31 - 5
expect(lcc).toBeLessThanOrEqual(36);     // 31 + 5

const bcText = await page.locator('[data-testid="bc-value"]').textContent();
const bc = parseFloat(bcText!.match(/(-?\d+\.?\d*)/)?.[1] ?? 'NaN');
expect(bc).toBeGreaterThanOrEqual(24);   // 44 - 20
expect(bc).toBeLessThanOrEqual(64);      // 44 + 20

await expect(page.locator('[data-testid="zone-indicator"]'))
  .toHaveAttribute('data-zone', 'yellow');
```
</detail_assertion_requirements>

<mandatory_api_verification>
CRITICAL: For any task that implements API-calling functionality:

1. **Verify API calls work end-to-end** - Don't just write the code, TEST IT:
   - Intercept fetch calls with: agent-browser eval "window.__apiCalls = []..."
   - Perform the action
   - Check API was called: agent-browser eval "JSON.stringify(window.__apiCalls)"
   - Verify request body has ALL required fields (NO undefined values!)
   - Check console for errors: agent-browser console && agent-browser errors

2. **Verify data persistence**:
   - After action: agent-browser reload
   - Verify data still exists after reload
   - If data disappeared, the API call failed!

3. **Cross-reference store usage**:
   - Before using any store field, verify it exists in the store definition
   - Common bug: state.fieldName where fieldName doesn't match store
   - Example: state.mandant vs state.currentMandant - DIFFERENT FIELDS!

4. **Verify cache sharing (for hooks used by multiple components)**:
   - If hook uses useState → each component gets SEPARATE copy (BUG!)
   - If hook uses useQuery → all components share cache (GOOD)
   - Test: Trigger action, check if ALL related UI components update
   - Common bug: API works, data saved, but UI doesn't update
   - Symptom: Data appears only after page reload → cache sharing bug!
</mandatory_api_verification>
", subagent_type="uc-executor", model="${executor_model}", description="Execute plan ${PLAN_NUM}")
```

**Wait for all plans in wave to complete before starting next wave.**

**After each wave completes — Skeleton Gate Check:**

```bash
# Scan ALL test files in the phase for remaining TODO skeletons
TODO_FILES=$(grep -rln "TODO: Implement during execution" tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/ 2>/dev/null)

if [ -n "$TODO_FILES" ]; then
  echo "⚠️  SKELETON GATE WARNING: Unimplemented test skeletons found after wave ${WAVE_NUM}:"
  grep -rn "TODO: Implement during execution" tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/
  echo ""
  echo "These test skeletons were NOT fleshed out by the executor."
  echo "This will be reported as a GAP during verification."
fi
```

**Handle checkpoints:**

If a plan has `autonomous: false`, it contains checkpoints. The executor will pause and request user input. Present checkpoint to user, get response, resume executor.

## Phase 4: Post-Execution Verification

**If `workflow.verifier` is true:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► VERIFYING SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-verifier...
```

**Spawn uc-verifier agent:**

```
Task(prompt="
<task>
Read ./.claude/agents/uc-verifier.md for your role and instructions.

Verify User-Goal use case scenarios are achievable.
</task>

<phase_context>
Phase: ${PHASE_NAME}
Phase Directory: ${PHASE_DIR}
</phase_context>

<use_cases>
User-Goal use cases for this phase:
@.planning/use-cases/user-goal/UC-UG-XXX.md
[for each assigned use case]
</use_cases>

<subfunctions>
@.planning/use-cases/subfunction/UC-SF-XXX.md
[for each subfunction]
</subfunctions>

<summaries>
@${PHASE_DIR}/${PADDED_PHASE}-*-SUMMARY.md
</summaries>

<e2e_context>
Milestone version: ${MILESTONE_VERSION}
E2E test directory: tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/
All E2E tests: tests/e2e/regression/
</e2e_context>

<output>
1. Walk each User-Goal scenario step by step
2. Browser test UI scenarios with agent-browser
3. Verify postconditions achievable
4. Test alternative and exception flows
5. **Create phase completion test:** tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/${PADDED_PHASE}-phase.spec.ts
6. **Run phase completion test:** npx playwright test tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/${PADDED_PHASE}-phase.spec.ts
7. **Run full regression:** npx playwright test tests/e2e/regression/
8. Create ${PADDED_PHASE}-VERIFICATION.md with E2E results and regression report
9. Update use case statuses in index.md
10. Return VERIFICATION COMPLETE with status
</output>
", subagent_type="uc-verifier", model="${verifier_model}", description="Verify scenarios")
```

## Phase 5: Present Results

**If verification COMPLETE:**

Check if this is the last phase in milestone:

```bash
TOTAL_PHASES=$(grep "^## Phase\|^### Phase" .planning/ROADMAP.md | wc -l | tr -d ' ')
IS_LAST_PHASE=false
if [ "$PHASE_ARG" -eq "$TOTAL_PHASES" ]; then
  IS_LAST_PHASE=true
fi
```

**If NOT last phase:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PHASE ${PHASE_ARG} COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Use Case Status

| User-Goal | Scenarios | Passed | Status |
|-----------|-----------|--------|--------|
| UC-UG-001 | 4 | 4 | ✓ Verified |
| UC-UG-002 | 3 | 3 | ✓ Verified |

## Subfunctions Implemented

| ID | Name | Status |
|----|------|--------|
| UC-SF-001 | Validate Task Title | ✓ Implemented |
| UC-SF-002 | Save Task to State | ✓ Implemented |

## Screenshots

[List of captured screenshots as evidence]

───────────────────────────────────────────────────────

## ▶ Next Up

/uc:progress — check overall project progress
/uc:plan-phase [N+1] — plan next phase

<sub>/clear first → fresh context window</sub>
```

**If IS last phase:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PHASE ${PHASE_ARG} COMPLETE - LAST PHASE! ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Use Case Status

| User-Goal | Scenarios | Passed | Status |
|-----------|-----------|--------|--------|
| UC-UG-001 | 4 | 4 | ✓ Verified |
| UC-UG-002 | 3 | 3 | ✓ Verified |

## Subfunctions Implemented

| ID | Name | Status |
|----|------|--------|
| UC-SF-001 | Validate Task Title | ✓ Implemented |
| UC-SF-002 | Save Task to State | ✓ Implemented |

## Screenshots

[List of captured screenshots as evidence]

───────────────────────────────────────────────────────

✅ All phases in milestone ${MILESTONE_VERSION} are now complete!

## ▶ Milestone Completion

**Next Steps:**
   1. Check readiness: /uc:audit-milestone
   2. Mark complete: /uc:complete-milestone --version ${MILESTONE_VERSION}
   3. Start next milestone: /uc:new-milestone

<sub>/clear first → fresh context window</sub>
```

**If GAPS found:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PHASE ${PHASE_ARG} GAPS FOUND ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Verification Results

| User-Goal | Scenarios | Passed | Failed |
|-----------|-----------|--------|--------|
| UC-UG-001 | 4 | 3 | 1 |

## Gaps Identified

| Use Case | Step | Issue |
|----------|------|-------|
| UC-UG-001 | 4 | Task not appearing in list |

───────────────────────────────────────────────────────

## ▶ Action Required

/uc:plan-phase ${PHASE_ARG} --gaps — create gap closure plans

<sub>/clear first → fresh context window</sub>
```

## Phase 6: Update STATE.md

```bash
# Update current phase status
sed -i '' "s/Phase ${PHASE_ARG}:.*$/Phase ${PHASE_ARG}: ${STATUS}/" .planning/STATE.md

# Update use case progress
# [logic to update Summary-Level completion %]
```

Commit state update.

</process>

<success_criteria>

- [ ] Phase validated with PLAN.md files
- [ ] Plans grouped by wave
- [ ] uc-executor spawned for each plan
- [ ] Parallel execution within waves
- [ ] **Skeleton Gate passed** — no `TODO: Implement during execution` markers remain in any test file
- [ ] **E2E tests run in TDD mode** (RED → implement → GREEN)
- [ ] **E2E tests contain concrete detail assertions** (exact values, counts, formats — not generic checks)
- [ ] **Every test body has real assertions** — at least one `expect()` or `await page.` call per test
- [ ] **TDD fix loop used** (agent-browser first, then E2E)
- [ ] All tasks implemented per subfunction specs
- [ ] Atomic commits per subfunction (including E2E test files)
- [ ] **Phase regression tests pass** after each plan
- [ ] SUMMARY.md created for each plan (with E2E test results)
- [ ] uc-verifier spawned (if enabled)
- [ ] **Verifier Skeleton Gate passed** — verifier confirms no TODO skeletons remain
- [ ] Scenarios walked with browser testing
- [ ] **Phase completion test created** ({NN}-phase.spec.ts)
- [ ] **Full regression passes** (all milestones/phases)
- [ ] VERIFICATION.md created with evidence and regression report
- [ ] Use case statuses updated in index.md
- [ ] STATE.md updated with progress
- [ ] Clear outcome: COMPLETE or GAPS FOUND
- [ ] Next steps communicated

</success_criteria>
