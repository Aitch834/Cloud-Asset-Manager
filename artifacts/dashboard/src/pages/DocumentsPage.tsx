import React, { useState, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import {
  Plus, Search, Trash2, FileText, AlertTriangle, CheckCircle, Clock,
  Upload, Loader2, X, Eye, File, Users, Shield, FlaskConical,
  ExternalLink, Award, Info,
} from "lucide-react";
import { Link } from "wouter";
import { useUpload } from "@workspace/object-storage-web";

// ─── Standalone document categories ─────────────────────────────────────────
// Types managed by dedicated modules (Staff & Training, Insurance, Safety & Risk,
// Red Tractor Compliance) are intentionally excluded — they are auto-surfaced in
// the Compliance Hub tab by reading from their native data sources.
const STANDALONE_DOC_CATEGORIES: { category: string; types: string[]; machinery?: boolean }[] = [
  {
    category: "Agronomy & Soil",
    types: [
      "Soil Analysis Report",
      "Nutrient Management Plan (NMP)",
      "Agronomy Recommendation Report",
      "Tissue Testing Report",
    ],
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
      "Lifting Equipment Inspection (LOLER)",
    ],
  },
  {
    category: "Safety & Fire",
    types: [
      "Fire Risk Assessment",
      "Asbestos Survey Report",
      "RIDDOR Report",
      "Lone Worker Policy",
    ],
  },
  {
    category: "Legal & Agreements",
    types: [
      "Farm Business Tenancy Agreement",
      "Land Ownership / Title Deeds",
      "Basic Payment Scheme (BPS) Agreement",
      "Countryside Stewardship Agreement",
      "Sustainable Farming Incentive (SFI) Agreement",
      "Environmental Stewardship Agreement",
    ],
  },
  {
    category: "Food Safety & Traceability",
    types: [
      "Pesticide Invoice / Purchase Record",
      "Seed Certificate",
      "Veterinary Health Certificate",
      "Grain Storage Record",
    ],
  },
  { category: "Other", types: ["Other"] },
];

const ALL_STANDALONE_TYPES = STANDALONE_DOC_CATEGORIES.flatMap(c => c.types);
const MACHINERY_TYPES = new Set(STANDALONE_DOC_CATEGORIES.find(c => c.machinery)?.types ?? []);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (d: string | null | undefined) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function getExpiryStatus(date: string | null | undefined): "expired" | "expiring" | "valid" | "none" {
  if (!date) return "none";
  const days = Math.floor((new Date(date).getTime() - Date.now()) / 86400000);
  if (days < 0) return "expired";
  if (days <= 90) return "expiring";
  return "valid";
}

function ExpiryBadge({ status }: { status: "expired" | "expiring" | "valid" | "none" }) {
  const map = {
    expired: { bg: "#fee2e2", color: "#991b1b", label: "Expired" },
    expiring: { bg: "#fef3c7", color: "#92400e", label: "Expiring Soon" },
    valid: { bg: "#dcfce7", color: "#166534", label: "Valid" },
    none: { bg: "#f3f4f6", color: "#6b7280", label: "No Expiry" },
  };
  const s = map[status];
  return <Badge style={{ background: s.bg, color: s.color, border: "none", fontSize: "0.72rem", whiteSpace: "nowrap" }}>{s.label}</Badge>;
}

function SectionHeader({
  icon, title, count, managedIn, managedHref, status,
}: {
  icon: React.ReactNode; title: string; count?: number;
  managedIn?: string; managedHref?: string;
  status?: "ok" | "warn" | "error";
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          background: status === "error" ? "#fee2e2" : status === "warn" ? "#fef3c7" : "#f0f9ff",
          borderRadius: 8, padding: 8, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>{title}</h2>
          {count !== undefined && (
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>{count} record{count !== 1 ? "s" : ""}</p>
          )}
        </div>
        {status === "error" && <Badge style={{ background: "#fee2e2", color: "#991b1b", border: "none", fontSize: "0.7rem" }}>Action Required</Badge>}
        {status === "warn" && <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.7rem" }}>Attention</Badge>}
      </div>
      {managedIn && managedHref && (
        <Link
          href={managedHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: "0.8rem", color: "#1d4ed8", fontWeight: 500,
            textDecoration: "none", background: "#eff6ff",
            border: "1px solid #bfdbfe", padding: "4px 12px", borderRadius: 6,
            whiteSpace: "nowrap",
          }}
        >
          Manage in {managedIn} <ExternalLink size={11} />
        </Link>
      )}
    </div>
  );
}

function ModuleUnavailable({ moduleName, href }: { moduleName: string; href: string }) {
  return (
    <div style={{ background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 8, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
      <Info size={15} color="#9ca3af" style={{ flexShrink: 0 }} />
      <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0, flex: 1 }}>
        <strong>{moduleName}</strong> module not active — records cannot be displayed here.
      </p>
      <Link href={href} style={{ fontSize: "0.8rem", color: "#1d4ed8", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
        Go to module <ExternalLink size={11} />
      </Link>
    </div>
  );
}

function AlertBanner({ type, children }: { type: "error" | "warn"; children: React.ReactNode }) {
  const s = type === "error"
    ? { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b" }
    : { bg: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "0.625rem 1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: s.color }}>
      <AlertTriangle size={14} style={{ flexShrink: 0 }} />{children}
    </div>
  );
}

async function safeJsonFetch(url: string): Promise<{ data: any; ok: boolean }> {
  try {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) return { data: null, ok: false };
    return { data: await r.json(), ok: true };
  } catch {
    return { data: null, ok: false };
  }
}

const TH_STYLE: React.CSSProperties = { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" };
const TD_STYLE: React.CSSProperties = { padding: "0.5rem 0.75rem", color: "#6b7280" };

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [pageTab, setPageTab] = useState<"hub" | "register" | "checklist">("hub");

  // ── Standalone documents (Document Register) ──────────────────────────────
  const docsQ = useQuery({
    queryKey: ["documents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/documents`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const docs: any[] = docsQ.data ?? [];

  // ── Staff certificates (Staff & Training module) ──────────────────────────
  const certsQ = useQuery({
    queryKey: ["staff-certs-hub", farmId],
    queryFn: () => safeJsonFetch(`/api/farms/${farmId}/certificates`),
    enabled: !!farmId,
    staleTime: 60000,
  });
  const certsOk = certsQ.data?.ok ?? false;
  const staffCerts: any[] = certsQ.data?.data?.records ?? [];

  // ── COSHH records (Safety & Risk module) ─────────────────────────────────
  const coshhQ = useQuery({
    queryKey: ["risk-coshh-hub", farmId],
    queryFn: () => safeJsonFetch(`/api/farms/${farmId}/risk-coshh`),
    enabled: !!farmId,
    staleTime: 60000,
  });
  const coshhOk = coshhQ.data?.ok ?? false;
  const coshhRecords: any[] = coshhQ.data?.data?.records ?? [];

  // ── Insurance policies ────────────────────────────────────────────────────
  const insuranceQ = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
    staleTime: 60000,
  });
  const insuranceRecords: any[] = insuranceQ.data ?? [];

  // ── Assurance certificates (Red Tractor Compliance module) ────────────────
  const assuranceQ = useQuery({
    queryKey: ["assurance-certs-hub", farmId],
    queryFn: () => safeJsonFetch(`/api/farms/${farmId}/assurance-certs`),
    enabled: !!farmId,
    staleTime: 60000,
  });
  const assuranceOk = assuranceQ.data?.ok ?? false;
  const assuranceCerts: any[] = assuranceQ.data?.data?.records ?? [];

  // ── Staff members (for name resolution on certificates) ───────────────────
  const membersQ = useFarmMembers(farmId);
  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of membersQ.data?.members ?? []) {
      if (m.linkedUserId) map.set(m.linkedUserId, memberFullName(m));
    }
    return map;
  }, [membersQ.data]);
  const resolveName = (uid: string) => memberNameMap.get(uid) ?? uid ?? "—";

  // ── Derived alert counts ──────────────────────────────────────────────────
  const certExpired = staffCerts.filter(c => getExpiryStatus(c.expiryDate) === "expired").length;
  const certExpiring = staffCerts.filter(c => getExpiryStatus(c.expiryDate) === "expiring").length;
  const assuranceExpired = assuranceCerts.filter(a => getExpiryStatus(a.expiryDate) === "expired").length;
  const insuranceExpired = insuranceRecords.filter(i => getExpiryStatus(i.expiryDate) === "expired" && !i.supersededByRenewal).length;
  const coshhOverdue = coshhRecords.filter(c => c.reviewDate && getExpiryStatus(c.reviewDate) === "expired").length;
  const docsExpired = docs.filter(d => getExpiryStatus(d.expiryDate) === "expired").length;
  const docsExpiring = docs.filter(d => getExpiryStatus(d.expiryDate) === "expiring").length;

  // ── Red Tractor intelligent checklist ────────────────────────────────────
  const hasPLI = insuranceRecords.some(i => i.policyType === "public_liability" && getExpiryStatus(i.expiryDate) !== "expired" && !i.supersededByRenewal);
  const hasELI = insuranceRecords.some(i => (i.policyType === "employers_liability" || i.coversEmployerLiability) && getExpiryStatus(i.expiryDate) !== "expired" && !i.supersededByRenewal);
  const hasRtCert = assuranceOk
    ? assuranceCerts.some(a => a.certificationBody?.toLowerCase().includes("red") && getExpiryStatus(a.expiryDate) !== "expired")
    : docs.some(d => d.documentType === "Red Tractor Assurance Certificate" && getExpiryStatus(d.expiryDate) !== "expired");
  const paHolders = certsOk
    ? staffCerts.filter(c => (c.certificateType?.includes("PA1") || c.certificateType?.includes("PA2") || c.certificateType?.includes("PA6")) && getExpiryStatus(c.expiryDate) !== "expired")
    : [];
  const hasPA = certsOk ? paHolders.length > 0 : docs.some(d => d.documentType?.includes("Spray Operator") && getExpiryStatus(d.expiryDate) !== "expired");

  type CheckStatus = "present" | "expired" | "missing";
  const checklistItems: { label: string; note: string; status: CheckStatus; dataFrom: string; href: string | null; detail: string | null }[] = [
    {
      label: "Red Tractor Assurance Certificate",
      note: "Must be current and in date",
      status: hasRtCert ? "present" : (assuranceOk ? assuranceCerts.some(a => a.certificationBody?.toLowerCase().includes("red")) : docs.some(d => d.documentType === "Red Tractor Assurance Certificate")) ? "expired" : "missing",
      dataFrom: assuranceOk ? "Red Tractor Compliance" : "Document Register",
      href: assuranceOk ? "/compliance" : null,
      detail: assuranceOk
        ? (() => { const a = assuranceCerts.find(c => c.certificationBody?.toLowerCase().includes("red")); return a ? `${a.scheme ?? a.certificationBody}${a.expiryDate ? ` — expires ${fmt(a.expiryDate)}` : ""}` : null; })()
        : null,
    },
    {
      label: "Spray Operator Certificate (PA1 / PA2 / PA6)",
      note: "At least one qualified operator required",
      status: hasPA ? "present"
        : certsOk ? (staffCerts.some(c => c.certificateType?.includes("PA1") || c.certificateType?.includes("PA2") || c.certificateType?.includes("PA6")) ? "expired" : "missing")
        : "missing",
      dataFrom: certsOk ? "Staff & Training → Certificates" : "Document Register",
      href: certsOk ? "/training?tab=certificates" : null,
      detail: certsOk && paHolders.length > 0
        ? `${paHolders.length} qualified operator${paHolders.length !== 1 ? "s" : ""}: ${paHolders.slice(0, 4).map(h => resolveName(h.userId)).join(", ")}${paHolders.length > 4 ? "…" : ""}`
        : null,
    },
    {
      label: "Nutrient Management Plan (NMP)",
      note: "Must be reviewed annually",
      status: docs.some(d => d.documentType === "Nutrient Management Plan (NMP)" && getExpiryStatus(d.expiryDate) !== "expired") ? "present"
        : docs.some(d => d.documentType === "Nutrient Management Plan (NMP)") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: (() => { const d = docs.find(x => x.documentType === "Nutrient Management Plan (NMP)"); return d ? `${d.title}${d.expiryDate ? ` — expires ${fmt(d.expiryDate)}` : ""}` : null; })(),
    },
    {
      label: "COSHH Assessments (all agrochemicals)",
      note: "Required for every product in use",
      status: coshhOk ? (coshhRecords.length > 0 ? "present" : "missing") : docs.some(d => d.documentType === "COSHH Assessment") ? "present" : "missing",
      dataFrom: coshhOk ? "Safety & Risk → COSHH" : "Document Register",
      href: coshhOk ? "/risks?tab=coshh" : null,
      detail: coshhOk && coshhRecords.length > 0
        ? `${coshhRecords.length} substance${coshhRecords.length !== 1 ? "s" : ""} assessed${coshhOverdue > 0 ? ` · ${coshhOverdue} overdue for review` : ""}`
        : null,
    },
    {
      label: "Soil Analysis Report (within 5 years)",
      note: "Required within the last 5 years",
      status: docs.some(d => d.documentType === "Soil Analysis Report" && getExpiryStatus(d.expiryDate) !== "expired") ? "present"
        : docs.some(d => d.documentType === "Soil Analysis Report") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: (() => { const d = docs.find(x => x.documentType === "Soil Analysis Report"); return d ? `${d.title}${d.issueDate ? ` — issued ${fmt(d.issueDate)}` : ""}` : null; })(),
    },
    {
      label: "Sprayer Calibration Certificate (NSTS)",
      note: "Required every 3 years under Red Tractor",
      status: docs.some(d => d.documentType === "Sprayer Calibration Certificate (NSTS)" && getExpiryStatus(d.expiryDate) !== "expired") ? "present"
        : docs.some(d => d.documentType === "Sprayer Calibration Certificate (NSTS)") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: (() => {
        const certs = docs.filter(d => d.documentType === "Sprayer Calibration Certificate (NSTS)");
        if (certs.length === 0) return null;
        return certs.map(c => {
          const machine = c.notes?.startsWith("Equipment:") ? c.notes.split("\n")[0].replace("Equipment: ", "") : c.title;
          return machine;
        }).join(", ");
      })(),
    },
    {
      label: "Grain Store Inspection Certificate",
      note: "Required for commercial grain storage",
      status: docs.some(d => d.documentType === "Grain Store Inspection Certificate" && getExpiryStatus(d.expiryDate) !== "expired") ? "present"
        : docs.some(d => d.documentType === "Grain Store Inspection Certificate") ? "expired" : "missing",
      dataFrom: "Document Register",
      href: null,
      detail: null,
    },
    {
      label: "Farm Insurance — Public Liability",
      note: "Minimum £5m cover required by Red Tractor",
      status: hasPLI ? "present"
        : insuranceRecords.some(i => i.policyType === "public_liability") ? "expired" : "missing",
      dataFrom: "Insurance",
      href: "/insurance",
      detail: (() => { const p = insuranceRecords.find(i => i.policyType === "public_liability" && !i.supersededByRenewal); return p ? `${p.insurer ?? "Insurer not recorded"}${p.expiryDate ? ` — expires ${fmt(p.expiryDate)}` : ""}` : null; })(),
    },
    {
      label: "Employer's Liability Insurance",
      note: "Legally required under the EL (CI) Act 1969",
      status: hasELI ? "present"
        : insuranceRecords.some(i => i.policyType === "employers_liability" || i.coversEmployerLiability) ? "expired" : "missing",
      dataFrom: "Insurance",
      href: "/insurance",
      detail: (() => { const p = insuranceRecords.find(i => (i.policyType === "employers_liability" || i.coversEmployerLiability) && !i.supersededByRenewal); return p ? `${p.insurer ?? "Insurer not recorded"}${p.expiryDate ? ` — expires ${fmt(p.expiryDate)}` : ""}` : null; })(),
    },
  ];

  const checklistPass = checklistItems.filter(i => i.status === "present").length;
  const checklistFail = checklistItems.filter(i => i.status !== "present").length;

  // ── Document Register CRUD ────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const emptyForm = {
    title: "", documentType: "", referenceNumber: "", issuedBy: "",
    issueDate: "", expiryDate: "", uploadedBy: "", notes: "", machineName: "",
    filePath: "", mimeType: "", fileSize: 0,
  };
  const [form, setForm] = useState<any>(emptyForm);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [pendingFileSize, setPendingFileSize] = useState<number | null>(null);
  const [pendingFileMime, setPendingFileMime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setForm((f: any) => ({ ...f, filePath: response.objectPath, mimeType: pendingFileMime ?? "", fileSize: pendingFileSize ?? 0 }));
    },
    onError: () => {
      toast({ title: "File upload failed", variant: "destructive" });
      setPendingFileName(null);
    },
  });

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFileName(file.name);
    setPendingFileSize(file.size);
    setPendingFileMime(file.type || "application/octet-stream");
    await uploadFile(file);
    if (e.target) e.target.value = "";
  }, [uploadFile]);

  const clearFile = useCallback(() => {
    setPendingFileName(null); setPendingFileSize(null); setPendingFileMime(null);
    setForm((f: any) => ({ ...f, filePath: "", mimeType: "", fileSize: 0 }));
  }, []);

  const closeAdd = useCallback((open: boolean) => {
    setAddOpen(open);
    if (!open) { setForm(emptyForm); setPendingFileName(null); setPendingFileSize(null); setPendingFileMime(null); }
  }, []);

  const createMut = useMutation({
    mutationFn: (body: any) =>
      fetch(`/api/farms/${farmId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Document recorded" }); qc.invalidateQueries({ queryKey: ["documents", farmId] }); closeAdd(false); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/documents/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Document deleted" }); qc.invalidateQueries({ queryKey: ["documents", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const handleSave = () => {
    const { machineName, ...rest } = form;
    const body: any = { ...rest };
    if (machineName?.trim()) {
      body.notes = `Equipment: ${machineName.trim()}${rest.notes ? `\n${rest.notes}` : ""}`;
    }
    if (!body.filePath) { delete body.filePath; delete body.mimeType; delete body.fileSize; }
    if (!body.issueDate) delete body.issueDate;
    if (!body.expiryDate) delete body.expiryDate;
    createMut.mutate(body);
  };

  const isMachineryType = MACHINERY_TYPES.has(form.documentType);
  const canSave = !!form.title && !isUploading && !createMut.isPending;

  const filteredDocs = useMemo(() => docs.filter((d: any) => {
    if (categoryFilter !== "all") {
      const cat = STANDALONE_DOC_CATEGORIES.find(c => c.category === categoryFilter);
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout title="Documents">
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }}>
          <p className="text-sm text-gray-500" style={{ margin: 0, flex: 1, maxWidth: 600 }}>
            Compliance document hub — live view across all modules. Operator certificates, COSHH assessments, insurance, and assurance records are read automatically from their source modules; no manual re-entry required.
          </p>
          <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
            {([
              ["hub", "Compliance Hub"],
              ["register", "Document Register"],
              ["checklist", `Red Tractor (${checklistPass}/${checklistItems.length})`],
            ] as const).map(([t, label], i) => (
              <button
                key={t}
                onClick={() => setPageTab(t)}
                style={{
                  padding: "0.45rem 1rem", border: "none", cursor: "pointer",
                  fontSize: "0.8125rem", fontWeight: 500,
                  background: pageTab === t ? "#166534" : "#fff",
                  color: pageTab === t ? "#fff" : "#374151",
                  borderRight: i < 2 ? "1px solid #e5e7eb" : "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            COMPLIANCE HUB
        ════════════════════════════════════════ */}
        {pageTab === "hub" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* ── Assurance & Certification ── */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <SectionHeader
                icon={<Award size={18} color={assuranceExpired > 0 ? "#991b1b" : "#166534"} />}
                title="Assurance & Certification"
                count={assuranceCerts.length}
                managedIn="Red Tractor Compliance"
                managedHref="/compliance"
                status={assuranceExpired > 0 ? "error" : undefined}
              />
              {!assuranceOk ? (
                <ModuleUnavailable moduleName="Red Tractor Compliance" href="/compliance" />
              ) : assuranceCerts.length === 0 ? (
                <AlertBanner type="error">
                  No assurance certificates recorded — add your Red Tractor and other scheme certificates in Red Tractor Compliance.
                </AlertBanner>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {["Certification Body", "Scheme", "Certificate No.", "Issue Date", "Expiry", "Status"].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {assuranceCerts.map((a: any, i: number) => {
                        const s = getExpiryStatus(a.expiryDate);
                        return (
                          <tr key={a.id} style={{ borderBottom: i < assuranceCerts.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }}>
                            <td style={{ ...TD_STYLE, fontWeight: 500, color: "#111827" }}>{a.certificationBody ?? "—"}</td>
                            <td style={TD_STYLE}>{a.scheme ?? "—"}</td>
                            <td style={{ ...TD_STYLE, fontFamily: "monospace" }}>{a.certNumber ?? "—"}</td>
                            <td style={{ ...TD_STYLE, whiteSpace: "nowrap" }}>{fmt(a.issueDate) ?? "—"}</td>
                            <td style={{ ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#166534", fontWeight: 600 }}>
                              {fmt(a.expiryDate) ?? "No expiry"}
                            </td>
                            <td style={TD_STYLE}><ExpiryBadge status={s} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Operator Competence & Qualifications ── */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <SectionHeader
                icon={<Users size={18} color={certExpired > 0 ? "#991b1b" : "#1d4ed8"} />}
                title="Operator Competence & Qualifications"
                count={staffCerts.length}
                managedIn="Staff & Training"
                managedHref="/training?tab=certificates"
                status={certExpired > 0 ? "error" : certExpiring > 0 ? "warn" : undefined}
              />
              {!certsOk ? (
                <ModuleUnavailable moduleName="Staff & Training" href="/training?tab=certificates" />
              ) : staffCerts.length === 0 ? (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: 10 }}>
                  <Info size={15} color="#1d4ed8" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", color: "#1e40af" }}>
                    No certificates recorded — add operator certificates (PA1, PA2, PA6, First Aid, Forklift, Chainsaw and all others) per person in <Link href="/training?tab=certificates" style={{ color: "#1d4ed8" }}>Staff &amp; Training → Certificates</Link>. Each holder gets their own record with individual expiry tracking.
                  </span>
                </div>
              ) : (
                <>
                  {certExpired > 0 && <AlertBanner type="error"><strong>{certExpired}</strong> expired certificate{certExpired !== 1 ? "s" : ""} — renew immediately</AlertBanner>}
                  {certExpiring > 0 && <AlertBanner type="warn"><strong>{certExpiring}</strong> certificate{certExpiring !== 1 ? "s" : ""} expiring within 90 days</AlertBanner>}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["Staff Member", "Certificate Type", "Issuer", "Cert Number", "Issue Date", "Expiry", "Status"].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {staffCerts.map((c: any, i: number) => {
                          const s = getExpiryStatus(c.expiryDate);
                          return (
                            <tr key={c.id} style={{ borderBottom: i < staffCerts.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }}>
                              <td style={{ ...TD_STYLE, fontWeight: 600, color: "#111827" }}>{resolveName(c.userId)}</td>
                              <td style={{ ...TD_STYLE, color: "#111827" }}>{c.certificateType}</td>
                              <td style={TD_STYLE}>{c.issuer ?? "—"}</td>
                              <td style={{ ...TD_STYLE, fontFamily: "monospace" }}>{c.certificateNumber ?? "—"}</td>
                              <td style={{ ...TD_STYLE, whiteSpace: "nowrap" }}>{fmt(c.issueDate) ?? "—"}</td>
                              <td style={{ ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#166534", fontWeight: 600 }}>
                                {fmt(c.expiryDate) ?? "No expiry"}
                              </td>
                              <td style={TD_STYLE}><ExpiryBadge status={s} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* ── COSHH & Safety Records ── */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <SectionHeader
                icon={<FlaskConical size={18} color={coshhOverdue > 0 ? "#92400e" : "#7c3aed"} />}
                title="COSHH & Safety Records"
                count={coshhRecords.length}
                managedIn="Safety & Risk"
                managedHref="/risks?tab=coshh"
                status={coshhOverdue > 0 ? "warn" : undefined}
              />
              {!coshhOk ? (
                <ModuleUnavailable moduleName="Safety & Risk" href="/risks" />
              ) : coshhRecords.length === 0 ? (
                <AlertBanner type="error">
                  No COSHH assessments recorded — Red Tractor requires a COSHH assessment for every agrochemical in use. Add assessments in <Link href="/risks?tab=coshh" style={{ color: "#991b1b", fontWeight: 600 }}>Safety &amp; Risk → COSHH</Link>.
                </AlertBanner>
              ) : (
                <>
                  {coshhOverdue > 0 && <AlertBanner type="warn"><strong>{coshhOverdue}</strong> COSHH assessment{coshhOverdue !== 1 ? "s" : ""} overdue for review</AlertBanner>}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["Substance", "Hazard Classification", "Assessed By", "Assessment Date", "Review Due", "Status"].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {coshhRecords.map((c: any, i: number) => {
                          const s = c.reviewDate ? getExpiryStatus(c.reviewDate) : "none";
                          return (
                            <tr key={c.id} style={{ borderBottom: i < coshhRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fffbeb" : "transparent" }}>
                              <td style={{ ...TD_STYLE, fontWeight: 500, color: "#111827" }}>{c.substanceName}</td>
                              <td style={TD_STYLE}>{c.hazardClassification ?? "—"}</td>
                              <td style={TD_STYLE}>{c.assessedBy ?? "—"}</td>
                              <td style={{ ...TD_STYLE, whiteSpace: "nowrap" }}>{fmt(c.assessmentDate) ?? "—"}</td>
                              <td style={{ ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#92400e" : "#374151", fontWeight: s === "expired" ? 600 : 400 }}>
                                {fmt(c.reviewDate) ?? "—"}
                              </td>
                              <td style={TD_STYLE}>
                                {c.reviewDate
                                  ? <ExpiryBadge status={s} />
                                  : <Badge style={{ background: "#f3f4f6", color: "#6b7280", border: "none", fontSize: "0.72rem" }}>No Review Set</Badge>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* ── Farm Insurance ── */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <SectionHeader
                icon={<Shield size={18} color={insuranceExpired > 0 ? "#991b1b" : "#0369a1"} />}
                title="Farm Insurance"
                count={insuranceRecords.filter(i => !i.supersededByRenewal).length}
                managedIn="Insurance"
                managedHref="/insurance"
                status={insuranceExpired > 0 ? "error" : undefined}
              />
              {insuranceQ.isLoading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
              ) : insuranceRecords.length === 0 ? (
                <AlertBanner type="error">
                  No insurance policies recorded. Employer's Liability and Public Liability are mandatory — add them in <Link href="/insurance" style={{ color: "#991b1b", fontWeight: 600 }}>Insurance</Link>.
                </AlertBanner>
              ) : (
                <>
                  {insuranceExpired > 0 && <AlertBanner type="error"><strong>{insuranceExpired}</strong> expired polic{insuranceExpired !== 1 ? "ies" : "y"} — renew immediately</AlertBanner>}
                  {(() => {
                    const missing = [!hasPLI && "Public Liability", !hasELI && "Employer's Liability"].filter(Boolean) as string[];
                    return missing.length > 0 ? <AlertBanner type="error">Missing critical cover: <strong>{missing.join(", ")}</strong></AlertBanner> : null;
                  })()}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["Policy Type", "Insurer", "Policy Number", "Start Date", "Expiry", "Status"].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {insuranceRecords.filter((i: any) => !i.supersededByRenewal).map((ins: any, i: number, arr: any[]) => {
                          const s = getExpiryStatus(ins.expiryDate);
                          const isCritical = ins.policyType === "employers_liability" || ins.policyType === "public_liability" || ins.coversEmployerLiability;
                          const LABELS: Record<string, string> = {
                            employers_liability: "Employer's Liability", public_liability: "Public Liability",
                            product_liability: "Product Liability", motor_agricultural: "Motor / Agricultural",
                            buildings_contents: "Buildings & Contents", farm_machinery: "Farm Machinery",
                            livestock: "Livestock", crop_revenue: "Crop & Revenue",
                            environmental_liability: "Environmental Liability", goods_in_custody: "Goods in Custody",
                            contract_work: "Contract Work", tascc: "TASCC Bond", hired_in_plant: "Hired-in Plant", other: "Other",
                          };
                          return (
                            <tr key={ins.id} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }}>
                              <td style={{ ...TD_STYLE, color: "#111827" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: 500 }}>{LABELS[ins.policyType] ?? ins.policyType}</span>
                                  {isCritical && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "1px 5px", borderRadius: 4 }}>Required</span>}
                                </div>
                              </td>
                              <td style={TD_STYLE}>{ins.insurer ?? "—"}</td>
                              <td style={{ ...TD_STYLE, fontFamily: "monospace" }}>{ins.policyNumber ?? "—"}</td>
                              <td style={{ ...TD_STYLE, whiteSpace: "nowrap" }}>{fmt(ins.startDate) ?? "—"}</td>
                              <td style={{ ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#166534", fontWeight: 600 }}>
                                {fmt(ins.expiryDate) ?? "No expiry"}
                              </td>
                              <td style={TD_STYLE}><ExpiryBadge status={s} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* ── Farm Documents (standalone) ── */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <SectionHeader
                icon={<FileText size={18} color={docsExpired > 0 ? "#991b1b" : "#374151"} />}
                title="Farm Documents"
                count={docs.length}
                status={docsExpired > 0 ? "error" : docsExpiring > 0 ? "warn" : undefined}
              />
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.875rem", marginTop: "-0.25rem" }}>
                Soil analysis reports, calibration certificates, NMPs, legal agreements, and other documents not managed by a dedicated module.{" "}
                <button onClick={() => setPageTab("register")} style={{ background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", fontSize: "0.8rem", padding: 0, textDecoration: "underline" }}>
                  Add or manage in Document Register →
                </button>
              </p>
              {docsExpired > 0 && <AlertBanner type="error"><strong>{docsExpired}</strong> expired document{docsExpired !== 1 ? "s" : ""} — requires attention</AlertBanner>}
              {docsExpiring > 0 && <AlertBanner type="warn"><strong>{docsExpiring}</strong> document{docsExpiring !== 1 ? "s" : ""} expiring within 90 days</AlertBanner>}
              {docs.length === 0 ? (
                <div style={{ background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 8, padding: "1.5rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af", margin: "0 0 0.5rem" }}>No standalone documents yet.</p>
                  <button onClick={() => { setPageTab("register"); setTimeout(() => setAddOpen(true), 50); }} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 12px", fontSize: "0.8rem", color: "#374151", cursor: "pointer" }}>
                    + Add Document
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {["Title", "Type", "Issued By", "Expiry", "Status", ""].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {docs.slice(0, 10).map((doc: any, i: number) => {
                        const s = getExpiryStatus(doc.expiryDate);
                        const machine = doc.notes?.startsWith("Equipment:") ? doc.notes.split("\n")[0].replace("Equipment: ", "") : null;
                        const viewUrl = doc.filePath ? `/api/storage${doc.filePath}` : null;
                        return (
                          <tr key={doc.id} style={{ borderBottom: i < Math.min(docs.length, 10) - 1 ? "1px solid #f3f4f6" : "none", background: s === "expired" ? "#fff7f7" : "transparent" }}>
                            <td style={{ ...TD_STYLE, color: "#111827", fontWeight: 500, maxWidth: 240 }}>
                              <div>{doc.title}</div>
                              {machine && <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }}>Equipment: {machine}</div>}
                            </td>
                            <td style={{ ...TD_STYLE, fontSize: "0.8rem" }}>{doc.documentType ?? "—"}</td>
                            <td style={TD_STYLE}>{doc.issuedBy ?? "—"}</td>
                            <td style={{ ...TD_STYLE, whiteSpace: "nowrap", color: s === "expired" ? "#991b1b" : s === "expiring" ? "#92400e" : "#374151", fontWeight: s !== "valid" && s !== "none" ? 600 : 400 }}>
                              {fmt(doc.expiryDate) ?? "No expiry"}
                            </td>
                            <td style={TD_STYLE}><ExpiryBadge status={s} /></td>
                            <td style={TD_STYLE}>
                              {viewUrl && <a href={viewUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 5, background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 500, textDecoration: "none", border: "1px solid #bfdbfe" }}><Eye size={11} /> View</a>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {docs.length > 10 && (
                    <button onClick={() => setPageTab("register")} style={{ display: "block", marginTop: "0.75rem", background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline", padding: 0 }}>
                      View all {docs.length} documents in Document Register →
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ════════════════════════════════════════
            DOCUMENT REGISTER
        ════════════════════════════════════════ */}
        {pageTab === "register" && (
          <>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Info size={15} color="#1d4ed8" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0 }}>
                <strong>Standalone documents only.</strong>{" "}
                Operator certificates are managed per person in <Link href="/training?tab=certificates" style={{ color: "#1d4ed8" }}>Staff &amp; Training → Certificates</Link>. Farm insurance is in <Link href="/insurance" style={{ color: "#1d4ed8" }}>Insurance</Link>. COSHH assessments are in <Link href="/risks?tab=coshh" style={{ color: "#1d4ed8" }}>Safety &amp; Risk</Link>. Assurance certificates are in <Link href="/compliance" style={{ color: "#1d4ed8" }}>Red Tractor Compliance</Link>. All of these are surfaced automatically in the Compliance Hub tab.
              </p>
            </div>

            {(docsExpired > 0 || docsExpiring > 0) && (
              <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
                {docsExpired > 0 && <AlertBanner type="error"><strong>{docsExpired}</strong> expired document{docsExpired !== 1 ? "s" : ""}</AlertBanner>}
                {docsExpiring > 0 && <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "#92400e" }}><Clock size={14} /><strong>{docsExpiring}</strong> expiring within 90 days</div>}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger style={{ width: 200 }}><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {STANDALONE_DOC_CATEGORIES.map(c => <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger style={{ width: 160 }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="expired">Expired Only</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
                <Plus size={14} className="mr-1" />Add Document
              </Button>
            </div>

            {docsQ.isLoading ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
            ) : filteredDocs.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
                <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}>
                  <FileText size={28} color="#9ca3af" />
                </div>
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>{docs.length === 0 ? "No documents on record" : "No documents match your filters"}</p>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 420, marginBottom: "1.25rem" }}>
                  {docs.length === 0
                    ? "Record standalone farm documents — soil analysis reports, NMPs, calibration certificates, legal agreements and more."
                    : "Try changing your search or filters."}
                </p>
                {docs.length === 0 && <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} className="mr-1" />Add First Document</Button>}
              </div>
            ) : (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {["Title / Equipment", "Type", "Reference No.", "Issued By", "Issue Date", "Expiry", "Status", "File", ""].map((h, i) => (
                          <th key={i} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map((doc: any, i: number) => {
                        const status = getExpiryStatus(doc.expiryDate);
                        const machine = doc.notes?.startsWith("Equipment:") ? doc.notes.split("\n")[0].replace("Equipment: ", "") : null;
                        const viewUrl = doc.filePath ? `/api/storage${doc.filePath}` : null;
                        return (
                          <tr key={doc.id} style={{ borderBottom: i < filteredDocs.length - 1 ? "1px solid #f3f4f6" : "none", background: status === "expired" ? "#fff7f7" : "transparent" }}>
                            <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500, color: "#111827", maxWidth: 240 }}>
                              <div>{doc.title}</div>
                              {machine && <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }}>Equipment: {machine}</div>}
                            </td>
                            <td style={{ ...TD_STYLE, fontSize: "0.8rem", maxWidth: 180 }}>{doc.documentType ?? "—"}</td>
                            <td style={{ ...TD_STYLE, fontFamily: doc.referenceNumber ? "monospace" : "inherit" }}>{doc.referenceNumber || "—"}</td>
                            <td style={TD_STYLE}>{doc.issuedBy || "—"}</td>
                            <td style={{ ...TD_STYLE, whiteSpace: "nowrap" }}>{fmt(doc.issueDate) || "—"}</td>
                            <td style={{ ...TD_STYLE, whiteSpace: "nowrap", color: status === "expired" ? "#991b1b" : status === "expiring" ? "#92400e" : "#166534", fontWeight: status !== "valid" && status !== "none" ? 600 : 400 }}>
                              {doc.expiryDate ? fmt(doc.expiryDate) : "No expiry"}
                            </td>
                            <td style={TD_STYLE}><ExpiryBadge status={status} /></td>
                            <td style={TD_STYLE}>
                              {viewUrl
                                ? <a href={viewUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 500, textDecoration: "none", border: "1px solid #bfdbfe" }}><Eye size={11} />View</a>
                                : <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>—</span>}
                            </td>
                            <td style={{ padding: "0.5rem" }}>
                              <button onClick={() => setDeleteId(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            RED TRACTOR CHECKLIST
        ════════════════════════════════════════ */}
        {pageTab === "checklist" && (
          <div>
            <div style={{
              background: checklistFail === 0 ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${checklistFail === 0 ? "#bbf7d0" : "#fca5a5"}`,
              borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1.5rem",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {checklistFail === 0 ? <CheckCircle size={16} color="#16a34a" /> : <AlertTriangle size={16} color="#dc2626" />}
              <div style={{ fontSize: "0.875rem", color: checklistFail === 0 ? "#166534" : "#991b1b" }}>
                <strong>{checklistPass}</strong> of <strong>{checklistItems.length}</strong> Red Tractor required items present and valid.
                {checklistFail > 0 && <span style={{ marginLeft: 8 }}>{checklistFail} missing or expired — action required before your next audit.</span>}
              </div>
            </div>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.625rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Info size={14} color="#1d4ed8" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: "0.8rem", color: "#1e40af", margin: 0 }}>
                Each item reads from its source module in real time — not from a separate manual entry. The source is shown on each card.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {checklistItems.map((item, idx) => {
                const SC = {
                  present: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", label: "Present", labelColor: "#166534" },
                  expired: { bg: "#fef2f2", border: "#fca5a5", dot: "#dc2626", label: "Expired", labelColor: "#991b1b" },
                  missing: { bg: "#f9fafb", border: "#e5e7eb", dot: "#d1d5db", label: "Missing", labelColor: "#9ca3af" },
                };
                const sc = SC[item.status];
                return (
                  <div key={idx} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 10, padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot, flexShrink: 0, marginTop: 4 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.4 }}>{item.label}</p>
                        <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: "2px 0 0" }}>{item.note}</p>
                      </div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: sc.labelColor, flexShrink: 0, background: "#fff", padding: "2px 7px", borderRadius: 5, border: `1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                    </div>
                    {item.detail && (
                      <div style={{ fontSize: "0.75rem", color: "#374151", paddingLeft: 16, fontWeight: 500 }}>{item.detail}</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, marginTop: 2 }}>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                        Source: <span style={{ color: "#6b7280", fontWeight: 500 }}>{item.dataFrom}</span>
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {item.href && (
                          <a href={item.href} style={{ fontSize: "0.75rem", color: "#1d4ed8", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                            View <ExternalLink size={10} />
                          </a>
                        )}
                        {!item.href && item.status === "missing" && (
                          <button
                            onClick={() => {
                              setPageTab("register");
                              setTimeout(() => { setForm((f: any) => ({ ...emptyForm, documentType: item.label })); setAddOpen(true); }, 50);
                            }}
                            style={{ fontSize: "0.75rem", color: "#1d4ed8", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            + Add →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Add Document Dialog ─────────────────────────────────────────── */}
        <Dialog open={addOpen} onOpenChange={closeAdd}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="e.g. Soil Analysis 2024 — Home Farm" /></div>
              <div>
                <Label>Document Type</Label>
                <Select value={form.documentType} onValueChange={v => setForm((f: any) => ({ ...f, documentType: v, machineName: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {STANDALONE_DOC_CATEGORIES.map(cat => (
                      <React.Fragment key={cat.category}>
                        <div style={{ padding: "4px 8px", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.category}</div>
                        {cat.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isMachineryType && (
                <div>
                  <Label>Equipment / Machine</Label>
                  <Input value={form.machineName} onChange={e => setForm((f: any) => ({ ...f, machineName: e.target.value }))} placeholder="e.g. Hardi Commander 4000, Weighbridge Unit 2" />
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>Which machine or equipment does this certificate apply to?</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><Label>Reference Number</Label><Input value={form.referenceNumber} onChange={e => setForm((f: any) => ({ ...f, referenceNumber: e.target.value }))} placeholder="Cert / ref no." /></div>
                <div><Label>Issued By</Label><Input value={form.issuedBy} onChange={e => setForm((f: any) => ({ ...f, issuedBy: e.target.value }))} placeholder="Issuing body or inspector" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><Label>Issue Date</Label><Input type="date" value={form.issueDate} onChange={e => setForm((f: any) => ({ ...f, issueDate: e.target.value }))} /></div>
                <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={e => setForm((f: any) => ({ ...f, expiryDate: e.target.value }))} /></div>
              </div>
              <div><Label>Uploaded By</Label><Input value={form.uploadedBy} onChange={e => setForm((f: any) => ({ ...f, uploadedBy: e.target.value }))} placeholder="Your name" /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional notes" /></div>
              <div>
                <Label>Document File</Label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*" style={{ display: "none" }} />
                {pendingFileName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem" }}>
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <File size={14} color="#16a34a" />}
                    <span style={{ fontSize: "0.8rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingFileName}</span>
                    <button onClick={clearFile} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", flexShrink: 0 }}><X size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.625rem 1rem", border: "1px dashed #d1d5db", borderRadius: 8, background: "#f9fafb", cursor: "pointer", width: "100%", color: "#6b7280", fontSize: "0.875rem" }}>
                    <Upload size={14} /> Upload PDF or image
                  </button>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => closeAdd(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!canSave}>
                {createMut.isPending && <Loader2 size={14} className="animate-spin mr-1" />}
                Save Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ─────────────────────────────────────────────── */}
        <Dialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
          <DialogContent style={{ maxWidth: 380 }}>
            <DialogHeader><DialogTitle>Delete Document?</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600">This document record will be permanently removed. Any uploaded file attached to it will also be deleted.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteId && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
                {deleteMut.isPending && <Loader2 size={14} className="animate-spin mr-1" />}Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
