---
description: Capture current work state for later resumption
---

## Purpose

Capture the current work state for later resumption. Saves context including current sprint, progress, git status, blockers, and next actions. Essential for multi-session projects.

## When to Use

- End of work day (need to resume tomorrow)
- Switching to different task/project
- Before major refactoring or risky changes
- System maintenance or restart needed
- Collaborating (handoff to another developer)

## Prerequisites

None - can pause at any time

## Usage

```bash
/esf:pause-work [--message "reason"] [--tag "label"]
```

### Flags

- `--message "reason"`: Explain why pausing (e.g., "end of day", "switching priorities")
- `--tag "label"`: Tag session for easy filtering (e.g., "before-refactor", "end-of-day")

## What This Command Does

### 1. Capture Work Context

Records current state:
- Current sprint and plan
- Current task/task (if executing)
- Model profile in use
- Working directory

### 2. Capture Progress

Documents completion status:
- Which use cases are complete
- Current task in progress
- Pending tasks
- Percentage complete

### 3. Check Git Status

Captures git state:
- Current branch
- Last commit
- Uncommitted changes
- Untracked files
- Unpushed commits

### 4. Capture Blockers/Questions

Prompts for (optional):
- Any blockers preventing progress
- Open questions needing answers
- Issues encountered

### 5. Document Next Actions

Records what to do next:
- Immediate next step
- Sequence of remaining tasks
- Recommended commands

### 6. Generate Session File

Creates detailed session state:

```
.planning/sessions/YYYY-MM-DD_HHMMSS_pause.md
```

### 7. Update PROJECT-STATUS.md

Marks project as paused:

```markdown
**Status:** PAUSED (2026-01-27 16:30)
**Session:** 20260127_163045
```

## Output Example

```bash
/esf:pause-work --message "End of day" --tag "eod"
```

```
⏸️  Pausing Work

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAPTURING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current sprint: 02-user-authentication
Current plan: 02-01-PLAN.md (Login & Session Management)
Current task: UC-TK-007 Login Form Component
Model profile: balanced

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROGRESS STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Completed: 6/9 tasks (67%)
   ✅ UC-TK-001: Database schema
   ✅ UC-TK-002: User model
   ✅ UC-TK-003: Password hashing
   ✅ UC-TK-004: Session middleware
   ✅ UC-TK-005: Login endpoint
   ✅ UC-TK-006: Logout endpoint

In Progress: 1/9 (11%)
   🔄 UC-TK-007: Login form component

Pending: 2/9 (22%)
   ⏳ UC-TK-008: Protected route guard
   ⏳ UC-TK-009: Session persistence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: sprint-02-user-auth
Last commit: abc123f - feat(02-01): implement UC-TK-006 Logout Endpoint

Uncommitted changes: 1 file
   - src/components/LoginForm.tsx (modified)

Untracked files: 0
Unpushed commits: 3 ahead of origin/sprint-02-user-auth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCKERS & QUESTIONS (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Any blockers preventing progress? (Enter to skip)
>

Open questions? (Enter to skip)
> Should login form show "Remember Me" checkbox?

Any notes for next session? (Enter to skip)
> Error message German translations need review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommended next steps:
   1. Complete LoginForm component (add validation)
   2. Write unit tests for LoginForm
   3. Commit UC-TK-007
   4. Start UC-TK-008 Protected Route Guard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAVING SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Session file created
✅ PROJECT-STATUS.md updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏸️  Work Paused Successfully

Session ID: 20260127_163045
Session File: .planning/sessions/20260127_163045_pause.md
Tag: eod
Message: End of day

📝 Session Summary:
   - Sprint: 02-user-authentication (67% complete)
   - Task: UC-TK-007 Login Form Component (in progress)
   - Uncommitted: 1 file

💡 To Resume:
   /esf:resume-work
   or
   /esf:resume-work 20260127_163045

State saved. Safe to close terminal or switch projects.
```

## Session File Format

`.planning/sessions/20260127_163045_pause.md`:

```markdown
# Session Pause - 2026-01-27 16:30:45

**Session ID:** 20260127_163045
**Tag:** eod
**Message:** End of day

---

## Work Context

**Sprint:** 02-user-authentication
**Plan:** 02-01-PLAN.md (Login & Session Management)
**Current Task:** Implementing UC-TK-007 Login Form Component

**Model Profile:** balanced

**Working Directory:** /Users/aknipschild/github/gsd-first-test

---

## Progress Status

**Sprint:** 02-user-authentication
**Plan:** 02-01-PLAN.md
**Completion:** 6/9 tasks (67%)

**Completed Use Cases:**
- ✅ UC-TK-001: Database schema
- ✅ UC-TK-002: User model
- ✅ UC-TK-003: Password hashing utility
- ✅ UC-TK-004: Session middleware
- ✅ UC-TK-005: Login API endpoint
- ✅ UC-TK-006: Logout API endpoint

**In Progress:**
- 🔄 UC-TK-007: Login form component (CURRENT)

**Pending:**
- ⏳ UC-TK-008: Protected route guard
- ⏳ UC-TK-009: Session persistence

---

## Git Status

**Branch:** sprint-02-user-auth
**Last Commit:** abc123f - feat(02-01): implement UC-TK-006 Logout Endpoint
**Commit Date:** 2026-01-27 14:25

**Uncommitted Changes:**
- src/components/LoginForm.tsx (modified)

**Untracked Files:**
- (none)

**Unpushed Commits:** 3 commits ahead of origin/sprint-02-user-auth
- abc123f: feat(02-01): implement UC-TK-006 Logout Endpoint
- def456g: feat(02-01): implement UC-TK-005 Login Endpoint
- ghi789h: feat(02-01): implement UC-TK-004 Session Middleware

---

## Blockers & Questions

**Blockers:**
- (none)

**Open Questions:**
- Should login form show "Remember Me" checkbox?
  (Needs clarification before completing UC-TK-007)
- Error message German translations need review

**Notes:**
- LoginForm component 80% complete, needs validation
- Consider adding loading state to form
- Tests should use German language error messages

---

## Next Actions

**Immediate Next Step:**
Complete LoginForm component validation

**Task Sequence:**
1. Add form validation (email format, password min length)
2. Add German error messages
3. Write unit tests for LoginForm
4. Test manually with agent-browser
5. Commit UC-TK-007
6. Start UC-TK-008 Protected Route Guard

**Commands to Run:**
```bash
# Resume session
/esf:resume-work 20260127_163045

# After resuming:
# 1. Complete LoginForm implementation
# 2. Test: npm test src/components/LoginForm.test.tsx
# 3. Commit: git add . && git commit -m "feat(02-01): implement UC-TK-007 Login Form"
# 4. Continue: [work on UC-TK-008]
```

---

## Environment

**Node Version:** v20.10.0
**npm Version:** 10.2.0
**OS:** Darwin 25.2.0
**Terminal:** iTerm2

**Active Extensions:**
- agent-browser (installed)

---

## Statistics

**Session Duration:** ~4 hours
**Commits This Session:** 3
**Lines Changed:** ~250 added, ~30 removed
**Files Modified:** 8

---

**Session paused at:** 2026-01-27 16:30:45
**Resume with:** `/esf:resume-work 20260127_163045`
```

## Quick Pause (Minimal)

For quick pauses without prompts:

```bash
/esf:pause-work --message "Quick break"
```

Skips blocker/question prompts, uses defaults.

## Multiple Sessions

Can have multiple paused sessions:

```bash
/esf:pause-work --tag "before-refactor"
# ... do refactoring work ...
/esf:pause-work --tag "after-refactor"
# ... later ...
/esf:resume-work --list  # Shows both sessions
```

## Pause During Execution

If pausing mid-execution:

```
⏸️  Pausing During Execution

⚠️  Currently executing: UC-TK-007

Uncommitted work detected:
   - src/components/LoginForm.tsx (modified)

Recommendations:
   ✅ Commit work in progress:
      git add . && git commit -m "wip: UC-TK-007 partial implementation"

   ✅ Or stash changes:
      git stash push -m "WIP UC-TK-007"

Proceed with pause? (y/n):
```

## Session File Location

All sessions stored in:
```
.planning/sessions/
├── 20260126_170015_pause.md  (yesterday)
├── 20260127_090030_pause.md  (this morning)
└── 20260127_163045_pause.md  (just now)
```

## Automatic Cleanup

Old sessions (>30 days) can be archived:

```bash
# Manual cleanup
mv .planning/sessions/old-session.md .planning/sessions/archive/
```

## Related Commands

- `/esf:resume-work [ID]` - Resume paused session
- `/esf:progress` - View current progress (lighter than pause)
- `/esf:debug` - Diagnostic checks

## Files Modified

- `.planning/PROJECT-STATUS.md` - Marked as PAUSED
- `.planning/sessions/[timestamp]_pause.md` - Created

## Files Read

- Current sprint directory
- Current plan file
- Use case documents
- Git log and status
- PROJECT-STATUS.md

## Implementation Details

This command should:

1. **Detect current context** - Sprint, plan, task from PROJECT-STATUS.md or file structure
2. **Calculate progress** - Count completed/pending tasks
3. **Capture git state** - Branch, commits, changes, untracked files
4. **Prompt for context** - Blockers, questions, notes (optional, can skip)
5. **Generate next actions** - Based on current progress
6. **Create session file** - Comprehensive markdown document
7. **Update PROJECT-STATUS.md** - Add PAUSED marker with session ID
8. **Display summary** - Show what was captured

The implementation should:
- **Be fast:** < 5 seconds to capture and save
- **Be non-blocking:** Don't require answers to all prompts
- **Be comprehensive:** Capture everything needed to resume
- **Be human-readable:** Session file should be easy to read and understand
- **Handle edge cases:** No current sprint, empty git repo, etc.
