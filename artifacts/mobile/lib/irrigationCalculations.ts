export interface CropProfile {
  label: string;
  Kc_ini: number;
  Kc_mid: number;
  Kc_end: number;
  fracDev: number;
  fracMid: number;
  fracLate: number;
  Ky: number;
  criticalSmdMm: number;
  typicalYieldTha: number;
}

const profile = (
  label: string, Kc_ini: number, Kc_mid: number, Kc_end: number,
  fracDev: number, fracMid: number, fracLate: number,
  Ky: number, criticalSmdMm: number, typicalYieldTha: number,
): CropProfile => ({
  label, Kc_ini, Kc_mid, Kc_end, fracDev, fracMid, fracLate,
  Ky, criticalSmdMm, typicalYieldTha,
});

export const CROP_PROFILES: Record<string, CropProfile> = {
  "winter wheat": profile("Winter Wheat", .3, 1.15, .25, .2, .55, .8, .5, 40, 9),
  "spring wheat": profile("Spring Wheat", .3, 1.15, .25, .2, .55, .8, .5, 35, 7.5),
  wheat: profile("Wheat", .3, 1.15, .25, .2, .55, .8, .5, 40, 9),
  "spring barley": profile("Spring Barley", .3, 1.15, .25, .15, .5, .75, .45, 35, 6.5),
  "winter barley": profile("Winter Barley", .3, 1.15, .25, .2, .55, .8, .45, 40, 8),
  barley: profile("Barley", .3, 1.15, .25, .17, .52, .78, .45, 35, 7),
  oats: profile("Oats", .3, 1.15, .25, .2, .55, .8, .45, 40, 7.5),
  "oilseed rape": profile("Oilseed Rape", .35, 1.15, .35, .15, .5, .8, .7, 40, 4),
  osr: profile("Oilseed Rape", .35, 1.15, .35, .15, .5, .8, .7, 40, 4),
  rapeseed: profile("Oilseed Rape", .35, 1.15, .35, .15, .5, .8, .7, 40, 4),
  potatoes: profile("Potatoes", .5, 1.15, .75, .2, .55, .85, 1.1, 25, 45),
  potato: profile("Potatoes", .5, 1.15, .75, .2, .55, .85, 1.1, 25, 45),
  "sugar beet": profile("Sugar Beet", .35, 1.2, .7, .25, .55, .85, 1, 35, 75),
  maize: profile("Maize / Corn", .3, 1.2, .35, .2, .55, .8, 1.25, 30, 12),
  "forage maize": profile("Forage Maize", .3, 1.2, .35, .2, .55, .8, 1.25, 30, 40),
  "field beans": profile("Field Beans", .4, 1.15, .35, .2, .5, .8, .7, 35, 5),
  beans: profile("Beans", .4, 1.15, .35, .2, .5, .8, .7, 35, 5),
  peas: profile("Peas", .4, 1.15, 1.1, .2, .5, .8, .7, 30, 5),
  vegetables: profile("Vegetables", .5, 1.05, .9, .2, .5, .8, 1, 20, 40),
  carrots: profile("Carrots", .7, 1.05, .95, .25, .55, .8, 1, 20, 50),
  onions: profile("Onions", .5, 1.05, .75, .25, .55, .8, 1.1, 20, 55),
};

export const UK_MONTHLY_ET0_MM_DAY = [.3, .6, 1.1, 1.9, 2.8, 3.4, 3.5, 3.1, 2, 1.1, .5, .2];
export const DEFAULT_FIELD_CAPACITY_MM = 150;
export const FIELD_CAPACITY_BY_SOIL: Record<string, number> = {
  sand: 90, "light sandy": 90, sandy: 90, "loamy sand": 100,
  "sandy loam": 120, "light loam": 135, "sandy clay loam": 145,
  "medium loam": 150, loam: 150, "silty loam": 155, "silt loam": 155,
  silt: 155, "clay loam": 160, "sandy clay": 160, "silty clay loam": 165,
  "silty clay": 170, "heavy clay": 175, clay: 175, peat: 200,
};

export function getFieldCapacity(soilType?: string | null): number {
  if (!soilType) return DEFAULT_FIELD_CAPACITY_MM;
  const normalised = soilType.toLowerCase().trim().replace(/_/g, " ");
  if (FIELD_CAPACITY_BY_SOIL[normalised] !== undefined) return FIELD_CAPACITY_BY_SOIL[normalised];
  for (const [key, capacity] of Object.entries(FIELD_CAPACITY_BY_SOIL)) {
    if (normalised.includes(key) || key.includes(normalised)) return capacity;
  }
  return DEFAULT_FIELD_CAPACITY_MM;
}

export function matchCropProfile(cropName: string): CropProfile | null {
  const lower = cropName.toLowerCase().trim();
  if (!lower) return null;
  if (CROP_PROFILES[lower]) return CROP_PROFILES[lower];
  for (const [key, cropProfile] of Object.entries(CROP_PROFILES)) {
    if (lower.includes(key) || key.includes(lower)) return cropProfile;
  }
  return null;
}

export function getKc(profile: CropProfile, plantingDate: string, harvestDate: string | undefined, date: string): number {
  const plant = new Date(plantingDate).getTime();
  const harvest = harvestDate ? new Date(harvestDate).getTime() : plant + 180 * 86400000;
  const current = new Date(date).getTime();
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

export interface DailyReading { date: string; tmax?: number; tmin?: number; rainfall?: number }
export interface SmdDay {
  date: string; et0: number; etC: number; rainfall: number; smd: number; kc: number; stationData: boolean;
}
export type SmdStatus = "OK" | "Building" | "At Threshold" | "Critical";

function extraterrestrialRadiation(dayOfYear: number): number {
  const lat = .9076;
  const dr = 1 + .033 * Math.cos((2 * Math.PI / 365) * dayOfYear);
  const delta = .409 * Math.sin((2 * Math.PI / 365) * dayOfYear - 1.39);
  const ws = Math.acos(-Math.tan(lat) * Math.tan(delta));
  return Math.max(0, (24 * 60 / Math.PI) * .082 * dr * (
    ws * Math.sin(lat) * Math.sin(delta) + Math.cos(lat) * Math.cos(delta) * Math.sin(ws)
  ));
}

function dayOfYear(date: string): number {
  const current = new Date(date);
  return Math.floor((current.getTime() - new Date(current.getFullYear(), 0, 0).getTime()) / 86400000);
}

export function fallbackET0(date: string): number {
  return UK_MONTHLY_ET0_MM_DAY[new Date(date).getMonth()];
}

export function computeSMD(
  readings: DailyReading[], cropProfile: CropProfile | null, fieldCapacityMm: number,
  plantingDate: string | null, harvestDate: string | null | undefined,
): SmdDay[] {
  let smd = 0;
  return [...readings].sort((a, b) => a.date.localeCompare(b.date)).map(day => {
    const kc = cropProfile && plantingDate ? getKc(cropProfile, plantingDate, harvestDate ?? undefined, day.date) : 1;
    const stationData = day.tmax != null && day.tmin != null;
    const et0 = stationData
      ? Math.max(0, .0023 * ((day.tmax! + day.tmin!) / 2 + 17.8) * Math.sqrt(Math.max(0, day.tmax! - day.tmin!)) * extraterrestrialRadiation(dayOfYear(day.date)) / 2.45)
      : fallbackET0(day.date);
    const etC = et0 * kc;
    const rainfall = day.rainfall ?? 0;
    smd = Math.max(0, Math.min(fieldCapacityMm, smd + etC - rainfall));
    return { date: day.date, et0, etC, rainfall, smd, kc, stationData };
  });
}

export function getSmdStatus(smd: number, criticalSmdMm: number): SmdStatus {
  if (smd <= criticalSmdMm * .4) return "OK";
  if (smd <= criticalSmdMm * .8) return "Building";
  if (smd <= criticalSmdMm * 1.2) return "At Threshold";
  return "Critical";
}

export interface ScenarioResult {
  label: string; irrigationMm: number; irrigationCostPerHa: number; irrigationCostTotal: number;
  projectedSmdAfterMm: number; projectedSmd14Mm: number; etaEtmRatio: number;
  yieldLossFraction: number; yieldLossTha: number; yieldLossRevenueLoss: number;
  irrigationRevenueSaved: number; netBenefit: number;
}

export function computeScenarios(opts: {
  currentSmdMm: number; irrigateMm: number; costPerMmHa: number; fieldAreaHa: number;
  cropPricePerTonne: number; typicalYieldTha: number; Ky: number; fieldCapacityMm: number;
  criticalSmdMm: number; expectedRainfall7dMm: number; currentDailyEtcMm: number;
}): { irrigateNow: ScenarioResult; wait7: ScenarioResult; skip: ScenarioResult } {
  const horizon = 14;
  const rainPerDay = opts.expectedRainfall7dMm / 7;
  const stressRange = Math.max(1, opts.fieldCapacityMm - opts.criticalSmdMm);
  const clamp = (value: number) => Math.max(0, Math.min(opts.fieldCapacityMm, value));
  const simulate = (irrigateAt: number) => {
    let smd = opts.currentSmdMm, postIrrigSmd = smd, sumEtaEtm = 0;
    for (let day = 0; day < horizon; day++) {
      if (day === irrigateAt) {
        smd = clamp(smd - opts.irrigateMm);
        postIrrigSmd = smd;
      }
      sumEtaEtm += smd <= opts.criticalSmdMm ? 1 : Math.max(0, 1 - (smd - opts.criticalSmdMm) / stressRange);
      smd = clamp(smd + opts.currentDailyEtcMm - (day < 7 ? rainPerDay : 0));
    }
    return { day14Smd: smd, meanEtaEtm: sumEtaEtm / horizon, postIrrigSmd };
  };
  const now = simulate(0), wait = simulate(7), skip = simulate(horizon);
  const lossFraction = (mean: number) => Math.max(0, Math.min(.5, opts.Ky * (1 - mean)));
  const skipRevenueLoss = opts.typicalYieldTha * lossFraction(skip.meanEtaEtm) * opts.fieldAreaHa * opts.cropPricePerTonne;
  const result = (label: string, sim: typeof now, irrigationMm: number): ScenarioResult => {
    const irrigationCostPerHa = irrigationMm * opts.costPerMmHa;
    const irrigationCostTotal = irrigationCostPerHa * opts.fieldAreaHa;
    const yieldLossFraction = lossFraction(sim.meanEtaEtm);
    const yieldLossTha = opts.typicalYieldTha * yieldLossFraction;
    const yieldLossRevenueLoss = yieldLossTha * opts.fieldAreaHa * opts.cropPricePerTonne;
    const irrigationRevenueSaved = Math.max(0, skipRevenueLoss - yieldLossRevenueLoss);
    return {
      label, irrigationMm, irrigationCostPerHa, irrigationCostTotal,
      projectedSmdAfterMm: sim.postIrrigSmd, projectedSmd14Mm: sim.day14Smd,
      etaEtmRatio: sim.meanEtaEtm, yieldLossFraction, yieldLossTha,
      yieldLossRevenueLoss, irrigationRevenueSaved,
      netBenefit: irrigationRevenueSaved - irrigationCostTotal,
    };
  };
  return {
    irrigateNow: result("Irrigate now", now, opts.irrigateMm),
    wait7: result("Wait 7 days", wait, opts.irrigateMm),
    skip: result("Don't irrigate", skip, 0),
  };
}