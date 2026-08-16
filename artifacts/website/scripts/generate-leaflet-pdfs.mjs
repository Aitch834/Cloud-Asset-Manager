/**
 * Generates PDF versions of the sector leaflet HTML files using Playwright.
 * Run with: node artifacts/website/scripts/generate-leaflet-pdfs.mjs
 *
 * Output: artifacts/website/public/leaflets/<name>-v5.pdf
 */

import pkg from "/home/runner/workspace/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.js";
const { chromium } = pkg;
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const leafletsDir = path.resolve(__dirname, "../public/leaflets");

const LEAFLETS = [
  "beef-dairy-v5",
  "sheep-goat-v5",
  "arable-v5",
  "viticulture-v5",
  "mixed-v5",
  "contracting-v5",
];

const CHROMIUM_PATH =
  "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome";

async function main() {
  console.log("Launching Chromium...");
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const name of LEAFLETS) {
      const htmlPath = path.join(leafletsDir, `${name}.html`);
      const pdfPath = path.join(leafletsDir, `${name}.pdf`);

      if (!fs.existsSync(htmlPath)) {
        console.warn(`  SKIP: ${htmlPath} not found`);
        continue;
      }

      console.log(`  Rendering ${name}.html → ${name}.pdf`);
      const page = await browser.newPage();

      // Load local file
      await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

      // A5 @ 96dpi: 148mm × 210mm
      await page.pdf({
        path: pdfPath,
        width: "148mm",
        height: "210mm",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await page.close();
      const size = fs.statSync(pdfPath).size;
      console.log(`  ✓ ${name}.pdf (${(size / 1024).toFixed(0)} KB)`);
    }
  } finally {
    await browser.close();
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
