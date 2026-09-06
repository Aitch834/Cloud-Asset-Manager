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
function buildViticultureBlockSummaryFooterRow(rows, getBlockAreaHa) {
  const blockMap = {};
  for (const row of rows) {
    const key = String(row.blockId ?? "__unlinked__");
    if (!blockMap[key]) blockMap[key] = [];
    blockMap[key].push(row);
  }
  const avg = (values) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const summaryGroups = Object.entries(blockMap).map(([key, group]) => {
    const totalYieldKg2 = group.reduce(
      (sum, row) => sum + (parseFloat(String(row.yieldKg ?? 0)) || 0),
      0
    );
    const areaHa = key === "__unlinked__" ? null : getBlockAreaHa(key);
    return { totalYieldKg: totalYieldKg2, areaHa };
  });
  const groupsWithArea = summaryGroups.filter((group) => group.areaHa != null && group.areaHa > 0);
  const totalAreaHa = groupsWithArea.reduce((sum, group) => sum + (group.areaHa ?? 0), 0);
  const areaYieldKg = groupsWithArea.reduce((sum, group) => sum + group.totalYieldKg, 0);
  const weightedTha = totalAreaHa > 0 && areaYieldKg > 0 ? areaYieldKg / 1e3 / totalAreaHa : null;
  const totalYieldKg = summaryGroups.reduce((sum, group) => sum + group.totalYieldKg, 0);
  const avgBrix = avg(rows.map((row) => parseFloat(String(row.brix ?? ""))).filter((value) => !isNaN(value)));
  const avgPh = avg(rows.map((row) => parseFloat(String(row.ph ?? ""))).filter((value) => !isNaN(value)));
  const avgTa = avg(rows.map((row) => parseFloat(String(row.titratableAcidityGl ?? ""))).filter((value) => !isNaN(value)));
  const avgPa = avg(rows.map((row) => parseFloat(String(row.potentialAlcohol ?? ""))).filter((value) => !isNaN(value)));
  return [
    "",
    "All blocks",
    "",
    totalAreaHa > 0 ? totalAreaHa.toFixed(2) : "",
    rows.length,
    totalYieldKg > 0 ? totalYieldKg.toFixed(1) : "",
    weightedTha != null ? weightedTha.toFixed(2) : "",
    avgBrix != null ? avgBrix.toFixed(1) : "",
    avgPh != null ? avgPh.toFixed(2) : "",
    avgTa != null ? avgTa.toFixed(2) : "",
    avgPa != null ? avgPa.toFixed(2) : ""
  ];
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
  buildViticultureCsvContent as a,
  buildCsv as b,
  buildViticultureUnlinkedWarning as c,
  downloadCsvFile as d,
  buildViticultureBlockSummaryFooterRow as e,
  deriveTonnesPerHa as f,
  buildViticultureUnlinkedWarningText as g,
  sanitiseCsvCell as s
};
