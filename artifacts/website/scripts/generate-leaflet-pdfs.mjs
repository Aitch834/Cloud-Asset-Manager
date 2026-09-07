/**
 * Generates PDF versions of the sector leaflet HTML files using Playwright.
 * Run with: node artifacts/website/scripts/generate-leaflet-pdfs.mjs
 *
 * Output: artifacts/website/public/leaflets/<name>-v7.pdf
 */

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { loadLeafletBrowserRuntime } from "./leaflet-browser-runtime.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const leafletsDir = path.resolve(__dirname, "../public/leaflets");

const LEAFLETS = [
  "beef-dairy-v7",
  "sheep-goat-v7",
  "arable-v7",
  "viticulture-v7",
  "mixed-v7",
  "contracting-v7",
];

async function main() {
  const browserRuntime = await loadLeafletBrowserRuntime("PDF");
  if (!browserRuntime) return;

  console.log(`Launching Chromium from ${browserRuntime.executablePath}...`);
  const browser = await browserRuntime.chromium.launch({
    executablePath: browserRuntime.executablePath,
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
