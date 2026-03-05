---
description: Initialize project with use case driven analysis
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>

Initialize a new project using use case driven methodology. Gathers project context through deep questioning, identifies actors and business capabilities, and creates project configuration.

**Creates:**
- `.planning/PROJECT.md` — project context
- `.planning/config.json` — workflow preferences (with use case settings)

**After this command:** Run `/esf:use-case-analysis` to extract use cases and create the roadmap, or `/esf:feature-exploration` to explore implementation scenarios first.

</objective>

<execution_context>

@./use-case-driven/references/questioning.md
@./use-case-driven/references/ui-brand.md
@./use-case-driven/templates/project.md

</execution_context>

<process>

## Sprint 1: Setup

**MANDATORY FIRST STEP — Execute these checks before ANY user interaction:**

1. **Abort if project exists:**
   ```bash
   [ -f .planning/PROJECT.md ] && echo "ERROR: Project already initialized. Use /esf:progress" && exit 1
   ```

2. **Initialize git repo in THIS directory:**
   ```bash
   if [ -d .git ] || [ -f .git ]; then
       echo "Git repo exists in current directory"
   else
       git init
       echo "Initialized new git repo"
   fi
   ```

3. **Detect existing code (brownfield detection):**
   ```bash
   CODE_FILES=$(find . -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" -o -name "*.rs" 2>/dev/null | grep -v node_modules | grep -v .git | head -20)
   HAS_PACKAGE=$([ -f package.json ] || [ -f requirements.txt ] || [ -f Cargo.toml ] || [ -f go.mod ] && echo "yes")
   HAS_CODEBASE_MAP=$([ -d .planning/codebase ] && echo "yes")
   ```

## Sprint 2: Brownfield Offer

**If existing code detected and .planning/codebase/ doesn't exist:**

Use AskUserQuestion:
- header: "Code?"
- question: "I detected existing code. Would you like to map the codebase first?"
- options:
  - "Map codebase first" — Run /gsd:map-codebase to understand existing architecture (Recommended)
  - "Skip mapping" — Proceed with project initialization

**If "Map codebase first":** Run `/gsd:map-codebase` first, then return.

## Sprint 3: Deep Questioning

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► QUESTIONING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Open the conversation:**

Ask inline: "What do you want to build?"

Wait for response, then follow the thread with intelligent follow-up questions.

**Actor identification (USE CASE SPECIFIC):**

As you question, actively identify:
- **Primary actors:** Who will use this system?
- **Supporting actors:** What external systems interact?
- **Business capabilities:** What major things can users do?

Use AskUserQuestion to confirm actors:
- header: "Actors"
- question: "Who will use this system?"
- multiSelect: true
- options derived from conversation

**Decision gate:**

When you could write a clear PROJECT.md and have identified actors/capabilities:

Use AskUserQuestion:
- header: "Ready?"
- question: "I understand your vision. Ready to create PROJECT.md and extract use cases?"
- options:
  - "Create PROJECT.md" — Let's move forward
  - "Keep exploring" — I want to share more

## Sprint 4: Write PROJECT.md

Synthesize context into `.planning/PROJECT.md`.

**Include Actor section:**

```markdown
## Actors

| Actor | Type | Primary Goals |
|-------|------|---------------|
| [Actor 1] | End User | [Goals] |
| [Actor 2] | System | [Goals] |
```

**Commit PROJECT.md:**

```bash
mkdir -p .planning
git add .planning/PROJECT.md
git commit -m "docs: initialize project with actor identification"
```

## Sprint 5: Workflow Preferences

Same as /gsd:new-project but with use case specific options:

**Add use case specific question:**

```
questions: [
  {
    header: "Spec",
    question: "How do you want to specify requirements?",
    multiSelect: false,
    options: [
      { label: "Use Case Driven (Recommended)", description: "RUP-style use cases with scenarios" },
      { label: "Feature Based", description: "Traditional feature/requirement lists" }
    ]
  }
]
```

Create `.planning/config.json` with use case settings:

```json
{
  "mode": "yolo|interactive",
  "depth": "quick|standard|comprehensive",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget",
  "specification_mode": "use-case",
  "autopilot": {
    "checkpoint_mode": "queue",
    "max_retries": 3,
    "budget_limit_usd": 0,
    "notify_webhook": ""
  },
  "use_case": {
    "template_version": "1.0",
    "auto_tasks": true,
    "verify_scenarios": true,
    "browser_test_ui": true,
    "acceptance_format": "gherkin"
  },
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false
  },
  "milestone": {
    "current_version": "1.0.0",
    "auto_tag": true,
    "archive_on_complete": true
  },
  "session": {
    "auto_pause_on_error": false,
    "retention_days": 30,
    "auto_cleanup": true
  },
  "agents": {
    "uc-analyst": { "model": "sonnet" },
    "uc-modeler": { "model": "opus" },
    "uc-planner": { "model": "opus" },
    "uc-executor": { "model": "sonnet" },
    "uc-verifier": { "model": "sonnet" },
    "uc-checker": { "model": "sonnet" }
  }
}
```

**Create milestone and session directories:**

```bash
mkdir -p .planning/milestones
mkdir -p .planning/sessions
```

## Sprint 6: Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► PROJECT CONTEXT INITIALIZED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Project Name]**

| Artifact       | Location                    |
|----------------|-----------------------------|
| Project        | `.planning/PROJECT.md`      |
| Config         | `.planning/config.json`     |

───────────────────────────────────────────────────────

## ▶ Next Up

**Option A: Use Case Analysis & Roadmap** (direct path)

`/esf:use-case-analysis`

**Option B: Feature Exploration** (explore scenarios first)

`/esf:feature-exploration`

Explore implementation scenarios with HTML clickdummies
and Mermaid roadmaps before committing to a roadmap.

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────

**Also available:**
- `/esf:progress` — view use case completion status
- `/esf:help` — show all available commands

───────────────────────────────────────────────────────
```

</process>

<success_criteria>

- [ ] Git repo initialized
- [ ] Brownfield detection completed
- [ ] Deep questioning with actor identification
- [ ] PROJECT.md with actors section → committed
- [ ] config.json with use case settings → committed
- [ ] User knows next step is `/esf:use-case-analysis` or `/esf:feature-exploration`

</success_criteria>
