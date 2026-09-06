/**
 * Resolve the vintage shown after both the farm preference and that farm's
 * harvest records have loaded.
 *
 * `null` is an explicit "All vintages" preference. `undefined` means no valid
 * preference was restored, so the newest available vintage is selected.
 */
export function resolveHarvestVintage(
  storedVintage: number | null | undefined,
  availableVintages: readonly number[],
): number | null | undefined {
  if (availableVintages.length === 0) return storedVintage;
  if (storedVintage === null) return null;
  if (storedVintage !== undefined && availableVintages.includes(storedVintage)) {
    return storedVintage;
  }
  return availableVintages[0];
}