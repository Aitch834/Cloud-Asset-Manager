import { escapeHtml, printProReport } from "@/lib/print-report";

type ReportValue = string | number | boolean | null | undefined;

type RecordReportOptions = {
  title: string;
  farmName: string | undefined;
  farmAddress?: string;
  contactPhone?: string;
  cphNumber?: string;
  sbiNumber?: string;
  redTractorId?: string;
  record: Record<string, ReportValue>;
  subtitle?: string;
  authority?: string;
  authorityReferenceLabel?: string;
  authorityReference?: string | null;
  authorityReferenceRequired?: boolean;
  footerNote?: string;
};

const labelFor = (key: string) => key
  .replace(/([a-z])([A-Z])/g, "$1 $2")
  .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
  .replace(/([A-Z])/g, " $1")
  .replace(/_/g, " ")
  .replace(/\b\w/g, char => char.toUpperCase());

const valueFor = (value: ReportValue) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value).replace(/_/g, " ");
};

export function printRecordReport(options: RecordReportOptions): void {
  const rows = Object.entries(options.record)
    .map(([key, value]) => `<tr><td><strong>${escapeHtml(labelFor(key))}</strong></td><td>${escapeHtml(valueFor(value))}</td></tr>`)
    .join("");
  printProReport({
    ...options,
    recordCount: 1,
    recordLabel: "record",
    tableHtml: `<table><tbody>${rows}</tbody></table>`,
  });
}

export function printRecordsReport({
  title,
  farmName,
  columns,
  records,
  subtitle,
  authority,
  footerNote,
}: {
  title: string;
  farmName: string | undefined;
  columns: Array<{ label: string; value: (record: Record<string, ReportValue>) => ReportValue }>;
  records: Array<Record<string, ReportValue>>;
  subtitle?: string;
  authority?: string;
  footerNote?: string;
}): void {
  printProReport({
    title,
    farmName,
    subtitle,
    authority,
    footerNote,
    recordCount: records.length,
    tableHtml: `<table><thead><tr>${columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead><tbody>${records.map(record => `<tr>${columns.map(column => `<td>${escapeHtml(valueFor(column.value(record)))}</td>`).join("")}</tr>`).join("")}</tbody></table>`,
  });
}