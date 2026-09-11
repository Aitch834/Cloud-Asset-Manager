const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-BVdyS7jm.js","assets/index-szmq1rP5.js","assets/index-CupIDv-c.css","assets/typeof-WJl3ipnu.js","assets/browser-BlOK38Vy.js"])))=>i.map(i=>d[i]);
import { m as useQuery, r as reactExports, j as jsxRuntimeExports, d as Button, c as useQueryClient, a as useToast, S as useMutation, _ as __vitePreload } from "./index-szmq1rP5.js";
import { a as buildViticultureCsvContent } from "./csv-Bp-zopWX.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { C as ConfirmDialog } from "./confirm-dialog-ByM1xUZi.js";
import { C as ChevronUp } from "./chevron-up-CE28dUNB.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-B11NM-E9.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-Du6W-NJV.js";
import { E as Eye } from "./eye-vPP-_Gsa.js";
import { P as Pencil } from "./pencil-Bl18gI3V.js";
import { T as TriangleAlert } from "./triangle-alert-CTopba6O.js";
import { c as ClipboardList } from "./AppLayout-B_c4q11G.js";
const YIELD_CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#84cc16"
];
function buildVarietyColorMap(varieties) {
  const unique = [...new Set([...varieties].map((v) => v.trim()).filter(Boolean))];
  unique.sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base" }));
  const map = {};
  unique.forEach((v, i) => {
    map[v] = YIELD_CHART_COLORS[i % YIELD_CHART_COLORS.length];
  });
  return map;
}
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToHex(h, s, l) {
  const sl = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * sl;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = ll - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function buildUniqueBlockColorMap(blockNames, blockVarietyByName, varietyColorMap) {
  const varietyBlockList = {};
  for (const bname of blockNames) {
    const v = (blockVarietyByName[bname] ?? "").trim();
    const key = v || "__unlinked__";
    if (!varietyBlockList[key]) varietyBlockList[key] = [];
    varietyBlockList[key].push(bname);
  }
  const usedColors = new Set(Object.values(varietyColorMap));
  const fallbackPalette = YIELD_CHART_COLORS.filter((c) => !usedColors.has(c));
  let fbIdx = 0;
  const map = {};
  for (const [varietyKey, blocksInGroup] of Object.entries(varietyBlockList)) {
    const isUnlinked = varietyKey === "__unlinked__";
    const n = blocksInGroup.length;
    if (isUnlinked) {
      for (const bname of blocksInGroup) {
        map[bname] = fallbackPalette[fbIdx++ % (fallbackPalette.length || YIELD_CHART_COLORS.length)] ?? YIELD_CHART_COLORS[0];
      }
      continue;
    }
    const baseHex = varietyColorMap[varietyKey] ?? YIELD_CHART_COLORS[0];
    if (n === 1) {
      map[blocksInGroup[0]] = baseHex;
      continue;
    }
    const { h, s, l } = hexToHsl(baseHex);
    blocksInGroup.forEach((bname, idx) => {
      const t = n === 1 ? 0.5 : idx / (n - 1);
      const lShift = (t - 0.5) * 24;
      const newL = Math.max(28, Math.min(76, l + lShift));
      const sShift = (t - 0.5) * -8;
      const newS = Math.max(45, Math.min(95, s + sShift));
      map[bname] = hslToHex(h, newS, newL);
    });
  }
  return map;
}
function getTopHarvestBlockKey(rows) {
  return rows.filter(
    (row) => typeof row.blockId === "number" && Number.isFinite(row.blockId) && row.blockId > 0 && row.totalKg > 0
  ).slice().sort((a, b) => {
    const yieldDifference = b.totalKg - a.totalKg;
    return yieldDifference !== 0 ? yieldDifference : a.label.localeCompare(b.label);
  })[0]?.key ?? null;
}
function resolveVineRegisterFsaRef(farmMeta, fallbackFsaVineRef = "") {
  return String(farmMeta?.fsaVineRegisterRef ?? "").trim() || fallbackFsaVineRef.trim();
}
function getVineRegisterMissingHeaderFields(farmMeta, fallbackFsaVineRef = "") {
  const value = (field) => String(farmMeta?.[field] ?? "").trim();
  const fsaVineRegisterRef = resolveVineRegisterFsaRef(
    farmMeta,
    fallbackFsaVineRef
  );
  return [
    !value("address") ? "Farm Address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !value("fsaWineProductionRef") ? "FSA Wine Production Ref" : "",
    !value("appaRef") ? "APPA Ref" : "",
    !value("winegbMembershipNumber") ? "WineGB Membership No" : ""
  ].filter(Boolean);
}
const CHEMISTRY_CROSS_TAB_OUTLIER_CELL_STYLE = ";background:#fef3c7;color:#92400e;font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact";
const CHEMISTRY_CROSS_TAB_OUTLIER_LEGEND = "&#9888; Amber cell = TA or Pot. Alc. vintage average deviates more than 1 standard deviation from the block&rsquo;s all-vintage average";
function isChemistryCrossVintageOutlierMetric(metricLabel) {
  return metricLabel === "Avg TA (g/L)" || metricLabel === "Avg Pot. Alc %";
}
function buildChemistryCrossVintageStats(vintageAverages) {
  if (vintageAverages.length < 2) return null;
  const mean = vintageAverages.reduce((sum, value) => sum + value, 0) / vintageAverages.length;
  const sd = Math.sqrt(
    vintageAverages.reduce((sum, value) => sum + (value - mean) ** 2, 0) / vintageAverages.length
  );
  return { mean, sd };
}
function isChemistryCrossVintageOutlier(value, stats) {
  return value != null && stats != null && stats.sd > 0 && Math.abs(value - stats.mean) > stats.sd;
}
function useFarmMeta(farmId) {
  const { data, isLoading } = useQuery({
    queryKey: ["farm-meta", farmId],
    queryFn: async () => {
      const r = await fetch(apiUrl(`farms/${farmId}`), { credentials: "include" });
      if (!r.ok) return null;
      const d = await r.json();
      return d.record ?? d;
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1e3
  });
  return { farmRecord: data ?? null, isLoading };
}
function FarmSettingsWarning({
  missingFields,
  settingsSection,
  onNavigate,
  targetId,
  fieldTargetIds
}) {
  if (missingFields.length === 0) return null;
  const fieldList = missingFields.join(", ");
  const handleClick = () => {
    onNavigate();
    const effectiveTargetId = fieldTargetIds ? missingFields.reduce((found, f) => found ?? fieldTargetIds[f], void 0) : targetId;
    if (effectiveTargetId) {
      setTimeout(() => {
        document.getElementById(effectiveTargetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0 text-amber-500" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Farm Settings incomplete:" }),
      " ",
      fieldList,
      " ",
      missingFields.length === 1 ? "is" : "are",
      " not set — your printed report will have blank header fields.",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "underline underline-offset-2 hover:text-amber-900 font-medium",
          onClick: handleClick,
          children: [
            "Add in Farm Settings → ",
            settingsSection
          ]
        }
      )
    ] })
  ] });
}
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
const fmtNum = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
function exportCSV(rows, filename, cols, warningRow) {
  if (!rows.length) return;
  const content = buildViticultureCsvContent(rows, cols, warningRow);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function printExciseReturn(record, farmName, licenceNo, farmMeta, ratesLastUpdated) {
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const n = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const esc = (v) => v == null || v === "" ? "" : String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const spr = !!record.smallProducerRelief;
  const dutiableL = (parseFloat(String(record.totalLitresRemovedUK ?? 0)) || 0) + (parseFloat(String(record.totalLitresDomesticConsumption ?? 0)) || 0) + (parseFloat(String(record.totalLitresTastings ?? 0)) || 0);
  const addressRaw = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const addressHtml = addressRaw ? esc(addressRaw) : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const vatNumber = farmMeta?.vatNumber ? esc(farmMeta.vatNumber) : "";
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRefHtml = appaRef ? `APPA Ref: <strong>${esc(appaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const fsaWineRefHtml = fsaWineProductionRef ? `FSA Wine Production Ref: <strong>${esc(fsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const winegbMembershipNumber = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const winegbRefHtml = winegbMembershipNumber ? `WineGB Membership No: <strong>${esc(winegbMembershipNumber)}</strong>` : `<span class="fsa-missing">&#9888; WineGB Membership No not set</span>`;
  const anyMissingRef = !addressRaw || !appaRef || !fsaWineProductionRef || !winegbMembershipNumber;
  const missingRefWarningBlock = anyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing header information</strong> &mdash;
        the field(s) marked below (${[
    !addressRaw ? "Farm Address" : "",
    !appaRef ? "APPA Ref" : "",
    !fsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !winegbMembershipNumber ? "WineGB Membership No" : ""
  ].filter(Boolean).join(", ")}) have not been set in Farm Settings.
        Add them before submitting this return.
      </div>` : "";
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>HMRC Alcohol Duty Return — ${esc(farmName)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; margin: 40px; }
    h1 { font-size: 18px; margin-bottom: 2px; }
    h2 { font-size: 13px; font-weight: 700; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 18px 0 8px; color: #333; text-transform: uppercase; letter-spacing: 0.04em; page-break-after: avoid; break-after: avoid; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 20px; }
    .meta { font-size: 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    td { padding: 5px 8px; border: 1px solid #ddd; }
    td:first-child { font-weight: 500; width: 58%; background: #f7f7f7; }
    td:last-child { text-align: right; }
    .total-row td { font-weight: 700; background: #eef2ff; border-color: #a5b4fc; }
    .duty-row td { font-weight: 700; background: #1e3a5f; color: #fff; border-color: #1e3a5f; font-size: 14px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-spr { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .badge-std { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .missing-refs-notice { background: #fffbeb; border: 1px solid #fbbf24; color: #92400e; border-radius: 4px; padding: 7px 12px; font-size: 12px; margin-bottom: 16px; }
    .notice { background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 16px; }
    .footer { margin-top: 28px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
    @media print {
      body { margin: 20px; }
      button { display: none; }
      .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .missing-refs-notice { background: #fffbeb !important; border: 1px solid #fbbf24 !important; color: #92400e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style></head><body>
  <div class="header">
    <div>
      <h1>HMRC Alcohol Duty Return</h1>
      <div class="meta">
        <strong>${esc(farmName)}</strong>${licenceNo ? ` &nbsp;&middot;&nbsp; Winery Licence: ${esc(licenceNo)}` : ""}<br>
        ${addressHtml}<br>
        ${vatNumber ? `VAT Reg No: ${vatNumber}<br>` : ""}
        ${appaRefHtml}<br>
        ${fsaWineRefHtml}<br>
        ${winegbRefHtml}<br>
        Return Period: <strong>${d(record.periodStart)} &ndash; ${d(record.periodEnd)}</strong>
      </div>
    </div>
    <div style="text-align:right">
      <div class="meta">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</div>
      ${record.hmrcReturnRef ? `<div class="meta" style="margin-top:4px">HMRC Ref: <strong>${String(record.hmrcReturnRef)}</strong></div>` : ""}
      <div class="meta" style="margin-top:6px;font-size:13px">Status: <strong>${String(record.status ?? "draft").toUpperCase()}</strong></div>
    </div>
  </div>

  ${missingRefWarningBlock}

  <div class="notice">
    <strong>How to submit:</strong> Log in to your HMRC Business Tax Account at
    <strong>https://www.tax.service.gov.uk/alcohol-duty</strong> and enter the figures below.
    Excise Notice 163 applies. Payment is due by the last working day of the month following the return period.
  </div>

  <h2>Section 1 &mdash; Stock Account (litres)</h2>
  <table>
    <tr><td>Opening Stock (start of period)</td><td>${n(record.openingStockL)} L</td></tr>
    <tr><td>Add: Total Produced This Period</td><td>+ ${n(record.totalLitresProduced)} L</td></tr>
    <tr><td>Less: Removed to UK Market <em>(dutiable on removal)</em></td><td>&minus; ${n(record.totalLitresRemovedUK)} L</td></tr>
    <tr><td>Less: Exported <em>(duty-suspended &mdash; not included in duty)</em></td><td>&minus; ${n(record.totalLitresExported)} L</td></tr>
    <tr><td>Less: Domestic Consumption <em>(grower&rsquo;s own use &mdash; dutiable)</em></td><td>&minus; ${n(record.totalLitresDomesticConsumption)} L</td></tr>
    <tr><td>Less: Tastings / Samples <em>(all tasting volumes are dutiable)</em></td><td>&minus; ${n(record.totalLitresTastings)} L</td></tr>
    <tr class="total-row"><td>= Closing Stock (end of period)</td><td>${n(record.closingStockL)} L</td></tr>
  </table>

  <h2>Section 2 &mdash; Duty Calculation (HMRC August 2023 Rates)</h2>
  <table>
    <tr><td>Wine Type &amp; ABV</td><td>${n(record.nominalAbvPct, 2)}% ABV &mdash; Still wine</td></tr>
    <tr><td>Rolling 12-Month Production</td><td>${record.annualProductionL ? `${n(record.annualProductionL, 0)} L &nbsp;(${(parseFloat(String(record.annualProductionL ?? 0)) / 100).toFixed(1)} hl)` : "&mdash;"}</td></tr>
    <tr><td>Small Producer Relief (SPR)</td><td>${spr ? '<span class="badge badge-spr">&#10003; SPR Claimed &mdash; Reduced Rate</span>' : '<span class="badge badge-std">Not Claimed &mdash; Standard Rate</span>'}</td></tr>
    <tr><td>Dutiable Litres <em>(UK removals + domestic + tastings)</em></td><td><strong>${dutiableL.toFixed(1)} L</strong></td></tr>
    <tr><td>Effective Duty Rate</td><td>&pound;${n(record.dutyRatePer100L, 2)} per 100 L</td></tr>
    <tr><td>Duty Rates Reviewed</td><td>${ratesLastUpdated ? new Date(ratesLastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "HMRC August 2023"}</td></tr>
    <tr class="duty-row"><td>TOTAL ALCOHOL DUTY PAYABLE</td><td>&pound;${n(record.totalDutyPayable, 2)}</td></tr>
  </table>

  <h2>Section 3 &mdash; Filing Dates</h2>
  <table>
    <tr><td>Submitted to HMRC</td><td>${d(record.submittedDate)}</td></tr>
    <tr><td>Duty Paid</td><td>${d(record.paidDate)}</td></tr>
  </table>

  ${record.notes ? `<h2>Notes</h2><p style="font-size:12px;color:#444;margin:0">${String(record.notes)}</p>` : ""}

  <div class="footer">
    Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Excise Notice 163 &nbsp;&middot;&nbsp;
    Submit: https://www.tax.service.gov.uk/alcohol-duty &nbsp;&middot;&nbsp;
    SPR threshold: 4,500 hl / year &nbsp;&middot;&nbsp; Standard still wine rate (8.5&ndash;22% ABV): &pound;28.50/LPA
  </div>
  </body></html>`;
  const win = window.open("", "_blank", "width=820,height=1060");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
function printOrganicWineRecords(records, farmName, farmMeta) {
  const esc = (v) => v == null || v === "" ? "" : String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const n = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const address = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const addressHtml = address ? esc(address) : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const vintages = [...new Set(records.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse().join(", ");
  const fsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const winegbMembershipNumber = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const fsaVineRefHtml = fsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${esc(fsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const fsaWineRefHtml = fsaWineProductionRef ? `FSA Wine Production Ref: <strong>${esc(fsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const appaRefHtml = appaRef ? `APPA Ref: <strong>${esc(appaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const winegbHtml = winegbMembershipNumber ? `WineGB Membership No: <strong>${esc(winegbMembershipNumber)}</strong><br>` : ``;
  const anyMissingRef = !address || !fsaVineRegisterRef || !fsaWineProductionRef || !appaRef || !winegbMembershipNumber;
  const missingRefWarningBlock = anyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing header information</strong> &mdash;
        the field(s) marked below (${[
    !address ? "Farm Address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !fsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !appaRef ? "APPA Ref" : "",
    !winegbMembershipNumber ? "WineGB Membership No" : ""
  ].filter(Boolean).join(", ")}) have not been set in Farm Settings.
        Add them before submitting this register to your certifying body.
      </div>` : "";
  const rows = records.map((r) => `
    <tr>
      <td>${String(r.vintageYear ?? "—")}</td>
      <td>${String(r.wineColour ?? "—")}</td>
      <td style="text-align:right">${r.volumeLitres ? `${n(r.volumeLitres, 0)} L` : "—"}</td>
      <td style="text-align:center">${r.certifiedOrganic === 1 || r.certifiedOrganic === "1" ? "&#10003; Yes" : "No"}</td>
      <td>${String(r.certifierRef ?? "—")}</td>
      <td>${String(r.additiveName ?? "—")}</td>
      <td>${String(r.additiveType ?? "—")}</td>
      <td>${r.quantityUsed ? `${String(r.quantityUsed)} ${String(r.quantityUnit ?? "")}`.trim() : "—"}</td>
      <td style="text-align:right">${r.actualSO2MgL ? `${n(r.actualSO2MgL, 0)}` : "—"}</td>
      <td style="text-align:right">${r.maxSO2MgL ? `${n(r.maxSO2MgL, 0)}` : "—"}</td>
      <td style="text-align:center;${r.so2Compliant === 1 || r.so2Compliant === "1" ? "color:#065f46;font-weight:600" : "color:#991b1b;font-weight:600"}">${r.so2Compliant === 1 || r.so2Compliant === "1" ? "&#10003; Compliant" : "&#10007; Exceeds"}</td>
    </tr>
  `).join("");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Organic Wine Production Register &mdash; ${esc(farmName)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; color: #111; margin: 32px; }
    h1 { font-size: 17px; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #555; margin-bottom: 14px; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    h2 { page-break-after: avoid; break-after: avoid; }
    th { background: #3b1a6b; color: white; padding: 6px 5px; text-align: left; white-space: nowrap; }
    td { padding: 5px 5px; border: 1px solid #ddd; vertical-align: top; }
    tr:nth-child(even) td { background: #f9f7ff; }
    .notice { background: #f5f3ff; border: 1px solid #c4b5fd; padding: 8px 12px; border-radius: 4px; font-size: 11.5px; margin-bottom: 14px; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .missing-refs-notice { background: #fffbeb; border: 1px solid #fbbf24; color: #92400e; border-radius: 4px; padding: 7px 12px; font-size: 11px; margin-bottom: 14px; }
    .footer { margin-top: 20px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
    @media print {
      body { margin: 15px; }
      .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .missing-refs-notice { background: #fffbeb !important; border: 1px solid #fbbf24 !important; color: #92400e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style></head><body>
  <h1>Organic Wine Production Register</h1>
  <div class="meta">
    <strong>${esc(farmName)}</strong> &nbsp;&middot;&nbsp; ${addressHtml}<br>
    ${fsaVineRefHtml}<br>
    ${fsaWineRefHtml}<br>
    ${appaRefHtml}<br>
    ${winegbHtml}Vintages: ${vintages || "All"} &nbsp;&middot;&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record(s)
  </div>
  ${missingRefWarningBlock}
  <div class="notice">
    <strong>SO&#8322; limits for organic wine (UK-retained Reg 203/2012):</strong>
    Red wine &mdash; 100 mg/L total SO&#8322;. White &amp; ros&eacute; &mdash; 150 mg/L.
    These limits are lower than for conventional wine.
    This register supports organic certification audits and is required evidence for your certifying body.
  </div>
  <table>
    <thead>
      <tr>
        <th>Vintage</th><th>Colour</th><th>Volume</th><th>Organic</th><th>Certifier Ref</th>
        <th>Additive</th><th>Type</th><th>Quantity</th><th>SO&#8322; Actual (mg/L)</th><th>SO&#8322; Max (mg/L)</th><th>SO&#8322; Status</th>
      </tr>
    </thead>
    <tbody>${rows || "<tr><td colspan='11' style='text-align:center;color:#888'>No records</td></tr>"}</tbody>
  </table>
  <div class="footer">
    Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; UK-retained EU Reg 203/2012 &nbsp;&middot;&nbsp; Retain for certification audit purposes
  </div>
  </body></html>`;
  const win = window.open("", "_blank", "width=1100,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
function printRpaReference(blocks, farmName, farmMeta) {
  const esc = (v) => v == null || v === "" ? "" : String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const n = (v, dp = 2) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const sbi = (farmMeta?.sbiNumber ? String(farmMeta.sbiNumber) : "").trim();
  const address = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const printed = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const sbiHtml = sbi ? `SBI Number: <strong>${esc(sbi)}</strong>` : `<span class="fsa-missing">&#9888; SBI Number not set</span>`;
  const addressHtml = address ? esc(address) : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const totalHa = blocks.reduce((sum, b) => sum + (parseFloat(String(b.areaHa ?? 0)) || 0), 0);
  const missingRefBlocks = blocks.filter((b) => !b.fieldParcelRef || String(b.fieldParcelRef).trim() === "");
  const rows = blocks.map((b) => {
    const missing = !b.fieldParcelRef || String(b.fieldParcelRef).trim() === "";
    return `
    <tr${missing ? ' class="missing-ref-row"' : ""}>
      <td>${esc(b.blockName)}</td>
      <td>${missing ? `<span class="missing-ref-cell">&#9888; Not set</span>` : esc(b.fieldParcelRef)}</td>
      <td>${esc(b.variety ?? "")}</td>
      <td style="text-align:right">${n(b.areaHa)} ha</td>
      <td>${esc(b.plantingYear ?? "")}</td>
      <td>${esc(b.rootstock ?? "")}</td>
      <td>${esc(sbi)}</td>
    </tr>`;
  }).join("");
  const missingRefWarning = missingRefBlocks.length > 0 ? `<div class="missing-ref-notice">
        <strong>&#9888; ${missingRefBlocks.length} block${missingRefBlocks.length === 1 ? "" : "s"} missing Parcel / Field Ref:</strong>
        ${missingRefBlocks.map((b) => esc(b.blockName)).join(", ")} &mdash;
        add these in the Vineyard Blocks section before submitting to the Rural Payments portal.
      </div>` : "";
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>RPA Rural Payments — Vineyard Block Reference &mdash; ${esc(farmName)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; margin: 40px; }
    h1 { font-size: 17px; margin-bottom: 2px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 20px; }
    .meta { font-size: 12px; color: #555; line-height: 1.8; }
    .notice { background: #fffbeb; border: 2px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 13px; font-weight: 700; color: #78350f; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    h2 { page-break-after: avoid; break-after: avoid; }
    th { background: #166534; color: white; padding: 7px 8px; text-align: left; font-size: 12px; white-space: nowrap; }
    th:last-child { text-align: center; }
    td { padding: 6px 8px; border: 1px solid #d1d5db; font-size: 12px; vertical-align: middle; }
    td:nth-child(4) { text-align: right; }
    td:nth-child(7) { text-align: center; font-size: 11px; color: #555; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .totals-row td { font-weight: 700; background: #dcfce7; border-color: #86efac; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .missing-ref-row td { background: #fffbeb !important; }
    .missing-ref-cell { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .missing-ref-notice { background: #fffbeb; border: 1px solid #fbbf24; color: #92400e; border-radius: 4px; padding: 8px 12px; font-size: 12px; margin-bottom: 14px; }
    .footer { margin-top: 24px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
    @media print {
      body { margin: 20px; }
      .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .notice { background: #fffbeb !important; border-color: #f59e0b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .missing-ref-cell { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .missing-ref-notice { background: #fffbeb !important; border: 1px solid #fbbf24 !important; color: #92400e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr:nth-child(even) td { background: #f0fdf4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr.missing-ref-row td { background: #fffbeb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .totals-row td { background: #dcfce7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th { background: #166534 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style></head><body>
  <div class="header">
    <div>
      <h1>RPA Rural Payments &mdash; Vineyard Block Reference</h1>
      <div class="meta">
        <strong>${esc(farmName)}</strong><br>
        ${addressHtml}<br>
        ${sbiHtml}
      </div>
    </div>
    <div style="text-align:right">
      <div class="meta">Printed: <strong>${printed}</strong></div>
      <div class="meta" style="margin-top:4px">${blocks.length} block${blocks.length === 1 ? "" : "s"} &nbsp;&middot;&nbsp; ${totalHa.toFixed(2)} ha total</div>
    </div>
  </div>

  <div class="notice">
    &#9888;&nbsp; For manual reference only &mdash; not a direct RPA submission.
    Use this sheet when entering data into the Rural Payments portal at
    ruralpayments.service.gov.uk
  </div>

  ${missingRefWarning}

  <table>
    <thead>
      <tr>
        <th>Block Name</th>
        <th>Parcel / Field Ref</th>
        <th>Variety</th>
        <th style="text-align:right">Area (ha)</th>
        <th>Planting Year</th>
        <th>Rootstock</th>
        <th style="text-align:center">SBI Number</th>
      </tr>
    </thead>
    <tbody>
      ${rows || "<tr><td colspan='7' style='text-align:center;color:#888'>No blocks</td></tr>"}
    </tbody>
    <tfoot>
      <tr class="totals-row">
        <td colspan="3">Total</td>
        <td style="text-align:right">${totalHa.toFixed(2)} ha</td>
        <td colspan="3"></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    Prepared by BDE Farm Trac &nbsp;&middot;&nbsp;
    For manual reference when entering data into the Rural Payments portal (ruralpayments.service.gov.uk).
    This document is not a direct RPA submission and carries no legal weight.
    Always verify block data against your official Rural Payments records.
  </div>
  </body></html>`;
  const win = window.open("", "_blank", "width=900,height=800");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
const MAILTO_BODY_LIMIT = 1800;
function buildRpaMailtoHref(blocks, farmName, farmMeta) {
  const sbi = (farmMeta?.sbiNumber ? String(farmMeta.sbiNumber) : "").trim();
  const address = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const printed = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const totalHa = blocks.reduce((sum, b) => sum + (parseFloat(String(b.areaHa ?? 0)) || 0), 0);
  const col = (v, width) => {
    const s = v == null || v === "" ? "—" : String(v);
    return s.padEnd(width);
  };
  const headerLine = [
    col("Block Name", 20),
    col("Parcel / Field Ref", 34),
    col("Variety", 22),
    col("Area (ha)", 10),
    col("Year", 6),
    col("Rootstock", 18),
    col("SBI", 14)
  ].join("  ");
  const separator = "-".repeat(headerLine.length);
  const missingRefBlocks = blocks.filter((b) => !b.fieldParcelRef || String(b.fieldParcelRef).trim() === "");
  const PARCEL_REF_MISSING = "(NOT SET — add before RPA entry)";
  const dataLines = blocks.map((b) => {
    const parcelRef = !b.fieldParcelRef || String(b.fieldParcelRef).trim() === "" ? PARCEL_REF_MISSING : String(b.fieldParcelRef);
    return [
      col(b.blockName, 20),
      col(parcelRef, 34),
      col(b.variety ?? "", 22),
      col(parseFloat(String(b.areaHa ?? 0)).toFixed(2), 10),
      col(b.plantingYear ?? "", 6),
      col(b.rootstock ?? "", 18),
      col(sbi, 14)
    ].join("  ");
  });
  const totalLine = [
    col("TOTAL", 20),
    col("", 34),
    col("", 22),
    col(totalHa.toFixed(2) + " ha", 10),
    col("", 6),
    col("", 18),
    col("", 14)
  ].join("  ");
  const body = [
    `RPA Rural Payments — Vineyard Block Reference`,
    ``,
    `Farm: ${farmName}`,
    ...address ? [`Address: ${address}`] : [],
    ...sbi ? [`SBI Number: ${sbi}`] : [`SBI Number: (not set — add in Farm Settings)`],
    `Date: ${printed}`,
    `Blocks: ${blocks.length}   Total area: ${totalHa.toFixed(2)} ha`,
    ...missingRefBlocks.length > 0 ? [
      ``,
      `⚠ ${missingRefBlocks.length} block${missingRefBlocks.length === 1 ? "" : "s"} missing Parcel / Field Ref: ${missingRefBlocks.map((b) => String(b.blockName ?? "")).join(", ")}`,
      `  Add these in the Vineyard Blocks section before submitting to the Rural Payments portal.`
    ] : [],
    ``,
    `NOTE: For manual reference only — not a direct RPA submission.`,
    `Use this data when entering information into the Rural Payments portal at`,
    `ruralpayments.service.gov.uk`,
    ``,
    separator,
    headerLine,
    separator,
    ...dataLines,
    separator,
    totalLine,
    separator,
    ``,
    `Prepared by BDE Farm Trac. Always verify against your official Rural Payments records.`
  ].join("\n");
  const subject = encodeURIComponent(
    `RPA Vineyard Block Reference — ${farmName}${sbi ? ` (SBI: ${sbi})` : ""}`
  );
  const encodedBody = encodeURIComponent(body);
  const href = `mailto:?subject=${subject}&body=${encodedBody}`;
  return { href, isTruncated: encodedBody.length > MAILTO_BODY_LIMIT };
}
function emailRpaReference(blocks, farmName, farmMeta) {
  const { href } = buildRpaMailtoHref(blocks, farmName, farmMeta);
  window.location.href = href;
}
function emailVineRegister(records, farmName, farmMeta) {
  const fsaRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const fsaWineRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const sbi = (farmMeta?.sbiNumber ? String(farmMeta.sbiNumber) : "").trim();
  const address = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const winegbNo = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const printed = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const activeRecords = records.filter((r) => !r.isRemovedFromRegister);
  const removedRecords = records.filter((r) => !!r.isRemovedFromRegister);
  const totalHa = records.reduce((sum, r) => sum + (parseFloat(String(r.registeredAreaHa ?? 0)) || 0), 0);
  const col = (v, width) => {
    const s = v == null || v === "" ? "—" : String(v);
    return s.length <= width ? s.padEnd(width) : s.slice(0, width - 1) + "…";
  };
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const headerLine = [
    col("Variety", 24),
    col("FSA Ref", 16),
    col("Area (ha)", 10),
    col("GI", 22),
    col("Wine Colour", 16),
    col("Date Reg.", 12),
    col("Status", 8)
  ].join("  ");
  const separator = "-".repeat(headerLine.length);
  const buildLines = (recs) => recs.map((r) => [
    col(r.registeredVariety, 24),
    col(r.fsaVineRegisterRef ?? "", 16),
    col(r.registeredAreaHa ? parseFloat(String(r.registeredAreaHa)).toFixed(4) : "—", 10),
    col(r.giClassification ?? "", 22),
    col(r.wineColour ?? "", 16),
    col(d(r.dateRegistered), 12),
    col(r.isRemovedFromRegister ? "Removed" : "Active", 8)
  ].join("  "));
  const body = [
    `FSA Vine Register — ${farmName}`,
    ``,
    `Farm: ${farmName}`,
    ...address ? [`Address: ${address}`] : [`Address: (not set — add in Farm Settings)`],
    sbi ? `SBI Number: ${sbi}` : `SBI Number: (not set — add in Farm Settings)`,
    fsaRef ? `FSA Vine Register Ref: ${fsaRef}` : `FSA Vine Register Ref: (not set — add in Farm Settings)`,
    fsaWineRef ? `FSA Wine Production Ref: ${fsaWineRef}` : `FSA Wine Production Ref: (not set — add in Farm Settings)`,
    ...winegbNo ? [`WineGB Membership No: ${winegbNo}`] : [],
    ...appaRef ? [`APPA Ref: ${appaRef}`] : [],
    `Date: ${printed}`,
    `Entries: ${records.length}   Active: ${activeRecords.length}   Removed: ${removedRecords.length}   Total area: ${totalHa.toFixed(4)} ha`,
    ``,
    separator,
    headerLine,
    separator,
    ...activeRecords.length > 0 ? buildLines(activeRecords) : [`(no active entries)`],
    ...removedRecords.length > 0 ? [separator, `Removed from register:`, ...buildLines(removedRecords)] : [],
    separator,
    ``,
    `Prepared by BDE Farm Trac. Mandatory FSA register for UK vineyards over 0.01 ha.`
  ].join("\n");
  const subject = encodeURIComponent(
    `FSA Vine Register — ${farmName}${fsaRef ? ` (Ref: ${fsaRef})` : ""}`
  );
  const encodedBody = encodeURIComponent(body);
  const href = `mailto:?subject=${subject}&body=${encodedBody}`;
  return { href, isTruncated: encodedBody.length > MAILTO_BODY_LIMIT };
}
function escHtml(v) {
  if (v == null || v === "") return "—";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
function buildYieldTrendChartSvg(records, blockLookup, sharedBlockColorMap) {
  const linkedRows = records.filter((r) => r.blockId != null && r.blockId !== "");
  const uniqueVintages = [...new Set(linkedRows.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort();
  const allBlockIds = [...new Set(linkedRows.map((r) => r.blockId))];
  if (uniqueVintages.length < 2 || allBlockIds.length < 2) return "";
  const blockCount = allBlockIds.length;
  const vintageCount = uniqueVintages.length;
  const bname = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup[bid]?.blockName ?? id) : String(id);
  };
  const bvariety = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup[bid]?.variety ?? "") : "";
  };
  const blockNames = allBlockIds.map(String);
  const blockVarietyByName = Object.fromEntries(blockNames.map((name, index) => [name, bvariety(allBlockIds[index])]));
  const varietyColorMap = buildVarietyColorMap(Object.values(blockVarietyByName));
  const blockColorMap = sharedBlockColorMap ?? buildUniqueBlockColorMap(blockNames, blockVarietyByName, varietyColorMap);
  const matrix = {};
  for (const r of linkedRows) {
    const bid = String(r.blockId);
    const vy = String(r.vintageYear ?? "");
    if (!matrix[bid]) matrix[bid] = {};
    matrix[bid][vy] = (matrix[bid][vy] ?? 0) + (parseFloat(String(r.yieldKg ?? 0)) || 0);
  }
  const allVals = Object.values(matrix).flatMap((v) => Object.values(v));
  const maxVal = Math.max(...allVals, 1);
  const MAX_H = 740;
  const W = 700;
  const plotH = 200;
  const ML = 68;
  const MR = 16;
  const MT = 18;
  const availLegendH = MAX_H - plotH - MT - 22;
  const maxLegendRows = Math.max(1, Math.floor((availLegendH - 10) / 14));
  const legendCols = Math.max(4, Math.ceil(blockCount / maxLegendRows));
  const legendRows = Math.ceil(blockCount / legendCols);
  const legendH = legendRows * 14 + 10;
  const MB = legendH + 22;
  const H = plotH + MT + MB;
  const plotW = W - ML - MR;
  const groupW = plotW / vintageCount;
  const barW = Math.max(2, Math.min((groupW - 6) / blockCount, 28));
  const totalBarsW = barW * blockCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const yMax = Math.ceil(maxVal / magnitude) * magnitude;
  const yTicks = 5;
  const sy = (v) => plotH - v / yMax * plotH;
  const gridLines = [];
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = yMax / yTicks * i;
    const y = sy(val);
    gridLines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${plotW}" y2="${y.toFixed(1)}" stroke="#e5e7eb" stroke-width="0.5"/>`);
    const label = val >= 1e3 ? `${(val / 1e3).toFixed(val % 1e3 === 0 ? 0 : 1)}t` : val.toFixed(0);
    yLabels.push(`<text x="-5" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-size="9" fill="#555" font-family="Arial,sans-serif">${label}</text>`);
  }
  const xLabels = uniqueVintages.map((vy, i) => {
    const x = i * groupW + groupW / 2;
    return `<text x="${x.toFixed(1)}" y="${(plotH + 13).toFixed(1)}" text-anchor="middle" font-size="9" fill="#333" font-family="Arial,sans-serif">${escHtml(vy)}</text>`;
  });
  const bars = [];
  const trendCenters = Array.from({ length: blockCount }, () => []);
  for (let vi = 0; vi < vintageCount; vi++) {
    const vy = uniqueVintages[vi];
    const groupLeft = vi * groupW + (groupW - totalBarsW) / 2;
    for (let bi = 0; bi < blockCount; bi++) {
      const bid = String(allBlockIds[bi]);
      const val = matrix[bid]?.[vy] ?? 0;
      const color = blockColorMap[bid];
      const bx = groupLeft + bi * barW;
      const bh = val > 0 ? val / yMax * plotH : 0;
      const by = plotH - bh;
      const cx = bx + barW / 2;
      const cy = val > 0 ? by : plotH;
      trendCenters[bi].push([cx, cy]);
      if (val > 0) {
        const rx = barW >= 3 ? "1.5" : "0";
        const w = Math.max(barW - (barW >= 3 ? 1 : 0), 1).toFixed(1);
        bars.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${w}" height="${bh.toFixed(1)}" fill="${color}" fill-opacity="0.72" rx="${rx}"/>`);
      }
    }
  }
  const trendLines = [];
  for (let bi = 0; bi < blockCount; bi++) {
    const color = blockColorMap[String(allBlockIds[bi])];
    const pts = trendCenters[bi];
    if (pts.length < 2) continue;
    const d = pts.map((p, idx) => `${idx === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    trendLines.push(`<path d="${d}" stroke="${color}" stroke-width="2" fill="none" stroke-dasharray="4,2" opacity="0.9"/>`);
    pts.forEach(([cx, cy]) => {
      trendLines.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.8" fill="${color}" stroke="white" stroke-width="1.2"/>`);
    });
  }
  const legendColW = Math.floor(plotW / legendCols);
  const legendItems = [];
  for (let bi = 0; bi < blockCount; bi++) {
    const id = allBlockIds[bi];
    const color = blockColorMap[String(id)];
    const blockLabel = bname(id);
    const varLabel = bvariety(id);
    const label = varLabel ? `${blockLabel} — ${varLabel}` : blockLabel;
    const col = bi % legendCols;
    const row = Math.floor(bi / legendCols);
    const lx = col * legendColW;
    const ly = plotH + 28 + row * 14;
    legendItems.push(`<rect x="${lx}" y="${(ly - 7).toFixed(1)}" width="10" height="10" fill="${color}" fill-opacity="0.72" rx="1.5"/>
      <text x="${lx + 13}" y="${ly}" font-size="8.5" fill="#333" font-family="Arial,sans-serif">${escHtml(label)}</text>`);
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;border:1px solid #d1d5db;border-radius:4px;background:#fafaf9">
    <g transform="translate(${ML},${MT})">
      ${gridLines.join("")}
      ${bars.join("")}
      ${trendLines.join("")}
      <line x1="0" y1="0" x2="0" y2="${plotH}" stroke="#374151" stroke-width="1"/>
      <line x1="0" y1="${plotH}" x2="${plotW}" y2="${plotH}" stroke="#374151" stroke-width="1"/>
      ${yLabels.join("")}
      ${xLabels.join("")}
      <text transform="translate(-52,${(plotH / 2).toFixed(0)}) rotate(-90)" text-anchor="middle" font-size="9" fill="#666" font-family="Arial,sans-serif">Yield (kg)</text>
      ${legendItems.join("")}
    </g>
  </svg>`;
}
function buildYieldTrendChartTHaSvg(records, blockLookup, sharedBlockColorMap) {
  const linkedRows = records.filter((r) => r.blockId != null && r.blockId !== "");
  const uniqueVintages = [...new Set(linkedRows.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort();
  const allBlockIds = [...new Set(linkedRows.map((r) => r.blockId))];
  const bname = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup[bid]?.blockName ?? id) : String(id);
  };
  const bvarietyTha = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup[bid]?.variety ?? "") : "";
  };
  const blockAreaHa = {};
  const excludedBlocks = [];
  const blockIdsWithArea = [];
  for (const bid of allBlockIds) {
    const bidNum = Number(bid);
    const block = !isNaN(bidNum) && bidNum > 0 ? blockLookup[bidNum] : void 0;
    const ha = block ? parseFloat(String(block.areaHa ?? "")) : NaN;
    if (!isNaN(ha) && ha > 0) {
      blockAreaHa[String(bid)] = ha;
      blockIdsWithArea.push(bid);
    } else {
      excludedBlocks.push(bname(bid));
    }
  }
  if (uniqueVintages.length < 2 || blockIdsWithArea.length < 2) return { svg: "", excludedBlocks, eligibleBlockCount: blockIdsWithArea.length };
  const blockNames = blockIdsWithArea.map(String);
  const blockVarietyByName = Object.fromEntries(blockNames.map((name, index) => [name, bvarietyTha(blockIdsWithArea[index])]));
  const varietyColorMap = buildVarietyColorMap(Object.values(blockVarietyByName));
  const thaBlockColorMap = sharedBlockColorMap ?? buildUniqueBlockColorMap(blockNames, blockVarietyByName, varietyColorMap);
  const kgMatrix = {};
  for (const r of linkedRows) {
    const bid = String(r.blockId);
    if (!(bid in blockAreaHa)) continue;
    const vy = String(r.vintageYear ?? "");
    if (!kgMatrix[bid]) kgMatrix[bid] = {};
    kgMatrix[bid][vy] = (kgMatrix[bid][vy] ?? 0) + (parseFloat(String(r.yieldKg ?? 0)) || 0);
  }
  const thaMatrix = {};
  for (const bid of blockIdsWithArea) {
    const bidStr = String(bid);
    const areaHa = blockAreaHa[bidStr];
    thaMatrix[bidStr] = {};
    for (const vy of uniqueVintages) {
      const kg = kgMatrix[bidStr]?.[vy] ?? 0;
      thaMatrix[bidStr][vy] = kg > 0 && areaHa > 0 ? parseFloat((kg / 1e3 / areaHa).toFixed(3)) : 0;
    }
  }
  const allVals = Object.values(thaMatrix).flatMap((v) => Object.values(v));
  const maxVal = Math.max(...allVals, 0.1);
  const blockCount = blockIdsWithArea.length;
  const vintageCount = uniqueVintages.length;
  const MAX_H_THA = 740;
  const W = 700;
  const plotH = 200;
  const ML = 68;
  const MR = 16;
  const MT = 18;
  const availLegendHTha = MAX_H_THA - plotH - MT - 22;
  const maxLegendRowsTha = Math.max(1, Math.floor((availLegendHTha - 10) / 14));
  const legendCols = Math.max(4, Math.ceil(blockCount / maxLegendRowsTha));
  const legendRows = Math.ceil(blockCount / legendCols);
  const legendH = legendRows * 14 + 10;
  const MB = legendH + 22;
  const H = plotH + MT + MB;
  const plotW = W - ML - MR;
  const groupW = plotW / vintageCount;
  const barW = Math.max(2, Math.min((groupW - 6) / blockCount, 28));
  const totalBarsW = barW * blockCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const yMax = Math.ceil(maxVal / magnitude) * magnitude;
  const yTicks = 5;
  const sy = (v) => plotH - v / yMax * plotH;
  const gridLines = [];
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = yMax / yTicks * i;
    const y = sy(val);
    gridLines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${plotW}" y2="${y.toFixed(1)}" stroke="#e5e7eb" stroke-width="0.5"/>`);
    yLabels.push(`<text x="-5" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-size="9" fill="#555" font-family="Arial,sans-serif">${val.toFixed(2)}</text>`);
  }
  const xLabels = uniqueVintages.map((vy, i) => {
    const x = i * groupW + groupW / 2;
    return `<text x="${x.toFixed(1)}" y="${(plotH + 13).toFixed(1)}" text-anchor="middle" font-size="9" fill="#333" font-family="Arial,sans-serif">${escHtml(vy)}</text>`;
  });
  const bars = [];
  const trendCenters = Array.from({ length: blockCount }, () => []);
  for (let vi = 0; vi < vintageCount; vi++) {
    const vy = uniqueVintages[vi];
    const groupLeft = vi * groupW + (groupW - totalBarsW) / 2;
    for (let bi = 0; bi < blockCount; bi++) {
      const bid = String(blockIdsWithArea[bi]);
      const val = thaMatrix[bid]?.[vy] ?? 0;
      const color = thaBlockColorMap[bid];
      const bx = groupLeft + bi * barW;
      const bh = val > 0 ? val / yMax * plotH : 0;
      const by = plotH - bh;
      const cx = bx + barW / 2;
      const cy = val > 0 ? by : plotH;
      trendCenters[bi].push([cx, cy]);
      if (val > 0) {
        const rx = barW >= 3 ? "1.5" : "0";
        const w = Math.max(barW - (barW >= 3 ? 1 : 0), 1).toFixed(1);
        bars.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${w}" height="${bh.toFixed(1)}" fill="${color}" fill-opacity="0.72" rx="${rx}"/>`);
      }
    }
  }
  const trendLines = [];
  for (let bi = 0; bi < blockCount; bi++) {
    const color = thaBlockColorMap[String(blockIdsWithArea[bi])];
    const pts = trendCenters[bi];
    if (pts.length < 2) continue;
    const d = pts.map((p, idx) => `${idx === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    trendLines.push(`<path d="${d}" stroke="${color}" stroke-width="2" fill="none" stroke-dasharray="4,2" opacity="0.9"/>`);
    pts.forEach(([cx, cy]) => {
      trendLines.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.8" fill="${color}" stroke="white" stroke-width="1.2"/>`);
    });
  }
  const legendColW = Math.floor(plotW / legendCols);
  const legendItems = [];
  for (let bi = 0; bi < blockCount; bi++) {
    const id = blockIdsWithArea[bi];
    const color = thaBlockColorMap[String(id)];
    const blockLabel = bname(id);
    const varLabel = bvarietyTha(id);
    const label = varLabel ? `${blockLabel} — ${varLabel}` : blockLabel;
    const col = bi % legendCols;
    const row = Math.floor(bi / legendCols);
    const lx = col * legendColW;
    const ly = plotH + 28 + row * 14;
    legendItems.push(`<rect x="${lx}" y="${(ly - 7).toFixed(1)}" width="10" height="10" fill="${color}" fill-opacity="0.72" rx="1.5"/>
      <text x="${lx + 13}" y="${ly}" font-size="8.5" fill="#333" font-family="Arial,sans-serif">${escHtml(label)}</text>`);
  }
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;border:1px solid #d1d5db;border-radius:4px;background:#fafaf9">
    <g transform="translate(${ML},${MT})">
      ${gridLines.join("")}
      ${bars.join("")}
      ${trendLines.join("")}
      <line x1="0" y1="0" x2="0" y2="${plotH}" stroke="#374151" stroke-width="1"/>
      <line x1="0" y1="${plotH}" x2="${plotW}" y2="${plotH}" stroke="#374151" stroke-width="1"/>
      ${yLabels.join("")}
      ${xLabels.join("")}
      <text transform="translate(-52,${(plotH / 2).toFixed(0)}) rotate(-90)" text-anchor="middle" font-size="9" fill="#666" font-family="Arial,sans-serif">Yield (t/ha)</text>
      ${legendItems.join("")}
    </g>
  </svg>`;
  return { svg, excludedBlocks, eligibleBlockCount: blockIdsWithArea.length };
}
function buildBlockMapSvg(boundaries, blocks) {
  const allPts = boundaries.flatMap((b) => b.polygonPoints);
  if (allPts.length < 3) return "";
  const minLat = Math.min(...allPts.map((p) => p.lat));
  const maxLat = Math.max(...allPts.map((p) => p.lat));
  const minLng = Math.min(...allPts.map((p) => p.lng));
  const maxLng = Math.max(...allPts.map((p) => p.lng));
  const W = 320;
  const H = 190;
  const PAD = 12;
  const latSpan = maxLat - minLat || 1e-3;
  const lngSpan = maxLng - minLng || 1e-3;
  const project = (p) => [
    PAD + (p.lng - minLng) / lngSpan * (W - PAD * 2),
    PAD + (maxLat - p.lat) / latSpan * (H - PAD * 2)
  ];
  const FILL_COLOURS = [
    "#4ade80",
    "#60a5fa",
    "#fb923c",
    "#f472b6",
    "#a78bfa",
    "#34d399",
    "#facc15",
    "#38bdf8"
  ];
  const blockNameLookup = {};
  blocks.forEach((b) => {
    blockNameLookup[b.id] = String(b.blockName ?? "");
  });
  const shapes = boundaries.map((boundary, i) => {
    if (boundary.polygonPoints.length < 3) return "";
    const colour = FILL_COLOURS[i % FILL_COLOURS.length];
    const pts = boundary.polygonPoints.map((p) => project(p).join(",")).join(" ");
    const cx = boundary.polygonPoints.reduce((s, p) => s + p.lng, 0) / boundary.polygonPoints.length;
    const cy = boundary.polygonPoints.reduce((s, p) => s + p.lat, 0) / boundary.polygonPoints.length;
    const [sx, sy] = project({ lat: cy, lng: cx });
    const name = escHtml(blockNameLookup[boundary.blockId] ?? "");
    return `<polygon points="${pts}" fill="${colour}" fill-opacity="0.45" stroke="${colour}" stroke-width="1.5"/>
      ${name ? `<text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="middle" font-size="7" font-family="Arial,sans-serif" fill="#111" font-weight="600">${name}</text>` : ""}`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
    style="border:1px solid #6ee7b7;border-radius:4px;background:#f0fdf4;display:block">
    ${shapes}
  </svg>`;
}
async function fetchImageAsDataUrl(url) {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
async function svgToPngDataUrl(svg) {
  if (!svg) return null;
  let objectUrl = null;
  try {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    objectUrl = URL.createObjectURL(blob);
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to render block map SVG"));
      img.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 380;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
async function printVineRegister(records, farmName, fsaVineRef, farmId, blocks, farmMeta) {
  const win = window.open("", "_blank", "width=1100,height=850");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>FSA Vine Register — Loading…</title>
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555}p{font-size:14px}</style>
    </head><body><p>Preparing report…</p></body></html>`);
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const n = (v, dp = 4) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const photoDataUrl = {};
  const photoCaption = {};
  if (farmId && blocks && blocks.length > 0) {
    const blockLookup = {};
    blocks.forEach((b) => {
      blockLookup[b.id] = b;
    });
    const neededBlockIds = [...new Set(
      records.map((r) => Number(r.blockId)).filter((id) => !isNaN(id) && id > 0)
    )];
    await Promise.all(
      neededBlockIds.map(async (blockId) => {
        const block = blockLookup[blockId];
        if (!block) return;
        const photos = block.photos;
        if (!photos || photos.length === 0) return;
        const coverPhoto = photos[0];
        const photoId = coverPhoto.id;
        const url = `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${photoId}`;
        const dataUrl = await fetchImageAsDataUrl(url);
        if (dataUrl) photoDataUrl[blockId] = dataUrl;
        if (coverPhoto.caption) photoCaption[blockId] = coverPhoto.caption;
      })
    );
  }
  let svgMapHtml = "";
  if (farmId && blocks && blocks.length > 0) {
    try {
      const res = await fetch(`/api/farms/${farmId}/vineyard-blocks/boundaries`, { credentials: "include" });
      if (res.ok) {
        const { boundaries } = await res.json();
        if (Array.isArray(boundaries) && boundaries.length > 0) {
          svgMapHtml = buildBlockMapSvg(boundaries, blocks);
        }
      }
    } catch {
    }
  }
  const hasPhotos = Object.keys(photoDataUrl).length > 0;
  const blockLookup2 = {};
  (blocks ?? []).forEach((b) => {
    blockLookup2[b.id] = b;
  });
  const colSpan = hasPhotos ? 9 : 8;
  const rows = records.map((r) => {
    const status = r.isRemovedFromRegister ? '<span style="color:#991b1b;font-weight:600">Removed</span>' : '<span style="color:#065f46;font-weight:600">Active</span>';
    let photoCell = "";
    if (hasPhotos) {
      const bid = Number(r.blockId);
      const block = !isNaN(bid) && bid > 0 ? blockLookup2[bid] : void 0;
      const blockLabel = block ? escHtml(String(block.blockName ?? "")) : "—";
      const dataUrl = bid > 0 ? photoDataUrl[bid] : void 0;
      const caption = !isNaN(bid) && bid > 0 ? photoCaption[bid] ?? "" : "";
      photoCell = `<td style="padding:4px 6px;vertical-align:middle;text-align:center;width:76px">
          ${dataUrl ? `<img src="${dataUrl}" alt="Block photo" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #d1d5db;display:block;margin:0 auto 2px" />` : ""}
          <span style="font-size:9.5px;color:#555;display:block;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${blockLabel}</span>
          ${caption ? `<span style="font-size:9px;color:#666;font-style:italic;display:block;max-width:72px;word-wrap:break-word;line-height:1.3;margin-top:2px">${escHtml(caption)}</span>` : ""}
        </td>`;
    }
    return `<tr>
        ${photoCell}
        <td>${escHtml(r.registeredVariety)}</td>
        <td>${escHtml(r.vivcNumber)}</td>
        <td style="text-align:right">${n(r.registeredAreaHa)} ha</td>
        <td>${escHtml(r.giClassification)}</td>
        <td>${escHtml(r.wineColour)}</td>
        <td>${d(r.dateRegistered)}</td>
        <td>${d(r.dateAmended)}</td>
        <td>${status}</td>
      </tr>`;
  }).join("");
  const totalHa = records.reduce(
    (sum, r) => sum + (parseFloat(String(r.registeredAreaHa ?? 0)) || 0),
    0
  );
  const activeCount = records.filter((r) => !r.isRemovedFromRegister).length;
  const safeFarmName = escHtml(farmName);
  const addressRaw = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const addressHtml = addressRaw ? escHtml(addressRaw) : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const fsaVineRegisterRef = resolveVineRegisterFsaRef(farmMeta, fsaVineRef);
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const winegbMembershipNumber = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const fsaVineRefHtml = fsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${escHtml(fsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const fsaWineRefHtml = fsaWineProductionRef ? `FSA Wine Production Ref: <strong>${escHtml(fsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const appaRefHtml = appaRef ? `APPA Ref: <strong>${escHtml(appaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const winegbHtml = winegbMembershipNumber ? `WineGB Membership No: <strong>${escHtml(winegbMembershipNumber)}</strong><br>` : "";
  const missingHeaderFields = getVineRegisterMissingHeaderFields(farmMeta, fsaVineRef);
  const missingRefWarningBlock = missingHeaderFields.length > 0 ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing header information</strong> &mdash;
        the field(s) marked below (${missingHeaderFields.join(", ")}) have not been set in Farm Settings.
        Add them before submitting this register to the FSA.
      </div>` : "";
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>FSA Vine Register &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; color: #111; margin: 0; }
    h1 { font-size: 18px; margin: 0 0 2px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2d6a4f; padding-bottom: 10px; margin-bottom: 16px; }
    .header-left h1 { color: #2d6a4f; }
    .meta { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.8; }
    .badges { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 10.5px; font-weight: 600; }
    .badge-green { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .badge-blue  { background: #dbeafe; color: #1e3a8a; border: 1px solid #93c5fd; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .missing-refs-notice { background: #fffbeb; border: 1px solid #fbbf24; color: #92400e; border-radius: 4px; padding: 7px 12px; font-size: 11px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #2d6a4f; color: white; padding: 6px 6px; text-align: left; white-space: nowrap; }
    td { padding: 5px 6px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .tfoot td { font-weight: 700; background: #d1fae5; border-color: #6ee7b7; }
    .notice { background: #f0fdf4; border: 1px solid #6ee7b7; padding: 8px 12px; border-radius: 4px; font-size: 11px; margin-bottom: 14px; }
    .map-section { margin-bottom: 16px; }
    .map-title { font-size: 11px; font-weight: 700; color: #2d6a4f; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
    .footer { margin-top: 18px; font-size: 10.5px; color: #666; border-top: 1px solid #ccc; padding-top: 7px; display: flex; justify-content: space-between; }
    @media print {
      body { margin: 0; }
      button { display: none !important; }
      .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .missing-refs-notice { background: #fffbeb !important; border: 1px solid #fbbf24 !important; color: #92400e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style></head><body>
  <div class="header">
    <div class="header-left">
      <h1>FSA Vine Register</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong><br>
        ${fsaVineRefHtml}<br>
        ${fsaWineRefHtml}<br>
        ${appaRefHtml}<br>
        ${winegbHtml}${addressHtml}<br>Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} entr${records.length === 1 ? "y" : "ies"}
      </div>
      <div class="badges">
        <span class="badge badge-green">Active: ${activeCount}</span>
        ${records.length - activeCount > 0 ? `<span class="badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5">Removed: ${records.length - activeCount}</span>` : ""}
        <span class="badge badge-blue">Total Area: ${totalHa.toFixed(4)} ha</span>
      </div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start">
      ${svgMapHtml ? `<div class="map-section"><div class="map-title">Block Map Overview</div>${svgMapHtml}</div>` : ""}
      <div style="text-align:right;font-size:11px;color:#555">
        <div style="font-size:13px;font-weight:700;color:#2d6a4f">Food Standards Agency</div>
        <div>Vine Register &mdash; UK Viticulture</div>
        <div style="margin-top:4px">Mandatory for vineyards &gt; 0.01 ha</div>
      </div>
    </div>
  </div>

  ${missingRefWarningBlock}

  <div class="notice">
    <strong>Statutory requirement:</strong> All UK vineyards exceeding 0.01 ha must maintain a Vine Register and notify the Food Standards Agency of changes within 30 days.
    This report may be submitted or retained as your official register record.
  </div>

  <table>
    <thead>
      <tr>
        ${hasPhotos ? '<th style="width:76px">Block / Photo</th>' : ""}
        <th>Registered Variety</th>
        <th>VIVC No.</th>
        <th style="text-align:right">Area (ha)</th>
        <th>GI / PDO</th>
        <th>Wine Colour</th>
        <th>Date Registered</th>
        <th>Date Amended</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan='${colSpan}' style='text-align:center;color:#888;padding:14px'>No register entries</td></tr>`}
    </tbody>
    ${records.length > 0 ? `
    <tfoot>
      <tr class="tfoot">
        <td colspan="${hasPhotos ? 3 : 2}"><strong>Totals</strong></td>
        <td style="text-align:right"><strong>${totalHa.toFixed(4)} ha</strong></td>
        <td colspan="${hasPhotos ? 5 : 5}"></td>
      </tr>
    </tfoot>` : ""}
  </table>

  <div class="footer">
    <span>Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; FSA Vine Register &nbsp;&middot;&nbsp; Report any changes to the FSA within 30 days</span>
    <span>https://www.food.gov.uk/business-guidance/vine-register</span>
  </div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
async function downloadVineRegisterPdf(records, farmName, fsaVineRef, farmId, blocks, farmMeta) {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    __vitePreload(() => import("./jspdf.es.min-BVdyS7jm.js"), true ? __vite__mapDeps([0,1,2,3,4]) : void 0),
    __vitePreload(() => import("./jspdf.plugin.autotable-rNuKHwSj.js"), true ? [] : void 0)
  ]);
  const jsPDF = jsPDFModule.jsPDF ?? jsPDFModule.default;
  const autoTable = autoTableModule.default;
  let blockMapDataUrl = null;
  if (farmId && blocks && blocks.length > 0) {
    try {
      const res = await fetch(`/api/farms/${farmId}/vineyard-blocks/boundaries`, { credentials: "include" });
      if (res.ok) {
        const { boundaries } = await res.json();
        if (Array.isArray(boundaries) && boundaries.length > 0) {
          blockMapDataUrl = await svgToPngDataUrl(buildBlockMapSvg(boundaries, blocks));
        }
      }
    } catch {
    }
  }
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const safeDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeDateTime = (/* @__PURE__ */ new Date()).toLocaleString("en-GB");
  const dv = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const nv = (v, dp = 4) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const addressValue = String(farmMeta?.address ?? "").trim();
  const postcodeValue = String(farmMeta?.postcode ?? "").trim();
  const addressParts = [addressValue, postcodeValue].filter(Boolean).join(", ");
  const fsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : fsaVineRef ?? "").trim();
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const winegbMembershipNumber = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const missingFields = [
    !farmName?.trim() ? "Farm name" : "",
    !addressValue ? "Farm address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !fsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !appaRef ? "APPA Ref" : "",
    !winegbMembershipNumber ? "WineGB Membership No" : ""
  ].filter(Boolean);
  const activeCount = records.filter((r) => !r.isRemovedFromRegister).length;
  const totalHa = records.reduce((sum, r) => sum + (parseFloat(String(r.registeredAreaHa ?? 0)) || 0), 0);
  doc.setFillColor(45, 106, 79);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("BDE Farm Trac", 14, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Vineyard Compliance Platform", 14, 16);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("FSA Vine Register", pageW - 14, 10, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${safeDate}`, pageW - 14, 16, { align: "right" });
  let y = 26;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, y, pageW - 28, 10, 1, 1, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const farmLabel = `Farm: ${farmName || "—"}`;
  const printedLabel = `Printed: ${safeDateTime}`;
  const addrLabel = addressParts ? `Address: ${addressParts}` : "";
  doc.text(farmLabel, 17, y + 7);
  doc.text(printedLabel, pageW / 2, y + 7, { align: "center" });
  if (addrLabel) doc.text(addrLabel, pageW - 17, y + 7, { align: "right" });
  y += 14;
  if (missingFields.length > 0) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15);
    doc.text(`⚠ Missing: ${missingFields.join(", ")} — update Farm Settings before submitting to the FSA.`, 17, y + 5.5);
    y += 12;
  }
  const refsLine = [
    fsaVineRegisterRef ? `FSA Vine Reg: ${fsaVineRegisterRef}` : "",
    fsaWineProductionRef ? `FSA Wine Prod: ${fsaWineProductionRef}` : "",
    appaRef ? `APPA Ref: ${appaRef}` : "",
    winegbMembershipNumber ? `WineGB No: ${winegbMembershipNumber}` : ""
  ].filter(Boolean).join("   ·   ");
  if (refsLine) {
    doc.setFillColor(209, 250, 229);
    doc.setDrawColor(110, 231, 183);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(6, 95, 70);
    doc.text(refsLine, 17, y + 5.5);
    y += 12;
  }
  if (blockMapDataUrl) {
    const mapPanelHeight = 64;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(110, 231, 183);
    doc.roundedRect(14, y, pageW - 28, mapPanelHeight, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 95, 70);
    doc.text("Block Map Overview", 17, y + 7);
    doc.addImage(blockMapDataUrl, "PNG", 17, y + 10, 82, 49);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Latest captured boundary for each vineyard block.", 106, y + 18);
    y += mapPanelHeight + 8;
  }
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(6, 95, 70);
  const summaryLine = `ℹ ${records.length} entr${records.length === 1 ? "y" : "ies"} · Active: ${activeCount} · Removed: ${records.length - activeCount} · Total Area: ${totalHa.toFixed(4)} ha — Mandatory for UK vineyards > 0.01 ha. Report changes to the FSA within 30 days.`;
  doc.text(summaryLine, 17, y + 5.5);
  y += 12;
  const tableBody = records.map((r) => [
    String(r.registeredVariety ?? "—"),
    String(r.vivcNumber ?? "—"),
    `${nv(r.registeredAreaHa)} ha`,
    String(r.giClassification ?? "—"),
    String(r.wineColour ?? "—"),
    dv(r.dateRegistered),
    dv(r.dateAmended),
    r.isRemovedFromRegister ? "Removed" : "Active"
  ]);
  autoTable(doc, {
    head: [["Registered Variety", "VIVC No.", "Area (ha)", "GI / PDO", "Wine Colour", "Date Registered", "Date Amended", "Status"]],
    body: tableBody.length ? tableBody : [["No register entries", "", "", "", "", "", "", ""]],
    startY: y,
    styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    headStyles: { fillColor: [45, 106, 79], textColor: 255, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 22 },
      2: { cellWidth: 24, halign: "right" },
      3: { cellWidth: 38 },
      4: { cellWidth: 32 },
      5: { cellWidth: 28 },
      6: { cellWidth: 26 },
      7: { cellWidth: 22 }
    },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.section === "body") {
        const val = String(data.cell.raw ?? "");
        if (val === "Active") {
          data.cell.styles.textColor = [6, 95, 70];
          data.cell.styles.fontStyle = "bold";
        } else if (val === "Removed") {
          data.cell.styles.textColor = [153, 27, 27];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    foot: records.length > 0 ? [["Totals", "", `${totalHa.toFixed(4)} ha`, "", "", "", "", ""]] : void 0,
    footStyles: { fillColor: [209, 250, 229], textColor: [6, 95, 70], fontStyle: "bold", fontSize: 8 },
    margin: { left: 14, right: 14 }
  });
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Prepared by BDE Farm Trac  ·  FSA Vine Register  ·  Report any changes to the FSA within 30 days  ·  food.gov.uk/business-guidance/vine-register", 14, pageH - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 5, { align: "right" });
  }
  doc.save("vine-register.pdf");
}
async function printOperations(records, farmName, farmId, blocks, farmMeta, yearLabel) {
  const win = window.open("", "_blank", "width=1100,height=850");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Vineyard Operations — Loading…</title>
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555}p{font-size:14px}</style>
    </head><body><p>Preparing report…</p></body></html>`);
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const n = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const photoDataUrl = {};
  const photoCaption = {};
  if (farmId && blocks && blocks.length > 0) {
    const blockLookup = {};
    blocks.forEach((b) => {
      blockLookup[b.id] = b;
    });
    const neededBlockIds = [...new Set(
      records.map((r) => Number(r.blockId)).filter((id) => !isNaN(id) && id > 0)
    )];
    await Promise.all(
      neededBlockIds.map(async (blockId) => {
        const block = blockLookup[blockId];
        if (!block) return;
        const photos = block.photos;
        if (!photos || photos.length === 0) return;
        const coverPhoto = photos[0];
        const url = `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${coverPhoto.id}`;
        const dataUrl = await fetchImageAsDataUrl(url);
        if (dataUrl) photoDataUrl[blockId] = dataUrl;
        if (coverPhoto.caption) photoCaption[blockId] = coverPhoto.caption;
      })
    );
  }
  const blockLookup2 = {};
  (blocks ?? []).forEach((b) => {
    blockLookup2[b.id] = b;
  });
  const blockName = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup2[bid]?.blockName ?? id) : "—";
  };
  const hasPhotos = Object.keys(photoDataUrl).length > 0;
  const unlinkedCount = records.filter((r) => !(Number(r.blockId) > 0)).length;
  const rows = records.map((r) => {
    const bid = Number(r.blockId);
    const dataUrl = !isNaN(bid) && bid > 0 ? photoDataUrl[bid] : void 0;
    const caption = !isNaN(bid) && bid > 0 ? photoCaption[bid] ?? "" : "";
    const bName = blockName(r.blockId);
    let photoCell = "";
    if (hasPhotos) {
      photoCell = `<td style="padding:4px 6px;vertical-align:middle;text-align:center;width:76px">
        ${dataUrl ? `<img src="${dataUrl}" alt="Block photo" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #d1d5db;display:block;margin:0 auto 2px" />` : ""}
        <span style="font-size:9.5px;color:#555;display:block;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(bName)}</span>
        ${caption ? `<span style="font-size:9px;color:#666;font-style:italic;display:block;max-width:72px;word-wrap:break-word;line-height:1.3;margin-top:2px">${escHtml(caption)}</span>` : ""}
      </td>`;
    }
    return `<tr>
      ${photoCell}
      <td>${d(r.operationDate)}</td>
      <td>${hasPhotos ? "" : escHtml(bName)}</td>
      <td>${escHtml(r.operationType)}</td>
      <td>${escHtml(r.pruningSystem)}</td>
      <td style="text-align:right">${r.budsPerVineActual ?? "—"}</td>
      <td style="text-align:right">${n(r.pruningWeightKgPerVine, 3)}</td>
      <td>${escHtml(r.operatorName)}</td>
      <td style="text-align:right">${n(r.hoursWorked, 1)}</td>
      <td>${escHtml(r.notes)}</td>
    </tr>`;
  }).join("");
  const safeFarmName = escHtml(farmName);
  const opsAddressValue = String(farmMeta?.address ?? "").trim();
  const opsPostcodeValue = String(farmMeta?.postcode ?? "").trim();
  const opsAddressHtml = opsAddressValue ? [opsAddressValue, opsPostcodeValue].filter(Boolean).map(escHtml).join(", ") : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const colSpan = hasPhotos ? 9 : 10;
  const opsFsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const opsFsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const opsAppaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const opsFsaVineRefHtml = opsFsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${escHtml(opsFsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const opsFsaWineRefHtml = opsFsaWineProductionRef ? `FSA Wine Production Ref: <strong>${escHtml(opsFsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const opsAppaRefHtml = opsAppaRef ? `APPA Ref: <strong>${escHtml(opsAppaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const opsAnyMissingRef = !opsAddressValue || !opsFsaVineRegisterRef || !opsFsaWineProductionRef || !opsAppaRef;
  const opsMissingFields = [
    !opsAddressValue ? "Farm Address" : "",
    !opsFsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !opsFsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !opsAppaRef ? "APPA Ref" : ""
  ].filter(Boolean).join(", ");
  const opsMissingRefWarningBlock = opsAnyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing registration references</strong> &mdash;
        the field(s) marked below (${opsMissingFields}) have not been set in Farm Settings.
        Add them before submitting this report.
      </div>` : "";
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Vineyard Operations &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; }
    h1 { font-size: 17px; margin: 0 0 2px; color: #4b3a8a; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4b3a8a; padding-bottom: 10px; margin-bottom: 14px; }
    .meta { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.5; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .missing-refs-notice { background: #fffbeb; border: 1px solid #fbbf24; color: #92400e; border-radius: 4px; padding: 7px 12px; font-size: 11px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #4b3a8a; color: white; padding: 6px 5px; text-align: left; white-space: nowrap; }
    td { padding: 5px 5px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #f5f3ff; }
    .footer { margin-top: 16px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 7px; }
    @media print {
      body { margin: 0; } button { display: none !important; }
      .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .missing-refs-notice { background: #fffbeb !important; border: 1px solid #fbbf24 !important; color: #92400e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Pruning &amp; Canopy Operations</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong><br>${opsAddressHtml}<br>
        ${opsFsaVineRefHtml}<br>
        ${opsFsaWineRefHtml}<br>
        ${opsAppaRefHtml}<br>
        ${yearLabel ? `Year: <strong>${escHtml(yearLabel)}</strong><br>` : ""}Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record${records.length === 1 ? "" : "s"}
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div style="font-size:13px;font-weight:700;color:#4b3a8a">Viticulture</div>
      <div>Operations Register</div>
    </div>
  </div>
  ${opsMissingRefWarningBlock}
  ${unlinkedCount > 0 ? `<div style="background:#fffbeb;border:1px solid #fcd34d;padding:7px 10px;border-radius:4px;font-size:10.5px;margin-bottom:12px;color:#78350f"><strong>&#9888; ${unlinkedCount} record${unlinkedCount === 1 ? "" : "s"} not linked to a block</strong> &mdash; these operations are included below but excluded from block-level summaries. Link them to blocks to ensure complete records.</div>` : ""}
  <table>
    <thead>
      <tr>
        ${hasPhotos ? '<th style="width:76px">Block / Photo</th>' : ""}
        <th>Date</th>
        ${hasPhotos ? "" : "<th>Block</th>"}
        <th>Operation Type</th>
        <th>Pruning System</th>
        <th style="text-align:right">Buds/Vine</th>
        <th style="text-align:right">Wt (kg/vine)</th>
        <th>Operator</th>
        <th style="text-align:right">Hours</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan='${colSpan}' style='text-align:center;color:#888;padding:14px'>No records</td></tr>`}
    </tbody>
  </table>
  <div class="footer">Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Pruning &amp; Canopy Operations Register &nbsp;&middot;&nbsp; Retain for GI / PDO compliance</div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
async function downloadVineOperationsPdf(records, blocks, farmName, farmMeta, yearLabel) {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    __vitePreload(() => import("./jspdf.es.min-BVdyS7jm.js"), true ? __vite__mapDeps([0,1,2,3,4]) : void 0),
    __vitePreload(() => import("./jspdf.plugin.autotable-rNuKHwSj.js"), true ? [] : void 0)
  ]);
  const jsPDF = jsPDFModule.jsPDF ?? jsPDFModule.default;
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const safeDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeDateTime = (/* @__PURE__ */ new Date()).toLocaleString("en-GB");
  const blockLookup = {};
  blocks.forEach((b) => {
    blockLookup[b.id] = String(b.blockName ?? b.id);
  });
  const resolveBlock = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? blockLookup[bid] ?? "—" : "—";
  };
  const nv = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const dv = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const addressValue = String(farmMeta?.address ?? "").trim();
  const postcodeValue = String(farmMeta?.postcode ?? "").trim();
  const addressParts = [addressValue, postcodeValue].filter(Boolean).join(", ");
  const fsaVineRegisterRef = String(farmMeta?.fsaVineRegisterRef ?? "").trim();
  const fsaWineProductionRef = String(farmMeta?.fsaWineProductionRef ?? "").trim();
  const appaRef = String(farmMeta?.appaRef ?? "").trim();
  const missingFields = [
    !farmName?.trim() ? "Farm name" : "",
    !addressValue ? "Farm address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !fsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !appaRef ? "APPA Ref" : ""
  ].filter(Boolean);
  doc.setFillColor(75, 58, 138);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("BDE Farm Trac", 14, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Vineyard Compliance Platform", 14, 16);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Pruning & Canopy Operations", pageW - 14, 10, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${safeDate}`, pageW - 14, 16, { align: "right" });
  let y = 26;
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(14, y, pageW - 28, 10, 1, 1, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const farmLabel = `Farm: ${farmName || "—"}`;
  const printedLabel = `Printed: ${safeDateTime}`;
  const addrLabel = addressParts ? `Address: ${addressParts}` : "";
  doc.text(farmLabel, 17, y + 7);
  doc.text(printedLabel, pageW / 2, y + 7, { align: "center" });
  if (addrLabel) doc.text(addrLabel, pageW - 17, y + 7, { align: "right" });
  y += 14;
  if (missingFields.length > 0) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15);
    doc.text(`⚠ Missing: ${missingFields.join(", ")} — update Farm Settings before submitting this report.`, 17, y + 5.5);
    y += 12;
  }
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(167, 139, 250);
  doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 58, 138);
  const countLine = `ℹ ${records.length} record${records.length === 1 ? "" : "s"}${yearLabel ? ` · Year: ${yearLabel}` : ""} — Retain for GI / PDO compliance.`;
  doc.text(countLine, 17, y + 5.5);
  y += 12;
  const refsLine = [
    fsaVineRegisterRef ? `FSA Vine Reg: ${fsaVineRegisterRef}` : "",
    fsaWineProductionRef ? `FSA Wine Prod: ${fsaWineProductionRef}` : "",
    appaRef ? `APPA Ref: ${appaRef}` : ""
  ].filter(Boolean).join("   ·   ");
  if (refsLine) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 83, 45);
    doc.text(refsLine, 17, y + 5.5);
    y += 12;
  }
  const unlinkedCount = records.filter((r) => !(Number(r.blockId) > 0)).length;
  if (unlinkedCount > 0) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15);
    doc.text(`⚠ ${unlinkedCount} record${unlinkedCount === 1 ? "" : "s"} not linked to a block — included below but excluded from block-level summaries.`, 17, y + 5.5);
    y += 12;
  }
  const tableBody = records.map((r) => [
    dv(r.operationDate),
    resolveBlock(r.blockId),
    String(r.operationType ?? "—"),
    String(r.pruningSystem ?? "—"),
    r.budsPerVineActual != null && r.budsPerVineActual !== "" ? String(r.budsPerVineActual) : "—",
    nv(r.pruningWeightKgPerVine, 3),
    String(r.operatorName ?? "—"),
    nv(r.hoursWorked, 1),
    String(r.notes ?? "—")
  ]);
  autoTable(doc, {
    head: [["Date", "Block", "Operation Type", "Pruning System", "Buds/Vine", "Wt (kg/vine)", "Operator", "Hours", "Notes"]],
    body: tableBody.length ? tableBody : [["", "No records.", "", "", "", "", "", "", ""]],
    startY: y,
    styles: { fontSize: 7.5, cellPadding: 2.5, overflow: "linebreak" },
    headStyles: { fillColor: [75, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 28 },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 28 },
      7: { cellWidth: 16, halign: "right" },
      8: { cellWidth: "auto" }
    },
    margin: { left: 14, right: 14 }
  });
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Prepared by BDE Farm Trac  ·  Pruning & Canopy Operations Register  ·  Retain for GI / PDO compliance", 14, pageH - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 5, { align: "right" });
  }
  doc.save("vine-operations.pdf");
}
async function downloadVineHarvestPdf(records, blocks, farmName, farmMeta, yearLabel) {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    __vitePreload(() => import("./jspdf.es.min-BVdyS7jm.js"), true ? __vite__mapDeps([0,1,2,3,4]) : void 0),
    __vitePreload(() => import("./jspdf.plugin.autotable-rNuKHwSj.js"), true ? [] : void 0)
  ]);
  const jsPDF = jsPDFModule.jsPDF ?? jsPDFModule.default;
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const safeDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeDateTime = (/* @__PURE__ */ new Date()).toLocaleString("en-GB");
  const blockLookup = {};
  blocks.forEach((b) => {
    blockLookup[b.id] = String(b.blockName ?? b.id);
  });
  const resolveBlock = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? blockLookup[bid] ?? "—" : "—";
  };
  const nv = (v, dp = 1) => {
    if (v == null || v === "") return "—";
    const parsed = parseFloat(String(v));
    return isNaN(parsed) ? "—" : parsed.toFixed(dp);
  };
  const dv = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const addressValue = String(farmMeta?.address ?? "").trim();
  const postcodeValue = String(farmMeta?.postcode ?? "").trim();
  const addressParts = [addressValue, postcodeValue].filter(Boolean).join(", ");
  const fsaVineRegisterRef = String(farmMeta?.fsaVineRegisterRef ?? "").trim();
  const fsaWineProductionRef = String(farmMeta?.fsaWineProductionRef ?? "").trim();
  const appaRef = String(farmMeta?.appaRef ?? "").trim();
  const winegbMembershipNumber = String(farmMeta?.winegbMembershipNumber ?? "").trim();
  const missingFields = [
    !addressValue ? "Farm address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !fsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !appaRef ? "APPA Ref" : "",
    !winegbMembershipNumber ? "WineGB Membership No" : ""
  ].filter(Boolean);
  doc.setFillColor(124, 61, 18);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("BDE Farm Trac", 14, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Vineyard Compliance Platform", 14, 16);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Harvest & Vintage Records", pageW - 14, 10, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${safeDate}`, pageW - 14, 16, { align: "right" });
  let y = 26;
  doc.setFillColor(255, 247, 237);
  doc.roundedRect(14, y, pageW - 28, 10, 1, 1, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text(`Farm: ${farmName || "—"}`, 17, y + 7);
  doc.text(`Printed: ${safeDateTime}`, pageW / 2, y + 7, { align: "center" });
  if (addressParts) doc.text(`Address: ${addressParts}`, pageW - 17, y + 7, { align: "right" });
  y += 14;
  if (missingFields.length > 0) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15);
    doc.text(`⚠ Missing: ${missingFields.join(", ")} — update Farm Settings before submitting this report.`, 17, y + 5.5);
    y += 12;
  }
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(251, 146, 60);
  doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(124, 61, 18);
  doc.text(`ℹ ${records.length} record${records.length === 1 ? "" : "s"}${yearLabel ? ` · Year: ${yearLabel}` : ""} — Retain for GI / PDO compliance.`, 17, y + 5.5);
  y += 12;
  const refsLine = [
    fsaVineRegisterRef ? `FSA Vine Reg: ${fsaVineRegisterRef}` : "",
    fsaWineProductionRef ? `FSA Wine Prod: ${fsaWineProductionRef}` : "",
    appaRef ? `APPA Ref: ${appaRef}` : "",
    winegbMembershipNumber ? `WineGB: ${winegbMembershipNumber}` : ""
  ].filter(Boolean).join("   ·   ");
  if (refsLine) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 83, 45);
    doc.text(refsLine, 17, y + 5.5);
    y += 12;
  }
  const unlinkedCount = records.filter((r) => !(Number(r.blockId) > 0)).length;
  if (unlinkedCount > 0) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15);
    doc.text(`⚠ ${unlinkedCount} record${unlinkedCount === 1 ? "" : "s"} not linked to a block — included below but excluded from block-level summaries.`, 17, y + 5.5);
    y += 12;
  }
  const tableBody = records.map((r) => [
    dv(r.harvestDate),
    String(r.vintageYear ?? "—"),
    resolveBlock(r.blockId),
    String(r.harvestMethod ?? "—"),
    nv(r.yieldKg, 1),
    nv(r.yieldTonnesPerHa, 2),
    nv(r.brix, 1),
    nv(r.ph, 2),
    nv(r.titratableAcidityGl, 1),
    nv(r.potentialAlcohol, 1),
    String(r.grapeCondition ?? "—"),
    r.botrytisPresent ? `Yes${r.botrytisPercentage ? ` (${r.botrytisPercentage}%)` : ""}` : "No",
    String(r.operatorName ?? "—"),
    String(r.notes ?? "—")
  ]);
  const totalKg = records.reduce((sum, r) => sum + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
  const average = (field, dp) => {
    const values = records.map((r) => parseFloat(String(r[field] ?? ""))).filter((v) => !isNaN(v));
    return values.length > 0 ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(dp) : "—";
  };
  autoTable(doc, {
    head: [["Harvest Date", "Vintage", "Block", "Method", "Yield (kg)", "t/ha", "Brix °", "pH", "TA (g/L)", "Pot. Alc. %", "Condition", "Botrytis", "Operator", "Notes"]],
    body: tableBody.length ? tableBody : [["No records", "", "", "", "", "", "", "", "", "", "", "", "", ""]],
    startY: y,
    styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [124, 61, 18], textColor: 255, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: [255, 247, 237] },
    columnStyles: {
      0: { cellWidth: 21 },
      1: { cellWidth: 16 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 15, halign: "right" },
      6: { cellWidth: 14, halign: "right" },
      7: { cellWidth: 13, halign: "right" },
      8: { cellWidth: 15, halign: "right" },
      9: { cellWidth: 18, halign: "right" },
      10: { cellWidth: 24 },
      11: { cellWidth: 20 },
      12: { cellWidth: 24 },
      13: { cellWidth: "auto" }
    },
    margin: { left: 14, right: 14 }
  });
  if (records.length > 0) {
    const finalY = (doc.lastAutoTable?.finalY ?? y) + 3;
    autoTable(doc, {
      body: [[
        {
          content: `Farm Totals · ${records.length} pick${records.length === 1 ? "" : "s"}`,
          colSpan: 4
        },
        `${totalKg.toFixed(1)} kg`,
        "",
        `${average("brix", 1)} °`,
        average("ph", 2),
        average("titratableAcidityGl", 1),
        average("potentialAlcohol", 1),
        "",
        "",
        "",
        ""
      ]],
      startY: finalY,
      styles: { fontSize: 7, cellPadding: 2, fontStyle: "bold", fillColor: [255, 237, 213], lineColor: [253, 186, 116], lineWidth: 0.1 },
      columnStyles: {
        4: { cellWidth: 18, halign: "right" },
        5: { cellWidth: 15 },
        6: { cellWidth: 14, halign: "right" },
        7: { cellWidth: 13, halign: "right" },
        8: { cellWidth: 15, halign: "right" },
        9: { cellWidth: 18, halign: "right" },
        10: { cellWidth: 24 },
        11: { cellWidth: 20 },
        12: { cellWidth: 24 },
        13: { cellWidth: "auto" }
      },
      margin: { left: 14, right: 14 },
      theme: "plain"
    });
  }
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Prepared by BDE Farm Trac  ·  Harvest & Vintage Register  ·  Required for GI / PDO vintage declarations", 14, pageH - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 5, { align: "right" });
  }
  doc.save("vine-harvest.pdf");
}
async function printHarvest(records, farmName, farmId, blocks, farmMeta, yearLabel, chemCols, varietyChemCols, vintageSort) {
  const showBrix = chemCols?.avgBrix ?? true;
  const showPh = chemCols?.avgPh ?? true;
  const showTa = chemCols?.avgTa ?? true;
  const showPa = chemCols?.avgPa ?? true;
  const showVarietyBrix = varietyChemCols?.avgBrix ?? true;
  const showVarietyPh = varietyChemCols?.avgPh ?? true;
  const showVarietyTa = varietyChemCols?.avgTa ?? true;
  const showVarietyPa = varietyChemCols?.avgPa ?? true;
  const win = window.open("", "_blank", "width=1100,height=850");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Harvest Records — Loading…</title>
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555}p{font-size:14px}</style>
    </head><body><p>Preparing report…</p></body></html>`);
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const n = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const photoDataUrl = {};
  const photoCaption = {};
  if (farmId && blocks && blocks.length > 0) {
    const blockLookup = {};
    blocks.forEach((b) => {
      blockLookup[b.id] = b;
    });
    const neededBlockIds = [...new Set(
      records.map((r) => Number(r.blockId)).filter((id) => !isNaN(id) && id > 0)
    )];
    await Promise.all(
      neededBlockIds.map(async (blockId) => {
        const block = blockLookup[blockId];
        if (!block) return;
        const photos = block.photos;
        if (!photos || photos.length === 0) return;
        const coverPhoto = photos[0];
        const url = `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${coverPhoto.id}`;
        const dataUrl = await fetchImageAsDataUrl(url);
        if (dataUrl) photoDataUrl[blockId] = dataUrl;
        if (coverPhoto.caption) photoCaption[blockId] = coverPhoto.caption;
      })
    );
  }
  const blockLookup2 = {};
  (blocks ?? []).forEach((b) => {
    blockLookup2[b.id] = b;
  });
  const blockName = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup2[bid]?.blockName ?? id) : "—";
  };
  const hasPhotos = Object.keys(photoDataUrl).length > 0;
  const unlinkedCount = records.filter((r) => !(Number(r.blockId) > 0)).length;
  const _bvGroups = {};
  for (const r of records) {
    const _bid = r.blockId != null ? Number(r.blockId) : null;
    if (!_bid || isNaN(_bid) || _bid <= 0) continue;
    const _bvKey = `${_bid}:${String(r.vintageYear ?? "")}`;
    if (!_bvGroups[_bvKey]) _bvGroups[_bvKey] = [];
    _bvGroups[_bvKey].push(r);
  }
  const _bvTaStats = {};
  const _bvPaStats = {};
  for (const [_bvKey, _grp] of Object.entries(_bvGroups)) {
    const _taVals = _grp.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
    const _paVals = _grp.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
    if (_taVals.length >= 2) {
      const _taMean = _taVals.reduce((a, b) => a + b, 0) / _taVals.length;
      const _taSd = Math.sqrt(_taVals.reduce((s, v) => s + (v - _taMean) ** 2, 0) / _taVals.length);
      _bvTaStats[_bvKey] = { mean: _taMean, sd: _taSd };
    }
    if (_paVals.length >= 2) {
      const _paMean = _paVals.reduce((a, b) => a + b, 0) / _paVals.length;
      const _paSd = Math.sqrt(_paVals.reduce((s, v) => s + (v - _paMean) ** 2, 0) / _paVals.length);
      _bvPaStats[_bvKey] = { mean: _paMean, sd: _paSd };
    }
  }
  const _outlierCellStyle = "text-align:right;background:#fef3c7;color:#92400e;font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact";
  let _anyOutlier = false;
  const rows = records.map((r) => {
    const bid = Number(r.blockId);
    const dataUrl = !isNaN(bid) && bid > 0 ? photoDataUrl[bid] : void 0;
    const caption = !isNaN(bid) && bid > 0 ? photoCaption[bid] ?? "" : "";
    const bName = blockName(r.blockId);
    let photoCell = "";
    if (hasPhotos) {
      photoCell = `<td style="padding:4px 6px;vertical-align:middle;text-align:center;width:76px">
        ${dataUrl ? `<img src="${dataUrl}" alt="Block photo" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #d1d5db;display:block;margin:0 auto 2px" />` : ""}
        <span style="font-size:9.5px;color:#555;display:block;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(bName)}</span>
        ${caption ? `<span style="font-size:9px;color:#666;font-style:italic;display:block;max-width:72px;word-wrap:break-word;line-height:1.3;margin-top:2px">${escHtml(caption)}</span>` : ""}
      </td>`;
    }
    const botrytisCell = r.botrytisPresent ? `<span style="color:#991b1b;font-weight:600">Yes${r.botrytisPercentage ? ` (${r.botrytisPercentage}%)` : ""}</span>` : `<span style="color:#555">No</span>`;
    const _bvKey = !isNaN(bid) && bid > 0 ? `${bid}:${String(r.vintageYear ?? "")}` : "";
    const _taVal = parseFloat(String(r.titratableAcidityGl ?? ""));
    const _paVal = parseFloat(String(r.potentialAlcohol ?? ""));
    const _taStats = _bvKey ? _bvTaStats[_bvKey] : void 0;
    const _paStats = _bvKey ? _bvPaStats[_bvKey] : void 0;
    const _taOutlier = _taStats && !isNaN(_taVal) && _taStats.sd > 0 && Math.abs(_taVal - _taStats.mean) > _taStats.sd;
    const _paOutlier = _paStats && !isNaN(_paVal) && _paStats.sd > 0 && Math.abs(_paVal - _paStats.mean) > _paStats.sd;
    if (_taOutlier) _anyOutlier = true;
    if (_paOutlier) _anyOutlier = true;
    const _taCellStyle = _taOutlier ? _outlierCellStyle : "text-align:right";
    const _paCellStyle = _paOutlier ? _outlierCellStyle : "text-align:right";
    return `<tr>
      ${photoCell}
      <td>${d(r.harvestDate)}</td>
      <td>${escHtml(r.vintageYear)}</td>
      ${hasPhotos ? "" : `<td>${escHtml(bName)}</td>`}
      <td>${escHtml(r.harvestMethod)}</td>
      <td style="text-align:right">${n(r.yieldKg, 1)}</td>
      <td style="text-align:right">${n(r.yieldTonnesPerHa, 2)}</td>
      <td style="text-align:right">${n(r.brix, 1)}</td>
      <td style="text-align:right">${n(r.ph, 2)}</td>
      <td style="${_taCellStyle}">${n(r.titratableAcidityGl, 1)}</td>
      <td style="${_paCellStyle}">${n(r.potentialAlcohol, 1)}</td>
      <td>${escHtml(r.grapeCondition)}</td>
      <td>${botrytisCell}</td>
      <td>${escHtml(r.operatorName)}</td>
      <td>${escHtml(r.notes)}</td>
    </tr>`;
  }).join("");
  const totalKg = records.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
  const detailBrixVals = records.map((r) => parseFloat(String(r.brix ?? ""))).filter((v) => !isNaN(v));
  const detailAvgBrix = detailBrixVals.length > 0 ? detailBrixVals.reduce((a, b) => a + b, 0) / detailBrixVals.length : null;
  const detailPhVals = records.map((r) => parseFloat(String(r.ph ?? ""))).filter((v) => !isNaN(v));
  const detailAvgPh = detailPhVals.length > 0 ? detailPhVals.reduce((a, b) => a + b, 0) / detailPhVals.length : null;
  const detailTaVals = records.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
  const detailAvgTa = detailTaVals.length > 0 ? detailTaVals.reduce((a, b) => a + b, 0) / detailTaVals.length : null;
  const detailPaVals = records.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
  const detailAvgPa = detailPaVals.length > 0 ? detailPaVals.reduce((a, b) => a + b, 0) / detailPaVals.length : null;
  const safeFarmName = escHtml(farmName);
  const harvestAddressValue = String(farmMeta?.address ?? "").trim();
  const harvestPostcodeValue = String(farmMeta?.postcode ?? "").trim();
  const harvestAddressHtml = harvestAddressValue ? [harvestAddressValue, harvestPostcodeValue].filter(Boolean).map(escHtml).join(", ") : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const vintages = [...new Set(records.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse().join(", ");
  const colSpan = 14;
  const harvestFsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const harvestFsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const harvestAppaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const harvestWinegbNumber = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const harvestFsaVineRefHtml = harvestFsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${escHtml(harvestFsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const harvestFsaWineRefHtml = harvestFsaWineProductionRef ? `FSA Wine Production Ref: <strong>${escHtml(harvestFsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const harvestAppaRefHtml = harvestAppaRef ? `APPA Ref: <strong>${escHtml(harvestAppaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const harvestWinegbHtml = harvestWinegbNumber ? `WineGB Membership No: <strong>${escHtml(harvestWinegbNumber)}</strong>` : "";
  const harvestAnyMissingRef = !harvestAddressValue || !harvestFsaVineRegisterRef || !harvestFsaWineProductionRef || !harvestAppaRef || !harvestWinegbNumber;
  const harvestMissingFields = [
    !harvestAddressValue ? "Farm Address" : "",
    !harvestFsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !harvestFsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !harvestAppaRef ? "APPA Ref" : "",
    !harvestWinegbNumber ? "WineGB Membership No" : ""
  ].filter(Boolean).join(", ");
  const harvestMissingRefWarningBlock = harvestAnyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing registration references</strong> &mdash;
        the field(s) marked below (${harvestMissingFields}) have not been set in Farm Settings.
        Add them before submitting this report.
      </div>` : "";
  const uniqueVintages = [...new Set(records.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse();
  const groupByVintage = uniqueVintages.length > 1;
  const blockSummaryMap = {};
  const blockSummaryKeys = [];
  for (const r of records) {
    const bid = r.blockId != null ? Number(r.blockId) : null;
    const key = bid != null && !isNaN(bid) && bid > 0 ? String(bid) : "unknown";
    if (!blockSummaryMap[key]) {
      const bl = bid != null && !isNaN(bid) && bid > 0 ? blockLookup2[bid] : void 0;
      const bName = bl ? String(bl.blockName ?? "—") : bid != null ? String(bid) : "—";
      const variety = bl ? String(bl.variety ?? "—") : "—";
      const areaHa = bl ? parseFloat(String(bl.areaHa ?? "0")) || 0 : 0;
      let photoCell = "";
      if (hasPhotos && bid != null && !isNaN(bid) && bid > 0) {
        const du = photoDataUrl[bid];
        const cap = photoCaption[bid] ?? "";
        photoCell = `<td style="padding:4px 6px;vertical-align:middle;text-align:center;width:76px">
          ${du ? `<img src="${du}" alt="Block photo" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #d1d5db;display:block;margin:0 auto 2px" />` : ""}
          <span style="font-size:9.5px;color:#555;display:block;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(bName)}</span>
          ${cap ? `<span style="font-size:9px;color:#666;font-style:italic;display:block;max-width:72px;word-wrap:break-word;line-height:1.3;margin-top:2px">${escHtml(cap)}</span>` : ""}
        </td>`;
      }
      blockSummaryMap[key] = {
        blockId: bid,
        label: bName,
        variety,
        areaHa,
        picks: 0,
        totalKg: 0,
        brixSum: 0,
        brixCount: 0,
        phSum: 0,
        phCount: 0,
        taSum: 0,
        taCount: 0,
        potAlcSum: 0,
        potAlcCount: 0,
        photoCell
      };
      blockSummaryKeys.push(key);
    }
    const row = blockSummaryMap[key];
    row.picks++;
    row.totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
    const brix = parseFloat(String(r.brix ?? ""));
    if (!isNaN(brix)) {
      row.brixSum += brix;
      row.brixCount++;
    }
    const ph = parseFloat(String(r.ph ?? ""));
    if (!isNaN(ph)) {
      row.phSum += ph;
      row.phCount++;
    }
    const ta = parseFloat(String(r.titratableAcidityGl ?? ""));
    if (!isNaN(ta)) {
      row.taSum += ta;
      row.taCount++;
    }
    const pa = parseFloat(String(r.potentialAlcohol ?? ""));
    if (!isNaN(pa)) {
      row.potAlcSum += pa;
      row.potAlcCount++;
    }
  }
  const topBlockSummaryKey = getTopHarvestBlockKey(
    blockSummaryKeys.map((key) => ({ key, ...blockSummaryMap[key] }))
  );
  const blockSummaryRows = blockSummaryKeys.sort((a, b) => blockSummaryMap[a].label.localeCompare(blockSummaryMap[b].label)).map((key) => {
    const row = blockSummaryMap[key];
    const tha = row.areaHa > 0 ? row.totalKg / 1e3 / row.areaHa : null;
    const isTopRow = key === topBlockSummaryKey;
    const pickBadgeHtml = row.picks === 1 ? ` <span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fbbf24;border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700;white-space:nowrap">&#9888; 1 pick — low confidence</span>` : row.picks <= 3 ? ` <span style="display:inline-block;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;border-radius:3px;padding:1px 5px;font-size:9px;white-space:nowrap">${row.picks} picks</span>` : "";
    const topBadgeHtml = isTopRow ? ` <span style="display:inline-block;background:#d1fae5;color:#047857;border:1px solid #6ee7b7;border-radius:999px;padding:1px 5px;font-size:9px;font-weight:700;white-space:nowrap">Top</span>` : "";
    const topRowStyle = isTopRow ? ` style="background:#ecfdf5;-webkit-print-color-adjust:exact;print-color-adjust:exact"` : "";
    return `<tr${topRowStyle}>
        ${hasPhotos ? row.photoCell : ""}
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600;${isTopRow ? "border-left:3px solid #10b981;" : ""}">${escHtml(row.label)}${topBadgeHtml}${pickBadgeHtml}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;color:#555">${escHtml(row.variety)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.areaHa > 0 ? row.areaHa.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.picks}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:600;font-family:monospace">${row.totalKg > 0 ? row.totalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${tha != null ? tha.toFixed(2) : "—"}</td>
        ${showBrix ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.brixCount > 0 ? (row.brixSum / row.brixCount).toFixed(1) + " °" : "—"}</td>` : ""}
        ${showPh ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.phCount > 0 ? (row.phSum / row.phCount).toFixed(2) : "—"}</td>` : ""}
        ${showTa ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.taCount > 0 ? (row.taSum / row.taCount).toFixed(1) : "—"}</td>` : ""}
        ${showPa ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.potAlcCount > 0 ? (row.potAlcSum / row.potAlcCount).toFixed(1) : "—"}</td>` : ""}
      </tr>`;
  }).join("");
  const summBlockRows = blockSummaryKeys.map((k) => blockSummaryMap[k]);
  const summTotalKg = summBlockRows.reduce((s, r) => s + r.totalKg, 0);
  const summTotalArea = summBlockRows.reduce((s, r) => s + r.areaHa, 0);
  const summTotalPicks = summBlockRows.reduce((s, r) => s + r.picks, 0);
  const summAvgTha = summTotalArea > 0 ? summTotalKg / 1e3 / summTotalArea : null;
  const summBrixRows = summBlockRows.filter((r) => r.brixCount > 0).map((r) => r.brixSum / r.brixCount);
  const summAvgBrix = summBrixRows.length > 0 ? summBrixRows.reduce((a, b) => a + b, 0) / summBrixRows.length : null;
  const summPhRows = summBlockRows.filter((r) => r.phCount > 0).map((r) => r.phSum / r.phCount);
  const summAvgPh = summPhRows.length > 0 ? summPhRows.reduce((a, b) => a + b, 0) / summPhRows.length : null;
  const summTaRows = summBlockRows.filter((r) => r.taCount > 0).map((r) => r.taSum / r.taCount);
  const summAvgTa = summTaRows.length > 0 ? summTaRows.reduce((a, b) => a + b, 0) / summTaRows.length : null;
  const summPaRows = summBlockRows.filter((r) => r.potAlcCount > 0).map((r) => r.potAlcSum / r.potAlcCount);
  const summAvgPa = summPaRows.length > 0 ? summPaRows.reduce((a, b) => a + b, 0) / summPaRows.length : null;
  const bsHiddenChemCols = [showBrix, showPh, showTa, showPa].filter((v) => !v).length;
  const bsColSpan = (hasPhotos ? 11 : 10) - bsHiddenChemCols;
  const bsPhotoHeader = hasPhotos ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;width:76px">Photo</th>` : "";
  const bsPhotoFooterCell = hasPhotos ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>` : "";
  const chemLinkedRecords = records.filter((r) => r.blockId != null && r.blockId !== "");
  const uniqueBlockIdsForCross = [...new Set(records.map((r) => r.blockId).filter((id) => id != null && id !== ""))];
  const showCrossTab = uniqueVintages.length > 1 && uniqueBlockIdsForCross.length > 1;
  let crossTabHtml = "";
  let chemCrossTabHtml = "";
  if (showCrossTab) {
    const crossVintages = [...uniqueVintages].reverse();
    const crossLookup = {};
    for (const r of records) {
      const bid = String(r.blockId ?? "");
      const vy = String(r.vintageYear ?? "");
      if (!crossLookup[bid]) crossLookup[bid] = {};
      if (!crossLookup[bid][vy]) crossLookup[bid][vy] = [];
      crossLookup[bid][vy].push(r);
    }
    const yieldN = crossVintages.length;
    const yieldFontPx = yieldN >= 9 ? 8 : yieldN >= 7 ? 8.5 : yieldN >= 5 ? 9.5 : 10.5;
    const yieldThPad = yieldN >= 9 ? "4px 3px" : yieldN >= 7 ? "5px 3px" : yieldN >= 5 ? "5px 4px" : "6px 5px";
    const yieldTdPad = yieldN >= 9 ? "3px 3px" : yieldN >= 7 ? "4px 3px" : yieldN >= 5 ? "4px 4px" : "5px 5px";
    const vintageColHeaders = crossVintages.map(
      (vy) => `<th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap">${escHtml(vy)} (kg)</th><th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap">${escHtml(vy)} (t/ha)</th>`
    ).join("");
    let anyLowPickYield = false;
    const crossBodyRows = uniqueBlockIdsForCross.map((bid) => {
      const bidStr = String(bid);
      const bidNum = Number(bidStr);
      const label = !isNaN(bidNum) && bidNum > 0 ? String(blockLookup2[bidNum]?.blockName ?? bidStr) : "—";
      const variety = !isNaN(bidNum) && bidNum > 0 ? String(blockLookup2[bidNum]?.variety ?? "—") : "—";
      const areaHa = !isNaN(bidNum) && bidNum > 0 ? parseFloat(String(blockLookup2[bidNum]?.areaHa ?? "0")) || 0 : 0;
      const vintageCells = crossVintages.map((vy) => {
        const grp = crossLookup[bidStr]?.[vy] ?? [];
        const total = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        const tha = total > 0 && areaHa > 0 ? total / 1e3 / areaHa : null;
        const singlePick = grp.length === 1 && total > 0;
        if (singlePick) anyLowPickYield = true;
        const cellBg = singlePick ? ";background:#fffbeb" : "";
        const kgVal = total > 0 ? total.toFixed(0) + (singlePick ? " *" : "") : "—";
        const thaVal = tha != null ? tha.toFixed(2) + (singlePick ? " *" : "") : "—";
        return `<td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-family:monospace${cellBg}">${kgVal}</td><td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-family:monospace;color:#555${cellBg}">${thaVal}</td>`;
      }).join("");
      const allForBlock = Object.values(crossLookup[bidStr] ?? {}).flat();
      const rowTotal = allForBlock.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      const rowTha = rowTotal > 0 && areaHa > 0 ? rowTotal / 1e3 / areaHa : null;
      const brixAll = allForBlock.map((r) => parseFloat(String(r.brix ?? ""))).filter((v) => !isNaN(v));
      const avgBrixRow = brixAll.length > 0 ? brixAll.reduce((a, b) => a + b, 0) / brixAll.length : null;
      const phAll = allForBlock.map((r) => parseFloat(String(r.ph ?? ""))).filter((v) => !isNaN(v));
      const avgPhRow = phAll.length > 0 ? phAll.reduce((a, b) => a + b, 0) / phAll.length : null;
      const taAll = allForBlock.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
      const avgTaRow = taAll.length > 0 ? taAll.reduce((a, b) => a + b, 0) / taAll.length : null;
      const paAll = allForBlock.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
      const avgPaRow = paAll.length > 0 ? paAll.reduce((a, b) => a + b, 0) / paAll.length : null;
      return `<tr>
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;font-weight:600;background:#fff;position:sticky;left:0;z-index:1">${escHtml(label)}</td>
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;color:#555">${escHtml(variety)}</td>
        ${vintageCells}
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-weight:700;font-family:monospace">${rowTotal > 0 ? rowTotal.toFixed(0) : "—"}</td>
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-weight:700;font-family:monospace;color:#555">${rowTha != null ? rowTha.toFixed(2) : "—"}</td>
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgBrixRow != null ? avgBrixRow.toFixed(1) + " °" : "—"}</td>
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgPhRow != null ? avgPhRow.toFixed(2) : "—"}</td>
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgTaRow != null ? avgTaRow.toFixed(1) : "—"}</td>
        <td style="padding:${yieldTdPad};border:1px solid #d1d5db;text-align:right;font-family:monospace;background:#fff;position:sticky;right:0;z-index:1">${avgPaRow != null ? avgPaRow.toFixed(1) : "—"}</td>
      </tr>`;
    }).join("");
    const crossTabBidSet = new Set(uniqueBlockIdsForCross.map((bid) => String(bid)));
    const crossTabRecords = records.filter((r) => crossTabBidSet.has(String(r.blockId ?? "")));
    const footerVintageData = crossVintages.map((vy) => {
      const crossTabRecordsForVintage = crossTabRecords.filter((r) => String(r.vintageYear ?? "") === vy);
      const total = crossTabRecordsForVintage.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      const picks = crossTabRecordsForVintage.length;
      const vintageBlocksWithRecords = uniqueBlockIdsForCross.filter((bid) => (crossLookup[String(bid)]?.[vy] ?? []).length > 0);
      const allHaveArea = vintageBlocksWithRecords.every((bid) => {
        const bidNum = Number(String(bid));
        return !isNaN(bidNum) && bidNum > 0 && (parseFloat(String(blockLookup2[bidNum]?.areaHa ?? "0")) || 0) > 0;
      });
      const vintageAreaSum = allHaveArea ? vintageBlocksWithRecords.reduce((s, bid) => {
        const bidNum = Number(String(bid));
        return s + (parseFloat(String(blockLookup2[bidNum]?.areaHa ?? "0")) || 0);
      }, 0) : 0;
      const vintageTha = allHaveArea && total > 0 && vintageAreaSum > 0 ? total / 1e3 / vintageAreaSum : null;
      return { total, picks, vintageTha };
    });
    const footerVintageCells = footerVintageData.map(
      ({ total, vintageTha }) => `<td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${total > 0 ? total.toFixed(0) : "—"}</td><td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${vintageTha != null ? vintageTha.toFixed(2) : "—"}</td>`
    ).join("");
    const picksFooterVintageCells = footerVintageData.map(({ picks }) => {
      const singlePick = picks === 1;
      const bg = singlePick ? "#fef3c7" : "#f5f5f4";
      const border = singlePick ? "#fbbf24" : "#d6b89a";
      const label = singlePick ? `&#9888; ${picks}` : String(picks);
      return `<td colspan="2" style="padding:${yieldTdPad};border:1px solid ${border};background:${bg};text-align:center;font-family:monospace;font-weight:${singlePick ? 700 : 500};color:${singlePick ? "#92400e" : "#555"}">${label}</td>`;
    }).join("");
    const grandTotalPicks = crossTabRecords.length;
    const grandTotal = crossTabRecords.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
    const allCrossBlocksHaveArea = uniqueBlockIdsForCross.every((bid) => {
      const bidNum = Number(String(bid));
      return !isNaN(bidNum) && bidNum > 0 && (parseFloat(String(blockLookup2[bidNum]?.areaHa ?? "0")) || 0) > 0;
    });
    const grandAreaSum = allCrossBlocksHaveArea ? uniqueBlockIdsForCross.reduce((s, bid) => {
      const bidNum = Number(String(bid));
      return s + (parseFloat(String(blockLookup2[bidNum]?.areaHa ?? "0")) || 0);
    }, 0) : 0;
    const grandTha = allCrossBlocksHaveArea && grandTotal > 0 && grandAreaSum > 0 ? grandTotal / 1e3 / grandAreaSum : null;
    const allBrix = records.map((r) => parseFloat(String(r.brix ?? ""))).filter((v) => !isNaN(v));
    const grandAvgBrix = allBrix.length > 0 ? allBrix.reduce((a, b) => a + b, 0) / allBrix.length : null;
    const allPh = records.map((r) => parseFloat(String(r.ph ?? ""))).filter((v) => !isNaN(v));
    const grandAvgPh = allPh.length > 0 ? allPh.reduce((a, b) => a + b, 0) / allPh.length : null;
    const allTa = records.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
    const grandAvgTa = allTa.length > 0 ? allTa.reduce((a, b) => a + b, 0) / allTa.length : null;
    const allPa = records.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
    const grandAvgPa = allPa.length > 0 ? allPa.reduce((a, b) => a + b, 0) / allPa.length : null;
    crossTabHtml = `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">Block &times; Vintage &mdash; Total Yield</h2>
  <table style="width:100%;border-collapse:collapse;font-size:${yieldFontPx}px;margin-bottom:18px">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:left;white-space:nowrap;position:sticky;left:0;z-index:2">Block</th>
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:left;white-space:nowrap">Variety</th>
      ${vintageColHeaders}
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap">Total (kg)</th>
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap">Total (t/ha)</th>
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap">Avg Brix &deg;</th>
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap">Avg pH</th>
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap">Avg TA (g/L)</th>
      <th style="background:#7c3d12;color:white;padding:${yieldThPad};text-align:right;white-space:nowrap;position:sticky;right:0;z-index:2">Avg Pot. Alc %</th>
    </tr></thead>
    <tbody>${crossBodyRows}</tbody>
    <tfoot>
    <tr>
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;font-weight:700;position:sticky;left:0;z-index:1">All blocks</td>
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5"></td>
      ${footerVintageCells}
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${grandTotal > 0 ? grandTotal.toFixed(0) : "—"}</td>
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${grandTha != null ? grandTha.toFixed(2) : "—"}</td>
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgBrix != null ? grandAvgBrix.toFixed(1) + " °" : "—"}</td>
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgPh != null ? grandAvgPh.toFixed(2) : "—"}</td>
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgTa != null ? grandAvgTa.toFixed(1) : "—"}</td>
      <td style="padding:${yieldTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace;position:sticky;right:0;z-index:1">${grandAvgPa != null ? grandAvgPa.toFixed(1) : "—"}</td>
    </tr>
    <tr>
      <td style="padding:${yieldTdPad};border:1px solid #d6b89a;background:#f5f5f4;font-weight:600;color:#555;font-size:${yieldFontPx - 0.5}px;position:sticky;left:0;z-index:1">Picks</td>
      <td style="padding:${yieldTdPad};border:1px solid #d6b89a;background:#f5f5f4"></td>
      ${picksFooterVintageCells}
      <td colspan="2" style="padding:${yieldTdPad};border:1px solid #d6b89a;background:#f5f5f4;text-align:center;font-family:monospace;font-weight:600;color:#555">${grandTotalPicks}</td>
      <td colspan="4" style="padding:${yieldTdPad};border:1px solid #d6b89a;background:#f5f5f4;font-size:${yieldFontPx - 1}px;color:#888">&#9888; = single pick &mdash; treat totals with caution</td>
    </tr>
    </tfoot>
  </table>
  ${anyLowPickYield ? `<p style="font-size:9.5px;color:#92400e;margin:4px 0 18px;background:#fffbeb;border:1px solid #fbbf24;border-radius:3px;padding:3px 8px;display:inline-block"><strong>*</strong> Based on a single harvest pick &mdash; treat yield figures with caution</p>` : ""}`;
  }
  {
    const chemLinkedVintages = [...new Set(chemLinkedRecords.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort();
    const chemLinkedBlockIds = [...new Set(chemLinkedRecords.map((r) => r.blockId))];
    const showChemCrossTab = chemLinkedVintages.length >= 2 && chemLinkedBlockIds.length >= 2 && (showBrix || showPh || showTa || showPa);
    if (showChemCrossTab) {
      const chemCrossLookup = {};
      for (const r of chemLinkedRecords) {
        const bid = String(r.blockId ?? "");
        const vy = String(r.vintageYear ?? "");
        if (!chemCrossLookup[bid]) chemCrossLookup[bid] = {};
        if (!chemCrossLookup[bid][vy]) chemCrossLookup[bid][vy] = [];
        chemCrossLookup[bid][vy].push(r);
      }
      const chemPrintMetrics = [
        ...showBrix ? [{ label: "Avg Brix °", precision: 1, extractor: (r) => {
          const v = parseFloat(String(r.brix ?? ""));
          return isNaN(v) ? null : v;
        } }] : [],
        ...showPh ? [{ label: "Avg pH", precision: 2, extractor: (r) => {
          const v = parseFloat(String(r.ph ?? ""));
          return isNaN(v) ? null : v;
        } }] : [],
        ...showTa ? [{ label: "Avg TA (g/L)", precision: 2, extractor: (r) => {
          const v = parseFloat(String(r.titratableAcidityGl ?? ""));
          return isNaN(v) ? null : v;
        } }] : [],
        ...showPa ? [{ label: "Avg Pot. Alc %", precision: 2, extractor: (r) => {
          const v = parseFloat(String(r.potentialAlcohol ?? ""));
          return isNaN(v) ? null : v;
        } }] : []
      ];
      const chemN = chemLinkedVintages.length;
      const chemFontPx = chemN >= 11 ? 8.5 : chemN >= 8 ? 9.5 : 10.5;
      const chemThPad = chemN >= 11 ? "5px 3px" : chemN >= 8 ? "5px 4px" : "6px 5px";
      const chemTdPad = chemN >= 11 ? "3px 3px" : chemN >= 8 ? "4px 4px" : "5px 5px";
      let anyLowPickChem = false;
      const chemPicksByVintage = chemLinkedVintages.map(
        (vy) => chemLinkedRecords.filter((r) => String(r.vintageYear ?? "") === vy).length
      );
      let anyChemOutlier = false;
      const chemSubTablesHtml = chemPrintMetrics.map((metric) => {
        const isOutlierMetric = isChemistryCrossVintageOutlierMetric(metric.label);
        const chemOutlierStatsByBlock = {};
        if (isOutlierMetric) {
          for (const bid of chemLinkedBlockIds) {
            const bidStr = String(bid);
            const vintageAverages = chemLinkedVintages.map((vy) => {
              const vals = (chemCrossLookup[bidStr]?.[vy] ?? []).map(metric.extractor).filter((v) => v !== null);
              return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            }).filter((v) => v !== null);
            chemOutlierStatsByBlock[bidStr] = buildChemistryCrossVintageStats(vintageAverages);
          }
        }
        const vintageHeaders = chemLinkedVintages.map(
          (vy) => `<th style="background:#7c3d12;color:white;padding:${chemThPad};text-align:right;white-space:nowrap">${escHtml(vy)}</th>`
        ).join("");
        const chemBodyRows = chemLinkedBlockIds.map((bid) => {
          const bidStr = String(bid);
          const bidNum = Number(bidStr);
          const label = !isNaN(bidNum) && bidNum > 0 ? String(blockLookup2[bidNum]?.blockName ?? bidStr) : "—";
          const variety = !isNaN(bidNum) && bidNum > 0 ? String(blockLookup2[bidNum]?.variety ?? "—") : "—";
          const vintageCells = chemLinkedVintages.map((vy) => {
            const grp = chemCrossLookup[bidStr]?.[vy] ?? [];
            const vals = grp.map(metric.extractor).filter((v) => v !== null);
            const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            const lowPick = avg != null && grp.length === 1;
            if (lowPick) anyLowPickChem = true;
            const outlierStats = chemOutlierStatsByBlock[bidStr];
            const outlier = isOutlierMetric && isChemistryCrossVintageOutlier(avg, outlierStats);
            if (outlier) anyChemOutlier = true;
            const bgStyle = outlier ? CHEMISTRY_CROSS_TAB_OUTLIER_CELL_STYLE : lowPick ? ";background:#fffbeb" : "";
            const cellValue = avg != null ? avg.toFixed(metric.precision) + (lowPick ? " *" : "") : "—";
            return `<td style="padding:${chemTdPad};border:1px solid #d1d5db;text-align:right;font-family:monospace${bgStyle}">${cellValue}</td>`;
          }).join("");
          const allForBlock = Object.values(chemCrossLookup[bidStr] ?? {}).flat();
          const allValsForBlock = allForBlock.map(metric.extractor).filter((v) => v !== null);
          const rowAvg = allValsForBlock.length > 0 ? allValsForBlock.reduce((a, b) => a + b, 0) / allValsForBlock.length : null;
          return `<tr>
            <td style="padding:${chemTdPad};border:1px solid #d1d5db;font-weight:600">${escHtml(label)}</td>
            <td style="padding:${chemTdPad};border:1px solid #d1d5db;color:#555">${escHtml(variety)}</td>
            ${vintageCells}
            <td style="padding:${chemTdPad};border:1px solid #d1d5db;text-align:right;font-weight:700;font-family:monospace">${rowAvg != null ? rowAvg.toFixed(metric.precision) : "—"}</td>
          </tr>`;
        }).join("");
        const footerVintageCells = chemLinkedVintages.map((vy) => {
          const vals = chemLinkedRecords.filter((r) => String(r.vintageYear ?? "") === vy).map(metric.extractor).filter((v) => v !== null);
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          return `<td style="padding:${chemTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${avg != null ? avg.toFixed(metric.precision) : "—"}</td>`;
        }).join("");
        const allValsGrand = chemLinkedRecords.map(metric.extractor).filter((v) => v !== null);
        const grandAvgMetric = allValsGrand.length > 0 ? allValsGrand.reduce((a, b) => a + b, 0) / allValsGrand.length : null;
        return `
  <h3 style="font-size:11px;font-weight:700;margin:0 0 4px;color:#7c3d12">${escHtml(metric.label)} &mdash; Block &times; Vintage</h3>
  <table style="width:100%;border-collapse:collapse;font-size:${chemFontPx}px;margin-bottom:14px">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:${chemThPad};text-align:left;white-space:nowrap">Block</th>
      <th style="background:#7c3d12;color:white;padding:${chemThPad};text-align:left;white-space:nowrap">Variety</th>
      ${vintageHeaders}
      <th style="background:#7c3d12;color:white;padding:${chemThPad};text-align:right;white-space:nowrap">Avg All Vintages</th>
    </tr></thead>
    <tbody>${chemBodyRows}</tbody>
    <tfoot><tr>
      <td style="padding:${chemTdPad};border:1px solid #fdba74;background:#ffedd5;font-weight:700">All blocks</td>
      <td style="padding:${chemTdPad};border:1px solid #fdba74;background:#ffedd5"></td>
      ${footerVintageCells}
      <td style="padding:${chemTdPad};border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgMetric != null ? grandAvgMetric.toFixed(metric.precision) : "—"}</td>
    </tr></tfoot>
  </table>`;
      }).join("");
      const chemPicksRowHtml = `
  <table style="width:100%;border-collapse:collapse;font-size:${chemFontPx}px;margin:-6px 0 14px">
    <tbody><tr>
      <td colspan="2" style="padding:${chemTdPad};border:1px solid #d6b89a;background:#f5f5f4;font-weight:600;color:#555">Picks</td>
      ${chemPicksByVintage.map((picks) => {
        const singlePick = picks === 1;
        const bg = singlePick ? "#fef3c7" : "#f5f5f4";
        const border = singlePick ? "#fbbf24" : "#d6b89a";
        const label = singlePick ? `&#9888; ${picks}` : picks > 0 ? String(picks) : "—";
        return `<td style="padding:${chemTdPad};border:1px solid ${border};background:${bg};text-align:right;font-family:monospace;font-weight:${singlePick ? 700 : 500};color:${singlePick ? "#92400e" : "#555"}">${label}</td>`;
      }).join("")}
      <td style="padding:${chemTdPad};border:1px solid #d6b89a;background:#f5f5f4;text-align:right;font-family:monospace;font-weight:600;color:#555">${chemLinkedRecords.length > 0 ? chemLinkedRecords.length : "—"}</td>
    </tr></tbody>
  </table>`;
      const chemLowPickLegend = anyLowPickChem ? `<p style="font-size:9.5px;color:#92400e;margin:4px 0 0;background:#fffbeb;border:1px solid #fbbf24;border-radius:3px;padding:3px 8px;display:inline-block"><strong>*</strong> Based on a single harvest pick &mdash; treat with caution</p>` : "";
      const chemOutlierLegend = anyChemOutlier ? `<p style="font-size:9.5px;color:#92400e;margin:4px 0 0;background:#fef3c7;border:1px solid #fbbf24;border-radius:3px;padding:3px 8px;font-weight:700;display:inline-block;-webkit-print-color-adjust:exact;print-color-adjust:exact">${CHEMISTRY_CROSS_TAB_OUTLIER_LEGEND}</p>` : "";
      chemCrossTabHtml = `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em;page-break-before:${uniqueBlockIdsForCross.length * uniqueVintages.length > 8 ? "always" : "avoid"}">Chemistry Cross-tab &mdash; Block &times; Vintage</h2>
  <p style="font-size:10px;color:#666;margin:0 0 8px">Average chemistry values per block per vintage. Footer row shows the record-weighted average across all linked blocks for that vintage.</p>
  ${chemSubTablesHtml}
  ${chemPicksRowHtml}
  ${chemOutlierLegend}
  ${chemLowPickLegend}`;
    }
  }
  const _allFarmBlockIds = Object.keys(blockLookup2).map(Number).filter((id) => !isNaN(id) && id > 0);
  const _bvariety = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup2[bid]?.variety ?? "") : "";
  };
  const _allFarmBlockNames = _allFarmBlockIds.map(String);
  const _blockVarietyByName = Object.fromEntries(
    _allFarmBlockNames.map((name, index) => [name, _bvariety(_allFarmBlockIds[index])])
  );
  const _varietyColorMap = buildVarietyColorMap(Object.values(_blockVarietyByName));
  const sharedBlockColorMap = buildUniqueBlockColorMap(
    _allFarmBlockNames,
    _blockVarietyByName,
    _varietyColorMap
  );
  const yieldChartSvgHtml = showCrossTab ? buildYieldTrendChartSvg(records, blockLookup2, sharedBlockColorMap) : "";
  const { svg: yieldTHaChartSvgHtml, excludedBlocks: tHaExcludedBlocks, eligibleBlockCount: tHaEligibleBlockCount } = groupByVintage ? buildYieldTrendChartTHaSvg(records, blockLookup2, sharedBlockColorMap) : { svg: "", excludedBlocks: [], eligibleBlockCount: 0 };
  let vintageSummaryHtml = "";
  if (groupByVintage) {
    const vintageObj = {};
    const vintageBlockIds = {};
    for (const r of records) {
      const yr = String(r.vintageYear ?? "Unknown");
      if (!vintageObj[yr]) vintageObj[yr] = { picks: 0, totalKg: 0, brixSum: 0, brixCount: 0, phSum: 0, phCount: 0, taSum: 0, taCount: 0, paSum: 0, paCount: 0 };
      if (!vintageBlockIds[yr]) vintageBlockIds[yr] = /* @__PURE__ */ new Set();
      vintageObj[yr].picks++;
      vintageObj[yr].totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
      const bid = Number(r.blockId);
      if (!isNaN(bid) && bid > 0) vintageBlockIds[yr].add(bid);
      const brix = parseFloat(String(r.brix ?? ""));
      if (!isNaN(brix)) {
        vintageObj[yr].brixSum += brix;
        vintageObj[yr].brixCount++;
      }
      const ph = parseFloat(String(r.ph ?? ""));
      if (!isNaN(ph)) {
        vintageObj[yr].phSum += ph;
        vintageObj[yr].phCount++;
      }
      const ta = parseFloat(String(r.titratableAcidityGl ?? ""));
      if (!isNaN(ta)) {
        vintageObj[yr].taSum += ta;
        vintageObj[yr].taCount++;
      }
      const pa = parseFloat(String(r.potentialAlcohol ?? ""));
      if (!isNaN(pa)) {
        vintageObj[yr].paSum += pa;
        vintageObj[yr].paCount++;
      }
    }
    const vintageTha = (yr) => {
      const blockIds = vintageBlockIds[yr] ?? /* @__PURE__ */ new Set();
      let totalArea = 0;
      for (const bid of blockIds) {
        const bl = blockLookup2[bid];
        if (bl) totalArea += parseFloat(String(bl.areaHa ?? "0")) || 0;
      }
      const vkg = vintageObj[yr]?.totalKg ?? 0;
      return totalArea > 0 && vkg > 0 ? vkg / 1e3 / totalArea : null;
    };
    const vsAllBrix = records.map((r) => parseFloat(String(r.brix ?? ""))).filter((v) => !isNaN(v));
    const vsGrandAvgBrix = vsAllBrix.length > 0 ? vsAllBrix.reduce((a, b) => a + b, 0) / vsAllBrix.length : null;
    const vsAllPh = records.map((r) => parseFloat(String(r.ph ?? ""))).filter((v) => !isNaN(v));
    const vsGrandAvgPh = vsAllPh.length > 0 ? vsAllPh.reduce((a, b) => a + b, 0) / vsAllPh.length : null;
    const vsAllTa = records.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
    const vsGrandAvgTa = vsAllTa.length > 0 ? vsAllTa.reduce((a, b) => a + b, 0) / vsAllTa.length : null;
    const vsAllPa = records.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
    const vsGrandAvgPa = vsAllPa.length > 0 ? vsAllPa.reduce((a, b) => a + b, 0) / vsAllPa.length : null;
    const allBlockIds = /* @__PURE__ */ new Set();
    for (const yr of uniqueVintages) {
      for (const bid of vintageBlockIds[yr] ?? /* @__PURE__ */ new Set()) allBlockIds.add(bid);
    }
    const grandTotalArea = [...allBlockIds].reduce((s, bid) => s + (parseFloat(String(blockLookup2[bid]?.areaHa ?? "0")) || 0), 0);
    const grandTha = grandTotalArea > 0 && totalKg > 0 ? totalKg / 1e3 / grandTotalArea : null;
    const vintageSortDirection = vintageSort?.dir === "asc" ? 1 : -1;
    const vintageNumericCols = /* @__PURE__ */ new Set(["picks", "totalKg", "derivedTha", "avgBrix", "avgPh", "avgTa", "avgPa"]);
    const vintageSortValue = (v, col, vintageYear) => {
      switch (col) {
        case "picks":
          return v.picks;
        case "totalKg":
          return v.totalKg;
        case "derivedTha":
          return vintageTha(vintageYear) ?? NaN;
        case "avgBrix":
          return v.brixCount > 0 ? v.brixSum / v.brixCount : NaN;
        case "avgPh":
          return v.phCount > 0 ? v.phSum / v.phCount : NaN;
        case "avgTa":
          return v.taCount > 0 ? v.taSum / v.taCount : NaN;
        case "avgPa":
          return v.paCount > 0 ? v.paSum / v.paCount : NaN;
        default:
          return NaN;
      }
    };
    const sortedVintageKeys = [...uniqueVintages].sort((a, b) => {
      const aEntry = vintageObj[a];
      const bEntry = vintageObj[b];
      if (!aEntry || !bEntry || !vintageSort || !vintageNumericCols.has(vintageSort.col)) return 0;
      const aValue = vintageSortValue(aEntry, vintageSort.col, a);
      const bValue = vintageSortValue(bEntry, vintageSort.col, b);
      const aMissing = isNaN(aValue);
      const bMissing = isNaN(bValue);
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      return vintageSortDirection * (aValue - bValue);
    });
    const topVintage = vintageSort && vintageNumericCols.has(vintageSort.col) && sortedVintageKeys.length > 0 ? sortedVintageKeys[0] : null;
    const vintageRows = uniqueVintages.map((yr) => {
      const v = vintageObj[yr] ?? { picks: 0, totalKg: 0, brixSum: 0, brixCount: 0, phSum: 0, phCount: 0, taSum: 0, taCount: 0, paSum: 0, paCount: 0 };
      const tha = vintageTha(yr);
      const isTopVintage = topVintage === yr;
      const vintageRowStyle = isTopVintage ? "background:#ecfdf5;-webkit-print-color-adjust:exact;print-color-adjust:exact" : "";
      const topBadgeHtml = isTopVintage ? ` <span style="display:inline-block;background:#d1fae5;color:#047857;border:1px solid #6ee7b7;border-radius:999px;padding:1px 6px;font-size:9px;font-weight:700;white-space:nowrap;-webkit-print-color-adjust:exact;print-color-adjust:exact">Top</span>` : "";
      const vPickBadgeHtml = v.picks === 1 ? ` <span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fbbf24;border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700;white-space:nowrap">&#9888; 1 pick — low confidence</span>` : v.picks <= 3 ? ` <span style="display:inline-block;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;border-radius:3px;padding:1px 5px;font-size:9px;white-space:nowrap">${v.picks} picks</span>` : "";
      return `<tr style="${vintageRowStyle}">
        <td style="padding:5px 5px;border:1px solid #d1d5db;border-left:${isTopVintage ? "3px solid #10b981" : "1px solid #d1d5db"};font-weight:600;color:#7c3d12">${escHtml(yr)}${topBadgeHtml}${vPickBadgeHtml}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${v.picks}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:600;font-family:monospace">${v.totalKg > 0 ? v.totalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:600;font-family:monospace">${tha != null ? tha.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${v.brixCount > 0 ? (v.brixSum / v.brixCount).toFixed(1) + " °" : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${v.phCount > 0 ? (v.phSum / v.phCount).toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${v.taCount > 0 ? (v.taSum / v.taCount).toFixed(1) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${v.paCount > 0 ? (v.paSum / v.paCount).toFixed(1) : "—"}</td>
      </tr>`;
    }).join("");
    const vsTotalPicks = records.length;
    vintageSummaryHtml = `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">Yield Summary &mdash; by Vintage Year</h2>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:18px">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left">Vintage</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Picks</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Total Yield (kg)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Yield (t/ha)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Avg Brix &deg;</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Avg pH</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Avg TA (g/L)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Avg Pot. Alc %</th>
    </tr></thead>
    <tbody>${vintageRows}</tbody>
    <tfoot><tr>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700">All Vintages</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${vsTotalPicks}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700">${totalKg.toFixed(0)} kg</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${grandTha != null ? grandTha.toFixed(2) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandAvgBrix != null ? vsGrandAvgBrix.toFixed(1) + " °" : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandAvgPh != null ? vsGrandAvgPh.toFixed(2) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandAvgTa != null ? vsGrandAvgTa.toFixed(1) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandAvgPa != null ? vsGrandAvgPa.toFixed(1) : "—"}</td>
    </tr></tfoot>
  </table>`;
  }
  const VARIETY_UNKNOWN_KEY = "Unknown / Not linked";
  const varietyMap2 = {};
  for (const r of records) {
    const bid = r.blockId != null ? Number(r.blockId) : null;
    const block = bid != null && !isNaN(bid) && bid > 0 ? blockLookup2[bid] : void 0;
    const variety = block ? String(block.variety ?? "").trim() : "";
    const key = variety || VARIETY_UNKNOWN_KEY;
    if (!varietyMap2[key]) varietyMap2[key] = { totalKg: 0, totalHa: 0, blockIds: /* @__PURE__ */ new Set(), brixSum: 0, brixCount: 0, phSum: 0, phCount: 0, taSum: 0, taCount: 0, paSum: 0, paCount: 0 };
    const vEntry = varietyMap2[key];
    vEntry.totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
    if (block && bid != null && !isNaN(bid) && bid > 0 && !vEntry.blockIds.has(bid)) {
      vEntry.blockIds.add(bid);
      const ha = parseFloat(String(block.areaHa ?? block.area ?? ""));
      if (!isNaN(ha) && ha > 0) vEntry.totalHa += ha;
    }
    const brix = parseFloat(String(r.brix ?? ""));
    if (!isNaN(brix)) {
      vEntry.brixSum += brix;
      vEntry.brixCount++;
    }
    const ph = parseFloat(String(r.ph ?? ""));
    if (!isNaN(ph)) {
      vEntry.phSum += ph;
      vEntry.phCount++;
    }
    const ta = parseFloat(String(r.titratableAcidityGl ?? ""));
    if (!isNaN(ta)) {
      vEntry.taSum += ta;
      vEntry.taCount++;
    }
    const pa = parseFloat(String(r.potentialAlcohol ?? ""));
    if (!isNaN(pa)) {
      vEntry.paSum += pa;
      vEntry.paCount++;
    }
  }
  const namedVarietyKeys2 = Object.keys(varietyMap2).filter((k) => k !== VARIETY_UNKNOWN_KEY);
  let varietySummaryHtml = "";
  if (namedVarietyKeys2.length >= 2) {
    const sortedVarietyEntries = Object.entries(varietyMap2).sort(([a], [b]) => {
      if (a === VARIETY_UNKNOWN_KEY) return 1;
      if (b === VARIETY_UNKNOWN_KEY) return -1;
      return a.localeCompare(b);
    });
    let anyVarietyHasArealessBlocks = false;
    const varietyBodyRows = sortedVarietyEntries.map(([variety, e]) => {
      const tPerHa = e.totalHa > 0 && e.totalKg > 0 ? e.totalKg / 1e3 / e.totalHa : null;
      const hasArealessBlocks = e.totalKg > 0 && e.blockIds.size > 0 && e.totalHa === 0;
      if (hasArealessBlocks) anyVarietyHasArealessBlocks = true;
      const tPerHaCell = tPerHa != null ? tPerHa.toFixed(2) : hasArealessBlocks ? "†" : "—";
      const avgBrix = e.brixCount > 0 ? e.brixSum / e.brixCount : null;
      const avgPh = e.phCount > 0 ? e.phSum / e.phCount : null;
      const avgTa = e.taCount > 0 ? e.taSum / e.taCount : null;
      const avgPa = e.paCount > 0 ? e.paSum / e.paCount : null;
      return `<tr>
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(variety)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${e.totalHa > 0 ? e.totalHa.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:600;font-family:monospace">${e.totalKg > 0 ? e.totalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${tPerHaCell}</td>
        ${showVarietyBrix ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgBrix != null ? avgBrix.toFixed(1) + " °" : "—"}</td>` : ""}
        ${showVarietyPh ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgPh != null ? avgPh.toFixed(2) : "—"}</td>` : ""}
        ${showVarietyTa ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgTa != null ? avgTa.toFixed(1) : "—"}</td>` : ""}
        ${showVarietyPa ? `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgPa != null ? avgPa.toFixed(1) : "—"}</td>` : ""}
      </tr>`;
    }).join("");
    const vsGrandKg2 = sortedVarietyEntries.reduce((s, [, e]) => s + e.totalKg, 0);
    const rowsWithArea2 = sortedVarietyEntries.filter(([, e]) => e.totalHa > 0);
    const vsGrandHa2 = rowsWithArea2.reduce((s, [, e]) => s + e.totalHa, 0);
    const vsGrandKgForArea2 = rowsWithArea2.reduce((s, [, e]) => s + e.totalKg, 0);
    const vsGrandHaForTha2 = rowsWithArea2.reduce((s, [, e]) => s + e.totalHa, 0);
    const vsGrandKgPerHa2 = vsGrandHaForTha2 > 0 && vsGrandKgForArea2 > 0 ? vsGrandKgForArea2 / 1e3 / vsGrandHaForTha2 : null;
    const vsGrandTPerHaCell = vsGrandKgPerHa2 != null ? vsGrandKgPerHa2.toFixed(2) : anyVarietyHasArealessBlocks ? "†" : "—";
    const vsBrixAll2 = records.map((r) => parseFloat(String(r.brix ?? ""))).filter((v) => !isNaN(v));
    const vsGrandBrix2 = vsBrixAll2.length > 0 ? vsBrixAll2.reduce((a, b) => a + b, 0) / vsBrixAll2.length : null;
    const vsPhAll2 = records.map((r) => parseFloat(String(r.ph ?? ""))).filter((v) => !isNaN(v));
    const vsGrandPh2 = vsPhAll2.length > 0 ? vsPhAll2.reduce((a, b) => a + b, 0) / vsPhAll2.length : null;
    const vsTaAll2 = records.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
    const vsGrandTa2 = vsTaAll2.length > 0 ? vsTaAll2.reduce((a, b) => a + b, 0) / vsTaAll2.length : null;
    const vsPaAll2 = records.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
    const vsGrandPa2 = vsPaAll2.length > 0 ? vsPaAll2.reduce((a, b) => a + b, 0) / vsPaAll2.length : null;
    const vsArealessFootnote = anyVarietyHasArealessBlocks ? `<p style="font-size:9.5px;color:#92400e;margin:4px 0 18px;background:#fef3c7;border:1px solid #fbbf24;border-radius:3px;padding:3px 8px;display:inline-block"><strong>†</strong> Block area not set — add it in Block Settings to see yield per hectare</p>` : "";
    varietySummaryHtml = `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">Yield by Variety</h2>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:${anyVarietyHasArealessBlocks ? "4px" : "18px"}">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Variety</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Area (ha)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Total Yield (kg)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Yield (t/ha)</th>
      ${showVarietyBrix ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Brix &deg;</th>` : ""}
      ${showVarietyPh ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg pH</th>` : ""}
      ${showVarietyTa ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg TA (g/L)</th>` : ""}
      ${showVarietyPa ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Pot. Alc %</th>` : ""}
    </tr></thead>
    <tbody>${varietyBodyRows}</tbody>
    <tfoot><tr>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700">All Varieties</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${vsGrandHa2 > 0 ? vsGrandHa2.toFixed(2) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${vsGrandKg2 > 0 ? vsGrandKg2.toFixed(0) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${vsGrandTPerHaCell}</td>
      ${showVarietyBrix ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandBrix2 != null ? vsGrandBrix2.toFixed(1) + " °" : "—"}</td>` : ""}
      ${showVarietyPh ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandPh2 != null ? vsGrandPh2.toFixed(2) : "—"}</td>` : ""}
      ${showVarietyTa ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandTa2 != null ? vsGrandTa2.toFixed(1) : "—"}</td>` : ""}
      ${showVarietyPa ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandPa2 != null ? vsGrandPa2.toFixed(1) : "—"}</td>` : ""}
    </tr></tfoot>
  </table>
  ${vsArealessFootnote}`;
  }
  const summaryHtml = records.length > 0 ? `
  ${vintageSummaryHtml}
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">
    Yield Summary by Block
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:18px">
    <thead>
      <tr>
        ${bsPhotoHeader}
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Block</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Variety</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Area (ha)</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Picks</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Total Yield (kg)</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Yield (t/ha)</th>
        ${showBrix ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Brix &deg;</th>` : ""}
        ${showPh ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg pH</th>` : ""}
        ${showTa ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg TA (g/L)</th>` : ""}
        ${showPa ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Pot. Alc %</th>` : ""}
      </tr>
    </thead>
    <tbody>${blockSummaryRows || `<tr><td colspan='${bsColSpan}' style='padding:10px;text-align:center;color:#888'>No records</td></tr>`}</tbody>
    <tfoot>
      <tr>
        ${bsPhotoFooterCell}
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700" colspan="2">Farm Totals / Averages</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalArea > 0 ? summTotalArea.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalPicks}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalKg > 0 ? summTotalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgTha != null ? summAvgTha.toFixed(2) : "—"}</td>
        ${showBrix ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgBrix != null ? summAvgBrix.toFixed(1) + " °" : "—"}</td>` : ""}
        ${showPh ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgPh != null ? summAvgPh.toFixed(2) : "—"}</td>` : ""}
        ${showTa ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgTa != null ? summAvgTa.toFixed(1) : "—"}</td>` : ""}
        ${showPa ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgPa != null ? summAvgPa.toFixed(1) : "—"}</td>` : ""}
      </tr>
    </tfoot>
  </table>
  ${varietySummaryHtml}
  ${uniqueBlockIdsForCross.length * uniqueVintages.length <= 8 ? `<div style="page-break-inside:avoid">${crossTabHtml}${chemCrossTabHtml}</div>` : `${crossTabHtml}${chemCrossTabHtml}`}
  ${yieldChartSvgHtml || yieldTHaChartSvgHtml || groupByVintage && tHaEligibleBlockCount < 2 ? `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em;page-break-before:${uniqueBlockIdsForCross.length * uniqueVintages.length > 8 ? "always" : "avoid"}">Yield by Block &times; Vintage</h2>
  ${yieldChartSvgHtml ? `
  <p style="font-size:10px;color:#666;margin:0 0 6px">Bars show total yield (kg) per block per vintage; dashed trend lines connect each block's performance across vintages.</p>
  <div style="margin-bottom:14px">${yieldChartSvgHtml}</div>` : ""}
  ${yieldTHaChartSvgHtml ? `
  <p style="font-size:10px;color:#666;margin:0 0 6px">Yield per hectare (t/ha) &mdash; normalised by block area so blocks of different sizes can be compared fairly. Bars show t/ha per block per vintage; dashed trend lines track each block across vintages.${tHaExcludedBlocks.length > 0 ? ` <em>Excluded (no area recorded): ${tHaExcludedBlocks.map((b) => escHtml(b)).join(", ")}.</em>` : ""}</p>
  <div style="margin-bottom:18px">${yieldTHaChartSvgHtml}</div>` : ""}
  ${groupByVintage && !yieldTHaChartSvgHtml ? `<p style="font-size:10px;color:#92400e;background:#fef3c7;border:1px solid #fbbf24;border-radius:3px;padding:5px 8px;margin:0 0 12px">&#9888; t/ha chart not shown &mdash; fewer than 2 blocks have a recorded area (${tHaEligibleBlockCount} of ${[...new Set(records.filter((r) => r.blockId != null && r.blockId !== "").map((r) => r.blockId))].length} linked blocks). Add areas in the Vineyard Block settings to enable fair per-hectare comparison.${tHaExcludedBlocks.length > 0 ? ` Blocks without an area: ${tHaExcludedBlocks.map((b) => escHtml(b)).join(", ")}.` : ""}</p>` : ""}` : ""}
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">
    Detailed Records
  </h2>
  ` : "";
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Harvest &amp; Vintage Records &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; }
    h1 { font-size: 17px; margin: 0 0 2px; color: #7c3d12; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7c3d12; padding-bottom: 10px; margin-bottom: 14px; }
    .meta { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.5; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .missing-refs-notice { background: #fffbeb; border: 1px solid #fbbf24; color: #92400e; border-radius: 4px; padding: 7px 12px; font-size: 11px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; break-inside: avoid; }
    h2, h3 { page-break-after: avoid; break-after: avoid; }
    th { background: #7c3d12; color: white; padding: 6px 5px; text-align: left; white-space: nowrap; }
    td { padding: 5px 5px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #fff7ed; }
    .tfoot td { font-weight: 700; background: #ffedd5; border-color: #fdba74; }
    .footer { margin-top: 16px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 7px; }
    @media print {
      body { margin: 0; } button { display: none !important; }
      .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .missing-refs-notice { background: #fffbeb !important; border: 1px solid #fbbf24 !important; color: #92400e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Harvest &amp; Vintage Records</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong><br>${harvestAddressHtml}${vintages ? `<br>Vintages: ${vintages}` : ""}<br>
        ${harvestFsaVineRefHtml}<br>
        ${harvestFsaWineRefHtml}<br>
        ${harvestAppaRefHtml}<br>
        ${harvestWinegbHtml ? `${harvestWinegbHtml}<br>` : ""}${yearLabel ? `Year: <strong>${escHtml(yearLabel)}</strong><br>` : ""}Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record${records.length === 1 ? "" : "s"}
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div style="font-size:13px;font-weight:700;color:#7c3d12">Viticulture</div>
      <div>Harvest Register</div>
    </div>
  </div>
  ${harvestMissingRefWarningBlock}
  ${unlinkedCount > 0 ? `<div style="background:#fffbeb;border:1px solid #fcd34d;padding:7px 10px;border-radius:4px;font-size:10.5px;margin-bottom:12px;color:#78350f"><strong>&#9888; ${unlinkedCount} record${unlinkedCount === 1 ? "" : "s"} not linked to a block</strong> &mdash; these harvest records are included below but excluded from block-level yield summaries. Link them to blocks to ensure complete data.</div>` : ""}
  ${summaryHtml}
  <table>
    <thead>
      <tr>
        ${hasPhotos ? '<th style="width:76px">Block / Photo</th>' : ""}
        <th>Harvest Date</th>
        <th>Vintage</th>
        ${hasPhotos ? "" : "<th>Block</th>"}
        <th>Method</th>
        <th style="text-align:right">Yield (kg)</th>
        <th style="text-align:right">t/ha</th>
        <th style="text-align:right">Brix °</th>
        <th style="text-align:right">pH</th>
        <th style="text-align:right">TA (g/L)</th>
        <th style="text-align:right">Pot. Alc. %</th>
        <th>Condition</th>
        <th>Botrytis</th>
        <th>Operator</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan='${colSpan}' style='text-align:center;color:#888;padding:14px'>No records</td></tr>`}
    </tbody>
    ${records.length > 0 ? `
    <tfoot>
      <tr class="tfoot">
        <td colspan="4"><strong>Farm Totals</strong> &nbsp;&middot;&nbsp; <span style="font-weight:400">${records.length} pick${records.length === 1 ? "" : "s"}</span></td>
        <td style="text-align:right"><strong>${totalKg.toFixed(1)} kg</strong></td>
        <td></td>
        <td style="text-align:right"><strong>${detailAvgBrix != null ? detailAvgBrix.toFixed(1) + " °" : "—"}</strong></td>
        <td style="text-align:right"><strong>${detailAvgPh != null ? detailAvgPh.toFixed(2) : "—"}</strong></td>
        <td style="text-align:right"><strong>${detailAvgTa != null ? detailAvgTa.toFixed(1) : "—"}</strong></td>
        <td style="text-align:right"><strong>${detailAvgPa != null ? detailAvgPa.toFixed(1) : "—"}</strong></td>
        <td></td>
        <td></td>
        <td colspan="2"></td>
      </tr>
    </tfoot>` : ""}
  </table>
  <div class="footer">
    Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Harvest &amp; Vintage Register &nbsp;&middot;&nbsp; Required for GI / PDO vintage declarations
    ${_anyOutlier ? `<span style="margin-left:14px;display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fbbf24;border-radius:3px;padding:2px 8px;font-weight:700;font-size:9.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact">&#9888; Amber cell = TA or Pot. Alc. deviates more than 1 standard deviation from the block average for that vintage</span>` : ""}
  </div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
async function printPhenology(records, farmName, blocks, farmMeta, yearLabel) {
  const win = window.open("", "_blank", "width=1100,height=850");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Phenology — Loading…</title>
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555}p{font-size:14px}</style>
    </head><body><p>Preparing report…</p></body></html>`);
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const n = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const blockLookup = {};
  (blocks ?? []).forEach((b) => {
    blockLookup[b.id] = b;
  });
  const blockName = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup[bid]?.blockName ?? id) : "—";
  };
  const unlinkedCount = records.filter((r) => !(Number(r.blockId) > 0)).length;
  const rows = records.map((r) => `<tr>
    <td>${d(r.observationDate)}</td>
    <td>${escHtml(blockName(r.blockId))}</td>
    <td style="text-align:center;font-weight:600">${escHtml(r.bbchStage)}</td>
    <td>${escHtml(r.bbchDescription)}</td>
    <td style="text-align:right">${r.percentageReached != null && r.percentageReached !== "" ? `${r.percentageReached}%` : "—"}</td>
    <td>${escHtml(r.observer)}</td>
    <td style="text-align:right">${n(r.temperatureC, 1)}</td>
    <td>${escHtml(r.notes)}</td>
  </tr>`).join("");
  const safeFarmName = escHtml(farmName);
  const phenAddressValue = String(farmMeta?.address ?? "").trim();
  const phenPostcodeValue = String(farmMeta?.postcode ?? "").trim();
  const phenAddressHtml = phenAddressValue ? [phenAddressValue, phenPostcodeValue].filter(Boolean).map(escHtml).join(", ") : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const years = [...new Set(records.map((r) => new Date(r.observationDate).getFullYear()))].sort().reverse().join(", ");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Phenology (BBCH Growth Stages) &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; }
    h1 { font-size: 17px; margin: 0 0 2px; color: #4b3a8a; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4b3a8a; padding-bottom: 10px; margin-bottom: 14px; }
    .meta { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.5; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #4b3a8a; color: white; padding: 6px 5px; text-align: left; white-space: nowrap; }
    td { padding: 5px 5px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #f5f3ff; }
    .footer { margin-top: 16px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 7px; }
    @media print { body { margin: 0; } button { display: none !important; } .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Phenology (BBCH Growth Stages)</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong><br>
        ${phenAddressHtml}<br>
        ${yearLabel ? `Year: <strong>${escHtml(yearLabel)}</strong><br>` : years ? `Season(s): ${years}<br>` : ""}
        Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record${records.length === 1 ? "" : "s"}
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div style="font-size:13px;font-weight:700;color:#4b3a8a">Viticulture</div>
      <div>Phenology Register</div>
    </div>
  </div>
  ${unlinkedCount > 0 ? `<div style="background:#fffbeb;border:1px solid #fcd34d;padding:7px 10px;border-radius:4px;font-size:10.5px;margin-bottom:12px;color:#78350f"><strong>&#9888; ${unlinkedCount} observation${unlinkedCount === 1 ? "" : "s"} not linked to a block</strong> &mdash; these records are included below but cannot be attributed to a specific block.</div>` : ""}
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Block</th>
        <th style="text-align:center">BBCH Stage</th>
        <th>Description</th>
        <th style="text-align:right">% Reached</th>
        <th>Observer</th>
        <th style="text-align:right">Temp (°C)</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan='8' style='text-align:center;color:#888;padding:14px'>No records</td></tr>`}
    </tbody>
  </table>
  <div class="footer">Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Phenology Register &nbsp;&middot;&nbsp; BBCH Growth Stage observations</div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
async function printDiseaseScouting(records, farmName, farmId, blocks, farmMeta, blockLabel, yearLabel) {
  const win = window.open("", "_blank", "width=1200,height=850");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Disease Scouting — Loading…</title>
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555}p{font-size:14px}</style>
    </head><body><p>Preparing report…</p></body></html>`);
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const pressureText = (v) => {
    const n = Number(v) || 0;
    return ["None", "Low", "Medium", "High"][n] ?? "—";
  };
  const photoDataUrl = {};
  const photoCaption = {};
  if (farmId && blocks && blocks.length > 0) {
    const blockLookup = {};
    blocks.forEach((b) => {
      blockLookup[b.id] = b;
    });
    const neededBlockIds = [...new Set(
      records.map((r) => Number(r.blockId)).filter((id) => !isNaN(id) && id > 0)
    )];
    await Promise.all(
      neededBlockIds.map(async (blockId) => {
        const block = blockLookup[blockId];
        if (!block) return;
        const photos = block.photos;
        if (!photos || photos.length === 0) return;
        const coverPhoto = photos[0];
        const url = `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${coverPhoto.id}`;
        const dataUrl = await fetchImageAsDataUrl(url);
        if (dataUrl) photoDataUrl[blockId] = dataUrl;
        if (coverPhoto.caption) photoCaption[blockId] = coverPhoto.caption;
      })
    );
  }
  const blockLookup2 = {};
  (blocks ?? []).forEach((b) => {
    blockLookup2[b.id] = b;
  });
  const blockName = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup2[bid]?.blockName ?? id) : "—";
  };
  const hasPhotos = Object.keys(photoDataUrl).length > 0;
  const unlinkedCount = records.filter((r) => !(Number(r.blockId) > 0)).length;
  const blockScoutMap = {};
  const blockScoutKeys = [];
  for (const r of records) {
    const bid = r.blockId != null ? Number(r.blockId) : null;
    const key = bid != null && !isNaN(bid) && bid > 0 ? String(bid) : "unlinked";
    if (!blockScoutMap[key]) {
      const bl = bid != null && !isNaN(bid) && bid > 0 ? blockLookup2[bid] : void 0;
      const label = bl ? String(bl.blockName ?? key) : key === "unlinked" ? "No block linked" : String(bid);
      blockScoutMap[key] = { label, visits: 0, minDate: "", maxDate: "", maxDowny: 0, maxPowdery: 0, maxBotrytis: 0, maxPhomopsis: 0, vineWeevil: false, eutypa: false, xylella: false, totalPhotos: 0 };
      blockScoutKeys.push(key);
    }
    const entry = blockScoutMap[key];
    entry.visits++;
    entry.totalPhotos += Number(r.photoCount) || 0;
    const sd = String(r.scoutDate ?? "");
    if (sd && (!entry.minDate || sd < entry.minDate)) entry.minDate = sd;
    if (sd && (!entry.maxDate || sd > entry.maxDate)) entry.maxDate = sd;
    entry.maxDowny = Math.max(entry.maxDowny, Number(r.downyMildewPressure) || 0);
    entry.maxPowdery = Math.max(entry.maxPowdery, Number(r.powderyMildewPressure) || 0);
    entry.maxBotrytis = Math.max(entry.maxBotrytis, Number(r.botrytisPressure) || 0);
    entry.maxPhomopsis = Math.max(entry.maxPhomopsis, Number(r.phomopsisPressure) || 0);
    if (r.vineWeevilSighted) entry.vineWeevil = true;
    if (r.eutypaDiebackSighted) entry.eutypa = true;
    if (r.xylellaFastidiosa) entry.xylella = true;
  }
  const pLabel = (n) => ["None", "Low", "Medium", "High"][n] ?? "—";
  const pColor = (n) => ["#6b7280", "#16a34a", "#d97706", "#dc2626"][n] ?? "#6b7280";
  const blockSummaryRows = blockScoutKeys.sort((a, b) => blockScoutMap[a].label.localeCompare(blockScoutMap[b].label)).map((key) => {
    const e = blockScoutMap[key];
    const dateRange = e.minDate && e.maxDate ? e.minDate === e.maxDate ? d(e.minDate) : `${d(e.minDate)} – ${d(e.maxDate)}` : "—";
    const alerts = [];
    if (e.xylella) alerts.push(`<span style="color:#dc2626;font-weight:700">⚠ Xylella</span>`);
    if (e.eutypa) alerts.push(`<span style="color:#dc2626;font-weight:600">Eutypa</span>`);
    if (e.vineWeevil) alerts.push(`<span style="color:#d97706;font-weight:600">Vine Weevil</span>`);
    return `<tr>
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(e.label)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:center">${e.visits}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db">${dateRange}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:center"><span style="color:${pColor(e.maxDowny)}">${pLabel(e.maxDowny)}</span></td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:center"><span style="color:${pColor(e.maxPowdery)}">${pLabel(e.maxPowdery)}</span></td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:center"><span style="color:${pColor(e.maxBotrytis)}">${pLabel(e.maxBotrytis)}</span></td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:center"><span style="color:${pColor(e.maxPhomopsis)}">${pLabel(e.maxPhomopsis)}</span></td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:center">${e.totalPhotos > 0 ? e.totalPhotos : `<span style="color:#9ca3af">0</span>`}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db">${alerts.length > 0 ? alerts.join(", ") : `<span style="color:#9ca3af">None</span>`}</td>
      </tr>`;
  }).join("");
  const blockSummaryHtml = records.length > 0 ? `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #166534;padding-bottom:4px;margin:0 0 8px;color:#166534;text-transform:uppercase;letter-spacing:0.04em">
    Scouting Summary by Block
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:18px">
    <thead><tr>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Block</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:center;white-space:nowrap">Visits</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Date Range</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:center;white-space:nowrap">Max Downy</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:center;white-space:nowrap">Max Powdery</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:center;white-space:nowrap">Max Botrytis</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:center;white-space:nowrap">Max Phomopsis</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:center;white-space:nowrap">Photos</th>
      <th style="background:#166534;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Alerts</th>
    </tr></thead>
    <tbody>${blockSummaryRows || `<tr><td colspan='9' style='padding:10px;text-align:center;color:#888'>No records</td></tr>`}</tbody>
  </table>
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #166534;padding-bottom:4px;margin:0 0 8px;color:#166534;text-transform:uppercase;letter-spacing:0.04em">
    Detailed Scouting Records
  </h2>
  ` : "";
  const colCount = hasPhotos ? 16 : 15;
  const rows = records.map((r) => {
    const bid = Number(r.blockId);
    const dataUrl = !isNaN(bid) && bid > 0 ? photoDataUrl[bid] : void 0;
    const caption = !isNaN(bid) && bid > 0 ? photoCaption[bid] ?? "" : "";
    const bName = blockName(r.blockId);
    let photoCell = "";
    if (hasPhotos) {
      photoCell = `<td style="padding:4px 6px;vertical-align:middle;text-align:center;width:76px">
        ${dataUrl ? `<img src="${dataUrl}" alt="Block photo" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #d1d5db;display:block;margin:0 auto 2px" />` : ""}
        ${caption ? `<span style="font-size:9px;color:#666;font-style:italic;display:block;max-width:72px;word-wrap:break-word;line-height:1.3">${escHtml(caption)}</span>` : ""}
      </td>`;
    }
    const pCell = (v) => {
      const n = Number(v) || 0;
      const colors = ["#6b7280", "#16a34a", "#d97706", "#dc2626"];
      return `<span style="color:${colors[n] ?? "#6b7280"}">${pressureText(v)}</span>`;
    };
    const alertCell = (v, text) => v ? `<span style="color:#dc2626;font-weight:600">${text}</span>` : `<span style="color:#9ca3af">No</span>`;
    return `<tr>
      ${photoCell}
      <td>${d(r.scoutDate)}</td>
      <td style="font-weight:600">${escHtml(bName)}</td>
      <td>${escHtml(r.scoutedBy)}</td>
      <td style="text-align:center">${pCell(r.downyMildewPressure)}</td>
      <td style="text-align:center">${pCell(r.powderyMildewPressure)}</td>
      <td style="text-align:center">${pCell(r.botrytisPressure)}</td>
      <td style="text-align:center">${pCell(r.phomopsisPressure)}</td>
      <td style="text-align:center">${pCell(r.leafhopperPressure)}</td>
      <td style="text-align:center">${pCell(r.spiderMitePressure)}</td>
      <td style="text-align:center">${alertCell(r.vineWeevilSighted, "Yes")}</td>
      <td style="text-align:center">${alertCell(r.eutypaDiebackSighted, "Yes")}</td>
      <td style="text-align:center">${r.xylellaFastidiosa ? `<span style="color:#dc2626;font-weight:700">⚠ ALERT</span>` : `<span style="color:#9ca3af">No</span>`}</td>
      <td>${d(r.nextScoutDate)}</td>
      <td style="max-width:120px;white-space:normal">${escHtml(r.actionTaken)}</td>
      <td style="text-align:center">${Number(r.photoCount) > 0 ? `<span style="font-size:9px;border:1px solid #888;border-radius:2px;padding:0 3px;white-space:nowrap;display:inline-block">&#128247; ${Number(r.photoCount)} photo${Number(r.photoCount) === 1 ? "" : "s"}</span>` : `<span style="color:#9ca3af">—</span>`}</td>
    </tr>
    ${r.notes ? `<tr><td colspan="${colCount}" style="padding:3px 6px 5px;border:1px solid #d1d5db;border-top:none;background:#f0fdf4;font-style:italic;font-size:9.5px;color:#374151"><strong style="font-style:normal;color:#166534">Notes:</strong> ${escHtml(r.notes)}</td></tr>` : ""}`;
  }).join("");
  const safeFarmName = escHtml(farmName);
  const scoutAddressValue = String(farmMeta?.address ?? "").trim();
  const scoutPostcodeValue = String(farmMeta?.postcode ?? "").trim();
  const scoutAddressHtml = scoutAddressValue ? [scoutAddressValue, scoutPostcodeValue].filter(Boolean).map(escHtml).join(", ") : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const xylellaCount = records.filter((r) => r.xylellaFastidiosa).length;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Disease &amp; Pest Scouting &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 12mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; color: #111; margin: 0; }
    h1 { font-size: 16px; margin: 0 0 2px; color: #166534; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #166534; padding-bottom: 10px; margin-bottom: 14px; }
    .meta { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #166534; color: white; padding: 5px 4px; text-align: left; white-space: nowrap; }
    th.center { text-align: center; }
    td { padding: 4px 4px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .alert-box { background: #fef2f2; border: 1px solid #fca5a5; padding: 7px 10px; border-radius: 4px; font-size: 11px; margin-bottom: 12px; }
    .footer { margin-top: 14px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 7px; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    @media print { body { margin: 0; } button { display: none !important; } .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Disease &amp; Pest Scouting Register</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong><br>${scoutAddressHtml}<br>
        ${blockLabel ? `Block: <strong>${escHtml(blockLabel)}</strong><br>` : ""}${yearLabel ? `Year: <strong>${escHtml(yearLabel)}</strong><br>` : ""}Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record${records.length === 1 ? "" : "s"}
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div style="font-size:13px;font-weight:700;color:#166534">Viticulture</div>
      <div>Scouting &amp; Plant Health</div>
    </div>
  </div>
  ${xylellaCount > 0 ? `<div class="alert-box"><strong style="color:#dc2626">⚠ Xylella fastidiosa — Notifiable Organism</strong><br>${xylellaCount} record(s) have flagged possible Xylella. Report immediately to APHA via the online plant health portal or call 0300 1000 313.</div>` : ""}
  ${unlinkedCount > 0 ? `<div style="background:#fffbeb;border:1px solid #fcd34d;padding:7px 10px;border-radius:4px;font-size:10.5px;margin-bottom:12px;color:#78350f"><strong>&#9888; ${unlinkedCount} record${unlinkedCount === 1 ? "" : "s"} not linked to a block</strong> &mdash; these scouting records are included below but excluded from the block summary. Link them to blocks to ensure complete data.</div>` : ""}
  ${blockSummaryHtml}
  <table>
    <thead>
      <tr>
        ${hasPhotos ? `<th style="width:76px">Photo</th>` : ""}
        <th>Date</th>
        <th>Block</th>
        <th>Scout</th>
        <th class="center">Downy</th>
        <th class="center">Powdery</th>
        <th class="center">Botrytis</th>
        <th class="center">Phomopsis</th>
        <th class="center">Leafhopper</th>
        <th class="center">Spider Mite</th>
        <th class="center">Vine Weevil</th>
        <th class="center">Eutypa</th>
        <th class="center">Xylella</th>
        <th>Next Scout</th>
        <th>Action Taken</th>
        <th class="center">Photos</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan='${colCount}' style='text-align:center;color:#888;padding:14px'>No records</td></tr>`}
    </tbody>
  </table>
  <div class="footer">Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Disease &amp; Pest Scouting Register &nbsp;&middot;&nbsp; Regular scouting supports cross-compliance and spray diary decisions</div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
async function printSprayRecords(records, farmName, farmId, blocks, farmMeta, blockLabel, yearLabel) {
  const win = window.open("", "_blank", "width=1200,height=850");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Spray Diary — Loading…</title>
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555}p{font-size:14px}</style>
    </head><body><p>Preparing report…</p></body></html>`);
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const n = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const photoDataUrl = {};
  const photoCaption = {};
  if (farmId && blocks && blocks.length > 0) {
    const blockLookup = {};
    blocks.forEach((b) => {
      blockLookup[b.id] = b;
    });
    const neededBlockIds = [...new Set(
      records.map((r) => Number(r.blockId)).filter((id) => !isNaN(id) && id > 0)
    )];
    await Promise.all(
      neededBlockIds.map(async (blockId) => {
        const block = blockLookup[blockId];
        if (!block) return;
        const photos = block.photos;
        if (!photos || photos.length === 0) return;
        const coverPhoto = photos[0];
        const url = `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${coverPhoto.id}`;
        const dataUrl = await fetchImageAsDataUrl(url);
        if (dataUrl) photoDataUrl[blockId] = dataUrl;
        if (coverPhoto.caption) photoCaption[blockId] = coverPhoto.caption;
      })
    );
  }
  const blockLookup2 = {};
  (blocks ?? []).forEach((b) => {
    blockLookup2[b.id] = b;
  });
  const blockName = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? String(blockLookup2[bid]?.blockName ?? id) : "—";
  };
  const hasPhotos = Object.keys(photoDataUrl).length > 0;
  const unlinkedCount = records.filter((r) => !(Number(r.blockId) > 0)).length;
  const blockSprayMap = {};
  const blockSprayKeys = [];
  for (const r of records) {
    const bid = r.blockId != null ? Number(r.blockId) : null;
    const key = bid != null && !isNaN(bid) && bid > 0 ? String(bid) : "unlinked";
    if (!blockSprayMap[key]) {
      const bl = bid != null && !isNaN(bid) && bid > 0 ? blockLookup2[bid] : void 0;
      const label = bl ? String(bl.blockName ?? key) : key === "unlinked" ? "No block linked" : String(bid);
      blockSprayMap[key] = { label, applications: 0, minDate: "", maxDate: "", totalAreaHa: 0, products: /* @__PURE__ */ new Set() };
      blockSprayKeys.push(key);
    }
    const entry = blockSprayMap[key];
    entry.applications++;
    const ad = String(r.applicationDate ?? "");
    if (ad && (!entry.minDate || ad < entry.minDate)) entry.minDate = ad;
    if (ad && (!entry.maxDate || ad > entry.maxDate)) entry.maxDate = ad;
    entry.totalAreaHa += parseFloat(String(r.areaTreatedHa ?? 0)) || 0;
    if (r.productName && String(r.productName).trim()) entry.products.add(String(r.productName).trim());
  }
  const sprayBlockSummaryRows = blockSprayKeys.sort((a, b) => blockSprayMap[a].label.localeCompare(blockSprayMap[b].label)).map((key) => {
    const e = blockSprayMap[key];
    const dateRange = e.minDate && e.maxDate ? e.minDate === e.maxDate ? d(e.minDate) : `${d(e.minDate)} – ${d(e.maxDate)}` : "—";
    const productList = [...e.products].slice(0, 4).join(", ") + (e.products.size > 4 ? ` +${e.products.size - 4} more` : "");
    return `<tr>
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(e.label)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:center">${e.applications}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db">${dateRange}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${e.totalAreaHa > 0 ? e.totalAreaHa.toFixed(4) + " ha" : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db">${escHtml(productList || "—")}</td>
      </tr>`;
  }).join("");
  const sprayBlockSummaryHtml = records.length > 0 ? `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #0e4f8a;padding-bottom:4px;margin:0 0 8px;color:#0e4f8a;text-transform:uppercase;letter-spacing:0.04em">
    Applications by Block
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:18px">
    <thead><tr>
      <th style="background:#0e4f8a;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Block</th>
      <th style="background:#0e4f8a;color:white;padding:6px 5px;text-align:center;white-space:nowrap">Applications</th>
      <th style="background:#0e4f8a;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Date Range</th>
      <th style="background:#0e4f8a;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Total Area</th>
      <th style="background:#0e4f8a;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Products Used</th>
    </tr></thead>
    <tbody>${sprayBlockSummaryRows || `<tr><td colspan='5' style='padding:10px;text-align:center;color:#888'>No records</td></tr>`}</tbody>
  </table>
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #0e4f8a;padding-bottom:4px;margin:0 0 8px;color:#0e4f8a;text-transform:uppercase;letter-spacing:0.04em">
    Detailed Spray Records
  </h2>
  ` : "";
  const colCount = hasPhotos ? 14 : 13;
  const rows = records.map((r) => {
    const bid = Number(r.blockId);
    const dataUrl = !isNaN(bid) && bid > 0 ? photoDataUrl[bid] : void 0;
    const caption = !isNaN(bid) && bid > 0 ? photoCaption[bid] ?? "" : "";
    const bName = blockName(r.blockId);
    let photoCell = "";
    if (hasPhotos) {
      photoCell = `<td style="padding:4px 6px;vertical-align:middle;text-align:center;width:76px">
        ${dataUrl ? `<img src="${dataUrl}" alt="Block photo" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #d1d5db;display:block;margin:0 auto 2px" />` : ""}
        ${caption ? `<span style="font-size:9px;color:#666;font-style:italic;display:block;max-width:72px;word-wrap:break-word;line-height:1.3">${escHtml(caption)}</span>` : ""}
      </td>`;
    }
    const rateStr = r.ratePerHectare ? `${n(r.ratePerHectare)} ${escHtml(r.rateUnit)}`.trim() : "—";
    return `<tr>
      ${photoCell}
      <td>${d(r.applicationDate)}</td>
      <td style="font-weight:600">${escHtml(bName)}</td>
      <td style="font-weight:600">${escHtml(r.productName)}</td>
      <td>${escHtml(r.mappNumber)}</td>
      <td>${escHtml(r.activeIngredient)}</td>
      <td>${escHtml(r.productType)}</td>
      <td style="text-align:right">${rateStr}</td>
      <td style="text-align:right">${r.areaTreatedHa ? `${n(r.areaTreatedHa, 4)} ha` : "—"}</td>
      <td style="text-align:right">${r.harvestIntervalDays ? `${n(r.harvestIntervalDays, 0)} days` : "—"}</td>
      <td style="text-align:right">${r.windSpeedMph ? `${n(r.windSpeedMph)} mph` : "—"}</td>
      <td style="text-align:right">${r.temperatureCelsius ? `${n(r.temperatureCelsius)} °C` : "—"}</td>
      <td>${escHtml(r.operatorName)}</td>
      <td>${escHtml(r.operatorCertificateNo)}</td>
    </tr>
    ${r.notes ? `<tr><td colspan="${colCount}" style="padding:3px 6px 5px;border:1px solid #d1d5db;border-top:none;background:#f8faff;font-style:italic;font-size:9.5px;color:#374151"><strong style="font-style:normal;color:#0e4f8a">Notes:</strong> ${escHtml(r.notes)}</td></tr>` : ""}`;
  }).join("");
  const safeFarmName = escHtml(farmName);
  const addressValue = String(farmMeta?.address ?? "").trim();
  const postcodeValue = String(farmMeta?.postcode ?? "").trim();
  const addressDisplayParts = [addressValue, postcodeValue].filter(Boolean).map(escHtml);
  const addressHtml = addressValue ? addressDisplayParts.join(", ") : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Spray Diary &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 12mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; color: #111; margin: 0; }
    h1 { font-size: 16px; margin: 0 0 2px; color: #0e4f8a; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0e4f8a; padding-bottom: 10px; margin-bottom: 14px; }
    .meta { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.5; }
    .notice { background: #eff6ff; border: 1px solid #93c5fd; padding: 7px 10px; border-radius: 4px; font-size: 10.5px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #0e4f8a; color: white; padding: 5px 4px; text-align: left; white-space: nowrap; }
    td { padding: 4px 4px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #eff6ff; }
    .footer { margin-top: 14px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 7px; }
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    @media print { body { margin: 0; } button { display: none !important; } .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Spray Diary</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong><br>${addressHtml}<br>
        ${blockLabel ? `Block: <strong>${escHtml(blockLabel)}</strong><br>` : ""}${yearLabel ? `Year: <strong>${escHtml(yearLabel)}</strong><br>` : ""}Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} application${records.length === 1 ? "" : "s"}
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div style="font-size:13px;font-weight:700;color:#0e4f8a">Viticulture</div>
      <div>Plant Protection Records</div>
    </div>
  </div>
  <div class="notice">
    <strong>Statutory record:</strong> Spray records must be completed within 48 hours of application and retained for at least 3 years (Plant Protection Products Regulations 2011). Required for WineGB, Red Tractor, and cross-compliance audits.
  </div>
  ${unlinkedCount > 0 ? `<div style="background:#fffbeb;border:1px solid #fcd34d;padding:7px 10px;border-radius:4px;font-size:10.5px;margin-bottom:12px;color:#78350f"><strong>&#9888; ${unlinkedCount} record${unlinkedCount === 1 ? "" : "s"} not linked to a block</strong> &mdash; these spray applications are included below but excluded from the block summary. Link them to blocks to ensure complete records.</div>` : ""}
  ${sprayBlockSummaryHtml}
  <table>
    <thead>
      <tr>
        ${hasPhotos ? `<th style="width:76px">Photo</th>` : ""}
        <th>Date</th>
        <th>Block</th>
        <th>Product Name</th>
        <th>MAPP No.</th>
        <th>Active Ingredient</th>
        <th>Type</th>
        <th style="text-align:right">Rate/ha</th>
        <th style="text-align:right">Area</th>
        <th style="text-align:right">HI (days)</th>
        <th style="text-align:right">Wind</th>
        <th style="text-align:right">Temp</th>
        <th>Operator</th>
        <th>Cert. No.</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan='${colCount}' style='text-align:center;color:#888;padding:14px'>No records</td></tr>`}
    </tbody>
  </table>
  <div class="footer">Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Spray Diary &nbsp;&middot;&nbsp; Plant Protection Products Regulations 2011 &nbsp;&middot;&nbsp; Retain for 3 years</div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
function printVineSprayDiaryReport(records, blocks, farmName, farmMeta, searchQuery) {
  const win = window.open("", "_blank", "width=1200,height=850");
  if (!win) return;
  const blockLookup = {};
  blocks.forEach((b) => {
    blockLookup[b.id] = String(b.blockName ?? b.id);
  });
  const resolveBlock = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? blockLookup[bid] ?? "—" : "—";
  };
  const safeFarmName = escHtml(farmName);
  const addressValue = String(farmMeta?.address ?? "").trim();
  const postcodeValue = String(farmMeta?.postcode ?? "").trim();
  const addressParts = [addressValue, postcodeValue].filter(Boolean).map(escHtml).join(", ");
  const eSearch = searchQuery && searchQuery.trim() ? escHtml(searchQuery.trim()) : "";
  const safeDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const missingFields = [];
  if (!farmName || !farmName.trim()) missingFields.push("Farm name");
  if (!addressValue) missingFields.push("Farm address");
  const missingWarning = missingFields.length > 0 ? `<div class="warning-box">&#9888; ${missingFields.join(" and ")} not set — update Farm Settings to populate the header.</div>` : "";
  const todayMs = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
  const tableRows = records.map((r) => {
    const nv = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
    const rate = r.ratePerHectare != null ? `${nv(r.ratePerHectare)} ${escHtml(r.rateUnit ?? "")}`.trim() : "—";
    const weatherParts = [];
    if (r.windSpeedMph != null && r.windSpeedMph !== "") weatherParts.push(`${nv(r.windSpeedMph)} mph`);
    if (r.temperatureCelsius != null && r.temperatureCelsius !== "") weatherParts.push(`${nv(r.temperatureCelsius)} °C`);
    if (r.weatherConditions) weatherParts.push(escHtml(r.weatherConditions));
    const weather = weatherParts.length > 0 ? weatherParts.join(" &middot; ") : "—";
    const appDate = r.applicationDate ? new Date(r.applicationDate).toLocaleDateString("en-GB") : "—";
    const hiDays = r.harvestIntervalDays != null && r.harvestIntervalDays !== "" ? Number(r.harvestIntervalDays) : null;
    let hiActive = false;
    let hiCell = "—";
    if (hiDays != null && !isNaN(hiDays) && r.applicationDate) {
      const appMs = new Date(r.applicationDate).setHours(0, 0, 0, 0);
      const expiryMs = appMs + hiDays * 864e5;
      hiActive = expiryMs > todayMs;
      const expiryStr = new Date(expiryMs).toLocaleDateString("en-GB");
      hiCell = hiActive ? `<span style="font-weight:700;color:#92400e">${hiDays}d &#9888;<br><span style="font-size:7.5pt;font-weight:400">Expires ${expiryStr}</span></span>` : `${hiDays}d<br><span style="font-size:7.5pt;color:#555">Expired ${expiryStr}</span>`;
    }
    const cellBg = hiActive ? "background:#fffbeb;" : "";
    return `<tr>
      <td style="${cellBg}">${appDate}</td>
      <td style="${cellBg}"><strong>${escHtml(r.productName)}</strong>${r.productType ? `<br><span style="color:#555;font-size:8.5pt">${escHtml(r.productType)}</span>` : ""}</td>
      <td style="${cellBg}">${escHtml(r.mappNumber)}</td>
      <td style="${cellBg}">${escHtml(r.activeIngredient)}</td>
      <td style="${cellBg}">${rate}</td>
      <td style="text-align:right;${cellBg}">${r.areaTreatedHa != null && r.areaTreatedHa !== "" ? `${parseFloat(String(r.areaTreatedHa)).toFixed(2)} ha` : "—"}</td>
      <td style="${cellBg}">${escHtml(resolveBlock(r.blockId))}</td>
      <td style="font-size:8.5pt;${cellBg}">${weather}</td>
      <td style="${cellBg}">${escHtml(r.operatorName)}${r.operatorCertificateNo ? `<br><span style="color:#555;font-size:8pt">${escHtml(r.operatorCertificateNo)}</span>` : ""}</td>
      <td style="text-align:center;font-size:8.5pt;${cellBg}">${hiCell}</td>
    </tr>`;
  }).join("");
  const notesRows = records.filter((r) => r.notes).map((r) => {
    const appDate = r.applicationDate ? new Date(r.applicationDate).toLocaleDateString("en-GB") : "—";
    return `<tr>
      <td style="width:22%;font-weight:600">${appDate} &mdash; ${escHtml(r.productName)}</td>
      <td>${escHtml(r.notes)}</td>
    </tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Vine Spray Diary &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 16mm 12mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #111; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0e4f8a; padding-bottom: 10px; margin-bottom: 12px; }
    .logo-block h1 { font-size: 16px; margin: 0 0 2px; color: #0e4f8a; }
    .logo-block p { margin: 0; font-size: 10px; color: #666; }
    .doc-title { text-align: right; }
    .doc-title h2 { font-size: 14px; margin: 0 0 3px; color: #0e4f8a; }
    .doc-title p { margin: 1px 0; font-size: 10px; color: #555; }
    .farm-bar { display: flex; gap: 28px; background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 4px; padding: 6px 10px; font-size: 10px; margin-bottom: 10px; }
    .warning-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 6px 10px; border-radius: 4px; font-size: 10px; margin-bottom: 8px; color: #78350f; }
    .info-box { background: #f0f9ff; border: 1px solid #7dd3fc; padding: 6px 10px; border-radius: 4px; font-size: 10px; margin-bottom: 12px; color: #075985; }
    .section-heading { font-size: 11px; font-weight: 700; border-bottom: 1px solid #0e4f8a; padding-bottom: 3px; margin: 12px 0 6px; color: #0e4f8a; text-transform: uppercase; letter-spacing: 0.04em; }
    table { width: 100%; border-collapse: collapse; font-size: 8.5pt; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #0e4f8a; color: white; padding: 5px 5px; text-align: left; font-size: 8pt; white-space: nowrap; }
    td { padding: 4px 5px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #f5f8ff; }
    .footer { margin-top: 12px; font-size: 9px; color: #666; border-top: 1px solid #ccc; padding-top: 6px; }
    @media print { body { margin: 0; } }
  </style></head><body>
  <div class="header">
    <div class="logo-block">
      <h1>BDE Farm Trac</h1>
      <p>Vineyard Compliance Platform</p>
    </div>
    <div class="doc-title">
      <h2>Vine Spray Diary</h2>
      <p>Date: ${safeDate}</p>
      <p>${records.length} record${records.length === 1 ? "" : "s"}${eSearch ? ` &middot; Filter: &ldquo;${eSearch}&rdquo;` : ""}</p>
    </div>
  </div>
  <div class="farm-bar">
    <span>Farm: <strong>${safeFarmName}</strong></span>
    <span>Printed: <strong>${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}</strong></span>
    ${addressParts ? `<span>Address: <strong>${addressParts}</strong></span>` : ""}
  </div>
  ${missingWarning}
  <div class="info-box">
    &#8505; This spray diary must be retained for a minimum of 3 years. All pesticide applications must comply
    with product label instructions and current certification requirements.
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Product</th>
        <th>MAPP No.</th>
        <th>Active Ingredient</th>
        <th>Rate</th>
        <th style="text-align:right">Area</th>
        <th>Block</th>
        <th>Weather</th>
        <th>Operator</th>
        <th style="text-align:center">HI (days)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || `<tr><td colspan="10" style="text-align:center;color:#888;padding:14px">No spray diary records match the current filter.</td></tr>`}
    </tbody>
  </table>
  ${notesRows ? `<div class="section-heading">Notes</div><table><tbody>${notesRows}</tbody></table>` : ""}
  <div class="footer">Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Vine Spray Diary &nbsp;&middot;&nbsp; Plant Protection Products Regulations 2011 &nbsp;&middot;&nbsp; Retain for 3 years</div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
async function downloadVineSprayDiaryPdf(records, blocks, farmName, farmMeta, searchQuery) {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    __vitePreload(() => import("./jspdf.es.min-BVdyS7jm.js"), true ? __vite__mapDeps([0,1,2,3,4]) : void 0),
    __vitePreload(() => import("./jspdf.plugin.autotable-rNuKHwSj.js"), true ? [] : void 0)
  ]);
  const jsPDF = jsPDFModule.jsPDF ?? jsPDFModule.default;
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const safeDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeDateTime = (/* @__PURE__ */ new Date()).toLocaleString("en-GB");
  const blockLookup = {};
  blocks.forEach((b) => {
    blockLookup[b.id] = String(b.blockName ?? b.id);
  });
  const resolveBlock = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? blockLookup[bid] ?? "—" : "—";
  };
  const addressValue = String(farmMeta?.address ?? "").trim();
  const postcodeValue = String(farmMeta?.postcode ?? "").trim();
  const addressParts = [addressValue, postcodeValue].filter(Boolean).join(", ");
  const missingFarmName = !farmName || !farmName.trim();
  const missingAddress = !addressValue;
  doc.setFillColor(14, 79, 138);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("BDE Farm Trac", 14, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Vineyard Compliance Platform", 14, 16);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Vine Spray Diary", pageW - 14, 10, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${safeDate}`, pageW - 14, 16, { align: "right" });
  let y = 26;
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(14, y, pageW - 28, 10, 1, 1, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const farmLabel = `Farm: ${farmName || "—"}`;
  const printedLabel = `Printed: ${safeDateTime}`;
  const addrLabel = addressParts ? `Address: ${addressParts}` : "";
  doc.text(farmLabel, 17, y + 7);
  doc.text(printedLabel, pageW / 2, y + 7, { align: "center" });
  if (addrLabel) doc.text(addrLabel, pageW - 17, y + 7, { align: "right" });
  y += 14;
  if (missingFarmName || missingAddress) {
    const missing = [missingFarmName ? "Farm name" : "", missingAddress ? "Farm address" : ""].filter(Boolean).join(" and ");
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15);
    doc.text(`⚠ ${missing} not set — update Farm Settings to populate the header.`, 17, y + 5.5);
    y += 12;
  }
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(125, 211, 252);
  doc.roundedRect(14, y, pageW - 28, 8, 1, 1, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(7, 89, 133);
  const countLine = `ℹ ${records.length} record${records.length === 1 ? "" : "s"}${searchQuery ? ` · Filter: "${searchQuery}"` : ""} — This spray diary must be retained for a minimum of 3 years.`;
  doc.text(countLine, 17, y + 5.5);
  y += 12;
  const nv = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const tableBody = records.map((r) => {
    const rate = r.ratePerHectare != null ? `${nv(r.ratePerHectare)} ${String(r.rateUnit ?? "")}`.trim() : "—";
    const weatherParts = [];
    if (r.windSpeedMph != null && r.windSpeedMph !== "") weatherParts.push(`${nv(r.windSpeedMph)} mph`);
    if (r.temperatureCelsius != null && r.temperatureCelsius !== "") weatherParts.push(`${nv(r.temperatureCelsius)} °C`);
    if (r.weatherConditions) weatherParts.push(String(r.weatherConditions));
    const weather = weatherParts.join(" · ") || "—";
    const appDate = r.applicationDate ? new Date(r.applicationDate).toLocaleDateString("en-GB") : "—";
    const productLine = String(r.productName ?? "—");
    const productType = r.productType ? `
(${String(r.productType)})` : "";
    const operatorLine = String(r.operatorName ?? "—");
    const certLine = r.operatorCertificateNo ? `
${String(r.operatorCertificateNo)}` : "";
    const area = r.areaTreatedHa != null && r.areaTreatedHa !== "" ? `${parseFloat(String(r.areaTreatedHa)).toFixed(2)} ha` : "—";
    return [appDate, `${productLine}${productType}`, String(r.mappNumber ?? "—"), String(r.activeIngredient ?? "—"), rate, area, resolveBlock(r.blockId), weather, `${operatorLine}${certLine}`];
  });
  autoTable(doc, {
    head: [["Date", "Product", "MAPP No.", "Active Ingredient", "Rate", "Area", "Block", "Weather", "Operator"]],
    body: tableBody.length ? tableBody : [["", "No records match the current filter.", "", "", "", "", "", "", ""]],
    startY: y,
    styles: { fontSize: 7.5, cellPadding: 2.5, overflow: "linebreak" },
    headStyles: { fillColor: [14, 79, 138], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20 },
      3: { cellWidth: 32 },
      4: { cellWidth: 22 },
      5: { cellWidth: 16, halign: "right" },
      6: { cellWidth: 22 },
      7: { cellWidth: 30 },
      8: { cellWidth: 28 }
    },
    margin: { left: 14, right: 14 }
  });
  const notesRows = records.filter((r) => r.notes).map((r) => {
    const appDate = r.applicationDate ? new Date(r.applicationDate).toLocaleDateString("en-GB") : "—";
    return [`${appDate} — ${String(r.productName ?? "")}`, String(r.notes ?? "")];
  });
  if (notesRows.length) {
    const afterTable = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 79, 138);
    doc.text("NOTES", 14, afterTable);
    autoTable(doc, {
      head: [["Application", "Notes"]],
      body: notesRows,
      startY: afterTable + 3,
      styles: { fontSize: 7.5, cellPadding: 2.5, overflow: "linebreak" },
      headStyles: { fillColor: [14, 79, 138], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: "auto" } },
      margin: { left: 14, right: 14 }
    });
  }
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Prepared by BDE Farm Trac  ·  Vine Spray Diary  ·  Plant Protection Products Regulations 2011  ·  Retain for 3 years", 14, pageH - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 5, { align: "right" });
  }
  doc.save("vine-spray-diary.pdf");
}
const PRESSURE_LABELS = {
  0: { label: "None", color: "text-gray-400" },
  1: { label: "Low", color: "text-green-600" },
  2: { label: "Medium", color: "text-amber-600" },
  3: { label: "High", color: "text-red-600" }
};
const BBCH_STAGES = [
  { code: "00", desc: "Dormancy — buds dormant" },
  { code: "05", desc: "Wool stage — bud scales swelling" },
  { code: "07", desc: "Burst bud — green tips visible" },
  { code: "09", desc: "Two or three leaves unfolded" },
  { code: "11", desc: "First leaf unfolded" },
  { code: "13", desc: "Three leaves unfolded" },
  { code: "15", desc: "Five leaves unfolded" },
  { code: "53", desc: "Inflorescence visible — closed" },
  { code: "55", desc: "Inflorescence clearly visible" },
  { code: "57", desc: "Single flowers separating" },
  { code: "60", desc: "Start of flowering — first caps fallen" },
  { code: "65", desc: "Full flowering — 50% of caps fallen" },
  { code: "68", desc: "End of flowering — nearly all caps fallen" },
  { code: "71", desc: "Fruit set — berries pea-sized" },
  { code: "73", desc: "Berries beginning to touch" },
  { code: "75", desc: "Berries touching" },
  { code: "77", desc: "Berries beginning to soften" },
  { code: "81", desc: "Beginning of ripening — berries begin to colour" },
  { code: "83", desc: "Berries developing variety colour" },
  { code: "85", desc: "Berries softening" },
  { code: "89", desc: "Berries ripe for harvest" },
  { code: "93", desc: "Beginning of leaf colouration / fall" },
  { code: "97", desc: "End of leaf fall" }
];
const UK_GRAPE_VARIETIES = [
  "Bacchus",
  "Chardonnay",
  "Dornfelder",
  "Huxelrebe",
  "Madeleine Angevine",
  "Müller-Thurgau",
  "Ortega",
  "Phoenix",
  "Pinot Blanc",
  "Pinot Gris",
  "Pinot Meunier",
  "Pinot Noir",
  "Regent",
  "Reichensteiner",
  "Rondo",
  "Seyval Blanc",
  "Siegerrebe",
  "Solaris",
  "Auxerrois",
  "Cabernet Cortis",
  "Cabernet Blanc",
  "Johanniter",
  "Lakhta",
  "Sauvignon Blanc",
  "Other"
];
const VIVC_VARIETY_MAP = {
  "Auxerrois": "823",
  "Bacchus": "856",
  "Cabernet Blanc": "1818",
  "Cabernet Cortis": "1823",
  "Chardonnay": "4551",
  "Dornfelder": "3267",
  "Huxelrebe": "5765",
  "Johanniter": "6264",
  "Madeleine Angevine": "7182",
  "Müller-Thurgau": "8166",
  "Ortega": "8823",
  "Phoenix": "9269",
  "Pinot Blanc": "9279",
  "Pinot Gris": "9280",
  "Pinot Meunier": "9281",
  "Pinot Noir": "9282",
  "Regent": "10077",
  "Reichensteiner": "10086",
  "Rondo": "10465",
  "Sauvignon Blanc": "11004",
  "Seyval Blanc": "11345",
  "Siegerrebe": "11439",
  "Solaris": "11534"
};
const UK_ROOTSTOCKS = [
  "5C Teleki",
  "SO4",
  "3309 Couderc",
  "101-14 Millardet",
  "5BB Kober",
  "125AA",
  "41B",
  "420A",
  "Gravesac",
  "Riparia Gloire de Montpellier",
  "161-49 Couderc",
  "Fercal",
  "Schwarzmann",
  "Own Rooted",
  "Other"
];
const OPERATION_TYPES = [
  "Winter Pruning",
  "Spur Thinning",
  "Bud Rubbing",
  "Shoot Thinning",
  "Tie Down / Cane Laying",
  "Wire Lifting",
  "Leaf Removal",
  "Topping / Hedging",
  "Green Harvest (Crop Thinning)",
  "Soil Cultivation",
  "Mulching",
  "Other"
];
function StatCard({ label, value, sub, color }) {
  const cls = color === "red" ? "text-red-600" : color === "amber" ? "text-amber-600" : color === "green" ? "text-green-700" : color === "purple" ? "text-purple-700" : "text-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-3 space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${cls}`, children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: sub })
  ] });
}
function Empty({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: msg });
}
function DataTable({ cols, rows, onEdit, onDelete, onView, deleteMutation, sortKey, sortDir, onSort, rowClassName }) {
  const [pending, setPending] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (deleteMutation?.isSuccess) setPending(null);
  }, [deleteMutation?.isSuccess]);
  if (!rows.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No records yet. Add one using the button above." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: c.sortable && onSort ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "flex items-center gap-1 hover:text-foreground transition-colors",
            onClick: () => onSort(c.key),
            children: [
              c.label,
              sortKey === c.key ? sortDir === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "w-3.5 h-3.5 opacity-40" })
            ]
          }
        ) : c.label }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b last:border-0 ${rowClassName ? rowClassName(row) : ""}`, children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: c.render ? c.render(row) : fmt(row[c.key]) }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
          onView && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onView(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPending(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!pending, title: "Delete Record", message: "Are you sure you want to delete this record? This cannot be undone.", confirmLabel: "Delete", confirmVariant: "destructive", mutation: deleteMutation, onConfirm: () => {
      if (pending && onDelete) {
        onDelete(pending);
        if (!deleteMutation) setPending(null);
      }
    }, onCancel: () => {
      setPending(null);
      deleteMutation?.reset();
    } })
  ] });
}
function useCrud(farmId, endpoint, key) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery({
    queryKey: [key, farmId],
    queryFn: async () => {
      const r = await fetch(apiUrl(`farms/${farmId}/${endpoint}`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId
  });
  const refetch = () => qc.refetchQueries({ queryKey: [key, farmId] });
  const add = useMutation({
    mutationFn: async (body) => {
      const r = await fetch(apiUrl(`farms/${farmId}/${endpoint}`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: refetch,
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const edit = useMutation({
    mutationFn: async ({ id, ...body }) => {
      const r = await fetch(apiUrl(`farms/${farmId}/${endpoint}/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: refetch,
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(apiUrl(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: refetch,
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  return { data: q.data ?? [], isLoading: q.isLoading, add, edit, remove };
}
function ViewField({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: value ?? "—" })
  ] });
}
function RaiseTaskBtn({ onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-purple-700 border-purple-200 hover:bg-purple-50", onClick, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 mr-1" }),
    "Raise Task"
  ] });
}
function emailHarvestReport(records, farmName, blocks, farmMeta, yearLabel) {
  const sbi = (farmMeta?.sbiNumber ? String(farmMeta.sbiNumber) : "").trim();
  const address = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const fsaVineRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const fsaWineRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const printed = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const blockLookup = {};
  (blocks ?? []).forEach((b) => {
    blockLookup[b.id] = String(b.blockName ?? "");
  });
  const bname = (id) => {
    const bid = Number(id);
    return !isNaN(bid) && bid > 0 ? blockLookup[bid] ?? "—" : "—";
  };
  const totalKg = records.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
  const col = (v, width) => {
    const s = v == null || v === "" ? "—" : String(v);
    return s.length <= width ? s.padEnd(width) : s.slice(0, width - 1) + "…";
  };
  const nf = (v, dp) => {
    const f = parseFloat(String(v ?? ""));
    return isNaN(f) ? "—" : f.toFixed(dp);
  };
  const df = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const headerLine = [
    col("Date", 12),
    col("Vintage", 8),
    col("Block", 20),
    col("Method", 14),
    col("Yield (kg)", 11),
    col("Brix", 6),
    col("pH", 6),
    col("TA g/L", 7),
    col("PA %", 6)
  ].join("  ");
  const separator = "-".repeat(headerLine.length);
  const dataLines = records.map((r) => [
    col(df(r.harvestDate), 12),
    col(r.vintageYear ?? "", 8),
    col(bname(r.blockId), 20),
    col(r.harvestMethod ?? "", 14),
    col(r.yieldKg ? parseFloat(String(r.yieldKg)).toFixed(1) : "—", 11),
    col(nf(r.brix, 1), 6),
    col(nf(r.ph, 2), 6),
    col(nf(r.titratableAcidityGl, 2), 7),
    col(nf(r.potentialAlcohol, 2), 6)
  ].join("  "));
  const body = [
    `Harvest Report — ${farmName}${yearLabel ? ` (${yearLabel})` : ""}`,
    ``,
    `Farm: ${farmName}`,
    ...address ? [`Address: ${address}`] : [`Address: (not set — add in Farm Settings)`],
    sbi ? `SBI Number: ${sbi}` : `SBI Number: (not set — add in Farm Settings)`,
    fsaVineRef ? `FSA Vine Register Ref: ${fsaVineRef}` : `FSA Vine Register Ref: (not set — add in Farm Settings)`,
    fsaWineRef ? `FSA Wine Production Ref: ${fsaWineRef}` : `FSA Wine Production Ref: (not set — add in Farm Settings)`,
    `Date: ${printed}`,
    `Records: ${records.length}   Total yield: ${totalKg > 0 ? totalKg.toFixed(1) + " kg" : "—"}`,
    ``,
    separator,
    headerLine,
    separator,
    ...dataLines.length > 0 ? dataLines : [`(no records)`],
    separator,
    ``,
    `Prepared by BDE Farm Trac.`
  ].join("\n");
  const subject = encodeURIComponent(
    `Harvest Report — ${farmName}${yearLabel ? ` (${yearLabel})` : ""}`
  );
  window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
}
function emailOrganicWineRecords(records, farmName, farmMeta) {
  const address = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const fsaVineRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const fsaWineRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const winegbNo = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const printed = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const vintages = [...new Set(records.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse().join(", ");
  const col = (v, width) => {
    const s = v == null || v === "" ? "—" : String(v);
    return s.length <= width ? s.padEnd(width) : s.slice(0, width - 1) + "…";
  };
  const nf = (v, dp) => {
    const f = parseFloat(String(v ?? ""));
    return isNaN(f) ? "—" : f.toFixed(dp);
  };
  const headerLine = [
    col("Vintage", 8),
    col("Colour", 8),
    col("Volume (L)", 11),
    col("Organic", 8),
    col("Certifier Ref", 14),
    col("Additive", 18),
    col("Type", 14),
    col("Quantity", 12),
    col("SO2 Actual", 11),
    col("SO2 Max", 8),
    col("SO2 Status", 12)
  ].join("  ");
  const separator = "-".repeat(headerLine.length);
  const dataLines = records.map((r) => {
    const isOrganic = r.certifiedOrganic === 1 || r.certifiedOrganic === "1";
    const isSo2Compliant = r.so2Compliant === 1 || r.so2Compliant === "1";
    const volumeStr = r.volumeLitres ? nf(r.volumeLitres, 0) : "—";
    const quantityStr = r.quantityUsed ? `${String(r.quantityUsed)} ${String(r.quantityUnit ?? "")}`.trim() : "—";
    return [
      col(r.vintageYear ?? "", 8),
      col(r.wineColour ?? "", 8),
      col(volumeStr, 11),
      col(isOrganic ? "Yes" : "No", 8),
      col(r.certifierRef ?? "", 14),
      col(r.additiveName ?? "", 18),
      col(r.additiveType ?? "", 14),
      col(quantityStr, 12),
      col(r.actualSO2MgL ? nf(r.actualSO2MgL, 0) : "—", 11),
      col(r.maxSO2MgL ? nf(r.maxSO2MgL, 0) : "—", 8),
      col(isSo2Compliant ? "Compliant" : "Exceeds", 12)
    ].join("  ");
  });
  const body = [
    `Organic Wine Production Register — ${farmName}`,
    ``,
    `Farm: ${farmName}`,
    ...address ? [`Address: ${address}`] : [`Address: (not set — add in Farm Settings)`],
    fsaVineRef ? `FSA Vine Register Ref: ${fsaVineRef}` : `FSA Vine Register Ref: (not set — add in Farm Settings)`,
    fsaWineRef ? `FSA Wine Production Ref: ${fsaWineRef}` : `FSA Wine Production Ref: (not set — add in Farm Settings)`,
    appaRef ? `APPA Ref: ${appaRef}` : `APPA Ref: (not set — add in Farm Settings)`,
    ...winegbNo ? [`WineGB Membership No: ${winegbNo}`] : [],
    `Date: ${printed}`,
    `Vintages: ${vintages || "All"}   Records: ${records.length}`,
    ``,
    `SO2 limits for organic wine (UK-retained Reg 203/2012):`,
    `  Red wine — 100 mg/L total SO2. White & rose — 150 mg/L.`,
    `  These limits are lower than for conventional wine.`,
    ``,
    separator,
    headerLine,
    separator,
    ...dataLines.length > 0 ? dataLines : [`(no records)`],
    separator,
    ``,
    `Prepared by BDE Farm Trac. UK-retained EU Reg 203/2012. Retain for certification audit purposes.`
  ].join("\n");
  const subject = encodeURIComponent(
    `Organic Wine Production Register — ${farmName}${vintages ? ` (${vintages})` : ""}`
  );
  const encodedBody = encodeURIComponent(body);
  const href = `mailto:?subject=${subject}&body=${encodedBody}`;
  return { href, isTruncated: encodedBody.length > MAILTO_BODY_LIMIT };
}
export {
  printVineSprayDiaryReport as A,
  BBCH_STAGES as B,
  today as C,
  DataTable as D,
  Empty as E,
  FarmSettingsWarning as F,
  buildVarietyColorMap as G,
  buildUniqueBlockColorMap as H,
  OPERATION_TYPES as O,
  PRESSURE_LABELS as P,
  RaiseTaskBtn as R,
  StatCard as S,
  UK_GRAPE_VARIETIES as U,
  VIVC_VARIETY_MAP as V,
  YIELD_CHART_COLORS as Y,
  useCrud as a,
  UK_ROOTSTOCKS as b,
  ViewField as c,
  buildRpaMailtoHref as d,
  downloadVineHarvestPdf as e,
  downloadVineOperationsPdf as f,
  downloadVineRegisterPdf as g,
  downloadVineSprayDiaryPdf as h,
  emailHarvestReport as i,
  emailOrganicWineRecords as j,
  emailRpaReference as k,
  emailVineRegister as l,
  exportCSV as m,
  fmt as n,
  fmtDate as o,
  fmtNum as p,
  printDiseaseScouting as q,
  printExciseReturn as r,
  printHarvest as s,
  printOperations as t,
  useFarmMeta as u,
  printOrganicWineRecords as v,
  printPhenology as w,
  printRpaReference as x,
  printSprayRecords as y,
  printVineRegister as z
};
