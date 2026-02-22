# Command: /uc:insert-phase

## Purpose

Insert a phase at a specific position in the roadmap, automatically renumbering all subsequent phases. Use this for urgent work that needs to be inserted in the middle of planned phases.

## When to Use

- Need to insert urgent work before planned phases
- Discovered missing phase that should come before existing ones
- Restructuring roadmap to change phase order

## Difference from /uc:add-phase

- **`/uc:add-phase --after N`**: Inserts at position N+1 (after phase N)
- **`/uc:insert-phase --at N`**: Inserts at position N (pushing current N to N+1)

## Prerequisites

- Project initialized with `/uc:new-project`
- ROADMAP.md exists
- Phases exist to renumber

## Usage

```bash
/uc:insert-phase [name] --at N [--description "text"] [--force]
```

### Arguments

- `name`: Phase name (lowercase with hyphens)

### Flags

- `--at N`: **Required.** Position to insert (existing phase N becomes N+1)
- `--description "text"`: Brief description of phase goals
- `--force`: Skip safety checks for active work

## What This Command Does

### 1. Validation

Checks prerequisites:
- Position N is valid (not inserting at 0 or beyond current phases)
- Phase N currently exists
- Name is valid and unique
- No active work on phases that will be renumbered (unless `--force`)

### 2. Backup Current State

Creates backup before renumbering:
```
.planning/.backup-[timestamp]/phases/
```

### 3. Renumber Phases

Renumbers all phases >= N:

```
Phase N   → Phase N+1
Phase N+1 → Phase N+2
Phase N+2 → Phase N+3
...
```

**Operations:**
- Rename directories
- Update ROADMAP.md
- Update phase references in PLAN files
- Update use case phase assignments (if any)

### 4. Create New Phase

Creates new phase at position N:

```
.planning/phases/NN-phase-name/
```

### 5. Update Documentation

Updates all references:
- ROADMAP.md (phase ordering)
- STATE.md (recent activity)
- Use case index (if phases assigned)

## Output Example

```bash
/uc:insert-phase urgent-security-fix --at 2 --description "Critical security vulnerability fixes"
```

```
🔄 Inserting Phase at Position 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Position valid: 2 (between 1 and 5)
✅ Phase name valid: urgent-security-fix
✅ No active work on phases 2-5
✅ Ready to insert

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPACT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phases to renumber:
   02-user-authentication → 03-user-authentication
   03-user-profile        → 04-user-profile
   04-api-integration     → 05-api-integration
   05-notifications       → 06-notifications

New phase will be:
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

📝 Updating ROADMAP.md:
   ✅ Phase numbers updated

📝 Updating plan file references:
   ✅ 03-user-authentication/03-01-PLAN.md updated
   ✅ 04-user-profile/04-01-PLAN.md updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING NEW PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created: .planning/phases/02-urgent-security-fix/
✅ Added to ROADMAP.md
✅ Updated STATE.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All phases numbered correctly (01-06)
✅ No gaps in numbering
✅ ROADMAP.md consistent
✅ Backup can be removed: .planning/.backup-20260127-153045/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Phase Inserted Successfully

New Phase: 02-urgent-security-fix
Phases Renumbered: 4 phases (02→03, 03→04, 04→05, 05→06)

⚠️  Important Notes:
   - Phase numbers have changed
   - Update any external references or bookmarks
   - Previous phase 2 is now phase 3
   - Previous phase 3 is now phase 4
   - And so on...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Define approach for new phase:
   /uc:discuss-phase 2

2. Create execution plans:
   /uc:plan-phase 2

3. View updated roadmap:
   /uc:progress

4. Remove backup once verified:
   rm -rf .planning/.backup-20260127-153045/
```

## Active Work Warning

If currently working on a phase that will be renumbered:

```
⚠️  Active Work Detected

Currently executing: Phase 03 (user-profile)

Inserting phase at position 2 will renumber active phase:
   Phase 03: user-profile → Phase 04: user-profile

This means:
   - Current work continues in renamed directory
   - You'll need to use new phase number (4 instead of 3)
   - Any scripts/notes referencing phase 3 need updating

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Options:
   1. Continue with insertion (--force flag)
   2. Cancel and finish current phase first
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
✅ Phases returned to original numbering
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
/uc:insert-phase project-setup --at 1 --description "Initial setup and configuration"
```

Pushes all phases down by 1:
```
01-foundation        → 02-foundation
02-authentication    → 03-authentication
03-profile           → 04-profile
```

New phase becomes 01-project-setup.

## Insert at End

For inserting at the end, use `/uc:add-phase` instead (simpler, no renumbering):

```bash
# Don't do this:
/uc:insert-phase new-feature --at 6  # (if 5 phases exist)

# Do this instead:
/uc:add-phase new-feature
```

## Error Handling

**Invalid position:**

```
❌ Cannot Insert Phase

Position 7 is invalid.
Current phases: 01-05 (5 phases total)

Valid positions:
   --at 1  (before all phases)
   --at 2  (between phases 1 and 2)
   --at 3  (between phases 2 and 3)
   --at 4  (between phases 3 and 4)
   --at 5  (between phases 4 and 5)

To add at end, use:
   /uc:add-phase [name]
```

**Phase name conflict:**

```
❌ Cannot Insert Phase

Phase name "user-authentication" already exists as phase 02.

Options:
   1. Use different name
   2. Remove existing phase: /uc:remove-phase 2
```

## Comparison: insert-phase vs add-phase

```bash
# Scenario: Have phases 01, 02, 03

/uc:add-phase urgent-fix --after 1
# Creates phase 02-urgent-fix
# Renumbers: 02→03, 03→04

/uc:insert-phase urgent-fix --at 2
# Creates phase 02-urgent-fix
# Renumbers: 02→03, 03→04
# (Same result in this case)

/uc:insert-phase urgent-fix --at 1
# Creates phase 01-urgent-fix
# Renumbers: 01→02, 02→03, 03→04
# (Can't do this with add-phase)
```

## Impact on Plans and Use Cases

**Plan Files:**
- Plan file names updated (03-01-PLAN.md → 04-01-PLAN.md)
- Internal references updated (phase 3 → phase 4)

**Use Cases:**
- Phase assignments updated in use case documents
- Traceability preserved

**Verification:**
- Verification file names updated
- References updated

## Related Commands

- `/uc:add-phase [name] --after N` - Simpler alternative (inserts after N)
- `/uc:remove-phase N` - Remove a phase
- `/uc:renumber-phases` - Fix numbering manually if needed
- `/uc:progress` - View updated roadmap

## Files Modified

- `.planning/phases/` - Multiple directories renamed
- `.planning/ROADMAP.md` - Phase numbers and order updated
- `.planning/STATE.md` - Recent activity logged
- `.planning/phases/*/PLAN.md` - Internal references updated (if exist)
- `.planning/use-cases/*/UC-*.md` - Phase assignments updated (if exist)

## Files Created

- `.planning/phases/NN-name/` - New phase directory
- `.planning/.backup-[timestamp]/` - Backup of phases before renumbering

## Implementation Details

This command should:

1. **Validate position and name**
2. **Check for active work** (warn if renumbering active phase)
3. **Create backup** of phases directory
4. **Renumber in reverse order** (highest to lowest)
   - Rename directories: `NN-name → N+1-name`
   - Update ROADMAP.md phase numbers
   - Update plan file names: `NN-01-PLAN.md → N+1-01-PLAN.md`
   - Update internal references in plan files
   - Update use case phase assignments
5. **Create new phase** at position N
6. **Verify consistency** (no gaps, all files updated)
7. **Offer to remove backup** if successful

The implementation must:
- **Be atomic:** Roll back completely if any step fails
- **Preserve data:** Never delete anything during renumbering
- **Update references:** Find and update all phase number references
- **Be careful with filesystem:** Rename in correct order to avoid collisions
