# Summary Template

Template for `.planning/sprints/XX-name/{sprint}-{plan}-SUMMARY.md` - plan execution documentation for use case driven projects.

---

## File Template

```markdown
---
sprint: XX-name
plan: YY
subsystem: [primary category: auth, ui, api, database, etc.]
tags: [searchable tech: react, prisma, etc.]

# Use case tracking
use_cases_implemented:
  user_goal: [UC-EP-XXX, UC-EP-YYY]
  tasks: [UC-TK-001, UC-TK-002, UC-TK-003]

# Dependency graph
requires:
  - sprint: [prior sprint this depends on]
    provides: [what that sprint built that this uses]
provides:
  - [bullet list of what this sprint built/delivered]
affects: [list of sprint names or keywords that will need this context]

# Tech tracking
tech-stack:
  added: [libraries/tools added in this sprint]
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

# Sprint [X] Plan [Y]: [Name] Summary

**[Substantive one-liner describing outcome - NOT "sprint complete" or "implementation finished"]**

## Performance

- **Duration:** [time] (e.g., 23 min, 1h 15m)
- **Started:** [ISO timestamp]
- **Completed:** [ISO timestamp]
- **Tasks:** [count completed]
- **Tasks:** [count implemented]

## Use Case Implementation Status

| Task | Name | Status | Commit |
|-------------|------|--------|--------|
| UC-TK-001 | [Name] | ✓ Implemented | abc123 |
| UC-TK-002 | [Name] | ✓ Implemented | def456 |

## Epic Progress

| Epic | Tasks Total | Implemented | Progress |
|-----------|-------------------|-------------|----------|
| UC-EP-001 | 3 | 2 | 67% |

## Task Commits

Each task was committed atomically per task:

1. **Task 1: Implement UC-TK-001** - `abc123f` (feat)
2. **Task 2: Implement UC-TK-002** - `def456g` (feat)

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
| 2026-01-26_143000_UC-EP-001.png | Task form working |

## Next Sprint Readiness
[What's ready for next sprint]
[Any blockers or concerns]

---
*Sprint: XX-name*
*Completed: [date]*
```

</summary_template>

<one_liner_rules>
The one-liner MUST be substantive:

**Good:**
- "Task creation form with validation per UC-TK-001 and UC-TK-002 specs"
- "User authentication flow implementing UC-EP-001 scenarios"
- "Dashboard with task list rendering and completion toggle"

**Bad:**
- "Sprint complete"
- "Use cases implemented"
- "All tasks done"

The one-liner should tell someone what actually shipped.
</one_liner_rules>

<use_case_tracking>
**Use Case Driven Specific: Track implementation status**

The summary MUST include:
- List of Task use cases implemented
- Progress toward Epic use cases
- Commit hashes per task (traceability)

This enables:
- uc-verifier to know what to verify
- Progress tracking at use case level
- Clear traceability from commit to use case
</use_case_tracking>
