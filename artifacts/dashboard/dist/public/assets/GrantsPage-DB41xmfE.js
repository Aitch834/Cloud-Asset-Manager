import { a as useToast, t as useQueryClient, b as useAppStore, u as useLocation, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, d as LoaderCircle, $ as X, A as ArrowRight, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, I as Input } from "./index-CdPMp_BK.js";
import { A as AppLayout, I as Info, C as CalendarDays, c as ClipboardList, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction } from "./AppLayout-DPTZEYbj.js";
import { u as useUpload } from "./use-upload-CiSchU0i.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-D50bzMc0.js";
import { P as PoundSterling, F as FileText } from "./shield-alert-BWQ2YhSb.js";
import { C as CircleCheck } from "./circle-check-BN9QVC-7.js";
import { T as TriangleAlert } from "./triangle-alert-Ddxv_Y0u.js";
import { E as ExternalLink } from "./external-link-CWo1Lc8f.js";
import { A as Archive } from "./archive-CMQn-Sgp.js";
import { U as Upload } from "./upload-xkTIImK0.js";
import { E as Eye } from "./eye-q7gTgr52.js";
import { P as Pencil } from "./pencil-kIdn5wdu.js";
import { T as Trash2 } from "./trash-2-BiiCX-Xt.js";
import "./use-safe-clerk-BeAiHNOv.js";
import "./database-Ddq8N4tY.js";
import "./shield-check-BJTCvG5L.js";
import "./tractor-CPNxHkQU.js";
import "./textarea-DPXgL6cE.js";
import "./select-BpuhN8y7.js";
import "./index-Bn7LExu_.js";
import "./index-DZTO6jyG.js";
import "./chevron-up-C01YHFYc.js";
const FETF_ITEMS = [
  { code: "T-SYS-1", description: "Auto-steering / GPS guidance system", category: "Precision Technology" },
  { code: "T-SYS-2", description: "Variable rate technology (VRT) seeding or fertilising", category: "Precision Technology" },
  { code: "T-SYS-3", description: "Yield mapping and analysis system", category: "Precision Technology" },
  { code: "T-ENV-1", description: "Soil sampling and analysis technology", category: "Precision Technology" },
  { code: "T-ENV-2", description: "Remote sensing / drone survey equipment", category: "Precision Technology" },
  { code: "T-NUT-1", description: "Near infrared (NIR) spectroscopy for slurry or manure analysis", category: "Precision Technology" },
  { code: "T-IRR-1", description: "Soil moisture monitoring system", category: "Irrigation & Water" },
  { code: "T-IRR-2", description: "Weather station for irrigation management", category: "Irrigation & Water" },
  { code: "LESS-1", description: "Trailing shoe / trailing hose slurry spreader", category: "Slurry Management" },
  { code: "LESS-2", description: "Dribble bar slurry spreader", category: "Slurry Management" },
  { code: "LESS-3", description: "Shallow injection slurry spreader", category: "Slurry Management" },
  { code: "LESS-4", description: "Deep injection slurry spreader", category: "Slurry Management" },
  { code: "SLU-1", description: "Slurry store cover (fixed or floating)", category: "Slurry Management" },
  { code: "SLU-2", description: "Slurry separator", category: "Slurry Management" },
  { code: "SLU-3", description: "Slurry mixer / agitator", category: "Slurry Management" },
  { code: "ANH-1", description: "Electronic identification (EID) readers for cattle or sheep", category: "Animal Health" },
  { code: "ANH-2", description: "Electronic weigh scales / weighing system for livestock", category: "Animal Health" },
  { code: "ANH-3", description: "Automated beef crush / cattle handling system", category: "Animal Health" },
  { code: "ANH-4", description: "Lameness detection system", category: "Animal Health" },
  { code: "ANH-5", description: "Computerised cattle or pig feeding system", category: "Animal Health" },
  { code: "ANH-6", description: "Electronic sow feeding system", category: "Animal Health" },
  { code: "ANH-7", description: "Poultry weighing equipment", category: "Animal Health" },
  { code: "ANH-8", description: "Broiler catching machine", category: "Animal Health" },
  { code: "FERT-1", description: "Precision fertiliser spreader with GPS variable rate capability", category: "Arable & Crops" },
  { code: "FERT-2", description: "Boom sprayer section control / GPS shut-off", category: "Arable & Crops" },
  { code: "SEED-1", description: "Direct drill / no-till drill for arable crops", category: "Arable & Crops" },
  { code: "HRT-1", description: "Protected cropping irrigation system (polytunnel / glasshouse)", category: "Horticulture" },
  { code: "HRT-2", description: "Polytunnel structure with growing system", category: "Horticulture" },
  { code: "ENV-1", description: "Electric vehicle charging point (farm or public)", category: "Environment & Energy" },
  { code: "ENV-2", description: "Solar panels for on-farm energy generation", category: "Environment & Energy" }
];
const SCHEME_TYPES = ["FETF", "CS", "SFI", "RDPE", "Other"];
const STATUSES = ["draft", "applied", "approved", "purchased", "claimed", "rejected", "withdrawn"];
const STATUS_CONFIG = {
  draft: { label: "Draft", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  applied: { label: "Applied", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  approved: { label: "Approved", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  purchased: { label: "Purchased", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  claimed: { label: "Claimed", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" }
};
function formatGBP(pence) {
  if (!pence) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function deadlineStatus(dateStr) {
  if (!dateStr) return "none";
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 864e5);
  if (diff < 0) return "overdue";
  if (diff <= 30) return "warning";
  return "ok";
}
function grantYear(r) {
  const d = r.applicationDate || r.approvalDate;
  return d ? new Date(d).getFullYear() : null;
}
function DeadlineBadge({ dateStr }) {
  if (!dateStr) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: "—" });
  const status = deadlineStatus(dateStr);
  const formatted = formatDate(dateStr);
  const styles = {
    overdue: "bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded font-semibold",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded font-semibold",
    ok: "bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded font-medium"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles[status], children: formatted });
}
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`, children: cfg.label });
}
const BLANK_FORM = {
  schemeName: "",
  schemeType: "FETF",
  itemReferenceCode: "",
  itemDescription: "",
  applicationReference: "",
  approvalAgreementReference: "",
  applicationDate: "",
  approvalDate: "",
  purchaseDeadline: "",
  claimDeadline: "",
  grantAmountGBP: "",
  actualCostGBP: "",
  status: "applied",
  notes: ""
};
function GrantsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...BLANK_FORM });
  const openId = (() => {
    const n = Number(new URLSearchParams(window.location.search).get("open"));
    return n > 0 ? n : null;
  })();
  const [hlId, setHlId] = reactExports.useState(openId);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const [fetfPickerOpen, setFetfPickerOpen] = reactExports.useState(false);
  const [fetfSearch, setFetfSearch] = reactExports.useState("");
  const [uploadingId, setUploadingId] = reactExports.useState(null);
  const [quickFilter, setQuickFilter] = reactExports.useState(null);
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const [hideArchived, setHideArchived] = reactExports.useState(true);
  const { uploadFile } = useUpload();
  const { data, isLoading } = useQuery({
    queryKey: ["grants", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/grants`);
      if (!r.ok) throw new Error("Failed to load grants");
      return r.json();
    },
    enabled: !!farmId
  });
  const records = data?.records ?? [];
  const availableYears = reactExports.useMemo(() => {
    const years = /* @__PURE__ */ new Set();
    for (const r of records) {
      const y = grantYear(r);
      if (y) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);
  const baseRecords = reactExports.useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter((r) => grantYear(r) === yearFilter);
    if (hideArchived) rs = rs.filter((r) => !["claimed", "rejected", "withdrawn"].includes(r.status));
    return rs;
  }, [records, yearFilter, hideArchived]);
  const archivedCount = reactExports.useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter((r) => grantYear(r) === yearFilter);
    return rs.filter((r) => ["claimed", "rejected", "withdrawn"].includes(r.status)).length;
  }, [records, yearFilter]);
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || records.length === 0) return;
    const target = records.find((r) => r.id === openId);
    if (target) {
      autoOpened.current = true;
      setViewRecord(target);
      setTimeout(() => {
        rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = setTimeout(() => setHlId(null), 4e3);
        return () => clearTimeout(t);
      }, 200);
    }
  }, [openId, records]);
  const filtered = reactExports.useMemo(() => {
    if (quickFilter === "approved") {
      return baseRecords.filter((r) => ["approved", "purchased", "claimed"].includes(r.status));
    }
    if (quickFilter === "active") {
      return baseRecords.filter((r) => ["draft", "applied", "approved", "purchased"].includes(r.status));
    }
    if (quickFilter === "deadlines") {
      return baseRecords.filter((r) => {
        const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
        const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
        return purchSt === "warning" || purchSt === "overdue" || claimSt === "warning" || claimSt === "overdue";
      });
    }
    if (statusFilter !== "all") return baseRecords.filter((r) => r.status === statusFilter);
    return baseRecords;
  }, [baseRecords, statusFilter, quickFilter]);
  const totalGrantApproved = baseRecords.filter((r) => ["approved", "purchased", "claimed"].includes(r.status)).reduce((sum, r) => sum + (r.grantAmountPence ?? 0), 0);
  const warningDeadlineRecords = baseRecords.filter((r) => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "warning" || claimSt === "warning";
  });
  const overdueDeadlineRecords = baseRecords.filter((r) => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "overdue" || claimSt === "overdue";
  });
  const deadlineAlertCount = warningDeadlineRecords.length + overdueDeadlineRecords.length;
  const saveMut = useMutation({
    mutationFn: async (payload) => {
      const body = {
        schemeName: payload.schemeName,
        schemeType: payload.schemeType,
        itemReferenceCode: payload.itemReferenceCode || null,
        itemDescription: payload.itemDescription || null,
        applicationReference: payload.applicationReference || null,
        approvalAgreementReference: payload.approvalAgreementReference || null,
        applicationDate: payload.applicationDate || null,
        approvalDate: payload.approvalDate || null,
        purchaseDeadline: payload.purchaseDeadline || null,
        claimDeadline: payload.claimDeadline || null,
        grantAmountPence: payload.grantAmountGBP ? Math.round(parseFloat(payload.grantAmountGBP) * 100) : null,
        actualCostPence: payload.actualCostGBP ? Math.round(parseFloat(payload.actualCostGBP) * 100) : null,
        status: payload.status,
        notes: payload.notes || null
      };
      const url = editing ? `/api/farms/${farmId}/grants/${editing.id}` : `/api/farms/${farmId}/grants`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed to save grant");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: editing ? "Grant updated" : "Grant added" });
      setShowForm(false);
      setEditing(null);
    },
    onError: () => toast({ title: "Error saving grant", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/farms/${farmId}/grants/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Grant removed" });
      setDeleting(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK_FORM });
    setShowForm(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({
      schemeName: r.schemeName,
      schemeType: r.schemeType || "FETF",
      itemReferenceCode: r.itemReferenceCode ?? "",
      itemDescription: r.itemDescription ?? "",
      applicationReference: r.applicationReference ?? "",
      approvalAgreementReference: r.approvalAgreementReference ?? "",
      applicationDate: r.applicationDate ?? "",
      approvalDate: r.approvalDate ?? "",
      purchaseDeadline: r.purchaseDeadline ?? "",
      claimDeadline: r.claimDeadline ?? "",
      grantAmountGBP: r.grantAmountPence ? (r.grantAmountPence / 100).toFixed(0) : "",
      actualCostGBP: r.actualCostPence ? (r.actualCostPence / 100).toFixed(0) : "",
      status: r.status,
      notes: r.notes ?? ""
    });
    setShowForm(true);
  }
  function pickFetfItem(item) {
    setForm((f) => ({ ...f, itemReferenceCode: item.code, itemDescription: item.description }));
    setFetfPickerOpen(false);
    setFetfSearch("");
  }
  async function handleEvidenceUpload(record, file) {
    setUploadingId(record.id);
    try {
      const response = await uploadFile(file);
      if (!response) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: file.name })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Evidence uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  }
  async function removeDocument(record) {
    await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["grants", farmId] });
  }
  const filteredFetf = FETF_ITEMS.filter(
    (i) => !fetfSearch || i.code.toLowerCase().includes(fetfSearch.toLowerCase()) || i.description.toLowerCase().includes(fetfSearch.toLowerCase()) || i.category.toLowerCase().includes(fetfSearch.toLowerCase())
  );
  const statusCounts = reactExports.useMemo(() => {
    const counts = { all: baseRecords.length };
    for (const s of STATUSES) counts[s] = baseRecords.filter((r) => r.status === s).length;
    return counts;
  }, [baseRecords]);
  const cardApprovedRecords = baseRecords.filter((r) => ["approved", "purchased", "claimed"].includes(r.status));
  const cardActiveRecords = baseRecords.filter((r) => ["draft", "applied", "approved", "purchased"].includes(r.status));
  const cardNeedsAction = baseRecords.filter((r) => ["draft", "applied"].includes(r.status)).length;
  const isApprovedActive = quickFilter === "approved";
  const isActiveFilterOn = quickFilter === "active";
  const isDeadlinesFilterOn = quickFilter === "deadlines";
  const dlHasAlert = deadlineAlertCount > 0;
  const dlHasOverdue = overdueDeadlineRecords.length > 0;
  const dlBg = isDeadlinesFilterOn ? dlHasOverdue ? "#fef2f2" : "#fffbeb" : dlHasOverdue ? "#fef2f2" : dlHasAlert ? "#fffbeb" : "#fff";
  const dlBorder = isDeadlinesFilterOn ? dlHasOverdue ? "#f87171" : "#fbbf24" : dlHasOverdue ? "#fca5a5" : dlHasAlert ? "#fde68a" : "#e5e7eb";
  const dlAccent = dlHasOverdue ? "#dc2626" : dlHasAlert ? "#d97706" : "#9ca3af";
  const cardStyle = { borderRadius: 10, padding: "16px 20px", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.1s", userSelect: "none" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }, children: "Grants & Funding" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }, children: "Track FETF, Countryside Stewardship capital grants, SFI, and other farming scheme applications." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        " Add Grant"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { ...cardStyle, background: isApprovedActive ? "#f5f3ff" : "#fff", border: `1px solid ${isApprovedActive ? "#a78bfa" : "#e5e7eb"}`, outline: isApprovedActive ? "2px solid #7c3aed" : "none", outlineOffset: 2 },
          onClick: () => {
            setQuickFilter(isApprovedActive ? null : "approved");
            setStatusFilter("all");
          },
          title: "Click to filter by approved, purchased & claimed",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 18, color: "#7c3aed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Approved Grant Value" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: "#111827" }, children: formatGBP(totalGrantApproved) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: isApprovedActive ? "#7c3aed" : "#6b7280", marginTop: 2 }, children: isApprovedActive ? `Showing ${cardApprovedRecords.length} record${cardApprovedRecords.length !== 1 ? "s" : ""} — click to clear` : `${cardApprovedRecords.length} approved, purchased & claimed` })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { ...cardStyle, background: isActiveFilterOn ? "#f0fdf4" : cardActiveRecords.length > 0 ? "#f0fdf4" : "#fff", border: `1px solid ${isActiveFilterOn ? "#16a34a" : cardActiveRecords.length > 0 ? "#bbf7d0" : "#e5e7eb"}`, outline: isActiveFilterOn ? "2px solid #16a34a" : "none", outlineOffset: 2 },
          onClick: () => {
            setQuickFilter(isActiveFilterOn ? null : "active");
            setStatusFilter("all");
          },
          title: "Click to filter active applications",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, color: "#059669" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Active Applications" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: "#111827" }, children: cardActiveRecords.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }, children: isActiveFilterOn ? `Showing ${cardActiveRecords.length} record${cardActiveRecords.length !== 1 ? "s" : ""} — click to clear` : cardNeedsAction > 0 ? `${cardNeedsAction} awaiting decision` : "all concluded or approved" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { ...cardStyle, background: dlBg, border: `1px solid ${dlBorder}`, outline: isDeadlinesFilterOn ? `2px solid ${dlAccent}` : "none", outlineOffset: 2 },
          onClick: () => {
            setQuickFilter(isDeadlinesFilterOn ? null : "deadlines");
            setStatusFilter("all");
          },
          title: "Click to filter records with upcoming or overdue deadlines",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: dlAccent }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: dlAccent, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Upcoming Deadlines" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: dlHasAlert ? dlHasOverdue ? "#991b1b" : "#92400e" : "#111827" }, children: warningDeadlineRecords.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }, children: isDeadlinesFilterOn ? `Showing ${deadlineAlertCount} record${deadlineAlertCount !== 1 ? "s" : ""} — click to clear` : dlHasOverdue ? `within 30 days · ${overdueDeadlineRecords.length} overdue` : "Purchase or claim deadlines within 30 days" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, color: "#4338ca", style: { marginTop: 2, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#3730a3", lineHeight: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "FETF 2026:" }),
        " The full published item list and grant rates for the 2026 round have not yet been confirmed by the RPA. Item reference codes shown in the picker are based on previous FETF rounds — verify codes and eligible costs against the current prospectus before applying at",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://www.gov.uk/government/publications/farming-equipment-and-technology-fund-2025", target: "_blank", rel: "noopener noreferrer", style: { color: "#4338ca", textDecoration: "underline" }, children: [
          "gov.uk FETF guidance ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11, style: { display: "inline", verticalAlign: "middle" } })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap", padding: "8px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 14, color: "#6b7280" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: yearFilter,
            onChange: (e) => {
              const v = e.target.value;
              setYearFilter(v === "all" ? "all" : Number(v));
              setQuickFilter(null);
              setStatusFilter("all");
            },
            style: { fontSize: "0.85rem", padding: "3px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: yearFilter !== "all" ? "#eff6ff" : "#fff", color: "#111827", cursor: "pointer", fontWeight: yearFilter !== "all" ? 600 : 400 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All years" }),
              availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)),
              availableYears.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { disabled: true, children: "No years available" })
            ]
          }
        )
      ] }),
      (archivedCount > 0 || !hideArchived) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 1, height: 18, background: "#e5e7eb" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setHideArchived((h) => !h);
              setQuickFilter(null);
            },
            style: { display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", padding: "3px 10px", borderRadius: 6, border: "1px solid", background: hideArchived ? "#fff" : "#fef9c3", borderColor: hideArchived ? "#e5e7eb" : "#fbbf24", color: hideArchived ? "#374151" : "#92400e", cursor: "pointer", fontWeight: 500 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { size: 13 }),
              hideArchived ? `Show archived (${archivedCount})` : `Hide archived (${archivedCount})`
            ]
          }
        )
      ] }),
      (yearFilter !== "all" || !hideArchived) && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setYearFilter("all");
            setHideArchived(true);
            setQuickFilter(null);
            setStatusFilter("all");
          },
          style: { fontSize: "0.78rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginLeft: 2 },
          children: "Reset filters"
        }
      ),
      records.length > 0 && availableYears.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }, children: "Add an Application Date to records to enable year filtering" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }, children: ["all", ...STATUSES].map((s) => {
      const count = statusCounts[s] ?? 0;
      const active = statusFilter === s;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setStatusFilter(s);
            setQuickFilter(null);
          },
          style: {
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: "0.8rem",
            fontWeight: active ? 700 : 500,
            cursor: "pointer",
            border: "1px solid",
            background: active ? "#f0f4ff" : "#fff",
            borderColor: active ? "#6366f1" : "#e5e7eb",
            color: active ? "#3730a3" : "#374151"
          },
          children: [
            s === "all" ? "All" : STATUS_CONFIG[s].label,
            " (",
            count,
            ")"
          ]
        },
        s
      );
    }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: 60, color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin", style: { display: "inline" } }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 32, color: "#d1d5db", style: { margin: "0 auto 12px" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: quickFilter === "approved" ? "No approved grants" : quickFilter === "active" ? "No active applications" : quickFilter === "deadlines" ? "No upcoming or overdue deadlines" : statusFilter !== "all" ? `No ${STATUS_CONFIG[statusFilter].label.toLowerCase()} grants` : records.length === 0 ? "No grants recorded yet" : "No records match the current filters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#6b7280", fontSize: "0.875rem", marginBottom: 16 }, children: records.length === 0 ? "Add your first FETF or scheme application to start tracking deadlines and grant values." : hideArchived && archivedCount > 0 ? `${archivedCount} archived record${archivedCount !== 1 ? "s" : ""} (claimed, rejected, withdrawn) are hidden — click "Show archived" above to reveal them.` : yearFilter !== "all" ? `No records have an application or approval date in ${yearFilter}. Switch to "All years" to see all records.` : "Try adjusting the year filter or status tabs." }),
      records.length === 0 && !quickFilter && statusFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
        " Add Grant"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Scheme / Item" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Grant Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Actual Cost" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Purchase Deadline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Claim Deadline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Evidence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", width: 80 } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "tr",
        {
          ref: (el) => {
            if (el) rowRefs.current.set(r.id, el);
          },
          style: { borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" },
          className: `transition-colors${hlId === r.id ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : ""}`,
          onMouseEnter: (e) => {
            if (hlId !== r.id) e.currentTarget.style.background = "#f9fafb";
          },
          onMouseLeave: (e) => {
            if (hlId !== r.id) e.currentTarget.style.background = "";
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "12px 16px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, color: "#111827" }, children: r.schemeName }),
              r.itemReferenceCode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#7c3aed", fontWeight: 500, marginTop: 2 }, children: r.itemReferenceCode }),
              r.itemDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 1, maxWidth: 280 }, children: r.itemDescription }),
              r.applicationReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }, children: [
                "App ref: ",
                r.applicationReference
              ] }),
              r.approvalAgreementReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#15803d", fontWeight: 500, marginTop: 2 }, children: [
                "Agreement: ",
                r.approvalAgreementReference
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#059669" }, children: formatGBP(r.grantAmountPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px", textAlign: "right", color: "#374151" }, children: formatGBP(r.actualCostPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: ["claimed", "rejected", "withdrawn"].includes(r.status) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: formatDate(r.purchaseDeadline) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeadlineBadge, { dateStr: r.purchaseDeadline }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: ["claimed", "rejected", "withdrawn"].includes(r.status) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: formatDate(r.claimDeadline) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeadlineBadge, { dateStr: r.claimDeadline }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: r.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `/api/storage${r.documentPath}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: { display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: "0.78rem", textDecoration: "none" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }),
                    " ",
                    r.documentName ?? "View"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeDocument(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#6b7280", fontSize: "0.78rem" }, children: [
              uploadingId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 13 }),
              uploadingId === r.id ? "Uploading…" : "Attach",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
                  style: { display: "none" },
                  onChange: (e) => {
                    const f = e.target.files?.[0];
                    if (f) handleEvidenceUpload(r, f);
                    e.target.value = "";
                  }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 15 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => openEdit(r),
                  style: { background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 4 },
                  onMouseEnter: (e) => e.currentTarget.style.color = "#111827",
                  onMouseLeave: (e) => e.currentTarget.style.color = "#6b7280",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 15 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleting(r), style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 15 }) }),
              !["claimed", "rejected", "withdrawn"].includes(r.status) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(r), style: { background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 4, borderRadius: 4 }, title: "Raise Task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 15 }) }),
              (r.schemeType === "SFI" || r.schemeType === "CS") && ["approved", "purchased", "claimed"].includes(r.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    const schemeName = r.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
                    const prefill = btoa(JSON.stringify({ agreementNumber: r.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
                    navigate(`/sfi?prefill=${prefill}`);
                  },
                  style: { background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4, borderRadius: 4 },
                  title: "Start SFI / ELM Record",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 15 })
                }
              )
            ] }) })
          ]
        },
        r.id
      )) })
    ] }) }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Grant / Funding Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.schemeName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.schemeType || "—" })
          ] }),
          viewRecord.itemReferenceCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Item Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.itemReferenceCode })
          ] }),
          viewRecord.applicationReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Application Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.applicationReference })
          ] }),
          viewRecord.approvalAgreementReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium mb-1", style: { color: "#166534" }, children: "RPA Agreement Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-semibold", style: { color: "#15803d" }, children: viewRecord.approvalAgreementReference })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capitalize", children: viewRecord.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Application Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.applicationDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Approval Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.approvalDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Claim Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.claimDeadline) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Purchase Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.purchaseDeadline) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Grant Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatGBP(viewRecord.grantAmountPence) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Actual Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatGBP(viewRecord.actualCostPence) })
          ] })
        ] }),
        viewRecord.itemDescription && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Item Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewRecord.itemDescription })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.notes })
        ] }),
        viewRecord.documentPath && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/api/storage${viewRecord.documentPath}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-blue-600 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }),
            viewRecord.documentName ?? "View Document"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        (viewRecord.schemeType === "SFI" || viewRecord.schemeType === "CS") && ["approved", "purchased", "claimed"].includes(viewRecord.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            style: { borderColor: "#16a34a", color: "#16a34a", marginRight: "auto" },
            onClick: () => {
              const schemeName = viewRecord.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
              const prefill = btoa(JSON.stringify({ agreementNumber: viewRecord.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
              setViewRecord(null);
              navigate(`/sfi?prefill=${prefill}`);
            },
            children: [
              "Start SFI / ELM Record ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14, className: "ml-1" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: (v) => {
      if (!v) {
        setShowForm(false);
        setEditing(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Grant" : "Add Grant / Funding Application" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        saveMut.mutate(form);
      }, style: { display: "grid", gap: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Scheme Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.schemeName,
                onChange: (e) => setForm((f) => ({ ...f, schemeName: e.target.value })),
                placeholder: "e.g. FETF 2026, CS Capital, SFI Capital",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Scheme Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: SCHEME_TYPES.filter((t) => t !== "Other").includes(form.schemeType) ? form.schemeType : "Other",
                onChange: (e) => setForm((f) => ({ ...f, schemeType: e.target.value })),
                style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" },
                children: SCHEME_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t === "Other" ? "Other (please specify)" : t }, t))
              }
            ),
            (form.schemeType === "Other" || form.schemeType && !SCHEME_TYPES.filter((t) => t !== "Other").includes(form.schemeType)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                style: { marginTop: 4, fontSize: "0.875rem" },
                value: form.schemeType === "Other" ? "" : form.schemeType,
                onChange: (e) => setForm((f) => ({ ...f, schemeType: e.target.value || "Other" })),
                placeholder: "Please specify scheme type…",
                autoFocus: form.schemeType === "Other"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Item Reference Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.itemReferenceCode,
                onChange: (e) => setForm((f) => ({ ...f, itemReferenceCode: e.target.value })),
                placeholder: "e.g. T-SYS-1, LESS-2, ANH-2",
                style: { flex: 1 }
              }
            ),
            form.schemeType === "FETF" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setFetfPickerOpen(true), style: { whiteSpace: "nowrap", fontSize: "0.8rem" }, children: "Browse FETF items" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Item Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.itemDescription,
              onChange: (e) => setForm((f) => ({ ...f, itemDescription: e.target.value })),
              placeholder: "e.g. Auto-steering GPS system for 6m tractor"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Application Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.applicationReference,
              onChange: (e) => setForm((f) => ({ ...f, applicationReference: e.target.value })),
              placeholder: "RPA / scheme application reference number"
            }
          )
        ] }),
        (form.schemeType === "SFI" || form.schemeType === "CS") && ["approved", "purchased", "claimed"].includes(form.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "12px 14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#166534", display: "block", marginBottom: 4 }, children: [
            "RPA Agreement / Approval Reference",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#15803d", marginLeft: 6 }, children: "— issued by RPA on approval" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.approvalAgreementReference,
              onChange: (e) => setForm((f) => ({ ...f, approvalAgreementReference: e.target.value })),
              placeholder: form.schemeType === "SFI" ? "e.g. SFI-2024-123456" : "e.g. CS-2024-78901",
              style: { borderColor: "#86efac" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#15803d", marginTop: 6 }, children: "This reference carries through to the SFI / ELM page when you start your agreement record." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Application Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.applicationDate, onChange: (e) => setForm((f) => ({ ...f, applicationDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Approval Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.approvalDate, onChange: (e) => setForm((f) => ({ ...f, approvalDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
              "Purchase Deadline",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#6b7280" }, children: " — must buy by" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.purchaseDeadline, onChange: (e) => setForm((f) => ({ ...f, purchaseDeadline: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
              "Claim Deadline",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#6b7280" }, children: " — must claim by" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.claimDeadline, onChange: (e) => setForm((f) => ({ ...f, claimDeadline: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Grant Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "0",
                step: "1",
                value: form.grantAmountGBP,
                onChange: (e) => setForm((f) => ({ ...f, grantAmountGBP: e.target.value })),
                placeholder: "Amount payable by scheme"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Actual Item Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "0",
                step: "1",
                value: form.actualCostGBP,
                onChange: (e) => setForm((f) => ({ ...f, actualCostGBP: e.target.value })),
                placeholder: "Total purchase price"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: form.status,
              onChange: (e) => setForm((f) => ({ ...f, status: e.target.value })),
              style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" },
              children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: STATUS_CONFIG[s].label }, s))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: form.notes,
              onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
              rows: 3,
              placeholder: "Any additional notes about this application…",
              style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setShowForm(false);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }),
            " Saving…"
          ] }) : editing ? "Save Changes" : "Add Grant" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: fetfPickerOpen, onOpenChange: setFetfPickerOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 640, maxHeight: "80vh", display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "FETF Item Reference Picker" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", margin: "0 0 12px" }, children: "Based on previous FETF rounds — verify against the current RPA prospectus before applying." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: fetfSearch,
          onChange: (e) => setFetfSearch(e.target.value),
          placeholder: "Search by code, description, or category…",
          style: { marginBottom: 12 }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2 }, children: filteredFetf.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }, children: "No items match your search." }) : filteredFetf.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => pickFetfItem(item),
          style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", width: "100%" },
          onMouseEnter: (e) => e.currentTarget.style.background = "#f3f4f6",
          onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", marginTop: 1 }, children: item.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", fontWeight: 500, color: "#111827" }, children: item.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }, children: item.category })
            ] })
          ]
        },
        item.code
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleting, onOpenChange: (v) => {
      if (!v) setDeleting(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove Grant?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "This will permanently delete the record for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleting?.schemeName }),
          ". This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            onClick: () => deleting && deleteMut.mutate(deleting.id),
            style: { background: "#ef4444" },
            children: "Remove"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `Grant Action — ${raiseTaskFor.schemeName}` : "",
        defaultDescription: raiseTaskFor ? [
          raiseTaskFor.purchaseDeadline ? `Purchase deadline: ${new Date(raiseTaskFor.purchaseDeadline).toLocaleDateString("en-GB")}` : "",
          raiseTaskFor.claimDeadline ? `Claim deadline: ${new Date(raiseTaskFor.claimDeadline).toLocaleDateString("en-GB")}` : ""
        ].filter(Boolean).join("\n") : "",
        module: "grants"
      }
    )
  ] }) });
}
export {
  GrantsPage as default
};
