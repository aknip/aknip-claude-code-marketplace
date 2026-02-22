---
description: Fix phase numbering gaps and inconsistencies
---

## Purpose

Utility command to fix phase numbering when gaps or inconsistencies exist. Ensures phases are numbered sequentially from 01 without gaps.

## When to Use

- After manual directory operations
- After recovering archived phase
- When phase numbering has gaps (01, 02, 04, 05 - missing 03)
- When phase numbers are out of order
- After failed insert/remove operations

## Prerequisites

- Project initialized
- Phases directory exists

## Usage

```bash
/esf:renumber-phases [--dry-run] [--force]
```

### Flags

- `--dry-run`: Show what would be changed without making changes (recommended first)
- `--force`: Skip confirmation prompt

## What This Command Does

### 1. Analyze Current State

Scans existing phases:
- Identifies all phase directories
- Checks for gaps in numbering
- Checks for duplicate numbers
- Validates directory name format

### 2. Determine New Numbering

Calculates correct sequential numbering:
- Maintains alphabetical order of phase names
- Assigns 01, 02, 03, ... sequentially
- No gaps

### 3. Plan Renaming

Creates renaming plan:
- Maps old numbers to new numbers
- Determines safe renaming order
- Identifies files to update

### 4. Execute Renaming

Renames directories and updates references:
- Rename phase directories
- Update ROADMAP.md
- Update plan file names
- Update internal references
- Update use case phase assignments

### 5. Verify Consistency

Validates final state:
- All phases numbered sequentially
- No gaps
- All references updated
- ROADMAP.md consistent

## Output Example (Dry Run)

```bash
/esf:renumber-phases --dry-run
```

```
🔢 Phase Renumbering Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found phases:
   01-foundation
   02-user-authentication
   04-api-integration      ⚠️  Gap after 02
   05-notifications
   07-deployment           ⚠️  Gap after 05

Issues detected:
   ❌ Missing phase 03 (gap in sequence)
   ❌ Missing phase 06 (gap in sequence)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPOSED CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Renumbering plan:
   01-foundation           → 01-foundation          (no change)
   02-user-authentication  → 02-user-authentication (no change)
   04-api-integration      → 03-api-integration     (04 → 03)
   05-notifications        → 04-notifications       (05 → 04)
   07-deployment           → 05-deployment          (07 → 05)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPACT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Changes required:
   📦 3 directories to rename
   📝 ROADMAP.md updates (3 phase numbers)
   📝 Plan file updates:
      - 03-api-integration/03-01-PLAN.md (was 04-01-PLAN.md)
      - 04-notifications/04-01-PLAN.md (was 05-01-PLAN.md)
      - 05-deployment/05-01-PLAN.md (was 07-01-PLAN.md)
   📝 Internal reference updates (scanning...)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is a DRY RUN - no changes made.

To apply changes:
   /esf:renumber-phases
```

## Output Example (Actual Execution)

```bash
/esf:renumber-phases
```

```
🔢 Renumbering Phases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issues found:
   ❌ 2 gaps in phase numbering

Changes needed:
   📦 3 phases to renumber

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Renumbering plan:
   04-api-integration  → 03-api-integration
   05-notifications    → 04-notifications
   07-deployment       → 05-deployment

Proceed with renumbering? (y/n): y

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING BACKUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Backup created: .planning/.backup-20260127-154530/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENUMBERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Rename to temporary names (avoid collisions)
   ✅ 04-api-integration  → temp-001-api-integration
   ✅ 05-notifications    → temp-002-notifications
   ✅ 07-deployment       → temp-003-deployment

Step 2: Rename to final names
   ✅ temp-001-api-integration → 03-api-integration
   ✅ temp-002-notifications   → 04-notifications
   ✅ temp-003-deployment      → 05-deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATING REFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Updating plan files:
   ✅ 04-01-PLAN.md → 03-01-PLAN.md
   ✅ 05-01-PLAN.md → 04-01-PLAN.md
   ✅ 07-01-PLAN.md → 05-01-PLAN.md

Updating ROADMAP.md:
   ✅ Phase 04 → Phase 03
   ✅ Phase 05 → Phase 04
   ✅ Phase 07 → Phase 05

Updating internal references:
   ✅ Scanned 12 files
   ✅ Updated 8 references

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Final phase list:
   01-foundation
   02-user-authentication
   03-api-integration
   04-notifications
   05-deployment

✅ All phases numbered sequentially (01-05)
✅ No gaps
✅ All references updated
✅ ROADMAP.md consistent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Renumbering Complete

Phases renumbered: 3
Backup location: .planning/.backup-20260127-154530/

Remove backup once verified:
   rm -rf .planning/.backup-20260127-154530/
```

## No Changes Needed

```bash
/esf:renumber-phases
```

```
🔢 Analyzing Phase Numbering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found phases:
   01-foundation
   02-user-authentication
   03-user-profile
   04-api-integration
   05-notifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Phase numbering is correct

All phases numbered sequentially (01-05).
No gaps or inconsistencies found.

No changes needed.
```

## Duplicate Number Detection

```
❌ Duplicate Phase Numbers Detected

Found duplicate phase 03:
   03-user-profile
   03-api-integration

Manual intervention required:
   1. Rename one directory manually
   2. Run /esf:renumber-phases again

Cannot automatically resolve duplicate numbers.
```

## Two-Step Renaming

To avoid collisions during renumbering, uses temporary names:

```
✅ Safe renaming strategy:

Step 1: Rename to temp names
   04-api → temp-001-api  (avoids collision with target 03)
   05-notify → temp-002-notify

Step 2: Rename to final names
   temp-001-api → 03-api
   temp-002-notify → 04-notify
```

## Reference Updates

Automatically updates:

**ROADMAP.md:**
```markdown
# Before
## Phase 04: API Integration

# After
## Phase 03: API Integration
```

**Plan Files:**
```
# Directory rename
04-api-integration/04-01-PLAN.md
→ 03-api-integration/03-01-PLAN.md

# Internal content updates
"Phase 04" → "Phase 03"
"phase-04" → "phase-03"
"04-01-PLAN" → "03-01-PLAN"
```

**Use Case Assignments:**
```markdown
# Before
Part-of: Phase 04

# After
Part-of: Phase 03
```

## Error Recovery

If renaming fails mid-operation:

```
❌ Renumbering Failed

Error during step 2: Failed to rename temp-002-notifications
Reason: Directory not found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLLING BACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Restored from backup
✅ Phases returned to original state
✅ No permanent changes made

Issue: Possible filesystem permission error
Recommendation: Check directory permissions, try again
```

## Force Mode

Skip confirmation:

```bash
/esf:renumber-phases --force
```

Immediately executes without prompting (useful for scripting).

## Common Scenarios

### After Recovering Archived Phase

```bash
# 1. Restore archived phase
mv .planning/phases/archive/03-feature-20260127 .planning/phases/03-feature

# 2. Renumber (03 conflicts with existing 03)
/esf:renumber-phases

# Result: Restored phase gets inserted, subsequent phases renumber
```

### After Manual Directory Deletion

```bash
# Manually deleted 02-user-authentication (not recommended!)
# Now have: 01, 03, 04

/esf:renumber-phases
# Result: 03→02, 04→03 (fills gap)
```

### After Failed Insert/Remove

```bash
# If /esf:insert-phase or /esf:remove-phase failed mid-operation
# Might have inconsistent state

/esf:renumber-phases
# Fixes any numbering issues
```

## Related Commands

- `/esf:add-phase` - Add phase (handles numbering automatically)
- `/esf:insert-phase` - Insert phase (handles numbering automatically)
- `/esf:remove-phase` - Remove phase (handles numbering automatically)
- `/esf:progress` - View current phases
- `/esf:debug` - Diagnose phase structure issues

## When NOT to Use

Don't use if:
- Phase numbering is already correct
- You want to manually control phase numbers
- Currently executing a phase (finish or pause first)

## Files Modified

- `.planning/phases/NN-name/` - Multiple directories renamed
- `.planning/ROADMAP.md` - Phase numbers updated
- `.planning/phases/*/PLAN.md` - File names and content updated
- `.planning/use-cases/` - Phase assignments updated (if applicable)

## Files Created

- `.planning/.backup-[timestamp]/` - Backup before renumbering

## Implementation Details

This command should:

1. **Scan phases directory** - Get list of all phase directories
2. **Detect issues** - Find gaps, duplicates, out-of-order numbering
3. **Calculate correct numbering** - Assign sequential numbers 01, 02, 03...
4. **Create renaming plan** - Map old → new numbers
5. **Use two-step rename** - temp names first to avoid collisions
6. **Update all references** - ROADMAP.md, plan files, use cases
7. **Verify consistency** - Check final state is correct

The implementation must:
- **Avoid collisions:** Use temporary names during renaming
- **Be atomic:** Roll back if any step fails
- **Update all references:** Don't leave broken references
- **Be idempotent:** Running multiple times should be safe
- **Preserve data:** Never delete anything
