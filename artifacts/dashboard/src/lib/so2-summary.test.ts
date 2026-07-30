import { describe, it, expect } from "vitest";
import { sumCellarSo2 } from "./so2-summary";

describe("sumCellarSo2", () => {
  it("returns zero totalG and null cumulativeMgL when no ops", () => {
    const { totalG, cumulativeMgL } = sumCellarSo2([]);
    expect(totalG).toBe(0);
    expect(cumulativeMgL).toBeNull();
  });

  it("correctly computes a single operation", () => {
    // 50 g into 500 L → 50 * 1000 / 500 = 100 mg/L
    const { totalG, cumulativeMgL } = sumCellarSo2([
      { so2_quantity_g: 50, volume_moved_litres: 500 },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeCloseTo(100);
  });

  it("sums per-operation mg/L increments, not aggregate grams divided by aggregate volume", () => {
    // Op 1: 10 g into 1000 L → 10 mg/L
    // Op 2: 5 g into 100 L  → 50 mg/L
    // Cumulative = 60 mg/L  (NOT (15*1000)/1100 ≈ 13.6 mg/L — that would be wrong)
    const { totalG, cumulativeMgL } = sumCellarSo2([
      { so2_quantity_g: 10, volume_moved_litres: 1000 },
      { so2_quantity_g: 5, volume_moved_litres: 100 },
    ]);
    expect(totalG).toBeCloseTo(15);
    expect(cumulativeMgL).toBeCloseTo(60);
    // Confirm the naive (wrong) average is NOT what we return
    const wrongAverage = (15 * 1000) / 1100;
    expect(cumulativeMgL).not.toBeCloseTo(wrongAverage);
  });

  it("excludes ops with no volume from mg/L but includes their grams", () => {
    const { totalG, cumulativeMgL } = sumCellarSo2([
      { so2_quantity_g: 20, volume_moved_litres: 200 }, // 100 mg/L
      { so2_quantity_g: 10, volume_moved_litres: null }, // no volume → skipped from mg/L
    ]);
    expect(totalG).toBeCloseTo(30);
    expect(cumulativeMgL).toBeCloseTo(100);
  });

  it("returns null cumulativeMgL when ALL ops lack volume", () => {
    const { totalG, cumulativeMgL } = sumCellarSo2([
      { so2_quantity_g: 30, volume_moved_litres: null },
      { so2_quantity_g: 20, volume_moved_litres: undefined },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeNull();
  });

  it("skips rows with invalid or zero volume defensively", () => {
    const { totalG, cumulativeMgL } = sumCellarSo2([
      { so2_quantity_g: 10, volume_moved_litres: 100 }, // 100 mg/L
      { so2_quantity_g: 5, volume_moved_litres: 0 },   // zero vol — skip
      { so2_quantity_g: 3, volume_moved_litres: "abc" }, // NaN vol — skip
    ]);
    expect(totalG).toBeCloseTo(18);
    expect(cumulativeMgL).toBeCloseTo(100);
  });

  it("skips rows with invalid grams defensively", () => {
    const { totalG, cumulativeMgL } = sumCellarSo2([
      { so2_quantity_g: "bad", volume_moved_litres: 100 },
      { so2_quantity_g: 20, volume_moved_litres: 200 }, // 100 mg/L
    ]);
    expect(totalG).toBeCloseTo(20);
    expect(cumulativeMgL).toBeCloseTo(100);
  });

  it("handles string-coerced numbers (as returned from the API)", () => {
    // API rows are often strings
    const { totalG, cumulativeMgL } = sumCellarSo2([
      { so2_quantity_g: "25", volume_moved_litres: "500" }, // 50 mg/L
    ]);
    expect(totalG).toBeCloseTo(25);
    expect(cumulativeMgL).toBeCloseTo(50);
  });
});
