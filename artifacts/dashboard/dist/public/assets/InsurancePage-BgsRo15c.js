import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, X, I as Input } from "./index-CL7I2SfF.js";
import { A as AppLayout, c as ClipboardList, I as Info, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction } from "./AppLayout-swjhJeIk.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-U8a9uDrx.js";
import { T as TriangleAlert } from "./triangle-alert-gAXTnZz-.js";
import { P as Printer } from "./printer-B5Is06hI.js";
import { S as ShieldCheck } from "./shield-check-C2_xWcp4.js";
import { F as FileText } from "./shield-alert-e7MkaN-1.js";
import { E as Eye } from "./eye-BVYaZZbC.js";
import { P as Pencil } from "./pencil-DPmB3pBI.js";
import { R as RefreshCw } from "./refresh-cw-DW0Kni-6.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-B9QM90sQ.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-C1AJvGEX.js";
import { B as BarChart } from "./BarChart-BYrzCIV8.js";
import { C as CartesianGrid } from "./CartesianGrid-Ce-7uw_K.js";
import { S as Shield } from "./shield-BufITV1Z.js";
import { C as ChevronUp } from "./chevron-up-xjqksvvm.js";
import { C as CircleCheck } from "./circle-check-O6Peh1Cq.js";
import { E as ExternalLink } from "./external-link-1qMZnj9H.js";
import { U as Upload } from "./upload-CGIcn5Yw.js";
import "./use-safe-clerk-VdTi7dYa.js";
import "./database-BZBY5KTM.js";
import "./tractor-DFDGZlbe.js";
import "./textarea-F9glM0Jr.js";
import "./select-C29E8xvM.js";
import "./index-BIAhg7-a.js";
import "./index-Dr3FEjNy.js";
const POLICY_TYPES = [
  { value: "employers_liability", label: "Employers Liability", critical: true, legalNote: "Legally required under the Employers' Liability (Compulsory Insurance) Act 1969" },
  { value: "public_liability", label: "Public Liability", critical: true, legalNote: "Required by Red Tractor (minimum £5m cover)" },
  { value: "product_liability", label: "Product Liability", critical: false, legalNote: "" },
  { value: "motor_agricultural", label: "Motor / Agricultural Vehicle", critical: false, legalNote: "Legally required for vehicles on public roads" },
  { value: "buildings_contents", label: "Buildings & Contents", critical: false, legalNote: "" },
  { value: "farm_machinery", label: "Farm Machinery & Plant", critical: false, legalNote: "" },
  { value: "livestock", label: "Livestock", critical: false, legalNote: "" },
  { value: "crop_revenue", label: "Crop & Revenue", critical: false, legalNote: "" },
  { value: "environmental_liability", label: "Environmental Liability", critical: false, legalNote: "" },
  { value: "goods_in_custody", label: "Goods in Custody", critical: false, legalNote: "Required when storing third-party grain or goods — extends cover to include customers' property" },
  { value: "contract_work", label: "Contract Work (Machinery)", critical: false, legalNote: "Covers liability arising from contracting operations on third-party land" },
  { value: "tascc", label: "TASCC Trade Assurance Bond", critical: false, legalNote: "Required for commercial grain storage under TASCC membership" },
  { value: "hired_in_plant", label: "Hired-in Plant", critical: false, legalNote: "Covers hired machinery and equipment — check if your combined policy already includes this" },
  { value: "other", label: "Other", critical: false, legalNote: "" }
];
function policyLabel(value) {
  return POLICY_TYPES.find((p) => p.value === value)?.label ?? value;
}
function policyIsCritical(value) {
  if (!value) return false;
  const exact = POLICY_TYPES.find((p) => p.value === value);
  if (exact) return exact.critical;
  const lower = value.toLowerCase();
  const byLabel = POLICY_TYPES.find((p) => p.label.toLowerCase() === lower);
  if (byLabel) return byLabel.critical;
  if (lower.includes("employer")) return true;
  if (lower.includes("public liability")) return true;
  return false;
}
function expiryStatus(dateStr) {
  if (!dateStr) return "none";
  const today = /* @__PURE__ */ new Date();
  const expiry = new Date(dateStr);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / 864e5);
  if (diffDays < 0) return "expired";
  if (diffDays <= 60) return "warning";
  return "ok";
}
function ExpiryBadge({ dateStr }) {
  if (!dateStr) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontSize: "0.8rem" }, children: "—" });
  const status = expiryStatus(dateStr);
  const formatted = new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const styles = {
    expired: { background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: 5, fontSize: "0.78rem", fontWeight: 600 },
    warning: { background: "#fef9c3", color: "#854d0e", padding: "2px 8px", borderRadius: 5, fontSize: "0.78rem", fontWeight: 600 },
    ok: { background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 5, fontSize: "0.78rem", fontWeight: 600 }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles[status], children: formatted });
}
function formatCover(pence) {
  if (!pence) return "—";
  const millions = pence / 1e8;
  if (millions >= 1) return `£${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`;
  const thousands = pence / 1e5;
  if (thousands >= 1) return `£${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}
const emptyForm = { policyType: "employers_liability", insurer: "", policyNumber: "", policyholderName: "", coverLevelMillion: "", startDate: "", expiryDate: "", notes: "", annualPremium: "", renewalDate: "", broker: "", brokerContact: "", coversThirdPartyGoods: false, coversContractWork: false, coversEmployerLiability: false, lastReviewedDate: "" };
function InsuranceDialog({ open, onClose, initial, farmId, onSaved, renewalOfId }) {
  const { toast } = useToast();
  const [form, setForm] = reactExports.useState(() => initial ? {
    policyType: initial.policyType,
    insurer: initial.insurer ?? "",
    policyNumber: initial.policyNumber ?? "",
    policyholderName: initial.policyholderName ?? "",
    coverLevelMillion: initial.coverLevelPence ? String(initial.coverLevelPence / 1e8) : "",
    startDate: initial.startDate ?? "",
    expiryDate: initial.expiryDate ?? "",
    notes: initial.notes ?? "",
    annualPremium: initial.annualPremiumPence ? String(initial.annualPremiumPence / 100) : "",
    renewalDate: initial.renewalDate ?? "",
    broker: initial.broker ?? "",
    brokerContact: initial.brokerContact ?? "",
    coversThirdPartyGoods: initial.coversThirdPartyGoods ?? false,
    coversContractWork: initial.coversContractWork ?? false,
    coversEmployerLiability: initial.coversEmployerLiability ?? false,
    lastReviewedDate: initial.lastReviewedDate ?? ""
  } : emptyForm);
  const [pendingFile, setPendingFile] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        policyType: form.policyType,
        insurer: form.insurer || null,
        policyNumber: form.policyNumber || null,
        policyholderName: form.policyholderName || null,
        coverLevelPence: form.coverLevelMillion ? Math.round(parseFloat(form.coverLevelMillion) * 1e8) : null,
        startDate: form.startDate || null,
        expiryDate: form.expiryDate || null,
        notes: form.notes || null,
        annualPremiumPence: form.annualPremium ? Math.round(parseFloat(form.annualPremium) * 100) : null,
        renewalDate: form.renewalDate || null,
        broker: form.broker || null,
        brokerContact: form.brokerContact || null,
        coversThirdPartyGoods: form.coversThirdPartyGoods,
        coversContractWork: form.coversContractWork,
        coversEmployerLiability: form.coversEmployerLiability,
        lastReviewedDate: form.lastReviewedDate || null
      };
      const url = renewalOfId ? `/api/farms/${farmId}/insurance/${renewalOfId}/renew` : initial ? `/api/farms/${farmId}/insurance/${initial.id}` : `/api/farms/${farmId}/insurance`;
      const method = renewalOfId || !initial ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: async (record) => {
      if (pendingFile) {
        setUploading(true);
        try {
          const urlRes = await fetch("/api/storage/uploads/request-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: pendingFile.type })
          });
          if (!urlRes.ok) throw new Error("Could not get upload URL");
          const { uploadURL, objectPath } = await urlRes.json();
          await fetch(uploadURL, { method: "PUT", body: pendingFile, headers: { "Content-Type": pendingFile.type } }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          });
          const fileName = objectPath.split("/").pop() ?? pendingFile.name;
          await fetch(`/api/farms/${farmId}/insurance/${record.id}/document`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentPath: objectPath, documentName: fileName })
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          });
        } catch {
          toast({ title: "Policy saved but document upload failed", variant: "destructive" });
        } finally {
          setUploading(false);
        }
      }
      toast({ title: initial ? "Policy updated" : "Policy added" });
      onSaved();
      onClose();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const selectedType = POLICY_TYPES.find((p) => p.value === form.policyType);
  const isBusy = saveMut.isPending || uploading;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      saveMut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: renewalOfId ? "Renew Insurance Policy" : initial ? "Edit Insurance Policy" : "Add Insurance Policy" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Policy Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.policyType, onChange: (e) => set("policyType", e.target.value), style: selectStyle, children: POLICY_TYPES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.value, children: [
          p.label,
          p.critical ? " ★" : ""
        ] }, p.value)) }),
        selectedType?.legalNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: 4, fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "flex-start", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { style: { width: 12, height: 12, marginTop: 1, flexShrink: 0, color: "#2563eb" } }),
          selectedType.legalNote
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Insurer / Underwriter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.insurer, onChange: (e) => set("insurer", e.target.value), placeholder: "e.g. NFU Mutual" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Policy Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.policyNumber, onChange: (e) => set("policyNumber", e.target.value), placeholder: "e.g. EL-00123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Cover Level (£ millions)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.5", value: form.coverLevelMillion, onChange: (e) => set("coverLevelMillion", e.target.value), placeholder: "e.g. 10" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Policyholder Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.policyholderName, onChange: (e) => set("policyholderName", e.target.value), placeholder: "Name as shown on the certificate" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.startDate, onChange: (e) => set("startDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate, onChange: (e) => set("expiryDate", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Annual Premium (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: form.annualPremium, onChange: (e) => set("annualPremium", e.target.value), placeholder: "e.g. 4250.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Renewal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.renewalDate, onChange: (e) => set("renewalDate", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Broker / Agent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.broker, onChange: (e) => set("broker", e.target.value), placeholder: "e.g. Lycetts Farm Insurance" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Broker Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.brokerContact, onChange: (e) => set("brokerContact", e.target.value), placeholder: "Name / phone / email" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { ...labelStyle, marginBottom: 6 }, children: "Coverage Flags" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
          { key: "coversThirdPartyGoods", label: "Covers third-party goods in custody" },
          { key: "coversContractWork", label: "Covers contract work on third-party land" },
          { key: "coversEmployerLiability", label: "Includes employer liability cover" }
        ].map(({ key, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.checked })), style: { width: 15, height: 15, cursor: "pointer" } }),
          label
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Last Reviewed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastReviewedDate, onChange: (e) => set("lastReviewedDate", e.target.value) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.notes, onChange: (e) => set("notes", e.target.value), rows: 2, placeholder: "Any additional notes...", style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", resize: "vertical", outline: "none", fontFamily: "inherit" } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Attach Certificate / Schedule (optional)" }),
        pendingFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, background: "#f0fdf4", border: "1px solid #bbf7d0" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 14, height: 14, color: "#16a34a", flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", color: "#166534", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: pendingFile.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingFile(null), style: { background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", display: "flex" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 14, height: 14 } }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: "image/*,application/pdf",
              style: { display: "none" },
              onChange: (e) => {
                const f = e.target.files?.[0];
                if (f) setPendingFile(f);
                e.target.value = "";
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", padding: "5px 12px", border: "1px dashed #d1d5db", borderRadius: 6, color: "#6b7280", background: "#fafafa" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { style: { width: 13, height: 13 } }),
            " Choose file (PDF, JPG, PNG)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, disabled: isBusy, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(), disabled: isBusy || !form.policyType, children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 14, height: 14, marginRight: 6, animation: "spin 1s linear infinite" } }),
          "Uploading…"
        ] }) : saveMut.isPending ? "Saving…" : initial ? "Save Changes" : "Add Policy" })
      ] })
    ] })
  ] }) });
}
const DOC_TYPES = [
  { value: "certificate", label: "Certificate" },
  { value: "insurance_schedule", label: "Insurance Schedule" },
  { value: "insurance_policy", label: "Insurance Policy" },
  { value: "renewal_invitation", label: "Renewal Invitation" },
  { value: "policy_document", label: "Policy Document" },
  { value: "other", label: "Other" }
];
function docTypeLabel(v) {
  return DOC_TYPES.find((d) => d.value === v)?.label ?? v;
}
function InsuranceDocs({ farmId, recordId, legacyPath, legacyName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [uploadType, setUploadType] = reactExports.useState("certificate");
  const [uploading, setUploading] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["insurance-docs", farmId, recordId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance/${recordId}/documents`).then((r) => r.json()),
    enabled: !!farmId && !!recordId
  });
  const docs = data?.documents ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["insurance-docs", farmId, recordId] });
  const uploadDoc = async (file) => {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type })
      });
      if (!urlRes.ok) throw new Error("Could not get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const fileName = objectPath.split("/").pop() ?? file.name;
      await fetch(`/api/farms/${farmId}/insurance/${recordId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: uploadType, documentPath: objectPath, documentName: fileName })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      toast({ title: "Document saved" });
      refresh();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };
  const deleteDoc = async (docId) => {
    await fetch(`/api/farms/${farmId}/insurance/${recordId}/documents/${docId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    refresh();
  };
  const allDocs = [
    ...legacyPath && !docs.some((d) => d.documentPath === legacyPath) ? [{ id: -1, documentType: "certificate", documentPath: legacyPath, documentName: legacyName ?? "Certificate", isLegacy: true }] : [],
    ...docs
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: 14, marginTop: 6 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: "0 0 10px" }, children: "Documents" }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, color: "#9ca3af", fontSize: "0.8rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 13, height: 13, animation: "spin 1s linear infinite" } }),
      " Loading…"
    ] }),
    !isLoading && allDocs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#9ca3af", margin: "0 0 10px" }, children: "No documents attached yet — use the form below to add one." }),
    allDocs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, background: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 14, height: 14, color: "#6b7280", flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9ca3af", margin: "0 0 1px" }, children: docTypeLabel(d.documentType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#374151", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: d.documentName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/api/storage${d.documentPath}`, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.75rem", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0, fontWeight: 500 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { style: { width: 12, height: 12 } }),
        " Open"
      ] }),
      !d.isLegacy && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteDoc(d.id), style: { background: "none", border: "none", cursor: "pointer", padding: 2, color: "#d1d5db", flexShrink: 0, display: "flex" }, title: "Remove document", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 13, height: 13 } }) })
    ] }, d.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center", marginTop: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: uploadType, onChange: (e) => setUploadType(e.target.value), style: { fontSize: "0.78rem", border: "1px solid #e5e7eb", borderRadius: 5, padding: "5px 8px", background: "#fff", color: "#374151", outline: "none" }, children: DOC_TYPES.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d.value, children: d.label }, d.value)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { cursor: uploading ? "default" : "pointer", flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", style: { display: "none" }, disabled: uploading, onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) {
            uploadDoc(f);
            e.target.value = "";
          }
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem", padding: "5px 12px", border: "1px dashed #d1d5db", borderRadius: 5, color: "#6b7280", background: "#fafafa", cursor: uploading ? "default" : "pointer" }, children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 11, height: 11, animation: "spin 1s linear infinite" } }),
          " Uploading…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { style: { width: 11, height: 11 } }),
          " Choose file (PDF, JPG, PNG)"
        ] }) })
      ] })
    ] })
  ] });
}
const CLAIM_STATUSES = [
  { value: "draft", label: "Draft", bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
  { value: "reported", label: "Reported", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  { value: "acknowledged", label: "Acknowledged", bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  { value: "under_investigation", label: "Under Investigation", bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  { value: "settled", label: "Settled", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  { value: "rejected", label: "Rejected", bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  { value: "withdrawn", label: "Withdrawn", bg: "#fafafa", color: "#9ca3af", border: "#e5e7eb" }
];
function ClaimStatusBadge({ status }) {
  const s = CLAIM_STATUSES.find((c) => c.value === status) ?? CLAIM_STATUSES[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }, children: s.label });
}
const emptyClaimForm = { insuranceRecordId: "", policyType: "", insurer: "", incidentDate: "", reportedDate: "", claimRef: "", description: "", status: "draft", settledAmountPence: "", notes: "" };
function ClaimDialog({ open, onClose, initial, farmId, records, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = reactExports.useState(() => initial ? {
    insuranceRecordId: initial.insuranceRecordId ?? "",
    policyType: initial.policyType ?? "",
    insurer: initial.insurer ?? "",
    incidentDate: initial.incidentDate ?? "",
    reportedDate: initial.reportedDate ?? "",
    claimRef: initial.claimRef ?? "",
    description: initial.description ?? "",
    status: initial.status,
    settledAmountPence: initial.settledAmountPence != null ? String(initial.settledAmountPence / 100) : "",
    notes: initial.notes ?? ""
  } : { ...emptyClaimForm });
  const [saving, setSaving] = reactExports.useState(false);
  const onPolicyChange = (val) => {
    const rid = Number(val);
    const rec = records.find((r) => r.id === rid);
    setForm((f) => ({ ...f, insuranceRecordId: val, policyType: rec?.policyType ?? f.policyType, insurer: rec?.insurer ?? f.insurer }));
  };
  const save = async () => {
    setSaving(true);
    try {
      const body = {
        insuranceRecordId: form.insuranceRecordId !== "" ? Number(form.insuranceRecordId) : null,
        policyType: form.policyType || null,
        insurer: form.insurer || null,
        incidentDate: form.incidentDate || null,
        reportedDate: form.reportedDate || null,
        claimRef: form.claimRef || null,
        description: form.description || null,
        status: form.status,
        settledAmountPence: form.settledAmountPence !== "" ? Math.round(Number(form.settledAmountPence) * 100) : null,
        notes: form.notes || null
      };
      const url = initial ? `/api/farms/${farmId}/insurance-claims/${initial.id}` : `/api/farms/${farmId}/insurance-claims`;
      const res = await fetch(url, { method: initial ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: initial ? "Claim updated" : "Claim logged" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Could not save claim", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  const inp = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", background: "#fff", outline: "none", boxSizing: "border-box" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Edit Claim" : "Log Incident / Claim" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, maxHeight: "65vh", overflowY: "auto", paddingRight: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: labelStyle, children: [
          "Linked Policy ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#9ca3af" }, children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: String(form.insuranceRecordId), onChange: (e) => onPolicyChange(e.target.value), style: inp, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Not linked to a specific policy —" }),
          records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: r.id, children: [
            policyLabel(r.policyType),
            r.insurer ? ` — ${r.insurer}` : ""
          ] }, r.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Policy Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.policyType, onChange: (e) => setForm((f) => ({ ...f, policyType: e.target.value })), style: inp, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select —" }),
            POLICY_TYPES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.value, children: p.label }, p.value))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Insurer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.insurer, onChange: (e) => setForm((f) => ({ ...f, insurer: e.target.value })), style: inp, placeholder: "e.g. NFU Mutual" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Incident Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: form.incidentDate, onChange: (e) => setForm((f) => ({ ...f, incidentDate: e.target.value })), style: inp })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Date Reported to Insurer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: form.reportedDate, onChange: (e) => setForm((f) => ({ ...f, reportedDate: e.target.value })), style: inp })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: labelStyle, children: [
          "Claim Reference ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#9ca3af" }, children: "(from insurer)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.claimRef, onChange: (e) => setForm((f) => ({ ...f, claimRef: e.target.value })), style: inp, placeholder: "e.g. CLM-2025-001234" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: labelStyle, children: [
          "Description ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#dc2626" }, children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.description, onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })), style: { ...inp, minHeight: 72, resize: "vertical" }, placeholder: "What happened? What was damaged or lost?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.status, onChange: (e) => setForm((f) => ({ ...f, status: e.target.value })), style: inp, children: CLAIM_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.value, children: s.label }, s.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: labelStyle, children: [
            "Settled Amount (£) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#9ca3af" }, children: "if known" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", step: "0.01", value: form.settledAmountPence, onChange: (e) => setForm((f) => ({ ...f, settledAmountPence: e.target.value })), style: inp, placeholder: "0.00" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), style: { ...inp, minHeight: 56, resize: "vertical" }, placeholder: "e.g. Assessor appointed, waiting on loss adjuster…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving || !form.description?.trim(), children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 14, height: 14, animation: "spin 1s linear infinite", marginRight: 6 } }) : null,
        initial ? "Save Changes" : "Log Claim"
      ] })
    ] })
  ] }) });
}
function ClaimsSection({ farmId, records }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editClaim, setEditClaim] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expanded, setExpanded] = reactExports.useState(true);
  const { data, isLoading } = useQuery({
    queryKey: ["insurance-claims", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance-claims`).then((r) => r.json()),
    enabled: !!farmId
  });
  const claims = data?.claims ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["insurance-claims", farmId] });
  const deleteClaim = async () => {
    if (!deleteId) return;
    await fetch(`/api/farms/${farmId}/insurance-claims/${deleteId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    toast({ title: "Claim removed" });
    refresh();
    setDeleteId(null);
  };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", borderBottom: expanded ? "1px solid #f3f4f6" : "none" },
        onClick: () => setExpanded((v) => !v),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { style: { width: 15, height: 15, color: "#6366f1" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.95rem", color: "#111827" }, children: "Incident & Claims Register" }),
            claims.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 700, background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", padding: "1px 7px", borderRadius: 10 }, children: claims.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  setEditClaim(null);
                  setDialogOpen(true);
                },
                style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 600, background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { style: { width: 13, height: 13 } }),
                  " Log Claim"
                ]
              }
            ),
            expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { style: { width: 15, height: 15, color: "#9ca3af" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { style: { width: 15, height: 15, color: "#9ca3af" } })
          ] })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", padding: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 22, height: 22, animation: "spin 1s linear infinite", color: "#9ca3af" } }) }),
      !isLoading && claims.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "36px 24px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { style: { width: 30, height: 30, color: "#d1d5db", margin: "0 auto 10px" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", margin: "0 0 4px", fontSize: "0.9rem" }, children: "No claims on record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", margin: "0 0 14px" }, children: "Log any incidents or insurance claims here — useful for proving coverage history during audits and policy renewals." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setEditClaim(null);
          setDialogOpen(true);
        }, style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 600, background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { style: { width: 13, height: 13 } }),
          " Log first claim"
        ] })
      ] }),
      !isLoading && claims.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: "0.84rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: ["Incident Date", "Policy Type", "Insurer", "Claim Ref", "Description", "Status", "Settled", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "9px 14px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", whiteSpace: "nowrap", borderBottom: "1px solid #e5e7eb" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: claims.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < claims.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }, children: fmtDate(c.incidentDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }, children: c.policyType ? policyLabel(c.policyType) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: c.insurer ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", fontFamily: "monospace", fontSize: "0.8rem", color: "#374151", whiteSpace: "nowrap" }, children: c.claimRef ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontFamily: "inherit" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", maxWidth: 220 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }, children: c.description ?? "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", whiteSpace: "nowrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClaimStatusBadge, { status: c.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", whiteSpace: "nowrap", color: "#374151" }, children: c.settledAmountPence != null ? `£${(c.settledAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setEditClaim(c);
              setDialogOpen(true);
            }, style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 14, height: 14 } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(c.id), style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 14, height: 14 } }) })
          ] }) })
        ] }, c.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClaimDialog, { open: dialogOpen, onClose: () => {
      setDialogOpen(false);
      setEditClaim(null);
    }, initial: editClaim, farmId, records, onSaved: refresh }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteId, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove this claim?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently delete the claim record. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: deleteClaim, style: { background: "#dc2626" }, children: "Delete" })
      ] })
    ] }) })
  ] });
}
const labelStyle = { display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 4 };
const selectStyle = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", background: "#fff", outline: "none" };
const CHART_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#ea580c", "#0284c7"];
function PremiumTrendChart({ records }) {
  const dataRecords = records.filter((r) => r.startDate && r.annualPremiumPence);
  if (dataRecords.length < 2) return null;
  const policyTypes = [...new Set(dataRecords.map((r) => r.policyType))];
  const policyLabels = policyTypes.map((pt) => policyLabel(pt));
  const yearMap = /* @__PURE__ */ new Map();
  for (const r of dataRecords) {
    const year = new Date(r.startDate).getFullYear();
    if (!yearMap.has(year)) yearMap.set(year, {});
    const label = policyLabel(r.policyType);
    yearMap.get(year)[label] = (yearMap.get(year)[label] || 0) + r.annualPremiumPence / 100;
  }
  const chartData = Array.from(yearMap.entries()).sort(([a], [b]) => a - b).map(([year, data]) => ({ year: String(year), ...data }));
  if (chartData.length < 2) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "0.9rem", fontWeight: 700, color: "#111827", margin: "0 0 2px" }, children: "Annual Premium History" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", margin: "0 0 16px" }, children: "Insurance premiums recorded by policy start year — showing cost trends across all policy types to help identify when to shop around" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "year", tick: { fontSize: 12, fill: "#6b7280" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => v >= 1e3 ? `£${(v / 1e3).toFixed(0)}k` : `£${v}`, tick: { fontSize: 11, fill: "#6b7280" }, width: 52 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (value, name) => [`£${value.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, name] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: "0.75rem", paddingTop: 8 } }),
      policyLabels.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: label, stackId: "a", fill: CHART_COLORS[i % CHART_COLORS.length], radius: i === policyLabels.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0] }, label))
    ] }) })
  ] });
}
function InsurancePage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [showOlder, setShowOlder] = reactExports.useState(false);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [renewRecord, setRenewRecord] = reactExports.useState(null);
  const openId = (() => {
    const n = Number(new URLSearchParams(window.location.search).get("open"));
    return n > 0 ? n : null;
  })();
  const autoOpened = reactExports.useRef(false);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const [hlId, setHlId] = reactExports.useState(openId);
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data, isLoading } = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = data?.records ?? [];
  const twoYearsCutoff = /* @__PURE__ */ new Date();
  twoYearsCutoff.setFullYear(twoYearsCutoff.getFullYear() - 2);
  const hiddenRecords = records.filter(
    (r) => r.supersededByRenewal || r.expiryDate && new Date(r.expiryDate) < twoYearsCutoff
  );
  const olderRecords = hiddenRecords;
  const visibleRecords = showOlder ? records : records.filter((r) => !r.supersededByRenewal && (!r.expiryDate || new Date(r.expiryDate) >= twoYearsCutoff));
  const hiddenCount = hiddenRecords.length;
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || records.length === 0) return;
    const target = records.find((r) => r.id === openId);
    if (target) {
      autoOpened.current = true;
      if (olderRecords.some((r) => r.id === openId)) setShowOlder(true);
      setViewItem(target);
      setTimeout(() => {
        rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = setTimeout(() => setHlId(null), 4e3);
        return () => clearTimeout(t);
      }, 200);
    }
  }, [openId, records]);
  const onRefresh = () => qc.invalidateQueries({ queryKey: ["insurance", farmId] });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/insurance/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Policy removed" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const activeRecords = records.filter((r) => !r.supersededByRenewal);
  const expiredOrWarning = activeRecords.filter((r) => ["expired", "warning"].includes(expiryStatus(r.expiryDate)));
  const missingCritical = ["employers_liability", "public_liability"].filter(
    (pt) => !activeRecords.some((r) => r.policyType === pt && expiryStatus(r.expiryDate) !== "expired")
  );
  const handlePrint = () => {
    const fName = farmData?.record?.name ?? "Farm";
    const cph = farmData?.record?.cphNumber ?? void 0;
    const statusLabel = (r) => {
      const s = expiryStatus(r.expiryDate);
      if (s === "expired") return '<span style="background:#fee2e2;color:#b91c1c;padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700;">EXPIRED</span>';
      if (s === "warning") return '<span style="background:#fef9c3;color:#854d0e;padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700;">EXPIRING SOON</span>';
      if (s === "ok") return '<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700;">ACTIVE</span>';
      return "—";
    };
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Policy Type</th>
            <th>Insurer</th>
            <th>Policy No.</th>
            <th>Policyholder</th>
            <th>Cover Level</th>
            <th>Annual Premium</th>
            <th>Broker</th>
            <th>Start Date</th>
            <th>Expiry Date</th>
            <th>Renewal Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((r) => `
            <tr>
              <td><strong>${policyLabel(r.policyType)}</strong>${policyIsCritical(r.policyType) ? ' <span style="color:#dc2626;font-size:6px;">★ Critical</span>' : ""}</td>
              <td>${r.insurer ?? "—"}</td>
              <td style="font-family:monospace;">${r.policyNumber ?? "—"}</td>
              <td>${r.policyholderName ?? "—"}</td>
              <td>${formatCover(r.coverLevelPence)}</td>
              <td>${r.annualPremiumPence ? "£" + (r.annualPremiumPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 }) : "—"}</td>
              <td>${r.broker ?? "—"}</td>
              <td>${r.startDate ? new Date(r.startDate).toLocaleDateString("en-GB") : "—"}</td>
              <td>${r.expiryDate ? new Date(r.expiryDate).toLocaleDateString("en-GB") : "—"}</td>
              <td>${r.renewalDate ? new Date(r.renewalDate).toLocaleDateString("en-GB") : "—"}</td>
              <td>${statusLabel(r)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${records.length === 0 ? '<p style="color:#6b7280;font-size:8px;margin-top:12px;">No insurance policies recorded.</p>' : ""}
    `;
    printProReport({
      title: "Farm Insurance Register",
      subtitle: "Red Tractor & Legal Compliance — All Active Policies",
      farmName: fName,
      cphNumber: cph,
      recordCount: records.length,
      recordLabel: "policy",
      tableHtml,
      footerNote: "★ Employers Liability (legally required) and Public Liability (Red Tractor: min £5m) are critical policies. Attach certificate scans to each record for instant access during assessor visits. Retain for 3 years.",
      landscape: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Insurance Register", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }, children: [
      missingCritical.map((pt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { style: { width: 16, height: 16, color: "#b91c1c", marginTop: 1, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#b91c1c", margin: 0 }, children: [
            policyLabel(pt),
            " policy missing or expired"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#991b1b", margin: "2px 0 0" }, children: pt === "employers_liability" ? "This is a legal requirement under the Employers' Liability (Compulsory Insurance) Act 1969." : "Red Tractor requires a minimum £5m public liability policy." })
        ] })
      ] }, pt)),
      expiredOrWarning.filter((r) => !missingCritical.includes(r.policyType)).map((r) => {
        const status = expiryStatus(r.expiryDate);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", background: status === "expired" ? "#fee2e2" : "#fef9c3", border: `1px solid ${status === "expired" ? "#fca5a5" : "#fde047"}`, borderRadius: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { style: { width: 15, height: 15, color: status === "expired" ? "#b91c1c" : "#854d0e", marginTop: 1, flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: status === "expired" ? "#991b1b" : "#713f12", margin: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: policyLabel(r.policyType) }),
            " (",
            r.insurer ?? "unknown insurer",
            ") — ",
            status === "expired" ? "expired" : "expires",
            " ",
            r.expiryDate ? new Date(r.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
            ".",
            policyIsCritical(r.policyType) && status === "expired" && " Renewal is urgent."
          ] })
        ] }, r.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.05rem", fontWeight: 700, color: "#111827", margin: 0 }, children: "Farm Insurance Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", margin: "2px 0 0" }, children: [
            visibleRecords.length,
            " ",
            visibleRecords.length === 1 ? "policy" : "policies",
            " shown",
            hiddenCount > 0 && !showOlder ? ` — ${hiddenCount} older record${hiddenCount === 1 ? "" : "s"} hidden` : "",
            " — attach certificate scans for instant access during inspections"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handlePrint, disabled: records.length === 0, style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { style: { width: 14, height: 14 } }),
            " Print Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAddOpen(true), style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { style: { width: 15, height: 15 } }),
            " Add Policy"
          ] })
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", padding: 48 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 28, height: 28, animation: "spin 1s linear infinite", color: "#9ca3af" } }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "48px 24px", background: "#fafafa", border: "1px dashed #e5e7eb", borderRadius: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { style: { width: 36, height: 36, color: "#d1d5db", margin: "0 auto 12px" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", margin: "0 0 4px" }, children: "No insurance policies recorded yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.83rem", color: "#6b7280", margin: 0 }, children: "Add your Employers Liability and Public Liability policies first — these are checked by Red Tractor assessors" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: "0.85rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Policy Type", "Insurer", "Policy No.", "Policyholder", "Cover", "Premium p.a.", "Start", "Expiry", "Certificate", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 14px", textAlign: "left", fontSize: "0.73rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", whiteSpace: "nowrap" }, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: visibleRecords.map((r, i) => {
            const status = expiryStatus(r.expiryDate);
            const isCrit = policyIsCritical(r.policyType);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { ref: (el) => {
              if (el) rowRefs.current.set(r.id, el);
            }, style: { borderBottom: i < visibleRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: hlId === r.id ? "#fffbeb" : status === "expired" ? "#fff5f5" : "transparent", outline: hlId === r.id ? "2px solid #f59e0b" : "none", outlineOffset: -2, transition: "background 0.5s, outline 0.5s" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "11px 14px", minWidth: 170 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: isCrit ? 3 : 0 }, children: [
                  isCrit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 7, height: 7, borderRadius: "50%", background: status === "ok" ? "#22c55e" : status === "warning" ? "#eab308" : "#ef4444", flexShrink: 0 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#111827" }, children: policyLabel(r.policyType) })
                ] }),
                isCrit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 9px", borderRadius: 20 }, children: "Required" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px", color: "#374151" }, children: r.insurer ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px", fontFamily: "monospace", color: "#374151", fontSize: "0.82rem" }, children: r.policyNumber ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontFamily: "inherit" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px", color: "#374151" }, children: r.policyholderName ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px", color: "#374151", whiteSpace: "nowrap" }, children: formatCover(r.coverLevelPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px", color: "#374151", whiteSpace: "nowrap" }, children: r.annualPremiumPence ? `£${(r.annualPremiumPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px", color: "#6b7280", whiteSpace: "nowrap" }, children: r.startDate ? new Date(r.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px", whiteSpace: "nowrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { dateStr: r.expiryDate }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setViewItem(r), style: { background: "none", border: "1px dashed #d1d5db", cursor: "pointer", padding: "2px 8px", borderRadius: 5, display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#6b7280" }, title: "Manage documents", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 11, height: 11 } }),
                " Docs"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "11px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewItem(r), style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { style: { width: 14, height: 14 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditItem(r), style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 14, height: 14 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRenewRecord(r), style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6366f1", borderRadius: 4 }, title: "Renew Policy", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { style: { width: 14, height: 14 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 14, height: 14 } }) }),
                (status === "expired" || status === "warning") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(r), style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#f59e0b", borderRadius: 4 }, title: "Raise Task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { style: { width: 14, height: 14 } }) })
              ] }) })
            ] }, r.id);
          }) })
        ] }) }),
        hiddenCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowOlder((v) => !v),
            style: { background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#6b7280", padding: "6px 12px", borderRadius: 6, textDecoration: "underline" },
            children: showOlder ? `Hide archived records` : `Show ${hiddenCount} archived record${hiddenCount === 1 ? "" : "s"} (renewed or expired more than 2 years ago)`
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumTrendChart, { records }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClaimsSection, { farmId, records }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { style: { width: 14, height: 14, color: "#2563eb", marginTop: 1, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#1e40af", margin: 0 }, children: [
          "Red Tractor assessors check Employers Liability and Public Liability certificates during inspections. Attaching a scan of each certificate means you can present it instantly on-screen. Policies marked ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Required" }),
          " must be current at all times."
        ] })
      ] })
    ] }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        policyLabel(viewItem.policyType),
        policyIsCritical(viewItem.policyType) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8, fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 6px", borderRadius: 4, verticalAlign: "middle" }, children: "Required" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowY: "auto", maxHeight: "70vh", paddingRight: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Insurer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.insurer || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Policy Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewItem.policyNumber || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Policyholder" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.policyholderName || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Cover Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatCover(viewItem.coverLevelPence) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Annual Premium" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.annualPremiumPence ? `£${(viewItem.annualPremiumPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Broker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.broker || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.startDate ? new Date(viewItem.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { dateStr: viewItem.expiryDate })
          ] })
        ] }),
        viewItem.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewItem.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InsuranceDocs,
          {
            farmId,
            recordId: viewItem.id,
            legacyPath: viewItem.documentPath,
            legacyName: viewItem.documentName
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setEditItem(viewItem);
          setViewItem(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewItem(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `Insurance Renewal — ${policyLabel(raiseTaskFor.policyType)}${raiseTaskFor.insurer ? ` (${raiseTaskFor.insurer})` : ""}` : "",
        defaultDescription: raiseTaskFor?.expiryDate ? `Policy expires ${new Date(raiseTaskFor.expiryDate).toLocaleDateString("en-GB")}. Arrange renewal and update certificate.` : "",
        module: "insurance"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InsuranceDialog,
      {
        open: addOpen,
        onClose: () => setAddOpen(false),
        initial: null,
        farmId,
        onSaved: onRefresh
      }
    ),
    renewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      InsuranceDialog,
      {
        open: !!renewRecord,
        onClose: () => setRenewRecord(null),
        initial: {
          ...renewRecord,
          startDate: null,
          expiryDate: null,
          renewalDate: null,
          policyNumber: null,
          annualPremiumPence: null,
          notes: null,
          documentPath: null,
          documentName: null
        },
        farmId,
        onSaved: () => {
          setRenewRecord(null);
          onRefresh();
        },
        renewalOfId: renewRecord.id
      }
    ),
    editItem && /* @__PURE__ */ jsxRuntimeExports.jsx(
      InsuranceDialog,
      {
        open: !!editItem,
        onClose: () => setEditItem(null),
        initial: editItem,
        farmId,
        onSaved: onRefresh
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteId, onOpenChange: (v) => !v && setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove this policy?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "The record and any attached certificate will be removed from the register." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deleteId && deleteMut.mutate(deleteId), className: "bg-red-600 hover:bg-red-700", children: "Remove" })
      ] })
    ] }) })
  ] });
}
export {
  InsurancePage as default
};
