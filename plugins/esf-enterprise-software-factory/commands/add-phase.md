# Command: /esf:add-phase

## Purpose

Add a new phase to the roadmap at the end or after a specified phase. Automatically handles phase numbering and creates the necessary directory structure.

## When to Use

- Adding new phases to current milestone
- Expanding roadmap with additional work
- Planning next phase after current phase completes

## Prerequisites

- Project initialized with `/esf:new-project`
- ROADMAP.md exists

## Usage

```bash
/esf:add-phase [name] [--after N] [--description "text"]
```

### Arguments

- `name`: Phase name (lowercase with hyphens, e.g., "user-authentication")

### Flags

- `--after N`: Insert after phase N (default: add at end)
- `--description "text"`: Brief description of phase goals

## What This Command Does

### 1. Validate Phase Name

Checks phase name format:
- Lowercase letters, numbers, hyphens only
- No spaces (converts to hyphens)
- Meaningful name (not generic like "phase1")

### 2. Determine Phase Number

Calculates next phase number:
- Default: Next sequential number (01, 02, 03...)
- With `--after N`: Position N+1

### 3. Check for Conflicts

Ensures no conflicts:
- Phase number doesn't already exist
- Phase name not already used
- If inserting, validates N exists

### 4. Create Phase Directory

Creates directory structure:

```
.planning/phases/NN-phase-name/
```

### 5. Update ROADMAP.md

Adds phase to roadmap:

```markdown
## Phase NN: Phase Name

**Status:** Pending
**Description:** [Description if provided]
**Use Cases:** [To be planned]

### Plans

[No plans yet - use /esf:plan-phase NN]
```

### 6. Update STATE.md

Notes phase addition in recent activity:

```markdown
## Recent Activity

2026-01-27: Added Phase 04: payment-integration
```

## Output Example (Add at End)

```bash
/esf:add-phase user-notifications --description "Email and push notification system"
```

```
➕ Adding Phase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Number: 04
Name: user-notifications
Description: Email and push notification system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created directory: .planning/phases/04-user-notifications/
✅ Updated ROADMAP.md
✅ Updated STATE.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Discuss implementation approach:
   /esf:discuss-phase 4

2. Create execution plans:
   /esf:plan-phase 4

3. View roadmap:
   /esf:progress

✅ Phase 04 added successfully
```

## Output Example (Insert After)

```bash
/esf:add-phase security-hardening --after 2 --description "Security audit and improvements"
```

```
➕ Adding Phase After Existing Phase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERTION POINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After: Phase 02 (user-authentication)
New Phase: 03
Name: security-hardening
Description: Security audit and improvements

⚠️  Note: Existing phases will be renumbered:
   Phase 03 → Phase 04
   Phase 04 → Phase 05

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENUMBERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Renaming directories:
   ✅ 03-user-profile → 04-user-profile
   ✅ 04-api-integration → 05-api-integration

📝 Updating ROADMAP.md references...
   ✅ Phase numbers updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING NEW PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created directory: .planning/phases/03-security-hardening/
✅ Inserted into ROADMAP.md
✅ Updated STATE.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Discuss implementation approach:
   /esf:discuss-phase 3

2. Create execution plans:
   /esf:plan-phase 3

⚠️  Important: Phase numbers changed. Review any external references.

✅ Phase 03 inserted successfully
```

## Adding Multiple Phases

Add multiple phases in sequence:

```bash
/esf:add-phase payment-integration
/esf:add-phase subscription-management
/esf:add-phase billing-history
```

Creates phases 04, 05, 06.

## Name Validation

Automatic name cleanup:

```bash
/esf:add-phase "User Notifications"
# Converts to: user-notifications

/esf:add-phase "API_Integration"
# Converts to: api-integration
```

Invalid names:

```
❌ Cannot Add Phase

Phase name invalid: "123"
Reason: Must contain letters (not just numbers)

Phase name invalid: "ph@se"
Reason: Special characters not allowed (use hyphens only)

Valid examples:
   user-authentication
   api-integration
   payment-processing
```

## Error Handling

If phase number already exists (rare):

```
❌ Cannot Add Phase

Phase 04 already exists: 04-existing-phase
Options:
   1. Remove existing phase: /esf:remove-phase 4
   2. Insert before: /esf:insert-phase [name] --at 4
   3. Add after: /esf:add-phase [name] --after 4
```

If inserting after non-existent phase:

```
❌ Cannot Add Phase

Phase 5 does not exist (current phases: 1-3)
Options:
   1. Add at end: /esf:add-phase [name]
   2. Insert after phase 3: /esf:add-phase [name] --after 3
```

## Renumbering Behavior

When using `--after N` with existing phases:

**Automatic Renumbering:**
- Moves directory (03-name → 04-name)
- Updates ROADMAP.md references
- Preserves all files within directories
- Updates phase numbers in plan files (if any)

**Safe Operation:**
- Creates backup before renumbering
- Validates success after operation
- Rolls back if any errors

## Impact on Current Work

⚠️ **If actively working on a phase:**

```
⚠️  Active Work Detected

Currently executing: Phase 03 (user-profile)

Adding phase after phase 2 would renumber active phase:
   Phase 03 → Phase 04

Options:
   1. Continue anyway (update your commands to use new number)
   2. Add at end instead: /esf:add-phase [name]
   3. Wait until current phase complete

Proceed with renumbering? (y/n):
```

## Related Commands

- `/esf:insert-phase [name] --at N` - Insert at specific position (not after)
- `/esf:remove-phase N` - Remove a phase
- `/esf:discuss-phase N` - Define implementation approach
- `/esf:plan-phase N` - Create execution plans
- `/esf:progress` - View all phases

## Files Modified

- `.planning/phases/` - New directory created
- `.planning/ROADMAP.md` - Phase added
- `.planning/STATE.md` - Recent activity updated

If renumbering occurs:
- `.planning/phases/NN-*` - Directories renamed
- `.planning/ROADMAP.md` - Phase numbers updated

## Implementation Details

This command should:

1. **Validate name:** Convert to lowercase-with-hyphens format
2. **Determine position:** Calculate next number or use `--after N + 1`
3. **Check conflicts:** Ensure number and name are unique
4. **Handle renumbering:** If inserting, renumber subsequent phases
5. **Create directory:** `mkdir .planning/phases/NN-name`
6. **Update ROADMAP.md:** Add phase entry in correct position
7. **Update STATE.md:** Log addition in recent activity
8. **Warn about active work:** If current phase would be renumbered

The implementation should:
- **Be safe:** Check for active work before renumbering
- **Be atomic:** If renumbering fails, roll back
- **Be clear:** Explain what's happening, especially when renumbering
- **Validate inputs:** Ensure phase name is valid and meaningful
