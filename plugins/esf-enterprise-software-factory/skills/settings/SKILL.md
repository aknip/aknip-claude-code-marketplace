---
description: Display and manage UC framework configuration
---

## Purpose

Display and interactively manage UC framework configuration settings. Provides user-friendly interface for adjusting model profiles, agent assignments, UI preferences, and workflow settings.

## When to Use

- View current framework configuration
- Change model profile (quality/balanced/budget)
- Adjust agent model assignments
- Configure UI language and formats
- Review workflow settings
- After initial project setup (customize for your needs)

## Prerequisites

None - can run anytime

## Usage

```bash
/esf:settings [--show] [--edit] [--category NAME] [--reset]
```

### Flags

- `--show`: Display current settings (default)
- `--edit`: Interactive settings editor
- `--category NAME`: Edit specific category only (model, ui, workflow, session, autopilot, permissions)
- `--reset`: Reset to default settings

## What This Command Does

### Show Mode (Default)

Displays current configuration:
- Model profile and agent assignments
- UI settings (language, formats)
- Workflow preferences
- Permission settings (from settings.local.json)

### Edit Mode

Interactive editor to change settings:
- Select category to edit
- Guided prompts for each setting
- Validation before saving
- Show impact of changes

### Configuration Sources

Reads from:
1. `.planning/config.json` - Project-specific settings
2. `.claude/settings.json` - Framework hooks
3. `.claude/settings.local.json` - Local permissions

## Output Example (Show Mode)

```bash
/esf:settings
```

or

```bash
/esf:settings --show
```

```
⚙️  UC Framework Settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODEL CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Profile: balanced ⚖️

Agent Model Assignments:
   uc-analyst            → Sonnet  (claude-sonnet-4-5)
   uc-modeler            → Opus    (claude-opus-4-5)
   uc-planner            → Opus    (claude-opus-4-5)
   uc-executor           → Sonnet  (claude-sonnet-4-5)
   uc-verifier           → Sonnet  (claude-sonnet-4-5)
   uc-checker            → Sonnet  (claude-sonnet-4-5)
   uc-sprint-researcher   → Sonnet  (claude-sonnet-4-5)
   uc-brownfield-mapper  → Sonnet  (claude-sonnet-4-5)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UI SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Language:       German (de) 🇩🇪
Date Format:    DD.MM.YYYY (27.01.2026)
Time Format:    24-hour (16:30)
Currency:       EUR (€)
Number Format:  1.234,56 (European comma decimal)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Specification Mode:     use-case (RUP three-level hierarchy)
Auto-commit:            Enabled (per task)
Atomic Commits:         Enabled
Commit Format:          feat(sprint-plan): message
Verification Required:  Yes (agent-browser)
Auto-push:              Disabled
Browser Testing:        Enabled (agent-browser)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSION SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auto-pause on Error:    Disabled
Session Retention:      30 days
Auto-cleanup:           Enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTOPILOT SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checkpoint Mode:        queue (pause at checkpoints)
Max Retries:            3 per sprint
Budget Limit:           $0 (unlimited)
Notify Webhook:         (not configured)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERMISSIONS (.claude/settings.local.json)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bash Commands:
   ✅ git (add, commit, push, checkout, tag)
   ✅ npm (install, run, test)
   ✅ node

WebFetch Domains:
   ✅ raw.githubusercontent.com
   ✅ api.github.com
   ✅ docs.anthropic.com

Agent-Browser: Enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIGURATION FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Settings:  .planning/config.json
Framework Hooks:   .claude/settings.json
Local Permissions: .claude/settings.local.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
   /esf:set-profile [quality|balanced|budget]  - Quick profile change
   /esf:settings --edit                        - Interactive editor
   /esf:settings --edit --category model       - Edit specific category
   /esf:settings --reset                       - Reset to defaults
```

## Edit Mode (Interactive)

```bash
/esf:settings --edit
```

```
⚙️  Settings Editor

Current Profile: balanced

Select category to edit:
   1. Model Profile & Agent Assignments
   2. UI Settings (language, formats)
   3. Workflow Settings
   4. Session Settings
   5. Autopilot Settings
   6. View All (read-only)
   7. Cancel

Choice [1-6]: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODEL PROFILE & AGENT ASSIGNMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Profile: balanced

Available Profiles:

1️⃣  quality - Best Quality, Highest Cost
   • Use Opus for: analysis, planning, verification, research
   • Use Sonnet for: execution
   • Best for: Critical projects, complex domains
   • Cost: ~3x baseline

2️⃣  balanced - Good Balance ⭐ CURRENT
   • Use Opus for: planning
   • Use Sonnet for: analysis, execution, verification, research
   • Best for: Most projects
   • Cost: ~1.5x baseline

3️⃣  budget - Cost Optimized
   • Use Sonnet for: everything
   • Use Haiku for: simple checks (future)
   • Best for: Prototypes, learning, experimentation
   • Cost: ~1x baseline

Select profile [1-3] or press Enter to keep current: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE CHANGE: balanced → quality
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agent assignments will change:

   uc-analyst:           Sonnet → Opus    [change]
   uc-modeler:           Opus   → Opus    [no change]
   uc-planner:           Opus   → Opus    [no change]
   uc-executor:          Sonnet → Sonnet  [no change]
   uc-verifier:          Sonnet → Opus    [change]
   uc-checker:           Sonnet → Opus    [change]
   uc-sprint-researcher:  Sonnet → Opus    [change]
   uc-brownfield-mapper: Sonnet → Sonnet  [no change]

Impact:
   ✅ Higher quality analysis and verification
   ✅ Better pattern detection
   ✅ More thorough checking
   ⚠️  ~2x increase in API costs

⚠️  Note: Quality profile increases costs significantly.
         Use for production-critical projects.

Save changes? (y/n): y

✅ Profile changed to: quality
✅ Settings saved to .planning/config.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Continue editing? (y/n): n

✅ Settings updated successfully
```

## Edit UI Settings

```bash
/esf:settings --edit --category ui
```

```
⚙️  Edit UI Settings

Current Settings:
   Language: German (de)
   Date Format: DD.MM.YYYY
   Time Format: 24-hour
   Currency: EUR
   Number Format: European (1.234,56)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Change language? [German/English] (Enter to keep): English

Change date format? [DD.MM.YYYY/MM/DD/YYYY/YYYY-MM-DD] (Enter to keep):
(keeping DD.MM.YYYY)

Change time format? [24-hour/12-hour] (Enter to keep):
(keeping 24-hour)

Change currency? [EUR/USD/GBP] (Enter to keep):
(keeping EUR)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGES SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Language: German → English

This affects:
   - UI labels in generated code
   - Error messages
   - Verification scenarios
   - Documentation

Other settings unchanged.

Save changes? (y/n): y

✅ UI settings updated
```

## Edit Workflow Settings

```bash
/esf:settings --edit --category workflow
```

```
⚙️  Edit Workflow Settings

Current Settings:
   Auto-commit: Enabled
   Atomic Commits: Enabled
   Verification Required: Yes
   Auto-push: Disabled
   Browser Testing: Enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auto-commit after each task? [yes/no] (Enter to keep): yes

Require verification before completing sprint? [yes/no] (Enter to keep): yes

Auto-push commits to remote? [yes/no] (Enter to keep): no

⚠️  Warning: Auto-push can't be undone automatically.
           Only enable if you're confident in automatic commits.

Enable browser testing with agent-browser? [yes/no] (Enter to keep): yes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No changes made.

Continue editing other categories? (y/n): n
```

## Reset to Defaults

```bash
/esf:settings --reset
```

```
⚠️  Reset Settings to Defaults

This will reset ALL settings to framework defaults:
   - Model profile: balanced
   - UI language: German
   - Workflow: Auto-commit enabled, verification required
   - All other settings to defaults

Current customizations will be lost.

Are you sure? (y/n): y

Confirm by typing 'RESET': RESET

✅ Resetting settings...
✅ .planning/config.json reset to defaults
ℹ️  .claude/settings.local.json unchanged (permissions preserved)

Settings have been reset to defaults.
View current settings: /esf:settings
```

## Category-Specific Display

```bash
/esf:settings --category model
```

Shows only model configuration (faster than full display).

## View as JSON

```bash
/esf:settings --json
```

```json
{
  "model_profile": "balanced",
  "agents": {
    "uc-analyst": { "model": "sonnet" },
    "uc-modeler": { "model": "opus" },
    "uc-planner": { "model": "opus" },
    "uc-executor": { "model": "sonnet" },
    "uc-verifier": { "model": "sonnet" },
    "uc-checker": { "model": "sonnet" },
    "uc-sprint-researcher": { "model": "sonnet" },
    "uc-brownfield-mapper": { "model": "sonnet" }
  },
  "autopilot": {
    "checkpoint_mode": "queue",
    "max_retries": 3,
    "budget_limit_usd": 0,
    "notify_webhook": ""
  },
  "ui": {
    "language": "de",
    "date_format": "DD.MM.YYYY",
    "time_format": "24h",
    "currency": "EUR",
    "number_format": "european"
  },
  "workflow": {
    "auto_commit": true,
    "atomic_commits": true,
    "verification_required": true,
    "auto_push": false,
    "browser_testing": true
  },
  "session": {
    "auto_pause_on_error": false,
    "retention_days": 30,
    "auto_cleanup": true
  }
}
```

## Validation

Settings are validated before saving:

```
❌ Invalid Settings

Errors found:
   - model_profile: Must be 'quality', 'balanced', or 'budget'
   - ui.language: Must be 'de' or 'en'
   - workflow.auto_push: Cannot enable without git remote configured

Fix errors and try again, or cancel.
```

## Settings File Locations

```
.planning/config.json          - Project settings (model, ui, workflow)
.claude/settings.json          - Framework hooks (CLI status line)
.claude/settings.local.json    - Local permissions (Bash, WebFetch, etc.)
```

## Related Commands

- `/esf:set-profile [profile]` - Quick command to change model profile only
- `/esf:debug` - Diagnose configuration issues
- `/esf:progress` - View project progress (unaffected by these settings)

## Files Modified

- `.planning/config.json` - Updated with new settings
- `.claude/settings.json` - Only if editing hooks (rare)
- `.claude/settings.local.json` - Only if editing permissions (manual only)

## Implementation Details

This command should:

1. **Load all config files** - Read and merge settings
2. **Display formatted** - User-friendly table format
3. **Interactive editor** - For `--edit` mode with category selection
4. **Validate inputs** - Check settings before saving
5. **Show impact** - Explain what changes
6. **Save atomically** - Don't corrupt config if save fails
7. **Preserve comments** - If JSON has comments (via JSON5 or special handling)

The implementation should:
- **Be informative** - Explain each setting clearly
- **Be safe** - Validate before saving, show impact
- **Be convenient** - Provide shortcuts (--category, /esf:set-profile)
- **Be forgiving** - Allow cancel at any point
- **Handle missing files** - Create with defaults if needed
