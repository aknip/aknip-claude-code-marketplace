---
description: Add a new sprint to the roadmap
---

## Purpose

Add a new sprint to the roadmap at the end or after a specified sprint. Automatically handles sprint numbering and creates the necessary directory structure.

## When to Use

- Adding new sprints to current milestone
- Expanding roadmap with additional work
- Planning next sprint after current sprint completes

## Prerequisites

- Project initialized with `/esf:new-project`
- PROJECT-PLAN.md exists

## Usage

```bash
/esf:add-sprint [name] [--after N] [--description "text"]
```

### Arguments

- `name`: Sprint name (lowercase with hyphens, e.g., "user-authentication")

### Flags

- `--after N`: Insert after sprint N (default: add at end)
- `--description "text"`: Brief description of sprint goals

## What This Command Does

### 1. Validate Sprint Name

Checks sprint name format:
- Lowercase letters, numbers, hyphens only
- No spaces (converts to hyphens)
- Meaningful name (not generic like "phase1")

### 2. Determine Sprint Number

Calculates next sprint number:
- Default: Next sequential number (01, 02, 03...)
- With `--after N`: Position N+1

### 3. Check for Conflicts

Ensures no conflicts:
- Sprint number doesn't already exist
- Sprint name not already used
- If inserting, validates N exists

### 4. Create Sprint Directory

Creates directory structure:

```
.planning/sprints/NN-sprint-name/
```

### 5. Update PROJECT-PLAN.md

Adds sprint to roadmap:

```markdown
## Sprint NN: Sprint Name

**Status:** Pending
**Description:** [Description if provided]
**Use Cases:** [To be planned]

### Plans

[No plans yet - use /esf:plan-sprint NN]
```

### 6. Update PROJECT-STATUS.md

Notes sprint addition in recent activity:

```markdown
## Recent Activity

2026-01-27: Added Sprint 04: payment-integration
```

## Output Example (Add at End)

```bash
/esf:add-sprint user-notifications --description "Email and push notification system"
```

```
➕ Adding Sprint

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Number: 04
Name: user-notifications
Description: Email and push notification system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created directory: .planning/sprints/04-user-notifications/
✅ Updated PROJECT-PLAN.md
✅ Updated PROJECT-STATUS.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Discuss implementation approach:
   /esf:discuss-sprint 4

2. Create execution plans:
   /esf:plan-sprint 4

3. View roadmap:
   /esf:progress

✅ Sprint 04 added successfully
```

## Output Example (Insert After)

```bash
/esf:add-sprint security-hardening --after 2 --description "Security audit and improvements"
```

```
➕ Adding Sprint After Existing Sprint

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERTION POINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After: Sprint 02 (user-authentication)
New Sprint: 03
Name: security-hardening
Description: Security audit and improvements

⚠️  Note: Existing sprints will be renumbered:
   Sprint 03 → Sprint 04
   Sprint 04 → Sprint 05

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENUMBERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Renaming directories:
   ✅ 03-user-profile → 04-user-profile
   ✅ 04-api-integration → 05-api-integration

📝 Updating PROJECT-PLAN.md references...
   ✅ Sprint numbers updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING NEW SPRINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created directory: .planning/sprints/03-security-hardening/
✅ Inserted into PROJECT-PLAN.md
✅ Updated PROJECT-STATUS.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Discuss implementation approach:
   /esf:discuss-sprint 3

2. Create execution plans:
   /esf:plan-sprint 3

⚠️  Important: Sprint numbers changed. Review any external references.

✅ Sprint 03 inserted successfully
```

## Adding Multiple Sprints

Add multiple sprints in sequence:

```bash
/esf:add-sprint payment-integration
/esf:add-sprint subscription-management
/esf:add-sprint billing-history
```

Creates sprints 04, 05, 06.

## Name Validation

Automatic name cleanup:

```bash
/esf:add-sprint "User Notifications"
# Converts to: user-notifications

/esf:add-sprint "API_Integration"
# Converts to: api-integration
```

Invalid names:

```
❌ Cannot Add Sprint

Sprint name invalid: "123"
Reason: Must contain letters (not just numbers)

Sprint name invalid: "ph@se"
Reason: Special characters not allowed (use hyphens only)

Valid examples:
   user-authentication
   api-integration
   payment-processing
```

## Error Handling

If sprint number already exists (rare):

```
❌ Cannot Add Sprint

Sprint 04 already exists: 04-existing-sprint
Options:
   1. Remove existing sprint: /esf:remove-sprint 4
   2. Insert before: /esf:insert-sprint [name] --at 4
   3. Add after: /esf:add-sprint [name] --after 4
```

If inserting after non-existent sprint:

```
❌ Cannot Add Sprint

Sprint 5 does not exist (current sprints: 1-3)
Options:
   1. Add at end: /esf:add-sprint [name]
   2. Insert after sprint 3: /esf:add-sprint [name] --after 3
```

## Renumbering Behavior

When using `--after N` with existing sprints:

**Automatic Renumbering:**
- Moves directory (03-name → 04-name)
- Updates PROJECT-PLAN.md references
- Preserves all files within directories
- Updates sprint numbers in plan files (if any)

**Safe Operation:**
- Creates backup before renumbering
- Validates success after operation
- Rolls back if any errors

## Impact on Current Work

⚠️ **If actively working on a sprint:**

```
⚠️  Active Work Detected

Currently executing: Sprint 03 (user-profile)

Adding sprint after sprint 2 would renumber active sprint:
   Sprint 03 → Sprint 04

Options:
   1. Continue anyway (update your commands to use new number)
   2. Add at end instead: /esf:add-sprint [name]
   3. Wait until current sprint complete

Proceed with renumbering? (y/n):
```

## Related Commands

- `/esf:insert-sprint [name] --at N` - Insert at specific position (not after)
- `/esf:remove-sprint N` - Remove a sprint
- `/esf:discuss-sprint N` - Define implementation approach
- `/esf:plan-sprint N` - Create execution plans
- `/esf:progress` - View all sprints

## Files Modified

- `.planning/sprints/` - New directory created
- `.planning/PROJECT-PLAN.md` - Sprint added
- `.planning/PROJECT-STATUS.md` - Recent activity updated

If renumbering occurs:
- `.planning/sprints/NN-*` - Directories renamed
- `.planning/PROJECT-PLAN.md` - Sprint numbers updated

## Implementation Details

This command should:

1. **Validate name:** Convert to lowercase-with-hyphens format
2. **Determine position:** Calculate next number or use `--after N + 1`
3. **Check conflicts:** Ensure number and name are unique
4. **Handle renumbering:** If inserting, renumber subsequent sprints
5. **Create directory:** `mkdir .planning/sprints/NN-name`
6. **Update PROJECT-PLAN.md:** Add sprint entry in correct position
7. **Update PROJECT-STATUS.md:** Log addition in recent activity
8. **Warn about active work:** If current sprint would be renumbered

The implementation should:
- **Be safe:** Check for active work before renumbering
- **Be atomic:** If renumbering fails, roll back
- **Be clear:** Explain what's happening, especially when renumbering
- **Validate inputs:** Ensure sprint name is valid and meaningful
