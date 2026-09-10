import { escapeHtml } from "./print-report";

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

export const ORGANIC_INSPECTION_PRINT_HEADERS = ORGANIC_INSPECTION_CSV_HEADERS;

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

export function buildOrganicInspectionPrintRows(
  records: OrganicInspectionCsvRecord[],
): string[][] {
  return buildOrganicInspectionCsvRows(records)
    .slice(1)
    .map(row => row.map(value => String(value || "—")));
}

export function buildOrganicInspectionPrintTableHtml(
  records: OrganicInspectionCsvRecord[],
): string {
  const headers = ORGANIC_INSPECTION_PRINT_HEADERS
    .map(header => `<th>${escapeHtml(header)}</th>`)
    .join("");
  const rows = buildOrganicInspectionPrintRows(records)
    .map(row => `<tr>${row.map((value, index) => (
      `<td${index === 0 || index === 5 ? ' style="white-space:nowrap"' : ""}>${escapeHtml(value)}</td>`
    )).join("")}</tr>`)
    .join("");

  return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}