export interface ForecastCropProfile {
  Kc_ini: number;
  Kc_mid: number;
  Kc_end: number;
  fracDev: number;
  fracMid: number;
  fracLate: number;
}

export type ForecastVerdict = "sufficient" | "partial" | "insufficient";

export interface ForecastVerdictResult {
  projectedSmd: number;
  forecastTotal: number;
  verdict: ForecastVerdict;
}

function getKc(
  profile: ForecastCropProfile,
  plantingDate: string,
  harvestDate: string | undefined,
  date: string,
): number {
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

export function computeForecastVerdict(opts: {
  currentSmdMm: number;
  forecastDailyMm: Array<{ date: string; mm: number }>;
  dailyEtcMm: number;
  fieldCapacityMm: number;
  cropProfile?: ForecastCropProfile | null;
  plantingDate?: string | null;
  harvestDate?: string | null;
  referenceDate?: string;
}): ForecastVerdictResult | null {
  const {
    currentSmdMm,
    forecastDailyMm,
    dailyEtcMm,
    fieldCapacityMm,
    cropProfile,
    plantingDate,
    harvestDate,
    referenceDate,
  } = opts;
  if (currentSmdMm <= 0 || forecastDailyMm.length === 0) return null;

  const hasCropTiming = !!cropProfile && !!plantingDate;
  const today = referenceDate ?? new Date().toISOString().slice(0, 10);
  const referenceKc = hasCropTiming
    ? getKc(cropProfile!, plantingDate!, harvestDate ?? undefined, today)
    : 1;
  const referenceEt0 = referenceKc > 0 ? dailyEtcMm / referenceKc : dailyEtcMm;

  let smd = currentSmdMm;
  let forecastTotal = 0;
  for (const day of forecastDailyMm) {
    forecastTotal += day.mm;
    const kc = hasCropTiming
      ? getKc(cropProfile!, plantingDate!, harvestDate ?? undefined, day.date)
      : 1;
    const forecastEtc = referenceEt0 * kc;
    smd = Math.max(0, Math.min(fieldCapacityMm, smd + forecastEtc - day.mm));
  }

  const verdict: ForecastVerdict =
    smd <= 0 ? "sufficient" :
    smd < currentSmdMm * 0.5 ? "partial" :
    "insufficient";

  return { projectedSmd: smd, forecastTotal, verdict };
}