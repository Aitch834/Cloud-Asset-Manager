import { s as createLucideIcon, b as useAppStore, r as reactExports, a as useToast, c as useQueryClient, m as useQuery, O as useMutation, j as jsxRuntimeExports, d as Button, S as Plus, L as Label, a0 as X, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, I as Input, M as MapPin } from "./index-ChT92JoS.js";
import { u as usePersistedTab } from "./use-persisted-tab-BKOeUcLV.js";
import { A as AppLayout, G as Gauge, j as Truck, Z as Zap, E as Flame, c as ClipboardList, F as Fuel } from "./AppLayout-BM2ljPVx.js";
import { T as TabBar, a as TabButton } from "./tab-button-CyBym464.js";
import { T as Textarea } from "./textarea-CGx3Sd9P.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, e as SelectGroup, f as SelectLabel } from "./select-BHa7dpnG.js";
import { B as Badge } from "./badge-Bs4Cq-ES.js";
import { u as useUpload } from "./use-upload-MLM8a0af.js";
import { I as IMPLEMENT_TYPES } from "./equipmentTypes-DkOagSn9.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BaR7zPh8.js";
import { u as useFarmMembers } from "./use-farm-members-C3zgYbmn.js";
import { B as BuyerCombobox } from "./BuyerCombobox-BrnPz_2I.js";
import { T as TriangleAlert } from "./triangle-alert-B1mgcbJr.js";
import { P as Pen } from "./pen-ttMWlBCt.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-C51Q4btx.js";
import { C as ChevronRight } from "./tractor-B60vnfuI.js";
import { E as Eye } from "./eye-DJh-OUWA.js";
import { F as Funnel } from "./funnel-Ca0xR-tT.js";
import { D as Droplets, C as ClipboardCheck, F as FileText, P as PoundSterling, S as ShieldAlert } from "./shield-alert-B-GJ71UF.js";
import { C as Camera } from "./camera-xAyiJVzY.js";
import { P as Paperclip } from "./paperclip-DznOc9MZ.js";
import { E as ExternalLink } from "./external-link-Dy98cGuy.js";
import { C as CircleCheck } from "./circle-check-C0Oh_Wf5.js";
import { C as CircleX } from "./circle-x-ZzY-rlJe.js";
import { W as Wind } from "./wind-CLZ7AUrT.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-BOKJysLH.js";
import { B as BarChart } from "./BarChart-iS-EmLb-.js";
import { C as CartesianGrid } from "./CartesianGrid-D_Agjxot.js";
import { C as ComposedChart, A as Area } from "./ComposedChart-Dt9h3heT.js";
import { L as LineChart } from "./LineChart-CCG5MEpu.js";
import { L as Line } from "./Line-BPyYPN2s.js";
import { U as Upload } from "./upload-CIZ8ePDu.js";
import "./use-safe-clerk-CITEKIYc.js";
import "./database-D30ynP_S.js";
import "./shield-check-D0TEC1Nt.js";
import "./index-DjL6vzXx.js";
import "./index-BVhSFz14.js";
import "./chevron-up-BKJAF3WY.js";
import "./popover-Yq9xu7GD.js";
import "./command-amhoSMIi.js";
import "./search-JxlM1HpG.js";
import "./chevrons-up-down-Co-49Vbx.js";
import "./user-plus-BcuG26NB.js";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M15 2a2 2 0 0 1 1.414.586l4 4A2 2 0 0 1 21 8v7a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z",
      key: "1vo8kb"
    }
  ],
  ["path", { d: "M15 2v4a2 2 0 0 0 2 2h4", key: "sud9ri" }],
  ["path", { d: "M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1", key: "l4dndm" }]
];
const Files = createLucideIcon("files", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M12 22v-5", key: "1ega77" }],
  ["path", { d: "M9 8V2", key: "14iosj" }],
  ["path", { d: "M15 8V2", key: "18g5xt" }],
  ["path", { d: "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z", key: "osxo6l" }]
];
const Plug = createLucideIcon("plug", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode);
function getCropYear(date) {
  const aug = new Date(date.getFullYear(), 7, 1);
  const startYear = date >= aug ? date.getFullYear() : date.getFullYear() - 1;
  return {
    label: `${startYear}/${String(startYear + 1).slice(-2)}`,
    start: new Date(startYear, 7, 1),
    end: new Date(startYear + 1, 6, 31, 23, 59, 59)
  };
}
function buildCropYearOptions() {
  const now = /* @__PURE__ */ new Date();
  const options = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(now.getFullYear() - i, now.getMonth(), 1);
    const cy = getCropYear(d);
    if (!options.find((o) => o.label === cy.label)) options.push(cy);
  }
  return options;
}
const TECH_TYPES = [
  { value: "solar_pv", label: "Solar PV (Photovoltaic)" },
  { value: "wind_turbine", label: "Wind Turbine" },
  { value: "hydro", label: "Hydroelectric" },
  { value: "biomass_boiler", label: "Biomass Boiler" },
  { value: "anaerobic_digester", label: "Anaerobic Digester (AD)" },
  { value: "other", label: "Other" }
];
const FUEL_TYPES = [
  "red_diesel",
  "white_diesel",
  "heating_oil",
  "lpg_bulk",
  "lpg_bottles",
  "AdBlue",
  "petrol",
  "other"
];
const FUEL_TYPE_LABELS = {
  red_diesel: "Red Diesel (Gas Oil)",
  white_diesel: "Road Diesel (DERV)",
  heating_oil: "Heating Oil (Kerosene)",
  lpg_bulk: "LPG — Bulk Tank (Calor / Flogas)",
  lpg_bottles: "LPG — Bottled / Cylinder",
  AdBlue: "AdBlue",
  petrol: "Petrol",
  other: "Other"
};
const FUEL_TYPE_REGS = {
  red_diesel: "Oil Storage Regs 2001 + HMRC Fuel Duty",
  white_diesel: "HMRC Fuel Duty",
  heating_oil: "Oil Storage Regs 2001",
  lpg_bulk: "DSEAR 2002 / HSE LPGR + UKLPG CoP",
  lpg_bottles: "DSEAR 2002 / HSE — store upright in ventilated cage",
  AdBlue: "No fuel duty implications",
  petrol: "HMRC Fuel Duty"
};
const QUALIFYING_ACTIVITIES = [
  "agriculture",
  "forestry",
  "horticulture",
  "commercial_fishing",
  "rail",
  "non_commercial"
];
const METER_TYPES = [
  { value: "electricity", label: "Electricity (Grid)", icon: "⚡", unit: "kWh" },
  { value: "natural_gas", label: "Natural Gas (Grid)", icon: "🔥", unit: "kWh / m³" },
  { value: "lpg_mains", label: "LPG Mains Network", icon: "🔥", unit: "kWh / kg" }
];
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function fmtL(v) {
  if (v === null || v === void 0 || v === "") return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
}
function fmtKwh(v) {
  if (v === null || v === void 0 || v === "") return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB", { maximumFractionDigits: 0 })} kWh`;
}
function fmtCost(p) {
  if (!p) return "—";
  return `£${(p / 100).toFixed(2)}`;
}
function pct(current, capacity) {
  const c = parseFloat(String(current));
  const cap = parseFloat(String(capacity));
  if (!cap) return 0;
  return Math.min(100, Math.round(c / cap * 100));
}
function TankGauge({ current, capacity }) {
  const p = pct(current, capacity);
  const colour = p < 20 ? "#ef4444" : p < 40 ? "#f97316" : "#22c55e";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2", style: { minWidth: 80 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full transition-all", style: { width: `${p}%`, background: colour } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium", style: { color: colour }, children: [
      p,
      "%"
    ] })
  ] });
}
function ResultBadge({ result }) {
  if (result === "pass") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#d1fae5", color: "#065f46", border: "none" }, children: "Pass" });
  if (result === "advisory") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "Advisory" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Fail" });
}
function CheckRow({ label, value }) {
  if (value === null || value === void 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1 border-b border-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600", children: label }),
    value ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-500" })
  ] });
}
function MeterTypeIcon({ type }) {
  if (type === "electricity") return /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5 text-yellow-500" });
  if (type === "natural_gas") return /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-5 h-5 text-orange-500" });
  if (type === "lpg_mains") return /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-5 h-5 text-blue-500" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Plug, { className: "w-5 h-5 text-gray-400" });
}
const QA_LABELS = {
  agriculture: "Agriculture",
  forestry: "Forestry",
  horticulture: "Horticulture",
  commercial_fishing: "Commercial Fishing",
  rail: "Rail / Off-road Transport",
  non_commercial: "Non-commercial / Own use"
};
function printReport(title, htmlBody) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; color: #111; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 14px; margin-top: 20px; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  p.meta { font-size: 11px; color: #555; margin: 0 0 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
  th { background: #f1f5f9; text-align: left; padding: 5px 8px; font-weight: 600; border-bottom: 1px solid #cbd5e1; }
  td { padding: 4px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:last-child td { border-bottom: none; }
  .warn { background: #fff7ed; }
  .alert { background: #fef2f2; }
  .ok { background: #f0fdf4; }
  .total { font-weight: bold; background: #f1f5f9; }
  .footer { margin-top: 24px; font-size: 10px; color: #888; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  @media print { body { margin: 12px; } }
</style></head><body>${htmlBody}
<div class="footer">Barnett Davies Enterprises Ltd — BDE Farm Trac — Generated ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div>
<script>window.onload = function() { window.print(); }; window.onafterprint = function() { window.close(); };<\/script>
</body></html>`);
  win.document.close();
}
function ReportsTab({
  tanks,
  deliveries,
  usages,
  inspections,
  stockChecks,
  readings,
  meters
}) {
  const cropYearOptions = buildCropYearOptions();
  const [reportCropYear, setReportCropYear] = reactExports.useState(cropYearOptions[0]?.label ?? "");
  const selectedCY = cropYearOptions.find((o) => o.label === reportCropYear) ?? cropYearOptions[0];
  const cyDeliveries = deliveries.filter((d) => {
    if (!d.deliveryDate || !selectedCY) return false;
    const dt = new Date(d.deliveryDate);
    return dt >= selectedCY.start && dt <= selectedCY.end;
  });
  const cyUsages = usages.filter((u) => {
    if (!u.usageDate || !selectedCY) return false;
    const dt = new Date(u.usageDate);
    return dt >= selectedCY.start && dt <= selectedCY.end;
  });
  const totalDeliveredL = cyDeliveries.reduce((s, d) => s + parseFloat(String(d.quantityLitres ?? 0)), 0);
  const totalUsedL = cyUsages.reduce((s, u) => s + parseFloat(String(u.quantityLitres ?? 0)), 0);
  const usageByActivity = {};
  for (const u of cyUsages) {
    const k = String(u.qualifyingActivity ?? "unspecified");
    usageByActivity[k] = (usageByActivity[k] ?? 0) + parseFloat(String(u.quantityLitres ?? 0));
  }
  const discrepancies = stockChecks.filter((s) => {
    const v = parseFloat(String(s.varianceLitres ?? 0));
    return v < -50;
  });
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  function printHMRC() {
    const tankMap = {};
    for (const t of tanks) tankMap[String(t.id)] = String(t.name ?? `Tank ${t.id}`);
    const meterMap = {};
    for (const m of meters) meterMap[String(m.id)] = String(m.name ?? `Meter ${m.id}`);
    const deliveryRows = cyDeliveries.map(
      (d) => `<tr>
        <td>${fmtDate(d.deliveryDate)}</td>
        <td>${String(d.supplierName ?? "—")}</td>
        <td>${String(d.deliveryNote ?? "—")}</td>
        <td>${tankMap[String(d.tankId)] ?? "—"}</td>
        <td>${FUEL_TYPE_LABELS[String(d.fuelType)] ?? String(d.fuelType ?? "—")}</td>
        <td style="text-align:right">${parseFloat(String(d.quantityLitres ?? 0)).toLocaleString("en-GB")}</td>
        <td>${String(d.invoiceReference ?? "—")}</td>
      </tr>`
    ).join("") || "<tr><td colspan='7' style='text-align:center;color:#888'>No deliveries in this period</td></tr>";
    const usageRows = cyUsages.map(
      (u) => `<tr>
        <td>${fmtDate(u.usageDate)}</td>
        <td>${tankMap[String(u.tankId)] ?? String(u.tankName ?? "—")}</td>
        <td>${String(u.vehicleName ?? "—")}</td>
        <td>${String(u.purpose ?? "—")}</td>
        <td>${QA_LABELS[String(u.qualifyingActivity)] ?? String(u.qualifyingActivity ?? "—")}</td>
        <td style="text-align:right">${parseFloat(String(u.quantityLitres ?? 0)).toLocaleString("en-GB")}</td>
        <td>${String(u.recordedBy ?? "—")}</td>
      </tr>`
    ).join("") || "<tr><td colspan='7' style='text-align:center;color:#888'>No usage records in this period</td></tr>";
    const summaryRows = Object.entries(usageByActivity).map(
      ([k, v]) => `<tr><td>${QA_LABELS[k] ?? k}</td><td style="text-align:right">${v.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr>`
    ).join("");
    const energyRows = readings.map((r) => {
      const mname = meterMap[String(r.meterId)] ?? `Meter ${r.meterId}`;
      return `<tr>
        <td>${fmtDate(r.readingDate)}</td>
        <td>${mname}</td>
        <td style="text-align:right">${String(r.currentReading ?? "—")}</td>
        <td style="text-align:right">${String(r.consumptionSinceLast ?? "—")}</td>
        <td>${String(r.readingType ?? "actual")}</td>
        <td>${String(r.recordedBy ?? "—")}</td>
      </tr>`;
    }).join("") || "<tr><td colspan='6' style='text-align:center;color:#888'>No energy readings recorded</td></tr>";
    const html = `
      <h1>HMRC Fuel Duty Register — Crop Year ${reportCropYear}</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today} &nbsp;|&nbsp; Period: ${selectedCY?.start.toLocaleDateString("en-GB")} – ${selectedCY?.end.toLocaleDateString("en-GB")}</p>
      <p class="meta" style="margin-bottom:16px">This register demonstrates qualifying use of rebated fuel (red diesel / gas oil) in accordance with HMRC Excise Notice 75. Retain for 6 years from the accounting period end.</p>

      <h2>Section 1 — Fuel Deliveries</h2>
      <table>
        <thead><tr><th>Date</th><th>Supplier</th><th>Delivery Note</th><th>Tank</th><th>Fuel Type</th><th style="text-align:right">Qty (L)</th><th>Invoice Ref</th></tr></thead>
        <tbody>${deliveryRows}</tbody>
        <tfoot><tr class="total"><td colspan="5">Total Delivered</td><td style="text-align:right">${totalDeliveredL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td><td></td></tr></tfoot>
      </table>

      <h2>Section 2 — Fuel Usage Log</h2>
      <table>
        <thead><tr><th>Date</th><th>Tank</th><th>Vehicle / Machine</th><th>Purpose / Activity</th><th>Qualifying Activity</th><th style="text-align:right">Qty (L)</th><th>Recorded By</th></tr></thead>
        <tbody>${usageRows}</tbody>
        <tfoot><tr class="total"><td colspan="5">Total Used</td><td style="text-align:right">${totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td><td></td></tr></tfoot>
      </table>

      <h2>Section 3 — Usage Summary by Qualifying Activity</h2>
      <table>
        <thead><tr><th>Qualifying Activity</th><th style="text-align:right">Litres Used</th></tr></thead>
        <tbody>${summaryRows || "<tr><td colspan='2' style='text-align:center;color:#888'>No usage records</td></tr>"}</tbody>
        <tfoot><tr class="total"><td>Total</td><td style="text-align:right">${totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr></tfoot>
      </table>

      <h2>Section 4 — Grid Energy Meter Readings</h2>
      <table>
        <thead><tr><th>Date</th><th>Meter</th><th style="text-align:right">Reading</th><th style="text-align:right">Consumption</th><th>Type</th><th>Recorded By</th></tr></thead>
        <tbody>${energyRows}</tbody>
      </table>
    `;
    printReport(`HMRC Fuel Duty Register ${reportCropYear}`, html);
  }
  function printTankCompliance() {
    const inspByTank = {};
    for (const ins of inspections) {
      const tk = String(ins.tankId ?? "");
      if (!inspByTank[tk]) inspByTank[tk] = [];
      inspByTank[tk].push(ins);
    }
    const tankRows = tanks.map((t) => {
      const bunded = t.isBunded === true || t.isBunded === "true";
      const inspDue = t.nextInspectionDue ? fmtDate(t.nextInspectionDue) : "Not set";
      const inspOverdue = t.nextInspectionDue && new Date(t.nextInspectionDue) < /* @__PURE__ */ new Date();
      const lastInsp = (inspByTank[String(t.id)] ?? []).sort((a, b) => String(b.inspectionDate ?? "").localeCompare(String(a.inspectionDate ?? ""))).at(0);
      const lastInspDate = lastInsp ? fmtDate(lastInsp.inspectionDate) : "None recorded";
      const lastInspResult = lastInsp ? String(lastInsp.overallResult ?? "—") : "—";
      const cap = parseFloat(String(t.capacityLitres ?? 0));
      const osr = cap >= 200 ? bunded ? "Compliant — bunded" : `<b style="color:#dc2626">Non-compliant — bunding required for ${cap}+ L tanks</b>` : bunded ? "Bunded (not required for &lt;200 L)" : "Not bunded (OK for &lt;200 L)";
      return `<tr class="${inspOverdue ? "alert" : ""}">
        <td>${String(t.name ?? "")}</td>
        <td>${FUEL_TYPE_LABELS[String(t.fuelType)] ?? String(t.fuelType ?? "")}</td>
        <td style="text-align:right">${cap.toLocaleString("en-GB")} L</td>
        <td>${String(t.location ?? "—")}</td>
        <td>${osr}</td>
        <td>${lastInspDate} — ${lastInspResult}</td>
        <td class="${inspOverdue ? "" : ""}">${inspDue}${inspOverdue ? " <b>(OVERDUE)</b>" : ""}</td>
      </tr>`;
    }).join("") || "<tr><td colspan='7' style='text-align:center;color:#888'>No tanks registered</td></tr>";
    const html = `
      <h1>Tank Compliance Summary — Red Tractor / Oil Storage Regulations 2001</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today}</p>
      <p class="meta" style="margin-bottom:16px">The Control of Pollution (Oil Storage) (England) Regulations 2001 require oil storage containers of 200 litres or more used at agricultural premises to be bunded. All tanks should be inspected annually. This summary demonstrates compliance with Red Tractor Assured Food Standards — Fuel Storage requirements.</p>

      <h2>Tank Register</h2>
      <table>
        <thead><tr><th>Tank Name</th><th>Fuel Type</th><th style="text-align:right">Capacity</th><th>Location</th><th>Bunding / OSR 2001</th><th>Last Inspection</th><th>Next Inspection Due</th></tr></thead>
        <tbody>${tankRows}</tbody>
      </table>

      <p><b>Legend:</b> Rows highlighted red indicate inspection is overdue. All tanks ≥200 L must be bunded under OSR 2001.</p>
    `;
    printReport("Tank Compliance Summary", html);
  }
  function printDiscrepancyReport() {
    const tankMap = {};
    for (const t of tanks) tankMap[String(t.id)] = String(t.name ?? `Tank ${t.id}`);
    const rows = discrepancies.map((s) => {
      const v = Math.abs(parseFloat(String(s.varianceLitres ?? 0)));
      const isLarge = v >= 200;
      return `<tr class="${isLarge ? "alert" : "warn"}">
        <td>${fmtDate(s.checkDate)}</td>
        <td>${tankMap[String(s.tankId)] ?? `Tank ${s.tankId}`}</td>
        <td style="text-align:right">${parseFloat(String(s.measuredLitres ?? 0)).toLocaleString("en-GB")} L</td>
        <td style="text-align:right">${s.calculatedLitres ? parseFloat(String(s.calculatedLitres)).toLocaleString("en-GB") + " L" : "—"}</td>
        <td style="text-align:right;${isLarge ? "color:#dc2626;font-weight:bold" : "color:#d97706"}">${v.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L shortage</td>
        <td>${String(s.method ?? "dip_stick").replace("_", " ")}</td>
        <td>${String(s.checkedBy ?? "—")}</td>
        <td>${isLarge ? "Significant — investigate theft/leak" : "Investigate records"}</td>
      </tr>`;
    }).join("") || "<tr class='ok'><td colspan='8' style='text-align:center'>No significant discrepancies recorded — all stock checks within tolerance</td></tr>";
    const html = `
      <h1>Fuel Stock Discrepancy Report</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today}</p>
      <p class="meta" style="margin-bottom:16px">Showing all stock checks where physically measured stock is more than 50 litres below the calculated figure. Shortfalls ≥200 L are highlighted as significant and may indicate theft or a leak. Records should be retained for HMRC compliance — unexplained losses may need to be declared as misuse of rebated fuel duty relief.</p>

      <h2>Discrepancies Requiring Investigation (Shortfall &gt;50 L)</h2>
      <table>
        <thead><tr><th>Check Date</th><th>Tank</th><th style="text-align:right">Measured</th><th style="text-align:right">Expected</th><th style="text-align:right">Shortfall</th><th>Method</th><th>Checked By</th><th>Action Required</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><b>Legend:</b> Yellow = investigate. Red = significant (≥200 L) — consider police report and HMRC notification.</p>
    `;
    printReport("Fuel Stock Discrepancy Report", html);
  }
  function printVehicleReport() {
    const tankMap = {};
    for (const t of tanks) tankMap[String(t.id)] = String(t.name ?? `Tank ${t.id}`);
    const usageByVehicle = {};
    for (const u of cyUsages) {
      const vName = String(u.vehicleName || "No vehicle / machine recorded");
      if (!usageByVehicle[vName]) usageByVehicle[vName] = { litres: 0, rows: [] };
      usageByVehicle[vName].litres += parseFloat(String(u.quantityLitres ?? 0));
      usageByVehicle[vName].rows.push(u);
    }
    const vehicleSections = Object.entries(usageByVehicle).sort((a, b) => b[1].litres - a[1].litres).map(([vName, data]) => {
      const detailRows = data.rows.sort((a, b) => String(a.usageDate ?? "").localeCompare(String(b.usageDate ?? ""))).map(
        (u) => `<tr>
              <td>${fmtDate(u.usageDate)}</td>
              <td>${tankMap[String(u.tankId)] ?? String(u.tankName ?? "—")}</td>
              <td>${String(u.purpose ?? "—")}</td>
              <td>${QA_LABELS[String(u.qualifyingActivity)] ?? String(u.qualifyingActivity ?? "—")}</td>
              <td style="text-align:right">${parseFloat(String(u.quantityLitres ?? 0)).toLocaleString("en-GB")} L</td>
              <td>${String(u.recordedBy ?? "—")}</td>
            </tr>`
      ).join("");
      return `
          <h2>${vName} — ${data.litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L total</h2>
          <table>
            <thead><tr><th>Date</th><th>Tank</th><th>Purpose / Activity</th><th>Qualifying Activity</th><th style="text-align:right">Qty (L)</th><th>Recorded By</th></tr></thead>
            <tbody>${detailRows}</tbody>
            <tfoot><tr class="total"><td colspan="4">Subtotal — ${vName}</td><td style="text-align:right">${data.litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td><td></td></tr></tfoot>
          </table>`;
    }).join("");
    const summaryRows = Object.entries(usageByVehicle).sort((a, b) => b[1].litres - a[1].litres).map(
      ([vName, data]) => `<tr><td>${vName}</td><td style="text-align:right">${data.rows.length}</td><td style="text-align:right">${data.litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr>`
    ).join("");
    const html = `
      <h1>Vehicle &amp; Machine Fuel Usage Report — Crop Year ${reportCropYear}</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today} &nbsp;|&nbsp; Period: ${selectedCY?.start.toLocaleDateString("en-GB")} – ${selectedCY?.end.toLocaleDateString("en-GB")}</p>
      <p class="meta" style="margin-bottom:16px">Fuel usage grouped by vehicle or machine for the selected crop year. Use this report to identify fuel costs per asset, cross-check machinery utilisation records, and support HMRC qualifying use evidence.</p>

      <h2>Summary by Vehicle / Machine</h2>
      <table>
        <thead><tr><th>Vehicle / Machine</th><th style="text-align:right">Draw-Downs</th><th style="text-align:right">Total Litres</th></tr></thead>
        <tbody>${summaryRows || "<tr><td colspan='3' style='text-align:center;color:#888'>No usage records in this period</td></tr>"}</tbody>
        <tfoot><tr class="total"><td>Grand Total</td><td style="text-align:right">${cyUsages.length}</td><td style="text-align:right">${totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr></tfoot>
      </table>

      ${vehicleSections || "<p style='color:#888'>No usage records for this crop year.</p>"}
    `;
    printReport(`Vehicle Fuel Usage Report ${reportCropYear}`, html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Fuel & Energy Reports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Printable compliance reports for HMRC fuel duty inspections and Red Tractor audits. Reports are generated from your live data and open in a new window ready to print or save as PDF." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Crop year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            className: "text-sm border border-gray-200 rounded px-2 py-1 bg-white",
            value: reportCropYear,
            onChange: (e) => setReportCropYear(e.target.value),
            children: cropYearOptions.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.label, children: o.label }, o.label))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg p-5 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-5 h-5 text-blue-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-800", children: "HMRC Fuel Duty Register" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5 max-w-lg", children: "Demonstrates qualifying use of rebated fuel (red diesel / gas oil) under HMRC Excise Notice 75. Shows all deliveries, usage log with qualifying activities, usage summary by activity type, and grid energy meter readings. Must be retained for 6 years." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-2 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: cyDeliveries.length }),
                " deliveries — ",
                totalDeliveredL.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
                " L delivered"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: cyUsages.length }),
                " usage records — ",
                totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
                " L used"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Crop year ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: reportCropYear })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: printHMRC, className: "bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0", children: "Print / Save PDF" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg p-5 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 text-green-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-800", children: "Tank Compliance Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5 max-w-lg", children: "Red Tractor Assured / Oil Storage Regulations 2001 compliance document. Lists all tanks with bunding status, inspection history and next inspection due date. Flags overdue inspections and any non-compliant bunding. Suitable for Red Tractor audits and HSE inspections." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-2 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: tanks.length }),
                " tanks registered"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: tanks.filter((t) => t.isBunded === true || t.isBunded === "true").length }),
                " bunded"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: tanks.filter((t) => t.nextInspectionDue && new Date(t.nextInspectionDue) < /* @__PURE__ */ new Date()).length }),
                " inspections overdue"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: printTankCompliance, className: "bg-green-700 hover:bg-green-800 text-white flex-shrink-0", children: "Print / Save PDF" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg p-5 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${discrepancies.length > 0 ? "bg-red-50" : "bg-gray-50"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: `w-5 h-5 ${discrepancies.length > 0 ? "text-red-500" : "text-gray-400"}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-800", children: "Fuel Stock Discrepancy Log" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5 max-w-lg", children: "Shows all stock checks where physically measured stock is more than 50 litres below the calculated figure. Significant shortfalls (≥200 L) are flagged for theft or leak investigation. Required for HMRC compliance — unexplained losses in rebated fuel may need to be declared and could result in retrospective full duty liability." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-2 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: stockChecks.length }),
                " total stock checks"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${discrepancies.length > 0 ? "text-red-600" : "text-gray-700"}`, children: discrepancies.length }),
                " discrepanc",
                discrepancies.length === 1 ? "y" : "ies",
                " >50 L"
              ] }),
              discrepancies.filter((s) => Math.abs(parseFloat(String(s.varianceLitres ?? 0))) >= 200).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 font-medium", children: [
                discrepancies.filter((s) => Math.abs(parseFloat(String(s.varianceLitres ?? 0))) >= 200).length,
                " significant (≥200 L) — urgent investigation required"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: printDiscrepancyReport, variant: "outline", className: "border-gray-300 flex-shrink-0", children: "Print / Save PDF" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg p-5 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-5 h-5 text-orange-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-800", children: "Vehicle & Machine Fuel Usage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5 max-w-lg", children: "Fuel usage broken down by vehicle or machine for the selected crop year. Includes a summary table of total litres per asset and full draw-down detail for each vehicle. Useful for machinery cost analysis, operator accountability, and supporting HMRC qualifying-use evidence." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-2 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: cyUsages.length }),
                " usage records in ",
                reportCropYear
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: new Set(cyUsages.map((u) => String(u.vehicleName || "")).filter(Boolean)).size }),
                " vehicles / machines with fuel records"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: printVehicleReport, variant: "outline", className: "border-gray-300 flex-shrink-0", children: "Print / Save PDF" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "HMRC Compliance Note — Rebated Fuel (Red Diesel)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "HMRC may conduct unannounced fuel duty compliance checks at any time. You must be able to produce your fuel delivery records, usage logs and stock reconciliation at short notice. Records must be kept for a minimum of 6 years. Unexplained losses or evidence of misuse of rebated fuel (e.g. using red diesel in road vehicles) may result in retrospective full duty assessment plus penalties. Contact your fuel duty consultant or HMRC if you have concerns." })
    ] })
  ] });
}
function SolarRenewablesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}`;
  const [subTab, setSubTab] = reactExports.useState("installations");
  const [analyticInstallId, setAnalyticInstallId] = reactExports.useState("__all__");
  const EMPTY_INSTALL = { installationName: "", technologyType: "solar_pv", installedCapacityKw: "", installationDate: "", installerName: "", installerSupplierId: null, gridConnectionRef: "", fitOrSegContractRef: "", tariffProvider: "", tariffRatePence: "", maintenanceContractor: "", maintenanceContractorSupplierId: null, nextServiceDate: "", notes: "", panelCount: "", mcsCertificateNumber: "", installerMcsNumber: "", buildingName: "", locationId: null, locationIdType: "" };
  const EMPTY_GEN = { readingDate: "", installationId: "", generationKwh: "", exportKwh: "", selfConsumedKwh: "", fitPaymentPeriod: "", fitPaymentAmount: "", meterReference: "", notes: "" };
  const EMPTY_PAYMENT = { paymentDate: "", installationId: "", periodFrom: "", periodTo: "", exportKwh: "", rateUsedPencePerKwh: "", paymentAmountPence: "", paymentReference: "", supplierName: "", notes: "" };
  const [showInstallDialog, setShowInstallDialog] = reactExports.useState(false);
  const [editInstall, setEditInstall] = reactExports.useState(null);
  const [deleteInstallId, setDeleteInstallId] = reactExports.useState(null);
  const [installForm, setInstallForm] = reactExports.useState(EMPTY_INSTALL);
  const [docsInstall, setDocsInstall] = reactExports.useState(null);
  const [showDocsDialog, setShowDocsDialog] = reactExports.useState(false);
  const [docUploadType, setDocUploadType] = reactExports.useState("other");
  const [docUploadNotes, setDocUploadNotes] = reactExports.useState("");
  const [locationPickerValue, setLocationPickerValue] = reactExports.useState("__custom__");
  const [showGenDialog, setShowGenDialog] = reactExports.useState(false);
  const [editGen, setEditGen] = reactExports.useState(null);
  const [deleteGenId, setDeleteGenId] = reactExports.useState(null);
  const [genForm, setGenForm] = reactExports.useState(EMPTY_GEN);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const [editPayment, setEditPayment] = reactExports.useState(null);
  const [deletePaymentId, setDeletePaymentId] = reactExports.useState(null);
  const [paymentForm, setPaymentForm] = reactExports.useState(EMPTY_PAYMENT);
  const { data: installsData, isLoading: installsLoading } = useQuery({
    queryKey: ["solar-installations", farmId],
    queryFn: () => fetch(`${base}/solar-installations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const installs = Array.isArray(installsData) ? installsData : [];
  const { data: installLocationsData } = useQuery({
    queryKey: ["installation-locations", farmId],
    queryFn: () => fetch(`${base}/installation-locations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const installLocations = installLocationsData ?? { farmLocations: [], storageLocations: [], fields: [] };
  const { data: installerSuggestions } = useQuery({
    queryKey: ["solar-installer-suggestions", farmId],
    queryFn: () => fetch(`${base}/solar-installer-suggestions`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ["solar-install-docs", farmId, docsInstall?.id],
    queryFn: () => fetch(`${base}/solar-installations/${docsInstall.id}/documents`).then((r) => r.json()),
    enabled: !!farmId && !!docsInstall
  });
  const installDocs = Array.isArray(docsData) ? docsData : [];
  const { data: genData, isLoading: genLoading } = useQuery({
    queryKey: ["solar-generation", farmId],
    queryFn: () => fetch(`${base}/solar-generation`).then((r) => r.json()),
    enabled: !!farmId
  });
  const genReadings = Array.isArray(genData) ? genData : [];
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["solar-payments", farmId],
    queryFn: () => fetch(`${base}/solar-export-payments`).then((r) => r.json()),
    enabled: !!farmId
  });
  const payments = Array.isArray(paymentsData) ? paymentsData : [];
  const totalCapacityKw = installs.filter((i) => i.isActive !== false).reduce((s, i) => s + parseFloat(String(i.installedCapacityKw || "0")), 0);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const ytdGen = genReadings.filter((r) => r.readingDate && new Date(r.readingDate).getFullYear() === currentYear).reduce((s, r) => s + parseFloat(String(r.generationKwh || "0")), 0);
  const ytdExport = genReadings.filter((r) => r.readingDate && new Date(r.readingDate).getFullYear() === currentYear).reduce((s, r) => s + parseFloat(String(r.exportKwh || "0")), 0);
  const ytdSegIncome = payments.filter((p) => p.paymentDate && new Date(p.paymentDate).getFullYear() === currentYear).reduce((s, p) => s + (Number(p.paymentAmountPence) || 0), 0);
  const createInstallMut = useMutation({ mutationFn: (b) => fetch(`${base}/solar-installations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Installation added" });
    qc.invalidateQueries({ queryKey: ["solar-installations", farmId] });
    setShowInstallDialog(false);
    setInstallForm(EMPTY_INSTALL);
  }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateInstallMut = useMutation({ mutationFn: (b) => fetch(`${base}/solar-installations/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Installation updated" });
    qc.invalidateQueries({ queryKey: ["solar-installations", farmId] });
    setShowInstallDialog(false);
    setEditInstall(null);
    setInstallForm(EMPTY_INSTALL);
  }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteInstallMut = useMutation({ mutationFn: (id) => fetch(`${base}/solar-installations/${id}`, { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Deleted" });
    qc.invalidateQueries({ queryKey: ["solar-installations", farmId] });
    setDeleteInstallId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const { uploadFile, isUploading: isInstallDocUploading } = useUpload();
  const createDocMut = useMutation({
    mutationFn: (body) => fetch(`${base}/solar-installations/${body.installationId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Document saved" });
      refetchDocs();
      setDocUploadNotes("");
      setDocUploadType("other");
    },
    onError: () => toast({ title: "Upload failed", variant: "destructive" })
  });
  const deleteDocMut = useMutation({
    mutationFn: ({ installId, docId }) => fetch(`${base}/solar-installations/${installId}/documents/${docId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Document removed" });
      refetchDocs();
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function resolveLocationName(inst) {
    if (inst.locationId && inst.locationIdType) {
      const id = Number(inst.locationId);
      if (inst.locationIdType === "farm_location") {
        return installLocations.farmLocations.find((x) => x.id === id)?.name ?? inst.buildingName ?? "—";
      }
      if (inst.locationIdType === "storage_location") {
        return installLocations.storageLocations.find((x) => x.id === id)?.name ?? inst.buildingName ?? "—";
      }
      if (inst.locationIdType === "field") {
        return installLocations.fields.find((x) => x.id === id)?.name ?? inst.buildingName ?? "—";
      }
    }
    return inst.buildingName || "—";
  }
  function pickToForm(val) {
    if (val === "__custom__") {
      setInstallForm((f) => ({ ...f, locationId: null, locationIdType: "" }));
    } else {
      const [type, id] = val.split(":");
      setInstallForm((f) => ({ ...f, locationId: parseInt(id), locationIdType: type, buildingName: "" }));
    }
    setLocationPickerValue(val);
  }
  const DOC_TYPES = [
    { value: "mcs_certificate", label: "MCS Certificate" },
    { value: "dno_connection", label: "DNO Connection Agreement" },
    { value: "seg_fit_contract", label: "SEG / FiT Contract" },
    { value: "installation_photo", label: "Installation Photo" },
    { value: "maintenance_report", label: "Maintenance Report" },
    { value: "other", label: "Other Document" }
  ];
  const createGenMut = useMutation({ mutationFn: (b) => fetch(`${base}/solar-generation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Reading logged" });
    qc.invalidateQueries({ queryKey: ["solar-generation", farmId] });
    setShowGenDialog(false);
    setGenForm(EMPTY_GEN);
  }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateGenMut = useMutation({ mutationFn: (b) => fetch(`${base}/solar-generation/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Reading updated" });
    qc.invalidateQueries({ queryKey: ["solar-generation", farmId] });
    setShowGenDialog(false);
    setEditGen(null);
    setGenForm(EMPTY_GEN);
  }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteGenMut = useMutation({ mutationFn: (id) => fetch(`${base}/solar-generation/${id}`, { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Deleted" });
    qc.invalidateQueries({ queryKey: ["solar-generation", farmId] });
    setDeleteGenId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const createPaymentMut = useMutation({ mutationFn: (b) => fetch(`${base}/solar-export-payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, paymentAmountPence: b.paymentAmountPence ? Math.round(parseFloat(b.paymentAmountPence) * 100) : 0 }) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Payment recorded" });
    qc.invalidateQueries({ queryKey: ["solar-payments", farmId] });
    setShowPaymentDialog(false);
    setPaymentForm(EMPTY_PAYMENT);
  }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updatePaymentMut = useMutation({ mutationFn: (b) => fetch(`${base}/solar-export-payments/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, paymentAmountPence: b.paymentAmountPence ? Math.round(parseFloat(b.paymentAmountPence) * 100) : void 0 }) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Payment updated" });
    qc.invalidateQueries({ queryKey: ["solar-payments", farmId] });
    setShowPaymentDialog(false);
    setEditPayment(null);
    setPaymentForm(EMPTY_PAYMENT);
  }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deletePaymentMut = useMutation({ mutationFn: (id) => fetch(`${base}/solar-export-payments/${id}`, { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Deleted" });
    qc.invalidateQueries({ queryKey: ["solar-payments", farmId] });
    setDeletePaymentId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const techLabel = (t) => TECH_TYPES.find((x) => x.value === t)?.label ?? t;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Capacity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          totalCapacityKw.toFixed(2),
          " kW"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          installs.filter((i) => i.isActive !== false).length,
          " active installation",
          installs.filter((i) => i.isActive !== false).length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-amber-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "YTD Generation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-amber-600", children: [
          ytdGen.toLocaleString(void 0, { maximumFractionDigits: 0 }),
          " kWh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          "Jan–Dec ",
          currentYear
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-blue-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "YTD Export" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [
          ytdExport.toLocaleString(void 0, { maximumFractionDigits: 0 }),
          " kWh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "exported to grid" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-green-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "YTD SEG Income" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-700", children: [
          "£",
          (ytdSegIncome / 100).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Smart Export Guarantee" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-4 h-4 text-amber-600 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Smart Export Guarantee (SEG)" }),
        " — Any farm generating electricity from a certified (MCS) installation and exporting to the grid must register with a licensed SEG provider. Payments are typically quarterly. Log your MCS certificate number, tariff provider, and SEG rate on each installation. Record quarterly payments in the Export Payments tab to track your total SEG income."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 border-b border-gray-200 mb-4", children: ["installations", "generation", "payments", "analytics"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSubTab(t), className: `pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${subTab === t ? "border-green-700 text-green-800" : "border-transparent text-gray-500 hover:text-gray-700"}`, children: t === "installations" ? `Installations (${installs.length})` : t === "generation" ? `Generation Log (${genReadings.length})` : t === "payments" ? `Export Payments (${payments.length})` : "Analytics" }, t)) }),
    subTab === "installations" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditInstall(null);
        setInstallForm(EMPTY_INSTALL);
        setShowInstallDialog(true);
      }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Installation"
      ] }) }),
      installsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-10", children: "Loading…" }) : installs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No renewable energy installations registered" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Add a Solar PV array, wind turbine, or other installation to get started" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2", children: installs.map((inst) => {
        const isSolar = String(inst.technologyType) === "solar_pv";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              isSolar ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-5 h-5 text-amber-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "w-5 h-5 text-blue-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: String(inst.installationName) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: techLabel(String(inst.technologyType)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Manage documents", onClick: () => {
                setDocsInstall(inst);
                setShowDocsDialog(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Files, { className: "w-3.5 h-3.5 text-blue-500" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditInstall(inst);
                const pv = inst.locationId && inst.locationIdType ? `${inst.locationIdType}:${inst.locationId}` : "__custom__";
                setLocationPickerValue(pv);
                setInstallForm({ ...inst, installedCapacityKw: inst.installedCapacityKw ?? "", panelCount: inst.panelCount ?? "", tariffRatePence: inst.tariffRatePence ?? "" });
                setShowInstallDialog(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => setDeleteInstallId(Number(inst.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Capacity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inst.installedCapacityKw ? `${parseFloat(String(inst.installedCapacityKw)).toFixed(2)} kW${isSolar ? "p" : ""}` : "—" }),
            isSolar && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Panel count" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inst.panelCount ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Building / location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: resolveLocationName(inst) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Install date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inst.installationDate ? new Date(inst.installationDate).toLocaleDateString("en-GB") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "MCS cert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inst.mcsCertificateNumber || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "SEG / FiT rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inst.tariffRatePence ? `${parseFloat(String(inst.tariffRatePence)).toFixed(2)}p/kWh` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Tariff provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inst.tariffProvider || "—" }),
            inst.nextServiceDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Next service" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-amber-600", children: new Date(inst.nextServiceDate).toLocaleDateString("en-GB") })
            ] })
          ] })
        ] }, inst.id);
      }) })
    ] }),
    subTab === "generation" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditGen(null);
        setGenForm(EMPTY_GEN);
        setShowGenDialog(true);
      }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Log Reading"
      ] }) }),
      genLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-10", children: "Loading…" }) : genReadings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No generation readings recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Log monthly meter readings to track generation, export, and self-consumption" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-gray-50 border-b border-gray-200", children: ["Date", "Installation", "Generated (kWh)", "Exported (kWh)", "Self-used (kWh)", "FiT/SEG Period", "Payment (£)", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: genReadings.map((r, i) => {
          const inst = installs.find((x) => Number(x.id) === Number(r.installationId));
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i < genReadings.length - 1 ? "border-b border-gray-100" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500 whitespace-nowrap", children: r.readingDate ? new Date(r.readingDate).toLocaleDateString("en-GB") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: inst?.installationName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-amber-700 font-medium", children: r.generationKwh ? parseFloat(String(r.generationKwh)).toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-blue-700", children: r.exportKwh ? parseFloat(String(r.exportKwh)).toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-green-700", children: r.selfConsumedKwh ? parseFloat(String(r.selfConsumedKwh)).toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500", children: r.fitPaymentPeriod || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium text-green-700", children: r.fitPaymentAmount ? `£${parseFloat(String(r.fitPaymentAmount)).toFixed(2)}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditGen(r);
                setGenForm({ ...r, generationKwh: r.generationKwh ?? "", exportKwh: r.exportKwh ?? "", selfConsumedKwh: r.selfConsumedKwh ?? "", fitPaymentAmount: r.fitPaymentAmount ?? "", installationId: r.installationId ? String(r.installationId) : "" });
                setShowGenDialog(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => setDeleteGenId(Number(r.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, r.id);
        }) })
      ] }) })
    ] }),
    subTab === "payments" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        payments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
          "YTD SEG income: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-green-700", children: [
            "£",
            (ytdSegIncome / 100).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditPayment(null);
          setPaymentForm(EMPTY_PAYMENT);
          setShowPaymentDialog(true);
        }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Record SEG Payment"
        ] }) })
      ] }),
      paymentsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-10", children: "Loading…" }) : payments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No SEG payments recorded yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Record each quarterly Smart Export Guarantee payment received from your energy supplier" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-gray-50 border-b border-gray-200", children: ["Payment Date", "Period", "Installation", "kWh Exported", "Rate", "Amount", "Reference", "Supplier", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: payments.map((p, i) => {
          const inst = installs.find((x) => Number(x.id) === Number(p.installationId));
          const periodStr = p.periodFrom && p.periodTo ? `${new Date(p.periodFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${new Date(p.periodTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}` : "—";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i < payments.length - 1 ? "border-b border-gray-100" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500 whitespace-nowrap", children: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-GB") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs text-gray-500 whitespace-nowrap", children: periodStr }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: inst?.installationName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-blue-700", children: p.exportKwh ? parseFloat(String(p.exportKwh)).toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: p.rateUsedPencePerKwh ? `${parseFloat(String(p.rateUsedPencePerKwh)).toFixed(2)}p/kWh` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 font-semibold text-green-700", children: [
              "£",
              ((Number(p.paymentAmountPence) || 0) / 100).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500", children: p.paymentReference || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500", children: p.supplierName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditPayment(p);
                setPaymentForm({ ...p, exportKwh: p.exportKwh ?? "", rateUsedPencePerKwh: p.rateUsedPencePerKwh ?? "", paymentAmountPence: p.paymentAmountPence ? (Number(p.paymentAmountPence) / 100).toFixed(2) : "", installationId: p.installationId ? String(p.installationId) : "" });
                setShowPaymentDialog(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => setDeletePaymentId(Number(p.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, p.id);
        }) })
      ] }) })
    ] }),
    subTab === "analytics" && (() => {
      const filteredGen = analyticInstallId === "__all__" ? genReadings : genReadings.filter((r) => String(r.installationId) === analyticInstallId);
      const filteredPay = analyticInstallId === "__all__" ? payments : payments.filter((p) => String(p.installationId) === analyticInstallId);
      const selectedInstall = installs.find((i) => String(i.id) === analyticInstallId);
      const totalGenKwh = filteredGen.reduce((s, r) => s + parseFloat(String(r.generationKwh || 0)), 0);
      const totalExportKwh = filteredGen.reduce((s, r) => s + parseFloat(String(r.exportKwh || 0)), 0);
      const totalSelfKwh = filteredGen.reduce((s, r) => s + parseFloat(String(r.selfConsumedKwh || 0)), 0);
      const totalIncomeP = filteredPay.reduce((s, p) => s + (Number(p.paymentAmountPence) || 0), 0);
      const co2Saved = totalSelfKwh * 0.233;
      const monthMap = /* @__PURE__ */ new Map();
      filteredGen.forEach((r) => {
        if (!r.readingDate) return;
        const d = new Date(r.readingDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
        if (!monthMap.has(key)) monthMap.set(key, { month: key, label, generated: 0, exported: 0, selfUsed: 0, income: 0 });
        const b = monthMap.get(key);
        b.generated += parseFloat(String(r.generationKwh || 0));
        b.exported += parseFloat(String(r.exportKwh || 0));
        b.selfUsed += parseFloat(String(r.selfConsumedKwh || 0));
      });
      filteredPay.forEach((p) => {
        if (!p.paymentDate) return;
        const d = new Date(p.paymentDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
        if (!monthMap.has(key)) monthMap.set(key, { month: key, label, generated: 0, exported: 0, selfUsed: 0, income: 0 });
        const b = monthMap.get(key);
        b.income += Number(p.paymentAmountPence) / 100;
      });
      const chartData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, generated: parseFloat(v.generated.toFixed(1)), exported: parseFloat(v.exported.toFixed(1)), selfUsed: parseFloat(v.selfUsed.toFixed(1)), income: parseFloat(v.income.toFixed(2)) }));
      const hasGen = filteredGen.length > 0;
      const hasPay = filteredPay.length > 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-gray-700 shrink-0", children: "Installation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: analyticInstallId, onValueChange: setAnalyticInstallId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All installations (combined)" }),
              installs.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(i.id), children: String(i.installationName) }, String(i.id)))
            ] })
          ] }),
          selectedInstall && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
            selectedInstall.installedCapacityKw ? `${parseFloat(String(selectedInstall.installedCapacityKw)).toFixed(2)} kW` : "",
            " · installed ",
            selectedInstall.installationDate ? new Date(selectedInstall.installationDate).toLocaleDateString("en-GB") : "unknown"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Generated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-700", children: totalGenKwh.toLocaleString("en-GB", { maximumFractionDigits: 0 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "kWh lifetime" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Exported" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-700", children: totalExportKwh.toLocaleString("en-GB", { maximumFractionDigits: 0 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "kWh to grid" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "SEG / FiT Income" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-700", children: [
              "£",
              (totalIncomeP / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "lifetime payments" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-xl p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "CO₂ Avoided" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-emerald-700", children: co2Saved >= 1e3 ? `${(co2Saved / 1e3).toFixed(1)} t` : `${co2Saved.toFixed(0)} kg` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "from self-consumed kWh" })
          ] })
        ] }),
        !hasGen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-8 h-8 mx-auto mb-2 text-gray-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "No generation readings yet — log meter readings in the Generation Log tab to see charts here." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Monthly Generation — Exported vs. Self-Consumed (kWh)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `${v}`, tick: { fontSize: 11 }, unit: " kWh", width: 70 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [`${v.toLocaleString("en-GB", { maximumFractionDigits: 1 })} kWh`, name === "exported" ? "Exported to Grid" : name === "selfUsed" ? "Self-Consumed" : "Generated"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { formatter: (v) => v === "exported" ? "Exported to Grid" : v === "selfUsed" ? "Self-Consumed" : "Generated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "selfUsed", stackId: "a", fill: "#16a34a", name: "selfUsed", radius: [0, 0, 0, 0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "exported", stackId: "a", fill: "#3b82f6", name: "exported", radius: [4, 4, 0, 0] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2 text-center", children: "Stacked: green = on-site use, blue = exported. Where self-consumed kWh isn't logged separately, only export is shown." })
        ] }),
        !hasPay ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-8 h-8 mx-auto mb-2 text-gray-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "No export payments recorded yet — log quarterly SEG/FiT receipts in the Export Payments tab to see income trends here." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "SEG / FiT Income by Month (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData.filter((d) => d.income > 0), margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${v.toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "SEG / FiT Payment"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "income", fill: "#dcfce7", stroke: "#16a34a", strokeWidth: 2, name: "income" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "income", fill: "#16a34a", opacity: 0.7, radius: [3, 3, 0, 0] })
          ] }) })
        ] }),
        hasPay && (() => {
          let running = 0;
          const cumData = chartData.filter((d) => d.income > 0).map((d) => {
            running += d.income;
            return { label: d.label, cumulative: parseFloat(running.toFixed(2)) };
          });
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Cumulative SEG / FiT Income (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: cumData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${v.toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Running total"] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "cumulative", stroke: "#15803d", strokeWidth: 2.5, dot: false })
            ] }) })
          ] });
        })()
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showInstallDialog, onOpenChange: (o) => {
      if (!o) {
        setShowInstallDialog(false);
        setEditInstall(null);
        setInstallForm(EMPTY_INSTALL);
        createInstallMut.reset();
        updateInstallMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editInstall ? "Edit Installation" : "Register New Installation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2 max-h-[65vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installation name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: installForm.installationName ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, installationName: e.target.value })), placeholder: "e.g. Grain Store South Array" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Technology type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: installForm.technologyType ?? "solar_pv", onValueChange: (v) => setInstallForm((f) => ({ ...f, technologyType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TECH_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Capacity (kW",
              installForm.technologyType === "solar_pv" ? "p" : "",
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: installForm.installedCapacityKw ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, installedCapacityKw: e.target.value })), placeholder: "e.g. 49.92" })
          ] }),
          installForm.technologyType === "solar_pv" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Panel count" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: installForm.panelCount ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, panelCount: e.target.value })), placeholder: "e.g. 144" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-gray-400" }),
            "Building / location"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: locationPickerValue, onValueChange: pickToForm, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a location…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              installLocations.farmLocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Farm Buildings & Locations" }),
                installLocations.farmLocations.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: `farm_location:${loc.id}`, children: loc.name }, `farm_location:${loc.id}`))
              ] }),
              installLocations.storageLocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Storage Locations" }),
                installLocations.storageLocations.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: `storage_location:${loc.id}`, children: loc.name }, `storage_location:${loc.id}`))
              ] }),
              installLocations.fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Fields" }),
                installLocations.fields.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: `field:${loc.id}`, children: loc.name }, `field:${loc.id}`))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "Custom / other (type below)" })
            ] })
          ] }),
          locationPickerValue === "__custom__" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: installForm.buildingName ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, buildingName: e.target.value })), placeholder: "e.g. Main grain store south roof" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installation date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: installForm.installationDate ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, installationDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installer name" }),
            farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: installForm.installerSupplierId ?? null, valueName: installForm.installerName ?? "", onChange: (id, name) => setInstallForm((f) => ({ ...f, installerSupplierId: id, installerName: name })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "MCS certificate no." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: installForm.mcsCertificateNumber ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, mcsCertificateNumber: e.target.value })), placeholder: "MCS-..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installer MCS no." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: installForm.installerMcsNumber ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, installerMcsNumber: e.target.value })), placeholder: "MCSXXXX" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SEG / FiT tariff provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: installForm.tariffProvider ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, tariffProvider: e.target.value })), placeholder: "e.g. Octopus Energy" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SEG / FiT rate (p/kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: installForm.tariffRatePence ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, tariffRatePence: e.target.value })), placeholder: "e.g. 7.50" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "FiT / SEG contract ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: installForm.fitOrSegContractRef ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, fitOrSegContractRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "DNO grid connection ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: installForm.gridConnectionRef ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, gridConnectionRef: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Maintenance contractor" }),
            farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: installForm.maintenanceContractorSupplierId ?? null, valueName: installForm.maintenanceContractor ?? "", onChange: (id, name) => setInstallForm((f) => ({ ...f, maintenanceContractorSupplierId: id, maintenanceContractor: name })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next service date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: installForm.nextServiceDate ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, nextServiceDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: installForm.notes ?? "", onChange: (e) => setInstallForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowInstallDialog(false);
          setEditInstall(null);
          setInstallForm(EMPTY_INSTALL);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", disabled: createInstallMut.isPending || updateInstallMut.isPending, onClick: () => {
          if (!installForm.installationName || !installForm.technologyType) {
            toast({ title: "Name and technology type are required", variant: "destructive" });
            return;
          }
          const body = { ...installForm, installedCapacityKw: installForm.installedCapacityKw || null, panelCount: installForm.panelCount ? parseInt(String(installForm.panelCount)) : null, tariffRatePence: installForm.tariffRatePence || null, nextServiceDate: installForm.nextServiceDate || null, installationDate: installForm.installationDate || null };
          if (editInstall) updateInstallMut.mutate({ ...body, id: editInstall.id });
          else createInstallMut.mutate(body);
        }, children: editInstall ? "Save Changes" : "Add Installation" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDocsDialog, onOpenChange: (o) => {
      if (!o) {
        setShowDocsDialog(false);
        setDocsInstall(null);
        setDocUploadNotes("");
        setDocUploadType("other");
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Files, { className: "w-4 h-4 text-blue-500" }),
        "Documents — ",
        docsInstall?.installationName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1", children: [
        installDocs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-6", children: "No documents attached yet. Upload certificates, agreements, or photos below." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: installDocs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-blue-500 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800 truncate", children: doc.fileName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: DOC_TYPES.find((t) => t.value === doc.documentType)?.label ?? doc.documentType }),
              doc.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 truncate", children: doc.notes })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/api/storage${doc.storageKey}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" }),
              "View"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-400 hover:text-red-600 h-7 w-7 p-0", disabled: deleteDocMut.isPending, onClick: () => deleteDocMut.mutate({ installId: docsInstall.id, docId: doc.id }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
          ] })
        ] }, doc.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "Upload a document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: docUploadType, onValueChange: setDocUploadType, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DOC_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: docUploadNotes, onChange: (e) => setDocUploadNotes(e.target.value), placeholder: "e.g. MCS-12345" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: isInstallDocUploading ? "Uploading…" : "Click to choose a file (PDF, image, Word)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", accept: "image/*,application/pdf,.doc,.docx", disabled: isInstallDocUploading || !docsInstall, onChange: async (e) => {
              const file = e.target.files?.[0];
              if (!file || !docsInstall) return;
              const result = await uploadFile(file);
              if (result) {
                createDocMut.mutate({ installationId: docsInstall.id, documentType: docUploadType, fileName: file.name, storageKey: result.objectPath, notes: docUploadNotes || void 0 });
              }
              e.target.value = "";
            } })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        setShowDocsDialog(false);
        setDocsInstall(null);
      }, children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showGenDialog, onOpenChange: (o) => {
      if (!o) {
        setShowGenDialog(false);
        setEditGen(null);
        setGenForm(EMPTY_GEN);
        createGenMut.reset();
        updateGenMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editGen ? "Edit Reading" : "Log Generation Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: genForm.readingDate ?? "", onChange: (e) => setGenForm((f) => ({ ...f, readingDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installation *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(genForm.installationId || "__none__"), onValueChange: (v) => setGenForm((f) => ({ ...f, installationId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select installation" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                installs.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(i.id), children: String(i.installationName) }, String(i.id)))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Generated (kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: genForm.generationKwh ?? "", onChange: (e) => setGenForm((f) => ({ ...f, generationKwh: e.target.value })), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Exported (kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: genForm.exportKwh ?? "", onChange: (e) => setGenForm((f) => ({ ...f, exportKwh: e.target.value })), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Self-used (kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: genForm.selfConsumedKwh ?? "", onChange: (e) => setGenForm((f) => ({ ...f, selfConsumedKwh: e.target.value })), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "FiT / SEG period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: genForm.fitPaymentPeriod ?? "", onChange: (e) => setGenForm((f) => ({ ...f, fitPaymentPeriod: e.target.value })), placeholder: "e.g. Q1 2025" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "FiT / SEG payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: genForm.fitPaymentAmount ?? "", onChange: (e) => setGenForm((f) => ({ ...f, fitPaymentAmount: e.target.value })), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: genForm.notes ?? "", onChange: (e) => setGenForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowGenDialog(false);
          setEditGen(null);
          setGenForm(EMPTY_GEN);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", disabled: createGenMut.isPending || updateGenMut.isPending, onClick: () => {
          if (!genForm.readingDate || !genForm.installationId || genForm.installationId === "__none__") {
            toast({ title: "Date and installation are required", variant: "destructive" });
            return;
          }
          const body = { ...genForm, installationId: parseInt(String(genForm.installationId)), generationKwh: genForm.generationKwh || null, exportKwh: genForm.exportKwh || null, selfConsumedKwh: genForm.selfConsumedKwh || null, fitPaymentAmount: genForm.fitPaymentAmount || null };
          if (editGen) updateGenMut.mutate({ ...body, id: editGen.id });
          else createGenMut.mutate(body);
        }, children: editGen ? "Save Changes" : "Log Reading" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showPaymentDialog, onOpenChange: (o) => {
      if (!o) {
        setShowPaymentDialog(false);
        setEditPayment(null);
        setPaymentForm(EMPTY_PAYMENT);
        createPaymentMut.reset();
        updatePaymentMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editPayment ? "Edit SEG Payment" : "Record SEG Payment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: paymentForm.paymentDate ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(paymentForm.installationId || "__none__"), onValueChange: (v) => setPaymentForm((f) => ({ ...f, installationId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select installation" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                installs.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(i.id), children: String(i.installationName) }, String(i.id)))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Period from" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: paymentForm.periodFrom ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, periodFrom: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Period to" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: paymentForm.periodTo ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, periodTo: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "kWh exported" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: paymentForm.exportKwh ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, exportKwh: e.target.value })), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rate (p/kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: paymentForm.rateUsedPencePerKwh ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, rateUsedPencePerKwh: e.target.value })), placeholder: "e.g. 7.50" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amount (£) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: paymentForm.paymentAmountPence ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, paymentAmountPence: e.target.value })), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: paymentForm.paymentReference ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, paymentReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier / payer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: paymentForm.supplierName ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "e.g. Octopus Energy" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: paymentForm.notes ?? "", onChange: (e) => setPaymentForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowPaymentDialog(false);
          setEditPayment(null);
          setPaymentForm(EMPTY_PAYMENT);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", disabled: createPaymentMut.isPending || updatePaymentMut.isPending, onClick: () => {
          if (!paymentForm.paymentDate || !paymentForm.paymentAmountPence) {
            toast({ title: "Payment date and amount are required", variant: "destructive" });
            return;
          }
          const body = { ...paymentForm, installationId: paymentForm.installationId && paymentForm.installationId !== "__none__" ? parseInt(String(paymentForm.installationId)) : null, exportKwh: paymentForm.exportKwh || null, rateUsedPencePerKwh: paymentForm.rateUsedPencePerKwh || null, periodFrom: paymentForm.periodFrom || null, periodTo: paymentForm.periodTo || null };
          if (editPayment) updatePaymentMut.mutate({ ...body, id: editPayment.id });
          else createPaymentMut.mutate(body);
        }, children: editPayment ? "Save Changes" : "Record Payment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteInstallId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteInstallId(null);
        deleteInstallMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Installation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will permanently delete this installation and all associated records." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteInstallId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteInstallMut.isPending, onClick: () => deleteInstallId !== null && deleteInstallMut.mutate(deleteInstallId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteGenId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteGenId(null);
        deleteGenMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this generation reading?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteGenId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteGenMut.isPending, onClick: () => deleteGenId !== null && deleteGenMut.mutate(deleteGenId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deletePaymentId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeletePaymentId(null);
        deletePaymentMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Payment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this SEG payment record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeletePaymentId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deletePaymentMut.isPending, onClick: () => deletePaymentId !== null && deletePaymentMut.mutate(deletePaymentId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function FuelEnergyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "fuel-energy",
    farmId,
    validIds: ["tanks", "deliveries", "usage", "inspections", "grid-energy", "solar", "reports"],
    defaultTab: "tanks",
    urlOverride: new URLSearchParams(window.location.search).get("tab")
  });
  const openId = (() => {
    const n = Number(new URLSearchParams(window.location.search).get("open"));
    return n > 0 ? n : null;
  })();
  const [hlInspId, setHlInspId] = reactExports.useState(openId);
  const inspRowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoInspOpened = reactExports.useRef(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const { data: fuelMembersData } = useFarmMembers(farmId ?? 0);
  const fuelActiveMembers = (fuelMembersData?.members ?? []).filter((m) => m.isActive);
  const tanksQ = useQuery({
    queryKey: ["fuel-tanks", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/tanks`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const deliveriesQ = useQuery({
    queryKey: ["fuel-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/deliveries`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const usageQ = useQuery({
    queryKey: ["fuel-usage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/usage`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const inspectionsQ = useQuery({
    queryKey: ["fuel-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/storage-inspections`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const metersQ = useQuery({
    queryKey: ["energy-meters", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/energy/meters`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const readingsQ = useQuery({
    queryKey: ["energy-readings", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/energy/readings`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const stockChecksQ = useQuery({
    queryKey: ["fuel-stock-checks", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/stock-checks`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()).then((d) => d.members ?? []),
    enabled: !!farmId
  });
  const { uploadFile, isUploading: isDocUploading } = useUpload();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["fuel-tanks", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-usage", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-inspections", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-stock-checks", farmId] });
    qc.invalidateQueries({ queryKey: ["energy-meters", farmId] });
    qc.invalidateQueries({ queryKey: ["energy-readings", farmId] });
  };
  const [showTankDialog, setShowTankDialog] = reactExports.useState(false);
  const [editTank, setEditTank] = reactExports.useState(null);
  const [tankForm, setTankForm] = reactExports.useState({});
  function openTankAdd() {
    setEditTank(null);
    setTankForm({ fuelType: "red_diesel", isBunded: "false" });
    setShowTankDialog(true);
  }
  function openTankEdit(t) {
    setEditTank(t);
    setTankForm({
      name: String(t.name ?? ""),
      fuelType: String(t.fuelType ?? "red_diesel"),
      capacityLitres: String(t.capacityLitres ?? ""),
      currentStockLitres: String(t.currentStockLitres ?? "0"),
      location: String(t.location ?? ""),
      isBunded: String(t.isBunded ?? "false"),
      bundCapacityLitres: String(t.bundCapacityLitres ?? ""),
      tankMaterial: String(t.tankMaterial ?? ""),
      installDate: t.installDate ? String(t.installDate).substring(0, 10) : "",
      nextInspectionDue: t.nextInspectionDue ? String(t.nextInspectionDue).substring(0, 10) : "",
      notes: String(t.notes ?? "")
    });
    setShowTankDialog(true);
  }
  const tankMut = useMutation({
    mutationFn: async (data) => {
      const url = editTank ? `/api/farms/${farmId}/fuel/tanks/${editTank.id}` : `/api/farms/${farmId}/fuel/tanks`;
      const res = await fetch(url, { method: editTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowTankDialog(false);
      toast({ title: editTank ? "Tank updated" : "Tank added" });
    },
    onError: () => toast({ title: "Error saving tank", variant: "destructive" })
  });
  const delTankMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/fuel/tanks/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Tank removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [showDeliveryDialog, setShowDeliveryDialog] = reactExports.useState(false);
  const [editDelivery, setEditDelivery] = reactExports.useState(null);
  const [viewDelivery, setViewDelivery] = reactExports.useState(null);
  const [deliveryForm, setDeliveryForm] = reactExports.useState({});
  const deliveryMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/deliveries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowDeliveryDialog(false);
      toast({ title: "Delivery recorded" });
    },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" })
  });
  const editDeliveryMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/deliveries/${editDelivery?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowDeliveryDialog(false);
      setEditDelivery(null);
      toast({ title: "Delivery updated" });
    },
    onError: () => toast({ title: "Error updating delivery", variant: "destructive" })
  });
  const delDeliveryMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/fuel/deliveries/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Delivery removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [usageFilterVehicle, setUsageFilterVehicle] = reactExports.useState("__all__");
  const [usageFilterMember, setUsageFilterMember] = reactExports.useState("__all__");
  const [usageFilterTank, setUsageFilterTank] = reactExports.useState("__all__");
  const [usageFilterActivity, setUsageFilterActivity] = reactExports.useState("__all__");
  const [showUsageDialog, setShowUsageDialog] = reactExports.useState(false);
  const [usageForm, setUsageForm] = reactExports.useState({});
  const usageMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/usage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowUsageDialog(false);
      toast({ title: "Usage recorded" });
    },
    onError: () => toast({ title: "Error saving usage", variant: "destructive" })
  });
  const delUsageMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/fuel/usage/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Record removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [showInspDialog, setShowInspDialog] = reactExports.useState(false);
  const [inspForm, setInspForm] = reactExports.useState({});
  const inspMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/storage-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowInspDialog(false);
      toast({ title: "Inspection recorded" });
    },
    onError: () => toast({ title: "Error saving inspection", variant: "destructive" })
  });
  const delInspMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/fuel/storage-inspections/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Inspection removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [showMeterDialog, setShowMeterDialog] = reactExports.useState(false);
  const [editMeter, setEditMeter] = reactExports.useState(null);
  const [meterForm, setMeterForm] = reactExports.useState({});
  const meterMut = useMutation({
    mutationFn: async (data) => {
      const url = editMeter ? `/api/farms/${farmId}/energy/meters/${editMeter.id}` : `/api/farms/${farmId}/energy/meters`;
      const res = await fetch(url, { method: editMeter ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowMeterDialog(false);
      toast({ title: editMeter ? "Meter updated" : "Meter added" });
    },
    onError: () => toast({ title: "Error saving meter", variant: "destructive" })
  });
  const delMeterMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/energy/meters/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Meter removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [showReadingDialog, setShowReadingDialog] = reactExports.useState(false);
  const [readingForm, setReadingForm] = reactExports.useState({});
  const readingMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/energy/readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowReadingDialog(false);
      toast({ title: "Reading recorded" });
    },
    onError: () => toast({ title: "Error saving reading", variant: "destructive" })
  });
  const delReadingMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/energy/readings/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Reading removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [showStockCheckDialog, setShowStockCheckDialog] = reactExports.useState(false);
  const [stockCheckTankId, setStockCheckTankId] = reactExports.useState("");
  const [stockCheckForm, setStockCheckForm] = reactExports.useState({});
  const [expandedTankId, setExpandedTankId] = reactExports.useState(null);
  const stockCheckMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/stock-checks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowStockCheckDialog(false);
      toast({ title: "Stock check recorded" });
    },
    onError: () => toast({ title: "Error saving stock check", variant: "destructive" })
  });
  const delStockCheckMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/fuel/stock-checks/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Stock check removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const CROP_YEAR_OPTIONS = buildCropYearOptions();
  const currentCY = getCropYear(/* @__PURE__ */ new Date());
  const [deliveryCropYear, setDeliveryCropYear] = reactExports.useState(currentCY.label);
  const [usageCropYear, setUsageCropYear] = reactExports.useState(currentCY.label);
  const tanks = tanksQ.data ?? [];
  const deliveries = deliveriesQ.data ?? [];
  const usages = usageQ.data ?? [];
  const inspections = inspectionsQ.data ?? [];
  const meters = metersQ.data ?? [];
  const readings = readingsQ.data ?? [];
  const stockChecks = stockChecksQ.data ?? [];
  const equipment = equipmentQ.data ?? [];
  const motorEquipment = equipment.filter((e) => !IMPLEMENT_TYPES.has(String(e.type ?? "")));
  const members = membersQ.data ?? [];
  reactExports.useEffect(() => {
    if (!openId || autoInspOpened.current || inspections.length === 0) return;
    if (inspections.some((r) => Number(r.id) === openId)) {
      autoInspOpened.current = true;
      setTimeout(() => {
        inspRowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = setTimeout(() => setHlInspId(null), 4e3);
        return () => clearTimeout(t);
      }, 200);
    }
  }, [openId, inspections]);
  const totalStockL = tanks.reduce((s, t) => s + parseFloat(String(t.currentStockLitres ?? 0)), 0);
  const unbundedTanks = tanks.filter((t) => !t.isBunded && !["lpg_bottles", "AdBlue"].includes(String(t.fuelType)));
  const overdueTanks = tanks.filter((t) => t.nextInspectionDue && new Date(String(t.nextInspectionDue)) < /* @__PURE__ */ new Date());
  const stockByFuelType = {};
  for (const t of tanks) {
    const ft = String(t.fuelType ?? "other");
    stockByFuelType[ft] = (stockByFuelType[ft] ?? 0) + parseFloat(String(t.currentStockLitres ?? 0));
  }
  const selectedDeliveryCY = CROP_YEAR_OPTIONS.find((o) => o.label === deliveryCropYear) ?? CROP_YEAR_OPTIONS[0];
  const selectedUsageCY = CROP_YEAR_OPTIONS.find((o) => o.label === usageCropYear) ?? CROP_YEAR_OPTIONS[0];
  const filteredDeliveries = selectedDeliveryCY ? deliveries.filter((d) => {
    const dd = new Date(String(d.deliveryDate));
    return dd >= selectedDeliveryCY.start && dd <= selectedDeliveryCY.end;
  }) : deliveries;
  const filteredUsages = usages.filter((u) => {
    if (selectedUsageCY) {
      const ud = new Date(String(u.usageDate));
      if (ud < selectedUsageCY.start || ud > selectedUsageCY.end) return false;
    }
    if (usageFilterVehicle !== "__all__" && String(u.vehicleName ?? "") !== usageFilterVehicle) return false;
    if (usageFilterMember !== "__all__" && String(u.recordedBy ?? "") !== usageFilterMember) return false;
    if (usageFilterTank !== "__all__" && String(u.tankId ?? "") !== usageFilterTank) return false;
    if (usageFilterActivity !== "__all__" && String(u.qualifyingActivity ?? "") !== usageFilterActivity) return false;
    return true;
  });
  const uniqueVehicles = [...new Set(usages.map((u) => String(u.vehicleName ?? "")).filter(Boolean))].sort();
  const uniqueMembers = [...new Set(usages.map((u) => String(u.recordedBy ?? "")).filter(Boolean))].sort();
  const uniqueSupplierNames = [...new Set(deliveries.map((d) => String(d.supplierName ?? "")).filter(Boolean))].sort();
  const usageFiltersActive = usageFilterVehicle !== "__all__" || usageFilterMember !== "__all__" || usageFilterTank !== "__all__" || usageFilterActivity !== "__all__";
  const deliveredByCYByFuelType = {};
  for (const d of filteredDeliveries) {
    const ft = String(d.fuelType ?? "other");
    deliveredByCYByFuelType[ft] = (deliveredByCYByFuelType[ft] ?? 0) + parseFloat(String(d.quantityLitres ?? 0));
  }
  const totalDeliveredYTD = filteredDeliveries.reduce((s, d) => s + parseFloat(String(d.quantityLitres ?? 0)), 0);
  const elecMeters = meters.filter((m) => m.meterType === "electricity");
  const gasMeters = meters.filter((m) => m.meterType === "natural_gas" || m.meterType === "lpg_mains");
  const currentYearReadings = readings.filter((r) => new Date(String(r.readingDate)).getFullYear() === (/* @__PURE__ */ new Date()).getFullYear());
  const totalElecKwh = currentYearReadings.filter((r) => {
    const m = meters.find((m2) => m2.id === r.meterId);
    return m?.meterType === "electricity";
  }).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
  const totalGasKwh = currentYearReadings.filter((r) => {
    const m = meters.find((m2) => m2.id === r.meterId);
    return m?.meterType === "natural_gas" || m?.meterType === "lpg_mains";
  }).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
  currentYearReadings.reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);
  const [selectedMeterId, setSelectedMeterId] = reactExports.useState("all");
  const filteredReadings = selectedMeterId === "all" ? readings : readings.filter((r) => String(r.meterId) === selectedMeterId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Fuel & Energy", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Red diesel, LPG, heating oil, electricity and gas — complete on-farm energy register for HMRC compliance, Red Tractor and carbon reporting" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4 col-span-2 md:col-span-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "w-4 h-4 text-green-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Total tank stock" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: fmtL(totalStockL) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mb-2", children: [
            tanks.length,
            " tank",
            tanks.length !== 1 ? "s" : "",
            " registered"
          ] }),
          Object.entries(stockByFuelType).filter(([, v]) => v > 0).map(([ft, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-600 border-t border-gray-50 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: FUEL_TYPE_LABELS[ft] ?? ft }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtL(v) })
          ] }, ft))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4 col-span-2 md:col-span-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-4 h-4 text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Delivered — crop year" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: fmtL(totalDeliveredYTD) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mb-2", children: [
            filteredDeliveries.length,
            " deliveries · ",
            currentCY.label
          ] }),
          Object.entries(deliveredByCYByFuelType).filter(([, v]) => v > 0).map(([ft, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-600 border-t border-gray-50 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: FUEL_TYPE_LABELS[ft] ?? ft }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtL(v) })
          ] }, ft))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 text-yellow-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Electricity YTD" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: fmtKwh(totalElecKwh || null) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            elecMeters.length,
            " meter",
            elecMeters.length !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-4 h-4 text-orange-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Gas / LPG energy YTD" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: fmtKwh(totalGasKwh || null) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            gasMeters.length,
            " meter",
            gasMeters.length !== 1 ? "s" : ""
          ] })
        ] })
      ] }),
      (unbundedTanks.length > 0 || overdueTanks.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-amber-800", children: [
          unbundedTanks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              unbundedTanks.length,
              " tank",
              unbundedTanks.length > 1 ? "s are" : " is",
              " not bunded"
            ] }),
            " (Oil Storage Regs 2001 apply to tanks ≥201L). "
          ] }),
          overdueTanks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            overdueTanks.length,
            " tank",
            overdueTanks.length > 1 ? "s have" : " has",
            " an overdue inspection."
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "tanks", onClick: () => setTab("tanks"), children: [
          "Tank Register (",
          tanks.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "deliveries", onClick: () => setTab("deliveries"), children: [
          "Deliveries (",
          deliveries.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "usage", onClick: () => setTab("usage"), children: [
          "Usage Log (",
          usages.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "inspections", onClick: () => setTab("inspections"), children: [
          "Inspections (",
          inspections.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "grid-energy", onClick: () => setTab("grid-energy"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3.5 h-3.5" }),
          "Grid Energy (",
          meters.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "solar", onClick: () => setTab("solar"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-3.5 h-3.5" }),
          "Solar & Renewables"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "reports", onClick: () => setTab("reports"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
          "Reports"
        ] }) })
      ] }),
      tab === "tanks" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Fuel & LPG Tanks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Register all on-farm storage tanks — diesel, heating oil and LPG. Regulations differ by fuel type." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openTankAdd, className: "bg-green-800 hover:bg-green-900 text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Add Tank"
          ] })
        ] }),
        tanks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No tanks registered" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: tanks.map((tank) => {
          const tankId = Number(tank.id);
          const isLpg = String(tank.fuelType).startsWith("lpg");
          const isOverdue = tank.nextInspectionDue && new Date(String(tank.nextInspectionDue)) < /* @__PURE__ */ new Date();
          const regs = FUEL_TYPE_REGS[String(tank.fuelType)];
          const isExpanded = expandedTankId === tankId;
          const tankDeliveries = deliveries.filter((d) => Number(d.tankId) === tankId).sort((a, b) => new Date(String(b.deliveryDate)).getTime() - new Date(String(a.deliveryDate)).getTime());
          const tankChecks = stockChecks.filter((c) => Number(c.tankId) === tankId).sort((a, b) => new Date(String(b.checkDate)).getTime() - new Date(String(a.checkDate)).getTime());
          const latestCheck = tankChecks[0];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: String(tank.name) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: FUEL_TYPE_LABELS[String(tank.fuelType)] ?? String(tank.fuelType) }),
                  regs && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mt-0.5", children: regs })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 items-center flex-wrap justify-end", children: [
                  isLpg ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#eff6ff", color: "#1d4ed8", border: "none" }, children: "LPG / DSEAR" }) : tank.isBunded ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#d1fae5", color: "#065f46", border: "none" }, children: "Bunded" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "Not bunded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openTankEdit(tank), className: "h-7 px-2 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delTankMut.mutate(tankId), className: "h-7 px-2 text-xs text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) }),
                  !!isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setRaiseTaskFor(tank), className: "h-7 px-2 text-xs text-purple-600", title: "Raise inspection task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }) })
                ] })
              ] }),
              String(tank.fuelType) !== "lpg_bottles" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-500 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    fmtL(tank.currentStockLitres),
                    " remaining (calculated)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "of ",
                    fmtL(tank.capacityLitres)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TankGauge, { current: tank.currentStockLitres, capacity: tank.capacityLitres })
              ] }),
              latestCheck && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5 mb-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3 text-blue-500 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-700", children: [
                  "Last stock check: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtL(latestCheck.measuredLitres) }),
                  " on ",
                  fmtDate(String(latestCheck.checkDate))
                ] }),
                latestCheck.varianceLitres !== null && latestCheck.varianceLitres !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: parseFloat(String(latestCheck.varianceLitres)) < -50 ? "text-red-600 font-semibold ml-auto" : "text-gray-500 ml-auto", children: [
                  parseFloat(String(latestCheck.varianceLitres)) >= 0 ? "+" : "",
                  parseFloat(String(latestCheck.varianceLitres)).toFixed(0),
                  " L variance"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1.5 text-xs text-gray-600 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Location:" }),
                  " ",
                  String(tank.location ?? "—")
                ] }),
                !!tank.tankMaterial && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Material:" }),
                  " ",
                  String(tank.tankMaterial)
                ] }),
                !!tank.nextInspectionDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: isOverdue ? "text-red-600 font-medium" : "", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Inspect by:" }),
                  " ",
                  fmtDate(String(tank.nextInspectionDue)),
                  !!isOverdue && " ⚠"
                ] }),
                !!tank.isBunded && !!tank.bundCapacityLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Bund:" }),
                  " ",
                  fmtL(tank.bundCapacityLitres)
                ] })
              ] }),
              !!tank.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3 italic", children: String(tank.notes) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2 border-t border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-7 text-xs flex-1",
                    onClick: () => {
                      setStockCheckTankId(String(tank.id));
                      setStockCheckForm({ checkDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10), method: "dip_stick" });
                      setShowStockCheckDialog(true);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3 mr-1" }),
                      "Log Stock Check"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 text-xs flex-1 text-blue-600",
                    onClick: () => setExpandedTankId(isExpanded ? null : tankId),
                    children: [
                      isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3 h-3 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3 mr-1" }),
                      tankDeliveries.length,
                      " deliveries · ",
                      tankChecks.length,
                      " checks"
                    ]
                  }
                )
              ] })
            ] }),
            isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 bg-gray-50 px-5 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mb-2", children: "Delivery History" }),
              tankDeliveries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "No deliveries recorded for this tank." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: tankDeliveries.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: fmtDate(String(d.deliveryDate)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: String(d.supplierName ?? "—") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-700", children: fmtL(d.quantityLitres) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: fmtCost(d.totalCostPence) })
              ] }, String(d.id))) }),
              tankChecks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mt-3 mb-2", children: "Stock Check History" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: tankChecks.map((c) => {
                  const variance = c.varianceLitres !== null && c.varianceLitres !== void 0 ? parseFloat(String(c.varianceLitres)) : null;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-gray-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: fmtDate(String(c.checkDate)) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 capitalize", children: String(c.method ?? "dip stick").replace(/_/g, " ") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-blue-700", children: [
                      fmtL(c.measuredLitres),
                      " measured"
                    ] }),
                    variance !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: variance < -50 ? "font-semibold text-red-600" : "text-gray-500", children: [
                      variance >= 0 ? "+" : "",
                      variance.toFixed(0),
                      " L"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delStockCheckMut.mutate(Number(c.id)), className: "h-5 px-1 text-red-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
                  ] }, String(c.id));
                }) })
              ] })
            ] })
          ] }, String(tank.id));
        }) })
      ] }),
      tab === "deliveries" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Fuel Deliveries" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Retain all delivery notes and invoices — HMRC may request these during a fuel duty inspection" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-500 whitespace-nowrap", children: "Crop year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryCropYear, onValueChange: setDeliveryCropYear, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CROP_YEAR_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.label, children: o.label }, o.label)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
              setEditDelivery(null);
              setDeliveryForm({ fuelType: "red_diesel", qualifyingUse: "agriculture", deliveryDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) });
              setShowDeliveryDialog(true);
            }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              "Log Delivery"
            ] })
          ] })
        ] }),
        filteredDeliveries.length > 0 && (() => {
          const totalCostPence = filteredDeliveries.reduce((s, d) => s + (d.netAmountPence ? Number(d.netAmountPence) : 0), 0);
          const hasCost = filteredDeliveries.some((d) => d.netAmountPence);
          const byFuel = {};
          filteredDeliveries.forEach((d) => {
            const ft = String(d.fuelType ?? "other");
            byFuel[ft] = (byFuel[ft] ?? 0) + parseFloat(String(d.quantityLitres ?? 0));
          });
          const fuelRows = Object.entries(byFuel).sort((a, b) => b[1] - a[1]);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef9c3", border: "1px solid #fef08a", borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Delivered" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
                totalDeliveredYTD.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "L" })
              ] })
            ] }),
            hasCost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: [
                "£",
                (totalCostPence / 100).toFixed(2)
              ] })
            ] }),
            fuelRows.length > 1 && fuelRows.map(([ft, litres]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: ft }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
                litres.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "L" })
              ] })
            ] }, ft))
          ] });
        })(),
        filteredDeliveries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            "No deliveries in ",
            deliveryCropYear
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Change the crop year selector above or log a new delivery" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Tank / Fuel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Supplier / Note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Litres" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Use" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredDeliveries.map((d) => {
            const tank = tanks.find((t) => t.id === d.tankId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-gray-50 cursor-pointer", onClick: () => setViewDelivery(d), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-700", children: fmtDate(String(d.deliveryDate ?? "")) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: tank ? String(tank.name) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: FUEL_TYPE_LABELS[String(d.fuelType)] ?? String(d.fuelType) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-800", children: String(d.supplierName ?? "—") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
                  String(d.deliveryNoteNumber ?? ""),
                  " ",
                  d.invoiceReference ? `/ ${d.invoiceReference}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-medium text-green-700", children: fmtL(d.quantityLitres) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right text-gray-600", children: [
                fmtCost(d.totalCostPence),
                !!d.unitPricePence && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
                  Number(d.unitPricePence),
                  "p/L"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-500 capitalize", children: String(d.qualifyingUse ?? "agriculture").replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewDelivery(d), className: "h-7 px-2 text-blue-600", title: "View details", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                  setEditDelivery(d);
                  const deliveryDateStr = d.deliveryDate ? new Date(String(d.deliveryDate)).toISOString().substring(0, 10) : "";
                  setDeliveryForm({
                    deliveryDate: deliveryDateStr,
                    tankId: String(d.tankId ?? ""),
                    fuelType: String(d.fuelType ?? "red_diesel"),
                    quantityLitres: String(d.quantityLitres ?? ""),
                    supplierName: String(d.supplierName ?? ""),
                    deliveryNoteNumber: String(d.deliveryNoteNumber ?? ""),
                    invoiceReference: String(d.invoiceReference ?? ""),
                    unitPricePence: String(d.unitPricePence ?? ""),
                    qualifyingUse: String(d.qualifyingUse ?? "agriculture"),
                    driverName: String(d.driverName ?? ""),
                    documentUrl: String(d.documentUrl ?? ""),
                    notes: String(d.notes ?? "")
                  });
                  setShowDeliveryDialog(true);
                }, className: "h-7 px-2 text-gray-600", title: "Edit delivery", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delDeliveryMut.mutate(Number(d.id)), className: "h-7 px-2 text-red-600", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
              ] }) })
            ] }, String(d.id));
          }) })
        ] }) })
      ] }),
      tab === "usage" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Fuel Usage Log" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Record every draw-down from tanks — demonstrates qualifying use for HMRC rebated fuel" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-500 whitespace-nowrap", children: "Crop year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageCropYear, onValueChange: setUsageCropYear, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CROP_YEAR_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.label, children: o.label }, o.label)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
              setUsageForm({ qualifyingActivity: "agriculture", usageDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) });
              setShowUsageDialog(true);
            }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              "Record Usage"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "w-3.5 h-3.5 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: "Filter:" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Vehicle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageFilterVehicle, onValueChange: setUsageFilterVehicle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All vehicles" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All vehicles" }),
                uniqueVehicles.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Staff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageFilterMember, onValueChange: setUsageFilterMember, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All staff" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All staff" }),
                uniqueMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageFilterTank, onValueChange: setUsageFilterTank, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All tanks" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All tanks" }),
                tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: String(t.name) }, String(t.id)))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Activity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageFilterActivity, onValueChange: setUsageFilterActivity, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All activities" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All activities" }),
                QUALIFYING_ACTIVITIES.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: a.replace(/_/g, " ") }, a))
              ] })
            ] })
          ] }),
          usageFiltersActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-xs text-gray-500", onClick: () => {
            setUsageFilterVehicle("__all__");
            setUsageFilterMember("__all__");
            setUsageFilterTank("__all__");
            setUsageFilterActivity("__all__");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3 mr-1" }),
            "Clear"
          ] }),
          usageFiltersActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 ml-auto self-center", children: [
            filteredUsages.length,
            " of ",
            usages.filter((u) => {
              if (selectedUsageCY) {
                const ud = new Date(String(u.usageDate));
                return ud >= selectedUsageCY.start && ud <= selectedUsageCY.end;
              }
              return true;
            }).length,
            " records"
          ] })
        ] }),
        filteredUsages.length > 0 && (() => {
          const totalUsedL = filteredUsages.reduce((s, u) => s + parseFloat(String(u.quantityLitres ?? 0)), 0);
          const byActivity = {};
          filteredUsages.forEach((u) => {
            const act = String(u.qualifyingActivity ?? "Other");
            byActivity[act] = (byActivity[act] ?? 0) + parseFloat(String(u.quantityLitres ?? 0));
          });
          const actRows = Object.entries(byActivity).sort((a, b) => b[1] - a[1]);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef9c3", border: "1px solid #fef08a", borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Usage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
                totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "L" })
              ] })
            ] }),
            actRows.length > 1 && actRows.map(([act, litres]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: act }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
                litres.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "L" })
              ] })
            ] }, act))
          ] });
        })(),
        filteredUsages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No usage records match filters" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Try adjusting the filters or crop year above" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Vehicle / Machine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Purpose / Activity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Litres" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Recorded by" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredUsages.map((u) => {
            const tank = tanks.find((t) => t.id === u.tankId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-700", children: fmtDate(String(u.usageDate ?? "")) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600 text-xs", children: tank ? String(tank.name) : u.tankName ? String(u.tankName) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600 text-xs", children: u.vehicleName ? String(u.vehicleName) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-800", children: String(u.purpose ?? "—") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 capitalize", children: String(u.qualifyingActivity ?? "").replace(/_/g, " ") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-medium text-red-600", children: fmtL(u.quantityLitres) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-500", children: String(u.recordedBy ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delUsageMut.mutate(Number(u.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) }) })
            ] }, String(u.id));
          }) })
        ] }) })
      ] }),
      tab === "inspections" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Storage Inspections" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Annual oil storage inspection checklist + LPG periodic inspection records (UKLPG CoP)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
            setInspForm({ overallResult: "pass", inspectionDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) });
            setShowInspDialog(true);
          }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Record Inspection"
          ] })
        ] }),
        inspections.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No inspections recorded" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: inspections.map((ins) => {
          const tank = tanks.find((t) => t.id === ins.tankId);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: (el) => {
            if (el) inspRowRefs.current.set(Number(ins.id), el);
          }, className: `rounded-xl border p-5 transition-colors${hlInspId === Number(ins.id) ? " bg-amber-50 border-amber-400 ring-2 ring-amber-400" : " bg-white border-gray-200"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: fmtDate(String(ins.inspectionDate ?? "")) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                  tank ? String(tank.name) : "All tanks",
                  " — ",
                  String(ins.inspector ?? "—")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { result: String(ins.overallResult ?? "pass") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delInspMut.mutate(Number(ins.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Bunding / secondary containment", value: ins.bundingOk }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Tank labelling correct", value: ins.labellingOk }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Spill kit present", value: ins.spillKitPresent }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Spill kit complete", value: ins.spillKitComplete }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Tank condition OK", value: ins.tankConditionOk }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Pipework OK", value: ins.pipeworkOk }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Fill point locked", value: ins.fillPointLocked }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Overfill protection", value: ins.overfillProtectionOk }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRow, { label: "Drainage risk managed", value: ins.drainageRiskOk })
            ] }),
            !!ins.issuesFound && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 rounded p-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-red-800", children: "Issues:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-700", children: String(ins.issuesFound) })
            ] }),
            !!ins.actionsRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 rounded p-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-800", children: "Actions:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: String(ins.actionsRequired) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-2", children: [
              "Next due: ",
              fmtDate(String(ins.nextInspectionDue ?? ""))
            ] })
          ] }, String(ins.id));
        }) })
      ] }),
      tab === "grid-energy" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Grid Energy — Meters & Readings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Track electricity, natural gas and mains LPG consumption for carbon reporting, ESOS compliance and cost management" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
              setReadingForm({ readingType: "actual", readingDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) });
              setShowReadingDialog(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              "Add Reading"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
              setEditMeter(null);
              setMeterForm({ meterType: "electricity" });
              setShowMeterDialog(true);
            }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              "Add Meter"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 text-blue-600 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Why track grid energy?" }),
            " Electricity and gas consumption data is required for Scope 1 & 2 carbon footprint calculations, ESOS energy audits, and increasingly for Red Tractor sustainability assessments. MPAN (electricity) and MPRN (gas) numbers appear on your utility bills."
          ] })
        ] }),
        meters.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plug, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No energy meters registered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Add your electricity and gas meters to start logging readings" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-3 mb-6", children: meters.map((m) => {
            const meterReadings = readings.filter((r) => r.meterId === m.id);
            const latestReading = meterReadings[0];
            const ytdKwh = currentYearReadings.filter((r) => r.meterId === m.id).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
            const ytdCost = currentYearReadings.filter((r) => r.meterId === m.id).reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);
            const mLabel = METER_TYPES.find((t) => t.value === m.meterType);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MeterTypeIcon, { type: String(m.meterType) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900 text-sm", children: String(m.name) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: mLabel?.label ?? String(m.meterType) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                    setEditMeter(m);
                    setMeterForm({ name: String(m.name ?? ""), meterType: String(m.meterType ?? "electricity"), meterReference: String(m.meterReference ?? ""), mpan: String(m.mpan ?? ""), mprn: String(m.mprn ?? ""), supplier: String(m.supplier ?? ""), accountNumber: String(m.accountNumber ?? ""), location: String(m.location ?? ""), tariffName: String(m.tariffName ?? ""), unitRatePencePerKwh: String(m.unitRatePencePerKwh ?? ""), standingChargePencePerDay: String(m.standingChargePencePerDay ?? ""), notes: String(m.notes ?? "") });
                    setShowMeterDialog(true);
                  }, className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delMeterMut.mutate(Number(m.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
                ] })
              ] }),
              !!m.location && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-2", children: String(m.location) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs mb-2", children: [
                !!m.mpan && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "MPAN:" }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: String(m.mpan) })
                ] }),
                !!m.mprn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "MPRN:" }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: String(m.mprn) })
                ] }),
                !!m.supplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Supplier:" }),
                  " ",
                  String(m.supplier)
                ] }),
                !!m.tariffName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Tariff:" }),
                  " ",
                  String(m.tariffName)
                ] }),
                !!m.unitRatePencePerKwh && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Rate:" }),
                  " ",
                  String(m.unitRatePencePerKwh),
                  "p/kWh"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-2 mt-2 grid grid-cols-2 gap-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "YTD consumption" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-gray-800", children: fmtKwh(ytdKwh || null) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "YTD cost" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-gray-800", children: ytdCost ? fmtCost(ytdCost) : "—" })
                ] }),
                latestReading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "Last reading" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-700", children: [
                    parseFloat(String(latestReading.meterReading)).toLocaleString(),
                    " — ",
                    fmtDate(String(latestReading.readingDate))
                  ] })
                ] })
              ] })
            ] }, String(m.id));
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-800 text-sm", children: "Meter Readings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedMeterId, onValueChange: setSelectedMeterId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All meters" }),
                meters.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.id), children: String(m.name) }, String(m.id)))
              ] })
            ] })
          ] }),
          filteredReadings.length > 0 && (() => {
            const totalConsumption = filteredReadings.reduce((s, r) => s + (r.consumptionKwh ? parseFloat(String(r.consumptionKwh)) : 0), 0);
            const totalExport = filteredReadings.reduce((s, r) => s + (r.exportKwh ? parseFloat(String(r.exportKwh)) : 0), 0);
            const totalCostP = filteredReadings.reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);
            const hasConsumption = filteredReadings.some((r) => r.consumptionKwh);
            const hasExport = filteredReadings.some((r) => r.exportKwh);
            const hasCostR = filteredReadings.some((r) => r.costPence);
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap mb-3", children: [
              { label: "Readings", value: String(filteredReadings.length), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
              ...hasConsumption ? [{ label: "Total Consumption", value: fmtKwh(String(totalConsumption)), color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }] : [],
              ...hasExport && totalExport > 0 ? [{ label: "Total Export", value: fmtKwh(String(totalExport)), color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" }] : [],
              ...hasCostR ? [{ label: "Total Cost", value: fmtCost(totalCostP), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" }] : []
            ].map(({ label, value, color, bg, border }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 14px", minWidth: 110 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", margin: "0 0 2px" }, children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.15rem", fontWeight: 800, color, margin: 0, lineHeight: 1.1 }, children: value })
            ] }, label)) });
          })(),
          filteredReadings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "No readings recorded yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Meter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Reading" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Consumption" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Export" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Invoice" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredReadings.map((r) => {
              const meter = meters.find((m) => m.id === r.meterId);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-700", children: fmtDate(String(r.readingDate ?? "")) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  meter && /* @__PURE__ */ jsxRuntimeExports.jsx(MeterTypeIcon, { type: String(meter.meterType) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: meter ? String(meter.name) : "—" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono text-gray-700", children: parseFloat(String(r.meterReading)).toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-medium text-green-700", children: r.consumptionKwh ? fmtKwh(r.consumptionKwh) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-blue-600", children: r.exportKwh ? fmtKwh(r.exportKwh) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-gray-600", children: fmtCost(r.costPence) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-500 capitalize", children: String(r.readingType ?? "actual") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-400", children: String(r.invoiceReference ?? "—") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  !!r.documentUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${String(r.documentUrl)}`, target: "_blank", rel: "noopener noreferrer", title: "View meter photo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-blue-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-3 h-3" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delReadingMut.mutate(Number(r.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
                ] }) })
              ] }, String(r.id));
            }) })
          ] }) })
        ] })
      ] })
    ] }),
    tab === "solar" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Solar & Renewable Energy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Track installations, monthly generation, and Smart Export Guarantee (SEG) income" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SolarRenewablesTab, { farmId })
    ] }),
    tab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReportsTab,
      {
        tanks,
        deliveries,
        usages,
        inspections,
        stockChecks,
        readings,
        meters
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewDelivery, onOpenChange: (v) => {
      if (!v) setViewDelivery(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delivery Details" }) }),
      viewDelivery && (() => {
        const vTank = tanks.find((t) => t.id === viewDelivery.tankId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(String(viewDelivery.deliveryDate ?? "")) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Tank" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: vTank ? String(vTank.name) : "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Fuel type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: FUEL_TYPE_LABELS[String(viewDelivery.fuelType)] ?? String(viewDelivery.fuelType) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Quantity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-green-700", children: fmtL(viewDelivery.quantityLitres) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Unit price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewDelivery.unitPricePence ? `${Number(viewDelivery.unitPricePence)}p/L` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Total cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtCost(viewDelivery.totalCostPence) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewDelivery.supplierName ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Driver" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewDelivery.driverName ?? "—") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Delivery note no." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewDelivery.deliveryNoteNumber ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Invoice ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewDelivery.invoiceReference ?? "—") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Qualifying use" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewDelivery.qualifyingUse ?? "agriculture").replace(/_/g, " ") })
          ] }),
          !!viewDelivery.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewDelivery.notes) })
          ] }),
          viewDelivery.documentUrl != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Attached document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/api/storage${String(viewDelivery.documentUrl)}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-blue-700 font-medium text-sm hover:underline", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4 flex-shrink-0" }),
              "View delivery note / document",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3 ml-auto" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4 text-gray-300 mx-auto mb-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "No document attached — edit this delivery to upload a scan" })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewDelivery(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!viewDelivery) return;
          setEditDelivery(viewDelivery);
          const deliveryDateStr = viewDelivery.deliveryDate ? new Date(String(viewDelivery.deliveryDate)).toISOString().substring(0, 10) : "";
          setDeliveryForm({
            deliveryDate: deliveryDateStr,
            tankId: String(viewDelivery.tankId ?? ""),
            fuelType: String(viewDelivery.fuelType ?? "red_diesel"),
            quantityLitres: String(viewDelivery.quantityLitres ?? ""),
            supplierName: String(viewDelivery.supplierName ?? ""),
            deliveryNoteNumber: String(viewDelivery.deliveryNoteNumber ?? ""),
            invoiceReference: String(viewDelivery.invoiceReference ?? ""),
            unitPricePence: String(viewDelivery.unitPricePence ?? ""),
            qualifyingUse: String(viewDelivery.qualifyingUse ?? "agriculture"),
            driverName: String(viewDelivery.driverName ?? ""),
            documentUrl: String(viewDelivery.documentUrl ?? ""),
            notes: String(viewDelivery.notes ?? "")
          });
          setViewDelivery(null);
          setShowDeliveryDialog(true);
        }, children: "Edit Delivery" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showTankDialog, onOpenChange: setShowTankDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editTank ? "Edit Tank" : "Add Fuel / LPG Tank" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tankForm.name ?? "", onChange: (e) => setTankForm((f) => ({ ...f, name: e.target.value })), placeholder: "e.g. Main Yard Tank" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fuel type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tankForm.fuelType ?? "red_diesel", onValueChange: (v) => setTankForm((f) => ({ ...f, fuelType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FUEL_TYPES.map((ft) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ft, children: FUEL_TYPE_LABELS[ft] ?? ft }, ft)) })
            ] })
          ] })
        ] }),
        tankForm.fuelType === "lpg_bottles" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800", children: "LPG cylinders/bottles: note the number of cylinders and total kg capacity. DSEAR 2002 requires cylinders to be stored upright in a ventilated cage, away from ignition sources and drains." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity (litres) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: tankForm.capacityLitres ?? "", onChange: (e) => setTankForm((f) => ({ ...f, capacityLitres: e.target.value })), placeholder: "10000" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current stock (litres)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: tankForm.currentStockLitres ?? "", onChange: (e) => setTankForm((f) => ({ ...f, currentStockLitres: e.target.value })), placeholder: "0" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tankForm.location ?? "", onChange: (e) => setTankForm((f) => ({ ...f, location: e.target.value })), placeholder: "e.g. Main yard" })
        ] }),
        !String(tankForm.fuelType ?? "").startsWith("lpg") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank material" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tankForm.tankMaterial ?? "", onChange: (e) => setTankForm((f) => ({ ...f, tankMaterial: e.target.value })), placeholder: "Steel / Plastic" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Is bunded?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tankForm.isBunded ?? "false", onValueChange: (v) => setTankForm((f) => ({ ...f, isBunded: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes — bunded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" })
              ] })
            ] })
          ] })
        ] }),
        tankForm.isBunded === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bund capacity (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: tankForm.bundCapacityLitres ?? "", onChange: (e) => setTankForm((f) => ({ ...f, bundCapacityLitres: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Install date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: tankForm.installDate ?? "", onChange: (e) => setTankForm((f) => ({ ...f, installDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next inspection due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: tankForm.nextInspectionDue ?? "", onChange: (e) => setTankForm((f) => ({ ...f, nextInspectionDue: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: tankForm.notes ?? "", onChange: (e) => setTankForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowTankDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!tankForm.name) {
            toast({ title: "Tank name is required", variant: "destructive" });
            return;
          }
          tankMut.mutate({ ...tankForm, isBunded: tankForm.isBunded === "true" });
        }, children: editTank ? "Save Changes" : "Add Tank" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDeliveryDialog, onOpenChange: (v) => {
      setShowDeliveryDialog(v);
      if (!v) setEditDelivery(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editDelivery ? "Edit Fuel Delivery" : "Log Fuel Delivery" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deliveryForm.deliveryDate ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, deliveryDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryForm.tankId ?? "", onValueChange: (v) => setDeliveryForm((f) => ({ ...f, tankId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tank" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: String(t.name) }, String(t.id))) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fuel type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryForm.fuelType ?? "red_diesel", onValueChange: (v) => setDeliveryForm((f) => ({ ...f, fuelType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FUEL_TYPES.map((ft) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ft, children: FUEL_TYPE_LABELS[ft] ?? ft }, ft)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (litres) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: deliveryForm.quantityLitres ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, quantityLitres: e.target.value })), placeholder: "5000" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              list: "supplier-suggestions",
              value: deliveryForm.supplierName ?? "",
              onChange: (e) => setDeliveryForm((f) => ({ ...f, supplierName: e.target.value })),
              placeholder: uniqueSupplierNames.length ? "Type or choose from previous…" : "e.g. Certas Energy, Crown Oil"
            }
          ),
          uniqueSupplierNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "supplier-suggestions", children: uniqueSupplierNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery note no." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.deliveryNoteNumber ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, deliveryNoteNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.invoiceReference ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, invoiceReference: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit price (p/litre)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: deliveryForm.unitPricePence ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, unitPricePence: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qualifying use" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryForm.qualifyingUse ?? "agriculture", onValueChange: (v) => setDeliveryForm((f) => ({ ...f, qualifyingUse: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: QUALIFYING_ACTIVITIES.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: a.replace(/_/g, " ") }, a)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Driver" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.driverName ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, driverName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery note / document" }),
          deliveryForm.documentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 p-2 bg-green-50 border border-green-200 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4 text-green-700 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${deliveryForm.documentUrl}`, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-green-700 underline truncate flex-1", children: "View attached document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 px-1 text-gray-400", onClick: () => setDeliveryForm((f) => ({ ...f, documentUrl: "" })), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: isDocUploading ? "Uploading…" : "Attach delivery note or invoice scan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", accept: "image/*,application/pdf", disabled: isDocUploading, onChange: async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const result = await uploadFile(file);
              if (result) setDeliveryForm((f) => ({ ...f, documentUrl: result.objectPath }));
            } })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: deliveryForm.notes ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowDeliveryDialog(false);
          setEditDelivery(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!deliveryForm.deliveryDate || !deliveryForm.quantityLitres) {
            toast({ title: "Date and quantity required", variant: "destructive" });
            return;
          }
          const totalCostPence = deliveryForm.unitPricePence && deliveryForm.quantityLitres ? Math.round(parseFloat(deliveryForm.unitPricePence) * parseFloat(deliveryForm.quantityLitres)) : void 0;
          if (editDelivery) {
            editDeliveryMut.mutate({ ...deliveryForm, totalCostPence });
          } else {
            deliveryMut.mutate({ ...deliveryForm, totalCostPence });
          }
        }, children: editDelivery ? "Save Changes" : "Log Delivery" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showUsageDialog, onOpenChange: setShowUsageDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Fuel Usage" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: usageForm.usageDate ?? "", onChange: (e) => setUsageForm((f) => ({ ...f, usageDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageForm.tankId ?? "", onValueChange: (v) => setUsageForm((f) => ({ ...f, tankId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tank" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: String(t.name) }, String(t.id))) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle / Machine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageForm.vehicleName ?? "", onValueChange: (v) => setUsageForm((f) => ({ ...f, vehicleName: v, vehicleNameCustom: "" })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: motorEquipment.length ? "Select vehicle / machine" : "No equipment registered" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              motorEquipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(e.name), children: String(e.name) }, String(e.id))),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "Other — type manually…" })
            ] })
          ] }),
          usageForm.vehicleName === "__custom__" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: usageForm.vehicleNameCustom ?? "", onChange: (e) => setUsageForm((f) => ({ ...f, vehicleNameCustom: e.target.value })), placeholder: "e.g. Case IH Puma 165, Grain Drier" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purpose / Activity *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: usageForm.purpose ?? "", onChange: (e) => setUsageForm((f) => ({ ...f, purpose: e.target.value })), placeholder: "e.g. Ploughing — Home Field" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (litres) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: usageForm.quantityLitres ?? "", onChange: (e) => setUsageForm((f) => ({ ...f, quantityLitres: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qualifying activity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageForm.qualifyingActivity ?? "agriculture", onValueChange: (v) => setUsageForm((f) => ({ ...f, qualifyingActivity: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: QUALIFYING_ACTIVITIES.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: a.replace(/_/g, " ") }, a)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorded by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageForm.recordedBy ?? "", onValueChange: (v) => setUsageForm((f) => ({ ...f, recordedBy: v, recordedByCustom: "" })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: members.length ? "Select staff member" : "Type name below" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              members.map((m) => {
                const name = `${String(m.firstName ?? "")} ${String(m.lastName ?? "")}`.trim();
                return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, String(m.id));
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "Other — type manually…" })
            ] })
          ] }),
          (usageForm.recordedBy === "__custom__" || !members.length && usageForm.recordedBy !== void 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: usageForm.recordedByCustom ?? "", onChange: (e) => setUsageForm((f) => ({ ...f, recordedByCustom: e.target.value })), placeholder: "Staff member name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Fuel cost (p/litre) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 font-normal", children: "— auto from tank deliveries" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "1",
                min: "0",
                placeholder: "e.g. 110 (= £1.10/L)",
                value: usageForm.costPencePerLitre ?? "",
                onChange: (e) => setUsageForm((f) => ({ ...f, costPencePerLitre: e.target.value }))
              }
            ),
            usageForm.costPencePerLitre && usageForm.quantityLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-gray-500 mt-0.5", children: [
              "≈ ",
              (parseInt(usageForm.costPencePerLitre) * parseFloat(usageForm.quantityLitres) / 100).toFixed(2),
              " £ total"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Field name or ID", value: usageForm.fieldId ?? "", onChange: (e) => setUsageForm((f) => ({ ...f, fieldId: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: usageForm.notes ?? "", onChange: (e) => setUsageForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowUsageDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!usageForm.usageDate || !usageForm.quantityLitres || !usageForm.purpose) {
            toast({ title: "Date, quantity and purpose required", variant: "destructive" });
            return;
          }
          const resolvedVehicle = usageForm.vehicleName === "__custom__" ? usageForm.vehicleNameCustom || void 0 : usageForm.vehicleName || void 0;
          const resolvedRecordedBy = usageForm.recordedBy === "__custom__" ? usageForm.recordedByCustom || void 0 : usageForm.recordedBy || void 0;
          const { vehicleNameCustom: _vnc, recordedByCustom: _rbc, ...rest } = usageForm;
          usageMut.mutate({
            ...rest,
            vehicleName: resolvedVehicle,
            recordedBy: resolvedRecordedBy,
            costPencePerLitre: usageForm.costPencePerLitre ? parseInt(usageForm.costPencePerLitre) : void 0,
            fieldId: usageForm.fieldId ? parseInt(usageForm.fieldId) : void 0
          });
        }, children: "Record Usage" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showInspDialog, onOpenChange: setShowInspDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Storage Inspection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: inspForm.inspectionDate ?? "", onChange: (e) => setInspForm((f) => ({ ...f, inspectionDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm.tankId ?? "", onValueChange: (v) => setInspForm((f) => ({ ...f, tankId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tank" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: String(t.name) }, String(t.id))) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm.inspector ?? "", onValueChange: (v) => setInspForm((f) => ({ ...f, inspector: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select inspector…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: fuelActiveMembers.map((m) => {
                const name = `${m.firstName} ${m.lastName}`.trim();
                return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, m.id);
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm.overallResult ?? "pass", onValueChange: (v) => setInspForm((f) => ({ ...f, overallResult: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "advisory", children: "Advisory" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mb-2", children: "Checklist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [
            { key: "bundingOk", label: "Bunding OK" },
            { key: "labellingOk", label: "Labelling OK" },
            { key: "spillKitPresent", label: "Spill kit present" },
            { key: "spillKitComplete", label: "Spill kit complete" },
            { key: "tankConditionOk", label: "Tank condition OK" },
            { key: "pipeworkOk", label: "Pipework OK" },
            { key: "fillPointLocked", label: "Fill point locked" },
            { key: "overfillProtectionOk", label: "Overfill protection" },
            { key: "drainageRiskOk", label: "Drainage risk OK" }
          ].map(({ key, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm[key] ?? "", onValueChange: (v) => setInspForm((f) => ({ ...f, [key]: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "?" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "✓" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "✗" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600", children: label })
          ] }, key)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issues found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: inspForm.issuesFound ?? "", onChange: (e) => setInspForm((f) => ({ ...f, issuesFound: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: inspForm.actionsRequired ?? "", onChange: (e) => setInspForm((f) => ({ ...f, actionsRequired: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next inspection due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: inspForm.nextInspectionDue ?? "", onChange: (e) => setInspForm((f) => ({ ...f, nextInspectionDue: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: inspForm.notes ?? "", onChange: (e) => setInspForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowInspDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!inspForm.inspectionDate) {
            toast({ title: "Date required", variant: "destructive" });
            return;
          }
          const boolFields = ["bundingOk", "labellingOk", "spillKitPresent", "spillKitComplete", "tankConditionOk", "pipeworkOk", "fillPointLocked", "overfillProtectionOk", "drainageRiskOk"];
          const data = { ...inspForm };
          boolFields.forEach((k) => {
            if (data[k] !== void 0 && data[k] !== "") data[k] = data[k] === "true";
            else delete data[k];
          });
          if (!data.tankId) delete data.tankId;
          inspMut.mutate(data);
        }, children: "Save Inspection" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showMeterDialog, onOpenChange: setShowMeterDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editMeter ? "Edit Meter" : "Add Energy Meter" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: meterForm.name ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, name: e.target.value })), placeholder: "e.g. Farmhouse Electricity" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: meterForm.meterType ?? "electricity", onValueChange: (v) => setMeterForm((f) => ({ ...f, meterType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: METER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location / Building" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: meterForm.location ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, location: e.target.value })), placeholder: "e.g. Farmhouse, Grain store, Livestock building" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded p-2 grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-800", children: "MPAN (electricity)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: meterForm.mpan ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, mpan: e.target.value })), placeholder: "13-digit number on bill", className: "font-mono text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-800", children: "MPRN (gas)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: meterForm.mprn ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, mprn: e.target.value })), placeholder: "6–10 digit number on bill", className: "font-mono text-sm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: meterForm.supplier ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, supplier: e.target.value })), placeholder: "e.g. OVO Energy" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: meterForm.accountNumber ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, accountNumber: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tariff name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: meterForm.tariffName ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, tariffName: e.target.value })), placeholder: "e.g. Agri Flex 24" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit rate (p/kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: meterForm.unitRatePencePerKwh ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, unitRatePencePerKwh: e.target.value })), placeholder: "24.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standing charge (p/day)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: meterForm.standingChargePencePerDay ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, standingChargePencePerDay: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: meterForm.notes ?? "", onChange: (e) => setMeterForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowMeterDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!meterForm.name || !meterForm.meterType) {
            toast({ title: "Name and type required", variant: "destructive" });
            return;
          }
          const data = { ...meterForm };
          if (data.unitRatePencePerKwh) data.unitRatePencePerKwh = Math.round(parseFloat(String(data.unitRatePencePerKwh)) * 100) / 100;
          meterMut.mutate(data);
        }, children: editMeter ? "Save Changes" : "Add Meter" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showReadingDialog, onOpenChange: setShowReadingDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Meter Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: readingForm.readingDate ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, readingDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: readingForm.meterId ?? "", onValueChange: (v) => setReadingForm((f) => ({ ...f, meterId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select meter" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: meters.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.id), children: String(m.name) }, String(m.id))) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter reading *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: readingForm.meterReading ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, meterReading: e.target.value })), placeholder: "Cumulative reading", className: "font-mono" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: readingForm.readingType ?? "actual", onValueChange: (v) => setReadingForm((f) => ({ ...f, readingType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "actual", children: "Actual read" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "estimated", children: "Estimated" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "final", children: "Final (change of tenancy)" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consumption (kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: readingForm.consumptionKwh ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, consumptionKwh: e.target.value })), placeholder: "kWh since last reading" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Export (kWh)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: readingForm.exportKwh ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, exportKwh: e.target.value })), placeholder: "Solar / wind export" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bill cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: readingForm.costPounds ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, costPounds: e.target.value })), placeholder: "Amount on bill" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: readingForm.invoiceReference ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, invoiceReference: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Billing period start" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: readingForm.billingPeriodStart ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, billingPeriodStart: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Billing period end" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: readingForm.billingPeriodEnd ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, billingPeriodEnd: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorded by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: readingForm.recordedBy ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, recordedBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: readingForm.notes ?? "", onChange: (e) => setReadingForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter photo" }),
          readingForm.documentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 p-2 rounded-md bg-green-50 border border-green-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-green-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${readingForm.documentUrl}`, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-green-700 underline truncate flex-1", children: "View attached photo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 px-1 text-gray-400", onClick: () => setReadingForm((f) => ({ ...f, documentUrl: "" })), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "mt-1 w-full", disabled: isDocUploading, onClick: () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*,application/pdf";
            input.onchange = async () => {
              if (!input.files?.[0]) return;
              const result = await uploadFile(input.files[0]);
              if (result) setReadingForm((f) => ({ ...f, documentUrl: result.objectPath }));
            };
            input.click();
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4 mr-1" }),
            isDocUploading ? "Uploading…" : "Attach meter photo"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowReadingDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!readingForm.readingDate || !readingForm.meterId || !readingForm.meterReading) {
            toast({ title: "Date, meter and reading required", variant: "destructive" });
            return;
          }
          const costPence = readingForm.costPounds ? Math.round(parseFloat(readingForm.costPounds) * 100) : void 0;
          const data = { ...readingForm, costPence };
          delete data.costPounds;
          if (!data.billingPeriodStart) delete data.billingPeriodStart;
          if (!data.billingPeriodEnd) delete data.billingPeriodEnd;
          if (!data.consumptionKwh) delete data.consumptionKwh;
          if (!data.exportKwh) delete data.exportKwh;
          if (!data.documentUrl) delete data.documentUrl;
          readingMut.mutate(data);
        }, children: "Save Reading" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showStockCheckDialog, onOpenChange: setShowStockCheckDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Physical Stock Check" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2", children: "Record the physically measured quantity (dip stick, sight gauge, or weighbridge). The system will calculate any variance against the running calculated total so discrepancies can be investigated." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stockCheckForm.checkDate ?? "", onChange: (e) => setStockCheckForm((f) => ({ ...f, checkDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockCheckTankId || void 0, onValueChange: (v) => setStockCheckTankId(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tank" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: String(t.name) }, String(t.id))) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Measured quantity (litres) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: stockCheckForm.measuredLitres ?? "", onChange: (e) => setStockCheckForm((f) => ({ ...f, measuredLitres: e.target.value })), placeholder: "e.g. 4850" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockCheckForm.method ?? "dip_stick", onValueChange: (v) => setStockCheckForm((f) => ({ ...f, method: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dip_stick", children: "Dip stick" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sight_gauge", children: "Sight gauge" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "flow_meter", children: "Flow meter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weighbridge", children: "Weighbridge" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checked by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockCheckForm.checkedBy ?? "", onChange: (e) => setStockCheckForm((f) => ({ ...f, checkedBy: e.target.value })), placeholder: "Name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes / actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: stockCheckForm.notes ?? "", onChange: (e) => setStockCheckForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "Any discrepancy investigation notes…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowStockCheckDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!stockCheckTankId || !stockCheckForm.checkDate || !stockCheckForm.measuredLitres) {
            toast({ title: "Tank, date and measured quantity are required", variant: "destructive" });
            return;
          }
          stockCheckMut.mutate({ tankId: stockCheckTankId, ...stockCheckForm });
        }, children: "Save Stock Check" })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Tank Inspection Overdue — ${raiseTaskFor.tankName ?? raiseTaskFor.fuelType ?? "Fuel Tank"}`,
        defaultDescription: `Location: ${raiseTaskFor.location ?? "—"} · Capacity: ${raiseTaskFor.capacityLitres ?? "—"} L · Inspect by: ${raiseTaskFor.nextInspectionDue ?? "—"}`,
        module: "fuel-energy"
      }
    )
  ] });
}
export {
  FuelEnergyPage as default
};
