---
description: Insert a sprint at a specific position in the roadmap
---

## Purpose

Insert a sprint at a specific position in the roadmap, automatically renumbering all subsequent sprints. Use this for urgent work that needs to be inserted in the middle of planned sprints.

## When to Use

- Need to insert urgent work before planned sprints
- Discovered missing sprint that should come before existing ones
- Restructuring roadmap to change sprint order

## Difference from /esf:add-sprint

- **`/esf:add-sprint --after N`**: Inserts at position N+1 (after sprint N)
- **`/esf:insert-sprint --at N`**: Inserts at position N (pushing current N to N+1)

## Prerequisites

- Project initialized with `/esf:new-project`
- PROJECT-PLAN.md exists
- Sprints exist to renumber

## Usage

```bash
/esf:insert-sprint [name] --at N [--description "text"] [--force]
```

### Arguments

- `name`: Sprint name (lowercase with hyphens)

### Flags

- `--at N`: **Required.** Position to insert (existing sprint N becomes N+1)
- `--description "text"`: Brief description of sprint goals
- `--force`: Skip safety checks for active work

## What This Command Does

### 1. Validation

Checks prerequisites:
- Position N is valid (not inserting at 0 or beyond current sprints)
- Sprint N currently exists
- Name is valid and unique
- No active work on sprints that will be renumbered (unless `--force`)

### 2. Backup Current State

Creates backup before renumbering:
```
.planning/.backup-[timestamp]/sprints/
```

### 3. Renumber Sprints

Renumbers all sprints >= N:

```
Sprint N   → Sprint N+1
Sprint N+1 → Sprint N+2
Sprint N+2 → Sprint N+3
...
```

**Operations:**
- Rename directories
- Update PROJECT-PLAN.md
- Update sprint references in PLAN files
- Update use case sprint assignments (if any)

### 4. Create New Sprint

Creates new sprint at position N:

```
.planning/sprints/NN-sprint-name/
```

### 5. Update Documentation

Updates all references:
- PROJECT-PLAN.md (sprint ordering)
- PROJECT-STATUS.md (recent activity)
- Use case index (if sprints assigned)

## Output Example

```bash
/esf:insert-sprint urgent-security-fix --at 2 --description "Critical security vulnerability fixes"
```

```
🔄 Inserting Sprint at Position 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Position valid: 2 (between 1 and 5)
✅ Sprint name valid: urgent-security-fix
✅ No active work on sprints 2-5
✅ Ready to insert

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPACT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sprints to renumber:
   02-user-authentication → 03-user-authentication
   03-user-profile        → 04-user-profile
   04-api-integration     → 05-api-integration
   05-notifications       → 06-notifications

New sprint will be:
   02-urgent-security-fix

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING BACKUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Backup created: .planning/.backup-20260127-153045/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENUMBERING PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Renaming directories (highest to lowest):
   ✅ 05-notifications     → 06-notifications
   ✅ 04-api-integration   → 05-api-integration
   ✅ 03-user-profile      → 04-user-profile
   ✅ 02-user-authentication → 03-user-authentication

📝 Updating PROJECT-PLAN.md:
   ✅ Sprint numbers updated

📝 Updating plan file references:
   ✅ 03-user-authentication/03-01-PLAN.md updated
   ✅ 04-user-profile/04-01-PLAN.md updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING NEW SPRINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created: .planning/sprints/02-urgent-security-fix/
✅ Added to PROJECT-PLAN.md
✅ Updated PROJECT-STATUS.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All sprints numbered correctly (01-06)
✅ No gaps in numbering
✅ PROJECT-PLAN.md consistent
✅ Backup can be removed: .planning/.backup-20260127-153045/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Sprint Inserted Successfully

New Sprint: 02-urgent-security-fix
Sprints Renumbered: 4 sprints (02→03, 03→04, 04→05, 05→06)

⚠️  Important Notes:
   - Sprint numbers have changed
   - Update any external references or bookmarks
   - Previous sprint 2 is now sprint 3
   - Previous sprint 3 is now sprint 4
   - And so on...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Define approach for new sprint:
   /esf:discuss-sprint 2

2. Create execution plans:
   /esf:plan-sprint 2

3. View updated roadmap:
   /esf:progress

4. Remove backup once verified:
   rm -rf .planning/.backup-20260127-153045/
```

## Active Work Warning

If currently working on a sprint that will be renumbered:

```
⚠️  Active Work Detected

Currently executing: Sprint 03 (user-profile)

Inserting sprint at position 2 will renumber active sprint:
   Sprint 03: user-profile → Sprint 04: user-profile

This means:
   - Current work continues in renamed directory
   - You'll need to use new sprint number (4 instead of 3)
   - Any scripts/notes referencing sprint 3 need updating

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Options:
   1. Continue with insertion (--force flag)
   2. Cancel and finish current sprint first
   3. Insert at different position

Proceed with insertion? (y/n):
```

## Rollback on Error

If renumbering fails mid-operation:

```
❌ Insertion Failed

Error during renumbering: Failed to rename 03-user-profile
Reason: Directory access denied

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLLING BACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Restored from backup
✅ Sprints returned to original numbering
✅ No changes made

Issue: Directory may be open in editor or terminal
Solution: Close directory, try again
```

## Renumbering Order

**Critical: Rename highest to lowest** to avoid collisions:

```
✅ Correct order:
   05 → 06 (safe, 06 doesn't exist yet)
   04 → 05 (safe, 05 was just renamed to 06)
   03 → 04 (safe, 04 was just renamed to 05)
   02 → 03 (safe, 03 was just renamed to 04)

❌ Wrong order (would fail):
   02 → 03 (error: 03 already exists!)
```

## Insert at Beginning

```bash
/esf:insert-sprint project-setup --at 1 --description "Initial setup and configuration"
```

Pushes all sprints down by 1:
```
01-foundation        → 02-foundation
02-authentication    → 03-authentication
03-profile           → 04-profile
```

New sprint becomes 01-project-setup.

## Insert at End

For inserting at the end, use `/esf:add-sprint` instead (simpler, no renumbering):

```bash
# Don't do this:
/esf:insert-sprint new-feature --at 6  # (if 5 sprints exist)

# Do this instead:
/esf:add-sprint new-feature
```

## Error Handling

**Invalid position:**

```
❌ Cannot Insert Sprint

Position 7 is invalid.
Current sprints: 01-05 (5 sprints total)

Valid positions:
   --at 1  (before all sprints)
   --at 2  (between sprints 1 and 2)
   --at 3  (between sprints 2 and 3)
   --at 4  (between sprints 3 and 4)
   --at 5  (between sprints 4 and 5)

To add at end, use:
   /esf:add-sprint [name]
```

**Sprint name conflict:**

```
❌ Cannot Insert Sprint

Sprint name "user-authentication" already exists as sprint 02.

Options:
   1. Use different name
   2. Remove existing sprint: /esf:remove-sprint 2
```

## Comparison: insert-sprint vs add-sprint

```bash
# Scenario: Have sprints 01, 02, 03

/esf:add-sprint urgent-fix --after 1
# Creates sprint 02-urgent-fix
# Renumbers: 02→03, 03→04

/esf:insert-sprint urgent-fix --at 2
# Creates sprint 02-urgent-fix
# Renumbers: 02→03, 03→04
# (Same result in this case)

/esf:insert-sprint urgent-fix --at 1
# Creates sprint 01-urgent-fix
# Renumbers: 01→02, 02→03, 03→04
# (Can't do this with add-sprint)
```

## Impact on Plans and Use Cases

**Plan Files:**
- Plan file names updated (03-01-PLAN.md → 04-01-PLAN.md)
- Internal references updated (sprint 3 → sprint 4)

**Use Cases:**
- Sprint assignments updated in use case documents
- Traceability preserved

**Verification:**
- Verification file names updated
- References updated

## Related Commands

- `/esf:add-sprint [name] --after N` - Simpler alternative (inserts after N)
- `/esf:remove-sprint N` - Remove a sprint
- `/esf:renumber-sprints` - Fix numbering manually if needed
- `/esf:progress` - View updated roadmap

## Files Modified

- `.planning/sprints/` - Multiple directories renamed
- `.planning/PROJECT-PLAN.md` - Sprint numbers and order updated
- `.planning/PROJECT-STATUS.md` - Recent activity logged
- `.planning/sprints/*/PLAN.md` - Internal references updated (if exist)
- `.planning/use-cases/*/UC-*.md` - Sprint assignments updated (if exist)

## Files Created

- `.planning/sprints/NN-name/` - New sprint directory
- `.planning/.backup-[timestamp]/` - Backup of sprints before renumbering

## Implementation Details

This command should:

1. **Validate position and name**
2. **Check for active work** (warn if renumbering active sprint)
3. **Create backup** of sprints directory
4. **Renumber in reverse order** (highest to lowest)
   - Rename directories: `NN-name → N+1-name`
   - Update PROJECT-PLAN.md sprint numbers
   - Update plan file names: `NN-01-PLAN.md → N+1-01-PLAN.md`
   - Update internal references in plan files
   - Update use case sprint assignments
5. **Create new sprint** at position N
6. **Verify consistency** (no gaps, all files updated)
7. **Offer to remove backup** if successful

The implementation must:
- **Be atomic:** Roll back completely if any step fails
- **Preserve data:** Never delete anything during renumbering
- **Update references:** Find and update all sprint number references
- **Be careful with filesystem:** Rename in correct order to avoid collisions
