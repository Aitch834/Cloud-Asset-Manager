import { c as useQueryClient, r as reactExports, m as useQuery, j as jsxRuntimeExports, d as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, a as useToast, a0 as X, e as LoaderCircle, l as cn, b as useAppStore, O as useMutation, H as DialogDescription, C as Checkbox, X as DialogMutationError, Q as React, n as Card, o as CardContent } from "./index-CkP_Oc2o.js";
import { D as DairyEnterpriseReport, A as AbrProcurementSection } from "./DairyEnterpriseReport-CR6PFuWX.js";
import { u as useSafeUser } from "./use-safe-clerk-Qr1ICzw7.js";
import { u as usePersistedTab } from "./use-persisted-tab-EEfhnjQH.js";
import { A as AppLayout, c as ClipboardList } from "./AppLayout-HiHvFWr1.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DxmEWPqg.js";
import { B as Badge } from "./badge-C8ed02xt.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-GBkjmUYL.js";
import { T as Textarea } from "./textarea-BzFXpDfb.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BQ1WeCvu.js";
import { D as DocAttach } from "./DocAttach-B2RKWtbg.js";
import { R as RecordAttachments } from "./RecordAttachments-qcOvhOpt.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-Bo-CD0hk.js";
import { B as BcsTab, M as MobilityTab, a as BulkTankTab, R as RecordingVisitsTab, S as SccEquipmentSection, D as DairySuppliesTab } from "./DairyPage-BY-_4zI6.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { P as Printer } from "./printer-CfypYGef.js";
import { P as Pencil } from "./pencil-BClqlW3Y.js";
import { T as Trash2 } from "./trash-2-C5pdHoV1.js";
import { u as useUpload } from "./use-upload-hQA4OaMg.js";
import { E as Eye } from "./eye-sDXxLx6j.js";
import { F as FileText, D as Droplets } from "./shield-alert-CEHNisAj.js";
import { U as Upload } from "./upload-C48HSaxW.js";
import { P as Paperclip } from "./paperclip-B5HEfvsF.js";
import { I as Image } from "./image-PPZ-spuP.js";
import { D as Download } from "./download-CFSb9Gzq.js";
import { C as ChevronLeft } from "./chevron-left-BtlHTQgH.js";
import { C as ChevronRight } from "./tractor-C02uPuMv.js";
import { T as TriangleAlert } from "./triangle-alert-CIwd_1Ic.js";
import { C as CircleCheck } from "./circle-check-Bg0F-2ns.js";
import { F as FileDown } from "./file-down-D5LRDScO.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, _ as ReferenceLine } from "./generateCategoricalChart-ChjA81wG.js";
import { C as ComposedChart } from "./ComposedChart-DK-EYGFB.js";
import { C as CartesianGrid } from "./CartesianGrid-CqWnC_4z.js";
import { L as Line } from "./Line-CU7OnsMc.js";
import "./shopping-cart-BGt1AS68.js";
import "./receipt-DzIpod-a.js";
import "./badge-check-DaZjKsUe.js";
import "./database-C8r3P08X.js";
import "./circle-x-BjbNMGR3.js";
import "./trending-down-Cd2TgpzL.js";
import "./chevron-up-BVf9ftQB.js";
import "./shield-check-muoYVWRe.js";
import "./index-Chp7r72c.js";
import "./index-C0fxCdmX.js";
import "./index-CiLyLwn1.js";
import "./api-Dhdsf4oM.js";
import "./tab-button-BnqJDCct.js";
import "./index-DTUUpdnJ.js";
import "./use-farm-members-B0aUq9Rv.js";
import "./staff-select-Z_E_0Z7H.js";
import "./vmdMedicines-mq70NSvP.js";
import "./sparkles-gLI4oRCN.js";
import "./chart-no-axes-column-BqqYRsTc.js";
import "./PieChart-DPTkghFV.js";
import "./thermometer-FsQinDRh.js";
import "./chevrons-up-down-BMjy-Ib7.js";
const BASE = "/dashboard/";
const api = (path) => `${BASE}api/${path}`;
const JOHNES_RISK$1 = [
  { value: "1_very_low", label: "1 — Very Low Risk" },
  { value: "2_low", label: "2 — Low Risk" },
  { value: "3_moderate", label: "3 — Moderate Risk" },
  { value: "4_high", label: "4 — High Risk" }
];
const NJMP_STRATEGY_LABELS = {
  s1_test_cull: "S1 — Test & cull high-risk cows",
  s2_segregate: "S2 — Segregate high-risk cows",
  s3_purchased_animals: "S3 — Purchased animal management",
  s4_calf_colostrum: "S4 — Calf & colostrum management",
  s5_slurry_pasture: "S5 — Slurry & pasture management",
  s6_bespoke: "S6 — Bespoke vet-led strategy"
};
function JohnesDeclarationSection({ farmId, allMonitoringRecords }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [ackOpen, setAckOpen] = reactExports.useState(false);
  const [ackRec, setAckRec] = reactExports.useState(null);
  const [ackForm, setAckForm] = reactExports.useState({});
  const [form, setForm] = reactExports.useState({});
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const qKey = ["johnes-declarations", farmId];
  const { data: declarations = [] } = useQuery({
    queryKey: qKey,
    queryFn: () => fetch(api(`farms/${farmId}/johnes-declarations`), { credentials: "include" }).then((r) => r.json()).then((d) => d.declarations ?? []),
    enabled: !!farmId
  });
  const latestNjmp = [...allMonitoringRecords].filter((r) => r.jmmEnrolled).sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0] ?? allMonitoringRecords.sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0];
  function openAdd() {
    setEditing(null);
    setForm({
      declarationYear: (/* @__PURE__ */ new Date()).getFullYear(),
      declarationDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      njmpSchemeRef: latestNjmp?.njmpSchemeRef ?? "",
      njmpRiskLevel: latestNjmp?.riskLevel ?? "",
      njmpControlStrategy: latestNjmp?.njmpControlStrategy ?? "",
      njmpPlanReviewedDate: latestNjmp?.njmpPlanDate ?? "",
      bajvaAdvisorName: latestNjmp?.njmpBajvaAdvisor ?? ""
    });
    setOpen(true);
  }
  async function save() {
    const url = editing ? api(`farms/${farmId}/johnes-declarations/${editing.id}`) : api(`farms/${farmId}/johnes-declarations`);
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: qKey });
    setOpen(false);
    setEditing(null);
  }
  async function del(id) {
    if (!confirm("Delete this declaration record?")) return;
    await fetch(api(`farms/${farmId}/johnes-declarations/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: qKey });
  }
  async function saveAck() {
    await fetch(api(`farms/${farmId}/johnes-declarations/${ackRec.id}/acknowledge`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ackForm)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: qKey });
    setAckOpen(false);
    setAckRec(null);
  }
  function printDeclaration(rec) {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "[not recorded]";
    const stratLabel = rec.njmpControlStrategy ? NJMP_STRATEGY_LABELS[rec.njmpControlStrategy] ?? rec.njmpControlStrategy : "[not recorded]";
    const rl = JOHNES_RISK$1.find((r) => r.value === rec.njmpRiskLevel)?.label ?? rec.njmpRiskLevel ?? "[not recorded]";
    const html = `<!DOCTYPE html><html><head><title>NJMP Annual Declaration ${rec.declarationYear}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:32px 40px;max-width:680px}
  .logo-bar{border-bottom:3px solid #15803d;padding-bottom:8px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:15px;font-weight:700;margin:0}.scheme{font-size:10px;color:#15803d;font-weight:700;letter-spacing:0.04em;text-transform:uppercase}
  .to-block{margin:20px 0 16px;padding:10px 14px;border-left:3px solid #e5e7eb;font-size:10px;color:#374151}
  .ref-line{font-size:9px;color:#6b7280;margin-bottom:16px}
  .subject{font-size:12px;font-weight:700;text-decoration:underline;margin-bottom:14px}
  .body-para{margin:0 0 10px;line-height:1.55}
  table{width:100%;border-collapse:collapse;margin:14px 0}
  th,td{padding:5px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px}
  th{background:#f0fdf4;font-weight:700;color:#15803d;text-transform:uppercase;font-size:9px}
  .declaration-box{border:2px solid #15803d;border-radius:4px;padding:12px 16px;margin:18px 0;background:#f0fdf4}
  .declaration-box p{margin:0 0 4px;font-size:10.5px}
  .sig-block{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .sig-line{border-bottom:1px solid #000;height:24px;margin-bottom:4px}
  .sig-label{font-size:9px;color:#6b7280}
  .footer{margin-top:28px;font-size:8px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
  @media print{@page{margin:2cm;size:A4}}
</style></head><body>
<div class="logo-bar">
  <div><div class="scheme">National Johne's Management Plan (NJMP)</div><h1>Annual Declaration — ${rec.declarationYear}</h1></div>
  <div style="text-align:right;font-size:9px;color:#6b7280">Date: ${fmtD(rec.declarationDate)}<br>${rec.njmpSchemeRef ? `Scheme Ref: <strong>${rec.njmpSchemeRef}</strong>` : ""}</div>
</div>
<div class="to-block"><strong>To:</strong> ${rec.milkPurchaser || "[Milk Purchaser Name]"}<br>${rec.milkPurchaserAddress ? rec.milkPurchaserAddress.replace(/\n/g, "<br>") : "[Milk Purchaser Address]"}</div>
<div class="ref-line">From: ${rec.farmerName || "[Farmer / Herd Operator Name]"}</div>
<p class="subject">Re: NJMP Annual Declaration — Herd Johne's Disease Management Plan — Year ${rec.declarationYear}</p>
<p class="body-para">I, the undersigned, hereby declare that the above-named herd is enrolled in the National Johne's Management Plan (NJMP) as administered by AHDB / BCVA, and that the following information is correct and up to date as of the date of this declaration.</p>
<div class="declaration-box"><p><strong>NJMP Enrolled Herd Declaration</strong></p><p>This declaration confirms that the herd identified above has an active written Johne's disease control plan, which has been reviewed in the 12-month period prior to the date of this declaration, and that the herd's NJMP compliance status is as follows:</p></div>
<table>
  <tr><th>Item</th><th>Detail</th></tr>
  <tr><td>NJMP Scheme / Enrolment Reference</td><td>${rec.njmpSchemeRef || "—"}</td></tr>
  <tr><td>Current NJMP Herd Risk Level</td><td>${rl}</td></tr>
  <tr><td>Active Control Strategy</td><td>${stratLabel}</td></tr>
  <tr><td>Written Plan Last Reviewed</td><td>${fmtD(rec.njmpPlanReviewedDate)}</td></tr>
  <tr><td>BAJVA / Accredited Veterinary Advisor</td><td>${rec.bajvaAdvisorName || "—"}</td></tr>
</table>
<p class="body-para">I confirm that the control plan has been formulated and is being implemented in conjunction with a BCVA Accredited Johne's Veterinary Advisor (BAJVA), that an annual on-farm risk assessment has been carried out within the past 12 months, and that the herd has been screened in accordance with NJMP requirements (minimum 60-cow individual milk ELISA — bulk milk ELISA alone is not accepted for NJMP risk status).</p>
<p class="body-para">I understand that this declaration must be submitted to my milk purchaser on an annual basis, and that failure to do so may affect my Red Tractor Dairy assurance status.</p>
${rec.notes ? `<p class="body-para"><em>Notes: ${rec.notes}</em></p>` : ""}
<div class="sig-block">
  <div><div class="sig-line"></div><div class="sig-label">Signature of Herd Operator / Farmer</div></div>
  <div><div class="sig-line"></div><div class="sig-label">Date</div></div>
  <div style="margin-top:16px"><div class="sig-line"></div><div class="sig-label">Print Name: ${rec.farmerName || "________________________________"}</div></div>
</div>
<div class="footer">NJMP Annual Declaration generated by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years. For NJMP queries contact AHDB Dairy or your BAJVA-accredited veterinary advisor.</div>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t pt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "NJMP Annual Declarations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Record and print the annual declaration submitted to your milk purchaser. Keep a history for assurance auditors." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
        "New Annual Declaration"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-3", children: [
      "The NJMP applies to enrolled ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "dairy cattle herds only" }),
      " — it is not applicable to sheep or goats. For Johne's disease (paratuberculosis) in sheep and goats, record vaccination with Gudair via the Vaccination Programmes tab in the Sheep / Goat Production modules. Cattle vaccination is not licensed in the UK due to cross-reactivity with the bovine TB skin test."
    ] }),
    declarations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 border-2 border-dashed rounded-lg text-sm text-gray-400", children: 'No declarations recorded yet. Click "New Annual Declaration" to log and print your first.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Year", "Date Submitted", "Milk Purchaser", "Risk Level", "Control Strategy", "BAJVA Advisor", "Acknowledged", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: declarations.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-semibold", children: d.declarationYear }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.declarationDate ? new Date(d.declarationDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.milkPurchaser || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: JOHNES_RISK$1.find((r) => r.value === d.njmpRiskLevel)?.label ?? d.njmpRiskLevel ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: NJMP_STRATEGY_LABELS[d.njmpControlStrategy] ?? d.njmpControlStrategy ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: d.bajvaAdvisorName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.acknowledgementReceived ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: [
          "✓ ",
          d.acknowledgementDate ? new Date(d.acknowledgementDate).toLocaleDateString("en-GB") : "Received"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500", children: "Pending" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs", onClick: () => printDeclaration(d), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3 h-3 mr-1" }),
            "Print"
          ] }),
          !d.acknowledgementReceived && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-green-700 border-green-300 hover:bg-green-50", onClick: () => {
            setAckRec(d);
            setAckForm({ acknowledgementDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
            setAckOpen(true);
          }, children: "Record Ack." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => {
            setEditing(d);
            setForm({ ...d });
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => del(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, d.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Annual Declaration" : "New NJMP Annual Declaration" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Fields are pre-filled from your most recent NJMP monitoring record. Review and adjust before saving and printing." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "2020", max: "2099", value: form.declarationYear ?? (/* @__PURE__ */ new Date()).getFullYear(), onChange: (e) => setF("declarationYear", parseInt(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.declarationDate || "", onChange: (e) => setF("declarationDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farmer / Operator Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.farmerName || "", onChange: (e) => setF("farmerName", e.target.value), placeholder: "Full name as will appear on declaration letter" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "NJMP Scheme Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "font-mono", value: form.njmpSchemeRef || "", onChange: (e) => setF("njmpSchemeRef", e.target.value), placeholder: "e.g. AHDB-JMM-123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Purchaser" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.milkPurchaser || "", onChange: (e) => setF("milkPurchaser", e.target.value), placeholder: "e.g. Arla Foods UK, Müller Milk, First Milk" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current NJMP Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpRiskLevel || "__none__", onValueChange: (v) => setF("njmpRiskLevel", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              JOHNES_RISK$1.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Purchaser Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.milkPurchaserAddress || "", onChange: (e) => setF("milkPurchaserAddress", e.target.value), placeholder: "Purchaser address (appears on the printed declaration letter)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Control Strategy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpControlStrategy || "__none__", onValueChange: (v) => setF("njmpControlStrategy", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select strategy" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s1_test_cull", children: "S1 — Test & cull high-risk cows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s2_segregate", children: "S2 — Segregate high-risk cows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s3_purchased_animals", children: "S3 — Purchased animal management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s4_calf_colostrum", children: "S4 — Calf & colostrum management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s5_slurry_pasture", children: "S5 — Slurry & pasture management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s6_bespoke", children: "S6 — Bespoke vet-led strategy" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Written Plan Last Reviewed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.njmpPlanReviewedDate || "", onChange: (e) => setF("njmpPlanReviewedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BAJVA Advisor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bajvaAdvisorName || "", onChange: (e) => setF("bajvaAdvisorName", e.target.value), placeholder: "BCVA-accredited veterinary advisor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => setF("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: editing ? "Save Changes" : "Save Declaration" })
      ] })
    ] }) }),
    ackOpen && ackRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => {
      setAckOpen(false);
      setAckRec(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "32rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Record Acknowledgement — ",
        ackRec.declarationYear,
        " Declaration"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Record when ",
        ackRec.milkPurchaser || "the milk purchaser",
        " confirmed receipt. The NJMP does not mandate a formal acknowledgement, but having it on file strengthens your audit trail."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Acknowledgement Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: ackForm.acknowledgementDate || "", onChange: (e) => setAckForm((f) => ({ ...f, acknowledgementDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Purchaser Reference ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal text-xs", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: ackForm.acknowledgementRef || "", onChange: (e) => setAckForm((f) => ({ ...f, acknowledgementRef: e.target.value })), placeholder: "e.g. email ref, letter ref" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAckOpen(false);
          setAckRec(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveAck, children: "Save Acknowledgement" })
      ] })
    ] }) })
  ] });
}
const JOHNES_TYPES = [
  { value: "bulk_milk_elisa", label: "Bulk Milk ELISA" },
  { value: "individual_milk_elisa", label: "Individual Milk ELISA" },
  { value: "individual_blood_elisa", label: "Individual Blood ELISA" },
  { value: "faecal_pcr", label: "Faecal PCR (individual)" },
  { value: "pooled_faecal_pcr", label: "Pooled Faecal PCR" },
  { value: "post_mortem", label: "Post-mortem confirmation" }
];
const JOHNES_RISK = [
  { value: "1_very_low", label: "1 — Very Low Risk" },
  { value: "2_low", label: "2 — Low Risk" },
  { value: "3_moderate", label: "3 — Moderate Risk" },
  { value: "4_high", label: "4 — High Risk" }
];
const JOHNES_SCHEMES = [
  { value: "johnes_management_in_milk", label: "Johne's Management in Milk (AHDB)" },
  { value: "farm_health_connect", label: "Farm Health Connect" },
  { value: "voluntary", label: "Voluntary / Vet-led" },
  { value: "other", label: "Other" }
];
const JOHNES_LABS_PRESETS = [
  "APHA Starcross",
  "APHA Weybridge",
  "APHA Lasswade (Scotland)",
  "SAC / SRUC Veterinary Services",
  "Biobest Laboratories",
  "Axiom Veterinary Laboratories",
  "Westgate Labs",
  "Quality Milk Laboratories"
];
function johnesFmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB");
  } catch {
    return d;
  }
}
function johnesRiskLabel(v) {
  return JOHNES_RISK.find((r) => r.value === v)?.label ?? v ?? "—";
}
function johnesTypeLabel(v) {
  return JOHNES_TYPES.find((t) => t.value === v)?.label ?? v ?? "—";
}
function JohnesDocAttach({ farmId, endpoint, recordId, documentPath, documentName, queryKey, compact }) {
  const qc = useQueryClient();
  const { uploadFile } = useUpload();
  const { toast } = useToast();
  const inputRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey, farmId];
  async function handleFile(file) {
    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (!response) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/${endpoint}/${recordId}/document`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: file.name })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: keys });
      toast({ title: "Document attached" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }
  async function remove() {
    await fetch(`/api/farms/${farmId}/${endpoint}/${recordId}/document`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: keys });
  }
  if (documentPath) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: `/api/storage${documentPath}`,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "inline-flex items-center gap-1 text-xs text-blue-600 hover:underline",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3" }),
            compact ? null : documentName ?? "View"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: remove,
          title: "Remove document",
          className: "text-muted-foreground hover:text-destructive",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp",
        className: "hidden",
        onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => inputRef.current?.click(),
        disabled: uploading,
        className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50",
        title: "Attach document",
        children: [
          uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3 h-3" }),
          compact ? null : uploading ? "Uploading…" : "Attach"
        ]
      }
    )
  ] });
}
function fmtBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function isImageFile(mimeType, fileName) {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
}
function JohnesRecordAttachments({ farmId, recordType, recordId, compact = false }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { uploadFile } = useUpload();
  const inputRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const queryKey = ["record-attachments", farmId, recordType, recordId];
  const { data: attachments = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments?recordType=${encodeURIComponent(recordType)}&recordId=${recordId}`, {
      credentials: "include"
    }).then((r) => r.json()),
    enabled: !!farmId && !!recordId
  });
  async function handleFile(file) {
    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (!response?.objectPath) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/record-attachments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType,
          recordId,
          fileUrl: `/api/storage${response.objectPath}`,
          fileKey: response.objectPath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || null
        })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey });
      toast({ title: "Attachment uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }
  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await fetch(`/api/farms/${farmId}/record-attachments/${id}`, {
        method: "DELETE",
        credentials: "include"
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey });
      toast({ title: "Attachment removed" });
    } catch {
      toast({ title: "Failed to remove attachment", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", compact ? "text-xs" : "text-sm"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("font-medium flex items-center gap-1.5 text-muted-foreground", compact ? "text-xs" : "text-sm"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: compact ? "w-3 h-3" : "w-4 h-4" }),
        "Attachments",
        attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-muted text-muted-foreground rounded-full px-1.5 py-0 text-[10px] font-semibold", children: attachments.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          type: "file",
          accept: "image/*,.pdf,.doc,.docx",
          className: "hidden",
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: cn("h-7 px-2 gap-1", compact ? "text-xs" : "text-xs"),
          onClick: () => inputRef.current?.click(),
          disabled: uploading,
          children: [
            uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3 h-3" }),
            uploading ? "Uploading…" : "Add file"
          ]
        }
      )
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-1", children: "Loading attachments…" }),
    !isLoading && attachments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-1 italic", children: "No attachments yet." }),
    attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: attachments.map((att) => {
      const img = isImageFile(att.mimeType, att.fileName);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex items-center gap-2 rounded border border-border bg-muted/40 px-2 py-1.5 group",
          children: [
            img ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 shrink-0 text-blue-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 shrink-0 text-orange-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-medium leading-tight", children: att.fileName }),
              att.fileSize && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: fmtBytes(att.fileSize) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: att.fileUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "shrink-0 text-muted-foreground hover:text-foreground",
                title: "Download / view",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDelete(att.id),
                disabled: deletingId === att.id,
                className: "shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity",
                title: "Remove attachment",
                children: deletingId === att.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
              }
            )
          ]
        },
        att.id
      );
    }) })
  ] });
}
function OrganicJohnesTab({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [mode, setMode] = reactExports.useState("log");
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["johnes-monitoring", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/johnes-monitoring`, { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const allRecords = allRecordsRaw;
  const years = reactExports.useMemo(() => {
    const s = new Set(
      allRecords.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean)
    );
    return Array.from(s).sort().reverse();
  }, [allRecords]);
  const records = yearFilter === "all" ? allRecords : allRecords.filter((r) => String(r.testDate ?? "").startsWith(yearFilter));
  const { data: herdsRaw } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const herds = (Array.isArray(herdsRaw) ? herdsRaw : herdsRaw?.records ?? []).filter((h) => {
    const t = String(h.type ?? "").toLowerCase();
    return ["cattle", "beef", "dairy", "suckler", "bovine"].some((k) => t.includes(k));
  });
  const uniqueVetNames = [...new Set(allRecords.map((r) => r.vetName).filter(Boolean))];
  function openAdd() {
    setEditing(null);
    setForm({ testType: "bulk_milk_elisa", jmmEnrolled: false, vetSignOff: false, njmpColostrumMgmt: false, njmpPurchasedTesting: false });
    setMode("log");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setMode("edit");
    setOpen(true);
  }
  function openEnterResult(r) {
    setEditing(r);
    setForm({ ...r });
    setMode("result");
    setOpen(true);
  }
  async function save() {
    const url = editing ? `/api/farms/${farmId}/johnes-monitoring/${editing.id}` : `/api/farms/${farmId}/johnes-monitoring`;
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
    setOpen(false);
  }
  async function del(id) {
    if (!confirm("Delete this Johne's monitoring record?")) return;
    await fetch(`/api/farms/${farmId}/johnes-monitoring/${id}`, {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
  }
  function printReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const rows = records.map(
      (r) => `<tr>
      <td>${johnesFmtDate(r.testDate)}</td>
      <td>${johnesTypeLabel(r.testType)}</td>
      <td>${r.herdId ? herds.find((h) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}` : "—"}</td>
      <td>${johnesRiskLabel(r.riskLevel)}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.positiveAnimalsCount ?? 0}</td>
      <td>${r.bulkMilkOd ?? "—"}</td>
      <td>${r.labName || "—"}</td>
      <td>${r.labRef || "—"}</td>
      <td>${johnesFmtDate(r.nextTestDue)}</td>
      <td>${r.jmmEnrolled ? "Yes" : "No"}${r.jmmEnrolled && r.njmpSchemeRef ? ` (Ref: ${r.njmpSchemeRef})` : ""}</td>
      <td>${r.njmpPlanDate ? new Date(r.njmpPlanDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${r.njmpColostrumMgmt ? "✓" : ""}${r.njmpPurchasedTesting ? " / ✓" : ""}</td>
    </tr>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><title>Johne's Disease Monitoring Register</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px}
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #e5e7eb}
  th{font-size:8px;text-transform:uppercase;color:#6b7280;background:#f9fafb}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Johne's Disease Monitoring Register</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b>${yearFilter !== "all" ? `<br>Year: ${yearFilter}` : ""}<br>Printed: ${printedDate}</div>
</div>
<table>
  <tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Risk Level</th><th>Tested</th><th>Positive</th><th>Bulk Milk OD</th><th>Lab</th><th>Lab Ref</th><th>Next Due</th><th>NJMP/JMM</th><th>Plan Reviewed</th><th>Protocols</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Johne's monitoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires a documented Johne's monitoring programme. Retain for a minimum of 3 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  const totalAnimals = records.reduce(
    (s, r) => s + (r.animalsTestedCount ? Number(r.animalsTestedCount) : 0),
    0
  );
  const totalPositive = records.reduce(
    (s, r) => s + (r.positiveAnimalsCount ? Number(r.positiveAnimalsCount) : 0),
    0
  );
  const prevalence = totalAnimals > 0 ? (totalPositive / totalAnimals * 100).toFixed(1) : null;
  const highRisk = records.filter(
    (r) => r.riskLevel && (r.riskLevel.startsWith("3") || r.riskLevel.startsWith("4"))
  ).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Johne's Disease Monitoring Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Red Tractor Dairy requires a documented Johne's monitoring programme. Record each test with result and risk level classification." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printReport, disabled: records.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Log Sample"
        ] })
      ] })
    ] }),
    !isLoading && records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Tests Recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: records.length })
      ] }),
      totalAnimals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Animals Tested" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: totalAnimals.toLocaleString() })
      ] }),
      totalAnimals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: totalPositive > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${totalPositive > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalPositive > 0 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: [
          "Positives",
          prevalence ? ` (${prevalence}%)` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: totalPositive > 0 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }, children: totalPositive })
      ] }),
      highRisk > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "High / Elevated Risk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }, children: highRisk })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-gray-600", children: [
        "No Johne's monitoring records",
        yearFilter !== "all" ? ` for ${yearFilter}` : "",
        " yet"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Log your first sample to start tracking your herd's Johne's status." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Test Date", "Test Type", "Herd", "Risk Level", "Animals Tested", "Positive", "Bulk Milk OD", "Next Test Due", "Doc", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesFmtDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesTypeLabel(r.testType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.herdId ? herds.find((h) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: !r.riskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.riskLevel.startsWith("4") ? "bg-red-100 text-red-800" : r.riskLevel.startsWith("3") ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`, children: johnesRiskLabel(r.riskLevel) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.animalsTestedCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.positiveAnimalsCount ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.bulkMilkOd ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesFmtDate(r.nextTestDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          JohnesDocAttach,
          {
            farmId,
            endpoint: "johnes-monitoring",
            recordId: r.id,
            documentPath: r.documentPath,
            documentName: r.documentName,
            queryKey: ["johnes-monitoring", farmId],
            compact: true
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          !r.riskLevel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => del(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Johne's Monitoring — ",
        johnesFmtDate(viewRec.testDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesFmtDate(viewRec.testDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesTypeLabel(viewRec.testType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.herdId ? herds.find((h) => h.id === viewRec.herdId)?.name ?? `Herd #${viewRec.herdId}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesRiskLabel(viewRec.riskLevel) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animals Tested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.animalsTestedCount ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Positive Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.positiveAnimalsCount ?? 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bulk Milk OD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.bulkMilkOd ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labRef || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: JOHNES_SCHEMES.find((s) => s.value === viewRec.scheme)?.label ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesFmtDate(viewRec.nextTestDue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "NJMP / JMM Enrolled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.jmmEnrolled ? "Yes" : "No" })
        ] }),
        viewRec.jmmEnrolled && viewRec.njmpSchemeRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "NJMP Scheme Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRec.njmpSchemeRef })
        ] }),
        viewRec.jmmEnrolled && viewRec.njmpPlanDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Plan Last Reviewed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesFmtDate(viewRec.njmpPlanDate) })
        ] }),
        viewRec.jmmEnrolled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum Protocol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.njmpColostrumMgmt ? "✓ Documented" : "Not confirmed" })
        ] }),
        viewRec.jmmEnrolled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Purchased Animal Testing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.njmpPurchasedTesting ? "✓ Protocol in place" : "Not confirmed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Sign-off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetSignOff ? "Yes" : "No" })
        ] }),
        viewRec.actionsTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.actionsTaken })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        viewRec.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(JohnesRecordAttachments, { farmId, recordType: "johnes-monitoring", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRec(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "log" ? "Log Johne’s Test Sample" : mode === "result" ? "Enter Johne’s Test Results" : "Edit Johne’s Monitoring Record" }) }),
      mode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Record the sampling event now. Return to enter laboratory results once the report arrives." }),
      mode === "result" && editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
        "Sample from ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: johnesFmtDate(editing.testDate) }),
        " · ",
        johnesTypeLabel(editing.testType),
        editing.labName ? ` · ${editing.labName}` : "",
        ". Enter results from your lab report."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate || "", onChange: (e) => set("testDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testType || "", onValueChange: (v) => set("testType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: JOHNES_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] }),
            form.testType === "bulk_milk_elisa" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1", children: [
              "⚠ ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NJMP note:" }),
              " Bulk milk ELISA is ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "not accepted" }),
              " for NJMP herd risk status determination. A minimum 60-cow individual milk ELISA screen is required for NJMP status."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: String(form.herdId || "__none__"),
                onValueChange: (v) => set("herdId", v === "__none__" ? null : Number(v)),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd (optional)" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All herds" }),
                    herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: JOHNES_LABS_PRESETS.includes(form.labName) ? form.labName : form.labName ? "__other__" : "",
                onValueChange: (v) => set("labName", v === "__other__" ? "" : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select laboratory…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    JOHNES_LABS_PRESETS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l, children: l }, l)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (enter below)" })
                  ] })
                ]
              }
            ),
            (!JOHNES_LABS_PRESETS.includes(form.labName) || form.labName === "") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1 text-xs", value: form.labName || "", onChange: (e) => set("labName", e.target.value), placeholder: "Enter lab name manually" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value), placeholder: "Lab submission reference (if known)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.scheme || "__none__",
                onValueChange: (v) => set("scheme", v === "__none__" ? null : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select scheme" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None" }),
                    JOHNES_SCHEMES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
            uniqueVetNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: uniqueVetNames.includes(form.vetName) ? form.vetName : form.vetName ? "__other__" : "",
                  onValueChange: (v) => set("vetName", v === "__other__" ? "" : v),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      uniqueVetNames.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (enter below)" })
                    ] })
                  ]
                }
              ),
              (!uniqueVetNames.includes(form.vetName) || form.vetName === "") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1 text-xs", value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Enter vet name manually" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "e.g. Mr J Smith BVSc MRCVS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "jmm", checked: !!form.jmmEnrolled, onChange: (e) => set("jmmEnrolled", e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "jmm", children: "Enrolled in NJMP / JMM Scheme" })
            ] }),
            form.jmmEnrolled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800", children: "National Johne's Management Plan (NJMP) Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "NJMP / Scheme Reference No." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs font-mono", placeholder: "e.g. AHDB-JMM-123456", value: form.njmpSchemeRef || "", onChange: (e) => set("njmpSchemeRef", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Written Plan Last Reviewed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-xs", value: form.njmpPlanDate || "", onChange: (e) => set("njmpPlanDate", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                    "BAJVA Advisor Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 font-normal", children: "(BCVA Accredited Johne's Veterinary Advisor)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "e.g. Dr A Jones MRCVS — BAJVA accredited", value: form.njmpBajvaAdvisor || "", onChange: (e) => set("njmpBajvaAdvisor", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                    "Control Strategy ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 font-normal", children: "(select the NJMP approved strategy in place)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpControlStrategy || "__none__", onValueChange: (v) => set("njmpControlStrategy", v === "__none__" ? null : v), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select strategy…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s1_test_cull", children: "S1 — Test & cull high-risk cows" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s2_segregate", children: "S2 — Segregate high-risk cows" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s3_purchased_animals", children: "S3 — Purchased animal management" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s4_calf_colostrum", children: "S4 — Calf & colostrum management" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s5_slurry_pasture", children: "S5 — Slurry & pasture management" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s6_bespoke", children: "S6 — Bespoke vet-led strategy" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Annual Risk Assessment Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-xs", value: form.njmpRiskAssessmentDate || "", onChange: (e) => set("njmpRiskAssessmentDate", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Annual Declaration Submitted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-xs", value: form.njmpDeclarationDate || "", onChange: (e) => set("njmpDeclarationDate", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                    "Declaration Recipient ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 font-normal", children: "(milk purchaser / processor)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "e.g. Arla Foods UK, Müller Milk, First Milk…", value: form.njmpDeclarationRecipient || "", onChange: (e) => set("njmpDeclarationRecipient", e.target.value) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!form.njmpColostrumMgmt, onChange: (e) => set("njmpColostrumMgmt", e.target.checked), className: "rounded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Colostrum management protocol documented" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "(NJMP — prevent calf-to-calf transmission)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!form.njmpPurchasedTesting, onChange: (e) => set("njmpPurchasedTesting", e.target.checked), className: "rounded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Purchased animal testing protocol in place" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "(NJMP — test/quarantine bought-in cattle)" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        mode !== "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Risk Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.riskLevel || "__none__",
                onValueChange: (v) => set("riskLevel", v === "__none__" ? null : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not classified" }),
                    JOHNES_RISK.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Positive Animals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.positiveAnimalsCount ?? 0, onChange: (e) => set("positiveAnimalsCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bulk Milk OD" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.bulkMilkOd ?? "", onChange: (e) => set("bulkMilkOd", e.target.value), placeholder: "Optical density reading" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDue || "", onChange: (e) => set("nextTestDue", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "vetso", checked: !!form.vetSignOff, onChange: (e) => set("vetSignOff", e.target.checked), className: "rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetso", children: "Vet sign-off obtained" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.actionsTaken || "", onChange: (e) => set("actionsTaken", e.target.value), placeholder: "Management actions, culling decisions, biosecurity changes…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JohnesDeclarationSection, { farmId, allMonitoringRecords: allRecords })
  ] });
}
const FEED_TYPES = [
  ["Concentrate", "Concentrate"],
  ["Grass Silage", "Grass Silage"],
  ["Maize Silage", "Maize Silage"],
  ["Hay", "Hay"],
  ["Haylage", "Haylage"],
  ["Wholecrop Silage", "Wholecrop Silage"],
  ["Grazed Grass", "Grazed Grass"],
  ["Straw", "Straw"],
  ["Root Crops / Beet", "Root Crops / Beet"],
  ["Minerals & Supplements", "Minerals & Supplements"],
  ["Other", "Other"]
];
const DAIRY_BREEDS = [
  "Holstein Friesian",
  "Jersey",
  "Ayrshire",
  "Guernsey",
  "British Friesian",
  "Brown Swiss",
  "Shorthorn (Dairy)",
  "Montbéliarde",
  "Norwegian Red",
  "Mixed / Cross-breed",
  "Other"
];
const PRODUCT_CATEGORIES = [
  "Antibiotic",
  "NSAID",
  "Anthelmintic",
  "Antiparasitic",
  "Vaccine",
  "Teat Sealant",
  "Homeopathic",
  "Other"
];
const ROUTES_OF_ADMINISTRATION = [
  "Intramuscular (IM)",
  "Subcutaneous (SC)",
  "Intravenous (IV)",
  "Oral",
  "Intramammary",
  "Topical",
  "Other"
];
function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB");
}
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function fmtRaw(v) {
  return v == null || v === "" ? "—" : String(v);
}
function conversionStatusBadge(status) {
  const map = {
    "in-conversion": "bg-yellow-100 text-yellow-800",
    certified: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: map[status] ?? "bg-gray-100 text-gray-700", children: status.replace(/-/g, " ") });
}
const PRINT_CSS = `
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0e7490; padding-bottom: 8px; margin-bottom: 14px; }
  .hdr-l .title { font-size: 15px; font-weight: bold; color: #0e7490; }
  .hdr-l .farm { font-size: 12px; color: #374151; margin-top: 2px; }
  .hdr-r { font-size: 10px; color: #6b7280; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #ecfeff; border: 1px solid #a5f3fc; padding: 5px 7px; text-align: left; font-size: 10px; font-weight: bold; color: #0e7490; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { display: inline-block; padding: 1px 7px; border-radius: 12px; font-size: 9px; font-weight: bold; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-yellow { background: #fef9c3; color: #854d0e; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-gray { background: #f3f4f6; color: #374151; }
  @media print { @page { size: A4 landscape; margin: 1.5cm; } }
`;
function openPrint(html) {
  const w = window.open("", "_blank", "width=1100,height=780");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.addEventListener("afterprint", () => w.close());
  setTimeout(() => w.print(), 400);
}
function printHerdConversionRegister(records, farmName) {
  const today2 = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
    <tr>
      <td>${fmtRaw(r.herdName)}</td>
      <td>${fmtRaw(r.breed)}</td>
      <td>${fmtRaw(r.numberOfCows)}</td>
      <td><span class="badge ${r.status === "certified" ? "badge-green" : r.status === "in-conversion" ? "badge-yellow" : "badge-red"}">${r.status.replace(/-/g, " ")}</span></td>
      <td>${fmt(r.conversionStartDate)}</td>
      <td>${fmt(r.expectedMilkCertDate)}</td>
      <td>${fmt(r.actualMilkCertDate)}</td>
      <td>${fmtRaw(r.certifier)}</td>
      <td>${fmtRaw(r.certificationRef)}</td>
      <td>${r.parallelProduction ? "Yes" : "No"}</td>
      <td>${fmtRaw(r.notes)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Dairy Herd Conversion Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Dairy Herd Conversion Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Herd Conversion</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today2}</div></div>
    <table><thead><tr><th>Herd Name</th><th>Breed</th><th>Cows</th><th>Status</th><th>Conv. Start</th><th>Exp. Milk Cert</th><th>Actual Cert</th><th>Certifier</th><th>Cert Ref</th><th>Parallel</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function printMilkCollectionLog(records, farmName) {
  const today2 = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
    <tr>
      <td>${fmt(r.collectionDate)}</td>
      <td>${fmtRaw(r.collectorName)}</td>
      <td>${fmtRaw(r.vehicleRegistration)}</td>
      <td>${fmtRaw(r.volumeLitres)}</td>
      <td>${r.fatPercentage ? r.fatPercentage + "%" : "—"}</td>
      <td>${r.proteinPercentage ? r.proteinPercentage + "%" : "—"}</td>
      <td>${r.sccCount ? r.sccCount + "k" : "—"}</td>
      <td>${r.tbcCount ? r.tbcCount + "k" : "—"}</td>
      <td><span class="badge ${r.isOrganicCollection ? "badge-green" : "badge-amber"}">${r.isOrganicCollection ? "Organic" : "Non-organic"}${!r.isOrganicCollection && r.nonOrganicReason ? " — " + r.nonOrganicReason : ""}</span></td>
      <td>${fmtRaw(r.collectionSlipRef)}</td>
      <td>${fmtRaw(r.processorRef)}</td>
      <td>${r.netValuePence != null ? "£" + (r.netValuePence / 100).toFixed(2) : "—"}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Milk Collection Log — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Milk Collection Log</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Milk Collections</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today2}</div></div>
    <table><thead><tr><th>Date</th><th>Collector</th><th>Vehicle</th><th>Volume (L)</th><th>Fat %</th><th>Protein %</th><th>SCC</th><th>TBC</th><th>Organic</th><th>Collection Docket</th><th>Processor Ref</th><th>Net Value</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function printFeedNutritionLog(records, farmName) {
  const today2 = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
    <tr>
      <td>${fmt(r.recordDate)}</td>
      <td>${fmtRaw(r.feedProductName)}</td>
      <td>${fmtRaw(r.feedType)}</td>
      <td>${fmtRaw(r.supplier)}</td>
      <td>${fmtRaw(r.quantityKg)}</td>
      <td>${fmtRaw(r.dryMatterKg)}</td>
      <td>${r.organicPercentage ? r.organicPercentage + "%" : "—"}</td>
      <td><span class="badge ${r.isOrganicApproved ? "badge-green" : "badge-red"}">${r.isOrganicApproved ? "Yes" : "No"}</span></td>
      <td>${fmtRaw(r.certifierApprovalRef)}</td>
      <td>${fmtRaw(r.poReference)}</td>
      <td>${fmtRaw(r.grnReference)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Dairy Feed & Nutrition Log — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Dairy Feed & Nutrition Log</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Feed Records</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today2}</div></div>
    <table><thead><tr><th>Date</th><th>Feed Product</th><th>Type</th><th>Supplier</th><th>Qty (kg)</th><th>DM (kg)</th><th>Organic %</th><th>Approved</th><th>Certifier Ref</th><th>PO Ref</th><th>GRN Ref</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function printDairyTreatmentRegister(records, farmName) {
  const today2 = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
    <tr>
      <td>${fmt(r.treatmentDate)}</td>
      <td>${fmtRaw(r.cowIds)}</td>
      <td>${fmtRaw(r.numberOfCows)}</td>
      <td>${fmtRaw(r.productName)}</td>
      <td>${fmtRaw(r.productCategory)}</td>
      <td>${fmtRaw(r.activeIngredient)}</td>
      <td>${fmtRaw(r.doseAmount)}</td>
      <td>${fmtRaw(r.vetName)}</td>
      <td>${fmtRaw(r.prescriptionRef)}</td>
      <td>${fmtRaw(r.standardMilkWithdrawalDays)}</td>
      <td>${fmtRaw(r.doubledMilkWithdrawalDays)}</td>
      <td>${fmt(r.milkWithdrawalEndDate)}</td>
      <td>${fmt(r.meatWithdrawalEndDate)}</td>
      <td>${fmtRaw(r.treatmentNumber)}</td>
      <td><span class="badge ${r.certifierNotified ? "badge-green" : "badge-gray"}">${r.certifierNotified ? "Yes" : "No"}</span></td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Dairy Vet Treatment Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Dairy Vet Treatment Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Vet Treatments</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today2}</div></div>
    <table><thead><tr><th>Date</th><th>Cow IDs</th><th>No.</th><th>Product</th><th>Category</th><th>Active Ingredient</th><th>Dose</th><th>Vet</th><th>Rx Ref</th><th>Std Milk W/D</th><th>Dbl Milk W/D</th><th>Milk W/D End</th><th>Meat W/D End</th><th>Tx No.</th><th>Cert. Notified</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function MastitisTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { onsetDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false, certifierNotified: false };
  const [form, setForm] = reactExports.useState(blank);
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["dairy-mastitis", farmId], queryFn: () => fetch(`/api/farms/${farmId}/dairy/mastitis-records`, { credentials: "include" }).then((r) => r.json()) });
  const allRecords = data?.records ?? [];
  const uncertifiedCount = allRecords.filter((r) => r.treatmentProduct && !r.certifierNotified).length;
  const [filterPreset, setFilterPreset] = reactExports.useState("12m");
  const presetFrom = React.useMemo(() => {
    if (filterPreset === "all") return null;
    const d = /* @__PURE__ */ new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  }, [filterPreset]);
  const filtered = React.useMemo(() => presetFrom ? allRecords.filter((r) => (r.onsetDate || "") >= presetFrom) : allRecords, [allRecords, presetFrom]);
  const save = useMutation({
    mutationFn: (body) => fetch(editing ? `/api/farms/${farmId}/dairy/mastitis-records/${editing.id}` : `/api/farms/${farmId}/dairy/mastitis-records`, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] });
      setOpen(false);
      toast({ title: editing ? "Updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/dairy/mastitis-records/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic rule:" }),
      " All withdrawal periods for mastitis treatments must be DOUBLED (EU/UK Organic Regulation). Record both standard and doubled milk withdrawal days and notify your certifier of any antibiotic use."
    ] }),
    uncertifiedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        uncertifiedCount,
        " treated case",
        uncertifiedCount !== 1 ? "s" : "",
        " where certifier has not been notified."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Mastitis Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPreset, onValueChange: (v) => setFilterPreset(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "12m", children: "Last 12 months" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All records" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm(blank);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No mastitis records found." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ear Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quarter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dbl Milk W/D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.onsetDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.earTagNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: r.quartersAffected || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.treatmentProduct || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.doubledWithdrawalDays != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [
          r.doubledWithdrawalDays,
          "d"
        ] }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.certifierNotified ? "bg-green-100 text-green-800" : r.treatmentProduct ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500", children: r.certifierNotified ? "Notified" : r.treatmentProduct ? "Pending" : "N/A" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          r.outcome || "Ongoing",
          r.chronicCase ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-amber-600", children: "Chronic" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(r);
            setForm(r);
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Mastitis — ",
        viewRec.earTagNumber || "Unknown cow",
        " on ",
        fmt(viewRec.onsetDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.earTagNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quarters Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.quartersAffected || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Clinical Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.clinicalGrade || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pathogen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.bacterialCultureResult || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC at Onset" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewRec.sccAtOnset?.toLocaleString() ?? "—",
            " k/mL"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.treatmentProduct || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.standardWithdrawalDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide", children: "Doubled Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-blue-800", children: viewRec.doubledWithdrawalDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.withdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.certifierNotified ? "Yes" : "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.outcome || "Ongoing" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Attending Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.attendingVet || "—" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewRec);
          setForm(viewRec);
          setOpen(true);
          setViewRec(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Mastitis Record" : "Add Mastitis Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Onset Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.onsetDate || "").slice(0, 10), onChange: (e) => setF("onsetDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.earTagNumber || "", onChange: (e) => setF("earTagNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quarters Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.quartersAffected || "__none__", onValueChange: (v) => setF("quartersAffected", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LF", children: "LF" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RF", children: "RF" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LR", children: "LR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RR", children: "RR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "multiple", children: "Multiple" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clinical Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.clinicalGrade || "__none__", onValueChange: (v) => setF("clinicalGrade", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not graded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "subclinical", children: "Subclinical" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mild", children: "Mild" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "moderate", children: "Moderate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "severe", children: "Severe" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pathogen Identified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bacterialCultureResult || "", onChange: (e) => setF("bacterialCultureResult", e.target.value), placeholder: "e.g. Staph. aureus" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Onset (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtOnset || "", onChange: (e) => setF("sccAtOnset", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.treatmentProduct || "", onChange: (e) => setF("treatmentProduct", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.treatmentStartDate || "").slice(0, 10), onChange: (e) => setF("treatmentStartDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Duration (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.treatmentDurationDays || "", onChange: (e) => setF("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide", children: "⚠ Organic — Doubled Withdrawal" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardWithdrawalDays || "", onChange: (e) => {
            const v = e.target.value ? parseInt(e.target.value) : null;
            setF("standardWithdrawalDays", v);
            setF("doubledWithdrawalDays", v ? v * 2 : null);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-700", children: "Doubled Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doubledWithdrawalDays || "", onChange: (e) => setF("doubledWithdrawalDays", e.target.value ? parseInt(e.target.value) : null), className: "border-blue-300" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.withdrawalEndDate || "").slice(0, 10), onChange: (e) => setF("withdrawalEndDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome || "__none__", onValueChange: (v) => setF("outcome", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Ongoing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cured", children: "Cured" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "recovered", children: "Recovered" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dried-off", children: "Dried off early" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chronic", children: "Chronic" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "culled", children: "Culled" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attending Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.attendingVet || "", onChange: (e) => setF("attendingVet", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.labSampleTaken, onChange: (e) => setF("labSampleTaken", e.target.checked) }),
            "Lab sample taken"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.chronicCase, onChange: (e) => setF("chronicCase", e.target.checked) }),
            "Chronic case"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.culledDueToMastitis, onChange: (e) => setF("culledDueToMastitis", e.target.checked) }),
            "Culled for mastitis"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form.certifierNotified, onCheckedChange: (v) => setF("certifierNotified", !!v), id: "org-masti-cert" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "org-masti-cert", className: "cursor-pointer font-normal", children: "Certifier has been notified of this antibiotic treatment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => setF("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function OrgEaseScoreBadgeDairy({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const cls = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800", "bg-red-200 text-red-900"];
  const lbl = ["", "Unassisted", "Easy pull", "Hard pull", "Mech. assist", "C-section"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] || "bg-gray-100 text-gray-700"}`, children: [
    v,
    " — ",
    lbl[v] || "Unknown"
  ] });
}
function CalvingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = reactExports.useState(String(CURRENT_YEAR));
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/calving-records`, { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? `/api/farms/${farmId}/dairy/calving-records/${editing.id}` : `/api/farms/${farmId}/dairy/calving-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      toast({ title: editing ? "Updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/dairy/calving-records/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ calvingDate: today(), numberOfCalves: 1, colostrumFromOrganicDam: true, organicStatusConfirmed: false });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, calvingDate: r.calvingDate.slice(0, 10) });
    setOpen(true);
  }
  const allRecords = data?.records ?? [];
  const calvingRecords = yearFilter === "all" ? allRecords : allRecords.filter((r) => r.calvingDate?.startsWith(yearFilter));
  const calvingYears = [...new Set(allRecords.map((r) => r.calvingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  if (!calvingYears.includes(String(CURRENT_YEAR))) calvingYears.unshift(String(CURRENT_YEAR));
  const totalCalves = calvingRecords.reduce((s, r) => s + (r.numberOfCalves ?? 1), 0);
  const stillborns = calvingRecords.reduce((s, r) => s + (r.calfOutcome === "stillborn" ? 1 : 0) + (r.calfOutcome2 === "stillborn" ? 1 : 0), 0);
  const colostrumRisk = calvingRecords.filter((r) => r.calfOutcome !== "stillborn" && r.colostrumGivenWithin2Hours === false).length;
  const nonOrganicColostrum = calvingRecords.filter((r) => r.colostrumFromOrganicDam === false).length;
  const hasDeadCalf = (r) => r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" || r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic welfare:" }),
      " Colostrum must be given within 2 hours of birth from the dam where possible. Record whether colostrum came from an organic dam. Confirm organic status of each calf born into the herd."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Calvings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: calvingRecords.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Live Calves" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: totalCalves - stillborns })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Stillborn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${stillborns > 0 ? "text-red-700" : "text-gray-400"}`, children: stillborns })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Col. Risk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${colostrumRisk > 0 ? "text-amber-700" : "text-gray-400"}`, children: colostrumRisk })
      ] }) })
    ] }),
    colostrumRisk > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        colostrumRisk,
        " calf",
        colostrumRisk !== 1 ? "s" : "",
        " did NOT receive colostrum within 2 hours — organic welfare concern."
      ] })
    ] }),
    nonOrganicColostrum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        nonOrganicColostrum,
        " birth",
        nonOrganicColostrum !== 1 ? "s" : "",
        " used non-organic colostrum — document justification in notes."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Calving Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            calvingYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Calving"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : calvingRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "No calving records for ",
      yearFilter === "all" ? "any year" : yearFilter,
      "."
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: calvingRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: fmt(r.calvingDate) }),
          r.cowEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-gray-700", children: [
            "Dam: ",
            r.cowEarTag
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OrgEaseScoreBadgeDairy, { v: r.calvingEaseScore }),
          r.numberOfCalves && r.numberOfCalves > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-purple-100 text-purple-700", children: [
            "Twins ×",
            r.numberOfCalves
          ] }),
          r.calfOutcome && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.calfOutcome === "live" ? "bg-green-100 text-green-700" : r.calfOutcome === "stillborn" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700", children: r.calfOutcome }),
          r.calfEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-gray-500", children: [
            "Calf: ",
            r.calfEarTag
          ] }),
          r.colostrumGivenWithin2Hours === true && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700", children: "Col ≤2h ✓" }),
          r.colostrumGivenWithin2Hours === false && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700", children: "Col >2h ⚠" }),
          r.colostrumFromOrganicDam === false && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-700", children: "Non-organic col." }),
          r.organicStatusConfirmed && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-teal-100 text-teal-700", children: "Organic ✓" }),
          r.bcmsPassportApplied && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-blue-100 text-blue-700", children: "Passport ✓" }),
          hasDeadCalf(r) && !r.perinatalCollectionDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700", children: "⚠ ABP not recorded" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-400", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] })
      ] }),
      r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
    ] }) }, r.id)) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Calving — ",
        fmt(viewRecord.calvingDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dam Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRecord.cowEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "No. Calves" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.numberOfCalves ?? 1 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.calfOutcome || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.calfSex || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRecord.calfEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.calfBirthWeightKg || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OrgEaseScoreBadgeDairy, { v: viewRecord.calvingEaseScore })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No ⚠" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Col. Volume (1st feed)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumVolumeFirstFeedLitres ? `${viewRecord.colostrumVolumeFirstFeedLitres} L` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum from Organic Dam" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumFromOrganicDam === true ? "Yes" : viewRecord.colostrumFromOrganicDam === false ? "No — see notes" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Status Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.organicStatusConfirmed ? "Yes" : "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "BCMS Passport Applied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.bcmsPassportApplied ? "Yes" : "No" })
        ] }),
        hasDeadCalf(viewRecord) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABP Disposal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalCollectionDate ? `Collected ${fmt(viewRecord.perinatalCollectionDate)} · Ref: ${viewRecord.perinatalCollectionRef || "—"} · Method: ${viewRecord.perinatalDisposalMethod || "—"}` : "Not recorded ⚠" })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Calving Record" : "Add Calving Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calving Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.calvingDate || "").slice(0, 10), onChange: (e) => setF("calvingDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dam Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cowEarTag || "", onChange: (e) => setF("cowEarTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "No. Calves" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "3", value: form.numberOfCalves ?? 1, onChange: (e) => setF("numberOfCalves", parseInt(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.calvingEaseScore || ""), onValueChange: (v) => setF("calvingEaseScore", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Unassisted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Easy pull" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Hard pull" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Mech. assistance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "5", children: "5 — C-section" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 1 — Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfOutcome || "__none__", onValueChange: (v) => setF("calfOutcome", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died-within-24h", children: "Died within 24h" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 1 — Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfSex || "__none__", onValueChange: (v) => setF("calfSex", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Bull calf" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Heifer calf" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 1 — Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calfEarTag || "", onChange: (e) => setF("calfEarTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.calfBirthWeightKg || "", onChange: (e) => setF("calfBirthWeightKg", e.target.value) })
        ] }),
        (form.numberOfCalves ?? 1) > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 — Outcome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfOutcome2 || "__none__", onValueChange: (v) => setF("calfOutcome2", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died-within-24h", children: "Died within 24h" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 — Sex" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfSex2 || "__none__", onValueChange: (v) => setF("calfSex2", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Bull calf" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Heifer calf" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 — Ear Tag" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calfEarTag2 || "", onChange: (e) => setF("calfEarTag2", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-700 uppercase tracking-wide mb-1", children: "⚠ Organic Welfare — Colostrum" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum Given ≤2h *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no", onValueChange: (v) => setF("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes ✓" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No ⚠" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum ≤6h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumGivenWithin6Hours == null ? "__none__" : form.colostrumGivenWithin6Hours ? "yes" : "no", onValueChange: (v) => setF("colostrumGivenWithin6Hours", v === "__none__" ? null : v === "yes"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes ✓" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume 1st Feed (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.colostrumVolumeFirstFeedLitres || "", onChange: (e) => setF("colostrumVolumeFirstFeedLitres", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum from Organic Dam" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumFromOrganicDam == null ? "__none__" : form.colostrumFromOrganicDam ? "yes" : "no", onValueChange: (v) => setF("colostrumFromOrganicDam", v === "__none__" ? null : v === "yes"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No — note reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-green-50 border-green-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form.organicStatusConfirmed, onCheckedChange: (v) => setF("organicStatusConfirmed", !!v), id: "org-calving-status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "org-calving-status", className: "cursor-pointer font-normal text-green-800", children: "Organic status of this birth confirmed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "BCMS / Registration" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.assistanceRequired, onChange: (e) => setF("assistanceRequired", e.target.checked) }),
            "Assistance required"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.vetAttended, onChange: (e) => setF("vetAttended", e.target.checked) }),
            "Vet attended"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.bcmsPassportApplied, onChange: (e) => setF("bcmsPassportApplied", e.target.checked) }),
            "BCMS passport applied"
          ] })
        ] }),
        form.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => setF("vetName", e.target.value) })
        ] }),
        hasDeadCalf(form) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2 rounded-md border border-red-100 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-red-700 uppercase tracking-wide", children: "ABP Disposal (required for dead calves)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.perinatalCollectionDate || "").slice(0, 10), onChange: (e) => setF("perinatalCollectionDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalCollectionRef || "", onChange: (e) => setF("perinatalCollectionRef", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalMethod || "", onChange: (e) => setF("perinatalDisposalMethod", e.target.value), placeholder: "e.g. licensed knackery" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => setF("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function DctTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-dct", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/dct-records`, { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? `/api/farms/${farmId}/dairy/dct-records/${editing.id}` : `/api/farms/${farmId}/dairy/dct-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      toast({ title: editing ? "Updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/dairy/dct-records/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ dryOffDate: today(), protocol: "selective", vetAuthorisation: true, certifierNotified: false });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, dryOffDate: r.dryOffDate.slice(0, 10), expectedCalvingDate: r.expectedCalvingDate?.slice(0, 10) });
    setOpen(true);
  }
  const allRecords = data?.records ?? [];
  const [dctListYear, setDctListYear] = reactExports.useState("all");
  const dctListYears = React.useMemo(() => Array.from(new Set(allRecords.map((r) => String(r.dryOffDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allRecords]);
  const filteredList = dctListYear === "all" ? allRecords : allRecords.filter((r) => String(r.dryOffDate ?? "").startsWith(dctListYear));
  const uncertifiedCount = allRecords.filter((r) => r.antibioticTubeProduct && !r.certifierNotified).length;
  const blanketCount = allRecords.filter((r) => r.protocol === "blanket" || r.protocol === "blanket-sealant").length;
  const ORG_PROTOCOLS = [
    { value: "selective", label: "Selective DCT — therapeutic only (antibiotic where indicated)" },
    { value: "teat-sealant-only", label: "Teat Sealant Only (no antibiotic)" },
    { value: "selective-sealant", label: "Selective DCT + Teat Sealant" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic rule:" }),
      " Blanket DCT (routine antibiotic dry-off of all cows) is NOT permitted on organic farms. All antibiotic use must be therapeutic with documented justification, vet authorisation, doubled withdrawal periods, and certifier notification."
    ] }),
    blanketCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        blanketCount,
        " record",
        blanketCount !== 1 ? "s" : "",
        " recorded as Blanket DCT — this is not compliant on an organic farm."
      ] })
    ] }),
    uncertifiedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        uncertifiedCount,
        " antibiotic treatment",
        uncertifiedCount !== 1 ? "s" : "",
        " where certifier has not been notified."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Dry Cow Therapy Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dctListYear, onValueChange: setDctListYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            dctListYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add DCT Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filteredList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No DCT records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredList.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: fmt(r.dryOffDate) }),
          r.cowEarTag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-gray-700", children: r.cowEarTag }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.protocol === "blanket" || r.protocol === "blanket-sealant" ? "bg-red-100 text-red-700" : r.protocol === "teat-sealant-only" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700", children: r.protocol.replace(/-/g, " ") }),
          r.antibioticTubeProduct && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.antibioticTubeProduct }),
          r.doubledMilkWithdrawalDays != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [
            "Dbl W/D: ",
            r.doubledMilkWithdrawalDays,
            "d"
          ] }),
          r.vetAuthorisation && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700", children: "Vet auth ✓" }),
          r.certifierNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-teal-100 text-teal-700", children: "Certifier notified ✓" }),
          r.antibioticTubeProduct && !r.certifierNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-700", children: "Certifier pending ⚠" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-400", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] })
      ] }),
      r.therapeuticJustification && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
        "Justification: ",
        r.therapeuticJustification
      ] }),
      r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: r.notes })
    ] }) }, r.id)) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "DCT Record — ",
        fmt(viewRecord.dryOffDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cow Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRecord.cowEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dry-Off Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.dryOffDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Protocol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.protocol?.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Antibiotic Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.antibioticTubeProduct || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.standardMilkWithdrawalDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide", children: "Doubled Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-blue-800", children: viewRecord.doubledMilkWithdrawalDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Teat Sealant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.teatSealantProduct || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC at Dry-Off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewRecord.sccAtDryOff?.toLocaleString() ?? "—",
            " k/mL"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mastitis Eps (12m)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.mastitisEpisodes12Months ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Authorisation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetAuthorisation ? "Yes" : "No ⚠" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certifierNotified ? "Yes" : viewRecord.antibioticTubeProduct ? "Pending ⚠" : "N/A" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Calving" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.expectedCalvingDate) })
        ] }),
        viewRecord.therapeuticJustification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Therapeutic Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.therapeuticJustification })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit DCT Record" : "Add Dry Cow Therapy Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cowEarTag || "", onChange: (e) => setF("cowEarTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dry-Off Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.dryOffDate || "").slice(0, 10), onChange: (e) => setF("dryOffDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protocol *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.protocol || "selective", onValueChange: (v) => setF("protocol", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ORG_PROTOCOLS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, children: p.label }, p.value)) })
          ] })
        ] }),
        form.protocol !== "teat-sealant-only" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Antibiotic Tube" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.antibioticTubeProduct || "", onChange: (e) => setF("antibioticTubeProduct", e.target.value), placeholder: "e.g. Orbeseal, Bovaclox DC" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.antibioticTubeBatch || "", onChange: (e) => setF("antibioticTubeBatch", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide", children: "⚠ Organic — Doubled Withdrawal" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Milk W/D (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardMilkWithdrawalDays || "", onChange: (e) => {
              const v = e.target.value ? parseInt(e.target.value) : null;
              setF("standardMilkWithdrawalDays", v);
              setF("doubledMilkWithdrawalDays", v ? v * 2 : null);
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-700", children: "Doubled Milk W/D (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doubledMilkWithdrawalDays || "", onChange: (e) => setF("doubledMilkWithdrawalDays", e.target.value ? parseInt(e.target.value) : null), className: "border-blue-300" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meat W/D (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.antibioticTubeWithdrawalMeatDays || "", onChange: (e) => setF("antibioticTubeWithdrawalMeatDays", e.target.value ? parseInt(e.target.value) : null) })
          ] })
        ] }),
        form.protocol?.includes("sealant") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Teat Sealant" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.teatSealantProduct || "", onChange: (e) => setF("teatSealantProduct", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.teatSealantBatch || "", onChange: (e) => setF("teatSealantBatch", e.target.value) })
          ] })
        ] }),
        form.protocol === "teat-sealant-only" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Teat Sealant" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.teatSealantProduct || "", onChange: (e) => setF("teatSealantProduct", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.teatSealantBatch || "", onChange: (e) => setF("teatSealantBatch", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Cow Data" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Dry-Off (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtDryOff || "", onChange: (e) => setF("sccAtDryOff", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mastitis Eps (12m)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.mastitisEpisodes12Months ?? "", onChange: (e) => setF("mastitisEpisodes12Months", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Calving" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expectedCalvingDate || "").slice(0, 10), onChange: (e) => setF("expectedCalvingDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => setF("vetName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 flex flex-wrap gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.vetAuthorisation, onChange: (e) => setF("vetAuthorisation", e.target.checked) }),
          "Vet authorisation in place"
        ] }) }),
        form.protocol !== "teat-sealant-only" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form.certifierNotified, onCheckedChange: (v) => setF("certifierNotified", !!v), id: "org-dct-cert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "org-dct-cert", className: "cursor-pointer font-normal", children: "Certifier has been notified of this antibiotic treatment" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Therapeutic Justification *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.therapeuticJustification || "", onChange: (e) => setF("therapeuticJustification", e.target.value), rows: 2, placeholder: "Document why antibiotic DCT is indicated for this cow (mastitis history, SCC, clinical signs…)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => setF("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function HerdConversionTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data } = useQuery({
    queryKey: ["organic-dairy-herd-conversion", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/herd-conversion`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId
  });
  const coreHerds = herdsData?.records ?? [];
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/farms/${farmId}/organic-dairy/herd-conversion/${editing.id}` : `/api/farms/${farmId}/organic-dairy/herd-conversion`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (form.herdId) {
        await fetch(`/api/farms/${farmId}/herds/${form.herdId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isOrganicHerd: true,
            organicCertBody: form.certifier ?? void 0,
            organicCertNumber: form.certificationRef ?? void 0,
            organicConversionStartDate: form.conversionStartDate ? new Date(form.conversionStartDate).toISOString() : void 0
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-herd-conversion", farmId] });
      qc.invalidateQueries({ queryKey: ["herds", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added — herd marked as organic in the Livestock Register" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-dairy/herd-conversion/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-herd-conversion", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ status: "in-conversion", parallelProduction: false, herdId: null });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, herdId: r.herdId ?? null });
    setOpen(true);
  }
  function onHerdSelect(herdId) {
    const herd = coreHerds.find((h) => String(h.id) === herdId);
    if (herd) {
      setForm((p) => ({ ...p, herdId: herd.id, herdName: herd.name }));
    } else {
      setForm((p) => ({ ...p, herdId: null }));
    }
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    coreHerds.filter((h) => h.isOrganicHerd).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
        "🌿 ",
        coreHerds.filter((h) => h.isOrganicHerd).length,
        " herd",
        coreHerds.filter((h) => h.isOrganicHerd).length !== 1 ? "s" : "",
        " in your Livestock Register marked as organic:"
      ] }),
      coreHerds.filter((h) => h.isOrganicHerd).map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-2 py-0.5 text-xs font-medium", children: h.name }, h.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printHerdConversionRegister(records, farmName), disabled: records.length === 0, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
        "Print Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Herd"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Herd Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Breed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cows" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Conversion Start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Expected Milk Cert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: "No herd conversion records yet. Link a herd from your Livestock Register to get started." }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            r.herdName,
            r.herdId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs text-green-600 font-medium", children: "● Linked" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.breed ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.numberOfCows ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.conversionStartDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.expectedMilkCertDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: conversionStatusBadge(r.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.certifier ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Herd Conversion — ",
        viewRecord.herdName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.herdName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.breed) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Cows" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.numberOfCows) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.status.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Conversion Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.conversionStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.expectedMilkCertDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actual Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.actualMilkCertDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifier) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certification Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certificationRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Parallel Production" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.parallelProduction ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-dairy-herd-conversion", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Herd Conversion Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Track the organic conversion status of a dairy herd." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Livestock Register Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.herdId ? String(form.herdId) : "__none__",
              onValueChange: (v) => onHerdSelect(v === "__none__" ? "" : v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select registered herd…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Enter manually —" }),
                  coreHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                    h.name,
                    " (",
                    h.type,
                    ")",
                    h.isOrganicHerd ? " 🌿" : ""
                  ] }, h.id))
                ] })
              ]
            }
          ),
          form.herdId ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "✓ Saving will mark this herd as organic in the Livestock Register." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Linking to a registered herd flags it as organic across all modules." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdName ?? "", onChange: f("herdName"), placeholder: "e.g. Main Dairy Herd" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.breed ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, breed: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select breed…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DAIRY_BREEDS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Cows" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfCows ?? "", onChange: f("numberOfCows") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.conversionStartDate ?? "", onChange: f("conversionStartDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "in-conversion", onValueChange: (v) => setForm((p) => ({ ...p, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in-conversion", children: "In Conversion" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "certified", children: "Certified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedMilkCertDate ?? "", onChange: f("expectedMilkCertDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actual Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.actualMilkCertDate ?? "", onChange: f("actualMilkCertDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificationRef ?? "", onChange: f("certificationRef") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: form.parallelProduction ?? false,
              onCheckedChange: (v) => setForm((p) => ({ ...p, parallelProduction: !!v })),
              id: "parallel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "parallel", children: "Parallel Production" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function CollectionSccBadge({ v }) {
  if (v == null) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: "—" });
  const ok = v < 200;
  const warn = v >= 200 && v < 400;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: [
    v.toLocaleString(),
    " k/mL"
  ] });
}
function CollectionMonthlySummary({ records, monthLabel, farmName }) {
  const printRef = reactExports.useRef(null);
  const totalVol = records.reduce((s, r) => s + (parseFloat(r.volumeLitres || "0") || 0), 0);
  const collectionCount = records.length;
  const fatReadings = records.map((r) => r.fatPercentage ? parseFloat(r.fatPercentage) : null).filter((v) => v != null && !isNaN(v));
  const avgFat = fatReadings.length > 0 ? fatReadings.reduce((a, b) => a + b, 0) / fatReadings.length : null;
  const proteinReadings = records.map((r) => r.proteinPercentage ? parseFloat(r.proteinPercentage) : null).filter((v) => v != null && !isNaN(v));
  const avgProtein = proteinReadings.length > 0 ? proteinReadings.reduce((a, b) => a + b, 0) / proteinReadings.length : null;
  const sccReadings = records.map((r) => r.sccCount).filter((v) => v != null);
  const avgScc = sccReadings.length > 0 ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;
  const totalNetValuePence = records.filter((r) => r.netValuePence != null).reduce((s, r) => s + (r.netValuePence ?? 0), 0);
  const hasNetValue = records.some((r) => r.netValuePence != null);
  const nonOrganicCount = records.filter((r) => !r.isOrganicCollection).length;
  const byDay = /* @__PURE__ */ new Map();
  for (const r of records) {
    const day = r.collectionDate?.slice(0, 10);
    if (!day) continue;
    const vol = parseFloat(r.volumeLitres || "0") || 0;
    const scc = r.sccCount;
    const ex = byDay.get(day) ?? { vol: 0, sccSum: 0, sccCount: 0 };
    byDay.set(day, {
      vol: ex.vol + vol,
      sccSum: scc != null ? ex.sccSum + scc : ex.sccSum,
      sccCount: scc != null ? ex.sccCount + 1 : ex.sccCount
    });
  }
  const chartData = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({
    day: parseInt(date.slice(8, 10)),
    date,
    vol: Math.round(v.vol * 10) / 10,
    scc: v.sccCount > 0 ? Math.round(v.sccSum / v.sccCount) : null
  }));
  const hasScc = chartData.some((d) => d.scc != null);
  function handlePrint() {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Organic Milk Collections — ${monthLabel} — ${farmName}</title>
      <style>
        body{font-family:sans-serif;font-size:13px;color:#111;padding:24px}
        h2{margin:0 0 4px;font-size:18px} .sub{color:#6b7280;font-size:12px;margin-bottom:16px}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .stat{border:1px solid #e5e7eb;border-radius:6px;padding:10px}
        .stat-label{font-size:11px;color:#6b7280;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em}
        .stat-value{font-size:20px;font-weight:600}
        .stat-sub{font-size:11px;color:#9ca3af;margin-top:2px}
        .badge-green{background:#dcfce7;color:#166534;padding:2px 8px;border-radius:9999px;font-size:11px}
        .badge-amber{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:9999px;font-size:11px}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;padding:6px 8px;border-bottom:2px solid #e5e7eb}
        td{padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px}
      </style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }, 400);
  }
  const sccColour = (v) => v == null ? "text-gray-400" : v > 400 ? "text-red-700" : v > 200 ? "text-amber-700" : "text-green-700";
  const sccBg = (v) => v == null ? "bg-gray-50 border-gray-200" : v > 400 ? "bg-red-50 border-red-200" : v > 200 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-md border border-gray-200 bg-white shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-4 w-4 text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-800", children: [
          "Monthly Summary — ",
          monthLabel
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
        "Print Report"
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-8", children: "No records for this month to summarise." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: printRef, style: { display: "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
          "Organic Milk Collections — ",
          monthLabel
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sub", children: [
          farmName,
          " · ",
          collectionCount,
          " collection",
          collectionCount !== 1 ? "s" : "",
          " · Printed ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Volume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              totalVol.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
              " L"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sub", children: [
              collectionCount,
              " collections"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Avg SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: avgScc != null ? avgScc.toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-sub", children: avgScc == null ? "" : avgScc <= 200 ? "Within threshold" : avgScc <= 400 ? "Above 200k — monitor" : "High — action needed" })
          ] }),
          (avgFat != null || avgProtein != null) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Avg Fat / Protein" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: avgFat != null ? avgFat.toFixed(2) + "%" : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-sub", children: avgProtein != null ? "Protein: " + avgProtein.toFixed(2) + "%" : "" })
          ] }),
          hasNetValue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Net Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              "£",
              (totalNetValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ] })
          ] }),
          nonOrganicCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Non-organic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: nonOrganicCount }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-sub", children: [
              "of ",
              collectionCount,
              " collections"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Collector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Volume (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Fat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Protein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "TBC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Organic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Collection Docket" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Net Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [...records].sort((a, b) => (a.collectionDate ?? "").localeCompare(b.collectionDate ?? "")).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: new Date(r.collectionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.collectorName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.volumeLitres ? parseFloat(r.volumeLitres).toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.fatPercentage ? r.fatPercentage + "%" : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.proteinPercentage ? r.proteinPercentage + "%" : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.sccCount != null ? r.sccCount + "k" : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.tbcCount != null ? r.tbcCount + "k" : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: r.isOrganicCollection ? "badge-green" : "badge-amber", children: r.isOrganicCollection ? "Organic" : `Non-organic${r.nonOrganicReason ? " — " + r.nonOrganicReason : ""}` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.collectionSlipRef ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.netValuePence != null ? "£" + (r.netValuePence / 100).toFixed(2) : "—" })
          ] }, r.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mb-0.5", children: "Total Volume" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-blue-800", children: [
            totalVol.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-400", children: [
            collectionCount,
            " collection",
            collectionCount !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border px-3 py-2.5 ${sccBg(avgScc)}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mb-0.5 ${avgScc == null ? "text-gray-500" : avgScc > 400 ? "text-red-600" : avgScc > 200 ? "text-amber-600" : "text-green-600"}`, children: "Avg SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${sccColour(avgScc)}`, children: avgScc != null ? avgScc.toLocaleString() : "—" }),
          avgScc != null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs ${sccColour(avgScc)}`, children: avgScc <= 200 ? "Within threshold" : avgScc <= 400 ? "Above 200k — monitor" : "High — action needed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-green-50 border border-green-100 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 mb-0.5", children: "Avg Fat / Protein" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-800", children: avgFat != null ? avgFat.toFixed(2) + "%" : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-500", children: avgProtein != null ? "Protein: " + avgProtein.toFixed(2) + "%" : "No protein data" })
        ] }),
        nonOrganicCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mb-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
            "Non-organic"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-amber-700", children: nonOrganicCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600", children: [
            "of ",
            collectionCount,
            " collections"
          ] })
        ] }) : hasNetValue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-emerald-600 mb-0.5", children: "Total Net Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-emerald-800", children: [
            "£",
            (totalNetValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-gray-50 border border-gray-200 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Collections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: collectionCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "this month" })
        ] })
      ] }),
      nonOrganicCount > 0 && hasNetValue && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-emerald-600 mb-0.5", children: "Total Net Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-emerald-800", children: [
          "£",
          (totalNetValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ] })
      ] }) }),
      chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide", children: [
          "Daily Volume",
          hasScc ? " & SCC Trend" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: hasScc ? 52 : 12, bottom: 0, left: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tick: { fontSize: 11, fill: "#9ca3af" }, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "vol", tick: { fontSize: 11, fill: "#9ca3af" }, tickLine: false, axisLine: false, width: 50, tickFormatter: (v) => `${v}L` }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "scc", orientation: "right", tick: { fontSize: 11, fill: "#fb923c" }, tickLine: false, axisLine: false, width: 44, tickFormatter: (v) => `${v}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              content: ({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-md shadow px-3 py-2 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700 mb-1", children: (/* @__PURE__ */ new Date(d.date + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) }),
                  d.vol > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-600", children: [
                    "Volume: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      d.vol.toLocaleString(),
                      " L"
                    ] })
                  ] }),
                  d.scc != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-orange-500", children: [
                    "SCC: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      d.scc.toLocaleString(),
                      " k/mL"
                    ] })
                  ] })
                ] });
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "vol", dataKey: "vol", fill: "#3b82f6", fillOpacity: 0.8, radius: [3, 3, 0, 0], name: "Volume (L)", maxBarSize: 32 }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "scc", type: "monotone", dataKey: "scc", stroke: "#f97316", strokeWidth: 2.5, dot: { r: 3.5, fill: "#f97316", strokeWidth: 0 }, connectNulls: true, name: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { yAxisId: "scc", y: 200, stroke: "#f97316", strokeDasharray: "5 3", strokeOpacity: 0.45, label: { value: "200k", position: "right", fontSize: 10, fill: "#f97316" } })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-blue-500 opacity-80" }),
            "Volume (L)"
          ] }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-4 border-t-2 border-orange-400" }),
            "SCC (k/mL) — dashed line = 200k threshold"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function OrganicAbrBadge({ result }) {
  if (!result || result === "not-tested") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" });
  const map = {
    negative: "bg-green-100 text-green-800",
    positive: "bg-red-100 text-red-800",
    borderline: "bg-amber-100 text-amber-800",
    invalid: "bg-gray-100 text-gray-600"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${map[result] ?? "bg-gray-100 text-gray-600"}`, children: result });
}
function OrganicLabResultsBadge({ status }) {
  if (!status) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" });
  const map = {
    pass: "bg-green-100 text-green-800",
    fail: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${map[status] ?? "bg-gray-100 text-gray-600"}`, children: status });
}
function MilkCollectionsTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useSafeUser();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [formTab, setFormTab] = reactExports.useState("collection");
  const now = /* @__PURE__ */ new Date();
  const [filterYear, setFilterYear] = reactExports.useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = reactExports.useState(now.getMonth());
  function stepMonth(dir) {
    setFilterMonth((m) => {
      const next = m + dir;
      if (next < 0) {
        setFilterYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setFilterYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  }
  const monthLabel = new Date(filterYear, filterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const { data } = useQuery({
    queryKey: ["organic-dairy-collections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/collections`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = data?.records ?? [];
  const filteredRecords = records.filter((r) => {
    if (!r.collectionDate) return false;
    const d = new Date(r.collectionDate);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });
  const { data: supplierData } = useQuery({
    queryKey: ["farm-suppliers-for-collection", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.ok ? r.json() : { records: [] }),
    enabled: !!farmId
  });
  const suppliers = supplierData?.records ?? [];
  const { data: membersData } = useQuery({
    queryKey: ["farm-members-for-collection", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    enabled: !!farmId
  });
  const members = membersData?.members ?? [];
  const staffNames = members.map((m) => `${m.firstName} ${m.lastName}`.trim()).filter(Boolean);
  const [abrKitStockId, setAbrKitStockId] = reactExports.useState("");
  const abrStockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/abr-test-kit-stock`).then((r) => r.json()),
    enabled: !!farmId
  });
  const abrStock = abrStockQ.data?.stock ?? [];
  const save = useMutation({
    mutationFn: () => {
      const url = editing ? `/api/farms/${farmId}/organic-dairy/collections/${editing.id}` : `/api/farms/${farmId}/organic-dairy/collections`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, abrKitStockId: abrKitStockId || void 0 }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setAbrKitStockId("");
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-dairy/collections/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setAbrKitStockId("");
    setForm({
      isOrganicCollection: true,
      collectionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      recordedByUserId: user?.id ?? null,
      recordedByUserName: user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.primaryEmailAddress?.emailAddress || null : null
    });
    setFormTab("collection");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setAbrKitStockId("");
    setFormTab("collection");
    setOpen(true);
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  function formatPence(pence) {
    if (pence == null) return "—";
    return `£${(pence / 100).toFixed(2)}`;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printMilkCollectionLog(records, farmName), disabled: records.length === 0, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
        "Print All Records"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Collection"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => stepMonth(-1), className: "p-1 rounded hover:bg-gray-200 transition-colors", "aria-label": "Previous month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 text-gray-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: monthLabel }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => stepMonth(1), className: "p-1 rounded hover:bg-gray-200 transition-colors", "aria-label": "Next month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-600" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionMonthlySummary, { records: filteredRecords, monthLabel, farmName }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Collector" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Volume (L)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fat %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Protein %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "SCC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "ABR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Lab" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Net Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-32" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        filteredRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 11, className: "text-center text-muted-foreground py-8", children: records.length > 0 ? `No collections for ${monthLabel} — use the arrows to browse other months.` : "No milk collection records yet — click Add Collection to begin." }) }),
        filteredRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: !r.isOrganicCollection ? "bg-amber-50/40" : void 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.collectionDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.collectorName ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.volumeLitres ? `${parseFloat(r.volumeLitres).toLocaleString()} L` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.fatPercentage ? `${r.fatPercentage}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.proteinPercentage ? `${r.proteinPercentage}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionSccBadge, { v: r.sccCount }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganicAbrBadge, { result: r.antibioticResidueTestResult }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganicLabResultsBadge, { status: r.buyerLabResultsStatus }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.isOrganicCollection ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-100", children: r.isOrganicCollection ? "Organic" : "Non-organic" }),
            !r.isOrganicCollection && r.nonOrganicReason && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-700 truncate max-w-[110px]", title: r.nonOrganicReason, children: r.nonOrganicReason })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatPence(r.netValuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) }),
            (r.sccCount != null && r.sccCount > 200 || !r.isOrganicCollection) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-purple-600", title: "Raise Task — quality alert", onClick: () => setRaiseTaskFor(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Milk Collection — ",
        fmt(viewRecord.collectionDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.collectionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Volume (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.volumeLitres) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collector" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.collectorName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vehicle Registration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.vehicleRegistration) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Fat %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fatPercentage ? `${viewRecord.fatPercentage}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Protein %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.proteinPercentage ? `${viewRecord.proteinPercentage}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionSccBadge, { v: viewRecord.sccCount }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "TBC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.tbcCount ? `${viewRecord.tbcCount}k` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk Temperature" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.milkTemperatureCelsius ? `${viewRecord.milkTemperatureCelsius} °C` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganicAbrBadge, { result: viewRecord.antibioticResidueTestResult }) })
        ] }),
        viewRecord.abrTestedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Tested By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.abrTestedBy })
        ] }),
        viewRecord.lactosePercentage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lactose %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewRecord.lactosePercentage,
            "%"
          ] })
        ] }),
        viewRecord.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Retest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-amber-700", children: [
            "Follow-up retest",
            viewRecord.retestOfId ? ` of record #${viewRecord.retestOfId}` : ""
          ] })
        ] }),
        viewRecord.buyerLabResultsStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: [
            "Buyer Lab Results — ",
            viewRecord.buyerLabResultsStatus
          ] }) }),
          viewRecord.buyerLabResultsDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Results Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLabResultsDate })
          ] }),
          viewRecord.buyerLabRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLabRef })
          ] }),
          viewRecord.buyerSccCount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer SCC" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              viewRecord.buyerSccCount.toLocaleString(),
              " k/mL"
            ] })
          ] }),
          viewRecord.buyerFatPercentage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer Fat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              viewRecord.buyerFatPercentage,
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Certified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isOrganicCollection ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "Yes — sold as organic" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-700", children: "No — sold as conventional" }) })
        ] }),
        !viewRecord.isOrganicCollection && viewRecord.nonOrganicReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reason (non-organic)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-800", children: viewRecord.nonOrganicReason })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Processor Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.processorRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collection Docket / Receipt Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.collectionSlipRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Deductions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.deductionsPence != null ? `${viewRecord.deductionsPence}p` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatPence(viewRecord.netValuePence) })
        ] }),
        viewRecord.witnessedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Witnessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.witnessedBy })
        ] }),
        viewRecord.recordedByUserName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Recorded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.recordedByUserName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Attachments — documents & buyer lab report" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-dairy-collection", recordId: viewRecord.id })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Milk Collection"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record each milk collection with quality metrics and organic certification status." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: formTab, onValueChange: setFormTab, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "collection", children: "Collection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "quality", children: "Quality & ABR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "buyer", children: "Buyer Lab" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "collection", className: "space-y-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.collectionDate ?? "", onChange: f("collectionDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume (litres) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.volumeLitres ?? "", onChange: f("volumeLitres") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collector (Milk Buyer)" }),
            suppliers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.collectorSupplierId ? String(form.collectorSupplierId) : "__other__",
                onValueChange: (v) => {
                  if (v === "__other__") {
                    setForm((p) => ({ ...p, collectorSupplierId: null }));
                  } else {
                    const sup = suppliers.find((s) => s.id === Number(v));
                    setForm((p) => ({ ...p, collectorSupplierId: Number(v), collectorName: sup?.name ?? p.collectorName ?? null }));
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose from suppliers register…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other — enter name below" })
                  ] })
                ]
              }
            ),
            !form.collectorSupplierId && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.collectorName ?? "", onChange: f("collectorName"), placeholder: "e.g. Arla UK Ltd", className: suppliers.length > 0 ? "mt-1" : "" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vehicleRegistration ?? "", onChange: f("vehicleRegistration"), placeholder: "e.g. AB12 CDE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Processor Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.processorRef ?? "", onChange: f("processorRef") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Docket / Receipt Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.collectionSlipRef ?? "", onChange: f("collectionSlipRef"), placeholder: "Docket number from tanker driver" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deductions (pence)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.deductionsPence ?? "", onChange: (e) => setForm((p) => ({ ...p, deductionsPence: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Value (pence)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.netValuePence ?? "", onChange: (e) => setForm((p) => ({ ...p, netValuePence: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: form.isOrganicCollection ?? true,
                onCheckedChange: (v) => setForm((p) => ({ ...p, isOrganicCollection: !!v, nonOrganicReason: !!v ? null : p.nonOrganicReason })),
                id: "organic-cert"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "organic-cert", className: "cursor-pointer font-normal", children: "This collection is certified as Organic" })
          ] }),
          !form.isOrganicCollection && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-amber-700", children: "Reason — non-organic collection *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nonOrganicReason ?? "", onChange: f("nonOrganicReason"), placeholder: "e.g. Antibiotic withdrawal period, conversion milk…", className: "border-amber-300 focus-visible:ring-amber-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "Required. This milk will be sold as conventional. Notify your certifier if this occurs regularly." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Witnessed By (farm staff present at collection)" }),
            members.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.witnessedBy ?? "__none__", onValueChange: (v) => setForm((p) => ({ ...p, witnessedBy: v === "__none__" ? null : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
                members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: `${m.firstName} ${m.lastName}`, children: [
                  m.firstName,
                  " ",
                  m.lastName
                ] }, m.id))
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.witnessedBy ?? "", onChange: f("witnessedBy"), placeholder: "Name of farm staff present" })
          ] }),
          form.recordedByUserName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs uppercase tracking-wide", children: "Recorded By (system user)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.recordedByUserName, readOnly: true, className: "bg-muted/40 text-muted-foreground cursor-default" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 3 })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "quality", className: "space-y-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.milkTemperatureCelsius ?? "", onChange: f("milkTemperatureCelsius"), placeholder: "e.g. 4.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Target: ≤6°C at point of collection" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temp Tested By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "dairy-staff-list-org", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "dairy-staff-list-org", placeholder: "Name of tester", value: form.tempTestedBy ?? "", onChange: f("tempTestedBy") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.antibioticResidueTestResult ?? "__none__", onValueChange: (v) => setForm((p) => ({ ...p, antibioticResidueTestResult: v === "__none__" ? null : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select result…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not tested —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive ⚠" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borderline", children: "Borderline — repeat required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invalid", children: "Invalid — repeat required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "not-tested", children: "Not tested" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Tested By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "dairy-staff-list-org", placeholder: "Name of tester", value: form.abrTestedBy ?? "", onChange: f("abrTestedBy") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Stock Record" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: abrKitStockId, onValueChange: setAbrKitStockId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link kit (auto-decrements stock)" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / not tracking" }),
                abrStock.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                  s.productName,
                  s.lotNumber ? ` · Lot ${s.lotNumber}` : "",
                  " (",
                  s.quantityRemaining,
                  " remaining)"
                ] }, s.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Kit Lot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abrTestKitLot ?? "", onChange: f("abrTestKitLot"), placeholder: "Lot number" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Kit Batch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abrTestKitBatch ?? "", onChange: f("abrTestKitBatch"), placeholder: "Batch / expiry" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isRetest ?? false, onCheckedChange: (v) => setForm((p) => ({ ...p, isRetest: !!v })), id: "is-retest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is-retest", className: "cursor-pointer font-normal", children: "This is a follow-up retest of a previous non-negative result" })
          ] }),
          form.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Retest of (original record)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.retestOfId ? String(form.retestOfId) : "__none__", onValueChange: (v) => setForm((p) => ({ ...p, retestOfId: v === "__none__" ? null : Number(v) })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select original record…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None selected —" }),
                records.filter((r) => r.id !== editing?.id && (r.antibioticResidueTestResult === "positive" || r.antibioticResidueTestResult === "borderline" || r.antibioticResidueTestResult === "invalid")).slice(0, 40).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                  fmt(r.collectionDate),
                  " — ABR ",
                  r.antibioticResidueTestResult
                ] }, r.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: form.sccCount ?? "", onChange: (e) => setForm((p) => ({ ...p, sccCount: e.target.value ? Number(e.target.value) : null })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "UK limit: 200k (organic)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TBC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: form.tbcCount ?? "", onChange: (e) => setForm((p) => ({ ...p, tbcCount: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.fatPercentage ?? "", onChange: f("fatPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.proteinPercentage ?? "", onChange: f("proteinPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lactose %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.lactosePercentage ?? "", onChange: f("lactosePercentage") })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "buyer", className: "space-y-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 rounded-md border border-blue-100 bg-blue-50 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-800", children: "Buyer lab results are the processor's independent measurements. Enter them when you receive the results report from your milk buyer." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lab Results Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.buyerLabResultsStatus ?? "__none__", onValueChange: (v) => setForm((p) => ({ ...p, buyerLabResultsStatus: v === "__none__" ? null : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not received —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Results Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.buyerLabResultsDate ?? "").slice(0, 10), onChange: f("buyerLabResultsDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buyerLabRef ?? "", onChange: f("buyerLabRef"), placeholder: "Buyer's lab report reference" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerSccCount ?? "", onChange: (e) => setForm((p) => ({ ...p, buyerSccCount: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer TBC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerTbcCount ?? "", onChange: (e) => setForm((p) => ({ ...p, buyerTbcCount: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Fat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerFatPercentage ?? "", onChange: f("buyerFatPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Protein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerProteinPercentage ?? "", onChange: f("buyerProteinPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lactose %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerLactosePercentage ?? "", onChange: f("buyerLactosePercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Casein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerCaseinPercent ?? "", onChange: f("buyerCaseinPercent") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bactoscan (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerBactoscanThousands ?? "", onChange: (e) => setForm((p) => ({ ...p, buyerBactoscanThousands: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TVC (cfu/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerTvcCfuMl ?? "", onChange: (e) => setForm((p) => ({ ...p, buyerTvcCfuMl: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thermodurics (cfu/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerThermsCfuMl ?? "", onChange: (e) => setForm((p) => ({ ...p, buyerThermsCfuMl: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Coliforms (cfu/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerColiformsCfuMl ?? "", onChange: (e) => setForm((p) => ({ ...p, buyerColiformsCfuMl: e.target.value ? Number(e.target.value) : null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Urea (mmol/L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.buyerUreaMillimolesPerLitre ?? "", onChange: f("buyerUreaMillimolesPerLitre") })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              if (!form.isOrganicCollection && !form.nonOrganicReason?.trim()) {
                toast({ title: "Reason required", description: "Please explain why this collection is non-organic before saving.", variant: "destructive" });
                return;
              }
              save.mutate();
            },
            disabled: save.isPending,
            children: save.isPending ? "Saving…" : "Save"
          }
        )
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Milk Quality Alert — ${!raiseTaskFor.isOrganicCollection ? "Non-organic Collection" : "High SCC"}`,
        defaultDescription: `Date: ${raiseTaskFor.collectionDate} · Volume: ${raiseTaskFor.volumeLitres}L · SCC: ${raiseTaskFor.sccCount != null ? raiseTaskFor.sccCount + "k/mL" : "—"} · Organic: ${raiseTaskFor.isOrganicCollection ? "Yes" : "No"}${!raiseTaskFor.isOrganicCollection && raiseTaskFor.nonOrganicReason ? " — " + raiseTaskFor.nonOrganicReason : ""}`,
        module: "organic-dairy"
      }
    )
  ] });
}
function FeedNutritionTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [supplierId, setSupplierId] = reactExports.useState("");
  const [derogCaseId, setDerogCaseId] = reactExports.useState("");
  const { data: derogCasesData } = useQuery({
    queryKey: ["feed-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const derogCases = (derogCasesData?.cases ?? []).filter((c) => c.status === "approved");
  const { data } = useQuery({
    queryKey: ["organic-dairy-feed", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/feed`).then((r) => r.json()),
    enabled: !!farmId
  });
  const allFeedRecords = data?.records ?? [];
  const [yearFilterFeed, setYearFilterFeed] = reactExports.useState("all");
  const yearsFeed = reactExports.useMemo(() => {
    const s = new Set(allFeedRecords.map((r) => String(r.recordDate ?? "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allFeedRecords]);
  const records = yearFilterFeed === "all" ? allFeedRecords : allFeedRecords.filter((r) => String(r.recordDate ?? "").startsWith(yearFilterFeed));
  const { data: suppData } = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()),
    enabled: !!farmId
  });
  const suppliers = suppData?.suppliers ?? [];
  const save = useMutation({
    mutationFn: () => {
      const url = editing ? `/api/farms/${farmId}/organic-dairy/feed/${editing.id}` : `/api/farms/${farmId}/organic-dairy/feed`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-dairy/feed/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-feed", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ isOrganicApproved: true, recordDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setSupplierId("");
    setDerogCaseId("");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    const matched = suppliers.find((s) => s.name === r.supplier);
    setSupplierId(matched ? String(matched.id) : "");
    setDerogCaseId("");
    setOpen(true);
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterFeed, onValueChange: setYearFilterFeed, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsFeed.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printFeedNutritionLog(allFeedRecords, farmName), disabled: allFeedRecords.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Feed Log"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Feed Record"
      ] })
    ] }),
    records.length > 0 && (() => {
      const totalQty = records.reduce((s, r) => s + (r.quantityKg ? parseFloat(String(r.quantityKg)) : 0), 0);
      const totalDm = records.reduce((s, r) => s + (r.dryMatterKg ? parseFloat(String(r.dryMatterKg)) : 0), 0);
      const organicPcts = records.filter((r) => r.organicPercentage != null).map((r) => parseFloat(String(r.organicPercentage)));
      const avgOrganic = organicPcts.length > 0 ? organicPcts.reduce((s, v) => s + v, 0) / organicPcts.length : null;
      const approvedCount = records.filter((r) => r.isOrganicApproved).length;
      const hasQty = records.some((r) => r.quantityKg);
      const hasDm = records.some((r) => r.dryMatterKg);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap mb-3", children: [
        { label: "Feed Records", value: String(records.length), color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
        ...hasQty ? [{ label: "Total Qty", value: `${totalQty.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg`, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }] : [],
        ...hasDm ? [{ label: "Total DM", value: `${totalDm.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg`, color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" }] : [],
        ...avgOrganic !== null ? [{ label: "Avg Organic", value: `${avgOrganic.toFixed(0)}%`, color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0" }] : [],
        { label: "Approved", value: `${approvedCount}/${records.length}`, color: approvedCount === records.length ? "#15803d" : "#b45309", bg: approvedCount === records.length ? "#f0fdf4" : "#fffbeb", border: approvedCount === records.length ? "#bbf7d0" : "#fde68a" }
      ].map(({ label, value, color, bg, border }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 14px", minWidth: 100 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", margin: "0 0 2px" }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.15rem", fontWeight: 800, color, margin: 0, lineHeight: 1.1 }, children: value })
      ] }, label)) });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Feed Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Qty (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "DM (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Approved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Doc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 9, className: "text-center text-muted-foreground py-8", children: [
          "No feed records",
          yearFilterFeed !== "all" ? ` for ${yearFilterFeed}` : "",
          " yet"
        ] }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.recordDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.feedProductName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.feedType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.quantityKg ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.dryMatterKg ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.organicPercentage ? `${r.organicPercentage}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.isOrganicApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", children: r.isOrganicApproved ? "Yes" : "No" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "organic-dairy/feed", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["organic-dairy-feed", farmId], compact: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Feed Record — ",
        viewRecord.feedProductName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.recordDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.feedType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.feedProductName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.supplier) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier Approval No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.supplierApprovalNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.quantityKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dry Matter (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.dryMatterKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.organicPercentage ? `${viewRecord.organicPercentage}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isOrganicApproved ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.poReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "GRN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.grnReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifierApprovalRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Derogation Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.derogationReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-dairy-feed", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Feed Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log organic feed given to the dairy herd." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.recordDate ?? "", onChange: f("recordDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.feedType ?? "", onValueChange: (v) => setForm((p) => ({ ...p, feedType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select feed type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEED_TYPES.map(([val, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: val, children: label }, val)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.feedProductName ?? "", onChange: f("feedProductName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: supplierId || "__text__",
              onValueChange: (v) => {
                if (v === "__text__") {
                  setSupplierId("");
                  setForm((p) => ({ ...p, supplier: "" }));
                } else {
                  setSupplierId(v);
                  setForm((p) => ({ ...p, supplier: suppliers.find((s) => String(s.id) === v)?.name ?? "" }));
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from supplier register…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type supplier name manually —" }),
                  suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
                ] })
              ]
            }
          ),
          !supplierId && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: form.supplier ?? "", onChange: f("supplier"), placeholder: "Supplier name (if not in register)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Approval No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierApprovalNumber ?? "", onChange: f("supplierApprovalNumber") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.quantityKg ?? "", onChange: f("quantityKg") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dry Matter (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.dryMatterKg ?? "", onChange: f("dryMatterKg") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", max: "100", value: form.organicPercentage ?? "", onChange: f("organicPercentage") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.poReference ?? "", onChange: f("poReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.grnReference ?? "", onChange: f("grnReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: form.isOrganicApproved ?? true,
              onCheckedChange: (v) => setForm((p) => ({ ...p, isOrganicApproved: !!v })),
              id: "organic-approved"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "organic-approved", children: "Organic Approved" })
        ] }),
        !form.isOrganicApproved && derogCases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Approved Feed Derogation Case (Article 22)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
              value: derogCaseId,
              onChange: (e) => {
                const cid = e.target.value;
                setDerogCaseId(cid);
                if (cid) {
                  const c = derogCases.find((dc) => String(dc.id) === cid);
                  if (c) setForm((p) => ({ ...p, certifierApprovalRef: c.certifierRef ?? p.certifierApprovalRef ?? "", derogationReference: c.certifierRef ?? p.derogationReference ?? "" }));
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select an approved case to auto-fill references —" }),
                derogCases.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(c.id), children: [
                  c.ingredientName,
                  c.species ? ` (${c.species})` : "",
                  " — Ref: ",
                  c.certifierRef ?? "no ref",
                  c.expiryDate ? ` · expires ${new Date(c.expiryDate).toLocaleDateString("en-GB")}` : ""
                ] }, c.id))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Selecting an approved derogation case auto-fills the references below." })
        ] }),
        !form.isOrganicApproved && derogCases.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800", children: "No approved feed derogation cases found for this farm. Create and approve a case in Organic Livestock → Feed Derogations before linking it here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierApprovalRef ?? "", onChange: f("certifierApprovalRef") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Derogation Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.derogationReference ?? "", onChange: f("derogationReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function TreatmentsTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [raiseTaskMilkRecord, setRaiseTaskMilkRecord] = reactExports.useState(null);
  const [raiseTaskMeatRecord, setRaiseTaskMeatRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const [animalSearch, setAnimalSearch] = reactExports.useState("");
  const { data: herdsData2 } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId
  });
  const herds = herdsData2?.records ?? [];
  const { data: animalsData, isLoading: animalsLoading } = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3,
    enabled: !!farmId
  });
  const allTreatAnimals = animalsData?.animals ?? [];
  const { data } = useQuery({
    queryKey: ["organic-dairy-treatments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/treatments`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: medData } = useQuery({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then((r) => r.json()),
    enabled: !!farmId
  });
  const medicineOrganicRecords = (medData?.records ?? []).filter((r) => r.isOrganicTreatment);
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: () => {
      const stdMilk = form.standardMilkWithdrawalDays ? Number(form.standardMilkWithdrawalDays) : null;
      const stdMeat = form.standardMeatWithdrawalDays ? Number(form.standardMeatWithdrawalDays) : null;
      const dblMilk = stdMilk != null ? stdMilk * 2 : null;
      const dblMeat = stdMeat != null ? stdMeat * 2 : null;
      function addDays(d, days) {
        if (!d || days == null) return null;
        const dt = new Date(d);
        dt.setDate(dt.getDate() + days);
        return dt.toISOString().slice(0, 10);
      }
      const body = {
        ...form,
        doubledMilkWithdrawalDays: dblMilk,
        doubledMeatWithdrawalDays: dblMeat,
        milkWithdrawalEndDate: addDays(form.treatmentDate, dblMilk),
        meatWithdrawalEndDate: addDays(form.treatmentDate, dblMeat),
        treatmentNumber: form.treatmentNumber ?? 1
      };
      const url = editing ? `/api/farms/${farmId}/organic-dairy/treatments/${editing.id}` : `/api/farms/${farmId}/organic-dairy/treatments`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-dairy/treatments/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setAnimalSearch("");
    setForm({ certifierNotified: false, treatmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setAnimalSearch("");
    setForm({ ...r });
    setOpen(true);
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const dairyTreatYears = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.treatmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredDairyTreatments = reactExports.useMemo(() => yearFilter === "all" ? records : records.filter((r) => String(r.treatmentDate ?? "").startsWith(yearFilter)), [records, yearFilter]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    medicineOrganicRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🌿" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          medicineOrganicRecords.length,
          " treatment",
          medicineOrganicRecords.length !== 1 ? "s" : ""
        ] }),
        " auto-populated from the Medicine Register. No double entry needed."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            dairyTreatYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printDairyTreatmentRegister(records, farmName), disabled: records.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Treatment Register"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Standalone Treatment"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Std W/D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic Milk W/D End" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic Meat W/D End" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier Notified" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-32" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        medicineOrganicRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-green-50/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.administeredDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5", children: "Medicine Register" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.medicineName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.organicWithdrawalEndDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700 font-medium text-sm", children: [
            fmt(r.organicWithdrawalEndDate),
            " (",
            r.doubledWithdrawalDays,
            "d)"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "See Med. Register" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700", children: r.certifierNotified ? "Yes" : "No" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "Edit in Medicines" }) })
        ] }, `med-${r.id}`)),
        records.length === 0 && medicineOrganicRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: "No treatment records yet. When you record a vet treatment for an organic herd in the Medicine Register, it will appear here automatically." }) }),
        filteredDairyTreatments.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.treatmentDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Standalone" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.productName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.standardMilkWithdrawalDays ? `${r.standardMilkWithdrawalDays}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.milkWithdrawalEndDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.meatWithdrawalEndDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700", children: r.certifierNotified ? "Yes" : "No" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
            r.milkWithdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Raise task for milk withdrawal end", onClick: () => setRaiseTaskMilkRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-teal-600" }) }),
            r.meatWithdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Raise task for meat withdrawal end", onClick: () => setRaiseTaskMeatRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-amber-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem", maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Treatment Record — ",
        viewRecord.productName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.treatmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cow IDs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.cowIds) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Cows" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.numberOfCows) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.treatmentNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.productName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.productCategory) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.activeIngredient) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dose Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.doseAmount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Route of Administration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.routeOfAdministration) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.vetName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.prescriptionRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Std Milk Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.standardMilkWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doubled Milk Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.doubledMilkWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Std Meat Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.standardMeatWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doubled Meat Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.doubledMeatWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk Withdrawal End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.milkWithdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meat Withdrawal End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.meatWithdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certifierNotified ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    raiseTaskMilkRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskMilkRecord,
        onClose: () => setRaiseTaskMilkRecord(null),
        defaultTitle: `Organic milk withdrawal ends: ${raiseTaskMilkRecord.productName} — due ${raiseTaskMilkRecord.milkWithdrawalEndDate ? (/* @__PURE__ */ new Date(raiseTaskMilkRecord.milkWithdrawalEndDate + "T00:00:00Z")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`,
        defaultDescription: `Verify the organic milk withdrawal period (doubled) for '${raiseTaskMilkRecord.productName}' has ended before collecting milk from treated cows for organic sale.`,
        defaultDueDate: raiseTaskMilkRecord.milkWithdrawalEndDate ?? "",
        taskType: "organic_dairy_milk_withdrawal",
        module: "Organic Dairy"
      }
    ),
    raiseTaskMeatRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskMeatRecord,
        onClose: () => setRaiseTaskMeatRecord(null),
        defaultTitle: `Organic meat withdrawal ends: ${raiseTaskMeatRecord.productName} — due ${raiseTaskMeatRecord.meatWithdrawalEndDate ? (/* @__PURE__ */ new Date(raiseTaskMeatRecord.meatWithdrawalEndDate + "T00:00:00Z")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`,
        defaultDescription: `Verify the organic meat withdrawal period (doubled) for '${raiseTaskMeatRecord.productName}' has ended before sending treated cows to slaughter as organic beef.`,
        defaultDueDate: raiseTaskMeatRecord.meatWithdrawalEndDate ?? "",
        taskType: "organic_dairy_meat_withdrawal",
        module: "Organic Dairy"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Treatment Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record veterinary treatments with organic withdrawal periods for milk and meat." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.treatmentDate ?? "", onChange: f("treatmentDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId ?? "__none__"), onValueChange: (v) => setForm((p) => ({ ...p, herdId: v === "__none__" ? null : Number(v) })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All herds" }),
              herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Cows Treated" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfCows ?? "", onChange: f("numberOfCows") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Treated — Livestock Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5 mb-1", children: "Select animals from the herd. Selected ear tags are saved to the record." }),
          (() => {
            const selTags = (form.cowIds || "").split(",").map((t) => t.trim()).filter(Boolean);
            const herdAnim = allTreatAnimals.filter((a) => !form.herdId || a.herdId === form.herdId);
            const filtAnim = herdAnim.filter((a) => {
              if (!animalSearch) return true;
              return (a.earTagNumber || a.tagNumber || "").toLowerCase().includes(animalSearch.toLowerCase());
            });
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by ear tag…", value: animalSearch, onChange: (e) => setAnimalSearch(e.target.value), className: "border-0 border-b rounded-none text-sm" }),
              selTags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 px-2 py-1.5 bg-emerald-50 border-b", children: selTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800 text-xs font-mono", children: [
                tag,
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-emerald-500 hover:text-red-600 ml-0.5 leading-none", onClick: () => {
                  const next = selTags.filter((t) => t !== tag);
                  setForm((p) => ({ ...p, cowIds: next.join(", ") || null, numberOfCows: next.length || p.numberOfCows }));
                }, children: "×" })
              ] }, tag)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-36 overflow-y-auto", children: herdAnim.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 px-3 py-2 italic", children: animalsLoading ? "Loading animals…" : "No animals found — add animals to the livestock register first." }) : filtAnim.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 px-3 py-2 italic", children: "No animals match your search." }) : filtAnim.map((a) => {
                const tag = a.earTagNumber || a.tagNumber || `Animal #${a.id}`;
                const isSel = selTags.includes(tag);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: `w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${isSel ? "bg-emerald-50" : ""}`,
                    onClick: () => {
                      const next = isSel ? selTags.filter((t) => t !== tag) : [...selTags, tag];
                      setForm((p) => ({ ...p, cowIds: next.join(", ") || null, numberOfCows: next.length || p.numberOfCows }));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${isSel ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 bg-white"}`, children: isSel && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-2.5 w-2.5" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: tag }),
                      a.animalCode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: a.animalCode })
                    ]
                  },
                  a.id
                );
              }) })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName ?? "", onChange: f("productName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.productCategory ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, productCategory: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRODUCT_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.activeIngredient ?? "", onChange: f("activeIngredient") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doseAmount ?? "", onChange: f("doseAmount"), placeholder: "e.g. 5ml/100kg" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Route of Administration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.routeOfAdministration ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, routeOfAdministration: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select route…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROUTES_OF_ADMINISTRATION.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName ?? "", onChange: f("vetName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.prescriptionRef ?? "", onChange: f("prescriptionRef") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1", children: [
          "Withdrawal Periods ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal normal-case", children: "(organic = standard × 2)" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Milk Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.standardMilkWithdrawalDays ?? "", onChange: f("standardMilkWithdrawalDays"), placeholder: "e.g. 4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Milk Withdrawal (auto)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm font-medium", children: form.standardMilkWithdrawalDays ? `${Number(form.standardMilkWithdrawalDays) * 2} days` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Meat Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.standardMeatWithdrawalDays ?? "", onChange: f("standardMeatWithdrawalDays"), placeholder: "e.g. 28" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Meat Withdrawal (auto)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm font-medium", children: form.standardMeatWithdrawalDays ? `${Number(form.standardMeatWithdrawalDays) * 2} days` : "—" })
        ] }),
        form.treatmentDate && form.standardMilkWithdrawalDays && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Withdrawal End Date (auto)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm", children: (() => {
            const dt = new Date(form.treatmentDate);
            dt.setDate(dt.getDate() + Number(form.standardMilkWithdrawalDays) * 2);
            return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
          })() })
        ] }),
        form.treatmentDate && form.standardMeatWithdrawalDays && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meat Withdrawal End Date (auto)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm", children: (() => {
            const dt = new Date(form.treatmentDate);
            dt.setDate(dt.getDate() + Number(form.standardMeatWithdrawalDays) * 2);
            return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
          })() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: form.certifierNotified ?? false,
              onCheckedChange: (v) => setForm((p) => ({ ...p, certifierNotified: !!v })),
              id: "cert-notified"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cert-notified", children: "Certifier Notified" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function OrganicDairyPage() {
  const { farmId } = useAppStore();
  const [activeTab, setActiveTab] = usePersistedTab({ page: "organic-dairy", farmId, validIds: ["herd-conversion", "collections", "mastitis", "calving", "bcs", "mobility", "tank", "dct", "recording", "johnes", "feed", "treatments", "enterprise", "abr-kit", "scc-equipment", "supplies"], defaultTab: "herd-conversion" });
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const name = farmData?.name ?? "Farm";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Organic Dairy", children: farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto gap-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "herd-conversion", children: "Herd Conversion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "collections", children: "Milk Collections" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mastitis", children: "Mastitis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "calving", children: "Calving" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "bcs", children: "Body Condition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mobility", children: "Mobility Scoring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "tank", children: "Bulk Tank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "dct", children: "Dry Cow Therapy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "recording", children: "Recording Visits" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "johnes", children: "Johne's Monitoring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "feed", children: "Feed & Nutrition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "treatments", children: "Treatment Compliance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "enterprise", children: "Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "abr-kit", children: "ABR Kit Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "scc-equipment", children: "SCC Equipment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "supplies", children: "Supplies" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "herd-conversion", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HerdConversionTab, { farmId, farmName: name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "collections", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MilkCollectionsTab, { farmId, farmName: name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "mastitis", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MastitisTab, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "calving", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalvingTab, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "bcs", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BcsTab, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "mobility", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobilityTab, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "tank", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BulkTankTab, { farmId, showCollections: false }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "dct", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DctTab, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "recording", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordingVisitsTab, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "johnes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "feed", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedNutritionTab, { farmId, farmName: name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "treatments", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreatmentsTab, { farmId, farmName: name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "enterprise", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DairyEnterpriseReport, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "scc-equipment", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SccEquipmentSection, { farmId, species: "cattle" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "abr-kit", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "supplies", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DairySuppliesTab, { farmId, dairyType: "organic-cattle" }) })
    ] }),
    activeTab === "johnes" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganicJohnesTab, { farmId }) })
  ] }) });
}
export {
  OrganicDairyPage as default
};
