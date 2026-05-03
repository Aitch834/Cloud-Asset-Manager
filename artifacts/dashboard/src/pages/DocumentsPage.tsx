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
import {
  Plus, Search, Trash2, FileText, AlertTriangle, CheckCircle, Clock,
  CheckSquare, Square, Upload, Loader2, X, Paperclip, Eye, File,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";

const DOC_CATEGORIES: { category: string; types: string[] }[] = [
  {
    category: "Assurance & Certification",
    types: [
      "Red Tractor Assurance Certificate",
      "LEAF Marque Certificate",
      "Organic Certification",
      "Soil Association Certificate",
      "RSPCA Assured Certificate",
      "QMS / HCC Assured Certificate",
      "BRCGS Certificate",
    ],
  },
  {
    category: "Operator Competence",
    types: [
      "Spray Operator Certificate (PA1)",
      "Spray Operator Certificate (PA2 – Ground)",
      "Spray Operator Certificate (PA6 – Handheld)",
      "Forklift / Telehandler Certificate",
      "Chainsaw Certificate (CS30/31/38)",
      "Safe Pass / CSCS Card",
      "First Aid Certificate",
      "Manual Handling Training Record",
      "Training Certificate (Other)",
    ],
  },
  {
    category: "Agronomy & Soil",
    types: [
      "FACTS Adviser Certificate",
      "BASIS Certificate",
      "CRoPS Adviser Certificate",
      "Soil Analysis Report",
      "Nutrient Management Plan (NMP)",
      "Agronomy Recommendation Report",
      "Tissue Testing Report",
    ],
  },
  {
    category: "Equipment & Machinery",
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
    category: "Health & Safety",
    types: [
      "COSHH Assessment",
      "Risk Assessment",
      "Fire Risk Assessment",
      "Asbestos Survey Report",
      "RIDDOR Report",
      "Lone Worker Policy",
    ],
  },
  {
    category: "Insurance & Legal",
    types: [
      "Farm Insurance Certificate",
      "Public Liability Insurance",
      "Employers Liability Insurance",
      "Vehicle Insurance Certificate",
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
      "Veterinary Prescription",
      "Veterinary Health Certificate",
      "Movement Licence / Movement Record",
      "Grain Storage Record",
    ],
  },
  {
    category: "Other",
    types: ["Other"],
  },
];

const ALL_DOC_TYPES = DOC_CATEGORIES.flatMap(c => c.types);

const RT_REQUIRED_DOCS: { label: string; key: string }[] = [
  { label: "Red Tractor Assurance Certificate", key: "Red Tractor Assurance Certificate" },
  { label: "Spray Operator Certificate (PA1 or PA2/PA6)", key: "Spray Operator Certificate (PA1)" },
  { label: "Nutrient Management Plan (NMP)", key: "Nutrient Management Plan (NMP)" },
  { label: "COSHH Assessments for all agrochemicals", key: "COSHH Assessment" },
  { label: "Risk Assessments (H&S)", key: "Risk Assessment" },
  { label: "Soil Analysis Report (within 5 years)", key: "Soil Analysis Report" },
  { label: "Sprayer Calibration Certificate (NSTS)", key: "Sprayer Calibration Certificate (NSTS)" },
  { label: "Grain Store Inspection Certificate", key: "Grain Store Inspection Certificate" },
  { label: "Farm Insurance Certificate", key: "Farm Insurance Certificate" },
  { label: "Employer's Liability Insurance", key: "Employers Liability Insurance" },
  { label: "Pesticide Purchase/Application Records", key: "Pesticide Invoice / Purchase Record" },
];

const fmt = (d: string | null | undefined) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function getExpiryStatus(expiryDate: string | null | undefined): "expired" | "expiring" | "valid" | "none" {
  if (!expiryDate) return "none";
  const now = new Date();
  const exp = new Date(expiryDate);
  const daysLeft = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 90) return "expiring";
  return "valid";
}

function StatCard({ icon, label, value, bg, iconBg, onClick, active }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        background: bg, border: active ? "2px solid #dc2626" : "1px solid #e5e7eb", borderRadius: 10,
        padding: active ? "calc(1rem - 1px) calc(1.25rem - 1px)" : "1rem 1.25rem",
        display: "flex", alignItems: "center", gap: 12,
        cursor: onClick ? "pointer" : "default",
        boxShadow: active ? "0 0 0 3px #fee2e2" : undefined,
        transition: "box-shadow 0.15s, border 0.15s",
      }}
    >
      <div style={{ background: iconBg, borderRadius: 8, padding: 8 }}>{icon}</div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{value}</p>
        {onClick && <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }}>{active ? "Filtered — click to clear" : "Click to filter"}</p>}
      </div>
    </div>
  );
}

function ExpiryBadge({ status }: { status: "expired" | "expiring" | "valid" | "none" }) {
  if (status === "expired") return <Badge style={{ background: "#fee2e2", color: "#991b1b", border: "none", fontSize: "0.72rem" }}>Expired</Badge>;
  if (status === "expiring") return <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem" }}>Expiring Soon</Badge>;
  if (status === "valid") return <Badge style={{ background: "#dcfce7", color: "#166534", border: "none", fontSize: "0.72rem" }}>Valid</Badge>;
  return <Badge style={{ background: "#f3f4f6", color: "#6b7280", border: "none", fontSize: "0.72rem" }}>No Expiry</Badge>;
}

function DocTypeBadge({ type }: { type: string }) {
  const short = type.replace("Red Tractor ", "RT ").replace(" Certificate", "").replace(" Assessment", "");
  const colors: Record<string, { bg: string; color: string }> = {
    "Red Tractor Assurance Certificate": { bg: "#dcfce7", color: "#166534" },
    "Spray Operator Certificate (PA1)": { bg: "#dbeafe", color: "#1e40af" },
    "Spray Operator Certificate (PA2 – Ground)": { bg: "#dbeafe", color: "#1e40af" },
    "Spray Operator Certificate (PA6 – Handheld)": { bg: "#dbeafe", color: "#1e40af" },
    "Equipment Calibration Certificate": { bg: "#ede9fe", color: "#5b21b6" },
    "Sprayer Calibration Certificate (NSTS)": { bg: "#ede9fe", color: "#5b21b6" },
    "COSHH Assessment": { bg: "#fee2e2", color: "#991b1b" },
    "Risk Assessment": { bg: "#fef3c7", color: "#92400e" },
    "Training Certificate (Other)": { bg: "#e0f2fe", color: "#0369a1" },
    "Farm Insurance Certificate": { bg: "#f0fdf4", color: "#166534" },
    "Employers Liability Insurance": { bg: "#f0fdf4", color: "#166534" },
  };
  const c = colors[type] || { bg: "#f3f4f6", color: "#374151" };
  return <Badge style={{ background: c.bg, color: c.color, border: "none", fontSize: "0.7rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", display: "block", whiteSpace: "nowrap" }} title={type}>{short}</Badge>;
}

function fileIcon(mimeType: string | null | undefined) {
  if (!mimeType) return <File size={13} style={{ color: "#6b7280" }} />;
  if (mimeType.startsWith("image/")) return <File size={13} style={{ color: "#0891b2" }} />;
  if (mimeType === "application/pdf") return <File size={13} style={{ color: "#dc2626" }} />;
  return <File size={13} style={{ color: "#7c3aed" }} />;
}

function fileSizeLabel(bytes: number | null | undefined) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showChecklist, setShowChecklist] = useState(true);
  const [pageTab, setPageTab] = useState<"register" | "required">("register");

  const emptyForm = {
    title: "", documentType: "", referenceNumber: "", issuedBy: "",
    issueDate: "", expiryDate: "", uploadedBy: "", notes: "",
    filePath: "", mimeType: "", fileSize: 0,
  };
  const [form, setForm] = useState<any>(emptyForm);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [pendingFileSize, setPendingFileSize] = useState<number | null>(null);
  const [pendingFileMime, setPendingFileMime] = useState<string | null>(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      setForm((f: any) => ({
        ...f,
        filePath: response.objectPath,
        mimeType: pendingFileMime ?? "",
        fileSize: pendingFileSize ?? 0,
      }));
    },
    onError: () => {
      toast({ title: "File upload failed", description: "The file could not be uploaded. Please try again.", variant: "destructive" });
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
    setPendingFileName(null);
    setPendingFileSize(null);
    setPendingFileMime(null);
    setForm((f: any) => ({ ...f, filePath: "", mimeType: "", fileSize: 0 }));
  }, []);

  const closeAddDialog = useCallback((open: boolean) => {
    setAddOpen(open);
    if (!open) {
      setForm(emptyForm);
      setPendingFileName(null);
      setPendingFileSize(null);
      setPendingFileMime(null);
    }
  }, []);

  const docsQ = useQuery({
    queryKey: ["documents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/documents`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const docs: any[] = docsQ.data ?? [];

  const createMut = useMutation({
    mutationFn: (body: any) =>
      fetch(`/api/farms/${farmId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast({ title: "Document recorded" });
      qc.invalidateQueries({ queryKey: ["documents", farmId] });
      closeAddDialog(false);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Document deleted" });
      qc.invalidateQueries({ queryKey: ["documents", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    return docs.filter((d: any) => {
      if (categoryFilter !== "all") {
        const cat = DOC_CATEGORIES.find(c => c.category === categoryFilter);
        if (cat && !cat.types.includes(d.documentType)) return false;
      }
      if (typeFilter !== "all" && d.documentType !== typeFilter) return false;
      if (statusFilter !== "all") {
        const s = getExpiryStatus(d.expiryDate);
        if (statusFilter === "attention" && s !== "expired" && s !== "expiring") return false;
        if (statusFilter === "expired" && s !== "expired") return false;
        if (statusFilter === "expiring" && s !== "expiring") return false;
        if (statusFilter === "valid" && (s !== "valid" && s !== "none")) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          d.title?.toLowerCase().includes(q) ||
          d.issuedBy?.toLowerCase().includes(q) ||
          d.referenceNumber?.toLowerCase().includes(q) ||
          d.documentType?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [docs, search, categoryFilter, typeFilter, statusFilter]);

  const expired = docs.filter(d => getExpiryStatus(d.expiryDate) === "expired").length;
  const expiringSoon = docs.filter(d => getExpiryStatus(d.expiryDate) === "expiring").length;

  const checklistPresent = RT_REQUIRED_DOCS.map(item => {
    const found = docs.some(d => d.documentType === item.key && getExpiryStatus(d.expiryDate) !== "expired");
    return { ...item, present: found };
  });
  const checklistComplete = checklistPresent.filter(c => c.present).length;

  const RT_FULL: { label: string; key: string; category: string; note?: string }[] = [
    { label: "Red Tractor Assurance Certificate", key: "Red Tractor Assurance Certificate", category: "Assurance & Certification" },
    { label: "Farm Insurance Certificate (Public Liability)", key: "Farm Insurance Certificate", category: "Insurance", note: "Minimum £5M public liability required" },
    { label: "Employers Liability Insurance", key: "Employers Liability Insurance", category: "Insurance", note: "Required if you employ any staff" },
    { label: "Spray Operator Certificate — PA1 (Foundation)", key: "Spray Operator Certificate (PA1)", category: "Operator Competence" },
    { label: "Spray Operator Certificate — PA2 (Ground) or PA6 (Handheld)", key: "Spray Operator Certificate (PA2 – Ground)", category: "Operator Competence" },
    { label: "Sprayer Calibration Certificate (NSTS)", key: "Sprayer Calibration Certificate (NSTS)", category: "Equipment & Machinery", note: "Required every 3 years under Red Tractor" },
    { label: "Nutrient Management Plan (NMP)", key: "Nutrient Management Plan (NMP)", category: "Agronomy & Soil", note: "Must be reviewed annually" },
    { label: "Soil Analysis Report (within 5 years)", key: "Soil Analysis Report", category: "Agronomy & Soil" },
    { label: "FACTS or BASIS Adviser Certificate", key: "FACTS Adviser Certificate", category: "Agronomy & Soil" },
    { label: "COSHH Assessments (agrochemicals)", key: "COSHH Assessment", category: "Health & Safety" },
    { label: "Risk Assessment — General Farm", key: "Risk Assessment (General)", category: "Health & Safety" },
    { label: "First Aid Certificate", key: "First Aid Certificate", category: "Operator Competence" },
    { label: "Grain Store Inspection Certificate", key: "Grain Store Inspection Certificate", category: "Storage & Grain" },
    { label: "Pesticide Purchase & Application Records", key: "Pesticide Invoice / Purchase Record", category: "Compliance Records" },
  ];
  const rtByCategory: Record<string, typeof RT_FULL> = {};
  for (const item of RT_FULL) {
    if (!rtByCategory[item.category]) rtByCategory[item.category] = [];
    rtByCategory[item.category].push(item);
  }

  const onDocTypeSelect = (v: string) => {
    setForm((f: any) => ({ ...f, documentType: v }));
    const defaultIssuers: Record<string, string> = {
      "Red Tractor Assurance Certificate": "Red Tractor Assurance",
      "Spray Operator Certificate (PA1)": "BASIS Registration Ltd",
      "Spray Operator Certificate (PA2 – Ground)": "BASIS Registration Ltd",
      "Spray Operator Certificate (PA6 – Handheld)": "BASIS Registration Ltd",
      "Sprayer Calibration Certificate (NSTS)": "NSTS Tester",
      "Farm Insurance Certificate": "",
    };
    if (defaultIssuers[v] !== undefined) {
      setForm((f: any) => ({ ...f, documentType: v, issuedBy: f.issuedBy || defaultIssuers[v] }));
    }
  };

  const handleSave = () => {
    const body: any = { ...form };
    if (!body.filePath) { delete body.filePath; delete body.mimeType; delete body.fileSize; }
    if (!body.issueDate) delete body.issueDate;
    if (!body.expiryDate) delete body.expiryDate;
    createMut.mutate(body);
  };

  const canSave = !!form.title && !isUploading && !createMut.isPending;

  return (
    <AppLayout title="Documents">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }}>
          <p className="text-sm text-gray-500" style={{ margin: 0, flex: 1 }}>
            Farm document register — certificates, assessments, assurance documents, and compliance records. Red Tractor assessors will request to see these during an audit visit.
          </p>
          <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
            {(["register", "required"] as const).map(t => (
              <button
                key={t}
                onClick={() => setPageTab(t)}
                style={{
                  padding: "0.45rem 1rem", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500,
                  background: pageTab === t ? "#166534" : "#fff",
                  color: pageTab === t ? "#fff" : "#374151",
                  borderRight: t === "register" ? "1px solid #e5e7eb" : "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {t === "register" ? "Document Register" : `Required Documents (${checklistComplete}/${RT_REQUIRED_DOCS.length})`}
              </button>
            ))}
          </div>
        </div>

        {pageTab === "required" && (
          <div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle size={16} color="#16a34a" />
              <span style={{ fontSize: "0.875rem", color: "#166534" }}>
                <strong>{checklistComplete}</strong> of <strong>{RT_FULL.length}</strong> Red Tractor required documents present and valid.
                {checklistComplete < RT_FULL.length && <span style={{ color: "#92400e", marginLeft: 8 }}>&#9888; {RT_FULL.length - checklistComplete} missing or expired — action required before your next audit.</span>}
              </span>
            </div>
            {Object.entries(rtByCategory).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.625rem" }}>{cat}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                  {items.map(item => {
                    const matchingDocs = docs.filter((d: any) => d.documentType === item.key);
                    const validDoc = matchingDocs.find((d: any) => getExpiryStatus(d.expiryDate) !== "expired");
                    const expiredDoc = !validDoc && matchingDocs.find((d: any) => getExpiryStatus(d.expiryDate) === "expired");
                    const itemStatus = validDoc ? getExpiryStatus(validDoc.expiryDate) : expiredDoc ? "expired" : "missing";
                    const SC: Record<string, { bg: string; border: string; dot: string; label: string; labelColor: string }> = {
                      valid: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", label: "Present", labelColor: "#166534" },
                      expiring: { bg: "#fffbeb", border: "#fcd34d", dot: "#d97706", label: "Expiring Soon", labelColor: "#92400e" },
                      expired: { bg: "#fef2f2", border: "#fca5a5", dot: "#dc2626", label: "Expired", labelColor: "#991b1b" },
                      none: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", label: "Present", labelColor: "#166534" },
                      missing: { bg: "#f9fafb", border: "#e5e7eb", dot: "#d1d5db", label: "Missing", labelColor: "#9ca3af" },
                    };
                    const sc = SC[itemStatus];
                    return (
                      <div key={item.key} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot, flexShrink: 0, marginTop: 4 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.4 }}>{item.label}</p>
                            {item.note && <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: "2px 0 0" }}>{item.note}</p>}
                          </div>
                          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: sc.labelColor, flexShrink: 0, background: "#fff", padding: "2px 7px", borderRadius: 5, border: `1px solid ${sc.border}` }}>{sc.label}</span>
                        </div>
                        {validDoc && (
                          <div style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", gap: 12, paddingLeft: 16, flexWrap: "wrap" }}>
                            <span>{validDoc.title}</span>
                            {validDoc.expiryDate && <span>Expires: <strong style={{ color: itemStatus === "expiring" ? "#92400e" : "#374151" }}>{fmt(validDoc.expiryDate)}</strong></span>}
                            {validDoc.referenceNumber && <span style={{ fontFamily: "monospace" }}>#{validDoc.referenceNumber}</span>}
                          </div>
                        )}
                        {expiredDoc && (
                          <div style={{ fontSize: "0.75rem", color: "#991b1b", paddingLeft: 16 }}>
                            Expired {fmt((expiredDoc as any).expiryDate)} — renew immediately
                          </div>
                        )}
                        {itemStatus === "missing" && (
                          <button
                            onClick={() => { setForm((f: any) => ({ ...f, documentType: item.key })); setAddOpen(true); }}
                            style={{ alignSelf: "flex-start", marginLeft: 16, background: "none", border: "1px solid #d1d5db", borderRadius: 5, padding: "3px 10px", fontSize: "0.75rem", cursor: "pointer", color: "#374151" }}
                          >
                            + Add Document
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {pageTab === "register" && (expired > 0 || expiringSoon > 0) && (
          <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
            {expired > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "#991b1b" }}>
                <AlertTriangle size={15} /><strong>{expired}</strong> expired document{expired !== 1 ? "s" : ""} — requires immediate attention
              </div>
            )}
            {expiringSoon > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "#92400e" }}>
                <Clock size={15} /><strong>{expiringSoon}</strong> document{expiringSoon !== 1 ? "s" : ""} expiring within 90 days
              </div>
            )}
          </div>
        )}

        {pageTab === "register" && (<>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: "1.5rem", alignItems: "start" }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <button
              onClick={() => setShowChecklist(v => !v)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#f0fdf4", border: "none", borderBottom: "1px solid #e5e7eb", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckSquare size={15} color="#166534" />
                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#166534" }}>Red Tractor Required Documents</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.8rem", color: checklistComplete === RT_REQUIRED_DOCS.length ? "#166534" : "#6b7280", fontWeight: 500 }}>
                  {checklistComplete}/{RT_REQUIRED_DOCS.length}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{showChecklist ? "▲" : "▼"}</span>
              </div>
            </button>
            {showChecklist && (
              <div style={{ padding: "0.75rem 1rem" }}>
                {checklistPresent.map(item => (
                  <div key={item.key} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "0.5rem" }}>
                    {item.present
                      ? <CheckSquare size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                      : <Square size={14} color="#d1d5db" style={{ flexShrink: 0, marginTop: 1 }} />
                    }
                    <span style={{ fontSize: "0.8rem", color: item.present ? "#374151" : "#9ca3af", lineHeight: 1.4 }}>{item.label}</span>
                  </div>
                ))}
                {checklistComplete === RT_REQUIRED_DOCS.length && (
                  <div style={{ marginTop: "0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#166534", fontWeight: 500 }}>
                    All required documents present
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <StatCard icon={<FileText size={18} color="#1d4ed8" />} label="Total Documents" value={docs.length} bg="#eff6ff" iconBg="#dbeafe" />
            <StatCard
              icon={<CheckCircle size={18} color="#166534" />}
              label="Valid / No Expiry"
              value={docs.filter(d => { const s = getExpiryStatus(d.expiryDate); return s === "valid" || s === "none"; }).length}
              bg="#f0fdf4" iconBg="#dcfce7"
            />
            <StatCard
              icon={<AlertTriangle size={18} color="#991b1b" />}
              label="Expired or Expiring"
              value={expired + expiringSoon}
              bg={expired + expiringSoon > 0 ? "#fef2f2" : "#f9fafb"}
              iconBg={expired + expiringSoon > 0 ? "#fee2e2" : "#f3f4f6"}
              active={statusFilter === "attention"}
              onClick={expired + expiringSoon > 0 ? () => setStatusFilter(s => s === "attention" ? "all" : "attention") : undefined}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setTypeFilter("all"); }}>
            <SelectTrigger style={{ width: 200 }}><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DOC_CATEGORIES.map(c => <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger style={{ width: 220 }}><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(categoryFilter !== "all" ? DOC_CATEGORIES.find(c => c.category === categoryFilter)?.types ?? [] : ALL_DOC_TYPES).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger style={{ width: 175 }}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="attention">Expired or Expiring</SelectItem>
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
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
            <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}>
              <FileText size={28} color="#9ca3af" />
            </div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
              {docs.length === 0 ? "No documents on record" : "No documents match your filters"}
            </p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400, marginBottom: "1.25rem" }}>
              {docs.length === 0
                ? "Record your farm's key documents — assurance certificates, spray operator certificates, FACTS qualifications, calibration records and more."
                : "Try changing your search or filters."}
            </p>
            {docs.length === 0 && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus size={14} className="mr-1" />Add First Document
              </Button>
            )}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Title", "Type", "Reference No.", "Issued By", "Issue Date", "Expiry", "Status", "Logged By", "File", ""].map((h, i) => (
                    <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc: any, i: number) => {
                  const status = getExpiryStatus(doc.expiryDate);
                  const viewUrl = doc.filePath ? `/api/storage${doc.filePath}` : null;
                  return (
                    <tr key={doc.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500, maxWidth: 220 }}>
                        <div>
                          <div>{doc.title}</div>
                          {doc.notes && (
                            <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>
                              {doc.notes.substring(0, 60)}{doc.notes.length > 60 ? "…" : ""}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem" }}>
                        {doc.documentType ? <DocTypeBadge type={doc.documentType} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontFamily: doc.referenceNumber ? "monospace" : "inherit" }}>
                        {doc.referenceNumber || "—"}
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{doc.issuedBy || "—"}</td>
                      <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(doc.issueDate) || "—"}</td>
                      <td style={{ padding: "0.625rem 0.75rem", whiteSpace: "nowrap" }}>
                        {doc.expiryDate ? (
                          <span style={{ color: status === "expired" ? "#991b1b" : status === "expiring" ? "#92400e" : "#166534", fontWeight: 500 }}>
                            {fmt(doc.expiryDate)}
                          </span>
                        ) : <span style={{ color: "#d1d5db" }}>No expiry</span>}
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem" }}><ExpiryBadge status={status} /></td>
                      <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{doc.uploadedBy || "—"}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        {viewUrl ? (
                          <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View${doc.fileSize ? ` · ${fileSizeLabel(doc.fileSize)}` : ""}`}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "3px 8px", borderRadius: 5,
                              background: "#eff6ff", color: "#1d4ed8",
                              fontSize: "0.75rem", fontWeight: 500,
                              textDecoration: "none", border: "1px solid #bfdbfe",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Eye size={11} />
                            View
                          </a>
                        ) : (
                          <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        <button
                          onClick={() => setDeleteId(doc.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        </>)}

        {/* ── Add Document Dialog ─────────────────────────────── */}
        <Dialog open={addOpen} onOpenChange={closeAddDialog}>
          <DialogContent style={{ maxWidth: 580 }}>
            <DialogHeader><DialogTitle>Add Document Record</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Document Title <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input
                  placeholder="e.g. Red Tractor Combinable Crops Certificate 2025"
                  value={form.title}
                  onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Document Type</Label>
                  <Select value={form.documentType} onValueChange={onDocTypeSelect}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                      {DOC_CATEGORIES.map(cat => (
                        <React.Fragment key={cat.category}>
                          <div style={{ padding: "4px 8px 2px", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {cat.category}
                          </div>
                          {cat.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reference / Certificate No.</Label>
                  <Input
                    placeholder="e.g. RT-2025-001234"
                    value={form.referenceNumber}
                    onChange={e => setForm((f: any) => ({ ...f, referenceNumber: e.target.value }))}
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              </div>
              <div>
                <Label>Issued By</Label>
                <Input
                  placeholder="e.g. Red Tractor Assurance, BASIS Registration Ltd"
                  value={form.issuedBy}
                  onChange={e => setForm((f: any) => ({ ...f, issuedBy: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Issue Date</Label>
                  <Input type="date" value={form.issueDate} onChange={e => setForm((f: any) => ({ ...f, issueDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={form.expiryDate} onChange={e => setForm((f: any) => ({ ...f, expiryDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Logged By</Label>
                <Input
                  placeholder="Name of person adding this record"
                  value={form.uploadedBy}
                  onChange={e => setForm((f: any) => ({ ...f, uploadedBy: e.target.value }))}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Location of physical copy, renewal reminders, etc."
                  value={form.notes}
                  onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* ── File Attachment ── */}
              <div>
                <Label style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <Paperclip size={13} />
                  Attach a Copy <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: "0.75rem" }}>(optional — PDF, image, or Word document)</span>
                </Label>

                {!pendingFileName && !form.filePath ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "100%", padding: "0.75rem 1rem",
                      border: "1.5px dashed #d1d5db", borderRadius: 8,
                      background: "#f9fafb", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      color: "#6b7280", fontSize: "0.875rem",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db"; (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                  >
                    <Upload size={15} />
                    Click to attach a file
                  </button>
                ) : isUploading ? (
                  <div style={{ border: "1px solid #bfdbfe", borderRadius: 8, background: "#eff6ff", padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Loader2 size={14} style={{ color: "#2563eb", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "0.8125rem", color: "#1d4ed8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingFileName}</span>
                    </div>
                    <div style={{ height: 4, background: "#dbeafe", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#2563eb", width: `${progress}%`, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 4 }}>Uploading… {progress}%</p>
                  </div>
                ) : form.filePath ? (
                  <div style={{ border: "1px solid #bbf7d0", borderRadius: 8, background: "#f0fdf4", padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: 8 }}>
                    {fileIcon(form.mimeType)}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#166534", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pendingFileName ?? "File attached"}
                      </p>
                      {form.fileSize > 0 && (
                        <p style={{ fontSize: "0.7rem", color: "#4ade80" }}>{fileSizeLabel(form.fileSize)} — ready to save</p>
                      )}
                    </div>
                    <a
                      href={`/api/storage${form.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Preview in new tab"
                      style={{ color: "#16a34a", display: "flex" }}
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={clearFile}
                      title="Remove file"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 2 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => closeAddDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!canSave}>
                {createMut.isPending ? <><Loader2 size={14} className="mr-1 animate-spin" />Saving…</> : isUploading ? <><Loader2 size={14} className="mr-1 animate-spin" />Uploading…</> : "Save Document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm Dialog ───────────────────────────── */}
        <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent style={{ maxWidth: 400 }}>
            <DialogHeader><DialogTitle>Delete Document Record</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">This will remove this document from your register. This cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
