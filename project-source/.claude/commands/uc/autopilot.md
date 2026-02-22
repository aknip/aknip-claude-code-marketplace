---
name: uc:autopilot
description: Fully automated milestone execution from existing roadmap
argument-hint: "[--from-phase N] [--dry-run] [--engine node|bash]"
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
Launch autonomous execution of all remaining phases in the current milestone.

Each phase: plan → execute → verify → handle gaps → next phase.

**Two Engine Options:**

1. **Node.js/Ink (recommended)** — Flicker-free UI, portable across projects
   - Location: `.claude/use-case-driven/bin/autopilot/`
   - Run: `uc-autopilot --phases "1,2,3,4"`

2. **Bash (fallback)** — Generated per-project script
   - Location: `.planning/autopilot.sh`
   - Run: `bash .planning/autopilot.sh`

Both provide infinite context (each claude invocation gets fresh 200k). State persists in `.planning/` enabling resume after interruption.

**TDD E2E Integration:**
Each phase execution includes TDD cycle with Playwright E2E tests. Between phases, a full regression test suite runs to ensure no regressions. Fix strategy uses agent-browser for fast pre-checks before running full E2E suite.

**Requires:**
- `.planning/ROADMAP.md` (run `/uc:new-project` then `/uc:use-case-analysis` first)
- For Bash: `jq` (JSON processor): `brew install jq`
- Playwright installed: `npx playwright install`
</objective>

<execution_context>
@./.claude/use-case-driven/references/ui-brand.md
@./.claude/use-case-driven/templates/autopilot-script.sh
@./.claude/use-case-driven/templates/prompts/plan-phase-prompt.md
@./.claude/use-case-driven/templates/prompts/execute-phase-prompt.md
@./.claude/use-case-driven/templates/prompts/complete-milestone-prompt.md
@./.claude/use-case-driven/references/model-profiles.md
</execution_context>

<context>
Arguments: $ARGUMENTS

**Flags:**
- `--from-phase N` — Start from specific phase (default: first incomplete)
- `--dry-run` — Show commands but don't run
- `--engine node|bash` — Force specific engine (default: auto-detect)
</context>

<process>

## 1. Validate Prerequisites

```bash
# Check roadmap exists
if [ ! -f .planning/ROADMAP.md ]; then
  echo "ERROR: No roadmap found. Run /uc:new-project then /uc:use-case-analysis first."
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
# Get all phases from ROADMAP.md (format: ### Phase N: Name)
ALL_PHASES=$(grep -E "^### Phase [0-9]+:" .planning/ROADMAP.md | sed 's/.*Phase \([0-9]*\):.*/\1/' | tr '\n' ' ')

# Determine completed vs incomplete phases
INCOMPLETE=""
COMPLETED=""
for phase in $ALL_PHASES; do
  PADDED=$(printf "%02d" "$phase")
  PHASE_DIR=$(ls -d .planning/phases/${PADDED}-* 2>/dev/null | head -1)
  if [ -n "$PHASE_DIR" ]; then
    VERIF_FILE=$(ls "$PHASE_DIR"/*-VERIFICATION.md 2>/dev/null | head -1)
    if [ -f "$VERIF_FILE" ] && grep -q "status:.*passed" "$VERIF_FILE" 2>/dev/null; then
      COMPLETED="$COMPLETED $phase"
    else
      INCOMPLETE="$INCOMPLETE $phase"
    fi
  else
    INCOMPLETE="$INCOMPLETE $phase"
  fi
done
```

**If no incomplete phases:** Report milestone already complete, offer `/uc:complete-milestone`.

**If `--from-phase N` specified:** Validate phase exists, use as start point.

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
NODE_AUTOPILOT=".claude/use-case-driven/bin/autopilot"
NODE_AVAILABLE=false

if [ -d "$NODE_AUTOPILOT" ]; then
  if [ -f "$NODE_AUTOPILOT/dist/index.js" ]; then
    NODE_AVAILABLE=true
  elif [ -f "$NODE_AUTOPILOT/package.json" ]; then
    # Not built yet - offer to build
    echo "Node.js autopilot found but not built."
    echo "Run: cd $NODE_AUTOPILOT && npm install && npm run build"
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

**Milestone:** [from ROADMAP.md]

| Status | Phases |
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
- E2E regression: between phases
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
uc-autopilot --phases "{incomplete_phases}" --project-name "{project_name}"
```

**If local only:**
```
cd {project_dir}
node .claude/use-case-driven/bin/autopilot/dist/index.js \
  --phases "{incomplete_phases}" \
  --project-name "{project_name}" \
  --max-retries {max_retries} \
  --budget {budget_limit} \
  --checkpoint-mode {checkpoint_mode}
```

**First-time setup (if not built):**
```
cd .claude/use-case-driven/bin/autopilot
npm install
npm run build
npm link  # optional: makes uc-autopilot available globally
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

Update STATE.md to mark autopilot as ready:

```markdown
## Autopilot

- **Mode:** ready
- **Engine:** {node|bash}
- **Prepared:** [timestamp]
- **Phases:** {incomplete_phases}
- **Checkpoints Pending:** (none yet)
- **Last Error:** none
```

</process>

<bash_script_generation>
Only needed if Bash engine is selected.

Read template from `@./.claude/use-case-driven/templates/autopilot-script.sh` and fill:
- `{{project_dir}}` — Current directory (absolute path)
- `{{project_name}}` — From PROJECT.md
- `{{phases}}` — Array of incomplete phase numbers
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
.claude/use-case-driven/templates/prompts/
├── plan-phase-prompt.md       # Planning a phase
├── execute-phase-prompt.md    # Executing a phase
└── complete-milestone-prompt.md  # Completing milestone
```

**Placeholders substituted at runtime:**
- `{{PHASE}}` — Phase number
- `{{PROJECT_DIR}}` — Absolute project directory path
- `{{PADDED_PHASE}}` — Zero-padded phase number (01, 02, etc.)
- `{{PHASE_DIR}}` — Relative path to phase directory
- `{{PHASE_NAME}}` — Phase name (without number prefix)
- `{{VERSION}}` — Milestone version (for complete-milestone)
</prompt_templates>

<checkpoint_queue>
Plans with `autonomous: false` pause at checkpoints.

**Queue structure:**
```
.planning/checkpoints/
├── pending/
│   └── phase-03-plan-02.json    # Waiting for user
└── approved/
    └── phase-03-plan-02.json    # User approved, ready to continue
```

**Workflow:**
1. Executor hits checkpoint → writes to `pending/`
2. Autopilot logs checkpoint, continues with other phases
3. User reviews `pending/` (manually or via `/uc:checkpoints`)
4. User creates approval in `approved/`
5. Next autopilot run picks up approval
</checkpoint_queue>

<success_criteria>
- [ ] Roadmap exists validation
- [ ] Lock directory prevents concurrent runs
- [ ] Incomplete phases parsed from ROADMAP.md
- [ ] Config loaded (checkpoint mode, retries, budget, webhook)
- [ ] Engine detection (Node.js vs Bash)
- [ ] Execution plan presented clearly
- [ ] User knows to run in separate terminal
- [ ] STATE.md updated
</success_criteria>
