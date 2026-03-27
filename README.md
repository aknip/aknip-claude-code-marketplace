# My Claude Code Marketplace

Personal marketplace for Claude Code plugins and a TUI-based skill installer.

## Register Marketplace

Open Claude Code in the project directory:

- **Local** (within this repository): `/plugin marketplace add ./`
- **Remote**: `/plugin marketplace add aknip/aknip-claude-code-marketplace`

## Plugin Development Workflow

During development, you can skip the commit/push/reinstall cycle entirely using `--plugin-dir` and `/reload-plugins`.

### Quick Start

```bash
# Start Claude Code with your local plugin loaded directly
claude --plugin-dir ./plugins/my-plugin

# Load multiple plugins at once
claude --plugin-dir ./plugins/esf-enterprise-software-factory --plugin-dir ./plugins/pptx-tools
```

### Iterative Development

1. **Start** Claude Code with `--plugin-dir ./plugins/my-plugin`
2. **Edit** plugin files (skills, agents, hooks, MCP servers)
3. **Reload** inside Claude Code with `/reload-plugins` — no restart needed
4. **Test** the skill/agent
5. **Repeat** from step 2

Commit and push only when the plugin is stable.

### Alternative Approaches

| Approach | How | Pros | Cons |
|----------|-----|------|------|
| `--plugin-dir` | `claude --plugin-dir ./plugins/x` | Fastest iteration, instant reload | Must specify at startup |
| Local marketplace | `/plugin marketplace add ./` then `/plugin install x` | One-time registration | Files are **copied**, not linked — reinstall after changes |
| Symlinks | `ln -s /path/to/repo/plugins/x ~/.claude/skills/x` | Changes reflected immediately | Manual setup, fragile |

### Useful Commands

- `/reload-plugins` — Reload all plugins (skills, agents, hooks, MCP servers) without restarting
- `/plugin validate .` — Validate plugin structure before testing
- `--plugin-dir` takes precedence over installed marketplace plugins of the same name

## Disable Global Plugins per Repo

Globally installed plugins can be disabled for a specific project via `.claude/settings.json` (git-committed, team-wide) or `.claude/settings.local.json` (local only, not committed):

```json
{
  "enabledPlugins": {
    "plugin-name@marketplace-name": false
  }
}
```

- `false` — disables the plugin in this project
- `true` — explicitly enables the plugin
- Omitted plugins keep their default state

**Scope hierarchy** (highest precedence first):

1. **Local** — `.claude/settings.local.json` (machine-specific)
2. **Project** — `.claude/settings.json` (committed to git)
3. **User** — `~/.claude/settings.json` (global, all projects)
4. **Managed** — Enterprise admin settings

Alternatively, use the CLI to uninstall a plugin only for the current project:

```
/plugin uninstall plugin-name@marketplace --scope project
```

