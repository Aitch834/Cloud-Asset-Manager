import { describe, it, expect } from "vitest";
import { sumCellarSo2, cellarSo2RunningTotals } from "./so2-summary";

describe("sumCellarSo2", () => {
  it("returns zero totalG and null cumulativeMgL when no ops", () => {
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([]);
    expect(totalG).toBe(0);
    expect(cumulativeMgL).toBeNull();
    expect(volumeSource).toBeNull();
  });

  it("correctly computes a single operation using volume_moved_litres", () => {
    // 50 g into 500 L → 50 * 1000 / 500 = 100 mg/L
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: 50, volume_moved_litres: 500 },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeCloseTo(100);
    expect(volumeSource).toBe("volume_moved");
  });

  it("prefers vessel_capacity_litres over volume_moved_litres when both present", () => {
    // Vessel capacity 1000 L, volume moved 500 L
    // 50 g / 1000 L → 50 mg/L  (not 100 mg/L from volume moved)
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: 50, volume_moved_litres: 500, vessel_capacity_litres: 1000 },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeCloseTo(50);
    expect(volumeSource).toBe("vessel");
  });

  it("falls back to volume_moved_litres when vessel_capacity_litres is null", () => {
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: 50, volume_moved_litres: 500, vessel_capacity_litres: null },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeCloseTo(100);
    expect(volumeSource).toBe("volume_moved");
  });

  it("falls back to volume_moved_litres when vessel_capacity_litres is zero", () => {
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: 50, volume_moved_litres: 500, vessel_capacity_litres: 0 },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeCloseTo(100);
    expect(volumeSource).toBe("volume_moved");
  });

  it("falls back to volume_moved_litres when vessel_capacity_litres is NaN string", () => {
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: 50, volume_moved_litres: 500, vessel_capacity_litres: "abc" },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeCloseTo(100);
    expect(volumeSource).toBe("volume_moved");
  });

  it("reports 'mixed' volumeSource when ops use different volume fields", () => {
    // Op 1 has vessel capacity, Op 2 falls back to volume moved
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: 10, volume_moved_litres: 200, vessel_capacity_litres: 1000 }, // 10 mg/L
      { so2_quantity_g: 10, volume_moved_litres: 200, vessel_capacity_litres: null }, // 50 mg/L
    ]);
    expect(totalG).toBeCloseTo(20);
    expect(cumulativeMgL).toBeCloseTo(60);
    expect(volumeSource).toBe("mixed");
  });

  it("reports 'vessel' volumeSource when all ops use vessel capacity", () => {
    const { volumeSource } = sumCellarSo2([
      { so2_quantity_g: 10, vessel_capacity_litres: 1000 },
      { so2_quantity_g: 20, vessel_capacity_litres: 2000 },
    ]);
    expect(volumeSource).toBe("vessel");
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
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: 30, volume_moved_litres: null },
      { so2_quantity_g: 20, volume_moved_litres: undefined },
    ]);
    expect(totalG).toBeCloseTo(50);
    expect(cumulativeMgL).toBeNull();
    expect(volumeSource).toBeNull();
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

  it("handles string-coerced vessel_capacity_litres from API", () => {
    const { totalG, cumulativeMgL, volumeSource } = sumCellarSo2([
      { so2_quantity_g: "25", volume_moved_litres: "500", vessel_capacity_litres: "1000" },
    ]);
    expect(totalG).toBeCloseTo(25);
    expect(cumulativeMgL).toBeCloseTo(25); // 25*1000/1000
    expect(volumeSource).toBe("vessel");
  });
});

describe("cellarSo2RunningTotals", () => {
  it("returns per-op cumulative totals in order", () => {
    const { perOp, finalMgL } = cellarSo2RunningTotals([
      { so2_quantity_g: 10, volume_moved_litres: 100 }, // +100 → 100
      { so2_quantity_g: 5, volume_moved_litres: 100 },  // +50 → 150
    ]);
    expect(perOp[0]).toEqual({ contributed: true, runningMgL: expect.closeTo(100) });
    expect(perOp[1]).toEqual({ contributed: true, runningMgL: expect.closeTo(150) });
    expect(finalMgL).toBeCloseTo(150);
  });

  it("marks ops without usable volume as non-contributing and carries the prior total", () => {
    const { perOp, totalG } = cellarSo2RunningTotals([
      { so2_quantity_g: 10, volume_moved_litres: 100 }, // 100
      { so2_quantity_g: 7 },                            // no volume — non-contributing
      { so2_quantity_g: 5, volume_moved_litres: 100 },  // 150
    ]);
    expect(perOp[1].contributed).toBe(false);
    expect(perOp[1].runningMgL).toBeCloseTo(100);
    expect(perOp[2].runningMgL).toBeCloseTo(150);
    expect(totalG).toBeCloseTo(22); // grams still counted even without volume
  });

  it("returns null running totals when nothing has accumulated", () => {
    const { perOp, finalMgL } = cellarSo2RunningTotals([
      { so2_quantity_g: "bad" },
      { op_type: "racking" },
    ]);
    expect(perOp).toEqual([
      { contributed: false, runningMgL: null },
      { contributed: false, runningMgL: null },
    ]);
    expect(finalMgL).toBeNull();
  });

  it("stays consistent with sumCellarSo2's final figures", () => {
    const ops = [
      { so2_quantity_g: "25", volume_moved_litres: "500", vessel_capacity_litres: "1000" },
      { so2_quantity_g: 10, volume_moved_litres: 100 },
    ];
    const sum = sumCellarSo2(ops);
    const detail = cellarSo2RunningTotals(ops);
    expect(detail.finalMgL).toBeCloseTo(sum.cumulativeMgL as number);
    expect(detail.totalG).toBeCloseTo(sum.totalG);
    expect(detail.volumeSource).toBe("mixed");
  });
});
