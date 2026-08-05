import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useUpload } from "@workspace/object-storage-web";
import { Plus, AlertTriangle, ShieldCheck, Trash2, Pencil, FileText, Upload, Loader2, X, ExternalLink, Info, Eye, Printer, ClipboardList, RefreshCw, Shield, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { printProReport } from "@/lib/print-report";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";

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
  { value: "other", label: "Other", critical: false, legalNote: "" },
] as const;

type PolicyTypeValue = typeof POLICY_TYPES[number]["value"];

function policyLabel(value: string) {
  return POLICY_TYPES.find(p => p.value === value)?.label ?? value;
}

function policyIsCritical(value: string) {
  if (!value) return false;
  // Exact match on enum value
  const exact = POLICY_TYPES.find(p => p.value === value);
  if (exact) return exact.critical;
  // Case-insensitive label match
  const lower = value.toLowerCase();
  const byLabel = POLICY_TYPES.find(p => p.label.toLowerCase() === lower);
  if (byLabel) return byLabel.critical;
  // Keyword fallback — catches free-text entries like "Employer Liability Insurance"
  if (lower.includes("employer")) return true;
  if (lower.includes("public liability")) return true;
  return false;
}

interface InsuranceRecord {
  id: number;
  policyType: string;
  insurer: string | null;
  policyNumber: string | null;
  policyholderName: string | null;
  coverLevelPence: number | null;
  startDate: string | null;
  expiryDate: string | null;
  notes: string | null;
  documentPath: string | null;
  documentName: string | null;
  annualPremiumPence: number | null;
  renewalDate: string | null;
  broker: string | null;
  brokerContact: string | null;
  coversThirdPartyGoods: boolean | null;
  coversContractWork: boolean | null;
  coversEmployerLiability: boolean | null;
  lastReviewedDate: string | null;
  supersededByRenewal: boolean | null;
}

function expiryStatus(dateStr: string | null): "expired" | "warning" | "ok" | "none" {
  if (!dateStr) return "none";
  const today = new Date();
  const expiry = new Date(dateStr);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "expired";
  if (diffDays <= 60) return "warning";
  return "ok";
}

function ExpiryBadge({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>—</span>;
  const status = expiryStatus(dateStr);
  const formatted = new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const styles: Record<string, React.CSSProperties> = {
    expired: { background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: 5, fontSize: "0.78rem", fontWeight: 600 },
    warning: { background: "#fef9c3", color: "#854d0e", padding: "2px 8px", borderRadius: 5, fontSize: "0.78rem", fontWeight: 600 },
    ok: { background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 5, fontSize: "0.78rem", fontWeight: 600 },
  };
  return <span style={styles[status]}>{formatted}</span>;
}

function formatCover(pence: number | null) {
  if (!pence) return "—";
  const millions = pence / 100_000_000;
  if (millions >= 1) return `£${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`;
  const thousands = pence / 100_000;
  if (thousands >= 1) return `£${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

function DocCell({ record, farmId, onRefresh }: { record: InsuranceRecord; farmId: number; onRefresh: () => void }) {
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const fileName = response.objectPath.split("/").pop() ?? "document";
      await fetch(`/api/farms/${farmId}/insurance/${record.id}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: fileName }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      onRefresh();
    },
  });

  const removeDoc = async () => {
    await fetch(`/api/farms/${farmId}/insurance/${record.id}/document`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    onRefresh();
  };

  if (record.documentPath) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <a href={`/api/storage${record.documentPath}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#2563eb", textDecoration: "none" }}>
          <ExternalLink style={{ width: 12, height: 12 }} />
          View
        </a>
        <button onClick={removeDoc} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#d1d5db" }} title="Remove">
          <X style={{ width: 12, height: 12 }} />
        </button>
      </div>
    );
  }

  return (
    <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} disabled={isUploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#6b7280", padding: "2px 8px", border: "1px dashed #d1d5db", borderRadius: 5, background: "#fafafa" }}>
        {isUploading ? <><Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> {progress}%</> : <><Upload style={{ width: 11, height: 11 }} /> Attach</>}
      </span>
    </label>
  );
}

const emptyForm = { policyType: "employers_liability" as PolicyTypeValue, insurer: "", policyNumber: "", policyholderName: "", coverLevelMillion: "", startDate: "", expiryDate: "", notes: "", annualPremium: "", renewalDate: "", broker: "", brokerContact: "", coversThirdPartyGoods: false, coversContractWork: false, coversEmployerLiability: false, lastReviewedDate: "" };

function InsuranceDialog({ open, onClose, initial, farmId, onSaved, renewalOfId }: { open: boolean; onClose: () => void; initial: InsuranceRecord | null; farmId: number; onSaved: () => void; renewalOfId?: number }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => initial ? {
    policyType: initial.policyType as PolicyTypeValue,
    insurer: initial.insurer ?? "",
    policyNumber: initial.policyNumber ?? "",
    policyholderName: initial.policyholderName ?? "",
    coverLevelMillion: initial.coverLevelPence ? String(initial.coverLevelPence / 100_000_000) : "",
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
    lastReviewedDate: initial.lastReviewedDate ?? "",
  } : emptyForm);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        policyType: form.policyType,
        insurer: form.insurer || null,
        policyNumber: form.policyNumber || null,
        policyholderName: form.policyholderName || null,
        coverLevelPence: form.coverLevelMillion ? Math.round(parseFloat(form.coverLevelMillion) * 100_000_000) : null,
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
        lastReviewedDate: form.lastReviewedDate || null,
      };
      const url = renewalOfId
        ? `/api/farms/${farmId}/insurance/${renewalOfId}/renew`
        : initial ? `/api/farms/${farmId}/insurance/${initial.id}` : `/api/farms/${farmId}/insurance`;
      const method = (renewalOfId || !initial) ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      return res.json() as Promise<{ id: number }>;
    },
    onSuccess: async (record) => {
      if (pendingFile) {
        setUploading(true);
        try {
          const urlRes = await fetch("/api/storage/uploads/request-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: pendingFile.type }),
          });
          if (!urlRes.ok) throw new Error("Could not get upload URL");
          const { uploadURL, objectPath } = await urlRes.json();
          await fetch(uploadURL, { method: "PUT", body: pendingFile, headers: { "Content-Type": pendingFile.type } }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
          const fileName = objectPath.split("/").pop() ?? pendingFile.name;
          await fetch(`/api/farms/${farmId}/insurance/${record.id}/document`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentPath: objectPath, documentName: fileName }),
          }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
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
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const selectedType = POLICY_TYPES.find(p => p.value === form.policyType);
  const isBusy = saveMut.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); saveMut.reset(); } }}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader>
          <DialogTitle>{renewalOfId ? "Renew Insurance Policy" : initial ? "Edit Insurance Policy" : "Add Insurance Policy"}</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Policy Type *</label>
            <select value={form.policyType} onChange={e => set("policyType", e.target.value)} style={selectStyle}>
              {POLICY_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}{p.critical ? " ★" : ""}</option>)}
            </select>
            {selectedType?.legalNote && (
              <p style={{ marginTop: 4, fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "flex-start", gap: 4 }}>
                <Info style={{ width: 12, height: 12, marginTop: 1, flexShrink: 0, color: "#2563eb" }} />
                {selectedType.legalNote}
              </p>
            )}
          </div>
          <div>
            <label style={labelStyle}>Insurer / Underwriter</label>
            <Input value={form.insurer} onChange={e => set("insurer", e.target.value)} placeholder="e.g. NFU Mutual" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Policy Number</label>
              <Input value={form.policyNumber} onChange={e => set("policyNumber", e.target.value)} placeholder="e.g. EL-00123456" />
            </div>
            <div>
              <label style={labelStyle}>Cover Level (£ millions)</label>
              <Input type="number" min="0" step="0.5" value={form.coverLevelMillion} onChange={e => set("coverLevelMillion", e.target.value)} placeholder="e.g. 10" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Policyholder Name</label>
            <Input value={form.policyholderName} onChange={e => set("policyholderName", e.target.value)} placeholder="Name as shown on the certificate" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Expiry Date</label>
              <Input type="date" value={form.expiryDate} onChange={e => set("expiryDate", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Annual Premium (£)</label>
              <Input type="number" min="0" step="0.01" value={form.annualPremium} onChange={e => set("annualPremium", e.target.value)} placeholder="e.g. 4250.00" />
            </div>
            <div>
              <label style={labelStyle}>Renewal Date</label>
              <Input type="date" value={form.renewalDate} onChange={e => set("renewalDate", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Broker / Agent</label>
              <Input value={form.broker} onChange={e => set("broker", e.target.value)} placeholder="e.g. Lycetts Farm Insurance" />
            </div>
            <div>
              <label style={labelStyle}>Broker Contact</label>
              <Input value={form.brokerContact} onChange={e => set("brokerContact", e.target.value)} placeholder="Name / phone / email" />
            </div>
          </div>
          <div>
            <label style={{ ...labelStyle, marginBottom: 6 }}>Coverage Flags</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { key: "coversThirdPartyGoods", label: "Covers third-party goods in custody" },
                { key: "coversContractWork", label: "Covers contract work on third-party land" },
                { key: "coversEmployerLiability", label: "Includes employer liability cover" },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={(form as Record<string, unknown>)[key] as boolean} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} style={{ width: 15, height: 15, cursor: "pointer" }} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Last Reviewed</label>
              <Input type="date" value={form.lastReviewedDate} onChange={e => set("lastReviewedDate", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Any additional notes..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
            <label style={labelStyle}>Attach Certificate / Schedule (optional)</label>
            {pendingFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <FileText style={{ width: 14, height: 14, color: "#16a34a", flexShrink: 0 }} />
                <span style={{ fontSize: "0.8125rem", color: "#166534", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingFile.name}</span>
                <button onClick={() => setPendingFile(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", display: "flex" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ) : (
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) setPendingFile(f); e.target.value = ""; }}
                />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", padding: "5px 12px", border: "1px dashed #d1d5db", borderRadius: 6, color: "#6b7280", background: "#fafafa" }}>
                  <Upload style={{ width: 13, height: 13 }} /> Choose file (PDF, JPG, PNG)
                </span>
              </label>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="outline" onClick={onClose} disabled={isBusy}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={isBusy || !form.policyType}>
              {uploading ? <><Loader2 style={{ width: 14, height: 14, marginRight: 6, animation: "spin 1s linear infinite" }} />Uploading…</> : saveMut.isPending ? "Saving…" : initial ? "Save Changes" : "Add Policy"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const DOC_TYPES = [
  { value: "certificate", label: "Certificate" },
  { value: "insurance_schedule", label: "Insurance Schedule" },
  { value: "insurance_policy", label: "Insurance Policy" },
  { value: "renewal_invitation", label: "Renewal Invitation" },
  { value: "policy_document", label: "Policy Document" },
  { value: "other", label: "Other" },
] as const;

function docTypeLabel(v: string) {
  return DOC_TYPES.find(d => d.value === v)?.label ?? v;
}

interface InsuranceDocument {
  id: number;
  documentType: string;
  documentPath: string;
  documentName: string;
}

function InsuranceDocs({ farmId, recordId, legacyPath, legacyName }: { farmId: number; recordId: number; legacyPath: string | null; legacyName: string | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [uploadType, setUploadType] = useState("certificate");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery<{ documents: InsuranceDocument[] }>({
    queryKey: ["insurance-docs", farmId, recordId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance/${recordId}/documents`).then(r => r.json()),
    enabled: !!farmId && !!recordId,
  });

  const docs = data?.documents ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["insurance-docs", farmId, recordId] });

  const uploadDoc = async (file: File) => {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Could not get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      const fileName = objectPath.split("/").pop() ?? file.name;
      await fetch(`/api/farms/${farmId}/insurance/${recordId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: uploadType, documentPath: objectPath, documentName: fileName }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      toast({ title: "Document saved" });
      refresh();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (docId: number) => {
    await fetch(`/api/farms/${farmId}/insurance/${recordId}/documents/${docId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    refresh();
  };

  const allDocs: (InsuranceDocument & { isLegacy?: boolean })[] = [
    ...(legacyPath && !docs.some(d => d.documentPath === legacyPath)
      ? [{ id: -1, documentType: "certificate", documentPath: legacyPath, documentName: legacyName ?? "Certificate", isLegacy: true }]
      : []),
    ...docs,
  ];

  return (
    <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14, marginTop: 6 }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: "0 0 10px" }}>Documents</p>
      {isLoading && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af", fontSize: "0.8rem" }}><Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> Loading…</div>}
      {!isLoading && allDocs.length === 0 && (
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: "0 0 10px" }}>No documents attached yet — use the form below to add one.</p>
      )}
      {allDocs.map(d => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, background: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: 6 }}>
          <FileText style={{ width: 14, height: 14, color: "#6b7280", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9ca3af", margin: "0 0 1px" }}>{docTypeLabel(d.documentType)}</p>
            <p style={{ fontSize: "0.8rem", color: "#374151", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.documentName}</p>
          </div>
          <a href={`/api/storage${d.documentPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0, fontWeight: 500 }}>
            <ExternalLink style={{ width: 12, height: 12 }} /> Open
          </a>
          {!d.isLegacy && (
            <button onClick={() => deleteDoc(d.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#d1d5db", flexShrink: 0, display: "flex" }} title="Remove document">
              <X style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
        <select value={uploadType} onChange={e => setUploadType(e.target.value)} style={{ fontSize: "0.78rem", border: "1px solid #e5e7eb", borderRadius: 5, padding: "5px 8px", background: "#fff", color: "#374151", outline: "none" }}>
          {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <label style={{ cursor: uploading ? "default" : "pointer", flex: 1 }}>
          <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) { uploadDoc(f); (e.target as HTMLInputElement).value = ""; } }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem", padding: "5px 12px", border: "1px dashed #d1d5db", borderRadius: 5, color: "#6b7280", background: "#fafafa", cursor: uploading ? "default" : "pointer" }}>
            {uploading ? <><Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> Uploading…</> : <><Upload style={{ width: 11, height: 11 }} /> Choose file (PDF, JPG, PNG)</>}
          </span>
        </label>
      </div>
    </div>
  );
}

interface InsuranceClaim {
  id: number;
  insuranceRecordId: number | null;
  policyType: string | null;
  insurer: string | null;
  incidentDate: string | null;
  reportedDate: string | null;
  claimRef: string | null;
  description: string | null;
  status: string;
  settledAmountPence: number | null;
  notes: string | null;
  createdAt: string;
}

const CLAIM_STATUSES = [
  { value: "draft",               label: "Draft",               bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
  { value: "reported",            label: "Reported",            bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  { value: "acknowledged",        label: "Acknowledged",        bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  { value: "under_investigation", label: "Under Investigation", bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  { value: "settled",             label: "Settled",             bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  { value: "rejected",            label: "Rejected",            bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  { value: "withdrawn",           label: "Withdrawn",           bg: "#fafafa", color: "#9ca3af", border: "#e5e7eb" },
] as const;

function ClaimStatusBadge({ status }: { status: string }) {
  const s = CLAIM_STATUSES.find(c => c.value === status) ?? CLAIM_STATUSES[0];
  return (
    <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

const emptyClaimForm = { insuranceRecordId: "" as string | number, policyType: "", insurer: "", incidentDate: "", reportedDate: "", claimRef: "", description: "", status: "draft", settledAmountPence: "", notes: "" };

function ClaimDialog({ open, onClose, initial, farmId, records, onSaved }: { open: boolean; onClose: () => void; initial: InsuranceClaim | null; farmId: number; records: InsuranceRecord[]; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => initial ? {
    insuranceRecordId: initial.insuranceRecordId ?? ("" as string | number),
    policyType: initial.policyType ?? "",
    insurer: initial.insurer ?? "",
    incidentDate: initial.incidentDate ?? "",
    reportedDate: initial.reportedDate ?? "",
    claimRef: initial.claimRef ?? "",
    description: initial.description ?? "",
    status: initial.status,
    settledAmountPence: initial.settledAmountPence != null ? String(initial.settledAmountPence / 100) : "",
    notes: initial.notes ?? "",
  } : { ...emptyClaimForm });
  const [saving, setSaving] = useState(false);

  const onPolicyChange = (val: string) => {
    const rid = Number(val);
    const rec = records.find(r => r.id === rid);
    setForm(f => ({ ...f, insuranceRecordId: val, policyType: rec?.policyType ?? f.policyType, insurer: rec?.insurer ?? f.insurer }));
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
        notes: form.notes || null,
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

  const inp: React.CSSProperties = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", background: "#fff", outline: "none", boxSizing: "border-box" };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader><DialogTitle>{initial ? "Edit Claim" : "Log Incident / Claim"}</DialogTitle></DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "65vh", overflowY: "auto", paddingRight: 2 }}>
          <div>
            <label style={labelStyle}>Linked Policy <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span></label>
            <select value={String(form.insuranceRecordId)} onChange={e => onPolicyChange(e.target.value)} style={inp}>
              <option value="">— Not linked to a specific policy —</option>
              {records.map(r => (
                <option key={r.id} value={r.id}>{policyLabel(r.policyType)}{r.insurer ? ` — ${r.insurer}` : ""}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Policy Type</label>
              <select value={form.policyType} onChange={e => setForm(f => ({ ...f, policyType: e.target.value }))} style={inp}>
                <option value="">— Select —</option>
                {POLICY_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Insurer</label>
              <input value={form.insurer} onChange={e => setForm(f => ({ ...f, insurer: e.target.value }))} style={inp} placeholder="e.g. NFU Mutual" />
            </div>
            <div>
              <label style={labelStyle}>Incident Date</label>
              <input type="date" value={form.incidentDate} onChange={e => setForm(f => ({ ...f, incidentDate: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={labelStyle}>Date Reported to Insurer</label>
              <input type="date" value={form.reportedDate} onChange={e => setForm(f => ({ ...f, reportedDate: e.target.value }))} style={inp} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Claim Reference <span style={{ fontWeight: 400, color: "#9ca3af" }}>(from insurer)</span></label>
            <input value={form.claimRef} onChange={e => setForm(f => ({ ...f, claimRef: e.target.value }))} style={inp} placeholder="e.g. CLM-2025-001234" />
          </div>
          <div>
            <label style={labelStyle}>Description <span style={{ color: "#dc2626" }}>*</span></label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inp, minHeight: 72, resize: "vertical" }} placeholder="What happened? What was damaged or lost?" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                {CLAIM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Settled Amount (£) <span style={{ fontWeight: 400, color: "#9ca3af" }}>if known</span></label>
              <input type="number" min="0" step="0.01" value={form.settledAmountPence} onChange={e => setForm(f => ({ ...f, settledAmountPence: e.target.value }))} style={inp} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, minHeight: 56, resize: "vertical" }} placeholder="e.g. Assessor appointed, waiting on loss adjuster…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.description?.trim()}>{saving ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite", marginRight: 6 }} /> : null}{initial ? "Save Changes" : "Log Claim"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClaimsSection({ farmId, records }: { farmId: number; records: InsuranceRecord[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClaim, setEditClaim] = useState<InsuranceClaim | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(true);

  const { data, isLoading } = useQuery<{ claims: InsuranceClaim[] }>({
    queryKey: ["insurance-claims", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance-claims`).then(r => r.json()),
    enabled: !!farmId,
  });

  const claims = data?.claims ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["insurance-claims", farmId] });

  const deleteClaim = async () => {
    if (!deleteId) return;
    await fetch(`/api/farms/${farmId}/insurance-claims/${deleteId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    toast({ title: "Claim removed" });
    refresh();
    setDeleteId(null);
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", borderBottom: expanded ? "1px solid #f3f4f6" : "none" }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield style={{ width: 15, height: 15, color: "#6366f1" }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>Incident &amp; Claims Register</span>
          {claims.length > 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", padding: "1px 7px", borderRadius: 10 }}>{claims.length}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {expanded && (
            <button
              onClick={e => { e.stopPropagation(); setEditClaim(null); setDialogOpen(true); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 600, background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}
            >
              <Plus style={{ width: 13, height: 13 }} /> Log Claim
            </button>
          )}
          {expanded ? <ChevronUp style={{ width: 15, height: 15, color: "#9ca3af" }} /> : <ChevronDown style={{ width: 15, height: 15, color: "#9ca3af" }} />}
        </div>
      </div>

      {expanded && (
        <>
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <Loader2 style={{ width: 22, height: 22, animation: "spin 1s linear infinite", color: "#9ca3af" }} />
            </div>
          )}
          {!isLoading && claims.length === 0 && (
            <div style={{ textAlign: "center", padding: "36px 24px" }}>
              <CheckCircle2 style={{ width: 30, height: 30, color: "#d1d5db", margin: "0 auto 10px" }} />
              <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 4px", fontSize: "0.9rem" }}>No claims on record</p>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 14px" }}>Log any incidents or insurance claims here — useful for proving coverage history during audits and policy renewals.</p>
              <button onClick={() => { setEditClaim(null); setDialogOpen(true); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 600, background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>
                <Plus style={{ width: 13, height: 13 }} /> Log first claim
              </button>
            </div>
          )}
          {!isLoading && claims.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Incident Date", "Policy Type", "Insurer", "Claim Ref", "Description", "Status", "Settled", ""].map(h => (
                      <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", whiteSpace: "nowrap", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < claims.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }}>{fmtDate(c.incidentDate)}</td>
                      <td style={{ padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }}>{c.policyType ? policyLabel(c.policyType) : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{c.insurer ?? <span style={{ color: "#d1d5db" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "0.8rem", color: "#374151", whiteSpace: "nowrap" }}>{c.claimRef ?? <span style={{ color: "#d1d5db", fontFamily: "inherit" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", color: "#374151", maxWidth: 220 }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description ?? "—"}</span>
                      </td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}><ClaimStatusBadge status={c.status} /></td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap", color: "#374151" }}>
                        {c.settledAmountPence != null ? `£${(c.settledAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => { setEditClaim(c); setDialogOpen(true); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="Edit"><Pencil style={{ width: 14, height: 14 }} /></button>
                          <button onClick={() => setDeleteId(c.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="Delete"><Trash2 style={{ width: 14, height: 14 }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ClaimDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditClaim(null); }} initial={editClaim} farmId={farmId} records={records} onSaved={refresh} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove this claim?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the claim record. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={deleteClaim} style={{ background: "#dc2626" }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 4 };
const selectStyle: React.CSSProperties = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", background: "#fff", outline: "none" };

const CHART_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#ea580c", "#0284c7"];

function PremiumTrendChart({ records }: { records: InsuranceRecord[] }) {
  const dataRecords = records.filter(r => r.startDate && r.annualPremiumPence);
  if (dataRecords.length < 2) return null;

  const policyTypes = [...new Set(dataRecords.map(r => r.policyType))];
  const policyLabels = policyTypes.map(pt => policyLabel(pt));

  const yearMap = new Map<number, Record<string, number>>();
  for (const r of dataRecords) {
    const year = new Date(r.startDate!).getFullYear();
    if (!yearMap.has(year)) yearMap.set(year, {});
    const label = policyLabel(r.policyType);
    yearMap.get(year)![label] = (yearMap.get(year)![label] || 0) + r.annualPremiumPence! / 100;
  }

  const chartData = Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, data]) => ({ year: String(year), ...data }));

  if (chartData.length < 2) return null;

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px" }}>
      <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>Annual Premium History</h3>
      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0 0 16px" }}>Insurance premiums recorded by policy start year — showing cost trends across all policy types to help identify when to shop around</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis tickFormatter={(v: number) => v >= 1000 ? `£${(v / 1000).toFixed(0)}k` : `£${v}`} tick={{ fontSize: 11, fill: "#6b7280" }} width={52} />
          <Tooltip formatter={(value: number, name: string) => [`£${value.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, name]} />
          <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
          {policyLabels.map((label, i) => (
            <Bar key={label} dataKey={label} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={i === policyLabels.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function InsurancePage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<InsuranceRecord | null>(null);
  const [viewItem, setViewItem] = useState<InsuranceRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showOlder, setShowOlder] = useState(false);
  const [raiseTaskFor, setRaiseTaskFor] = useState<InsuranceRecord | null>(null);
  const [renewRecord, setRenewRecord] = useState<InsuranceRecord | null>(null);
  const openId = (() => { const n = Number(new URLSearchParams(window.location.search).get("open")); return n > 0 ? n : null; })();
  const autoOpened = useRef(false);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());
  const [hlId, setHlId] = useState<number | null>(openId);

  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data, isLoading } = useQuery<{ records: InsuranceRecord[] }>({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const twoYearsCutoff = new Date();
  twoYearsCutoff.setFullYear(twoYearsCutoff.getFullYear() - 2);

  const hiddenRecords = records.filter(r =>
    r.supersededByRenewal || (r.expiryDate && new Date(r.expiryDate) < twoYearsCutoff)
  );
  const olderRecords = hiddenRecords;
  const visibleRecords = showOlder
    ? records
    : records.filter(r => !r.supersededByRenewal && (!r.expiryDate || new Date(r.expiryDate) >= twoYearsCutoff));
  const hiddenCount = hiddenRecords.length;

  useEffect(() => {
    if (!openId || autoOpened.current || records.length === 0) return;
    const target = records.find(r => r.id === openId);
    if (target) {
      autoOpened.current = true;
      if (olderRecords.some(r => r.id === openId)) setShowOlder(true);
      setViewItem(target);
      setTimeout(() => {
        rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = setTimeout(() => setHlId(null), 4000);
        return () => clearTimeout(t);
      }, 200);
    }
  }, [openId, records]);
  const onRefresh = () => qc.invalidateQueries({ queryKey: ["insurance", farmId] });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/insurance/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Policy removed" }); onRefresh(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const activeRecords = records.filter(r => !r.supersededByRenewal);
  const expiredOrWarning = activeRecords.filter(r => ["expired", "warning"].includes(expiryStatus(r.expiryDate)));
  const missingCritical = (["employers_liability", "public_liability"] as PolicyTypeValue[]).filter(pt =>
    !activeRecords.some(r => r.policyType === pt && expiryStatus(r.expiryDate) !== "expired")
  );

  const handlePrint = () => {
    const fName = farmData?.record?.name ?? "Farm";
    const cph = farmData?.record?.cphNumber ?? undefined;

    const statusLabel = (r: InsuranceRecord) => {
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
          ${records.map(r => `
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
      footerNote: "★ Employers Liability (legally required) and Public Liability (Red Tractor: min £5m) are critical policies. " +
        "Attach certificate scans to each record for instant access during assessor visits. Retain for 3 years.",
      landscape: true,
    });
  };

  return (
    <AppLayout title="Insurance Register">
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Alert banners */}
        {missingCritical.map(pt => (
          <div key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8 }}>
            <AlertTriangle style={{ width: 16, height: 16, color: "#b91c1c", marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#b91c1c", margin: 0 }}>
                {policyLabel(pt)} policy missing or expired
              </p>
              <p style={{ fontSize: "0.8rem", color: "#991b1b", margin: "2px 0 0" }}>
                {pt === "employers_liability" ? "This is a legal requirement under the Employers' Liability (Compulsory Insurance) Act 1969." : "Red Tractor requires a minimum £5m public liability policy."}
              </p>
            </div>
          </div>
        ))}

        {expiredOrWarning.filter(r => !missingCritical.includes(r.policyType as PolicyTypeValue)).map(r => {
          const status = expiryStatus(r.expiryDate);
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", background: status === "expired" ? "#fee2e2" : "#fef9c3", border: `1px solid ${status === "expired" ? "#fca5a5" : "#fde047"}`, borderRadius: 8 }}>
              <AlertTriangle style={{ width: 15, height: 15, color: status === "expired" ? "#b91c1c" : "#854d0e", marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: "0.8rem", color: status === "expired" ? "#991b1b" : "#713f12", margin: 0 }}>
                <strong>{policyLabel(r.policyType)}</strong> ({r.insurer ?? "unknown insurer"}) — {status === "expired" ? "expired" : "expires"} {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}.
                {policyIsCritical(r.policyType) && status === "expired" && " Renewal is urgent."}
              </p>
            </div>
          );
        })}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", margin: 0 }}>Farm Insurance Register</h2>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "2px 0 0" }}>
              {visibleRecords.length} {visibleRecords.length === 1 ? "policy" : "policies"} shown{hiddenCount > 0 && !showOlder ? ` — ${hiddenCount} older record${hiddenCount === 1 ? "" : "s"} hidden` : ""} — attach certificate scans for instant access during inspections
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" onClick={handlePrint} disabled={records.length === 0} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Printer style={{ width: 14, height: 14 }} /> Print Register
            </Button>
            <Button onClick={() => setAddOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus style={{ width: 15, height: 15 }} /> Add Policy
            </Button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite", color: "#9ca3af" }} />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#fafafa", border: "1px dashed #e5e7eb", borderRadius: 10 }}>
            <ShieldCheck style={{ width: 36, height: 36, color: "#d1d5db", margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>No insurance policies recorded yet</p>
            <p style={{ fontSize: "0.83rem", color: "#6b7280", margin: 0 }}>Add your Employers Liability and Public Liability policies first — these are checked by Red Tractor assessors</p>
          </div>
        ) : (
          <>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Policy Type", "Insurer", "Policy No.", "Policyholder", "Cover", "Premium p.a.", "Start", "Expiry", "Certificate", ""].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.73rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((r, i) => {
                    const status = expiryStatus(r.expiryDate);
                    const isCrit = policyIsCritical(r.policyType);
                    return (
                      <tr key={r.id} ref={(el) => { if (el) rowRefs.current.set(r.id, el as HTMLElement); }} style={{ borderBottom: i < visibleRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: hlId === r.id ? "#fffbeb" : status === "expired" ? "#fff5f5" : "transparent", outline: hlId === r.id ? "2px solid #f59e0b" : "none", outlineOffset: -2, transition: "background 0.5s, outline 0.5s" }}>
                        <td style={{ padding: "11px 14px", minWidth: 170 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isCrit ? 3 : 0 }}>
                            {isCrit && <span style={{ width: 7, height: 7, borderRadius: "50%", background: status === "ok" ? "#22c55e" : status === "warning" ? "#eab308" : "#ef4444", flexShrink: 0 }} />}
                            <span style={{ fontWeight: 600, color: "#111827" }}>{policyLabel(r.policyType)}</span>
                          </div>
                          {isCrit && (
                            <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 9px", borderRadius: 20 }}>
                              Required
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "11px 14px", color: "#374151" }}>{r.insurer ?? <span style={{ color: "#d1d5db" }}>—</span>}</td>
                        <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "#374151", fontSize: "0.82rem" }}>{r.policyNumber ?? <span style={{ color: "#d1d5db", fontFamily: "inherit" }}>—</span>}</td>
                        <td style={{ padding: "11px 14px", color: "#374151" }}>{r.policyholderName ?? <span style={{ color: "#d1d5db" }}>—</span>}</td>
                        <td style={{ padding: "11px 14px", color: "#374151", whiteSpace: "nowrap" }}>{formatCover(r.coverLevelPence)}</td>
                        <td style={{ padding: "11px 14px", color: "#374151", whiteSpace: "nowrap" }}>
                          {r.annualPremiumPence ? `£${(r.annualPremiumPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : <span style={{ color: "#d1d5db" }}>—</span>}
                        </td>
                        <td style={{ padding: "11px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>{r.startDate ? new Date(r.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                        <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}><ExpiryBadge dateStr={r.expiryDate} /></td>
                        <td style={{ padding: "11px 14px" }}>
                          <button onClick={() => setViewItem(r)} style={{ background: "none", border: "1px dashed #d1d5db", cursor: "pointer", padding: "2px 8px", borderRadius: 5, display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#6b7280" }} title="Manage documents">
                            <FileText style={{ width: 11, height: 11 }} /> Docs
                          </button>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => setViewItem(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="View">
                              <Eye style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => setEditItem(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="Edit">
                              <Pencil style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => setRenewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6366f1", borderRadius: 4 }} title="Renew Policy">
                              <RefreshCw style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="Delete">
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                            {(status === "expired" || status === "warning") && (
                              <button onClick={() => setRaiseTaskFor(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#f59e0b", borderRadius: 4 }} title="Raise Task">
                                <ClipboardList style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {hiddenCount > 0 && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setShowOlder(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#6b7280", padding: "6px 12px", borderRadius: 6, textDecoration: "underline" }}
                >
                  {showOlder ? `Hide archived records` : `Show ${hiddenCount} archived record${hiddenCount === 1 ? "" : "s"} (renewed or expired more than 2 years ago)`}
                </button>
              </div>
            )}
          </>
        )}

        <PremiumTrendChart records={records} />

        <ClaimsSection farmId={farmId!} records={records} />

        {/* Info note */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8 }}>
          <Info style={{ width: 14, height: 14, color: "#2563eb", marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: "0.78rem", color: "#1e40af", margin: 0 }}>
            Red Tractor assessors check Employers Liability and Public Liability certificates during inspections. Attaching a scan of each certificate means you can present it instantly on-screen. Policies marked <strong>Required</strong> must be current at all times.
          </p>
        </div>
      </div>

      {/* View dialog */}
      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent style={{ maxWidth: 580 }}>
            <DialogHeader>
              <DialogTitle>
                {policyLabel(viewItem.policyType)}
                {policyIsCritical(viewItem.policyType) && (
                  <span style={{ marginLeft: 8, fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 6px", borderRadius: 4, verticalAlign: "middle" }}>Required</span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div style={{ overflowY: "auto", maxHeight: "70vh", paddingRight: 2 }}>
              <div className="space-y-3 text-sm py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Insurer</p><p>{viewItem.insurer || "—"}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Policy Number</p><p className="font-mono text-xs">{viewItem.policyNumber || "—"}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Policyholder</p><p>{viewItem.policyholderName || "—"}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Cover Level</p><p>{formatCover(viewItem.coverLevelPence)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Annual Premium</p><p>{viewItem.annualPremiumPence ? `£${(viewItem.annualPremiumPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Broker</p><p>{viewItem.broker || "—"}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Start Date</p><p>{viewItem.startDate ? new Date(viewItem.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Expiry Date</p><ExpiryBadge dateStr={viewItem.expiryDate} /></div>
                </div>
                {viewItem.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewItem.notes}</p></div>}
                <InsuranceDocs
                  farmId={farmId!}
                  recordId={viewItem.id}
                  legacyPath={viewItem.documentPath}
                  legacyName={viewItem.documentName}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditItem(viewItem); setViewItem(null); }}><Pencil size={14} className="mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <RaiseTaskDialog
        farmId={farmId!}
        open={!!raiseTaskFor}
        onClose={() => setRaiseTaskFor(null)}
        defaultTitle={raiseTaskFor ? `Insurance Renewal — ${policyLabel(raiseTaskFor.policyType)}${raiseTaskFor.insurer ? ` (${raiseTaskFor.insurer})` : ""}` : ""}
        defaultDescription={raiseTaskFor?.expiryDate ? `Policy expires ${new Date(raiseTaskFor.expiryDate).toLocaleDateString("en-GB")}. Arrange renewal and update certificate.` : ""}
        module="insurance"
      />

      <InsuranceDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        initial={null}
        farmId={farmId!}
        onSaved={onRefresh}
      />

      {renewRecord && (
        <InsuranceDialog
          open={!!renewRecord}
          onClose={() => setRenewRecord(null)}
          initial={{
            ...renewRecord,
            startDate: null,
            expiryDate: null,
            renewalDate: null,
            policyNumber: null,
            annualPremiumPence: null,
            notes: null,
            documentPath: null,
            documentName: null,
          }}
          farmId={farmId!}
          onSaved={() => { setRenewRecord(null); onRefresh(); }}
          renewalOfId={renewRecord.id}
        />
      )}

      {editItem && (
        <InsuranceDialog
          open={!!editItem}
          onClose={() => setEditItem(null)}
          initial={editItem}
          farmId={farmId!}
          onSaved={onRefresh}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this policy?</AlertDialogTitle>
            <AlertDialogDescription>The record and any attached certificate will be removed from the register.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
