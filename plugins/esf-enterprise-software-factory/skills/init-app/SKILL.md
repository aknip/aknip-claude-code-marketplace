---
description: Initialize app from zip template in resources directory
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
  - Glob
---

<objective>

Initialize or copy a new app into the ESF project directory by extracting a zip template from the `resources/` directory. Existing files will be overwritten.

</objective>

<process>

## Step 1: Locate zip templates

Search for `.zip` files in the plugin's `resources/` directory:

```bash
find "$(dirname "$(dirname "$(pwd)")")/plugins/esf-enterprise-software-factory/resources" -name "*.zip" 2>/dev/null
```

If no zip files are found, also search relative common locations:

```bash
# Try multiple possible locations for the resources directory
for dir in \
  plugins/esf-enterprise-software-factory/resources \
  ../plugins/esf-enterprise-software-factory/resources \
  ~/.claude/plugins/esf-enterprise-software-factory/resources; do
  if [ -d "$dir" ]; then
    find "$dir" -name "*.zip" -type f 2>/dev/null
  fi
done
```

If still no zip files found, inform the user and abort:

```
Keine .zip Dateien im resources-Verzeichnis gefunden.
Bitte lege eine .zip Datei in das resources/ Verzeichnis des ESF-Plugins.
```

## Step 2: Present selection

Use AskUserQuestion to let the user choose:
- header: "App Template"
- question: "Welche App-Vorlage soll entpackt werden?"
- options: List of found .zip filenames (without path)

## Step 3: Confirm target directory

Use AskUserQuestion:
- header: "Zielverzeichnis"
- question: "Die App wird in das aktuelle Verzeichnis entpackt: `{cwd}`. Existierende Dateien werden ueberschrieben. Fortfahren?"
- options:
  - "Ja, entpacken" — Proceed with extraction
  - "Abbrechen" — Cancel operation

If "Abbrechen": Stop and display cancellation message.

## Step 4: Extract zip

Extract the selected zip file into the current working directory, overwriting existing files:

```bash
unzip -o "<full_path_to_selected_zip>" -d .
```

Capture the output to identify which files were extracted.

## Step 5: Identify overwritten files

Compare extracted files against files that already existed before extraction. Display a summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ESF ► APP INITIALISIERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Template: [selected zip name]
Zielverzeichnis: [cwd]

Entpackte Dateien: [count]
Ueberschriebene Dateien: [count]

[If overwritten files exist:]
Ueberschriebene Dateien:
  - path/to/file1
  - path/to/file2
  ...

───────────────────────────────────────────────────────

Naechste Schritte:
- /esf:new-project — Neues Projekt initialisieren
- /esf:help — Alle verfuegbaren Befehle anzeigen

───────────────────────────────────────────────────────
```

</process>

<success_criteria>

- [ ] Zip files in resources/ directory found and listed
- [ ] User selected a template
- [ ] User confirmed extraction into target directory
- [ ] Zip extracted successfully, existing files overwritten
- [ ] Summary with list of overwritten files displayed

</success_criteria>
