/**
 * County-filter logic for sector disease alert endpoints.
 *
 * `alertCounties` is a comma-separated list of county names stored in
 * platform_config (e.g. "Kent,Devon,Cornwall").  `farmCounty` comes from
 * farmsTable.county for the requesting farm.
 *
 * Fail-open rules (return true / show alert):
 *   • No counties configured on the alert → national alert, applies everywhere.
 *   • Farm has no county stored yet → cannot exclude; show the alert.
 *
 * Comparisons are case-insensitive and trim whitespace on both sides.
 */
export function alertAppliesForCounty(alertCounties: string, farmCounty: string): boolean {
  const list = alertCounties
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return true;       // no county filter → national, applies everywhere
  if (!farmCounty.trim()) return true;      // farm county unknown → fail-open
  return list.includes(farmCounty.trim().toLowerCase());
}
