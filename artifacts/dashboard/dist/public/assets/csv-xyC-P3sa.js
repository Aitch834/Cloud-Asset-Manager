const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;
function sanitiseCsvCell(value) {
  const s = value == null ? "" : String(value);
  if (FORMULA_STARTERS.test(s)) {
    return "	" + s;
  }
  return s;
}
function deriveTonnesPerHa(totalKg, areaHa) {
  const kg = Number.parseFloat(String(totalKg ?? ""));
  const ha = Number.parseFloat(String(areaHa ?? ""));
  return Number.isFinite(kg) && kg > 0 && Number.isFinite(ha) && ha > 0 ? kg / 1e3 / ha : null;
}
function quoteCsvCell(value) {
  const s = sanitiseCsvCell(value);
  return `"${s.replace(/"/g, '""')}"`;
}
function buildCsv(rows) {
  const body = rows.map((r) => r.map(quoteCsvCell).join(",")).join("\n");
  return "\uFEFF" + body;
}
function buildViticultureCsvContent(rows, cols, warningRow) {
  const header = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const body = rows.map(
    (r) => cols.map((c) => {
      const raw = c.fmt ? c.fmt(r) : String(r[c.key] ?? "");
      const safe = sanitiseCsvCell(raw);
      return `"${safe.replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\n");
  const prefix = warningRow ? warningRow + "\n" : "";
  return "\uFEFF" + prefix + header + "\n" + body;
}
function buildViticultureUnlinkedWarningText(rows) {
  const n = rows.filter((r) => !r["blockId"]).length;
  if (n === 0) return void 0;
  return `WARNING: ${n} record${n === 1 ? "" : "s"} not linked to a block — block-level totals may be incomplete`;
}
function buildViticultureUnlinkedWarning(rows) {
  const warning = buildViticultureUnlinkedWarningText(rows);
  return warning === void 0 ? void 0 : quoteCsvCell(warning);
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
  buildViticultureUnlinkedWarning as a,
  buildViticultureCsvContent as b,
  deriveTonnesPerHa as c,
  downloadCsvFile as d,
  buildViticultureUnlinkedWarningText as e,
  buildCsv as f,
  sanitiseCsvCell as s
};
