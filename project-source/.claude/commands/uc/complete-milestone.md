# Command: /uc:complete-milestone

## Purpose

Mark the current milestone as complete, create a git release tag, and archive all milestone work for historical reference.

## When to Use

- All phases in current milestone are complete
- All use case scenarios have passed verification
- Ready to mark a release version (v1.0.0, v2.0.0, etc.)
- Before starting a new milestone cycle

## Prerequisites

- All phases must have passed verification
- No uncommitted changes in git
- All use cases should be implemented and verified

## Usage

```bash
/uc:complete-milestone [--version X.Y.Z] [--tag-only] [--no-archive]
```

### Flags

- `--version X.Y.Z`: Specify version number (default: extract from PROJECT.md or prompt user)
- `--tag-only`: Create git tag but don't archive files (useful for testing)
- `--no-archive`: Archive files but don't create git tag

## What This Command Does

### 1. Validation Phase

First, validates the milestone is ready for completion:

```
Checking milestone readiness...
✓ All phases verified
✓ No uncommitted changes
✓ All use cases implemented
✓ Git repository is clean
```

If any checks fail, the command will report issues and suggest running `/uc:audit-milestone` for details.

### 2. Version Determination

Determines the version number:
- Uses `--version` flag if provided
- Extracts from PROJECT.md if version is documented
- Prompts user if neither available

### 3. Git Tag Creation

Creates an annotated git tag with milestone summary:

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - [Milestone Title]

Completed Use Cases:
- UC-UG-001: User Registration
- UC-UG-002: User Login
- UC-UG-003: Profile Management

Phases:
- Phase 01: Foundation
- Phase 02: User Authentication
- Phase 03: User Profile

Statistics:
- 47 commits
- 23 files changed
- 12 use cases completed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 4. Archive Creation

Creates milestone archive structure:

```
.planning/milestones/v1.0.0/
├── MILESTONE-SUMMARY.md      # Generated completion summary
├── phases/                    # Copy of all phase directories
│   ├── 01-foundation/
│   ├── 02-user-authentication/
│   └── 03-user-profile/
├── use-cases/                 # Copy of use case hierarchy
│   ├── index.md
│   ├── summary/
│   ├── user-goal/
│   └── subfunction/
├── PROJECT.md                 # Snapshot of project definition
├── ROADMAP.md                 # Snapshot of roadmap
└── STATE.md                   # Snapshot of final state
```

### 5. Cleanup Working Directories

After successful archive creation, clean up the working directories:

```bash
# Remove phases working directory COMPLETELY (now archived in milestones/vX.Y.Z/phases/)
# IMPORTANT: This must remove ALL contents including untracked files (screenshots, temp files, etc.)
rm -rf .planning/phases/

# Verify cleanup — phases/ must not exist after this step
if [ -d ".planning/phases" ]; then
  echo "ERROR: phases/ still exists after cleanup!"
  exit 1
fi
```

This prevents stale duplicates from remaining after milestone completion. The `rm -rf` ensures ALL contents are removed — including untracked files like screenshots that `git rm` would miss. The archived copy in `.planning/milestones/vX.Y.Z/` serves as the historical reference.

### 6. Documentation Updates

Updates project files:

**ROADMAP.md**: Marks all phases as COMPLETED with completion date
**STATE.md**: Resets for next milestone, adds milestone completion marker
**PROJECT.md**: Adds "Previous Milestones" section

### 6. Generate Milestone Summary

Creates `.planning/milestones/v1.0.0/MILESTONE-SUMMARY.md`:

```markdown
# Milestone v1.0.0 Summary

**Completion Date:** 2026-01-27
**Git Tag:** v1.0.0

## Completed Use Cases

### Summary Level
- UC-S-001: User Management System

### User-Goal Level
- UC-UG-001: User Registration
- UC-UG-002: User Login
- UC-UG-003: Profile Management

### Subfunctions
- UC-SF-001 through UC-SF-025 (25 total)

## Phases Completed

### Phase 01: Foundation (2026-01-15 - 2026-01-18)
- Database schema
- Project structure
- Core utilities

### Phase 02: User Authentication (2026-01-19 - 2026-01-23)
- Registration flow
- Login/logout
- Session management

### Phase 03: User Profile (2026-01-24 - 2026-01-27)
- Profile viewing
- Profile editing
- Avatar upload

## Statistics

- **Total Commits:** 47
- **Files Changed:** 23
- **Lines Added:** 3,245
- **Lines Removed:** 678
- **Duration:** 13 days

## Git Commit Range

First commit: abc123f - Initial project setup
Last commit: xyz789a - Complete UC-SF-025 Avatar Upload

## Known Issues / Limitations

[Document any known issues or limitations]

## Next Milestone

Ready for v2.0.0 planning.
Run `/uc:new-milestone` to start next version.
```

## Output Example

```
🎉 Completing Milestone v1.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All phases verified (3/3)
✅ No uncommitted changes
✅ All use cases implemented (12/12)
✅ Git repository clean

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATING GIT TAG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Tag: v1.0.0
📄 Message: Release v1.0.0 - User Management System

✅ Git tag created successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHIVING MILESTONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Archived:
   - 3 phases
   - 12 use cases (25 subfunctions)
   - 47 commits
   - 23 files changed

📁 Location: .planning/milestones/v1.0.0/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATING DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Updated ROADMAP.md (phases marked complete)
✅ Updated STATE.md (reset for v2)
✅ Updated PROJECT.md (added milestone history)
✅ Generated MILESTONE-SUMMARY.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Milestone v1.0.0 Complete!

Next Steps:
   1. Review: .planning/milestones/v1.0.0/MILESTONE-SUMMARY.md
   2. Push tag: git push origin v1.0.0
   3. Start v2: /uc:new-milestone

Duration: 13 days (2026-01-15 to 2026-01-27)
```

## Error Handling

If validation fails, provides specific guidance:

```
❌ Cannot Complete Milestone

Issues Found:
   ❌ Uncommitted changes in 2 files:
      - src/auth.ts
      - tests/auth.test.ts
   ⚠️  Phase 03 verification not run
   ⚠️  1 use case not implemented: UC-UG-004

Recommendations:
   1. Commit pending changes: git add . && git commit -m "message"
   2. Run verification: /uc:verify-phase 3
   3. Review completeness: /uc:audit-milestone

After resolving issues, run:
   /uc:complete-milestone
```

## Notes

- **Archive & Cleanup:** After successful archiving, `phases/` is deleted completely (including untracked files like screenshots) via `rm -rf`. The archived copy in `milestones/vX.Y.Z/` is the historical reference.
- **Git Tag:** Annotated tag includes full milestone summary
- **Atomic Operation:** If archiving fails, `phases/` is NOT deleted and git tag is not created (unless `--tag-only`)
- **Reversible:** Can delete tag and archive if needed
- **State Preservation:** Original PROJECT.md and actors are preserved for continuity

## Related Commands

- `/uc:audit-milestone` - Check milestone readiness before completing
- `/uc:new-milestone` - Start next milestone after completion
- `/uc:progress` - View current milestone progress

## Files Modified

- `.planning/ROADMAP.md` - Phases marked as completed
- `.planning/STATE.md` - Reset for next milestone
- `.planning/PROJECT.md` - Milestone history added

## Files Created

- `.planning/milestones/v1.0.0/` - Full archive directory
- `.planning/milestones/v1.0.0/MILESTONE-SUMMARY.md` - Summary report
- Git tag: `v1.0.0`

## Implementation Details

This command should:

1. Run validation checks (similar to `/uc:audit-milestone`)
2. Prompt for version if not provided
3. Create milestone archive directory structure
4. Copy phase directories and use cases to archive
5. Clean up working directories (delete `phases/` after successful archive)
6. Generate MILESTONE-SUMMARY.md with statistics
7. Create annotated git tag with meaningful message
8. Update ROADMAP.md, STATE.md, PROJECT.md
9. Report success with next steps

The implementation should be careful about:
- **Validation before modification:** Check everything first
- **Atomic operations:** If archiving fails, don't delete phases/ or create tag
- **Archive then cleanup:** Copy phases to archive first, delete working directory only after successful copy
- **Git tag format:** Use semantic versioning (vX.Y.Z)
