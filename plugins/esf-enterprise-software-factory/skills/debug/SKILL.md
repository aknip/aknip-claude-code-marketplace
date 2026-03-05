---
description: Diagnostic command for troubleshooting UC framework issues
---

## Purpose

Diagnostic command for troubleshooting UC framework issues. Checks framework configuration, validates project structure, verifies use case traceability, analyzes git history, and suggests fixes for common problems.

## When to Use

- Something seems broken or inconsistent
- Sprint numbers don't match directories
- Use case references are broken
- Git commits missing traceability
- Configuration issues suspected
- After manual file operations
- Before reporting framework issues

## Prerequisites

None - diagnostic command, can run anytime

## Usage

```bash
/esf:debug [--sprint N] [--verbose] [--fix] [--category NAME]
```

### Flags

- `--sprint N`: Debug specific sprint only
- `--verbose`: Show detailed diagnostic output
- `--fix`: Attempt to auto-fix common issues (requires confirmation)
- `--category NAME`: Check specific category (system, framework, git, usecase, docs)

## What This Command Checks

### 1. System Checks

Environment and tools:
- Git repository initialized
- Node.js/npm versions
- Framework directories exist (`.claude/`, `.planning/`)
- Required tools available

### 2. Framework Validation

Configuration and structure:
- `.planning/config.json` valid JSON
- All agents exist in `.claude/agents/`
- All skills exist in `.claude/skills/`
- PROJECT-PLAN.md format valid
- Sprint directory structure correct

### 3. Use Case Validation

Traceability and format:
- Use case index exists
- ID format valid (UC-OBJ-*, UC-EP-*, UC-TK-*)
- No orphaned tasks
- Parent-child relationships intact
- Sprint assignments valid

### 4. Git History Check

Commit traceability:
- All commits reference use cases (or documented exceptions)
- Task commits have "Implements:" field
- Atomic commits per task
- Branch naming follows convention

### 5. Documentation Completeness

Required files:
- PROJECT.md exists
- PROJECT-PLAN.md exists and current
- PROJECT-STATUS.md exists and current
- Sprint CONTEXT files (for planned sprints)
- Sprint SUMMARY files (for executed sprints)
- VERIFICATION files (for verified sprints)

### 6. Sprint Structure

Directory consistency:
- Sprint numbering sequential (no gaps)
- Directory names match PROJECT-PLAN.md
- Plan files named correctly
- No duplicate sprint numbers

## Output Example (No Issues)

```bash
/esf:debug
```

```
🔍 UC Framework Diagnostics

Running comprehensive checks...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Git repository initialized
✅ Node.js v20.10.0
✅ npm v10.2.0
✅ .claude/ directory exists (8 agents, 18 commands)
✅ .planning/ directory exists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAMEWORK VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Config file valid (.planning/config.json)
✅ All agents present (8/8)
✅ All commands valid
✅ PROJECT-PLAN.md format correct
✅ Sprint directory structure valid

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE CASE VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Use case index exists
✅ All IDs follow format (UC-OBJ-*, UC-EP-*, UC-TK-*)
✅ No orphaned use cases
✅ Traceability links valid
✅ Sprint assignments correct

Summary:
   2 Objectives (UC-OBJ-*)
   8 Epic-level (UC-EP-*)
   25 Task-level (UC-TK-*)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT HISTORY CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All commits reference use cases (47/47)
✅ Atomic commits per task
✅ Traceability fields present
✅ Branch naming follows convention

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTATION CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PROJECT.md exists and valid
✅ PROJECT-PLAN.md exists and current
✅ PROJECT-STATUS.md exists and current
✅ All sprints have CONTEXT.md (3/3)
✅ All executed sprints have SUMMARY.md (3/3)
✅ All verified sprints have VERIFICATION.md (3/3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprints numbered sequentially (01-03)
✅ Directory names match PROJECT-PLAN.md
✅ Plan files named correctly
✅ No duplicate sprint numbers

Sprints:
   01-foundation ✅
   02-user-authentication ✅
   03-user-profile ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All Checks Passed

No issues found. Framework is healthy.

Total checks: 32
Passed: 32
Warnings: 0
Errors: 0
```

## Output Example (Issues Found)

```bash
/esf:debug
```

```
🔍 UC Framework Diagnostics

Running comprehensive checks...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Git repository initialized
✅ Node.js v20.10.0
⚠️  npm v9.8.0 (recommended: v10.x)
✅ .claude/ directory exists
✅ .planning/ directory exists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAMEWORK VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Config file valid
✅ All agents present
✅ All commands valid
✅ PROJECT-PLAN.md format correct
⚠️  Sprint directory naming inconsistent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE CASE VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Use case index exists
✅ All IDs follow format
❌ Orphaned task detected
✅ Traceability links valid
⚠️  Sprint assignment mismatch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT HISTORY CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Commits with use case refs: 44/47 (94%)
✅ Atomic commits per task
⚠️  3 commits missing traceability fields
✅ Branch naming follows convention

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTATION CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PROJECT.md exists and valid
✅ PROJECT-PLAN.md exists and current
⚠️  PROJECT-STATUS.md outdated (last modified 3 days ago)
✅ All sprints have CONTEXT.md
⚠️  Sprint 03 missing SUMMARY.md for plan 03-02
❌ Sprint 03 missing VERIFICATION.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Gap in sprint numbering (01, 02, 04, 05 - missing 03)
✅ Directory names match PROJECT-PLAN.md
✅ Plan files named correctly
✅ No duplicate sprint numbers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Issues Found

Total checks: 32
Passed: 24
Warnings: 5
Errors: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERRORS (3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ❌ Orphaned Use Case
   Problem: UC-TK-999 exists but has no parent UC-UG use case
   Location: .planning/use-cases/task/UC-TK-999.md
   Fix: Remove orphaned file or assign to parent use case
   Command:
      rm .planning/use-cases/task/UC-TK-999.md
      # OR assign to parent use case manually

2. ❌ Sprint Numbering Gap
   Problem: Missing sprint 03 (sequence: 01, 02, 04, 05)
   Fix: Renumber sprints to close gap
   Command:
      /esf:renumber-sprints

3. ❌ Missing Verification Report
   Problem: Sprint 03 missing VERIFICATION.md
   Fix: Run verification for sprint 03
   Command:
      /esf:verify-sprint 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WARNINGS (5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ⚠️  npm Version
   Current: v9.8.0
   Recommended: v10.x
   Fix: Update npm
   Command:
      npm install -g npm@latest

2. ⚠️  Sprint Directory Naming
   Problem: Directory "02-user-auth" doesn't match ROADMAP name "user-authentication"
   Fix: Rename directory to match ROADMAP
   Command:
      mv .planning/sprints/02-user-auth .planning/sprints/02-user-authentication

3. ⚠️  Missing Traceability Fields
   Problem: 3 commits don't reference use cases
   Commits:
      - abc123f: "fix typo in login form"
      - def456g: "update dependencies"
      - ghi789h: "refactor auth service"
   Fix: Document in PROJECT-STATUS.md or amend commits (if not pushed)
   Notes: Minor commits, can be documented as non-UC work

4. ⚠️  Outdated PROJECT-STATUS.md
   Problem: Last modified 3 days ago, may be stale
   Fix: Update PROJECT-STATUS.md with current status
   Command: (manual update needed)

5. ⚠️  Missing SUMMARY.md
   Problem: Sprint 03 plan 03-02 has no summary
   Fix: Will be generated after execution
   Note: Not a blocker if plan not yet executed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 (Fix Errors):
   1. Remove orphaned use case or assign parent
   2. Renumber sprints: /esf:renumber-sprints
   3. Run verification: /esf:verify-sprint 3

Priority 2 (Address Warnings):
   4. Update npm: npm install -g npm@latest
   5. Rename directory: mv .planning/sprints/02-user-auth .planning/sprints/02-user-authentication
   6. Document non-UC commits in PROJECT-STATUS.md

After fixes, run:
   /esf:debug

Auto-fix available for some issues:
   /esf:debug --fix
```

## Debug Specific Sprint

```bash
/esf:debug --sprint 3
```

```
🔍 Debugging Sprint 03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT 03: user-profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint directory exists
✅ Sprint in PROJECT-PLAN.md
✅ Sprint number correct (03)
❌ Missing VERIFICATION.md
⚠️  Plan 03-02 missing SUMMARY.md

Plans:
   ✅ 03-01-PLAN.md (executed)
   ⚠️  03-02-PLAN.md (incomplete)

Use Cases:
   ✅ UC-EP-004 assigned to sprint
   ✅ UC-EP-005 assigned to sprint

Commits:
   12 commits reference sprint 03
   ✅ All commits have use case references

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issues: 1 error, 1 warning

Recommendations:
   1. Complete plan 03-02: /esf:execute-sprint 3 --plan 03-02
   2. Run verification: /esf:verify-sprint 3
```

## Verbose Mode

```bash
/esf:debug --verbose
```

Shows detailed diagnostic information:
- Full file paths
- Actual vs expected values
- Complete git log analysis
- Detailed use case hierarchy
- Configuration dump

## Auto-Fix Mode

```bash
/esf:debug --fix
```

```
🔧 UC Framework Auto-Fix

⚠️  This will attempt to fix common issues automatically.

Fixable issues found:
   1. Sprint numbering gap (can renumber)
   2. Directory name mismatch (can rename)

Cannot auto-fix:
   - Orphaned use cases (requires manual decision)
   - Missing verification (requires execution)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceed with auto-fix? (y/n): y

Fixing...

✅ Renumbered sprints (closed gap)
✅ Renamed directory: 02-user-auth → 02-user-authentication

Fixed: 2 issues
Manual intervention still needed: 2 issues

Run /esf:debug to verify fixes.
```

## Category-Specific Debug

```bash
/esf:debug --category git
```

Checks only git-related issues (faster).

## JSON Output

```bash
/esf:debug --json
```

Outputs diagnostic results as JSON (useful for tooling).

## Common Issues Detected

- Sprint numbering gaps
- Orphaned use cases
- Missing documentation files
- Broken traceability links
- Invalid configuration
- Directory naming mismatches
- Missing commits for tasks
- Duplicate sprint numbers

## Related Commands

- `/esf:renumber-sprints` - Fix sprint numbering
- `/esf:audit-milestone` - Check milestone completeness
- `/esf:settings` - Check and fix configuration
- `/esf:progress` - View current progress

## Files Read

- `.planning/config.json`
- `.planning/PROJECT.md`
- `.planning/PROJECT-PLAN.md`
- `.planning/PROJECT-STATUS.md`
- `.planning/sprints/**/*`
- `.planning/use-cases/**/*`
- `.claude/agents/**/*`
- `.claude/skills/**/*`
- Git log and status

## Files Modified

- None (read-only unless `--fix` used)
- With `--fix`: May rename directories, update files

## Implementation Details

This command should:

1. **Run all checks systematically** - System, framework, use cases, git, docs, sprints
2. **Classify issues** - Error vs warning vs info
3. **Suggest fixes** - Provide exact commands to resolve
4. **Auto-fix option** - Safe automated fixes with `--fix`
5. **Clear output** - Use colors and formatting for readability
6. **Exit code** - 0 if healthy, 1 if errors, 2 if warnings only

The implementation should:
- **Be comprehensive** - Check everything that could go wrong
- **Be helpful** - Provide clear fix instructions
- **Be safe** - Only auto-fix safe, reversible issues
- **Be fast** - Complete in < 30 seconds
- **Handle missing files** - Don't crash if files missing
