---
description: Fix sprint numbering gaps and inconsistencies
---

## Purpose

Utility command to fix sprint numbering when gaps or inconsistencies exist. Ensures sprints are numbered sequentially from 01 without gaps.

## When to Use

- After manual directory operations
- After recovering archived sprint
- When sprint numbering has gaps (01, 02, 04, 05 - missing 03)
- When sprint numbers are out of order
- After failed insert/remove operations

## Prerequisites

- Project initialized
- Sprints directory exists

## Usage

```bash
/esf:renumber-sprints [--dry-run] [--force]
```

### Flags

- `--dry-run`: Show what would be changed without making changes (recommended first)
- `--force`: Skip confirmation prompt

## What This Command Does

### 1. Analyze Current State

Scans existing sprints:
- Identifies all sprint directories
- Checks for gaps in numbering
- Checks for duplicate numbers
- Validates directory name format

### 2. Determine New Numbering

Calculates correct sequential numbering:
- Maintains alphabetical order of sprint names
- Assigns 01, 02, 03, ... sequentially
- No gaps

### 3. Plan Renaming

Creates renaming plan:
- Maps old numbers to new numbers
- Determines safe renaming order
- Identifies files to update

### 4. Execute Renaming

Renames directories and updates references:
- Rename sprint directories
- Update PROJECT-PLAN.md
- Update plan file names
- Update internal references
- Update use case sprint assignments

### 5. Verify Consistency

Validates final state:
- All sprints numbered sequentially
- No gaps
- All references updated
- PROJECT-PLAN.md consistent

## Output Example (Dry Run)

```bash
/esf:renumber-sprints --dry-run
```

```
🔢 Sprint Renumbering Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found sprints:
   01-foundation
   02-user-authentication
   04-api-integration      ⚠️  Gap after 02
   05-notifications
   07-deployment           ⚠️  Gap after 05

Issues detected:
   ❌ Missing sprint 03 (gap in sequence)
   ❌ Missing sprint 06 (gap in sequence)

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
   📝 PROJECT-PLAN.md updates (3 sprint numbers)
   📝 Plan file updates:
      - 03-api-integration/03-01-PLAN.md (was 04-01-PLAN.md)
      - 04-notifications/04-01-PLAN.md (was 05-01-PLAN.md)
      - 05-deployment/05-01-PLAN.md (was 07-01-PLAN.md)
   📝 Internal reference updates (scanning...)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is a DRY RUN - no changes made.

To apply changes:
   /esf:renumber-sprints
```

## Output Example (Actual Execution)

```bash
/esf:renumber-sprints
```

```
🔢 Renumbering Sprints

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issues found:
   ❌ 2 gaps in sprint numbering

Changes needed:
   📦 3 sprints to renumber

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

Updating PROJECT-PLAN.md:
   ✅ Sprint 04 → Sprint 03
   ✅ Sprint 05 → Sprint 04
   ✅ Sprint 07 → Sprint 05

Updating internal references:
   ✅ Scanned 12 files
   ✅ Updated 8 references

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Final sprint list:
   01-foundation
   02-user-authentication
   03-api-integration
   04-notifications
   05-deployment

✅ All sprints numbered sequentially (01-05)
✅ No gaps
✅ All references updated
✅ PROJECT-PLAN.md consistent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Renumbering Complete

Sprints renumbered: 3
Backup location: .planning/.backup-20260127-154530/

Remove backup once verified:
   rm -rf .planning/.backup-20260127-154530/
```

## No Changes Needed

```bash
/esf:renumber-sprints
```

```
🔢 Analyzing Sprint Numbering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found sprints:
   01-foundation
   02-user-authentication
   03-user-profile
   04-api-integration
   05-notifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint numbering is correct

All sprints numbered sequentially (01-05).
No gaps or inconsistencies found.

No changes needed.
```

## Duplicate Number Detection

```
❌ Duplicate Sprint Numbers Detected

Found duplicate sprint 03:
   03-user-profile
   03-api-integration

Manual intervention required:
   1. Rename one directory manually
   2. Run /esf:renumber-sprints again

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

**PROJECT-PLAN.md:**
```markdown
# Before
## Sprint 04: API Integration

# After
## Sprint 03: API Integration
```

**Plan Files:**
```
# Directory rename
04-api-integration/04-01-PLAN.md
→ 03-api-integration/03-01-PLAN.md

# Internal content updates
"Sprint 04" → "Sprint 03"
"sprint-04" → "sprint-03"
"04-01-PLAN" → "03-01-PLAN"
```

**Use Case Assignments:**
```markdown
# Before
Part-of: Sprint 04

# After
Part-of: Sprint 03
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
✅ Sprints returned to original state
✅ No permanent changes made

Issue: Possible filesystem permission error
Recommendation: Check directory permissions, try again
```

## Force Mode

Skip confirmation:

```bash
/esf:renumber-sprints --force
```

Immediately executes without prompting (useful for scripting).

## Common Scenarios

### After Recovering Archived Sprint

```bash
# 1. Restore archived sprint
mv .planning/sprints/archive/03-feature-20260127 .planning/sprints/03-feature

# 2. Renumber (03 conflicts with existing 03)
/esf:renumber-sprints

# Result: Restored sprint gets inserted, subsequent sprints renumber
```

### After Manual Directory Deletion

```bash
# Manually deleted 02-user-authentication (not recommended!)
# Now have: 01, 03, 04

/esf:renumber-sprints
# Result: 03→02, 04→03 (fills gap)
```

### After Failed Insert/Remove

```bash
# If /esf:insert-sprint or /esf:remove-sprint failed mid-operation
# Might have inconsistent state

/esf:renumber-sprints
# Fixes any numbering issues
```

## Related Commands

- `/esf:add-sprint` - Add sprint (handles numbering automatically)
- `/esf:insert-sprint` - Insert sprint (handles numbering automatically)
- `/esf:remove-sprint` - Remove sprint (handles numbering automatically)
- `/esf:progress` - View current sprints
- `/esf:debug` - Diagnose sprint structure issues

## When NOT to Use

Don't use if:
- Sprint numbering is already correct
- You want to manually control sprint numbers
- Currently executing a sprint (finish or pause first)

## Files Modified

- `.planning/sprints/NN-name/` - Multiple directories renamed
- `.planning/PROJECT-PLAN.md` - Sprint numbers updated
- `.planning/sprints/*/PLAN.md` - File names and content updated
- `.planning/use-cases/` - Sprint assignments updated (if applicable)

## Files Created

- `.planning/.backup-[timestamp]/` - Backup before renumbering

## Implementation Details

This command should:

1. **Scan sprints directory** - Get list of all sprint directories
2. **Detect issues** - Find gaps, duplicates, out-of-order numbering
3. **Calculate correct numbering** - Assign sequential numbers 01, 02, 03...
4. **Create renaming plan** - Map old → new numbers
5. **Use two-step rename** - temp names first to avoid collisions
6. **Update all references** - PROJECT-PLAN.md, plan files, use cases
7. **Verify consistency** - Check final state is correct

The implementation must:
- **Avoid collisions:** Use temporary names during renaming
- **Be atomic:** Roll back if any step fails
- **Update all references:** Don't leave broken references
- **Be idempotent:** Running multiple times should be safe
- **Preserve data:** Never delete anything
