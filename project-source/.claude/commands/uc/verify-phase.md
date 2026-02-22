---
name: uc:verify-phase
description: Verify use case scenarios for a phase (standalone)
argument-hint: "[N]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
---

<objective>

Standalone verification of User-Goal use case scenarios. Use this to re-verify a phase or verify work done outside the standard flow.

**Input:** Phase number (required)

**Creates:**
- `.planning/phases/NN-*/NN-VERIFICATION.md` — Scenario verification report
- Updated use case statuses in index.md

</objective>

<process>

## Validate Phase

```bash
PHASE_ARG="${1:-}"
PADDED_PHASE=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
PHASE_DIR=$(ls -d .planning/phases/${PADDED_PHASE}-* 2>/dev/null | head -1)
```

## Spawn Verifier

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► VERIFYING PHASE ${PHASE_ARG}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-verifier...
```

```
Task(prompt="
<task>
Read ./.claude/agents/uc-verifier.md for your role and instructions.

Verify User-Goal use case scenarios for Phase ${PHASE_ARG}.

CRITICAL RULES FOR VERIFICATION:
1. Agent-browser tests are MANDATORY - code inspection alone is NOT sufficient
2. If agent-browser has issues, FIX the issues - do NOT fall back to code review
3. EVERY action that calls an API must be verified with actual API response
4. Check browser console for errors after EVERY action
5. Cross-reference store usage: verify field names match between store definition and usage
</task>

<phase_context>
@${PHASE_DIR}
</phase_context>

<use_cases>
@.planning/use-cases/index.md
@.planning/use-cases/user-goal/
@.planning/use-cases/subfunction/
</use_cases>

<agent_browser>
agent-browser is installed locally at: node_modules/agent-browser/bin/agent-browser
Use the Skill(agent-browser) reference for command documentation.

**Screenshot Naming Convention:**
All screenshots MUST use timestamp prefix format: `YYYY-MM-DD_HHMMSS_description.png`
Example: `2026-01-31_185500_UC-UG-001_step-1-board-loaded.png`
Save screenshots to: `.planning/phases/NN-*/screenshots/`
</agent_browser>

<mandatory_verification_steps>
For EVERY UI action that triggers an API call:

1. **Intercept API calls** - Before action:
   ```bash
   agent-browser eval \"window.__apiCalls = []; const origFetch = window.fetch; window.fetch = async (...args) => { window.__apiCalls.push({url: args[0], opts: args[1]}); return origFetch(...args); };\"
   ```

2. **Perform action** - Click button, submit form, etc.

3. **Check API was called correctly**:
   ```bash
   agent-browser eval \"JSON.stringify(window.__apiCalls)\"
   ```
   Verify: URL correct, method correct, body contains ALL required fields (no undefined!)

4. **Check browser console for errors**:
   ```bash
   agent-browser console
   agent-browser errors
   ```
   If 400/500 errors found, the test FAILS - do not mark as passed!

5. **Verify data persisted** - Reload and check:
   ```bash
   agent-browser reload
   agent-browser wait 2000
   # Check data is still there
   ```

6. **Screenshot AFTER reload** - to prove persistence
</mandatory_verification_steps>

<cross_reference_checks>
For state management (Zustand, Redux, etc.):

1. **Find store definitions**:
   ```bash
   grep -r \"create.*=>.*{\" src/stores/
   ```

2. **Find store usages**:
   ```bash
   grep -r \"useXStore.*state\\.\" src/
   ```

3. **Compare field names** - Every `state.fieldName` must exist in store definition
   COMMON BUG: `state.mandant` vs `state.currentMandant` - field name mismatch!
</cross_reference_checks>

<cache_sharing_verification>
**CRITICAL: Prevents 'UI doesn't update' bugs even when API works!**

1. **Identify features with real-time UI updates**:
   - Simulation, live data, form submissions that should update lists
   - Any feature where multiple components display same data

2. **Check if data-fetching hooks use shared cache**:
   ```bash
   # BAD: useState = each component gets separate copy
   grep -n \"useState\" src/hooks/use-xxx.ts

   # GOOD: useQuery = all components share cache
   grep -n \"useQuery\" src/hooks/use-xxx.ts
   ```

3. **Test cross-component updates**:
   - Screenshot BEFORE action
   - Trigger action (click, submit, simulation step)
   - Screenshot IMMEDIATELY after (don't reload!)
   - Check if ALL UI components showing this data updated
   - If not → CACHE SHARING BUG!

4. **Compare before/after reload**:
   - If data appears ONLY after reload → backend worked but cache sharing failed
   - This is a BUG, not success!

5. **Common misdiagnosis to avoid**:
   - Symptom: 'Simulation läuft...' shows but board doesn't change
   - WRONG assumption: 'interval not firing' or 'executeStep broken'
   - CORRECT check: Verify API calls are being made (they probably are!)
   - Real cause: Usually cache sharing bug
</cache_sharing_verification>
<e2e_regression>
MANDATORY: Run comprehensive E2E regression at phase verification.

**Get milestone version:**
```bash
MILESTONE_VERSION=$(cat .planning/config.json 2>/dev/null | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
```

**E2E test directory:** tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/

**Required steps:**
1. Run all sub-phase tests: `npx playwright test tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/`
2. Create phase completion test: tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/${PADDED_PHASE}-phase.spec.ts
3. Run phase completion test
4. Run full regression: `npx playwright test tests/e2e/regression/`
5. Report all results in VERIFICATION.md

**Phase completion test detail requirements:**

The phase completion test (`{NN}-phase.spec.ts`) MUST include concrete detail assertions, not just "feature works" checks:

1. **Calculation spot-checks**: For every feature that computes values (KPIs, schedules, capacities, totals), include at least 2 specific numeric assertions with known expected values based on the demo data state
2. **Display detail verification**: For every new/changed UI element, assert:
   - Exact displayed text (in German where applicable)
   - Correct formatting (dates as DD.MM.YYYY, numbers with correct precision)
   - Correct visual state (colors, icons, status indicators)
3. **Data consistency checks**: For features that show data across multiple views:
   - Verify identical values in both views (e.g., Teams vs Skills mode)
   - Switch between views and verify no data corruption
   - Verify data survives page reload
4. **Boundary/edge cases**: Include at least 1 edge case test:
   - Empty state handling (no data → correct fallback display)
   - Maximum values (100% completion, full capacity)
   - Zero values (0 PT effort, 0% distribution)
5. **Regression guard assertions**: For each bug fixed during this phase, add a specific assertion that would catch the bug if it reappeared

**Example phase completion test structure:**

```typescript
test.describe('Phase {NN} Completion', () => {
  test('Kapazitaetstabelle: korrekte Werte und Formatierung', async ({ page }) => {
    // Concrete checks:
    // - Dev team capacity week 1: 10 PT
    // - Dev team capacity week 3: 8 PT (variation)
    // - Total Development: 36 PT (sum of Dev+Frontend+Backend)
    // - All values displayed as integers
  });

  test('KPI-Berechnung: Werte nach Aufwandsaktualisierung', async ({ page }) => {
    // After setting remaining_pt = 12 on Entwicklung 1:
    // - LCC = 31% (±5%)
    // - BC = 44% (±20%)
    // - Zone = yellow
  });

  test('Modus-Wechsel: Keine Seiteneffekte', async ({ page }) => {
    // Read KPIs in Teams mode
    // Switch to Skills mode
    // Verify KPIs identical
    // Switch back to Teams
    // Verify KPIs still identical (round-trip)
  });
});
```
</e2e_regression>

<regression_promotion>
MANDATORY: After successful verification, promote regression-relevant E2E tests to the permanent regression suite.

**Purpose:** Phase-specific tests live in `tests/e2e/v{VERSION}/phase-{NN}/` and may be removed or restructured between milestones. The `tests/e2e/regression/` directory contains the **permanent, stable regression suite** that runs on every future phase.

**Required steps after ALL tests pass:**
1. **Identify regression-relevant tests:** Select the phase completion test (`{NN}-phase.spec.ts`) and any sub-phase tests that cover critical user workflows, core business logic, or cross-feature interactions.
2. **Copy selected tests** to `tests/e2e/regression/`:
   ```bash
   mkdir -p tests/e2e/regression
   cp tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/${PADDED_PHASE}-phase.spec.ts tests/e2e/regression/
   # Copy additional sub-phase tests that cover critical workflows:
   # cp tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}/{NN}-{XX}.spec.ts tests/e2e/regression/
   ```
3. **Rename copied files** to include version context for traceability:
   ```bash
   # Pattern: v{VERSION}-{original-filename}
   # Example: v3-02-phase.spec.ts
   mv tests/e2e/regression/${PADDED_PHASE}-phase.spec.ts tests/e2e/regression/v${MILESTONE_VERSION}-${PADDED_PHASE}-phase.spec.ts
   ```
4. **Verify regression suite still passes** with the new tests included:
   ```bash
   npx playwright test tests/e2e/regression/
   ```
5. **Document promoted tests** in VERIFICATION.md under a `## Regression Suite` section listing which tests were promoted and why.

**Selection criteria — promote a test if it:**
- Covers a complete user workflow (end-to-end happy path)
- Tests critical business logic (data integrity, calculations, permissions)
- Verifies cross-feature interactions (e.g., changes in one feature affecting another)
- Guards against previously found bugs (regression guard)

**Do NOT promote tests that:**
- Only test isolated UI details (button styling, tooltip text)
- Are duplicates of already-promoted regression tests
- Test temporary or experimental features
</regression_promotion>
", subagent_type="uc-verifier", description="Verify phase")
```

## Present Results

Display VERIFICATION.md summary and next steps.

</process>

<success_criteria>

- [ ] uc-verifier spawned
- [ ] ALL scenarios tested with REAL browser interactions (not code review)
- [ ] API calls verified (correct URL, method, body with all required fields)
- [ ] Browser console checked for errors after each action
- [ ] Data persistence verified (reload and check)
- [ ] Screenshots captured BEFORE and AFTER reload
- [ ] Store field names cross-referenced
- [ ] **Cache sharing verified**: If API called but UI didn't update → BUG!
- [ ] **Cross-component updates verified**: Action in one component updates all related components
- [ ] **Before/after reload compared**: Different data after reload = cache bug, not success
- [ ] **All sub-phase E2E tests pass**: `npx playwright test tests/e2e/v{VERSION}/phase-{NN}/`
- [ ] **Phase completion test created**: `tests/e2e/v{VERSION}/phase-{NN}/{NN}-phase.spec.ts`
- [ ] **Phase completion test includes concrete detail assertions** (calculation spot-checks, display formatting, data consistency, edge cases)
- [ ] **Phase completion test passes**
- [ ] **Full regression passes**: `npx playwright test tests/e2e/regression/`
- [ ] **Regression-relevant tests promoted** to `tests/e2e/regression/` with version prefix
- [ ] **Regression suite passes** after promotion: `npx playwright test tests/e2e/regression/`
- [ ] VERIFICATION.md created with all evidence, E2E/regression results, and promoted tests list
- [ ] Use case statuses updated
- [ ] Clear outcome communicated

**AUTOMATIC FAIL CONDITIONS:**
- API calls work but UI doesn't update in real-time
- Data appears only after page reload
- Assuming "interval not firing" without checking if API calls are made
- Phase marked complete without running regression tests
- Regression tests fail and are not fixed
- Missing phase completion test ({NN}-phase.spec.ts)

</success_criteria>
