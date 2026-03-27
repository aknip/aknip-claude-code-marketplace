---
name: summarizer
description: You are analyzing a text file to determine its content and create a summary.
allowed-tools: Bash(python *), Bash(*/bin/python *), Bash(source *), Bash(python3 *), Bash(uv *), Bash(pip *), Bash(ls *), Bash(cat *), Bash(head *), Bash(tail *), Read, Write, Grep, Glob
---

You are analyzing a text file to determine its content.

Create a summary of the file's content, using the appropriate summary strategy.

Input is always text (plain text, markdown, or a PDF with embedded/extractable text).

## Summary strategies

Strategies are defined in the `summarizer-strategies/` subdirectory (relative to this skill file). Each strategy file contains the output template, rules, and instructions for a specific type of summary.

Available strategies:
- **long-content-papers-summary** — For books, long blog posts, academic papers, research documents, reports. Default strategy.
- **structured-paper** — For transcripts, meeting notes, lectures, interviews. Transforms unstructured source material into a well-readable, structured factual paper (~10 pages). Retains all details, minimal shortening.

### How to select a strategy

1. If the user requests all summaries/strategies (e.g. "alle Zusammenfassungen", "alle Strategien", "alle Summaries", "all strategies"), apply **every** available strategy and produce one output file per strategy.
2. If the user specifies a strategy by name (or a similar name), use that strategy.
3. Otherwise, select the best-fitting strategy based on the input document type.
4. If unsure, use **structured-paper** as the default.

After selecting a strategy, inform the user about the selected strategy/strategies.

### How to apply a strategy

Read the selected strategy file from `summarizer-strategies/` and follow its template, rules, and instructions exactly.

## Output language

Default output language is German, unless the user explicitly requests a different language.

## PDF Text Extraction (for PDFs with embedded text)
Extract text directly via PyMuPDF:
```bash
python3 -c "import fitz; doc=fitz.open('<PDF_PATH>'); [print(doc[i].get_text()) for i in range(<PAGE_RANGE>)]" 2>&1 | head -n <LIMIT>
```

## Important: iCloud paths

When users provide iCloud Drive paths, the shell representation uses tildes instead of dots:
- User provides: `comappleCloudDocs`
- Correct shell path: `com~apple~CloudDocs`

Always replace `comappleCloudDocs` with `com~apple~CloudDocs` in file paths.
