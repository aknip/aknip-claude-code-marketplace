---
description: Create execution plan from phase use cases
argument-hint: "[N] [--skip-research] [--re-research] [--gaps]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>

Create execution plans from User-Goal use cases assigned to a phase. Extracts Subfunction use cases from scenarios and maps them to executable tasks.

**Input:** Phase number (required)

**Creates:**
- `.planning/use-cases/subfunction/` — Subfunction use cases extracted from scenarios
- `.planning/phases/NN-*/NN-XX-PLAN.md` — Execution plans with use case references
- Updated `.planning/use-cases/index.md` — With new subfunctions

**Flags:**
- `--skip-research` — Skip phase research
- `--re-research` — Force new research even if exists
- `--gaps` — Create plans to close verification gaps

**After this command:** Run `/esf:execute-phase N` to execute.

</objective>

<execution_context>

@./agents/uc-planner.md
@./agents/uc-checker.md
@./use-case-driven/references/model-profiles.md

</execution_context>

<process>

## Phase 1: Validate

**Parse arguments:**

```bash
PHASE_ARG="${1:-}"
SKIP_RESEARCH=false
RE_RESEARCH=false
GAPS_MODE=false

# Parse flags
[[ "$*" == *"--skip-research"* ]] && SKIP_RESEARCH=true
[[ "$*" == *"--re-research"* ]] && RE_RESEARCH=true
[[ "$*" == *"--gaps"* ]] && GAPS_MODE=true
```

**Validate phase exists:**

```bash
PADDED_PHASE=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
PHASE_DIR=$(ls -d .planning/phases/${PADDED_PHASE}-* .planning/phases/${PHASE_ARG}-* 2>/dev/null | head -1)

if [ -z "$PHASE_DIR" ]; then
  echo "ERROR: Phase ${PHASE_ARG} not found in .planning/phases/"
  exit 1
fi

PHASE_NAME=$(basename "$PHASE_DIR")
echo "Planning phase: $PHASE_NAME"
```

**Load assigned User-Goal use cases:**

```bash
grep "Phase ${PHASE_ARG}" .planning/use-cases/index.md | grep "UC-UG"
```

If no use cases assigned, error and exit.

## Phase 2: Load Config

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
DO_RESEARCH=$(cat .planning/config.json 2>/dev/null | grep -o '"research"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
DO_PLAN_CHECK=$(cat .planning/config.json 2>/dev/null | grep -o '"plan_check"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
COMMIT_DOCS=$(cat .planning/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
```

**Resolve models:**

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| uc-planner | opus | opus | sonnet |
| uc-checker | sonnet | sonnet | haiku |
| uc-phase-researcher | opus | sonnet | haiku |

## Phase 3: Research (Optional)

**Skip if:**
- `--skip-research` flag
- Research already exists AND not `--re-research`
- `workflow.research` is false in config

**If research needed:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► RESEARCHING PHASE ${PHASE_ARG}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning phase researcher...
```

Spawn uc-phase-researcher:

```
Task(prompt="
<task>
Read ./agents/uc-phase-researcher.md for your role and instructions.

Research implementation approaches for Phase ${PHASE_ARG}.
Answer: What do I need to know to PLAN this phase well?
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

<context>
@.planning/PROJECT.md
@${PHASE_DIR}/${PADDED_PHASE}-CONTEXT.md (if exists)
</context>

<output>
Write to: ${PHASE_DIR}/${PADDED_PHASE}-RESEARCH.md
Return RESEARCH COMPLETE with summary.
</output>
", subagent_type="uc-phase-researcher", model="${researcher_model}", description="Phase research")
```

## Phase 3.5: Session Resume Detection (Optional)

**Check for recent session resume:**

```bash
SESSION_RESUMED=$(grep "## Session Status" .planning/STATE.md 2>/dev/null | grep "RESUMED" || echo "")
if [ -n "$SESSION_RESUMED" ]; then
  SESSION_ID=$(grep -A5 "## Session Status" .planning/STATE.md 2>/dev/null | grep "Session ID:" | awk '{print $3}')
  SESSION_TIME=$(grep -A5 "## Session Status" .planning/STATE.md 2>/dev/null | grep "Resumed:" | sed 's/Resumed: //')
  CURRENT_PHASE=$(grep "Current Phase:" .planning/STATE.md 2>/dev/null | awk '{print $3}')

  if [ -n "$SESSION_ID" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " SESSION RESUMED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Continuing from session: $SESSION_ID"
    echo "Resumed: $SESSION_TIME"
    echo ""
    echo "Context loaded:"
    echo "- Current phase: $CURRENT_PHASE"
    echo ""
    echo "Proceeding with planning..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  fi
fi
```

## Phase 4: Planning

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PLANNING PHASE ${PHASE_ARG}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-planner...
```

**Spawn uc-planner agent:**

```
Task(prompt="
<task>
Read ./agents/uc-planner.md for your role and instructions.

Create execution plans from User-Goal use cases for Phase ${PHASE_ARG}.
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

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@${PHASE_DIR}/${PADDED_PHASE}-RESEARCH.md (if exists)
@${PHASE_DIR}/${PADDED_PHASE}-CONTEXT.md (if exists)
</context>

<templates>
Subfunction template: @.planning/templates/UC-SUBFUNCTION.md
</templates>

<agent_browser_testing>
IMPORTANT: For UI-facing plans, include an "Agent Browser Test:" section in the <verification> block.
This replaces manual testing with automated browser tests using agent-browser.

**Screenshot Naming Convention:**
All screenshots MUST use timestamp prefix format: `YYYY-MM-DD_HHMMSS_description.png`
Save screenshots to: `.planning/phases/NN-*/screenshots/`

Format:
```markdown
Agent Browser Test:
\`\`\`bash
# Start servers if needed
npm run dev &
sleep 3

# Open the page
agent-browser open http://localhost:5173/path

# Take snapshots to find element refs
agent-browser snapshot -i

# Interact with elements
agent-browser click @e1
agent-browser fill @e2 "test value"

# Capture evidence (with timestamp prefix)
agent-browser screenshot .agent-browser/2026-01-31_185500_UC-UG-001_step-1-dialog-opened.png

# Verify state
agent-browser eval "document.querySelector('.success').textContent"

# Close browser
agent-browser close
\`\`\`
```

The executor will run these tests after implementing each plan.
</agent_browser_testing>

<api_verification_requirements>
CRITICAL: For any plan that involves API calls, include these verification steps in the Agent Browser Test section:

```markdown
## API Verification (MANDATORY for backend interactions):

1. **Intercept API calls before action:**
\`\`\`bash
agent-browser eval "window.__apiCalls = []; const origFetch = window.fetch; window.fetch = async (...args) => { window.__apiCalls.push({url: args[0], opts: args[1]}); return origFetch(...args); };"
\`\`\`

2. **After action, verify API was called correctly:**
\`\`\`bash
agent-browser eval "JSON.stringify(window.__apiCalls)"
# Verify: correct URL, method, and ALL required fields in body (no undefined!)
\`\`\`

3. **Check for errors:**
\`\`\`bash
agent-browser console
agent-browser errors
# If 400/500 errors appear, the test FAILS
\`\`\`

4. **Verify persistence:**
\`\`\`bash
agent-browser reload
agent-browser wait 2000
# Verify data still exists after reload
\`\`\`
```

This catches bugs like missing request fields that cause 400 Bad Request errors.
</api_verification_requirements>

<cross_reference_requirements>
CRITICAL: For any plan that uses Zustand/Redux stores, include this check:

```markdown
## Store Field Cross-Reference Check:

Before implementation, verify store field names:
1. Read store definition: src/stores/xxx-store.ts
2. Note exact field names in the store type
3. Use EXACT field names in components (not similar names!)

Common bug pattern:
- Store defines: currentMandant
- Component uses: state.mandant (WRONG - undefined!)
- Should be: state.currentMandant

Add to verification criteria:
- [ ] All store.fieldName usages match actual store field names
```
</cross_reference_requirements>

<cache_sharing_requirements>
CRITICAL: For any plan that involves data-fetching hooks used by multiple components:

```markdown
## Cache Sharing Verification:

**Identify if this feature needs cache sharing:**
- Does the feature involve real-time UI updates? (simulation, live data, etc.)
- Will multiple components display the same data?
- Does one component's action need to update another component's display?

If YES to any above, the data-fetching hook MUST use React Query (not useState):

**Implementation requirement:**
```typescript
// WRONG: useState = each component gets separate copy
export function useData() {
  const [data, setData] = useState(null);
  const refetch = () => fetchAndSetData();  // Only updates THIS instance!
  return { data, refetch };
}

// CORRECT: useQuery = all components share cache
export function useData() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['data'], queryFn: fetchData });
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['data'] });
  return { data, refetch };  // All components update!
}
```

**Add to verification criteria:**
- [ ] Data-fetching hooks use useQuery for shared caching
- [ ] Cross-component update tested (action in A updates B)
- [ ] Before/after reload screenshots compared
```
</cache_sharing_requirements>

<e2e_test_definition>
MANDATORY: For each sub-phase plan (e.g., 02-01, 02-02), define E2E test cases.

**TDD Strategy:** Tests are defined DURING planning, BEFORE implementation.

**For each PLAN.md, create:**
1. An `<e2e_tests>` section in the PLAN.md with:
   - Test file path: `tests/e2e/v{VERSION}/phase-{NN}/{NN}-{XX}.spec.ts`
   - Test case list (derived from subfunctions and scenarios)
   - Preconditions (DB reset, server state)

2. A skeleton E2E test file at that path:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { resetDatabase } from '../../../helpers/database';

   test.describe('{UC-UG-XXX}: {Use Case Name} - Plan {NN}-{XX}', () => {
     test.beforeAll(async () => {
       await resetDatabase();
     });

     test('{UC-SF-XXX}: {Subfunction Name} - Hauptszenario', async ({ page }) => {
       // TODO: Implement during execution
       // Steps from main success scenario:
       // 1. ...
       // 2. ...
     });

     // One test per alternative/exception flow
   });
   ```

**Directory structure:**
```
tests/e2e/
├── v{VERSION}/
│   └── phase-{NN}/
│       ├── {NN}-01.spec.ts     # Sub-phase 01 tests
│       ├── {NN}-02.spec.ts     # Sub-phase 02 tests
│       └── {NN}-phase.spec.ts  # Phase completion test (created by verifier)
```

**Ensure directories exist:**
```bash
mkdir -p tests/e2e/v${MILESTONE_VERSION}/phase-${PADDED_PHASE}
```

**Test case derivation:**
- Main Success Scenario → at least 1 happy-path test
- Each Alternative Flow → 1 test
- Each Exception Flow → 1 test (where automatable)
- ALL postconditions must be asserted in happy-path test

**Concrete detail assertions (MANDATORY):**

Every E2E test MUST include feature-specific detail checks as bullet-point assertions.
Do NOT write generic "page loads" tests — every test must verify concrete, measurable outcomes.

**By feature type, include these detail checks:**

| Feature Type | Required Detail Checks |
|-------------|----------------------|
| **Calculations / KPIs** | Exact computed values with tolerances (e.g., `expect(lcc).toBeCloseTo(31, 0)`), formula inputs verified, edge cases (0%, 100%, negative) |
| **Date/Schedule display** | Correct date format (DD.MM.YYYY), calculated start/end dates match expected values, week numbers correct |
| **Capacity/Effort tables** | Row counts match expected teams/weeks, cell values match expected PT numbers, totals/sums correct |
| **Status indicators** | Correct status text (German), correct color/zone, status transitions verified |
| **Data consistency** | Same data shown identically across views (e.g., Teams vs Skills mode KPI invariance), values survive page reload |
| **Sorting/Ordering** | Items in expected order, sort criteria verified |
| **Charts/Visualizations** | Data points present, axis labels correct, legend entries match |
| **Forms/Inputs** | Validation messages in German, field constraints enforced, saved values match input |
| **API responses** | Response status codes, response body structure, required fields present |
| **Cross-mode/Cross-view** | Switching views preserves data, no side effects on switch-back, mode-specific elements visible/hidden |

**Example — skeleton with concrete detail checks:**

```typescript
test('UC-SF-XXX: Kapazitaetstabelle zeigt korrekte Werte', async ({ page }) => {
  // Navigation
  await page.goto('/team-planner/capacity');

  // Detail checks:
  // - Table has exactly 4 team rows (Dev, BA, Frontend, Backend)
  // - Dev team shows 10 PT base capacity
  // - Week 3 shows 8 PT for Dev (capacity variation)
  // - Total row sums correctly (e.g., 36 PT for Development skill class)
  // - Capacity values formatted as integers (no decimals)
  // - Column headers show correct calendar week numbers
});

test('UC-SF-YYY: Fever-Chart KPIs korrekt berechnet', async ({ page }) => {
  // After applying effort update (remaining_pt = 12)
  // Detail checks:
  // - LCC displays "31%" (±5% tolerance)
  // - BC displays "44%" (±20% tolerance)
  // - Zone indicator shows "yellow" (data-zone attribute)
  // - Values update without page reload
  // - Same KPIs in both Teams and Skills mode (invariance)
});
```

**Get milestone version from config:**
```bash
VERSION=$(cat .planning/config.json | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
```
</e2e_test_definition>

<output>
1. Extract Subfunction use cases from scenario steps
2. Create Subfunction documents in .planning/use-cases/subfunction/
3. Create PLAN.md files with use case references
4. Include "Agent Browser Test:" section in verification for UI plans
5. **Create E2E test skeleton files** in tests/e2e/v{VERSION}/phase-{NN}/
6. **Include `<e2e_tests>` section** in each PLAN.md
7. Update index.md with new subfunctions
8. Return PLANNING COMPLETE with summary including E2E test file paths
</output>
", subagent_type="uc-planner", model="${planner_model}", description="Create phase plans")
```

## Phase 5: Plan Verification (if enabled)

**If `workflow.plan_check` is true:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► CHECKING PLANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-checker...
```

**Spawn uc-checker agent:**

```
Task(prompt="
<task>
Read ./agents/uc-checker.md for your role and instructions.

Validate plans will achieve use case scenarios.
</task>

<plans>
@${PHASE_DIR}/${PADDED_PHASE}-*-PLAN.md
</plans>

<use_cases>
User-Goal: @.planning/use-cases/user-goal/UC-UG-XXX.md
Subfunction: @.planning/use-cases/subfunction/UC-SF-XXX.md
</use_cases>

<output>
Return APPROVED or list of ISSUES.
</output>
", subagent_type="uc-checker", model="${checker_model}", description="Verify plans")
```

**If ISSUES returned:**

Present issues to user and ask:
- "Revise plans" — Re-spawn uc-planner with revision context
- "Override" — Proceed despite issues (not recommended)

**Revision loop:**

```
Task(prompt="
<revision>
Issues from checker:
[issues list]

Update plans to address issues.
</revision>

<existing_plans>
@${PHASE_DIR}/${PADDED_PHASE}-*-PLAN.md
</existing_plans>
", subagent_type="uc-planner", model="${planner_model}", description="Revise plans")
```

Re-run checker. Loop until APPROVED or user overrides.

## Phase 6: Present Plans and E2E Test Review

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PLANNING COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase ${PHASE_ARG}: ${PHASE_NAME}**

## Use Case Coverage

| User-Goal | Subfunctions | Plan |
|-----------|--------------|------|
| UC-UG-001 | UC-SF-001, UC-SF-002 | ${PADDED_PHASE}-01 |
| UC-UG-002 | UC-SF-003, UC-SF-004 | ${PADDED_PHASE}-02 |

## Plans Created

| Plan | Objective | Tasks | Wave |
|------|-----------|-------|------|
| ${PADDED_PHASE}-01 | [objective] | 2 | 1 |
| ${PADDED_PHASE}-02 | [objective] | 3 | 1 |

## Traceability

✓ Every scenario step has implementing task
✓ Every task references subfunction
✓ Verification criteria from subfunction specs
```

### E2E Test Review (Interactive)

**After presenting the plan summary, list all planned E2E test cases with their detail checks:**

```
───────────────────────────────────────────────────────

## Geplante E2E-Tests

### ${PADDED_PHASE}-01: [Plan Name]
Datei: tests/e2e/v{VERSION}/phase-{NN}/{NN}-01.spec.ts

| # | Testfall | Detail-Checks |
|---|----------|---------------|
| 1 | {UC-SF-XXX}: {Name} - Hauptszenario | • [Check 1] • [Check 2] • [Check 3] |
| 2 | {UC-SF-XXX}: {Name} - Alternativfluss | • [Check 1] • [Check 2] |
| 3 | {UC-SF-XXX}: Fehlerfall - {Name} | • [Check 1] |

### ${PADDED_PHASE}-02: [Plan Name]
Datei: tests/e2e/v{VERSION}/phase-{NN}/{NN}-02.spec.ts

| # | Testfall | Detail-Checks |
|---|----------|---------------|
| 1 | ... | ... |

───────────────────────────────────────────────────────
```

**Then ask the user for feedback using AskUserQuestion:**

```
AskUserQuestion:
  header: "E2E-Tests"
  question: "Sind die geplanten E2E-Testfälle ausreichend?"
  multiSelect: false
  options:
    - label: "Ja, weiter"
      description: "Tests sind ausreichend — direkt zur Ausführung übergehen"
    - label: "Tests ergänzen"
      description: "Ich möchte zusätzliche Testfälle oder Detail-Checks hinzufügen"
    - label: "Tests ändern"
      description: "Bestehende Testfälle sollen angepasst oder entfernt werden"
    - label: "Diskutieren"
      description: "Ich möchte die Teststrategie interaktiv besprechen"
```

**Handle responses:**

- **"Ja, weiter"**: Proceed to "Next Up" output below.
- **"Tests ergänzen"**: Ask user which tests to add (free text). Update the relevant PLAN.md `<e2e_tests>` sections and skeleton test files. Re-display updated test list.
- **"Tests ändern"**: Ask user which tests to modify/remove. Update accordingly. Re-display.
- **"Diskutieren"**: Enter interactive discussion about test strategy. Ask targeted questions about coverage gaps, edge cases, or critical paths the user wants tested. After discussion, update tests and re-display.

**After any changes**, re-display the updated test table and ask again (loop until user selects "Ja, weiter" or provides no further input).

```
───────────────────────────────────────────────────────

## ▶ Next Up

/esf:execute-phase ${PHASE_ARG} — execute plans

<sub>/clear first → fresh context window</sub>
```

## Gap Closure Mode (--gaps)

**If `--gaps` flag:**

Load VERIFICATION.md and find gaps:

```bash
cat "${PHASE_DIR}/${PADDED_PHASE}-VERIFICATION.md" | grep -A5 "GAPS"
```

Spawn uc-planner with gap context:

```
Task(prompt="
<gap_closure>
Create plans to close these verification gaps:
[gaps from VERIFICATION.md]
</gap_closure>

<existing_work>
@${PHASE_DIR}/${PADDED_PHASE}-*-SUMMARY.md
</existing_work>
", subagent_type="uc-planner", model="${planner_model}", description="Gap closure plans")
```

</process>

<success_criteria>

- [ ] Phase validated (exists in ROADMAP.md)
- [ ] User-Goal use cases loaded for phase
- [ ] Research completed (if enabled)
- [ ] uc-planner spawned
- [ ] Subfunction use cases created from scenarios
- [ ] PLAN.md files created with <use-case> references
- [ ] index.md updated with new subfunctions
- [ ] uc-checker validation passed (if enabled)
- [ ] 100% scenario step coverage
- [ ] **E2E test skeleton files created** in `tests/e2e/v{VERSION}/phase-{NN}/`
- [ ] **Every PLAN.md has `<e2e_tests>` section** with test file path and test cases
- [ ] **Every subfunction has at least one E2E test case**
- [ ] **Every E2E test skeleton has bullet-point detail checks** (concrete values, not generic assertions)
- [ ] **E2E test cases presented to user** with detail-check table
- [ ] **User confirmed tests are sufficient** (or tests updated after feedback)
- [ ] Plans committed to git (if config allows)
- [ ] User knows next step is `/esf:execute-phase N`

</success_criteria>
