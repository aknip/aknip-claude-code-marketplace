---
description: List, filter, and manage TODO items
---

## Purpose

List, filter, and manage TODO items. Mark TODOs as complete, view by sprint or priority, and track progress on follow-up work.

## When to Use

- Review pending TODOs before starting work
- Check what needs to be done for specific sprint
- Mark completed TODOs
- Plan next actions based on TODO list
- Weekly/daily review of outstanding items

## Prerequisites

- At least one TODO exists (from `/esf:add-todo`)

## Usage

```bash
/esf:check-todos [--sprint N] [--priority high|medium|low] [--done ID] [--all] [--tag "label"]
```

### Flags

- `--sprint N`: Show TODOs for specific sprint only
- `--priority X`: Filter by priority (high/medium/low)
- `--done ID`: Mark TODO as complete
- `--all`: Show completed TODOs too (default: only pending)
- `--tag "label"`: Filter by tag

## What This Command Does

### Default (No Flags)

Shows all pending TODOs:
- Grouped by sprint
- Sorted by priority (high → medium → low)
- Shows ID, priority, text, tags

### With Filters

Filters TODOs by sprint, priority, or tag.

### With --done

Marks TODO as complete:
- Updates checkbox: `- [ ]` → `- [x]`
- Adds completion timestamp
- Moves to "Completed" section

## Output Example (Default)

```bash
/esf:check-todos
```

```
📋 TODO List

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 8 pending, 3 completed

By Priority:
   🔴 High: 4
   🟡 Medium: 3
   🔵 Low: 1

By Sprint:
   Sprint 02: 3 TODOs
   Unassigned: 5 TODOs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT 02: user-authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 TODO-20260127-001 [HIGH] #refactor
   Review error handling patterns
   Added: 2026-01-27 16:45 (2 hours ago)

🔴 TODO-20260127-006 [HIGH] #refactor
   Refactor auth service:
   - Extract validation logic
   - Add unit tests
   - Improve error messages
   Added: 2026-01-27 17:02 (1 hour ago)

🟡 TODO-20260127-002 [MEDIUM]
   Add German translations for error messages
   Added: 2026-01-27 16:50 (2 hours ago)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNASSIGNED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 TODO-20260127-003 [HIGH] #devops
   Setup CI/CD pipeline
   Added: 2026-01-27 16:55 (1 hour ago)

🔴 TODO-20260127-007 [HIGH] #security #urgent
   Security audit
   Added: 2026-01-27 17:05 (1 hour ago)

🟡 TODO-20260127-008 [MEDIUM] #performance
   Review database indexes for performance
   Added: 2026-01-27 17:10 (50 minutes ago)

🟡 TODO-20260127-005 [MEDIUM]
   Fix typo in login form
   Added: 2026-01-27 17:00 (1 hour ago)

🔵 TODO-20260127-004 [LOW] #docs
   Write API documentation
   Added: 2026-01-27 16:55 (1 hour ago)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
   /esf:check-todos --done TODO-ID    Mark complete
   /esf:check-todos --sprint 2         Filter by sprint
   /esf:check-todos --priority high   Filter by priority
   /esf:check-todos --all             Show completed
   /esf:add-todo "text"               Add new TODO
```

## Filter by Sprint

```bash
/esf:check-todos --sprint 2
```

```
📋 TODO List - Sprint 02

Sprint: 02-user-authentication
Pending: 3 TODOs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 TODO-20260127-001 [HIGH] #refactor
   Review error handling patterns

🔴 TODO-20260127-006 [HIGH] #refactor
   Refactor auth service:
   - Extract validation logic
   - Add unit tests
   - Improve error messages

🟡 TODO-20260127-002 [MEDIUM]
   Add German translations for error messages

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3 TODOs in sprint 02

Mark complete: /esf:check-todos --done TODO-ID
```

## Filter by Priority

```bash
/esf:check-todos --priority high
```

```
📋 TODO List - High Priority

Showing: 🔴 High priority only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRINT 02: user-authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 TODO-20260127-001 Review error handling patterns #refactor
🔴 TODO-20260127-006 Refactor auth service #refactor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNASSIGNED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 TODO-20260127-003 Setup CI/CD pipeline #devops
🔴 TODO-20260127-007 Security audit #security #urgent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4 high priority TODOs
```

## Filter by Tag

```bash
/esf:check-todos --tag refactor
```

```
📋 TODO List - Tag: #refactor

Showing: TODOs tagged with "refactor"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 TODO-20260127-001 [HIGH] Review error handling patterns
   Sprint: 02-user-authentication

🔴 TODO-20260127-006 [HIGH] Refactor auth service
   Sprint: 02-user-authentication

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2 TODOs with tag #refactor
```

## Mark TODO Complete

```bash
/esf:check-todos --done TODO-20260127-001
```

```
✅ Marking TODO Complete

ID: TODO-20260127-001
Text: Review error handling patterns
Sprint: 02-user-authentication
Priority: high

Completed: 2026-01-27 18:30

✅ TODO marked complete
✅ Moved to completed section
✅ PROJECT-STATUS.md updated (7 pending, 4 completed)

Remaining in Sprint 02: 2 TODOs
View: /esf:check-todos --sprint 2
```

## Show All (Including Completed)

```bash
/esf:check-todos --all
```

```
📋 TODO List (All)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PENDING (7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... pending TODOs ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETED (4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ TODO-20260127-001 [HIGH] Review error handling patterns
   Sprint: 02-user-authentication
   Added: 2026-01-27 16:45
   Completed: 2026-01-27 18:30 (1 hour 45 min)

✅ TODO-20260125-001 [MEDIUM] Setup project structure
   Completed: 2026-01-25 15:30

✅ TODO-20260126-002 [LOW] Initialize git repository
   Completed: 2026-01-26 09:20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 7 pending, 4 completed (36% completion rate)
```

## No TODOs

```bash
/esf:check-todos
```

```
ℹ️  No TODOs

No pending TODOs found.

Great! All tasks completed or none added yet.

Add a TODO:
   /esf:add-todo "text"

View completed TODOs:
   /esf:check-todos --all
```

## No TODOs for Filter

```bash
/esf:check-todos --sprint 5
```

```
ℹ️  No TODOs in Sprint 05

Sprint 05-deployment has no pending TODOs.

View all TODOs:
   /esf:check-todos

Add TODO for this sprint:
   /esf:add-todo "text" --sprint 5
```

## Invalid TODO ID

```bash
/esf:check-todos --done TODO-99999-999
```

```
❌ TODO Not Found

TODO ID "TODO-99999-999" does not exist.

View all TODOs:
   /esf:check-todos

List all TODO IDs:
   grep "TODO-" .planning/TODO.md
```

## Multiple Completion

```bash
/esf:check-todos --done TODO-20260127-001 --done TODO-20260127-002
```

```
✅ Marking Multiple TODOs Complete

1. TODO-20260127-001: Review error handling patterns ✅
2. TODO-20260127-002: Add German translations ✅

✅ 2 TODOs marked complete
✅ PROJECT-STATUS.md updated (5 pending, 6 completed)
```

## Summary Statistics

At bottom of output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total TODOs: 11 (7 pending, 4 completed)
Completion Rate: 36%

By Sprint:
   Sprint 02: 2 pending, 1 completed
   Unassigned: 5 pending, 3 completed

By Priority (pending):
   🔴 High: 4 (57%)
   🟡 Medium: 2 (29%)
   🔵 Low: 1 (14%)

Oldest Pending: TODO-20260127-003 (3 days old)
```

## Export to File

```bash
/esf:check-todos --output todos.txt
```

```
✅ TODOs Exported

File: todos.txt
Format: Plain text
TODOs: 7 pending

View file: cat todos.txt
```

## Combined Filters

```bash
/esf:check-todos --sprint 2 --priority high
```

```
📋 TODO List - Sprint 02, High Priority

Filters: Sprint 02 + High Priority

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 TODO-20260127-001 Review error handling patterns #refactor
🔴 TODO-20260127-006 Refactor auth service #refactor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2 TODOs matching filters
```

## Related Commands

- `/esf:add-todo` - Add new TODO
- `/esf:progress` - View overall project progress (includes TODO count)
- `/esf:debug` - Diagnostic checks (can validate TODO.md format)

## Files Read

- `.planning/TODO.md` - TODO list

## Files Modified

- `.planning/TODO.md` - When marking TODOs complete (--done flag)
- `.planning/PROJECT-STATUS.md` - TODO counter updated

## Integration with Workflow

TODOs appear in sprint planning:

```
/esf:plan-sprint 2

[Agent loads context]

⚠️  Sprint 02 has 3 pending TODOs:
   - TODO-20260127-001: Review error handling patterns
   - TODO-20260127-002: Add German translations
   - TODO-20260127-006: Refactor auth service

Should these be addressed in this sprint? (y/n)
```

## Implementation Details

This command should:

1. **Load TODO.md** - Parse TODO list
2. **Apply filters** - Sprint, priority, tag, all/pending
3. **Format output** - Group by sprint, sort by priority
4. **Calculate statistics** - Counts, percentages, age
5. **Mark complete** - If --done flag, update checkboxes and timestamps
6. **Update PROJECT-STATUS.md** - Sync TODO counter

The implementation should:
- **Be fast** - Display in < 1 second even with 100+ TODOs
- **Be flexible** - Support multiple filter combinations
- **Be informative** - Show context (time ago, sprint name, etc.)
- **Handle edge cases** - Empty lists, invalid IDs, missing TODO.md
- **Preserve format** - Don't corrupt TODO.md structure
