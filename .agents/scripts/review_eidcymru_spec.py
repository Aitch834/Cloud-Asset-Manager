from pathlib import Path
import fitz

pdf_path = Path("attached_assets/EIDCymru_EWS_Web-service_Specification_v1.3_1787234361420.pdf")
out_dir = Path(".agents/outputs/eidcymru-spec")
out_dir.mkdir(parents=True, exist_ok=True)

doc = fitz.open(pdf_path)
text_parts = []

for page_number, page in enumerate(doc, start=1):
    text_parts.append(f"\n===== PAGE {page_number} =====\n")
    text_parts.append(page.get_text("text"))
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    pix.save(out_dir / f"page-{page_number:02d}.png")

(out_dir / "extracted.txt").write_text("".join(text_parts), encoding="utf-8")
print(f"pages={doc.page_count}")
print(f"text={out_dir / 'extracted.txt'}")
print(f"renders={out_dir}")