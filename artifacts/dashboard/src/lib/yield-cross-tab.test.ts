import { describe, expect, it } from "vitest";
import {
  calculateYieldCrossTabFooter,
  isSinglePickYieldCell,
} from "./yield-cross-tab";

describe("isSinglePickYieldCell", () => {
  it.each([
    ["zero yield", { kg: 0, pickCount: 1 }],
    ["null yield", { kg: null, pickCount: 1 }],
    ["missing cell", undefined],
  ])("does not flag %s as amber", (_label, cell) => {
    expect(isSinglePickYieldCell(cell)).toBe(false);
  });

  it("does not flag a no-yield cell even when its pick count is one", () => {
    const cell = { kg: 0, pickCount: 1 };

    expect(isSinglePickYieldCell(cell)).toBe(false);
    expect(cell.kg > 0 ? "yield" : "—").toBe("—");
  });

  it("flags a positive-yield cell when it has exactly one pick", () => {
    expect(isSinglePickYieldCell({ kg: 125.5, pickCount: 1 })).toBe(true);
  });

  it("does not flag positive yield when there are multiple picks", () => {
    expect(isSinglePickYieldCell({ kg: 125.5, pickCount: 2 })).toBe(false);
  });
});

describe("calculateYieldCrossTabFooter", () => {
  it.each([
    ["zero", 0],
    ["null", null],
  ])("excludes a %s-yield block's area from the vintage denominator", (_label, noYieldKg) => {
    const footer = calculateYieldCrossTabFooter("2025", [
      { areaHa: 2, cells: { "2025": { kg: 4_000 } } },
      { areaHa: 8, cells: { "2025": { kg: noYieldKg } } },
    ]);

    expect(footer).toEqual({ kg: 4_000, tha: 2 });
  });

  it("keeps footer kg and weighted t/ha correct for mixed positive and no-yield blocks", () => {
    const rows = [
      { areaHa: 2, cells: { "2024": { kg: 0 }, "2025": { kg: 4_000 } } },
      { areaHa: 3, cells: { "2024": { kg: 3_000 }, "2025": { kg: null } } },
      { areaHa: 5, cells: { "2024": { kg: 2_000 }, "2025": { kg: 1_000 } } },
    ];

    expect(calculateYieldCrossTabFooter("2024", rows)).toEqual({
      kg: 5_000,
      tha: 0.625,
    });
    expect(calculateYieldCrossTabFooter("2025", rows)).toEqual({
      kg: 5_000,
      tha: 5 / 7,
    });
  });
});