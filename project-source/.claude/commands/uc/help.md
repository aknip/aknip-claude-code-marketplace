---
name: uc:help
description: Show available use case commands
allowed-tools:
  - Read
---

<objective>

Display all available /uc:* commands with descriptions and usage.

</objective>

<process>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► USE CASE DRIVEN GSD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RUP-based use case methodology for Claude Code projects.

## Project Initialization

/uc:new-project              Initialize project context and configuration
/uc:feature-exploration      Explore implementation scenarios (optional)
                             Interactive scenario exploration with clickdummies
                             and Mermaid roadmaps before use case analysis.
/uc:use-case-analysis        Extract use cases and create roadmap
/uc:analyze-requirements     Extract use cases from existing requirements
/uc:create-roadmap           Generate roadmap from use case hierarchy
/uc:map-codebase             Analyze existing codebase (brownfield projects)
                             --quick      Fast scan (2-3 min)
                             --detailed   Deep analysis (20+ min)

## Phase Workflow

/uc:discuss-phase [N]        Gather context through adaptive questioning
                             Run BEFORE planning to capture preferences

/uc:plan-phase [N]           Create execution plan from use cases
                             --skip-research    Skip phase research
                             --re-research      Force new research
                             --gaps             Create gap closure plans

/uc:execute-phase [N]        Execute plans with scenario verification

/uc:verify-phase [N]         Verify use case scenarios (standalone)

/uc:quick                    Execute small ad-hoc tasks with UC guarantees
                             Bypasses research/verification for speed

## Automated Execution

/uc:autopilot                Fully automated milestone execution
                             --from-phase N     Start from specific phase
                             --dry-run          Generate script only
                             --background       Run detached with nohup
                             Generates shell script for external terminal.
                             Executes: plan → execute → verify → next phase.

/uc:checkpoints              Review and approve pending human input
                             Interactive guided flow for checkpoints
                             created during autopilot execution.

## Milestone Management

/uc:complete-milestone       Mark milestone complete, create git tag, archive
                             --version X.Y.Z    Specify version
                             --tag-only         Create tag but don't archive

/uc:new-milestone            Start new milestone cycle (v2.0.0, v3.0.0, etc.)
                             --version X.Y.Z    Specify version
                             --interactive      Guided goal definition

/uc:audit-milestone          Check milestone readiness before completion
                             --detailed         Verbose output
                             --output FILE      Save report to file

## Phase Management

/uc:add-phase [name]         Add new phase to roadmap
                             --after N          Insert after phase N
                             --description "text"

/uc:insert-phase [name]      Insert phase at specific position
                             --at N             Insert at position N (required)

/uc:remove-phase [N]         Remove phase (archives, doesn't delete)
                             --reason "text"    Explain why removed
                             --force            Skip safety checks

/uc:renumber-phases          Fix phase numbering gaps
                             --dry-run          Show changes without applying

## Session Management

/uc:pause-work               Save session state for later resumption
                             --message "text"   Reason for pausing
                             --tag "label"      Tag for easy filtering

/uc:resume-work [ID]         Resume paused session
                             --continue         Auto-continue after loading
                             --list             Show available sessions

## Use Case Management

/uc:add-use-case [level]     Add new use case manually
                             summary | user-goal | subfunction

/uc:link-use-cases           Create include/extend relationships
                             [source] [target] [include|extend]

## Progress & Status

/uc:progress                 Show use case completion status

## Settings & Configuration

/uc:settings                 Display and manage framework settings
                             --show             Display settings (default)
                             --edit             Interactive editor
                             --category NAME    Edit specific category

/uc:set-profile [profile]    Quick change model profile
                             quality | balanced | budget

## TODO Management

/uc:add-todo "text"          Add persistent TODO item
                             --phase N          Assign to phase
                             --priority high|medium|low
                             --tag "label"      Tag for categorization

/uc:check-todos              List and manage TODOs
                             --phase N          Filter by phase
                             --priority X       Filter by priority
                             --done ID          Mark TODO complete
                             --all              Show completed TODOs

## Diagnostics & Utilities

/uc:debug                    Run framework diagnostics
                             --phase N          Debug specific phase
                             --verbose          Detailed output
                             --fix              Auto-fix common issues

/uc:list-phase-assumptions   Display phase implementation decisions
[N]                          From CONTEXT.md file

## Use Case Levels

┌─────────────────────────────────────────┐
│  SUMMARY (☁️)                            │
│  Business capabilities / Epics          │
│  Multiple user sessions                 │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  USER-GOAL (🌊)                          │
│  Single user session / Feature          │
│  Delivers measurable value              │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  SUBFUNCTION (🐟)                        │
│  Technical implementation step          │
│  Atomic operation                       │
└─────────────────────────────────────────┘

## ID Format

UC-S-XXX     Summary-Level
UC-UG-XXX    User-Goal-Level
UC-SF-XXX    Subfunction-Level

## Agents

uc-analyst   Extract use cases from requirements
uc-modeler   Create roadmap from use case hierarchy
uc-planner   Create plans from User-Goal scenarios
uc-executor  Implement Subfunction specifications
uc-verifier  Verify scenarios are achievable
uc-checker   Validate plan coverage (pre-execution)

## Typical Flow (Greenfield)

1. /uc:new-project              — Initialize project context
2. /uc:feature-exploration      — Explore scenarios with clickdummies (optional)
3. /uc:use-case-analysis        — Extract use cases & create roadmap
4. /uc:discuss-phase 1          — Capture preferences (optional)
5. /uc:plan-phase 1             — Create execution plans
6. /uc:execute-phase 1          — Implement and verify
7. /uc:complete-milestone       — Mark v1.0 complete
8. /uc:new-milestone            — Start v2.0
9. Repeat phases 4-6 for new features

## Fully Automated Flow

1. /uc:new-project              — Initialize project context
2. /uc:feature-exploration      — Explore scenarios (optional)
3. /uc:use-case-analysis        — Extract use cases & create roadmap
4. /uc:autopilot                — Generate automation script
5. Run script in separate terminal:
   cd project && bash .planning/autopilot.sh
6. /uc:checkpoints              — Handle any pending human input
7. /uc:complete-milestone       — Finalize when complete

## Typical Flow (Brownfield)

1. /uc:map-codebase             — Analyze existing code
2. /uc:new-project              — Initialize UC framework
3. /uc:feature-exploration      — Explore scenarios (optional)
4. /uc:use-case-analysis        — Extract use cases & create roadmap
5. /uc:add-phase [name]         — Add phases for new features
6. /uc:discuss-phase N          — Capture decisions
7. /uc:plan-phase N             — Plan integration
8. /uc:execute-phase N          — Implement following patterns
9. /uc:verify-phase N           — Verify scenarios

## Session Management Flow

1. Work on feature
2. /uc:pause-work               — End of day
3. (next day)
4. /uc:resume-work              — Continue where left off

## Ad-Hoc Tasks

/uc:quick                       — Small tasks outside phase workflow
                                  (bug fixes, tweaks, one-offs)

## GSD Coexistence

Both /gsd:* and /uc:* commands work together.
Use /uc:* for use case driven phases.
Use /gsd:* for feature-based phases.

Configuration in .planning/config.json:
  "specification_mode": "use-case" | "feature"
```

</process>
