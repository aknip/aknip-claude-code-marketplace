# my-claude-code-marketplace


First, register the marketplace:
/plugin marketplace add aknip/aknip-claude-code-marketplace

Then install the plugin:
/plugin install esf@aknip-claude-code-marketplace


/plugin uninstall esf@aknip-claude-code-marketplace 


To remove the plugin, I'll delete its entry from installed_plugins json:                             
⏺ Write(~/.claude/plugins/installed_plugins.json)               
  ⎿  Added 2 lines, removed 14 lines   

 Here's what needs to be cleaned up:

  1. Project settings: .claude/settings.json — has the plugin in
   enabledPlugins
  2. Global registry: ~/.claude/plugins/installed_plugins.json —
   has the plugin install record
  3. Plugin cache: ~/.claude/plugins/cache/aknip-claude-code-mar
  ketplace/esf-enterprise-software-factory/ — the cached plugin
  files


 rm -rf ~/.claude/plugins/cache/aknip-claude-code-marketplace/esf-enterprise-software-factory/1.0.0