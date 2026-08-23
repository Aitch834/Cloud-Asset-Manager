/**
 * Pure guard helpers for the winery vessel register's module/farm-identity gate.
 *
 * Extracting these allows the regression test suite to import and exercise the
 * exact same predicates that the screen uses, so divergence between the test and
 * the real logic is impossible.
 */

/**
 * Returns true only when the module cache has been confirmed for the current
 * farm and the viticulture module is present.
 *
 * `resolvedFarmId` MUST match `currentFarmId` — a stale resolved ID from the
 * previous farm must never allow the new farm's vessel request to fire.
 */
export function computeIsWineryModuleActive(
  resolvedFarmId: string | undefined,
  currentFarmId: string | undefined,
  activeModuleKeys: string[],
): boolean {
  return resolvedFarmId === currentFarmId && activeModuleKeys.includes("viticulture");
}

/**
 * Returns the farmId to pass to useApiFetch.
 * Passes `undefined` (preventing any HTTP request) until the winery module is
 * confirmed active for the current farm.
 */
export function getVesselFetchFarmId(
  isWineryModuleActive: boolean,
  currentFarmId: string | undefined,
): string | undefined {
  return isWineryModuleActive ? currentFarmId : undefined;
}

/**
 * Returns true when the screen should show its full-screen loading spinner
 * instead of the vessel list (or any vessel-count-derived summary UI).
 *
 * `modulesAttempted` must be true when `modulesLoading` has transitioned
 * true→false at least once for the current farm. This distinguishes the
 * pre-effect transition window (not yet attempted — keep spinner) from a
 * completed-but-failed resolution (stop blocking — show the SectionList with
 * its RefreshControl so the user has a retry path).
 *
 * Module mismatch takes absolute precedence over `refreshing` so that:
 *   • Old vessel rows from a previous farm never render during a farm switch.
 *   • A pull-to-refresh in-flight at the moment of a farm switch cannot bypass
 *     the module identity check and surface stale counts or rows.
 *
 * The normal data-loading spinner IS suppressed while RefreshControl is active
 * on the same farm (the RefreshControl provides its own visual affordance).
 */
export function shouldShowVesselLoadingSpinner(params: {
  modulesLoading: boolean;
  /** Has modulesLoading gone true→false at least once for the current farm? */
  modulesAttempted: boolean;
  resolvedFarmId: string | undefined;
  currentFarmId: string | undefined;
  loading: boolean;
  refreshing: boolean;
}): boolean {
  // Always spin while modules are actively loading.
  if (params.modulesLoading) return true;
  // Spin during the pre-effect transition window (loading hasn't started yet).
  if (!params.modulesAttempted) return true;
  // Module resolution has completed (success or failure).
  // Failure: resolvedFarmId didn't match. Show the SectionList so the user has
  // a RefreshControl to retry instead of being stuck on a permanent spinner.
  if (params.resolvedFarmId !== params.currentFarmId) return false;
  // Success: spin only during data loading, suppressed while RefreshControl is active.
  return params.loading && !params.refreshing;
}
