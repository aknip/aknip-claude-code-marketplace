#!/usr/bin/env python3
"""
ColorScale - Regenbogen-Farbverlauf für PPTX-Folien

Färbt Hintergrund-Shapes ("ColorScaleBackground") in einer PPTX-Datei mit einem
Regenbogen-Verlauf von Blau (#4da8f9) bis Gelb (#f7c542) ein. Die Interpolation
erfolgt über den HSL-Farbraum (Blau → Violett → Magenta → Rot → Orange → Gelb).

Keine externen Abhängigkeiten - nur Python-Standardbibliothek.

Vorbereitung der PPTX-Datei:
  - Folien, die eingefärbt werden sollen, müssen ein Rechteck mit dem
    Shape-Namen "ColorScaleBackground" enthalten.
  - Shape-Name in PowerPoint vergeben: Rechteck auswählen > Start >
    Markierung > Auswahlbereich > Namen doppelklicken.
  - Das Rechteck sollte die gesamte Folie abdecken und im Auswahlbereich
    ganz unten liegen (= hinterster Layer).

Aufruf:
  Interaktiver Modus (ohne Argumente):
    python colorscale.py

  CLI-Modus (mit Argumenten, keine interaktive Abfrage):
    python colorscale.py <datei>                     Modus 1 (volles Spektrum)
    python colorscale.py <datei> -m 2                Modus 2 (feste Schritte, max=20)
    python colorscale.py <datei> -m 2 --max 15       Modus 2 (feste Schritte, max=15)

CLI-Parameter:
  datei          Pfad zur PPTX-Datei (positional, optional für interaktiven Modus)
  -m, --modus    Farbmodus (1 oder 2, Default: 1)
                   1 = Volles Spektrum: Start- bis Endfarbe gleichmäßig auf alle
                       gefundenen Folien verteilt
                   2 = Feste Schritte: Schrittweite basierend auf max. Folienanzahl,
                       unabhängig von der tatsächlichen Anzahl der Folien
  --max          Max. Folienanzahl für Schrittberechnung in Modus 2 (Default: 20)
  -h, --help     Hilfe anzeigen

Ausgabe:
  Erstellt eine Kopie der Eingabedatei mit Suffix "-colorscale", z.B.
  "Präsentation.pptx" → "Präsentation-colorscale.pptx"
"""

import argparse
import shutil
import zipfile
import re
import os
import sys
import tempfile

START_COLOR = (0x4d, 0xa8, 0xf9)  # #4da8f9
END_COLOR   = (0xf7, 0xc5, 0x42)  # #f7c542

MAX_SLIDES = 20  # Maximale Folienanzahl für feste Schritte (Default)

SHAPE_NAME = "ColorScaleBackground"


def rgb_to_hsl(r, g, b):
    """RGB (0-255) zu HSL (h: 0-360, s: 0-1, l: 0-1)."""
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    cmax, cmin = max(r, g, b), min(r, g, b)
    delta = cmax - cmin
    l = (cmax + cmin) / 2.0
    if delta == 0:
        h = s = 0.0
    else:
        s = delta / (1 - abs(2 * l - 1))
        if cmax == r:
            h = 60 * (((g - b) / delta) % 6)
        elif cmax == g:
            h = 60 * ((b - r) / delta + 2)
        else:
            h = 60 * ((r - g) / delta + 4)
    return h, s, l


def hsl_to_rgb(h, s, l):
    """HSL (h: 0-360, s: 0-1, l: 0-1) zu RGB (0-255)."""
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if h < 60:
        r1, g1, b1 = c, x, 0
    elif h < 120:
        r1, g1, b1 = x, c, 0
    elif h < 180:
        r1, g1, b1 = 0, c, x
    elif h < 240:
        r1, g1, b1 = 0, x, c
    elif h < 300:
        r1, g1, b1 = x, 0, c
    else:
        r1, g1, b1 = c, 0, x
    return (
        int((r1 + m) * 255 + 0.5),
        int((g1 + m) * 255 + 0.5),
        int((b1 + m) * 255 + 0.5),
    )


def interpolate_color(start, end, t):
    """HSL-Interpolation über den Regenbogen (Blau→Violett→Magenta→Rot→Orange→Gelb).
    Sättigung und Helligkeit werden auf kräftige Werte fixiert (S=1.0, L=0.51)."""
    h1, _, _ = rgb_to_hsl(*start)
    h2, _, _ = rgb_to_hsl(*end)
    # Blau (~213°) → aufwärts durch Violett(270°), Magenta(300°), Rot(360°) → Gelb(~44°+360°=404°)
    h2_wrapped = h2 + 360
    h = h1 + (h2_wrapped - h1) * t
    h = h % 360
    # Kräftige, gesättigte Farben wie im Original (S≈1.0, L≈0.51)
    return hsl_to_rgb(h, 1.0, 0.51)


def rgb_to_hex(rgb):
    """RGB-Tuple zu 6-stelligem Hex-String (ohne #)."""
    return f"{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}"


def find_slides_with_shape(zf):
    """Findet alle Slide-Dateien mit ColorScaleBackground, sortiert nach Foliennummer."""
    slide_pattern = re.compile(r"^ppt/slides/slide(\d+)\.xml$")
    matches = []
    for name in zf.namelist():
        m = slide_pattern.match(name)
        if m:
            content = zf.read(name).decode("utf-8")
            if f'name="{SHAPE_NAME}"' in content:
                matches.append((int(m.group(1)), name))
    matches.sort(key=lambda x: x[0])
    return matches


def replace_color_in_slide(xml_content, new_hex):
    """Ersetzt die solidFill-Farbe im ColorScaleBackground-Shape.
    Unterstützt sowohl <a:srgbClr> als auch <a:schemeClr> (Theme-Farben)."""
    # Ersetze den gesamten <a:solidFill>...</a:solidFill> Inhalt nach ColorScaleBackground
    pattern = re.compile(
        r'(name="' + re.escape(SHAPE_NAME) + r'".*?)<a:solidFill>.*?</a:solidFill>',
        re.DOTALL
    )
    replacement = rf'\1<a:solidFill><a:srgbClr val="{new_hex}"/></a:solidFill>'
    new_content, count = pattern.subn(replacement, xml_content, count=1)
    if count == 0:
        print(f"  WARNUNG: Konnte Farbe nicht ersetzen!")
    return new_content


def compute_colors(n, mode, max_slides=MAX_SLIDES):
    """Berechnet die Farben für n Folien je nach Modus.
    mode 1: Volles Spektrum auf n Folien verteilt
    mode 2: Feste Schritte (basierend auf max_slides), nur die ersten n verwendet
    """
    colors = []
    for i in range(n):
        if mode == 1:
            t = i / (n - 1) if n > 1 else 0
        else:
            t = i / (max_slides - 1) if max_slides > 1 else 0
        color = interpolate_color(START_COLOR, END_COLOR, t)
        colors.append(rgb_to_hex(color))
    return colors


def print_info():
    """Zeigt Info-Banner an."""
    print("=" * 60)
    print("ColorScale - Regenbogen-Farbverlauf für PPTX-Folien")
    print("=" * 60)
    print()
    print("Dieses Script färbt Hintergrund-Shapes in einer PPTX-Datei")
    print("mit einem Regenbogen-Verlauf von Blau (#4da8f9) bis")
    print("Gelb (#f7c542) ein.")
    print()
    print("Vorbereitung der PPTX-Datei:")
    print("  - Folien, die eingefärbt werden sollen, müssen ein")
    print('    Rechteck mit dem Namen "ColorScaleBackground" enthalten.')
    print("  - Shape-Name vergeben: Rechteck auswählen > Start >")
    print("    Markierung > Auswahlbereich > Namen doppelklicken.")
    print("  - Das Rechteck sollte die gesamte Folie abdecken und")
    print("    im Auswahlbereich ganz unten liegen (= hinterster Layer).")
    print()


def parse_args():
    """Parst CLI-Argumente. Gibt None zurück wenn keine übergeben wurden."""
    parser = argparse.ArgumentParser(
        description="Färbt ColorScaleBackground-Shapes mit Regenbogen-Verlauf ein.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Beispiele:\n"
            "  python colorscale.py                              # Interaktiver Modus\n"
            "  python colorscale.py Datei.pptx                   # Modus 1 (volles Spektrum)\n"
            "  python colorscale.py Datei.pptx -m 2              # Modus 2, Default max=20\n"
            "  python colorscale.py Datei.pptx -m 2 --max 15     # Modus 2, max=15 Folien"
        ),
    )
    parser.add_argument("datei", nargs="?", help="Pfad zur PPTX-Datei")
    parser.add_argument("-m", "--modus", type=int, choices=[1, 2], default=1,
                        help="Farbmodus: 1=Volles Spektrum, 2=Feste Schritte (Default: 1)")
    parser.add_argument("--max", type=int, default=MAX_SLIDES, dest="max_slides",
                        help=f"Max. Folienanzahl für Modus 2 (Default: {MAX_SLIDES})")
    return parser


def get_params_interactive():
    """Interaktive Abfrage aller Parameter."""
    print_info()

    source = input("PPTX-Datei: ").strip()
    if not source:
        print("Fehler: Keine Datei angegeben!")
        sys.exit(1)

    print("\nFarbmodus:")
    print("  1 = Volles Spektrum (Start→End auf alle Folien verteilt)")
    print("  2 = Feste Schritte (Schrittweite basierend auf max. Folienanzahl)")
    mode_input = input("Modus [1/2]: ").strip()
    if mode_input not in ("1", "2"):
        print("Fehler: Ungültiger Modus!")
        sys.exit(1)
    mode = int(mode_input)

    max_slides = MAX_SLIDES
    if mode == 2:
        max_input = input(f"Max. Folienanzahl [{MAX_SLIDES}]: ").strip()
        if max_input:
            try:
                max_slides = int(max_input)
                if max_slides < 2:
                    print("Fehler: Mindestens 2 Folien!")
                    sys.exit(1)
            except ValueError:
                print("Fehler: Ungültige Zahl!")
                sys.exit(1)

    return source, mode, max_slides


def main():
    parser = parse_args()
    args = parser.parse_args()

    if args.datei:
        # CLI-Modus
        source = args.datei
        mode = args.modus
        max_slides = args.max_slides
    else:
        # Interaktiver Modus
        source, mode, max_slides = get_params_interactive()

    if not os.path.exists(source):
        print(f"Fehler: {source} nicht gefunden!")
        sys.exit(1)

    if max_slides < 2:
        print("Fehler: Mindestens 2 Folien!")
        sys.exit(1)

    base, ext = os.path.splitext(source)
    output = f"{base}-colorscale{ext}"

    # 1. Kopieren
    shutil.copy2(source, output)
    print(f"\nKopiert: {source} -> {output}")

    # 2. Betroffene Folien identifizieren
    with zipfile.ZipFile(output, "r") as zf:
        slides = find_slides_with_shape(zf)

    if not slides:
        print("Keine Folien mit ColorScaleBackground gefunden!")
        sys.exit(0)

    n = len(slides)
    print(f"Gefunden: {n} Folien mit ColorScaleBackground: {[s[0] for s in slides]}")
    if mode == 2 and n > max_slides:
        print(f"WARNUNG: Mehr als {max_slides} Folien!")

    # 3. Farben berechnen
    colors = compute_colors(n, mode, max_slides)

    # 4. XML modifizieren via temporäre Datei
    modified_slides = {}
    with zipfile.ZipFile(output, "r") as zf:
        for (slide_num, slide_path), hex_color in zip(slides, colors):
            xml = zf.read(slide_path).decode("utf-8")
            xml = replace_color_in_slide(xml, hex_color)
            modified_slides[slide_path] = xml.encode("utf-8")
            print(f"  Slide {slide_num}: #{hex_color}")

        # 5. Neues ZIP schreiben
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pptx")
        os.close(tmp_fd)
        try:
            with zipfile.ZipFile(tmp_path, "w", zipfile.ZIP_DEFLATED) as zf_out:
                for item in zf.infolist():
                    if item.filename in modified_slides:
                        zf_out.writestr(item, modified_slides[item.filename])
                    else:
                        zf_out.writestr(item, zf.read(item.filename))

            shutil.move(tmp_path, output)
        except Exception:
            os.unlink(tmp_path)
            raise

    print(f"\nFertig! Ausgabe: {output}")


if __name__ == "__main__":
    main()
