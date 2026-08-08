#!/usr/bin/env python3
"""
Convert HTML ads to press-ready CMYK PDFs.
Pipeline: HTML → WeasyPrint (RGB PDF) → Ghostscript (CMYK PDF 1.3)
"""
import re, subprocess, sys, os
from pathlib import Path

JOBS = [
    {
        "src":      "ad-viticulture-halfpage.html",
        "w_mm":     190,
        "h_mm":     133,
        "canvas_w": 1900,
        "canvas_h": 1330,
        "out":      "BDE-FarmTrac-HalfPage-Horizontal-CMYK",
    },
    {
        "src":      "ad-viticulture-portrait.html",
        "w_mm":     90,
        "h_mm":     267,
        "canvas_w": 900,
        "canvas_h": 2670,
        "out":      "BDE-FarmTrac-HalfPage-Vertical-CMYK",
    },
]

# Ghostscript — prefer the newer version found in nix store
GS_CANDIDATES = [
    "/nix/store/75qdpfrkxkj0c64qnjjn51cawi84xr30-ghostscript-with-X-10.05.1/bin/gs",
    "/nix/store/00vaqa30dvhxr9308xldc5hmf3z3m37v-ghostscript-10.04.0/bin/gs",
]
GS = next((g for g in GS_CANDIDATES if os.path.exists(g)), "gs")


def patch_html(src_path: Path, w_mm: float, h_mm: float,
               canvas_w: int, canvas_h: int) -> str:
    html = src_path.read_text(encoding="utf-8")

    # CSS px per physical mm at 96 dpi: 96 / 25.4 ≈ 3.7795
    # Our design uses 10 px per mm, so the scale factor is:
    scale = (96 / 25.4) / 10          # ≈ 0.37795
    page_w_px = w_mm  * 96 / 25.4
    page_h_px = h_mm  * 96 / 25.4

    page_css = f"""
/* ── WeasyPrint print overrides ── */
@page {{
  size: {w_mm}mm {h_mm}mm;
  margin: 0;
}}
html, body {{
  width:  {page_w_px:.4f}px !important;
  height: {page_h_px:.4f}px !important;
  min-width: 0 !important; max-width: none !important;
  min-height: 0 !important; max-height: none !important;
  overflow: hidden !important;
  display: block !important;
  background: transparent !important;
  margin: 0 !important; padding: 0 !important;
}}
.ad-scaler {{
  width:  {page_w_px:.4f}px !important;
  height: {page_h_px:.4f}px !important;
  overflow: hidden !important;
  position: relative !important;
}}
.ad-canvas {{
  width:  {canvas_w}px !important;
  height: {canvas_h}px !important;
  position: absolute !important;
  top: 0 !important; left: 0 !important;
  transform: scale({scale:.6f}) !important;
  transform-origin: top left !important;
}}
"""
    html = html.replace("</style>", page_css + "\n</style>", 1)
    # Strip JS scaling blocks — WeasyPrint has no JS engine
    html = re.sub(r"<script[\s\S]*?</script>", "", html, flags=re.IGNORECASE)
    return html


def weasyprint_pdf(html_path: Path, rgb_pdf: Path):
    cmd = [
        "python3", "-m", "weasyprint",
        "--encoding", "utf-8",
        "--optimize-images",
        str(html_path),
        str(rgb_pdf),
    ]
    print(f"  WeasyPrint → {rgb_pdf.name}")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("  STDERR:", r.stderr[-3000:])
        raise RuntimeError(f"WeasyPrint failed (exit {r.returncode})")
    if r.stderr.strip():
        # WeasyPrint prints warnings to stderr even on success
        print("  Warnings (non-fatal):", r.stderr.strip()[:800])


def ghostscript_cmyk(rgb_pdf: Path, cmyk_pdf: Path):
    """Post-process RGB PDF → CMYK PDF 1.3 via Ghostscript."""
    cmd = [
        GS,
        "-dBATCH", "-dNOPAUSE", "-dQUIET",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.3",      # PDF 1.3 as per Vineyard mag spec
        "-sProcessColorModel=DeviceCMYK",
        "-sColorConversionStrategy=CMYK",
        "-dOverrideICC=true",
        f"-sOutputFile={cmyk_pdf}",
        str(rgb_pdf),
    ]
    print(f"  Ghostscript CMYK → {cmyk_pdf.name}")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("  STDERR:", r.stderr[-2000:])
        raise RuntimeError(f"Ghostscript failed (exit {r.returncode})")


def main():
    work_dir = Path(__file__).parent
    out_dir  = work_dir / "output"
    out_dir.mkdir(exist_ok=True)

    print(f"Ghostscript: {GS}")

    for job in JOBS:
        print(f"\n── {job['out']} ({job['w_mm']}×{job['h_mm']}mm) ──")
        src = work_dir / job["src"]

        patched  = out_dir / f"_print_{job['src']}"
        rgb_pdf  = out_dir / f"{job['out']}-RGB.pdf"
        cmyk_pdf = out_dir / f"{job['out']}.pdf"

        print("  Patching HTML for WeasyPrint…")
        patched.write_text(
            patch_html(src, job["w_mm"], job["h_mm"],
                       job["canvas_w"], job["canvas_h"]),
            encoding="utf-8",
        )

        weasyprint_pdf(patched, rgb_pdf)
        print(f"  RGB PDF: {rgb_pdf.stat().st_size // 1024} KB")

        ghostscript_cmyk(rgb_pdf, cmyk_pdf)
        print(f"  CMYK PDF: {cmyk_pdf.stat().st_size // 1024} KB  ✓")

    print("\n── Output files ──")
    for f in sorted(out_dir.glob("BDE-*.pdf")):
        print(f"  {f.name}  ({f.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
