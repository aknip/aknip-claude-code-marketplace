---
description: Remove a sprint from the roadmap by archiving
---

## Purpose

Remove a sprint from the roadmap by archiving it (not deleting). Automatically renumbers subsequent sprints to maintain sequential numbering.

## When to Use

- Sprint is no longer needed
- Requirements changed and sprint is obsolete
- Consolidating sprints
- Scope reduction

## Philosophy

**Archive, Don't Delete:** Sprints are archived, not deleted, to preserve historical context and allow recovery if needed.

## Prerequisites

- Project initialized
- Sprint exists
- Sprint is not currently being executed (or use `--force`)

## Usage

```bash
/esf:remove-sprint [N] [--reason "text"] [--force] [--no-archive]
```

### Arguments

- `N`: Sprint number to remove (required)

### Flags

- `--reason "text"`: Explain why sprint is removed (recommended)
- `--force`: Skip safety checks (remove even if in progress)
- `--no-archive`: Don't archive (permanently delete) - use with caution!

## What This Command Does

### 1. Safety Checks

Validates removal is safe:
- Sprint N exists
- Sprint is not currently in progress (unless `--force`)
- No dependencies from other sprints
- User confirms removal

### 2. Archive Sprint

Archives sprint directory:

```
.planning/sprints/archive/NN-sprint-name-YYYYMMDD/
```

Archive includes:
- All PLAN files
- All SUMMARY files
- CONTEXT.md (if exists)
- VERIFICATION.md (if exists)
- Removal metadata file

### 3. Renumber Subsequent Sprints

Renumbers all sprints > N:

```
Sprint N+1 → Sprint N
Sprint N+2 → Sprint N+1
Sprint N+3 → Sprint N+2
...
```

### 4. Update Documentation

Updates all documentation:
- PROJECT-PLAN.md (remove sprint, mark as removed with reason)
- PROJECT-STATUS.md (log removal)
- Use case assignments (if sprint had use cases)

### 5. Create Removal Record

Creates archive metadata:

```markdown
# Sprint Removal Record

**Sprint:** 03-deprecated-feature
**Removed:** 2026-01-27 15:45
**Reason:** Feature deprecated in favor of alternative approach

## Original State

**Status:** Planned (not executed)
**Plans:** 0
**Use Cases:** None assigned

## Reason for Removal

Feature scope changed. Alternative approach selected that doesn't require
separate sprint. Functionality will be incorporated into sprint 02 instead.

## Recovery

To restore this sprint:
1. Move archive back: mv .planning/sprints/archive/03-deprecated-feature-20260127 .planning/sprints/03-deprecated-feature
2. Renumber subsequent sprints: /esf:renumber-sprints
3. Update PROJECT-PLAN.md manually
```

## Output Example (Unexecuted Sprint)

```bash
/esf:remove-sprint 3 --reason "Feature scope changed, incorporated into sprint 2"
```

```
🗑️  Removing Sprint 03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sprint: 03-deprecated-feature
Status: Planned (not executed)
Plans: 0
Use Cases: None assigned
Reason: Feature scope changed, incorporated into sprint 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint exists
✅ Not currently in progress
✅ No dependencies from other sprints
✅ Safe to remove

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPACT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sprints to renumber:
   04-api-integration → 03-api-integration
   05-notifications   → 04-notifications

⚠️  Note: 2 sprints will be renumbered

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Remove sprint 03-deprecated-feature?
   - Sprint will be archived (not deleted)
   - 2 subsequent sprints will be renumbered
   - Can be recovered from archive if needed

Proceed? (y/n): y

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHIVING SPRINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Moving to archive:
   ✅ .planning/sprints/03-deprecated-feature
      → .planning/sprints/archive/03-deprecated-feature-20260127/

✅ Created removal record
✅ Archived successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENUMBERING PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Renaming directories:
   ✅ 04-api-integration → 03-api-integration
   ✅ 05-notifications   → 04-notifications

📝 Updating PROJECT-PLAN.md:
   ✅ Sprint numbers updated
   ✅ Removal noted in history

📝 Updating plan file references:
   ✅ 03-api-integration/03-01-PLAN.md updated
   ✅ 04-notifications/04-01-PLAN.md updated

✅ Renumbering complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Updated PROJECT-PLAN.md (marked sprint as removed)
✅ Updated PROJECT-STATUS.md (logged removal)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint Removed Successfully

Removed: Sprint 03 (deprecated-feature)
Archived: .planning/sprints/archive/03-deprecated-feature-20260127/
Sprints Renumbered: 2 sprints (04→03, 05→04)

To recover:
   mv .planning/sprints/archive/03-deprecated-feature-20260127 .planning/sprints/03-deprecated-feature
   /esf:renumber-sprints
```

## Output Example (Executed Sprint with Work)

```bash
/esf:remove-sprint 2 --reason "Consolidating with sprint 1"
```

```
🗑️  Removing Sprint 02

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sprint: 02-user-authentication
Status: Complete (executed and verified)
Plans: 2 plans with 8 tasks
Use Cases: UC-EP-002, UC-EP-003
Commits: 15 commits
Reason: Consolidating with sprint 1

⚠️  Warning: This sprint has been executed and contains work!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint exists
⚠️  Sprint has been executed (contains work)
✅ Not currently in progress
✅ No dependencies from other sprints
⚠️  Archiving will preserve all work

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Important: This sprint contains executed work!

Contents to be archived:
   - 2 PLAN files
   - 2 SUMMARY files
   - 1 CONTEXT.md
   - 1 VERIFICATION.md
   - 15 commits will remain in git history
   - 8 use case implementations

The code implementations will remain in your codebase.
Only the planning artifacts will be archived.

Proceed? (y/n):
```

## Active Work Warning

If sprint is currently in progress:

```
⚠️  Cannot Remove Sprint

Sprint 03 is currently in progress:
   Current plan: 03-02-PLAN.md
   Status: Executing

Options:
   1. Complete sprint first: /esf:execute-sprint 3
   2. Force removal: /esf:remove-sprint 3 --force
      (⚠️  Will interrupt active work)

Recommended: Complete or pause work before removal.
```

## Forced Removal

```bash
/esf:remove-sprint 3 --force --reason "Urgent scope change"
```

```
⚠️  Force Removing Active Sprint

Sprint 03 is in progress but will be removed anyway.

⚠️  Warning:
   - Active work will be interrupted
   - Uncommitted changes will NOT be automatically saved
   - Commit your work first if needed

Last chance to cancel. Proceed? (y/n):
```

## Permanent Deletion (Not Recommended)

```bash
/esf:remove-sprint 3 --no-archive --reason "Empty sprint, never used"
```

```
🗑️  Permanently Deleting Sprint

⚠️  WARNING: Using --no-archive will PERMANENTLY DELETE the sprint!

Sprint will be:
   ❌ Deleted (not archived)
   ❌ Cannot be recovered
   ❌ All planning artifacts lost

This is NOT recommended. Archive is safer.

Type the sprint name to confirm deletion: deprecated-feature

Confirmed. Deleting permanently...

✅ Sprint deleted (not archived)
⚠️  This action cannot be undone!
```

## Dependency Check

If other sprints reference removed sprint:

```
❌ Cannot Remove Sprint

Sprint 03 has dependencies:

Referenced by:
   - Sprint 04: Plan 04-01-PLAN.md mentions "builds on sprint 3"
   - Sprint 05: Use case UC-TK-015 references "after sprint 3"

Options:
   1. Update dependent sprints first
   2. Force removal: /esf:remove-sprint 3 --force
      (Dependencies will be broken)

Recommended: Update dependencies before removal.
```

## Recovery Process

To recover an archived sprint:

```bash
# 1. Restore from archive
mv .planning/sprints/archive/03-feature-20260127 .planning/sprints/03-feature

# 2. Renumber if needed
/esf:renumber-sprints

# 3. Update PROJECT-PLAN.md
# (Edit manually to re-add sprint)

# 4. Verify
/esf:progress
```

## Renumbering Order

Same as insert-sprint - renumbers from lowest to highest (opposite direction):

```
✅ Correct order:
   04 → 03 (safe, 03 was just archived)
   05 → 04 (safe, 04 was just renamed to 03)
   06 → 05 (safe, 05 was just renamed to 04)
```

## Impact on Use Cases

If sprint had use cases assigned:

```
⚠️  Use Case Reassignment Needed

Sprint 03 had use cases assigned:
   - UC-EP-005: Feature X
   - UC-EP-006: Feature Y

These use cases are now unassigned.

Options:
   1. Reassign to other sprint
   2. Remove use cases: /esf:remove-use-case UC-EP-005
   3. Leave unassigned (can assign later)
```

## PROJECT-PLAN.md Update

Removed sprint is marked in history:

```markdown
## Removed Sprints

### Sprint 03: Deprecated Feature ❌

**Removed:** 2026-01-27
**Reason:** Feature scope changed, incorporated into sprint 2
**Archive:** `.planning/sprints/archive/03-deprecated-feature-20260127/`

Original position: Between sprint 02 and former sprint 04.
```

## Related Commands

- `/esf:add-sprint` - Add a sprint
- `/esf:insert-sprint` - Insert a sprint
- `/esf:renumber-sprints` - Fix sprint numbering
- `/esf:progress` - View current roadmap

## Files Modified

- `.planning/sprints/NN-name/` - Moved to archive
- `.planning/sprints/archive/` - Contains archived sprint
- `.planning/PROJECT-PLAN.md` - Sprint removed, marked in history
- `.planning/PROJECT-STATUS.md` - Removal logged
- `.planning/use-cases/` - Sprint assignments updated (if applicable)
- Subsequent sprint directories - Renumbered

## Implementation Details

This command should:

1. **Validate removal** - Check sprint exists, not in progress (unless force)
2. **Check dependencies** - Warn if other sprints reference this one
3. **Get user confirmation** - Especially if sprint has executed work
4. **Archive sprint** - Move to `.planning/sprints/archive/NN-name-YYYYMMDD/`
5. **Create removal record** - Document why removed and how to recover
6. **Renumber subsequent sprints** - Update all sprints > N
7. **Update documentation** - PROJECT-PLAN.md, PROJECT-STATUS.md, use case assignments
8. **Update references** - Find and update/remove references to removed sprint

The implementation must:
- **Preserve history:** Archive, don't delete (unless `--no-archive`)
- **Be safe:** Check for active work, dependencies
- **Be clear:** Explain impact, especially for executed sprints
- **Be recoverable:** Make recovery process straightforward
- **Update all references:** Don't leave broken references
