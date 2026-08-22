/**
 * A detail fetch must not apply after a confirmed milestone mutation has
 * advanced the cache version. This keeps a delayed GET from replacing the
 * server-confirmed detail and offline-cache values with an older snapshot.
 */
export function canApplyMilestoneLoad(
  requestMutationVersion: number,
  currentMutationVersion: number,
): boolean {
  return requestMutationVersion === currentMutationVersion;
}