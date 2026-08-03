import { b as useAppStore, t as useQueryClient, a as useToast, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, Q as React, A as ArrowRight, H as DialogDescription, d as LoaderCircle } from "./index-Cn4HYx_z.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { C as CropYearSelector } from "./CropYearSelector-DI-bDPFJ.js";
import { c as currentCropYear, i as isInCropYear } from "./cropYear-Dmv-iNR6.js";
import { A as AppLayout, B as BookOpen, c as ClipboardList } from "./AppLayout-GpX30yUm.js";
import { T as Textarea } from "./textarea-Dmg2yAfL.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DDDb12Ac.js";
import { O as OtherSelect } from "./other-select-BuiX0KvA.js";
import { u as useUpload } from "./use-upload-Cie3Plmf.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-D5Q6mH8i.js";
import { H as History } from "./history-T4oM1VNJ.js";
import { P as Printer } from "./printer-DLZd-Sf0.js";
import { T as TriangleAlert } from "./triangle-alert-CqiLO-Fz.js";
import { C as CircleAlert } from "./database-T-MkLoL9.js";
import { C as CircleCheck } from "./circle-check-DZlu--lN.js";
import { P as Pencil } from "./pencil-lLaMBjiq.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-CqxjnahN.js";
import { C as ChevronUp } from "./chevron-up-BPmj-fat.js";
import { C as CircleCheckBig } from "./circle-check-big-DGAMIB5z.js";
import { F as File } from "./file-DOXZNOu4.js";
import { C as Camera } from "./camera-BPaPOGgH.js";
import "./use-safe-clerk-BkhPzJ2I.js";
import "./shield-alert-BDjwjwRf.js";
import "./shield-check-D0TASrTF.js";
import "./tractor-DjxVUV5U.js";
import "./index-BaKpWAM-.js";
import "./index-CMqCgCYi.js";
const PERSON_TYPES = ["Employee", "Contractor", "Self-employed", "Visitor", "Member of public"];
const BODY_PARTS = [
  "Head / skull",
  "Face",
  "Eye(s)",
  "Ear(s)",
  "Neck",
  "Shoulder(s)",
  "Upper arm",
  "Elbow",
  "Forearm",
  "Wrist",
  "Hand / fingers",
  "Chest / ribcage",
  "Upper back",
  "Lower back",
  "Abdomen",
  "Hip",
  "Thigh / upper leg",
  "Knee",
  "Lower leg / shin",
  "Ankle",
  "Foot / toes",
  "Multiple / whole body",
  "Internal",
  "Other"
];
const RIDDOR_CATEGORIES = [
  "Over-7-day injury (must report within 15 days)",
  "Specified injury — fracture other than finger/thumb/toe",
  "Specified injury — amputation",
  "Specified injury — loss of sight (permanent or temporary)",
  "Specified injury — crush injury",
  "Specified injury — scalping",
  "Specified injury — unconsciousness due to head injury / asphyxia",
  "Specified injury — requires resuscitation or 24h+ hospital",
  "Dangerous occurrence (near miss, no injury required)",
  "Occupational disease",
  "Death"
];
function AccidentPhotoPanel({ recordId, farmId, photos }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const deleteMut = useMutation({
    mutationFn: (photoId) => fetch(`/api/farms/${farmId}/accident-book/${recordId}/photos/${photoId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accident-book", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/accident-book/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["accident-book", farmId] });
      toast({ title: "Photo uploaded" });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 14px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }, children: "Scene / Evidence Photos" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }, children: photos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 12, style: { color: "#2563eb" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${p.objectPath}`, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }, children: p.fileName ?? "photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(p.id), style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }, children: [
      isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 13 }),
      isUploading ? `Uploading… ${progress}%` : "Add Photo",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*,application/pdf",
          style: { display: "none" },
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }
        }
      )
    ] })
  ] });
}
const EMPTY_FORM = {
  incidentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  incidentTime: "",
  incidentLocation: "",
  personName: "",
  personType: "Employee",
  jobTitle: "",
  natureOfIncident: "",
  natureOfInjury: "",
  bodyPartAffected: "",
  firstAidGiven: false,
  firstAidDetails: "",
  firstAiderName: "",
  hospitalAttended: false,
  hospitalName: "",
  timeLostDays: "",
  riddorReportable: false,
  riddorCategory: "",
  riddorReference: "",
  riddorReportedDate: "",
  witnesses: "",
  correctiveAction: "",
  signedOffBy: "",
  signOffDate: "",
  notes: "",
  status: "reported"
};
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
function RiddorBadge({ record }) {
  if (!record.riddorReportable) return null;
  if (record.riddorReference) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 10 }),
      " RIDDOR — Reported (",
      record.riddorReference,
      ")"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }),
    " RIDDOR — Pending Report"
  ] });
}
function RecordCard({ record, farmId, onEdit, onDelete, onRaiseTask, onInvestigate, onCorrectiveAction, onSignOff }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const status = record.status ?? "reported";
  const borderColor = record.riddorReportable && !record.riddorReference ? "#fca5a5" : status === "closed" ? "#bbf7d0" : "#e5e7eb";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: `1px solid ${borderColor}`, borderRadius: 10, background: "#fff", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 16px", gap: 12, cursor: "pointer" },
        onClick: () => setExpanded((e) => !e),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, color: "#111827", fontSize: "0.9375rem" }, children: [
                fmt(record.incidentDate),
                record.incidentTime ? ` at ${record.incidentTime}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(RiddorBadge, { record }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AccidentStatusBadge, { status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#374151", fontWeight: 500 }, children: [
              record.personName,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontWeight: 400 }, children: [
                "(",
                record.personType,
                record.jobTitle ? ` — ${record.jobTitle}` : "",
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Location:" }),
              " ",
              record.incidentLocation,
              "  · ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Incident:" }),
              " ",
              record.natureOfIncident.length > 90 ? record.natureOfIncident.slice(0, 90) + "…" : record.natureOfIncident
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }, onClick: (e) => e.stopPropagation(), children: [
            status === "reported" && onInvestigate && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onInvestigate, style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, cursor: "pointer", padding: "4px 10px", color: "#92400e", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 12 }),
              " Investigate"
            ] }),
            status === "under_investigation" && onCorrectiveAction && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onCorrectiveAction, style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", padding: "4px 10px", color: "#1d4ed8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 12 }),
              " Record Action"
            ] }),
            (status === "under_investigation" || status === "corrective_action_taken") && onSignOff && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onSignOff, style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", padding: "4px 10px", color: "#166534", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
              " Sign Off"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onEdit, style: { background: "none", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#374151", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }),
              " Edit"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onDelete, style: { background: "none", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#dc2626", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }),
              " Delete"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onRaiseTask, style: { background: "none", border: "1px solid #fde68a", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#92400e", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }, title: "Raise Task", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 12 }),
              " Task"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setExpanded((e) => !e), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16 }) })
          ] })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "0.8125rem", color: "#374151" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Nature of Injury", value: record.natureOfInjury }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Body Part Affected", value: record.bodyPartAffected }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "First Aid Given", value: record.firstAidGiven ? record.firstAidDetails || "Yes" : "No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "First Aider", value: record.firstAiderName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Hospital Attended", value: record.hospitalAttended ? record.hospitalName || "Yes" : "No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Time Lost", value: record.timeLostDays ? `${record.timeLostDays} day(s)` : "None recorded" }),
        record.riddorReportable && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "RIDDOR Category", value: record.riddorCategory }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "RIDDOR Reference", value: record.riddorReference }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Date Reported to HSE", value: record.riddorReportedDate ? fmt(record.riddorReportedDate) : null })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Witnesses", value: record.witnesses, span: true }),
        record.investigatedBy && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Investigated By", value: `${record.investigatedBy}${record.investigationDate ? ` on ${fmt(record.investigationDate)}` : ""}` }),
        record.investigationNotes && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Investigation Notes", value: record.investigationNotes, span: true }),
        record.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Corrective Action Taken", value: record.correctiveAction, span: true }),
        record.correctiveActionBy && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Corrective Action By", value: `${record.correctiveActionBy}${record.correctiveActionDate ? ` on ${fmt(record.correctiveActionDate)}` : ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Signed Off By", value: record.signedOffBy ? `${record.signedOffBy}${record.signOffDate ? ` on ${fmt(record.signOffDate)}` : ""}` : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Notes", value: record.notes, span: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AccidentPhotoPanel, { recordId: record.id, farmId, photos: record.photos })
    ] })
  ] });
}
function DetailRow({ label, value, span }) {
  if (!value) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: span ? { gridColumn: "1 / -1" } : {}, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 2, color: "#111827", whiteSpace: "pre-wrap" }, children: value })
  ] });
}
const ACCIDENT_STATUS_CFG = {
  reported: { label: "Reported", bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  under_investigation: { label: "Under Investigation", bg: "#fefce8", color: "#713f12", border: "#fef08a" },
  corrective_action_taken: { label: "Action Taken", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  closed: { label: "Closed", bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" }
};
function AccidentStatusBadge({ status }) {
  const cfg = ACCIDENT_STATUS_CFG[status] ?? ACCIDENT_STATUS_CFG.reported;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }, children: cfg.label });
}
function InvestigateDialog({ farmId, record, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [investigationDate, setInvestigationDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [investigatedBy, setInvestigatedBy] = reactExports.useState("");
  const [investigationNotes, setInvestigationNotes] = reactExports.useState(record.investigationNotes ?? "");
  const [riddorCategory, setRiddorCategory] = reactExports.useState(record.riddorCategory ?? "");
  const [riddorReference, setRiddorReference] = reactExports.useState(record.riddorReference ?? "");
  const [riddorReportedDate, setRiddorReportedDate] = reactExports.useState(record.riddorReportedDate ?? "");
  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/accident-book/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        investigationDate,
        investigatedBy: investigatedBy || null,
        investigationNotes: investigationNotes || null,
        riddorCategory: riddorCategory || null,
        riddorReference: riddorReference || null,
        riddorReportedDate: riddorReportedDate || null,
        status: "under_investigation"
      })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accident-book", farmId] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Investigation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        record.personName,
        " — ",
        fmt(record.incidentDate)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14, marginTop: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Investigation Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: investigationDate, onChange: (e) => setInvestigationDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Investigated By *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: investigatedBy, onChange: (e) => setInvestigatedBy(e.target.value), placeholder: "Manager / investigator name" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Investigation Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 3, value: investigationNotes, onChange: (e) => setInvestigationNotes(e.target.value), placeholder: "Findings, root cause, contributing factors…" })
      ] }),
      record.riddorReportable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "12px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, fontSize: "0.8125rem", color: "#991b1b", marginBottom: 10 }, children: "RIDDOR — Complete within deadline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "RIDDOR Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: riddorCategory, onValueChange: setRiddorCategory, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RIDDOR_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "HSE Reference No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: riddorReference, onChange: (e) => setRiddorReference(e.target.value), placeholder: "From riddor.hse.gov.uk" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Reported to HSE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: riddorReportedDate, onChange: (e) => setRiddorReportedDate(e.target.value) })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || !investigatedBy.trim(), children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }),
        " Saving…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Save Investigation ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14, className: "ml-1" })
      ] }) })
    ] })
  ] }) });
}
function RecordCorrectiveActionDialog({ farmId, record, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [correctiveAction, setCorrectiveAction] = reactExports.useState(record.correctiveAction ?? "");
  const [correctiveActionDate, setCorrectiveActionDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [correctiveActionBy, setCorrectiveActionBy] = reactExports.useState("");
  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/accident-book/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correctiveAction: correctiveAction || null,
        correctiveActionDate: correctiveActionDate || null,
        correctiveActionBy: correctiveActionBy || null,
        status: "corrective_action_taken"
      })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accident-book", farmId] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Corrective Action" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        record.personName,
        " — ",
        fmt(record.incidentDate)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14, marginTop: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Action Taken *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 3, value: correctiveAction, onChange: (e) => setCorrectiveAction(e.target.value), placeholder: "What steps were taken to prevent recurrence?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: correctiveActionDate, onChange: (e) => setCorrectiveActionDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: correctiveActionBy, onChange: (e) => setCorrectiveActionBy(e.target.value), placeholder: "Name" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || !correctiveAction.trim(), children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }),
        " Saving…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Save Action ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14, className: "ml-1" })
      ] }) })
    ] })
  ] }) });
}
function SignOffDialog({ farmId, record, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [signedOffBy, setSignedOffBy] = reactExports.useState(record.signedOffBy ?? "");
  const [signOffDate, setSignOffDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/accident-book/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedOffBy: signedOffBy || null, signOffDate: signOffDate || null, status: "closed" })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accident-book", farmId] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Sign Off Record" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        record.personName,
        " — ",
        fmt(record.incidentDate)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Signed Off By *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: signedOffBy, onChange: (e) => setSignedOffBy(e.target.value), placeholder: "Manager's name", autoFocus: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sign-Off Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: signOffDate, onChange: (e) => setSignOffDate(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || !signedOffBy.trim(), style: { background: "#16a34a", color: "#fff" }, children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }),
        " Saving…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "mr-1" }),
        " Sign Off Record"
      ] }) })
    ] })
  ] }) });
}
function AccidentHistoryDialog({ records, onClose }) {
  const [yearFilter, setYearFilter] = React.useState("all");
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const sorted = [...records].sort((a, b) => new Date(b.incidentDate ?? 0).getTime() - new Date(a.incidentDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((r) => r.incidentDate && new Date(r.incidentDate).getFullYear() === yearFilter);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  function handlePrint() {
    const rows = filtered.map((r) => `<tr><td>${fmtDate(r.incidentDate)}${r.incidentTime ? ` ${r.incidentTime}` : ""}</td><td>${r.personName} (${r.personType})</td><td>${r.incidentLocation}</td><td>${r.natureOfIncident}</td><td>${r.natureOfInjury || "—"}</td><td>${r.riddorReportable ? r.riddorReference ? `Yes — ${r.riddorReference}` : "Yes — PENDING" : "No"}</td><td>${r.status ?? "reported"}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Accident Book History</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:5px 7px;text-align:left;font-size:8.5pt}td{padding:4px 7px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Accident Book — Full History</h1><p style="font-size:9pt;color:#555">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} · ${filtered.length} record${filtered.length !== 1 ? "s" : ""}${yearFilter !== "all" ? ` (${yearFilter})` : ""}</p><table><thead><tr><th>Date / Time</th><th>Person</th><th>Location</th><th>Incident</th><th>Injury</th><th>RIDDOR</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">RIDDOR requirement: retain accident records for at least 3 years (fatal/specified: indefinitely).</p></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-green-700" }),
      "Accident Book — Full History"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter(y), style: { padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }, children: y === "all" ? "All years" : y }, y)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " record",
        filtered.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-9 h-9 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No accident records",
        yearFilter !== "all" ? ` for ${yearFilter}` : ""
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: filtered.map((r) => {
      const isRiddorPending = r.riddorReportable && !r.riddorReference;
      const isRiddorReported = r.riddorReportable && r.riddorReference;
      const statusColors = {
        reported: { bg: "#fffbeb", color: "#92400e" },
        under_investigation: { bg: "#eff6ff", color: "#1e40af" },
        corrective_action_taken: { bg: "#f0fdf4", color: "#15803d" },
        closed: { bg: "#f0fdf4", color: "#166534" }
      };
      const sc = statusColors[r.status ?? "reported"] ?? statusColors.reported;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "12px 4px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { width: 88, textAlign: "right", flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }, children: r.incidentDate ? new Date(r.incidentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: r.incidentDate ? new Date(r.incidentDate).getFullYear() : "" }),
          r.incidentTime && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280" }, children: r.incidentTime })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" }, children: r.personName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
              "(",
              r.personType,
              r.jobTitle ? ` — ${r.jobTitle}` : "",
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: sc.bg, color: sc.color }, children: (r.status ?? "reported").replace(/_/g, " ") }),
            isRiddorPending && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#fef2f2", color: "#dc2626" }, children: "RIDDOR — Pending" }),
            isRiddorReported && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#f0fdf4", color: "#15803d" }, children: [
              "RIDDOR — ",
              r.riddorReference
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginBottom: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Location:" }),
            " ",
            r.incidentLocation
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#374151" }, children: r.natureOfIncident.length > 120 ? r.natureOfIncident.slice(0, 120) + "…" : r.natureOfIncident }),
          r.natureOfInjury && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }, children: [
            "Injury: ",
            r.natureOfInjury
          ] })
        ] })
      ] }) }, r.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { borderTop: "1px solid #e5e7eb", paddingTop: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#6b7280", flex: 1 }, children: [
        "RIDDOR: retain records for at least ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 years" }),
        " (fatal/specified incidents: indefinitely)."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function AccidentBookPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const q = useQuery({
    queryKey: ["accident-book", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/accident-book`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = q.data?.records ?? [];
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [filter, setFilter] = reactExports.useState("all");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [allYears, setAllYears] = reactExports.useState(false);
  const [historyOpen, setHistoryOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({ ...EMPTY_FORM });
  const [investigateRecord, setInvestigateRecord] = reactExports.useState(null);
  const [correctiveActionRecord, setCorrectiveActionRecord] = reactExports.useState(null);
  const [signOffRecord, setSignOffRecord] = reactExports.useState(null);
  function openAdd() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, incidentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setAddOpen(true);
  }
  function openEdit(r) {
    setEditItem(r);
    setForm({
      incidentDate: r.incidentDate,
      incidentTime: r.incidentTime ?? "",
      incidentLocation: r.incidentLocation,
      personName: r.personName,
      personType: r.personType,
      jobTitle: r.jobTitle ?? "",
      natureOfIncident: r.natureOfIncident,
      natureOfInjury: r.natureOfInjury ?? "",
      bodyPartAffected: r.bodyPartAffected ?? "",
      firstAidGiven: r.firstAidGiven,
      firstAidDetails: r.firstAidDetails ?? "",
      firstAiderName: r.firstAiderName ?? "",
      hospitalAttended: r.hospitalAttended,
      hospitalName: r.hospitalName ?? "",
      timeLostDays: r.timeLostDays ?? "",
      riddorReportable: r.riddorReportable,
      riddorCategory: r.riddorCategory ?? "",
      riddorReference: r.riddorReference ?? "",
      riddorReportedDate: r.riddorReportedDate ?? "",
      witnesses: r.witnesses ?? "",
      correctiveAction: r.correctiveAction ?? "",
      signedOffBy: r.signedOffBy ?? "",
      signOffDate: r.signOffDate ?? "",
      notes: r.notes ?? "",
      status: r.status ?? "reported"
    });
    setAddOpen(true);
  }
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["accident-book", farmId] });
    qc.invalidateQueries({ queryKey: ["notifications", farmId] });
  };
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/accident-book`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Record added to Accident Book" });
      invalidate();
      setAddOpen(false);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/accident-book/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Record updated" });
      invalidate();
      setAddOpen(false);
      setEditItem(null);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/accident-book/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function handleSave() {
    const body = { ...form, riddorReportable: !!form.riddorReportable, firstAidGiven: !!form.firstAidGiven, hospitalAttended: !!form.hospitalAttended };
    if (editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }
  const filtered = records.filter((r) => {
    if (!allYears && !isInCropYear(r.incidentDate, cropYear)) return false;
    if (filter === "riddor-pending") return r.riddorReportable && !r.riddorReference;
    if (filter === "riddor-reported") return r.riddorReportable && !!r.riddorReference;
    if (filter === "unsigned") return !r.signedOffBy;
    return true;
  });
  const pendingRiddor = records.filter((r) => r.riddorReportable && !r.riddorReference).length;
  const totalTimeLost = records.reduce((s, r) => s + (r.timeLostDays ? parseFloat(r.timeLostDays) || 0 : 0), 0);
  function handlePrint() {
    const farm = farmData?.record;
    const rows = records.map((r) => `<tr>
      <td style="white-space:nowrap">${r.incidentDate ? new Date(r.incidentDate).toLocaleDateString("en-GB") : "—"}</td>
      <td><strong>${r.personName}</strong></td>
      <td>${r.personType}</td>
      <td>${r.incidentLocation}</td>
      <td>${r.natureOfIncident}</td>
      <td>${r.natureOfInjury || "—"}</td>
      <td>${r.bodyPartAffected || "—"}</td>
      <td>${r.firstAidGiven ? r.firstAidDetails || "Yes" : "No"}</td>
      <td>${r.hospitalAttended ? "Yes" : "No"}</td>
      <td style="white-space:nowrap">${r.timeLostDays ? r.timeLostDays + " day(s)" : "—"}</td>
      <td style="${r.riddorReportable && !r.riddorReference ? "color:#dc2626;font-weight:700" : ""}">${r.riddorReportable ? r.riddorReference ? r.riddorReference : "PENDING" : "No"}</td>
      <td>${r.signedOffBy || "—"}</td>
    </tr>`).join("");
    const tableHtml = `<table><thead><tr>
      <th>Date</th><th>Person</th><th>Type</th><th>Location</th><th>Incident</th>
      <th>Injury</th><th>Body Part</th><th>First Aid</th><th>Hospital</th>
      <th>Time Lost</th><th>RIDDOR</th><th>Signed Off</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: "Accident Book Register",
      subtitle: "UK Health & Safety Law · RIDDOR 2013",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      redTractorId: farm?.redTractorId ?? void 0,
      recordCount: records.length,
      recordLabel: "entry",
      extraMeta: `Total days lost: ${totalTimeLost > 0 ? totalTimeLost.toFixed(1) : "0"}`,
      tableHtml,
      footerNote: "Maintained under UK Health & Safety law and RIDDOR 2013. Keep securely — access restricted to authorised persons."
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1e3, margin: "0 auto", padding: "0 8px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 22, style: { color: "#2563eb" } }),
          " Accident Book"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }, children: "Maintained under UK Health & Safety law and RIDDOR 2013. All workplace incidents, injuries and near misses." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setHistoryOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 14, className: "mr-2" }),
          " Full History"
        ] }),
        historyOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(AccidentHistoryDialog, { records, onClose: () => setHistoryOpen(false) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, disabled: !farmId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-2" }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, disabled: !farmId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          " Add Entry"
        ] })
      ] })
    ] }),
    pendingRiddor > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, marginBottom: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, style: { flexShrink: 0, marginTop: 1, color: "#dc2626" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, color: "#991b1b", fontSize: "0.9375rem" }, children: [
          pendingRiddor,
          " RIDDOR reportable incident",
          pendingRiddor > 1 ? "s" : "",
          " awaiting HSE report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#7f1d1d", fontSize: "0.8125rem", marginTop: 2 }, children: [
          "Report online at ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "riddor.hse.gov.uk" }),
          " — over-7-day injuries must be reported within 15 days; specified injuries, dangerous occurrences and deaths within 10 days."
        ] })
      ] })
    ] }),
    !farmId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 16, style: { flexShrink: 0, marginTop: 1, color: "#d97706" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#92400e" }, children: "Select a farm from the sidebar to view this farm's Accident Book." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }, children: [
        { label: "Total Entries", value: String(records.length), bg: "#f9fafb", border: "#e5e7eb", color: "#111827", clickable: false },
        { label: "RIDDOR Reportable", value: String(records.filter((r) => r.riddorReportable).length), bg: "#fef2f2", border: "#fecaca", color: "#dc2626", clickable: false },
        { label: "Awaiting HSE Report", value: String(pendingRiddor), bg: pendingRiddor > 0 ? "#fef2f2" : "#f0fdf4", border: pendingRiddor > 0 ? allYears && filter === "riddor-pending" ? "#dc2626" : "#fca5a5" : "#bbf7d0", color: pendingRiddor > 0 ? "#dc2626" : "#16a34a", clickable: pendingRiddor > 0 },
        { label: "Total Days Lost", value: totalTimeLost > 0 ? totalTimeLost.toFixed(1) : "0", bg: "#fffbeb", border: "#fde68a", color: "#92400e", clickable: false }
      ].map((s) => {
        const isActive = s.label === "Awaiting HSE Report" && allYears && filter === "riddor-pending";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: s.clickable ? () => {
              if (isActive) {
                setAllYears(false);
                setFilter("all");
              } else {
                setFilter("riddor-pending");
                setAllYears(true);
              }
            } : void 0,
            style: { background: s.bg, border: isActive ? `2px solid #dc2626` : `1px solid ${s.border}`, borderRadius: 8, padding: isActive ? "11px 15px" : "12px 16px", cursor: s.clickable ? "pointer" : "default", boxShadow: isActive ? "0 0 0 3px #fee2e2" : void 0, transition: "box-shadow 0.15s" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: s.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: s.color }, children: s.value }),
              s.clickable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }, children: isActive ? "All years — click to clear" : "Click to filter" })
            ]
          },
          s.label
        );
      }) }),
      allYears && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 12, fontSize: "0.875rem", color: "#92400e" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, style: { flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Showing all years — RIDDOR Pending (",
          filtered.length,
          " record",
          filtered.length !== 1 ? "s" : "",
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setAllYears(false);
          setFilter("all");
        }, style: { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#92400e", fontWeight: 600, fontSize: "0.875rem", padding: "0 4px" }, children: "✕ Clear" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }, children: [
        [
          ["all", `All (${records.length})`],
          ["riddor-pending", `RIDDOR Pending (${records.filter((r) => r.riddorReportable && !r.riddorReference).length})`],
          ["riddor-reported", `RIDDOR Reported (${records.filter((r) => r.riddorReportable && !!r.riddorReference).length})`],
          ["unsigned", `Awaiting Sign-Off (${records.filter((r) => !r.signedOffBy).length})`]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setFilter(key);
              if (key !== "riddor-pending") setAllYears(false);
            },
            style: {
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: "0.8125rem",
              cursor: "pointer",
              fontWeight: filter === key ? 600 : 400,
              background: filter === key ? "#111827" : "#f3f4f6",
              color: filter === key ? "#fff" : "#374151",
              border: "1px solid " + (filter === key ? "#111827" : "#e5e7eb")
            },
            children: label
          },
          key
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginLeft: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: (v) => {
          setCropYear(v);
          setAllYears(false);
        } }) })
      ] }),
      q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 40, style: { margin: "0 auto 10px", opacity: 0.2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", fontSize: "1rem" }, children: records.length === 0 ? "Accident Book is empty" : "No records match this filter" }),
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", maxWidth: 420, margin: "8px auto 0" }, children: "All workplace injuries, near misses and dangerous occurrences must be recorded here. UK employers are legally required to maintain this register." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", style: { marginTop: 20 }, onClick: openAdd, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
            " Add first entry"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 10 }, children: filtered.map((record) => /* @__PURE__ */ jsxRuntimeExports.jsx(RecordCard, { record, farmId, onEdit: () => openEdit(record), onDelete: () => setDeleteId(record.id), onRaiseTask: () => setRaiseTaskFor(record), onInvestigate: () => setInvestigateRecord(record), onCorrectiveAction: () => setCorrectiveActionRecord(record), onSignOff: () => setSignOffRecord(record) }, record.id)) }),
      records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: 24, fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Data protection:" }),
        " Accident records contain personal data. Access is restricted to authorised farm managers. Records should be retained for at least 3 years (RIDDOR) or for the duration of employment plus 40 years where industrial disease may be relevant."
      ] })
    ] }),
    addOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditItem(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 640, maxHeight: "88vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Accident Book Entry" : "New Accident Book Entry" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeading, { children: "Incident Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Incident *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.incidentDate, onChange: (e) => setForm((f) => ({ ...f, incidentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Time (if known)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", className: "mt-1", value: form.incidentTime, onChange: (e) => setForm((f) => ({ ...f, incidentTime: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location on Farm *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.incidentLocation, onChange: (e) => setForm((f) => ({ ...f, incidentLocation: e.target.value })), placeholder: "e.g. Grain store, Top field, Workshop" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description of What Happened *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 3, value: form.natureOfIncident, onChange: (e) => setForm((f) => ({ ...f, natureOfIncident: e.target.value })), placeholder: "Describe how the incident occurred, what activity was taking place, and any equipment involved." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeading, { children: "Person Involved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.personName, onChange: (e) => setForm((f) => ({ ...f, personName: e.target.value })), placeholder: "Full name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Person Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.personType, onValueChange: (v) => setForm((f) => ({ ...f, personType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PERSON_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job Title / Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.jobTitle, onChange: (e) => setForm((f) => ({ ...f, jobTitle: e.target.value })), placeholder: "e.g. Tractor driver, Farm manager, Contractor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeading, { children: "Injury & Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nature of Injury" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.natureOfInjury, onChange: (e) => setForm((f) => ({ ...f, natureOfInjury: e.target.value })), placeholder: "e.g. Laceration, fracture, sprain, bruising, chemical burn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Body Part Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OtherSelect,
            {
              className: "mt-1",
              options: BODY_PARTS,
              value: form.bodyPartAffected,
              onValueChange: (v) => setForm((f) => ({ ...f, bodyPartAffected: v })),
              placeholder: "Select body part…",
              specifyPlaceholder: "Describe the affected body part…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "firstAidGiven", checked: form.firstAidGiven, onChange: (e) => setForm((f) => ({ ...f, firstAidGiven: e.target.checked })), style: { width: 15, height: 15 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "firstAidGiven", style: { fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }, children: "First Aid Was Given" })
          ] }),
          form.firstAidGiven && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingLeft: 24 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First Aid Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.firstAidDetails, onChange: (e) => setForm((f) => ({ ...f, firstAidDetails: e.target.value })), placeholder: "e.g. Wound cleaned and dressed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First Aider Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.firstAiderName, onChange: (e) => setForm((f) => ({ ...f, firstAiderName: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "hospitalAttended", checked: form.hospitalAttended, onChange: (e) => setForm((f) => ({ ...f, hospitalAttended: e.target.checked })), style: { width: 15, height: 15 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "hospitalAttended", style: { fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }, children: "Hospital / GP Attended" })
          ] }),
          form.hospitalAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { paddingLeft: 24 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hospital / Surgery Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.hospitalName, onChange: (e) => setForm((f) => ({ ...f, hospitalName: e.target.value })), placeholder: "e.g. Morriston Hospital A&E" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Days Away from Work" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.5", className: "mt-1", value: form.timeLostDays, onChange: (e) => setForm((f) => ({ ...f, timeLostDays: e.target.value })), placeholder: "0 (none), 0.5, 1, 7…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "12px 14px", background: form.riddorReportable ? "#fef2f2" : "#f9fafb", border: `1px solid ${form.riddorReportable ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: form.riddorReportable ? 12 : 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "riddorReportable", checked: form.riddorReportable, onChange: (e) => setForm((f) => ({ ...f, riddorReportable: e.target.checked })), style: { width: 15, height: 15, marginTop: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "riddorReportable", style: { cursor: "pointer" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: form.riddorReportable ? "#991b1b" : "#111827" }, children: "RIDDOR Reportable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 1 }, children: "Tick if this is a specified injury, over-7-day absence, dangerous occurrence or occupational disease that must be reported to the HSE." })
            ] })
          ] }),
          form.riddorReportable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 10, paddingLeft: 24 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "RIDDOR Category *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.riddorCategory, onValueChange: (v) => setForm((f) => ({ ...f, riddorCategory: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RIDDOR_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "HSE Reference Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.riddorReference, onChange: (e) => setForm((f) => ({ ...f, riddorReference: e.target.value })), placeholder: "From riddor.hse.gov.uk" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Reported to HSE" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.riddorReportedDate, onChange: (e) => setForm((f) => ({ ...f, riddorReportedDate: e.target.value })) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeading, { children: "Follow-Up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Witnesses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.witnesses, onChange: (e) => setForm((f) => ({ ...f, witnesses: e.target.value })), placeholder: "Names of any witnesses" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Additional Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        editItem && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeading, { children: "Corrective Action & Sign-Off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#9ca3af", marginTop: -8 }, children: 'Use the "Investigate", "Record Action" and "Sign Off" buttons on the record card to progress through stages. Edit these fields here only to correct existing data.' }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.correctiveAction, onChange: (e) => setForm((f) => ({ ...f, correctiveAction: e.target.value })), placeholder: "What steps were taken to prevent recurrence?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Signed Off By (Manager)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.signedOffBy, onChange: (e) => setForm((f) => ({ ...f, signedOffBy: e.target.value })), placeholder: "Manager's name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sign-Off Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.signOffDate, onChange: (e) => setForm((f) => ({ ...f, signOffDate: e.target.value })) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !form.incidentDate || !form.incidentLocation.trim() || !form.personName.trim() || !form.natureOfIncident.trim() || createMut.isPending || updateMut.isPending,
            onClick: handleSave,
            children: editItem ? "Update Entry" : "Add to Accident Book"
          }
        )
      ] })
    ] }) }),
    investigateRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(InvestigateDialog, { farmId, record: investigateRecord, onClose: () => setInvestigateRecord(null) }),
    correctiveActionRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordCorrectiveActionDialog, { farmId, record: correctiveActionRecord, onClose: () => setCorrectiveActionRecord(null) }),
    signOffRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(SignOffDialog, { farmId, record: signOffRecord, onClose: () => setSignOffRecord(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `${raiseTaskFor.riddorReportable && !raiseTaskFor.riddorReference ? "RIDDOR Report" : "Corrective Action"} — ${raiseTaskFor.personName} (${raiseTaskFor.incidentDate ? new Date(raiseTaskFor.incidentDate).toLocaleDateString("en-GB") : ""})` : "",
        defaultDescription: raiseTaskFor?.correctiveAction || "",
        module: "health_safety"
      }
    ),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete this entry?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "This will permanently remove this accident record. If this incident was RIDDOR reportable, the HSE submission itself is not affected." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] }) });
}
function SectionHeading({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: "1px solid #e5e7eb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.8125rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }, children }) });
}
export {
  AccidentBookPage as default
};
