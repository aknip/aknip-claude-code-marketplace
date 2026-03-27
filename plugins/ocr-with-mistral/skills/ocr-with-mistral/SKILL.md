---
name: ocr-with-mistral
description: Extract markdown-formatted text from scanned PDFs using Mistral OCR.
allowed-tools: Bash(python *), Bash(*/bin/python *), Bash(source *), Bash(python3 *), Bash(uv *), Bash(pip *), Bash(ls *), Bash(cat *), Bash(head *), Bash(tail *), Read, Write, Grep, Glob
---

You extract markdown-formatted text from scanned PDFs using Mistral OCR.

## Setup (one-time)

The OCR script requires a Python virtual environment with `mistralai`. The venv is always created in the script's directory so it stays with the plugin regardless of the current working directory.

Before first use, ensure the venv exists:

```bash
SCRIPT_DIR="${CLAUDE_PLUGIN_ROOT}/skills/ocr-with-mistral/scripts"
python3 -m venv "${SCRIPT_DIR}/.venv"
source "${SCRIPT_DIR}/.venv/bin/activate"
pip install mistralai
```

Or with uv:
```bash
SCRIPT_DIR="${CLAUDE_PLUGIN_ROOT}/skills/ocr-with-mistral/scripts"
uv venv "${SCRIPT_DIR}/.venv"
source "${SCRIPT_DIR}/.venv/bin/activate"
uv pip install mistralai
```

If the user has not set up the venv yet, guide them through the setup.

## Prerequisite: MISTRAL_API_KEY

Before doing anything else, check if the environment variable `MISTRAL_API_KEY` is set:

```bash
echo "${MISTRAL_API_KEY:?not set}" > /dev/null
```

If it is NOT set, **stop immediately** and inform the user:

> The environment variable `MISTRAL_API_KEY` is not set.
> Set it permanently by adding this line to your `~/.zshrc` (or `~/.bashrc`):
>
> ```bash
> export MISTRAL_API_KEY=<your-key>
> ```
>
> Then restart your terminal or run `source ~/.zshrc`.

Do NOT proceed with any OCR processing until the key is confirmed available.

## Output file naming convention
Derive output filenames from the input filename (without extension):
- OCR output: `<input_filename_without_ext> - OCR.md`

Example: If the input file is `Electronic Sound - Issue 134 2026.pdf`, then:
- OCR output → `Electronic Sound - Issue 134 2026 - OCR.md`

## How to use

Run the OCR script inside the virtual environment:

```bash
SCRIPT_DIR="${CLAUDE_PLUGIN_ROOT}/skills/ocr-with-mistral/scripts"
source "${SCRIPT_DIR}/.venv/bin/activate" && python "${SCRIPT_DIR}/mistral_ocr.py" "<PDF_PATH>" -o "<OUTPUT_PATH>"
```

Do not split the PDF before using the script. The script processes the entire PDF at once.

The output is a markdown file containing the extracted text from all pages.

## Important: iCloud paths

When users provide iCloud Drive paths, the shell representation uses tildes instead of dots:
- User provides: `comappleCloudDocs`
- Correct shell path: `com~apple~CloudDocs`

Always replace `comappleCloudDocs` with `com~apple~CloudDocs` in file paths.
