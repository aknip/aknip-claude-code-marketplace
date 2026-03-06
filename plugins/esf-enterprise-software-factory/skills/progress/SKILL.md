---
description: Show use case completion status
allowed-tools:
  - Read
  - Bash
---

<objective>

Display project progress from use case perspective. Shows completion at all three levels (Summary, Epic, Task) and routes to next action.

</objective>

<process>

## Load State

```bash
cat .planning/PROJECT-STATUS.md
cat .planning/use-cases/index.md
cat .planning/PROJECT-PLAN.md
cat .planning/config.json
```

## Load New Features Data

**Milestone info:**
```bash
MILESTONE_VERSION=$(cat .planning/config.json 2>/dev/null | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "1.0.0")
```

**Session status:**
```bash
SESSION_PAUSED=$(grep -A5 "## Session Status" .planning/PROJECT-STATUS.md 2>/dev/null | grep "PAUSED" || echo "")
SESSION_ID=$(echo "$SESSION_PAUSED" | grep -o "Session ID: [^)]*" | cut -d' ' -f3 || echo "")
SESSION_MESSAGE=$(grep -A10 "## Session Status" .planning/PROJECT-STATUS.md 2>/dev/null | grep "Message:" | sed 's/Message: //' || echo "")
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

**Objectives:**
- For each UC-S, count child UC-UG completed vs total

**Epic-Level:**
- Count UC-UG by status (Draft, Approved, Implemented, Verified)

**Task-Level:**
- Count UC-SF by status

**Sprint Status (derived from filesystem artifacts):**

For each sprint defined in PROJECT-PLAN.md, derive status from filesystem:

```bash
for SPRINT_DIR in .planning/sprints/*/; do
  SPRINT_NUM=$(basename "$SPRINT_DIR" | grep -o '^[0-9]*')

  HAS_VERIFICATION=$(ls "${SPRINT_DIR}"/*-VERIFICATION.md 2>/dev/null | head -1)
  HAS_SUMMARY=$(ls "${SPRINT_DIR}"/*-SUMMARY.md 2>/dev/null | head -1)
  HAS_PLAN=$(ls "${SPRINT_DIR}"/*-PLAN.md 2>/dev/null | head -1)
  HAS_RESEARCH=$(ls "${SPRINT_DIR}"/*-RESEARCH.md 2>/dev/null | head -1)

  if [ -n "$HAS_VERIFICATION" ]; then
    STATUS="Verified"
  elif [ -n "$HAS_SUMMARY" ]; then
    STATUS="Executed"
  elif [ -n "$HAS_PLAN" ]; then
    STATUS="Planned"
  elif [ -n "$HAS_RESEARCH" ]; then
    STATUS="Researched"
  else
    STATUS="Not Started"
  fi
done

# Sprints in PROJECT-PLAN.md without a sprint directory:
STATUS="Not Started"
```

**Status definitions:**

| Status | Meaning | Artifact |
|--------|---------|----------|
| Not Started | Defined in roadmap, no artifacts | No sprint directory or empty directory |
| Researched | Research completed | `*-RESEARCH.md` present |
| Planned | Execution plans created | `*-PLAN.md` present |
| Executed | Plans executed, not yet verified | `*-SUMMARY.md` present |
| Verified | Sprint verified and complete | `*-VERIFICATION.md` present |

IMPORTANT: Do NOT use PROJECT-STATUS.md for sprint status. Always derive from filesystem artifacts above.

**Current sprint:** The first sprint with status != "Verified" (or last sprint if all verified).

**Use cases in current sprint by status.**

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

## Objectives (Epics)

| ID | Name | Progress |
|----|------|----------|
| UC-OBJ-001 | Manage Task Lifecycle | ████░░░░ 50% (2/4) |
| UC-OBJ-002 | Organize Tasks | ░░░░░░░░ 0% (0/2) |

## Sprints

| Sprint | Name | Status |
|--------|------|--------|
| 1 | {name} | ✓ Verified |
| 2 | {name} | ✓ Verified |
| 3 | {name} | ○ Not Started |

Status symbols: ○ Not Started | ◐ Researched | ◑ Planned | ◕ Executed | ✓ Verified

## Current Sprint: Sprint {N}

| Epic | Status | Tasks |
|-----------|--------|--------------|
| UC-EP-003 | In Progress | 2/4 implemented |
| UC-EP-004 | Not Started | 0/3 implemented |

## Overall

| Level | Total | Complete |
|-------|-------|----------|
| Summary | 2 | 0 |
| Epic | 6 | 2 |
| Task | 12 | 5 |

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
- If sprint has plans but not executed: /esf:execute-sprint N
- If sprint has no plans: /esf:plan-sprint N
- If sprint needs gaps closed: /esf:plan-sprint N --gaps
- If sprint complete: /esf:plan-sprint N+1

{If all sprints complete:}
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
