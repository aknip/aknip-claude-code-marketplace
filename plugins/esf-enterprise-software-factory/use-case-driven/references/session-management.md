# Session Management Reference

## Overview

Session management enables pausing and resuming work across multiple sessions. Essential for multi-day projects, team collaboration, and context preservation.

## Commands

- `/esf:pause-work` - Capture current state
- `/esf:resume-work` - Load previous state

## Session State Capture

### What Gets Captured

**Work Context:**
- Current phase and plan
- Current task/subfunction
- Model profile in use
- Working directory

**Progress Status:**
- Completed use cases
- Current use case (in progress)
- Pending use cases
- Percentage completion

**Git State:**
- Current branch
- Last commit hash and message
- Uncommitted changes (list of files)
- Untracked files
- Unpushed commits

**Blockers & Questions:**
- Any blockers preventing progress
- Open questions needing answers
- Notes for next session

**Next Actions:**
- Recommended immediate next step
- Sequence of remaining tasks
- Commands to run

## Session File Format

Location: `.planning/sessions/YYYY-MM-DD_HHMMSS_pause.md`

Structure:
```markdown
# Session Pause - [Timestamp]

**Session ID:** YYYYMMDD_HHMMSS
**Tag:** [Optional tag]
**Message:** [Pause reason]

## Work Context
[Phase, plan, task, model profile]

## Progress Status
[Completed, in progress, pending use cases]

## Git Status
[Branch, commits, changes]

## Blockers & Questions
[Issues, questions, notes]

## Next Actions
[Recommended steps and commands]

## Environment
[Node version, OS, etc.]
```

## Resuming Work

### State Comparison

When resuming, compares:
- Git branch (matches?)
- Last commit (same?)
- Uncommitted files (changed?)
- New commits (any added?)

### Mismatch Handling

**Branch Changed:**
- Warns user
- Offers to switch back
- Or continue on current branch

**New Commits:**
- Shows commit list
- Checks if session work is complete
- Recommends action

**Uncommitted Changes Different:**
- Shows file differences
- Explains what changed
- User decides how to proceed

## Session Retention

**Default:** Sessions kept for 30 days

**Cleanup:**
- Automatic cleanup of old sessions
- Manual archiving: `.planning/sessions/archive/`
- Keep important sessions indefinitely

## Use Cases

### End of Day
```bash
# Before closing
/esf:pause-work --message "End of day" --tag "eod"

# Next morning
/esf:resume-work
```

### Before Major Change
```bash
# Save state before risky refactor
/esf:pause-work --message "Before auth refactor" --tag "before-refactor"

# Do refactoring...

# If needed, restore context
/esf:resume-work [session-id]
```

### Team Handoff
```bash
# Developer A
/esf:pause-work --message "Handing off to Dev B" --tag "handoff"

# Developer B
/esf:resume-work  # See what Dev A was doing
```

### Multiple Branches
```bash
# Working on feature branch
/esf:pause-work --tag "feature-payments"

# Switch to hotfix
git checkout main
# ... work on hotfix ...

# Return to feature
/esf:resume-work --list
/esf:resume-work [feature-payments-session]
```

## Integration with Framework

### Planning Agents
- Session context available to agents
- Helps maintain continuity

### STATE.md
- Shows PAUSED marker when active
- Updated when resuming

### Progress Tracking
- Sessions don't affect progress calculation
- Pure state snapshot mechanism

## Best Practices

### When to Pause

✅ **Good times to pause:**
- End of work session
- Before major refactoring
- Before switching tasks
- Before system restart
- When blocked on decision

❌ **Don't pause:**
- In middle of git operation
- During compilation
- With critical uncommitted work (commit first)

### Tag Strategy

Use descriptive tags:
- `eod` - End of day
- `before-refactor` - Safety checkpoint
- `feature-X` - Working on specific feature
- `blocked` - Waiting for decision
- `handoff` - Team collaboration

### Message Guidelines

Include:
- Why pausing (reason)
- What was being worked on
- Any important context
- Next steps (if known)

## Session File Management

### Viewing Sessions
```bash
# List all sessions
/esf:resume-work --list

# View specific session file
cat .planning/sessions/YYYYMMDD_HHMMSS_pause.md
```

### Cleaning Up
```bash
# Move old sessions to archive
mv .planning/sessions/old_*.md .planning/sessions/archive/

# Delete very old sessions (be careful)
rm .planning/sessions/archive/202501*.md
```

## Troubleshooting

### Session Not Found
- File deleted? Check archive
- Wrong ID? List all: `/esf:resume-work --list`

### State Mismatch
- Branch changed? Switch back or continue
- Files modified? Git status to check
- Commits added? Review git log

### Multiple Active Sessions
- Normal for different branches
- Use tags to distinguish
- Resume by ID, not auto-select

## Configuration

In `.planning/config.json`:

```json
{
  "session": {
    "auto_pause_on_error": false,
    "retention_days": 30,
    "auto_cleanup": true
  }
}
```

**Options:**
- `auto_pause_on_error`: Auto-pause on uncaught errors (experimental)
- `retention_days`: How long to keep sessions before cleanup
- `auto_cleanup`: Automatically move old sessions to archive

## Related Documentation

- [Milestone Management](milestone-workflow.md)
- [Phase Management](../workflows/phase-management.md)
- [State Tracking](../workflows/state-tracking.md)
