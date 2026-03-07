---
description: Fully automated milestone execution from existing roadmap
argument-hint: "[--from-sprint N] [--dry-run] [--engine node|bash]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
Launch autonomous execution of all remaining sprints in the current milestone.

Each sprint: plan → execute → verify → handle gaps → next sprint.

**Two Engine Options:**

1. **Node.js/Ink (recommended)** — Flicker-free UI, portable across projects
   - Location: `use-case-driven/bin/autopilot/`
   - Run: `uc-autopilot --sprints "1,2,3,4"`

2. **Bash (fallback)** — Generated per-project script
   - Location: `.planning/autopilot.sh`
   - Run: `bash .planning/autopilot.sh`

Both provide infinite context (each claude invocation gets fresh 200k). State persists in `.planning/` enabling resume after interruption.

**TDD E2E Integration:**
Each sprint execution includes TDD cycle with Playwright E2E tests. Between sprints, a full regression test suite runs to ensure no regressions. Fix strategy uses agent-browser for fast pre-checks before running full E2E suite.

**Requires:**
- `.planning/PROJECT-PLAN.md` (run `/esf:new-project` then `/esf:use-case-analysis` first)
- For Bash: `jq` (JSON processor): `brew install jq`
- Playwright installed: `npx playwright install`
</objective>

<execution_context>
@./use-case-driven/references/ui-brand.md
@./use-case-driven/templates/autopilot-script.sh
@./use-case-driven/templates/prompts/plan-sprint-prompt.md
@./use-case-driven/templates/prompts/execute-sprint-prompt.md
@./use-case-driven/templates/prompts/complete-milestone-prompt.md
@./use-case-driven/references/model-profiles.md
</execution_context>

<context>
Arguments: $ARGUMENTS

**Flags:**
- `--from-sprint N` — Start from specific sprint (default: first incomplete)
- `--dry-run` — Show commands but don't run
- `--engine node|bash` — Force specific engine (default: auto-detect)
</context>

<process>

## 1. Validate Prerequisites

```bash
# Check roadmap exists
if [ ! -f .planning/PROJECT-PLAN.md ]; then
  echo "ERROR: No roadmap found. Run /esf:new-project then /esf:use-case-analysis first."
  exit 1
fi

# Check not already running
if [ -d .planning/autopilot.lock.d ]; then
  echo "ERROR: Autopilot already running (lock exists)"
  echo "To force restart: rmdir .planning/autopilot.lock.d"
  exit 1
fi
```

## 2. Parse Roadmap State

```bash
# Get all sprints from PROJECT-PLAN.md (format: ### Sprint N: Name)
ALL_PHASES=$(grep -E "^### Sprint [0-9]+:" .planning/PROJECT-PLAN.md | sed 's/.*Sprint \([0-9]*\):.*/\1/' | tr '\n' ' ')

# Determine completed vs incomplete sprints
INCOMPLETE=""
COMPLETED=""
for sprint in $ALL_PHASES; do
  PADDED=$(printf "%02d" "$sprint")
  SPRINT_DIR=$(ls -d .planning/sprints/${PADDED}-* 2>/dev/null | head -1)
  if [ -n "$SPRINT_DIR" ]; then
    VERIF_FILE=$(ls "$SPRINT_DIR"/*-VERIFICATION.md 2>/dev/null | head -1)
    if [ -f "$VERIF_FILE" ] && grep -q "status:.*passed" "$VERIF_FILE" 2>/dev/null; then
      COMPLETED="$COMPLETED $sprint"
    else
      INCOMPLETE="$INCOMPLETE $sprint"
    fi
  else
    INCOMPLETE="$INCOMPLETE $sprint"
  fi
done
```

**If no incomplete sprints:** Report milestone already complete, offer `/esf:complete-milestone`.

**If `--from-sprint N` specified:** Validate sprint exists, use as start point.

## 3. Load Config

```bash
# Read config values from .planning/config.json
CHECKPOINT_MODE=$(cat .planning/config.json 2>/dev/null | grep -o '"checkpoint_mode"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "queue")
MAX_RETRIES=$(cat .planning/config.json 2>/dev/null | grep -o '"max_retries"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' || echo "3")
BUDGET_LIMIT=$(cat .planning/config.json 2>/dev/null | grep -o '"budget_limit_usd"[[:space:]]*:[[:space:]]*[0-9.]*' | grep -o '[0-9.]*$' || echo "0")
WEBHOOK_URL=$(cat .planning/config.json 2>/dev/null | grep -o '"notify_webhook"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "")
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")

# Get project name
PROJECT_NAME=$(grep -E "^#[^#]" .planning/PROJECT.md 2>/dev/null | head -1 | sed 's/^# *//' || basename "$(pwd)")
```

## 4. Detect Available Engine

Check which autopilot engine is available:

```bash
# Check for Node.js autopilot
NODE_AUTOPILOT="use-case-driven/bin/autopilot"
NODE_AVAILABLE=false

if [ -d "$NODE_AUTOPILOT" ]; then
  if [ -f "$NODE_AUTOPILOT/src/index.tsx" ]; then
    if [ -d "$NODE_AUTOPILOT/node_modules" ]; then
      NODE_AVAILABLE=true
    else
      # Dependencies not installed yet
      echo "Node.js autopilot found but dependencies not installed."
      echo "Run: cd $NODE_AUTOPILOT && npm install"
    fi
  fi
fi

# Check for global uc-autopilot
if command -v uc-autopilot &> /dev/null; then
  NODE_AVAILABLE=true
  NODE_AUTOPILOT="uc-autopilot"
fi
```

## 5. Present Execution Plan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► AUTOPILOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Milestone:** [from PROJECT-PLAN.md]

| Status | Sprints |
|--------|--------|
| ✓ Complete | {completed_phases} |
| ○ Remaining | {incomplete_phases} |

**Settings:**
- Checkpoint mode: {queue|skip}
- Max retries: {N}
- Budget limit: ${N} (0 = unlimited)
- Notifications: {webhook|bell|none}
- Model profile: {quality|balanced|budget}
- E2E TDD: enabled
- E2E regression: between sprints
- E2E fix strategy: agent-browser-first

**Available Engines:**
- [x] Node.js/Ink (flicker-free UI) ← recommended
- [x] Bash (legacy)

───────────────────────────────────────────────────────────────
```

## 6. Ask User for Engine Choice (if both available)

Use AskUserQuestion if `--engine` not specified and both are available:

```
Which autopilot engine should we use?

1. Node.js/Ink (recommended)
   - Flicker-free terminal UI
   - Better progress visualization
   - Portable across projects

2. Bash (legacy)
   - Generates project-specific script
   - No additional dependencies (except jq)
   - Tried and tested
```

## 7a. Node.js Engine Instructions

If Node.js selected or `--engine node`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► AUTOPILOT READY (Node.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Run in a separate terminal

**If globally installed:**
```
cd {project_dir}
uc-autopilot --sprints "{incomplete_phases}" --project-name "{project_name}"
```

**If local only:**

First install dependencies (one-time):
```
cd use-case-driven/bin/autopilot
npm install
```

Then run:
```
cd {project_dir}
npx tsx use-case-driven/bin/autopilot/src/index.tsx \
  --sprints "{incomplete_phases}" \
  --project-name "{project_name}" \
  --max-retries {max_retries} \
  --budget {budget_limit} \
  --checkpoint-mode {checkpoint_mode}
```

───────────────────────────────────────────────────────────────
```

## 7b. Bash Engine Instructions

If Bash selected or `--engine bash`:

Generate script from template (as before) and present:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► AUTOPILOT READY (Bash)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Script generated: .planning/autopilot.sh

## Prerequisites

**Install jq (required for stream processing):**
```
brew install jq     # macOS
apt install jq      # Ubuntu/Debian
```

## Run in a separate terminal

**Attached (recommended — see output live):**
```
cd {project_dir} && bash .planning/autopilot.sh
```

**Background (for overnight runs):**
```
cd {project_dir} && nohup bash .planning/autopilot.sh > .planning/logs/autopilot.log 2>&1 &
```

**Monitor logs:**
```
tail -f .planning/logs/autopilot.log
```

───────────────────────────────────────────────────────────────
```

## 8. Update State

Update PROJECT-STATUS.md to mark autopilot as ready:

```markdown
## Autopilot

- **Mode:** ready
- **Engine:** {node|bash}
- **Prepared:** [timestamp]
- **Sprints:** {incomplete_phases}
- **Checkpoints Pending:** (none yet)
- **Last Error:** none
```

</process>

<bash_script_generation>
Only needed if Bash engine is selected.

Read template from `@./use-case-driven/templates/autopilot-script.sh` and fill:
- `{{project_dir}}` — Current directory (absolute path)
- `{{project_name}}` — From PROJECT.md
- `{{sprints}}` — Array of incomplete sprint numbers
- `{{checkpoint_mode}}` — queue or skip
- `{{max_retries}}` — From config
- `{{budget_limit}}` — From config (0 = unlimited)
- `{{webhook_url}}` — From config (empty = disabled)
- `{{model_profile}}` — From config
- `{{timestamp}}` — Current datetime

Write to `.planning/autopilot.sh` and ensure gitignore entries exist.
</bash_script_generation>

<prompt_templates>
Both engines use the same prompt template files:

```
use-case-driven/templates/prompts/
├── plan-sprint-prompt.md       # Planning a sprint
├── execute-sprint-prompt.md    # Executing a sprint
└── complete-milestone-prompt.md  # Completing milestone
```

**Placeholders substituted at runtime:**
- `{{SPRINT}}` — Sprint number
- `{{PROJECT_DIR}}` — Absolute project directory path
- `{{PADDED_SPRINT}}` — Zero-padded sprint number (01, 02, etc.)
- `{{SPRINT_DIR}}` — Relative path to sprint directory
- `{{SPRINT_NAME}}` — Sprint name (without number prefix)
- `{{VERSION}}` — Milestone version (for complete-milestone)
</prompt_templates>

<checkpoint_queue>
Plans with `autonomous: false` pause at checkpoints.

**Queue structure:**
```
.planning/checkpoints/
├── pending/
│   └── sprint-03-plan-02.json    # Waiting for user
└── approved/
    └── sprint-03-plan-02.json    # User approved, ready to continue
```

**Workflow:**
1. Executor hits checkpoint → writes to `pending/`
2. Autopilot logs checkpoint, continues with other sprints
3. User reviews `pending/` (manually or via `/esf:checkpoints`)
4. User creates approval in `approved/`
5. Next autopilot run picks up approval
</checkpoint_queue>

<success_criteria>
- [ ] Roadmap exists validation
- [ ] Lock directory prevents concurrent runs
- [ ] Incomplete sprints parsed from PROJECT-PLAN.md
- [ ] Config loaded (checkpoint mode, retries, budget, webhook)
- [ ] Engine detection (Node.js vs Bash)
- [ ] Execution plan presented clearly
- [ ] User knows to run in separate terminal
- [ ] PROJECT-STATUS.md updated
</success_criteria>
