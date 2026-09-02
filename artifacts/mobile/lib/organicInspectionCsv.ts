export interface OrganicInspectionCsvRecord {
  inspectionDate: string | null | undefined;
  certifier: string | null | undefined;
  inspectorName: string | null | undefined;
  outcome: string | null | undefined;
  certificateReference: string | null | undefined;
  nextDueDate: string | null | undefined;
  nonConformances: string | null | undefined;
  actions: string | null | undefined;
  notes: string | null | undefined;
}

function formatCsvDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;

function quoteCsvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = FORMULA_STARTERS.test(raw) ? `\t${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildOrganicInspectionCsv(records: OrganicInspectionCsvRecord[]): string {
  const rows: unknown[][] = [
    ["Date", "Certifier", "Inspector", "Outcome", "Cert Ref", "Next Due", "Non-Conformances", "Actions Required", "Notes"],
    ...records.map((record) => [
      formatCsvDate(record.inspectionDate),
      record.certifier,
      record.inspectorName,
      record.outcome,
      record.certificateReference,
      formatCsvDate(record.nextDueDate),
      record.nonConformances,
      record.actions,
      record.notes,
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(quoteCsvCell).join(",")).join("\r\n")}`;
}

export function buildOrganicInspectionCsvFilename(farmName: string): string {
  const safeName = farmName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `inspections-${safeName || "farm"}-${date}.csv`;
}