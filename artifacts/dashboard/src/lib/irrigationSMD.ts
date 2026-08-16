/**
 * Irrigation Advisor — Soil Moisture Deficit (SMD) calculation engine.
 *
 * Uses the Hargreaves-Samani (1985) equation for reference ET₀ when Tmax/Tmin
 * are available from a connected weather station.  Falls back to UK monthly
 * climate normals for ~52°N when no temperature data is present.
 *
 * SMD model: a simple daily water balance
 *   SMD(t) = max(0, min(FC, SMD(t-1) + ETc(t) − Rainfall(t)))
 * where ETc = ET₀ × Kc (crop coefficient derived from growth stage).
 */

import { CropProfile, UK_MONTHLY_ET0_MM_DAY } from "./irrigationData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyReading {
  date: string;      // YYYY-MM-DD
  tmax?: number;     // °C maximum air temperature
  tmin?: number;     // °C minimum air temperature
  rainfall?: number; // mm precipitation
}

export interface SmdDay {
  date: string;
  et0: number;      // reference ET₀ (mm/day)
  etC: number;      // crop ET (mm/day) = ET₀ × Kc
  rainfall: number; // rainfall (mm)
  smd: number;      // soil moisture deficit (mm); 0 = field capacity
  kc: number;       // crop coefficient used
  stationData: boolean; // true if ET₀ was computed from real station data
}

export type GrowthStage = "Initial" | "Development" | "Mid-season" | "Late season" | "Unknown";
export type SmdStatus = "OK" | "Building" | "At Threshold" | "Critical";

export interface ScenarioResult {
  label: string;
  irrigationMm: number;
  irrigationCostPerHa: number;
  irrigationCostTotal: number;
  /** SMD immediately after irrigation is applied (for immediate-effect context) */
  projectedSmdAfterMm: number;
  /** Day-14 projected SMD — the horizon used for yield loss and net-benefit calculation */
  projectedSmd14Mm: number;
  etaEtmRatio: number;          // ETa/ETm (1 = no deficit, 0 = full stress)
  yieldLossFraction: number;    // fraction of potential yield lost (at day 14)
  yieldLossTha: number;         // t/ha yield loss (at day 14)
  yieldLossRevenueLoss: number; // £ revenue lost due to yield deficit
  /** £ revenue recovered vs the 14-day no-irrigation baseline */
  irrigationRevenueSaved: number;
  /** £ net benefit of this action vs not irrigating at all (revenue saved − cost) */
  netBenefit: number;
}

// ─── ET₀ Calculation ─────────────────────────────────────────────────────────

/** Extraterrestrial radiation (MJ/m²/day) for 52°N using FAO-56 equations 21-28 */
function extraterrestrialRadiation(dayOfYear: number): number {
  const Gsc = 0.0820; // solar constant MJ/m²/min
  const lat = 0.9076; // 52°N in radians
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * dayOfYear);
  const delta = 0.409 * Math.sin((2 * Math.PI / 365) * dayOfYear - 1.39);
  const ws = Math.acos(-Math.tan(lat) * Math.tan(delta));
  const Ra = (24 * 60 / Math.PI) * Gsc * dr * (
    ws * Math.sin(lat) * Math.sin(delta) +
    Math.cos(lat) * Math.cos(delta) * Math.sin(ws)
  );
  return Math.max(0, Ra);
}

function dayOfYear(dateStr: string): number {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

/** Hargreaves-Samani ET₀ in mm/day */
function hargreavesET0(tmax: number, tmin: number, doy: number): number {
  const tmean = (tmax + tmin) / 2;
  const Ra = extraterrestrialRadiation(doy);
  const et0MJ = 0.0023 * (tmean + 17.8) * Math.pow(Math.max(0, tmax - tmin), 0.5) * Ra;
  return Math.max(0, et0MJ / 2.45); // convert MJ/m²/day → mm/day (λ ≈ 2.45 MJ/kg)
}

function fallbackET0(dateStr: string): number {
  const month = new Date(dateStr).getMonth(); // 0-based
  return UK_MONTHLY_ET0_MM_DAY[month];
}

// ─── Kc from growth stage ─────────────────────────────────────────────────────

function getKc(
  profile: CropProfile,
  plantingDate: string,
  harvestDate: string | undefined,
  currentDate: string,
): number {
  const plant = new Date(plantingDate).getTime();
  const harvest = harvestDate ? new Date(harvestDate).getTime() : plant + 180 * 86400000;
  const current = new Date(currentDate).getTime();
  if (current <= plant) return profile.Kc_ini;
  if (current >= harvest) return profile.Kc_end;
  const elapsed = (current - plant) / (harvest - plant);
  if (elapsed < profile.fracDev) return profile.Kc_ini;
  if (elapsed < profile.fracMid) {
    const t = (elapsed - profile.fracDev) / (profile.fracMid - profile.fracDev);
    return profile.Kc_ini + t * (profile.Kc_mid - profile.Kc_ini);
  }
  if (elapsed < profile.fracLate) return profile.Kc_mid;
  const t = (elapsed - profile.fracLate) / (1 - profile.fracLate);
  return profile.Kc_mid + t * (profile.Kc_end - profile.Kc_mid);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Compute a day-by-day SMD series from daily weather readings */
export function computeSMD(
  readings: DailyReading[],
  cropProfile: CropProfile | null,
  fieldCapacityMm: number,
  plantingDate: string | null,
  harvestDate: string | null | undefined,
): SmdDay[] {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
  let smd = 0; // start at field capacity (zero deficit)
  return sorted.map(day => {
    const kc = (cropProfile && plantingDate)
      ? getKc(cropProfile, plantingDate, harvestDate ?? undefined, day.date)
      : 1.0;
    const hasStation = day.tmax != null && day.tmin != null;
    const et0 = hasStation
      ? hargreavesET0(day.tmax!, day.tmin!, dayOfYear(day.date))
      : fallbackET0(day.date);
    const etC = et0 * kc;
    const rain = day.rainfall ?? 0;
    smd = Math.max(0, Math.min(fieldCapacityMm, smd + etC - rain));
    return { date: day.date, et0, etC, rainfall: rain, smd, kc, stationData: hasStation };
  });
}

/** Return the human-readable growth stage for today */
export function getGrowthStage(
  profile: CropProfile | null,
  plantingDate: string | null,
  harvestDate: string | null | undefined,
  today: string,
): GrowthStage {
  if (!profile || !plantingDate) return "Unknown";
  const plant = new Date(plantingDate).getTime();
  const harvest = harvestDate ? new Date(harvestDate).getTime() : plant + 180 * 86400000;
  const current = new Date(today).getTime();
  if (current <= plant) return "Initial";
  const elapsed = (current - plant) / (harvest - plant);
  if (elapsed < profile.fracDev) return "Initial";
  if (elapsed < profile.fracMid) return "Development";
  if (elapsed < profile.fracLate) return "Mid-season";
  return "Late season";
}

// ─── Forecast deficit verdict ─────────────────────────────────────────────────

export type ForecastVerdict = "sufficient" | "partial" | "insufficient";

export interface ForecastVerdictResult {
  /** Projected SMD at the end of the forecast window after applying daily ET and rain. */
  projectedSmd: number;
  /** Sum of all forecast daily rainfall values (mm). */
  forecastTotal: number;
  /** Traffic-light verdict. */
  verdict: ForecastVerdict;
}

/**
 * Determine whether the 7-day rainfall forecast is likely to close the current
 * soil-moisture deficit, accounting for crop ET each forecast day.
 *
 * Runs the same daily water-balance model as computeSMD / computeScenarios:
 *   SMD(t) = max(0, min(FC, SMD(t-1) + ETc − rain(t)))
 *
 * Verdict:
 *   "sufficient"   — projected SMD reaches 0 (deficit fully closed)
 *   "partial"      — deficit improves by more than half but isn't fully closed
 *   "insufficient" — deficit improves by less than half or worsens
 *
 * Returns null when there is no current deficit (currentSmdMm ≤ 0) or the
 * forecast array is empty — callers should suppress the verdict in those cases.
 */
export function computeForecastVerdict(opts: {
  currentSmdMm: number;
  forecastDailyMm: Array<{ date: string; mm: number }>;
  dailyEtcMm: number;
  fieldCapacityMm: number;
}): ForecastVerdictResult | null {
  const { currentSmdMm, forecastDailyMm, dailyEtcMm, fieldCapacityMm } = opts;
  if (currentSmdMm <= 0 || forecastDailyMm.length === 0) return null;

  let smd = currentSmdMm;
  let forecastTotal = 0;
  for (const day of forecastDailyMm) {
    forecastTotal += day.mm;
    smd = Math.max(0, Math.min(fieldCapacityMm, smd + dailyEtcMm - day.mm));
  }

  const verdict: ForecastVerdict =
    smd <= 0 ? "sufficient" :
    smd < currentSmdMm * 0.5 ? "partial" :
    "insufficient";

  return { projectedSmd: smd, forecastTotal, verdict };
}

/** Traffic-light status based on current SMD vs critical threshold */
export function getSmdStatus(smd: number, criticalSmdMm: number): SmdStatus {
  if (smd <= criticalSmdMm * 0.40) return "OK";
  if (smd <= criticalSmdMm * 0.80) return "Building";
  if (smd <= criticalSmdMm * 1.20) return "At Threshold";
  return "Critical";
}

/**
 * Compute three irrigation scenarios using a day-by-day cumulative stress model
 * grounded in FAO-56 yield response:
 *   (1 − Ya/Ym) = Ky × (1 − mean ETa/ETm over the evaluation horizon)
 *
 * ETa/ETm at each day:
 *   • SMD ≤ critical threshold → ETa/ETm = 1.0 (no stress)
 *   • SMD > critical threshold → ETa/ETm = max(0, 1 − (SMD − crit) / (FC − crit))
 *
 * All three scenarios run forward for HORIZON_DAYS = 14 days from today.
 * Irrigation is applied at its scenario time (day 0, day 7, or never) and ET/rain
 * continue to accumulate after application.  Using the cumulative mean ETa/ETm
 * (rather than a single day-14 snapshot) means that seven days of pre-irrigation
 * stress genuinely reduce "Wait 7 days" relative to "Irrigate now" — the
 * financial difference is real, not an artefact of clamping.
 *
 * All revenue-saved and net-benefit figures use the same "Don't irrigate" baseline.
 */
export function computeScenarios(opts: {
  currentSmdMm: number;
  irrigateMm: number;
  costPerMmHa: number;
  fieldAreaHa: number;
  cropPricePerTonne: number;
  typicalYieldTha: number;
  Ky: number;
  fieldCapacityMm: number;
  criticalSmdMm: number;
  /** 7-day rainfall forecast total (mm); converted internally to a daily rate. */
  expectedRainfall7dMm: number;
  currentDailyEtcMm: number;
}): { irrigateNow: ScenarioResult; wait7: ScenarioResult; skip: ScenarioResult } {
  const {
    currentSmdMm, irrigateMm, costPerMmHa, fieldAreaHa, cropPricePerTonne,
    typicalYieldTha, Ky, fieldCapacityMm, criticalSmdMm,
    expectedRainfall7dMm, currentDailyEtcMm,
  } = opts;

  const HORIZON = 14;      // evaluation horizon in days
  const FORECAST_DAYS = 7; // length of the rainfall forecast window
  // Spread the 7-day forecast total uniformly over its 7-day window only.
  // Days beyond the forecast window (days 7–13) assume no rain, which is the
  // most conservative and accurate representation of an unknown future.
  const dailyRainInForecast = expectedRainfall7dMm / FORECAST_DAYS;
  const stressRange = Math.max(1, fieldCapacityMm - criticalSmdMm);
  const clamp = (v: number) => Math.max(0, Math.min(fieldCapacityMm, v));

  /**
   * Run a day-by-day water-balance simulation over HORIZON days.
   *
   * irrigateAtDay: the day index on which irrigation is applied.  Use a value
   *   ≥ HORIZON (e.g. HORIZON itself) to represent "no irrigation".
   *
   * Returns:
   *   day14Smd    — SMD at end of simulation (for contextual display)
   *   meanEtaEtm  — time-averaged ETa/ETm across all HORIZON days
   *   postIrrigSmd — SMD immediately after irrigation is applied
   */
  function simulate(irrigateAtDay: number): {
    day14Smd: number;
    meanEtaEtm: number;
    postIrrigSmd: number;
  } {
    let smd = currentSmdMm;
    let postIrrigSmd = currentSmdMm; // default: no change if irrigation never fires
    let sumEtaEtm = 0;

    for (let day = 0; day < HORIZON; day++) {
      // Apply irrigation on the scheduled day
      if (day === irrigateAtDay) {
        smd = clamp(smd - irrigateMm);
        postIrrigSmd = smd;
      }

      // Measure today's water-stress ratio BEFORE daily ET/rain (start-of-day SMD)
      const etaEtm = smd <= criticalSmdMm
        ? 1.0
        : Math.max(0, 1 - (smd - criticalSmdMm) / stressRange);
      sumEtaEtm += etaEtm;

      // Rain only during the forecast window (days 0–FORECAST_DAYS−1).
      // No rain is assumed beyond the 7-day forecast — conservatively.
      const dailyRain = day < FORECAST_DAYS ? dailyRainInForecast : 0;
      // Advance water balance: ET depletes, rain replenishes
      smd = clamp(smd + currentDailyEtcMm - dailyRain);
    }

    return {
      day14Smd: smd,
      meanEtaEtm: sumEtaEtm / HORIZON,
      postIrrigSmd,
    };
  }

  // ── Run all three simulations ────────────────────────────────────────────────
  const nowSim  = simulate(0);           // irrigate today
  const wait7Sim = simulate(7);          // irrigate in 7 days
  const skipSim  = simulate(HORIZON);    // never irrigate (≥ HORIZON → no irrigation)

  // ── Baseline revenue loss (skip scenario) ───────────────────────────────────
  const skipYieldLossFrac = Math.max(0, Math.min(0.50, Ky * (1 - skipSim.meanEtaEtm)));
  const skipYieldLossTha  = typicalYieldTha * skipYieldLossFrac;
  const skipRevLoss       = skipYieldLossTha * fieldAreaHa * cropPricePerTonne;

  // ── Build a ScenarioResult from simulation output ────────────────────────────
  function buildResult(
    label: string,
    sim: typeof nowSim,
    irrigMm: number,
  ): ScenarioResult {
    const irrigCostPerHa  = irrigMm * costPerMmHa;
    const irrigCostTotal  = irrigCostPerHa * fieldAreaHa;
    const yieldLossFrac   = Math.max(0, Math.min(0.50, Ky * (1 - sim.meanEtaEtm)));
    const yieldLossTha    = typicalYieldTha * yieldLossFrac;
    const yieldLossRevLoss = yieldLossTha * fieldAreaHa * cropPricePerTonne;
    const revenueSaved    = Math.max(0, skipRevLoss - yieldLossRevLoss);
    return {
      label,
      irrigationMm:         irrigMm,
      irrigationCostPerHa:  irrigCostPerHa,
      irrigationCostTotal:  irrigCostTotal,
      projectedSmdAfterMm:  sim.postIrrigSmd, // SMD immediately post-application
      projectedSmd14Mm:     sim.day14Smd,     // end-of-horizon SMD (context display)
      etaEtmRatio:          sim.meanEtaEtm,   // mean ETa/ETm over HORIZON days
      yieldLossFraction:    yieldLossFrac,
      yieldLossTha,
      yieldLossRevenueLoss: yieldLossRevLoss,
      irrigationRevenueSaved: revenueSaved,
      netBenefit: revenueSaved - irrigCostTotal,
    };
  }

  return {
    irrigateNow: buildResult("Irrigate now",   nowSim,  irrigateMm),
    wait7:       buildResult("Wait 7 days",    wait7Sim, irrigateMm),
    skip:        buildResult("Don't irrigate", skipSim,  0),
  };
}
