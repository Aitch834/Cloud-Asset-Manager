import { m as useQuery, r as reactExports, j as jsxRuntimeExports, d as Button, u as useLocation, c as useQueryClient, a as useToast, S as useMutation } from "./index-D4AsNSyV.js";
import { s as sanitiseCsvCell } from "./csv-Dr539t8b.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { C as ConfirmDialog } from "./confirm-dialog-DCihOatm.js";
import { C as ChevronUp } from "./chevron-up-DsU9COzZ.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-CJSZ9w_v.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-4aL8Yovc.js";
import { E as Eye } from "./eye-pLChoqtw.js";
import { P as Pencil } from "./pencil-131C-uIw.js";
import { T as TriangleAlert } from "./triangle-alert-DyT2FlKg.js";
import { C as CircleCheck } from "./circle-check-CNIeLZlc.js";
import { C as CircleX } from "./circle-x-CWlLkooy.js";
import { c as ClipboardList } from "./AppLayout-CZKO83oK.js";
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
  onNavigate
}) {
  if (missingFields.length === 0) return null;
  const fieldList = missingFields.join(", ");
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
          onClick: onNavigate,
          children: [
            "Add in Farm Settings → ",
            settingsSection
          ]
        }
      )
    ] })
  ] });
}
function FsaCompletenessBar({ farmId }) {
  const { farmRecord, isLoading } = useFarmMeta(farmId);
  const [, navigate] = useLocation();
  if (isLoading) return null;
  const fields = [
    { label: "FSA Vine Register Ref", value: farmRecord?.fsaVineRegisterRef },
    { label: "FSA Wine Production Ref", value: farmRecord?.fsaWineProductionRef },
    { label: "APPA Ref", value: farmRecord?.appaRef }
  ];
  const allComplete = fields.every((f) => !!f.value && String(f.value).trim() !== "");
  if (allComplete) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 mb-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800", children: "FSA / APPA registration incomplete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-0.5", children: [
          "Missing references will appear blank in printed reports. Add them in",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "underline underline-offset-2 hover:text-amber-900 font-medium",
              onClick: () => navigate("/settings/farm"),
              children: "Farm Settings → Viticulture & Wine"
            }
          ),
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: fields.map((f) => {
      const filled = !!f.value && String(f.value).trim() !== "";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: filled ? "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 cursor-default" : "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors",
          onClick: () => {
            if (!filled) navigate("/settings/farm");
          },
          disabled: filled,
          children: [
            filled ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 shrink-0 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5 shrink-0 text-amber-500" }),
            f.label,
            !filled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500 ml-0.5", children: "→" })
          ]
        },
        f.label
      );
    }) })
  ] });
}
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
const fmtNum = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
function exportCSV(rows, filename, cols, warningRow) {
  if (!rows.length) return;
  const header = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const body = rows.map(
    (r) => cols.map((c) => {
      const raw = c.fmt ? c.fmt(r) : String(r[c.key] ?? "");
      const safe = sanitiseCsvCell(raw);
      return `"${safe.replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\n");
  const prefix = warningRow ? warningRow + "\n" : "";
  const blob = new Blob(["\uFEFF" + prefix + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function printExciseReturn(record, farmName, licenceNo, farmMeta) {
  const d = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const n = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
  const esc = (v) => v == null || v === "" ? "" : String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const spr = !!record.smallProducerRelief;
  const dutiableL = (parseFloat(String(record.totalLitresRemovedUK ?? 0)) || 0) + (parseFloat(String(record.totalLitresDomesticConsumption ?? 0)) || 0) + (parseFloat(String(record.totalLitresTastings ?? 0)) || 0);
  const address = farmMeta?.address ? esc(farmMeta.address) : "";
  const vatNumber = farmMeta?.vatNumber ? esc(farmMeta.vatNumber) : "";
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>HMRC Alcohol Duty Return — ${esc(farmName)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; margin: 40px; }
    h1 { font-size: 18px; margin-bottom: 2px; }
    h2 { font-size: 13px; font-weight: 700; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 18px 0 8px; color: #333; text-transform: uppercase; letter-spacing: 0.04em; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 20px; }
    .meta { font-size: 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    td { padding: 5px 8px; border: 1px solid #ddd; }
    td:first-child { font-weight: 500; width: 58%; background: #f7f7f7; }
    td:last-child { text-align: right; }
    .total-row td { font-weight: 700; background: #eef2ff; border-color: #a5b4fc; }
    .duty-row td { font-weight: 700; background: #1e3a5f; color: #fff; border-color: #1e3a5f; font-size: 14px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-spr { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .badge-std { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .notice { background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 16px; }
    .footer { margin-top: 28px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
    @media print { body { margin: 20px; } button { display: none; } }
  </style></head><body>
  <div class="header">
    <div>
      <h1>HMRC Alcohol Duty Return</h1>
      <div class="meta">
        <strong>${esc(farmName)}</strong>${licenceNo ? ` &nbsp;&middot;&nbsp; Winery Licence: ${esc(licenceNo)}` : ""}<br>
        ${address ? `${address}<br>` : ""}
        ${vatNumber ? `VAT Reg No: ${vatNumber}<br>` : ""}
        Return Period: <strong>${d(record.periodStart)} &ndash; ${d(record.periodEnd)}</strong>
      </div>
    </div>
    <div style="text-align:right">
      <div class="meta">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</div>
      ${record.hmrcReturnRef ? `<div class="meta" style="margin-top:4px">HMRC Ref: <strong>${String(record.hmrcReturnRef)}</strong></div>` : ""}
      <div class="meta" style="margin-top:6px;font-size:13px">Status: <strong>${String(record.status ?? "draft").toUpperCase()}</strong></div>
    </div>
  </div>

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
  const address = farmMeta?.address ? esc(farmMeta.address) : "";
  const vintages = [...new Set(records.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse().join(", ");
  const fsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const fsaVineRefHtml = fsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${esc(fsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const fsaWineRefHtml = fsaWineProductionRef ? `FSA Wine Production Ref: <strong>${esc(fsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const appaRefHtml = appaRef ? `APPA Ref: <strong>${esc(appaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const anyMissingRef = !fsaVineRegisterRef || !fsaWineProductionRef || !appaRef;
  const missingRefWarningBlock = anyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing registration references</strong> &mdash;
        the field(s) marked below (FSA Vine Register Ref, FSA Wine Production Ref, APPA Ref) have not been set in Farm Settings.
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
    <strong>${esc(farmName)}</strong>${address ? ` &nbsp;&middot;&nbsp; ${address}` : ""}<br>
    ${fsaVineRefHtml}<br>
    ${fsaWineRefHtml}<br>
    ${appaRefHtml}<br>
    Vintages: ${vintages || "All"} &nbsp;&middot;&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record(s)
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
function escHtml(v) {
  if (v == null || v === "") return "—";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
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
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
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
  const safeAddress = farmMeta?.address ? escHtml(farmMeta.address) : "";
  const fsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : fsaVineRef ?? "").trim();
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const fsaVineRefHtml = fsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${escHtml(fsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const fsaWineRefHtml = fsaWineProductionRef ? `FSA Wine Production Ref: <strong>${escHtml(fsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const appaRefHtml = appaRef ? `APPA Ref: <strong>${escHtml(appaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const anyMissingRef = !fsaVineRegisterRef || !fsaWineProductionRef || !appaRef;
  const missingRefWarningBlock = anyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing registration references</strong> &mdash;
        the field(s) marked below (FSA Vine Register Ref, FSA Wine Production Ref, APPA Ref) have not been set in Farm Settings.
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
        ${safeAddress ? `${safeAddress}<br>` : ""}Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} entr${records.length === 1 ? "y" : "ies"}
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
async function printOperations(records, farmName, farmId, blocks, farmMeta) {
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
  const opsAddress = [farmMeta?.address, farmMeta?.postcode].filter((v) => v != null && v !== "").map(escHtml).join(", ");
  const colSpan = hasPhotos ? 9 : 10;
  const opsFsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const opsFsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const opsAppaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const opsFsaVineRefHtml = opsFsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${escHtml(opsFsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const opsFsaWineRefHtml = opsFsaWineProductionRef ? `FSA Wine Production Ref: <strong>${escHtml(opsFsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const opsAppaRefHtml = opsAppaRef ? `APPA Ref: <strong>${escHtml(opsAppaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const opsAnyMissingRef = !opsFsaVineRegisterRef || !opsFsaWineProductionRef || !opsAppaRef;
  const opsMissingRefWarningBlock = opsAnyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing registration references</strong> &mdash;
        the field(s) marked below (FSA Vine Register Ref, FSA Wine Production Ref, APPA Ref) have not been set in Farm Settings.
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
        <strong>${safeFarmName}</strong>${opsAddress ? `<br>${opsAddress}` : ""}<br>
        ${opsFsaVineRefHtml}<br>
        ${opsFsaWineRefHtml}<br>
        ${opsAppaRefHtml}<br>
        Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record${records.length === 1 ? "" : "s"}
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
async function printHarvest(records, farmName, farmId, blocks, farmMeta) {
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
    return `<tr>
      ${photoCell}
      <td>${d(r.harvestDate)}</td>
      <td>${escHtml(r.vintageYear)}</td>
      <td>${hasPhotos ? "" : escHtml(bName)}</td>
      <td>${escHtml(r.harvestMethod)}</td>
      <td style="text-align:right">${n(r.yieldKg, 1)}</td>
      <td style="text-align:right">${n(r.yieldTonnesPerHa, 2)}</td>
      <td style="text-align:right">${n(r.brix, 1)}</td>
      <td style="text-align:right">${n(r.ph, 2)}</td>
      <td>${escHtml(r.grapeCondition)}</td>
      <td>${botrytisCell}</td>
      <td>${escHtml(r.operatorName)}</td>
      <td>${escHtml(r.notes)}</td>
    </tr>`;
  }).join("");
  const totalKg = records.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
  const safeFarmName = escHtml(farmName);
  const harvestAddress = [farmMeta?.address, farmMeta?.postcode].filter((v) => v != null && v !== "").map(escHtml).join(", ");
  const vintages = [...new Set(records.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse().join(", ");
  const colSpan = hasPhotos ? 12 : 13;
  const harvestFsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : "").trim();
  const harvestFsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const harvestAppaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const harvestWinegbNumber = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const harvestFsaVineRefHtml = harvestFsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${escHtml(harvestFsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const harvestFsaWineRefHtml = harvestFsaWineProductionRef ? `FSA Wine Production Ref: <strong>${escHtml(harvestFsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const harvestAppaRefHtml = harvestAppaRef ? `APPA Ref: <strong>${escHtml(harvestAppaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const harvestWinegbHtml = harvestWinegbNumber ? `WineGB Membership No: <strong>${escHtml(harvestWinegbNumber)}</strong>` : "";
  const harvestAnyMissingRef = !harvestFsaVineRegisterRef || !harvestFsaWineProductionRef || !harvestAppaRef;
  const harvestMissingRefWarningBlock = harvestAnyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing registration references</strong> &mdash;
        the field(s) marked below (FSA Vine Register Ref, FSA Wine Production Ref, APPA Ref) have not been set in Farm Settings.
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
  const blockSummaryRows = blockSummaryKeys.sort((a, b) => blockSummaryMap[a].label.localeCompare(blockSummaryMap[b].label)).map((key) => {
    const row = blockSummaryMap[key];
    const tha = row.areaHa > 0 ? row.totalKg / 1e3 / row.areaHa : null;
    return `<tr>
        ${hasPhotos ? row.photoCell : ""}
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(row.label)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;color:#555">${escHtml(row.variety)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.areaHa > 0 ? row.areaHa.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:600;font-family:monospace">${row.totalKg > 0 ? row.totalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${tha != null ? tha.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.brixCount > 0 ? (row.brixSum / row.brixCount).toFixed(1) + " °" : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.phCount > 0 ? (row.phSum / row.phCount).toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.taCount > 0 ? (row.taSum / row.taCount).toFixed(1) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.potAlcCount > 0 ? (row.potAlcSum / row.potAlcCount).toFixed(1) : "—"}</td>
      </tr>`;
  }).join("");
  const summBlockRows = blockSummaryKeys.map((k) => blockSummaryMap[k]);
  const summTotalKg = summBlockRows.reduce((s, r) => s + r.totalKg, 0);
  const summTotalArea = summBlockRows.reduce((s, r) => s + r.areaHa, 0);
  const summAvgTha = summTotalArea > 0 ? summTotalKg / 1e3 / summTotalArea : null;
  const summBrixRows = summBlockRows.filter((r) => r.brixCount > 0).map((r) => r.brixSum / r.brixCount);
  const summAvgBrix = summBrixRows.length > 0 ? summBrixRows.reduce((a, b) => a + b, 0) / summBrixRows.length : null;
  const summPaRows = summBlockRows.filter((r) => r.potAlcCount > 0).map((r) => r.potAlcSum / r.potAlcCount);
  const summAvgPa = summPaRows.length > 0 ? summPaRows.reduce((a, b) => a + b, 0) / summPaRows.length : null;
  const bsColSpan = hasPhotos ? 10 : 9;
  const bsPhotoHeader = hasPhotos ? `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;width:76px">Photo</th>` : "";
  const bsPhotoFooterCell = hasPhotos ? `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>` : "";
  const uniqueBlockIdsForCross = [...new Set(records.map((r) => r.blockId).filter((id) => id != null && id !== ""))];
  const showCrossTab = uniqueVintages.length > 1 && uniqueBlockIdsForCross.length > 1;
  let crossTabHtml = "";
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
    const vintageColHeaders = crossVintages.map(
      (vy) => `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">${escHtml(vy)}</th>`
    ).join("");
    const crossBodyRows = uniqueBlockIdsForCross.map((bid) => {
      const bidStr = String(bid);
      const bidNum = Number(bidStr);
      const label = !isNaN(bidNum) && bidNum > 0 ? String(blockLookup2[bidNum]?.blockName ?? bidStr) : "—";
      const vintageCells = crossVintages.map((vy) => {
        const grp = crossLookup[bidStr]?.[vy] ?? [];
        const total = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        return `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${total > 0 ? total.toFixed(0) : "—"}</td>`;
      }).join("");
      const allForBlock = Object.values(crossLookup[bidStr] ?? {}).flat();
      const rowTotal = allForBlock.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      const brixAll = allForBlock.map((r) => parseFloat(String(r.brix ?? ""))).filter((v) => !isNaN(v));
      const avgBrixRow = brixAll.length > 0 ? brixAll.reduce((a, b) => a + b, 0) / brixAll.length : null;
      const phAll = allForBlock.map((r) => parseFloat(String(r.ph ?? ""))).filter((v) => !isNaN(v));
      const avgPhRow = phAll.length > 0 ? phAll.reduce((a, b) => a + b, 0) / phAll.length : null;
      const taAll = allForBlock.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
      const avgTaRow = taAll.length > 0 ? taAll.reduce((a, b) => a + b, 0) / taAll.length : null;
      const paAll = allForBlock.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
      const avgPaRow = paAll.length > 0 ? paAll.reduce((a, b) => a + b, 0) / paAll.length : null;
      return `<tr>
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(label)}</td>
        ${vintageCells}
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:700;font-family:monospace">${rowTotal > 0 ? rowTotal.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgBrixRow != null ? avgBrixRow.toFixed(1) + " °" : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgPhRow != null ? avgPhRow.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgTaRow != null ? avgTaRow.toFixed(1) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgPaRow != null ? avgPaRow.toFixed(1) : "—"}</td>
      </tr>`;
    }).join("");
    const footerVintageCells = crossVintages.map((vy) => {
      const total = records.filter((r) => String(r.vintageYear ?? "") === vy).reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      return `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${total > 0 ? total.toFixed(0) : "—"}</td>`;
    }).join("");
    const grandTotal = records.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
    const allBrix = records.map((r) => parseFloat(String(r.brix ?? ""))).filter((v) => !isNaN(v));
    const grandAvgBrix = allBrix.length > 0 ? allBrix.reduce((a, b) => a + b, 0) / allBrix.length : null;
    const allPh = records.map((r) => parseFloat(String(r.ph ?? ""))).filter((v) => !isNaN(v));
    const grandAvgPh = allPh.length > 0 ? allPh.reduce((a, b) => a + b, 0) / allPh.length : null;
    const allTa = records.map((r) => parseFloat(String(r.titratableAcidityGl ?? ""))).filter((v) => !isNaN(v));
    const grandAvgTa = allTa.length > 0 ? allTa.reduce((a, b) => a + b, 0) / allTa.length : null;
    const allPa = records.map((r) => parseFloat(String(r.potentialAlcohol ?? ""))).filter((v) => !isNaN(v));
    const grandAvgPa = allPa.length > 0 ? allPa.reduce((a, b) => a + b, 0) / allPa.length : null;
    crossTabHtml = `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">Block &times; Vintage &mdash; Total Yield (kg)</h2>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:18px">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Block</th>
      ${vintageColHeaders}
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Total Yield (kg)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Brix &deg;</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg pH</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg TA (g/L)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Pot. Alc %</th>
    </tr></thead>
    <tbody>${crossBodyRows}</tbody>
    <tfoot><tr>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700">All blocks</td>
      ${footerVintageCells}
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${grandTotal > 0 ? grandTotal.toFixed(0) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgBrix != null ? grandAvgBrix.toFixed(1) + " °" : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgPh != null ? grandAvgPh.toFixed(2) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgTa != null ? grandAvgTa.toFixed(1) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgPa != null ? grandAvgPa.toFixed(1) : "—"}</td>
    </tr></tfoot>
  </table>`;
  }
  let vintageSummaryHtml = "";
  if (groupByVintage) {
    const vintageObj = {};
    for (const r of records) {
      const yr = String(r.vintageYear ?? "Unknown");
      if (!vintageObj[yr]) vintageObj[yr] = { totalKg: 0, brixSum: 0, brixCount: 0 };
      vintageObj[yr].totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
      const brix = parseFloat(String(r.brix ?? ""));
      if (!isNaN(brix)) {
        vintageObj[yr].brixSum += brix;
        vintageObj[yr].brixCount++;
      }
    }
    const vintageRows = uniqueVintages.map((yr) => {
      const v = vintageObj[yr] ?? { totalKg: 0, brixSum: 0, brixCount: 0 };
      return `<tr>
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600;color:#7c3d12">${escHtml(yr)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:600;font-family:monospace">${v.totalKg > 0 ? v.totalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${v.brixCount > 0 ? (v.brixSum / v.brixCount).toFixed(1) + " °" : "—"}</td>
      </tr>`;
    }).join("");
    vintageSummaryHtml = `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">Yield Summary &mdash; by Vintage Year</h2>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:18px">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left">Vintage</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Total Yield (kg)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right">Avg Brix &deg;</th>
    </tr></thead>
    <tbody>${vintageRows}</tbody>
    <tfoot><tr>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700">All Vintages</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700">${totalKg.toFixed(0)} kg</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>
    </tr></tfoot>
  </table>`;
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
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Total Yield (kg)</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Yield (t/ha)</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Brix &deg;</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg pH</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg TA (g/L)</th>
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Pot. Alc %</th>
      </tr>
    </thead>
    <tbody>${blockSummaryRows || `<tr><td colspan='${bsColSpan}' style='padding:10px;text-align:center;color:#888'>No records</td></tr>`}</tbody>
    <tfoot>
      <tr>
        ${bsPhotoFooterCell}
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700" colspan="2">Season Totals / Averages</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalArea > 0 ? summTotalArea.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalKg > 0 ? summTotalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgTha != null ? summAvgTha.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgBrix != null ? summAvgBrix.toFixed(1) + " °" : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgPa != null ? summAvgPa.toFixed(1) : "—"}</td>
      </tr>
    </tfoot>
  </table>
  ${crossTabHtml}
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
    tr { page-break-inside: avoid; }
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
        <strong>${safeFarmName}</strong>${harvestAddress ? `<br>${harvestAddress}` : ""}${vintages ? `<br>Vintages: ${vintages}` : ""}<br>
        ${harvestFsaVineRefHtml}<br>
        ${harvestFsaWineRefHtml}<br>
        ${harvestAppaRefHtml}<br>
        ${harvestWinegbHtml ? `${harvestWinegbHtml}<br>` : ""}Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record${records.length === 1 ? "" : "s"}
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
        <td colspan="${hasPhotos ? 4 : 4}"><strong>Total Yield</strong></td>
        <td style="text-align:right"><strong>${totalKg.toFixed(1)} kg</strong></td>
        <td colspan="${hasPhotos ? 7 : 8}"></td>
      </tr>
    </tfoot>` : ""}
  </table>
  <div class="footer">Prepared by BDE Farm Trac &nbsp;&middot;&nbsp; Harvest &amp; Vintage Register &nbsp;&middot;&nbsp; Required for GI / PDO vintage declarations</div>
  </body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => win.print(), 200);
  };
}
async function printDiseaseScouting(records, farmName, farmId, blocks, farmMeta) {
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
      blockScoutMap[key] = { label, visits: 0, minDate: "", maxDate: "", maxDowny: 0, maxPowdery: 0, maxBotrytis: 0, maxPhomopsis: 0, vineWeevil: false, eutypa: false, xylella: false };
      blockScoutKeys.push(key);
    }
    const entry = blockScoutMap[key];
    entry.visits++;
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
      <th style="background:#166534;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Alerts</th>
    </tr></thead>
    <tbody>${blockSummaryRows || `<tr><td colspan='8' style='padding:10px;text-align:center;color:#888'>No records</td></tr>`}</tbody>
  </table>
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #166534;padding-bottom:4px;margin:0 0 8px;color:#166534;text-transform:uppercase;letter-spacing:0.04em">
    Detailed Scouting Records
  </h2>
  ` : "";
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
      <td style="max-width:120px;white-space:normal">${escHtml(r.notes)}</td>
    </tr>`;
  }).join("");
  const safeFarmName = escHtml(farmName);
  const scoutAddress = [farmMeta?.address, farmMeta?.postcode].filter((v) => v != null && v !== "").map(escHtml).join(", ");
  const colCount = hasPhotos ? 17 : 16;
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
    @media print { body { margin: 0; } button { display: none !important; } }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Disease &amp; Pest Scouting Register</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong>${scoutAddress ? `<br>${scoutAddress}` : ""}<br>
        Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} record${records.length === 1 ? "" : "s"}
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
        <th>Notes</th>
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
async function printSprayRecords(records, farmName, farmId, blocks, farmMeta) {
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
    const rateStr = r.ratePerHectare ? `${n(r.ratePerHectare)} ${String(r.rateUnit ?? "")}`.trim() : "—";
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
      <td style="text-align:right">${r.harvestIntervalDays ? `${r.harvestIntervalDays} days` : "—"}</td>
      <td style="text-align:right">${r.windSpeedMph ? `${n(r.windSpeedMph)} mph` : "—"}</td>
      <td style="text-align:right">${r.temperatureCelsius ? `${n(r.temperatureCelsius)} °C` : "—"}</td>
      <td>${escHtml(r.operatorName)}</td>
      <td>${escHtml(r.operatorCertificateNo)}</td>
      <td style="max-width:100px;white-space:normal">${escHtml(r.notes)}</td>
    </tr>`;
  }).join("");
  const safeFarmName = escHtml(farmName);
  const sprayAddress = [farmMeta?.address, farmMeta?.postcode].filter((v) => v != null && v !== "").map(escHtml).join(", ");
  const colCount = hasPhotos ? 16 : 15;
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
    @media print { body { margin: 0; } button { display: none !important; } }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Spray Diary</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong>${sprayAddress ? `<br>${sprayAddress}` : ""}<br>
        Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;&middot;&nbsp; ${records.length} application${records.length === 1 ? "" : "s"}
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
        <th>Notes</th>
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
  const invalidate = () => qc.invalidateQueries({ queryKey: [key, farmId] });
  const add = useMutation({
    mutationFn: async (body) => {
      const r = await fetch(apiUrl(`farms/${farmId}/${endpoint}`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: invalidate,
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const edit = useMutation({
    mutationFn: async ({ id, ...body }) => {
      const r = await fetch(apiUrl(`farms/${farmId}/${endpoint}/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: invalidate,
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(apiUrl(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: invalidate,
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
export {
  BBCH_STAGES as B,
  DataTable as D,
  Empty as E,
  FsaCompletenessBar as F,
  OPERATION_TYPES as O,
  PRESSURE_LABELS as P,
  RaiseTaskBtn as R,
  StatCard as S,
  UK_GRAPE_VARIETIES as U,
  VIVC_VARIETY_MAP as V,
  useCrud as a,
  FarmSettingsWarning as b,
  UK_ROOTSTOCKS as c,
  ViewField as d,
  exportCSV as e,
  fmt as f,
  fmtDate as g,
  fmtNum as h,
  printExciseReturn as i,
  printHarvest as j,
  printOperations as k,
  printOrganicWineRecords as l,
  printSprayRecords as m,
  printVineRegister as n,
  printDiseaseScouting as p,
  today as t,
  useFarmMeta as u
};
