import { describe, expect, it } from "vitest";
import { getTopHarvestSummaryBlockName } from "./harvest-block-summary";

describe("getTopHarvestSummaryBlockName", () => {
  it("keeps the Top badge off Not linked when its aggregate yield is highest", () => {
    const rowsByYield = [
      { name: "Not linked", totalYieldKg: 1_200 },
      { name: "South Block", totalYieldKg: 900 },
      { name: "North Block", totalYieldKg: 700 },
    ];

    const topBlock = getTopHarvestSummaryBlockName(rowsByYield, "totalYieldKg");

    expect(topBlock).toBe("South Block");
    expect(rowsByYield.map(row => ({
      name: row.name,
      hasTopBadge: row.name === topBlock,
    }))).toEqual([
      { name: "Not linked", hasTopBadge: false },
      { name: "South Block", hasTopBadge: true },
      { name: "North Block", hasTopBadge: false },
    ]);
  });

  it("keeps selecting the highest-yielding named block when all records are linked", () => {
    const rowsByYield = [
      { name: "East Block", totalYieldKg: 1_100 },
      { name: "West Block", totalYieldKg: 950 },
    ];

    expect(getTopHarvestSummaryBlockName(rowsByYield, "totalYieldKg")).toBe("East Block");
  });
});