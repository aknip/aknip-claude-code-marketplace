import argparse
import base64
import os
from mistralai import Mistral
from dotenv import load_dotenv


load_dotenv()


def encode_pdf(pdf_path):
    with open(pdf_path, "rb") as pdf_file:
        return base64.b64encode(pdf_file.read()).decode('utf-8')


def main():
    parser = argparse.ArgumentParser(description="Extract text from PDFs using Mistral OCR")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("-o", "--output", default="mistral_ocr_result.md", help="Output file path (default: mistral_ocr_result.md)")
    args = parser.parse_args()

    api_key = os.getenv('MISTRAL_API_KEY')
    if not api_key:
        print("Error: MISTRAL_API_KEY not found in environment. Check your .env file.")
        exit(1)

    client = Mistral(api_key=api_key)

    base64_pdf = encode_pdf(args.pdf_path)

    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": f"data:application/pdf;base64,{base64_pdf}"
        },
        table_format="markdown",
        extract_header=False,
        extract_footer=False,
        include_image_base64=True
    )

    # Concatenate all markdown from all pages
    markdown_parts = []
    for page in ocr_response.pages:
        if page.markdown:
            markdown_parts.append(page.markdown)

    # Join with double newlines between pages
    full_markdown = "\n\n".join(markdown_parts)

    # Save to file
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(full_markdown)

    print(f"Saved {len(ocr_response.pages)} pages to {args.output}")


if __name__ == "__main__":
    main()
