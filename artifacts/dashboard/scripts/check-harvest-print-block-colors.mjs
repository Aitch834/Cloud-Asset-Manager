#!/usr/bin/env node
/**
 * Executes the exact yield-trend SVG builder used by printHarvest with two
 * blocks of the same variety. This protects the printed chart from reverting
 * to variety-only colours.
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const sharedSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../src/pages/viticulture/shared.tsx"),
  "utf8",
);
const colorSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../src/lib/variety-colors.ts"),
  "utf8",
);

function extract(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  return start >= 0 && end > start ? source.slice(start, end) : "";
}

const colorHelpersStart = colorSource.indexOf("export const YIELD_CHART_COLORS");
const colorHelpers = colorHelpersStart >= 0
  ? colorSource.slice(colorHelpersStart)
  : "";
const escHtml = extract(
  sharedSource,
  "function escHtml(",
  "\nfunction buildYieldTrendChartSvg",
);
const chartBuilder = extract(
  sharedSource,
  "function buildYieldTrendChartSvg(",
  "\n// ─── Yield-by-Block × Vintage chart SVG builder",
);

const failures = [];

if (!colorHelpers || !escHtml || !chartBuilder) {
  failures.push("printed yield chart renderer or colour helpers could not be found");
} else {
  const executableSource = `
    ${colorHelpers.replace(/\bexport\s+/g, "")}
    ${escHtml}
    ${chartBuilder}
    return buildYieldTrendChartSvg;
  `;
  const javascript = ts.transpileModule(executableSource, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  }).outputText;
  const buildYieldTrendChartSvg = new Function(javascript)();

  const records = [
    { blockId: 101, vintageYear: 2024, yieldKg: 900 },
    { blockId: 202, vintageYear: 2024, yieldKg: 750 },
    { blockId: 101, vintageYear: 2025, yieldKg: 1100 },
    { blockId: 202, vintageYear: 2025, yieldKg: 980 },
  ];
  const blockLookup = {
    101: { blockName: "North Block", variety: "Chardonnay" },
    202: { blockName: "South Block", variety: "Chardonnay" },
  };
  const svg = buildYieldTrendChartSvg(records, blockLookup);

  const legendEntries = new Map(
    [...svg.matchAll(
      /<rect[^>]+fill="(#[0-9a-fA-F]{6})"[^>]*\/>\s*<text[^>]*>([^<]+)<\/text>/g,
    )].map(match => [match[2], match[1]]),
  );
  const northColor = legendEntries.get("North Block — Chardonnay");
  const southColor = legendEntries.get("South Block — Chardonnay");

  if (!svg) {
    failures.push("fixture did not produce a printed yield chart SVG");
  }
  if (!northColor || !southColor) {
    failures.push("both same-variety fixture blocks must appear in the printed chart legend with colours");
  } else if (northColor.toLowerCase() === southColor.toLowerCase()) {
    failures.push("same-variety blocks must have distinct colours in the printed chart");
  }
}

if (failures.length > 0) {
  console.error("✗ Harvest print block colour guard failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("✓ Harvest print keeps same-variety blocks visually distinct.");