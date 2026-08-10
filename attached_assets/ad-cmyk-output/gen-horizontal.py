#!/usr/bin/env python3
"""
BDE Farm Trac — Horizontal half-page ad → CMYK PDF
Pipeline: Chromium headless screenshot → Pillow RGB PDF → Ghostscript CMYK PDF
Spec: 190 × 133 mm, 300 DPI, CMYK, PDF 1.3
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

URL = f"https://{DOMAIN}/__mockup/ads/ad-viticulture-halfpage.html"

# 190 × 133 mm @ 300 DPI: px = mm * 300 / 25.4
W_PX  = round(190 * 300 / 25.4)   # 2244 — target ad width
H_PX  = round(133 * 300 / 25.4)   # 1571 — target ad height
# Use an oversized window height so the JS scaler is width-bound (not height-bound).
# The ad canvas will render at exactly W_PX × H_PX centred in the taller viewport.
# We crop back to H_PX after screenshotting.
H_WIN = 2400   # px — larger than H_PX to guarantee width-binding

OUT_DIR  = Path(__file__).parent / "output"
OUT_DIR.mkdir(exist_ok=True)

PNG_PATH = OUT_DIR / "ad-horiz-300dpi.png"
RGB_PDF  = OUT_DIR / "BDE-FarmTrac-HalfPage-Horizontal-RGB.pdf"
CMYK_PDF = OUT_DIR / "BDE-FarmTrac-HalfPage-Horizontal-CMYK.pdf"

# ── Step 1: Chromium headless screenshot ─────────────────────────────────────
print(f"── Step 1/3: Chromium headless screenshot ──────────────────────────")
print(f"   Target : {W_PX}×{H_PX} px  (300 DPI → 190×133 mm)")
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
# Calculated ad height when scale = W_PX/1900 (width-bound):
#   ad_h = 1330 * (W_PX / 1900)
# Crop the exact ad rectangle from the centre of the screenshot.
raw = Image.open(PNG_PATH)
actual_w, actual_h = raw.size
print(f"   Raw pixels: {actual_w}×{actual_h}")

ad_h_float = 1330 * (W_PX / 1900)   # ≈ 1571
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
