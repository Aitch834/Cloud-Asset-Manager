/**
 * Irrigation Advisor — crop data constants
 *
 * Crop coefficients (Kc) from FAO-56 Table 17.
 * Yield response factors (Ky) from AHDB Irrigation Management Guide / FAO-33.
 * Critical SMD thresholds from AHDB Irrigation Guide for England & Wales.
 * Field capacity defaults from standard UK soil science references.
 */

export interface CropProfile {
  label: string;
  /** Kc in initial stage (germination → ~10% ground cover) */
  Kc_ini: number;
  /** Kc at mid-season peak (full canopy) */
  Kc_mid: number;
  /** Kc at late season / ripening */
  Kc_end: number;
  /** Fraction of total season at end of initial stage */
  fracDev: number;
  /** Fraction of total season at end of development (start of mid-season) */
  fracMid: number;
  /** Fraction of total season at end of mid-season (start of late) */
  fracLate: number;
  /** FAO-33 / AHDB yield response factor — higher = more sensitive to water deficit */
  Ky: number;
  /** SMD threshold (mm) at which irrigation should begin — medium loam basis */
  criticalSmdMm: number;
  /** Typical UK farm-scale yield (t/ha) — used for yield loss estimation */
  typicalYieldTha: number;
}

/** Lookup key = lowercase crop name or common abbreviation */
export const CROP_PROFILES: Record<string, CropProfile> = {
  "winter wheat": {
    label: "Winter Wheat", Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.50, criticalSmdMm: 40, typicalYieldTha: 9.0,
  },
  "spring wheat": {
    label: "Spring Wheat", Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.50, criticalSmdMm: 35, typicalYieldTha: 7.5,
  },
  "wheat": {
    label: "Wheat", Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.50, criticalSmdMm: 40, typicalYieldTha: 9.0,
  },
  "spring barley": {
    label: "Spring Barley", Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25,
    fracDev: 0.15, fracMid: 0.50, fracLate: 0.75, Ky: 0.45, criticalSmdMm: 35, typicalYieldTha: 6.5,
  },
  "winter barley": {
    label: "Winter Barley", Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.45, criticalSmdMm: 40, typicalYieldTha: 8.0,
  },
  "barley": {
    label: "Barley", Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25,
    fracDev: 0.17, fracMid: 0.52, fracLate: 0.78, Ky: 0.45, criticalSmdMm: 35, typicalYieldTha: 7.0,
  },
  "oats": {
    label: "Oats", Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.45, criticalSmdMm: 40, typicalYieldTha: 7.5,
  },
  "oilseed rape": {
    label: "Oilseed Rape", Kc_ini: 0.35, Kc_mid: 1.15, Kc_end: 0.35,
    fracDev: 0.15, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 40, typicalYieldTha: 4.0,
  },
  "osr": {
    label: "Oilseed Rape", Kc_ini: 0.35, Kc_mid: 1.15, Kc_end: 0.35,
    fracDev: 0.15, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 40, typicalYieldTha: 4.0,
  },
  "rapeseed": {
    label: "Oilseed Rape", Kc_ini: 0.35, Kc_mid: 1.15, Kc_end: 0.35,
    fracDev: 0.15, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 40, typicalYieldTha: 4.0,
  },
  "potatoes": {
    label: "Potatoes", Kc_ini: 0.50, Kc_mid: 1.15, Kc_end: 0.75,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.85, Ky: 1.10, criticalSmdMm: 25, typicalYieldTha: 45.0,
  },
  "potato": {
    label: "Potatoes", Kc_ini: 0.50, Kc_mid: 1.15, Kc_end: 0.75,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.85, Ky: 1.10, criticalSmdMm: 25, typicalYieldTha: 45.0,
  },
  "sugar beet": {
    label: "Sugar Beet", Kc_ini: 0.35, Kc_mid: 1.20, Kc_end: 0.70,
    fracDev: 0.25, fracMid: 0.55, fracLate: 0.85, Ky: 1.00, criticalSmdMm: 35, typicalYieldTha: 75.0,
  },
  "maize": {
    label: "Maize / Corn", Kc_ini: 0.30, Kc_mid: 1.20, Kc_end: 0.35,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 1.25, criticalSmdMm: 30, typicalYieldTha: 12.0,
  },
  "forage maize": {
    label: "Forage Maize", Kc_ini: 0.30, Kc_mid: 1.20, Kc_end: 0.35,
    fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 1.25, criticalSmdMm: 30, typicalYieldTha: 40.0,
  },
  "field beans": {
    label: "Field Beans", Kc_ini: 0.40, Kc_mid: 1.15, Kc_end: 0.35,
    fracDev: 0.20, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 35, typicalYieldTha: 5.0,
  },
  "beans": {
    label: "Beans", Kc_ini: 0.40, Kc_mid: 1.15, Kc_end: 0.35,
    fracDev: 0.20, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 35, typicalYieldTha: 5.0,
  },
  "peas": {
    label: "Peas", Kc_ini: 0.40, Kc_mid: 1.15, Kc_end: 1.10,
    fracDev: 0.20, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 30, typicalYieldTha: 5.0,
  },
  "vegetables": {
    label: "Vegetables", Kc_ini: 0.50, Kc_mid: 1.05, Kc_end: 0.90,
    fracDev: 0.20, fracMid: 0.50, fracLate: 0.80, Ky: 1.00, criticalSmdMm: 20, typicalYieldTha: 40.0,
  },
  "carrots": {
    label: "Carrots", Kc_ini: 0.70, Kc_mid: 1.05, Kc_end: 0.95,
    fracDev: 0.25, fracMid: 0.55, fracLate: 0.80, Ky: 1.00, criticalSmdMm: 20, typicalYieldTha: 50.0,
  },
  "onions": {
    label: "Onions", Kc_ini: 0.50, Kc_mid: 1.05, Kc_end: 0.75,
    fracDev: 0.25, fracMid: 0.55, fracLate: 0.80, Ky: 1.10, criticalSmdMm: 20, typicalYieldTha: 55.0,
  },
};

/**
 * Available water capacity (AWC, mm) per effective root zone by soil type.
 * Based on AHDB soil texture guide for UK conditions.
 */
export const FIELD_CAPACITY_BY_SOIL: Record<string, number> = {
  "light sandy": 90,
  "sandy": 90,
  "loamy sand": 100,
  "sandy loam": 120,
  "light loam": 135,
  "medium loam": 150,
  "loam": 150,
  "silty loam": 155,
  "silt loam": 155,
  "silt": 155,
  "clay loam": 160,
  "silty clay loam": 165,
  "heavy clay": 175,
  "clay": 175,
  "peat": 200,
};
export const DEFAULT_FIELD_CAPACITY_MM = 150; // medium loam default

/**
 * UK monthly reference ET₀ normals (mm/day) — mean for ~52°N (Midlands).
 * Source: ADAS / Met Office climate normals; used as fallback when no weather station data available.
 */
export const UK_MONTHLY_ET0_MM_DAY: number[] = [
  0.3, // Jan
  0.6, // Feb
  1.1, // Mar
  1.9, // Apr
  2.8, // May
  3.4, // Jun
  3.5, // Jul
  3.1, // Aug
  2.0, // Sep
  1.1, // Oct
  0.5, // Nov
  0.2, // Dec
];

/** Match a free-text crop name to a CropProfile using case-insensitive fuzzy matching */
export function matchCropProfile(cropName: string): CropProfile | null {
  if (!cropName) return null;
  const lower = cropName.toLowerCase().trim();
  if (CROP_PROFILES[lower]) return CROP_PROFILES[lower];
  // Substring containment match
  for (const [key, profile] of Object.entries(CROP_PROFILES)) {
    if (lower.includes(key) || key.includes(lower)) return profile;
  }
  return null;
}

/** Return available water capacity (mm) for a given soil type string */
export function getFieldCapacity(soilType?: string | null): number {
  if (!soilType) return DEFAULT_FIELD_CAPACITY_MM;
  const lower = soilType.toLowerCase().trim();
  for (const [key, fc] of Object.entries(FIELD_CAPACITY_BY_SOIL)) {
    if (lower.includes(key) || key.includes(lower)) return fc;
  }
  return DEFAULT_FIELD_CAPACITY_MM;
}
