export type BarrelRetirementRiskRow = {
  status?: unknown;
  maintenance_spend_pence?: unknown;
};

export function isBarrelRetirementRisk(
  row: BarrelRetirementRiskRow,
  retirementThresholdPence: number,
): boolean {
  return String(row.status ?? "active") === "active"
    && Number(row.maintenance_spend_pence ?? 0) > retirementThresholdPence;
}