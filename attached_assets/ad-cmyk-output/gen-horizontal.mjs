#!/usr/bin/env node
/**
 * BDE Farm Trac — Horizontal half-page ad PDF generator
 * Pipeline: Playwright (HTML → 300 DPI PNG) → Pillow/img2pdf (→ RGB PDF) → Ghostscript (→ CMYK PDF)
 * Spec: 190 × 133 mm, 300 DPI, CMYK, PDF 1.3
 */

import { chromium } from "@playwright/test";
import { execSync, spawnSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROMIUM_PATH =
  "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome";
const GS =
  "/nix/store/75qdpfrkxkj0c64qnjjn51cawi84xr30-ghostscript-with-X-10.05.1/bin/gs";
const DOMAIN = process.env.REPLIT_DEV_DOMAIN || process.argv[2];
if (!DOMAIN) {
  console.error("Usage: REPLIT_DEV_DOMAIN=xxx node gen-horizontal.mjs");
  process.exit(1);
}

const URL = `https://${DOMAIN}/__mockup/ads/ad-viticulture-halfpage.html`;

const OUT_DIR = path.join(__dirname, "output");
mkdirSync(OUT_DIR, { recursive: true });

const PNG_PATH  = path.join(OUT_DIR, "ad-horiz-300dpi.png");
const RGB_PDF   = path.join(OUT_DIR, "BDE-FarmTrac-HalfPage-Horizontal-RGB.pdf");
const CMYK_PDF  = path.join(OUT_DIR, "BDE-FarmTrac-HalfPage-Horizontal-CMYK.pdf");

// 190 mm × 133 mm @ 300 DPI:  px = mm × 300 / 25.4
const W_PX = Math.round(190 * 300 / 25.4);  // 2244
const H_PX = Math.round(133 * 300 / 25.4);  // 1571

console.log(`── Step 1 of 3: Playwright screenshot ──────────────────────────`);
console.log(`   Target: ${W_PX}×${H_PX} px (300 DPI → 190×133 mm)`);
console.log(`   URL:    ${URL}`);

const browser = await chromium.launch({
  executablePath: CHROMIUM_PATH,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--font-render-hinting=none",  // sharper fonts in headless
  ],
});

const ctx  = await browser.newContext({ viewport: { width: W_PX, height: H_PX } });
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });

// Give Google Fonts + Pexels background image a moment to fully render
await page.waitForTimeout(3500);

// Confirm the canvas is scaled correctly (JS scaler should yield scale≈1.181)
const scale = await page.evaluate(() => {
  const ad = document.getElementById("ad");
  return ad ? ad.style.transform : "not found";
});
console.log(`   Canvas transform: ${scale}`);

const png = await page.screenshot({ fullPage: false });
writeFileSync(PNG_PATH, png);
await browser.close();
console.log(`   PNG saved: ${(png.length / 1024).toFixed(0)} KB → ${PNG_PATH}`);

// ── Step 2: PNG → RGB PDF ───────────────────────────────────────────────────
console.log(`\n── Step 2 of 3: PNG → RGB PDF ──────────────────────────────────`);

// Try Pillow first (cleanest physical-size embed)
const pillow = spawnSync("python3", ["-c", `
from PIL import Image
img = Image.open('${PNG_PATH}')
w, h = img.size
img.save('${RGB_PDF}', resolution=300, resolution_unit='inch')
print(f'Pillow: {w}×{h}px @ 300 DPI = {w/300*25.4:.1f}×{h/300*25.4:.1f} mm')
`], { encoding: "utf-8" });

if (pillow.status === 0) {
  console.log("  ", pillow.stdout.trim());
} else {
  // Fall back: use img2pdf (exact physical size)
  console.log("   Pillow unavailable, trying img2pdf…");
  const i2p = spawnSync("python3", ["-m", "img2pdf",
    "--pagesize", "190mmx133mm",
    "-o", RGB_PDF,
    PNG_PATH,
  ], { encoding: "utf-8" });
  if (i2p.status === 0) {
    console.log("   img2pdf: done");
  } else {
    // Final fallback: ImageMagick convert
    console.log("   img2pdf unavailable, trying ImageMagick…");
    execSync(
      `convert -units PixelsPerInch -density 300 -page 190mmx133mm "${PNG_PATH}" "${RGB_PDF}"`,
      { stdio: "inherit" },
    );
  }
}
console.log(`   RGB PDF: ${(statSync(RGB_PDF).size / 1024).toFixed(0)} KB`);

// ── Step 3: RGB PDF → CMYK PDF ─────────────────────────────────────────────
console.log(`\n── Step 3 of 3: Ghostscript CMYK conversion ────────────────────`);
execSync(
  `${GS} -dBATCH -dNOPAUSE -dQUIET` +
  ` -sDEVICE=pdfwrite -dCompatibilityLevel=1.3` +
  ` -sProcessColorModel=DeviceCMYK -sColorConversionStrategy=CMYK -dOverrideICC=true` +
  ` -sOutputFile="${CMYK_PDF}" "${RGB_PDF}"`,
);
console.log(`   CMYK PDF: ${(statSync(CMYK_PDF).size / 1024).toFixed(0)} KB → ${CMYK_PDF}`);
console.log(`\n✓  Done.`);
