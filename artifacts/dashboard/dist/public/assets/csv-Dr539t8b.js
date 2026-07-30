const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;
function sanitiseCsvCell(value) {
  const s = value == null ? "" : String(value);
  if (FORMULA_STARTERS.test(s)) {
    return "	" + s;
  }
  return s;
}
function quoteCsvCell(value) {
  const s = sanitiseCsvCell(value);
  return `"${s.replace(/"/g, '""')}"`;
}
function buildCsv(rows) {
  const body = rows.map((r) => r.map(quoteCsvCell).join(",")).join("\n");
  return "\uFEFF" + body;
}
function downloadCsvFile(filename, rows) {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
export {
  downloadCsvFile as d,
  sanitiseCsvCell as s
};
