# UC Autopilot (Node.js/Ink)

Terminal UI for autonomous phase execution across **any** UC-driven project.


Der Node. js Autopilot ruft Claude 2x pro Phase auf:

Phase 2:
_ Claude Aufruf 1: plan-phase-2.prompt-md (falls keine Pläne
existieren)
— Claude Aufruf 2: execute-phase-2.prompt.md (führt ALLE Teilpläne aus

Ablauf im Detail
Schritt: 1
CLaude-Aufruf: plan-phase-N.prompt.md
Was passiert: Erstellt 02-01-PLAN, 02-02-PLAN, 02-03-PLAN

Schritt: 2
CLaude-Aufruf: execute-phase-N.prompt.md
Was passiert: Führt alle Pläne der Phase aus (Wave 1, dann Wave 2, etc.)

Schritt: 3
Claude-Aufruf: (optional) Gap Closure
Was passiert: Wenn Verification Lücken findet
Das bedeutet:

- Phase 2 mit 3 Plänen (02-01, 02-02, 02-03) = 1-2 Claude-Aufrufe
- Die Teilpläne werden innerhalb eines Claude-Aufrufs sequentiell/parallel
ausgeführt
- Jeder Claude-Aufruf hat 200k Context zur Verfügung

Vergleich zur Bash-Version

Die Bash-Version (autopilot-sh) funktioniert identisch - auch dort wird
Claude pro Phase aufgerufen, nicht pro Teilplan.

Wichtig: Die Ausführung der einzelnen Pläne (02-01, 02-02, etc.) geschieht
durch den uc-executor Agent, der innerhalb des Claude-Aufrufs spawnt. Das
ist also ein Sub-Agent, kein neuer Claude-Prozess.


## Installation

```bash
# From any UC project root
cd .claude/use-case-driven/bin/autopilot
npm install
npm run build
```

### Global Installation (Recommended)

```bash
# Link globally for use from any project
cd .claude/use-case-driven/bin/autopilot
npm link

# Now available anywhere
uc-autopilot --help
```

## Usage

```bash
# From project root (uses current directory)
uc-autopilot --phases "1,2,3,4"

# Explicit project directory
uc-autopilot --project-dir /path/to/project --phases "1,2,3,4"

# With all options
uc-autopilot \
  --project-dir /path/to/project \
  --project-name "My Project" \
  --phases "1,2,3,4" \
  --max-retries 3 \
  --budget 50 \
  --checkpoint-mode queue
```

### Development Mode

```bash
# Run without building (slower startup)
npx tsx src/index.tsx --project-dir /path/to/project --phases "1,2,3"

# Or via bin script
node bin/autopilot.js --project-dir /path/to/project --phases "1,2,3"
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --project-dir <path>` | Project directory | Current directory |
| `-n, --project-name <name>` | Project display name | "Project" |
| `-p, --phases <phases>` | Comma-separated phase numbers | "1" |
| `-c, --checkpoint-mode <mode>` | queue, pause, or skip | "queue" |
| `-r, --max-retries <n>` | Max retries per phase | 3 |
| `-b, --budget <amount>` | Budget limit in USD (0 = unlimited) | 0 |
| `-w, --webhook <url>` | Webhook URL for notifications | - |
| `-m, --model-profile <profile>` | fast, balanced, thorough | "balanced" |
| `--dry-run` | Run without executing Claude | false |
| `-v, --verbose` | Enable verbose logging | false |

## Prerequisites

A UC project requires:

```
.planning/
├── ROADMAP.md              # Phase definitions (required)
├── STATE.md                # Execution state (auto-created)
└── phases/                 # Phase directories (auto-created)

.claude/use-case-driven/
└── templates/prompts/      # Prompt templates (required)
    ├── plan-phase-prompt.md
    ├── execute-phase-prompt.md
    └── complete-milestone-prompt.md
```

## Architecture

```
src/
├── index.tsx              # Entry point + main app
├── App.tsx                # Main Ink component
├── cli.ts                 # CLI utilities & banners
├── components/            # UI components
│   ├── Header.tsx         # Project name + phase counter
│   ├── PhaseInfo.tsx      # Current phase details
│   ├── StageProgress.tsx  # Completed stages
│   ├── CurrentStage.tsx   # Active stage with spinner
│   ├── ActivityFeed.tsx   # Last 10 actions
│   ├── ProgressBar.tsx    # Visual progress
│   └── TokenCounter.tsx   # Token/cost display
├── context/
│   └── autopilot-context.tsx  # Global state provider
├── execution/
│   ├── execute-phase.ts   # Single phase execution
│   └── main-loop.ts       # Main execution loop
├── hooks/
│   ├── useTimer.ts        # Elapsed time tracking
│   └── useActivityLog.ts  # Activity feed management
├── services/
│   ├── claude-runner.ts   # Claude CLI spawning
│   ├── stream-parser.ts   # NDJSON → Events
│   ├── prompt-generator.ts
│   ├── git-safety.ts
│   ├── state-manager.ts
│   ├── cost-tracker.ts
│   ├── phase-loader.ts
│   └── checkpoint-handler.ts
├── types/
│   ├── events.ts          # Stream event types
│   └── config.ts          # Configuration schema
└── utils/
    ├── format.ts          # Time/number formatting
    └── icons.ts           # Terminal icons
```

## Features

- **Flicker-free UI**: Uses Ink for smooth terminal rendering
- **Real-time streaming**: Processes Claude CLI stream-json output
- **Stage tracking**: RESEARCH → PLANNING → BUILDING → VERIFYING
- **Activity feed**: Shows last 10 actions with icons
- **Progress bar**: Visual phase completion tracking
- **Token tracking**: Real-time token/cost monitoring
- **Budget limits**: Automatic stop when budget exceeded
- **Git safety**: Commits orphaned files before phase changes
- **Checkpoints**: Queue decisions for human review
- **Cross-project**: Works with any UC-driven project
- **Rate limit handling**: Automatically waits for rate limit reset + 2 minute buffer, then retries without counting against max retries

## Comparison: Node.js vs Bash

| Feature | Node.js (this) | Bash (autopilot.sh) |
|---------|----------------|---------------------|
| UI | Flicker-free (Ink) | Flicker (clear/render) |
| Config | CLI arguments | Generated inline |
| Portable | Yes | No (project-specific) |
| Type safety | TypeScript + Zod | None |
| Maintenance | Modular | Single 1500-line script |

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Type check
npx tsc --noEmit

# Run in dry-run mode (no Claude calls)
npx tsx src/index.tsx --dry-run --project-dir /path/to/project --phases "1"
```

## Troubleshooting

### "Claude CLI not found"
```bash
npm install -g @anthropic-ai/claude-cli
```

### "Prompt templates not found"
Ensure your project has `.claude/use-case-driven/templates/prompts/` with the required templates.

### "ROADMAP.md not found"
Run `/esf:new-project` then `/esf:use-case-analysis` first to initialize the UC project structure.
