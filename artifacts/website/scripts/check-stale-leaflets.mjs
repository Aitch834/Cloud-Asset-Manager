/**
 * Warns if any sector leaflet PDF is older than its HTML source.
 * Run during dev startup to catch stale PDFs before serving them.
 *
 * Exit code 0 always (warn-only); use generate-leaflet-pdfs.mjs to fix.
 */

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

let staleCount = 0;

for (const name of LEAFLETS) {
  const htmlPath = path.join(leafletsDir, `${name}.html`);
  const pdfPath = path.join(leafletsDir, `${name}.pdf`);

  if (!fs.existsSync(htmlPath)) {
    continue; // generate script will warn about this
  }

  if (!fs.existsSync(pdfPath)) {
    console.warn(
      `⚠️  STALE LEAFLET: ${name}.pdf is missing. Run: node artifacts/website/scripts/generate-leaflet-pdfs.mjs`
    );
    staleCount++;
    continue;
  }

  const htmlMtime = fs.statSync(htmlPath).mtimeMs;
  const pdfMtime = fs.statSync(pdfPath).mtimeMs;

  if (htmlMtime > pdfMtime) {
    console.warn(
      `⚠️  STALE LEAFLET: ${name}.html is newer than ${name}.pdf. Run: node artifacts/website/scripts/generate-leaflet-pdfs.mjs`
    );
    staleCount++;
  }
}

if (staleCount === 0) {
  console.log("✓ All leaflet PDFs are up to date.");
} else {
  console.warn(
    `\n  ${staleCount} stale leaflet PDF(s) detected. Visitors will download outdated versions until regenerated.\n`
  );
}
