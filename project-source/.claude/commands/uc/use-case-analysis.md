---
name: uc:use-case-analysis
description: Extract use cases and create roadmap from project context
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>

Extract business capabilities as Summary-Level use cases, decompose to User-Goal use cases, and create a use case driven roadmap.

**Requires:** `.planning/PROJECT.md` and `.planning/config.json` (created by `/uc:new-project`)

**Creates:**
- `.planning/use-cases/summary/` — Summary-Level use cases
- `.planning/use-cases/user-goal/` — User-Goal use cases
- `.planning/use-cases/index.md` — traceability index
- `.planning/ROADMAP.md` — use case driven roadmap
- `.planning/STATE.md` — use case progress tracking

**After this command:** Run `/uc:plan-phase 1` to start execution.

</objective>

<execution_context>

@./.claude/use-case-driven/references/questioning.md
@./.claude/use-case-driven/references/ui-brand.md
@.planning/templates/UC-SUMMARY.md
@.planning/templates/UC-USER-GOAL.md
@.planning/templates/UC-INDEX.md

</execution_context>

<process>

## Phase 1: Prerequisites Check

**MANDATORY FIRST STEP — Execute these checks before ANY further processing:**

1. **Abort if PROJECT.md missing:**
   ```bash
   [ ! -f .planning/PROJECT.md ] && echo "ERROR: No project found. Run /uc:new-project first." && exit 1
   ```

2. **Abort if config.json missing:**
   ```bash
   [ ! -f .planning/config.json ] && echo "ERROR: No config found. Run /uc:new-project first." && exit 1
   ```

3. **Abort if use cases already exist:**
   ```bash
   if [ -f .planning/use-cases/index.md ]; then
       echo "ERROR: Use cases already extracted. Use /uc:progress to check status."
       exit 1
   fi
   ```

4. **Check for exploration context (optional):**
   ```bash
   if [ -f .planning/scenarios/final/FINAL-SCENARIO.md ]; then
     echo "Finales Exploration-Szenario gefunden — wird als zusätzlicher Kontext verwendet"
   fi
   ```

5. **Read project context:**
   ```bash
   cat .planning/PROJECT.md
   cat .planning/config.json
   ```

## Phase 2: Use Case Analysis

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► ANALYZING USE CASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-analyst...
```

Create use-cases directory structure:

```bash
mkdir -p .planning/use-cases/{summary,user-goal,subfunction}
mkdir -p .planning/milestones
mkdir -p .planning/sessions
touch .planning/use-cases/.gitkeep
touch .planning/use-cases/summary/.gitkeep
touch .planning/use-cases/user-goal/.gitkeep
touch .planning/use-cases/subfunction/.gitkeep
```

Spawn uc-analyst agent:

**If `.planning/scenarios/final/FINAL-SCENARIO.md` exists**, include it as exploration context:

```
Task(prompt="
<task>
Read ./.claude/agents/uc-analyst.md for your role and instructions.

Extract and structure use cases from this project.
</task>

<project_context>
@.planning/PROJECT.md
</project_context>

<exploration_context>
@.planning/scenarios/final/FINAL-SCENARIO.md
Use the exploration scenario as additional input:
- Proposed User-Goal Use Cases (UG-E-XXX) as starting point
- Feature list for prioritization
- Suggested roadmap phases as orientation
- UI concepts for scenario descriptions
Note: UG-E IDs will be mapped to official UC-UG-XXX IDs.
Not all UG-E entries must be adopted 1:1 — you may merge, split, or supplement.
</exploration_context>

<templates>
Summary-Level: @.planning/templates/UC-SUMMARY.md
User-Goal-Level: @.planning/templates/UC-USER-GOAL.md
Index: @.planning/templates/UC-INDEX.md
</templates>

<output>
1. Create Summary-Level use cases in .planning/use-cases/summary/
2. Create User-Goal-Level use cases in .planning/use-cases/user-goal/
3. Create index.md in .planning/use-cases/
4. Commit all use case documents
5. Return USE CASE ANALYSIS COMPLETE with hierarchy
</output>
", subagent_type="uc-analyst", description="Extract use cases")
```

**If no exploration context exists**, omit the `<exploration_context>` block and spawn without it:

```
Task(prompt="
<task>
Read ./.claude/agents/uc-analyst.md for your role and instructions.

Extract and structure use cases from this project.
</task>

<project_context>
@.planning/PROJECT.md
</project_context>

<templates>
Summary-Level: @.planning/templates/UC-SUMMARY.md
User-Goal-Level: @.planning/templates/UC-USER-GOAL.md
Index: @.planning/templates/UC-INDEX.md
</templates>

<output>
1. Create Summary-Level use cases in .planning/use-cases/summary/
2. Create User-Goal-Level use cases in .planning/use-cases/user-goal/
3. Create index.md in .planning/use-cases/
4. Commit all use case documents
5. Return USE CASE ANALYSIS COMPLETE with hierarchy
</output>
", subagent_type="uc-analyst", description="Extract use cases")
```

**Present use case hierarchy:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► USE CASES EXTRACTED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Use Case Hierarchy

**UC-S-001: [Summary Name]**
├── UC-UG-001: [User-Goal] [Must]
├── UC-UG-002: [User-Goal] [Should]
└── UC-UG-003: [User-Goal] [Could]

**UC-S-002: [Summary Name]**
├── UC-UG-004: [User-Goal] [Must]
└── UC-UG-005: [User-Goal] [Should]
```

Use AskUserQuestion:
- header: "Use Cases"
- question: "Does this hierarchy capture your project?"
- options:
  - "Approve" — Continue to roadmap
  - "Adjust" — Tell me what to change

## Phase 3: Create Roadmap

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► CREATING ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning uc-modeler...
```

Spawn uc-modeler agent:

```
Task(prompt="
<task>
Read ./.claude/agents/uc-modeler.md for your role and instructions.

Create roadmap from use case hierarchy.
</task>

<use_cases>
@.planning/use-cases/index.md
</use_cases>

<project_context>
@.planning/PROJECT.md
@.planning/config.json
</project_context>

<output>
1. Create .planning/ROADMAP.md with phases derived from use cases
2. Create/update .planning/STATE.md with use case tracking
3. Update User-Goal use cases with phase assignments
4. Update index.md with phase mapping
5. Commit all artifacts
6. Return ROADMAP CREATED with summary
</output>
", subagent_type="uc-modeler", description="Create roadmap")
```

**Present roadmap:**

```
## Proposed Roadmap

| Phase | Goal | Use Cases | Priority |
|-------|------|-----------|----------|
| 1 | [Goal] | UC-UG-001, UC-UG-002 | Must |
| 2 | [Goal] | UC-UG-003 | Should |
```

Use AskUserQuestion for approval:
- header: "Roadmap"
- question: "Does this roadmap structure work?"
- options:
  - "Approve" — Commit and continue
  - "Adjust" — Tell me what to change

## Phase 4: Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► USE CASE ANALYSIS COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Project Name]**

| Artifact       | Location                    |
|----------------|-----------------------------|
| Project        | `.planning/PROJECT.md`      |
| Use Cases      | `.planning/use-cases/`      |
| Index          | `.planning/use-cases/index.md` |
| Roadmap        | `.planning/ROADMAP.md`      |

**[N] phases** | **[X] use cases** | **v1.0.0** | Ready to build ✓

**Milestone tracking initialized**
- Version: v1.0.0
- Session management: Enabled
- Progress tracking: Active

───────────────────────────────────────────────────────

## ▶ Next Up

**Phase 1: [Phase Name]** — [Goal]

`/uc:plan-phase 1`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────

**Also available:**
- `/uc:discuss-phase 1` — gather context through discussion before planning
- `/uc:progress` — view use case completion status
- `/uc:help` — show all available commands

───────────────────────────────────────────────────────
```

</process>

<success_criteria>

- [ ] Prerequisites verified (PROJECT.md, config.json exist)
- [ ] Exploration context detected and passed to uc-analyst (if FINAL-SCENARIO.md exists)
- [ ] uc-analyst spawned and completed
- [ ] Summary-Level use cases created
- [ ] User-Goal use cases created
- [ ] index.md with traceability → committed
- [ ] uc-modeler spawned and completed
- [ ] ROADMAP.md with use case mapping → committed
- [ ] STATE.md with use case tracking → committed
- [ ] User knows next step is `/uc:plan-phase 1`

</success_criteria>
