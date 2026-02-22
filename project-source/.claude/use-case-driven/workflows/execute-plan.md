<purpose>
Execute a phase plan (PLAN.md) implementing Subfunction use cases and create the outcome summary (SUMMARY.md).
</purpose>

<core_principle>
You implement SPECIFICATIONS, not requirements. Each task references a Subfunction use case that tells you exactly what to build, what inputs/outputs to expect, and how to verify it.
</core_principle>

<process>

<step name="load_plan_and_subfunctions">
Read the PLAN.md and all referenced Subfunction use cases:

```bash
cat .planning/phases/XX-name/{phase}-{plan}-PLAN.md

# For each subfunction referenced
cat .planning/use-cases/subfunction/UC-SF-XXX-*.md
```

The PLAN.md contains:
- `<use-case>` reference in each task
- Context references to subfunction documents
- Verification criteria derived from subfunctions
</step>

<step name="setup_e2e_tests">
Before implementing tasks, set up E2E tests (TDD RED phase):

1. **Load E2E test file** from PLAN.md `<e2e_tests>` section
2. **Flesh out test skeletons** with concrete selectors, assertions, and navigation
3. **Run tests (RED phase):** `npx playwright test <test-file>`
   - Tests SHOULD fail — the feature isn't implemented yet
   - This confirms the tests are actually testing something
   - If tests accidentally pass → investigate (tests may be too weak)
</step>

<step name="execute_tasks">
For each task in the plan:

1. **Read the referenced Subfunction specification**
   - Input Specification
   - Output Specification
   - Algorithm/Logic
   - Error Conditions
   - Verification Criteria

2. **Implement according to spec**
   - Follow the algorithm exactly
   - Handle all specified error conditions
   - Match input/output specifications
   - Use German UI text as specified

3. **Run E2E tests (GREEN phase):** `npx playwright test <test-file>`

4. **If tests FAIL → TDD Fix Loop:**
   ```
   a) Identify failing test(s) from Playwright output
   b) Fix the code
   c) Verify fix with agent-browser (FAST single-case check):
      - Reproduce the specific failing scenario
      - If agent-browser shows it works → proceed to d)
      - If agent-browser still fails → back to b)
   d) Re-run full E2E test: npx playwright test <test-file>
   e) If still failing → back to b)
   f) Max 5 attempts (from config e2e.max_fix_attempts)
   ```

5. **Verify against subfunction criteria**
   ```yaml
   verification:
     existence:
       - file: "src/components/TaskForm.jsx"
         contains: "validateTitle"
     substantive:
       - min_lines: 20
     wired:
       - imported_by: "src/App.jsx"
   ```

6. **Commit atomically per subfunction (include E2E test file!)**
   ```bash
   git add [implementation-files] [e2e-test-file]
   git commit -m "feat({phase}-{plan}): implement UC-SF-XXX {Name}

   - [Key implementation detail 1]
   - [Key implementation detail 2]
   - E2E tests: {N} passed

   Implements: UC-SF-XXX
   Part-of: UC-UG-YYY"
   ```

7. **Update subfunction status**
   Mark subfunction as "Implemented" in document
</step>

<step name="regression_check">
After ALL tasks in the plan are complete:

1. **Run phase regression:** `npx playwright test tests/e2e/v{VERSION}/phase-{NN}/`
2. **If regression fails:**
   - Identify which test(s) failed
   - Fix the regression (preserve backward compatibility)
   - Re-run regression
3. **Document regression results** in SUMMARY.md
</step>

<step name="handle_deviations">
**Deviation rules apply as in standard GSD:**

- Rule 1: Auto-fix bugs
- Rule 2: Auto-add missing critical functionality
- Rule 3: Auto-fix blocking issues
- Rule 4: Ask about architectural changes

Track all deviations for SUMMARY.md.
</step>

<step name="browser_testing">
If task involves UI (task has `browser_test: true` or config has `browser_test_ui: true`):

```
agent-browser open http://localhost:5173
agent-browser fill "#task-input" "Test Aufgabe"
agent-browser click "button[type='submit']"
agent-browser snapshot
```

Save screenshots with timestamp and use case reference:
`2026-01-26_143000_UC-SF-001_validation.png`
</step>

<step name="create_summary">
Create SUMMARY.md using template from `./.claude/use-case-driven/templates/summary.md`.

**Required sections for use case driven:**
- Use Case Implementation Status table
- User-Goal Progress calculation
- Subfunction commits with traceability
- Screenshots (if browser tests run)

**One-liner must reference use cases:**
Good: "Task creation implementing UC-SF-001, UC-SF-002 per specification"
Bad: "Tasks completed"
</step>

<step name="update_state">
Update STATE.md with:
- Current position
- Use case progress
- Decisions made
</step>

</process>

<checkpoint_handling>
When encountering `type="checkpoint:*"`:

1. STOP immediately
2. Display checkpoint with use case context
3. Wait for user response
4. Verify if possible
5. Continue only after confirmation

**Checkpoint display includes:**
- Which use case is being verified
- Which scenario step
- Expected behavior from use case postconditions
</checkpoint_handling>

<success_criteria>
- E2E tests set up and run in RED phase before implementation
- All tasks executed per subfunction specifications
- E2E tests pass for each subfunction (GREEN phase)
- TDD fix loop used when tests fail (agent-browser first, then E2E)
- Each subfunction committed atomically (including E2E test files)
- Verification criteria pass for each subfunction
- Phase regression tests pass after plan completion
- SUMMARY.md created with use case tracking and E2E test results
- Subfunction statuses updated to "Implemented"
- Screenshots captured (if UI)
- STATE.md updated
</success_criteria>
