---
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
/esf:create-project-plan           Generate roadmap from use case hierarchy
/esf:map-codebase             Analyze existing codebase (brownfield projects)
                             --quick      Fast scan (2-3 min)
                             --detailed   Deep analysis (20+ min)

## Sprint Workflow

/esf:discuss-sprint [N]        Gather context through adaptive questioning
                             Run BEFORE planning to capture preferences

/esf:plan-sprint [N]           Create execution plan from use cases
                             --skip-research    Skip sprint research
                             --re-research      Force new research
                             --gaps             Create gap closure plans

/esf:execute-sprint [N]        Execute plans with scenario verification

/esf:verify-sprint [N]         Verify use case scenarios (standalone)

/esf:quick                    Execute small ad-hoc tasks with UC guarantees
                             Bypasses research/verification for speed

## Automated Execution

/esf:autopilot                Fully automated milestone execution
                             --from-sprint N     Start from specific sprint
                             --dry-run          Generate script only
                             --background       Run detached with nohup
                             Generates shell script for external terminal.
                             Executes: plan → execute → verify → next sprint.

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

## Sprint Management

/esf:add-sprint [name]         Add new sprint to roadmap
                             --after N          Insert after sprint N
                             --description "text"

/esf:insert-sprint [name]      Insert sprint at specific position
                             --at N             Insert at position N (required)

/esf:remove-sprint [N]         Remove sprint (archives, doesn't delete)
                             --reason "text"    Explain why removed
                             --force            Skip safety checks

/esf:renumber-sprints          Fix sprint numbering gaps
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
                             summary | epic | task

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
                             --sprint N          Assign to sprint
                             --priority high|medium|low
                             --tag "label"      Tag for categorization

/esf:check-todos              List and manage TODOs
                             --sprint N          Filter by sprint
                             --priority X       Filter by priority
                             --done ID          Mark TODO complete
                             --all              Show completed TODOs

## Diagnostics & Utilities

/esf:debug                    Run framework diagnostics
                             --sprint N          Debug specific sprint
                             --verbose          Detailed output
                             --fix              Auto-fix common issues

/esf:list-sprint-assumptions   Display sprint implementation decisions
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

UC-OBJ-XXX     Objectives
UC-EP-XXX    Epic-Level
UC-TK-XXX    Task-Level

## Agents

uc-analyst   Extract use cases from requirements
uc-modeler   Create roadmap from use case hierarchy
uc-planner   Create plans from Epic scenarios
uc-executor  Implement Task specifications
uc-verifier  Verify scenarios are achievable
uc-checker   Validate plan coverage (pre-execution)

## Typical Flow (Greenfield)

1. /esf:new-project              — Initialize project context
2. /esf:feature-exploration      — Explore scenarios with clickdummies (optional)
3. /esf:use-case-analysis        — Extract use cases & create roadmap
4. /esf:discuss-sprint 1          — Capture preferences (optional)
5. /esf:plan-sprint 1             — Create execution plans
6. /esf:execute-sprint 1          — Implement and verify
7. /esf:complete-milestone       — Mark v1.0 complete
8. /esf:new-milestone            — Start v2.0
9. Repeat sprints 4-6 for new features

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
5. /esf:add-sprint [name]         — Add sprints for new features
6. /esf:discuss-sprint N          — Capture decisions
7. /esf:plan-sprint N             — Plan integration
8. /esf:execute-sprint N          — Implement following patterns
9. /esf:verify-sprint N           — Verify scenarios

## Session Management Flow

1. Work on feature
2. /esf:pause-work               — End of day
3. (next day)
4. /esf:resume-work              — Continue where left off

## Ad-Hoc Tasks

/esf:quick                       — Small tasks outside sprint workflow
                                  (bug fixes, tweaks, one-offs)

## GSD Coexistence

Both /gsd:* and /esf:* commands work together.
Use /esf:* for use case driven sprints.
Use /gsd:* for feature-based sprints.

Configuration in .planning/config.json:
  "specification_mode": "use-case" | "feature"
```

</process>
