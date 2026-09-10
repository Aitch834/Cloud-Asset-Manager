export interface FieldStatusExportRecord {
  fieldName: string;
  status: string;
  conversionStartDate?: string | null;
  certificationDate?: string | null;
  certifierRef?: string | null;
  parallelProduction: boolean;
  notes?: string | null;
}

type FieldStatusColumn = {
  header: string;
  csvValue: (record: FieldStatusExportRecord) => string;
  printValue: (record: FieldStatusExportRecord) => string;
};

const STATUS_LABELS: Record<string, string> = {
  certified: "Certified Organic",
  "in-conversion": "In Conversion",
  conventional: "Conventional",
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function csvDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-GB");
  } catch {
    return value;
  }
}

function printDate(value: string | null | undefined): string {
  return value ? csvDate(value) : "—";
}

export const FIELD_STATUS_COLUMNS: readonly FieldStatusColumn[] = [
  { header: "Field Name", csvValue: record => record.fieldName, printValue: record => record.fieldName },
  { header: "Status", csvValue: record => statusLabel(record.status), printValue: record => statusLabel(record.status) },
  { header: "Conversion Start", csvValue: record => csvDate(record.conversionStartDate), printValue: record => printDate(record.conversionStartDate) },
  { header: "Certified From", csvValue: record => csvDate(record.certificationDate), printValue: record => printDate(record.certificationDate) },
  { header: "Certifier Ref", csvValue: record => record.certifierRef ?? "", printValue: record => record.certifierRef || "—" },
  { header: "Parallel Production", csvValue: record => record.parallelProduction ? "Yes" : "No", printValue: record => record.parallelProduction ? "Yes" : "No" },
  { header: "Notes", csvValue: record => record.notes ?? "", printValue: record => record.notes || "—" },
];

export function getFieldStatusHeaders(): string[] {
  return FIELD_STATUS_COLUMNS.map(column => column.header);
}

export function getFieldStatusCsvValues(record: FieldStatusExportRecord): string[] {
  return FIELD_STATUS_COLUMNS.map(column => column.csvValue(record));
}

export function getFieldStatusPrintHeaderHtml(): string {
  return FIELD_STATUS_COLUMNS.map(column => `<th>${column.header}</th>`).join("");
}

export function getFieldStatusPrintCellsHtml(record: FieldStatusExportRecord): string {
  return FIELD_STATUS_COLUMNS.map((column, index) => {
    const style = index === 1
      ? ' style="font-weight:600"'
      : index === 2 || index === 3
        ? ' style="white-space:nowrap"'
        : "";
    return `<td${style}>${column.printValue(record)}</td>`;
  }).join("");
}