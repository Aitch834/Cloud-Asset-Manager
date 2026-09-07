#!/usr/bin/env node

import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const generatorPath = path.join(scriptsDir, "generate-leaflet-pdfs.mjs");
const leafletsDir = path.resolve(scriptsDir, "../public/leaflets");
const leafletNames = [
  "beef-dairy-v7",
  "sheep-goat-v7",
  "arable-v7",
  "viticulture-v7",
  "mixed-v7",
  "contracting-v7",
];

function pdfContents() {
  return new Map(
    leafletNames.map((name) => {
      const pdfPath = path.join(leafletsDir, `${name}.pdf`);
      return [pdfPath, readFileSync(pdfPath)];
    }),
  );
}

function runGenerator(env) {
  return spawnSync(process.execPath, [generatorPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: "",
      ...env,
    },
  });
}

const before = pdfContents();
const tempDir = mkdtempSync(path.join(tmpdir(), "leaflet-pdf-test-"));

try {
  const missingBrowser = runGenerator({
    CHROMIUM_PATH: path.join(tempDir, "missing-configured-chromium"),
    LEAFLET_PDF_KNOWN_CHROMIUM_PATH: path.join(tempDir, "missing-known-chromium"),
    LEAFLET_SKIP_PLAYWRIGHT_BROWSER_PATH: "1",
  });

  assert.equal(missingBrowser.status, 0, missingBrowser.stderr);
  assert.match(
    missingBrowser.stderr,
    /Leaflet PDF generation skipped: Chromium was not found/,
    "missing Chromium should produce a clear warning",
  );

  const unusableBrowserPath = path.join(tempDir, "unusable-chromium");
  writeFileSync(unusableBrowserPath, "#!/bin/sh\nexit 23\n");
  chmodSync(unusableBrowserPath, 0o755);

  const unusableBrowser = runGenerator({
    CHROMIUM_PATH: unusableBrowserPath,
    LEAFLET_PDF_KNOWN_CHROMIUM_PATH: path.join(tempDir, "missing-known-chromium"),
  });

  assert.notEqual(unusableBrowser.status, 0, "an unusable discovered browser must fail generation");
  assert.match(
    `${unusableBrowser.stdout}\n${unusableBrowser.stderr}`,
    /Launching Chromium from .*unusable-chromium/,
    "failure should identify the discovered browser that could not launch",
  );

  for (const [pdfPath, contents] of before) {
    assert.deepEqual(readFileSync(pdfPath), contents, `${pdfPath} must remain unchanged`);
  }

  console.log("✓ Missing Chromium warns and exits successfully");
  console.log("✓ An unusable Chromium executable makes generation fail");
  console.log("✓ Committed leaflet PDFs remain unchanged");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}