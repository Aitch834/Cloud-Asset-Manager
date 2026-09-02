export function shouldShowModuleLoading(params: {
  currentFarmId: string | undefined;
  attemptedFarmId: string | undefined;
  resolvedFarmId: string | undefined;
  modulesLoading: boolean;
}): boolean {
  if (!params.currentFarmId) return false;
  if (params.modulesLoading) return true;
  if (params.resolvedFarmId === params.currentFarmId) return false;

  // A mismatched attemptedFarmId means this render belongs to a newly selected
  // farm whose module request has not started yet. Keep gated content hidden.
  // Once the current farm has been attempted, a remaining resolved mismatch is
  // a completed failure and callers may use their existing offline fallback.
  return params.attemptedFarmId !== params.currentFarmId;
}