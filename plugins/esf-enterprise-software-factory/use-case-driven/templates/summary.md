# Summary Template

Template for `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md` - plan execution documentation for use case driven projects.

---

## File Template

```markdown
---
phase: XX-name
plan: YY
subsystem: [primary category: auth, ui, api, database, etc.]
tags: [searchable tech: react, prisma, etc.]

# Use case tracking
use_cases_implemented:
  user_goal: [UC-UG-XXX, UC-UG-YYY]
  subfunctions: [UC-SF-001, UC-SF-002, UC-SF-003]

# Dependency graph
requires:
  - phase: [prior phase this depends on]
    provides: [what that phase built that this uses]
provides:
  - [bullet list of what this phase built/delivered]
affects: [list of phase names or keywords that will need this context]

# Tech tracking
tech-stack:
  added: [libraries/tools added in this phase]
  patterns: [architectural/code patterns established]

key-files:
  created: [important files created]
  modified: [important files modified]

key-decisions:
  - "Decision 1"
  - "Decision 2"

# Metrics
duration: Xmin
completed: YYYY-MM-DD
---

# Phase [X] Plan [Y]: [Name] Summary

**[Substantive one-liner describing outcome - NOT "phase complete" or "implementation finished"]**

## Performance

- **Duration:** [time] (e.g., 23 min, 1h 15m)
- **Started:** [ISO timestamp]
- **Completed:** [ISO timestamp]
- **Tasks:** [count completed]
- **Subfunctions:** [count implemented]

## Use Case Implementation Status

| Subfunction | Name | Status | Commit |
|-------------|------|--------|--------|
| UC-SF-001 | [Name] | ✓ Implemented | abc123 |
| UC-SF-002 | [Name] | ✓ Implemented | def456 |

## User-Goal Progress

| User-Goal | Subfunctions Total | Implemented | Progress |
|-----------|-------------------|-------------|----------|
| UC-UG-001 | 3 | 2 | 67% |

## Task Commits

Each task was committed atomically per subfunction:

1. **Task 1: Implement UC-SF-001** - `abc123f` (feat)
2. **Task 2: Implement UC-SF-002** - `def456g` (feat)

## Files Created/Modified
- `path/to/file.ts` - What it does
- `path/to/another.ts` - What it does

## Decisions Made
[Key decisions with brief rationale, or "None - followed plan as specified"]

## Deviations from Plan

[If no deviations: "None - plan executed exactly as written"]

[If deviations occurred:]

### Auto-fixed Issues

**1. [Rule X - Category] Brief description**
- **Found during:** Task [N] ([task name])
- **Issue:** [What was wrong]
- **Fix:** [What was done]
- **Files modified:** [file paths]
- **Verification:** [How it was verified]
- **Committed in:** [hash]

---

**Total deviations:** [N] auto-fixed
**Impact on plan:** [Brief assessment]

## Issues Encountered
[Problems and how they were resolved, or "None"]

## E2E Test Results

**IMPORTANT:** If E2E tests were created or modified, include actual execution results here.
`npx playwright test --list` is NOT test execution - it only lists test structure!

| Test Suite | Tests | Passed | Failed | Command |
|------------|-------|--------|--------|---------|
| example.spec.ts | 5 | 5 | 0 | `npx playwright test tests/e2e/example.spec.ts` |

**If tests failed:** List failures and fixes applied before marking as complete.

## Screenshots (if UI verification)

| File | Description |
|------|-------------|
| 2026-01-26_143000_UC-UG-001.png | Task form working |

## Next Phase Readiness
[What's ready for next phase]
[Any blockers or concerns]

---
*Phase: XX-name*
*Completed: [date]*
```

</summary_template>

<one_liner_rules>
The one-liner MUST be substantive:

**Good:**
- "Task creation form with validation per UC-SF-001 and UC-SF-002 specs"
- "User authentication flow implementing UC-UG-001 scenarios"
- "Dashboard with task list rendering and completion toggle"

**Bad:**
- "Phase complete"
- "Use cases implemented"
- "All tasks done"

The one-liner should tell someone what actually shipped.
</one_liner_rules>

<use_case_tracking>
**Use Case Driven Specific: Track implementation status**

The summary MUST include:
- List of Subfunction use cases implemented
- Progress toward User-Goal use cases
- Commit hashes per subfunction (traceability)

This enables:
- uc-verifier to know what to verify
- Progress tracking at use case level
- Clear traceability from commit to use case
</use_case_tracking>
