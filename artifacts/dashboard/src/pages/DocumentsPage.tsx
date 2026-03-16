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
import { Plus, Search, Trash2, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const DOC_TYPES = [
  "Red Tractor Assurance Certificate",
  "Spray Operator Certificate (PA1/PA6)",
  "FACTS / BASIS Certificate",
  "Soil Analysis Report",
  "NMP Document",
  "Equipment Calibration Certificate",
  "COSHH Assessment",
  "Risk Assessment",
  "Training Certificate",
  "Insurance Certificate",
  "Farm Business Tenancy / Ownership",
  "Environmental Stewardship Agreement",
  "Pesticide Invoice",
  "Veterinary Prescription",
  "Other",
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

export default function DocumentsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
      if (typeFilter !== "all" && d.documentType !== typeFilter) return false;
      if (statusFilter !== "all") {
        const s = getExpiryStatus(d.expiryDate);
        if (statusFilter === "expired" && s !== "expired") return false;
        if (statusFilter === "expiring" && s !== "expiring") return false;
        if (statusFilter === "valid" && (s !== "valid" && s !== "none")) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return d.title?.toLowerCase().includes(s) || d.issuedBy?.toLowerCase().includes(s) || d.referenceNumber?.toLowerCase().includes(s) || d.documentType?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [docs, search, typeFilter, statusFilter]);

  const expired = docs.filter(d => getExpiryStatus(d.expiryDate) === "expired").length;
  const expiringSoon = docs.filter(d => getExpiryStatus(d.expiryDate) === "expiring").length;

  return (
    <AppLayout title="Documents">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
          <StatCard icon={<FileText size={18} color="#1d4ed8" />} label="Total Documents" value={docs.length} bg="#eff6ff" iconBg="#dbeafe" />
          <StatCard icon={<CheckCircle size={18} color="#166534" />} label="Valid / No Expiry" value={docs.filter(d => { const s = getExpiryStatus(d.expiryDate); return s === "valid" || s === "none"; }).length} bg="#f0fdf4" iconBg="#dcfce7" />
          <StatCard icon={<AlertTriangle size={18} color="#991b1b" />} label="Expired or Expiring" value={expired + expiringSoon} bg={expired + expiringSoon > 0 ? "#fef2f2" : "#f9fafb"} iconBg={expired + expiringSoon > 0 ? "#fee2e2" : "#f3f4f6"} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger style={{ width: 220 }}><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                      <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500, maxWidth: 200 }}>
                        <div>{doc.title}</div>
                        {doc.notes && <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>{doc.notes.substring(0, 60)}{doc.notes.length > 60 ? "…" : ""}</div>}
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
          <DialogContent style={{ maxWidth: 540 }}>
            <DialogHeader><DialogTitle>Add Document Record</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Document Title <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="e.g. Red Tractor Combinable Crops Certificate 2025" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Document Type</Label>
                  <Select value={form.documentType} onValueChange={v => setForm((f: any) => ({ ...f, documentType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reference / Certificate No.</Label>
                  <Input placeholder="e.g. RT-2025-001234" value={form.referenceNumber} onChange={e => setForm((f: any) => ({ ...f, referenceNumber: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Issued By</Label>
                <Input placeholder="e.g. Red Tractor Assurance, FACTS" value={form.issuedBy} onChange={e => setForm((f: any) => ({ ...f, issuedBy: e.target.value }))} />
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
    "Spray Operator Certificate (PA1/PA6)": { bg: "#dbeafe", color: "#1e40af" },
    "Equipment Calibration Certificate": { bg: "#ede9fe", color: "#5b21b6" },
    "COSHH Assessment": { bg: "#fee2e2", color: "#991b1b" },
    "Risk Assessment": { bg: "#fef3c7", color: "#92400e" },
    "Training Certificate": { bg: "#e0f2fe", color: "#0369a1" },
    "Insurance Certificate": { bg: "#f0fdf4", color: "#166534" },
  };
  const c = colors[type] || { bg: "#f3f4f6", color: "#374151" };
  return <Badge style={{ background: c.bg, color: c.color, border: "none", fontSize: "0.7rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", display: "block" }} title={type}>{short}</Badge>;
}
