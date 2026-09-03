import { describe, expect, it } from "vitest";
import { isSinglePickYieldCell } from "./yield-cross-tab";

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