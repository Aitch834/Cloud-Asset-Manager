import { b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, L as Label, I as Input, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, N as DialogMutationError, O as React } from "./index-CR3lChv3.js";
import { u as usePersistedTab } from "./use-persisted-tab-C0T-lg69.js";
import { A as AppLayout, r as Bug, I as Info } from "./AppLayout-oWIdmNtK.js";
import { T as TabBar, a as TabButton } from "./tab-button-KaLGnVua.js";
import { T as Textarea } from "./textarea-BgpPGvOR.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C7vaTNW-.js";
import { C as ConfirmDialog } from "./confirm-dialog-na40LZPK.js";
import { B as Badge } from "./badge-JJtczVhs.js";
import { S as ShieldCheck } from "./shield-check-Dxp9XfqL.js";
import { P as Package } from "./use-safe-clerk-CcwL31Va.js";
import { T as TriangleAlert } from "./triangle-alert-BsVdHgKp.js";
import { P as Printer } from "./printer-CGFGuJAg.js";
import { P as Pen } from "./pen-C-1P7MIc.js";
import { S as Save } from "./save-Cy3GuG6Y.js";
import { P as Phone } from "./phone-YuAkOuw5.js";
import { M as Mail } from "./mail-D86iodYV.js";
import { T as Target } from "./target-RYX0xup_.js";
import { E as Eye } from "./eye-Di0U0DZm.js";
import { T as Trash2 } from "./trash-2-DQHM9Xwt.js";
import { E as ExternalLink } from "./external-link-_JX9dWc7.js";
import { R as Receipt } from "./receipt-DJY1Z50i.js";
import "./database-n_SJ4gKn.js";
import "./shield-alert-CiH_J1fs.js";
import "./tractor-BNYAgg-9.js";
import "./index-DNHkEb_N.js";
import "./index-H5-spA39.js";
import "./chevron-up-CQvHCWU0.js";
function parseAltSuppliers(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) return parsed;
  } catch {
  }
  return null;
}
function parseEmergencyContacts(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) return parsed;
  } catch {
  }
  return null;
}
function altSuppliersToText(raw) {
  const parsed = parseAltSuppliers(raw);
  if (parsed) {
    return parsed.map((s) => [s.name, s.phone ? `Phone: ${s.phone}` : "", s.notes ? `Notes: ${s.notes}` : ""].filter(Boolean).join("\n")).join("\n\n");
  }
  return raw ? String(raw) : "";
}
function emergencyContactsToText(raw) {
  const parsed = parseEmergencyContacts(raw);
  if (parsed) {
    return parsed.map((c) => [c.name, c.role ? `Role: ${c.role}` : "", c.phone ? `Phone: ${c.phone}` : ""].filter(Boolean).join("\n")).join("\n\n");
  }
  return raw ? String(raw) : "";
}
const SPECIES = ["cattle", "sheep", "pigs", "poultry", "horses", "goats", "mixed", "other"];
const INCIDENT_TYPES = [
  { value: "disease_suspicion", label: "Disease Suspicion" },
  { value: "notifiable_disease", label: "Notifiable Disease" },
  { value: "illness_outbreak", label: "Illness Outbreak" },
  { value: "injury", label: "Injury" },
  { value: "other", label: "Other" }
];
const NOTIFIABLE_DISEASES = [
  "Foot and Mouth Disease (FMD)",
  "Bluetongue",
  "Avian Influenza (AI)",
  "African Swine Fever (ASF)",
  "Classical Swine Fever",
  "Brucellosis",
  "Bovine Tuberculosis (bTB)",
  "Anthrax",
  "Swine Vesicular Disease",
  "Newcastle Disease",
  "Lumpy Skin Disease",
  "Sheep and Goat Pox",
  "Other notifiable disease"
];
const CONCERN_TYPES = [
  { value: "contamination", label: "Suspected Contamination" },
  { value: "mislabelling", label: "Mislabelling / Wrong Product" },
  { value: "supplier_recall", label: "Supplier-Issued Recall" },
  { value: "disease_link", label: "Linked to Disease Incident" },
  { value: "regulatory_advice", label: "Regulatory / APHA Advice" },
  { value: "other", label: "Other" }
];
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function StatusBadge({ status }) {
  if (status === "open") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Open" });
  if (status === "monitoring") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "Monitoring" });
  if (status === "resolved") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dcfce7", color: "#166534", border: "none" }, children: "Resolved" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", children: status });
}
function NotifiableBadge() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }, children: "⚠ Notifiable Disease" });
}
function ViewRow({ label, value }) {
  if (!value && value !== 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[160px_1fr] gap-2 py-1 border-b border-gray-100 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500 pt-0.5", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-900", children: value })
  ] });
}
function ViewSection({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 overflow-hidden mb-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 px-3 py-1.5 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wide", children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1", children })
  ] });
}
const CN_STATUS_LABEL = { pending: "Pending", received: "Received", applied: "Applied to account", disputed: "Disputed" };
function RecallViewBody({ recall, deliveries }) {
  if (!recall) return null;
  const r = recall;
  const concernLabel = CONCERN_TYPES.find((t) => t.value === r.concernType)?.label ?? String(r.concernType ?? "");
  const matchedDelivery = r.feedBatchRef ? deliveries.find((d) => String(d.batchNumber ?? "").toLowerCase() === String(r.feedBatchRef).toLowerCase()) : void 0;
  const cnRequired = r.creditNoteRequired === true || r.creditNoteRequired === "true";
  const cnStatus = String(r.creditNoteStatus ?? "pending");
  const cnBadgeBg = cnStatus === "received" || cnStatus === "applied" ? "#dcfce7" : cnStatus === "disputed" ? "#fee2e2" : "#fef3c7";
  const cnBadgeColor = cnStatus === "received" || cnStatus === "applied" ? "#166534" : cnStatus === "disputed" ? "#991b1b" : "#92400e";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 space-y-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: String(r.status ?? "open") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }, children: concernLabel }),
      !!(r.feedWithdrawn === true || r.feedWithdrawn === "true") && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Feed withdrawn" }),
      !!(r.reportedToAuthority === true || r.reportedToAuthority === "true") && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Authority notified" }),
      !!cnRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: cnBadgeBg, color: cnBadgeColor, border: "none" }, children: [
        "Credit note: ",
        CN_STATUS_LABEL[cnStatus] ?? String(cnStatus ?? "")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ViewSection, { title: "Feed Identification", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Product name", value: String(r.productName ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Supplier", value: String(r.supplierName ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Batch / lot ref", value: String(r.feedBatchRef ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Delivery note ref", value: String(r.deliveryNoteRef ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Feed type", value: String(r.feedType ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Quantity affected", value: r.quantityKgAffected ? `${Number(r.quantityKgAffected).toLocaleString()} kg` : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Date raised", value: fmtDate(String(r.raisedDate ?? "")) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Raised by", value: String(r.raisedBy ?? "") || void 0 }),
      matchedDelivery && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[160px_1fr] gap-2 py-1 border-b border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500 pt-0.5", children: "Matched delivery" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-green-700 font-medium", children: [
          fmtDate(String(matchedDelivery.deliveryDate ?? "")),
          " — ",
          String(matchedDelivery.productName ?? ""),
          matchedDelivery.quantityKg ? ` (${Number(matchedDelivery.quantityKg).toLocaleString()} kg)` : "",
          matchedDelivery.supplierName ? ` from ${String(matchedDelivery.supplierName)}` : ""
        ] })
      ] })
    ] }),
    r.concernType === "supplier_recall" && (r.recallNoticeRef || r.recallDocumentUrl) && /* @__PURE__ */ jsxRuntimeExports.jsxs(ViewSection, { title: "Supplier Recall Notice", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Notice reference", value: String(r.recallNoticeRef ?? "") || void 0 }),
      !!r.recallDocumentUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[160px_1fr] gap-2 py-1 border-b border-gray-100 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500 pt-0.5", children: "Document" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: String(r.recallDocumentUrl), target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 hover:underline inline-flex items-center gap-1", children: [
          "Open document ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ViewSection, { title: "Reason for Concern", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap py-1", children: String(r.reasonForConcern ?? "") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ViewSection, { title: "Impact Assessment", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Feed withdrawn", value: r.feedWithdrawn === true || r.feedWithdrawn === "true" ? `Yes — ${fmtDate(String(r.withdrawalDate ?? ""))}` : "No" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Est. animals affected", value: r.estimatedAnimalsAffected ? String(r.estimatedAnimalsAffected) : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Herds affected", value: String(r.affectedHerds ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Animal health impact", value: r.animalHealthImpactObserved === true || r.animalHealthImpactObserved === "true" ? "Yes" : "No" }),
      (r.animalHealthImpactObserved === true || r.animalHealthImpactObserved === "true") && !!r.healthImpactDescription && /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Health impact detail", value: String(r.healthImpactDescription) })
    ] }),
    !!r.actionsTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs(ViewSection, { title: "Actions Taken", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap py-1", children: String(r.actionsTaken) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Disposal method", value: String(r.feedDisposalMethod ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Replacement feed", value: String(r.replacementFeedSource ?? "") || void 0 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ViewSection, { title: "Notifications", children: [
      r.concernType === "supplier_recall" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Supplier", value: "Supplier-initiated recall — they notified us" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Supplier notified", value: r.reportedToSupplier === true || r.reportedToSupplier === "true" ? `Yes — ${fmtDate(String(r.supplierNotifiedDate ?? ""))}${r.supplierReference ? ` (ref: ${String(r.supplierReference)})` : ""}` : "No" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Authority notified", value: r.reportedToAuthority === true || r.reportedToAuthority === "true" ? `${String(r.authorityName ?? "")} — ${fmtDate(String(r.authorityNotifiedDate ?? ""))}${r.authorityReference ? ` (ref: ${String(r.authorityReference)})` : ""}`.trim() || "Yes" : "No" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Vet notified", value: r.reportedToVet === true || r.reportedToVet === "true" ? `Yes — ${String(r.vetName ?? "")} on ${fmtDate(String(r.vetNotifiedDate ?? ""))}` : "No" })
    ] }),
    cnRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs(ViewSection, { title: "Credit Note", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Status", value: CN_STATUS_LABEL[cnStatus] ?? String(cnStatus ?? "") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Reference", value: String(r.creditNoteRef ?? "") || void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Value", value: r.creditNoteValueGbp ? `£${Number(r.creditNoteValueGbp).toFixed(2)}` : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Date received", value: r.creditNoteReceivedDate ? fmtDate(String(r.creditNoteReceivedDate)) : null })
    ] }),
    (r.status === "resolved" || !!r.resolutionSummary) && /* @__PURE__ */ jsxRuntimeExports.jsxs(ViewSection, { title: "Resolution", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Resolved date", value: r.resolvedDate ? fmtDate(String(r.resolvedDate)) : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewRow, { label: "Summary", value: String(r.resolutionSummary ?? "") || void 0 })
    ] }),
    !!r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(ViewSection, { title: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap py-1", children: String(r.notes) }) })
  ] });
}
function PlanSection({ title, value, onEdit }) {
  if (!value && !onEdit) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-gray-100 py-3 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: title }),
    value ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-800 whitespace-pre-wrap", children: value }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "Not completed — click Edit Plan to add this section." })
  ] });
}
function ReviewBadge({ date }) {
  if (!date) return null;
  const due = new Date(date);
  const now = /* @__PURE__ */ new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 864e5);
  if (diffDays < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Review overdue" });
  if (diffDays <= 30) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "Review due soon" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dcfce7", color: "#166534", border: "none" }, children: "Review up to date" });
}
const SPECIES_OPTIONS = [
  { value: "cattle", label: "Cattle" },
  { value: "sheep", label: "Sheep" },
  { value: "pigs", label: "Pigs" },
  { value: "poultry", label: "Poultry" },
  { value: "horses", label: "Horses / Equine" },
  { value: "goats", label: "Goats" },
  { value: "mixed", label: "Mixed species" },
  { value: "all", label: "All species (total farm)" }
];
function SpeciesStockCard({
  target,
  stockRows,
  pendingFpoCount,
  onEdit,
  onDelete
}) {
  const species = String(target.species ?? "");
  const label = target.label ? String(target.label) : SPECIES_OPTIONS.find((o) => o.value === species)?.label ?? species;
  const dailyKg = parseFloat(String(target.dailyConsumptionKg ?? "0"));
  const minDays = Number(target.minimumStockDaysTarget ?? 0);
  const threshKg = target.alertThresholdKg ? parseFloat(String(target.alertThresholdKg)) : null;
  const relevant = species === "all" ? stockRows : stockRows.filter((r) => r.speciesIntended === species);
  const totalKg = relevant.reduce((sum, r) => sum + parseFloat(r.currentStockKg ?? "0"), 0);
  const daysRemaining = dailyKg > 0 ? Math.floor(totalKg / dailyKg) : null;
  const isCritical = daysRemaining !== null && minDays > 0 && daysRemaining < Math.floor(minDays / 2);
  const isWarning = daysRemaining !== null && minDays > 0 && daysRemaining < minDays && !isCritical;
  const barPct = daysRemaining !== null && minDays > 0 ? Math.min(100, Math.round(daysRemaining / (minDays * 2) * 100)) : daysRemaining !== null ? 100 : null;
  const barColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
  const bg = isCritical ? "#fff5f5" : isWarning ? "#fffbeb" : "#f0fdf4";
  const border = isCritical ? "#fca5a5" : isWarning ? "#fde68a" : "#bbf7d0";
  const textColor = isCritical ? "#b91c1c" : isWarning ? "#92400e" : "#166534";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg p-4", style: { background: bg, border: `1px solid ${border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-sm font-semibold text-gray-800", children: label }),
        String(target.label ?? "") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 capitalize", children: [
          species,
          " feed stocks"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        daysRemaining !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold px-2 py-0.5 rounded mr-1", style: { background: barColor, color: "#fff" }, children: isCritical ? "CRITICAL" : isWarning ? "BELOW TARGET" : "OK" }),
        onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onEdit, className: "text-gray-400 hover:text-gray-600 p-1 rounded", title: "Edit target", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" }) }),
        onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onDelete, className: "text-gray-400 hover:text-red-500 p-1 rounded", title: "Remove target", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 text-center mb-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Stock on farm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-bold text-gray-800", children: [
          Math.round(totalKg).toLocaleString(),
          " kg"
        ] }),
        threshKg !== null && totalKg < threshKg && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-0.5", style: { color: "#b91c1c" }, children: [
          "Below ",
          Math.round(threshKg).toLocaleString(),
          " kg alert"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Days remaining" }),
        daysRemaining !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", style: { color: barColor }, children: daysRemaining }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1.5", children: "Set daily usage" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Min. target" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-gray-800", children: minDays > 0 ? `${minDays} days` : "—" }),
        dailyKg > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          dailyKg,
          " kg/day"
        ] })
      ] })
    ] }),
    barPct !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-full h-2 overflow-hidden", style: { background: "rgba(255,255,255,0.5)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full transition-all", style: { width: `${barPct}%`, background: barColor } }) }),
      isCritical && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", style: { color: textColor }, children: [
        "Critically low — order urgently and activate your contingency plan.",
        " ",
        pendingFpoCount && pendingFpoCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/dashboard/feed?tab=orders", className: "underline font-medium", style: { color: textColor }, children: [
          pendingFpoCount,
          " order",
          pendingFpoCount !== 1 ? "s" : "",
          " pending →"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/dashboard/feed?tab=orders", className: "underline font-medium", style: { color: textColor }, children: "Raise a feed order →" })
      ] }),
      isWarning && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", style: { color: textColor }, children: [
        "Stock is below your ",
        minDays,
        "-day minimum. Consider placing an order now.",
        " ",
        pendingFpoCount && pendingFpoCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/dashboard/feed?tab=orders", className: "underline font-medium", style: { color: textColor }, children: [
          pendingFpoCount,
          " order",
          pendingFpoCount !== 1 ? "s" : "",
          " pending →"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/dashboard/feed?tab=orders", className: "underline font-medium", style: { color: textColor }, children: "Raise a feed order →" })
      ] })
    ] })
  ] });
}
function HerdMultiPicker({
  herdNames,
  selected,
  onChange
}) {
  if (herdNames.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No herds/flocks on record — add them in the Livestock module first." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-36 overflow-y-auto divide-y divide-gray-100", children: herdNames.map((name) => {
      const checked = selected.includes(name);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${checked ? "bg-green-50" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            className: "accent-green-700",
            checked,
            onChange: () => onChange(checked ? selected.filter((h) => h !== name) : [...selected, name])
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: name })
      ] }, name);
    }) }),
    selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1", children: selected.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5", children: [
      h,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onChange(selected.filter((x) => x !== h)), className: "text-green-600 hover:text-green-900 ml-0.5", children: "×" })
    ] }, h)) })
  ] });
}
function AnimalMultiPicker({
  animals,
  selected,
  onChange,
  filterSpecies,
  placeholder
}) {
  const [search, setSearch] = React.useState("");
  const filtered = animals.filter((a) => {
    if (filterSpecies && filterSpecies !== "__none__" && a.species !== filterSpecies) return false;
    const tag = a.earTagNumber ?? a.tagNumber ?? String(a.id);
    return tag.toLowerCase().includes(search.toLowerCase());
  });
  if (animals.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: placeholder ?? "No animals registered in the Individual Animal Register." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 border-b border-gray-100 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "text",
        value: search,
        onChange: (e) => setSearch(e.target.value),
        placeholder: "Search by tag number…",
        className: "w-full text-xs border-0 bg-transparent outline-none placeholder:text-gray-400"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-44 overflow-y-auto divide-y divide-gray-100", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic px-3 py-2", children: "No matching animals" }) : filtered.map((a) => {
      const tag = a.earTagNumber ?? a.tagNumber ?? `#${a.id}`;
      const desc = [a.species, a.breed, a.sex].filter(Boolean).join(" · ");
      const checked = selected.includes(a.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 ${checked ? "bg-green-50" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            className: "accent-green-700",
            checked,
            onChange: () => onChange(checked ? selected.filter((id) => id !== a.id) : [...selected, a.id])
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono font-medium", children: tag }),
        desc && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: desc })
      ] }, a.id);
    }) }),
    selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-600 font-medium", children: [
        selected.length,
        " animal",
        selected.length !== 1 ? "s" : "",
        " selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs text-red-600 hover:text-red-800", onClick: () => onChange([]), children: "Clear" })
    ] })
  ] });
}
function CompliancePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab({ page: "compliance", farmId, validIds: ["biosecurity", "contingency", "disease", "recalls", "audit-pack"], defaultTab: "biosecurity" });
  const [editingBio, setEditingBio] = reactExports.useState(false);
  const [bioForm, setBioForm] = reactExports.useState({});
  const [editingContingency, setEditingContingency] = reactExports.useState(false);
  const [contingencyForm, setContingencyForm] = reactExports.useState({});
  const [showDiseaseDialog, setShowDiseaseDialog] = reactExports.useState(false);
  const [editDisease, setEditDisease] = reactExports.useState(null);
  const [diseaseForm, setDiseaseForm] = reactExports.useState({});
  const [diseaseHerds, setDiseaseHerds] = reactExports.useState([]);
  const [diseaseAffectedIds, setDiseaseAffectedIds] = reactExports.useState([]);
  const [diseaseMortalityIds, setDiseaseMortalityIds] = reactExports.useState([]);
  const [showAllDiseases, setShowAllDiseases] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [showRecallDialog, setShowRecallDialog] = reactExports.useState(false);
  const [editRecall, setEditRecall] = reactExports.useState(null);
  const [recallForm, setRecallForm] = reactExports.useState({});
  const [showViewRecallDialog, setShowViewRecallDialog] = reactExports.useState(false);
  const [viewRecall, setViewRecall] = reactExports.useState(null);
  const [showTargetDialog, setShowTargetDialog] = reactExports.useState(false);
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const [targetForm, setTargetForm] = reactExports.useState({});
  const [pendingDeleteTarget, setPendingDeleteTarget] = reactExports.useState(null);
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const bioQ = useQuery({
    queryKey: ["biosecurity-plan", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biosecurity-plan`).then((r) => r.json()),
    enabled: !!farmId
  });
  const contingencyQ = useQuery({
    queryKey: ["feed-contingency-plan", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-contingency-plan`).then((r) => r.json()),
    enabled: !!farmId
  });
  const diseaseQ = useQuery({
    queryKey: ["disease-incidents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/disease-incidents`).then((r) => r.json()),
    enabled: !!farmId
  });
  const recallsQ = useQuery({
    queryKey: ["feed-recalls", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-recalls`).then((r) => r.json()),
    enabled: !!farmId
  });
  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const vetPlansQ = useQuery({
    queryKey: ["vet-health-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-health-plans`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const deliveriesQ = useQuery({
    queryKey: ["feed-deliveries-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-deliveries`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const feedStockQ = useQuery({
    queryKey: ["feed-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then((r) => r.json()),
    enabled: !!farmId && tab === "contingency"
  });
  const feedStockTargetsQ = useQuery({
    queryKey: ["feed-stock-targets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock-targets`).then((r) => r.json()),
    enabled: !!farmId && tab === "contingency"
  });
  const feedFpoQ = useQuery({
    queryKey: ["feed-purchase-orders-compliance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-purchase-orders`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId && tab === "contingency"
  });
  const animalsQ = useQuery({
    queryKey: ["animals-compliance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId && tab === "disease"
  });
  const medicinesQ = useQuery({
    queryKey: ["medicine-records-compliance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId && tab === "disease"
  });
  function invalidate() {
    qc.invalidateQueries({ queryKey: ["biosecurity-plan", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-contingency-plan", farmId] });
    qc.invalidateQueries({ queryKey: ["disease-incidents", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-recalls", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] });
  }
  const addTargetM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/feed-stock-targets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] });
      toast({ title: "Species target added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateTargetM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/feed-stock-targets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] });
      toast({ title: "Target updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteTargetM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/feed-stock-targets/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] });
      toast({ title: "Target removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const farmDetail = farmQ.data?.record ?? farmQ.data?.farm ?? null;
  const bio = bioQ.data?.plan ?? null;
  const contingency = contingencyQ.data?.plan ?? null;
  const diseases = diseaseQ.data?.records ?? [];
  const recalls = recallsQ.data?.records ?? [];
  const speciesTargets = feedStockTargetsQ.data?.records ?? [];
  const allFpos = feedFpoQ.data ?? [];
  const activeFpos = allFpos.filter((o) => !["received", "cancelled"].includes(String(o.status)));
  function fpoCountForSpecies(species) {
    if (species === "all") return activeFpos.length;
    return activeFpos.filter((o) => String(o.speciesIntended ?? "") === species).length;
  }
  const allSuppliers = (suppliersQ.data ?? []).filter((s) => s.isActive !== false);
  const vetRecords = vetPlansQ.data ?? [];
  const knownVetNames = [...new Set(vetRecords.map((v) => String(v.vetName ?? "")).filter(Boolean))];
  const knownHerdNames = [...new Set((herdsQ.data ?? []).map((h) => String(h.herdName ?? h.name ?? "")).filter((s) => s.length > 0))];
  const knownFeedProducts = [...new Set((deliveriesQ.data ?? []).map((d) => String(d.productName ?? "")).filter((s) => s.length > 0))];
  const allAnimals = (animalsQ.data ?? []).filter((a) => String(a.status ?? "active") !== "deceased");
  const knownMedicineNames = [...new Set((medicinesQ.data ?? []).map((m) => String(m.medicineName ?? "")).filter((s) => s.length > 0))];
  const twoYearsAgo = /* @__PURE__ */ new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const recentDiseases = diseases.filter((d) => new Date(String(d.incidentDate)) >= twoYearsAgo);
  const olderDiseases = diseases.filter((d) => new Date(String(d.incidentDate)) < twoYearsAgo);
  const visibleDiseases = showAllDiseases ? diseases : recentDiseases;
  const bioMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/biosecurity-plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setEditingBio(false);
      toast({ title: "Biosecurity plan saved" });
    },
    onError: () => toast({ title: "Error saving plan", variant: "destructive" })
  });
  const contingencyMut = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}/feed-contingency-plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setEditingContingency(false);
      toast({ title: "Contingency plan saved" });
    },
    onError: () => toast({ title: "Error saving plan", variant: "destructive" })
  });
  const diseaseMut = useMutation({
    mutationFn: async (data) => {
      const url = editDisease ? `/api/farms/${farmId}/disease-incidents/${editDisease.id}` : `/api/farms/${farmId}/disease-incidents`;
      const res = await fetch(url, { method: editDisease ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowDiseaseDialog(false);
      toast({ title: editDisease ? "Incident updated" : "Incident logged" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const delDiseaseMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/disease-incidents/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const recallMut = useMutation({
    mutationFn: async (data) => {
      const url = editRecall ? `/api/farms/${farmId}/feed-recalls/${editRecall.id}` : `/api/farms/${farmId}/feed-recalls`;
      const res = await fetch(url, { method: editRecall ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowRecallDialog(false);
      toast({ title: editRecall ? "Recall updated" : "Recall incident raised" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const delRecallMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/feed-recalls/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Recall record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function parseJsonIds(raw) {
    if (!raw) return [];
    try {
      const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(arr)) return arr.map(Number).filter((n) => !isNaN(n) && n > 0);
    } catch {
    }
    return [];
  }
  function parseJsonStrings(raw) {
    if (!raw) return [];
    try {
      const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
    } catch {
    }
    const s = String(raw ?? "").trim();
    return s ? s.split(/,\s*/).filter(Boolean) : [];
  }
  function openDiseaseAdd() {
    setEditDisease(null);
    setDiseaseForm({ incidentType: "disease_suspicion", status: "open", incidentDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) });
    setDiseaseHerds([]);
    setDiseaseAffectedIds([]);
    setDiseaseMortalityIds([]);
    setShowDiseaseDialog(true);
  }
  function openDiseaseEdit(r) {
    setEditDisease(r);
    const form = {};
    for (const [k, v] of Object.entries(r)) {
      if (k === "affectedHerds" || k === "affectedAnimalIds" || k === "mortalityAnimalIds") continue;
      if (v !== null && v !== void 0) {
        if (typeof v === "boolean") form[k] = v ? "true" : "false";
        else form[k] = /^\d{4}-\d{2}-\d{2}T/.test(String(v)) ? String(v).substring(0, 10) : String(v);
      }
    }
    setDiseaseForm(form);
    setDiseaseHerds(parseJsonStrings(r.affectedHerds));
    setDiseaseAffectedIds(parseJsonIds(r.affectedAnimalIds));
    setDiseaseMortalityIds(parseJsonIds(r.mortalityAnimalIds));
    setShowDiseaseDialog(true);
  }
  function openRecallAdd() {
    setEditRecall(null);
    setRecallForm({ status: "open", concernType: "contamination", raisedDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) });
    setShowRecallDialog(true);
  }
  function openRecallEdit(r) {
    setEditRecall(r);
    const form = {};
    for (const [k, v] of Object.entries(r)) {
      if (v !== null && v !== void 0) {
        if (typeof v === "boolean") form[k] = v ? "true" : "false";
        else form[k] = String(v);
      }
    }
    setRecallForm(form);
    setShowRecallDialog(true);
  }
  function startEditBio() {
    const p = bio ?? {};
    setBioForm(Object.fromEntries(
      Object.entries(p).map(([k, v]) => [k, v === null || v === void 0 ? "" : String(v)])
    ));
    setEditingBio(true);
  }
  function startEditContingency() {
    const p = contingency ?? {};
    const form = {};
    for (const [k, v] of Object.entries(p)) {
      if (k === "alternativeSuppliers") {
        form[k] = altSuppliersToText(v);
      } else if (k === "emergencyContacts") {
        form[k] = emergencyContactsToText(v);
      } else {
        form[k] = v === null || v === void 0 ? "" : String(v);
      }
    }
    setContingencyForm(form);
    setEditingContingency(true);
  }
  function printPlan() {
    window.print();
  }
  function printDeclarationForm() {
    const fd = farmDetail;
    const farmName = fd ? String(fd.name ?? "") : "";
    const farmAddr = fd ? String(fd.address ?? "") : "";
    const farmPost = fd ? String(fd.postcode ?? "") : "";
    const farmCph = fd ? String(fd.cphNumber ?? "") : "";
    const b = bio;
    const restrictedAreas = b ? String(b.restrictedAreas ?? "") : "";
    const visitorProcedures = b ? String(b.visitorProcedures ?? "") : "";
    const footwearHygiene = b ? String(b.footwearHygieneProcedures ?? "") : "";
    const vetName = b ? String(b.farmVetName ?? "") : "";
    const vetPhone = b ? String(b.farmVetPhone ?? "") : "";
    const aphaPhone = b ? String(b.aphaPhone ?? "03000 200 301") : "03000 200 301";
    function ruleLines(text, fallback) {
      if (!text.trim()) return `<li>${fallback}</li>`;
      return text.split(/\n+/).filter(Boolean).slice(0, 5).map((l) => `<li>${l.trim()}</li>`).join("");
    }
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Visitor Biosecurity Declaration — ${farmName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; background: #fff; }
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }

  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a5c2e; padding-bottom: 8px; margin-bottom: 10px; }
  .header-left h1 { font-size: 18pt; font-weight: 800; color: #1a5c2e; line-height: 1.1; }
  .header-left p  { font-size: 9pt; color: #444; margin-top: 2px; }
  .header-right   { text-align: right; font-size: 9pt; color: #444; }
  .header-right strong { display: block; font-size: 11pt; color: #1a5c2e; }

  .warning-banner { background: #fff3cd; border: 1.5px solid #f0ad4e; border-radius: 5px; padding: 6px 10px; font-size: 9pt; font-weight: 700; color: #7c5800; margin-bottom: 10px; }
  .warning-banner span { font-weight: 400; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .box { border: 1.5px solid #c8d8c8; border-radius: 5px; padding: 8px 10px; }
  .box h2 { font-size: 10pt; font-weight: 700; color: #1a5c2e; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.3px; }
  .box ul { padding-left: 16px; }
  .box ul li { font-size: 9pt; color: #222; margin-bottom: 3px; line-height: 1.35; }

  .declaration-box { border: 2px solid #1a5c2e; border-radius: 5px; padding: 8px 12px; margin-bottom: 10px; }
  .declaration-box h2 { font-size: 10pt; font-weight: 700; color: #1a5c2e; text-transform: uppercase; margin-bottom: 6px; }
  .declaration-box ol { padding-left: 18px; }
  .declaration-box ol li { font-size: 9.5pt; margin-bottom: 4px; line-height: 1.35; }

  .table-section h2 { font-size: 10pt; font-weight: 700; color: #1a5c2e; text-transform: uppercase; margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a5c2e; color: #fff; font-size: 8.5pt; font-weight: 700; padding: 5px 4px; text-align: left; white-space: nowrap; }
  td { border: 1px solid #bbb; font-size: 8.5pt; padding: 0; height: 24px; }
  td.writeable { min-width: 0; }
  tr:nth-child(even) td { background: #f6faf6; }

  .footer { margin-top: 8px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
  .emergency { font-size: 8.5pt; }
  .emergency strong { color: #c00; }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>Visitor &amp; Contractor<br>Biosecurity Declaration</h1>
    <p>${farmName}${farmAddr ? " · " + farmAddr : ""}${farmPost ? ", " + farmPost : ""}</p>
  </div>
  <div class="header-right">
    ${farmCph ? `<strong>CPH: ${farmCph}</strong>` : ""}
    <div>Form version: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
    <div>Red Tractor Assured</div>
  </div>
</div>

<div class="warning-banner">
  &#9888; ALL visitors and contractors must read these rules and sign below before entering the farm.
  <span>Failure to comply may require you to leave the premises.</span>
</div>

<div class="two-col">
  <div class="box">
    <h2>&#128683; Restricted Areas</h2>
    <ul>
      ${ruleLines(restrictedAreas, "Only proceed to areas you have been authorised to enter.")}
      <li>Do not enter livestock buildings unless accompanied by farm staff.</li>
    </ul>
  </div>
  <div class="box">
    <h2>&#9755; Before You Enter</h2>
    <ul>
      ${ruleLines(visitorProcedures, "Report to the farmhouse or office before going anywhere on the farm.")}
      ${ruleLines(footwearHygiene, "Clean and disinfect all footwear using the facilities provided.")}
    </ul>
  </div>
</div>

<div class="declaration-box">
  <h2>&#9989; Declaration — Please read carefully before signing</h2>
  <ol>
    <li>I have <strong>not been in contact with livestock</strong> or visited a farm, livestock market, abattoir, or agricultural show in a <strong>foreign country in the past 7 days</strong>.</li>
    <li>I have <strong>not been in contact with pigs</strong> (or pig premises) in the past 48 hours, unless I have cleaned and disinfected all clothing and footwear used at that time.</li>
    <li>I have <strong>cleaned and disinfected my footwear</strong> before entering or I will use the foot dip / overshoes provided.</li>
    <li>I will follow all farm biosecurity rules as explained to me and <strong>will not deviate from agreed routes</strong> on this farm.</li>
    <li>I will <strong>report immediately</strong> any sign of disease, injury, dead animals, or unusual odour to the farm contact named below.</li>
    <li>I understand that <strong>food, drink, and smoking</strong> are not permitted in livestock buildings or feed stores.</li>
    <li>I confirm that I have read and understood this declaration and agree to abide by it.</li>
  </ol>
</div>

<div class="table-section">
  <h2>&#9998; Visitor / Contractor Sign-In Register</h2>
  <table>
    <thead>
      <tr>
        <th style="width:16%">Full Name</th>
        <th style="width:16%">Company / Organisation</th>
        <th style="width:14%">Reason for Visit</th>
        <th style="width:10%">Vehicle Reg</th>
        <th style="width:9%">Date</th>
        <th style="width:6%">Time In</th>
        <th style="width:6%">Time Out</th>
        <th style="width:12%">Mobile Number</th>
        <th style="width:11%">Signature</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({ length: 9 }).map(() => "<tr>" + "<td class='writeable'></td>".repeat(9) + "</tr>").join("")}
    </tbody>
  </table>
</div>

<div class="footer">
  <div class="emergency">
    <strong>Emergency contacts:</strong>&nbsp;
    Farm contact: <strong>${vetName || "See farm office"}</strong>${vetPhone ? " — " + vetPhone : ""}&nbsp;&nbsp;|&nbsp;&nbsp;
    APHA (disease suspicion): <strong>${aphaPhone}</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
    Emergency services: <strong>999</strong>
  </div>
  <div>Please leave this form with the farm contact when you depart.</div>
</div>

</body>
</html>`;
    const w = window.open("", "_blank");
    if (!w) {
      alert("Please allow pop-ups to print the declaration form.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Compliance & Contingency Plans", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Written plans and incident records required for Red Tractor, APHA, and cross-compliance inspections." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "biosecurity", onClick: () => setTab("biosecurity"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Biosecurity Plan"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "contingency", onClick: () => setTab("contingency"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Feed Contingency Plan"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "disease", onClick: () => setTab("disease"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Disease & Incident Log (",
        diseases.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "recalls", onClick: () => setTab("recalls"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Feed Recalls (",
        recalls.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "audit-pack", onClick: () => setTab("audit-pack"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "RT Audit Pack"
      ] })
    ] }),
    tab === "biosecurity" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Farm Biosecurity Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Required by Red Tractor for all livestock sectors. Review annually and after any significant change to farm operations." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          !editingBio && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printDeclarationForm, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
            "Visitor Declaration Form"
          ] }),
          !editingBio && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printPlan, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
            "Print Plan"
          ] }),
          !editingBio && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", size: "sm", onClick: startEditBio, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5 mr-1" }),
            bio ? "Edit Plan" : "Create Plan"
          ] }),
          editingBio && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditingBio(false), children: "Cancel" }),
          editingBio && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", size: "sm", onClick: () => bioMut.mutate(bioForm), disabled: bioMut.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5 mr-1" }),
            "Save Plan"
          ] })
        ] })
      ] }),
      bio && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewBadge, { date: String(bio.nextReviewDate ?? "") }),
        bio.planAuthor && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
          "Author: ",
          String(bio.planAuthor)
        ] }),
        bio.approvedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
          "Approved by: ",
          String(bio.approvedBy)
        ] }),
        bio.versionNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
          "v",
          String(bio.versionNumber)
        ] }),
        bio.lastReviewedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
          "Last reviewed: ",
          fmtDate(String(bio.lastReviewedDate))
        ] })
      ] }),
      editingBio ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-red-800 mb-3", children: "Emergency Contacts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farm Vet Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  list: "vet-names-list",
                  value: bioForm.farmVetName ?? "",
                  onChange: (e) => {
                    const name = e.target.value;
                    const match = vetRecords.find((v) => String(v.vetName ?? "") === name);
                    setBioForm((f) => ({
                      ...f,
                      farmVetName: name,
                      ...match ? { farmVetPhone: String(match.practicePhone ?? f.farmVetPhone ?? "") } : {}
                    }));
                  },
                  placeholder: "Select or type vet name"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "vet-names-list", children: knownVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.farmVetPhone ?? "", onChange: (e) => setBioForm((f) => ({ ...f, farmVetPhone: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.farmVetEmail ?? "", onChange: (e) => setBioForm((f) => ({ ...f, farmVetEmail: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Area Office" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.aphaAreaOffice ?? "", onChange: (e) => setBioForm((f) => ({ ...f, aphaAreaOffice: e.target.value })), placeholder: "e.g. APHA Worcester" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.aphaPhone ?? "", onChange: (e) => setBioForm((f) => ({ ...f, aphaPhone: e.target.value })), placeholder: "03000 200 301" })
            ] })
          ] })
        ] }),
        [
          { key: "restrictedAreas", label: "1. Restricted Areas & Access Points", placeholder: "Describe which areas of the farm are restricted to farm personnel only. Where are the farm boundaries? Where should visitors be directed?" },
          { key: "visitorProcedures", label: "2. Visitor & Personnel Procedures", placeholder: "What must visitors do before entering? (sign-in, biosecurity declaration, clothing/footwear requirements, 48-hour livestock exclusion etc.)" },
          { key: "vehicleEntryProcedures", label: "3. Vehicle & Equipment Entry Controls", placeholder: "What cleaning or disinfection is required before vehicles enter? Where is the vehicle wash? Lorries, tractors, contractors' vehicles?" },
          { key: "footwearHygieneProcedures", label: "4. Footwear & Clothing Hygiene", placeholder: "When are overalls/boots required? Where are foot dips located? What disinfectant is used? How often are dips replenished?" },
          { key: "cleaningProtocols", label: "5. Cleaning & Disinfection Protocols", placeholder: "How and when are livestock housing, equipment, and vehicles cleaned and disinfected? Which products are approved?" },
          { key: "pestManagementApproach", label: "6. Pest Management", placeholder: "How is pest activity monitored and controlled? Who is the appointed pest contractor? What records are kept?" },
          { key: "newAnimalIsolationProcedures", label: "7. New Animal Isolation Procedures", placeholder: "How long are purchased animals isolated? In which building/area? What health checks are performed before introduction to the main herd?" },
          { key: "feedSecurityProcedures", label: "8. Feed Security & Contamination Prevention", placeholder: "How is feed stored and protected from vermin, chemicals, and cross-contamination? What checks are made on delivery?" },
          { key: "diseaseResponsePlan", label: "9. Disease Outbreak Response", placeholder: "Step-by-step actions if a disease outbreak is suspected: who to call first, how to isolate animals, movement restrictions, record-keeping, when to contact APHA." },
          { key: "diseaseSuspicionProcedures", label: "10. Notifiable Disease Suspicion Procedures", placeholder: "What are the clinical signs the farm team must know? Who to call immediately if a notifiable disease is suspected? APHA reporting obligation details." },
          { key: "wasteManagementProcedures", label: "11. Waste Management", placeholder: "How is farm waste (slurry, carcasses, medicines, sharps, packaging) managed and disposed of? Who are the licensed contractors?" },
          { key: "waterSourceProtection", label: "12. Water Source Protection", placeholder: "How are water sources protected from contamination? What treatment or testing is carried out?" },
          { key: "staffResponsibilities", label: "13. Staff Responsibilities & Training", placeholder: "Who is responsible for each area of biosecurity? What training do staff receive? How are contractors briefed?" }
        ].map(({ key, label, placeholder }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 4, value: bioForm[key] ?? "", onChange: (e) => setBioForm((f) => ({ ...f, [key]: e.target.value })), placeholder })
        ] }, key)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Document Control" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan Author" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.planAuthor ?? "", onChange: (e) => setBioForm((f) => ({ ...f, planAuthor: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approved By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.approvedBy ?? "", onChange: (e) => setBioForm((f) => ({ ...f, approvedBy: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Version" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.versionNumber ?? "", onChange: (e) => setBioForm((f) => ({ ...f, versionNumber: e.target.value })), placeholder: "e.g. 1.2" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Reviewed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: bioForm.lastReviewedDate ?? "", onChange: (e) => setBioForm((f) => ({ ...f, lastReviewedDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: bioForm.nextReviewDate ?? "", onChange: (e) => setBioForm((f) => ({ ...f, nextReviewDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bioForm.notes ?? "", onChange: (e) => setBioForm((f) => ({ ...f, notes: e.target.value })) })
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-5 print:shadow-none print:border-none", children: !bio ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No biosecurity plan on record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-4", children: "A written biosecurity plan is a Red Tractor requirement. Click Create Plan to document your farm's procedures." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: startEditBio, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Create Biosecurity Plan"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        (bio.farmVetName || bio.aphaAreaOffice) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-red-800 mb-2", children: "Emergency Contacts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3 text-sm", children: [
            bio.farmVetName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium", children: "Farm Vet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: String(bio.farmVetName) }),
              bio.farmVetPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-gray-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
                String(bio.farmVetPhone)
              ] }),
              bio.farmVetEmail && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-gray-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3 h-3" }),
                String(bio.farmVetEmail)
              ] })
            ] }),
            bio.aphaAreaOffice && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium", children: "APHA" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: String(bio.aphaAreaOffice) }),
              bio.aphaPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-gray-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
                String(bio.aphaPhone)
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "1. Restricted Areas & Access Points", value: String(bio.restrictedAreas ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "2. Visitor & Personnel Procedures", value: String(bio.visitorProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "3. Vehicle & Equipment Entry Controls", value: String(bio.vehicleEntryProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "4. Footwear & Clothing Hygiene", value: String(bio.footwearHygieneProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "5. Cleaning & Disinfection Protocols", value: String(bio.cleaningProtocols ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "6. Pest Management", value: String(bio.pestManagementApproach ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "7. New Animal Isolation Procedures", value: String(bio.newAnimalIsolationProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "8. Feed Security & Contamination Prevention", value: String(bio.feedSecurityProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "9. Disease Outbreak Response", value: String(bio.diseaseResponsePlan ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "10. Notifiable Disease Suspicion Procedures", value: String(bio.diseaseSuspicionProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "11. Waste Management", value: String(bio.wasteManagementProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "12. Water Source Protection", value: String(bio.waterSourceProtection ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "13. Staff Responsibilities & Training", value: String(bio.staffResponsibilities ?? "") }),
        bio.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "Additional Notes", value: String(bio.notes) })
      ] }) })
    ] }),
    tab === "contingency" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Feed Supply Contingency Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Required by Red Tractor. Documents what you will do if your primary feed supply is disrupted — supplier failure, contamination, extreme weather, or a recall." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          !editingContingency && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printPlan, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
            "Print Plan"
          ] }),
          !editingContingency && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", size: "sm", onClick: startEditContingency, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5 mr-1" }),
            contingency ? "Edit Plan" : "Create Plan"
          ] }),
          editingContingency && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditingContingency(false), children: "Cancel" }),
          editingContingency && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", size: "sm", onClick: () => contingencyMut.mutate(contingencyForm), disabled: contingencyMut.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5 mr-1" }),
            "Save Plan"
          ] })
        ] })
      ] }),
      contingency && !editingContingency && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewBadge, { date: String(contingency.nextReviewDate ?? "") }),
        contingency.minimumStockDaysTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#dbeafe", color: "#1e40af", border: "none" }, children: [
          "Minimum stock target: ",
          String(contingency.minimumStockDaysTarget),
          " days"
        ] }),
        contingency.dailyConsumptionKg && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }, children: [
          "Daily usage: ",
          String(contingency.dailyConsumptionKg),
          " kg/day"
        ] }),
        contingency.planAuthor && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
          "Author: ",
          String(contingency.planAuthor)
        ] }),
        contingency.lastReviewedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
          "Last reviewed: ",
          fmtDate(String(contingency.lastReviewedDate))
        ] })
      ] }),
      editingContingency ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-blue-800 mb-3", children: "Stock Resilience Targets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Minimum stock days target" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: contingencyForm.minimumStockDaysTarget ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, minimumStockDaysTarget: e.target.value })), placeholder: "e.g. 14 (two weeks)", min: "1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Minimum days' feed to hold on farm at all times." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Daily consumption (kg/day)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: contingencyForm.dailyConsumptionKg ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, dailyConsumptionKg: e.target.value })), placeholder: "e.g. 180", min: "0", step: "1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Total feed used across all livestock groups per day." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Alert threshold (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: contingencyForm.alertThresholdKg ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, alertThresholdKg: e.target.value })), placeholder: "Total kg across all bins", min: "0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Total stock level at which the contingency plan is activated." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Primary Feed Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier name" }),
              allSuppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: contingencyForm.primarySupplierName ?? "__none__",
                  onValueChange: (v) => {
                    const name = v === "__none__" ? "" : v;
                    const match = allSuppliers.find((s) => String(s.name ?? "") === name);
                    setContingencyForm((f) => ({
                      ...f,
                      primarySupplierName: name,
                      ...match ? {
                        primarySupplierPhone: String(match.phone ?? f.primarySupplierPhone ?? ""),
                        primarySupplierEmail: String(match.email ?? f.primarySupplierEmail ?? "")
                      } : {}
                    }));
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select supplier —" }),
                      allSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.name ?? s.id), children: String(s.name ?? s.id) }, String(s.id)))
                    ] })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contingencyForm.primarySupplierName ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, primarySupplierName: e.target.value })), placeholder: "Type supplier name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contingencyForm.primarySupplierPhone ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, primarySupplierPhone: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contingencyForm.primarySupplierEmail ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, primarySupplierEmail: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Alternative / Emergency Suppliers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              className: "mt-1",
              rows: 4,
              value: contingencyForm.alternativeSuppliers ?? "",
              onChange: (e) => setContingencyForm((f) => ({ ...f, alternativeSuppliers: e.target.value })),
              placeholder: "List each alternative supplier on a new line, e.g.:\nFarm Direct Feeds — 01234 567890 — can deliver within 48 hrs\nCounty Mill — 01234 678901 — bulk maize available"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "List suppliers you could switch to quickly if your primary supplier fails. Include phone number and typical lead time." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Key Emergency Contacts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              className: "mt-1",
              rows: 4,
              value: contingencyForm.emergencyContacts ?? "",
              onChange: (e) => setContingencyForm((f) => ({ ...f, emergencyContacts: e.target.value })),
              placeholder: "List contacts to notify if feed supply is disrupted, e.g.:\nFarm Manager — John Smith — 07700 900000\nVet — Manydown Vets — 01256 780000\nAHDB Crisis Line — 03000 200 301"
            }
          )
        ] }),
        [
          { key: "triggerConditions", label: "1. Trigger Conditions", placeholder: "What events will activate this plan? (e.g. stock falls below X days' supply, supplier goes into administration, product recall issued, extreme weather prevents delivery)" },
          { key: "immediateActions", label: "2. Immediate Actions", placeholder: "Step-by-step actions when the plan is triggered:\n1. Assess current stock levels across all bins\n2. Contact alternative suppliers\n3. Notify farm manager and owner\n..." },
          { key: "rationingProcedures", label: "3. Rationing Procedures", placeholder: "If stock is low, how will you prioritise which animals are fed? Which feed types can be reduced or substituted? What are the minimum nutritional requirements for each group?" },
          { key: "communicationPlan", label: "4. Communication Plan", placeholder: "Who needs to be notified and in what order? (Farm owner, farm manager, vet, bank/lender if extended disruption, Red Tractor assessor if compliance is affected)" },
          { key: "recordKeepingDuringIncident", label: "5. Record Keeping During Incident", placeholder: "What records must be kept during a supply disruption? (Daily stock counts, rationing decisions, communications with suppliers and authorities, animal welfare checks)" },
          { key: "recoveryActions", label: "6. Recovery & Return to Normal Operations", placeholder: "How will you rebuild stock to normal levels after the incident? What review will take place? Should the plan be updated?" }
        ].map(({ key, label, placeholder }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 4, value: contingencyForm[key] ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, [key]: e.target.value })), placeholder })
        ] }, key)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Document Control" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan Author" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contingencyForm.planAuthor ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, planAuthor: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approved By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contingencyForm.approvedBy ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, approvedBy: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Version" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contingencyForm.versionNumber ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, versionNumber: e.target.value })), placeholder: "e.g. 1.0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Reviewed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: contingencyForm.lastReviewedDate ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, lastReviewedDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: contingencyForm.nextReviewDate ?? "", onChange: (e) => setContingencyForm((f) => ({ ...f, nextReviewDate: e.target.value })) })
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-5 print:shadow-none print:border-none", children: !contingency ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No feed contingency plan on record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-4", children: "A written plan for feed supply disruption is a requirement under Red Tractor Feed Assurance. Click Create Plan to start." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: startEditContingency, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Create Contingency Plan"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        (() => {
          const stocks = feedStockQ.data?.records ?? [];
          const hasStocks = stocks.length > 0;
          if (!hasStocks && !feedStockQ.isLoading && speciesTargets.length === 0) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-4 h-4 text-gray-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700", children: speciesTargets.length > 0 ? "Per-Species Stock Monitoring" : "Current Feed Stock Status" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    setEditTarget(null);
                    setTargetForm({ species: "cattle", dailyConsumptionKg: "", minimumStockDaysTarget: "", alertThresholdKg: "", label: "", notes: "" });
                    setShowTargetDialog(true);
                  },
                  className: "flex items-center gap-1 text-xs text-green-800 hover:text-green-900 font-medium border border-green-200 rounded px-2 py-1 hover:bg-green-50 print:hidden",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3" }),
                    "Add species target"
                  ]
                }
              )
            ] }),
            speciesTargets.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
              speciesTargets.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                SpeciesStockCard,
                {
                  target: t,
                  stockRows: stocks,
                  pendingFpoCount: fpoCountForSpecies(String(t.species ?? "")),
                  onEdit: () => {
                    setEditTarget(t);
                    setTargetForm({
                      species: String(t.species ?? "cattle"),
                      label: String(t.label ?? ""),
                      dailyConsumptionKg: String(t.dailyConsumptionKg ?? ""),
                      minimumStockDaysTarget: String(t.minimumStockDaysTarget ?? ""),
                      alertThresholdKg: String(t.alertThresholdKg ?? ""),
                      notes: String(t.notes ?? "")
                    });
                    setShowTargetDialog(true);
                  },
                  onDelete: () => setPendingDeleteTarget(t)
                },
                String(t.id)
              )),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Based on live bin stock records. Only bins assigned to each species in Feed Management are counted." })
            ] }) : (
              /* Aggregate meter fallback (no species targets) */
              (() => {
                const totalKg = stocks.reduce((s, r) => s + parseFloat(r.currentStockKg ?? "0"), 0);
                const dailyKg = contingency.dailyConsumptionKg ? parseFloat(String(contingency.dailyConsumptionKg)) : null;
                const minDays = contingency.minimumStockDaysTarget ? Number(contingency.minimumStockDaysTarget) : null;
                const daysRemaining = dailyKg && dailyKg > 0 ? Math.floor(totalKg / dailyKg) : null;
                const isCritical = daysRemaining !== null && minDays !== null && daysRemaining < Math.floor(minDays / 2);
                const isWarning = daysRemaining !== null && minDays !== null && daysRemaining < minDays && !isCritical;
                const isOk = daysRemaining !== null && minDays !== null && daysRemaining >= minDays;
                const barPct = daysRemaining !== null && minDays !== null ? Math.min(100, Math.round(daysRemaining / (minDays * 1.5) * 100)) : null;
                const barColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
                const bg = isCritical ? "#fff5f5" : isWarning ? "#fffbeb" : "#f0fdf4";
                const border = isCritical ? "#fca5a5" : isWarning ? "#fde68a" : "#bbf7d0";
                const textColor = isCritical ? "#b91c1c" : isWarning ? "#92400e" : "#166534";
                if (!hasStocks && !feedStockQ.isLoading) return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg p-4", style: { background: bg, border: `1px solid ${border}` }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-sm font-semibold", style: { color: textColor }, children: "All Species (Combined)" }),
                      daysRemaining !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold px-2 py-0.5 rounded", style: { background: barColor, color: "#fff" }, children: isCritical ? "CRITICAL" : isWarning ? "BELOW TARGET" : "OK" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center mb-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Total stock on farm" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-gray-800", children: [
                          Math.round(totalKg).toLocaleString(),
                          " kg"
                        ] })
                      ] }),
                      daysRemaining !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Days of feed remaining" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", style: { color: barColor }, children: daysRemaining })
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Days remaining" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Set daily usage rate to calculate" })
                      ] }),
                      minDays !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Minimum target" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-gray-800", children: [
                          minDays,
                          " days"
                        ] })
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
                    ] }),
                    barPct !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 rounded-full transition-all", style: { width: `${barPct}%`, background: barColor } }) }),
                      isCritical && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1.5", style: { color: textColor }, children: [
                        "Feed stock is critically low — order urgently and activate your contingency plan.",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/dashboard/feed", className: "underline font-medium", style: { color: textColor }, children: "Log a delivery in Feed Management →" })
                      ] }),
                      isWarning && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1.5", style: { color: textColor }, children: [
                        "Stock is below your ",
                        minDays,
                        "-day minimum reserve. Consider placing an order now.",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/dashboard/feed", className: "underline font-medium", style: { color: textColor }, children: "Log a delivery in Feed Management →" })
                      ] }),
                      isOk && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1.5 text-green-700", children: [
                        "Stock is above your ",
                        minDays,
                        "-day minimum reserve. No action required."
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2", children: "Based on live feed stock records. Update your bin levels in Feed Management to keep this accurate." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2", children: 'Tip: use "Add species target" above to track cattle, sheep and other species separately with individual minimum stock targets.' })
                ] });
              })()
            )
          ] });
        })(),
        (contingency.primarySupplierName || contingency.alternativeSuppliers) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-blue-800 mb-2", children: "Supplier Contacts" }),
          contingency.primarySupplierName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium", children: "Primary Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: String(contingency.primarySupplierName) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs text-gray-600 mt-0.5", children: [
              contingency.primarySupplierPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
                String(contingency.primarySupplierPhone)
              ] }),
              contingency.primarySupplierEmail && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3 h-3" }),
                String(contingency.primarySupplierEmail)
              ] })
            ] })
          ] }),
          contingency.alternativeSuppliers && (() => {
            const altParsed = parseAltSuppliers(contingency.alternativeSuppliers);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium mt-2", children: "Alternative Suppliers" }),
              altParsed ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1.5 mt-1", children: altParsed.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-white border border-blue-100 px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800", children: s.name }),
                s.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-gray-600 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
                  s.phone
                ] }),
                s.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: s.notes })
              ] }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-wrap mt-1", children: String(contingency.alternativeSuppliers) })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "1. Trigger Conditions", value: String(contingency.triggerConditions ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "2. Immediate Actions", value: String(contingency.immediateActions ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "3. Rationing Procedures", value: String(contingency.rationingProcedures ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "4. Communication Plan", value: String(contingency.communicationPlan ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "5. Record Keeping During Incident", value: String(contingency.recordKeepingDuringIncident ?? "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "6. Recovery & Return to Normal", value: String(contingency.recoveryActions ?? "") }),
        contingency.emergencyContacts && (() => {
          const ecParsed = parseEmergencyContacts(contingency.emergencyContacts);
          if (ecParsed) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Emergency Contacts" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1.5", children: ecParsed.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50 px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800", children: c.name }),
                c.role && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: c.role }),
                c.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-gray-600 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
                  c.phone
                ] })
              ] }, i)) })
            ] });
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx(PlanSection, { title: "Emergency Contacts", value: String(contingency.emergencyContacts) });
        })()
      ] }) })
    ] }),
    tab === "disease" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Disease & Health Incident Log" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Timestamped record of all disease suspicions, confirmed illnesses, notifiable disease events, and actions taken. Required for APHA and Red Tractor." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: openDiseaseAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Incident"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 mb-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal obligation:" }),
          " If you suspect a notifiable disease (FMD, Bluetongue, AI, ASF, Brucellosis, Anthrax etc.) you must contact APHA immediately — do not wait for laboratory confirmation. Failure to report is an offence. APHA Helpline: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "03000 200 301" })
        ] })
      ] }),
      diseases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No incidents logged" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Log any disease suspicion, illness outbreak, or notifiable disease event here as it occurs." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        !showAllDiseases && olderDiseases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAllDiseases(true), className: "text-xs text-green-800 hover:text-green-900 underline font-medium", children: [
          "Show ",
          olderDiseases.length,
          " older record",
          olderDiseases.length !== 1 ? "s" : "",
          " (before ",
          twoYearsAgo.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
          ")"
        ] }) }),
        visibleDiseases.map((r) => {
          const mortalityIds = (() => {
            try {
              const v = r.mortalityAnimalIds;
              if (!v) return [];
              const arr = typeof v === "string" ? JSON.parse(v) : v;
              return Array.isArray(arr) ? arr : [];
            } catch {
              return [];
            }
          })();
          const affectedIds = (() => {
            try {
              const v = r.affectedAnimalIds;
              if (!v) return [];
              const arr = typeof v === "string" ? JSON.parse(v) : v;
              return Array.isArray(arr) ? arr : [];
            } catch {
              return [];
            }
          })();
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-xl border p-4 ${r.isNotifiableDisease ? "bg-red-50 border-red-200" : r.status === "open" ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: INCIDENT_TYPES.find((t) => t.value === r.incidentType)?.label ?? String(r.incidentType) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: String(r.status ?? "open") }),
                r.isNotifiableDisease === true || r.isNotifiableDisease === "true" ? /* @__PURE__ */ jsxRuntimeExports.jsx(NotifiableBadge, {}) : null,
                r.vetCalled === true || r.vetCalled === "true" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dbeafe", color: "#1e40af", border: "none" }, children: "Vet called" }) : null,
                r.reportedToAPHA === true || r.reportedToAPHA === "true" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#f3e8ff", color: "#6b21a8", border: "none" }, children: "APHA reported" }) : null,
                mortalityIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: [
                  mortalityIds.length,
                  " deceased"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-1", children: [
                fmtDate(String(r.incidentDate)),
                " — ",
                r.species ? `${String(r.species)}, ` : "",
                affectedIds.length > 0 ? `${affectedIds.length} animal${affectedIds.length !== 1 ? "s" : ""} (tagged)` : r.animalCount ? `${String(r.animalCount)} animals` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 line-clamp-2", children: String(r.symptomsObserved ?? "") }),
              !!r.confirmedDiagnosis && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                "Confirmed: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(r.confirmedDiagnosis) })
              ] }),
              !!r.notifiableDiseaseType && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700 mt-1 font-medium", children: [
                "Disease type: ",
                String(r.notifiableDiseaseType)
              ] }),
              !!r.treatmentGiven && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                "Treatment: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(r.treatmentGiven) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRecord(r), className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openDiseaseEdit(r), className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delDiseaseMut.mutate(Number(r.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
            ] })
          ] }) }, String(r.id));
        }),
        showAllDiseases && olderDiseases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAllDiseases(false), className: "text-xs text-gray-500 hover:text-gray-700 underline", children: "Show last 2 years only" }) })
      ] })
    ] }),
    tab === "recalls" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Feed Recall & Withdrawal Incidents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Log any feed that has been withdrawn, recalled, or raised a concern — contamination, mislabelling, supplier recall, or disease link." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: openRecallAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Raise Incident"
        ] })
      ] }),
      recalls.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No feed recall incidents on record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Use this section to log any feed safety concern or withdrawal, even if resolved quickly." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: recalls.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-xl border p-4 ${r.status === "open" ? "bg-orange-50 border-orange-200" : r.status === "resolved" ? "bg-white border-gray-200" : "bg-yellow-50 border-yellow-200"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: String(r.productName ?? "Feed incident") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: String(r.status ?? "open") }),
            r.concernType === "supplier_recall" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "Supplier recall" }) : null,
            r.feedWithdrawn === true || r.feedWithdrawn === "true" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Feed withdrawn" }) : null,
            r.reportedToAuthority === true || r.reportedToAuthority === "true" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#f3e8ff", color: "#6b21a8", border: "none" }, children: "Authority notified" }) : null,
            r.reportedToVet === true || r.reportedToVet === "true" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dbeafe", color: "#1e40af", border: "none" }, children: "Vet notified" }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-1", children: [
            "Raised: ",
            fmtDate(String(r.raisedDate)),
            r.feedBatchRef ? ` — Batch: ${String(r.feedBatchRef)}` : "",
            r.supplierName ? ` — Supplier: ${String(r.supplierName)}` : "",
            r.recallNoticeRef ? ` — Notice ref: ${String(r.recallNoticeRef)}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 line-clamp-2", children: String(r.reasonForConcern ?? "") }),
          !!r.estimatedAnimalsAffected && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
            "Est. animals affected: ",
            String(r.estimatedAnimalsAffected)
          ] }),
          !!r.recallDocumentUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: String(r.recallDocumentUrl), target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1", children: [
            "View recall notice ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
          ] }),
          (r.creditNoteRequired === true || r.creditNoteRequired === "true") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: "Credit note: " }),
            r.creditNoteStatus === "received" || r.creditNoteStatus === "applied" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700", children: [
              r.creditNoteStatus === "applied" ? "Applied" : "Received",
              r.creditNoteRef ? ` — ${String(r.creditNoteRef)}` : "",
              r.creditNoteValueGbp ? ` (£${Number(r.creditNoteValueGbp).toFixed(2)})` : ""
            ] }) : r.creditNoteStatus === "disputed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-700", children: [
              "Disputed",
              r.creditNoteRef ? ` — ${String(r.creditNoteRef)}` : ""
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-700", children: [
              "Pending",
              r.creditNoteRef ? ` — ${String(r.creditNoteRef)}` : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "View", onClick: () => {
            setViewRecall(r);
            setShowViewRecallDialog(true);
          }, className: "h-7 px-2 text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Edit", onClick: () => openRecallEdit(r), className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Delete", onClick: () => delRecallMut.mutate(Number(r.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
        ] })
      ] }) }, String(r.id))) })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, className: "max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Disease Incident" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Incident Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: INCIDENT_TYPES.find((t) => t.value === viewRecord.incidentType)?.label ?? String(viewRecord.incidentType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.status ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Incident Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(String(viewRecord.incidentDate ?? "")) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.species ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animal Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.animalCount ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reported By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.reportedBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Symptoms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.symptoms ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Diagnosis Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.diagnosisConfirmed ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Veterinary Diagnosis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.veterinaryDiagnosis ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notifiable Disease" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notifiableDisease ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "APHA Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.aphaNotified ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Contacted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetContacted ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mortality Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.mortalityCount ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Given" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.treatmentGiven ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Affected Animal IDs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.affectedAnimalIds ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quarantine Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.quarantineMeasures ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openDiseaseEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDiseaseDialog, onOpenChange: (o) => {
      setShowDiseaseDialog(o);
      if (!o) diseaseMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editDisease ? "Edit Incident Record" : "Log Disease / Health Incident" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Incident date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.incidentDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, incidentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.incidentType ?? "disease_suspicion", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, incidentType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INCIDENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.status ?? "open", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monitoring", children: "Monitoring" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "resolved", children: "Resolved" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.species ?? "__none__", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, species: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.charAt(0).toUpperCase() + s.slice(1) }, s))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "No. animals affected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: diseaseForm.animalCount ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, animalCount: e.target.value })), placeholder: "Approximate if unknown" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reported by" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.reportedBy ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, reportedBy: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "block mb-1", children: "Herds / groups affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HerdMultiPicker, { herdNames: knownHerdNames, selected: diseaseHerds, onChange: setDiseaseHerds })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "block mb-1", children: [
            "Individual animals affected",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs font-normal text-gray-500", children: "(select from Individual Animal Register)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AnimalMultiPicker,
            {
              animals: allAnimals,
              selected: diseaseAffectedIds,
              onChange: setDiseaseAffectedIds,
              filterSpecies: diseaseForm.species && diseaseForm.species !== "" ? diseaseForm.species : void 0,
              placeholder: "No animals in the Individual Animal Register — add them in the Livestock module first."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Symptoms observed *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: diseaseForm.symptomsObserved ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, symptomsObserved: e.target.value })), placeholder: "Describe what was seen — be specific about clinical signs, onset, severity, and affected body systems" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Onset date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.onsetDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, onsetDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Suspected diagnosis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.suspectedDiagnosis ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, suspectedDiagnosis: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirmed diagnosis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.confirmedDiagnosis ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, confirmedDiagnosis: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-red-800 font-semibold", children: "Is this a notifiable disease?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.isNotifiableDisease ?? "false", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, isNotifiableDisease: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes — notifiable" })
              ] })
            ] })
          ] }),
          diseaseForm.isNotifiableDisease === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-100 border border-red-300 rounded p-2 text-xs text-red-800 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "You must contact APHA immediately:" }),
              " 03000 200 301. Do not wait for laboratory confirmation."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notifiable disease type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.notifiableDiseaseType ?? "__none__", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, notifiableDiseaseType: v === "__none__" ? "" : v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select disease…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: NOTIFIABLE_DISEASES.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d)) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-800 mb-2", children: "Veterinary Response" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[120px_1fr_140px] gap-3 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet called?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.vetCalled ?? "false", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, vetCalled: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "Not yet" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
                ] })
              ] })
            ] }),
            diseaseForm.vetCalled === "true" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet name" }),
                knownVetNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: "vetName" in diseaseForm && diseaseForm.vetName && knownVetNames.includes(diseaseForm.vetName) ? diseaseForm.vetName : "vetName" in diseaseForm ? "__other__" : "__none__",
                    onValueChange: (v) => {
                      if (v === "__none__") setDiseaseForm((f) => {
                        const nf = { ...f };
                        delete nf.vetName;
                        return nf;
                      });
                      else if (v === "__other__") setDiseaseForm((f) => ({ ...f, vetName: "" }));
                      else setDiseaseForm((f) => ({ ...f, vetName: v }));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet…" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select vet —" }),
                        knownVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / type manually" })
                      ] })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.vetName ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, vetName: e.target.value })), placeholder: "Vet name" }),
                "vetName" in diseaseForm && !knownVetNames.includes(diseaseForm.vetName ?? "") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: diseaseForm.vetName ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, vetName: e.target.value })), placeholder: "Type vet name" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date called" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.vetCallDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, vetCallDate: e.target.value })) })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2" })
          ] }),
          diseaseForm.vetCalled === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet visit date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.vetVisitDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, vetVisitDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.prescriptionRef ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, prescriptionRef: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet advice / notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.vetAdvice ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, vetAdvice: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Treatment given",
                knownMedicineNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs font-normal text-gray-500", children: "(select from medicine records or type)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  list: "disease-medicine-list",
                  value: diseaseForm.treatmentGiven ?? "",
                  onChange: (e) => setDiseaseForm((f) => ({ ...f, treatmentGiven: e.target.value })),
                  placeholder: "e.g. Oxytetracycline 200mg/ml, 3-day course"
                }
              ),
              knownMedicineNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "disease-medicine-list", children: knownMedicineNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "For full withdrawal period and dose tracking, also record in Livestock → Medicine Records." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mb-2", children: "Biosecurity Response" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Isolation applied?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.isolationApplied ?? "false", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, isolationApplied: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
                ] })
              ] })
            ] }),
            diseaseForm.isolationApplied === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Isolation date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.isolationDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, isolationDate: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Isolation location" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.isolationLocation ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, isolationLocation: e.target.value })) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Movement restriction?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.movementRestricted ?? "false", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, movementRestricted: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
                ] })
              ] })
            ] }),
            diseaseForm.movementRestricted === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restriction date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.movementRestrictionDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, movementRestrictionDate: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restriction details" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.movementRestrictionDetails ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, movementRestrictionDetails: e.target.value })) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reported to APHA?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseForm.reportedToAPHA ?? "false", onValueChange: (v) => setDiseaseForm((f) => ({ ...f, reportedToAPHA: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
              ] })
            ] })
          ] }),
          diseaseForm.reportedToAPHA === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: diseaseForm.aphaRef ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, aphaRef: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date notified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.aphaNotifiedDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, aphaNotifiedDate: e.target.value })) })
            ] })
          ] })
        ] }),
        diseaseForm.status === "resolved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Resolved date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: diseaseForm.resolvedDate ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, resolvedDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: diseaseForm.outcomeSummary ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, outcomeSummary: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lesson learned" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: diseaseForm.lessonLearned ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, lessonLearned: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "block mb-1", children: [
            "Mortalities",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs font-normal text-gray-500", children: diseaseMortalityIds.length > 0 ? `— ${diseaseMortalityIds.length} animal${diseaseMortalityIds.length !== 1 ? "s" : ""} selected` : "— select specific animals from the register, or enter a count below" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AnimalMultiPicker,
            {
              animals: allAnimals,
              selected: diseaseMortalityIds,
              onChange: setDiseaseMortalityIds,
              filterSpecies: diseaseForm.species && diseaseForm.species !== "" ? diseaseForm.species : void 0,
              placeholder: "No animals in the Individual Animal Register — add them in Livestock first."
            }
          ),
          diseaseMortalityIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 mt-2", children: [
            "These animals will be marked as ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "deceased" }),
            " in the Individual Animal Register when you save."
          ] }),
          diseaseMortalityIds.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-500", children: "Or enter total mortality count (if animals not in register)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "mt-1 max-w-[120px]", value: diseaseForm.mortalityCount ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, mortalityCount: e.target.value })), placeholder: "0" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: diseaseForm.notes ?? "", onChange: (e) => setDiseaseForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: diseaseMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowDiseaseDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", disabled: diseaseMut.isPending, onClick: () => {
          if (!diseaseForm.symptomsObserved?.trim()) {
            toast({ title: "Symptoms observed is required", variant: "destructive" });
            return;
          }
          const data = { ...diseaseForm };
          data.vetCalled = diseaseForm.vetCalled === "true";
          data.isolationApplied = diseaseForm.isolationApplied === "true";
          data.movementRestricted = diseaseForm.movementRestricted === "true";
          data.reportedToAPHA = diseaseForm.reportedToAPHA === "true";
          data.isNotifiableDisease = diseaseForm.isNotifiableDisease === "true";
          data.cleaningDisinfectionCarriedOut = diseaseForm.cleaningDisinfectionCarriedOut === "true";
          data.officialMovementOrderIssued = diseaseForm.officialMovementOrderIssued === "true";
          data.affectedHerds = JSON.stringify(diseaseHerds);
          data.affectedAnimalIds = JSON.stringify(diseaseAffectedIds);
          data.mortalityAnimalIds = JSON.stringify(diseaseMortalityIds);
          if (diseaseMortalityIds.length > 0) data.mortalityCount = diseaseMortalityIds.length;
          diseaseMut.mutate(data);
        }, children: editDisease ? "Save Changes" : "Log Incident" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showRecallDialog, onOpenChange: (o) => {
      setShowRecallDialog(o);
      if (!o) recallMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecall ? "Edit Recall / Withdrawal Record" : "Raise Feed Recall Incident" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date raised *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: recallForm.raisedDate ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, raisedDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Concern type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.concernType ?? "contamination", onValueChange: (v) => setRecallForm((f) => ({ ...f, concernType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONCERN_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.status ?? "open", onValueChange: (v) => setRecallForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monitoring", children: "Monitoring" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "resolved", children: "Resolved" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mb-2", children: "Feed Identification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  list: "recall-products-list",
                  value: recallForm.productName ?? "",
                  onChange: (e) => setRecallForm((f) => ({ ...f, productName: e.target.value })),
                  placeholder: "Select or type product name"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "recall-products-list", children: knownFeedProducts.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier name" }),
              allSuppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: recallForm.supplierName ?? "__none__",
                  onValueChange: (v) => setRecallForm((f) => ({ ...f, supplierName: v === "__none__" ? "" : v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select supplier —" }),
                      allSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.name ?? s.id), children: String(s.name ?? s.id) }, String(s.id)))
                    ] })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: recallForm.supplierName ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "Type supplier name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch / lot number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: recallForm.feedBatchRef ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, feedBatchRef: e.target.value })), placeholder: "Matches delivery batch number" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery note ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: recallForm.deliveryNoteRef ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, deliveryNoteRef: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity affected (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: recallForm.quantityKgAffected ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, quantityKgAffected: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Raised by" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: recallForm.raisedBy ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, raisedBy: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason for concern *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: recallForm.reasonForConcern ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, reasonForConcern: e.target.value })), placeholder: "Describe the specific concern in detail — what was observed, what prompted the withdrawal decision" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-orange-800 mb-2", children: "Impact Assessment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed withdrawn?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.feedWithdrawn ?? "false", onValueChange: (v) => setRecallForm((f) => ({ ...f, feedWithdrawn: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No — still in use" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes — withdrawn" })
                ] })
              ] })
            ] }),
            recallForm.feedWithdrawn === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: recallForm.withdrawalDate ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, withdrawalDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Est. animals affected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: recallForm.estimatedAnimalsAffected ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, estimatedAnimalsAffected: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herds / groups affected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  list: "recall-herds-list",
                  value: recallForm.affectedHerds ?? "",
                  onChange: (e) => setRecallForm((f) => ({ ...f, affectedHerds: e.target.value })),
                  placeholder: "Type or select herd name"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "recall-herds-list", children: knownHerdNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animal health impact observed?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.animalHealthImpactObserved ?? "false", onValueChange: (v) => setRecallForm((f) => ({ ...f, animalHealthImpactObserved: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
                ] })
              ] })
            ] }),
            recallForm.animalHealthImpactObserved === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Health impact description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: recallForm.healthImpactDescription ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, healthImpactDescription: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: recallForm.actionsTaken ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, actionsTaken: e.target.value })), placeholder: "What was done with the affected feed? Who was contacted? What replacement was sourced?" })
        ] }),
        recallForm.concernType === "supplier_recall" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800 mb-1", children: "Supplier Recall Notice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mb-3", children: "Suppliers typically issue a formal written recall or withdrawal notice. Record the reference from that letter and link to the document below." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recall notice reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: recallForm.recallNoticeRef ?? "",
                  onChange: (e) => setRecallForm((f) => ({ ...f, recallNoticeRef: e.target.value })),
                  placeholder: "e.g. SUP-2024-RC-1042"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "The reference number printed on the supplier's recall letter." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recall notice document URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: recallForm.recallDocumentUrl ?? "",
                  onChange: (e) => setRecallForm((f) => ({ ...f, recallDocumentUrl: e.target.value })),
                  placeholder: "Paste a link to the recall letter (email, shared drive…)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Paste a link to the scanned letter or forwarded email if available." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-800", children: "Notifications" }),
          recallForm.concernType !== "supplier_recall" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-blue-100 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Supplier notified?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.reportedToSupplier ?? "false", onValueChange: (v) => setRecallForm((f) => ({ ...f, reportedToSupplier: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
                ] })
              ] })
            ] }),
            recallForm.reportedToSupplier === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[130px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date notified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: recallForm.supplierNotifiedDate ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, supplierNotifiedDate: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[150px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Supplier reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: recallForm.supplierReference ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, supplierReference: e.target.value })), placeholder: "Their ref / ticket number" })
              ] })
            ] })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border border-amber-100 rounded-lg p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Supplier-initiated recall" }),
            " — the supplier has already notified you. Record their reference number and document above."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-blue-100 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Authority notified?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.reportedToAuthority ?? "false", onValueChange: (v) => setRecallForm((f) => ({ ...f, reportedToAuthority: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
                ] })
              ] })
            ] }),
            recallForm.reportedToAuthority === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-48 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Authority" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.authorityName ?? "__none__", onValueChange: (v) => setRecallForm((f) => ({ ...f, authorityName: v === "__none__" ? "" : v })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "APHA", children: "APHA" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Trading Standards", children: "Trading Standards" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "FSA", children: "Food Standards Agency (FSA)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "DEFRA", children: "DEFRA" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[130px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date notified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: recallForm.authorityNotifiedDate ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, authorityNotifiedDate: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Authority reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: recallForm.authorityReference ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, authorityReference: e.target.value })) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-blue-100 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Vet notified?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.reportedToVet ?? "false", onValueChange: (v) => setRecallForm((f) => ({ ...f, reportedToVet: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes" })
                ] })
              ] })
            ] }),
            recallForm.reportedToVet === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[160px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Vet name" }),
                knownVetNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: recallForm.vetName && knownVetNames.includes(recallForm.vetName) ? recallForm.vetName : recallForm.vetName !== void 0 ? "__other__" : "__none__",
                      onValueChange: (v) => {
                        if (v === "__none__") setRecallForm((f) => {
                          const n = { ...f };
                          delete n.vetName;
                          return n;
                        });
                        else if (v === "__other__") setRecallForm((f) => ({ ...f, vetName: "" }));
                        else setRecallForm((f) => ({ ...f, vetName: v }));
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet…" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select vet —" }),
                          knownVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / type manually" })
                        ] })
                      ]
                    }
                  ),
                  recallForm.vetName !== void 0 && !knownVetNames.includes(recallForm.vetName) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1 h-8 text-sm", value: recallForm.vetName ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, vetName: e.target.value })), placeholder: "Type vet name" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: recallForm.vetName ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, vetName: e.target.value })), placeholder: "Vet name" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[130px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date notified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: recallForm.vetNotifiedDate ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, vetNotifiedDate: e.target.value })) })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-4 h-4 text-green-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800", children: "Credit Note" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mb-3", children: "Where feed is returned or disposed of due to a recall, you may be entitled to a credit note from the supplier for the affected stock." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-44 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Credit note required?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.creditNoteRequired ?? "false", onValueChange: (v) => setRecallForm((f) => ({ ...f, creditNoteRequired: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No / Not applicable" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes — expected" })
                ] })
              ] })
            ] }),
            recallForm.creditNoteRequired === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recallForm.creditNoteStatus ?? "pending", onValueChange: (v) => setRecallForm((f) => ({ ...f, creditNoteStatus: v })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "applied", children: "Applied to account" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "disputed", children: "Disputed" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Credit note reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: recallForm.creditNoteRef ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, creditNoteRef: e.target.value })), placeholder: "e.g. CN-2024-0893" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Value (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-8 text-sm mt-1", value: recallForm.creditNoteValueGbp ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, creditNoteValueGbp: e.target.value })), placeholder: "0.00" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: recallForm.creditNoteReceivedDate ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, creditNoteReceivedDate: e.target.value })) })
              ] })
            ] })
          ] })
        ] }),
        recallForm.status === "resolved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Resolved date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: recallForm.resolvedDate ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, resolvedDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Resolution summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: recallForm.resolutionSummary ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, resolutionSummary: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: recallForm.notes ?? "", onChange: (e) => setRecallForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: recallMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowRecallDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!recallForm.reasonForConcern?.trim()) {
            toast({ title: "Reason for concern is required", variant: "destructive" });
            return;
          }
          const data = { ...recallForm };
          data.feedWithdrawn = recallForm.feedWithdrawn === "true";
          data.animalHealthImpactObserved = recallForm.animalHealthImpactObserved === "true";
          data.reportedToSupplier = recallForm.reportedToSupplier === "true";
          data.reportedToAuthority = recallForm.reportedToAuthority === "true";
          data.reportedToVet = recallForm.reportedToVet === "true";
          data.creditNoteRequired = recallForm.creditNoteRequired === "true";
          recallMut.mutate(data);
        }, children: editRecall ? "Save Changes" : "Raise Incident" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showViewRecallDialog, onOpenChange: setShowViewRecallDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 text-gray-500" }),
        "Feed Recall — ",
        viewRecall ? String(viewRecall.productName ?? "Incident") : ""
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        RecallViewBody,
        {
          recall: viewRecall,
          deliveries: deliveriesQ.data ?? []
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowViewRecallDialog(false), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          setShowViewRecallDialog(false);
          openRecallEdit(viewRecall);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3 mr-1" }),
          " Edit Record"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showTargetDialog, onOpenChange: (o) => {
      setShowTargetDialog(o);
      if (!o) {
        addTargetM.reset();
        updateTargetM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editTarget ? "Edit Species Target" : "Add Species Monitoring Target" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: targetForm.species ?? "cattle", onValueChange: (v) => setTargetForm((f) => ({ ...f, species: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPECIES_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Display label ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: targetForm.label ?? "", onChange: (e) => setTargetForm((f) => ({ ...f, label: e.target.value })), placeholder: `e.g. Beef Cattle, Dairy Herd, Ewes & Lambs` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Shown on the monitoring card instead of the species name." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Daily consumption (kg/day)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "number", min: "0", step: "0.1", value: targetForm.dailyConsumptionKg ?? "", onChange: (e) => setTargetForm((f) => ({ ...f, dailyConsumptionKg: e.target.value })), placeholder: "e.g. 180" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Minimum stock target (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "number", min: "1", step: "1", value: targetForm.minimumStockDaysTarget ?? "", onChange: (e) => setTargetForm((f) => ({ ...f, minimumStockDaysTarget: e.target.value })), placeholder: "e.g. 14" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Alert threshold (kg) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "number", min: "0", step: "1", value: targetForm.alertThresholdKg ?? "", onChange: (e) => setTargetForm((f) => ({ ...f, alertThresholdKg: e.target.value })), placeholder: "e.g. 2520" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Triggers an additional alert if stock falls below this kg value, regardless of days remaining." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Notes ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: targetForm.notes ?? "", onChange: (e) => setTargetForm((f) => ({ ...f, notes: e.target.value })), placeholder: "e.g. Includes finisher nuts, soya blend and molasses — order threshold is 2 pallets" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editTarget ? updateTargetM : addTargetM, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowTargetDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "bg-green-800 hover:bg-green-900 text-white",
            disabled: !targetForm.species || !targetForm.dailyConsumptionKg || !targetForm.minimumStockDaysTarget,
            onClick: () => {
              const body = {
                species: targetForm.species,
                label: targetForm.label || null,
                dailyConsumptionKg: targetForm.dailyConsumptionKg,
                minimumStockDaysTarget: parseInt(targetForm.minimumStockDaysTarget),
                alertThresholdKg: targetForm.alertThresholdKg || null,
                notes: targetForm.notes || null
              };
              if (editTarget) {
                updateTargetM.mutate({ id: Number(editTarget.id), body }, { onSuccess: () => setShowTargetDialog(false) });
              } else {
                addTargetM.mutate(body, { onSuccess: () => setShowTargetDialog(false) });
              }
            },
            children: editTarget ? "Save Changes" : "Add Target"
          }
        )
      ] })
    ] }) }),
    tab === "audit-pack" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(RedTractorAuditPack, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDeleteTarget !== null,
        title: "Remove monitoring target",
        message: pendingDeleteTarget ? `Remove ${pendingDeleteTarget.label ?? pendingDeleteTarget.species} monitoring target?` : "",
        confirmLabel: "Remove",
        confirmVariant: "destructive",
        mutation: deleteTargetM,
        onConfirm: () => {
          if (pendingDeleteTarget) deleteTargetM.mutate(Number(pendingDeleteTarget.id), { onSuccess: () => setPendingDeleteTarget(null) });
        },
        onCancel: () => {
          setPendingDeleteTarget(null);
          deleteTargetM.reset();
        }
      }
    )
  ] });
}
function RedTractorAuditPack({ farmId }) {
  const today = /* @__PURE__ */ new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  const [dateFrom, setDateFrom] = reactExports.useState(oneYearAgo.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = reactExports.useState(today.toISOString().slice(0, 10));
  const [sections, setSections] = reactExports.useState({
    spray: true,
    movements: true,
    medicines: true,
    training: true,
    tbTests: true,
    casualtySlaughter: true,
    mortality: true,
    feedAndWater: true,
    silage: true
  });
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farm = farmQ.data?.record;
  const sprayQ = useQuery({
    queryKey: ["spray-records-audit", farmId, dateFrom, dateTo],
    queryFn: () => fetch(`/api/farms/${farmId}/spray-records?dateFrom=${dateFrom}&dateTo=${dateTo}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.spray
  });
  const movementsQ = useQuery({
    queryKey: ["movements-audit", farmId, dateFrom, dateTo],
    queryFn: () => fetch(`/api/farms/${farmId}/movements?dateFrom=${dateFrom}&dateTo=${dateTo}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.movements
  });
  const medicinesQ = useQuery({
    queryKey: ["medicines-audit", farmId, dateFrom, dateTo],
    queryFn: () => fetch(`/api/farms/${farmId}/medicines?dateFrom=${dateFrom}&dateTo=${dateTo}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.medicines
  });
  const trainingQ = useQuery({
    queryKey: ["training-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.training
  });
  const certsQ = useQuery({
    queryKey: ["certs-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.training
  });
  const tbTestsQ = useQuery({
    queryKey: ["tb-tests-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.tbTests
  });
  const casualtyQ = useQuery({
    queryKey: ["casualty-slaughter-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/casualty-slaughter`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.casualtySlaughter
  });
  const mortalityQ = useQuery({
    queryKey: ["mortality-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/mortality-records`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.mortality
  });
  const feedQ = useQuery({
    queryKey: ["feed-records-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-records`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.feedAndWater
  });
  const waterQ = useQuery({
    queryKey: ["water-records-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/water-records`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.feedAndWater
  });
  const silageAdditivesQ = useQuery({
    queryKey: ["silage-additives-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/silage-additive-records`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.silage
  });
  const silageQualityQ = useQuery({
    queryKey: ["silage-quality-audit", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/silage-quality-tests`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && sections.silage
  });
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const inRange = (d) => {
    if (!d) return false;
    const dt = new Date(d).toISOString().slice(0, 10);
    return dt >= dateFrom && dt <= dateTo;
  };
  const sprayRecords = Array.isArray(sprayQ.data?.records) ? sprayQ.data.records : [];
  const movements = Array.isArray(movementsQ.data?.records) ? movementsQ.data.records : [];
  const medicines = Array.isArray(medicinesQ.data?.records) ? medicinesQ.data.records : [];
  const training = Array.isArray(trainingQ.data?.records) ? trainingQ.data.records : [];
  const certs = Array.isArray(certsQ.data?.records) ? certsQ.data.records : [];
  const tbTests = (Array.isArray(tbTestsQ.data?.records) ? tbTestsQ.data.records : []).filter((r) => inRange(r.testDate));
  const casualtyRecords = (Array.isArray(casualtyQ.data?.records) ? casualtyQ.data.records : []).filter((r) => inRange(r.eventDate));
  const mortalityRecords = (Array.isArray(mortalityQ.data?.records) ? mortalityQ.data.records : []).filter((r) => inRange(r.dateOfDeath));
  const feedRecords = (Array.isArray(feedQ.data?.records) ? feedQ.data.records : []).filter((r) => inRange(r.feedDate));
  const waterRecords = (Array.isArray(waterQ.data?.records) ? waterQ.data.records : []).filter((r) => inRange(r.testDate || r.createdAt));
  const silageAdditiveRecords = (Array.isArray(silageAdditivesQ.data?.records) ? silageAdditivesQ.data.records : []).filter((r) => inRange(r.applicationDate));
  const silageQualityRecords = (Array.isArray(silageQualityQ.data?.records) ? silageQualityQ.data.records : []).filter((r) => inRange(r.testDate));
  const handlePrint = () => {
    const printedDate = today.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const tableStyle = `border-collapse:collapse;width:100%;margin-bottom:20px;font-size:9px`;
    const thStyle = `border:1px solid #d1d5db;padding:5px 8px;text-align:left;background:#f3f4f6;font-weight:700`;
    const tdStyle = `border:1px solid #e5e7eb;padding:4px 8px`;
    const sectionH = `font-size:13px;font-weight:700;margin:20px 0 8px;border-bottom:2px solid #16a34a;padding-bottom:4px;color:#15803d`;
    const noData = (cols) => `<tr><td colspan="${cols}" style="${tdStyle};text-align:center;color:#9ca3af">No records in period</td></tr>`;
    const sprayRows = sections.spray ? sprayRecords.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.applicationDate)}</td><td style="${tdStyle}">${r.productName || "—"}</td><td style="${tdStyle}">${r.fieldName || r.fieldId || "—"}</td><td style="${tdStyle}">${r.operator || "—"}</td><td style="${tdStyle}">${r.totalArea || "—"}</td></tr>`
    ).join("") : "";
    const mvtRows = sections.movements ? movements.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.movementDate)}</td><td style="${tdStyle}">${r.movementType || "—"}</td><td style="${tdStyle}">${r.species || "—"}</td><td style="${tdStyle}">${r.numberOfAnimals || "—"}</td><td style="${tdStyle}">${r.licenceNumber || "—"}</td></tr>`
    ).join("") : "";
    const medRows = sections.medicines ? medicines.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.treatmentDate || r.administrationDate)}</td><td style="${tdStyle}">${r.productName || "—"}</td><td style="${tdStyle}">${r.species || "—"}</td><td style="${tdStyle}">${r.withdrawalPeriodDays || "—"}</td><td style="${tdStyle}">${r.administeredBy || "—"}</td></tr>`
    ).join("") : "";
    const trainRows = sections.training ? training.map(
      (r) => `<tr><td style="${tdStyle}">${r.staffName || r.userId || "—"}</td><td style="${tdStyle}">${r.trainingTitle || "—"}</td><td style="${tdStyle}">${fmtD(r.trainingDate)}</td><td style="${tdStyle}">${fmtD(r.expiryDate)}</td></tr>`
    ).join("") : "";
    const certRows = sections.training ? certs.map(
      (r) => `<tr><td style="${tdStyle}">${r.staffName || r.userId || "—"}</td><td style="${tdStyle}">${r.certificateType || "—"}</td><td style="${tdStyle}">${fmtD(r.issueDate)}</td><td style="${tdStyle}">${fmtD(r.expiryDate)}</td></tr>`
    ).join("") : "";
    const tbRows = sections.tbTests ? tbTests.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.testDate)}</td><td style="${tdStyle}">${r.testType || "—"}</td><td style="${tdStyle}">${r.species || "—"}</td><td style="${tdStyle}">${r.animalsTested ?? "—"}</td><td style="${tdStyle}">${r.reactors ?? 0} / ${r.inconclusives ?? 0}</td><td style="${tdStyle}">${r.outcome || "—"}</td><td style="${tdStyle}">${r.testingVet || r.aphaOfficer || "—"}</td></tr>`
    ).join("") : "";
    const casualtyRows = sections.casualtySlaughter ? casualtyRecords.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.eventDate)}</td><td style="${tdStyle}">${r.animalEarTag || "—"}</td><td style="${tdStyle}">${r.species || "—"}</td><td style="${tdStyle}">${r.reasonForSlaughter || "—"}</td><td style="${tdStyle}">${r.method || "—"}</td><td style="${tdStyle}">${r.veterinaryInvolved ? r.vetName || "Vet" : r.performedBy || "—"}</td></tr>`
    ).join("") : "";
    const mortalityRows = sections.mortality ? mortalityRecords.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.dateOfDeath)}</td><td style="${tdStyle}">${r.tagNumber || "—"}</td><td style="${tdStyle}">${r.species || "—"}</td><td style="${tdStyle}">${r.causeOfDeath || "—"}</td><td style="${tdStyle}">${r.disposalMethod || "—"}</td><td style="${tdStyle}">${r.contractorName || r.disposalOperator || "—"}</td></tr>`
    ).join("") : "";
    const feedRows = sections.feedAndWater ? feedRecords.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.feedDate)}</td><td style="${tdStyle}">${r.feedType || "—"}</td><td style="${tdStyle}">${r.supplier || "—"}</td><td style="${tdStyle}">${r.batchNumber || "—"}</td><td style="${tdStyle}">${r.quantityKg || "—"}</td></tr>`
    ).join("") : "";
    const waterRows = sections.feedAndWater ? waterRecords.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.testDate || r.createdAt)}</td><td style="${tdStyle}">${r.waterSource || "—"}</td><td style="${tdStyle}">${r.testResult || "—"}</td><td style="${tdStyle}">${r.testPass === true ? "Pass" : r.testPass === false ? "Fail" : "—"}</td></tr>`
    ).join("") : "";
    const silageAdditiveRows = sections.silage ? silageAdditiveRecords.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.applicationDate)}</td><td style="${tdStyle}">${r.storeName || "—"}</td><td style="${tdStyle}">${r.cropType || "—"}</td><td style="${tdStyle}">${r.productName || "—"}</td><td style="${tdStyle}">${r.applicationRate || "—"}</td><td style="${tdStyle}">${r.operatorName || "—"}</td></tr>`
    ).join("") : "";
    const silageQualityRows = sections.silage ? silageQualityRecords.map(
      (r) => `<tr><td style="${tdStyle}">${fmtD(r.testDate)}</td><td style="${tdStyle}">${r.storeName || "—"}</td><td style="${tdStyle}">${r.dryMatterPercent || "—"}</td><td style="${tdStyle}">${r.phLevel || "—"}</td><td style="${tdStyle}">${r.mePerKgDm || "—"}</td><td style="${tdStyle}">${r.crudeProteinPercent || "—"}</td><td style="${tdStyle}">${r.labName || "—"}</td></tr>`
    ).join("") : "";
    let sectionNum = 1;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>RT Audit Pack — ${farm?.name || "Farm"}</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;color:#111;margin:0;padding:24px}h1{font-size:18px;font-weight:800;color:#15803d;margin:0 0 2px}h2{font-size:14px;font-weight:700;margin:0 0 4px}p{margin:0 0 4px;font-size:10px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<div style="border-bottom:3px solid #16a34a;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start">
  <div>
    <h1>Red Tractor Audit Pack</h1>
    <h2>${farm?.name || "Farm"}</h2>
    <p>CPH: ${farm?.cphNumber || "—"} &nbsp;|&nbsp; RT Member ID: ${farm?.redTractorId || "—"} &nbsp;|&nbsp; SBI: ${farm?.sbiNumber || "—"}</p>
    <p style="margin-top:4px;color:#374151">Prepared by this holding for Red Tractor inspection purposes</p>
  </div>
  <div style="text-align:right;font-size:9px;color:#555">
    <p>Printed: ${printedDate}</p>
    <p>Audit period: ${dateFrom} to ${dateTo}</p>
    <p>Farm manager: ${farm?.farmManager || "—"}</p>
  </div>
</div>

${sections.spray ? `<p style="${sectionH}">${sectionNum++}. Spray &amp; Input Application Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date</th><th style="${thStyle}">Product</th><th style="${thStyle}">Field</th><th style="${thStyle}">Operator</th><th style="${thStyle}">Area (ha)</th></tr></thead><tbody>${sprayRows || noData(5)}</tbody></table>` : ""}

${sections.movements ? `<p style="${sectionH}">${sectionNum++}. Livestock Movement Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date</th><th style="${thStyle}">Type</th><th style="${thStyle}">Species</th><th style="${thStyle}">No.</th><th style="${thStyle}">Licence Ref</th></tr></thead><tbody>${mvtRows || noData(5)}</tbody></table>` : ""}

${sections.medicines ? `<p style="${sectionH}">${sectionNum++}. Medicine Treatment Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date</th><th style="${thStyle}">Product</th><th style="${thStyle}">Species</th><th style="${thStyle}">Withdrawal (days)</th><th style="${thStyle}">Administered by</th></tr></thead><tbody>${medRows || noData(5)}</tbody></table>` : ""}

${sections.training ? `<p style="${sectionH}">${sectionNum++}. Staff Training Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Staff Member</th><th style="${thStyle}">Training</th><th style="${thStyle}">Date</th><th style="${thStyle}">Expiry</th></tr></thead><tbody>${trainRows || noData(4)}</tbody></table>
<p style="${sectionH}">${sectionNum - 1}b. Certificates &amp; Qualifications</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Staff Member</th><th style="${thStyle}">Certificate</th><th style="${thStyle}">Issue Date</th><th style="${thStyle}">Expiry</th></tr></thead><tbody>${certRows || noData(4)}</tbody></table>` : ""}

${sections.tbTests ? `<p style="${sectionH}">${sectionNum++}. TB Test Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Test Date</th><th style="${thStyle}">Test Type</th><th style="${thStyle}">Species</th><th style="${thStyle}">Tested</th><th style="${thStyle}">Reactors / Inconclusive</th><th style="${thStyle}">Outcome</th><th style="${thStyle}">Testing Vet / Officer</th></tr></thead><tbody>${tbRows || noData(7)}</tbody></table>` : ""}

${sections.casualtySlaughter ? `<p style="${sectionH}">${sectionNum++}. Casualty &amp; Emergency Slaughter</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date</th><th style="${thStyle}">Ear Tag</th><th style="${thStyle}">Species</th><th style="${thStyle}">Reason</th><th style="${thStyle}">Method</th><th style="${thStyle}">Performed by</th></tr></thead><tbody>${casualtyRows || noData(6)}</tbody></table>` : ""}

${sections.mortality ? `<p style="${sectionH}">${sectionNum++}. Mortality Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date of Death</th><th style="${thStyle}">Tag No.</th><th style="${thStyle}">Species</th><th style="${thStyle}">Cause of Death</th><th style="${thStyle}">Disposal Method</th><th style="${thStyle}">Contractor</th></tr></thead><tbody>${mortalityRows || noData(6)}</tbody></table>` : ""}

${sections.feedAndWater ? `<p style="${sectionH}">${sectionNum++}. Feed Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date</th><th style="${thStyle}">Feed Type</th><th style="${thStyle}">Supplier</th><th style="${thStyle}">Batch No.</th><th style="${thStyle}">Quantity (kg)</th></tr></thead><tbody>${feedRows || noData(5)}</tbody></table>
<p style="${sectionH}">${sectionNum - 1}b. Water Quality Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Test Date</th><th style="${thStyle}">Water Source</th><th style="${thStyle}">Result</th><th style="${thStyle}">Pass / Fail</th></tr></thead><tbody>${waterRows || noData(4)}</tbody></table>` : ""}

${sections.silage ? `<p style="${sectionH}">${sectionNum++}. Silage &amp; Haylage Additive Records</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date</th><th style="${thStyle}">Clamp</th><th style="${thStyle}">Crop</th><th style="${thStyle}">Product</th><th style="${thStyle}">Rate</th><th style="${thStyle}">Applied by</th></tr></thead><tbody>${silageAdditiveRows || noData(6)}</tbody></table>
<p style="${sectionH}">${sectionNum - 1}b. Silage Quality &amp; Dry Matter Tests</p>
<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Date</th><th style="${thStyle}">Clamp</th><th style="${thStyle}">DM %</th><th style="${thStyle}">pH</th><th style="${thStyle}">ME (MJ/kg)</th><th style="${thStyle}">Crude Protein %</th><th style="${thStyle}">Lab</th></tr></thead><tbody>${silageQualityRows || noData(7)}</tbody></table>` : ""}

<div style="margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px;font-size:9px;color:#6b7280">
<p>This document was prepared by ${farm?.name || "this holding"} using BDE Farm Trac and printed on ${printedDate}. It contains on-farm compliance records for presentation to a Red Tractor assessor. These records are the responsibility of the holding and must be retained for a minimum of 3 years. This document does not constitute submission to Red Tractor or any regulatory body.</p>
</div></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => {
        w.addEventListener("afterprint", () => w.close());
        w.print();
      }, 400);
    }
  };
  const sectionToggle = (k) => setSections((p) => ({ ...p, [k]: !p[k] }));
  const totalRecords = (sections.spray ? sprayRecords.length : 0) + (sections.movements ? movements.length : 0) + (sections.medicines ? medicines.length : 0) + (sections.training ? training.length + certs.length : 0) + (sections.tbTests ? tbTests.length : 0) + (sections.casualtySlaughter ? casualtyRecords.length : 0) + (sections.mortality ? mortalityRecords.length : 0) + (sections.feedAndWater ? feedRecords.length + waterRecords.length : 0) + (sections.silage ? silageAdditiveRecords.length + silageQualityRecords.length : 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Red Tractor Audit Pack Generator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Prepared by the holding for presentation to your Red Tractor assessor. Select a date range and the sections to include, then click Generate to open a print-ready view." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, className: "bg-green-700 hover:bg-green-800 text-white flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-2" }),
        "Generate & Print Audit Pack"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-5 p-4 border rounded-xl bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-gray-600 block mb-1", children: "Date From" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: dateFrom,
            onChange: (e) => setDateFrom(e.target.value),
            className: "border rounded-md px-3 py-1.5 text-sm w-full bg-white"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-gray-600 block mb-1", children: "Date To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: dateTo,
            onChange: (e) => setDateTo(e.target.value),
            className: "border rounded-md px-3 py-1.5 text-sm w-full bg-white"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mb-2", children: "Sections to include" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [
        ["spray", "Spray & Input Records"],
        ["movements", "Livestock Movements"],
        ["medicines", "Medicine Records"],
        ["training", "Staff Training & Certs"],
        ["tbTests", "TB Test Records"],
        ["casualtySlaughter", "Casualty / Emergency Slaughter"],
        ["mortality", "Mortality Records"],
        ["feedAndWater", "Feed & Water Quality"],
        ["silage", "Silage & Haylage Records"]
      ].map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: sections[k],
            onChange: () => sectionToggle(k),
            className: "w-4 h-4 accent-green-700 rounded"
          }
        ),
        label
      ] }, k)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-4 bg-white space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600", children: "Preview — Record Counts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          totalRecords,
          " total records selected"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        sections.spray && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: sprayRecords.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Spray records" })
        ] }),
        sections.movements && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: movements.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Movements" })
        ] }),
        sections.medicines && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: medicines.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Medicine records" })
        ] }),
        sections.training && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: training.length + certs.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Training & certs" })
        ] }),
        sections.tbTests && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: tbTests.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "TB tests" })
        ] }),
        sections.casualtySlaughter && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: casualtyRecords.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Casualty slaughter" })
        ] }),
        sections.mortality && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: mortalityRecords.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Mortality records" })
        ] }),
        sections.feedAndWater && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: feedRecords.length + waterRecords.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Feed & water" })
        ] }),
        sections.silage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: silageAdditiveRecords.length + silageQualityRecords.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Silage & haylage" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: `Click "Generate & Print Audit Pack" to open a print-ready view. Use your browser's print dialog to save as PDF.` })
    ] })
  ] });
}
export {
  CompliancePage as default
};
