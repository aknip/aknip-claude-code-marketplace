---
name: uc:update-history-based-on-code
description: Sync UC documentation content with actual code (single point of truth)
argument-hint: "[--milestone VERSION] [--execute] [--summary-only]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Edit
  - Task
  - Glob
  - Grep
---

<objective>

Analyze the current codebase as "single point of truth" and compare it against all UC documentation files. Identifies content discrepancies (not just status — the actual scenarios, test data, UI mockups, code references, formulas, and cross-references) and creates a detailed update plan.

**Problem this solves:** After milestone completion, UC file statuses get updated (Draft -> Implemented) but the *content* of UC files often still reflects the pre-implementation planning state. This command detects and fixes that gap.

**Input:** Milestone version (optional, auto-detected from config or STATE.md)

**Flags:**
- `--milestone VERSION` — Target specific milestone (default: latest completed)
- `--execute` — After analysis, also execute the update plan (apply changes to UC files)
- `--summary-only` — Skip plan creation, only generate summary report

**Creates:**
- `.planning/updates/{VERSION}/Update-Usecases_PLAN.md` — Detailed discrepancy analysis and update plan
- `.planning/updates/{VERSION}/Update-Usecases_SUMMARY.md` — Summary report with metrics
- `.planning/updates/{VERSION}/Documentation-Review-Report.md` — Consistency check (IDs, statuses, parents)

**After this command:** Review the plan, then either run with `--execute` or manually apply changes.

</objective>

<process>

## Phase 1: Validate and Prepare

**Parse arguments:**

```bash
MILESTONE_ARG=""
EXECUTE_MODE=false
SUMMARY_ONLY=false

# Parse flags
for arg in "$@"; do
  case "$arg" in
    --milestone) shift; MILESTONE_ARG="$1" ;;
    --execute) EXECUTE_MODE=true ;;
    --summary-only) SUMMARY_ONLY=true ;;
  esac
done
```

**Determine milestone version:**

```bash
if [ -z "$MILESTONE_ARG" ]; then
  # Try config.json first
  MILESTONE_VERSION=$(cat .planning/config.json 2>/dev/null | grep -o '"current_version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')

  # Fallback: extract from STATE.md
  if [ -z "$MILESTONE_VERSION" ]; then
    MILESTONE_VERSION=$(grep "Current Milestone:" .planning/STATE.md 2>/dev/null | grep -o 'v[0-9.]*')
  fi

  # Fallback: latest git tag
  if [ -z "$MILESTONE_VERSION" ]; then
    MILESTONE_VERSION=$(git tag --sort=-v:refname | head -1 | tr -d 'v')
  fi
else
  MILESTONE_VERSION="$MILESTONE_ARG"
fi

echo "Target milestone: v${MILESTONE_VERSION}"
```

**Ensure output directory:**

```bash
OUTPUT_DIR=".planning/updates/v${MILESTONE_VERSION}"
mkdir -p "$OUTPUT_DIR"
```

**Load context files:**

Read these files to understand current project state:
- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/use-cases/index.md`
- `.planning/codebase/ARCHITECTURE.md` (if exists)

## Phase 2: Parallel Analysis

Launch TWO parallel analysis agents to gather data:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► ANALYZING CODE vs. DOCUMENTATION (v${MILESTONE_VERSION})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning parallel analysis agents...
```

### Agent 1: UC Documentation Analyzer

```
Task(prompt="
<task>
Analyze ALL use case documentation files for content accuracy.

For EACH UC file (Summary, User-Goal, Subfunction):
1. Read the file completely
2. Extract key content claims:
   - Test data references (project names, team names, counts)
   - Phase assignments
   - Parent references (ID and label)
   - UI mockup descriptions
   - Code/API references (file paths, function names)
   - Formulas and calculations
   - Cross-references to other UCs
   - Acceptance criteria / scenarios
3. Note the file's current status (Implemented, Verified, etc.)
4. Flag anything that looks like pre-implementation planning content

Output a structured analysis per file in markdown format.
Save to: ${OUTPUT_DIR}/UC-Content-Analysis.md
</task>

<files>
@.planning/use-cases/index.md
@.planning/use-cases/summary/
@.planning/use-cases/user-goal/
@.planning/use-cases/subfunction/
</files>
", subagent_type="Explore", description="Analyze UC documentation")
```

### Agent 2: Codebase Feature Inventory

```
Task(prompt="
<task>
Create a comprehensive feature inventory of the current codebase.

Analyze:
1. **Demo/Test Data**: Read demo-data.json, seed files, scenario files
   - Extract: tenant names, team names/capacities, project names, objective names/efforts
   - Note: exact file paths for each data source

2. **Feature Components**: For each feature in src/features/
   - List all components with their purposes
   - Note key props and data flow
   - Identify UI patterns (dialogs, tables, charts, forms)

3. **Stores**: For each store in src/stores/
   - List exported state fields and actions
   - Note store dependencies

4. **API Endpoints**: For each route in src/server/routes/
   - List endpoints (method + path)
   - Note request/response shapes

5. **CCPM/Calculations**: Read src/lib/ccpm/ and other calculation files
   - Extract formulas, constants, interfaces
   - Note function signatures

6. **Routing**: List all routes from src/routes/
   - Note protected vs public routes

Output a structured inventory in markdown.
Save to: ${OUTPUT_DIR}/Code-Inventory.md
</task>

<codebase>
Analyze these directories:
- src/features/
- src/stores/
- src/server/routes/
- src/server/data/
- src/server/db/
- src/lib/
- src/routes/
</codebase>
", subagent_type="Explore", description="Analyze codebase features")
```

## Phase 3: Cross-Reference and Discrepancy Detection

After both agents complete, perform systematic comparison:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► CROSS-REFERENCING CODE vs. DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.1 Consistency Check (Structural)

For each UC file, verify:

| Check | Source | Comparison |
|-------|--------|-----------|
| UC-ID match | index.md | UC file metadata |
| Status match | index.md | UC file metadata |
| Parent-ID valid | UC file | Parent UC file exists |
| Parent label correct | UC file | Parent UC actual name |
| Phase assignment | UC file | ROADMAP.md |
| Field name format | UC file | Standard (`**Parent**` not `**Parent UC**`) |

Save to: `${OUTPUT_DIR}/Documentation-Review-Report.md`

### 3.2 Content Discrepancy Detection (Per UC File)

For each UC file, compare documented content against Code-Inventory:

**Category A: Test Data**
- Compare documented project/team/objective names against demo-data.json
- Compare documented counts (teams, projects, objectives) against actual data
- Compare documented capacities, efforts, buffer percentages

**Category B: UI Mockups**
- Compare documented UI layout against actual component structure
- Check for missing UI elements (dialogs, charts, filters, banners)
- Check for removed UI elements still documented

**Category C: Phase References**
- Compare documented phase assignments against ROADMAP.md
- Check milestone assignments

**Category D: Cross-References**
- Check for missing v2.0 cross-references (Timewarp, centralized CCPM, etc.)
- Check Include/Extend relationships in Summary UCs
- Verify all referenced UC-IDs exist

**Category E: Code/API References**
- Verify file paths in Implementation fields exist in filesystem
- Check API endpoint references match actual routes
- Verify function/interface names match code

**Category F: Formulas and Calculations**
- Compare documented formulas against src/lib/ccpm/ implementations
- Check constants (zone boundaries, opacity values, etc.)
- Verify interface field names match code

**Category G: Parent Assignments**
- Verify parent UC IDs are semantically correct (not just valid)
- Flag cases where UC content doesn't match parent's scope

**Category H: Structural**
- Check for inconsistent metadata field names
- Check for missing mandatory sections

### 3.3 Prioritize Discrepancies

Classify each discrepancy:

| Priority | Criteria | Examples |
|----------|----------|---------|
| **Hoch** | Would cause incorrect planning decisions | Wrong test data, wrong phases, missing includes |
| **Mittel** | Misleading but not blocking | Outdated UI mockups, wrong code references |
| **Niedrig** | Cosmetic or structural | Field name inconsistencies, missing dates |

## Phase 4: Generate Update Plan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► GENERATING UPDATE PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Create `${OUTPUT_DIR}/Update-Usecases_PLAN.md` with:

```markdown
# Plan: Use-Case-Dateien inhaltlich auf Code-Stand aktualisieren

**Erstellt:** [DATE]
**Ziel:** Alle UC-Dateien inhaltlich mit dem tatsaechlichen Code abgleichen
**Single Point of Truth:** Aktueller Code auf Branch `[BRANCH]`
**Milestone:** v[VERSION]

## 1. Problemanalyse
[Summary of gap between status updates and content updates]

## 2. Detailanalyse pro UC-Datei

### 2.1 Summary-Level Use Cases (UC-S-*)
[Per-file discrepancy table with checkboxes]

### 2.2 User-Goal-Level Use Cases (UC-UG-*)
[Per-file discrepancy table with before/after comparison]

### 2.3 Subfunction-Level Use Cases (UC-SF-*)
[Critical discrepancies only, systematic checks for rest]

## 3. Umsetzungsplan

### Phase 1: Kritische Korrekturen (Hohe Prioritaet)
[Files and changes for high-priority fixes]

### Phase 2: UI/Szenario-Aktualisierungen (Mittlere Prioritaet)
[Files and changes for medium-priority fixes]

### Phase 3: Code-Referenzen und Strukturbereinigung (Niedrige Prioritaet)
[Files and changes for low-priority fixes]

## 4. Zusammenfassung der Aenderungen
[File counts per priority, detailed file list]

## 5. Umsetzungsstrategie
[Recommended approach: batch vs manual, QA steps]
```

## Phase 5: Generate Summary Report

Create `${OUTPUT_DIR}/Update-Usecases_SUMMARY.md`:

```markdown
# UC-Dokumentation Inhaltssynchronisation — Summary

**Datum:** [DATE]
**Milestone:** v[VERSION]
**Branch:** [BRANCH]
**Single Point of Truth:** Aktueller Code

## Ergebnis

| Metrik | Wert |
|--------|------|
| UC-Dateien geprueft | [N] |
| Diskrepanzen gefunden | [N] |
| Hohe Prioritaet | [N] Dateien |
| Mittlere Prioritaet | [N] Dateien |
| Niedrige Prioritaet | [N] Dateien |
| Keine Aenderung noetig | [N] Dateien |

## Diskrepanz-Kategorien

| Kategorie | Anzahl | Beispiele |
|-----------|--------|-----------|
| A) Veraltete Testdaten | [N] | [UC-IDs] |
| B) Veraltete UI-Mockups | [N] | [UC-IDs] |
| C) Falsche Phase-Referenzen | [N] | [UC-IDs] |
| D) Fehlende Cross-Referenzen | [N] | [UC-IDs] |
| E) Veraltete Code-Referenzen | [N] | [UC-IDs] |
| F) Falsche Formeln/Konstanten | [N] | [UC-IDs] |
| G) Falsche Parent-Zuordnungen | [N] | [UC-IDs] |
| H) Strukturelle Inkonsistenzen | [N] | [UC-IDs] |

## Top-10 kritischste Abweichungen

1. [UC-ID]: [Kurzbeschreibung]
2. ...

## Konsistenzpruefung (Strukturell)

| Pruefbereich | Ergebnis |
|-------------|----------|
| UC-IDs Index vs. Dateien | [OK/DISKREPANZ] |
| Status-Konsistenz | [OK/DISKREPANZ] |
| Parent-Referenzen | [OK/DISKREPANZ] |
| Zaehler-Statistiken | [OK/DISKREPANZ] |
| Feldnamen-Konsistenz | [OK/DISKREPANZ] |

## Erzeugte Artefakte

- `Update-Usecases_PLAN.md` — Detaillierter Aktualisierungsplan
- `Documentation-Review-Report.md` — Strukturelle Konsistenzpruefung
- `Code-Inventory.md` — Feature-Inventar des aktuellen Codes
- `UC-Content-Analysis.md` — Inhaltsanalyse aller UC-Dateien

## Naechste Schritte

1. Plan reviewen: `${OUTPUT_DIR}/Update-Usecases_PLAN.md`
2. Aenderungen ausfuehren: `/uc:update-history-based-on-code --execute`
3. Konsistenz pruefen: `/uc:audit-milestone`
```

## Phase 6: Execute Updates (if --execute)

**Only if `--execute` flag is set:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► EXECUTING UC UPDATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Apply changes from the plan in priority order:

1. **Phase 1 (Hoch):** Batch-replace test data, fix phase references, add missing includes, fix parent assignments
2. **Phase 2 (Mittel):** Update UI mockups, scenarios, code references per file
3. **Phase 3 (Niedrig):** Fix structural inconsistencies, update file paths, standardize field names

After each phase:
- Run consistency check (index.md vs files)
- Verify no broken cross-references
- Update `Documentation-Review-Report.md`

After all phases:
- Update version/date in modified UC files
- Update index.md traceability matrix if needed
- Generate final summary

## Phase 7: Present Results

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UC ► ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Milestone: v${MILESTONE_VERSION}
Branch: [current branch]

## Ergebnis

UC-Dateien geprueft: [N]
Diskrepanzen gefunden: [N]

  Hohe Prioritaet:    [N] Dateien
  Mittlere Prioritaet: [N] Dateien
  Niedrige Prioritaet: [N] Dateien
  Keine Aenderung:     [N] Dateien

## Erzeugte Dokumente

  ${OUTPUT_DIR}/Update-Usecases_PLAN.md
  ${OUTPUT_DIR}/Update-Usecases_SUMMARY.md
  ${OUTPUT_DIR}/Documentation-Review-Report.md
  ${OUTPUT_DIR}/Code-Inventory.md
  ${OUTPUT_DIR}/UC-Content-Analysis.md

───────────────────────────────────────────────────────

## Naechste Schritte

1. Plan reviewen:
   cat ${OUTPUT_DIR}/Update-Usecases_PLAN.md

2. Aenderungen ausfuehren:
   /uc:update-history-based-on-code --execute

3. Nach Ausfuehrung validieren:
   /uc:audit-milestone
```

</process>

<discrepancy_detection_rules>

**Canonical data sources (Single Point of Truth):**

| Datentyp | Kanonische Quelle |
|----------|-------------------|
| Demo-/Testdaten | `src/server/data/demo-data.json`, `seed.ts`, `seed-demo.ts` |
| Szenario-Schritte | `src/features/demo-simulation/data/scenario-steps.json` |
| CCPM-Formeln | `src/lib/ccpm/project-metrics.ts`, `zone-helpers.ts`, `buffer-calculations.ts` |
| UI-Komponenten | `src/features/team-planner/*/components/*.tsx` |
| API-Endpoints | `src/server/routes/*.ts` |
| Stores/State | `src/stores/*.ts` |
| Routing | `src/routes/team-planner/**/*.tsx` |
| DB-Schema | `src/server/db/schema.ts` |
| Phase-Zuordnung | `.planning/ROADMAP.md` |
| UC-Hierarchie | `.planning/use-cases/index.md` |

**Common discrepancy patterns to detect:**

1. **Old test data**: References to projects/teams/objectives that don't exist in demo-data.json
2. **Wrong phase labels**: Phase names/numbers that don't match ROADMAP.md
3. **Missing v2.0 features**: UCs that don't mention Timewarp, centralized CCPM, or other v2.0 additions
4. **Outdated rendering tech**: References to libraries (e.g., Recharts) that were replaced (e.g., by SVG)
5. **Wrong file paths**: `src/apps/` instead of `src/features/`, or other renamed paths
6. **Missing UI elements**: Dialogs, charts, filters, banners that exist in code but not in UCs
7. **Wrong parent labels**: Parent UC name in file doesn't match actual parent UC title
8. **Outdated formulas**: Constants, interfaces, or calculations that changed during implementation
9. **Missing cross-references**: UCs that should reference each other but don't
10. **Pre-implementation language**: Phrases like "wird implementiert", "geplant", "TODO" in implemented UCs

</discrepancy_detection_rules>

<success_criteria>

- [ ] Milestone version determined (from config, STATE.md, or git tag)
- [ ] Output directory created: `.planning/updates/v{VERSION}/`
- [ ] **UC Documentation Analyzer** completed — all UC files read and analyzed
- [ ] **Codebase Feature Inventory** completed — all features, stores, routes documented
- [ ] **Structural consistency check** passed — IDs, statuses, parents verified
- [ ] **Content discrepancies detected** — per-file comparison against code
- [ ] Discrepancies categorized (A-H) and prioritized (Hoch/Mittel/Niedrig)
- [ ] `Update-Usecases_PLAN.md` created with per-file change descriptions
- [ ] `Update-Usecases_SUMMARY.md` created with metrics and overview
- [ ] `Documentation-Review-Report.md` created with structural check results
- [ ] `Code-Inventory.md` created with feature inventory
- [ ] `UC-Content-Analysis.md` created with per-file content extraction
- [ ] If `--execute`: All high-priority changes applied
- [ ] If `--execute`: Consistency check passes after changes
- [ ] Clear next steps communicated to user

**Quality gates:**
- Every discrepancy must reference both the UC file location AND the code source
- Every recommended change must have a before/after description
- Summary metrics must match detailed file counts
- No false positives: only flag genuine code-vs-documentation mismatches

</success_criteria>

<related_commands>

- `/uc:audit-milestone` — Check milestone readiness (structural audit)
- `/uc:complete-milestone` — Mark milestone as complete
- `/uc:map-codebase` — Create codebase feature map
- `/uc:progress` — View UC completion status
- `/uc:verify-phase N` — Verify phase scenarios with browser tests

</related_commands>
