# ESF:Enterprise Software Fabric

Usecase getriebene Softwareentwicklung mit AI-Agenten

Von der Vision zur Software - in einem geleiteten Prozess: Strukturiert, Verifziert, Nachvollziehbar. Für frühe Projektphasen von Enterprise Fachanwendungen: Proof-of-Concepts, Prototypen, MVPs  - aber auch in existierendem Code einestzbar.

Ein Claude-Code-Plugin für Produktmanager, Business Analysten, Architekten.

**Quickstart:**

In Claude-Code nacheinander abarbeiten:

`/esf:new-project`

`/esf:feature-exploration`

`/esf:create-project-plan`

`/esf:discuss-sprint 1`

`/esf:plan-sprint 1`

`/esf:execute-sprint 1`

usw. - siehe `plugins/esf-enterprise-software-factory/esf-lebenszyklus.excalidraw`

---

## 1. Überblick

Das **ESF (Enterprise Software Framework)** ist ein Plugin für Claude Code, das einen vollständigen Softwareentwicklungsprozess implementiert. Im Zentrum steht die **Use-Case-Methodik nach Alistair Cockburn** -- erweitert um AI-gestützte Agenten, die einzelne Prozessphasen autonom übernehmen.

1. Klare Trennung von "Main Success Scenario" und "Extensions"
2. Strukturierte natürliche Sprache (Semi-formal)
3. Definition von Vorbedingungen und Erfolgsgarantien (Scope)
4. Drei ineinandergreifende Ebenen der Granularität (Summary, Epic, Task)
5. Akteur-System-Interaktion (Der "Tennis-Schlagabtausch")
  


### Kernidee

Statt Code direkt zu schreiben, durchläuft die App als Ganzes und jedes Feature einen strukturierten Prozess:

```
Vision → Use Cases → Szenarien → Roadmap → Phasenplanung → Implementierung → Verifikation
```

Jeder Schritt wird von spezialisierten AI-Agenten unterstützt oder vollständig übernommen. Der Benutzer behält die Kontrolle über Entscheidungen, während die Agenten die Detailarbeit leisten.

### Installation

# Marketplace registrieren

- Lokal (im ausgecheckten Repository): `/plugin marketplace add ./`

- Remote (github): `/plugin marketplace add aknip/aknip-claude-code-marketplace`

# Plugin installieren

- `/plugin install esf@aknip-claude-code-marketplace`


Nach der Installation stehen alle `esf:`-Skills als Slash-Commands in Claude Code zur Verfügung.

---

## 2. Die sechs AI-Agenten

Das ESF definiert sechs spezialisierte Agenten, die als Team zusammenarbeiten. Jeder Agent hat eine klar abgegrenzte Aufgabe und ein zugeordnetes AI-Modell.

### 2.1 UC-Analyst (`uc-analyst`)

| Eigenschaft | Wert |
|-------------|------|
| **Modell** | Sonnet |
| **Aufgabe** | Use Cases aus Projektvision und Anforderungen extrahieren |
| **Input** | Projektvision, Anforderungsdokumente, Benutzerinterviews |
| **Output** | Strukturierte Use Cases (Objectives + Epic-Level) |
| **Ausgelöst durch** | `/esf:new-project`, `/esf:analyze-requirements` |

Der UC-Analyst ist der erste Agent im Prozess. Er analysiert die Projektvision und identifiziert Akteure, Geschäftsziele und daraus abgeleitete Use Cases. Er erstellt:
- Die **Akteurstabelle** (End User, AI-Agenten, externe Systeme)
- **Objectives Use Cases** (Geschäftsprozesse auf hoher Ebene)
- **Epic Use Cases** (konkrete Benutzeraktionen)
- Den **Use Case Index** mit Traceability-Matrix

### 2.2 UC-Modeler (`uc-modeler`)

| Eigenschaft | Wert |
|-------------|------|
| **Modell** | Opus |
| **Aufgabe** | Roadmap aus Use Cases erstellen |
| **Input** | Use Case Index, Abhängigkeitsbeziehungen |
| **Output** | PROJECT-PLAN.md mit Phasen, Abhängigkeitsgraph, Sprint-Use-Case-Matrix |
| **Ausgelöst durch** | `/esf:create-project-plan` |

Der UC-Modeler organisiert die Use Cases in eine zeitlich geordnete Roadmap. Er:
- Gruppiert Use Cases in **Phasen** nach fachlichen Abhängigkeiten
- Erstellt den **Abhängigkeitsgraphen** zwischen Phasen
- Definiert **Erfolgskriterien** pro Sprint (abgeleitet aus Postconditions der Use Cases)
- Erzeugt eine **Sprint-Use-Case-Matrix** zur Übersicht

### 2.3 UC-Sprint-Researcher (`uc-sprint-researcher`)

| Eigenschaft | Wert |
|-------------|------|
| **Modell** | (konfigurierbar) |
| **Aufgabe** | Implementierungsansätze für eine Sprint recherchieren |
| **Input** | Sprint-Definition, Use Cases der Sprint, bestehender Code |
| **Output** | Technologie-Empfehlungen, Architekturvorschläge, Bibliotheksvergleiche |
| **Ausgelöst durch** | `/esf:plan-sprint` (optionaler Vorlauf) |

Der Sprint-Researcher analysiert den aktuellen Stand der Codebasis und recherchiert geeignete Implementierungsansätze. Er kann Web-Suchen durchführen und externe Dokumentation einbeziehen.

### 2.4 UC-Planner (`uc-planner`)

| Eigenschaft | Wert |
|-------------|------|
| **Modell** | Opus |
| **Aufgabe** | Detaillierte Ausführungspläne pro Sprint erstellen |
| **Input** | Sprint-Definition, Use Cases, Research-Ergebnisse, bestehender Code |
| **Output** | Aufgabenliste mit Task-Use-Cases, Dateizuordnungen, Reihenfolge |
| **Ausgelöst durch** | `/esf:plan-sprint` |

Der UC-Planner zerlegt die Epic Use Cases einer Sprint in **Task Use Cases** (UC-TK-XXX) -- konkrete, implementierbare Aufgaben. Er erstellt:
- **Aufgabenlisten** mit klarer Reihenfolge
- **Dateizuordnungen** (welche Dateien betroffen sind)
- **Abhängigkeiten** zwischen Aufgaben
- **Annahmen und Entscheidungen** (Assumptions-Log)

### 2.5 UC-Checker (`uc-checker`)

| Eigenschaft | Wert |
|-------------|------|
| **Modell** | Sonnet |
| **Aufgabe** | Pläne vor der Ausführung validieren (Pre-Execution Gate) |
| **Input** | Ausführungsplan, Use-Case-Szenarien, bestehender Code |
| **Output** | Validierungsbericht (Bestanden / Nachbesserung nötig) |
| **Ausgelöst durch** | `/esf:plan-sprint` (Post-Planning-Schritt) |

Der UC-Checker prüft, ob der erstellte Plan tatsächlich alle Szenarien der Use Cases abdeckt. Er ist das **Quality Gate** zwischen Planung und Implementierung:
- Vergleicht Plan-Aufgaben mit Acceptance Criteria der Use Cases
- Identifiziert fehlende Szenarien oder unberücksichtigte Alternative Flows
- Gibt den Plan erst frei, wenn alle Kriterien abgedeckt sind

### 2.6 UC-Executor (`uc-executor`)

| Eigenschaft | Wert |
|-------------|------|
| **Modell** | Sonnet |
| **Aufgabe** | Plan-Aufgaben implementieren (Code schreiben) |
| **Input** | Validierter Ausführungsplan, Use-Case-Spezifikationen |
| **Output** | Implementierter Code, erstellte/geänderte Dateien |
| **Ausgelöst durch** | `/esf:execute-sprint` |

Der UC-Executor ist der einzige Agent, der tatsächlich Code schreibt. Er arbeitet den Plan Aufgabe für Aufgabe ab und hat Zugriff auf:
- Datei-Lese- und Schreibwerkzeuge
- Bash-Befehle (Build, Install, etc.)
- Browser-Agent für UI-Tests

### 2.7 UC-Verifier (`uc-verifier`)

| Eigenschaft | Wert |
|-------------|------|
| **Modell** | Sonnet |
| **Aufgabe** | Implementierte Use Cases gegen Szenarien verifizieren |
| **Input** | Implementierter Code, Gherkin-Szenarien, laufende Anwendung |
| **Output** | Verifikationsbericht (Bestanden / Fehlgeschlagen pro Szenario) |
| **Ausgelöst durch** | `/esf:execute-sprint` (Post-Execution), `/esf:verify-sprint` |

Der UC-Verifier prüft nach der Implementierung, ob alle Acceptance Criteria erfüllt sind. Er kann dafür den **Agent-Browser** nutzen, um die UI automatisiert zu testen.

---

## 3. Die drei Ebenen der Use Cases

Das ESF verwendet eine dreistufige Use-Case-Hierarchie nach Cockburn:

### 3.1 Objectives (Geschäftsprozesse)

```
UC-OBJ-XXX: Geschäftsprozess auf höchster Ebene
```

- Beschreibt **was** das System leisten soll
- Enthält mehrere Epic Use Cases per `<<include>>`
- Beispiel: `UC-OBJ-001: Neugeschäft abwickeln` umfasst 6 Epic UCs
- Dient der Übersicht und Vollständigkeitsprüfung

### 3.2 Epic-Level (Benutzeraktionen)

```
UC-EP-XXX: Konkrete Aktion eines Benutzers
```

Jeder Epic Use Case enthält:
- **Metadaten**: ID, Level, Parent, Primary Actor, Supporting Actors, Priority, Sprint, Status
- **Description**: Fließtextbeschreibung der Aktion
- **Trigger**: Was löst den Use Case aus?
- **Preconditions**: Welche Voraussetzungen müssen erfüllt sein?
- **Main Success Scenario**: Schritt-für-Schritt-Ablauf des Normalfalls
- **Alternative Flows**: Abweichungen und Fehlerfälle
- **Postconditions**: Welcher Zustand gilt nach erfolgreicher Ausführung?
- **Acceptance Criteria**: Gherkin-Szenarien (Given/When/Then)
- **UI Notes**: Hinweise zur Benutzeroberfläche
- **Relationships**: Include/Extend-Beziehungen zu anderen Use Cases

### 3.3 Task-Level (Implementierungsaufgaben)

```
UC-TK-XXX: Technische Teilaufgabe
```

- Werden erst während der **Sprint-Planung** durch den UC-Planner erstellt
- Sind direkt implementierbare Aufgaben
- Jede Task ist einem Epic UC zugeordnet

### Beziehungen zwischen Use Cases

| Beziehung | Bedeutung |
|-----------|-----------|
| `<<include>>` | Use Case A enthält immer Use Case B |
| `<<extend>>` | Use Case B erweitert Use Case A unter bestimmten Bedingungen |

---

## 4. Der Gesamtprozess: Vom Projekt zur fertigen Software

### 4.1 Sprint 0: Projektinitialisierung (`/esf:new-project`)

```
Benutzer → beschreibt Projektvision
                ↓
         UC-Analyst Agent
                ↓
         Ergebnis: PROJECT.md + Use Cases + Index
```

**Was passiert:**
1. Der Benutzer beschreibt die Projektvision (was soll die Software tun?)
2. Der **UC-Analyst** analysiert die Vision und extrahiert:
   - Akteure (wer nutzt das System?)
   - Objectives Use Cases (welche Geschäftsprozesse?)
   - Epic Use Cases (welche konkreten Aktionen?)
3. Es entstehen:
   - `.planning/PROJECT.md` -- Projektbeschreibung mit Akteuren, Kontext, Constraints
   - `.planning/use-cases/objective/UC-OBJ-XXX-*.md` -- Objectives Use Cases
   - `.planning/use-cases/epic/UC-EP-XXX-*.md` -- Epic Use Cases
   - `.planning/use-cases/index.md` -- Master-Index mit Traceability-Matrix
   - `.planning/config.json` -- Projektkonfiguration
   - `.planning/PROJECT-STATUS.md` -- Projektstatus

### 4.2 Feature-Exploration (`/esf:feature-exploration`)

```
Objectives Use Cases
         ↓
    Szenarien entwickeln (interaktiv)
         ↓
    Szenarien bewerten und synthetisieren
         ↓
    Final-Szenario als Grundlage für Roadmap
```

**Was passiert:**
1. Für die Objectives Use Cases werden verschiedene **Implementierungsszenarien** entwickelt
2. Jedes Szenario beschreibt einen anderen Ansatz (z.B. "Kanban-zentriert" vs. "Dokumentenzentriert")
3. Szenarien werden über mehrere **Runden** verfeinert (interaktiver Dialog)
4. Am Ende entsteht ein **Final-Szenario** als Synthese der besten Aspekte
5. Das Final-Szenario enthält:
   - Mapping zu allen Objectives Use Cases
   - Interaktionskonzept und UI-Konzept
   - Vorgeschlagene Epic Use Cases
   - Vorgeschlagene Roadmap-Phasen
   - Capabilities & Features-Liste

**Dateien:**
- `.planning/feature-scenarios/feature-scenario-1-*/` -- Szenario-Dokumentation
- `.planning/feature-scenarios/final/FINAL-FEATURE-SCENARIO.md` -- Finales Szenario
- `.planning/feature-scenarios/FEATURE-SCENARIOS-PROJECT-STATUS.md` -- Status der Exploration

### 4.3 Roadmap erstellen (`/esf:create-project-plan`)

```
Use Cases + Final-Szenario
         ↓
    UC-Modeler Agent
         ↓
    PROJECT-PLAN.md mit Phasen und Abhängigkeiten
```

**Was passiert:**
1. Der **UC-Modeler** nimmt alle Epic Use Cases und das Final-Szenario
2. Er gruppiert die Use Cases in **zeitlich geordnete Phasen**
3. Er berücksichtigt:
   - Fachliche Abhängigkeiten (z.B. "Editor muss vor Dokumentimport existieren")
   - Include/Extend-Beziehungen zwischen Use Cases
   - Prioritäten (Must vor Should vor Could)
4. Es entsteht:
   - `.planning/PROJECT-PLAN.md` -- Roadmap mit Phasen, Erfolgskriterien, Abhängigkeitsgraph
   - Sprint-Verzeichnisse unter `.planning/sprints/XX-name/`

### 4.4 Sprint diskutieren (`/esf:discuss-sprint`)

```
Sprint-Definition
         ↓
    Interaktiver Dialog mit dem Benutzer
         ↓
    Kontext und Entscheidungen für die Planung
```

**Was passiert:**
1. Vor der eigentlichen Planung kann der Benutzer Kontext liefern
2. Adaptive Fragen klären offene Punkte:
   - Technologie-Entscheidungen
   - UI-Präferenzen
   - Architektur-Vorgaben
3. Die Ergebnisse fließen in die anschließende Sprint-Planung ein

### 4.5 Sprint planen (`/esf:plan-sprint`)

```
Sprint + Use Cases + Codebase
         ↓
    UC-Sprint-Researcher (optional)
         ↓
    UC-Planner Agent
         ↓
    UC-Checker Agent (Quality Gate)
         ↓
    Validierter Ausführungsplan
```

**Was passiert:**
1. Optional: Der **UC-Sprint-Researcher** analysiert die Codebasis und recherchiert Ansätze
2. Der **UC-Planner** erstellt den Ausführungsplan:
   - Zerlegt Epic Use Cases in **Task Use Cases** (UC-TK-XXX)
   - Definiert Aufgabenreihenfolge und Abhängigkeiten
   - Ordnet Dateien zu
   - Dokumentiert Annahmen
3. Der **UC-Checker** validiert den Plan (Pre-Execution Gate):
   - Prüft Abdeckung aller Acceptance Criteria
   - Identifiziert fehlende Szenarien
   - Gibt den Plan erst frei, wenn er vollständig ist

**Dateien:**
- `.planning/sprints/XX-name/plan.md` -- Ausführungsplan
- `.planning/sprints/XX-name/assumptions.md` -- Annahmen und Entscheidungen
- `.planning/use-cases/task/UC-TK-XXX-*.md` -- Task Use Cases

### 4.6 Sprint ausführen (`/esf:execute-sprint`)

```
Validierter Plan
         ↓
    UC-Executor Agent
         ↓
    Code-Implementierung (Aufgabe für Aufgabe)
         ↓
    UC-Verifier Agent
         ↓
    Verifikation gegen Gherkin-Szenarien
```

**Was passiert:**
1. Der **UC-Executor** implementiert den Plan:
   - Arbeitet Aufgaben sequenziell ab
   - Schreibt Code, erstellt Dateien, installiert Abhängigkeiten
   - Kann den **Agent-Browser** für UI-Tests nutzen
2. Nach der Implementierung prüft der **UC-Verifier**:
   - Führt Gherkin-Szenarien gegen die Implementierung aus
   - Nutzt den Agent-Browser für automatisierte UI-Tests
   - Erstellt Verifikationsbericht

### 4.7 Sprint verifizieren (`/esf:verify-sprint`)

Kann auch eigenständig (ohne vorherige Execution) aufgerufen werden:
- Prüft den aktuellen Stand der Implementierung
- Führt alle Acceptance Criteria der Sprint-Use-Cases aus
- Erstellt detaillierten Verifikationsbericht

### 4.8 Milestone abschließen (`/esf:complete-milestone`)

```
Alle Phasen implementiert + verifiziert
         ↓
    /esf:audit-milestone (Vollständigkeitsprüfung)
         ↓
    /esf:complete-milestone (Git-Tag + Archivierung)
         ↓
    /esf:new-milestone (nächster Milestone)
```

**Was passiert:**
1. `/esf:audit-milestone` prüft, ob alle Use Cases implementiert und verifiziert sind
2. `/esf:complete-milestone` erstellt einen Git-Release-Tag
3. `/esf:new-milestone` startet den nächsten Milestone-Zyklus

---

## 5. Der vollständige Lebenszyklus

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJEKT-LEBENSZYKLUS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /esf:new-project ──→ UC-Analyst ──→ Use Cases + PROJECT.md    │
│         │                                                       │
│         ▼                                                       │
│  /esf:feature-exploration ──→ Szenarien ──→ Final-Szenario     │
│         │                                                       │
│         ▼                                                       │
│  /esf:create-project-plan ──→ UC-Modeler ──→ PROJECT-PLAN.md             │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              PRO SPRINT (wiederholt)                   │       │
│  │                                                      │       │
│  │  /esf:discuss-sprint ──→ Kontext klären               │       │
│  │         │                                            │       │
│  │         ▼                                            │       │
│  │  /esf:plan-sprint                                     │       │
│  │    ├─→ UC-Sprint-Researcher ──→ Recherche             │       │
│  │    ├─→ UC-Planner ──→ Ausführungsplan                │       │
│  │    └─→ UC-Checker ──→ Validierung (Gate)             │       │
│  │         │                                            │       │
│  │         ▼                                            │       │
│  │  /esf:execute-sprint                                  │       │
│  │    ├─→ UC-Executor ──→ Code schreiben                │       │
│  │    └─→ UC-Verifier ──→ Szenarien prüfen              │       │
│  │         │                                            │       │
│  │         ▼                                            │       │
│  │  /esf:verify-sprint ──→ Abnahme                       │       │
│  └──────────────────────────────────────────────────────┘       │
│         │                                                       │
│         ▼                                                       │
│  /esf:audit-milestone ──→ Vollständigkeitsprüfung               │
│         │                                                       │
│         ▼                                                       │
│  /esf:complete-milestone ──→ Git-Tag + Archivierung             │
│         │                                                       │
│         ▼                                                       │
│  /esf:new-milestone ──→ Nächster Zyklus                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Alle ESF-Skills im Überblick

### 6.1 Projekt-Setup und Analyse

| Skill | Beschreibung |
|-------|-------------|
| `/esf:new-project` | Neues Projekt initialisieren -- Vision analysieren, Use Cases extrahieren |
| `/esf:analyze-requirements` | Use Cases aus bestehenden Anforderungsdokumenten extrahieren |
| `/esf:map-codebase` | Bestehende Codebasis analysieren (Brownfield-Mapping) |
| `/esf:feature-exploration` | Implementierungsszenarien für Objectives Use Cases erkunden |

### 6.2 Use-Case-Verwaltung

| Skill | Beschreibung |
|-------|-------------|
| `/esf:add-use-case` | Neuen Use Case manuell hinzufügen |
| `/esf:link-use-cases` | Include/Extend-Beziehungen zwischen Use Cases erstellen |
| `/esf:progress` | Fortschritt der Use-Case-Implementierung anzeigen |

### 6.3 Roadmap und Phasen

| Skill | Beschreibung |
|-------|-------------|
| `/esf:create-project-plan` | Roadmap aus Use Cases generieren |
| `/esf:add-sprint` | Neue Sprint zur Roadmap hinzufügen |
| `/esf:insert-sprint` | Sprint an bestimmter Position einfügen |
| `/esf:remove-sprint` | Sprint archivieren und entfernen |
| `/esf:renumber-sprints` | Phasen-Nummerierung korrigieren |

### 6.4 Planung und Ausführung

| Skill | Beschreibung |
|-------|-------------|
| `/esf:discuss-sprint` | Kontext für eine Sprint durch adaptiven Dialog sammeln |
| `/esf:plan-sprint` | Ausführungsplan für eine Sprint erstellen (Research → Plan → Check) |
| `/esf:execute-sprint` | Sprint implementieren (Executor → Verifier) |
| `/esf:verify-sprint` | Use-Case-Szenarien einer Sprint eigenständig verifizieren |
| `/esf:list-sprint-assumptions` | Annahmen und Entscheidungen einer Sprint anzeigen |

### 6.5 Automatisierung

| Skill | Beschreibung |
|-------|-------------|
| `/esf:autopilot` | Vollautomatische Milestone-Ausführung aus bestehender Roadmap |
| `/esf:checkpoints` | Checkpoint-Entscheidungen aus Autopilot-Modus prüfen und genehmigen |
| `/esf:quick` | Kleine Ad-hoc-Aufgaben mit UC-Garantien ausführen |

### 6.6 Session-Management

| Skill | Beschreibung |
|-------|-------------|
| `/esf:pause-work` | Aktuellen Arbeitsstand für spätere Wiederaufnahme sichern |
| `/esf:resume-work` | Arbeit aus einer pausierten Session fortsetzen |

### 6.7 Milestone-Verwaltung

| Skill | Beschreibung |
|-------|-------------|
| `/esf:audit-milestone` | Milestone auf Vollständigkeit prüfen |
| `/esf:complete-milestone` | Milestone abschließen (Git-Tag erstellen) |
| `/esf:new-milestone` | Neuen Milestone-Zyklus starten |

### 6.8 Wartung und Diagnose

| Skill | Beschreibung |
|-------|-------------|
| `/esf:update-history-based-on-code` | UC-Dokumentation mit aktuellem Code synchronisieren |
| `/esf:add-todo` | TODO-Items für sessionübergreifende Nachverfolgung hinzufügen |
| `/esf:check-todos` | TODO-Items auflisten und filtern |
| `/esf:settings` | UC-Framework-Konfiguration anzeigen und verwalten |
| `/esf:debug` | Diagnose-Befehle für Framework-Probleme |
| `/esf:help` | Alle verfügbaren Skills anzeigen |

### 6.9 Diagramme

| Skill | Beschreibung |
|-------|-------------|
| `/esf:excalidraw-diagramming` | Excalidraw-Diagramme generieren |

---

## 7. Verzeichnisstruktur

Das ESF erstellt und verwaltet eine standardisierte Projektstruktur:

```
.planning/
├── config.json                          # Projektkonfiguration
├── PROJECT.md                           # Projektbeschreibung
├── PROJECT-PLAN.md                           # Phasen-Roadmap
├── PROJECT-STATUS.md                             # Aktueller Projektstatus
│
├── use-cases/
│   ├── index.md                         # Master-Index + Traceability
│   ├── summary/
│   │   ├── UC-OBJ-001-*.md                # Objectives Use Cases
│   │   └── ...
│   ├── epic/
│   │   ├── UC-EP-001-*.md               # Epic Use Cases
│   │   └── ...
│   └── task/                     # (erstellt während Sprint-Planung)
│       ├── UC-TK-001-*.md
│       └── ...
│
├── sprints/
│   ├── 01-name/
│   │   ├── plan.md                      # Ausführungsplan
│   │   └── assumptions.md               # Annahmen-Log
│   ├── 02-name/
│   └── ...
│
├── scenarios/                           # (erstellt durch Feature-Exploration)
│   ├── FEATURE-SCENARIOS-PROJECT-STATUS.md
│   ├── feature-scenario-1-name/
│   ├── feature-scenario-2-name/
│   └── final/
│       └── FINAL-FEATURE-SCENARIO.md
│
└── sessions/                            # (erstellt durch Pause/Resume)
```

---

## 8. Konfiguration (`config.json`)

```json
{
  "mode": "interactive",              // interactive | autopilot
  "depth": "standard",                // quick | standard | thorough
  "parallelization": true,            // Parallele Agent-Ausführung
  "commit_docs": true,                // Dokumentation automatisch committen
  "model_profile": "quality",         // quality | balanced | fast
  "specification_mode": "use-case",   // use-case (einziger Modus)

  "autopilot": {
    "checkpoint_mode": "queue",        // queue | auto | manual
    "max_retries": 3,
    "budget_limit_usd": 0,
    "notify_webhook": ""
  },

  "use_case": {
    "template_version": "1.0",
    "auto_tasks": true,          // Tasks automatisch erstellen
    "verify_scenarios": true,          // Nach Execution verifizieren
    "browser_test_ui": true,           // Agent-Browser für UI-Tests
    "acceptance_format": "gherkin"     // Gherkin-Format für Akzeptanzkriterien
  },

  "workflow": {
    "research": true,                  // Sprint-Research vor Planung
    "plan_check": false,               // UC-Checker aktivieren
    "verifier": true                   // UC-Verifier nach Execution
  },

  "milestone": {
    "current_version": "1.0.0",
    "auto_tag": true,                  // Git-Tags automatisch erstellen
    "archive_on_complete": true        // Phasen nach Abschluss archivieren
  },

  "agents": {
    "uc-analyst":  { "model": "sonnet" },
    "uc-modeler":  { "model": "opus" },
    "uc-planner":  { "model": "opus" },
    "uc-executor": { "model": "sonnet" },
    "uc-verifier": { "model": "sonnet" },
    "uc-checker":  { "model": "sonnet" }
  }
}
```

### Modellprofile

| Profil | Beschreibung | Agent-Zuordnung |
|--------|-------------|-----------------|
| **quality** | Höchste Qualität, höchste Kosten | Opus für Planung, Sonnet für Ausführung |
| **balanced** | Gutes Verhältnis Qualität/Kosten | Sonnet für alle Agenten |
| **fast** | Schnellste Ausführung, niedrigste Kosten | Haiku für einfache, Sonnet für komplexe Aufgaben |

---

## 9. Qualitätssicherung: Die drei Gates

Das ESF implementiert drei Qualitätssicherungsstufen:

### Gate 1: UC-Checker (Pre-Execution)

- **Wann:** Nach der Sprint-Planung, vor der Implementierung
- **Prüft:** Deckt der Plan alle Acceptance Criteria ab?
- **Blockiert:** Implementierung startet nur bei bestandener Prüfung

### Gate 2: UC-Verifier (Post-Execution)

- **Wann:** Nach der Implementierung
- **Prüft:** Erfüllt der Code alle Gherkin-Szenarien?
- **Methode:** Automatisierte UI-Tests via Agent-Browser

### Gate 3: Milestone-Audit (Pre-Release)

- **Wann:** Vor dem Milestone-Abschluss
- **Prüft:** Sind alle Use Cases aller Phasen implementiert und verifiziert?
- **Blockiert:** Milestone wird nur bei Vollständigkeit abgeschlossen

---

## 10. Autopilot-Modus

Der Autopilot (`/esf:autopilot`) automatisiert den gesamten Phasen-Zyklus:

```
Für jede Sprint in der Roadmap:
  1. plan-sprint (Research → Plan → Check)
  2. execute-sprint (Executor → Verifier)
  3. Bei Checkpoints: Entscheidung nach checkpoint_mode
```

### Checkpoint-Modi

| Modus | Verhalten |
|-------|-----------|
| `queue` | Entscheidungen werden gesammelt, Benutzer prüft später via `/esf:checkpoints` |
| `auto` | Alle Entscheidungen werden automatisch getroffen |
| `manual` | Benutzer wird bei jeder Entscheidung gefragt |

---

## 11. Use-Case-Template (Gherkin-Format)

Jeder Epic Use Case enthält Acceptance Criteria im Gherkin-Format:

```gherkin
Feature: UC-EP-XXX Name des Use Case

  Scenario: Normaler Ablauf
    Given [Vorbedingung]
    And [weitere Vorbedingung]
    When [Benutzeraktion]
    Then [erwartetes Ergebnis]
    And [weiteres Ergebnis]

  Scenario: Alternativer Ablauf
    Given [Vorbedingung]
    When [abweichende Aktion]
    Then [abweichendes Ergebnis]
```

Diese Szenarien dienen als:
- **Spezifikation**: Was genau soll implementiert werden?
- **Testfälle**: Wogegen wird verifiziert?
- **Dokumentation**: Was wurde tatsächlich implementiert?

---

## 12. Zusammenspiel der Agenten (Sequenzdiagramm)

```
Benutzer    UC-Analyst    UC-Modeler    Researcher    UC-Planner    UC-Checker    UC-Executor    UC-Verifier
   │             │             │             │             │             │              │              │
   ├──Vision────►│             │             │             │             │              │              │
   │             ├─Use Cases──►│             │             │             │              │              │
   │             │             ├──Roadmap───►│             │             │              │              │
   │             │             │             │             │             │              │              │
   │  ┌──────── Pro Sprint ──────────────────────────────────────────────────────────────────────────┐ │
   │  │         │             │             │             │             │              │              │ │
   │  │         │             │    Research─┤             │             │              │              │ │
   │  │         │             │             ├────Plan────►│             │              │              │ │
   │  │         │             │             │             ├───Check────►│              │              │ │
   │  │         │             │             │             │             ├───Execute───►│              │ │
   │  │         │             │             │             │             │              ├───Verify────►│ │
   │  └─────────┘             │             │             │             │              │              │ │
   │                          │             │             │             │              │              │
```

---

## 13. Kernprinzipien des ESF

1. **Use Cases als Single Source of Truth**: Jede Anforderung, jeder Test, jede Verifikation bezieht sich auf Use Cases
2. **Agenten-Spezialisierung**: Jeder Agent hat genau eine Aufgabe -- kein Agent plant und implementiert gleichzeitig
3. **Quality Gates**: Drei Prüfpunkte verhindern, dass unvollständige Arbeit weitergegeben wird
4. **Traceability**: Jede Code-Zeile ist über Tasks → Epics → Objectives bis zur Projektvision rückverfolgbar
5. **Iterativ und inkrementell**: Der Prozess ist phasenweise angelegt -- jede Sprint liefert funktionsfähige Software
6. **Mensch-in-the-Loop**: Der Benutzer kontrolliert alle Entscheidungen; Agenten schlagen vor, der Mensch entscheidet
7. **Dokumentation als Nebenprodukt**: Die Dokumentation entsteht automatisch durch den Prozess, nicht als separate Aufgabe

---

*Erstellt: 25.02.2026*
*Quelle: Analyse der ESF-Plugin-Skills, Agenten und Projektstruktur des UW-Workbench-Projekts*
