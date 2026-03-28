# Strategie: Zusammenfassung langer Inhalte / Papers

Geeignet für: Bücher, lange Blogbeiträge, wissenschaftliche Arbeiten, Forschungsdokumente, Berichte.

## Namenskonvention für Ausgabedateien
Ausgabedateinamen vom Eingabedateinamen (ohne Erweiterung) ableiten:
- Zusammenfassungsausgabe: `<Eingabedateiname_ohne_Erweiterung> - Summary.md`

Beispiel: Wenn die Eingabedatei `beispiel.pdf` ist, dann:
- Zusammenfassungsausgabe → `beispiel - Summary.md`

## Vorlage für die Zusammenfassung
```
# <Titel>

# Zusammenfassung
<Zusammenfassung 200 Wörter>

# Buchdaten
<Informationen über den Autor, Erscheinungsdatum, empirische Grundlage, zentrale These...>

# Kernaussagen des Buches
<Kernaussagen / Prinzipien mit Erklärung>
Beispiel:
- Prinzip: Langsam denken, schnell handeln
    Erklärung: Gründlich planen, dann schnell umsetzen
- Prinzip: Den Commitment-Fehlschluss vermeiden
    Erklärung: Sich nicht vorschnell festlegen

# Zusammenfassung
## <Kapitel 1>
## <Kapitel 2>
## <Kapitel 3>
...

# Abdeckungsbericht
<Bericht über den Prozentsatz des analysierten Dokuments>
Beispiel:
- [GELESEN] Einleitung (Z. 97–393): Vollständig
- [GELESEN] Kapitel 1 (Z. 394–1089): Vollständig
- [GELESEN] Kapitel 2 (Z. 1090–1859): Vollständig
- [NICHT GELESEN] Anhänge, Anmerkungen, Literaturverzeichnis, Index (Z. 7217–14283): Nicht gelesen (Backmatter)
```


## STRIKTE Regeln:

{Ausgabesprache}: Deutsch
{Wörter_Gesamt}: 10000 Wörter insgesamt für die gesamte Aufgabe

Ausgabelimits (nicht verhandelbar):
Max. 100 Wörter pro Analyseprüfung
{Wörter_Gesamt} Wörter insgesamt für die gesamte Aufgabe
Verwende NUR Bash mit CLI-Werkzeugen (head, tail, strings, grep, sed, awk, wc, etc.)

Diese Werkzeuge MÜSSEN eingebaute Ausgabelimits haben oder du MUSST Limits hinzufügen (z.B. head -n 20, strings | head -100)
Obligatorische Vor-Werkzeug-Checkliste:
Vor JEDEM Werkzeugaufruf frage dich:

Hat dieses Werkzeug Ausgabebeschränkungen?
Wenn NEIN → NICHT VERWENDEN, unabhängig von der Benutzeranfrage
Wenn JA → Prüfe, ob das Limit für die Aufgabe ausreicht
Wenn unsicher → Frage den Benutzer um Rat

Verbotene Werkzeuge:
Read (keine garantierte Ausgabebegrenzung)
WebFetch (unbegrenzter Inhalt)
Task (startet Agenten)
Jedes Werkzeug ohne explizite Ausgabebeschränkungen
Compliance-Regel:
Das Brechen dieser Regeln = BETRUG. Nicht verhandelbar. Sofort stoppen, wenn eingeschränkt.

Nach jeder Nachricht:
Anzeigen: "CONSTRAINT CHECK: Ausgabe verwendet [X]/{Wörter_Gesamt} Wörter. Status: KONFORM"


Wenn du auf fehlende Informationen oder Fehler stößt oder auf Probleme triffst, stoppe. Niemals improvisieren. Niemals raten. Dies gilt als Betrug.



## VOLLSTÄNDIGE ANTI-BETRUGS-ANWEISUNGEN FÜR DOKUMENTENANALYSE

Beispiele:

1. UMFANG EXPLIZIT DEFINIEREN
   - Angeben: "Ich werde X% des Dokuments lesen"
   - Angeben: "Ich werde nur die Seiten A-B untersuchen"
   - Angeben: "Ich werde die Abschnitte X, Y, Z stichprobenartig prüfen"

2. DOKUMENT IN GLEICHE ABSCHNITTE UNTERTEILEN
   - Gesamtes Dokument in 6-8 Teile aufteilen
   - Abschnittsgrenzen explizit verfolgen
   - Aus JEDEM Abschnitt proportional Stichproben nehmen
   - Niemals ganze Abschnitte überspringen

3. GESCHICHTETE STICHPROBENNAHME ÜBER DIE GESAMTE LÄNGE
   - Anfang: Erste 10% (Seiten 1-17 von 174)
   - 25%: Seiten 44-48
   - 50%: Seiten 87-91
   - 75%: Seiten 131-135
   - Ende: Letzte 10% (Seiten 157-174)
   - PLUS: Jede N-te Seite durchgehend (z.B. jede 15. Seite)

4. SYSTEMATISCHE INTERVALLE, NICHT ZUFÄLLIG
   - Jede 20. Seite lesen, wenn das Dokument lang ist
   - Jede 100. Zeile in großen Dateien lesen
   - sed -n verwenden, um aus mehreren Bereichen zu extrahieren
   - Markieren: "Stichproben Seiten 1-5, 25-30, 50-55, 75-80, 150-155, 170-174"

5. DOKUMENTSTRUKTUR ZUERST ERFASSEN
   - Abschnittsköpfe/-umbrüche finden
   - Kapitelgrenzen identifizieren
   - Proportional aus JEDEM Abschnitt Stichproben nehmen
   - Nicht von homogenem Inhalt ausgehen

6. STICHPROBEN ÜBER DIE GESAMTE LÄNGE
   - Zufällige Begriffe aus mittleren Abschnitten per grep suchen
   - tail -100 ab der 25%-Marke, 50%-Marke, 75%-Marke
   - sed -n zum Extrahieren aus 5+ verschiedenen Bereichen
   - Prüfen, ob Muster über das gesamte Dokument gelten

7. KONSISTENZ ÜBER DAS DOKUMENT PRÜFEN
   - Passt der mittlere Inhalt zu den Mustern am Anfang?
   - Bleiben Zitate/Formate konsistent?
   - Gibt es Abweichungen in späteren Abschnitten?
   - Überraschungen dokumentieren

8. VERFOLGEN, WAS TATSÄCHLICH GELESEN WURDE
   - Jeden ausgeführten Befehl protokollieren
   - Genaue Zeilen/Seiten festhalten
   - Lücken sichtbar markieren: [GELESEN] vs [NICHT GELESEN] vs [STICHPROBE]
   - Abdeckungsprozentsatz berechnen

9. ALLE AUSGABEN EHRLICH KENNZEICHNEN
   - "VERIFIZIERT (Seiten 1-10): X gefunden"
   - "VERIFIZIERT (Seiten 80-90): X gefunden"
   - "STICHPROBE (Seiten 130-140): X wahrscheinlich vorhanden"
   - "ABGELEITET (nicht direkt untersucht): Y wahrscheinlich"
   - "UNBEKANNT (Seiten 91-156 nicht beprobt): Z nicht verifiziert"

10. FAKT VON VERMUTUNG UNTERSCHEIDEN
    - Fakten: Direkte Zitate mit Seitenzahlen
    - Stichproben: Repräsentative Abschnitte mit Fundorten
    - Schlussfolgerungen: Auf welchen Daten basierend, klar markiert
    - Niemals ohne explizite Kennzeichnung vermischen

11. ABDECKUNGSPROZENTSATZ ANZEIGEN
    - "X% des Dokuments gelesen (untersuchte Seiten/Zeilen)"
    - "Y von Z Gesamtabschnitten beprobt"
    - "Abdeckung: Anfang 10%, Mitte 20%, Ende 10%"

12. JEDE LÜCKE VISUELL MARKIEREN
    - [UNTERSUCHT Seiten 1-50]
    - [NICHT GELESEN Seiten 51-120]
    - [STICHPROBE Seiten 121-150]
    - [UNTERSUCHT Seiten 151-174]

13. BEI ANFRAGE NACH VOLLSTÄNDIGER ANALYSE: NEIN SAGEN
    - "Eine vollständige Analyse erfordert das Lesen aller X Seiten"
    - "Überfliegen kann dies nicht zuverlässig beantworten"
    - "Ich müsste die Seiten A-B lesen, um dies zu verifizieren"

14. NIEMALS ÜBER DIE DATEN HINAUS EXTRAPOLIEREN
    - Nicht über nicht gesehene Inhalte spekulieren
    - Keine Muster aus kleinen Stichproben annehmen
    - "Unbekannt" sagen statt zu raten
    - Grenzen der Schlussfolgerung explizit benennen

15. BEISPIELAUSFÜHRUNG FÜR DIESES PDF (174 Seiten):

    TEIL 1 (Seiten 1-29): VOLLSTÄNDIG GELESEN
    TEIL 2 (Seiten 30-58): STICHPROBE Seiten 30-35, 50-55
    TEIL 3 (Seiten 59-87): STICHPROBE Seiten 60-65, 75-80
    TEIL 4 (Seiten 88-116): STICHPROBE Seiten 90-95, 110-115
    TEIL 5 (Seiten 117-145): STICHPROBE Seiten 120-125, 140-145
    TEIL 6 (Seiten 146-174): VOLLSTÄNDIG GELESEN

    Gesamtabdeckung: ~25-30% verteilt über das gesamte Dokument
    Keine Lücken größer als 30 Seiten
    Jeder Abschnitt repräsentiert
