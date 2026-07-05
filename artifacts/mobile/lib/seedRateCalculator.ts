// Seed rate calculator: target plant population (plants/m²) × TGW (g) ÷ estimated
// field establishment %, adjusted for soil type and drilling date.
//
// This mirrors the standard agronomist/seed-merchant approach:
//   seeds/m² = target plants/m² ÷ (establishment % ÷ 100)
//   seed rate (kg/ha) = seeds/m² × TGW (g) ÷ 100
//
// "Establishment %" folds together germination and field losses (frost, slugs,
// seedbed quality, drilling depth) — the same simplification most seed
// merchants use when quoting a single "% establishment" assumption.
//
// Figures below are reasonable UK arable defaults, not a substitute for
// merchant/agronomist advice — always treat the output as a starting point.
//
// Ported from artifacts/dashboard/src/lib/seedRateCalculator.ts — keep both in sync.

export const STANDARD_TARGET_POPULATION_M2 = 250;
// AHDB cultural-control guidance for black-grass suppression recommends a
// notably higher target plant population to increase crop competition —
// commonly 300–400 plants/m² for winter wheat vs. ~220–250 standard.
export const BLACKGRASS_TARGET_POPULATION_M2 = 350;

interface SoilEstablishmentRule {
  match: RegExp;
  basePercent: number;
  label: string;
}

// Ordered — first match wins, so more specific patterns should come first.
const SOIL_ESTABLISHMENT_RULES: SoilEstablishmentRule[] = [
  { match: /clay/i, basePercent: 65, label: "Clay / heavy soils typically establish less reliably (slower to warm, prone to capping)" },
  { match: /chalk|limestone/i, basePercent: 72, label: "Chalk/limestone soils establish reasonably well but can be droughty" },
  { match: /silt/i, basePercent: 75, label: "Silt soils generally give good, even establishment" },
  { match: /peat/i, basePercent: 68, label: "Peat soils can be variable — frost lift and slug risk" },
  { match: /sand/i, basePercent: 70, label: "Sandy/light soils establish quickly but can dry out at the seedbed" },
  { match: /loam/i, basePercent: 78, label: "Medium loam is generally the most reliable establishment soil type" },
];
const DEFAULT_ESTABLISHMENT_PERCENT = 72;
const DEFAULT_SOIL_LABEL = "No soil type recorded for this field — using a general UK arable default";

export function getSoilEstablishmentBase(soilType?: string | null): { percent: number; label: string } {
  if (soilType) {
    for (const rule of SOIL_ESTABLISHMENT_RULES) {
      if (rule.match.test(soilType)) return { percent: rule.basePercent, label: rule.label };
    }
  }
  return { percent: DEFAULT_ESTABLISHMENT_PERCENT, label: DEFAULT_SOIL_LABEL };
}

interface DrillingDateAdjustment {
  delta: number;
  label: string;
}

function getDrillingDateAdjustment(drillingDate?: string | null): DrillingDateAdjustment {
  if (!drillingDate) return { delta: 0, label: "No drilling date set — no seasonal adjustment applied" };
  const d = new Date(drillingDate);
  if (isNaN(d.getTime())) return { delta: 0, label: "No seasonal adjustment applied" };
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  if (month === 9 || (month === 8)) return { delta: 5, label: "Early autumn drilling — good establishment window" };
  if (month === 10 && day <= 15) return { delta: 0, label: "Prime-window autumn drilling" };
  if (month === 10 && day > 15) return { delta: -5, label: "Later October drilling — cooler, shorter growth window" };
  if (month === 11) return { delta: -10, label: "November drilling — reduced establishment expected" };
  if (month === 12) return { delta: -15, label: "December drilling — establishment risk is high" };
  if (month === 1 || month === 2) return { delta: -8, label: "Early spring drilling — cold, often wet seedbeds" };
  if (month === 3 || month === 4) return { delta: 3, label: "Main spring drilling window — usually reliable" };
  return { delta: 0, label: "Outside typical drilling windows — no adjustment applied" };
}

export interface EstablishmentEstimate {
  percent: number;
  soilLabel: string;
  dateLabel: string;
}

export function getEstablishmentPercent(soilType?: string | null, drillingDate?: string | null): EstablishmentEstimate {
  const soil = getSoilEstablishmentBase(soilType);
  const dateAdj = getDrillingDateAdjustment(drillingDate);
  const percent = Math.min(90, Math.max(45, soil.percent + dateAdj.delta));
  return { percent, soilLabel: soil.label, dateLabel: dateAdj.label };
}

export interface SeedRateResult {
  seedsPerM2: number;
  seedRateKgHa: number;
}

export function calculateSeedRate(targetPlantsM2: number, tgwGrams: number, establishmentPercent: number): SeedRateResult | null {
  if (!targetPlantsM2 || !tgwGrams || !establishmentPercent) return null;
  if (targetPlantsM2 <= 0 || tgwGrams <= 0 || establishmentPercent <= 0) return null;
  const seedsPerM2 = targetPlantsM2 / (establishmentPercent / 100);
  const seedRateKgHa = (seedsPerM2 * tgwGrams) / 100;
  return {
    seedsPerM2: Math.round(seedsPerM2 * 10) / 10,
    seedRateKgHa: Math.round(seedRateKgHa * 10) / 10,
  };
}

export function suggestTargetPopulation(blackgrassRiskField: boolean): number {
  return blackgrassRiskField ? BLACKGRASS_TARGET_POPULATION_M2 : STANDARD_TARGET_POPULATION_M2;
}
