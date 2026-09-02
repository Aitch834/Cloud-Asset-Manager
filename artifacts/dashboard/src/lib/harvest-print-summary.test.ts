import { describe, expect, it } from "vitest";
import { getTopHarvestBlockKey, type HarvestPrintBlockSummary } from "./harvest-print-summary";

const summary = (
  key: string,
  blockId: number | null,
  label: string,
  totalKg: number,
): HarvestPrintBlockSummary => ({ key, blockId, label, totalKg });

describe("getTopHarvestBlockKey", () => {
  it("ignores null, empty-string-derived, and invalid block IDs", () => {
    const rows = [
      summary("linked", 12, "Linked block", 100),
      summary("unknown", null, "—", 900),
      summary("empty", 0, "0", 800),
      summary("invalid", Number.NaN, "NaN", 700),
    ];

    expect(getTopHarvestBlockKey(rows)).toBe("linked");
  });

  it("selects the linked block with the highest positive total yield", () => {
    const rows = [
      summary("north", 1, "North", 350),
      summary("south", 2, "South", 525),
      summary("west", 3, "West", 410),
    ];

    expect(getTopHarvestBlockKey(rows)).toBe("south");
  });

  it("resolves tied linked yields deterministically by block label", () => {
    const rows = [
      summary("zulu", 9, "Zulu", 500),
      summary("alpha", 8, "Alpha", 500),
      summary("zero", 7, "Zero", 0),
    ];

    expect(getTopHarvestBlockKey(rows)).toBe("alpha");
  });
});