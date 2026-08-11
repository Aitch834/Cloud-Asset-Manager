import { b as useAppStore, a as useToast, c as useQueryClient, m as useQuery, r as reactExports, S as useMutation, j as jsxRuntimeExports, p as Link, U as FlaskConical, I as Input, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, O as React, e as LoaderCircle, X, N as DialogMutationError, J as DialogFooter } from "./index-D6khxeYT.js";
import { u as usePersistedTab } from "./use-persisted-tab-061XjBdu.js";
import { a as usePersistedFilter } from "./use-persisted-filter-CDyuFqsx.js";
import { A as AppLayout, U as Users, I as Info } from "./AppLayout-BaRj1j3r.js";
import { T as Textarea } from "./textarea-D2yjJy35.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-G0m9L3tu.js";
import { B as Badge } from "./badge-CiILlzqA.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-DZfGbfRg.js";
import { u as useUpload } from "./use-upload-YciJb1cu.js";
import { A as Award } from "./award-Dt_wzCWR.js";
import { S as Shield } from "./shield-BpmVGVZC.js";
import { F as FileText } from "./shield-alert-1XoYdT77.js";
import { E as Eye } from "./eye-DsSPx7b2.js";
import { a as Clock } from "./database-0RAdKk5E.js";
import { S as Search } from "./search-CrWvpZE3.js";
import { T as Trash2 } from "./trash-2-BYaNm0zV.js";
import { C as CircleCheckBig } from "./circle-check-big-CXi542ZU.js";
import { T as TriangleAlert } from "./triangle-alert-xuKqgtGK.js";
import { E as ExternalLink } from "./external-link-RdiDxbRE.js";
import { F as File } from "./file-Bkdvz0o3.js";
import { U as Upload } from "./upload-DlufKAT2.js";
import "./use-safe-clerk-_MP2ttuJ.js";
import "./shield-check-BNvmSEOX.js";
import "./tractor-Dqfi2I92.js";
import "./index-H-l8lwsj.js";
import "./index-DUJJhv5R.js";
import "./chevron-up-BVXO2H1q.js";
const STANDALONE_DOC_CATEGORIES = [
  {
    category: "Agronomy & Soil",
    types: [
      "Soil Analysis Report",
      "Nutrient Management Plan (NMP)",
      "Agronomy Recommendation Report",
      "Tissue Testing Report"
    ]
  },
  {
    category: "Equipment & Machinery",
    machinery: true,
    types: [
      "Sprayer Calibration Certificate (NSTS)",
      "Sprayer MOT Certificate",
      "Weighbridge Calibration Certificate",
      "Equipment Calibration Certificate (Other)",
      "Grain Store Inspection Certificate",
      "Electrical Installation Certificate (EICR)",
      "Gas Safety Certificate",
      "Lifting Equipment Inspection (LOLER)"
    ]
  },
  {
    category: "Safety & Fire",
    types: [
      "Fire Risk Assessment",
      "Asbestos Survey Report",
      "RIDDOR Report",
      "Lone Worker Policy"
    ]
  },
  {
    category: "Legal & Agreements",
    types: [
      "Farm Business Tenancy Agreement",
      "Land Ownership / Title Deeds",
      "Basic Payment Scheme (BPS) Agreement",
      "Countryside Stewardship Agreement",
      "Sustainable Farming Incentive (SFI) Agreement",
      "Environmental Stewardship Agreement"
    ]
  },
  {
    category: "Food Safety & Traceability",
    types: [
      "Pesticide Invoice / Purchase Record",
      "Seed Certificate",
      "Veterinary Health Certificate",
      "Grain Storage Record"
    ]
  },
  { category: "Other", types: ["Other"] }
];
STANDALONE_DOC_CATEGORIES.flatMap((c) => c.types);
const MACHINERY_TYPES = new Set(STANDALONE_DOC_CATEGORIES.find((c) => c.machinery)?.types ?? []);
const fmt = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
function getExpiryStatus(date) {
  if (!date) return "none";
  const days = Math.floor((new Date(date).getTime() - Date.now()) / 864e5);
  if (days < 0) return "expired";
  if (days <= 90) return "expiring";
  return "valid";
}
function ExpiryBadge({ status }) {
  const map = {
    expired: { bg: "#fee2e2", color: "#991b1b", label: "Expired" },
    expiring: { bg: "#fef3c7", color: "#92400e", label: "Expiring Soon" },
    valid: { bg: "#dcfce7", color: "#166534", label: "Valid" },
    none: { bg: "#f3f4f6", color: "#6b7280", label: "No Expiry" }
  };
  const s = map[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: s.bg, color: s.color, border: "none", fontSize: "0.72rem", whiteSpace: "nowrap" }, children: s.label });
}
function SectionHeader({
  icon,
  title,
  count,
  managedIn,
  managedHref,
  status
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", flexWrap: "wrap", gap: 8 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        background: status === "error" ? "#fee2e2" : status === "warn" ? "#fef3c7" : "#f0f9ff",
        borderRadius: 8,
        padding: 8,
        flexShrink: 0
      }, children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }, children: title }),
        count !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", margin: 0 }, children: [
          count,
          " record",
          count !== 1 ? "s" : ""
        ] })
      ] }),
      status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fee2e2", color: "#991b1b", border: "none", fontSize: "0.7rem" }, children: "Action Required" }),
      status === "warn" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.7rem" }, children: "Attention" })
    ] }),
    managedIn && managedHref && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        href: managedHref,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: "0.8rem",
          color: "#1d4ed8",
          fontWeight: 500,
          textDecoration: "none",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          padding: "4px 12px",
          borderRadius: 6,
          whiteSpace: "nowrap"
        },
        children: [
          "Manage in ",
          managedIn,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 })
        ]
      }
    )
  ] });
}
function ModuleUnavailable({ moduleName, href }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 8, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 15, color: "#9ca3af", style: { flexShrink: 0 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#6b7280", margin: 0, flex: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: moduleName }),
      " module not active — records cannot be displayed here."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href, style: { fontSize: "0.8rem", color: "#1d4ed8", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }, children: [
      "Go to module ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 })
    ] })
  ] });
}
function AlertBanner({ type, children }) {
  const s = type === "error" ? { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b" } : { bg: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "0.625rem 1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: s.color }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, style: { flexShrink: 0 } }),
    children
  ] });
}
async function safeJsonFetch(url) {
  try {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) return { data: null, ok: false };
    return { data: await r.json(), ok: true };
  } catch {
    return { data: null, ok: false };
  }
}
const TH_STYLE = { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" };
const TD_STYLE = { padding: "0.5rem 0.75rem", color: "#6b7280" };
function DocumentsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [pageTab, setPageTab] = usePersistedTab({ page: "documents", farmId, validIds: ["hub", "register", "checklist"], defaultTab: "hub" });
  const docsQ = useQuery({
    queryKey: ["documents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/documents`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const docs = docsQ.data ?? [];
  const certsQ = useQuery({
    queryKey: ["staff-certs-hub", farmId],
    queryFn: () => safeJsonFetch(`/api/farms/${farmId}/certificates`),
    enabled: !!farmId,
    staleTime: 6e4
  });
  const certsOk = certsQ.data?.ok ?? false;
  const staffCerts = certsQ.data?.data?.records ?? [];
  const coshhQ = useQuery({
    queryKey: ["risk-coshh-hub", farmId],
    queryFn: () => safeJsonFetch(`/api/farms/${farmId}/risk-coshh`),
    enabled: !!farmId,
    staleTime: 6e4
  });
  const coshhOk = coshhQ.data?.ok ?? false;
  const coshhRecords = coshhQ.data?.data?.records ?? [];
  const insuranceQ = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
    staleTime: 6e4
  });
  const insuranceRecords = insuranceQ.data ?? [];
  const assuranceQ = useQuery({
    queryKey: ["assurance-certs-hub", farmId],
    queryFn: () => safeJsonFetch(`/api/farms/${farmId}/assurance-certs`),
    enabled: !!farmId,
    staleTime: 6e4
  });
  const assuranceOk = assuranceQ.data?.ok ?? false;
  const assuranceCerts = assuranceQ.data?.data?.records ?? [];
  const membersQ = useFarmMembers(farmId);
  const memberNameMap = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const m of membersQ.data?.members ?? []) {
      if (m.linkedUserId) map.set(m.linkedUserId, memberFullName(m));
    }
    return map;
  }, [membersQ.data]);
  const resolveName = (uid) => memberNameMap.get(uid) ?? uid ?? "—";
  const certExpired = staffCerts.filter((c) => getExpiryStatus(c.expiryDate) === "expired").length;
  const certExpiring = staffCerts.filter((c) => getExpiryStatus(c.expiryDate) === "expiring").length;
  const assuranceExpired = assuranceCerts.filter((a) => getExpiryStatus(a.expiryDate) === "expired").length;
  const insuranceExpired = insuranceRecords.filter((i) => getExpiryStatus(i.expiryDate) === "expired" && !i.supersededByRenewal).length;
  const coshhOverdue = coshhRecords.filter((c) => c.reviewDate && getExpiryStatus(c.reviewDate) === "expired").length;
  const docsExpired = docs.filter((d) => getExpiryStatus(d.expiryDate) === "expired").length;
  const docsExpiring = docs.filter((d) => getExpiryStatus(d.expiryDate) === "expiring").length;
  const hasPLI = insuranceRecords.some((i) => i.policyType === "public_liability" && getExpiryStatus(i.expiryDate) !== "expired" && !i.supersededByRenewal);
  const hasELI = insuranceRecords.some((i) => (i.policyType === "employers_liability" || i.coversEmployerLiability) && getExpiryStatus(i.expiryDate) !== "expired" && !i.supersededByRenewal);
  const hasRtCert = assuranceOk ? assuranceCerts.some((a) => a.certificationBody?.toLowerCase().includes("red") && getExpiryStatus(a.expiryDate) !== "expired") : docs.some((d) => d.documentType === "Red Tractor Assurance Certificate" && getExpiryStatus(d.expiryDate) !== "expired");
  const paHolders = certsOk ? staffCerts.filter((c) => (c.certificateType?.includes("PA1") || c.certificateType?.includes("PA2") || c.certificateType?.includes("PA6")) && getExpiryStatus(c.expiryDate) !== "expired") : [];
  const hasPA = certsOk ? paHolders.length > 0 : docs.some((d) => d.documentType?.includes("Spray Operator") && getExpiryStatus(d.expiryDate) !== "expired");
  const checklistItems = [
    {
      label: "Red Tractor Assurance Certificate",
      note: "Must be current and in date",
      status: hasRtCert ? "present" : (assuranceOk ? assuranceCerts.some((a) => a.certificationBody?.toLowerCase().includes("red")) : docs.some((d) => d.documentType === "Red Tractor Assurance Certificate")) ? "expired" : "missing",
      dataFrom: assuranceOk ? "Red Tractor Compliance" : "Document Register",
      href: assuranceOk ? "/compliance" : null,
      detail: assuranceOk ? (() => {
        const a = assuranceCerts.find((c) => c.certificationBody?.toLowerCase().includes("red"));
        return a ? `${a.scheme ?? a.certificationBody}${a.expiryDate ? ` — expires ${fmt(a.expiryDate)}` : ""}` : null;
      })() : null
    },
    {
      label: "Spray Operator Certificate (PA1 / PA2 / PA6)",
      note: "At least one qualified operator required",
      status: hasPA ? "present" : certsOk ? staffCerts.some((c) => c.certificateType?.includes("PA1") || c.certificateType?.includes("PA2") || c.certificateType?.includes("PA6")) ? "expired" : "missing" : "missing",
      dataFrom: certsOk ? "Staff & Training → Certificates" : "Document Register",
      href: certsOk ? "/training?tab=certificates" : null,
      detail: certsOk && paHolders.length > 0 ? `${paHolders.length} qualified operator${paHolders.length !== 1 ? "s" : ""}: ${paHolders.slice(0, 4).map((h) => resolveName(h.userId)).join(", ")}${paHolders.length > 4 ? "…" : ""}` : null
    },
    {
      label: "Nutrient Management Plan (NMP)",
      note: "Must be reviewed annually",
      status: docs.some((d) => d.documentType === "Nutrient Management Plan (NMP)" && getExpiryStatus(d.expiryDate) !== "expired") ? "present" : docs.some((d) => d.documentType === "Nutrient Management Plan (NMP)") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: (() => {
        const d = docs.find((x) => x.documentType === "Nutrient Management Plan (NMP)");
        return d ? `${d.title}${d.expiryDate ? ` — expires ${fmt(d.expiryDate)}` : ""}` : null;
      })()
    },
    {
      label: "COSHH Assessments (all agrochemicals)",
      note: "Required for every product in use",
      status: coshhOk ? coshhRecords.length > 0 ? "present" : "missing" : docs.some((d) => d.documentType === "COSHH Assessment") ? "present" : "missing",
      dataFrom: coshhOk ? "Safety & Risk → COSHH" : "Document Register",
      href: coshhOk ? "/risks?tab=coshh" : null,
      detail: coshhOk && coshhRecords.length > 0 ? `${coshhRecords.length} substance${coshhRecords.length !== 1 ? "s" : ""} assessed${coshhOverdue > 0 ? ` · ${coshhOverdue} overdue for review` : ""}` : null
    },
    {
      label: "Soil Analysis Report (within 5 years)",
      note: "Required within the last 5 years",
      status: docs.some((d) => d.documentType === "Soil Analysis Report" && getExpiryStatus(d.expiryDate) !== "expired") ? "present" : docs.some((d) => d.documentType === "Soil Analysis Report") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: (() => {
        const d = docs.find((x) => x.documentType === "Soil Analysis Report");
        return d ? `${d.title}${d.issueDate ? ` — issued ${fmt(d.issueDate)}` : ""}` : null;
      })()
    },
    {
      label: "Sprayer Calibration Certificate (NSTS)",
      note: "Required every 3 years under Red Tractor",
      status: docs.some((d) => d.documentType === "Sprayer Calibration Certificate (NSTS)" && getExpiryStatus(d.expiryDate) !== "expired") ? "present" : docs.some((d) => d.documentType === "Sprayer Calibration Certificate (NSTS)") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: (() => {
        const certs = docs.filter((d) => d.documentType === "Sprayer Calibration Certificate (NSTS)");
        if (certs.length === 0) return null;
        return certs.map((c) => {
          const machine = c.notes?.startsWith("Equipment:") ? c.notes.split("\n")[0].replace("Equipment: ", "") : c.title;
          return machine;
        }).join(", ");
      })()
    },
    {
      label: "Grain Store Inspection Certificate",
      note: "Required for commercial grain storage",
      status: docs.some((d) => d.documentType === "Grain Store Inspection Certificate" && getExpiryStatus(d.expiryDate) !== "expired") ? "present" : docs.some((d) => d.documentType === "Grain Store Inspection Certificate") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: null
    },
    {
      label: "Farm Insurance — Public Liability",
      note: "Minimum £5m cover required by Red Tractor",
      status: hasPLI ? "present" : insuranceRecords.some((i) => i.policyType === "public_liability") ? "expired" : "missing",
      dataFrom: "Insurance",
      href: "/insurance",
      detail: (() => {
        const p = insuranceRecords.find((i) => i.policyType === "public_liability" && !i.supersededByRenewal);
        return p ? `${p.insurer ?? "Insurer not recorded"}${p.expiryDate ? ` — expires ${fmt(p.expiryDate)}` : ""}` : null;
      })()
    },
    {
      label: "Employer's Liability Insurance",
      note: "Legally required under the EL (CI) Act 1969",
      status: hasELI ? "present" : insuranceRecords.some((i) => i.policyType === "employers_liability" || i.coversEmployerLiability) ? "expired" : "missing",
      dataFrom: "Insurance",
      href: "/insurance",
      detail: (() => {
        const p = insuranceRecords.find((i) => (i.policyType === "employers_liability" || i.coversEmployerLiability) && !i.supersededByRenewal);
        return p ? `${p.insurer ?? "Insurer not recorded"}${p.expiryDate ? ` — expires ${fmt(p.expiryDate)}` : ""}` : null;
      })()
    }
  ];
  const checklistPass = checklistItems.filter((i) => i.status === "present").length;
  const checklistFail = checklistItems.filter((i) => i.status !== "present").length;
  const [search, setSearch] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = usePersistedFilter({ page: "documents", filter: "category", farmId, defaultValue: "all" });
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "documents", filter: "status", farmId, defaultValue: "all" });
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm = {
    title: "",
    documentType: "",
    referenceNumber: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: "",
    uploadedBy: "",
    notes: "",
    machineName: "",
    filePath: "",
    mimeType: "",
    fileSize: 0
  };
  const [form, setForm] = reactExports.useState(emptyForm);
  const [pendingFileName, setPendingFileName] = reactExports.useState(null);
  const [pendingFileSize, setPendingFileSize] = reactExports.useState(null);
  const [pendingFileMime, setPendingFileMime] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setForm((f) => ({ ...f, filePath: response.objectPath, mimeType: pendingFileMime ?? "", fileSize: pendingFileSize ?? 0 }));
    },
    onError: () => {
      toast({ title: "File upload failed", variant: "destructive" });
      setPendingFileName(null);
    }
  });
  const handleFileChange = reactExports.useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFileName(file.name);
    setPendingFileSize(file.size);
    setPendingFileMime(file.type || "application/octet-stream");
    await uploadFile(file);
    if (e.target) e.target.value = "";
  }, [uploadFile]);
  const clearFile = reactExports.useCallback(() => {
    setPendingFileName(null);
    setPendingFileSize(null);
    setPendingFileMime(null);
    setForm((f) => ({ ...f, filePath: "", mimeType: "", fileSize: 0 }));
  }, []);
  const closeAdd = reactExports.useCallback((open) => {
    setAddOpen(open);
    if (!open) {
      setForm(emptyForm);
      setPendingFileName(null);
      setPendingFileSize(null);
      setPendingFileMime(null);
    }
  }, []);
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Document recorded" });
      qc.invalidateQueries({ queryKey: ["documents", farmId] });
      closeAdd(false);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/documents/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Document deleted" });
      qc.invalidateQueries({ queryKey: ["documents", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const handleSave = () => {
    const { machineName, ...rest } = form;
    const body = { ...rest };
    if (machineName?.trim()) {
      body.notes = `Equipment: ${machineName.trim()}${rest.notes ? `
${rest.notes}` : ""}`;
    }
    if (!body.filePath) {
      delete body.filePath;
      delete body.mimeType;
      delete body.fileSize;
    }
    if (!body.issueDate) delete body.issueDate;
    if (!body.expiryDate) delete body.expiryDate;
    createMut.mutate(body);
  };
  const isMachineryType = MACHINERY_TYPES.has(form.documentType);
  const canSave = !!form.title && !isUploading && !createMut.isPending;
  const filteredDocs = reactExports.useMemo(() => docs.filter((d) => {
    if (categoryFilter !== "all") {
      const cat = STANDALONE_DOC_CATEGORIES.find((c) => c.category === categoryFilter);
      if (cat && !cat.types.includes(d.documentType)) return false;
    }
    if (statusFilter !== "all") {
      const s = getExpiryStatus(d.expiryDate);
      if (statusFilter === "expired" && s !== "expired") return false;
      if (statusFilter === "expiring" && s !== "expiring") return false;
      if (statusFilter === "valid" && s !== "valid" && s !== "none") return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return d.title?.toLowerCase().includes(q) || d.issuedBy?.toLowerCase().includes(q) || d.referenceNumber?.toLowerCase().includes(q) || d.documentType?.toLowerCase().includes(q);
    }
    return true;
  }), [docs, search, categoryFilter, statusFilter]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Documents", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1240, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", style: { margin: 0, flex: 1, maxWidth: 600 }, children: "Compliance document hub — live view across all modules. Operator certificates, COSHH assessments, insurance, and assurance records are read automatically from their source modules; no manual re-entry required." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", flexShrink: 0 }, children: [
        ["hub", "Compliance Hub"],
        ["register", "Document Register"],
        ["checklist", `Red Tractor (${checklistPass}/${checklistItems.length})`]
      ].map(([t, label], i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setPageTab(t),
          style: {
            padding: "0.45rem 1rem",
            border: "none",
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
            background: pageTab === t ? "#166534" : "#fff",
            color: pageTab === t ? "#fff" : "#374151",
            borderRight: i < 2 ? "1px solid #e5e7eb" : "none",
            transition: "background 0.15s, color 0.15s"
          },
          children: label
        },
        t
      )) })
    ] }),
    pageTab === "hub" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SectionHeader,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 18, color: assuranceExpired > 0 ? "#991b1b" : "#166534" }),
            title: "Assurance & Certification",
            count: assuranceCerts.length,
            managedIn: "Red Tractor Compliance",
            managedHref: "/compliance",
            status: assuranceExpired > 0 ? "error" : void 0
          }
        ),
        !assuranceOk ? /* @__PURE__ */ jsxRuntimeExports.jsx(ModuleUnavailable, { moduleName: "Red Tractor Compliance", href: "/compliance" }) : assuranceCerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(AlertBanner, { type: "error", children: "No assurance certificates recorded — add your Red Tractor and other scheme certificates in Red Tractor Compliance." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Certification Body", "Scheme", "Certificate No.", "Issue Date", "Expiry", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: TH_STYLE, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: assuranceCerts.map((a, i) => {
            const s = getExpiryStatus(a.expiryDate);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < assuranceCerts.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontWeight: 500, color: "#111827" }, children: a.certificationBody ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: a.scheme ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontFamily: "monospace" }, children: a.certNumber ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap" }, children: fmt(a.issueDate) ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#166534", fontWeight: 600 }, children: fmt(a.expiryDate) ?? "No expiry" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { status: s }) })
            ] }, a.id);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SectionHeader,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 18, color: certExpired > 0 ? "#991b1b" : "#1d4ed8" }),
            title: "Operator Competence & Qualifications",
            count: staffCerts.length,
            managedIn: "Staff & Training",
            managedHref: "/training?tab=certificates",
            status: certExpired > 0 ? "error" : certExpiring > 0 ? "warn" : void 0
          }
        ),
        !certsOk ? /* @__PURE__ */ jsxRuntimeExports.jsx(ModuleUnavailable, { moduleName: "Staff & Training", href: "/training?tab=certificates" }) : staffCerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 15, color: "#1d4ed8", style: { flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.875rem", color: "#1e40af" }, children: [
            "No certificates recorded — add operator certificates (PA1, PA2, PA6, First Aid, Forklift, Chainsaw and all others) per person in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/training?tab=certificates", style: { color: "#1d4ed8" }, children: "Staff & Training → Certificates" }),
            ". Each holder gets their own record with individual expiry tracking."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          certExpired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "error", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: certExpired }),
            " expired certificate",
            certExpired !== 1 ? "s" : "",
            " — renew immediately"
          ] }),
          certExpiring > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "warn", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: certExpiring }),
            " certificate",
            certExpiring !== 1 ? "s" : "",
            " expiring within 90 days"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Staff Member", "Certificate Type", "Issuer", "Cert Number", "Issue Date", "Expiry", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: TH_STYLE, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: staffCerts.map((c, i) => {
              const s = getExpiryStatus(c.expiryDate);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < staffCerts.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontWeight: 600, color: "#111827" }, children: resolveName(c.userId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, color: "#111827" }, children: c.certificateType }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: c.issuer ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontFamily: "monospace" }, children: c.certificateNumber ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap" }, children: fmt(c.issueDate) ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#166534", fontWeight: 600 }, children: fmt(c.expiryDate) ?? "No expiry" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { status: s }) })
              ] }, c.id);
            }) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SectionHeader,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 18, color: coshhOverdue > 0 ? "#92400e" : "#7c3aed" }),
            title: "COSHH & Safety Records",
            count: coshhRecords.length,
            managedIn: "Safety & Risk",
            managedHref: "/risks?tab=coshh",
            status: coshhOverdue > 0 ? "warn" : void 0
          }
        ),
        !coshhOk ? /* @__PURE__ */ jsxRuntimeExports.jsx(ModuleUnavailable, { moduleName: "Safety & Risk", href: "/risks" }) : coshhRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "error", children: [
          "No COSHH assessments recorded — Red Tractor requires a COSHH assessment for every agrochemical in use. Add assessments in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/risks?tab=coshh", style: { color: "#991b1b", fontWeight: 600 }, children: "Safety & Risk → COSHH" }),
          "."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          coshhOverdue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "warn", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: coshhOverdue }),
            " COSHH assessment",
            coshhOverdue !== 1 ? "s" : "",
            " overdue for review"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Substance", "Hazard Classification", "Assessed By", "Assessment Date", "Review Due", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: TH_STYLE, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: coshhRecords.map((c, i) => {
              const s = c.reviewDate ? getExpiryStatus(c.reviewDate) : "none";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < coshhRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fffbeb" : "transparent" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontWeight: 500, color: "#111827" }, children: c.substanceName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: c.hazardClassification ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: c.assessedBy ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap" }, children: fmt(c.assessmentDate) ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#92400e" : "#374151", fontWeight: s === "expired" ? 600 : 400 }, children: fmt(c.reviewDate) ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: c.reviewDate ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { status: s }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#f3f4f6", color: "#6b7280", border: "none", fontSize: "0.72rem" }, children: "No Review Set" }) })
              ] }, c.id);
            }) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SectionHeader,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 18, color: insuranceExpired > 0 ? "#991b1b" : "#0369a1" }),
            title: "Farm Insurance",
            count: insuranceRecords.filter((i) => !i.supersededByRenewal).length,
            managedIn: "Insurance",
            managedHref: "/insurance",
            status: insuranceExpired > 0 ? "error" : void 0
          }
        ),
        insuranceQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-4", children: "Loading..." }) : insuranceRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "error", children: [
          "No insurance policies recorded. Employer's Liability and Public Liability are mandatory — add them in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/insurance", style: { color: "#991b1b", fontWeight: 600 }, children: "Insurance" }),
          "."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          insuranceExpired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "error", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: insuranceExpired }),
            " expired polic",
            insuranceExpired !== 1 ? "ies" : "y",
            " — renew immediately"
          ] }),
          (() => {
            const missing = [!hasPLI && "Public Liability", !hasELI && "Employer's Liability"].filter(Boolean);
            return missing.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "error", children: [
              "Missing critical cover: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: missing.join(", ") })
            ] }) : null;
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Policy Type", "Insurer", "Policy Number", "Start Date", "Expiry", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: TH_STYLE, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: insuranceRecords.filter((i) => !i.supersededByRenewal).map((ins, i, arr) => {
              const s = getExpiryStatus(ins.expiryDate);
              const isCritical = ins.policyType === "employers_liability" || ins.policyType === "public_liability" || ins.coversEmployerLiability;
              const LABELS = {
                employers_liability: "Employer's Liability",
                public_liability: "Public Liability",
                product_liability: "Product Liability",
                motor_agricultural: "Motor / Agricultural",
                buildings_contents: "Buildings & Contents",
                farm_machinery: "Farm Machinery",
                livestock: "Livestock",
                crop_revenue: "Crop & Revenue",
                environmental_liability: "Environmental Liability",
                goods_in_custody: "Goods in Custody",
                contract_work: "Contract Work",
                tascc: "TASCC Bond",
                hired_in_plant: "Hired-in Plant",
                other: "Other"
              };
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, color: "#111827" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500 }, children: LABELS[ins.policyType] ?? ins.policyType }),
                  isCritical && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "1px 5px", borderRadius: 4 }, children: "Required" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: ins.insurer ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontFamily: "monospace" }, children: ins.policyNumber ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap" }, children: fmt(ins.startDate) ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#166534", fontWeight: 600 }, children: fmt(ins.expiryDate) ?? "No expiry" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { status: s }) })
              ] }, ins.id);
            }) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SectionHeader,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 18, color: docsExpired > 0 ? "#991b1b" : "#374151" }),
            title: "Farm Documents",
            count: docs.length,
            status: docsExpired > 0 ? "error" : docsExpiring > 0 ? "warn" : void 0
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.875rem", marginTop: "-0.25rem" }, children: [
          "Soil analysis reports, calibration certificates, NMPs, legal agreements, and other documents not managed by a dedicated module.",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPageTab("register"), style: { background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", fontSize: "0.8rem", padding: 0, textDecoration: "underline" }, children: "Add or manage in Document Register →" })
        ] }),
        docsExpired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "error", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: docsExpired }),
          " expired document",
          docsExpired !== 1 ? "s" : "",
          " — requires attention"
        ] }),
        docsExpiring > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "warn", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: docsExpiring }),
          " document",
          docsExpiring !== 1 ? "s" : "",
          " expiring within 90 days"
        ] }),
        docs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 8, padding: "1.5rem", textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af", margin: "0 0 0.5rem" }, children: "No standalone documents yet." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setPageTab("register");
            setTimeout(() => setAddOpen(true), 50);
          }, style: { background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 12px", fontSize: "0.8rem", color: "#374151", cursor: "pointer" }, children: "+ Add Document" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { overflowX: "auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Title", "Type", "Issued By", "Expiry", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: TH_STYLE, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: docs.slice(0, 10).map((doc, i) => {
              const s = getExpiryStatus(doc.expiryDate);
              const machine = doc.notes?.startsWith("Equipment:") ? doc.notes.split("\n")[0].replace("Equipment: ", "") : null;
              const viewUrl = doc.filePath ? `/api/storage${doc.filePath}` : null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < Math.min(docs.length, 10) - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { ...TD_STYLE, color: "#111827", fontWeight: 500, maxWidth: 240 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: doc.title }),
                  machine && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }, children: [
                    "Equipment: ",
                    machine
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontSize: "0.8rem" }, children: doc.documentType ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: doc.issuedBy ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#374151", fontWeight: s !== "valid" && s !== "none" ? 600 : 400 }, children: fmt(doc.expiryDate) ?? "No expiry" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { status: s }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: viewUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: viewUrl, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 5, background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 500, textDecoration: "none", border: "1px solid #bfdbfe" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 11 }),
                  " View"
                ] }) })
              ] }, doc.id);
            }) })
          ] }),
          docs.length > 10 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPageTab("register"), style: { display: "block", marginTop: "0.75rem", background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline", padding: 0 }, children: [
            "View all ",
            docs.length,
            " documents in Document Register →"
          ] })
        ] })
      ] })
    ] }),
    pageTab === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 15, color: "#1d4ed8", style: { flexShrink: 0, marginTop: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#1e40af", margin: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Standalone documents only." }),
          " ",
          "Operator certificates are managed per person in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/training?tab=certificates", style: { color: "#1d4ed8" }, children: "Staff & Training → Certificates" }),
          ". Farm insurance is in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/insurance", style: { color: "#1d4ed8" }, children: "Insurance" }),
          ". COSHH assessments are in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/risks?tab=coshh", style: { color: "#1d4ed8" }, children: "Safety & Risk" }),
          ". Assurance certificates are in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/compliance", style: { color: "#1d4ed8" }, children: "Red Tractor Compliance" }),
          ". All of these are surfaced automatically in the Compliance Hub tab."
        ] })
      ] }),
      (docsExpired > 0 || docsExpiring > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }, children: [
        docsExpired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertBanner, { type: "error", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: docsExpired }),
          " expired document",
          docsExpired !== 1 ? "s" : ""
        ] }),
        docsExpiring > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "#92400e" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: docsExpiring }),
          " expiring within 90 days"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1, minWidth: 200 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search documents...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: categoryFilter, onValueChange: setCategoryFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Categories" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
            STANDALONE_DOC_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.category, children: c.category }, c.category))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 160 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired Only" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expiring", children: "Expiring Soon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "valid", children: "Valid" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm(emptyForm);
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Add Document"
        ] })
      ] }),
      docsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filteredDocs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 28, color: "#9ca3af" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: docs.length === 0 ? "No documents on record" : "No documents match your filters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af", maxWidth: 420, marginBottom: "1.25rem" }, children: docs.length === 0 ? "Record standalone farm documents — soil analysis reports, NMPs, calibration certificates, legal agreements and more." : "Try changing your search or filters." }),
        docs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Add First Document"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Title / Equipment", "Type", "Reference No.", "Issued By", "Issue Date", "Expiry", "Status", "File", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: TH_STYLE, children: h }, i)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredDocs.map((doc, i) => {
          const status = getExpiryStatus(doc.expiryDate);
          const machine = doc.notes?.startsWith("Equipment:") ? doc.notes.split("\n")[0].replace("Equipment: ", "") : null;
          const viewUrl = doc.filePath ? `/api/storage${doc.filePath}` : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filteredDocs.length - 1 ? "1px solid #f3f4f6" : "none", background: status === "expired" ? "#fff7f7" : "transparent" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 500, color: "#111827", maxWidth: 240 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: doc.title }),
              machine && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }, children: [
                "Equipment: ",
                machine
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontSize: "0.8rem", maxWidth: 180 }, children: doc.documentType ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, fontFamily: doc.referenceNumber ? "monospace" : "inherit" }, children: doc.referenceNumber || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: doc.issuedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap" }, children: fmt(doc.issueDate) || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...TD_STYLE, whiteSpace: "nowrap", color: status === "expired" ? "#991b1b" : status === "expiring" ? "#92400e" : "#166534", fontWeight: status !== "valid" && status !== "none" ? 600 : 400 }, children: doc.expiryDate ? fmt(doc.expiryDate) : "No expiry" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: TD_STYLE, children: viewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: viewUrl, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 500, textDecoration: "none", border: "1px solid #bfdbfe" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 11 }),
              "View"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontSize: "0.75rem" }, children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(doc.id), style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }) })
          ] }, doc.id);
        }) })
      ] }) }) })
    ] }),
    pageTab === "checklist" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: checklistFail === 0 ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${checklistFail === 0 ? "#bbf7d0" : "#fca5a5"}`,
        borderRadius: 8,
        padding: "0.875rem 1rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: 10
      }, children: [
        checklistFail === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 16, color: "#16a34a" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, color: "#dc2626" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.875rem", color: checklistFail === 0 ? "#166534" : "#991b1b" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: checklistPass }),
          " of ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: checklistItems.length }),
          " Red Tractor required items present and valid.",
          checklistFail > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 8 }, children: [
            checklistFail,
            " missing or expired — action required before your next audit."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.625rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 14, color: "#1d4ed8", style: { flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#1e40af", margin: 0 }, children: "Each item reads from its source module in real time — not from a separate manual entry. The source is shown on each card." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }, children: checklistItems.map((item, idx) => {
        const SC = {
          present: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", label: "Present", labelColor: "#166534" },
          expired: { bg: "#fef2f2", border: "#fca5a5", dot: "#dc2626", label: "Expired", labelColor: "#991b1b" },
          missing: { bg: "#f9fafb", border: "#e5e7eb", dot: "#d1d5db", label: "Missing", labelColor: "#9ca3af" }
        };
        const sc = SC[item.status];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 10, padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: sc.dot, flexShrink: 0, marginTop: 4 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.4 }, children: item.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", margin: "2px 0 0" }, children: item.note })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 600, color: sc.labelColor, flexShrink: 0, background: "#fff", padding: "2px 7px", borderRadius: 5, border: `1px solid ${sc.border}` }, children: sc.label })
          ] }),
          item.detail && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#374151", paddingLeft: 16, fontWeight: 500 }, children: item.detail }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, marginTop: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: [
              "Source: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontWeight: 500 }, children: item.dataFrom })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              item.href && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: item.href, style: { fontSize: "0.75rem", color: "#1d4ed8", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }, children: [
                "View ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 10 })
              ] }),
              !item.href && item.status === "missing" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setPageTab("register");
                    setTimeout(() => {
                      setForm((f) => ({ ...emptyForm, documentType: item.label }));
                      setAddOpen(true);
                    }, 50);
                  },
                  style: { fontSize: "0.75rem", color: "#1d4ed8", background: "none", border: "none", cursor: "pointer", padding: 0 },
                  children: "+ Add →"
                }
              )
            ] })
          ] })
        ] }, idx);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      closeAdd(o);
      if (!o) createMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Document" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.title, onChange: (e) => setForm((f) => ({ ...f, title: e.target.value })), placeholder: "e.g. Soil Analysis 2024 — Home Farm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.documentType, onValueChange: (v) => setForm((f) => ({ ...f, documentType: v, machineName: "" })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STANDALONE_DOC_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "4px 8px", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }, children: cat.category }),
              cat.types.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
            ] }, cat.category)) })
          ] })
        ] }),
        isMachineryType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Equipment / Machine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.machineName, onChange: (e) => setForm((f) => ({ ...f, machineName: e.target.value })), placeholder: "e.g. Hardi Commander 4000, Weighbridge Unit 2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "Which machine or equipment does this certificate apply to?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.referenceNumber, onChange: (e) => setForm((f) => ({ ...f, referenceNumber: e.target.value })), placeholder: "Cert / ref no." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issued By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.issuedBy, onChange: (e) => setForm((f) => ({ ...f, issuedBy: e.target.value })), placeholder: "Issuing body or inspector" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.issueDate, onChange: (e) => setForm((f) => ({ ...f, issueDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate, onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Uploaded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.uploadedBy, onChange: (e) => setForm((f) => ({ ...f, uploadedBy: e.target.value })), placeholder: "Your name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "Additional notes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document File" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "application/pdf,image/*", style: { display: "none" } }),
          pendingFileName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem" }, children: [
            isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 14, color: "#16a34a" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: pendingFileName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearFile, style: { background: "none", border: "none", cursor: "pointer", color: "#6b7280", flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileInputRef.current?.click(), style: { display: "flex", alignItems: "center", gap: 8, padding: "0.625rem 1rem", border: "1px dashed #d1d5db", borderRadius: 8, background: "#f9fafb", cursor: "pointer", width: "100%", color: "#6b7280", fontSize: "0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 14 }),
            " Upload PDF or image"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => closeAdd(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: !canSave, children: [
          createMut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }),
          "Save Document"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteId, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Document?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "This document record will be permanently removed. Any uploaded file attached to it will also be deleted." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: [
          deleteMut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }),
          "Delete"
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  DocumentsPage as default
};
