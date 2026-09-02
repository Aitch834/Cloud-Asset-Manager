/**
 * Cache reads can finish after the active farm changes. Only the cache read
 * belonging to the latest load may update screen state.
 */
export function canApplyAgriEnvCacheLoad(
  loadGeneration: number,
  currentGeneration: number,
): boolean {
  return loadGeneration === currentGeneration;
}