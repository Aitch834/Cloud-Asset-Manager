import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  formatYieldTonnesPerHectare,
  YIELD_BY_VARIETY_YIELD_HEADER,
} from "./harvest-yield-display";

describe("Yield by Variety on-screen yield display", () => {
  const harvestTabSource = readFileSync(
    new URL("../pages/viticulture/HarvestTab.tsx", import.meta.url),
    "utf8",
  );

  it("shows the t/ha header and each variety yield to two decimal places", () => {
    expect(YIELD_BY_VARIETY_YIELD_HEADER).toBe("Yield (t/ha)");
    expect(formatYieldTonnesPerHectare(12_345, 2.5)).toBe("4.94");
    expect(formatYieldTonnesPerHectare(6_789, 1.25)).toBe("5.43");
    expect(harvestTabSource).toContain(
      'label: YIELD_BY_VARIETY_YIELD_HEADER',
    );
    expect(harvestTabSource).toContain(
      "formatYieldTonnesPerHectare(row.totalKg, row.areaHa)",
    );
  });

  it("shows the same two-decimal unit in the grand total footer", () => {
    const grandKgForKnownArea = 12_345 + 6_789;
    const grandKnownAreaHa = 2.5 + 1.25;

    expect(
      formatYieldTonnesPerHectare(grandKgForKnownArea, grandKnownAreaHa),
    ).toBe("5.10");
    expect(harvestTabSource).toContain(
      "formatYieldTonnesPerHectare(varietySummaryData.grandKgForArea, varietySummaryData.grandHa)",
    );
  });

  it("does not treat a variety with missing area as a numeric yield", () => {
    expect(formatYieldTonnesPerHectare(4_000, null)).toBe("—");
  });
});