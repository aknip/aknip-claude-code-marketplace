---
name: pptx-tools
description: Werkzeuge zur Bearbeitung und Optimierung von PowerPoint-Dateien (PPTX)
---

# PPTX Tools

Dieses Skill stellt Werkzeuge zur Bearbeitung von PowerPoint-Dateien bereit.

## Verfügbare Werkzeuge

### 1. ColorScale — Regenbogen-Farbverlauf

Färbt Hintergrund-Shapes ("ColorScaleBackground") in einer PPTX-Datei mit einem Regenbogen-Verlauf von Blau (#4da8f9) bis Gelb (#f7c542) ein. Die Interpolation erfolgt über den HSL-Farbraum.

**Vorbereitung der PPTX-Datei:**
- Folien, die eingefärbt werden sollen, müssen ein Rechteck mit dem Shape-Namen "ColorScaleBackground" enthalten.
- Shape-Name in PowerPoint vergeben: Rechteck auswählen > Start > Markierung > Auswahlbereich > Namen doppelklicken.
- Das Rechteck sollte die gesamte Folie abdecken und im Auswahlbereich ganz unten liegen (= hinterster Layer).

**Aufruf:**

```bash
# Modus 1: Volles Spektrum (Start- bis Endfarbe gleichmäßig auf alle Folien verteilt)
python skills/pptx-tools/scripts/colorscale.py <datei>

# Modus 2: Feste Schritte (Schrittweite basierend auf max. Folienanzahl)
python skills/pptx-tools/scripts/colorscale.py <datei> -m 2

# Modus 2 mit benutzerdefiniertem Maximum
python skills/pptx-tools/scripts/colorscale.py <datei> -m 2 --max 15
```

**Parameter:**
- `datei` — Pfad zur PPTX-Datei
- `-m, --modus` — Farbmodus (1 oder 2, Default: 1)
  - 1 = Volles Spektrum: Start- bis Endfarbe gleichmäßig auf alle gefundenen Folien verteilt
  - 2 = Feste Schritte: Schrittweite basierend auf max. Folienanzahl, unabhängig von der tatsächlichen Anzahl
- `--max` — Max. Folienanzahl für Schrittberechnung in Modus 2 (Default: 20)

**Ausgabe:**
Erstellt eine Kopie der Eingabedatei mit Suffix "-colorscale", z.B. "Präsentation.pptx" -> "Präsentation-colorscale.pptx"

**Keine externen Abhängigkeiten** — nur Python-Standardbibliothek.

## Workflow

1. Frage den Benutzer nach der PPTX-Datei und dem gewünschten Werkzeug.
2. Führe das entsprechende Script aus.
3. Zeige das Ergebnis an.
