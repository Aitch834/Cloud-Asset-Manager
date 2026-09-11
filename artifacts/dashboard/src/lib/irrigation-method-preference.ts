export const DEFAULT_IRRIGATION_METHOD = "Overhead sprinkler";

export function irrigationMethodPreferenceKey(farmId: number): string {
  return `irrigation-advisor-method-${farmId}`;
}

export function loadIrrigationMethodPreference(farmId: number): string {
  try {
    return localStorage.getItem(irrigationMethodPreferenceKey(farmId)) ?? DEFAULT_IRRIGATION_METHOD;
  } catch {
    return DEFAULT_IRRIGATION_METHOD;
  }
}

export function saveIrrigationMethodPreference(farmId: number, method: string): void {
  try {
    localStorage.setItem(irrigationMethodPreferenceKey(farmId), method);
  } catch {
    // Storage may be unavailable; the current form value remains usable.
  }
}