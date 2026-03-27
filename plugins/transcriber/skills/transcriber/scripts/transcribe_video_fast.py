#!/usr/bin/env python3
"""
Audio/Video-Transkriptionsskript mit pywhispercpp für Apple Silicon GPU-Beschleunigung.
Transkribiert .mp4-Videos und .mp3-Audiodateien in .txt-Dateien mithilfe des mittleren Whisper-Modells.
Akzeptiert sowohl ein Verzeichnis mit Mediendateien als auch eine einzelne .mp4/.mp3-Datei als Eingabe.

Optionale Flags:
  -t, --timestamps  Zeitstempel in die Transkription einfügen (z.B. [02:15] Text...)
  -v, --verbose     Ausführliche Ausgabe mit Vorschau der ersten 100 Zeichen je Transkription

Beispielaufrufe:
  python transcribe_video_fast.py /pfad/zum/ordner
  python transcribe_video_fast.py /pfad/zur/datei.mp4
  python transcribe_video_fast.py ./VIDEOTEST --timestamps
  python transcribe_video_fast.py "~/Downloads/interview.mp3" -t -v
"""

import os
import sys
import argparse
from pathlib import Path


def check_virtual_environment():
    """Prüft, ob das Skript in einer virtuellen Python-Umgebung ausgeführt wird."""
    if sys.prefix == sys.base_prefix:
        print("❌ Dieses Skript muss in einer virtuellen Python-Umgebung ausgeführt werden.")
        print()
        print("Bitte richte eine virtuelle Umgebung ein und aktiviere sie:")
        print()
        print("  python3 -m venv .venv")
        print("  source .venv/bin/activate")
        print("  pip install pywhispercpp")
        print()
        print("Oder mit uv:")
        print()
        print("  uv venv")
        print("  source .venv/bin/activate")
        print("  uv pip install pywhispercpp")
        sys.exit(1)


check_virtual_environment()

from pywhispercpp.model import Model  # Whisper-Binding für C++ mit Apple Silicon GPU-Beschleunigung

def setup_whisper_model():
    """Whisper-Modell in mittlerer Größe initialisieren (optimaler Kompromiss aus Geschwindigkeit und Genauigkeit)."""
    try:
        # Medium-Modell bietet guten Kompromiss aus Geschwindigkeit und Genauigkeit
        # 6 Threads für parallele Verarbeitung auf Apple Silicon
        model = Model('medium', n_threads=6)
        print("✅ Whisper medium model loaded successfully with GPU acceleration and auto language detection")
        return model
    except Exception as e:
        print(f"❌ Error loading Whisper model: {e}")
        print("Please ensure pywhispercpp is properly installed with: pip install pywhispercpp")
        sys.exit(1)

SUPPORTED_EXTENSIONS = {".mp4", ".mp3"}


def find_media_files(input_path):
    """Mediendateien ermitteln – akzeptiert sowohl Verzeichnisse als auch Einzeldateien (.mp4/.mp3)."""
    path = Path(input_path)
    if not path.exists():
        print(f"❌ Pfad existiert nicht: {input_path}")
        return []

    if path.is_file():
        if path.suffix.lower() in SUPPORTED_EXTENSIONS:
            print(f"📄 Einzeldatei: {path.name}")
            return [path]
        else:
            print(f"❌ Nicht unterstütztes Dateiformat: {path.suffix}")
            print(f"   Unterstützte Formate: {', '.join(SUPPORTED_EXTENSIONS)}")
            return []

    # Verzeichnis: alle unterstützten Mediendateien sammeln
    mp4_files = list(path.glob("*.mp4"))
    mp3_files = list(path.glob("*.mp3"))
    media_files = mp4_files + mp3_files

    if not media_files:
        print(f"⚠️  Keine .mp4- oder .mp3-Dateien gefunden in: {input_path}")
        return []

    print(f"📁 Gefunden: {len(mp4_files)} .mp4-Datei(en) und {len(mp3_files)} .mp3-Datei(en) in {input_path}")
    print(f"📁 Mediendateien gesamt: {len(media_files)}")
    return media_files

def transcribe_media(model, media_path, include_timestamps=False):
    """Einzelne Audio-/Videodatei mit pywhispercpp transkribieren (automatische Spracherkennung)."""
    try:
        # Passendes Emoji je nach Dateityp wählen
        file_emoji = "🎬" if media_path.suffix.lower() == ".mp4" else "🎵"
        timestamp_info = " (with timestamps)" if include_timestamps else ""
        print(f"{file_emoji} Transcribing: {media_path.name}{timestamp_info}")

        # Transkription starten – "auto" aktiviert automatische Spracherkennung
        segments = model.transcribe(
            str(media_path),
            language="auto"
        )

        # Segmente zu Fließtext zusammensetzen, optional mit Zeitstempeln
        transcription = ""
        if include_timestamps:
            for segment in segments:
                # pywhispercpp hat je nach Version unterschiedliche Attributnamen für Zeitstempel
                try:
                    # Verschiedene mögliche Attributnamen durchprobieren
                    if hasattr(segment, 't0'):
                        start_time = segment.t0
                    elif hasattr(segment, 'start_time'):
                        start_time = segment.start_time
                    elif hasattr(segment, 'start'):
                        start_time = segment.start
                    else:
                        # Kein Zeitstempel-Attribut vorhanden
                        start_time = None

                    if start_time is not None:
                        # Zeitstempel kommt in Centisekunden (1/100s) – umrechnen in Sekunden
                        start_time_seconds = start_time / 100.0

                        minutes = int(start_time_seconds // 60)
                        seconds = int(start_time_seconds % 60)

                        # Ab 60 Minuten zusätzlich Stunden anzeigen
                        if minutes >= 60:
                            hours = minutes // 60
                            minutes = minutes % 60
                            timestamp = f"[{hours:02d}:{minutes:02d}:{seconds:02d}]"
                        else:
                            timestamp = f"[{minutes:02d}:{seconds:02d}]"

                        transcription += f"{timestamp} {segment.text.strip()}\n"
                    else:
                        # Ohne Zeitstempel nur den Text übernehmen
                        transcription += f"{segment.text.strip()}\n"

                except Exception as ts_error:
                    # Bei Fehler in der Zeitstempel-Verarbeitung nur den Text anfügen
                    transcription += f"{segment.text.strip()}\n"
        else:
            for segment in segments:
                transcription += segment.text + " "

        return transcription.strip()

    except Exception as e:
        print(f"❌ Error transcribing {media_path.name}: {e}")
        # Fallback: Falls automatische Spracherkennung fehlschlägt, ohne Sprachparameter erneut versuchen
        try:
            segments = model.transcribe(str(media_path))
            transcription = ""
            if include_timestamps:
                for segment in segments:
                    try:
                        # Gleiche Zeitstempel-Logik wie oben (Fallback-Pfad)
                        if hasattr(segment, 't0'):
                            start_time = segment.t0
                        elif hasattr(segment, 'start_time'):
                            start_time = segment.start_time
                        elif hasattr(segment, 'start'):
                            start_time = segment.start
                        else:
                            start_time = None

                        if start_time is not None:
                            # Centisekunden in Sekunden umrechnen
                            start_time_seconds = start_time / 100.0

                            minutes = int(start_time_seconds // 60)
                            seconds = int(start_time_seconds % 60)

                            if minutes >= 60:
                                hours = minutes // 60
                                minutes = minutes % 60
                                timestamp = f"[{hours:02d}:{minutes:02d}:{seconds:02d}]"
                            else:
                                timestamp = f"[{minutes:02d}:{seconds:02d}]"

                            transcription += f"{timestamp} {segment.text.strip()}\n"
                        else:
                            transcription += f"{segment.text.strip()}\n"

                    except Exception as ts_error:
                        transcription += f"{segment.text.strip()}\n"
            else:
                for segment in segments:
                    transcription += segment.text + " "
            return transcription.strip()
        except Exception as e2:
            print(f"❌ Fallback also failed for {media_path.name}: {e2}")
            return None

def save_transcription(transcription, media_path):
    """Transkription als .txt-Datei speichern."""
    if not transcription:
        return False

    # Ausgabedatei: gleicher Name, aber mit .txt-Endung
    txt_path = media_path.with_suffix('.txt')

    try:
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(transcription)
        print(f"✅ Transcription saved: {txt_path.name}")
        return True
    except Exception as e:
        print(f"❌ Error saving transcription for {media_path.name}: {e}")
        return False

def main():
    """Hauptfunktion für Kommandozeilenargumente und Steuerung der Transkription."""
    parser = argparse.ArgumentParser(
        description="Transcribe .mp4 videos and .mp3 audio files to .txt files using pywhispercpp (Apple Silicon optimized)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  python transcribe_video_fast.py /pfad/zum/ordner
  python transcribe_video_fast.py /pfad/zur/datei.mp4
  python transcribe_video_fast.py ./VIDEOTEST --timestamps
  python transcribe_video_fast.py "~/Downloads/interview.mp3" -t -v
        """
    )

    parser.add_argument(
        'input_path',
        help='Pfad zu einem Verzeichnis mit .mp4/.mp3-Dateien oder zu einer einzelnen .mp4/.mp3-Datei'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )

    parser.add_argument(
        '--timestamps', '-t',
        action='store_true',
        default=False,
        help='Include timestamps in transcription output (default: False)'
    )

    args = parser.parse_args()

    # Tilde (~) im Pfad auflösen, falls vorhanden
    input_path = os.path.expanduser(args.input_path)

    print("🚀 Starting media transcription with pywhispercpp (Apple Silicon GPU optimized)")
    print(f"📂 Ziel: {input_path}")
    print("🤖 Using Whisper medium model with auto language detection")
    print("🌍 Language will be automatically detected for each file")
    print("🎵 Supports both .mp4 (video) and .mp3 (audio) files")
    if args.timestamps:
        print("⏰ Timestamps will be included in transcriptions")
    else:
        print("📄 Plain text transcriptions (no timestamps)")
    print("-" * 60)

    # Mediendateien ermitteln (Verzeichnis oder Einzeldatei)
    media_files = find_media_files(input_path)
    if not media_files:
        return

    # Whisper-Modell einmalig laden (dauert beim ersten Mal länger wegen Download)
    model = setup_whisper_model()

    # Jede Mediendatei nacheinander transkribieren
    successful_transcriptions = 0
    total_files = len(media_files)

    for i, media_path in enumerate(media_files, 1):
        file_type = "Video" if media_path.suffix.lower() == ".mp4" else "Audio"
        print(f"\n[{i}/{total_files}] Processing {file_type}: {media_path.name}")

        # Bereits vorhandene Transkriptionen überspringen
        txt_path = media_path.with_suffix('.txt')
        if txt_path.exists():
            print(f"⏭️  Transcription already exists: {txt_path.name}")
            successful_transcriptions += 1
            continue

        # Transkription durchführen und bei Erfolg speichern
        transcription = transcribe_media(model, media_path, args.timestamps)

        if transcription:
            if save_transcription(transcription, media_path):
                successful_transcriptions += 1
                if args.verbose:
                    print(f"📄 Preview: {transcription[:100]}...")

        print(f"⏱️  Progress: {i}/{total_files} files processed")

    # Abschlussbericht ausgeben
    print("\n" + "=" * 60)
    print(f"🎉 Media transcription complete!")
    print(f"✅ Successfully transcribed: {successful_transcriptions}/{total_files} files")

    if successful_transcriptions < total_files:
        failed_count = total_files - successful_transcriptions
        print(f"❌ Failed to transcribe: {failed_count} files")

    print("🍎 Optimized for Apple Silicon with GPU acceleration and auto language detection via pywhispercpp")
    print("🎵 Supports both .mp4 (video) and .mp3 (audio) file formats")

if __name__ == "__main__":
    main()
