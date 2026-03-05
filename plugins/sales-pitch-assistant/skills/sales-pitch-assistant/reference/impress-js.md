# impress.js — Referenz für Sales-Pitch-Präsentationen

## Überblick

impress.js ist ein webbasiertes Präsentations-Framework, das CSS3-Transforms und Transitions nutzt, um beeindruckende 3D-Präsentationen im Browser zu erstellen. Im Gegensatz zu klassischen Folien-Präsentationen können Elemente frei auf einer unendlichen Leinwand positioniert, rotiert und skaliert werden.

## Technischer Aufbau

### Dateistruktur im Projektordner

```
<projektname>/impress-js/
├── index_YYYY_MM_DD_HH_MM.html ← Präsentationen (versioniert mit Zeitstempel)
├── index-demo.html         ← Demo-Vorlage (nicht verändern)
├── template-classic.html   ← Vorlage: Klassischer Folienstil (nicht verändern)
├── template-prezi.html     ← Vorlage: Prezi-ähnlicher Freiform-Stil (nicht verändern)
├── impress.js              ← impress.js Framework
├── css/
│   ├── impress-common.css  ← Basis-Styles
│   └── impress-demo.css    ← Demo-Styles (als Ausgangspunkt nutzbar)
└── fonts/
    ├── fonts.css           ← Font-Definitionen
    └── *.woff2             ← Schriftarten (Open Sans, PT Sans, PT Serif)
```

### Vorlagen (Templates)

Es stehen zwei Vorlagen zur Verfügung, die als Basis für die Präsentation dienen:

| Template | Datei | Beschreibung |
|----------|-------|-------------|
| **Classic** | `template-classic.html` | Klassischer, seitenorientierter Präsentationsstil. Folien werden sequentiell nebeneinander angeordnet — ähnlich wie PowerPoint oder Keynote. Nutzt primär `data-x`/`data-y` für lineare Anordnung. |
| **Prezi** | `template-prezi.html` | Frei animierter, Prezi-ähnlicher Präsentationsstil. Nutzt die volle impress.js-Fähigkeit mit Zoom, Rotation und 3D-Effekten für eine dynamische, nicht-lineare Präsentation in kurzen, prägnanten Texten und auch Einzelwörtern.|

Bei der Erstellung der Präsentation soll der User gefragt werden, welchen Stil er bevorzugt. Die gewählte Vorlage dient dann als strukturelle Basis für `index.html`.

**Design Regeln:**

- Prezi: 
    - Es werden keine Standard Slides (mit Klasse "slide" für Rahmen) eingesetzt.
    - Nur Schlagworte, sehr kurze und prägnante Aussagen
    - So wenig Fliesstext wie möglich, vermeide Bulletpoint-Lists
    - Schriftfarben nur schwarz und orange
- Classic:
    - Es werden ausschliesslich Standard Slides (mit Klasse "slide" für Rahmen) eingesetzt.
    - Schriftfarben nur schwarz und orange


### Wichtige Regeln

- **Präsentationen werden IMMER mit Zeitstempel gespeichert**: `index_YYYY_MM_DD_HH_MM.html` — so bleibt jede Version erhalten und keine wird überschrieben
- **`template-classic.html` und `template-prezi.html` dienen als Vorlagen** — die zu erstellende Präsentation soll sich an der Struktur des gewählten Templates orientieren
- **`index-demo.html`** ist eine ältere Demo-Vorlage und bleibt als Referenz erhalten
- CSS-Styles können in `impress-demo.css` angepasst oder eine eigene CSS-Datei erstellt werden

## HTML-Grundstruktur

```html
<!doctype html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=1024" />
    <title>[Präsentationstitel]</title>
    <link href="fonts/fonts.css" rel="stylesheet" />
    <link href="css/impress-common.css" rel="stylesheet" />
    <link href="css/impress-demo.css" rel="stylesheet" />
</head>
<body class="impress-not-supported">

<div class="fallback-message">
    <p>Ihr Browser unterstützt die benötigten Features nicht.</p>
</div>

<div id="impress"
    data-transition-duration="1000"
    data-width="1024"
    data-height="768"
    data-max-scale="3"
    data-min-scale="0"
    data-perspective="1000">

    <!-- Slides/Steps hier -->

</div>

<div id="impress-toolbar"></div>

<div class="hint">
    <p>Leertaste oder Pfeiltasten zur Navigation. 'P' für Moderatoransicht.</p>
</div>

<script src="impress.js"></script>
<script>impress().init();</script>
</body>
</html>
```

## Steps/Slides erstellen

Jeder Präsentationsschritt ist ein `<div>` mit der Klasse `step` innerhalb von `#impress`:

### Positionierung (data-Attribute)

| Attribut | Beschreibung | Standard |
|----------|-------------|----------|
| `data-x` | X-Position in Pixeln | 0 |
| `data-y` | Y-Position in Pixeln | 0 |
| `data-z` | Z-Position (Tiefe) in Pixeln | 0 |
| `data-rotate` / `data-rotate-z` | Rotation um Z-Achse in Grad | 0 |
| `data-rotate-x` | Rotation um X-Achse in Grad | 0 |
| `data-rotate-y` | Rotation um Y-Achse in Grad | 0 |
| `data-scale` | Skalierungsfaktor | 1 |
| `data-autoplay` | Auto-Weiter nach N Sekunden | — |

### Beispiel-Slides

```html
<!-- Klassische Folie (mit Klasse "slide" für Rahmen) -->
<div id="intro" class="step slide" data-x="-1000" data-y="-1500">
    <h1>Willkommen</h1>
    <p>Unsere Lösung für Ihr Problem</p>
</div>

<!-- Freies Element (ohne "slide"-Klasse, kein Rahmen) -->
<div id="highlight" class="step" data-x="0" data-y="0" data-scale="4">
    <h1>Der entscheidende Punkt</h1>
</div>

<!-- 3D-Rotation -->
<div id="wow" class="step" data-x="2000" data-y="1000" data-z="-500"
     data-rotate-x="-20" data-rotate-y="10" data-scale="2">
    <p>Beeindruckender 3D-Effekt</p>
</div>

<!-- Übersichts-Slide (zeigt alles auf einmal) -->
<div id="overview" class="step" data-x="1000" data-y="500" data-z="0" data-scale="10">
</div>
```

## CSS-Klassen (automatisch von impress.js gesetzt)

| Klasse | Bedeutung |
|--------|-----------|
| `future` | Step wurde noch nicht besucht |
| `present` | Aktuell aktiver Step |
| `past` | Step wurde bereits besucht |
| `active` | Aktuell sichtbarer Step |

Diese Klassen können für CSS-Animationen genutzt werden (z.B. Elemente einblenden wenn `present`).

## Best Practices für Sales-Pitch-Präsentationen

1. **Weniger ist mehr**: Pro Step nur 1 Kernaussage
2. **Visuelle Hierarchie**: Wichtige Punkte mit `data-scale` vergrößern
3. **Logischer Fluss**: Steps so positionieren, dass die Kamerabewegung die Story unterstützt
4. **Übersichts-Slide**: Am Ende einen Overview-Step mit großem `data-scale` für den Gesamtüberblick
5. **Klasse `slide`**: Für strukturierte Folien mit Rahmen; weglassen für freie, dramatische Elemente
6. **Sprache**: `lang="de"` im `<html>`-Tag für deutsche Präsentationen
7. **3D sparsam einsetzen**: Rotation und Z-Achse nur für besondere Highlights

## Navigation

- **Leertaste / Pfeil rechts / Pfeil unten**: Nächster Step
- **Pfeil links / Pfeil oben**: Vorheriger Step
- **P**: Speaker Console (Moderatoransicht)
- **Touch**: Wischen links/rechts
