import { e as escapeHtml, p as printProReport } from "./print-report-ClU8-1P0.js";
const labelFor = (key) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2").replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const valueFor = (value) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value).replace(/_/g, " ");
};
function printRecordReport(options) {
  const rows = Object.entries(options.record).map(([key, value]) => `<tr><td><strong>${escapeHtml(labelFor(key))}</strong></td><td>${escapeHtml(valueFor(value))}</td></tr>`).join("");
  printProReport({
    ...options,
    recordCount: 1,
    recordLabel: "record",
    tableHtml: `<table><tbody>${rows}</tbody></table>`
  });
}
function printRecordsReport({
  title,
  farmName,
  columns,
  records,
  subtitle,
  authority,
  footerNote
}) {
  printProReport({
    title,
    farmName,
    subtitle,
    authority,
    footerNote,
    recordCount: records.length,
    tableHtml: `<table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead><tbody>${records.map((record) => `<tr>${columns.map((column) => `<td>${escapeHtml(valueFor(column.value(record)))}</td>`).join("")}</tr>`).join("")}</tbody></table>`
  });
}
export {
  printRecordReport as a,
  printRecordsReport as p
};
