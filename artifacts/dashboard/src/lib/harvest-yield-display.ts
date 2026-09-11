export const YIELD_BY_VARIETY_YIELD_HEADER = "Yield (t/ha)";

export function formatYieldTonnesPerHectare(
  totalKg: number,
  areaHa: number | null,
): string {
  if (areaHa == null || areaHa <= 0 || totalKg <= 0) return "—";
  return (totalKg / areaHa / 1000).toFixed(2);
}