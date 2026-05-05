import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useUpload } from "@workspace/object-storage-web";
import { Plus, AlertTriangle, ShieldCheck, Trash2, Pencil, FileText, Upload, Loader2, X, ExternalLink, Info, Eye, Printer, ClipboardList } from "lucide-react";
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
  return POLICY_TYPES.find(p => p.value === value)?.critical ?? false;
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
      });
      onRefresh();
    },
  });

  const removeDoc = async () => {
    await fetch(`/api/farms/${farmId}/insurance/${record.id}/document`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null }),
    });
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

function InsuranceDialog({ open, onClose, initial, farmId, onSaved }: { open: boolean; onClose: () => void; initial: InsuranceRecord | null; farmId: number; onSaved: () => void }) {
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
      const url = initial ? `/api/farms/${farmId}/insurance/${initial.id}` : `/api/farms/${farmId}/insurance`;
      const method = initial ? "PUT" : "POST";
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
          await fetch(uploadURL, { method: "PUT", body: pendingFile, headers: { "Content-Type": pendingFile.type } });
          const fileName = objectPath.split("/").pop() ?? pendingFile.name;
          await fetch(`/api/farms/${farmId}/insurance/${record.id}/document`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentPath: objectPath, documentName: fileName }),
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
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const selectedType = POLICY_TYPES.find(p => p.value === form.policyType);
  const isBusy = saveMut.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Insurance Policy" : "Add Insurance Policy"}</DialogTitle>
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

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 4 };
const selectStyle: React.CSSProperties = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", background: "#fff", outline: "none" };

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

  const olderRecords = records.filter(r => r.expiryDate && new Date(r.expiryDate) < twoYearsCutoff);
  const visibleRecords = showOlder
    ? records
    : records.filter(r => !r.expiryDate || new Date(r.expiryDate) >= twoYearsCutoff);
  const hiddenCount = olderRecords.length;

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
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/insurance/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Policy removed" }); onRefresh(); setDeleteId(null); },
  });

  const expiredOrWarning = records.filter(r => ["expired", "warning"].includes(expiryStatus(r.expiryDate)));
  const missingCritical = (["employers_liability", "public_liability"] as PolicyTypeValue[]).filter(pt =>
    !records.some(r => r.policyType === pt && expiryStatus(r.expiryDate) !== "expired")
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
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Policy Type", "Insurer", "Policy No.", "Policyholder", "Cover", "Start", "Expiry", "Certificate", ""].map(h => (
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
                        <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {isCrit && <span style={{ width: 6, height: 6, borderRadius: "50%", background: status === "ok" ? "#22c55e" : status === "warning" ? "#eab308" : "#ef4444", flexShrink: 0 }} />}
                            <span style={{ fontWeight: 600, color: "#111827" }}>{policyLabel(r.policyType)}</span>
                          </div>
                          {isCrit && <span style={{ display: "inline-block", marginTop: 3, fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "1px 5px", borderRadius: 4 }}>Required</span>}
                        </td>
                        <td style={{ padding: "11px 14px", color: "#374151" }}>{r.insurer ?? <span style={{ color: "#d1d5db" }}>—</span>}</td>
                        <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "#374151", fontSize: "0.82rem" }}>{r.policyNumber ?? <span style={{ color: "#d1d5db", fontFamily: "inherit" }}>—</span>}</td>
                        <td style={{ padding: "11px 14px", color: "#374151" }}>{r.policyholderName ?? <span style={{ color: "#d1d5db" }}>—</span>}</td>
                        <td style={{ padding: "11px 14px", color: "#374151", whiteSpace: "nowrap" }}>{formatCover(r.coverLevelPence)}</td>
                        <td style={{ padding: "11px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>{r.startDate ? new Date(r.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                        <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}><ExpiryBadge dateStr={r.expiryDate} /></td>
                        <td style={{ padding: "11px 14px" }}><DocCell record={r} farmId={farmId!} onRefresh={onRefresh} /></td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => setViewItem(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="View">
                              <Eye style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => setEditItem(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="Edit">
                              <Pencil style={{ width: 14, height: 14 }} />
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
                  {showOlder ? `Hide older records` : `Show ${hiddenCount} older record${hiddenCount === 1 ? "" : "s"} (expired more than 2 years ago)`}
                </button>
              </div>
            )}
          </>
        )}

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
          <DialogContent style={{ maxWidth: 480 }}>
            <DialogHeader><DialogTitle>Insurance Policy</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><p className="text-xs text-gray-500 uppercase font-medium mb-1">Policy Type</p><p className="font-medium">{policyLabel(viewItem.policyType)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Insurer</p><p>{viewItem.insurer || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Policy Number</p><p className="font-mono text-xs">{viewItem.policyNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Policyholder</p><p>{viewItem.policyholderName || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Cover Level</p><p>{formatCover(viewItem.coverLevelPence)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Start Date</p><p>{viewItem.startDate ? new Date(viewItem.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Expiry Date</p><ExpiryBadge dateStr={viewItem.expiryDate} /></div>
              </div>
              {viewItem.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewItem.notes}</p></div>}
              {viewItem.documentPath && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Certificate</p><a href={`/api/storage${viewItem.documentPath}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 text-sm"><FileText size={14} />{viewItem.documentName ?? "View Certificate"}</a></div>}
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
