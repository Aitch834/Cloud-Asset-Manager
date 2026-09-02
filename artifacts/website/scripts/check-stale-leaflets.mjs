/**
 * Warns if any current sector leaflet PDF is missing or older than its HTML source.
 * Run during dev startup to catch stale PDFs before serving them.
 *
 * The default mode is warn-only for local dev startup. Pass --strict to make
 * the check fail, which is useful in CI or before publishing.
 */

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

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

const strict = process.argv.includes("--strict");
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
  if (strict) {
    process.exitCode = 1;
  }
}
