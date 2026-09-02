export const ORGANIC_INSPECTION_CSV_HEADERS = [
  "Date",
  "Certifier",
  "Inspector",
  "Outcome",
  "Cert Ref",
  "Next Due",
  "Non-Conformances",
  "Actions Required",
  "Notes",
] as const;

export interface OrganicInspectionCsvRecord {
  inspectionDate: string;
  certifier: string;
  inspectorName: string | null;
  outcome: string;
  certificateReference: string | null;
  nextDueDate: string | null;
  nonConformances: string | null;
  actions: string | null;
  notes: string | null;
}

function formatCsvDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-GB");
  } catch {
    return value;
  }
}

export function buildOrganicInspectionCsvRows(
  records: OrganicInspectionCsvRecord[],
): unknown[][] {
  return [
    [...ORGANIC_INSPECTION_CSV_HEADERS],
    ...records.map(record => [
      formatCsvDate(record.inspectionDate),
      record.certifier,
      record.inspectorName ?? "",
      record.outcome,
      record.certificateReference ?? "",
      formatCsvDate(record.nextDueDate),
      record.nonConformances ?? "",
      record.actions ?? "",
      record.notes ?? "",
    ]),
  ];
}