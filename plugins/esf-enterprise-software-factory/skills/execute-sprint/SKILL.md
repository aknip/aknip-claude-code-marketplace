---
description: Execute sprint plans with use case verification
argument-hint: "[N]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>

Execute all plans in a sprint, implementing Task use cases and verifying Epic scenarios are achievable.

**Input:** Sprint number (required)

**Flow:**
1. Load plans grouped by sub-sprint
2. Spawn uc-executor for each plan (parallel within sub-sprint)
3. After all plans complete, spawn uc-verifier
4. Generate VERIFICATION.md with scenario results

**Creates:**
- Implementation code per Task specification
- `.planning/sprints/NN-*/NN-XX-SUMMARY.md` — Execution summaries
- `.planning/sprints/NN-*/NN-VERIFICATION.md` — Scenario verification report
- Updated use case statuses in index.md

**After this command:** Sprint complete if verification passes, or run `/esf:plan-sprint N --gaps` to close gaps.

</objective>

<execution_context>

@./agents/uc-executor.md
@./agents/uc-verifier.md
@./use-case-driven/workflows/execute-sprint.md
@./use-case-driven/references/model-profiles.md

</execution_context>

<process>

## Sprint 1: Validate and Load

**Parse arguments:**

```bash
PHASE_ARG="${1:-}"
if [ -z "$PHASE_ARG" ]; then
  echo "ERROR: Sprint number required. Usage: /esf:execute-sprint N"
  exit 1
fi
```

**Find sprint directory:**

```bash
PADDED_SPRINT=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
SPRINT_DIR=$(ls -d .planning/sprints/${PADDED_SPRINT}-* .planning/sprints/${PHASE_ARG}-* 2>/dev/null | head -1)

if [ -z "$SPRINT_DIR" ]; then
  echo "ERROR: Sprint ${PHASE_ARG} not found"
  exit 1
fi

SPRINT_NAME=$(basename "$SPRINT_DIR")
```

**Check for PLAN.md files:**

```bash
PLAN_COUNT=$(ls "${SPRINT_DIR}"/*-PLAN.md 2>/dev/null | wc -l)
if [ "$PLAN_COUNT" -eq 0 ]; then
  echo "ERROR: No PLAN.md files found. Run /esf:plan-sprint ${PHASE_ARG} first."
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

## Sprint 2: Discover Plans and Sub-Sprints

**Parse plan metadata:**

```bash
for plan_file in "${SPRINT_DIR}"/*-PLAN.md; do
  PLAN_NUM=$(basename "$plan_file" | sed 's/.*-\([0-9]*\)-PLAN.md/\1/')
  WAVE=$(sed -n '/^sub-sprint:/p' "$plan_file" | head -1 | awk '{print $2}')
  AUTONOMOUS=$(sed -n '/^autonomous:/p' "$plan_file" | head -1 | awk '{print $2}')
  echo "Plan ${PLAN_NUM}: sub-sprint=${WAVE}, autonomous=${AUTONOMOUS}"
done
```

**Group by sub-sprint:**

```
Sub-Sprint 1: [plan-01, plan-02]
Sub-Sprint 2: [plan-03]
```

## Sprint 3: Execute Plans

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► EXECUTING SPRINT ${PHASE_ARG}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sprint: ${SPRINT_NAME}
Plans: ${PLAN_COUNT}
Sub-Sprints: ${WAVE_COUNT}
```

**For each sub-sprint (sequentially):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WAVE ${WAVE_NUM} of ${WAVE_COUNT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning ${PLAN_COUNT_IN_WAVE} executor(s)...
```

**If parallelization enabled:**

Spawn ALL plans in this sub-sprint simultaneously using multiple Task calls in one message:

```
Task(prompt="
<task>
Read ./agents/uc-executor.md for your role and instructions.

Execute plan ${PLAN_NUM}.
</task>

<project_rules>
@./CLAUDE.md
</project_rules>

<plan>
@${SPRINT_DIR}/${PADDED_SPRINT}-${PLAN_NUM}-PLAN.md
</plan>

<tasks>
[for each UC-SF referenced in plan]
@.planning/use-cases/task/UC-TK-XXX.md
</tasks>

<context>
@.planning/PROJECT.md
@.planning/PROJECT-PLAN.md
@${SPRINT_DIR}/${PADDED_SPRINT}-CONTEXT.md (if exists)
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
3b. **Load Unit-Test file** from PLAN.md `<unit_tests>` section (if exists)
3c. **Flesh out Unit-Test skeletons** with real assertions
3d. **Run Unit-Tests (RED):** `npx vitest run <test-file>` — tests should fail
3e. **Implement logic code** (validation, calculations, transformations)
3f. **Run Unit-Tests (GREEN):** `npx vitest run <test-file>` — tests should pass
3g. **If Unit-Tests FAIL → fix code, NOT test** (max 5 attempts)
4. **Run E2E tests (RED sprint)** — tests should fail before implementation
5. Implement each task per task specification
6. **Run E2E tests after each task** — TDD green sprint
7. **If tests fail → TDD Fix Loop:**
   a) Fix the code
   b) Verify fix with agent-browser (fast single-case check)
   c) Only after agent-browser confirms → re-run E2E test
   d) Max ${MAX_FIX_ATTEMPTS:-5} attempts
8. Verify against task criteria (store checks, API checks)
9. Run "Agent Browser Test:" commands from PLAN.md verification section (if present)
10. Capture screenshots as evidence in .planning/sprints/NN-*/screenshots/
11. **Run Skeleton Gate AGAIN before commit** — `grep "TODO: Implement" ${TEST_FILE}` MUST return 0
11b. **Anti-Pattern Gate (run before ANY commit):**
    ```bash
    # Check 1: No TODO skeletons in unit tests
    grep -rn "TODO: Implement during execution" src/**/__tests__/ 2>/dev/null
    # MUST return 0 matches

    # Check 2: No mock-behavior-only tests (heuristic)
    grep -rn "toHaveBeenCalled\b" src/**/__tests__/ 2>/dev/null | grep -v "// verified-mock"
    # Review any matches — are they testing mock behavior instead of real behavior?

    # Check 3: No test-only methods in production code
    grep -rn "// test-only\|// for testing\|@VisibleForTesting" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
    # MUST return 0 matches
    ```
12. Commit atomically per task (include E2E test files + unit test files!)
13. **Run sprint regression:** `npx playwright test tests/e2e/v{VERSION}/sprint-{NN}/`
14. Update task status to Implemented
14b. **COMPLETION SELF-CHECK (MANDATORY before SUMMARY):**
    - Re-read PLAN.md task list
    - Verify each task has: implementation files, git commit, E2E pass, status updated
    - If ANY task incomplete: report partial completion, do NOT claim success
15. Create ${PADDED_SPRINT}-${PLAN_NUM}-SUMMARY.md with E2E test results and screenshot references
16. Return EXECUTION COMPLETE
</output>

<tdd_strategy>
## The Iron Law

> **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**
> Write code before the test? Delete it. Start over.

Dies gilt auf ZWEI Ebenen:
1. **Unit-Level** (Vitest): Jede Logik-Funktion
2. **E2E-Level** (Playwright): Jeder User-Flow (bestehend)

CRITICAL: Every sub-sprint plan follows Test-Driven Development.

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
10. Run regression for all sub-sprints so far
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
npx playwright test tests/e2e/v{VERSION}/sprint-{NN}/
```

**E2E test file location:**
```bash
VERSION=$(cat .planning/config.json | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
TEST_FILE="tests/e2e/v${VERSION}/sprint-${PADDED_SPRINT}/${PADDED_SPRINT}-${PLAN_NUM}.spec.ts"
```
</tdd_strategy>

<agent_browser_execution>
IMPORTANT: After implementing tasks, execute the "Agent Browser Test:" section from the PLAN.md.

**Screenshot Naming Convention:**
All screenshots MUST use timestamp prefix format: `YYYY-MM-DD_HHMMSS_description.png`
Example: `2026-01-31_185500_UC-EP-001_step-1-dialog-opened.png`
Save screenshots to: `.planning/sprints/NN-*/screenshots/`

The executor should:
1. Start dev servers if not running (npm run dev, backend if needed)
2. Execute agent-browser commands from the verification section
3. Save screenshots to `.planning/sprints/NN-*/screenshots/` with timestamp prefix
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

**Wait for all plans in sub-sprint to complete before starting next sub-sprint.**

**After each sub-sprint completes — Skeleton Gate Check:**

```bash
# Scan ALL test files in the sprint for remaining TODO skeletons
TODO_FILES=$(grep -rln "TODO: Implement during execution" tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/ 2>/dev/null)

if [ -n "$TODO_FILES" ]; then
  echo "⚠️  SKELETON GATE WARNING: Unimplemented test skeletons found after sub-sprint ${WAVE_NUM}:"
  grep -rn "TODO: Implement during execution" tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/
  echo ""
  echo "These test skeletons were NOT fleshed out by the executor."
  echo "This will be reported as a GAP during verification."
fi
```

**Handle checkpoints:**

If a plan has `autonomous: false`, it contains checkpoints. The executor will pause and request user input. Present checkpoint to user, get response, resume executor.

## Sprint 4: Post-Execution Verification

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
Read ./agents/uc-verifier.md for your role and instructions.

Verify Epic use case scenarios are achievable.
</task>

<project_rules>
@./CLAUDE.md
</project_rules>

<phase_context>
Sprint: ${SPRINT_NAME}
Sprint Directory: ${SPRINT_DIR}
</phase_context>

<use_cases>
Epic use cases for this sprint:
@.planning/use-cases/epic/UC-EP-XXX.md
[for each assigned use case]
</use_cases>

<tasks>
@.planning/use-cases/task/UC-TK-XXX.md
[for each task]
</tasks>

<summaries>
@${SPRINT_DIR}/${PADDED_SPRINT}-*-SUMMARY.md
</summaries>

<context>
@.planning/PROJECT.md
@.planning/PROJECT-PLAN.md
@${SPRINT_DIR}/${PADDED_SPRINT}-CONTEXT.md (if exists)
</context>

<e2e_context>
Milestone version: ${MILESTONE_VERSION}
E2E test directory: tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/
All E2E tests: tests/e2e/regression/
</e2e_context>

<roadmap>
@.planning/PROJECT-PLAN.md
</roadmap>

<output>
0b. **Verify against ROADMAP Success Criteria** for this sprint (before scenario walks)
1. Walk each Epic scenario step by step
2. Browser test UI scenarios with agent-browser
3. Verify postconditions achievable
4. Test alternative and exception flows
5. **Create sprint completion test:** tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/${PADDED_SPRINT}-sprint.spec.ts
6. **Run sprint completion test:** npx playwright test tests/e2e/v${MILESTONE_VERSION}/sprint-${PADDED_SPRINT}/${PADDED_SPRINT}-sprint.spec.ts
7. **Run full regression:** npx playwright test tests/e2e/regression/
8. Create ${PADDED_SPRINT}-VERIFICATION.md with E2E results and regression report
9. Update use case statuses in index.md
10. Return VERIFICATION COMPLETE with status
</output>
", subagent_type="uc-verifier", model="${verifier_model}", description="Verify scenarios")
```

## Sprint 5: Present Results

**If verification COMPLETE:**

Check if this is the last sprint in milestone:

```bash
TOTAL_PHASES=$(grep "^## Sprint\|^### Sprint" .planning/PROJECT-PLAN.md | wc -l | tr -d ' ')
IS_LAST_PHASE=false
if [ "$PHASE_ARG" -eq "$TOTAL_PHASES" ]; then
  IS_LAST_PHASE=true
fi
```

**If NOT last sprint:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► SPRINT ${PHASE_ARG} COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Use Case Status

| Epic | Scenarios | Passed | Status |
|-----------|-----------|--------|--------|
| UC-EP-001 | 4 | 4 | ✓ Verified |
| UC-EP-002 | 3 | 3 | ✓ Verified |

## Tasks Implemented

| ID | Name | Status |
|----|------|--------|
| UC-TK-001 | Validate Task Title | ✓ Implemented |
| UC-TK-002 | Save Task to State | ✓ Implemented |

## Screenshots

[List of captured screenshots as evidence]

───────────────────────────────────────────────────────

## ▶ Next Up

/esf:progress — check overall project progress
/esf:plan-sprint [N+1] — plan next sprint

<sub>/clear first → fresh context window</sub>
```

**If IS last sprint:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► SPRINT ${PHASE_ARG} COMPLETE - LAST SPRINT! ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Use Case Status

| Epic | Scenarios | Passed | Status |
|-----------|-----------|--------|--------|
| UC-EP-001 | 4 | 4 | ✓ Verified |
| UC-EP-002 | 3 | 3 | ✓ Verified |

## Tasks Implemented

| ID | Name | Status |
|----|------|--------|
| UC-TK-001 | Validate Task Title | ✓ Implemented |
| UC-TK-002 | Save Task to State | ✓ Implemented |

## Screenshots

[List of captured screenshots as evidence]

───────────────────────────────────────────────────────

✅ All sprints in milestone ${MILESTONE_VERSION} are now complete!

## ▶ Milestone Completion

**Next Steps:**
   1. Check readiness: /esf:audit-milestone
   2. Mark complete: /esf:complete-milestone --version ${MILESTONE_VERSION}
   3. Start next milestone: /esf:new-milestone

<sub>/clear first → fresh context window</sub>
```

**If GAPS found:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► SPRINT ${PHASE_ARG} GAPS FOUND ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Verification Results

| Epic | Scenarios | Passed | Failed |
|-----------|-----------|--------|--------|
| UC-EP-001 | 4 | 3 | 1 |

## Gaps Identified

| Use Case | Step | Issue |
|----------|------|-------|
| UC-EP-001 | 4 | Task not appearing in list |

───────────────────────────────────────────────────────

## ▶ Action Required

/esf:plan-sprint ${PHASE_ARG} --gaps — create gap closure plans

<sub>/clear first → fresh context window</sub>
```

## Sprint 6: Update PROJECT-STATUS.md

Regenerate PROJECT-STATUS.md with current state:
- Read sprint directories to determine each sprint's status (using filesystem artifacts: *-VERIFICATION.md, *-SUMMARY.md, *-PLAN.md, *-RESEARCH.md)
- Read index.md for task/epic statuses
- Write updated PROJECT-STATUS.md with correct current sprint, sprint statuses, epic progress, and overall completion percentage

Commit state update.

</process>

<success_criteria>

- [ ] Sprint validated with PLAN.md files
- [ ] Plans grouped by sub-sprint
- [ ] uc-executor spawned for each plan
- [ ] Parallel execution within sub-sprints
- [ ] **Skeleton Gate passed** — no `TODO: Implement during execution` markers remain in any test file
- [ ] **Iron Law enforced** — kein Produktions-Code ohne fehlschlagenden Test
- [ ] **Unit-Tests geschrieben** fuer alle Logik-Funktionen (Validation, Berechnung, Transformation)
- [ ] **Unit-Tests in TDD-Modus** (RED → implement → GREEN)
- [ ] **Anti-Pattern Gate passed** — keine Mock-Verhalten-Tests, keine test-only Methoden
- [ ] **Unit-Test-Skelette ausimplementiert** — keine TODO-Marker
- [ ] **E2E tests run in TDD mode** (RED → implement → GREEN)
- [ ] **E2E tests contain concrete detail assertions** (exact values, counts, formats — not generic checks)
- [ ] **Every test body has real assertions** — at least one `expect()` or `await page.` call per test
- [ ] **TDD fix loop used** (agent-browser first, then E2E)
- [ ] All tasks implemented per task specs
- [ ] Atomic commits per task (including E2E test files)
- [ ] **Sprint regression tests pass** after each plan
- [ ] SUMMARY.md created for each plan (with E2E test results)
- [ ] uc-verifier spawned (if enabled)
- [ ] **Verifier Skeleton Gate passed** — verifier confirms no TODO skeletons remain
- [ ] Scenarios walked with browser testing
- [ ] **Sprint completion test created** ({NN}-sprint.spec.ts)
- [ ] **Full regression passes** (all milestones/sprints)
- [ ] VERIFICATION.md created with evidence and regression report
- [ ] Use case statuses updated in index.md
- [ ] PROJECT-STATUS.md updated with progress
- [ ] Clear outcome: COMPLETE or GAPS FOUND
- [ ] Next steps communicated

</success_criteria>
