---
description: Start a new milestone cycle after completing the previous one
---

## Purpose

Start a new milestone cycle (e.g., v2.0.0) after completing the previous milestone. Prepares the project structure for new development while preserving project vision and actors.

## When to Use

- After completing a milestone with `/esf:complete-milestone`
- Ready to start planning next version (v2.0.0, v3.0.0, etc.)
- Want to begin a new development cycle with fresh sprints

## Prerequisites

- Previous milestone should be completed (optional but recommended)
- Previous milestone should be archived
- Clean git state (no uncommitted changes)

## Usage

```bash
/esf:new-milestone [--version X.Y.Z] [--interactive] [--description "text"]
```

### Flags

- `--version X.Y.Z`: Specify new version number (default: auto-increment from previous)
- `--interactive`: Run guided questioning session for v2 goals
- `--description "text"`: Brief description of new milestone goals

## What This Command Does

### 1. Check Prerequisites

Validates readiness for new milestone:

```
Checking prerequisites...
✓ Previous milestone v1.0.0 completed
✓ Milestone archive exists
✓ Git state is clean
✓ Ready for new milestone
```

### 2. Determine Version

Determines new version number:
- Uses `--version` flag if provided
- Auto-increments major version from previous (v1.0.0 → v2.0.0)
- Prompts user if needed

### 3. Create Fresh Structure

Creates clean structure for new milestone:

```
Creating new milestone structure...

Creating:
   .planning/sprints/           # Fresh, empty sprints directory
```

Preserving:
   .planning/PROJECT.md        # Actors and vision preserved
   .planning/use-cases/        # Use case infrastructure (reset tracking)
   .planning/config.json       # Configuration settings
```

### 4. Reset PROJECT-STATUS.md

Resets PROJECT-STATUS.md for new milestone tracking:

```markdown
# Project State

**Current Milestone:** v2.0.0
**Started:** 2026-01-28
**Status:** Planning

---

## Current Sprint

None (milestone planning in progress)

## Recent Activity

2026-01-28: Started milestone v2.0.0

## Active Work

Planning new features for v2.0.0

## Previous Milestones

- **v1.0.0** (2026-01-15 to 2026-01-27) - Completed
  - Archive: `.planning/milestones/v1.0.0/`
  - Git Tag: v1.0.0

---

## Notes

[Space for session notes]
```

### 5. Update PROJECT-PLAN.md

Updates roadmap for new milestone:

```markdown
# Project Roadmap

**Current Milestone:** v2.0.0
**Started:** 2026-01-28

---

## Milestone v2.0.0 - [Description]

**Status:** Planning
**Target Date:** TBD

### Sprints

[No sprints yet - add with /esf:add-sprint]

---

## Previous Milestones

### Milestone v1.0.0 - User Management System ✅

**Status:** Completed (2026-01-27)
**Archive:** `.planning/milestones/v1.0.0/`
**Git Tag:** v1.0.0

#### Completed Sprints
1. Sprint 01: Foundation ✅
2. Sprint 02: User Authentication ✅
3. Sprint 03: User Profile ✅

---
```

### 6. Update PROJECT.md

Adds milestone section to PROJECT.md (if not exists):

```markdown
## Previous Milestones

### v1.0.0 - User Management System
**Completed:** 2026-01-27
**Archive:** `.planning/milestones/v1.0.0/`
**Tag:** v1.0.0

---

## Current Milestone

**Version:** v2.0.0
**Started:** 2026-01-28
**Goal:** [To be defined]
```

### 7. Optional: Interactive Goal Definition

If `--interactive` flag is used, prompts for v2 goals:

```
🎯 Define v2.0.0 Goals

What are the main goals for this milestone?

Examples:
- Add new major feature
- Enhance existing functionality
- Refactor architecture
- Performance improvements

Your goals (or press Enter to skip):
> Add payment processing and subscription management

Any specific features or capabilities? (Enter to skip)
> Stripe integration, subscription tiers, billing history

✅ Goals captured. These will be added to PROJECT.md.

Next Steps:
   1. Run /esf:add-sprint to add sprints for v2
   2. Or run /esf:new-project --milestone to do full use case analysis for v2
```

### 8. Clean Use Case Tracking

Resets use case tracking for new milestone:
- Keeps use case directory structure
- Clears completion status from previous milestone
- Keeps index.md but marks previous use cases as "v1"
- Ready for new use cases to be added

## Output Example

```
🚀 Starting New Milestone v2.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREREQUISITES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Previous milestone: v1.0.0 (completed 2026-01-27)
✅ Archive exists: .planning/milestones/v1.0.0/
✅ Git state: clean
✅ Ready for new milestone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW MILESTONE: v2.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Version: v2.0.0
📅 Started: 2026-01-28
📄 Description: Payment and Subscription System

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETUP COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created fresh sprints/ directory
✅ Preserved PROJECT.md (actors and vision)
✅ Reset PROJECT-STATUS.md for v2
✅ Updated PROJECT-PLAN.md
✅ Reset use case tracking

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose your approach:

1️⃣  Add sprints manually:
   /esf:add-sprint payment-integration
   /esf:add-sprint subscription-management

2️⃣  Full use case analysis for v2:
   /esf:new-project --milestone
   (Runs questioning session for v2 features)

3️⃣  Plan incrementally:
   Start with one sprint, plan more as you go

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Previous Milestone:
   v1.0.0 → Archived in .planning/milestones/v1.0.0/

Ready to build v2.0.0! 🚀
```

## Non-Interactive Mode

Without `--interactive`:

```
🚀 Starting Milestone v2.0.0

✅ Setup Complete:
   - Created fresh sprints/ directory
   - Reset PROJECT-STATUS.md for v2.0.0
   - Updated PROJECT-PLAN.md
   - Preserved PROJECT.md

Next Steps:
   1. Add sprints: /esf:add-sprint [name]
   2. Or run: /esf:new-milestone --interactive
   3. View progress: /esf:progress

Previous Milestone: v1.0.0 (archived)
```

## Error Handling

If prerequisites not met:

```
⚠️  Cannot Start New Milestone

Issues:
   ❌ Previous milestone (v1.0.0) not completed
   ⚠️  No milestone archive found

Recommendations:
   1. Complete current milestone: /esf:complete-milestone
   2. Or force new milestone: /esf:new-milestone --force

Note: Using --force will start v2 without completing v1.
      Previous work remains in sprints/ directory (not archived).
```

## Version Numbering

Automatic version increment:
- v1.0.0 → v2.0.0 (increment major)
- v2.0.0 → v3.0.0 (increment major)

Custom version:
```bash
/esf:new-milestone --version 2.1.0
```

## What is Preserved

**Preserved across milestones:**
- PROJECT.md (actors, vision, business context)
- .claude/ directory (agents, commands, skills)
- config.json (settings)
- Git repository and history

**Reset for new milestone:**
- sprints/ directory (emptied, ready for v2 sprints)
- PROJECT-STATUS.md (reset with v2 header)
- PROJECT-PLAN.md (v2 section, v1 moved to history)
- Use case completion tracking (structure preserved)

**Archived from v1:**
- All sprint directories
- All use case documents
- Verification results
- State snapshots

## Related Commands

- `/esf:complete-milestone` - Complete current milestone before starting new one
- `/esf:add-sprint` - Add sprints to new milestone
- `/esf:audit-milestone` - Check v1 completeness before v2
- `/esf:progress` - View milestone progress

## Files Modified

- `.planning/PROJECT-STATUS.md` - Reset for v2
- `.planning/PROJECT-PLAN.md` - Add v2 section, archive v1
- `.planning/PROJECT.md` - Add milestone history section
- `.planning/sprints/` - Emptied for fresh start

## Files Created

None (resets existing structure)

## Implementation Details

This command should:

1. Check prerequisites (previous milestone complete, archive exists)
2. Determine new version (auto-increment or from flag)
3. Create clean sprints/ directory (move old to archive if not already done)
4. Reset PROJECT-STATUS.md with v2 header and preserve milestone history
5. Update PROJECT-PLAN.md with v2 section and move v1 to history
6. Update PROJECT.md with milestone section
7. Reset use case tracking (keep structure, clear completion)
8. If `--interactive`, run goal definition prompts
9. Display next steps clearly

The implementation should:
- **Preserve continuity:** Keep PROJECT.md actors and vision
- **Safe reset:** Don't delete v1 work (should be archived already)
- **Clear state:** Make it obvious we're in v2 planning mode
- **Flexible start:** Support both manual sprint addition and full use case analysis
