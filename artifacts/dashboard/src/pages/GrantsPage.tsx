import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useUpload } from "@workspace/object-storage-web";
import { Plus, Trash2, Pencil, FileText, Upload, Loader2, X, ExternalLink, PoundSterling, AlertTriangle, CheckCircle2, Clock, Info, Eye, ClipboardList, ArrowRight, CalendarDays, Archive } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { useLocation } from "wouter";

// ─── FETF Item Reference Data ──────────────────────
const FETF_ITEMS: { code: string; description: string; category: string }[] = [
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
  { code: "ENV-2", description: "Solar panels for on-farm energy generation", category: "Environment & Energy" },
];

const SCHEME_TYPES = ["FETF", "CS", "SFI", "RDPE", "Other"] as const;
type SchemeType = typeof SCHEME_TYPES[number];

const STATUSES = ["draft", "applied", "approved", "purchased", "claimed", "rejected", "withdrawn"] as const;
type GrantStatus = typeof STATUSES[number];

const STATUS_CONFIG: Record<GrantStatus, { label: string; bg: string; text: string; border: string }> = {
  draft:     { label: "Draft",     bg: "bg-gray-50",    text: "text-gray-700",   border: "border-gray-200" },
  applied:   { label: "Applied",   bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  approved:  { label: "Approved",  bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200" },
  purchased: { label: "Purchased", bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200" },
  claimed:   { label: "Claimed",   bg: "bg-teal-50",    text: "text-teal-700",   border: "border-teal-200" },
  rejected:  { label: "Rejected",  bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200" },
};

interface GrantRecord {
  id: number;
  schemeName: string;
  schemeType: string;
  itemReferenceCode: string | null;
  itemDescription: string | null;
  applicationReference: string | null;
  approvalAgreementReference: string | null;
  applicationDate: string | null;
  approvalDate: string | null;
  purchaseDeadline: string | null;
  claimDeadline: string | null;
  grantAmountPence: number | null;
  actualCostPence: number | null;
  status: GrantStatus;
  notes: string | null;
  documentPath: string | null;
  documentName: string | null;
}

function formatGBP(pence: number | null) {
  if (!pence) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function deadlineStatus(dateStr: string | null): "overdue" | "warning" | "ok" | "none" {
  if (!dateStr) return "none";
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "overdue";
  if (diff <= 30) return "warning";
  return "ok";
}

function grantYear(r: GrantRecord): number | null {
  const d = r.applicationDate || r.approvalDate;
  return d ? new Date(d).getFullYear() : null;
}

function DeadlineBadge({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return <span className="text-gray-400 text-sm">—</span>;
  const status = deadlineStatus(dateStr);
  const formatted = formatDate(dateStr);
  const styles: Record<string, string> = {
    overdue: "bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded font-semibold",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded font-semibold",
    ok: "bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded font-medium",
  };
  return <span className={styles[status]}>{formatted}</span>;
}

function StatusBadge({ status }: { status: GrantStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

const BLANK_FORM = {
  schemeName: "",
  schemeType: "FETF" as SchemeType,
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
  status: "applied" as GrantStatus,
  notes: "",
};

export default function GrantsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();

  const [statusFilter, setStatusFilter] = useState<GrantStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GrantRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<GrantRecord | null>(null);
  const [deleting, setDeleting] = useState<GrantRecord | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<GrantRecord | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const openId = (() => { const n = Number(new URLSearchParams(window.location.search).get("open")); return n > 0 ? n : null; })();
  const [hlId, setHlId] = useState<number | null>(openId);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());
  const autoOpened = useRef(false);
  const [fetfPickerOpen, setFetfPickerOpen] = useState(false);
  const [fetfSearch, setFetfSearch] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [quickFilter, setQuickFilter] = useState<"approved" | "active" | "deadlines" | null>(null);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [hideArchived, setHideArchived] = useState(true);
  const { uploadFile } = useUpload();

  const { data, isLoading } = useQuery({
    queryKey: ["grants", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/grants`);
      if (!r.ok) throw new Error("Failed to load grants");
      return r.json() as Promise<{ records: GrantRecord[] }>;
    },
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const r of records) { const y = grantYear(r); if (y) years.add(y); }
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);

  const baseRecords = useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter(r => grantYear(r) === yearFilter);
    if (hideArchived) rs = rs.filter(r => !["claimed","rejected","withdrawn"].includes(r.status));
    return rs;
  }, [records, yearFilter, hideArchived]);

  const archivedCount = useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter(r => grantYear(r) === yearFilter);
    return rs.filter(r => ["claimed","rejected","withdrawn"].includes(r.status)).length;
  }, [records, yearFilter]);

  useEffect(() => {
    if (!openId || autoOpened.current || records.length === 0) return;
    const target = records.find(r => r.id === openId);
    if (target) {
      autoOpened.current = true;
      setViewRecord(target);
      setTimeout(() => { rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" }); const t = setTimeout(() => setHlId(null), 4000); return () => clearTimeout(t); }, 200);
    }
  }, [openId, records]);

  const filtered = useMemo(() => {
    if (quickFilter === "approved") {
      return baseRecords.filter(r => ["approved","purchased","claimed"].includes(r.status));
    }
    if (quickFilter === "active") {
      return baseRecords.filter(r => ["draft","applied","approved","purchased"].includes(r.status));
    }
    if (quickFilter === "deadlines") {
      return baseRecords.filter(r => {
        const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
        const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
        return purchSt === "warning" || purchSt === "overdue" || claimSt === "warning" || claimSt === "overdue";
      });
    }
    if (statusFilter !== "all") return baseRecords.filter(r => r.status === statusFilter);
    return baseRecords;
  }, [baseRecords, statusFilter, quickFilter]);

  const totalGrantApproved = baseRecords
    .filter(r => ["approved","purchased","claimed"].includes(r.status))
    .reduce((sum, r) => sum + (r.grantAmountPence ?? 0), 0);

  // Only count deadlines genuinely within the next 30 days (warning); overdue tracked separately
  // Both computed from baseRecords so year filter + hide-archived are respected
  const warningDeadlineRecords = baseRecords.filter(r => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "warning" || claimSt === "warning";
  });
  const overdueDeadlineRecords = baseRecords.filter(r => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "overdue" || claimSt === "overdue";
  });
  const deadlineAlertCount = warningDeadlineRecords.length + overdueDeadlineRecords.length;

  const saveMut = useMutation({
    mutationFn: async (payload: typeof form) => {
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
        notes: payload.notes || null,
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
    onError: () => toast({ title: "Error saving grant", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/farms/${farmId}/grants/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Grant removed" });
      setDeleting(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK_FORM });
    setShowForm(true);
  }

  function openEdit(r: GrantRecord) {
    setEditing(r);
    setForm({
      schemeName: r.schemeName,
      schemeType: (r.schemeType as SchemeType) || "FETF",
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
      notes: r.notes ?? "",
    });
    setShowForm(true);
  }

  function pickFetfItem(item: typeof FETF_ITEMS[0]) {
    setForm(f => ({ ...f, itemReferenceCode: item.code, itemDescription: item.description }));
    setFetfPickerOpen(false);
    setFetfSearch("");
  }

  async function handleEvidenceUpload(record: GrantRecord, file: File) {
    setUploadingId(record.id);
    try {
      const response = await uploadFile(file);
      if (!response) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: file.name }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Evidence uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  }

  async function removeDocument(record: GrantRecord) {
    await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    qc.invalidateQueries({ queryKey: ["grants", farmId] });
  }

  const filteredFetf = FETF_ITEMS.filter(i =>
    !fetfSearch || i.code.toLowerCase().includes(fetfSearch.toLowerCase()) ||
    i.description.toLowerCase().includes(fetfSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(fetfSearch.toLowerCase())
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseRecords.length };
    for (const s of STATUSES) counts[s] = baseRecords.filter(r => r.status === s).length;
    return counts;
  }, [baseRecords]);

  // Summary card helpers — computed before return to avoid hook-rule violations
  const cardApprovedRecords = baseRecords.filter(r => ["approved","purchased","claimed"].includes(r.status));
  const cardActiveRecords = baseRecords.filter(r => ["draft","applied","approved","purchased"].includes(r.status));
  const cardNeedsAction = baseRecords.filter(r => ["draft","applied"].includes(r.status)).length;
  const isApprovedActive = quickFilter === "approved";
  const isActiveFilterOn = quickFilter === "active";
  const isDeadlinesFilterOn = quickFilter === "deadlines";
  const dlHasAlert = deadlineAlertCount > 0;
  const dlHasOverdue = overdueDeadlineRecords.length > 0;
  const dlBg = isDeadlinesFilterOn ? (dlHasOverdue ? "#fef2f2" : "#fffbeb") : dlHasOverdue ? "#fef2f2" : dlHasAlert ? "#fffbeb" : "#fff";
  const dlBorder = isDeadlinesFilterOn ? (dlHasOverdue ? "#f87171" : "#fbbf24") : dlHasOverdue ? "#fca5a5" : dlHasAlert ? "#fde68a" : "#e5e7eb";
  const dlAccent = dlHasOverdue ? "#dc2626" : dlHasAlert ? "#d97706" : "#9ca3af";
  const cardStyle = { borderRadius: 10, padding: "16px 20px", cursor: "pointer" as const, transition: "box-shadow 0.15s, transform 0.1s", userSelect: "none" as const };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Grants & Funding</h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>
              Track FETF, Countryside Stewardship capital grants, SFI, and other farming scheme applications.
            </p>
          </div>
          <Button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Add Grant
          </Button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {/* Approved Grant Value */}
          <div
            style={{ ...cardStyle, background: isApprovedActive ? "#f5f3ff" : "#fff", border: `1px solid ${isApprovedActive ? "#a78bfa" : "#e5e7eb"}`, outline: isApprovedActive ? "2px solid #7c3aed" : "none", outlineOffset: 2 }}
            onClick={() => { setQuickFilter(isApprovedActive ? null : "approved"); setStatusFilter("all"); }}
            title="Click to filter by approved, purchased & claimed"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <PoundSterling size={18} color="#7c3aed" />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>Approved Grant Value</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>{formatGBP(totalGrantApproved)}</div>
            <div style={{ fontSize: "0.78rem", color: isApprovedActive ? "#7c3aed" : "#6b7280", marginTop: 2 }}>
              {isApprovedActive ? `Showing ${cardApprovedRecords.length} record${cardApprovedRecords.length !== 1 ? "s" : ""} — click to clear` : `${cardApprovedRecords.length} approved, purchased & claimed`}
            </div>
          </div>

          {/* Active Applications */}
          <div
            style={{ ...cardStyle, background: isActiveFilterOn ? "#f0fdf4" : cardActiveRecords.length > 0 ? "#f0fdf4" : "#fff", border: `1px solid ${isActiveFilterOn ? "#16a34a" : cardActiveRecords.length > 0 ? "#bbf7d0" : "#e5e7eb"}`, outline: isActiveFilterOn ? "2px solid #16a34a" : "none", outlineOffset: 2 }}
            onClick={() => { setQuickFilter(isActiveFilterOn ? null : "active"); setStatusFilter("all"); }}
            title="Click to filter active applications"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <CheckCircle2 size={18} color="#059669" />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Applications</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>{cardActiveRecords.length}</div>
            <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>
              {isActiveFilterOn ? `Showing ${cardActiveRecords.length} record${cardActiveRecords.length !== 1 ? "s" : ""} — click to clear` : cardNeedsAction > 0 ? `${cardNeedsAction} awaiting decision` : "all concluded or approved"}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div
            style={{ ...cardStyle, background: dlBg, border: `1px solid ${dlBorder}`, outline: isDeadlinesFilterOn ? `2px solid ${dlAccent}` : "none", outlineOffset: 2 }}
            onClick={() => { setQuickFilter(isDeadlinesFilterOn ? null : "deadlines"); setStatusFilter("all"); }}
            title="Click to filter records with upcoming or overdue deadlines"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <AlertTriangle size={18} color={dlAccent} />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: dlAccent, textTransform: "uppercase", letterSpacing: "0.05em" }}>Upcoming Deadlines</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: dlHasAlert ? (dlHasOverdue ? "#991b1b" : "#92400e") : "#111827" }}>
              {warningDeadlineRecords.length}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>
              {isDeadlinesFilterOn
                ? `Showing ${deadlineAlertCount} record${deadlineAlertCount !== 1 ? "s" : ""} — click to clear`
                : dlHasOverdue
                  ? `within 30 days · ${overdueDeadlineRecords.length} overdue`
                  : "Purchase or claim deadlines within 30 days"}
            </div>
          </div>
        </div>

        {/* FETF guidance banner */}
        <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Info size={16} color="#4338ca" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: "0.82rem", color: "#3730a3", lineHeight: 1.5 }}>
            <strong>FETF 2026:</strong> The full published item list and grant rates for the 2026 round have not yet been confirmed by the RPA. Item reference codes shown in the picker are based on previous FETF rounds — verify codes and eligible costs against the current prospectus before applying at{" "}
            <a href="https://www.gov.uk/government/publications/farming-equipment-and-technology-fund-2025" target="_blank" rel="noopener noreferrer" style={{ color: "#4338ca", textDecoration: "underline" }}>
              gov.uk FETF guidance <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
            </a>
          </div>
        </div>

        {/* Year & Archive toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap", padding: "8px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarDays size={14} color="#6b7280" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Year</span>
            <select
              value={yearFilter}
              onChange={e => { const v = e.target.value; setYearFilter(v === "all" ? "all" : Number(v)); setQuickFilter(null); setStatusFilter("all"); }}
              style={{ fontSize: "0.85rem", padding: "3px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: yearFilter !== "all" ? "#eff6ff" : "#fff", color: "#111827", cursor: "pointer", fontWeight: yearFilter !== "all" ? 600 : 400 }}
            >
              <option value="all">All years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              {availableYears.length === 0 && <option disabled>No years available</option>}
            </select>
          </div>
          {(archivedCount > 0 || !hideArchived) && (
            <>
              <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
              <button
                onClick={() => { setHideArchived(h => !h); setQuickFilter(null); }}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", padding: "3px 10px", borderRadius: 6, border: "1px solid", background: hideArchived ? "#fff" : "#fef9c3", borderColor: hideArchived ? "#e5e7eb" : "#fbbf24", color: hideArchived ? "#374151" : "#92400e", cursor: "pointer", fontWeight: 500 }}
              >
                <Archive size={13} />
                {hideArchived ? `Show archived (${archivedCount})` : `Hide archived (${archivedCount})`}
              </button>
            </>
          )}
          {(yearFilter !== "all" || !hideArchived) && (
            <button
              onClick={() => { setYearFilter("all"); setHideArchived(true); setQuickFilter(null); setStatusFilter("all"); }}
              style={{ fontSize: "0.78rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginLeft: 2 }}
            >
              Reset filters
            </button>
          )}
          {records.length > 0 && availableYears.length === 0 && (
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }}>
              Add an Application Date to records to enable year filtering
            </span>
          )}
        </div>

        {/* Status filter tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {(["all", ...STATUSES] as const).map(s => {
            const count = statusCounts[s] ?? 0;
            const active = statusFilter === s;
            const cfg = s === "all" ? null : STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setQuickFilter(null); }}
                style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: active ? 700 : 500, cursor: "pointer", border: "1px solid",
                  background: active ? "#f0f4ff" : "#fff",
                  borderColor: active ? "#6366f1" : "#e5e7eb",
                  color: active ? "#3730a3" : "#374151",
                }}>
                {s === "all" ? "All" : STATUS_CONFIG[s].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Records table */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}><Loader2 size={24} className="animate-spin" style={{ display: "inline" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }}>
            <PoundSterling size={32} color="#d1d5db" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
              {quickFilter === "approved" ? "No approved grants"
                : quickFilter === "active" ? "No active applications"
                : quickFilter === "deadlines" ? "No upcoming or overdue deadlines"
                : statusFilter !== "all" ? `No ${STATUS_CONFIG[statusFilter].label.toLowerCase()} grants`
                : records.length === 0 ? "No grants recorded yet"
                : "No records match the current filters"}
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: 16 }}>
              {records.length === 0
                ? "Add your first FETF or scheme application to start tracking deadlines and grant values."
                : hideArchived && archivedCount > 0
                  ? `${archivedCount} archived record${archivedCount !== 1 ? "s" : ""} (claimed, rejected, withdrawn) are hidden — click "Show archived" above to reveal them.`
                  : yearFilter !== "all"
                    ? `No records have an application or approval date in ${yearFilter}. Switch to "All years" to see all records.`
                    : "Try adjusting the year filter or status tabs."}
            </div>
            {records.length === 0 && !quickFilter && statusFilter === "all" && <Button onClick={openAdd} variant="outline"><Plus size={14} /> Add Grant</Button>}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Scheme / Item</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Status</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Grant Amount</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Actual Cost</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Purchase Deadline</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Claim Deadline</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Evidence</th>
                    <th style={{ padding: "10px 16px", width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={r.id}
                      ref={(el) => { if (el) rowRefs.current.set(r.id, el as HTMLElement); }}
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}
                      className={`transition-colors${hlId === r.id ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : ""}`}
                      onMouseEnter={e => { if (hlId !== r.id) e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={e => { if (hlId !== r.id) e.currentTarget.style.background = ""; }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{r.schemeName}</div>
                        {r.itemReferenceCode && (
                          <div style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 500, marginTop: 2 }}>{r.itemReferenceCode}</div>
                        )}
                        {r.itemDescription && (
                          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 1, maxWidth: 280 }}>{r.itemDescription}</div>
                        )}
                        {r.applicationReference && (
                          <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>App ref: {r.applicationReference}</div>
                        )}
                        {r.approvalAgreementReference && (
                          <div style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 500, marginTop: 2 }}>Agreement: {r.approvalAgreementReference}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#059669" }}>{formatGBP(r.grantAmountPence)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#374151" }}>{formatGBP(r.actualCostPence)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {["claimed","rejected","withdrawn"].includes(r.status) ? (
                          <span className="text-gray-400 text-sm">{formatDate(r.purchaseDeadline)}</span>
                        ) : (
                          <DeadlineBadge dateStr={r.purchaseDeadline} />
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {["claimed","rejected","withdrawn"].includes(r.status) ? (
                          <span className="text-gray-400 text-sm">{formatDate(r.claimDeadline)}</span>
                        ) : (
                          <DeadlineBadge dateStr={r.claimDeadline} />
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {r.documentPath ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <a href={`/api/storage${r.documentPath}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: "0.78rem", textDecoration: "none" }}>
                              <FileText size={14} /> {r.documentName ?? "View"}
                            </a>
                            <button onClick={() => removeDocument(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}>
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#6b7280", fontSize: "0.78rem" }}>
                            {uploadingId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                            {uploadingId === r.id ? "Uploading…" : "Attach"}
                            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: "none" }}
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleEvidenceUpload(r, f); e.target.value = ""; }} />
                          </label>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }} title="View">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 4 }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleting(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4 }}>
                            <Trash2 size={15} />
                          </button>
                          {!["claimed","rejected","withdrawn"].includes(r.status) && (
                            <button onClick={() => setRaiseTaskFor(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 4, borderRadius: 4 }} title="Raise Task">
                              <ClipboardList size={15} />
                            </button>
                          )}
                          {(r.schemeType === "SFI" || r.schemeType === "CS") && ["approved","purchased","claimed"].includes(r.status) && (
                            <button
                              onClick={() => {
                                const schemeName = r.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
                                const prefill = btoa(JSON.stringify({ agreementNumber: r.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
                                navigate(`/sfi?prefill=${prefill}`);
                              }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4, borderRadius: 4 }}
                              title="Start SFI / ELM Record"
                            >
                              <ArrowRight size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View dialog */}
        {viewRecord && (
          <Dialog open onOpenChange={() => setViewRecord(null)}>
            <DialogContent style={{ maxWidth: 540 }}>
              <DialogHeader><DialogTitle>Grant / Funding Record</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Scheme</p><p className="font-medium">{viewRecord.schemeName}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Type</p><p>{viewRecord.schemeType || "—"}</p></div>
                  {viewRecord.itemReferenceCode && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Item Ref</p><p className="font-mono text-xs">{viewRecord.itemReferenceCode}</p></div>}
                  {viewRecord.applicationReference && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Application Ref</p><p className="font-mono text-xs">{viewRecord.applicationReference}</p></div>}
                  {viewRecord.approvalAgreementReference && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px" }}><p className="text-xs font-medium mb-1" style={{ color: "#166534" }}>RPA Agreement Ref</p><p className="font-mono text-xs font-semibold" style={{ color: "#15803d" }}>{viewRecord.approvalAgreementReference}</p></div>}
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><p className="capitalize">{viewRecord.status}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Application Date</p><p>{formatDate(viewRecord.applicationDate)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Approval Date</p><p>{formatDate(viewRecord.approvalDate)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Claim Deadline</p><p>{formatDate(viewRecord.claimDeadline)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Deadline</p><p>{formatDate(viewRecord.purchaseDeadline)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Grant Amount</p><p>{formatGBP(viewRecord.grantAmountPence)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Actual Cost</p><p>{formatGBP(viewRecord.actualCostPence)}</p></div>
                </div>
                {viewRecord.itemDescription && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Item Description</p><p className="text-gray-700">{viewRecord.itemDescription}</p></div>}
                {viewRecord.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.notes}</p></div>}
                {viewRecord.documentPath && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Document</p><a href={`/api/storage${viewRecord.documentPath}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 text-sm"><FileText size={14} />{viewRecord.documentName ?? "View Document"}</a></div>}
              </div>
              <DialogFooter>
                {(viewRecord.schemeType === "SFI" || viewRecord.schemeType === "CS") && ["approved","purchased","claimed"].includes(viewRecord.status) && (
                  <Button
                    variant="outline"
                    style={{ borderColor: "#16a34a", color: "#16a34a", marginRight: "auto" }}
                    onClick={() => {
                      const schemeName = viewRecord.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
                      const prefill = btoa(JSON.stringify({ agreementNumber: viewRecord.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
                      setViewRecord(null);
                      navigate(`/sfi?prefill=${prefill}`);
                    }}
                  >
                    Start SFI / ELM Record <ArrowRight size={14} className="ml-1" />
                  </Button>
                )}
                <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil size={14} className="mr-1" />Edit</Button>
                <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add / Edit dialog */}
        <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Grant" : "Add Grant / Funding Application"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(form); }} style={{ display: "grid", gap: 14 }}>
              {/* Scheme name + type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Scheme Name *</label>
                  <Input value={form.schemeName} onChange={e => setForm(f => ({ ...f, schemeName: e.target.value }))}
                    placeholder="e.g. FETF 2026, CS Capital, SFI Capital" required />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Scheme Type</label>
                  <select
                    value={SCHEME_TYPES.filter(t => t !== "Other").includes(form.schemeType as any) ? form.schemeType : "Other"}
                    onChange={e => setForm(f => ({ ...f, schemeType: e.target.value as SchemeType }))}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" }}>
                    {SCHEME_TYPES.map(t => <option key={t} value={t}>{t === "Other" ? "Other (please specify)" : t}</option>)}
                  </select>
                  {(form.schemeType === "Other" || (form.schemeType && !SCHEME_TYPES.filter(t => t !== "Other").includes(form.schemeType as any))) && (
                    <Input
                      style={{ marginTop: 4, fontSize: "0.875rem" }}
                      value={form.schemeType === "Other" ? "" : form.schemeType}
                      onChange={e => setForm(f => ({ ...f, schemeType: (e.target.value || "Other") as SchemeType }))}
                      placeholder="Please specify scheme type…"
                      autoFocus={form.schemeType === "Other"}
                    />
                  )}
                </div>
              </div>

              {/* Item reference + picker */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Item Reference Code</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input value={form.itemReferenceCode} onChange={e => setForm(f => ({ ...f, itemReferenceCode: e.target.value }))}
                    placeholder="e.g. T-SYS-1, LESS-2, ANH-2" style={{ flex: 1 }} />
                  {form.schemeType === "FETF" && (
                    <Button type="button" variant="outline" onClick={() => setFetfPickerOpen(true)} style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                      Browse FETF items
                    </Button>
                  )}
                </div>
              </div>

              {/* Item description */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Item Description</label>
                <Input value={form.itemDescription} onChange={e => setForm(f => ({ ...f, itemDescription: e.target.value }))}
                  placeholder="e.g. Auto-steering GPS system for 6m tractor" />
              </div>

              {/* Application reference */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Application Reference</label>
                <Input value={form.applicationReference} onChange={e => setForm(f => ({ ...f, applicationReference: e.target.value }))}
                  placeholder="RPA / scheme application reference number" />
              </div>

              {/* RPA Agreement Reference — only for SFI/CS when approved or beyond */}
              {(form.schemeType === "SFI" || form.schemeType === "CS") && ["approved","purchased","claimed"].includes(form.status) && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "12px 14px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#166534", display: "block", marginBottom: 4 }}>
                    RPA Agreement / Approval Reference
                    <span style={{ fontWeight: 400, color: "#15803d", marginLeft: 6 }}>— issued by RPA on approval</span>
                  </label>
                  <Input
                    value={form.approvalAgreementReference}
                    onChange={e => setForm(f => ({ ...f, approvalAgreementReference: e.target.value }))}
                    placeholder={form.schemeType === "SFI" ? "e.g. SFI-2024-123456" : "e.g. CS-2024-78901"}
                    style={{ borderColor: "#86efac" }}
                  />
                  <p style={{ fontSize: "0.72rem", color: "#15803d", marginTop: 6 }}>
                    This reference carries through to the SFI / ELM page when you start your agreement record.
                  </p>
                </div>
              )}

              {/* Dates row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Application Date</label>
                  <Input type="date" value={form.applicationDate} onChange={e => setForm(f => ({ ...f, applicationDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Approval Date</label>
                  <Input type="date" value={form.approvalDate} onChange={e => setForm(f => ({ ...f, approvalDate: e.target.value }))} />
                </div>
              </div>

              {/* Deadlines */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    Purchase Deadline
                    <span style={{ fontWeight: 400, color: "#6b7280" }}> — must buy by</span>
                  </label>
                  <Input type="date" value={form.purchaseDeadline} onChange={e => setForm(f => ({ ...f, purchaseDeadline: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    Claim Deadline
                    <span style={{ fontWeight: 400, color: "#6b7280" }}> — must claim by</span>
                  </label>
                  <Input type="date" value={form.claimDeadline} onChange={e => setForm(f => ({ ...f, claimDeadline: e.target.value }))} />
                </div>
              </div>

              {/* Amounts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Grant Amount (£)</label>
                  <Input type="number" min="0" step="1" value={form.grantAmountGBP}
                    onChange={e => setForm(f => ({ ...f, grantAmountGBP: e.target.value }))}
                    placeholder="Amount payable by scheme" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Actual Item Cost (£)</label>
                  <Input type="number" min="0" step="1" value={form.actualCostGBP}
                    onChange={e => setForm(f => ({ ...f, actualCostGBP: e.target.value }))}
                    placeholder="Total purchase price" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as GrantStatus }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Any additional notes about this application…"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={saveMut.isPending}>
                  {saveMut.isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (editing ? "Save Changes" : "Add Grant")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* FETF Item Picker Dialog */}
        <Dialog open={fetfPickerOpen} onOpenChange={setFetfPickerOpen}>
          <DialogContent style={{ maxWidth: 640, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <DialogHeader>
              <DialogTitle>FETF Item Reference Picker</DialogTitle>
            </DialogHeader>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 12px" }}>
              Based on previous FETF rounds — verify against the current RPA prospectus before applying.
            </p>
            <Input value={fetfSearch} onChange={e => setFetfSearch(e.target.value)}
              placeholder="Search by code, description, or category…" style={{ marginBottom: 12 }} />
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredFetf.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No items match your search.</div>
              ) : (
                filteredFetf.map(item => (
                  <button key={item.code} onClick={() => pickFetfItem(item)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", width: "100%" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", marginTop: 1 }}>{item.code}</span>
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}>{item.description}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }}>{item.category}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Grant?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the record for <strong>{deleting?.schemeName}</strong>. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleting && deleteMut.mutate(deleting.id)}
                style={{ background: "#ef4444" }}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <RaiseTaskDialog
          farmId={farmId!}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={raiseTaskFor ? `Grant Action — ${raiseTaskFor.schemeName}` : ""}
          defaultDescription={raiseTaskFor ? [
            raiseTaskFor.purchaseDeadline ? `Purchase deadline: ${new Date(raiseTaskFor.purchaseDeadline).toLocaleDateString("en-GB")}` : "",
            raiseTaskFor.claimDeadline ? `Claim deadline: ${new Date(raiseTaskFor.claimDeadline).toLocaleDateString("en-GB")}` : "",
          ].filter(Boolean).join("\n") : ""}
          module="grants"
        />
      </div>
    </AppLayout>
  );
}
