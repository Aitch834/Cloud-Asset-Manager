import { s as createLucideIcon } from "./index-1TyBJonr.js";
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M8 12h8", key: "1wcyev" }],
  ["path", { d: "M12 8v8", key: "napkw2" }]
];
const CirclePlus = createLucideIcon("circle-plus", __iconNode);
const CROP_PROFILES = {
  "winter wheat": {
    label: "Winter Wheat",
    Kc_ini: 0.3,
    Kc_mid: 1.15,
    Kc_end: 0.25,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 0.5,
    criticalSmdMm: 40,
    typicalYieldTha: 9
  },
  "spring wheat": {
    label: "Spring Wheat",
    Kc_ini: 0.3,
    Kc_mid: 1.15,
    Kc_end: 0.25,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 0.5,
    criticalSmdMm: 35,
    typicalYieldTha: 7.5
  },
  "wheat": {
    label: "Wheat",
    Kc_ini: 0.3,
    Kc_mid: 1.15,
    Kc_end: 0.25,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 0.5,
    criticalSmdMm: 40,
    typicalYieldTha: 9
  },
  "spring barley": {
    label: "Spring Barley",
    Kc_ini: 0.3,
    Kc_mid: 1.15,
    Kc_end: 0.25,
    fracDev: 0.15,
    fracMid: 0.5,
    fracLate: 0.75,
    Ky: 0.45,
    criticalSmdMm: 35,
    typicalYieldTha: 6.5
  },
  "winter barley": {
    label: "Winter Barley",
    Kc_ini: 0.3,
    Kc_mid: 1.15,
    Kc_end: 0.25,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 0.45,
    criticalSmdMm: 40,
    typicalYieldTha: 8
  },
  "barley": {
    label: "Barley",
    Kc_ini: 0.3,
    Kc_mid: 1.15,
    Kc_end: 0.25,
    fracDev: 0.17,
    fracMid: 0.52,
    fracLate: 0.78,
    Ky: 0.45,
    criticalSmdMm: 35,
    typicalYieldTha: 7
  },
  "oats": {
    label: "Oats",
    Kc_ini: 0.3,
    Kc_mid: 1.15,
    Kc_end: 0.25,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 0.45,
    criticalSmdMm: 40,
    typicalYieldTha: 7.5
  },
  "oilseed rape": {
    label: "Oilseed Rape",
    Kc_ini: 0.35,
    Kc_mid: 1.15,
    Kc_end: 0.35,
    fracDev: 0.15,
    fracMid: 0.5,
    fracLate: 0.8,
    Ky: 0.7,
    criticalSmdMm: 40,
    typicalYieldTha: 4
  },
  "osr": {
    label: "Oilseed Rape",
    Kc_ini: 0.35,
    Kc_mid: 1.15,
    Kc_end: 0.35,
    fracDev: 0.15,
    fracMid: 0.5,
    fracLate: 0.8,
    Ky: 0.7,
    criticalSmdMm: 40,
    typicalYieldTha: 4
  },
  "rapeseed": {
    label: "Oilseed Rape",
    Kc_ini: 0.35,
    Kc_mid: 1.15,
    Kc_end: 0.35,
    fracDev: 0.15,
    fracMid: 0.5,
    fracLate: 0.8,
    Ky: 0.7,
    criticalSmdMm: 40,
    typicalYieldTha: 4
  },
  "potatoes": {
    label: "Potatoes",
    Kc_ini: 0.5,
    Kc_mid: 1.15,
    Kc_end: 0.75,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.85,
    Ky: 1.1,
    criticalSmdMm: 25,
    typicalYieldTha: 45
  },
  "potato": {
    label: "Potatoes",
    Kc_ini: 0.5,
    Kc_mid: 1.15,
    Kc_end: 0.75,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.85,
    Ky: 1.1,
    criticalSmdMm: 25,
    typicalYieldTha: 45
  },
  "sugar beet": {
    label: "Sugar Beet",
    Kc_ini: 0.35,
    Kc_mid: 1.2,
    Kc_end: 0.7,
    fracDev: 0.25,
    fracMid: 0.55,
    fracLate: 0.85,
    Ky: 1,
    criticalSmdMm: 35,
    typicalYieldTha: 75
  },
  "maize": {
    label: "Maize / Corn",
    Kc_ini: 0.3,
    Kc_mid: 1.2,
    Kc_end: 0.35,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 1.25,
    criticalSmdMm: 30,
    typicalYieldTha: 12
  },
  "forage maize": {
    label: "Forage Maize",
    Kc_ini: 0.3,
    Kc_mid: 1.2,
    Kc_end: 0.35,
    fracDev: 0.2,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 1.25,
    criticalSmdMm: 30,
    typicalYieldTha: 40
  },
  "field beans": {
    label: "Field Beans",
    Kc_ini: 0.4,
    Kc_mid: 1.15,
    Kc_end: 0.35,
    fracDev: 0.2,
    fracMid: 0.5,
    fracLate: 0.8,
    Ky: 0.7,
    criticalSmdMm: 35,
    typicalYieldTha: 5
  },
  "beans": {
    label: "Beans",
    Kc_ini: 0.4,
    Kc_mid: 1.15,
    Kc_end: 0.35,
    fracDev: 0.2,
    fracMid: 0.5,
    fracLate: 0.8,
    Ky: 0.7,
    criticalSmdMm: 35,
    typicalYieldTha: 5
  },
  "peas": {
    label: "Peas",
    Kc_ini: 0.4,
    Kc_mid: 1.15,
    Kc_end: 1.1,
    fracDev: 0.2,
    fracMid: 0.5,
    fracLate: 0.8,
    Ky: 0.7,
    criticalSmdMm: 30,
    typicalYieldTha: 5
  },
  "vegetables": {
    label: "Vegetables",
    Kc_ini: 0.5,
    Kc_mid: 1.05,
    Kc_end: 0.9,
    fracDev: 0.2,
    fracMid: 0.5,
    fracLate: 0.8,
    Ky: 1,
    criticalSmdMm: 20,
    typicalYieldTha: 40
  },
  "carrots": {
    label: "Carrots",
    Kc_ini: 0.7,
    Kc_mid: 1.05,
    Kc_end: 0.95,
    fracDev: 0.25,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 1,
    criticalSmdMm: 20,
    typicalYieldTha: 50
  },
  "onions": {
    label: "Onions",
    Kc_ini: 0.5,
    Kc_mid: 1.05,
    Kc_end: 0.75,
    fracDev: 0.25,
    fracMid: 0.55,
    fracLate: 0.8,
    Ky: 1.1,
    criticalSmdMm: 20,
    typicalYieldTha: 55
  }
};
const FIELD_CAPACITY_BY_SOIL = {
  // Coarse / light-textured
  "sand": 90,
  "light sandy": 90,
  "sandy": 90,
  "loamy sand": 100,
  // Medium-light
  "sandy loam": 120,
  "light loam": 135,
  "sandy clay loam": 145,
  // Medium
  "medium loam": 150,
  "loam": 150,
  // Medium-fine / silty
  "silty loam": 155,
  "silt loam": 155,
  "silt": 155,
  // Fine
  "clay loam": 160,
  "sandy clay": 160,
  "silty clay loam": 165,
  "silty clay": 170,
  // Heavy
  "heavy clay": 175,
  "clay": 175,
  // Organic
  "peat": 200
};
const DEFAULT_FIELD_CAPACITY_MM = 150;
const SOIL_TYPE_OPTIONS = [
  { value: "sand", label: "Sand", awcMm: 90 },
  { value: "loamy_sand", label: "Loamy Sand", awcMm: 100 },
  { value: "sandy_loam", label: "Sandy Loam", awcMm: 120 },
  { value: "light_loam", label: "Light Loam", awcMm: 135 },
  { value: "sandy_clay_loam", label: "Sandy Clay Loam", awcMm: 145 },
  { value: "medium_loam", label: "Medium Loam", awcMm: 150 },
  { value: "silty_loam", label: "Silty Loam", awcMm: 155 },
  { value: "silt", label: "Silt", awcMm: 155 },
  { value: "clay_loam", label: "Clay Loam", awcMm: 160 },
  { value: "sandy_clay", label: "Sandy Clay", awcMm: 160 },
  { value: "silty_clay_loam", label: "Silty Clay Loam", awcMm: 165 },
  { value: "silty_clay", label: "Silty Clay", awcMm: 170 },
  { value: "clay", label: "Clay", awcMm: 175 },
  { value: "heavy_clay", label: "Heavy Clay", awcMm: 175 },
  { value: "peat", label: "Peat", awcMm: 200 }
];
const UK_MONTHLY_ET0_MM_DAY = [
  0.3,
  // Jan
  0.6,
  // Feb
  1.1,
  // Mar
  1.9,
  // Apr
  2.8,
  // May
  3.4,
  // Jun
  3.5,
  // Jul
  3.1,
  // Aug
  2,
  // Sep
  1.1,
  // Oct
  0.5,
  // Nov
  0.2
  // Dec
];
function matchCropProfile(cropName) {
  if (!cropName) return null;
  const lower = cropName.toLowerCase().trim();
  if (CROP_PROFILES[lower]) return CROP_PROFILES[lower];
  for (const [key, profile] of Object.entries(CROP_PROFILES)) {
    if (lower.includes(key) || key.includes(lower)) return profile;
  }
  return null;
}
function getFieldCapacity(soilType) {
  if (!soilType) return DEFAULT_FIELD_CAPACITY_MM;
  const normalised = soilType.toLowerCase().trim().replace(/_/g, " ");
  if (FIELD_CAPACITY_BY_SOIL[normalised] !== void 0) return FIELD_CAPACITY_BY_SOIL[normalised];
  for (const [key, fc] of Object.entries(FIELD_CAPACITY_BY_SOIL)) {
    if (normalised.includes(key) || key.includes(normalised)) return fc;
  }
  return DEFAULT_FIELD_CAPACITY_MM;
}
export {
  CirclePlus as C,
  DEFAULT_FIELD_CAPACITY_MM as D,
  SOIL_TYPE_OPTIONS as S,
  UK_MONTHLY_ET0_MM_DAY as U,
  getFieldCapacity as g,
  matchCropProfile as m
};
