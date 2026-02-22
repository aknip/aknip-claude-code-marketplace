---
name: help
description: Show available use case commands
allowed-tools:
  - Read
---

<objective>

Display all available /esf:* commands with descriptions and usage.

</objective>

<process>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► USE CASE DRIVEN GSD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RUP-based use case methodology for Claude Code projects.

## Project Initialization

/esf:new-project              Initialize project context and configuration
/esf:feature-exploration      Explore implementation scenarios (optional)
                             Interactive scenario exploration with clickdummies
                             and Mermaid roadmaps before use case analysis.
/esf:use-case-analysis        Extract use cases and create roadmap
/esf:analyze-requirements     Extract use cases from existing requirements
/esf:create-roadmap           Generate roadmap from use case hierarchy
/esf:map-codebase             Analyze existing codebase (brownfield projects)
                             --quick      Fast scan (2-3 min)
                             --detailed   Deep analysis (20+ min)

## Phase Workflow

/esf:discuss-phase [N]        Gather context through adaptive questioning
                             Run BEFORE planning to capture preferences

/esf:plan-phase [N]           Create execution plan from use cases
                             --skip-research    Skip phase research
                             --re-research      Force new research
                             --gaps             Create gap closure plans

/esf:execute-phase [N]        Execute plans with scenario verification

/esf:verify-phase [N]         Verify use case scenarios (standalone)

/esf:quick                    Execute small ad-hoc tasks with UC guarantees
                             Bypasses research/verification for speed

## Automated Execution

/esf:autopilot                Fully automated milestone execution
                             --from-phase N     Start from specific phase
                             --dry-run          Generate script only
                             --background       Run detached with nohup
                             Generates shell script for external terminal.
                             Executes: plan → execute → verify → next phase.

/esf:checkpoints              Review and approve pending human input
                             Interactive guided flow for checkpoints
                             created during autopilot execution.

## Milestone Management

/esf:complete-milestone       Mark milestone complete, create git tag, archive
                             --version X.Y.Z    Specify version
                             --tag-only         Create tag but don't archive

/esf:new-milestone            Start new milestone cycle (v2.0.0, v3.0.0, etc.)
                             --version X.Y.Z    Specify version
                             --interactive      Guided goal definition

/esf:audit-milestone          Check milestone readiness before completion
                             --detailed         Verbose output
                             --output FILE      Save report to file

## Phase Management

/esf:add-phase [name]         Add new phase to roadmap
                             --after N          Insert after phase N
                             --description "text"

/esf:insert-phase [name]      Insert phase at specific position
                             --at N             Insert at position N (required)

/esf:remove-phase [N]         Remove phase (archives, doesn't delete)
                             --reason "text"    Explain why removed
                             --force            Skip safety checks

/esf:renumber-phases          Fix phase numbering gaps
                             --dry-run          Show changes without applying

## Session Management

/esf:pause-work               Save session state for later resumption
                             --message "text"   Reason for pausing
                             --tag "label"      Tag for easy filtering

/esf:resume-work [ID]         Resume paused session
                             --continue         Auto-continue after loading
                             --list             Show available sessions

## Use Case Management

/esf:add-use-case [level]     Add new use case manually
                             summary | user-goal | subfunction

/esf:link-use-cases           Create include/extend relationships
                             [source] [target] [include|extend]

## Progress & Status

/esf:progress                 Show use case completion status

## Settings & Configuration

/esf:settings                 Display and manage framework settings
                             --show             Display settings (default)
                             --edit             Interactive editor
                             --category NAME    Edit specific category

/esf:set-profile [profile]    Quick change model profile
                             quality | balanced | budget

## TODO Management

/esf:add-todo "text"          Add persistent TODO item
                             --phase N          Assign to phase
                             --priority high|medium|low
                             --tag "label"      Tag for categorization

/esf:check-todos              List and manage TODOs
                             --phase N          Filter by phase
                             --priority X       Filter by priority
                             --done ID          Mark TODO complete
                             --all              Show completed TODOs

## Diagnostics & Utilities

/esf:debug                    Run framework diagnostics
                             --phase N          Debug specific phase
                             --verbose          Detailed output
                             --fix              Auto-fix common issues

/esf:list-phase-assumptions   Display phase implementation decisions
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

1. /esf:new-project              — Initialize project context
2. /esf:feature-exploration      — Explore scenarios with clickdummies (optional)
3. /esf:use-case-analysis        — Extract use cases & create roadmap
4. /esf:discuss-phase 1          — Capture preferences (optional)
5. /esf:plan-phase 1             — Create execution plans
6. /esf:execute-phase 1          — Implement and verify
7. /esf:complete-milestone       — Mark v1.0 complete
8. /esf:new-milestone            — Start v2.0
9. Repeat phases 4-6 for new features

## Fully Automated Flow

1. /esf:new-project              — Initialize project context
2. /esf:feature-exploration      — Explore scenarios (optional)
3. /esf:use-case-analysis        — Extract use cases & create roadmap
4. /esf:autopilot                — Generate automation script
5. Run script in separate terminal:
   cd project && bash .planning/autopilot.sh
6. /esf:checkpoints              — Handle any pending human input
7. /esf:complete-milestone       — Finalize when complete

## Typical Flow (Brownfield)

1. /esf:map-codebase             — Analyze existing code
2. /esf:new-project              — Initialize UC framework
3. /esf:feature-exploration      — Explore scenarios (optional)
4. /esf:use-case-analysis        — Extract use cases & create roadmap
5. /esf:add-phase [name]         — Add phases for new features
6. /esf:discuss-phase N          — Capture decisions
7. /esf:plan-phase N             — Plan integration
8. /esf:execute-phase N          — Implement following patterns
9. /esf:verify-phase N           — Verify scenarios

## Session Management Flow

1. Work on feature
2. /esf:pause-work               — End of day
3. (next day)
4. /esf:resume-work              — Continue where left off

## Ad-Hoc Tasks

/esf:quick                       — Small tasks outside phase workflow
                                  (bug fixes, tweaks, one-offs)

## GSD Coexistence

Both /gsd:* and /esf:* commands work together.
Use /esf:* for use case driven phases.
Use /gsd:* for feature-based phases.

Configuration in .planning/config.json:
  "specification_mode": "use-case" | "feature"
```

</process>
