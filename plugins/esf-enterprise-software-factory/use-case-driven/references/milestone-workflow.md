# Milestone Workflow Reference

## Overview

Milestones represent completed versions (v1.0.0, v2.0.0, etc.) of your project. The milestone workflow enables versioning, archiving, and clean separation between major versions.

## Commands

- `/esf:audit-milestone` - Check readiness
- `/esf:complete-milestone` - Mark complete, tag, archive
- `/esf:new-milestone` - Start new version

## Milestone Lifecycle

```
┌─────────────────────────────────────────┐
│ Work on v1.0.0                          │
│ - Multiple sprints                       │
│ - Use cases implemented                 │
│ - Scenarios verified                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ /esf:audit-milestone                     │
│ - Check completeness                    │
│ - Identify blockers                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ /esf:complete-milestone                  │
│ - Create git tag: v1.0.0                │
│ - Archive work                          │
│ - Generate summary                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ /esf:new-milestone                       │
│ - Start v2.0.0                          │
│ - Reset state                           │
│ - Preserve continuity                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        Work on v2.0.0...
```

## Audit Milestone

### Purpose
Check if milestone is ready for completion.

### Checks Performed

1. **Use Case Coverage**
   - All Objectives complete?
   - All Epic-level implemented?
   - All Tasks have commits?

2. **Scenario Verification**
   - All scenarios passed?
   - Verification reports exist?
   - No failed scenarios?

3. **Sprint Completion**
   - All sprints verified?
   - All plans executed?
   - Summaries generated?

4. **Git Status**
   - No uncommitted changes?
   - All commits pushed?
   - Branch clean?

5. **Commit Traceability**
   - All commits reference use cases?
   - Task commits have "Implements:"?
   - Atomic commits per task?

6. **Documentation**
   - PROJECT.md current?
   - PROJECT-PLAN.md complete?
   - PROJECT-STATUS.md up to date?
   - Sprint documentation present?

### Output

**Ready:**
- "✅ All Checks Passed"
- Ready for `/esf:complete-milestone`

**Not Ready:**
- List of blockers (errors)
- List of warnings
- Recommended actions with commands
- Priority ordering

## Complete Milestone

### What Happens

1. **Validation**
   - Re-runs audit checks
   - Fails if blockers present

2. **Git Tag Creation**
   - Annotated tag: `v1.0.0`
   - Tag message includes:
     - Completed use cases
     - Sprints completed
     - Statistics (commits, files, LOC)

3. **Archive Creation**
   - Creates `.planning/milestones/v1.0.0/`
   - Copies sprints/ → milestones/v1.0.0/sprints/
   - Copies use-cases/ → milestones/v1.0.0/use-cases/
   - Snapshots: PROJECT.md, PROJECT-PLAN.md, PROJECT-STATUS.md

4. **Summary Generation**
   - MILESTONE-SUMMARY.md created
   - Includes:
     - Completion date
     - All use cases completed
     - Sprint summary
     - Statistics
     - Git commit range
     - Known issues

5. **Documentation Updates**
   - PROJECT-PLAN.md: Mark sprints complete
   - PROJECT-STATUS.md: Reset for v2
   - PROJECT.md: Add milestone history

### Archive Structure

```
.planning/milestones/v1.0.0/
├── MILESTONE-SUMMARY.md       # Completion report
├── PROJECT.md                 # Snapshot of project definition
├── PROJECT-PLAN.md                 # Snapshot of roadmap
├── PROJECT-STATUS.md                   # Snapshot of final state
├── sprints/
│   ├── 01-foundation/
│   ├── 02-user-authentication/
│   └── 03-user-profile/
└── use-cases/
    ├── index.md
    ├── summary/
    ├── epic/
    └── task/
```

### Git Tag Format

```
Tag: v1.0.0

Release v1.0.0 - User Management System

Completed Use Cases:
- UC-EP-001: User Registration
- UC-EP-002: User Login
- UC-EP-003: Profile Management

Sprints:
- Sprint 01: Foundation
- Sprint 02: User Authentication
- Sprint 03: User Profile

Statistics:
- 47 commits
- 23 files changed
- 12 use cases completed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## New Milestone

### What Happens

1. **Prerequisite Check**
   - Previous milestone complete?
   - Archive exists?
   - Git clean?

2. **Version Determination**
   - Auto-increment major (v1.0.0 → v2.0.0)
   - Or manual: `--version 2.1.0`

3. **Structure Reset**
   - Create fresh `sprints/` directory
   - Reset PROJECT-STATUS.md for v2
   - Preserve PROJECT.md (actors, vision)

4. **Documentation Updates**
   - PROJECT-PLAN.md: Add v2 section, archive v1
   - PROJECT.md: Add milestone history
   - PROJECT-STATUS.md: New milestone header

5. **Use Case Tracking**
   - Clear completion status
   - Keep use case structure
   - Mark v1 use cases as previous milestone

### Continuity

**Preserved:**
- PROJECT.md (actors, vision, business context)
- .claude/ (agents, commands, skills)
- config.json (settings)
- Git history

**Reset:**
- sprints/ (empty for v2)
- PROJECT-STATUS.md (v2 header)
- PROJECT-PLAN.md (v2 section)
- Use case completion tracking

## Version Numbering

### Semantic Versioning

**Major (X.0.0):**
- Significant new capabilities
- Major feature additions
- Breaking changes

**Minor (X.Y.0):**
- Backward-compatible features
- Enhancements
- Minor additions

**Patch (X.Y.Z):**
- Bug fixes
- Security patches
- Small tweaks

### Milestone Versions

Typically use **major versions** for milestones:
- v1.0.0 - MVP
- v2.0.0 - Major feature expansion
- v3.0.0 - Next major release

Use minor/patch for:
- Hotfixes: v1.0.1
- Small enhancements: v1.1.0

## Multiple Milestones

### Milestone History

```
.planning/milestones/
├── v1.0.0/           # First release
├── v2.0.0/           # Major expansion
├── v2.1.0/           # Minor enhancements
└── v3.0.0/           # Current (in progress)
```

### PROJECT.md History

```markdown
## Previous Milestones

### v2.1.0 - Enhanced Features
**Completed:** 2026-01-15
**Archive:** `.planning/milestones/v2.1.0/`
**Tag:** v2.1.0

### v2.0.0 - Feature Expansion
**Completed:** 2025-12-20
**Archive:** `.planning/milestones/v2.0.0/`
**Tag:** v2.0.0

### v1.0.0 - MVP
**Completed:** 2025-11-01
**Archive:** `.planning/milestones/v1.0.0/`
**Tag:** v1.0.0
```

## Best Practices

### When to Complete Milestone

✅ **Complete when:**
- All planned use cases implemented
- All scenarios verified
- Ready for production/release
- Major version boundary
- Clean stopping point

❌ **Don't complete when:**
- Uncommitted work
- Failed scenarios
- Incomplete use cases
- Mid-sprint work

### Milestone Scope

Keep milestones:
- **Focused:** 3-5 sprints ideal
- **Deliverable:** Shippable at completion
- **Time-boxed:** 2-4 weeks work
- **Meaningful:** Delivers value

### Documentation

Always:
- Audit before completing
- Fix all blockers
- Generate good summary
- Tag with semantic version
- Push tag to remote

## Recovery

### Undo Completion

If completed too early:

```bash
# Delete tag (if not pushed)
git tag -d v1.0.0

# Restore from archive
# (manually copy files back if needed)
```

### Resume Previous Milestone

If need to add work to v1.0 after starting v2.0:

```bash
# Option 1: Create patch version
/esf:new-milestone --version 1.0.1

# Option 2: Branch from tag
git checkout -b hotfix/v1.0.1 v1.0.0
```

## Configuration

In `.planning/config.json`:

```json
{
  "milestone": {
    "current_version": "1.0.0",
    "auto_tag": true,
    "archive_on_complete": true
  }
}
```

## Related Documentation

- [Session Management](session-management.md)
- [Sprint Management](../workflows/sprint-management.md)
- [Git Workflow](../workflows/git-workflow.md)
