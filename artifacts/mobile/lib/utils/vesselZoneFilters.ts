export type VesselZoneFilterOption = "show-all" | "show-flagged";

export function getVesselZoneFilterOptions(
  hasActiveAlertFlag: boolean,
): VesselZoneFilterOption[] {
  return hasActiveAlertFlag
    ? ["show-all", "show-flagged"]
    : ["show-all"];
}

export function toggleVesselZoneFilter(
  current: string[],
  zone: string,
): string[] {
  return current.includes(zone)
    ? current.filter(selectedZone => selectedZone !== zone)
    : [...current, zone];
}