import { c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, O as React, j as jsxRuntimeExports, d as Button, T as Plus, n as Card, o as CardContent, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, e as LoaderCircle, L as Label, I as Input, N as DialogMutationError, M as MapPin, U as FlaskConical, aA as Check } from "./index-wK5wrh9n.js";
import { a as usePersistedFilter } from "./use-persisted-filter-DQ5dvmzA.js";
import { u as useSafeUser } from "./use-safe-clerk-C0LiYYOL.js";
import { R as RecordAttachments } from "./RecordAttachments-Bx8xtteE.js";
import { T as Textarea } from "./textarea-CCJ5f4Zn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-WnP5UFI8.js";
import { u as useFarmMembers } from "./use-farm-members-By6M5P7g.js";
import { S as StaffSelect } from "./staff-select-DqJTE9Nv.js";
import { o as openPrintWindow } from "./print-report-DB1ygEK5.js";
import { a as api, f as formatDate, B as BcsBadge, t as today, S as SccBadge } from "./SccEquipmentSection-BBd_3LKt.js";
import { F as FileDown } from "./file-down-k0hHe0Su.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, _ as ReferenceLine, B as Bar } from "./generateCategoricalChart-BC47IO8s.js";
import { C as ComposedChart } from "./ComposedChart-CRXD_FvZ.js";
import { C as CartesianGrid } from "./CartesianGrid-Dp_9ykCi.js";
import { L as Line } from "./Line-8aXOUfuS.js";
import { T as TriangleAlert } from "./triangle-alert-B3at_eCR.js";
import { E as Eye } from "./eye-CGSY_5zs.js";
import { P as Pencil } from "./pencil-C9rzS6AO.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-CMEi8FLH.js";
import { D as DocAttach } from "./DocAttach-D0gePhmi.js";
import { Q as QRCodeSVG } from "./index-C7P-DxSI.js";
import { C as ConfirmDialog } from "./confirm-dialog-BH0gO5Gp.js";
import { C as ChevronRight } from "./tractor-BaPCPe6v.js";
import { Q as QrCode } from "./qr-code-DiZiu8SK.js";
import { C as CircleCheck } from "./circle-check-DSUfXbxe.js";
import { D as Download } from "./download-C75SZHqE.js";
import { R as Receipt } from "./receipt-Bi3RV9zD.js";
import { T as Thermometer } from "./thermometer-Cwa3w1lU.js";
import { B as BadgeCheck } from "./badge-check-CpPn015F.js";
import { a as Clock } from "./database-CBJPKp5h.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-C-Zjvk-4.js";
import { c as ClipboardList } from "./AppLayout-B5H1VM3_.js";
function BcsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: bcsMembersData, isLoading: bcsMembersLoading } = useFarmMembers(farmId);
  const bcsStaffNames = (bcsMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-bcs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bcs-records`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/bcs-records/${editing.id}`) : api(`farms/${farmId}/dairy/bcs-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/bcs-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ assessmentDate: today(), assessedBy: myName });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10) });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const LIFE_STAGES = ["Early lactation (0-60 DIM)", "Mid lactation (60-200 DIM)", "Late lactation (>200 DIM)", "Dry period", "At dry-off", "At calving", "Heifers pre-calving"];
  const allBcsRecords = data?.records ?? [];
  const [yearFilterBcs, setYearFilterBcs] = usePersistedFilter({ page: "dairy-bcs", filter: "year", farmId, defaultValue: "all" });
  const yearsBcs = reactExports.useMemo(() => {
    const s = new Set(allBcsRecords.map((r) => r.assessmentDate?.slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allBcsRecords]);
  const filteredBcsRecords = reactExports.useMemo(
    () => yearFilterBcs === "all" ? allBcsRecords : allBcsRecords.filter((r) => r.assessmentDate?.startsWith(yearFilterBcs)),
    [allBcsRecords, yearFilterBcs]
  );
  const bcsTrendData = React.useMemo(() => {
    const monthMap = {};
    for (const r of allBcsRecords) {
      if (!r.assessmentDate || !r.bcsScore) continue;
      const d = new Date(r.assessmentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const score = parseFloat(r.bcsScore);
      if (isNaN(score)) continue;
      if (!monthMap[key]) monthMap[key] = { sum: 0, count: 0, inRange: 0, outRange: 0 };
      monthMap[key].sum += score;
      monthMap[key].count++;
      if (score >= 2.5 && score <= 3.5) monthMap[key].inRange++;
      else monthMap[key].outRange++;
    }
    return Object.keys(monthMap).sort().map((m) => ({
      month: (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      avg: Math.round(monthMap[m].sum / monthMap[m].count * 10) / 10,
      inRange: monthMap[m].inRange,
      outRange: monthMap[m].outRange,
      total: monthMap[m].count
    }));
  }, [allBcsRecords]);
  function generateBcsReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const total = allBcsRecords.length;
    const inRange = allBcsRecords.filter((r) => r.bcsScore && parseFloat(r.bcsScore) >= 2.5 && parseFloat(r.bcsScore) <= 3.5).length;
    const actionsNeeded = allBcsRecords.filter((r) => r.actionRequired).length;
    const rows = allBcsRecords.map((r) => `<tr>
      <td>${r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${r.earTagNumber || "Group / all"}</td>
      <td>${r.lifeStage || "—"}</td>
      <td>${r.bcsScore || "—"}</td>
      <td>${r.targetScore || "—"}</td>
      <td>${r.bcsScore && parseFloat(r.bcsScore) >= 2.5 && parseFloat(r.bcsScore) <= 3.5 ? "In range" : r.bcsScore ? "<b style='color:#b45309'>Outside range</b>" : "—"}</td>
      <td>${r.assessedBy || "—"}</td>
      <td>${r.actionRequired ? "Yes" : "No"}</td>
      <td>${r.actionTaken || "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>BCS Records — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:10px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="hdr">
  <div><h1>Body Condition Scoring (BCS) Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${total} record${total !== 1 ? "s" : ""}</b><br>Target: 2.5–3.5 (1–5 scale)<br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${total}</div><div class="kpi-lbl">Total assessments</div></div>
  <div class="kpi-box"><div class="kpi-val">${total > 0 ? Math.round(inRange / total * 100) : 0}%</div><div class="kpi-lbl">Scores in target range (2.5–3.5)</div></div>
  <div class="kpi-box"><div class="kpi-val">${actionsNeeded}</div><div class="kpi-lbl">Actions flagged</div></div>
</div>
<h3>All BCS Records</h3>
<table>
  <tr><th>Date</th><th>Ear Tag / Group</th><th>Life Stage</th><th>Score</th><th>Target</th><th>Range</th><th>Assessed By</th><th>Action?</th><th>Action Taken</th></tr>
  ${rows || "<tr><td colspan='9'>No records</td></tr>"}
</table>
<p class="note">Body Condition Scoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires BCS assessed at dry-off, calving, and mid-lactation. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Body Condition Scoring (BCS) — document at dry-off, calving, and mid-lactation. Target range: 2.5–3.5 on a 1–5 scale." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterBcs, onValueChange: setYearFilterBcs, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsBcs.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateBcsReport, disabled: allBcsRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add BCS"
        ] })
      ] })
    ] }),
    bcsTrendData.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-0.5", children: "Average BCS by Month" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Monthly average body condition score — target band 2.5–3.5 shown in green" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: bcsTrendData, margin: { top: 4, right: 8, left: -20, bottom: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [1, 5], tick: { fontSize: 11 }, ticks: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [String(v), "Avg BCS"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 2.5, stroke: "#16a34a", strokeDasharray: "4 3", strokeWidth: 1.5, label: { value: "Min 2.5", position: "right", fontSize: 9, fill: "#16a34a" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 3.5, stroke: "#16a34a", strokeDasharray: "4 3", strokeWidth: 1.5, label: { value: "Max 3.5", position: "right", fontSize: 9, fill: "#16a34a" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "inRange", name: "In range", fill: "#bbf7d0", stackId: "a", radius: [0, 0, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "outRange", name: "Outside range", fill: "#fecaca", stackId: "a", radius: [3, 3, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "avg", name: "Avg BCS", stroke: "#1d4ed8", strokeWidth: 2, dot: { fill: "#1d4ed8", r: 3 } })
      ] }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View BCS Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.assessmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ear Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.earTagNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Life Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewRecord.lifeStage ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "BCS Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.bcsScore ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Target Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.targetScore ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.assessedBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.actionRequired ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.actionTaken ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes ?? "—") })
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
    !isLoading && filteredBcsRecords.length > 0 && (() => {
      const scores = filteredBcsRecords.map((r) => r.bcsScore ? parseFloat(r.bcsScore) : null).filter((v) => v !== null);
      const avgBcs = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const inRange = scores.filter((s) => s >= 2.5 && s <= 3.5).length;
      const inRangePct = scores.length > 0 ? Math.round(inRange / scores.length * 100) : null;
      const actionsNeeded = filteredBcsRecords.filter((r) => r.actionRequired).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Assessments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: filteredBcsRecords.length })
        ] }),
        avgBcs !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Avg BCS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: avgBcs.toFixed(2) })
        ] }),
        inRangePct !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: inRangePct >= 70 ? "#f0fdf4" : "#fef9c3", border: `1px solid ${inRangePct >= 70 ? "#bbf7d0" : "#fef08a"}`, borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: inRangePct >= 70 ? "#15803d" : "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "In Target Range (2.5–3.5)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: inRangePct >= 70 ? "#14532d" : "#78350f", lineHeight: 1, margin: 0 }, children: [
            inRangePct,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.65rem", color: inRangePct >= 70 ? "#15803d" : "#92400e", margin: "2px 0 0" }, children: [
            inRange,
            " of ",
            scores.length,
            " scored"
          ] })
        ] }),
        actionsNeeded > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: actionsNeeded })
        ] })
      ] });
    })(),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      !filteredBcsRecords.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: [
        "No BCS records",
        yearFilterBcs !== "all" ? ` for ${yearFilterBcs}` : "",
        " yet."
      ] }) }),
      filteredBcsRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.assessmentDate) }),
            r.earTagNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 font-mono", children: r.earTagNumber }),
            r.lifeStage && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.lifeStage }),
            r.bcsScore && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BcsBadge, { v: r.bcsScore }),
              r.targetScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "Target: ",
                r.targetScore
              ] })
            ] }),
            r.assessedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              "by ",
              r.assessedBy
            ] }),
            r.actionRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "Action needed"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "dairy-bcs-records", recordId: r.id, compact: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        r.actionTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
          "Action: ",
          r.actionTaken
        ] })
      ] }) }, r.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit BCS Record" : "Add BCS Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate?.slice(0, 10) || "", onChange: (e) => set("assessmentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Ear Tag (or leave blank for group)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.earTagNumber || "", onChange: (e) => set("earTagNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Life Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.lifeStage || "", onValueChange: (v) => set("lifeStage", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select life stage..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LIFE_STAGES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BCS Score (1–5 scale)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.bcsScore || "", onValueChange: (v) => set("bcsScore", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select score..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.targetScore || "", onValueChange: (v) => set("targetScore", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Optional target..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["2.0", "2.5", "3.0", "3.5", "4.0"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.assessedBy || "", onChange: (v) => set("assessedBy", v), staffNames: bcsStaffNames, loading: bcsMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "acreq", checked: !!form.actionRequired, onChange: (e) => set("actionRequired", e.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "acreq", children: "Management action required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.actionTaken || "", onChange: (e) => set("actionTaken", e.target.value), placeholder: "e.g. Moved to higher energy group, supplemented" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.assessmentDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add BCS"
        ] })
      ] })
    ] }) })
  ] });
}
function MobilityTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [animals, setAnimals] = reactExports.useState([]);
  const [pendingTag, setPendingTag] = reactExports.useState("");
  const [pendingScore, setPendingScore] = reactExports.useState(3);
  const [pendingNotes, setPendingNotes] = reactExports.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-mobility", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mobility-scorings`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: staffData } = useQuery({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then((r) => r.json())
  });
  const staffNames = staffData?.names ?? [];
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/mobility-scorings/${editing.id}`) : api(`farms/${farmId}/dairy/mobility-scorings`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setAnimals([]);
      setPendingTag("");
      setPendingNotes("");
      setPendingScore(3);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/mobility-scorings/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: cattleData } = useQuery({
    queryKey: ["farm-cattle", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then((r) => r.json()).catch(() => ({ records: [] })),
    enabled: open
  });
  const cattleList = (cattleData?.records ?? []).filter((a) => a.status === "active");
  const cattleTagListId = `cattle-tags-${farmId}`;
  function openAdd() {
    setEditing(null);
    setForm({ assessmentDate: today(), score0Count: 0, score1Count: 0, score2Count: 0, score3Count: 0, assessedBy: myName });
    setAnimals([]);
    setPendingTag("");
    setPendingScore(3);
    setPendingNotes("");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10), nextAssessmentDue: r.nextAssessmentDue?.slice(0, 10) });
    setAnimals((r.animals ?? []).map((a) => ({ ...a, scoreGrade: a.scoreGrade === 2 ? 2 : 3 })));
    setPendingTag("");
    setPendingScore(3);
    setPendingNotes("");
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function addAnimal() {
    const tag = pendingTag.trim();
    if (!tag) return;
    const matched = cattleList.find((c) => (c.tagNumber || "").toLowerCase() === tag.toLowerCase() || (c.earTagNumber || "").toLowerCase() === tag.toLowerCase());
    setAnimals((prev) => [...prev, {
      animalTag: tag,
      earTagNumber: matched?.earTagNumber ?? null,
      animalId: matched?.id ?? null,
      scoreGrade: pendingScore,
      notes: pendingNotes.trim() || null
    }]);
    setPendingTag("");
    setPendingNotes("");
  }
  function removeAnimal(idx) {
    setAnimals((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleAssessmentDateChange(dateStr) {
    const updates = { assessmentDate: dateStr };
    if (dateStr) {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + 91);
      updates.nextAssessmentDue = d.toISOString().slice(0, 10);
    }
    setForm((f) => ({ ...f, ...updates }));
  }
  const total = (form.score0Count || 0) + (form.score1Count || 0) + (form.score2Count || 0) + (form.score3Count || 0);
  const prevalence = total > 0 ? ((form.score3Count || 0) / total * 100).toFixed(1) : null;
  const score2Pct = total > 0 ? ((form.score2Count || 0) / total * 100).toFixed(1) : null;
  const staffListId = `mobility-staff-${farmId}`;
  const allMobilityRecords = data?.records ?? [];
  const [yearFilterMob, setYearFilterMob] = usePersistedFilter({ page: "dairy-mobility", filter: "year", farmId, defaultValue: "all" });
  const yearsMob = reactExports.useMemo(() => {
    const s = new Set(allMobilityRecords.map((r) => r.assessmentDate?.slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allMobilityRecords]);
  const filteredMobilityRecords = reactExports.useMemo(
    () => yearFilterMob === "all" ? allMobilityRecords : allMobilityRecords.filter((r) => r.assessmentDate?.startsWith(yearFilterMob)),
    [allMobilityRecords, yearFilterMob]
  );
  const mobilityTrend = React.useMemo(() => {
    return [...allMobilityRecords].filter((r) => r.assessmentDate && r.lamenessPrevalencePercent != null).sort((a, b) => a.assessmentDate.localeCompare(b.assessmentDate)).map((r) => ({
      date: new Date(r.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }),
      lameness: parseFloat(r.lamenessPrevalencePercent),
      total: r.totalCowsScored
    }));
  }, [allMobilityRecords]);
  function generateMobilityReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const records = [...allMobilityRecords].sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate));
    const total2 = records.length;
    const aboveTarget = records.filter((r) => r.lamenessPrevalencePercent && parseFloat(r.lamenessPrevalencePercent) >= 10).length;
    const avgLameness = total2 > 0 ? (records.reduce((s, r) => s + (r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : 0), 0) / total2).toFixed(1) : "—";
    const rows = records.map((r) => {
      const lam = r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null;
      const lamCell = lam != null ? `<span style="color:${lam >= 10 ? "#b91c1c" : "#166534"};font-weight:600">${lam.toFixed(1)}%${lam >= 10 ? " ⚠" : ""}</span>` : "—";
      return `<tr>
        <td>${new Date(r.assessmentDate).toLocaleDateString("en-GB")}</td>
        <td>${r.assessedBy || "—"}</td>
        <td>${r.totalCowsScored}</td>
        <td>${r.score0Count}</td>
        <td>${r.score1Count}</td>
        <td>${r.score2Count}</td>
        <td>${r.score3Count}</td>
        <td>${lamCell}</td>
        <td style="font-size:9px">${r.animals && r.animals.length > 0 ? r.animals.map((a) => `[${a.scoreGrade}] ${a.animalTag}`).join(", ") : r.score3AnimalTags || r.score2AnimalTags || "—"}</td>
        <td style="font-size:9px">${r.actionTaken || "—"}</td>
        <td>${r.nextAssessmentDue ? new Date(r.nextAssessmentDue).toLocaleDateString("en-GB") : "—"}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Mobility Scoring — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:10px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Mobility / Lameness Scoring Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2><p style="margin:4px 0;font-size:9px;color:#6b7280">Quarterly assessment required. Score 3 (lame) target: below 10% of herd.</p></div>
  <div class="hdr-r"><b>${total2} assessment${total2 !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${total2}</div><div class="kpi-lbl">Total assessments</div></div>
  <div class="kpi-box"><div class="kpi-val">${avgLameness}%</div><div class="kpi-lbl">Average lameness prevalence</div></div>
  <div class="kpi-box"><div class="kpi-val">${aboveTarget}</div><div class="kpi-lbl">Sessions above 10% target</div></div>
</div>
<h3>All Mobility Assessments</h3>
<table>
  <tr><th>Date</th><th>Assessed By</th><th>Total</th><th>Score 0</th><th>Score 1</th><th>Score 2</th><th>Score 3</th><th>Lameness %</th><th>Lame tags</th><th>Action Taken</th><th>Next Due</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Mobility scoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires quarterly mobility scoring. Score 3 (severely lame) target: below 10% of herd. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: staffListId, children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Quarterly mobility/lameness scoring — score cows 0–3 as they walk from the parlour. Red Tractor target: score 3 (lame) cows below 10% of herd. Next assessment date auto-calculates at 13 weeks." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterMob, onValueChange: setYearFilterMob, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsMob.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateMobilityReport, disabled: allMobilityRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Assessment"
        ] })
      ] })
    ] }),
    mobilityTrend.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-0.5", children: "Lameness Prevalence Trend" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Score 3 (lame) cows as a % of herd per assessment session — Red Tractor target below 10%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: mobilityTrend, margin: { top: 4, right: 8, left: -20, bottom: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, "auto"], tick: { fontSize: 11 }, unit: "%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}%`, "Lameness"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 10, stroke: "#dc2626", strokeDasharray: "4 3", strokeWidth: 1.5, label: { value: "10% target", position: "right", fontSize: 9, fill: "#dc2626" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "lameness", name: "Lameness %", fill: "#fca5a5", radius: [3, 3, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "lameness", name: "Trend", stroke: "#dc2626", strokeWidth: 2, dot: { fill: "#dc2626", r: 3 } })
      ] }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Mobility Assessment — ",
        formatDate(viewRecord.assessmentDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.assessmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assessedBy || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Scored" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.totalCowsScored })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lameness Prevalence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `font-semibold ${viewRecord.lamenessPrevalencePercent && parseFloat(viewRecord.lamenessPrevalencePercent) >= 10 ? "text-red-600" : "text-green-700"}`, children: [
            viewRecord.lamenessPrevalencePercent ? `${parseFloat(viewRecord.lamenessPrevalencePercent).toFixed(1)}%` : "—",
            viewRecord.lamenessPrevalencePercent && parseFloat(viewRecord.lamenessPrevalencePercent) >= 10 ? " — Above target" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1", children: "Score Distribution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-green-100 text-green-800 px-2 py-1 rounded font-medium", children: [
              "Score 0 (Normal): ",
              viewRecord.score0Count
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-lime-100 text-lime-800 px-2 py-1 rounded font-medium", children: [
              "Score 1: ",
              viewRecord.score1Count
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium", children: [
              "Score 2 (Impaired): ",
              viewRecord.score2Count
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-red-100 text-red-800 px-2 py-1 rounded font-medium", children: [
              "Score 3 (Lame): ",
              viewRecord.score3Count
            ] })
          ] })
        ] }),
        viewRecord.animals && viewRecord.animals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-2", children: "Individual Animal Records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            viewRecord.animals.filter((a) => a.scoreGrade === 3).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-red-700 uppercase tracking-wide", children: "Score 3 — Lame" }),
              viewRecord.animals.filter((a) => a.scoreGrade === 3).map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 rounded px-2 py-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-red-500 text-white rounded px-1.5 py-0.5 font-bold text-xs", children: "3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium text-red-900", children: a.animalTag }),
                a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 italic", children: a.notes })
              ] }, i))
            ] }),
            viewRecord.animals.filter((a) => a.scoreGrade === 2).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-700 uppercase tracking-wide mt-1", children: "Score 2 — Impaired (Monitor)" }),
              viewRecord.animals.filter((a) => a.scoreGrade === 2).map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-2 py-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-amber-500 text-white rounded px-1.5 py-0.5 font-bold text-xs", children: "2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium text-amber-900", children: a.animalTag }),
                a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 italic", children: a.notes })
              ] }, i))
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          viewRecord.score3AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Score 3 — Ear Tag Numbers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-red-700 bg-red-50 rounded px-2 py-1 text-xs mt-1", children: viewRecord.score3AnimalTags })
          ] }),
          viewRecord.score2AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Score 2 — Ear Tag Numbers (Monitor)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-700 bg-amber-50 rounded px-2 py-1 text-xs mt-1", children: viewRecord.score2AnimalTags })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.actionTaken || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Assessment Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            formatDate(viewRecord.nextAssessmentDue),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(auto-calculated 13 weeks)" })
          ] })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
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
    !isLoading && filteredMobilityRecords.length > 0 && (() => {
      const totalCows = filteredMobilityRecords.reduce((s, r) => s + (r.totalCowsScored ?? 0), 0);
      const lamValues = filteredMobilityRecords.map((r) => r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null).filter((v) => v !== null);
      const avgLameness = lamValues.length > 0 ? lamValues.reduce((a, b) => a + b, 0) / lamValues.length : null;
      const aboveTarget = lamValues.filter((v) => v >= 10).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Assessments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: filteredMobilityRecords.length })
        ] }),
        totalCows > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Cows Scored" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: totalCows.toLocaleString("en-GB") })
        ] }),
        avgLameness !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: avgLameness >= 10 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${avgLameness >= 10 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 160 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: avgLameness >= 10 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Avg Lameness Prevalence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: avgLameness >= 10 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }, children: [
            avgLameness.toFixed(1),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "%" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", color: avgLameness >= 10 ? "#b91c1c" : "#15803d", margin: "2px 0 0" }, children: avgLameness >= 10 ? "Above 10% target" : "Within target" })
        ] }),
        aboveTarget > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Above 10% Target" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }, children: [
            aboveTarget,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: [
              "session",
              aboveTarget !== 1 ? "s" : ""
            ] })
          ] })
        ] })
      ] });
    })(),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      !filteredMobilityRecords.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: [
        "No mobility assessments",
        yearFilterMob !== "all" ? ` for ${yearFilterMob}` : "",
        " yet. Assessments should be carried out at least quarterly."
      ] }) }),
      filteredMobilityRecords.map((r) => {
        const lam = r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null;
        const s2pct = r.totalCowsScored > 0 ? r.score2Count / r.totalCowsScored * 100 : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "cursor-pointer hover:shadow-sm transition-shadow", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.assessmentDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                r.totalCowsScored,
                " cows scored"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-green-100 text-green-700 px-1.5 py-0.5 rounded", children: [
                  "0: ",
                  r.score0Count
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded", children: [
                  "1: ",
                  r.score1Count
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded", children: [
                  "2: ",
                  r.score2Count
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-red-100 text-red-700 px-1.5 py-0.5 rounded", children: [
                  "3: ",
                  r.score3Count
                ] })
              ] }),
              lam !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${lam >= 10 ? "bg-red-100 text-red-700" : lam >= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: [
                "Lameness: ",
                lam.toFixed(1),
                "%",
                lam >= 10 ? " ⚠ above target" : ""
              ] }),
              s2pct >= 20 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700", children: [
                "Score 2: ",
                s2pct.toFixed(1),
                "% — monitor"
              ] }),
              r.assessedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "by ",
                r.assessedBy
              ] }),
              r.nextAssessmentDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "Next: ",
                formatDate(r.nextAssessmentDue)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-2", onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "dairy-mobility-scorings", recordId: r.id, compact: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          r.actionTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
            "Action: ",
            r.actionTaken
          ] }),
          r.animals && r.animals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-1.5", children: r.animals.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded font-medium ${a.scoreGrade === 3 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`, children: [
            "[",
            a.scoreGrade,
            "] ",
            a.animalTag,
            a.notes ? ` — ${a.notes}` : ""
          ] }, i)) }) : r.score3AnimalTags || r.score2AnimalTags ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-1.5", children: [
            r.score3AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded", children: [
              "Score 3: ",
              r.score3AnimalTags
            ] }),
            r.score2AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded", children: [
              "Score 2: ",
              r.score2AnimalTags
            ] })
          ] }) : null
        ] }) }, r.id);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "60rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Mobility Assessment" : "Add Mobility Assessment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Score cows 0–3 as they walk from the milking parlour. Next assessment date is calculated automatically at 13 weeks (Red Tractor quarterly requirement)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate?.slice(0, 10) || "", onChange: (e) => handleAssessmentDateChange(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StaffSelect,
                {
                  value: form.assessedBy || "",
                  onChange: (v) => set("assessedBy", v),
                  staffNames,
                  loading: false
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1", children: "Score counts — observe each cow walking from parlour" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-green-700 mb-0.5", children: "Score 0 — Normal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 mb-2", children: "Perfect gait, even weight bearing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score0Count || 0, onChange: (e) => set("score0Count", parseInt(e.target.value) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-lime-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-lime-700 mb-0.5", children: "Score 1 — Imperfect" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-lime-600 mb-2", children: "Minor gait imperfection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score1Count || 0, onChange: (e) => set("score1Count", parseInt(e.target.value) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-700 mb-0.5", children: "Score 2 — Impaired" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mb-2", children: "Clear gait impairment, arched back" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score2Count || 0, onChange: (e) => set("score2Count", parseInt(e.target.value) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-red-700 mb-0.5", children: "Score 3 — Lame" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: "Severely lame, reluctant to bear weight" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score3Count || 0, onChange: (e) => set("score3Count", parseInt(e.target.value) || 0) })
            ] })
          ] }),
          total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg text-sm text-center space-y-0.5 ${prevalence && parseFloat(prevalence) >= 10 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `font-semibold ${prevalence && parseFloat(prevalence) >= 10 ? "text-red-700" : "text-green-700"}`, children: [
              total,
              " cows scored — Lameness (score 3): ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                prevalence,
                "%"
              ] }),
              prevalence && parseFloat(prevalence) >= 10 ? " ⚠ above 10% target" : " — within target"
            ] }),
            score2Pct && parseFloat(score2Pct) >= 20 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
              "Score 2 impaired: ",
              score2Pct,
              "% — above advisory 20% threshold"
            ] })
          ] }),
          ((form.score3Count || 0) > 0 || (form.score2Count || 0) > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 bg-gray-50 rounded-lg p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-700 uppercase tracking-wide", children: "Individual Animal Records" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Record each Score 2 or 3 animal individually by ear tag. Matched animals update their record in the livestock register." })
            ] }),
            animals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: animals.map((a, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 p-2 rounded border text-xs ${a.scoreGrade === 3 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold px-1.5 py-0.5 rounded text-white text-xs ${a.scoreGrade === 3 ? "bg-red-500" : "bg-amber-500"}`, children: a.scoreGrade }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800 flex-1", children: a.animalTag }),
              a.animalId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 text-xs", children: "✓ matched" }),
              a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 italic truncate max-w-[120px]", children: a.notes }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removeAnimal(idx), className: "text-gray-400 hover:text-red-500 ml-auto", children: "✕" })
            ] }, idx)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Ear tag number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    list: cattleTagListId,
                    value: pendingTag,
                    onChange: (e) => setPendingTag(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAnimal();
                      }
                    },
                    placeholder: "e.g. UK123456 001234",
                    className: "w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: cattleTagListId, children: cattleList.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.tagNumber || c.earTagNumber || "", children: c.earTagNumber ? `${c.tagNumber || ""} / ${c.earTagNumber}` : c.tagNumber || "" }, c.id)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Score" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingScore(2), className: `px-3 py-1.5 text-xs rounded border font-medium ${pendingScore === 2 ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-700 border-amber-300"}`, children: "2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingScore(3), className: `px-3 py-1.5 text-xs rounded border font-medium ${pendingScore === 3 ? "bg-red-500 text-white border-red-500" : "bg-white text-red-700 border-red-300"}`, children: "3" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Notes (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    value: pendingNotes,
                    onChange: (e) => setPendingNotes(e.target.value),
                    placeholder: "e.g. left rear",
                    className: "w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: addAnimal, disabled: !pendingTag.trim(), className: "px-3 py-1.5 text-xs rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap", children: "+ Add" })
            ] }),
            animals.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No animals added yet — use the form above to add each Score 2 or 3 animal individually." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-gray-200 self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.actionTaken || "", onChange: (e) => set("actionTaken", e.target.value), placeholder: "e.g. Score 3 cows referred to vet for foot trimming and examination", rows: 4 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Assessment Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextAssessmentDue?.slice(0, 10) || "", onChange: (e) => set("nextAssessmentDue", e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Auto-calculated 13 weeks from assessment date — override if vet specifies a shorter interval." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 4, placeholder: "e.g. Wet conditions in yard increased scores this month. Foot-bathing frequency increased to 3×/week." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 bg-gray-50 rounded p-3 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-500", children: "Threshold reminders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Score 3 ≥ 10% → critical alert + SMS sent to farm managers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Score 2 ≥ 20% → advisory notification to review foot bathing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Next assessment date appears in the Week Ahead Planner" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate({ ...form, totalCowsScored: total, animals }), disabled: save.isPending || !form.assessmentDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Assessment"
        ] })
      ] })
    ] }) })
  ] });
}
function AbrBadge({ result }) {
  if (!result) return null;
  const ok = result === "negative";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded flex items-center gap-1 ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`, children: [
    ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
    "ABR: ",
    result
  ] });
}
function TempBadge({ v }) {
  if (!v) return null;
  const n = parseFloat(v);
  const cls = n <= 4 ? "bg-green-100 text-green-700" : n <= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded flex items-center gap-1 ${cls}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "h-3 w-3" }),
    v,
    "°C"
  ] });
}
function StatementBadge({ pencePerLitre, netPaymentPence }) {
  const hasStatementDetails = pencePerLitre != null || netPaymentPence != null;
  return hasStatementDetails ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-50 text-green-700", title: "Milk statement details entered", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3 w-3", "aria-hidden": "true" }),
    "Statement received"
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700", title: "Milk statement details are still needed", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3", "aria-hidden": "true" }),
    "Awaiting statement"
  ] });
}
function BulkTankTab({ farmId, showCollections = true }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [pendingDelColl, setPendingDelColl] = reactExports.useState(null);
  const [tanksOpen, setTanksOpen] = reactExports.useState(true);
  const [tankDialog, setTankDialog] = reactExports.useState(false);
  const [editingTank, setEditingTank] = reactExports.useState(null);
  const [tankForm, setTankForm] = reactExports.useState({});
  const [qrTank, setQrTank] = reactExports.useState(null);
  const tanksQ = useQuery({
    queryKey: ["dairy-tanks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/tanks`), { credentials: "include" }).then((r) => r.json())
  });
  const tanks = tanksQ.data?.tanks ?? [];
  const saveTank = useMutation({
    mutationFn: (body) => {
      const url = editingTank ? api(`farms/${farmId}/dairy/tanks/${editingTank.id}`) : api(`farms/${farmId}/dairy/tanks`);
      return fetch(url, { method: editingTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] });
      setTankDialog(false);
      setEditingTank(null);
      setTankForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delTank = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/tanks/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddTank() {
    setEditingTank(null);
    setTankForm({});
    setTankDialog(true);
  }
  function openEditTank(t) {
    setEditingTank(t);
    setTankForm({ ...t });
    setTankDialog(true);
  }
  const [monDialog, setMonDialog] = reactExports.useState(false);
  const [editingMon, setEditingMon] = reactExports.useState(null);
  const [viewMon, setViewMon] = reactExports.useState(null);
  const [monForm, setMonForm] = reactExports.useState({});
  const [monYearFilter, setMonYearFilter] = usePersistedFilter({ page: "dairy-bulk-tank", filter: "year", farmId, defaultValue: "all" });
  const monQ = useQuery({
    queryKey: ["dairy-tank-records", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bulk-tank-records`), { credentials: "include" }).then((r) => r.json())
  });
  const saveMon = useMutation({
    mutationFn: (body) => {
      const url = editingMon ? api(`farms/${farmId}/dairy/bulk-tank-records/${editingMon.id}`) : api(`farms/${farmId}/dairy/bulk-tank-records`);
      return fetch(url, { method: editingMon ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] });
      setMonDialog(false);
      setEditingMon(null);
      setMonForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delMon = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/bulk-tank-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddMon() {
    setEditingMon(null);
    setMonForm({ recordDate: today(), recordType: "daily-temperature" });
    setMonDialog(true);
  }
  function openEditMon(r) {
    setEditingMon(r);
    setMonForm({ ...r, recordDate: r.recordDate.slice(0, 10) });
    setMonDialog(true);
  }
  function setMon(k, v) {
    setMonForm((f) => ({ ...f, [k]: v }));
  }
  const [collDialog, setCollDialog] = reactExports.useState(false);
  const [editingColl, setEditingColl] = reactExports.useState(null);
  const [collForm, setCollForm] = reactExports.useState({});
  const [showCollQuality, setShowCollQuality] = reactExports.useState(false);
  const [stmtDialog, setStmtDialog] = reactExports.useState(false);
  const [stmtColl, setStmtColl] = reactExports.useState(null);
  const [stmtForm, setStmtForm] = reactExports.useState({});
  const [showStmtQuality, setShowStmtQuality] = reactExports.useState(false);
  const collQ = useQuery({
    queryKey: ["dairy-milk-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-collections`), { credentials: "include" }).then((r) => r.json())
  });
  const saveColl = useMutation({
    mutationFn: (body) => {
      const url = editingColl ? api(`farms/${farmId}/dairy/milk-collections/${editingColl.id}`) : api(`farms/${farmId}/dairy/milk-collections`);
      return fetch(url, { method: editingColl ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] });
      setCollDialog(false);
      setEditingColl(null);
      setCollForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const saveStmt = useMutation({
    mutationFn: (body) => {
      if (!stmtColl) throw new Error("No collection selected");
      return fetch(api(`farms/${farmId}/dairy/milk-collections/${stmtColl.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r.json();
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] });
      setStmtDialog(false);
      setStmtColl(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delColl = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/milk-collections/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddColl() {
    setEditingColl(null);
    setCollForm({ collectionDate: today() });
    setShowCollQuality(false);
    setCollDialog(true);
  }
  function openEditColl(c) {
    setEditingColl(c);
    setCollForm({ ...c, collectionDate: c.collectionDate.slice(0, 10) });
    setShowCollQuality(!!(c.buyerSccThousands || c.buyerBactoscanThousands || c.buyerFatPercent));
    setCollDialog(true);
  }
  function setColl(k, v) {
    setCollForm((f) => ({ ...f, [k]: v }));
  }
  function openStmtDialog(c) {
    setStmtColl(c);
    setStmtForm({ ...c, collectionDate: c.collectionDate.slice(0, 10) });
    setShowStmtQuality(!!(c.buyerSccThousands || c.buyerBactoscanThousands || c.buyerFatPercent));
    setStmtDialog(true);
  }
  function setStmt(k, v) {
    setStmtForm((f) => ({ ...f, [k]: v }));
  }
  const tankName = (id) => tanks.find((t) => t.id === id)?.name ?? null;
  const allMonRecords = monQ.data?.records ?? [];
  const monYears = React.useMemo(() => {
    const s = new Set(allMonRecords.map((r) => r.recordDate.slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allMonRecords]);
  const monRecords = React.useMemo(
    () => monYearFilter === "all" ? allMonRecords : allMonRecords.filter((r) => r.recordDate.startsWith(monYearFilter)),
    [allMonRecords, monYearFilter]
  );
  const collRecords = collQ.data?.collections ?? [];
  const tankComplianceSummary = React.useMemo(() => {
    const tempRecords = monRecords.filter((r) => r.recordType === "daily-temperature" && r.tankTemperatureCelsius != null);
    const tempInRange = tempRecords.filter((r) => Number(r.tankTemperatureCelsius) <= 4).length;
    const cleaningCount = monRecords.filter((r) => r.tankCleaned).length;
    const abrTests = monRecords.filter((r) => r.antibioticResidueResult);
    const abrPositive = abrTests.filter((r) => r.antibioticResidueResult === "positive").length;
    const abrNegative = abrTests.filter((r) => r.antibioticResidueResult === "negative").length;
    const totalCollVol = collRecords.reduce((s, c) => s + (c.volumeCollectedLitres ? parseFloat(String(c.volumeCollectedLitres)) : 0), 0);
    return { tempTotal: tempRecords.length, tempInRange, cleaningCount, abrTests: abrTests.length, abrPositive, abrNegative, totalCollVol: Math.round(totalCollVol) };
  }, [monRecords, collRecords]);
  function generateTankReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const s = tankComplianceSummary;
    const tempPct = s.tempTotal > 0 ? Math.round(s.tempInRange / s.tempTotal * 100) : null;
    const monRows = [...monRecords].sort((a, b) => b.recordDate.localeCompare(a.recordDate)).map((r) => `<tr>
      <td>${new Date(r.recordDate).toLocaleDateString("en-GB")}</td>
      <td>${tanks.find((t) => t.id === r.tankId)?.name ?? "—"}</td>
      <td>${r.recordType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td>
      <td>${r.tankTemperatureCelsius != null ? `${r.tankTemperatureCelsius}°C${Number(r.tankTemperatureCelsius) <= 4 ? "" : " ⚠"}` : "—"}</td>
      <td>${r.tankCleaned ? "Yes" : "No"}</td>
      <td>${r.cleaningProductUsed || "—"}</td>
      <td>${r.antibioticResidueResult ? r.antibioticResidueResult === "positive" ? "<b style='color:#b91c1c'>POSITIVE ⚠</b>" : "Negative" : "—"}</td>
      <td style="font-size:9px">${r.notes || "—"}</td>
    </tr>`).join("");
    const collRows = [...collRecords].sort((a, b) => b.collectionDate.localeCompare(a.collectionDate)).map((c) => `<tr>
      <td>${new Date(c.collectionDate).toLocaleDateString("en-GB")}</td>
      <td>${tanks.find((t) => t.id === c.tankId)?.name ?? "—"}</td>
      <td>${c.volumeCollectedLitres ? `${Number(c.volumeCollectedLitres).toLocaleString()} L` : "—"}</td>
      <td>${c.milkBuyer || "—"}</td>
      <td>${c.collectionRef || "—"}</td>
      <td>${c.abtResultBeforeCollection ? c.abtResultBeforeCollection === "positive" ? "<b style='color:#b91c1c'>POSITIVE ⚠</b>" : "Negative" : "—"}</td>
      <td>${c.pencePerLitre ? `${parseFloat(c.pencePerLitre).toFixed(2)}ppl` : "—"}</td>
      <td>${c.netPaymentPence != null ? `£${(c.netPaymentPence / 100).toFixed(2)}` : "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Bulk Tank — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:18px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Bulk Tank — Monitoring &amp; Compliance Report</h1><h2>Red Tractor Dairy Scheme</h2></div>
  <div class="hdr-r">${tanks.length} tank${tanks.length !== 1 ? "s" : ""} registered<br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${tempPct != null ? `${tempPct}%` : "—"}</div><div class="kpi-lbl">Temp ≤4°C compliance (${s.tempInRange}/${s.tempTotal} checks)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.cleaningCount}</div><div class="kpi-lbl">Cleaning records</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.abrPositive > 0 ? `<span style="color:#b91c1c">${s.abrPositive} POSITIVE</span>` : s.abrNegative}</div><div class="kpi-lbl">ABR tests (tank monitoring)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.totalCollVol.toLocaleString()} L</div><div class="kpi-lbl">Total milk collected</div></div>
</div>
${monRows ? `<h3>Tank Monitoring Records</h3><table><tr><th>Date</th><th>Tank</th><th>Type</th><th>Temperature</th><th>Cleaned</th><th>Product</th><th>ABR Result</th><th>Notes</th></tr>${monRows}</table>` : ""}
${collRows ? `<h3>Milk Collections</h3><table><tr><th>Date</th><th>Tank</th><th>Volume</th><th>Buyer</th><th>Ref</th><th>ABR (pre-collection)</th><th>ppl</th><th>Net payment</th></tr>${collRows}</table>` : ""}
<p class="note">Bulk tank compliance report produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires daily temperature records, regular cleaning logs, and pre-collection ABR testing. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-gray-800", children: "Compliance Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateTankReport, disabled: monRecords.length === 0 && collRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: tankComplianceSummary.tempTotal > 0 ? `${Math.round(tankComplianceSummary.tempInRange / tankComplianceSummary.tempTotal * 100)}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Temp ≤4°C compliance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            tankComplianceSummary.tempInRange,
            "/",
            tankComplianceSummary.tempTotal,
            " checks"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: tankComplianceSummary.cleaningCount || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Cleaning records" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          tankComplianceSummary.abrPositive > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-red-700", children: [
            tankComplianceSummary.abrPositive,
            " positive"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: tankComplianceSummary.abrNegative || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "ABR tests" }),
          tankComplianceSummary.abrPositive > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 font-medium", children: "Action required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-blue-700", children: tankComplianceSummary.totalCollVol > 0 ? `${tankComplianceSummary.totalCollVol.toLocaleString()} L` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Total milk collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            collRecords.length,
            " collection",
            collRecords.length !== 1 ? "s" : ""
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
          onClick: () => setTanksOpen((o) => !o),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "Registered Bulk Tanks (",
              tanks.length,
              ")"
            ] }),
            tanksOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-500" })
          ]
        }
      ),
      tanksOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Register each bulk tank on the holding. Once registered, select the tank when logging monitoring records or milk collections." }),
        tanksQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : tanks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No tanks registered yet. Add your first tank below." }) : tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-white border rounded px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: t.name }),
            t.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              "· ",
              t.location
            ] }),
            t.capacityLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              "· ",
              Number(t.capacityLitres).toLocaleString(),
              " L"
            ] }),
            t.latitudeDeg != null && t.longitudeDeg != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `https://maps.google.com/?q=${t.latitudeDeg},${t.longitudeDeg}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline",
                title: "View on Google Maps",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                  "GPS"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", title: "View QR code", onClick: () => setQrTank(t), children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEditTank(t), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => delTank.mutate(t.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, t.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAddTank, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          "Add Tank"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-gray-800", children: "Tank Monitoring Records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Daily temperature checks, cleaning, antibiotic residue tests, and maintenance logs." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monYearFilter, onValueChange: setMonYearFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[110px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
              monYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddMon, disabled: tanksQ.isLoading || tanks.length === 0, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Add Record"
          ] })
        ] })
      ] }),
      !tanksQ.isLoading && tanks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-500 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "No tanks registered." }),
          " You must register at least one bulk tank before adding monitoring records. Use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Registered Bulk Tanks" }),
          " section above to add your first tank."
        ] })
      ] }),
      monQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : !monRecords.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: allMonRecords.length ? "No records for selected year." : "No monitoring records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: monRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.recordDate) }),
            r.tankId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: tankName(r.tankId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 capitalize", children: r.recordType.replace(/-/g, " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TempBadge, { v: r.tankTemperatureCelsius }),
            r.tankCleaned && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              "Cleaned"
            ] }),
            r.cleaningProductUsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: r.cleaningProductUsed }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AbrBadge, { result: r.antibioticResidueResult }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "dairy/bulk-tank-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["dairy-tank-records", farmId], compact: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewMon(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEditMon(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => delMon.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
      ] }) }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: tankDialog, onOpenChange: (o) => {
      setTankDialog(o);
      if (!o) saveTank.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingTank ? "Edit Tank" : "Add Bulk Tank" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank Name / Designation *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Tank 1, Main Tank, Overflow Tank", value: tankForm.name || "", onChange: (e) => setTankForm((f) => ({ ...f, name: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location on Holding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Main Dairy, North Unit", value: tankForm.location || "", onChange: (e) => setTankForm((f) => ({ ...f, location: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "e.g. 12000", value: tankForm.capacityLitres || "", onChange: (e) => setTankForm((f) => ({ ...f, capacityLitres: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-blue-500" }),
            "GPS Location (optional)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1.5", children: "Set coordinates so the tank appears on the farm map. Use the mobile app to capture GPS automatically, or enter manually below." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-normal text-gray-500", children: "Latitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.000001", placeholder: "e.g. 51.507351", value: tankForm.latitudeDeg ?? "", onChange: (e) => setTankForm((f) => ({ ...f, latitudeDeg: e.target.value ? parseFloat(e.target.value) : null })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-normal text-gray-500", children: "Longitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.000001", placeholder: "e.g. -0.127758", value: tankForm.longitudeDeg ?? "", onChange: (e) => setTankForm((f) => ({ ...f, longitudeDeg: e.target.value ? parseFloat(e.target.value) : null })) })
            ] })
          ] }),
          tankForm.latitudeDeg != null && tankForm.longitudeDeg != null && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `https://maps.google.com/?q=${tankForm.latitudeDeg},${tankForm.longitudeDeg}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline mt-1 inline-block", children: "Preview on Google Maps →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: tankForm.notes || "", onChange: (e) => setTankForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveTank, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTankDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveTank.mutate(tankForm), disabled: saveTank.isPending || !tankForm.name?.trim(), children: [
          saveTank.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editingTank ? "Save Changes" : "Add Tank"
        ] })
      ] })
    ] }) }),
    qrTank && (() => {
      const qrValue = `BDE:F${farmId}:TNK-${qrTank.id}`;
      function downloadQr() {
        const svg = document.getElementById(`tank-qr-${qrTank.id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 400, 480);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 50, 40, 300, 300);
          ctx.fillStyle = "#111827";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(qrTank.name, 200, 380);
          ctx.font = "14px sans-serif";
          ctx.fillStyle = "#6b7280";
          ctx.fillText("BDE Farm Trac · Bulk Tank", 200, 406);
          ctx.fillText(`TNK-${qrTank.id}`, 200, 430);
          const link = document.createElement("a");
          link.download = `tank-qr-${qrTank.name.replace(/\s+/g, "-")}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setQrTank(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "24rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-4 w-4" }),
          "QR Label — ",
          qrTank.name
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { id: `tank-qr-${qrTank.id}`, value: qrValue, size: 220, level: "H", includeMargin: false }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-gray-800", children: qrTank.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "BDE Farm Trac · Bulk Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-mono text-gray-400 mt-0.5", children: [
              "TNK-",
              qrTank.id
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 text-center", children: "Scan with the BDE Farm Trac mobile app to log monitoring records, cleaning events, or view tank details without manual selection." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setQrTank(null), children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: downloadQr, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1.5" }),
            "Download PNG"
          ] })
        ] })
      ] }) });
    })(),
    viewMon && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewMon(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Monitoring Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewMon.recordDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Tank" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: tankName(viewMon.tankId) ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Record Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewMon.recordType.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.tankTemperatureCelsius ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Tank Cleaned" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.tankCleaned ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cleaning Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.cleaningProductUsed ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cleaning Batch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.cleaningProductBatch ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewMon.antibioticResidueResult ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Test Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.antibioticResidueTestRef ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.notes ?? "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEditMon(viewMon);
          setViewMon(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewMon(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: monDialog, onOpenChange: (o) => {
      setMonDialog(o);
      if (!o) saveMon.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingMon ? "Edit Monitoring Record" : "Add Monitoring Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: monForm.recordDate?.slice(0, 10) || "", onChange: (e) => setMon("recordDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.tankId ? String(monForm.tankId) : "__none__", onValueChange: (v) => setMon("tankId", v !== "__none__" ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(t.id), children: [
                t.name,
                t.location ? ` — ${t.location}` : ""
              ] }, t.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Record Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.recordType || "daily-temperature", onValueChange: (v) => setMon("recordType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily-temperature", children: "Daily Temperature Check" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cleaning", children: "Tank Cleaning" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "antibiotic-residue-test", children: "Antibiotic Residue Test" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "maintenance", children: "Tank Maintenance" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: monForm.tankTemperatureCelsius || "", onChange: (e) => setMon("tankTemperatureCelsius", e.target.value), placeholder: "Target ≤4°C" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "tc", checked: !!monForm.tankCleaned, onChange: (e) => setMon("tankCleaned", e.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tc", children: "Tank cleaned and sanitised" })
        ] }),
        monForm.tankCleaned && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cleaning Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.cleaningProductUsed || "", onChange: (e) => setMon("cleaningProductUsed", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.cleaningProductBatch || "", onChange: (e) => setMon("cleaningProductBatch", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Antibiotic Residue Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.antibioticResidueResult || "", onValueChange: (v) => setMon("antibioticResidueResult", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not tested" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borderline", children: "Borderline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invalid", children: "Invalid (test void)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.antibioticResidueTestRef || "", onChange: (e) => setMon("antibioticResidueTestRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: monForm.notes || "", onChange: (e) => setMon("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMon, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMonDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveMon.mutate(monForm), disabled: saveMon.isPending || !monForm.recordDate, children: [
          saveMon.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editingMon ? "Save Changes" : "Add Record"
        ] })
      ] })
    ] }) }),
    showCollections && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm text-gray-800", children: [
              "Milk Collections (",
              collRecords.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Record each milk uplift with volumes, financial settlement, and buyer quality results." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddColl, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Log Collection"
          ] })
        ] }),
        collQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) }) : collRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-6 text-center text-sm text-gray-400 italic", children: "No milk collections recorded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: [...collRecords].sort((a, b) => b.collectionDate.localeCompare(a.collectionDate)).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(c.collectionDate) }),
            c.tankId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: tankName(c.tankId) }),
            c.milkBuyer && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: c.milkBuyer }),
            c.volumeCollectedLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded", children: [
              parseFloat(String(c.volumeCollectedLitres)).toLocaleString(),
              " L"
            ] }),
            c.pencePerLitre && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              parseFloat(String(c.pencePerLitre)).toFixed(2),
              "ppl"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatementBadge, { pencePerLitre: c.pencePerLitre, netPaymentPence: c.netPaymentPence }),
            c.buyerSccThousands != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded ${c.buyerSccThousands < 100 ? "bg-green-50 text-green-700" : c.buyerSccThousands < 200 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`, children: [
              "SCC: ",
              c.buyerSccThousands,
              "k"
            ] }),
            c.buyerBactoscanThousands != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded", children: [
              "Bact: ",
              c.buyerBactoscanThousands,
              "k"
            ] }),
            c.buyerTvcCfuMl != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: [
              "TVC: ",
              c.buyerTvcCfuMl.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-gray-500 hover:text-gray-800", title: "Enter milk statement details", onClick: () => openStmtDialog(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => openEditColl(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-red-500 hover:text-red-700", onClick: () => setPendingDelColl(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: collDialog, onOpenChange: (o) => {
        setCollDialog(o);
        if (!o) saveColl.reset();
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editingColl ? "Edit" : "Log",
          " Milk Collection"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1", children: "Collection Details" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: collForm.collectionDate || "", onChange: (e) => setColl("collectionDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bulk Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(collForm.tankId ?? "__none__"), onValueChange: (v) => setColl("tankId", v === "__none__" ? null : parseInt(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tank" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No tank" }),
                tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: t.name }, t.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume Collected (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: collForm.volumeCollectedLitres ?? "", onChange: (e) => setColl("volumeCollectedLitres", e.target.value), placeholder: "e.g. 8500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Buyer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.milkBuyer || "", onChange: (e) => setColl("milkBuyer", e.target.value), placeholder: "e.g. Müller, Arla" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tanker Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.tankerRegistration || "", onChange: (e) => setColl("tankerRegistration", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tanker Driver" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.tankerDriverName || "", onChange: (e) => setColl("tankerDriverName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.collectionRef || "", onChange: (e) => setColl("collectionRef", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Result (pre-collection)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.abtResultBeforeCollection || "", onChange: (e) => setColl("abtResultBeforeCollection", e.target.value), placeholder: "e.g. Negative" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1", children: "Financial Settlement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-2", children: "These details arrive with your milk statement — leave blank at collection time and fill in once the statement is received." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statement Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.statementRef || "", onChange: (e) => setColl("statementRef", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pence per Litre" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.pencePerLitre ?? "", onChange: (e) => setColl("pencePerLitre", e.target.value), placeholder: "e.g. 35.50" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.grossValuePence != null ? (collForm.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setColl("grossValuePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null), placeholder: "e.g. 3018.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Bonus (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.qualityBonusPence != null ? (collForm.qualityBonusPence / 100).toFixed(2) : "", onChange: (e) => setColl("qualityBonusPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Penalty (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.qualityPenaltyPence != null ? (collForm.qualityPenaltyPence / 100).toFixed(2) : "", onChange: (e) => setColl("qualityPenaltyPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport Deduction (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.transportDeductionPence != null ? (collForm.transportDeductionPence / 100).toFixed(2) : "", onChange: (e) => setColl("transportDeductionPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.netPaymentPence != null ? (collForm.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setColl("netPaymentPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium", onClick: () => setShowCollQuality((v) => !v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5" }),
            showCollQuality ? "Hide" : "Add",
            " Buyer Quality Results (from milk statement)"
          ] }) }),
          showCollQuality && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-0.5", children: "Buyer Quality Results" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer SCC (k/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerSccThousands ?? "", onChange: (e) => setColl("buyerSccThousands", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 120" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bactoscan (k/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerBactoscanThousands ?? "", onChange: (e) => setColl("buyerBactoscanThousands", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TVC (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerTvcCfuMl ?? "", onChange: (e) => setColl("buyerTvcCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thermodurics (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerThermsCfuMl ?? "", onChange: (e) => setColl("buyerThermsCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Coliforms (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerColiformsCfuMl ?? "", onChange: (e) => setColl("buyerColiformsCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Fat%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerFatPercent ?? "", onChange: (e) => setColl("buyerFatPercent", e.target.value), placeholder: "e.g. 4.15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Protein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerProteinPercent ?? "", onChange: (e) => setColl("buyerProteinPercent", e.target.value), placeholder: "e.g. 3.30" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Casein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerCaseinPercent ?? "", onChange: (e) => setColl("buyerCaseinPercent", e.target.value), placeholder: "e.g. 2.60" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lactose%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerLactosePercent ?? "", onChange: (e) => setColl("buyerLactosePercent", e.target.value), placeholder: "e.g. 4.70" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Urea (mmol/L)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: collForm.buyerUreaMillimolesPerLitre ?? "", onChange: (e) => setColl("buyerUreaMillimolesPerLitre", e.target.value), placeholder: "e.g. 4.5" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: collForm.notes || "", onChange: (e) => setColl("notes", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveColl, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCollDialog(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveColl.mutate(collForm), disabled: saveColl.isPending || !collForm.collectionDate, children: [
            saveColl.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
            editingColl ? "Save Changes" : "Log Collection"
          ] })
        ] })
      ] }) }),
      stmtColl && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: stmtDialog, onOpenChange: (o) => {
        setStmtDialog(o);
        if (!o) {
          saveStmt.reset();
          setStmtColl(null);
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "34rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-gray-500" }),
            "Milk Statement Details"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
            formatDate(stmtColl.collectionDate),
            stmtColl.milkBuyer ? ` · ${stmtColl.milkBuyer}` : "",
            stmtColl.volumeCollectedLitres ? ` · ${parseFloat(String(stmtColl.volumeCollectedLitres)).toLocaleString()} L` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1", children: "Financial Settlement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-2", children: "Fill these in once you receive your milk statement (usually 1–2 weeks after collection)." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statement Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stmtForm.statementRef || "", onChange: (e) => setStmt("statementRef", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pence per Litre" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.pencePerLitre ?? "", onChange: (e) => setStmt("pencePerLitre", e.target.value), placeholder: "e.g. 35.50" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.grossValuePence != null ? (stmtForm.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setStmt("grossValuePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null), placeholder: "e.g. 3018.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Bonus (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.qualityBonusPence != null ? (stmtForm.qualityBonusPence / 100).toFixed(2) : "", onChange: (e) => setStmt("qualityBonusPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Penalty (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.qualityPenaltyPence != null ? (stmtForm.qualityPenaltyPence / 100).toFixed(2) : "", onChange: (e) => setStmt("qualityPenaltyPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport Deduction (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.transportDeductionPence != null ? (stmtForm.transportDeductionPence / 100).toFixed(2) : "", onChange: (e) => setStmt("transportDeductionPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.netPaymentPence != null ? (stmtForm.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setStmt("netPaymentPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium", onClick: () => setShowStmtQuality((v) => !v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5" }),
            showStmtQuality ? "Hide" : "Add",
            " Buyer Quality Results"
          ] }) }),
          showStmtQuality && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-0.5", children: "Buyer Quality Results" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer SCC (k/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stmtForm.buyerSccThousands ?? "", onChange: (e) => setStmt("buyerSccThousands", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 120" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bactoscan (k/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stmtForm.buyerBactoscanThousands ?? "", onChange: (e) => setStmt("buyerBactoscanThousands", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TVC (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stmtForm.buyerTvcCfuMl ?? "", onChange: (e) => setStmt("buyerTvcCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thermodurics (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stmtForm.buyerThermsCfuMl ?? "", onChange: (e) => setStmt("buyerThermsCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Coliforms (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stmtForm.buyerColiformsCfuMl ?? "", onChange: (e) => setStmt("buyerColiformsCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Fat%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.buyerFatPercent ?? "", onChange: (e) => setStmt("buyerFatPercent", e.target.value), placeholder: "e.g. 4.15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Protein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.buyerProteinPercent ?? "", onChange: (e) => setStmt("buyerProteinPercent", e.target.value), placeholder: "e.g. 3.30" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Casein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.buyerCaseinPercent ?? "", onChange: (e) => setStmt("buyerCaseinPercent", e.target.value), placeholder: "e.g. 2.60" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lactose%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stmtForm.buyerLactosePercent ?? "", onChange: (e) => setStmt("buyerLactosePercent", e.target.value), placeholder: "e.g. 4.70" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Urea (mmol/L)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: stmtForm.buyerUreaMillimolesPerLitre ?? "", onChange: (e) => setStmt("buyerUreaMillimolesPerLitre", e.target.value), placeholder: "e.g. 4.5" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveStmt, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setStmtDialog(false);
            setStmtColl(null);
            saveStmt.reset();
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveStmt.mutate(stmtForm), disabled: saveStmt.isPending, children: [
            saveStmt.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
            "Save Statement Details"
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelColl !== null,
        title: "Delete collection record",
        message: "Delete this collection record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delColl,
        onConfirm: () => {
          if (pendingDelColl !== null) delColl.mutate(pendingDelColl, { onSuccess: () => setPendingDelColl(null) });
        },
        onCancel: () => {
          setPendingDelColl(null);
          delColl.reset();
        }
      }
    )
  ] });
}
function calcFpr(fat, protein) {
  if (!fat || !protein) return null;
  const f = parseFloat(fat);
  const p = parseFloat(protein);
  if (!p) return null;
  return f / p;
}
function FprBadge({ fat, protein }) {
  const ratio = calcFpr(fat, protein);
  if (ratio === null) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const display = ratio.toFixed(2);
  let cls = "bg-green-100 text-green-800";
  let tip = "Target";
  if (ratio < 1) {
    cls = "bg-red-100 text-red-800";
    tip = "Acidosis Risk";
  } else if (ratio < 1.2) {
    cls = "bg-amber-100 text-amber-800";
    tip = "Below Target";
  } else if (ratio > 1.5) {
    cls = "bg-amber-100 text-amber-800";
    tip = "Check Energy";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`, children: [
    display,
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-60", children: [
      "(",
      tip,
      ")"
    ] })
  ] });
}
function RecordingVisitsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [showChart, setShowChart] = reactExports.useState(false);
  const [pendingDel, setPendingDel] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-recording-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/recording-visits`), { credentials: "include" }).then((r) => r.json())
  });
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const herds = herdsQ.data?.herds ?? [];
  const animalsQ = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const [animalSearch, setAnimalSearch] = reactExports.useState("");
  const allAnimals = animalsQ.data?.animals ?? [];
  const visits = data?.visits ?? [];
  const [yearFilterVisits, setYearFilterVisits] = usePersistedFilter({ page: "dairy-recording-visits", filter: "year", farmId, defaultValue: "all" });
  const yearsVisits = React.useMemo(() => Array.from(new Set(visits.map((v) => String(v.visitDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [visits]);
  const filteredVisits = yearFilterVisits === "all" ? visits : visits.filter((v) => String(v.visitDate ?? "").startsWith(yearFilterVisits));
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/recording-visits/${editing.id}`) : api(`farms/${farmId}/dairy/recording-visits`);
      const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-recording-visits", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/recording-visits/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-recording-visits", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ visitDate: today() });
    setOpen(true);
  }
  function openEdit(v) {
    setEditing(v);
    setForm({ ...v });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const chartData = [...visits].reverse().slice(-24).map((v) => {
    const fpr = calcFpr(v.avgFatPercent, v.avgProteinPercent);
    return {
      date: new Date(v.visitDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      scc: v.avgSccThousands ?? null,
      fat: v.avgFatPercent != null ? parseFloat(v.avgFatPercent) : null,
      protein: v.avgProteinPercent != null ? parseFloat(v.avgProteinPercent) : null,
      lactose: v.avgLactosePercent != null ? parseFloat(v.avgLactosePercent) : null,
      fpr: fpr != null ? parseFloat(fpr.toFixed(2)) : null
    };
  });
  const hasTrend = chartData.some((d) => d.scc !== null || d.fat !== null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Log monthly NMR recording visits — herd average SCC, fat%, protein%, and Fat:Protein Ratio analysis." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterVisits, onValueChange: setYearFilterVisits, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsVisits.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        hasTrend && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowChart((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-4 w-4 mr-1" }),
          showChart ? "Hide" : "Trend",
          " Chart"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Log Visit"
        ] })
      ] })
    ] }),
    showChart && hasTrend && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: [
        "Herd Trends — Last ",
        chartData.length,
        " Recording Visits"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Herd Average SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, left: 0, bottom: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", strokeOpacity: 0.4 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} k/mL`, "SCC"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 200, stroke: "#f97316", strokeDasharray: "5 3", strokeOpacity: 0.6, label: { value: "200k", position: "right", fontSize: 9, fill: "#f97316" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "scc", fill: "#3b82f6", fillOpacity: 0.75, radius: [3, 3, 0, 0], name: "SCC" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Fat%, Protein% & Fat:Protein Ratio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 30, left: 0, bottom: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", strokeOpacity: 0.4 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "pct", tick: { fontSize: 10 }, domain: [2, 6], unit: "%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "fpr", orientation: "right", tick: { fontSize: 10 }, domain: [0.8, 2] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [name === "F:P Ratio" ? v.toFixed(2) : `${v}%`, name] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { yAxisId: "fpr", y: 1.2, stroke: "#f97316", strokeDasharray: "4 3", strokeOpacity: 0.6, label: { value: "FPR 1.2", position: "right", fontSize: 9, fill: "#f97316" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "pct", type: "monotone", dataKey: "fat", stroke: "#f59e0b", strokeWidth: 2, dot: { r: 3 }, name: "Fat%", connectNulls: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "pct", type: "monotone", dataKey: "protein", stroke: "#10b981", strokeWidth: 2, dot: { r: 3 }, name: "Protein%", connectNulls: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "fpr", type: "monotone", dataKey: "fpr", stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "5 3", dot: { r: 3 }, name: "F:P Ratio", connectNulls: true })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2", children: "F:P Ratio target: 1.2–1.5. Below 1.2 may indicate subclinical acidosis; above 1.5 may indicate energy deficit or ketosis risk." })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-500 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      "Loading…"
    ] }) : filteredVisits.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No recording visits logged yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Log your first NMR recording visit to start tracking herd quality trends." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Visit Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Recorder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Cows Rec." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Avg SCC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Fat%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Protein%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-center font-medium text-gray-600", children: "F:P Ratio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Alert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredVisits.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => setViewRec(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: formatDate(v.visitDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: v.recorderName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
          v.cowsRecorded ?? "—",
          v.cowsInMilk ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 text-xs ml-1", children: [
            "/",
            v.cowsInMilk
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: v.avgSccThousands }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: v.avgFatPercent ? `${parseFloat(v.avgFatPercent).toFixed(2)}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: v.avgProteinPercent ? `${parseFloat(v.avgProteinPercent).toFixed(2)}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FprBadge, { fat: v.avgFatPercent, protein: v.avgProteinPercent }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: v.qualityAlert ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-amber-700 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          v.qualityAlert
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRec(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => setPendingDel(v.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) })
      ] }, v.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Recording Visit — ",
        formatDate(viewRec.visitDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-sm overflow-y-auto max-h-[70vh]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Visit Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Visit Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRec.visitDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Recorder Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.recorderName || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Recorder Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.recorderNumber || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Next Visit Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRec.nextVisitDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cows in Milk" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.cowsInMilk ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cows Recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.cowsRecorded ?? "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Herd Averages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Avg Yield / Cow / Day" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgYieldLitresPerDay ? `${parseFloat(viewRec.avgYieldLitresPerDay).toFixed(1)} L` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Fat%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgFatPercent ? `${parseFloat(viewRec.avgFatPercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Protein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgProteinPercent ? `${parseFloat(viewRec.avgProteinPercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Lactose%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgLactosePercent ? `${parseFloat(viewRec.avgLactosePercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Casein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgCaseinPercent ? `${parseFloat(viewRec.avgCaseinPercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Urea" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgUreaMillimolesPerLitre ? `${parseFloat(viewRec.avgUreaMillimolesPerLitre).toFixed(1)} mmol/L` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Herd Avg SCC" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: viewRec.avgSccThousands })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fat:Protein Ratio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FprBadge, { fat: viewRec.avgFatPercent, protein: viewRec.avgProteinPercent })
            ] })
          ] })
        ] }),
        (viewRec.highSccCount || viewRec.highSccAnimalTags) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "High-SCC Animals (>200k)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Count Above 200k" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-700", children: viewRec.highSccCount ?? "—" })
          ] }) }),
          viewRec.highSccAnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Animals Selected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: viewRec.highSccAnimalTags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono", children: tag }, tag)) })
          ] })
        ] }),
        (viewRec.qualityAlert || viewRec.notes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 space-y-2", children: [
          viewRec.qualityAlert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-700 mb-0.5", children: "Quality Alert" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-800", children: viewRec.qualityAlert })
            ] })
          ] }),
          viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-line", children: viewRec.notes })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRec(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Log",
        " Recording Visit"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Visit Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.visitDate || "", onChange: (e) => set("visitDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId ?? "__none__"), onValueChange: (v) => set("herdId", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All herds" }),
              herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorder Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.recorderName || "", onChange: (e) => set("recorderName", e.target.value), placeholder: "NMR recorder's name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorder Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.recorderNumber || "", onChange: (e) => set("recorderNumber", e.target.value), placeholder: "NMR employee number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cows in Milk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.cowsInMilk ?? "", onChange: (e) => set("cowsInMilk", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cows Recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.cowsRecorded ?? "", onChange: (e) => set("cowsRecorded", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1", children: "NMR Report Results" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Yield / Cow / Day (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.avgYieldLitresPerDay ?? "", onChange: (e) => set("avgYieldLitresPerDay", e.target.value), placeholder: "e.g. 28.5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.avgSccThousands ?? "", onChange: (e) => set("avgSccThousands", e.target.value), placeholder: "e.g. 150" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Fat%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgFatPercent ?? "", onChange: (e) => set("avgFatPercent", e.target.value), placeholder: "e.g. 4.15" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Protein%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgProteinPercent ?? "", onChange: (e) => set("avgProteinPercent", e.target.value), placeholder: "e.g. 3.30" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Lactose%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgLactosePercent ?? "", onChange: (e) => set("avgLactosePercent", e.target.value), placeholder: "e.g. 4.70" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Casein%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgCaseinPercent ?? "", onChange: (e) => set("avgCaseinPercent", e.target.value), placeholder: "e.g. 2.60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Urea (mmol/L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.avgUreaMillimolesPerLitre ?? "", onChange: (e) => set("avgUreaMillimolesPerLitre", e.target.value), placeholder: "e.g. 4.5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col justify-center pt-4", children: form.avgFatPercent && form.avgProteinPercent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Calculated F:P Ratio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FprBadge, { fat: form.avgFatPercent, protein: form.avgProteinPercent })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-2", children: "High-SCC Animals (>200k)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Count Above 200k" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.highSccCount ?? "", onChange: (e) => set("highSccCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Visit Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextVisitDate || "", onChange: (e) => set("nextVisitDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "High-SCC Animals — Livestock Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-1.5 mt-0.5", children: "Select animals flagged above 200k on this visit." }),
          (() => {
            const selectedTags = (form.highSccAnimalTags || "").split(",").map((t) => t.trim()).filter(Boolean);
            const herdAnimals = allAnimals.filter((a) => !form.herdId || a.herdId === form.herdId);
            const filteredA = herdAnimals.filter((a) => {
              if (!animalSearch) return true;
              const tag = (a.earTagNumber || a.tagNumber || "").toLowerCase();
              return tag.includes(animalSearch.toLowerCase());
            });
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by ear tag…", value: animalSearch, onChange: (e) => setAnimalSearch(e.target.value), className: "border-0 border-b rounded-none text-sm" }),
              selectedTags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 px-2 py-1.5 bg-amber-50 border-b", children: selectedTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800 text-xs font-mono", children: [
                tag,
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-amber-500 hover:text-red-600 ml-0.5 leading-none", onClick: () => {
                  const next = selectedTags.filter((t) => t !== tag);
                  set("highSccAnimalTags", next.join(", "));
                }, children: "×" })
              ] }, tag)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-36 overflow-y-auto", children: herdAnimals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 px-3 py-2 italic", children: animalsQ.isLoading ? "Loading animals…" : "No animals found — add animals to the livestock register first." }) : filteredA.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 px-3 py-2 italic", children: "No animals match your search." }) : filteredA.map((a) => {
                const tag = a.earTagNumber || a.tagNumber || `Animal #${a.id}`;
                const isSel = selectedTags.includes(tag);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: `w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${isSel ? "bg-amber-50" : ""}`,
                    onClick: () => {
                      const next = isSel ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];
                      set("highSccAnimalTags", next.join(", "));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${isSel ? "bg-amber-500 border-amber-500 text-white" : "border-gray-300 bg-white"}`, children: isSel && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-2.5 w-2.5" }) }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Alert / NMR Action Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.qualityAlert || "", onChange: (e) => set("qualityAlert", e.target.value), placeholder: "Any action note from the NMR report" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value), placeholder: "Additional observations…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Log Visit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDel !== null,
        title: "Delete recording visit",
        message: "Delete this recording visit?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (pendingDel !== null) del.mutate(pendingDel, { onSuccess: () => setPendingDel(null) });
        },
        onCancel: () => {
          setPendingDel(null);
          del.reset();
        }
      }
    )
  ] });
}
export {
  BcsTab as B,
  MobilityTab as M,
  RecordingVisitsTab as R,
  BulkTankTab as a
};
