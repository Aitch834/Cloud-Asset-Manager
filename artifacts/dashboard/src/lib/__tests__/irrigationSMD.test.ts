/**
 * Focused calculation tests for the Irrigation SMD scenario engine.
 *
 * The engine uses a day-by-day cumulative stress model (14-day horizon):
 *  • Irrigation is applied at its scenario time (day 0, 7, or never).
 *  • At each day the water-stress ratio ETa/ETm is recorded.
 *  • Mean ETa/ETm over 14 days drives FAO-56 yield loss: (1−Ya/Ym) = Ky×(1−mean ETa/ETm)
 *  • Revenue saved and net benefit use the skip baseline as the reference.
 *
 * Key invariants:
 *  1. Irrigating now genuinely outperforms waiting 7 days when the crop is stressed
 *     (7 extra days of stress accumulate before the deferred application).
 *  2. Skip is the baseline: its irrigationRevenueSaved and netBenefit are 0.
 *  3. Net benefit = revenue saved − irrigation cost (exact arithmetic).
 *  4. All results are bounded: yield loss fraction ∈ [0, 0.5], SMD ∈ [0, FC].
 *  5. When the crop is under no stress (SMD = 0, ETc = rain), all scenarios share
 *     zero yield loss; irrigating only incurs a cost → negative net benefit.
 */

import { describe, it, expect } from "vitest";
import fixtures from "../../../../../test-fixtures/irrigation-forecast-verdicts.json";
import { computeScenarios, computeForecastVerdict } from "../irrigationSMD";
import type { ForecastVerdict } from "../irrigationSMD";

// ── Shared fixtures ────────────────────────────────────────────────────────────

/** Typical stressed UK arable field — SMD well above critical threshold */
const STRESSED = {
  currentSmdMm: 100,
  irrigateMm: 25,
  costPerMmHa: 3.5,
  fieldAreaHa: 10,
  cropPricePerTonne: 220,
  typicalYieldTha: 9.0,
  Ky: 0.5,
  fieldCapacityMm: 150,
  criticalSmdMm: 40,
  expectedRainfall7dMm: 7,   // 1 mm/day
  currentDailyEtcMm: 3.0,
};

/** Field with no current water stress — SMD = 0, ET = rain */
const UNSTRESSED = {
  ...STRESSED,
  currentSmdMm: 0,
  currentDailyEtcMm: 1.0,
  expectedRainfall7dMm: 7, // 1 mm/day → net change = 0 each day
};

// ── 1. Irrigating now genuinely outperforms waiting 7 days when stressed ───────

describe("early irrigation advantage — cumulative stress model", () => {
  it("irrigate-now mean ETa/ETm > wait-7 mean ETa/ETm when SMD > critical threshold", () => {
    // 7 extra days of stress accumulate before the deferred application closes
    // the deficit, so the time-averaged water-use efficiency is lower for wait-7.
    const r = computeScenarios(STRESSED);
    expect(r.irrigateNow.etaEtmRatio).toBeGreaterThan(r.wait7.etaEtmRatio);
  });

  it("irrigate-now yield loss < wait-7 yield loss when stressed", () => {
    const r = computeScenarios(STRESSED);
    expect(r.irrigateNow.yieldLossTha).toBeLessThan(r.wait7.yieldLossTha);
  });

  it("irrigate-now net benefit > wait-7 net benefit when stressed", () => {
    const r = computeScenarios(STRESSED);
    expect(r.irrigateNow.netBenefit).toBeGreaterThan(r.wait7.netBenefit);
  });
});

// ── 2. Skip is the zero-cost, zero-benefit baseline ───────────────────────────

describe("skip baseline invariants", () => {
  it("skip has zero irrigation cost and zero revenue saved", () => {
    const r = computeScenarios(STRESSED);
    expect(r.skip.irrigationMm).toBe(0);
    expect(r.skip.irrigationCostTotal).toBe(0);
    expect(r.skip.irrigationRevenueSaved).toBe(0);
  });

  it("skip net benefit is 0 (it IS the baseline)", () => {
    const r = computeScenarios(STRESSED);
    expect(r.skip.netBenefit).toBeCloseTo(0, 10);
  });

  it("skip has higher yield loss than irrigate-now when stressed", () => {
    const r = computeScenarios(STRESSED);
    expect(r.skip.yieldLossTha).toBeGreaterThan(r.irrigateNow.yieldLossTha);
  });
});

// ── 3. Net benefit arithmetic ─────────────────────────────────────────────────

describe("net benefit arithmetic", () => {
  it("net benefit = revenue saved − irrigation cost (irrigate now)", () => {
    const r = computeScenarios(STRESSED);
    expect(r.irrigateNow.netBenefit).toBeCloseTo(
      r.irrigateNow.irrigationRevenueSaved - r.irrigateNow.irrigationCostTotal,
      10,
    );
  });

  it("net benefit = revenue saved − irrigation cost (wait 7)", () => {
    const r = computeScenarios(STRESSED);
    expect(r.wait7.netBenefit).toBeCloseTo(
      r.wait7.irrigationRevenueSaved - r.wait7.irrigationCostTotal,
      10,
    );
  });

  it("irrigation cost = irrigateMm × costPerMmHa × fieldAreaHa", () => {
    const r = computeScenarios(STRESSED);
    const expected = STRESSED.irrigateMm * STRESSED.costPerMmHa * STRESSED.fieldAreaHa;
    expect(r.irrigateNow.irrigationCostTotal).toBeCloseTo(expected, 10);
    expect(r.wait7.irrigationCostTotal).toBeCloseTo(expected, 10);
  });
});

// ── 4. Bounds: yield loss fraction ∈ [0, 0.5], SMD ∈ [0, FC] ─────────────────

describe("bounds on output values", () => {
  it("yield loss fractions are bounded to [0, 0.5]", () => {
    const r = computeScenarios({ ...STRESSED, currentSmdMm: 149, currentDailyEtcMm: 8, expectedRainfall7dMm: 0 });
    for (const s of [r.irrigateNow, r.wait7, r.skip]) {
      expect(s.yieldLossFraction).toBeGreaterThanOrEqual(0);
      expect(s.yieldLossFraction).toBeLessThanOrEqual(0.5);
    }
  });

  it("day-14 SMD stays within [0, fieldCapacity]", () => {
    const r = computeScenarios({ ...STRESSED, currentSmdMm: 140, currentDailyEtcMm: 10, expectedRainfall7dMm: 0 });
    for (const s of [r.irrigateNow, r.wait7, r.skip]) {
      expect(s.projectedSmd14Mm).toBeGreaterThanOrEqual(0);
      expect(s.projectedSmd14Mm).toBeLessThanOrEqual(STRESSED.fieldCapacityMm);
      expect(s.projectedSmdAfterMm).toBeGreaterThanOrEqual(0);
    }
  });

  it("day-14 SMD never goes negative under heavy rain", () => {
    const r = computeScenarios({ ...STRESSED, currentSmdMm: 5, currentDailyEtcMm: 0.5, expectedRainfall7dMm: 70 });
    for (const s of [r.irrigateNow, r.wait7, r.skip]) {
      expect(s.projectedSmd14Mm).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── 5. Zero-stress case: irrigating when already healthy only costs money ─────

describe("zero stress — no yield benefit from irrigation", () => {
  it("all scenarios have zero yield loss when ETc = rain and SMD = 0", () => {
    const r = computeScenarios(UNSTRESSED);
    // With no net depletion (ETc = rain = 1 mm/day) and starting SMD = 0,
    // SMD never rises above 0, so no stress accumulates and all yield loss = 0.
    expect(r.skip.yieldLossTha).toBeCloseTo(0, 6);
    expect(r.irrigateNow.yieldLossTha).toBeCloseTo(0, 6);
    expect(r.wait7.yieldLossTha).toBeCloseTo(0, 6);
  });

  it("irrigating when field is at capacity saves £0 revenue but costs money → negative net benefit", () => {
    const r = computeScenarios(UNSTRESSED);
    expect(r.irrigateNow.irrigationRevenueSaved).toBeCloseTo(0, 6);
    expect(r.irrigateNow.netBenefit).toBeLessThan(0);
  });
});

// ── 6. Cost sensitivity ───────────────────────────────────────────────────────

describe("cost sensitivity", () => {
  it("doubling irrigation cost reduces irrigate-now net benefit by irrigateMm × ΔcostPerMmHa × ha", () => {
    const low  = computeScenarios({ ...STRESSED, costPerMmHa: 2.0 });
    const high = computeScenarios({ ...STRESSED, costPerMmHa: 5.0 });
    const expected = (5.0 - 2.0) * STRESSED.irrigateMm * STRESSED.fieldAreaHa;
    expect(low.irrigateNow.netBenefit - high.irrigateNow.netBenefit).toBeCloseTo(expected, 4);
  });
});

// ── 7. Ordering of scenarios under increasing stress ─────────────────────────

describe("scenario ordering across stress levels", () => {
  it("all three scenarios have equal 0 yield loss when SMD is well below critical", () => {
    // SMD = 5 mm, critical = 40 mm — no stress at all for any scenario
    const r = computeScenarios({ ...STRESSED, currentSmdMm: 5, currentDailyEtcMm: 0.5 });
    expect(r.skip.yieldLossTha).toBeCloseTo(0, 2);
    expect(r.irrigateNow.yieldLossTha).toBeCloseTo(0, 2);
    expect(r.wait7.yieldLossTha).toBeCloseTo(0, 2);
  });

  it("stress ordering holds: irrigateNow ≤ wait7 ≤ skip yield loss", () => {
    const r = computeScenarios(STRESSED);
    expect(r.irrigateNow.yieldLossTha).toBeLessThanOrEqual(r.wait7.yieldLossTha);
    expect(r.wait7.yieldLossTha).toBeLessThanOrEqual(r.skip.yieldLossTha);
  });
});

// ── 8. Forecast rainfall applied only to days 0–6 (not doubled over 14 days) ─

describe("forecast rainfall application — 7-day window only", () => {
  // Use ETc = 0 and Ky = 0 to isolate pure rainfall effect on SMD.
  const RAIN_BASE = {
    ...STRESSED,
    currentSmdMm: 20,
    currentDailyEtcMm: 0,  // no evapotranspiration — isolates rain effect
    irrigateMm: 0,          // no irrigation — isolates skip scenario
    Ky: 0,                  // disable yield loss so we focus on SMD only
  };

  it("7 mm forecast (1 mm/day × 7 days) reduces SMD by exactly 7 mm, not 14 mm", () => {
    // Days 0–6: rain = 1 mm/day → SMD drops from 20 to 13
    // Days 7–13: no rain, no ETc → SMD stays at 13
    const r = computeScenarios({ ...RAIN_BASE, expectedRainfall7dMm: 7 });
    expect(r.skip.projectedSmd14Mm).toBeCloseTo(13, 6);
  });

  it("0 mm forecast means no rain falls — SMD is unchanged when ETc = 0", () => {
    const r = computeScenarios({ ...RAIN_BASE, expectedRainfall7dMm: 0 });
    expect(r.skip.projectedSmd14Mm).toBeCloseTo(20, 6);
  });

  it("14 mm forecast reduces SMD by exactly 14 mm over the 7-day window (2 mm/day)", () => {
    // Days 0–6: rain = 2 mm/day → SMD: 20 → 6
    // Days 7–13: no rain → SMD stays at 6
    const r = computeScenarios({ ...RAIN_BASE, expectedRainfall7dMm: 14 });
    expect(r.skip.projectedSmd14Mm).toBeCloseTo(6, 6);
  });

  it("forecast rain capped at field capacity — oversupply cannot drive SMD below 0", () => {
    // 70 mm rain over 7 days on a 20 mm deficit → SMD should clamp at 0
    const r = computeScenarios({ ...RAIN_BASE, expectedRainfall7dMm: 70 });
    expect(r.skip.projectedSmd14Mm).toBeCloseTo(0, 6);
    expect(r.skip.projectedSmd14Mm).toBeGreaterThanOrEqual(0);
  });

  it("scenario results differ for 0 vs 7 mm forecast when crop is stressed", () => {
    // With rain the skip scenario is less damaging; without it, more damaging
    const withRain    = computeScenarios({ ...STRESSED, expectedRainfall7dMm: 7 });
    const withoutRain = computeScenarios({ ...STRESSED, expectedRainfall7dMm: 0 });
    expect(withRain.skip.yieldLossTha).toBeLessThanOrEqual(withoutRain.skip.yieldLossTha);
  });

  it("hand-calculated fixture: irrigate-now with known inputs", () => {
    // Isolated fixture to verify numerical correctness end-to-end.
    // currentSmd = 30, ETc = 0, rain7d = 14mm (2mm/day for days 0–6), irrigateMm = 20
    // "Irrigate now" (day 0):
    //   Day 0: irrigate → smd = clamp(30-20) = 10, rain = 2, etC = 0 → smd = 8
    //   Days 1–6: smd decreases by 2/day → 8,6,4,2,0,0 (clamps at 0 from day 5)
    //   Days 7–13: no rain, no ETc → smd stays at 0
    //   ETa/ETm is 1.0 every day when smd ≤ criticalSmdMm (40) → mean = 1.0
    //   Yield loss fraction = Ky × (1 − 1.0) = 0
    // This verifies that enough rain + irrigation eliminates stress entirely.
    const r = computeScenarios({
      ...STRESSED,
      currentSmdMm: 30,
      currentDailyEtcMm: 0,
      expectedRainfall7dMm: 14,
      irrigateMm: 20,
    });
    expect(r.irrigateNow.yieldLossTha).toBeCloseTo(0, 6);
    expect(r.irrigateNow.projectedSmd14Mm).toBeCloseTo(0, 6);
  });
});

// ── 9. computeForecastVerdict — sufficient / partial / insufficient ────────────

describe("computeForecastVerdict — daily water-balance verdict", () => {
  // Helper: build a uniform forecast array (same mm every day)
  function uniformForecast(days: number, mmPerDay: number) {
    return Array.from({ length: days }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      mm: mmPerDay,
    }));
  }

  it("returns null when currentSmdMm ≤ 0 (no deficit to close)", () => {
    expect(
      computeForecastVerdict({
        currentSmdMm: 0,
        forecastDailyMm: uniformForecast(7, 5),
        dailyEtcMm: 2,
        fieldCapacityMm: 100,
      }),
    ).toBeNull();
  });

  it("returns null when forecastDailyMm is empty", () => {
    expect(
      computeForecastVerdict({
        currentSmdMm: 20,
        forecastDailyMm: [],
        dailyEtcMm: 2,
        fieldCapacityMm: 100,
      }),
    ).toBeNull();
  });

  it("sufficient — heavy rain closes deficit even with ET accumulating", () => {
    // SMD = 20 mm, 7 days × 5 mm rain − 2 mm ETc = 3 mm net gain per day
    // After 7 days: 20 − 7×3 = −1 → clamped to 0 → sufficient
    const result = computeForecastVerdict({
      currentSmdMm: 20,
      forecastDailyMm: uniformForecast(7, 5),
      dailyEtcMm: 2,
      fieldCapacityMm: 100,
    });
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("sufficient");
    expect(result!.projectedSmd).toBeCloseTo(0, 6);
    expect(result!.forecastTotal).toBeCloseTo(35, 6);
  });

  it("insufficient — high ET means rain doesn't dent the deficit", () => {
    // SMD = 30 mm, 7 days × 1 mm rain, 4 mm ETc → net −3 mm/day (deficit grows)
    // After 7 days: 30 + 7×3 = 51 → capped at FC (100) → insufficient
    const result = computeForecastVerdict({
      currentSmdMm: 30,
      forecastDailyMm: uniformForecast(7, 1),
      dailyEtcMm: 4,
      fieldCapacityMm: 100,
    });
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("insufficient");
    expect(result!.projectedSmd).toBeGreaterThan(30 * 0.5);
  });

  it("partial — rain reduces deficit by more than half but not fully", () => {
    // SMD = 40 mm, 7 days × 3 mm rain, 2 mm ETc → net +1 mm/day deficit reduction
    // After 7 days: 40 − 7 = 33 mm → still > 0 but < 40*0.5=20? No, 33 > 20 → insufficient.
    // Adjust: SMD = 40, 7 × 4 mm rain, 2 mm ETc → net +2 mm/day reduction
    // After 7 days: 40 − 14 = 26 → still > 0 but 26 < 40*0.5=20? No.
    // Try: SMD = 40, 7 × 5 mm rain, 2 mm ETc → net +3/day → 40 - 21 = 19 < 20 → partial
    const result = computeForecastVerdict({
      currentSmdMm: 40,
      forecastDailyMm: uniformForecast(7, 5),
      dailyEtcMm: 2,
      fieldCapacityMm: 100,
    });
    expect(result).not.toBeNull();
    // projectedSmd = 40 - 7*(5-2) = 40 - 21 = 19; 19 < 40*0.5=20 → partial
    expect(result!.projectedSmd).toBeCloseTo(19, 6);
    expect(result!.verdict).toBe("partial");
  });

  it("projectedSmd is clamped to [0, fieldCapacity]", () => {
    // Huge ET, no rain → SMD climbs; must stay ≤ FC
    const result = computeForecastVerdict({
      currentSmdMm: 90,
      forecastDailyMm: uniformForecast(7, 0),
      dailyEtcMm: 10,
      fieldCapacityMm: 100,
    });
    expect(result).not.toBeNull();
    expect(result!.projectedSmd).toBeLessThanOrEqual(100);
    expect(result!.projectedSmd).toBeGreaterThanOrEqual(0);
  });

  it("forecastTotal is the sum of all daily mm values", () => {
    const days = [{ date: "2026-08-01", mm: 3 }, { date: "2026-08-02", mm: 7 }, { date: "2026-08-03", mm: 2 }];
    const result = computeForecastVerdict({
      currentSmdMm: 50,
      forecastDailyMm: days,
      dailyEtcMm: 1,
      fieldCapacityMm: 100,
    });
    expect(result!.forecastTotal).toBeCloseTo(12, 6);
  });

  it("rain exactly equal to ET each day holds SMD steady → insufficient (no improvement)", () => {
    // net = 0 per day → SMD stays at 30 → 30 is not < 30*0.5 → insufficient
    const result = computeForecastVerdict({
      currentSmdMm: 30,
      forecastDailyMm: uniformForecast(7, 3),
      dailyEtcMm: 3,
      fieldCapacityMm: 100,
    });
    expect(result!.projectedSmd).toBeCloseTo(30, 6);
    expect(result!.verdict).toBe("insufficient");
  });

  it("recalculates forecast ETc from each day's interpolated Kc", () => {
    const profile = {
      label: "Test crop",
      Kc_ini: 1,
      Kc_mid: 2,
      Kc_end: 2,
      fracDev: 0,
      fracMid: 0.5,
      fracLate: 1,
      Ky: 1,
      criticalSmdMm: 30,
      typicalYieldTha: 1,
    };
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-08-${String(i + 2).padStart(2, "0")}`,
      mm: 22,
    }));

    const result = computeForecastVerdict({
      currentSmdMm: 50,
      forecastDailyMm: forecast,
      dailyEtcMm: 10,
      fieldCapacityMm: 100,
      cropProfile: profile,
      plantingDate: "2026-08-01",
      harvestDate: "2026-08-11",
      referenceDate: "2026-08-01",
    });

    // The interpolated Kc produces 120 mm of ETc over the forecast, leaving
    // 16 mm SMD. A flat 10 mm/day value would incorrectly clamp to zero.
    expect(result!.projectedSmd).toBeCloseTo(16, 6);
    expect(result!.verdict).toBe("partial");
  });
});

type ForecastFixture = {
  name: string;
  input: Parameters<typeof computeForecastVerdict>[0];
  expected: {
    projectedSmd: number;
    forecastTotal: number;
    verdict: ForecastVerdict;
  } | null;
};

describe("dashboard forecast verdict matches the shared cross-platform fixtures", () => {
  it.each(fixtures as ForecastFixture[])("$name", ({ input, expected }) => {
    const result = computeForecastVerdict(input);

    if (expected === null) {
      expect(result).toBeNull();
      return;
    }

    expect(result).not.toBeNull();
    expect(result!.projectedSmd).toBeCloseTo(expected.projectedSmd, 6);
    expect(result!.forecastTotal).toBeCloseTo(expected.forecastTotal, 6);
    expect(result!.verdict).toBe(expected.verdict);
  });
});
