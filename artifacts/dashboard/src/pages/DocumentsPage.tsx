import React, { useState, useMemo } from "react";
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
import { Plus, Search, Trash2, FileText, AlertTriangle, CheckCircle, Clock, CheckSquare, Square } from "lucide-react";

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
    types: [
      "Other",
    ],
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

function StatCard({ icon, label, value, bg, iconBg }: any) {
  return (
    <div style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ background: iconBg, borderRadius: 8, padding: 8 }}>{icon}</div>
      <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>{label}</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{value}</p></div>
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

  const emptyForm = { title: "", documentType: "", referenceNumber: "", issuedBy: "", issueDate: "", expiryDate: "", uploadedBy: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const docsQ = useQuery({ queryKey: ["documents", farmId], queryFn: () => fetch(`/api/farms/${farmId}/documents`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const docs: any[] = docsQ.data ?? [];

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Document recorded" }); qc.invalidateQueries({ queryKey: ["documents", farmId] }); setAddOpen(false); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Document deleted" }); qc.invalidateQueries({ queryKey: ["documents", farmId] }); setDeleteId(null); },
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
        if (statusFilter === "expired" && s !== "expired") return false;
        if (statusFilter === "expiring" && s !== "expiring") return false;
        if (statusFilter === "valid" && (s !== "valid" && s !== "none")) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return d.title?.toLowerCase().includes(q) || d.issuedBy?.toLowerCase().includes(q) || d.referenceNumber?.toLowerCase().includes(q) || d.documentType?.toLowerCase().includes(q);
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

  const onDocTypeSelect = (v: string) => {
    setForm((f: any) => ({ ...f, documentType: v }));
    const body = DOC_CATEGORIES.find(c => c.types.includes(v));
    const defaultIssuers: Record<string, string> = {
      "Red Tractor Assurance Certificate": "Red Tractor Assurance",
      "Spray Operator Certificate (PA1)": "BASIS Registration Ltd",
      "Spray Operator Certificate (PA2 – Ground)": "BASIS Registration Ltd",
      "Spray Operator Certificate (PA6 – Handheld)": "BASIS Registration Ltd",
      "Sprayer Calibration Certificate (NSTS)": "NSTS Tester",
      "Farm Insurance Certificate": "",
    };
    if (defaultIssuers[v] !== undefined) setForm((f: any) => ({ ...f, documentType: v, issuedBy: f.issuedBy || defaultIssuers[v] }));
  };

  return (
    <AppLayout title="Documents">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Farm document register — certificates, assessments, assurance documents, and compliance records. Red Tractor assessors will request to see these during an audit visit.
        </p>

        {(expired > 0 || expiringSoon > 0) && (
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
            <StatCard icon={<CheckCircle size={18} color="#166534" />} label="Valid / No Expiry" value={docs.filter(d => { const s = getExpiryStatus(d.expiryDate); return s === "valid" || s === "none"; }).length} bg="#f0fdf4" iconBg="#dcfce7" />
            <StatCard icon={<AlertTriangle size={18} color="#991b1b" />} label="Expired or Expiring" value={expired + expiringSoon} bg={expired + expiringSoon > 0 ? "#fef2f2" : "#f9fafb"} iconBg={expired + expiringSoon > 0 ? "#fee2e2" : "#f3f4f6"} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
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
            <SelectTrigger style={{ width: 150 }}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Document</Button>
        </div>

        {docsQ.isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
            <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}><FileText size={28} color="#9ca3af" /></div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>{docs.length === 0 ? "No documents on record" : "No documents match your filters"}</p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400, marginBottom: "1.25rem" }}>
              {docs.length === 0 ? "Record your farm's key documents — assurance certificates, spray operator certificates, FACTS qualifications, calibration records and more." : "Try changing your search or filters."}
            </p>
            {docs.length === 0 && <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} className="mr-1" />Add First Document</Button>}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Title", "Type", "Reference No.", "Issued By", "Issue Date", "Expiry", "Status", "Logged By", ""].map((h, i) => (
                    <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc: any, i: number) => {
                  const status = getExpiryStatus(doc.expiryDate);
                  return (
                    <tr key={doc.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500, maxWidth: 220 }}>
                        <div>
                          <div>{doc.title}</div>
                          {doc.notes && <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>{doc.notes.substring(0, 60)}{doc.notes.length > 60 ? "…" : ""}</div>}
                        </div>
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem" }}>{doc.documentType ? <DocTypeBadge type={doc.documentType} /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                      <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontFamily: doc.referenceNumber ? "monospace" : "inherit" }}>{doc.referenceNumber || "—"}</td>
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
                      <td style={{ padding: "0.5rem" }}>
                        <button onClick={() => setDeleteId(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) setForm(emptyForm); }}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Add Document Record</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Document Title <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="e.g. Red Tractor Combinable Crops Certificate 2025" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Document Type</Label>
                  <Select value={form.documentType} onValueChange={onDocTypeSelect}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                      {DOC_CATEGORIES.map(cat => (
                        <React.Fragment key={cat.category}>
                          <div style={{ padding: "4px 8px 2px", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.category}</div>
                          {cat.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reference / Certificate No.</Label>
                  <Input placeholder="e.g. RT-2025-001234" value={form.referenceNumber} onChange={e => setForm((f: any) => ({ ...f, referenceNumber: e.target.value }))} style={{ fontFamily: "monospace" }} />
                </div>
              </div>
              <div>
                <Label>Issued By</Label>
                <Input placeholder="e.g. Red Tractor Assurance, BASIS Registration Ltd" value={form.issuedBy} onChange={e => setForm((f: any) => ({ ...f, issuedBy: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Issue Date</Label><Input type="date" value={form.issueDate} onChange={e => setForm((f: any) => ({ ...f, issueDate: e.target.value }))} /></div>
                <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={e => setForm((f: any) => ({ ...f, expiryDate: e.target.value }))} /></div>
              </div>
              <div>
                <Label>Logged By</Label>
                <Input placeholder="Name of person adding this record" value={form.uploadedBy} onChange={e => setForm((f: any) => ({ ...f, uploadedBy: e.target.value }))} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Location of physical copy, renewal reminders, etc." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={() => createMut.mutate(form)} disabled={!form.title || createMut.isPending}>Save Document</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
