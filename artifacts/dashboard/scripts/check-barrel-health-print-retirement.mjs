#!/usr/bin/env node
/**
 * Guards the barrel-health Print action's retirement-warning flow. Row values
 * are exercised by VesselRegisterTab.barrel-health.test.ts; this source guard
 * protects the browser-only request, report metadata, highlighting, and error
 * handling that a node-environment unit test cannot execute.
 */

import fs from "node:fs";
import path from "node:path";

const pagePath = path.resolve(import.meta.dirname, "../src/pages/winery/VesselRegisterTab.tsx");
const source = fs.readFileSync(pagePath, "utf8");
const start = source.indexOf("const handlePrint = async () => {");
const end = source.indexOf("\n            return (", start);
const body = start >= 0 && end > start ? source.slice(start, end) : "";

const required = [
  ["maintenance-summary request", "winery-vessels-maintenance-summary"],
  ["failed response rejection", 'if (!maintSummaryRes.ok) throw new Error("Could not load barrel maintenance history.")'],
  ["maintenance totals passed to print rows", "buildBarrelHealthPrintRows(exportBarrels, approachingNeutralFills, retirementThresholdPence, maintMap)"],
  ["Retirement Warning column lookup", 'headers.indexOf("Retirement Warning")'],
  ["amber warning-cell styling", 'background:#fffbeb;color:#92400e;font-weight:600'],
  ["configured retirement threshold metadata", 'Retirement threshold: \\u00a3${(retirementThresholdPence / 100).toFixed(0)}'],
  ["failed report window closure", "win.close()"],
  ["actionable print error", 'toast({ title: "Print failed"'],
];

const failures = [];
if (!body) {
  failures.push("barrel-health handlePrint action could not be found");
} else {
  for (const [label, fragment] of required) {
    if (!body.includes(fragment)) failures.push(`missing ${label}`);
  }

  const requestIndex = body.indexOf("await fetch(");
  const printIndex = body.indexOf("win.print()");
  const closeIndex = body.indexOf("win.close()");
  const toastIndex = body.indexOf('toast({ title: "Print failed"');
  if (requestIndex < 0 || printIndex < 0 || requestIndex > printIndex) {
    failures.push("maintenance summary must resolve before the report prints");
  }
  if (closeIndex < 0 || toastIndex < 0 || closeIndex > toastIndex) {
    failures.push("a failed request must close the blank report before showing the error");
  }
}

if (failures.length > 0) {
  console.error("✗ Barrel health retirement-warning print guard failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("✓ Barrel health retirement-warning print flow is protected.");