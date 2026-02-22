# Command: /esf:remove-phase

## Purpose

Remove a phase from the roadmap by archiving it (not deleting). Automatically renumbers subsequent phases to maintain sequential numbering.

## When to Use

- Phase is no longer needed
- Requirements changed and phase is obsolete
- Consolidating phases
- Scope reduction

## Philosophy

**Archive, Don't Delete:** Phases are archived, not deleted, to preserve historical context and allow recovery if needed.

## Prerequisites

- Project initialized
- Phase exists
- Phase is not currently being executed (or use `--force`)

## Usage

```bash
/esf:remove-phase [N] [--reason "text"] [--force] [--no-archive]
```

### Arguments

- `N`: Phase number to remove (required)

### Flags

- `--reason "text"`: Explain why phase is removed (recommended)
- `--force`: Skip safety checks (remove even if in progress)
- `--no-archive`: Don't archive (permanently delete) - use with caution!

## What This Command Does

### 1. Safety Checks

Validates removal is safe:
- Phase N exists
- Phase is not currently in progress (unless `--force`)
- No dependencies from other phases
- User confirms removal

### 2. Archive Phase

Archives phase directory:

```
.planning/phases/archive/NN-phase-name-YYYYMMDD/
```

Archive includes:
- All PLAN files
- All SUMMARY files
- CONTEXT.md (if exists)
- VERIFICATION.md (if exists)
- Removal metadata file

### 3. Renumber Subsequent Phases

Renumbers all phases > N:

```
Phase N+1 → Phase N
Phase N+2 → Phase N+1
Phase N+3 → Phase N+2
...
```

### 4. Update Documentation

Updates all documentation:
- ROADMAP.md (remove phase, mark as removed with reason)
- STATE.md (log removal)
- Use case assignments (if phase had use cases)

### 5. Create Removal Record

Creates archive metadata:

```markdown
# Phase Removal Record

**Phase:** 03-deprecated-feature
**Removed:** 2026-01-27 15:45
**Reason:** Feature deprecated in favor of alternative approach

## Original State

**Status:** Planned (not executed)
**Plans:** 0
**Use Cases:** None assigned

## Reason for Removal

Feature scope changed. Alternative approach selected that doesn't require
separate phase. Functionality will be incorporated into phase 02 instead.

## Recovery

To restore this phase:
1. Move archive back: mv .planning/phases/archive/03-deprecated-feature-20260127 .planning/phases/03-deprecated-feature
2. Renumber subsequent phases: /esf:renumber-phases
3. Update ROADMAP.md manually
```

## Output Example (Unexecuted Phase)

```bash
/esf:remove-phase 3 --reason "Feature scope changed, incorporated into phase 2"
```

```
🗑️  Removing Phase 03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase: 03-deprecated-feature
Status: Planned (not executed)
Plans: 0
Use Cases: None assigned
Reason: Feature scope changed, incorporated into phase 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Phase exists
✅ Not currently in progress
✅ No dependencies from other phases
✅ Safe to remove

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPACT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phases to renumber:
   04-api-integration → 03-api-integration
   05-notifications   → 04-notifications

⚠️  Note: 2 phases will be renumbered

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Remove phase 03-deprecated-feature?
   - Phase will be archived (not deleted)
   - 2 subsequent phases will be renumbered
   - Can be recovered from archive if needed

Proceed? (y/n): y

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHIVING PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Moving to archive:
   ✅ .planning/phases/03-deprecated-feature
      → .planning/phases/archive/03-deprecated-feature-20260127/

✅ Created removal record
✅ Archived successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENUMBERING PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Renaming directories:
   ✅ 04-api-integration → 03-api-integration
   ✅ 05-notifications   → 04-notifications

📝 Updating ROADMAP.md:
   ✅ Phase numbers updated
   ✅ Removal noted in history

📝 Updating plan file references:
   ✅ 03-api-integration/03-01-PLAN.md updated
   ✅ 04-notifications/04-01-PLAN.md updated

✅ Renumbering complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Updated ROADMAP.md (marked phase as removed)
✅ Updated STATE.md (logged removal)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Phase Removed Successfully

Removed: Phase 03 (deprecated-feature)
Archived: .planning/phases/archive/03-deprecated-feature-20260127/
Phases Renumbered: 2 phases (04→03, 05→04)

To recover:
   mv .planning/phases/archive/03-deprecated-feature-20260127 .planning/phases/03-deprecated-feature
   /esf:renumber-phases
```

## Output Example (Executed Phase with Work)

```bash
/esf:remove-phase 2 --reason "Consolidating with phase 1"
```

```
🗑️  Removing Phase 02

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase: 02-user-authentication
Status: Complete (executed and verified)
Plans: 2 plans with 8 subfunctions
Use Cases: UC-UG-002, UC-UG-003
Commits: 15 commits
Reason: Consolidating with phase 1

⚠️  Warning: This phase has been executed and contains work!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Phase exists
⚠️  Phase has been executed (contains work)
✅ Not currently in progress
✅ No dependencies from other phases
⚠️  Archiving will preserve all work

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Important: This phase contains executed work!

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

If phase is currently in progress:

```
⚠️  Cannot Remove Phase

Phase 03 is currently in progress:
   Current plan: 03-02-PLAN.md
   Status: Executing

Options:
   1. Complete phase first: /esf:execute-phase 3
   2. Force removal: /esf:remove-phase 3 --force
      (⚠️  Will interrupt active work)

Recommended: Complete or pause work before removal.
```

## Forced Removal

```bash
/esf:remove-phase 3 --force --reason "Urgent scope change"
```

```
⚠️  Force Removing Active Phase

Phase 03 is in progress but will be removed anyway.

⚠️  Warning:
   - Active work will be interrupted
   - Uncommitted changes will NOT be automatically saved
   - Commit your work first if needed

Last chance to cancel. Proceed? (y/n):
```

## Permanent Deletion (Not Recommended)

```bash
/esf:remove-phase 3 --no-archive --reason "Empty phase, never used"
```

```
🗑️  Permanently Deleting Phase

⚠️  WARNING: Using --no-archive will PERMANENTLY DELETE the phase!

Phase will be:
   ❌ Deleted (not archived)
   ❌ Cannot be recovered
   ❌ All planning artifacts lost

This is NOT recommended. Archive is safer.

Type the phase name to confirm deletion: deprecated-feature

Confirmed. Deleting permanently...

✅ Phase deleted (not archived)
⚠️  This action cannot be undone!
```

## Dependency Check

If other phases reference removed phase:

```
❌ Cannot Remove Phase

Phase 03 has dependencies:

Referenced by:
   - Phase 04: Plan 04-01-PLAN.md mentions "builds on phase 3"
   - Phase 05: Use case UC-SF-015 references "after phase 3"

Options:
   1. Update dependent phases first
   2. Force removal: /esf:remove-phase 3 --force
      (Dependencies will be broken)

Recommended: Update dependencies before removal.
```

## Recovery Process

To recover an archived phase:

```bash
# 1. Restore from archive
mv .planning/phases/archive/03-feature-20260127 .planning/phases/03-feature

# 2. Renumber if needed
/esf:renumber-phases

# 3. Update ROADMAP.md
# (Edit manually to re-add phase)

# 4. Verify
/esf:progress
```

## Renumbering Order

Same as insert-phase - renumbers from lowest to highest (opposite direction):

```
✅ Correct order:
   04 → 03 (safe, 03 was just archived)
   05 → 04 (safe, 04 was just renamed to 03)
   06 → 05 (safe, 05 was just renamed to 04)
```

## Impact on Use Cases

If phase had use cases assigned:

```
⚠️  Use Case Reassignment Needed

Phase 03 had use cases assigned:
   - UC-UG-005: Feature X
   - UC-UG-006: Feature Y

These use cases are now unassigned.

Options:
   1. Reassign to other phase
   2. Remove use cases: /esf:remove-use-case UC-UG-005
   3. Leave unassigned (can assign later)
```

## ROADMAP.md Update

Removed phase is marked in history:

```markdown
## Removed Phases

### Phase 03: Deprecated Feature ❌

**Removed:** 2026-01-27
**Reason:** Feature scope changed, incorporated into phase 2
**Archive:** `.planning/phases/archive/03-deprecated-feature-20260127/`

Original position: Between phase 02 and former phase 04.
```

## Related Commands

- `/esf:add-phase` - Add a phase
- `/esf:insert-phase` - Insert a phase
- `/esf:renumber-phases` - Fix phase numbering
- `/esf:progress` - View current roadmap

## Files Modified

- `.planning/phases/NN-name/` - Moved to archive
- `.planning/phases/archive/` - Contains archived phase
- `.planning/ROADMAP.md` - Phase removed, marked in history
- `.planning/STATE.md` - Removal logged
- `.planning/use-cases/` - Phase assignments updated (if applicable)
- Subsequent phase directories - Renumbered

## Implementation Details

This command should:

1. **Validate removal** - Check phase exists, not in progress (unless force)
2. **Check dependencies** - Warn if other phases reference this one
3. **Get user confirmation** - Especially if phase has executed work
4. **Archive phase** - Move to `.planning/phases/archive/NN-name-YYYYMMDD/`
5. **Create removal record** - Document why removed and how to recover
6. **Renumber subsequent phases** - Update all phases > N
7. **Update documentation** - ROADMAP.md, STATE.md, use case assignments
8. **Update references** - Find and update/remove references to removed phase

The implementation must:
- **Preserve history:** Archive, don't delete (unless `--no-archive`)
- **Be safe:** Check for active work, dependencies
- **Be clear:** Explain impact, especially for executed phases
- **Be recoverable:** Make recovery process straightforward
- **Update all references:** Don't leave broken references
