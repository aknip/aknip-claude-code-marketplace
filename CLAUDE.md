# Claude Code Marketplace

Personal marketplace for Claude Code plugins and a TUI-based skill installer.

## Repo Structure

- `.claude-plugin/marketplace.json` — Marketplace definition (name, plugins list, versions)
- `plugins/` — Claude Code plugins (each with own CLAUDE.md, skills, hooks, etc.)
  - `esf-enterprise-software-factory/` — Use-case-driven software development with AI agents
  - `ba-business-analysts/` — Business analyst skill
  - `pptx-tools/` — PowerPoint tools with colorscale script
  - `pptx-with-templates/` — PowerPoint editing with templates and validation
  - `sales-pitch-assistant/` — Sales pitch presentations with impress.js
  - `summarizer/` — Document summarization (text input)
  - `ocr-with-mistral/` — Extract markdown-formatted text from scanned PDFs using Mistral OCR
- `scripts/docker-sandbox-for-claude/` — Docker sandbox scripts for Claude Code
- `install-skills.py` — Textual TUI installer for skills/plugins from various sources
- `_NOTES/` — Planning docs and analysis notes (not shipped)

## Marketplace Registration

```
# Local (from this repo):
/plugin marketplace add ./

# Remote:
/plugin marketplace add aknip/aknip-claude-code-marketplace
```

## Skill Installer (`install-skills.py`)

- Python TUI built with Textual
- Tabs: **Dev** (brainstorming, business-analyst, product-manager, ESF), **Content** (RevealJS, image-enhancer, PPTX tools, excalidraw, etc.), **Scripts** (Docker sandbox)
- Installs skills into a user-selected target directory
- Sources: this marketplace, obra/superpowers, ryanbbrown/revealjs-skill, ComposioHQ/awesome-claude-skills, tenzir/claude-plugins

## Language

- Code comments and UI strings are mixed German/English
- README and docs are in English

## More Details
see README.md