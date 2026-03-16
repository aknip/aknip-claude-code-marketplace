# Docker Code Container – Dokumentation

## Quickstart

Aus Arbeitsverzeichnis heraus starten mit:`_Docker/run-in-docker.sh`

## Quelle
https://github.com/kevinMEH/code-container


## Überblick

Die beiden Files bilden zusammen ein System, um **isolierte Docker-Container** für Coding-Tools (Claude Code, OpenAI Codex, Gemini CLI, Opencode) bereitzustellen. Jedes Projekt bekommt seinen eigenen Container, in dem die Tools direkt nutzbar sind.

---

## Dockerfile (`_Docker/Dockerfile`)

Baut ein Ubuntu 24.04-basiertes Image mit dem Namen `code:latest`. Liegt im Unterverzeichnis `_Docker/`.

**Was wird installiert:**

| Komponente | Details |
|---|---|
| Basissystem | `build-essential`, `git`, `curl`, `wget`, `unzip`, `vim`, `tree` |
| Node.js | Version 22 via NVM (v0.39.7) |
| Python | Python 3 + pip + venv |
| Claude Code | Offizielle Installation via `claude.ai/install.sh` |
| Opencode | `opencode-ai` (npm global) |
| OpenAI Codex | `@openai/codex` (npm global) |
| Gemini CLI | `@google/gemini-cli` (npm global) |

**Konfiguration im Image:**
- Zeitzone: `Europe/Berlin`
- Arbeitsverzeichnis: `/root`
- Custom Bash-Prompt: `[code-container] /pfad$`
- NVM wird in `.bashrc` für interaktive Shells geladen

---

## run-in-docker.sh

Bash-Script zur Verwaltung der Docker-Container. Erzeugt pro Projekt einen eigenen Container mit einem eindeutigen Namen (`code-<projektname>-<hash>`).

### Befehle

| Befehl | Beschreibung |
|---|---|
| `./run-in-docker.sh` | Container für das aktuelle Verzeichnis starten/attachen |
| `./run-in-docker.sh /pfad/zum/projekt` | Container für ein bestimmtes Projekt starten |
| `./run-in-docker.sh --build` | Docker-Image neu bauen |
| `./run-in-docker.sh --stop` | Container stoppen |
| `./run-in-docker.sh --remove` | Container stoppen und entfernen |
| `./run-in-docker.sh --list` | Alle Code-Container auflisten |
| `./run-in-docker.sh --clean` | Alle gestoppten Code-Container entfernen |

### Verhalten beim Start

1. Prüft ob das Docker-Image existiert, baut es bei Bedarf automatisch
2. Falls Container bereits läuft → Shell wird daran attached
3. Falls Container existiert aber gestoppt ist → wird gestartet und attached
4. Falls kein Container existiert → wird neu erstellt
5. Beim Verlassen der Shell wird der Container **automatisch gestoppt**, sofern keine andere Terminal-Session noch verbunden ist

### Volume-Mounts (was wird in den Container gemountet)

| Host-Pfad | Container-Pfad | Zweck |
|---|---|---|
| `<Projektverzeichnis>` | `/root/<projektname>` | Projekt-Dateien (read/write) |
| `_Docker/project/.claude` | `/root/.claude` | Claude Code Konfiguration |
| `_Docker/project/container.claude.json` | `/root/.claude.json` | Claude Code Settings |
| `_Docker/project/.codex` | `/root/.codex` | OpenAI Codex Konfiguration |
| `_Docker/project/.opencode` | `/root/.config/opencode` | Opencode Konfiguration |
| `_Docker/project/.gemini` | `/root/.gemini` | Gemini CLI Konfiguration |
| ~~`_Docker/project/.npm`~~ | ~~`/root/.npm`~~ | ~~npm Cache (shared)~~ – **deaktiviert** (siehe Hinweis unten) |
| `_Docker/project/pip` | `/root/.cache/pip` | pip Cache (shared) |
| `_Docker/project/.local` | `/root/.local` | Lokale Binaries/Packages |
| `~/.gitconfig` | `/root/.gitconfig` | Git-Konfiguration (readonly) |
| `~/.ssh` | `/root/.ssh` | SSH-Keys (readonly) |

---

## Hinweis: npm-Cache deaktiviert

Das Mounting des npm-Cache-Verzeichnisses (`_Docker/project/.npm` → `/root/.npm`) wurde deaktiviert. Der npm-Cache wird nun containerlokal verwaltet und nicht mehr zwischen Host und Container geteilt. Die entsprechenden Stellen in `run-in-docker.sh` sind auskommentiert. Bei Bedarf können sie wieder aktiviert werden.

---

## Externe Abhängigkeiten

### Voraussetzungen auf dem Host

- **Docker** – muss installiert und lauffähig sein
- **shasum oder sha1sum** – für die Container-Name-Generierung (auf macOS standardmäßig vorhanden)
- **`~/.gitconfig`** – wird readonly in den Container gemountet
- **`~/.ssh`** – wird readonly in den Container gemountet (für Git-Zugriff auf private Repos)

### Verzeichnisse (werden automatisch erstellt)

Folgende Verzeichnisse werden beim ersten Start von `run-in-docker.sh` automatisch im `_Docker/`-Unterverzeichnis angelegt:

- `_Docker/project/.claude/`, `_Docker/project/.codex/`, `_Docker/project/pip/`, `_Docker/project/.local/`, `_Docker/project/.opencode/`, `_Docker/project/.gemini/`
- ~~`_Docker/project/.npm/`~~ – **deaktiviert** (wird nicht mehr erstellt/gemountet)

### Dateien

- **`_Docker/Dockerfile`** – Das Docker-Image-Rezept
- **`_Docker/project/container.claude.json`** – wird als `{}` angelegt, falls nicht vorhanden. Kann Claude Code Settings enthalten (z.B. API-Keys, Konfiguration).

### Umgebungsvariablen

- **Keine** explizit erforderlich auf dem Host
- Im Container wird `TERM=xterm-256color` gesetzt
- Die AI-Tools (Claude, Codex, Gemini) benötigen jeweils eigene **API-Keys**, die über die jeweiligen Konfigurations-Dateien oder Umgebungsvariablen im Container bereitgestellt werden müssen

### Netzwerkzugriffe (beim Image-Build)

- `raw.githubusercontent.com` – NVM-Installer
- `claude.ai` – Claude Code Installer
- `registry.npmjs.org` – npm-Pakete (Opencode, Codex, Gemini CLI)
- Ubuntu APT-Repositories

---

## Nutzung – Schritt für Schritt

```bash
# 1. Image bauen (einmalig, danach nur bei Änderungen am Dockerfile)
./run-in-docker.sh --build

# 2. Container für das aktuelle Projekt starten
./run-in-docker.sh

# 3. Oder für ein anderes Projekt
./run-in-docker.sh /pfad/zum/projekt

# 4. Im Container: AI-Tools nutzen
claude          # Claude Code starten
codex           # OpenAI Codex starten
gemini          # Gemini CLI starten
opencode        # Opencode starten

# 5. Container verlassen
exit            # Shell beenden → Container wird automatisch gestoppt

# 6. Aufräumen
./run-in-docker.sh --list     # Übersicht
./run-in-docker.sh --clean    # Gestoppte Container entfernen
```

### Tipp: Symlink für globalen Zugriff

```bash
ln -s /pfad/zu/_Docker/run-in-docker.sh /usr/local/bin/run-in-docker
# Danach von überall nutzbar:
run-in-docker
```
