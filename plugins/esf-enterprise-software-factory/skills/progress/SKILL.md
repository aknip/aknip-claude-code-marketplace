---
name: progress
description: Show use case completion status
allowed-tools:
  - Read
  - Bash
---

<objective>

Display project progress from use case perspective. Shows completion at all three levels (Summary, User-Goal, Subfunction) and routes to next action.

</objective>

<process>

## Load State

```bash
cat .planning/STATE.md
cat .planning/use-cases/index.md
cat .planning/ROADMAP.md
cat .planning/config.json
```

## Load New Features Data

**Milestone info:**
```bash
MILESTONE_VERSION=$(cat .planning/config.json 2>/dev/null | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "1.0.0")
```

**Session status:**
```bash
SESSION_PAUSED=$(grep -A5 "## Session Status" .planning/STATE.md 2>/dev/null | grep "PAUSED" || echo "")
SESSION_ID=$(echo "$SESSION_PAUSED" | grep -o "Session ID: [^)]*" | cut -d' ' -f3 || echo "")
SESSION_MESSAGE=$(grep -A10 "## Session Status" .planning/STATE.md 2>/dev/null | grep "Message:" | sed 's/Message: //' || echo "")
```

**TODO count:**
```bash
if [ -f .planning/TODO.md ]; then
  TODO_TOTAL=$(grep "^- \[ \]" .planning/TODO.md | wc -l | tr -d ' ')
  TODO_HIGH=$(grep "^- \[ \].*\[high\]" .planning/TODO.md | wc -l | tr -d ' ')
  TODO_MEDIUM=$(grep "^- \[ \].*\[medium\]" .planning/TODO.md | wc -l | tr -d ' ')
  TODO_LOW=$(grep "^- \[ \].*\[low\]" .planning/TODO.md | wc -l | tr -d ' ')
else
  TODO_TOTAL=0
fi
```

## Calculate Progress

**Summary-Level:**
- For each UC-S, count child UC-UG completed vs total

**User-Goal-Level:**
- Count UC-UG by status (Draft, Approved, Implemented, Verified)

**Subfunction-Level:**
- Count UC-SF by status

**Phase Progress:**
- Current phase from STATE.md
- Use cases in current phase by status

## Display

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PROJECT PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Milestone v{MILESTONE_VERSION}

Status: In Progress
Progress: {COMPLETION}% ({COMPLETE}/{TOTAL} use cases)
Started: {START_DATE}

{If session is paused:}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSION PAUSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: PAUSED ({PAUSE_TIME})
Session: {SESSION_ID}
Message: {SESSION_MESSAGE}

Resume: /esf:resume-work
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Summary-Level (Epics)

| ID | Name | Progress |
|----|------|----------|
| UC-S-001 | Manage Task Lifecycle | ████░░░░ 50% (2/4) |
| UC-S-002 | Organize Tasks | ░░░░░░░░ 0% (0/2) |

## Current Phase: Phase 2

| User-Goal | Status | Subfunctions |
|-----------|--------|--------------|
| UC-UG-003 | In Progress | 2/4 implemented |
| UC-UG-004 | Planned | 0/3 implemented |

## Overall

| Level | Total | Complete |
|-------|-------|----------|
| Summary | 2 | 0 |
| User-Goal | 6 | 2 |
| Subfunction | 12 | 5 |

**Progress:** 42%

{If TODOs exist:}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TODOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pending: {TODO_TOTAL} TODOs
   High Priority: {TODO_HIGH}
   Medium Priority: {TODO_MEDIUM}
   Low Priority: {TODO_LOW}

View: /esf:check-todos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

───────────────────────────────────────────────────────

## ▶ Next Action

{Based on state:}
- If phase has plans but not executed: /esf:execute-phase N
- If phase has no plans: /esf:plan-phase N
- If phase needs gaps closed: /esf:plan-phase N --gaps
- If phase complete: /esf:plan-phase N+1

{If all phases complete:}
- Check milestone readiness: /esf:audit-milestone
- Mark complete: /esf:complete-milestone --version {MILESTONE_VERSION}
```

</process>

<success_criteria>

- [ ] Use case hierarchy loaded
- [ ] Progress calculated at all levels
- [ ] Current state displayed
- [ ] Next action recommended

</success_criteria>
