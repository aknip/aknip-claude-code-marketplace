# Command: /uc:pause-work

## Purpose

Capture the current work state for later resumption. Saves context including current phase, progress, git status, blockers, and next actions. Essential for multi-session projects.

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
/uc:pause-work [--message "reason"] [--tag "label"]
```

### Flags

- `--message "reason"`: Explain why pausing (e.g., "end of day", "switching priorities")
- `--tag "label"`: Tag session for easy filtering (e.g., "before-refactor", "end-of-day")

## What This Command Does

### 1. Capture Work Context

Records current state:
- Current phase and plan
- Current task/subfunction (if executing)
- Model profile in use
- Working directory

### 2. Capture Progress

Documents completion status:
- Which use cases are complete
- Current subfunction in progress
- Pending subfunctions
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

### 7. Update STATE.md

Marks project as paused:

```markdown
**Status:** PAUSED (2026-01-27 16:30)
**Session:** 20260127_163045
```

## Output Example

```bash
/uc:pause-work --message "End of day" --tag "eod"
```

```
⏸️  Pausing Work

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAPTURING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current phase: 02-user-authentication
Current plan: 02-01-PLAN.md (Login & Session Management)
Current task: UC-SF-007 Login Form Component
Model profile: balanced

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROGRESS STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Completed: 6/9 subfunctions (67%)
   ✅ UC-SF-001: Database schema
   ✅ UC-SF-002: User model
   ✅ UC-SF-003: Password hashing
   ✅ UC-SF-004: Session middleware
   ✅ UC-SF-005: Login endpoint
   ✅ UC-SF-006: Logout endpoint

In Progress: 1/9 (11%)
   🔄 UC-SF-007: Login form component

Pending: 2/9 (22%)
   ⏳ UC-SF-008: Protected route guard
   ⏳ UC-SF-009: Session persistence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: phase-02-user-auth
Last commit: abc123f - feat(02-01): implement UC-SF-006 Logout Endpoint

Uncommitted changes: 1 file
   - src/components/LoginForm.tsx (modified)

Untracked files: 0
Unpushed commits: 3 ahead of origin/phase-02-user-auth

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
   3. Commit UC-SF-007
   4. Start UC-SF-008 Protected Route Guard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAVING SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Session file created
✅ STATE.md updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏸️  Work Paused Successfully

Session ID: 20260127_163045
Session File: .planning/sessions/20260127_163045_pause.md
Tag: eod
Message: End of day

📝 Session Summary:
   - Phase: 02-user-authentication (67% complete)
   - Task: UC-SF-007 Login Form Component (in progress)
   - Uncommitted: 1 file

💡 To Resume:
   /uc:resume-work
   or
   /uc:resume-work 20260127_163045

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

**Phase:** 02-user-authentication
**Plan:** 02-01-PLAN.md (Login & Session Management)
**Current Task:** Implementing UC-SF-007 Login Form Component

**Model Profile:** balanced

**Working Directory:** /Users/aknipschild/github/gsd-first-test

---

## Progress Status

**Phase:** 02-user-authentication
**Plan:** 02-01-PLAN.md
**Completion:** 6/9 subfunctions (67%)

**Completed Use Cases:**
- ✅ UC-SF-001: Database schema
- ✅ UC-SF-002: User model
- ✅ UC-SF-003: Password hashing utility
- ✅ UC-SF-004: Session middleware
- ✅ UC-SF-005: Login API endpoint
- ✅ UC-SF-006: Logout API endpoint

**In Progress:**
- 🔄 UC-SF-007: Login form component (CURRENT)

**Pending:**
- ⏳ UC-SF-008: Protected route guard
- ⏳ UC-SF-009: Session persistence

---

## Git Status

**Branch:** phase-02-user-auth
**Last Commit:** abc123f - feat(02-01): implement UC-SF-006 Logout Endpoint
**Commit Date:** 2026-01-27 14:25

**Uncommitted Changes:**
- src/components/LoginForm.tsx (modified)

**Untracked Files:**
- (none)

**Unpushed Commits:** 3 commits ahead of origin/phase-02-user-auth
- abc123f: feat(02-01): implement UC-SF-006 Logout Endpoint
- def456g: feat(02-01): implement UC-SF-005 Login Endpoint
- ghi789h: feat(02-01): implement UC-SF-004 Session Middleware

---

## Blockers & Questions

**Blockers:**
- (none)

**Open Questions:**
- Should login form show "Remember Me" checkbox?
  (Needs clarification before completing UC-SF-007)
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
5. Commit UC-SF-007
6. Start UC-SF-008 Protected Route Guard

**Commands to Run:**
```bash
# Resume session
/uc:resume-work 20260127_163045

# After resuming:
# 1. Complete LoginForm implementation
# 2. Test: npm test src/components/LoginForm.test.tsx
# 3. Commit: git add . && git commit -m "feat(02-01): implement UC-SF-007 Login Form"
# 4. Continue: [work on UC-SF-008]
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
**Resume with:** `/uc:resume-work 20260127_163045`
```

## Quick Pause (Minimal)

For quick pauses without prompts:

```bash
/uc:pause-work --message "Quick break"
```

Skips blocker/question prompts, uses defaults.

## Multiple Sessions

Can have multiple paused sessions:

```bash
/uc:pause-work --tag "before-refactor"
# ... do refactoring work ...
/uc:pause-work --tag "after-refactor"
# ... later ...
/uc:resume-work --list  # Shows both sessions
```

## Pause During Execution

If pausing mid-execution:

```
⏸️  Pausing During Execution

⚠️  Currently executing: UC-SF-007

Uncommitted work detected:
   - src/components/LoginForm.tsx (modified)

Recommendations:
   ✅ Commit work in progress:
      git add . && git commit -m "wip: UC-SF-007 partial implementation"

   ✅ Or stash changes:
      git stash push -m "WIP UC-SF-007"

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

- `/uc:resume-work [ID]` - Resume paused session
- `/uc:progress` - View current progress (lighter than pause)
- `/uc:debug` - Diagnostic checks

## Files Modified

- `.planning/STATE.md` - Marked as PAUSED
- `.planning/sessions/[timestamp]_pause.md` - Created

## Files Read

- Current phase directory
- Current plan file
- Use case documents
- Git log and status
- STATE.md

## Implementation Details

This command should:

1. **Detect current context** - Phase, plan, task from STATE.md or file structure
2. **Calculate progress** - Count completed/pending subfunctions
3. **Capture git state** - Branch, commits, changes, untracked files
4. **Prompt for context** - Blockers, questions, notes (optional, can skip)
5. **Generate next actions** - Based on current progress
6. **Create session file** - Comprehensive markdown document
7. **Update STATE.md** - Add PAUSED marker with session ID
8. **Display summary** - Show what was captured

The implementation should:
- **Be fast:** < 5 seconds to capture and save
- **Be non-blocking:** Don't require answers to all prompts
- **Be comprehensive:** Capture everything needed to resume
- **Be human-readable:** Session file should be easy to read and understand
- **Handle edge cases:** No current phase, empty git repo, etc.
