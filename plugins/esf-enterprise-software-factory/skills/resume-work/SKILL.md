---
description: Resume work from a paused session
---

## Purpose

Resume work from a paused session. Loads captured context, displays current state, and helps you pick up where you left off.

## When to Use

- Starting work after using `/esf:pause-work`
- Returning to project after break
- Switching back from another project
- Handoff from another developer
- After system restart

## Prerequisites

- At least one paused session exists (from `/esf:pause-work`)

## Usage

```bash
/esf:resume-work [session-id] [--continue] [--list]
```

### Arguments

- `session-id`: Specific session to resume (default: most recent)

### Flags

- `--continue`: Automatically continue work after loading context
- `--list`: Just list available sessions without resuming

## What This Command Does

### 1. List Sessions (if no ID provided)

Shows available paused sessions:
- Session ID and timestamp
- Phase and task
- Tag and message
- Time since pause

### 2. Load Session File

Reads session state document:
- Work context
- Progress status
- Git state at time of pause
- Blockers/questions
- Next actions

### 3. Compare Current State

Checks if state has changed:
- Git branch matches?
- Last commit matches?
- Uncommitted files changed?
- New commits added?

### 4. Display Context

Shows detailed session info:
- What was being worked on
- Progress percentage
- Open questions
- Next steps

### 5. Optional: Continue Work

With `--continue` flag, automatically:
- Updates STATE.md (remove PAUSED marker)
- Sets up for continuation
- Executes first recommended command (if safe)

## Output Example (No Session ID)

```bash
/esf:resume-work
```

```
📋 Available Paused Sessions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECENT SESSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  20260127_163045 (2 hours ago) ⭐ Most Recent
   Phase: 02-user-authentication (67% complete)
   Task: UC-SF-007 Login Form Component
   Tag: eod
   Message: End of day

2️⃣  20260127_090030 (9 hours ago)
   Phase: 02-user-authentication (50% complete)
   Task: UC-SF-005 Login Endpoint
   Tag: coffee-break
   Message: Quick break

3️⃣  20260126_170015 (1 day ago)
   Phase: 01-foundation (100% complete)
   Task: Phase complete, ready for phase 2
   Tag: end-of-day
   Message: Foundation complete, starting auth tomorrow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resume Options:
   /esf:resume-work                    - Resume most recent (session 1)
   /esf:resume-work 20260127_163045   - Resume specific session
   /esf:resume-work --list            - Show this list again

Select a session number [1-3] or press Enter for most recent: 1
```

## Output Example (With Session ID)

```bash
/esf:resume-work 20260127_163045
```

```
▶️  Resuming Work

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSION INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session: 20260127_163045
Paused: 2026-01-27 16:30 (2 hours ago)
Tag: eod
Message: End of day

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORK CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase: 02-user-authentication
Plan: 02-01-PLAN.md (Login & Session Management)
Task: UC-SF-007 Login Form Component
Model Profile: balanced

Progress: 6/9 subfunctions (67% complete)

Completed:
   ✅ UC-SF-001: Database schema
   ✅ UC-SF-002: User model
   ✅ UC-SF-003: Password hashing
   ✅ UC-SF-004: Session middleware
   ✅ UC-SF-005: Login endpoint
   ✅ UC-SF-006: Logout endpoint

In Progress:
   🔄 UC-SF-007: Login form component

Pending:
   ⏳ UC-SF-008: Protected route guard
   ⏳ UC-SF-009: Session persistence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATE COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checking current state vs session state...

✅ Git branch matches: phase-02-user-auth
✅ Last commit matches: abc123f
⚠️  Uncommitted changes status changed:
   At pause: src/components/LoginForm.tsx (modified)
   Now: src/components/LoginForm.tsx (modified)
        src/components/LoginForm.test.tsx (new)

   New file detected since pause.

✅ No new commits since pause

Overall: Session state mostly consistent ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPEN QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ Should login form show "Remember Me" checkbox?
❓ Error message German translations need review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommended steps:
   1. Complete LoginForm component (add validation)
   2. Write unit tests for LoginForm
   3. Commit UC-SF-007
   4. Start UC-SF-008 Protected Route Guard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Session Context Loaded

Ready to continue work on UC-SF-007 Login Form Component.

Continue working? (y/n): y

✅ Continuing work
✅ STATE.md updated (PAUSED marker removed)

You can now continue implementing UC-SF-007.
```

## List Mode

```bash
/esf:resume-work --list
```

Shows available sessions without resuming (same as output when no session-id provided).

## State Mismatch Warning

If state changed significantly:

```
⚠️  State Mismatch Detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIFFERENCES FROM SESSION STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Git branch changed:
   At pause: phase-02-user-auth
   Now: main

⚠️  New commits since pause: 5 commits
   xyz123a: feat(02-01): complete UC-SF-007 Login Form
   (and 4 more...)

⚠️  Uncommitted changes differ:
   At pause: src/components/LoginForm.tsx
   Now: src/components/ProfileView.tsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Warning: Significant state changes detected!

Possible scenarios:
   1. Work continued without this session (perhaps by other dev)
   2. Branch was switched
   3. Commits were made directly

Recommendations:
   1. Review git log to understand changes
   2. Check if work from session is already complete
   3. Consider merging changes if needed

Continue with resume? (y/n):
```

## Branch Switched

If on different branch:

```
⚠️  Branch Mismatch

Session was on branch: phase-02-user-auth
Currently on branch: main

Options:
   1. Switch back to session branch:
      git checkout phase-02-user-auth

   2. Continue on current branch (not recommended)

   3. Cancel resume

What would you like to do? [1/2/3]:
```

## Session Already Complete

If work from session is done:

```
ℹ️  Session Work Complete

The task from this session (UC-SF-007) has been completed:
   ✅ Commit found: xyz123a - feat(02-01): implement UC-SF-007

This session may no longer be relevant.

Options:
   1. Load context anyway (for reference)
   2. Resume from different session: /esf:resume-work --list
   3. Continue with next task (UC-SF-008)

What would you like to do? [1/2/3]:
```

## Auto-Continue Mode

```bash
/esf:resume-work 20260127_163045 --continue
```

Automatically:
- Loads context
- Removes PAUSED marker
- Updates STATE.md
- Displays next steps
- Does NOT automatically execute commands (for safety)

```
▶️  Resuming Work (Auto-Continue)

[... loads context ...]

✅ Session loaded and resumed automatically
✅ STATE.md updated

Current task: UC-SF-007 Login Form Component
Next action: Complete LoginForm component validation

Ready to work!
```

## No Sessions Available

```bash
/esf:resume-work
```

```
ℹ️  No Paused Sessions

No paused sessions found in .planning/sessions/

To pause work for later resumption:
   /esf:pause-work [--message "reason"]

To check current progress:
   /esf:progress
```

## Archived Sessions

Old sessions can be in archive:

```
📋 Available Sessions

Recent (3):
   [... recent sessions ...]

Archived (12):
   Use --include-archive to show archived sessions

Show archived sessions? (y/n): n
```

## Session File Not Found

If session file deleted/missing:

```
❌ Session Not Found

Session ID: 20260127_163045
Expected file: .planning/sessions/20260127_163045_pause.md

File does not exist or was deleted.

Available sessions:
   /esf:resume-work --list
```

## Multiple Pauses from Same Point

If multiple sessions paused from same state:

```
ℹ️  Multiple Sessions from Same Point

Sessions 2 and 3 both paused from:
   - Phase: 02-user-authentication
   - Commit: abc123f
   - Time: within 1 hour

These may be duplicate sessions.
Recommend resuming the most recent: 20260127_163045
```

## Quick Resume (Most Recent)

```bash
/esf:resume-work
```

Without prompts, automatically loads and displays most recent session.

## Session Metadata Display

Each session shows:

```
Session: 20260127_163045 (2 hours ago)
├─ Phase: 02-user-authentication (67%)
├─ Task: UC-SF-007 Login Form Component
├─ Tag: eod
├─ Branch: phase-02-user-auth
├─ Uncommitted: 1 file
└─ Unpushed: 3 commits
```

## Related Commands

- `/esf:pause-work` - Pause current work
- `/esf:progress` - View current progress
- `/esf:debug` - Diagnose issues

## Files Modified

- `.planning/STATE.md` - Remove PAUSED marker (if continuing)

## Files Read

- `.planning/sessions/[session-id]_pause.md` - Session state
- Current git status - For comparison
- `.planning/STATE.md` - Current project state

## Implementation Details

This command should:

1. **List sessions** - If no ID provided, show available sessions
2. **Load session file** - Read and parse session markdown
3. **Get current state** - Check current git status, branch, commits
4. **Compare states** - Detect changes since pause
5. **Display context** - Show all relevant information clearly
6. **Handle mismatches** - Warn about state changes, offer solutions
7. **Optional continue** - Update STATE.md if user chooses to continue
8. **Smart defaults** - Auto-select most recent if appropriate

The implementation should:
- **Be helpful:** Clearly explain what changed since pause
- **Be safe:** Warn about significant state changes
- **Be flexible:** Allow resuming old sessions even if state changed
- **Be fast:** Load and display within 2-3 seconds
- **Be informative:** Show enough context to quickly orient
