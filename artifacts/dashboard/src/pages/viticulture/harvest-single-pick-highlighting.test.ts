import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const viticultureDir = dirname(fileURLToPath(import.meta.url));
const harvestSource = readFileSync(resolve(viticultureDir, "HarvestTab.tsx"), "utf8");

const singlePickRowClass =
  'bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/30';

function sourceBetween(start: string, end: string): string {
  const startIndex = harvestSource.indexOf(start);
  const endIndex = harvestSource.indexOf(end, startIndex + start.length);

  expect(startIndex).toBeGreaterThanOrEqual(0);
  expect(endIndex).toBeGreaterThan(startIndex);

  return harvestSource.slice(startIndex, endIndex);
}

describe("Harvest yield-summary single-pick highlighting", () => {
  it("keeps the amber row and confidence tooltip in Yield Summary by Vintage", () => {
    const vintageSummary = sourceBetween(
      "Yield Summary by Vintage",
      "// ── Group by block (single vintage selected)",
    );

    expect(vintageSummary).toContain(`row.picks === 1 ? "${singlePickRowClass}"`);
    expect(vintageSummary).toContain(
      'title={!isTopRow && row.picks === 1 ? "Only one pick recorded for this vintage — treat data with lower confidence" : undefined}',
    );
  });

  it("keeps the amber row and confidence tooltip in Per-Block Yield Summary", () => {
    const blockSummary = sourceBetween(
      "Per-Block Yield Summary",
      "{/* Yield by Variety summary",
    );

    expect(blockSummary).toContain(`row.picks === 1 ? "${singlePickRowClass}"`);
    expect(blockSummary).toContain(
      'title={!isTopRow && row.picks === 1 ? "Only one pick recorded for this block — treat data with lower confidence" : undefined}',
    );
  });
});