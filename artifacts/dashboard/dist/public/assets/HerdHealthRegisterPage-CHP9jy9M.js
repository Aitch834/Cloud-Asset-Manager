import { b as useAppStore, c as useQueryClient, r as reactExports, m as useQuery, j as jsxRuntimeExports, d as Button, T as Plus, I as Input, a as useToast, O as React, S as useMutation, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, C as Checkbox, N as DialogMutationError, J as DialogFooter } from "./index-DOqGp-2Z.js";
import { a as usePersistedFilter } from "./use-persisted-filter-CUrWS7Uk.js";
import { h as herdSpeciesDisplayLabel, a as herdProductionSubtype } from "./herd-utils-DXn3XBS9.js";
import { A as AppLayout, c as ClipboardList } from "./AppLayout-D-0JStgY.js";
import { T as Textarea } from "./textarea-B0BfcdIi.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DHnhYFit.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CTktdaeY.js";
import { p as printProReport } from "./print-report-ClU8-1P0.js";
import { P as Printer } from "./printer-DZWN56D9.js";
import { T as TriangleAlert } from "./triangle-alert-BViN2xau.js";
import { P as Pencil } from "./pencil-CeWRLXgi.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-DZql98kV.js";
import { C as ChevronUp } from "./chevron-up-DKJge0xw.js";
import "./use-safe-clerk-CtyOa7CJ.js";
import "./database-w9W885M4.js";
import "./shield-alert-CAWcZbwz.js";
import "./shield-check-BZo1xEXI.js";
import "./tractor-CSOPYcsv.js";
import "./index-Dd2Xo6oi.js";
import "./index-BCoGDpiJ.js";
const EVENT_TYPES = [
  { value: "vet_visit", label: "Vet Visit" },
  { value: "disease_outbreak", label: "Disease / Outbreak" },
  { value: "welfare_concern", label: "Welfare Concern" },
  { value: "routine_check", label: "Routine Health Check" },
  { value: "vaccination", label: "Vaccination Programme" },
  { value: "parasite_control", label: "Parasite Control" },
  { value: "biosecurity_event", label: "Biosecurity Event" },
  { value: "other", label: "Other" }
];
const SOURCE_META = {
  medicine: { label: "Treatment", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  mortality: { label: "Mortality", color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
  bcs: { label: "BCS Assessment", color: "#6d28d9", bg: "#ede9fe", border: "#c4b5fd" },
  mastitis: { label: "Mastitis", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  vet_plan: { label: "Vet Health Plan", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  clinical_event: { label: "Clinical Event", color: "#374151", bg: "#f3f4f6", border: "#d1d5db" }
};
const ALL_SOURCES = Object.keys(SOURCE_META);
function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function isWithdrawalActive(endDate) {
  if (!endDate) return false;
  return new Date(endDate) >= /* @__PURE__ */ new Date();
}
function SummaryBanner({ timeline }) {
  const total = timeline.length;
  const activeWithdrawals = timeline.filter((e) => e.withdrawal && isWithdrawalActive(e.withdrawal?.endDate)).length;
  const openFollowUps = timeline.filter((e) => e.followUpRequired && !e.followUpCompleted).length;
  const overdueFollowUps = timeline.filter(
    (e) => e.followUpRequired && !e.followUpCompleted && e.followUpDate && new Date(e.followUpDate) < /* @__PURE__ */ new Date()
  ).length;
  const lastVetVisit = timeline.find((e) => e.source === "vet_plan" || e.source === "clinical_event" && e.vetName);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }, children: [
    [
      { label: "Total Entries", value: total, bg: "#f0f9ff", border: "#bae6fd", color: "#0369a1" },
      { label: "Active Withdrawals", value: activeWithdrawals, bg: activeWithdrawals > 0 ? "#fef9c3" : "#f0fdf4", border: activeWithdrawals > 0 ? "#fde047" : "#bbf7d0", color: activeWithdrawals > 0 ? "#854d0e" : "#166534" },
      { label: "Open Follow-ups", value: openFollowUps, bg: openFollowUps > 0 ? "#fff7ed" : "#f0fdf4", border: openFollowUps > 0 ? "#fed7aa" : "#bbf7d0", color: openFollowUps > 0 ? "#c2410c" : "#166534" },
      { label: "Overdue Follow-ups", value: overdueFollowUps, bg: overdueFollowUps > 0 ? "#fef2f2" : "#f0fdf4", border: overdueFollowUps > 0 ? "#fecaca" : "#bbf7d0", color: overdueFollowUps > 0 ? "#991b1b" : "#166534" }
    ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: "1 1 140px", background: card.bg, border: `1px solid ${card.border}`, borderRadius: 10, padding: "12px 16px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 500, marginBottom: 2 }, children: card.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: card.color, lineHeight: 1 }, children: card.value })
    ] }, card.label)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: "1 1 200px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 500, marginBottom: 2 }, children: "Last Vet Record" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }, children: lastVetVisit ? fmt(lastVetVisit.date) : "None recorded" }),
      lastVetVisit?.vetName && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#64748b" }, children: lastVetVisit.vetName })
    ] })
  ] });
}
function SourceBadge({ source }) {
  const m = SOURCE_META[source] ?? { label: source, color: "#374151", bg: "#f3f4f6", border: "#d1d5db" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 6, background: m.bg, color: m.color, border: `1px solid ${m.border}`, whiteSpace: "nowrap" }, children: m.label });
}
function TimelineEntry({ entry, onEdit, onDelete, onRaiseTask }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const m = SOURCE_META[entry.source] ?? SOURCE_META["clinical_event"];
  const isOverdue = entry.followUpRequired && !entry.followUpCompleted && entry.followUpDate && new Date(entry.followUpDate) < /* @__PURE__ */ new Date();
  const hasWithdrawal = entry.withdrawal && isWithdrawalActive(entry.withdrawal?.endDate);
  const isMedicine = entry.source === "medicine";
  const hasAnimalTag = isMedicine && !!entry.animalTag;
  const scope = entry.treatmentScope;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, marginBottom: 0 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 10, height: 10, borderRadius: "50%", background: m.color, marginTop: 5, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 2, flex: 1, background: "#e5e7eb", marginTop: 3 } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, paddingBottom: 18 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", borderLeft: `3px solid ${m.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SourceBadge, { source: entry.source }),
            entry.herdLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#6b7280", background: "#f1f5f9", padding: "1px 6px", borderRadius: 5 }, children: entry.herdLabel }),
            isMedicine && hasAnimalTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", fontWeight: 700, color: "#166534", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: 5, fontFamily: "monospace", letterSpacing: "0.02em" }, children: [
              "🏷 ",
              entry.animalTag
            ] }),
            isMedicine && !hasAnimalTag && scope === "herd" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", fontWeight: 600, color: "#6d28d9", background: "#ede9fe", border: "1px solid #c4b5fd", padding: "1px 6px", borderRadius: 5 }, children: [
              "Whole Herd",
              entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""
            ] }),
            isMedicine && !hasAnimalTag && scope === "group" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: 5 }, children: [
              "Group",
              entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""
            ] }),
            isMedicine && !scope && !hasAnimalTag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: "#9ca3af", border: "1px solid #e5e7eb", padding: "1px 6px", borderRadius: 5 }, children: "No animal linked" }),
            hasWithdrawal && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 600, color: "#854d0e", background: "#fef9c3", border: "1px solid #fde047", padding: "1px 6px", borderRadius: 5 }, children: "WITHDRAWAL ACTIVE" }),
            isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.65rem", fontWeight: 600, color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", padding: "1px 6px", borderRadius: 5, display: "flex", alignItems: "center", gap: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 9 }),
              "FOLLOW-UP OVERDUE"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" }, children: entry.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 1 }, children: [
            fmt(entry.date),
            entry.vetName ? ` · ${entry.vetName}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }, children: [
          entry.source === "clinical_event" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onEdit(entry.raw), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onDelete(entry.raw), style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setExpanded((x) => !x), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }, children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 15 }) })
        ] })
      ] }),
      expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0 14px 12px 14px", borderTop: "1px solid #f3f4f6" }, children: [
        isMedicine && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }, children: "Animal Traceability" }),
          hasAnimalTag ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#14532d", fontFamily: "monospace", fontWeight: 600 }, children: [
            "Ear tag(s): ",
            entry.animalTag,
            entry.treatedAnimalCount && entry.treatedAnimalCount > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "inherit", color: "#166534", marginLeft: 8 }, children: [
              "(",
              entry.treatedAnimalCount,
              " animals total)"
            ] }) : null
          ] }) : scope === "herd" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#166534" }, children: [
            "Whole herd treatment",
            entry.herdLabel ? ` — ${entry.herdLabel}` : "",
            entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""
          ] }) : scope === "group" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#166534" }, children: [
            "Group treatment",
            entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#9ca3af", fontStyle: "italic" }, children: "No specific animal linked — edit this medicine record to add traceability." })
        ] }),
        entry.detail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#374151", marginTop: 8, marginBottom: 0 }, children: entry.detail }),
        entry.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 6, marginBottom: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: "Notes:" }),
          " ",
          entry.notes
        ] }),
        hasWithdrawal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8, padding: "6px 10px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 6, fontSize: "0.78rem", color: "#854d0e" }, children: [
          "Withdrawal period active until ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(entry.withdrawal.endDate) }),
          " (",
          entry.withdrawal.days,
          " days). Do not slaughter or sell milk until after this date."
        ] }),
        entry.followUpRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8, padding: "6px 10px", background: isOverdue ? "#fef2f2" : "#fff7ed", border: `1px solid ${isOverdue ? "#fecaca" : "#fed7aa"}`, borderRadius: 6, fontSize: "0.78rem", color: isOverdue ? "#991b1b" : "#c2410c", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Follow-up required by ",
            fmt(entry.followUpDate),
            " · ",
            entry.followUpCompleted ? "Completed" : isOverdue ? "OVERDUE" : "Pending"
          ] }),
          !entry.followUpCompleted && onRaiseTask && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: onRaiseTask,
              style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#c2410c", background: "rgba(194,65,12,0.08)", border: "1px solid #fed7aa", borderRadius: 5, padding: "2px 8px", cursor: "pointer", whiteSpace: "nowrap" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 11 }),
                "Raise Task"
              ]
            }
          )
        ] }),
        entry.recordedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 6, marginBottom: 0 }, children: [
          "Recorded by: ",
          entry.recordedBy
        ] })
      ] })
    ] }) })
  ] });
}
const emptyForm = { eventType: "", title: "", eventDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), herdId: "", description: "", vetName: "", actionTaken: "", followUpRequired: false, followUpDate: "", followUpCompleted: false, recordedBy: "" };
function ClinicalEventDialog({ open, onClose, farmId, herds, editRecord, onSaved }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = reactExports.useState(emptyForm);
  React.useEffect(() => {
    if (editRecord) {
      setForm({
        eventType: editRecord.eventType ?? "",
        title: editRecord.title ?? "",
        eventDate: editRecord.eventDate?.slice(0, 10) ?? "",
        herdId: editRecord.herdId ? String(editRecord.herdId) : "",
        description: editRecord.description ?? "",
        vetName: editRecord.vetName ?? "",
        actionTaken: editRecord.actionTaken ?? "",
        followUpRequired: editRecord.followUpRequired ?? false,
        followUpDate: editRecord.followUpDate?.slice(0, 10) ?? "",
        followUpCompleted: editRecord.followUpCompleted ?? false,
        recordedBy: editRecord.recordedBy ?? ""
      });
    } else {
      setForm(emptyForm);
    }
  }, [editRecord, open]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const saveMut = useMutation({
    mutationFn: async () => {
      const body = {
        ...form,
        herdId: form.herdId ? parseInt(form.herdId) : null,
        followUpDate: form.followUpRequired && form.followUpDate ? form.followUpDate : null
      };
      const url = editRecord ? `/api/farms/${farmId}/herd-health-events/${editRecord.id}` : `/api/farms/${farmId}/herd-health-events`;
      const r = await fetch(url, { method: editRecord ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: editRecord ? "Event updated" : "Clinical event logged" });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
      onSaved();
      onClose();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const canSave = form.eventType && form.title && form.eventDate;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) {
      onClose();
      saveMut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Clinical Event" : "Log Clinical Event" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Event Type ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.eventType, onValueChange: (v) => set("eventType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-56", children: EVENT_TYPES.map((et) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: et.value, children: et.label }, et.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Date ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.eventDate, onChange: (e) => set("eventDate", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Title / Summary ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Brief description of the event", value: form.title, onChange: (e) => set("title", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdId || "__none__", onValueChange: (v) => set("herdId", v === "__none__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All herds / unspecified" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-56", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "All herds / unspecified" }),
              herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                h.name,
                " (",
                herdSpeciesDisplayLabel(h.type),
                herdProductionSubtype(h.type) ? ` · ${herdProductionSubtype(h.type)}` : "",
                ")"
              ] }, h.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Attending vet (if applicable)", value: form.vetName, onChange: (e) => set("vetName", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description / Clinical Findings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Clinical observations, diagnosis, condition notes…", value: form.description, onChange: (e) => set("description", e.target.value), rows: 3 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "What was done — treatment prescribed, animals isolated, vet plan updated…", value: form.actionTaken, onChange: (e) => set("actionTaken", e.target.value), rows: 2 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "followup", checked: form.followUpRequired, onCheckedChange: (v) => set("followUpRequired", !!v), style: { marginTop: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "followup", style: { fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }, children: "Follow-up Required" }),
          form.followUpRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Follow-up Due Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.followUpDate, onChange: (e) => set("followUpDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-end", gap: 8, paddingBottom: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "followup-done", checked: form.followUpCompleted, onCheckedChange: (v) => set("followUpCompleted", !!v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "followup-done", style: { fontSize: "0.82rem", cursor: "pointer" }, children: "Mark as completed" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorded By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your name", value: form.recordedBy, onChange: (e) => set("recordedBy", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(), disabled: !canSave || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Log Event" })
    ] })
  ] }) });
}
function DeleteDialog({ record, farmId, onClose, onDeleted }) {
  const { toast } = useToast();
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/herd-health-events/${record.id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Event deleted" });
      onDeleted();
      onClose();
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      onClose();
      deleteMut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Clinical Event" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 py-2", children: [
      'Remove "',
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: record?.title }),
      '" from the herd health register? This cannot be undone.'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(), disabled: deleteMut.isPending, children: "Delete" })
    ] })
  ] }) });
}
function HerdHealthRegisterPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteRecord, setDeleteRecord] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [filterSource, setFilterSource] = usePersistedFilter({ page: "herd-health-register", filter: "source", farmId, defaultValue: "__all__" });
  const [filterHerd, setFilterHerd] = usePersistedFilter({ page: "herd-health-register", filter: "herd", farmId, defaultValue: "__all__" });
  const [filterFrom, setFilterFrom] = reactExports.useState("");
  const [filterTo, setFilterTo] = reactExports.useState("");
  const q = useQuery({
    queryKey: ["herd-health-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herd-health-register`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const timeline = q.data?.timeline ?? [];
  const herds = q.data?.herds ?? [];
  const farm = farmQ.data?.record ?? null;
  const invalidate = () => qc.invalidateQueries({ queryKey: ["herd-health-register", farmId] });
  const filtered = timeline.filter((e) => {
    if (filterSource !== "__all__" && e.source !== filterSource) return false;
    if (filterHerd !== "__all__" && e.herdLabel !== filterHerd) return false;
    if (filterFrom && new Date(e.date) < new Date(filterFrom)) return false;
    if (filterTo && new Date(e.date) > /* @__PURE__ */ new Date(filterTo + "T23:59:59")) return false;
    return true;
  });
  const herdLabels = Array.from(new Set(timeline.map((e) => e.herdLabel).filter(Boolean)));
  const handlePrint = () => {
    const escape = (s) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sourceBadgeHtml = (source) => {
      const m = SOURCE_META[source] ?? SOURCE_META["clinical_event"];
      return `<span style="font-size:6px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:2px 5px;border-radius:3px;background:${m.bg};color:${m.color};border:1px solid ${m.border};white-space:nowrap">${m.label}</span>`;
    };
    const withdrawalHtml = (entry) => {
      if (!entry.withdrawal) return "—";
      const end = entry.withdrawal.endDate;
      if (!end) return "—";
      const daysLeft = Math.ceil((new Date(end).getTime() - Date.now()) / 864e5);
      if (daysLeft > 0) {
        return `<span style="background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:2px;font-weight:600">${daysLeft}d left — ends ${fmt(end)}</span>`;
      }
      return `<span style="background:#dcfce7;color:#166534;padding:1px 4px;border-radius:2px">Cleared ${fmt(end)}</span>`;
    };
    const followUpHtml = (entry) => {
      if (!entry.followUpRequired) return "—";
      if (entry.followUpCompleted) {
        return `<span style="background:#dcfce7;color:#166534;padding:1px 4px;border-radius:2px">Completed</span>`;
      }
      if (entry.followUpDate && new Date(entry.followUpDate) < /* @__PURE__ */ new Date()) {
        return `<span style="background:#fee2e2;color:#991b1b;padding:1px 4px;border-radius:2px;font-weight:600">Overdue — ${fmt(entry.followUpDate)}</span>`;
      }
      return entry.followUpDate ? `Due ${fmt(entry.followUpDate)}` : "Required";
    };
    const rows = filtered.map((e) => `<tr>
      <td style="white-space:nowrap;font-weight:600">${fmt(e.date)}</td>
      <td>${sourceBadgeHtml(e.source)}</td>
      <td>${escape(e.herdLabel ?? "—")}</td>
      <td><strong>${escape(e.title)}</strong>${e.detail ? `<br><span style="color:#555;font-size:7px">${escape(e.detail)}</span>` : ""}</td>
      <td>${escape(e.vetName ?? "—")}</td>
      <td>${withdrawalHtml(e)}</td>
      <td>${followUpHtml(e)}${e.notes && e.source === "clinical_event" ? `<br><span style="color:#555;font-size:7px">Action: ${escape(e.notes)}</span>` : ""}</td>
    </tr>`).join("");
    const activeWithdrawals = timeline.filter((e) => e.withdrawal && isWithdrawalActive(e.withdrawal?.endDate)).length;
    const openFollowUps = timeline.filter((e) => e.followUpRequired && !e.followUpCompleted).length;
    const overdueFollowUps = timeline.filter((e) => e.followUpRequired && !e.followUpCompleted && e.followUpDate && new Date(e.followUpDate) < /* @__PURE__ */ new Date()).length;
    const filterParts = [];
    if (filterSource !== "__all__") filterParts.push(`Type: ${SOURCE_META[filterSource]?.label ?? filterSource}`);
    if (filterHerd !== "__all__") filterParts.push(`Herd: ${filterHerd}`);
    if (filterFrom) filterParts.push(`From: ${fmt(filterFrom)}`);
    if (filterTo) filterParts.push(`To: ${fmt(filterTo)}`);
    const filterLabel = filterParts.length > 0 ? filterParts.join("  ·  ") : "All records";
    const tableHtml = `
      <p style="font-size:7.5px;color:#374151;margin:0 0 10px">
        <strong>Summary:</strong>&nbsp;
        ${filtered.length} entries shown &nbsp;·&nbsp; ${activeWithdrawals} active withdrawal${activeWithdrawals !== 1 ? "s" : ""} &nbsp;·&nbsp;
        ${openFollowUps} open follow-up${openFollowUps !== 1 ? "s" : ""} (${overdueFollowUps} overdue)
      </p>
      <table><thead><tr>
        <th>Date</th><th>Type</th><th>Herd / Group</th><th style="width:30%">Summary / Detail</th>
        <th>Vet / Clinician</th><th>Withdrawal Status</th><th>Follow-up / Action</th>
      </tr></thead><tbody>${rows}</tbody></table>
    `;
    printProReport({
      title: "Herd Health Register",
      subtitle: "Consolidated livestock health record — Red Tractor compliant",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      redTractorId: farm?.redTractorId ?? void 0,
      recordCount: filtered.length,
      recordLabel: "entry",
      extraMeta: `Filter: ${filterLabel}`,
      tableHtml,
      footerNote: "Retain herd health records for a minimum of 3 years. Withdrawal periods must be observed before animals enter the food chain. Make available at Red Tractor audit inspection.",
      landscape: true
    });
  };
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Herd Health Register", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Select a farm to view the Herd Health Register." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Herd Health Register", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 900, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Consolidated chronological record of all health events, treatments, vet visits, welfare assessments, and clinical observations — suitable for Red Tractor audit." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Log Clinical Event"
        ] })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: 40, color: "#9ca3af" }, children: "Loading health register…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryBanner, { timeline }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", background: "#f8fafc", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { minWidth: 160 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }, children: "RECORD TYPE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterSource, onValueChange: setFilterSource, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { height: 32, fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-56", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All types" }),
              ALL_SOURCES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: SOURCE_META[s].label }, s))
            ] })
          ] })
        ] }),
        herdLabels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { minWidth: 180 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }, children: "HERD / FLOCK" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterHerd, onValueChange: setFilterHerd, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { height: 32, fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-56", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All herds" }),
              herdLabels.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l, children: l }, l))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }, children: "FROM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: filterFrom, onChange: (e) => setFilterFrom(e.target.value), style: { height: 32, fontSize: "0.8rem", width: 140 } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }, children: "TO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: filterTo, onChange: (e) => setFilterTo(e.target.value), style: { height: 32, fontSize: "0.8rem", width: 140 } })
        ] }),
        (filterSource !== "__all__" || filterHerd !== "__all__" || filterFrom || filterTo) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "flex-end", paddingBottom: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
          setFilterSource("__all__");
          setFilterHerd("__all__");
          setFilterFrom("");
          setFilterTo("");
        }, style: { height: 32, fontSize: "0.78rem" }, children: "Clear filters" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginLeft: "auto", display: "flex", alignItems: "flex-end", paddingBottom: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: [
          filtered.length,
          " of ",
          timeline.length,
          " entries"
        ] }) })
      ] }),
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 12, border: "1px dashed #d1d5db", color: "#6b7280" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "2rem", marginBottom: 8 }, children: "🐄" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, marginBottom: 4 }, children: "No health records found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.85rem" }, children: timeline.length > 0 ? "Try adjusting your filters." : 'Health events will appear here automatically as you add treatments, BCS assessments, vet plans, and mortalities. Use "Log Clinical Event" to add vet visits or other health notes.' })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: filtered.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TimelineEntry,
        {
          entry,
          onEdit: (raw) => {
            setEditRecord(raw);
            setAddOpen(true);
          },
          onDelete: (raw) => setDeleteRecord(raw),
          onRaiseTask: () => setRaiseTaskFor(entry)
        },
        `${entry.source}-${entry.raw?.id ?? i}`
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClinicalEventDialog,
      {
        open: addOpen || !!editRecord,
        onClose: () => {
          setAddOpen(false);
          setEditRecord(null);
        },
        farmId,
        herds,
        editRecord,
        onSaved: invalidate
      }
    ),
    deleteRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteDialog,
      {
        record: deleteRecord,
        farmId,
        onClose: () => setDeleteRecord(null),
        onDeleted: invalidate
      }
    ),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Vet Follow-up — ${raiseTaskFor.title ?? "Health Event"}`,
        defaultDescription: `Follow-up required by ${raiseTaskFor.followUpDate ? new Date(raiseTaskFor.followUpDate).toLocaleDateString("en-GB") : "—"}${raiseTaskFor.herdLabel ? ` · ${raiseTaskFor.herdLabel}` : ""}${raiseTaskFor.detail ? ` · ${raiseTaskFor.detail}` : ""}`
      }
    )
  ] }) });
}
export {
  HerdHealthRegisterPage as default
};
