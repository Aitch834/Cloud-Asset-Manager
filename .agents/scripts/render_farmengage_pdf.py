from pathlib import Path

import pymupdf


SOURCE = Path("attached_assets/ACTION_REQUIRED_Migrate_API_Integration_1788732209297.pdf")
OUTPUT_DIR = Path(".agents/outputs/farmengage-migration")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    document = pymupdf.open(SOURCE)
    for page_number, page in enumerate(document, start=1):
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
        pixmap.save(OUTPUT_DIR / f"page-{page_number}.png")
    print(f"Rendered {document.page_count} page(s) to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()