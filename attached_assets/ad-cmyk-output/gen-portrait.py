#!/usr/bin/env python3
"""
BDE Farm Trac — Portrait half-page ad → CMYK PDF
Pipeline: Chromium headless screenshot → Pillow RGB PDF → Ghostscript CMYK PDF
Spec: 90 × 267 mm, 300 DPI, CMYK, PDF 1.3
"""
import os, subprocess, sys
from pathlib import Path
from PIL import Image

CHROMIUM = (
    "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium"
    "/chromium-1080/chrome-linux/chrome"
)
GS_CANDIDATES = [
    "/nix/store/75qdpfrkxkj0c64qnjjn51cawi84xr30-ghostscript-with-X-10.05.1/bin/gs",
    "/nix/store/00vaqa30dvhxr9308xldc5hmf3z3m37v-ghostscript-10.04.0/bin/gs",
]
GS = next((g for g in GS_CANDIDATES if os.path.exists(g)), "gs")

DOMAIN = os.environ.get("REPLIT_DEV_DOMAIN")
if not DOMAIN:
    print("ERROR: REPLIT_DEV_DOMAIN env var is required")
    sys.exit(1)

URL = f"https://{DOMAIN}/__mockup/ads/ad-viticulture-portrait.html"

# 90 × 267 mm @ 300 DPI: px = mm * 300 / 25.4
W_PX  = round(90  * 300 / 25.4)   # 1063 — target ad width
H_PX  = round(267 * 300 / 25.4)   # 3154 — target ad height

# HTML canvas is 900×2670. Scale factor when width-bound = W_PX/900.
# Calculated ad height = 2670 * (W_PX / 900).
# Use an oversized window height so the JS scaler is width-bound (not height-bound).
H_WIN = 5000   # px — larger than H_PX to guarantee width-binding

OUT_DIR  = Path(__file__).parent / "output"
OUT_DIR.mkdir(exist_ok=True)

PNG_PATH = OUT_DIR / "ad-portrait-300dpi.png"
RGB_PDF  = OUT_DIR / "BDE-FarmTrac-HalfPage-Portrait-RGB.pdf"
CMYK_PDF = OUT_DIR / "BDE-FarmTrac-HalfPage-Portrait-CMYK.pdf"

# ── Step 1: Chromium headless screenshot ─────────────────────────────────────
print(f"── Step 1/3: Chromium headless screenshot ──────────────────────────")
print(f"   Target : {W_PX}×{H_PX} px  (300 DPI → 90×267 mm)")
print(f"   URL    : {URL}")

r = subprocess.run([
    CHROMIUM,
    "--headless=new",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    f"--window-size={W_PX},{H_WIN}",    # oversized height so ad is width-bound
    "--force-device-scale-factor=1",
    f"--screenshot={PNG_PATH}",
    "--virtual-time-budget=7000",        # ms — allows fonts & image to load
    "--run-all-compositor-stages-before-draw",
    URL,
], capture_output=True, text=True, timeout=60)

if r.returncode != 0:
    print("  STDERR:", r.stderr[-800:])
    sys.exit(f"Chromium failed (exit {r.returncode})")

print(f"   Raw PNG: {PNG_PATH.stat().st_size // 1024} KB")

# The ad canvas is width-bound and centred vertically in H_WIN.
# Calculated ad height when scale = W_PX/900 (width-bound):
#   ad_h = 2670 * (W_PX / 900)
# Crop the exact ad rectangle from the centre of the screenshot.
raw = Image.open(PNG_PATH)
actual_w, actual_h = raw.size
print(f"   Raw pixels: {actual_w}×{actual_h}")

ad_h_float = 2670 * (W_PX / 900)
ad_h       = round(ad_h_float)
ad_w       = W_PX                    # full width

# Centre crop — body flexbox centres the scaler both axes
offset_y = (actual_h - ad_h) // 2
offset_y = max(0, offset_y)          # guard against tiny viewports

cropped = raw.crop((0, offset_y, ad_w, offset_y + ad_h))
cropped.save(str(PNG_PATH))          # overwrite with cropped version
raw.close()

print(f"   Cropped: {cropped.width}×{cropped.height} px  "
      f"({cropped.width/300*25.4:.1f}×{cropped.height/300*25.4:.1f} mm @ 300 DPI)")
cropped.close()

# ── Step 2: PNG → RGB PDF via Pillow (embeds at 300 DPI) ─────────────────────
print(f"\n── Step 2/3: PNG → RGB PDF (Pillow @ 300 DPI) ──────────────────────")
img = Image.open(PNG_PATH)
img.save(str(RGB_PDF), resolution=300, resolution_unit="inch")
img.close()
print(f"   RGB PDF: {RGB_PDF.stat().st_size // 1024} KB")

# ── Step 3: RGB → CMYK via Ghostscript ───────────────────────────────────────
print(f"\n── Step 3/3: Ghostscript CMYK conversion ───────────────────────────")
print(f"   GS     : {GS}")
r2 = subprocess.run([
    GS,
    "-dBATCH", "-dNOPAUSE", "-dQUIET",
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.3",
    "-sProcessColorModel=DeviceCMYK",
    "-sColorConversionStrategy=CMYK",
    "-dOverrideICC=true",
    f"-sOutputFile={CMYK_PDF}",
    str(RGB_PDF),
], capture_output=True, text=True)

if r2.returncode != 0:
    print("  GS STDERR:", r2.stderr[-800:])
    sys.exit(f"Ghostscript failed (exit {r2.returncode})")

print(f"   CMYK PDF: {CMYK_PDF.stat().st_size // 1024} KB")
print(f"   → {CMYK_PDF}")
print("\n✓  Done.")
