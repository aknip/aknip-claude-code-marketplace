#!/usr/bin/env python3
"""Installer for Claude Code Skills/Agents/Tools."""

import os
import shutil
import subprocess
import sys

try:
    import questionary
except ImportError:
    print("questionary nicht gefunden – wird installiert …", flush=True)
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "questionary"],
    )
    import questionary

# ---------------------------------------------------------------------------
# Skill registry – each entry describes how to install one skill
# ---------------------------------------------------------------------------
SKILLS = [
    {
        "name": "Superpowers-Brainstorming",
        "description": "Brainstorming skill from obra/superpowers",
        "install": lambda dest: _install_brainstorming(dest),
    },
    {
        "name": "RevealJS",
        "description": "RevealJS presentation skill",
        "install": lambda dest: _install_revealjs(dest),
    },
]


def _install_brainstorming(project_dir: str) -> None:
    skill_dir = os.path.join(project_dir, ".claude", "skills", "brainstorming")
    os.makedirs(skill_dir, exist_ok=True)
    url = "https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md"
    target = os.path.join(skill_dir, "SKILL.md")
    print(f"  Downloading SKILL.md → {target}")
    subprocess.check_call(["curl", "-sL", url, "-o", target])
    print("  ✓ Superpowers-Brainstorming installiert")


def _install_revealjs(project_dir: str) -> None:
    tmp_dir = os.path.join(project_dir, "tmp-for-skill-installation")
    skill_dest = os.path.join(project_dir, ".claude", "skills", "revealjs")

    # Clone
    print("  Cloning revealjs-skill repo …")
    subprocess.check_call(
        ["git", "clone", "https://github.com/ryanbbrown/revealjs-skill.git", tmp_dir],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # Copy skill folder
    src = os.path.join(tmp_dir, "revealjs-skill", "skills", "revealjs")
    if not os.path.isdir(src):
        # Repo root might already be the skill folder – try alternative layout
        src = os.path.join(tmp_dir, "skills", "revealjs")
    os.makedirs(os.path.dirname(skill_dest), exist_ok=True)
    if os.path.exists(skill_dest):
        shutil.rmtree(skill_dest)
    shutil.copytree(src, skill_dest)

    # npm install (from repo root, where package.json lives)
    print("  Running npm install …")
    subprocess.check_call(
        ["npm", "install", "--prefix", tmp_dir],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # Cleanup
    shutil.rmtree(tmp_dir)
    print("  ✓ RevealJS installiert")


def main() -> None:
    print("╔══════════════════════════════════════════╗")
    print("║  Claude Code Skill Installer             ║")
    print("╚══════════════════════════════════════════╝")
    print()

    # 1. Ask for project directory
    default_dir = os.getcwd()
    project_dir = questionary.path(
        "Projektverzeichnis:",
        default=default_dir,
        only_directories=True,
    ).ask()

    if not project_dir:
        print("Abgebrochen.")
        return

    project_dir = os.path.abspath(os.path.expanduser(project_dir))
    if not os.path.isdir(project_dir):
        print(f"Verzeichnis existiert nicht: {project_dir}")
        return

    print(f"\nZielverzeichnis: {project_dir}\n")

    # 2. Multi-select skills
    choices = [
        questionary.Choice(
            title=f"{s['name']}  –  {s['description']}",
            value=s["name"],
        )
        for s in SKILLS
    ]

    selected = questionary.checkbox(
        "Skills auswählen (Leertaste = auswählen, Enter = bestätigen):",
        choices=choices,
    ).ask()

    if not selected:
        print("Keine Skills ausgewählt. Abgebrochen.")
        return

    # 3. Install selected skills
    print()
    for skill in SKILLS:
        if skill["name"] in selected:
            print(f"→ Installiere {skill['name']} …")
            try:
                skill["install"](project_dir)
            except Exception as e:
                print(f"  ✗ Fehler: {e}")
            print()

    print("Fertig!")


if __name__ == "__main__":
    main()
