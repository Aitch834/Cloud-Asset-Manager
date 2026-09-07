#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const websiteDir = path.resolve(scriptsDir, "..");
const checkerPath = path.join(scriptsDir, "check-annual-pricing-ceiling.mjs");
const pricingDataPath = path.join(websiteDir, "src/lib/pricing-data.ts");
const pricingPagePath = path.join(websiteDir, "src/pages/Pricing.tsx");

const dynamicMonthlyClaim =
  'Start from £{BASE_FEE + modulePrice("red-tractor-compliance")}/month';
const staleMonthlyClaim = "Start from £41/month";

const originalChecker = fs.readFileSync(checkerPath, "utf8");
const originalPricingData = fs.readFileSync(pricingDataPath, "utf8");
const originalPricingPage = fs.readFileSync(pricingPagePath, "utf8");

const fixtureRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "annual-pricing-ceiling-"),
);

try {
  const fixtureScriptsDir = path.join(fixtureRoot, "scripts");
  const fixturePricingDataDir = path.join(fixtureRoot, "src/lib");
  const fixturePricingPageDir = path.join(fixtureRoot, "src/pages");

  fs.mkdirSync(fixtureScriptsDir, { recursive: true });
  fs.mkdirSync(fixturePricingDataDir, { recursive: true });
  fs.mkdirSync(fixturePricingPageDir, { recursive: true });

  const claimOccurrences = originalPricingPage.split(dynamicMonthlyClaim).length - 1;
  assert.equal(
    claimOccurrences,
    1,
    "Pricing.tsx must contain exactly one expected dynamic monthly claim",
  );

  fs.writeFileSync(
    path.join(fixtureScriptsDir, "check-annual-pricing-ceiling.mjs"),
    originalChecker,
  );
  fs.writeFileSync(
    path.join(fixturePricingDataDir, "pricing-data.ts"),
    originalPricingData,
  );
  fs.writeFileSync(
    path.join(fixturePricingPageDir, "Pricing.tsx"),
    originalPricingPage.replace(dynamicMonthlyClaim, staleMonthlyClaim),
  );

  const result = spawnSync(
    process.execPath,
    [path.join(fixtureScriptsDir, "check-annual-pricing-ceiling.mjs")],
    { encoding: "utf8" },
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  assert.notEqual(
    result.status,
    0,
    `checker unexpectedly accepted stale monthly pricing copy:\n${output}`,
  );
  assert.match(
    output,
    /Start from £X\/month[\s\S]*hardcoded literal[\s\S]*Copy says:\s+"Start from £41\/month"/,
    `checker failed for an unexpected reason:\n${output}`,
  );

  assert.equal(fs.readFileSync(pricingDataPath, "utf8"), originalPricingData);
  assert.equal(fs.readFileSync(pricingPagePath, "utf8"), originalPricingPage);

  console.log("✓ Stale monthly pricing fixture makes the release checker fail.");
  console.log("✓ Real Pricing.tsx and pricing-data.ts remained unchanged.");
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}