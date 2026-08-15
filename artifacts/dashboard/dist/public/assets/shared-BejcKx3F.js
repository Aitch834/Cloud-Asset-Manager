import { m as useQuery, r as reactExports, j as jsxRuntimeExports, d as Button, u as useLocation, c as useQueryClient, a as useToast, S as useMutation } from "./index-zOeBAfPt.js";
import { b as buildViticultureCsvContent } from "./csv-BwoSy5Nc.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { C as ConfirmDialog } from "./confirm-dialog-Bm6qyNo3.js";
import { C as ChevronUp } from "./chevron-up-D8HLT5VS.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-jmoi3zYk.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-3r759NGu.js";
import { E as Eye } from "./eye-Cmac4L64.js";
import { P as Pencil } from "./pencil-DPWutNMf.js";
import { T as TriangleAlert } from "./triangle-alert-D4yY8V_W.js";
import { C as CircleCheck } from "./circle-check-CrkP_zs-.js";
import { C as CircleX } from "./circle-x-BRgNXXGD.js";
import { c as ClipboardList } from "./AppLayout-BlR6vELz.js";
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
    { label: "APPA Ref", value: farmRecord?.appaRef },
    { label: "WineGB Membership No", value: farmRecord?.winegbMembershipNumber }
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
  const content = buildViticultureCsvContent(rows, cols, warningRow);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
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
  const addressRaw = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const addressHtml = addressRaw ? esc(addressRaw) : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const vatNumber = farmMeta?.vatNumber ? esc(farmMeta.vatNumber) : "";
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRefHtml = appaRef ? `APPA Ref: <strong>${esc(appaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const fsaWineRefHtml = fsaWineProductionRef ? `FSA Wine Production Ref: <strong>${esc(fsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
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
    .fsa-missing { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; border-radius: 3px; padding: 1px 7px; font-weight: 700; font-size: 10.5px; }
    .notice { background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 16px; }
    .footer { margin-top: 28px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
    @media print {
      body { margin: 20px; }
      button { display: none; }
      .fsa-missing { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #fbbf24 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
function emailRpaReference(blocks, farmName, farmMeta) {
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
    col("Parcel / Field Ref", 20),
    col("Variety", 22),
    col("Area (ha)", 10),
    col("Year", 6),
    col("Rootstock", 18),
    col("SBI", 14)
  ].join("  ");
  const separator = "-".repeat(headerLine.length);
  const dataLines = blocks.map((b) => [
    col(b.blockName, 20),
    col(b.fieldParcelRef ?? "", 20),
    col(b.variety ?? "", 22),
    col(parseFloat(String(b.areaHa ?? 0)).toFixed(2), 10),
    col(b.plantingYear ?? "", 6),
    col(b.rootstock ?? "", 18),
    col(sbi, 14)
  ].join("  "));
  const totalLine = [
    col("TOTAL", 20),
    col("", 20),
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
  window.location.href = `mailto:?subject=${subject}&body=${encodedBody}`;
}
function escHtml(v) {
  if (v == null || v === "") return "—";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
const YIELD_CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16"];
function buildYieldTrendChartSvg(records, blockLookup) {
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
  const varietyList = [...new Set(allBlockIds.map((id) => bvariety(id)))].filter(Boolean);
  const varietyColorMap = {};
  varietyList.forEach((v, i) => {
    varietyColorMap[v] = YIELD_CHART_COLORS[i % YIELD_CHART_COLORS.length];
  });
  const fallbackColors = [...YIELD_CHART_COLORS].reverse();
  let fallbackIdx = 0;
  const blockColorMap = {};
  for (const id of allBlockIds) {
    const v = bvariety(id);
    blockColorMap[String(id)] = varietyColorMap[v] ?? fallbackColors[fallbackIdx++ % fallbackColors.length];
  }
  const matrix = {};
  for (const r of linkedRows) {
    const bid = String(r.blockId);
    const vy = String(r.vintageYear ?? "");
    if (!matrix[bid]) matrix[bid] = {};
    matrix[bid][vy] = (matrix[bid][vy] ?? 0) + (parseFloat(String(r.yieldKg ?? 0)) || 0);
  }
  const allVals = Object.values(matrix).flatMap((v) => Object.values(v));
  const maxVal = Math.max(...allVals, 1);
  const legendCols = 4;
  const legendRows = Math.ceil(blockCount / legendCols);
  const legendH = legendRows * 14 + 10;
  const W = 700;
  const plotH = 200;
  const ML = 68;
  const MR = 16;
  const MT = 18;
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
function buildYieldTrendChartTHaSvg(records, blockLookup) {
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
  const thaVarietyList = [...new Set(blockIdsWithArea.map((id) => bvarietyTha(id)))].filter(Boolean);
  const thaVarietyColorMap = {};
  thaVarietyList.forEach((v, i) => {
    thaVarietyColorMap[v] = YIELD_CHART_COLORS[i % YIELD_CHART_COLORS.length];
  });
  const thaFallbackColors = [...YIELD_CHART_COLORS].reverse();
  let thaFallbackIdx = 0;
  const thaBlockColorMap = {};
  for (const id of blockIdsWithArea) {
    const v = bvarietyTha(id);
    thaBlockColorMap[String(id)] = thaVarietyColorMap[v] ?? thaFallbackColors[thaFallbackIdx++ % thaFallbackColors.length];
  }
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
  const legendCols = 4;
  const legendRows = Math.ceil(blockCount / legendCols);
  const legendH = legendRows * 14 + 10;
  const W = 700;
  const plotH = 200;
  const ML = 68;
  const MR = 16;
  const MT = 18;
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
  const addressRaw = (farmMeta?.address ? String(farmMeta.address) : "").trim();
  const addressHtml = addressRaw ? escHtml(addressRaw) : `<span class="fsa-missing">&#9888; Farm address not set</span>`;
  const fsaVineRegisterRef = (farmMeta?.fsaVineRegisterRef ? String(farmMeta.fsaVineRegisterRef) : fsaVineRef ?? "").trim();
  const fsaWineProductionRef = (farmMeta?.fsaWineProductionRef ? String(farmMeta.fsaWineProductionRef) : "").trim();
  const appaRef = (farmMeta?.appaRef ? String(farmMeta.appaRef) : "").trim();
  const winegbMembershipNumber = (farmMeta?.winegbMembershipNumber ? String(farmMeta.winegbMembershipNumber) : "").trim();
  const fsaVineRefHtml = fsaVineRegisterRef ? `FSA Vine Register Ref: <strong>${escHtml(fsaVineRegisterRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Vine Register Ref not set</span>`;
  const fsaWineRefHtml = fsaWineProductionRef ? `FSA Wine Production Ref: <strong>${escHtml(fsaWineProductionRef)}</strong>` : `<span class="fsa-missing">&#9888; FSA Wine Production Ref not set</span>`;
  const appaRefHtml = appaRef ? `APPA Ref: <strong>${escHtml(appaRef)}</strong>` : `<span class="fsa-missing">&#9888; APPA Ref not set</span>`;
  const winegbHtml = winegbMembershipNumber ? `WineGB: <strong>${escHtml(winegbMembershipNumber)}</strong><br>` : "";
  const anyMissingRef = !addressRaw || !fsaVineRegisterRef || !fsaWineProductionRef || !appaRef;
  const missingRefWarningBlock = anyMissingRef ? `<div class="missing-refs-notice">
        <strong>&#9888; Missing header information</strong> &mdash;
        the field(s) marked below (${[
    !addressRaw ? "Farm Address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !fsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !appaRef ? "APPA Ref" : ""
  ].filter(Boolean).join(", ")}) have not been set in Farm Settings.
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
  const blockSummaryRows = blockSummaryKeys.sort((a, b) => blockSummaryMap[a].label.localeCompare(blockSummaryMap[b].label)).map((key) => {
    const row = blockSummaryMap[key];
    const tha = row.areaHa > 0 ? row.totalKg / 1e3 / row.areaHa : null;
    const pickBadgeHtml = row.picks === 1 ? ` <span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fbbf24;border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700;white-space:nowrap">&#9888; 1 pick — low confidence</span>` : row.picks <= 3 ? ` <span style="display:inline-block;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;border-radius:3px;padding:1px 5px;font-size:9px;white-space:nowrap">${row.picks} picks</span>` : "";
    return `<tr>
        ${hasPhotos ? row.photoCell : ""}
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(row.label)}${pickBadgeHtml}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;color:#555">${escHtml(row.variety)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.areaHa > 0 ? row.areaHa.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${row.picks}</td>
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
  const bsColSpan = hasPhotos ? 11 : 10;
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
    const vintageColHeaders = crossVintages.map(
      (vy) => `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">${escHtml(vy)} (kg)</th><th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">${escHtml(vy)} (t/ha)</th>`
    ).join("");
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
        return `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${total > 0 ? total.toFixed(0) : "—"}</td><td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace;color:#555">${tha != null ? tha.toFixed(2) : "—"}</td>`;
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
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(label)}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;color:#555">${escHtml(variety)}</td>
        ${vintageCells}
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:700;font-family:monospace">${rowTotal > 0 ? rowTotal.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:700;font-family:monospace;color:#555">${rowTha != null ? rowTha.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgBrixRow != null ? avgBrixRow.toFixed(1) + " °" : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgPhRow != null ? avgPhRow.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgTaRow != null ? avgTaRow.toFixed(1) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avgPaRow != null ? avgPaRow.toFixed(1) : "—"}</td>
      </tr>`;
    }).join("");
    const crossTabBidSet = new Set(uniqueBlockIdsForCross.map((bid) => String(bid)));
    const crossTabRecords = records.filter((r) => crossTabBidSet.has(String(r.blockId ?? "")));
    const footerVintageCells = crossVintages.map((vy) => {
      const crossTabRecordsForVintage = crossTabRecords.filter((r) => String(r.vintageYear ?? "") === vy);
      const total = crossTabRecordsForVintage.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
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
      return `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${total > 0 ? total.toFixed(0) : "—"}</td><td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${vintageTha != null ? vintageTha.toFixed(2) : "—"}</td>`;
    }).join("");
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
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:18px">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Block</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Variety</th>
      ${vintageColHeaders}
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Total (kg)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Total (t/ha)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Brix &deg;</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg pH</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg TA (g/L)</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg Pot. Alc %</th>
    </tr></thead>
    <tbody>${crossBodyRows}</tbody>
    <tfoot><tr>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700">All blocks</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>
      ${footerVintageCells}
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${grandTotal > 0 ? grandTotal.toFixed(0) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${grandTha != null ? grandTha.toFixed(2) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgBrix != null ? grandAvgBrix.toFixed(1) + " °" : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgPh != null ? grandAvgPh.toFixed(2) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgTa != null ? grandAvgTa.toFixed(1) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgPa != null ? grandAvgPa.toFixed(1) : "—"}</td>
    </tr></tfoot>
  </table>`;
  }
  {
    const chemLinkedVintages = [...new Set(chemLinkedRecords.map((r) => String(r.vintageYear ?? "")).filter(Boolean))].sort();
    const chemLinkedBlockIds = [...new Set(chemLinkedRecords.map((r) => r.blockId))];
    const showChemCrossTab = chemLinkedVintages.length >= 2 && chemLinkedBlockIds.length >= 2;
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
        { label: "Avg Brix °", precision: 1, extractor: (r) => {
          const v = parseFloat(String(r.brix ?? ""));
          return isNaN(v) ? null : v;
        } },
        { label: "Avg pH", precision: 2, extractor: (r) => {
          const v = parseFloat(String(r.ph ?? ""));
          return isNaN(v) ? null : v;
        } },
        { label: "Avg TA (g/L)", precision: 2, extractor: (r) => {
          const v = parseFloat(String(r.titratableAcidityGl ?? ""));
          return isNaN(v) ? null : v;
        } },
        { label: "Avg Pot. Alc %", precision: 2, extractor: (r) => {
          const v = parseFloat(String(r.potentialAlcohol ?? ""));
          return isNaN(v) ? null : v;
        } }
      ];
      const chemSubTablesHtml = chemPrintMetrics.map((metric) => {
        const vintageHeaders = chemLinkedVintages.map(
          (vy) => `<th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">${escHtml(vy)}</th>`
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
            return `<td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-family:monospace">${avg != null ? avg.toFixed(metric.precision) : "—"}</td>`;
          }).join("");
          const allForBlock = Object.values(chemCrossLookup[bidStr] ?? {}).flat();
          const allValsForBlock = allForBlock.map(metric.extractor).filter((v) => v !== null);
          const rowAvg = allValsForBlock.length > 0 ? allValsForBlock.reduce((a, b) => a + b, 0) / allValsForBlock.length : null;
          return `<tr>
            <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600">${escHtml(label)}</td>
            <td style="padding:5px 5px;border:1px solid #d1d5db;color:#555">${escHtml(variety)}</td>
            ${vintageCells}
            <td style="padding:5px 5px;border:1px solid #d1d5db;text-align:right;font-weight:700;font-family:monospace">${rowAvg != null ? rowAvg.toFixed(metric.precision) : "—"}</td>
          </tr>`;
        }).join("");
        const footerVintageCells = chemLinkedVintages.map((vy) => {
          const vals = chemLinkedRecords.filter((r) => String(r.vintageYear ?? "") === vy).map(metric.extractor).filter((v) => v !== null);
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          return `<td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${avg != null ? avg.toFixed(metric.precision) : "—"}</td>`;
        }).join("");
        const allValsGrand = chemLinkedRecords.map(metric.extractor).filter((v) => v !== null);
        const grandAvgMetric = allValsGrand.length > 0 ? allValsGrand.reduce((a, b) => a + b, 0) / allValsGrand.length : null;
        return `
  <h3 style="font-size:11px;font-weight:700;margin:0 0 4px;color:#7c3d12">${escHtml(metric.label)} &mdash; Block &times; Vintage</h3>
  <table style="width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:14px">
    <thead><tr>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Block</th>
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:left;white-space:nowrap">Variety</th>
      ${vintageHeaders}
      <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Avg All Vintages</th>
    </tr></thead>
    <tbody>${chemBodyRows}</tbody>
    <tfoot><tr>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700">All blocks</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>
      ${footerVintageCells}
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${grandAvgMetric != null ? grandAvgMetric.toFixed(metric.precision) : "—"}</td>
    </tr></tfoot>
  </table>`;
      }).join("");
      chemCrossTabHtml = `
  <h2 style="font-size:12px;font-weight:700;border-bottom:1px solid #7c3d12;padding-bottom:4px;margin:0 0 8px;color:#7c3d12;text-transform:uppercase;letter-spacing:0.04em">Chemistry Cross-tab &mdash; Block &times; Vintage</h2>
  <p style="font-size:10px;color:#666;margin:0 0 8px">Average chemistry values per block per vintage. Footer row shows the record-weighted average across all linked blocks for that vintage.</p>
  ${chemSubTablesHtml}`;
    }
  }
  const yieldChartSvgHtml = showCrossTab ? buildYieldTrendChartSvg(records, blockLookup2) : "";
  const { svg: yieldTHaChartSvgHtml, excludedBlocks: tHaExcludedBlocks, eligibleBlockCount: tHaEligibleBlockCount } = groupByVintage ? buildYieldTrendChartTHaSvg(records, blockLookup2) : { svg: "", excludedBlocks: [], eligibleBlockCount: 0 };
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
    const vintageRows = uniqueVintages.map((yr) => {
      const v = vintageObj[yr] ?? { picks: 0, totalKg: 0, brixSum: 0, brixCount: 0, phSum: 0, phCount: 0, taSum: 0, taCount: 0, paSum: 0, paCount: 0 };
      const tha = vintageTha(yr);
      const vPickBadgeHtml = v.picks === 1 ? ` <span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fbbf24;border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700;white-space:nowrap">&#9888; 1 pick — low confidence</span>` : v.picks <= 3 ? ` <span style="display:inline-block;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;border-radius:3px;padding:1px 5px;font-size:9px;white-space:nowrap">${v.picks} picks</span>` : "";
      return `<tr>
        <td style="padding:5px 5px;border:1px solid #d1d5db;font-weight:600;color:#7c3d12">${escHtml(yr)}${vPickBadgeHtml}</td>
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
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5"></td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandAvgPh != null ? vsGrandAvgPh.toFixed(2) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandAvgTa != null ? vsGrandAvgTa.toFixed(1) : "—"}</td>
      <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-family:monospace">${vsGrandAvgPa != null ? vsGrandAvgPa.toFixed(1) : "—"}</td>
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
        <th style="background:#7c3d12;color:white;padding:6px 5px;text-align:right;white-space:nowrap">Picks</th>
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
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;font-weight:700" colspan="2">Farm Totals / Averages</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalArea > 0 ? summTotalArea.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalPicks}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summTotalKg > 0 ? summTotalKg.toFixed(0) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgTha != null ? summAvgTha.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgBrix != null ? summAvgBrix.toFixed(1) + " °" : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgPh != null ? summAvgPh.toFixed(2) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgTa != null ? summAvgTa.toFixed(1) : "—"}</td>
        <td style="padding:5px 5px;border:1px solid #fdba74;background:#ffedd5;text-align:right;font-weight:700;font-family:monospace">${summAvgPa != null ? summAvgPa.toFixed(1) : "—"}</td>
      </tr>
    </tfoot>
  </table>
  ${crossTabHtml}
  ${chemCrossTabHtml}
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
async function printPhenology(records, farmName, blocks) {
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
  const years = [...new Set(records.map((r) => new Date(r.observationDate).getFullYear()))].sort().reverse().join(", ");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Phenology (BBCH Growth Stages) &mdash; ${safeFarmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; }
    h1 { font-size: 17px; margin: 0 0 2px; color: #4b3a8a; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4b3a8a; padding-bottom: 10px; margin-bottom: 14px; }
    .meta { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #4b3a8a; color: white; padding: 6px 5px; text-align: left; white-space: nowrap; }
    td { padding: 5px 5px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #f5f3ff; }
    .footer { margin-top: 16px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 7px; }
    @media print { body { margin: 0; } button { display: none !important; } }
  </style></head><body>
  <div class="header">
    <div>
      <h1>Phenology (BBCH Growth Stages)</h1>
      <div class="meta">
        <strong>${safeFarmName}</strong><br>
        ${years ? `Season(s): ${years}<br>` : ""}
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
      <td style="max-width:120px;white-space:normal">${escHtml(r.notes)}${Number(r.photoCount) > 0 ? `${r.notes ? "<br>" : ""}<span style="font-size:9px;border:1px solid #888;border-radius:2px;padding:0 3px;white-space:nowrap;display:inline-block;margin-top:2px">&#128247; ${Number(r.photoCount)} photo${Number(r.photoCount) === 1 ? "" : "s"}</span>` : ""}</td>
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
  emailRpaReference as e,
  exportCSV as f,
  fmt as g,
  fmtDate as h,
  fmtNum as i,
  printExciseReturn as j,
  printHarvest as k,
  printOperations as l,
  printOrganicWineRecords as m,
  printPhenology as n,
  printRpaReference as o,
  printDiseaseScouting as p,
  printSprayRecords as q,
  printVineRegister as r,
  today as t,
  useFarmMeta as u
};
