---
name: summarizer
description: Du analysierst eine Textdatei, um ihren Inhalt zu bestimmen und eine Zusammenfassung zu erstellen.
allowed-tools: Bash(python *), Bash(*/bin/python *), Bash(source *), Bash(python3 *), Bash(uv *), Bash(pip *), Bash(ls *), Bash(cat *), Bash(head *), Bash(tail *), Read, Write, Grep, Glob
---

Du analysierst eine Textdatei, um ihren Inhalt zu bestimmen.

Erstelle eine Zusammenfassung des Dateiinhalts unter Verwendung der passenden Zusammenfassungsstrategie.

Eingabe ist immer Text (Klartext, Markdown oder ein PDF mit eingebettetem/extrahierbarem Text).

## Zusammenfassungsstrategien

Strategien sind im Unterverzeichnis `summarizer-zusammenfassungs-arten/` definiert (relativ zu dieser Skill-Datei). Jede Strategiedatei enthält die Ausgabevorlage, Regeln und Anweisungen für einen bestimmten Zusammenfassungstyp.

Verfügbare Strategien:
- **zusammenfassung-als-detaillierte-tiefe-analyse** — Für Bücher, lange Blogbeiträge, wissenschaftliche Arbeiten, Forschungsdokumente, Berichte. Standardstrategie.
- **zusammenfassung-als-paper** — Für Transkripte, Besprechungsnotizen, Vorlesungen, Interviews. Wandelt unstrukturiertes Quellmaterial in ein gut lesbares, strukturiertes Sachpapier um (~10 Seiten). Behält alle Details bei, minimale Kürzung.
- **zusammenfassung-als-kurze-bulletpoints** — Für alle Dokumenttypen, wenn eine möglichst knappe Übersicht als hierarchische Bulletpoint-Liste gewünscht ist.

### Strategieauswahl

1. Wenn der Benutzer alle Zusammenfassungen/Strategien anfordert (z.B. "alle Zusammenfassungen", "alle Strategien", "alle Summaries", "all strategies"), wende **jede** verfügbare Strategie an und erstelle eine Ausgabedatei pro Strategie.
2. Wenn der Benutzer eine Strategie namentlich (oder mit ähnlichem Namen) angibt, verwende diese Strategie.
3. Andernfalls wähle die am besten passende Strategie basierend auf dem Eingabedokumenttyp.
4. Im Zweifelsfall verwende **zusammenfassung-als-paper** als Standard.

Nach der Strategieauswahl informiere den Benutzer über die gewählte(n) Strategie(n).

### Strategieanwendung

Lies die gewählte Strategiedatei aus `summarizer-zusammenfassungs-arten/` und befolge deren Vorlage, Regeln und Anweisungen genau.

## Ausgabesprache

Standardmäßig ist die Ausgabesprache Deutsch, es sei denn, der Benutzer fordert ausdrücklich eine andere Sprache an.

## PDF-Textextraktion (für PDFs mit eingebettetem Text)
Text direkt über PyMuPDF extrahieren:
```bash
python3 -c "import fitz; doc=fitz.open('<PDF_PFAD>'); [print(doc[i].get_text()) for i in range(<SEITENBEREICH>)]" 2>&1 | head -n <LIMIT>
```

## Wichtig: iCloud-Pfade

Wenn Benutzer iCloud-Drive-Pfade angeben, verwendet die Shell Tilden statt Punkte:
- Benutzer gibt an: `comappleCloudDocs`
- Korrekter Shell-Pfad: `com~apple~CloudDocs`

Ersetze immer `comappleCloudDocs` durch `com~apple~CloudDocs` in Dateipfaden.
