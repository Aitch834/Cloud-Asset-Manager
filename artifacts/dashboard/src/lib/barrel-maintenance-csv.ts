export type BarrelMaintenanceCsvColumn = {
  key: string;
  label: string;
  fmt: (record: Record<string, unknown>) => string;
};

function formatDate(value: unknown): string {
  if (!value) return "—";
  return new Date(String(value)).toLocaleDateString("en-GB");
}

export const BARREL_MAINTENANCE_CSV_COLUMNS: BarrelMaintenanceCsvColumn[] = [
  { key: "maintenance_date", label: "Date", fmt: record => formatDate(record.maintenance_date) },
  { key: "work_type", label: "Work Type", fmt: record => String(record.work_type ?? "—") },
  { key: "cooperage_name", label: "Cooperage", fmt: record => String(record.cooperage_name ?? "—") },
  { key: "cost_pence", label: "Cost (£)", fmt: record => record.cost_pence != null ? `£${(Number(record.cost_pence) / 100).toFixed(2)}` : "—" },
  { key: "operator_name", label: "Operator", fmt: record => String(record.operator_name ?? "—") },
  { key: "notes", label: "Notes", fmt: record => String(record.notes ?? "") },
];

export function barrelMaintenanceCsvFilename(vessel: Record<string, unknown>): string {
  const vesselRef = String(vessel.vessel_ref ?? "").trim().replace(/[^a-zA-Z0-9._-]+/g, "-") || String(vessel.id);
  return `barrel-maintenance-${vesselRef}.csv`;
}