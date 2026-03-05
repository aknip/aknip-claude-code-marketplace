---
description: Review milestone completeness before marking complete
---

## Purpose

Review milestone completeness and readiness before marking it complete. Provides a comprehensive audit report identifying any blockers or missing work.

## When to Use

- Before running `/esf:complete-milestone`
- To check current milestone progress
- To identify what work remains before release
- When uncertain if milestone is ready to complete

## Prerequisites

None - this is a read-only diagnostic command

## Usage

```bash
/esf:audit-milestone [--detailed] [--output FILE] [--sprint N]
```

### Flags

- `--detailed`: Include verbose output with file paths and commit references
- `--output FILE`: Save report to file (default: display only)
- `--sprint N`: Audit specific sprint only

## What This Command Checks

### 1. Use Case Coverage

Checks all use cases are implemented:

```
✓ Objectives use cases: 2/2 (100%)
✓ Epic-level use cases: 8/8 (100%)
✓ Task-level use cases: 25/25 (100%)
```

Identifies:
- Use cases without implementation
- Use cases with failed verification
- Orphaned tasks (no parent epic)

### 2. Scenario Verification

Checks all scenarios have passed:

```
✓ UC-EP-001: User Registration (3 scenarios) - PASSED
✓ UC-EP-002: User Login (4 scenarios) - PASSED
⚠ UC-EP-003: Profile Update (2 scenarios) - NOT VERIFIED
```

Identifies:
- Scenarios not yet verified
- Scenarios with failed verification
- Missing verification reports

### 3. Sprint Completion

Checks all sprints are complete:

```
✓ Sprint 01: Foundation - COMPLETE
✓ Sprint 02: User Authentication - COMPLETE
⚠ Sprint 03: User Profile - VERIFICATION PENDING
```

Identifies:
- Sprints without verification
- Sprints with incomplete plans
- Sprints with failed scenarios

### 4. Git Status

Checks git repository state:

```
✓ Branch: main
✓ No uncommitted changes
✓ All changes pushed to remote
```

Identifies:
- Uncommitted files
- Untracked files
- Unpushed commits
- Stale branches

### 5. Commit Traceability

Validates all commits reference use cases:

```
✓ 47 commits total
✓ 47 commits reference use cases (100%)
✓ All tasks have commits
```

Identifies:
- Commits without use case references
- Commits missing "Implements:" field
- Tasks without corresponding commits

### 6. Documentation Completeness

Checks required documentation exists:

```
✓ PROJECT.md exists and valid
✓ PROJECT-PLAN.md exists and valid
✓ PROJECT-STATUS.md exists and current
✓ All sprints have CONTEXT.md
✓ All sprints have SUMMARY.md
✓ All sprints have VERIFICATION.md
```

Identifies:
- Missing documentation files
- Incomplete sprint documentation
- Outdated files

## Output Example (All Pass)

```
📊 Milestone Audit Report

Milestone: v1.0.0
Audit Date: 2026-01-27 15:30
Status: READY ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE CASE COVERAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Objectives: 2/2 (100%)
✅ Epic-level: 8/8 (100%)
✅ Task-level: 25/25 (100%)

All use cases implemented.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENARIO VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Total scenarios: 45/45 (100%)
✅ All scenarios passed verification

Scenarios by use case:
   ✅ UC-EP-001: User Registration (3 scenarios)
   ✅ UC-EP-002: User Login (4 scenarios)
   ✅ UC-EP-003: Profile Viewing (2 scenarios)
   ✅ UC-EP-004: Profile Editing (3 scenarios)
   [... 4 more ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint 01: Foundation - COMPLETE
✅ Sprint 02: User Authentication - COMPLETE
✅ Sprint 03: User Profile - COMPLETE

All 3 sprints complete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Branch: main
✅ No uncommitted changes
✅ No untracked files
✅ All commits pushed to remote
✅ Repository clean

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMIT TRACEABILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Total commits: 47
✅ Commits with use case refs: 47 (100%)
✅ All tasks have commits
✅ Traceability complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PROJECT.md exists and valid
✅ PROJECT-PLAN.md exists and valid
✅ PROJECT-STATUS.md exists and current
✅ All sprints have CONTEXT.md (3/3)
✅ All sprints have SUMMARY.md (3/3)
✅ All sprints have VERIFICATION.md (3/3)

Documentation complete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Status: READY ✅

✅ 0 blockers
✅ 0 warnings
✅ All checks passed

This milestone is ready to complete.

Next Step:
   /esf:complete-milestone
```

## Output Example (Issues Found)

```
📊 Milestone Audit Report

Milestone: v1.0.0
Audit Date: 2026-01-27 15:30
Status: NOT READY ⚠️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE CASE COVERAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Objectives: 2/2 (100%)
⚠️  Epic-level: 7/8 (88%)
⚠️  Task-level: 23/25 (92%)

Missing implementations:
   ❌ UC-EP-004: Profile Deletion (not implemented)
   ❌ UC-TK-024: Delete User API (no commit found)
   ❌ UC-TK-025: Delete Confirmation UI (no commit found)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENARIO VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Total scenarios: 42/45 (93%)
❌ 3 scenarios not verified

Not verified:
   ❌ UC-EP-003: Profile Update (2 scenarios) - NO VERIFICATION FILE
   ❌ UC-EP-004: Profile Deletion (3 scenarios) - NOT IMPLEMENTED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint 01: Foundation - COMPLETE
✅ Sprint 02: User Authentication - COMPLETE
❌ Sprint 03: User Profile - INCOMPLETE

Sprint 03 issues:
   - Plan 03-02 not executed (Profile Deletion)
   - Verification report missing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Branch: main
❌ Uncommitted changes (2 files):
   - src/components/ProfileEdit.tsx
   - tests/profile-edit.test.ts
⚠️  Unpushed commits: 3 commits ahead of origin/main
✅ No untracked files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMIT TRACEABILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Total commits: 45
⚠️  Commits with use case refs: 42 (93%)
⚠️  Missing use case references in 3 commits:
   - abc123f: "fix typo in login form"
   - def456g: "update dependencies"
   - ghi789h: "refactor auth service"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PROJECT.md exists and valid
✅ PROJECT-PLAN.md exists and valid
✅ PROJECT-STATUS.md exists and current
✅ All sprints have CONTEXT.md (3/3)
⚠️  Sprint 03 missing SUMMARY.md for plan 03-02
❌ Sprint 03 missing VERIFICATION.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Status: NOT READY ⚠️

❌ 5 blockers
⚠️  4 warnings
⚠️  Cannot complete milestone yet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ❌ Use Case Not Implemented: UC-EP-004
   Problem: Profile Deletion feature not implemented
   Fix: Execute sprint 03 plan 03-02
   Command: /esf:execute-sprint 3 --plan 03-02

2. ❌ Missing Tasks: UC-TK-024, UC-TK-025
   Problem: Tasks have no corresponding commits
   Fix: Implement or remove from use case hierarchy
   Files: .planning/use-cases/task/UC-TK-024.md, UC-TK-025.md

3. ❌ Uncommitted Changes
   Problem: 2 files modified but not committed
   Fix: Commit changes or discard
   Command: git add . && git commit -m "message"

4. ❌ Verification Missing: UC-EP-003
   Problem: Profile Update scenarios not verified
   Fix: Run verification for sprint 03
   Command: /esf:verify-sprint 3

5. ❌ Documentation Missing
   Problem: Sprint 03 missing VERIFICATION.md
   Fix: Run verification to generate report
   Command: /esf:verify-sprint 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WARNINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ⚠️  Unpushed Commits
   Problem: 3 commits not pushed to remote
   Fix: Push commits
   Command: git push origin main

2. ⚠️  Missing Use Case References
   Problem: 3 commits don't reference use cases
   Fix: Document in PROJECT-STATUS.md or amend commits
   Commits: abc123f, def456g, ghi789h

3. ⚠️  Missing SUMMARY.md
   Problem: Sprint 03 plan 03-02 has no summary
   Fix: Will be generated after execution
   Note: Not a blocker if plan not yet executed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 (Blockers):
   1. Execute plan: /esf:execute-sprint 3 --plan 03-02
   2. Commit changes: git add . && git commit -m "feat(03-02): complete profile editing"
   3. Verify sprint: /esf:verify-sprint 3

Priority 2 (Warnings):
   4. Push commits: git push origin main
   5. Document non-UC commits in PROJECT-STATUS.md

After completing actions, run:
   /esf:audit-milestone

When all blockers resolved, run:
   /esf:complete-milestone
```

## Detailed Output Mode

With `--detailed` flag, includes:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETAILED COMMIT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commits without use case references:

1. abc123f - "fix typo in login form"
   Date: 2026-01-25 14:23
   Files: src/components/LoginForm.tsx
   Note: Minor fix, consider adding "Fixes: UC-TK-007" reference

2. def456g - "update dependencies"
   Date: 2026-01-26 10:15
   Files: package.json, package-lock.json
   Note: Maintenance commit, document in PROJECT-STATUS.md

3. ghi789h - "refactor auth service"
   Date: 2026-01-27 09:30
   Files: src/services/auth.ts
   Note: Should reference related use cases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBFUNCTION COMMIT MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Lists each task with its corresponding commit]
```

## Output to File

```bash
/esf:audit-milestone --output audit-report.md
```

```
📊 Running Milestone Audit...

✅ Audit complete
📝 Report saved to: audit-report.md

Summary: NOT READY (5 blockers, 4 warnings)

View report:
   cat audit-report.md
```

## Sprint-Specific Audit

```bash
/esf:audit-milestone --sprint 3
```

Audits only Sprint 03 (faster for checking specific sprint).

## Related Commands

- `/esf:complete-milestone` - Complete milestone (run after audit passes)
- `/esf:progress` - Simpler progress overview
- `/esf:debug` - General framework diagnostics
- `/esf:verify-sprint N` - Run verification for specific sprint

## Exit Codes

When run programmatically:
- `0`: Ready to complete (no blockers)
- `1`: Blockers found (cannot complete)
- `2`: Warnings only (can complete but review recommended)

## Implementation Details

This command should:

1. **Scan use case hierarchy** - Check all use cases have implementation
2. **Check verification reports** - Ensure all scenarios passed
3. **Analyze git status** - Check for uncommitted/unpushed changes
4. **Parse git log** - Verify all commits reference use cases
5. **Check documentation** - Ensure all required files exist
6. **Validate sprint structure** - Check each sprint has required files
7. **Generate prioritized recommendations** - Sort by severity (blockers vs warnings)
8. **Provide clear action items** - Include exact commands to resolve issues

The audit should be:
- **Comprehensive:** Check everything needed for milestone completion
- **Clear:** Distinguish blockers from warnings
- **Actionable:** Provide specific commands to fix each issue
- **Fast:** Complete in < 10 seconds for typical projects
- **Non-destructive:** Read-only operation, no modifications
