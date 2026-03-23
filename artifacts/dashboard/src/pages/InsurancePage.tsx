import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useUpload } from "@workspace/object-storage-web";
import { Plus, AlertTriangle, ShieldCheck, Trash2, Pencil, FileText, Upload, Loader2, X, ExternalLink, Info } from "lucide-react";

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

const emptyForm = { policyType: "employers_liability" as PolicyTypeValue, insurer: "", policyNumber: "", policyholderName: "", coverLevelMillion: "", startDate: "", expiryDate: "", notes: "" };

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
  } : emptyForm);

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
      };
      const url = initial ? `/api/farms/${farmId}/insurance/${initial.id}` : `/api/farms/${farmId}/insurance`;
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
    },
    onSuccess: () => { toast({ title: initial ? "Policy updated" : "Policy added" }); onSaved(); onClose(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const selectedType = POLICY_TYPES.find(p => p.value === form.policyType);

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
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Any additional notes..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: "0.875rem", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !form.policyType}>
              {saveMut.isPending ? "Saving…" : initial ? "Save Changes" : "Add Policy"}
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
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: InsuranceRecord[] }>({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];
  const onRefresh = () => qc.invalidateQueries({ queryKey: ["insurance", farmId] });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/insurance/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Policy removed" }); onRefresh(); setDeleteId(null); },
  });

  const expiredOrWarning = records.filter(r => ["expired", "warning"].includes(expiryStatus(r.expiryDate)));
  const missingCritical = (["employers_liability", "public_liability"] as PolicyTypeValue[]).filter(pt =>
    !records.some(r => r.policyType === pt && expiryStatus(r.expiryDate) !== "expired")
  );

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
              {records.length} {records.length === 1 ? "policy" : "policies"} on file — attach certificate scans for instant access during inspections
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus style={{ width: 15, height: 15 }} /> Add Policy
          </Button>
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
                {records.map((r, i) => {
                  const status = expiryStatus(r.expiryDate);
                  const isCrit = policyIsCritical(r.policyType);
                  return (
                    <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none", background: status === "expired" ? "#fff5f5" : "transparent" }}>
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {isCrit && <span style={{ width: 6, height: 6, borderRadius: "50%", background: status === "ok" ? "#22c55e" : status === "warning" ? "#eab308" : "#ef4444", flexShrink: 0 }} />}
                          <span style={{ fontWeight: 600, color: "#111827" }}>{policyLabel(r.policyType)}</span>
                        </div>
                        {isCrit && <span style={{ fontSize: "0.68rem", color: "#9ca3af", display: "block" }}>Required</span>}
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
                          <button onClick={() => setEditItem(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="Edit">
                            <Pencil style={{ width: 14, height: 14 }} />
                          </button>
                          <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", borderRadius: 4 }} title="Delete">
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Info note */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8 }}>
          <Info style={{ width: 14, height: 14, color: "#2563eb", marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: "0.78rem", color: "#1e40af", margin: 0 }}>
            Red Tractor assessors check Employers Liability and Public Liability certificates during inspections. Attaching a scan of each certificate means you can present it instantly on-screen. Policies marked <strong>Required</strong> must be current at all times.
          </p>
        </div>
      </div>

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
