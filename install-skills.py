#!/usr/bin/env python3
"""Installer for Claude Code Skills/Agents/Tools – Textual TUI."""

import asyncio
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

# Auto-install textual if missing
try:
    import textual
except ImportError:
    print("textual nicht gefunden – wird installiert …", flush=True)
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "textual"],
        stdout=subprocess.DEVNULL,
    )

from textual import on, work
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical
from textual.screen import ModalScreen
from textual.widgets import (
    Button,
    Checkbox,
    DirectoryTree,
    Footer,
    Header,
    Input,
    Label,
    ListItem,
    ListView,
    RichLog,
    Static,
    TabbedContent,
    TabPane,
)

# ---------------------------------------------------------------------------
# Skill registry
# ---------------------------------------------------------------------------
CONTENT_SKILL_IDS = {"revealjs", "image-enhancer", "pptx-tools", "pptx-with-templates", "sales-pitch-assistant", "summarizer", "ocr-with-mistral", "excalidraw", "transcriber"}

SKILLS = [
    {
        "id": "brainstorming",
        "name": "Superpowers-Brainstorming",
        "description": "Brainstorming skill from obra/superpowers",
        "source": "github.com/obra/superpowers",
        "tab": "dev",
    },
    {
        "id": "revealjs",
        "name": "RevealJS",
        "description": "RevealJS presentation skill",
        "source": "github.com/ryanbbrown/revealjs-skill",
        "tab": "content",
    },
    {
        "id": "image-enhancer",
        "name": "Image Enhancer",
        "description": "Checks image resolution and sharpness, upscales, sharpens text and edges, and removes noise",
        "source": "github.com/ComposioHQ/awesome-claude-skills",
        "tab": "content",
    },
    {
        "id": "pptx-tools",
        "name": "aknip PPTX Tools",
        "description": "PowerPoint tools with colorscale script",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "content",
    },
    {
        "id": "pptx-with-templates",
        "name": "aknip PPTX with Templates",
        "description": "PowerPoint editing with templates, validation, and slide management",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "content",
    },
    {
        "id": "sales-pitch-assistant",
        "name": "aknip Sales Pitch Assistant",
        "description": "Sales pitch presentations with impress.js and sales methodology references",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "content",
    },
    {
        "id": "summarizer",
        "name": "aknip Summarizer",
        "description": "Document summarization (text input)",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "content",
    },
    {
        "id": "ocr-with-mistral",
        "name": "aknip OCR with Mistral",
        "description": "Extract markdown-formatted text from scanned PDFs using Mistral OCR",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "content",
    },
    {
        "id": "business-analyst",
        "name": "aknip Business Analyst",
        "description": "Business analyst skill for requirements and analysis",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "dev",
    },
    {
        "id": "product-manager",
        "name": "aknip Product Manager",
        "description": "Product manager skill for product strategy and planning",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "dev",
    },
    {
        "id": "esf",
        "name": "aknip ESF - Enterprise Software Fabric",
        "description": "Usecase-driven software development with AI agents (full plugin with shadcn/ui app)",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "dev",
    },
    {
        "id": "excalidraw",
        "name": "Excalidraw Diagramming",
        "description": "Create Excalidraw diagrams with shapes, arrows, text, styling, and grouping",
        "source": "github.com/tenzir/claude-plugins",
        "tab": "content",
    },
    {
        "id": "transcriber",
        "name": "aknip Transcriber",
        "description": "Transcribe audio/video files (.mp4, .mp3) to text using Whisper (Apple Silicon GPU)",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "content",
    },
    {
        "id": "docker-sandbox",
        "name": "Docker Sandbox für Claude Code",
        "description": "Docker-Container als sichere Sandbox-Umgebung für Claude Code",
        "source": "github.com/aknip/aknip-claude-code-marketplace",
        "tab": "scripts",
    },
]


# ---------------------------------------------------------------------------
# Custom multi-line skill selection widget
# ---------------------------------------------------------------------------
class SkillItem(ListItem):
    """A list item with checkbox, name, description, and source."""

    def __init__(self, skill_id: str, name: str, description: str, source: str) -> None:
        super().__init__()
        self.skill_id = skill_id
        self._name = name
        self._description = description
        self._source = source

    def compose(self) -> ComposeResult:
        with Horizontal(classes="skill-row"):
            yield Checkbox("", id=f"cb-{self.skill_id}")
            with Vertical(classes="skill-info"):
                yield Label(self._name, classes="skill-name")
                yield Label(self._description, classes="skill-desc")
                yield Label(self._source, classes="skill-source")


# ---------------------------------------------------------------------------
# Install functions (async, for non-blocking UI)
# ---------------------------------------------------------------------------
async def _run(cmd: list[str], **kwargs) -> None:
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        **kwargs,
    )
    stdout, _ = await proc.communicate()
    if proc.returncode != 0:
        output = stdout.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"Command failed (exit {proc.returncode}):\n{output}")


async def install_brainstorming(project_dir: str, log: RichLog) -> None:
    skill_dir = os.path.join(project_dir, ".claude", "skills", "brainstorming")
    os.makedirs(skill_dir, exist_ok=True)
    url = "https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md"
    target = os.path.join(skill_dir, "SKILL.md")
    log.write("  Downloading SKILL.md …")
    await _run(["curl", "-sL", url, "-o", target])


async def install_revealjs(project_dir: str, log: RichLog) -> None:
    tmp_dir = os.path.join(project_dir, "tmp-for-skill-installation")
    skill_dest = os.path.join(project_dir, ".claude", "skills", "revealjs")

    log.write("  Cloning repository …")
    await _run(["git", "clone", "https://github.com/ryanbbrown/revealjs-skill.git", tmp_dir])

    src = os.path.join(tmp_dir, "skills", "revealjs")
    if not os.path.isdir(src):
        src = os.path.join(tmp_dir, "revealjs-skill", "skills", "revealjs")
    os.makedirs(os.path.dirname(skill_dest), exist_ok=True)
    if os.path.exists(skill_dest):
        shutil.rmtree(skill_dest)
    shutil.copytree(src, skill_dest)

    log.write("  Running npm install …")
    await _run(["npm", "install", "--prefix", tmp_dir])

    shutil.rmtree(tmp_dir)


async def install_image_enhancer(project_dir: str, log: RichLog) -> None:
    skill_dir = os.path.join(project_dir, ".claude", "skills", "image-enhancer")
    os.makedirs(skill_dir, exist_ok=True)
    url = "https://raw.githubusercontent.com/ComposioHQ/awesome-claude-skills/master/image-enhancer/SKILL.md"
    target = os.path.join(skill_dir, "SKILL.md")
    log.write("  Downloading SKILL.md …")
    await _run(["curl", "-sL", url, "-o", target])


async def install_pptx_tools(project_dir: str, log: RichLog) -> None:
    base_url = "https://raw.githubusercontent.com/aknip/aknip-claude-code-marketplace/main/plugins/pptx-tools/skills/pptx-tools"
    skill_dir = os.path.join(project_dir, ".claude", "skills", "pptx-tools")
    scripts_dir = os.path.join(skill_dir, "scripts")
    os.makedirs(scripts_dir, exist_ok=True)

    log.write("  Downloading SKILL.md …")
    await _run(["curl", "-sL", f"{base_url}/SKILL.md", "-o", os.path.join(skill_dir, "SKILL.md")])

    log.write("  Downloading scripts/colorscale.py …")
    await _run(["curl", "-sL", f"{base_url}/scripts/colorscale.py", "-o", os.path.join(scripts_dir, "colorscale.py")])


async def _install_from_marketplace(project_dir: str, log: RichLog, plugin_path: str, skill_name: str) -> None:
    """Clone the marketplace repo and copy a skill from plugins/<plugin_path> to .claude/skills/<skill_name>."""
    tmp_dir = os.path.join(project_dir, "tmp-for-skill-installation")
    skill_dest = os.path.join(project_dir, ".claude", "skills", skill_name)

    log.write("  Cloning repository …")
    await _run([
        "git", "clone", "--depth", "1",
        "https://github.com/aknip/aknip-claude-code-marketplace.git", tmp_dir,
    ])

    src = os.path.join(tmp_dir, "plugins", *plugin_path.split("/"))
    os.makedirs(os.path.dirname(skill_dest), exist_ok=True)
    if os.path.exists(skill_dest):
        shutil.rmtree(skill_dest)
    shutil.copytree(src, skill_dest, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"))

    shutil.rmtree(tmp_dir)


async def install_pptx_with_templates(project_dir: str, log: RichLog) -> None:
    await _install_from_marketplace(project_dir, log, "pptx-with-templates/skills/pptx-with-templates", "pptx-with-templates")


async def install_sales_pitch_assistant(project_dir: str, log: RichLog) -> None:
    await _install_from_marketplace(project_dir, log, "sales-pitch-assistant/skills/sales-pitch-assistant", "sales-pitch-assistant")


async def install_summarizer(project_dir: str, log: RichLog) -> None:
    await _install_from_marketplace(project_dir, log, "summarizer/skills/summarizer", "summarizer")


async def install_ocr_with_mistral(project_dir: str, log: RichLog) -> None:
    await _install_from_marketplace(project_dir, log, "ocr-with-mistral/skills/ocr-with-mistral", "ocr-with-mistral")


async def install_business_analyst(project_dir: str, log: RichLog) -> None:
    await _install_from_marketplace(project_dir, log, "ba-business-analysts/skills/business-analyst", "business-analyst")


async def install_product_manager(project_dir: str, log: RichLog) -> None:
    await _install_from_marketplace(project_dir, log, "ba-business-analysts/skills/product-manager", "product-manager")


async def install_esf(project_dir: str, log: RichLog) -> None:
    tmp_dir = os.path.join(project_dir, "tmp-for-skill-installation")
    local_dir = os.path.join(project_dir, "_aknip-claude-code-marketplace-local")

    # 1. Clone repo
    log.write("  Cloning repository …")
    await _run([
        "git", "clone", "--depth", "1",
        "https://github.com/aknip/aknip-claude-code-marketplace.git", tmp_dir,
    ])

    # 2. Copy entire repo to _aknip-claude-code-marketplace-local
    log.write("  Copying marketplace to project …")
    if os.path.exists(local_dir):
        shutil.rmtree(local_dir)
    shutil.copytree(tmp_dir, local_dir, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store", ".git"))

    # 3. Unzip shadcn-ui-app.zip into project root
    zip_path = os.path.join(
        tmp_dir, "plugins", "esf-enterprise-software-factory", "resources", "shadcn-ui-app.zip"
    )
    log.write("  Extracting shadcn-ui-app.zip …")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(project_dir)

    # 4. Cleanup
    shutil.rmtree(tmp_dir)
    macosx_dir = os.path.join(project_dir, "__MACOSX")
    if os.path.exists(macosx_dir):
        shutil.rmtree(macosx_dir)
    notes_dir = os.path.join(project_dir, "_NOTES")
    if os.path.exists(notes_dir):
        shutil.rmtree(notes_dir)

    # 5. Create README_esf.md
    readme_path = os.path.join(project_dir, "README_esf.md")
    log.write("  Creating README_esf.md …")
    with open(readme_path, "w") as f:
        f.write("""\
# esf: Enterprise Software Fabric: Usecase-driven Software Development with AI Agents

**Installation:**

1. npm install

2. Open Claude Code in the project directory:

`/plugin marketplace add ./_aknip-claude-code-marketplace-local`

`/plugin install esf@aknip-claude-code-marketplace`

- Select the option "Install for all collaborators on this repository (project scope)".

- Restart Claude Code to load new plugins.

For further information, see the documentation `_aknip-claude-code-marketplace-local/plugins/esf-enterprise-software-factory/README.md`.
""")


async def install_excalidraw(project_dir: str, log: RichLog) -> None:
    tmp_dir = os.path.join(project_dir, "tmp-for-skill-installation")
    skill_dest = os.path.join(project_dir, ".claude", "skills", "excalidraw-diagramming")

    log.write("  Cloning repository …")
    await _run([
        "git", "clone", "--depth", "1",
        "https://github.com/tenzir/claude-plugins.git", tmp_dir,
    ])

    src = os.path.join(tmp_dir, "plugins", "excalidraw", "skills", "diagramming")
    os.makedirs(os.path.dirname(skill_dest), exist_ok=True)
    if os.path.exists(skill_dest):
        shutil.rmtree(skill_dest)
    shutil.copytree(src, skill_dest, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"))

    shutil.rmtree(tmp_dir)


async def install_docker_sandbox(project_dir: str, log: RichLog) -> None:
    tmp_dir = os.path.join(project_dir, "tmp-for-skill-installation")

    log.write("  Cloning repository …")
    await _run([
        "git", "clone", "--depth", "1",
        "https://github.com/aknip/aknip-claude-code-marketplace.git", tmp_dir,
    ])

    src = os.path.join(tmp_dir, "scripts", "docker-sandbox-for-claude", "_Docker")
    dest = os.path.join(project_dir, "_Docker")
    log.write("  Kopiere _Docker …")
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"))

    shutil.rmtree(tmp_dir)


INSTALL_FUNCTIONS = {
    "brainstorming": install_brainstorming,
    "revealjs": install_revealjs,
    "image-enhancer": install_image_enhancer,
    "pptx-tools": install_pptx_tools,
    "pptx-with-templates": install_pptx_with_templates,
    "sales-pitch-assistant": install_sales_pitch_assistant,
    "summarizer": install_summarizer,
    "ocr-with-mistral": install_ocr_with_mistral,
    "business-analyst": install_business_analyst,
    "product-manager": install_product_manager,
    "esf": install_esf,
    "excalidraw": install_excalidraw,
    "docker-sandbox": install_docker_sandbox,
}


# ---------------------------------------------------------------------------
# Directory picker modal
# ---------------------------------------------------------------------------
class DirectoryPickerScreen(ModalScreen[str | None]):
    """Modal screen with a DirectoryTree to pick a folder."""

    BINDINGS = [("escape", "cancel", "Abbrechen")]

    CSS = """
    DirectoryPickerScreen {
        align: center middle;
    }

    #picker-container {
        width: 70;
        height: 30;
        border: thick $accent;
        background: $surface;
        padding: 1 2;
    }

    #picker-title {
        text-style: bold;
        text-align: center;
        margin-bottom: 1;
    }

    #selected-path {
        margin: 1 0;
        padding: 0 1;
        color: $accent;
    }

    DirectoryTree {
        height: 1fr;
        border: solid $secondary;
    }

    #picker-buttons {
        height: auto;
        align-horizontal: center;
        margin-top: 1;
    }

    #picker-buttons Button {
        margin: 0 1;
    }

    #nav-row {
        height: auto;
        margin-bottom: 1;
    }

    #up-btn {
        min-width: 20;
    }

    #current-root {
        padding: 0 1;
        color: $text-muted;
        content-align-horizontal: right;
        width: 1fr;
    }
    """

    def __init__(self, start_path: str) -> None:
        super().__init__()
        self._start_path = start_path
        self._selected: str = start_path

    def compose(self) -> ComposeResult:
        with Vertical(id="picker-container"):
            yield Static("Verzeichnis auswählen", id="picker-title")
            with Horizontal(id="nav-row"):
                yield Button(".. Eine Ebene höher", id="up-btn", variant="default")
                yield Static(self._start_path, id="current-root")
            yield DirectoryTree(self._start_path, id="dir-tree")
            yield Static(f"Auswahl: {self._selected}", id="selected-path")
            with Horizontal(id="picker-buttons"):
                yield Button("Übernehmen", id="pick-ok", variant="primary")
                yield Button("Abbrechen", id="pick-cancel", variant="error")

    @on(Button.Pressed, "#up-btn")
    def on_up_pressed(self) -> None:
        tree = self.query_one("#dir-tree", DirectoryTree)
        current_root = str(tree.path)
        parent = str(Path(current_root).parent)
        if parent != current_root:
            self._selected = parent
            tree.path = parent
            self.query_one("#current-root", Static).update(parent)
            self.query_one("#selected-path", Static).update(f"Auswahl: {parent}")

    @on(DirectoryTree.DirectorySelected)
    def on_dir_selected(self, event: DirectoryTree.DirectorySelected) -> None:
        self._selected = str(event.path)
        self.query_one("#selected-path", Static).update(f"Auswahl: {self._selected}")

    @on(Button.Pressed, "#pick-ok")
    def on_pick_ok(self) -> None:
        self.dismiss(self._selected)

    @on(Button.Pressed, "#pick-cancel")
    def on_pick_cancel(self) -> None:
        self.dismiss(None)

    def action_cancel(self) -> None:
        self.dismiss(None)


# ---------------------------------------------------------------------------
# Main App
# ---------------------------------------------------------------------------
class SkillInstaller(App):
    TITLE = "Claude Code Skill Installer"
    BINDINGS = [
        ("q", "quit", "Beenden"),
        ("ctrl+c", "quit", "Beenden"),
    ]

    CSS = """
    Screen {
        layout: vertical;
        padding: 1 2;
    }

    #title-bar {
        text-align: center;
        text-style: bold;
        color: $text;
        background: $accent;
        padding: 1 2;
        margin-bottom: 1;
    }

    #dir-label {
        padding: 0 1;
        text-style: bold;
    }

    #dir-row {
        height: auto;
        margin: 0 0 1 0;
    }

    #project-dir {
        width: 1fr;
    }

    #browse-btn {
        min-width: 16;
        margin-left: 1;
    }

    #skill-label {
        padding: 0 1;
        text-style: bold;
    }

    #skill-tabs {
        height: auto;
        max-height: 75%;
        margin-bottom: 1;
    }

    .skills-list {
        height: auto;
        max-height: 100%;
        border: solid $accent;
    }

    SkillItem {
        height: auto;
        padding: 0 1;
    }

    .skill-row {
        height: auto;
    }

    .skill-info {
        height: auto;
        margin-left: 1;
    }

    .skill-name {
        text-style: bold;
    }

    .skill-desc {
        color: $text-muted;
    }

    .skill-source {
        color: $text-muted;
        text-style: italic;
    }

    SkillItem Checkbox {
        height: auto;
        min-height: 1;
        padding: 0;
        border: none;
    }

    #btn-row {
        height: auto;
        align-horizontal: center;
        margin: 1 0;
    }

    #install-btn {
        min-width: 30;
    }

    #log-container {
        height: 1fr;
        border: solid $secondary;
    }

    RichLog {
        height: 1fr;
    }

    #summary {
        text-align: center;
        padding: 1;
        margin-top: 1;
        display: none;
    }

    #summary.success {
        display: block;
        background: $success;
        color: $text;
        text-style: bold;
    }

    #summary.partial {
        display: block;
        background: $warning;
        color: $text;
        text-style: bold;
    }
    """

    def compose(self) -> ComposeResult:
        yield Header(show_clock=False)
        yield Static("Claude Code Skill Installer", id="title-bar")

        yield Static("Projektverzeichnis:", id="dir-label")
        with Horizontal(id="dir-row"):
            yield Input(
                value=os.getcwd(),
                placeholder="Pfad zum Projektverzeichnis …",
                id="project-dir",
            )
            yield Button("Durchsuchen", id="browse-btn", variant="default")
        yield Static("Skills auswählen (Leertaste = auswählen):", id="skill-label")
        with TabbedContent(id="skill-tabs"):
            with TabPane("Skills Dev", id="tab-dev"):
                dev_list = ListView(id="skills-dev", classes="skills-list")
                with dev_list:
                    for s in SKILLS:
                        if s["tab"] == "dev":
                            yield SkillItem(s["id"], s["name"], s["description"], s["source"])
            with TabPane("Skills Content", id="tab-content"):
                content_list = ListView(id="skills-content", classes="skills-list")
                with content_list:
                    for s in SKILLS:
                        if s["tab"] == "content":
                            yield SkillItem(s["id"], s["name"], s["description"], s["source"])
            with TabPane("Scripts", id="tab-scripts"):
                scripts_list = ListView(id="skills-scripts", classes="skills-list")
                with scripts_list:
                    for s in SKILLS:
                        if s["tab"] == "scripts":
                            yield SkillItem(s["id"], s["name"], s["description"], s["source"])
        with Horizontal(id="btn-row"):
            yield Button(
                "Installieren",
                id="install-btn",
                variant="primary",
                disabled=True,
            )

        log_container = Vertical(id="log-container")
        log_container.border_title = "Installationslog"
        with log_container:
            yield RichLog(
                highlight=True,
                markup=True,
                auto_scroll=True,
                id="log",
            )

        yield Static("", id="summary")
        yield Footer()

    @on(Button.Pressed, "#browse-btn")
    def on_browse_pressed(self) -> None:
        current = self.query_one("#project-dir", Input).value.strip()
        start = current if os.path.isdir(current) else str(Path.home())

        def on_dismiss(result: str | None) -> None:
            if result is not None:
                self.query_one("#project-dir", Input).value = result

        self.push_screen(DirectoryPickerScreen(start), callback=on_dismiss)

    def _get_selected_skill_ids(self) -> list[str]:
        """Return list of checked skill IDs."""
        return [
            item.skill_id
            for item in self.query(SkillItem)
            if item.query_one(Checkbox).value
        ]

    @on(Checkbox.Changed)
    def on_checkbox_changed(self) -> None:
        selected = self._get_selected_skill_ids()
        btn = self.query_one("#install-btn", Button)
        btn.disabled = len(selected) == 0
        count = len(selected)
        btn.label = f"Installieren ({count})" if count > 0 else "Installieren"

    @on(ListView.Selected)
    def on_list_item_selected(self, event: ListView.Selected) -> None:
        """Toggle checkbox when pressing Enter on a list item."""
        cb = event.item.query_one(Checkbox)
        cb.toggle()

    @on(Button.Pressed, "#install-btn")
    def on_install_pressed(self) -> None:
        self.run_installation()

    @work(exclusive=True)
    async def run_installation(self) -> None:
        btn = self.query_one("#install-btn", Button)
        btn.disabled = True
        for lv in self.query(".skills-list"):
            lv.disabled = True
        dir_input = self.query_one("#project-dir", Input)
        dir_input.disabled = True

        log = self.query_one("#log", RichLog)
        log.clear()

        project_dir = dir_input.value.strip()
        project_dir = os.path.abspath(os.path.expanduser(project_dir))

        if not os.path.isdir(project_dir):
            log.write(f"[bold red]Verzeichnis existiert nicht: {project_dir}[/]")
            btn.disabled = False
            for lv in self.query(".skills-list"):
                lv.disabled = False
            dir_input.disabled = False
            return

        selected = self._get_selected_skill_ids()
        log.write(f"[bold]Zielverzeichnis:[/] {project_dir}")
        log.write(f"[bold]Auswahl:[/] {len(selected)} Einträge\n")

        success = 0
        failed = 0

        for skill_id in selected:
            skill = next(s for s in SKILLS if s["id"] == skill_id)
            log.write(f"[bold cyan]→ {skill['name']}[/]")
            try:
                await INSTALL_FUNCTIONS[skill_id](project_dir, log)
                log.write(f"  [bold green]✓ {skill['name']} installiert[/]\n")
                success += 1
            except Exception as e:
                log.write(f"  [bold red]✗ Fehler: {e}[/]\n")
                failed += 1

        # Summary
        summary = self.query_one("#summary", Static)
        if failed == 0:
            summary.update(f"✓ {success} Skill(s) erfolgreich installiert")
            summary.set_classes("success")
        else:
            summary.update(f"✓ {success} erfolgreich, ✗ {failed} fehlgeschlagen")
            summary.set_classes("partial")

        # Re-enable UI
        btn.disabled = False
        for lv in self.query(".skills-list"):
            lv.disabled = False
        dir_input.disabled = False


if __name__ == "__main__":
    SkillInstaller().run()
