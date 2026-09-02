#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteDir = path.resolve(__dirname, "..");
const sectorsPath = path.join(websiteDir, "src/pages/Sectors.tsx");
const sectorsSource = fs.readFileSync(sectorsPath, "utf8");

const sectorIds = [
  "beef-dairy",
  "sheep-goat",
  "arable",
  "viticulture",
  "mixed",
  "contracting",
];

let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    return;
  }

  console.error(`  ✗ ${label}`);
  failed += 1;
}

console.log("\nSector leaflet assets:");
for (const id of sectorIds) {
  const htmlUrl = `/leaflets/${id}-v7.html`;
  const pdfUrl = `/leaflets/${id}-v7.pdf`;
  const htmlPath = path.join(websiteDir, "public", htmlUrl);
  const pdfPath = path.join(websiteDir, "public", pdfUrl);

  assert(`${id} preview uses the current v7 HTML`, sectorsSource.includes(`leaflet: "${htmlUrl}"`));
  assert(`${id} download uses the current v7 PDF`, sectorsSource.includes(`leafletPdf: "${pdfUrl}"`));
  assert(`${id} v7 HTML exists`, fs.existsSync(htmlPath));
  assert(`${id} v7 PDF exists`, fs.existsSync(pdfPath));
}

console.log("\nPDF-labelled download actions:");
const pdfDownloadActions = [
  ...sectorsSource.matchAll(
    /<a\s+href=\{([^}]+)\}\s+download[\s\S]*?Download leaflet \(PDF\)[\s\S]*?<\/a>/g,
  ),
].map((match) => match[1]);

assert("both visible PDF download actions are covered", pdfDownloadActions.length === 2);
assert(
  "sector hero downloads the selected sector PDF",
  pdfDownloadActions.includes("sector.leafletPdf"),
);
assert(
  "lightbox downloads the selected sector PDF",
  pdfDownloadActions.includes("lightboxSector.leafletPdf"),
);
assert(
  "no PDF-labelled download action points at an HTML leaflet",
  pdfDownloadActions.every((href) => href.endsWith(".leafletPdf")),
);

if (failed > 0) {
  console.error(`\n${failed} sector leaflet download check(s) failed.`);
  process.exit(1);
}

console.log("\n✓ All sector leaflet download checks passed.");