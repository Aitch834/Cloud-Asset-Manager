#!/usr/bin/env node
/**
 * Exercises the exact Vintage Summary row-rendering block used by printHarvest.
 * This protects browser-only print HTML without duplicating its ranking logic in
 * the check itself.
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const sharedPath = path.resolve(import.meta.dirname, "../src/pages/viticulture/shared.tsx");
const harvestTabPath = path.resolve(import.meta.dirname, "../src/pages/viticulture/HarvestTab.tsx");
const sharedSource = fs.readFileSync(sharedPath, "utf8");
const harvestTabSource = fs.readFileSync(harvestTabPath, "utf8");

const blockStart = sharedSource.indexOf("    const vintageSortDirection = ");
const blockEndMarker = "    const vsTotalPicks = records.length;";
const blockEnd = sharedSource.indexOf(blockEndMarker, blockStart);
const rendererBlock = blockStart >= 0 && blockEnd > blockStart
  ? sharedSource.slice(blockStart, blockEnd)
  : "";

const failures = [];

if (!rendererBlock) {
  failures.push("printHarvest Vintage Summary renderer could not be found");
} else {
  const executableSource = `
    function renderVintageRows(vintageSort, uniqueVintages, vintageObj, vintageTha, escHtml) {
      ${rendererBlock}
      return vintageRows;
    }
    return renderVintageRows;
  `;
  const javascript = ts.transpileModule(executableSource, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  }).outputText;
  const renderVintageRows = new Function(javascript)();

  const uniqueVintages = ["2023", "2024"];
  const vintageObj = {
    "2023": { picks: 2, totalKg: 900, brixSum: 36, brixCount: 2, phSum: 6.4, phCount: 2, taSum: 15, taCount: 2, paSum: 20, paCount: 2 },
    "2024": { picks: 3, totalKg: 1200, brixSum: 57, brixCount: 3, phSum: 9.9, phCount: 3, taSum: 21, taCount: 3, paSum: 33, paCount: 3 },
  };
  const vintageTha = year => year === "2023" ? 4.5 : 6;
  const escHtml = value => String(value);
  const render = sort => renderVintageRows(sort, uniqueVintages, vintageObj, vintageTha, escHtml);
  const topRows = html => html.match(/<tr style="background:#ecfdf5[^"]*">[\s\S]*?<\/tr>/g) ?? [];

  const descendingRows = topRows(render({ col: "totalKg", dir: "desc" }));
  if (descendingRows.length !== 1 || !descendingRows[0].includes("2024") || !descendingRows[0].includes(">Top</span>") || !descendingRows[0].includes("3px solid #10b981")) {
    failures.push("descending numeric sort must give exactly vintage 2024 the emerald Top treatment");
  }

  const ascendingRows = topRows(render({ col: "avgBrix", dir: "asc" }));
  if (ascendingRows.length !== 1 || !ascendingRows[0].includes("2023") || !ascendingRows[0].includes(">Top</span>") || !ascendingRows[0].includes("3px solid #10b981")) {
    failures.push("ascending numeric sort must give exactly vintage 2023 the emerald Top treatment");
  }

  const textSortHtml = render({ col: "vintage", dir: "desc" });
  if (topRows(textSortHtml).length !== 0 || textSortHtml.includes(">Top</span>") || textSortHtml.includes("3px solid #10b981")) {
    failures.push("Vintage text sorting must not give any row the Top treatment");
  }
}

const printCalls = harvestTabSource.match(/printHarvest\([^;]+vintageSort\)/g) ?? [];
if (printCalls.length < 2) {
  failures.push("both Harvest print actions must pass the on-screen vintageSort to printHarvest");
}

if (failures.length > 0) {
  console.error("✗ Harvest print Vintage Summary Top guard failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("✓ Harvest print Vintage Summary numeric and text Top treatments are protected.");