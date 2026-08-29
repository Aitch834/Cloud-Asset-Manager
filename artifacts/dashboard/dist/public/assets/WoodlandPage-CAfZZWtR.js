import { b as useAppStore, c as useQueryClient, m as useQuery, r as reactExports, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter, C as Checkbox } from "./index-DakeDh1k.js";
import { u as usePersistedTab } from "./use-persisted-tab-J1yT15C2.js";
import { A as AppLayout, g as TreePine, I as Info } from "./AppLayout-CsjlVfo3.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { T as Textarea } from "./textarea-CdY5xRQn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-zXVtTdYn.js";
import { C as ConfirmDialog } from "./confirm-dialog-CCpearC7.js";
import { B as Badge } from "./badge-C30eZvQC.js";
import { T as TabBar, a as TabButton } from "./tab-button-CqjxY6Vg.js";
import { T as TriangleAlert } from "./triangle-alert-CMaHjStf.js";
import { P as Pencil } from "./pencil-BGcNZESW.js";
import { T as Trash2 } from "./trash-2-CVhiMi9-.js";
import "./use-safe-clerk-B9ePF_7-.js";
import "./database-HvhwI55g.js";
import "./shield-alert-gsvirwwg.js";
import "./shield-check-BYbyu8cH.js";
import "./tractor--QNwAK3H.js";
import "./index-CsquMz2b.js";
import "./index-DchJ-JX2.js";
import "./chevron-up-Co6ogH5s.js";
const TAB_IDS = ["records", "licences"];
const LEGAL_BASES = [
  { value: "licence", label: "Felling licence held" },
  { value: "quarterly_allowance", label: "Exempt — quarterly allowance (≤5 m³/quarter, ≤2 m³ sold)" },
  { value: "small_diameter", label: "Exempt — trees below diameter threshold" },
  { value: "garden_orchard_churchyard", label: "Exempt — garden, orchard or churchyard" },
  { value: "dangerous_nuisance", label: "Exempt — prevention of danger / nuisance" },
  { value: "tpo_planning_consent", label: "Other consent — TPO / planning permission" },
  { value: "statutory_undertaking", label: "Exempt — statutory undertaking" },
  { value: "lopping_topping", label: "Exempt — lopping & topping (maintenance)" },
  { value: "hedgerow", label: "Exempt — hedgerow trees / trimming" },
  { value: "other_exemption", label: "Other exemption (record evidence)" }
];
const basisLabel = (v) => LEGAL_BASES.find((b) => b.value === v)?.label ?? v;
const LICENCE_STATUSES = ["planned", "applied", "approved", "refused", "expired"];
const FELLING_TYPES = ["clear_fell", "thinning", "selective", "coppice", "other"];
const statusBadge = (s) => {
  const map = {
    planned: "bg-gray-100 text-gray-700",
    applied: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    refused: "bg-red-100 text-red-700",
    expired: "bg-amber-100 text-amber-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: map[s] ?? "bg-gray-100 text-gray-700", children: s });
};
const num = (v) => {
  const n = parseFloat(String(v ?? ""));
  return isNaN(n) ? 0 : n;
};
const fmtDate = (d) => d ? String(d).slice(0, 10) : "—";
function RecordDialog({ farmId, editRow, licences, fields, onClose }) {
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState(() => ({
    fellingDate: editRow?.fellingDate?.slice(0, 10) ?? "",
    location: editRow?.location ?? "",
    fieldId: editRow?.fieldId ? String(editRow.fieldId) : "",
    species: editRow?.species ?? "",
    treeCount: editRow?.treeCount != null ? String(editRow.treeCount) : "",
    volumeM3: editRow?.volumeM3 ?? "",
    volumeSoldM3: editRow?.volumeSoldM3 ?? "",
    legalBasis: editRow?.legalBasis ?? "licence",
    licenceId: editRow?.licenceId ? String(editRow.licenceId) : "",
    purpose: editRow?.purpose ?? "",
    contractor: editRow?.contractor ?? "",
    evidenceNotes: editRow?.evidenceNotes ?? "",
    notes: editRow?.notes ?? ""
  }));
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        fellingDate: f.fellingDate,
        location: f.location || null,
        fieldId: f.fieldId ? Number(f.fieldId) : null,
        species: f.species || null,
        treeCount: f.treeCount ? Number(f.treeCount) : null,
        volumeM3: f.volumeM3 || null,
        volumeSoldM3: f.volumeSoldM3 || null,
        legalBasis: f.legalBasis,
        licenceId: f.legalBasis === "licence" && f.licenceId ? Number(f.licenceId) : null,
        purpose: f.purpose || null,
        contractor: f.contractor || null,
        evidenceNotes: f.evidenceNotes || null,
        notes: f.notes || null
      };
      return editRow ? api.put(`/farms/${farmId}/felling-records/${editRow.id}`, payload) : api.post(`/farms/${farmId}/felling-records`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["felling-records", farmId] });
      onClose();
    }
  });
  const isExemption = f.legalBasis !== "licence" && f.legalBasis !== "tpo_planning_consent";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      saveMut.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRow ? "Edit Felling Record" : "Record Tree Felling" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Felling date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.fellingDate, onChange: (e) => set("fellingDate", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location / woodland" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.location, onChange: (e) => set("location", e.target.value), placeholder: "e.g. Long Copse" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.fieldId || "none", onValueChange: (v) => set("fieldId", v === "none" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— None —" }),
            fields.map((fd) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(fd.id), children: fd.name ?? fd.fieldName ?? `Field ${fd.id}` }, fd.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.species, onChange: (e) => set("species", e.target.value), placeholder: "e.g. Ash, Oak" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of trees" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: f.treeCount, onChange: (e) => set("treeCount", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume felled (m³)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: f.volumeM3, onChange: (e) => set("volumeM3", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume sold (m³)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: f.volumeSoldM3, onChange: (e) => set("volumeSoldM3", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Legal basis *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.legalBasis, onValueChange: (v) => set("legalBasis", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LEGAL_BASES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.value, children: b.label }, b.value)) })
        ] })
      ] }),
      f.legalBasis === "licence" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Felling licence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.licenceId || "none", onValueChange: (v) => set("licenceId", v === "none" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select licence" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— Not linked —" }),
            licences.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(l.id), children: [
              l.licenceNumber || `Licence #${l.id}`,
              " (",
              l.status,
              ")"
            ] }, l.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purpose" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.purpose, onChange: (e) => set("purpose", e.target.value), placeholder: "e.g. thinning, firewood, safety" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contractor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.contractor, onChange: (e) => set("contractor", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Evidence kept ",
          isExemption && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 font-medium", children: "(required to prove an exemption)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            rows: 2,
            value: f.evidenceNotes,
            onChange: (e) => set("evidenceNotes", e.target.value),
            placeholder: "Photos, maps, surveys, permissions kept — where they're stored"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.notes, onChange: (e) => set("notes", e.target.value) })
      ] })
    ] }),
    isExemption && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 14, className: "mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "If the Forestry Commission asks, the burden of proof is on you: keep photos, maps, surveys and any permissions. Without records you may be liable to prosecution." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        saveMut.reset();
        onClose();
      }, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending || !f.fellingDate, children: saveMut.isPending ? "Saving…" : "Save" })
    ] })
  ] }) });
}
function LicenceDialog({ farmId, editRow, onClose }) {
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState(() => ({
    licenceNumber: editRow?.licenceNumber ?? "",
    status: editRow?.status ?? "planned",
    fellingType: editRow?.fellingType ?? "",
    areaDescription: editRow?.areaDescription ?? "",
    areaHectares: editRow?.areaHectares ?? "",
    estimatedVolumeM3: editRow?.estimatedVolumeM3 ?? "",
    applicationDate: editRow?.applicationDate?.slice(0, 10) ?? "",
    approvalDate: editRow?.approvalDate?.slice(0, 10) ?? "",
    expiryDate: editRow?.expiryDate?.slice(0, 10) ?? "",
    restockingRequired: editRow?.restockingRequired ?? true,
    restockingConditions: editRow?.restockingConditions ?? "",
    restockingDeadline: editRow?.restockingDeadline?.slice(0, 10) ?? "",
    restockingCompletedDate: editRow?.restockingCompletedDate?.slice(0, 10) ?? "",
    notes: editRow?.notes ?? ""
  }));
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        licenceNumber: f.licenceNumber || null,
        status: f.status,
        fellingType: f.fellingType || null,
        areaDescription: f.areaDescription || null,
        areaHectares: f.areaHectares || null,
        estimatedVolumeM3: f.estimatedVolumeM3 || null,
        applicationDate: f.applicationDate || null,
        approvalDate: f.approvalDate || null,
        expiryDate: f.expiryDate || null,
        restockingRequired: !!f.restockingRequired,
        restockingConditions: f.restockingConditions || null,
        restockingDeadline: f.restockingDeadline || null,
        restockingCompletedDate: f.restockingCompletedDate || null,
        notes: f.notes || null
      };
      return editRow ? api.put(`/farms/${farmId}/felling-licences/${editRow.id}`, payload) : api.post(`/farms/${farmId}/felling-licences`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["felling-licences", farmId] });
      onClose();
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      saveMut.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRow ? "Edit Felling Licence" : "Add Felling Licence" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Licence number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.licenceNumber, onChange: (e) => set("licenceNumber", e.target.value), placeholder: "Forestry Commission ref" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.status, onValueChange: (v) => set("status", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LICENCE_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Felling type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.fellingType || "none", onValueChange: (v) => set("fellingType", v === "none" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— Not set —" }),
            FELLING_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t.replace("_", " ") }, t))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area / woodland" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.areaDescription, onChange: (e) => set("areaDescription", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.0001", value: f.areaHectares, onChange: (e) => set("areaHectares", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estimated volume (m³)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: f.estimatedVolumeM3, onChange: (e) => set("estimatedVolumeM3", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.applicationDate, onChange: (e) => set("applicationDate", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.approvalDate, onChange: (e) => set("approvalDate", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.expiryDate, onChange: (e) => set("expiryDate", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "restock-req", checked: !!f.restockingRequired, onCheckedChange: (v) => set("restockingRequired", !!v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "restock-req", className: "cursor-pointer", children: "Restocking required (usual for all licences except thinning-only)" })
      ] }),
      !!f.restockingRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restocking conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.restockingConditions, onChange: (e) => set("restockingConditions", e.target.value), placeholder: "Replanting / natural regeneration conditions from the licence" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restocking deadline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.restockingDeadline, onChange: (e) => set("restockingDeadline", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restocking completed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.restockingCompletedDate, onChange: (e) => set("restockingCompletedDate", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.notes, onChange: (e) => set("notes", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        saveMut.reset();
        onClose();
      }, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending, children: saveMut.isPending ? "Saving…" : "Save" })
    ] })
  ] }) });
}
function WoodlandPage() {
  const { farmId: rawFarmId } = useAppStore();
  const farmId = rawFarmId;
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab({ page: "woodland", farmId: rawFarmId, validIds: TAB_IDS, defaultTab: "records" });
  const recordsQ = useQuery({
    queryKey: ["felling-records", farmId],
    queryFn: () => api.get(`/farms/${farmId}/felling-records`),
    enabled: !!farmId,
    select: (d) => Array.isArray(d?.records) ? d.records : []
  });
  const licencesQ = useQuery({
    queryKey: ["felling-licences", farmId],
    queryFn: () => api.get(`/farms/${farmId}/felling-licences`),
    enabled: !!farmId,
    select: (d) => Array.isArray(d?.records) ? d.records : []
  });
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => api.get(`/farms/${farmId}/fields`),
    enabled: !!farmId,
    select: (d) => Array.isArray(d?.records) ? d.records : Array.isArray(d) ? d : [],
    staleTime: 6e4
  });
  const records = recordsQ.data ?? [];
  const licences = licencesQ.data ?? [];
  const fields = fieldsQ.data ?? [];
  const [recDlg, setRecDlg] = reactExports.useState({ open: false });
  const [licDlg, setLicDlg] = reactExports.useState({ open: false });
  const [pendingDelRec, setPendingDelRec] = reactExports.useState(null);
  const [pendingDelLic, setPendingDelLic] = reactExports.useState(null);
  const delRecMut = useMutation({
    mutationFn: (id) => api.delete(`/farms/${farmId}/felling-records/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["felling-records", farmId] })
  });
  const delLicMut = useMutation({
    mutationFn: (id) => api.delete(`/farms/${farmId}/felling-licences/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["felling-licences", farmId] })
  });
  const quarter = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const qi = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), qi * 3, 1);
    const end = new Date(now.getFullYear(), qi * 3 + 3, 1);
    const inQuarter = records.filter((r) => {
      if (r.legalBasis !== "quarterly_allowance" || !r.fellingDate) return false;
      const d = /* @__PURE__ */ new Date(String(r.fellingDate).slice(0, 10) + "T00:00:00");
      return d >= start && d < end;
    });
    const felled = inQuarter.reduce((a, r) => a + num(r.volumeM3), 0);
    const sold = inQuarter.reduce((a, r) => a + num(r.volumeSoldM3), 0);
    return { label: `Q${qi + 1} ${now.getFullYear()}`, felled, sold };
  }, [records]);
  const restockingDue = reactExports.useMemo(() => licences.filter(
    (l) => l.restockingRequired && !l.restockingCompletedDate && l.restockingDeadline
  ), [licences]);
  const overAllowance = quarter.felled > 5 || quarter.sold > 2;
  const nearAllowance = !overAllowance && (quarter.felled >= 4 || quarter.sold >= 1.5);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TreePine, { size: 24, className: "text-green-700" }),
          " Woodland & Tree Felling"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Felling licences, exemption evidence and restocking — Forestry Commission (England) rules, updated July 2026" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        tab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setRecDlg({ open: true }), "data-testid": "button-add-felling-record", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
          "Record Felling"
        ] }),
        tab === "licences" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setLicDlg({ open: true }), "data-testid": "button-add-licence", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
          "Add Licence"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mb-4 rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${overAllowance ? "border-red-300 bg-red-50 text-red-800" : nearAllowance ? "border-amber-300 bg-amber-50 text-amber-800" : "border-green-200 bg-green-50 text-green-800"}`, children: [
      (overAllowance || nearAllowance) && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: "mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
          "Personal allowance — ",
          quarter.label,
          ":"
        ] }),
        " ",
        quarter.felled.toFixed(2),
        " of 5 m³ felled without a licence, ",
        quarter.sold.toFixed(2),
        " of 2 m³ sold.",
        overAllowance && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: " Allowance exceeded — a felling licence is required; felling without one is an offence." }),
        nearAllowance && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: " Approaching the limit — plan a licence before further felling this quarter." })
      ] })
    ] }),
    restockingDue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Restocking outstanding:" }),
      " ",
      restockingDue.map((l) => `${l.licenceNumber || `Licence #${l.id}`} (by ${fmtDate(l.restockingDeadline)})`).join(", ")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "records", onClick: () => setTab("records"), children: "Felling Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "licences", onClick: () => setTab("licences"), children: [
        "Licences (",
        licences.length,
        ")"
      ] })
    ] }),
    tab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border overflow-x-auto", children: recordsQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-red-600", children: "Failed to load felling records — please refresh." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-sm text-gray-500", children: "No felling recorded yet. Every felling operation should be logged here with its legal basis and the evidence you keep." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 text-left text-xs uppercase text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Trees" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Vol (m³)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Legal basis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Evidence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => {
        const isExempt = r.legalBasis !== "licence" && r.legalBasis !== "tpo_planning_consent";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", "data-testid": `row-felling-${r.id}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(r.fellingDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.location || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.species || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.treeCount ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.volumeM3 ? num(r.volumeM3).toFixed(2) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 max-w-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: basisLabel(r.legalBasis) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: isExempt && !r.evidenceNotes ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700", children: "Missing" }) : r.evidenceNotes ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700", children: "Kept" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setRecDlg({ open: true, row: r }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setPendingDelRec(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "text-red-500" }) })
          ] })
        ] }, r.id);
      }) })
    ] }) }),
    tab === "licences" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border overflow-x-auto", children: licencesQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-red-600", children: "Failed to load licences — please refresh." }) : licences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-sm text-gray-500", children: "No felling licences yet. Licences are free and issued by the Forestry Commission; most carry restocking conditions you must meet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 text-left text-xs uppercase text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Licence no." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Area" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Expiry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Restocking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: licences.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", "data-testid": `row-licence-${l.id}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: l.licenceNumber || `#${l.id}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: statusBadge(l.status) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: l.fellingType ? l.fellingType.replace("_", " ") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
          l.areaDescription || "—",
          l.areaHectares ? ` (${num(l.areaHectares)} ha)` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(l.expiryDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: !l.restockingRequired ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Not required" }) : l.restockingCompletedDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-100 text-green-700", children: [
          "Done ",
          fmtDate(l.restockingCompletedDate)
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-amber-100 text-amber-700", children: [
          "Due ",
          fmtDate(l.restockingDeadline)
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setLicDlg({ open: true, row: l }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setPendingDelLic(l.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "text-red-500" }) })
        ] })
      ] }, l.id)) })
    ] }) }),
    recDlg.open && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordDialog, { farmId, editRow: recDlg.row, licences, fields, onClose: () => setRecDlg({ open: false }) }),
    licDlg.open && /* @__PURE__ */ jsxRuntimeExports.jsx(LicenceDialog, { farmId, editRow: licDlg.row, onClose: () => setLicDlg({ open: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelRec !== null,
        title: "Delete felling record",
        message: "Delete this felling record? Compliance evidence will be lost.",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delRecMut,
        onConfirm: () => {
          if (pendingDelRec !== null) delRecMut.mutate(pendingDelRec, { onSuccess: () => setPendingDelRec(null) });
        },
        onCancel: () => {
          setPendingDelRec(null);
          delRecMut.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelLic !== null,
        title: "Delete licence",
        message: "Delete this felling licence record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delLicMut,
        onConfirm: () => {
          if (pendingDelLic !== null) delLicMut.mutate(pendingDelLic, { onSuccess: () => setPendingDelLic(null) });
        },
        onCancel: () => {
          setPendingDelLic(null);
          delLicMut.reset();
        }
      }
    )
  ] }) });
}
export {
  WoodlandPage as default
};
