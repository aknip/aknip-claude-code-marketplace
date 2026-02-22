---
description: Add persistent TODO items to track tasks across sessions
---

## Purpose

Add persistent TODO items to track tasks, reminders, and follow-up work across sessions. Integrates with phase tracking for better organization.

## When to Use

- Discovered tech debt during implementation
- Remembered something to do later
- Notes from code review
- Follow-up tasks after phase completion
- Questions to answer before next phase
- Refactoring ideas

## Prerequisites

None - can add TODOs anytime

## Usage

```bash
/esf:add-todo [text] [--phase N] [--priority high|medium|low] [--tag "label"]
```

### Arguments

- `text`: TODO description (required, can be in quotes or plain)

### Flags

- `--phase N`: Associate with specific phase
- `--priority high|medium|low`: Priority level (default: medium)
- `--tag "label"`: Tag for categorization (e.g., "refactor", "security", "testing")

## What This Command Does

### 1. Generate Unique ID

Creates timestamp-based ID:
```
TODO-20260127-001
```

### 2. Capture TODO Details

Records:
- Text description
- Priority (high/medium/low)
- Phase assignment (if provided)
- Tag(s) for categorization
- Creation timestamp
- Creator (if multi-user project)

### 3. Update TODO.md

Appends to `.planning/TODO.md`:
```markdown
- [ ] #TODO-20260127-001 [HIGH] Review error handling patterns (Phase 02) #refactor
```

### 4. Update STATE.md

Increments TODO counter in STATE.md header:
```markdown
**TODOs:** 5 pending
```

## Output Example

```bash
/esf:add-todo "Review error handling patterns" --phase 2 --priority high --tag "refactor"
```

```
✅ TODO Added

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TODO DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ID: TODO-20260127-001
Priority: high 🔴
Phase: 02-user-authentication
Tag: refactor
Text: Review error handling patterns
Created: 2026-01-27 16:45

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Added to: .planning/TODO.md

View all TODOs:
   /esf:check-todos

View phase TODOs:
   /esf:check-todos --phase 2
```

## Multiple TODOs at Once

```bash
/esf:add-todo "Add German translations for error messages" --phase 2 --priority medium
/esf:add-todo "Setup CI/CD pipeline" --priority high --tag "devops"
/esf:add-todo "Write API documentation" --priority low --tag "docs"
```

```
✅ 3 TODOs Added

TODO-20260127-002 [MEDIUM] Add German translations (Phase 02)
TODO-20260127-003 [HIGH] Setup CI/CD pipeline
TODO-20260127-004 [LOW] Write API documentation

View: /esf:check-todos
```

## Quick TODO (Minimal Flags)

```bash
/esf:add-todo "Fix typo in login form"
```

```
✅ TODO Added

ID: TODO-20260127-005
Priority: medium (default)
Phase: Unassigned
Text: Fix typo in login form

Added to: .planning/TODO.md
```

## Multi-Line TODO

```bash
/esf:add-todo "Refactor auth service:
- Extract validation logic
- Add unit tests
- Improve error messages" --phase 2 --priority high
```

```
✅ TODO Added

ID: TODO-20260127-006
Priority: high 🔴
Phase: 02-user-authentication
Text: Refactor auth service:
      - Extract validation logic
      - Add unit tests
      - Improve error messages

Note: Multi-line TODO created.

Added to: .planning/TODO.md
```

## Multiple Tags

```bash
/esf:add-todo "Security audit" --priority high --tag "security" --tag "urgent"
```

```
✅ TODO Added

ID: TODO-20260127-007
Priority: high 🔴
Tags: security, urgent
Text: Security audit

Added to: .planning/TODO.md
```

## Interactive Mode

If no text provided:

```bash
/esf:add-todo
```

```
➕ Add TODO

Enter TODO text (or Ctrl+C to cancel):
> Review database indexes for performance

Priority? [high/medium/low] (default: medium):
> high

Assign to phase? [1-3 or Enter to skip]:
> 2

Add tag? (Enter to skip):
> performance

✅ TODO Added

ID: TODO-20260127-008
Priority: high 🔴
Phase: 02-user-authentication
Tag: performance
Text: Review database indexes for performance

Added to: .planning/TODO.md
```

## TODO ID Collision

Extremely rare, but handled:

```
⚠️  ID Collision

TODO-20260127-001 already exists.
Using next available ID: TODO-20260127-002

✅ TODO Added with ID: TODO-20260127-002
```

## Invalid Phase

```bash
/esf:add-todo "Task" --phase 99
```

```
⚠️  Phase Not Found

Phase 99 does not exist.
Current phases: 01-03

Options:
   1. Add as unassigned: /esf:add-todo "Task"
   2. Assign to existing phase: /esf:add-todo "Task" --phase [1-3]
   3. Cancel

What would you like to do? [1/2/3]:
```

## TODO.md Structure

`.planning/TODO.md`:

```markdown
# TODO List

**Total:** 8 pending, 3 completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Pending

### Phase 02: user-authentication

#### High Priority 🔴

- [ ] #TODO-20260127-001 Review error handling patterns #refactor
  Added: 2026-01-27 16:45

- [ ] #TODO-20260127-006 Refactor auth service: #refactor
  - Extract validation logic
  - Add unit tests
  - Improve error messages
  Added: 2026-01-27 17:02

#### Medium Priority 🟡

- [ ] #TODO-20260127-002 Add German translations for error messages
  Added: 2026-01-27 16:50

### Unassigned

#### High Priority 🔴

- [ ] #TODO-20260127-003 Setup CI/CD pipeline #devops
  Added: 2026-01-27 16:55

- [ ] #TODO-20260127-007 Security audit #security #urgent
  Added: 2026-01-27 17:05

#### Low Priority 🔵

- [ ] #TODO-20260127-004 Write API documentation #docs
  Added: 2026-01-27 16:55

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Completed

- [x] #TODO-20260125-001 Setup project structure
  Added: 2026-01-25 10:00
  Completed: 2026-01-25 15:30

- [x] #TODO-20260126-002 Initialize git repository
  Added: 2026-01-26 09:15
  Completed: 2026-01-26 09:20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Legend:**
- 🔴 High Priority
- 🟡 Medium Priority
- 🔵 Low Priority
```

## Priority Emojis

- **High:** 🔴 (red circle)
- **Medium:** 🟡 (yellow circle)
- **Low:** 🔵 (blue circle)

## Related Commands

- `/esf:check-todos` - List and manage TODOs
- `/esf:check-todos --done TODO-ID` - Mark TODO complete
- `/esf:progress` - View overall progress (includes TODO count)

## Files Modified

- `.planning/TODO.md` - TODO appended
- `.planning/STATE.md` - TODO counter updated

## Files Created

- `.planning/TODO.md` - Created if doesn't exist (first TODO)

## Integration with Phases

TODOs assigned to phases appear in phase context:

```bash
/esf:plan-phase 2
```

Agent sees:
```
Phase 02 has 3 pending TODOs:
- TODO-20260127-001: Review error handling patterns
- TODO-20260127-002: Add German translations
- TODO-20260127-006: Refactor auth service
```

## Implementation Details

This command should:

1. **Parse arguments** - Extract text, flags
2. **Generate ID** - Timestamp-based, ensure unique
3. **Validate phase** - Check phase exists if --phase provided
4. **Format TODO** - Create markdown checkbox entry
5. **Update TODO.md** - Append in correct section (pending, by phase, by priority)
6. **Update STATE.md** - Increment TODO counter
7. **Display confirmation** - Show ID and details

The implementation should:
- **Be fast** - Complete in < 1 second
- **Handle multi-line** - Support newlines in TODO text
- **Sort intelligently** - High priority first, then medium, then low
- **Group by phase** - Keep phase TODOs together
- **Preserve formatting** - Maintain TODO.md structure
