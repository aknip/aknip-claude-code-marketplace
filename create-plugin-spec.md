# Plugin Packaging Spec: esf-enterprise-software-factory

## 1. Overview

Package the use-case-driven development framework from `project-source/` into a Claude Code plugin distributed via a self-hosted marketplace in this repository.

**Source**: `project-source/` (agents, commands, skills, hooks, MCP config, autopilot system, templates, references, workflows)
**Target**: Marketplace at repo root + single plugin at `plugins/esf-enterprise-software-factory/`

---

## 2. Source Inventory

| Component | Source Location | Count | Description |
|---|---|---|---|
| Agents | `.claude/agents/` | 8 | uc-analyst, uc-brownfield-mapper, uc-checker, uc-executor, uc-modeler, uc-phase-researcher, uc-planner, uc-verifier |
| Commands | `.claude/commands/uc/` | 41 | Slash commands: new-project, plan-phase, execute-phase, autopilot, etc. |
| Skills | `.claude/skills/` | 3 | agent-browser, excalidraw-diagramming, shadcn-ui-use-components |
| Hooks | `.claude/hooks/` | 1 | cli-statusline.js (terminal status line renderer) |
| MCP Config | `.mcp.json` | 1 | shadcn-ui MCP server (via npx) |
| Autopilot | `.claude/use-case-driven/bin/autopilot/` | ~150+ files | Node.js/Ink terminal UI app (TypeScript src + compiled dist) |
| References | `.claude/use-case-driven/references/` | 5 | milestone-workflow, model-profiles, questioning, session-management, ui-brand |
| Templates | `.claude/use-case-driven/templates/` | 6 | project.md, summary.md, autopilot-script.sh, prompt templates |
| Workflows | `.claude/use-case-driven/workflows/` | 2 | execute-phase, execute-plan |
| CLAUDE.md | `CLAUDE.md` | 1 | General rules (German UI, agent-browser testing) |

---

## 3. Target Directory Structure

```
repo root/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace catalog
│
└── plugins/
    └── esf-enterprise-software-factory/
        ├── .claude-plugin/
        │   └── plugin.json           # Plugin manifest
        │
        ├── commands/                  # 41 slash commands (flattened from uc/)
        │   ├── help.md
        │   ├── new-project.md
        │   ├── use-case-analysis.md
        │   ├── create-roadmap.md
        │   ├── plan-phase.md
        │   ├── execute-phase.md
        │   ├── verify-phase.md
        │   ├── autopilot.md
        │   ├── feature-exploration.md
        │   ├── analyze-requirements.md
        │   ├── map-codebase.md
        │   ├── progress.md
        │   ├── discuss-phase.md
        │   ├── complete-milestone.md
        │   ├── new-milestone.md
        │   ├── audit-milestone.md
        │   ├── add-phase.md
        │   ├── insert-phase.md
        │   ├── remove-phase.md
        │   ├── renumber-phases.md
        │   ├── pause-work.md
        │   ├── resume-work.md
        │   ├── add-use-case.md
        │   ├── link-use-cases.md
        │   ├── add-todo.md
        │   ├── check-todos.md
        │   ├── settings.md
        │   ├── set-profile.md
        │   ├── debug.md
        │   ├── list-phase-assumptions.md
        │   ├── quick.md
        │   ├── checkpoints.md
        │   └── ... (remaining commands)
        │
        ├── agents/                    # 8 agent definitions
        │   ├── uc-analyst.md
        │   ├── uc-brownfield-mapper.md
        │   ├── uc-checker.md
        │   ├── uc-executor.md
        │   ├── uc-modeler.md
        │   ├── uc-phase-researcher.md
        │   ├── uc-planner.md
        │   └── uc-verifier.md
        │
        ├── skills/                    # 3 agent skills (auto-invocable)
        │   ├── agent-browser/
        │   │   ├── SKILL.md
        │   │   ├── references/
        │   │   │   ├── authentication.md
        │   │   │   ├── proxy-support.md
        │   │   │   ├── session-management.md
        │   │   │   ├── snapshot-refs.md
        │   │   │   └── video-recording.md
        │   │   └── templates/
        │   │
        │   ├── excalidraw-diagramming/
        │   │   ├── SKILL.md
        │   │   └── references/
        │   │
        │   └── shadcn-ui-use-components/
        │       └── SKILL.md
        │
        ├── hooks/
        │   └── hooks.json             # Hook config (references scripts/)
        │
        ├── scripts/
        │   └── cli-statusline.js      # Status line renderer
        │
        ├── use-case-driven/           # Framework core (non-command/agent files)
        │   ├── bin/
        │   │   └── autopilot/
        │   │       ├── package.json
        │   │       ├── README.md
        │   │       ├── bin/
        │   │       │   └── autopilot.js
        │   │       ├── src/           # Full TypeScript source
        │   │       │   ├── index.tsx
        │   │       │   ├── App.tsx
        │   │       │   ├── cli.ts
        │   │       │   ├── components/
        │   │       │   ├── context/
        │   │       │   ├── execution/
        │   │       │   ├── hooks/
        │   │       │   ├── services/
        │   │       │   ├── types/
        │   │       │   └── utils/
        │   │       └── dist/          # Compiled output
        │   │
        │   ├── references/
        │   │   ├── milestone-workflow.md
        │   │   ├── model-profiles.md
        │   │   ├── questioning.md
        │   │   ├── session-management.md
        │   │   └── ui-brand.md
        │   │
        │   ├── templates/
        │   │   ├── project.md
        │   │   ├── summary.md
        │   │   ├── autopilot-script.sh
        │   │   └── prompts/
        │   │       ├── plan-phase-prompt.md
        │   │       ├── execute-phase-prompt.md
        │   │       └── complete-milestone-prompt.md
        │   │
        │   └── workflows/
        │       ├── execute-phase.md
        │       └── execute-plan.md
        │
        ├── .mcp.json                  # MCP server config (shadcn-ui)
        └── settings.json              # Plugin defaults (German UI, testing rules)
```

---

## 4. Marketplace File

**File**: `.claude-plugin/marketplace.json`

```json
{
  "name": "aknip-claude-code-marketplace",
  "owner": {
    "name": "aknip"
  },
  "metadata": {
    "description": "Use-case-driven development framework for Claude Code",
    "version": "1.0.0",
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "esf-enterprise-software-factory",
      "source": "./esf-enterprise-software-factory",
      "description": "Complete use-case-driven development framework with RUP methodology, 8 specialized agents, 41 commands, autopilot system, and browser testing",
      "version": "1.0.0",
      "keywords": ["use-case", "rup", "methodology", "agents", "autopilot"],
      "category": "development-methodology"
    }
  ]
}
```

> Note: `metadata.pluginRoot` is set to `"./plugins"`, so the plugin source `"./esf-enterprise-software-factory"` resolves to `./plugins/esf-enterprise-software-factory`.

---

## 5. Plugin Manifest

**File**: `plugins/esf-enterprise-software-factory/.claude-plugin/plugin.json`

```json
{
  "name": "esf",
  "description": "Enterprise Software Factory — Use-case-driven development framework with RUP methodology, specialized agents, phased execution, autopilot, and browser testing",
  "version": "1.0.0",
  "author": {
    "name": "aknip"
  },
  "keywords": ["use-case", "rup", "methodology", "agents", "autopilot", "browser-testing"],
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

### Critical: Plugin Name = Command Namespace

The `name` field in `plugin.json` determines the command namespace. Setting it to `"esf"` means:

| Current standalone command | Plugin command |
|---|---|
| `/uc:help` | `/esf:help` |
| `/uc:new-project` | `/esf:new-project` |
| `/uc:plan-phase` | `/esf:plan-phase` |
| `/uc:autopilot` | `/esf:autopilot` |
| ... | ... |

The directory name (`esf-enterprise-software-factory`) is for the marketplace/filesystem only. The short `esf` name keeps commands concise.

---

## 6. Key Transformations

### 6.1 Commands: Flatten from `uc/` subdirectory

**Source**: `.claude/commands/uc/*.md` (files in a `uc` subdirectory)
**Target**: `commands/*.md` (flattened to root of commands/)

**Reason**: In standalone mode, the `uc/` subdirectory creates the `uc:` namespace. In plugin mode, the namespace comes from the plugin `name` field. Keeping the `uc/` subdirectory would create double-namespacing: `/esf:uc/help` instead of `/esf:help`.

**Action**: Copy all 41 `.md` files from `commands/uc/` directly into `commands/`.

### 6.2 Path References in Agents & Commands

Many agents and commands reference files using paths like:
- `.claude/use-case-driven/references/model-profiles.md`
- `.claude/use-case-driven/templates/project.md`
- `.claude/use-case-driven/workflows/execute-phase.md`

These hardcoded paths must be updated to work within the plugin's installed location. Two strategies:

**Strategy A — Relative paths from plugin root** (recommended):
Replace `.claude/use-case-driven/` with `use-case-driven/` throughout all agent and command files. Since agents and commands are resolved relative to the plugin root, internal references like `use-case-driven/references/model-profiles.md` should work.

**Strategy B — ${CLAUDE_PLUGIN_ROOT}**:
Use `${CLAUDE_PLUGIN_ROOT}/use-case-driven/references/model-profiles.md`. This is the documented approach for hooks and MCP servers, but may not be expanded in all contexts (agent/command markdown).

**Action**: Audit all 8 agent files and 41 command files for hardcoded `.claude/` paths. Replace with plugin-relative paths. Test thoroughly.

### 6.3 Hooks: Convert to Plugin Format

**Source**: `.claude/hooks/cli-statusline.js` (standalone hook file)
**Target**: `hooks/hooks.json` + `scripts/cli-statusline.js`

The standalone hooks system and plugin hooks system use different formats. Create `hooks/hooks.json`:

```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/cli-statusline.js"
          }
        ]
      }
    ]
  }
}
```

> Note: The exact hook event for statusline rendering needs verification. The `cli-statusline.js` reads model/workspace/context data from stdin — verify which Claude Code event provides this data. May require a different event type or may need adaptation if statusline hooks work differently in plugins.

### 6.4 MCP Server Config

**Source**: `.mcp.json` with shadcn-ui server
**Target**: Plugin `.mcp.json` (identical content)

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"]
    }
  }
}
```

No path changes needed since this uses `npx` (globally resolved). Users need `npx` available on their system.

### 6.5 Plugin Default Settings

**Source**: `CLAUDE.md` rules
**Target**: `settings.json` at plugin root

```json
{
  "CLAUDE.md": "## General Rules\n\n- Test new features with agent-browser (skip only if user says \"no tests\")\n- UI language is German (labels, errors, dates: DD.MM.YYYY, currency: EUR) — use German Umlauts (ä, ö, ü, ß)\n- If agent-browser can't find a browser: `node_modules/agent-browser/bin/agent-browser install`"
}
```

> Note: The `settings.json` for plugins currently only supports the `agent` key officially. The CLAUDE.md rules may need to be handled differently — either as a reference document the agents/commands include, or injected as instructions within the agent definitions. **This needs validation against the plugin system's actual behavior.**

**Fallback approach**: If `settings.json` can't carry CLAUDE.md rules, embed them:
1. As a `CLAUDE.md` file at the plugin root (if plugins support this)
2. As a preamble in each agent definition
3. As a `references/project-defaults.md` document referenced by agents

### 6.6 Autopilot: Include Source + Dist

**Source**: `.claude/use-case-driven/bin/autopilot/`
**Target**: `use-case-driven/bin/autopilot/`

Include:
- `package.json` — dependency manifest
- `README.md` — usage docs
- `bin/autopilot.js` — entry point
- `src/` — full TypeScript source (for inspection/rebuild)
- `dist/` — compiled JavaScript (for immediate use)

**Exclude**:
- `node_modules/` — users must run `npm install` before first use

**Post-install requirement**: Users need to run `npm install` inside the autopilot directory before using the autopilot feature. Document this in the plugin's help command and README.

**Autopilot paths**: The autopilot is invoked from commands like `/esf:autopilot`. The command file references the autopilot binary path. Update the path from `.claude/use-case-driven/bin/autopilot/...` to the plugin-relative path. Since plugins are cached at `~/.claude/plugins/cache/`, the actual runtime path is unpredictable — use `${CLAUDE_PLUGIN_ROOT}` where possible.

---

## 7. Files to Exclude from Plugin

| Excluded | Reason |
|---|---|
| `node_modules/` (in autopilot) | Users install dependencies themselves |
| `.planning/` (runtime dir) | Created at runtime in user's project, not part of plugin |
| Any `.git` metadata | Not relevant to plugin distribution |

---

## 8. Challenges & Mitigations

### 8.1 Path Resolution After Plugin Caching

**Problem**: Plugins are copied to `~/.claude/plugins/cache/` at install time. All internal file references must be self-contained within the plugin directory.

**Mitigation**:
- Audit all 49 files (8 agents + 41 commands) for path references
- Replace all `.claude/` prefixed paths with plugin-relative paths
- Use `${CLAUDE_PLUGIN_ROOT}` in hooks and MCP config
- Verify no files reference `../` (path traversal not allowed)

### 8.2 Autopilot npm Dependencies

**Problem**: The autopilot app requires npm packages (ink, react, etc.) that aren't in the plugin.

**Mitigation**:
- Document `npm install` as a post-install step
- The `/esf:autopilot` command should check for `node_modules/` and prompt the user to install if missing
- Consider adding a setup command `/esf:setup` that runs the npm install

### 8.3 agent-browser Dependency

**Problem**: The agent-browser skill references `node_modules/agent-browser/bin/agent-browser` — this is a project-level npm dependency, not bundled.

**Mitigation**:
- Document as an external dependency
- The skill and CLAUDE.md already reference the install command
- Update the path reference in the skill to note it's a project dependency, not a plugin dependency

### 8.4 Statusline Hook Compatibility

**Problem**: The `cli-statusline.js` hook may use a mechanism not available in the plugin hooks system. Plugin hooks support `PreToolUse`, `PostToolUse`, `Notification`, etc. — a "statusline" event may not exist.

**Mitigation**:
- Test whether the statusline hook can be mapped to an existing plugin hook event
- If not, document as a limitation or ship as an optional standalone hook with install instructions

### 8.5 CLAUDE.md Plugin Defaults

**Problem**: The plugin `settings.json` currently only supports the `agent` key. There's no documented way to inject CLAUDE.md-style rules via plugins.

**Mitigation**:
- Embed the CLAUDE.md rules into each agent's system prompt as a "defaults" section
- OR ship a `CLAUDE.md` at the plugin root and test if plugins support this
- OR create a `references/defaults.md` that agents/commands include via their prompts

### 8.6 Command Namespace Change

**Problem**: Users familiar with `/uc:*` commands must switch to `/esf:*`.

**Mitigation**:
- Document the namespace change in help and README
- The `/esf:help` command should list all available commands with new names

---

## 9. Implementation Steps

### Phase 1: Scaffold Target Structure
1. Create `.claude-plugin/marketplace.json`
2. Create `plugins/esf-enterprise-software-factory/.claude-plugin/plugin.json`
3. Create empty target directories (commands/, agents/, skills/, hooks/, scripts/, use-case-driven/)

### Phase 2: Copy & Transform Agents
4. Copy 8 agent `.md` files from `project-source/.claude/agents/` → `plugins/esf-enterprise-software-factory/agents/`
5. Audit and fix all internal path references in agent files

### Phase 3: Copy & Transform Commands
6. Copy 41 command `.md` files from `project-source/.claude/commands/uc/` → `plugins/esf-enterprise-software-factory/commands/` (flattened, no `uc/` subdirectory)
7. Audit and fix all internal path references in command files
8. Update any cross-references between commands (e.g., "see /uc:help" → "see /esf:help")

### Phase 4: Copy Skills
9. Copy 3 skill directories from `project-source/.claude/skills/` → `plugins/esf-enterprise-software-factory/skills/`
10. Verify SKILL.md frontmatter and internal references

### Phase 5: Setup Hooks
11. Create `plugins/esf-enterprise-software-factory/hooks/hooks.json` with appropriate event mapping
12. Copy `cli-statusline.js` to `plugins/esf-enterprise-software-factory/scripts/`
13. Update script path to use `${CLAUDE_PLUGIN_ROOT}`

### Phase 6: Copy Framework Core
14. Copy `project-source/.claude/use-case-driven/` → `plugins/esf-enterprise-software-factory/use-case-driven/`
15. Exclude `node_modules/` from autopilot
16. Verify template and reference paths

### Phase 7: MCP & Settings
17. Copy `.mcp.json` to plugin root
18. Create `settings.json` with CLAUDE.md defaults (or implement fallback approach)

### Phase 8: Path Audit
19. Global search-and-replace: `.claude/use-case-driven/` → `use-case-driven/`
20. Global search-and-replace: `.claude/agents/` → `agents/`
21. Global search-and-replace: `/uc:` → `/esf:` in command cross-references
22. Verify no remaining `.claude/` prefixed paths exist in the plugin

### Phase 9: Validation & Testing
23. Run `claude plugin validate ./plugins/esf-enterprise-software-factory`
24. Test with `claude --plugin-dir ./plugins/esf-enterprise-software-factory`
25. Verify all 41 commands appear in `/help`
26. Verify all 8 agents appear in `/agents`
27. Test key workflows: `/esf:help`, `/esf:new-project`, `/esf:plan-phase`
28. Test marketplace: `/plugin marketplace add .` then `/plugin install esf-enterprise-software-factory@aknip-claude-code-marketplace`

---

## 10. Open Questions

| # | Question | Impact | Proposed Resolution |
|---|---|---|---|
| 1 | ~~Plugin `name`: resolved~~ | Command namespace for all users | **Resolved**: Using `"esf"` — short, unique, no conflicts. |
| 2 | Does `settings.json` support CLAUDE.md injection? | How defaults are delivered | Test; fall back to embedding in agent prompts |
| 3 | Which hook event maps to statusline rendering? | Whether statusline works in plugin | Test all events; may need to document as standalone if none match |
| 4 | Do agent/command markdown files resolve `${CLAUDE_PLUGIN_ROOT}`? | Path strategy for internal references | Test; if not, rely on relative paths from plugin root |
| 5 | Autopilot `npm install` — can it be automated on plugin install? | User experience | Likely not; document as manual post-install step |
| 6 | Marketplace `name` — does `"aknip-claude-code-marketplace"` conflict with reserved names? | Registration | Verify against reserved list; none listed match this name |

---

## 11. Success Criteria

- [ ] `claude plugin validate .` passes at repo root (marketplace)
- [ ] `claude plugin validate ./plugins/esf-enterprise-software-factory` passes (plugin)
- [ ] All 41 commands accessible via `/esf:*` namespace
- [ ] All 8 agents accessible via `/agents`
- [ ] All 3 skills (agent-browser, excalidraw, shadcn-ui) are loaded
- [ ] MCP server (shadcn-ui) starts when plugin is enabled
- [ ] Statusline hook fires (or documented as limitation)
- [ ] Autopilot runs after `npm install` in autopilot directory
- [ ] Internal path references resolve correctly from cached plugin location
- [ ] Fresh install from marketplace works: `add` → `install` → use commands
