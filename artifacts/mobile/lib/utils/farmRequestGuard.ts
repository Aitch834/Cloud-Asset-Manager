/**
 * Guard helper for async screen-level requests that must be discarded when the
 * user switches farms before the in-flight fetch completes.
 *
 * Extracted so the race-condition logic can be tested independently of the
 * component's React lifecycle.
 *
 * Usage pattern (inside a useCallback):
 *
 *   const myFarmId = farmId;            // capture at call-site
 *   setLoading(true);
 *   const headers = await getAuthHeaders();
 *   if (!isResponseCurrentForFarm(myFarmId, activeFarmIdRef.current)) return;
 *   const res = await fetch(...);
 *   if (!isResponseCurrentForFarm(myFarmId, activeFarmIdRef.current)) return;
 *   setCases(data.cases);               // safe: still on the same farm
 *
 * The component must keep `activeFarmIdRef.current` in sync with the current
 * farmId by assigning it during the render body (safe for refs):
 *
 *   activeFarmIdRef.current = farmId;
 */

/**
 * Returns true when a response initiated for `capturedFarmId` should still be
 * applied — i.e. the active farm hasn't changed since the request was started.
 */
export function isResponseCurrentForFarm(
  capturedFarmId: string | undefined,
  activeFarmId: string | undefined,
): boolean {
  return capturedFarmId !== undefined && capturedFarmId === activeFarmId;
}
