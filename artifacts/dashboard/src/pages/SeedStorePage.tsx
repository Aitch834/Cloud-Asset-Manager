import React, { useMemo, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCrops } from "@/hooks/use-crops";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// ── Inlined to avoid proxy-cache stale-hash issues in test-dashboard ──────────
function TabBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center w-fit flex-wrap", className)} style={{ gap: 6, padding: 6, background: "rgba(0,0,0,0.07)", borderRadius: 12 }}>
      {children}
    </div>
  );
}
function TabButton({ active, onClick, children, size = "md" }: { active: boolean; onClick: () => void; children: React.ReactNode; size?: "sm" | "md" }) {
  const pad = size === "md" ? "10px 20px" : "6px 16px";
  return (
    <button onClick={onClick} style={{ padding: pad, fontSize: "0.875rem", fontWeight: 600, borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.15s, color 0.15s", background: active ? "#fff" : "transparent", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" : "none", border: "none", color: active ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.6)" }} className={cn("hover:text-foreground", !active && "hover:bg-black/[0.05]")}>
      {children}
    </button>
  );
}
function StaffSelect({ value, onChange, staffNames, loading }: { value: string; onChange: (v: string) => void; staffNames: string[]; loading?: boolean }) {
  if (loading) return <Input value={value} onChange={e => onChange(e.target.value)} placeholder="Loading staff…" disabled />;
  if (staffNames.length === 0) return (
    <div>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder="Type staff member name…" />
      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>No staff registered. <Link href="/staff" style={{ color: "#16a34a", textDecoration: "underline" }}>Add staff members</Link> to enable the lookup.</p>
    </div>
  );
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
      <SelectContent>{staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
    </Select>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  ShoppingCart,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Paperclip,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Printer,
} from "lucide-react";

function printSegregationRegister(checks: any[], farmId: number) {
  const win = window.open("", "_blank");
  if (!win) return;
  const fmtDate = (d: string) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
  };
  const fmtMethod = (m: string) =>
    m === "rigid_barrier" ? "Rigid barrier" :
    m === "distance_3m" ? "3 m distance" :
    m === "separate_store" ? "Separate store" : (m || "—");
  const compliantCount = checks.filter(c => c.isCompliant !== false && !c.treatedSeedStoredLoose).length;
  const rows = checks.map((c, i) => {
    const nonComp = c.isCompliant === false || c.treatedSeedStoredLoose === true;
    return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
      <td>${c.storageLocationName || "—"}</td>
      <td>${fmtDate(c.checkDate)}</td>
      <td>${fmtMethod(c.segregationMethod)}</td>
      <td style="font-weight:600;color:${nonComp ? "#991b1b" : "#166534"}">${nonComp ? "✗ Non-compliant" : "✓ Compliant"}</td>
      <td>${c.treatedSeedStoredLoose ? "Yes ⚠" : "No"}</td>
      <td>${c.checkedBy || "—"}</td>
      <td style="max-width:200px;white-space:pre-wrap">${c.notes || "—"}</td>
    </tr>`;
  }).join("");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Seed Store Segregation Register — Red Tractor CR.ST.19</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:24px;color:#111}
      h1{font-size:15px;margin:0 0 4px}
      .meta{color:#6b7280;font-size:10px;margin:0 0 6px}
      .summary{display:flex;gap:24px;margin-bottom:16px;padding:8px 12px;background:#f3f4f6;border-radius:6px}
      .summary span{font-weight:600}
      table{width:100%;border-collapse:collapse;margin-top:0}
      th{background:#1a3a1a;color:#fff;text-align:left;padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
      td{padding:5px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top}
      @media print{body{margin:12px}button{display:none!important}}
    </style>
  </head><body>
    <h1>Seed Storage Segregation Register — Red Tractor CR.ST.19</h1>
    <p class="meta">Farm ID: ${farmId} &nbsp;·&nbsp; Printed: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
    <div class="summary">
      Total checks: <span>${checks.length}</span>&nbsp;&nbsp;
      Compliant: <span style="color:#166534">${compliantCount}</span>&nbsp;&nbsp;
      Non-compliant: <span style="color:${checks.length - compliantCount > 0 ? "#991b1b" : "#6b7280"}">${checks.length - compliantCount}</span>
    </div>
    <table>
      <thead><tr>
        <th>Storage Location</th><th>Check Date</th><th>Segregation Method</th>
        <th>Compliant?</th><th>Treated Loose?</th><th>Checked By</th><th>Notes</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;font-size:10px;color:#6b7280">Red Tractor Combinable Crops Standard — CR.ST.19: treated seed must be physically separated from stored grain by a rigid barrier, a minimum of 3 m distance, or held in a separate store. Treated seed must never be stored loose in a grain store.</p>
    <script>window.onload=function(){window.print()}</script>
  </body></html>`);
  win.document.close();
}

type Tab = "stock" | "orders" | "segregation";

interface SeedStoreAttachment {
  id: number;
  farmId: number;
  recordType: string;
  recordId: number;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  notes: string | null;
  uploadedByName: string | null;
  uploadedAt: string;
}

function seedStoreFormatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function seedStoreIsImage(mimeType: string | null, fileName: string): boolean {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
}

function SeedStoreRecordAttachments({ farmId, recordType, recordId, compact = false }: { farmId: number; recordType: string; recordId: number; compact?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const queryKey = ["record-attachments", farmId, recordType, recordId];

  const { data: attachments = [], isLoading } = useQuery<SeedStoreAttachment[]>({
    queryKey,
    queryFn: () =>
      fetch(`/api/farms/${farmId}/record-attachments?recordType=${encodeURIComponent(recordType)}&recordId=${recordId}`, {
        credentials: "include",
      }).then((r) => r.json()),
    enabled: !!farmId && !!recordId,
  });

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const urlRes = await fetch(`/api/storage/uploads/request-url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!putRes.ok) throw new Error("Failed to upload file");
      await fetch(`/api/farms/${farmId}/record-attachments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType,
          recordId,
          fileUrl: `/api/storage${objectPath}`,
          fileKey: objectPath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || null,
        }),
      });
      qc.invalidateQueries({ queryKey });
      toast({ title: "Attachment uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/farms/${farmId}/record-attachments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      qc.invalidateQueries({ queryKey });
      toast({ title: "Attachment removed" });
    } catch {
      toast({ title: "Failed to remove attachment", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={compact ? "space-y-2 text-xs" : "space-y-2 text-sm"}>
      <div className="flex items-center justify-between">
        <span className={`font-medium flex items-center gap-1.5 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
          <Paperclip className={compact ? "w-3 h-3" : "w-4 h-4"} />
          Attachments
          {attachments.length > 0 && (
            <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0 text-[10px] font-semibold">
              {attachments.length}
            </span>
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {uploading ? "Uploading…" : "Add file"}
        </Button>
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground py-1">Loading attachments…</p>
      )}

      {!isLoading && attachments.length === 0 && (
        <p className="text-xs text-muted-foreground py-1 italic">No attachments yet.</p>
      )}

      {attachments.length > 0 && (
        <ul className="space-y-1.5">
          {attachments.map((att) => {
            const img = seedStoreIsImage(att.mimeType, att.fileName);
            return (
              <li
                key={att.id}
                className="flex items-center gap-2 rounded border border-border bg-muted/40 px-2 py-1.5 group"
              >
                {img ? (
                  <ImageIcon className="w-4 h-4 shrink-0 text-blue-500" />
                ) : (
                  <FileText className="w-4 h-4 shrink-0 text-orange-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium leading-tight">{att.fileName}</p>
                  {att.fileSize && (
                    <p className="text-[10px] text-muted-foreground">{seedStoreFormatBytes(att.fileSize)}</p>
                  )}
                </div>
                <a
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  title="Download / view"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(att.id)}
                  disabled={deletingId === att.id}
                  className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove attachment"
                >
                  {deletingId === att.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function fmtGBP(pence: string | number | null | undefined) {
  if (pence === null || pence === undefined || pence === "") return "—";
  const n = num(pence) / 100;
  return `£${n.toFixed(2)}`;
}

function SeedStoreEmptyState({ icon: Icon, title, subtitle, action }: { icon: React.ElementType; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div style={{ background: "#f0fdf4", borderRadius: "50%", padding: "1.25rem", marginBottom: "1rem" }}>
        <Icon size={28} color="#166534" />
      </div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
      {action}
    </div>
  );
}

const emptyForm = {
  cropId: "",
  varietyId: "",
  supplierId: "",
  poId: "__none__",
  batchNumber: "",
  tgwGrams: "",
  bagWeightKg: "25",
  quantityReceivedKg: "",
  dateReceived: new Date().toISOString().slice(0, 10),
  deliveryNoteNumber: "",
  invoiceReference: "",
  costPounds: "",
  receivedBy: "",
  treatmentNotes: "",
};

const INACTIVE_PO_STATUSES = ["received", "cancelled"];

export default function SeedStorePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const safeFarmId = farmId ?? 0;

  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab") as Tab | null;
    return t === "orders" || t === "segregation" ? t : "stock";
  });

  const { data: membersData, isLoading: membersLoading } = useFarmMembers(safeFarmId);
  const staffNames = (membersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const { data: cropsData } = useCrops(safeFarmId);
  const cropRows: any[] = (cropsData as any)?.records ?? [];

  const suppliersQ = useQuery({
    queryKey: ["suppliers", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!safeFarmId,
  });

  const batchesQ = useQuery({
    queryKey: ["seed-batches", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/seed-batches`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!safeFarmId,
  });
  const batches: any[] = batchesQ.data ?? [];

  const posQ = useQuery({
    queryKey: ["seed-purchase-orders", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/seed-purchase-orders`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!safeFarmId,
  });
  const pos: any[] = posQ.data ?? [];

  const storageLocationsQ = useQuery({
    queryKey: ["storage-locations", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/storage-locations`).then(r => r.json()),
    enabled: !!safeFarmId,
  });
  const storageLocations: any[] = (storageLocationsQ.data as any)?.records ?? (Array.isArray(storageLocationsQ.data) ? storageLocationsQ.data : []);

  const segChecksQ = useQuery({
    queryKey: ["seed-storage-checks", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/seed-storage-checks`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!safeFarmId,
  });
  const segChecks: any[] = segChecksQ.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["seed-batches", safeFarmId] });
    qc.invalidateQueries({ queryKey: ["seed-purchase-orders", safeFarmId] });
  };

  const uniqueCrops = useMemo(() => {
    const seen = new Map<number, { cropId: number; name: string }>();
    for (const c of cropRows) {
      if (!seen.has(c.cropId)) seen.set(c.cropId, { cropId: c.cropId, name: c.name });
    }
    return Array.from(seen.values());
  }, [cropRows]);

  // ─── Stock (Seed Batch / GRN) ────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const openPos = useMemo(() => pos.filter(p => !INACTIVE_PO_STATUSES.includes(String(p.status))), [pos]);

  const varietiesForCrop = useMemo(() => {
    if (!form.cropId) return [];
    return cropRows.filter(c => String(c.cropId) === String(form.cropId));
  }, [cropRows, form.cropId]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const applyPoToForm = (poId: string, base: any) => {
    if (poId === "__none__") return base;
    const po = pos.find(p => String(p.id) === poId);
    if (!po) return base;
    return {
      ...base,
      poId,
      cropId: po.cropId ? String(po.cropId) : base.cropId,
      varietyId: po.varietyId ? String(po.varietyId) : base.varietyId,
      supplierId: po.supplierId ? String(po.supplierId) : base.supplierId,
      quantityReceivedKg: base.quantityReceivedKg || (po.quantityKg ? String(po.quantityKg) : ""),
    };
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      cropId: String(b.cropId),
      varietyId: String(b.varietyId),
      supplierId: b.supplierId ? String(b.supplierId) : "",
      poId: b.poId ? String(b.poId) : "__none__",
      batchNumber: b.batchNumber ?? "",
      tgwGrams: String(b.tgwGrams ?? ""),
      bagWeightKg: String(b.bagWeightKg ?? "25"),
      quantityReceivedKg: String(b.quantityReceivedKg ?? ""),
      dateReceived: b.dateReceived ? String(b.dateReceived).slice(0, 10) : "",
      deliveryNoteNumber: b.deliveryNoteNumber ?? "",
      invoiceReference: b.invoiceReference ?? "",
      costPounds: b.costPence ? String(num(b.costPence) / 100) : "",
      receivedBy: b.receivedBy ?? "",
      treatmentNotes: b.treatmentNotes ?? "",
    });
    setOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async (body: any) => {
      const url = editing ? `/api/farms/${safeFarmId}/seed-batches/${editing.id}` : `/api/farms/${safeFarmId}/seed-batches`;
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editing ? "Seed batch updated" : "Seed batch added" });
      invalidate();
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
    },
    onError: () => toast({ title: "Failed to save batch", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${safeFarmId}/seed-batches/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Seed batch deleted" }); invalidate(); setDeleteTarget(null); },
    onError: () => toast({ title: "Failed to delete batch", variant: "destructive" }),
  });

  const handleSave = () => {
    if (!form.cropId || !form.varietyId || !form.batchNumber || !form.tgwGrams || !form.quantityReceivedKg) {
      toast({ title: "Crop, variety, batch number, TGW and quantity received are required", variant: "destructive" });
      return;
    }
    const body: any = {
      cropId: Number(form.cropId),
      varietyId: Number(form.varietyId),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      poId: form.poId && form.poId !== "__none__" ? Number(form.poId) : null,
      batchNumber: form.batchNumber,
      tgwGrams: form.tgwGrams,
      bagWeightKg: form.bagWeightKg || "25",
      quantityReceivedKg: form.quantityReceivedKg,
      dateReceived: form.dateReceived || null,
      deliveryNoteNumber: form.deliveryNoteNumber || null,
      invoiceReference: form.invoiceReference || null,
      costPence: form.costPounds ? Math.round(num(form.costPounds) * 100) : null,
      receivedBy: form.receivedBy || null,
      treatmentNotes: form.treatmentNotes || null,
    };
    saveMut.mutate(body);
  };

  const filtered = batches.filter((b: any) => {
    if (!showInactive && b.isActive === false) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.cropName?.toLowerCase().includes(q) ||
      b.varietyName?.toLowerCase().includes(q) ||
      b.batchNumber?.toLowerCase().includes(q) ||
      b.supplierName?.toLowerCase().includes(q)
    );
  });

  // ─── Purchase Orders ─────────────────────────────────────────────────────
  const [showPoDialog, setShowPoDialog] = useState(false);
  const [editPo, setEditPo] = useState<any | null>(null);
  const [viewPo, setViewPo] = useState<any | null>(null);
  const [poForm, setPoForm] = useState<any>({});
  const [poFilter, setPoFilter] = useState<"active" | "all">("active");
  const [deletePoTarget, setDeletePoTarget] = useState<any>(null);

  const activePos = useMemo(() => pos.filter(p => !INACTIVE_PO_STATUSES.includes(String(p.status))), [pos]);
  const today = new Date().toISOString().slice(0, 10);
  const overduePos = useMemo(
    () => activePos.filter(p => p.expectedDeliveryDate && String(p.expectedDeliveryDate).slice(0, 10) < today),
    [activePos, today]
  );
  const filteredPos = poFilter === "active" ? activePos : pos;

  const poCropVarieties = useMemo(() => {
    if (!poForm.cropId) return [];
    return cropRows.filter(c => String(c.cropId) === String(poForm.cropId));
  }, [cropRows, poForm.cropId]);

  function openPoAdd() {
    setEditPo(null);
    setPoForm({
      supplierId: "",
      cropId: "",
      varietyId: "",
      quantityKg: "",
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: "",
      status: "sent",
      orderedBy: "",
      notes: "",
    });
    setShowPoDialog(true);
  }
  function openPoEdit(po: any) {
    setEditPo(po);
    setPoForm({
      supplierId: po.supplierId ? String(po.supplierId) : "",
      cropId: po.cropId ? String(po.cropId) : "",
      varietyId: po.varietyId ? String(po.varietyId) : "",
      quantityKg: String(po.quantityKg ?? ""),
      orderDate: po.orderDate ? String(po.orderDate).slice(0, 10) : "",
      expectedDeliveryDate: po.expectedDeliveryDate ? String(po.expectedDeliveryDate).slice(0, 10) : "",
      actualDeliveryDate: po.actualDeliveryDate ? String(po.actualDeliveryDate).slice(0, 10) : "",
      status: po.status ?? "sent",
      orderedBy: po.orderedBy ?? "",
      notes: po.notes ?? "",
    });
    setShowPoDialog(true);
  }

  const poMut = useMutation({
    mutationFn: async (data: any) => {
      const url = editPo ? `/api/farms/${safeFarmId}/seed-purchase-orders/${editPo.id}` : `/api/farms/${safeFarmId}/seed-purchase-orders`;
      const res = await fetch(url, { method: editPo ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowPoDialog(false); toast({ title: editPo ? "Order updated" : "Seed order raised" }); },
    onError: () => toast({ title: "Error saving order", variant: "destructive" }),
  });

  const deletePoMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${safeFarmId}/seed-purchase-orders/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); setDeletePoTarget(null); toast({ title: "Order removed" }); },
    onError: () => toast({ title: "Failed to delete order", variant: "destructive" }),
  });

  const [receivePoId, setReceivePoId] = useState<number | null>(null);
  const [receivePoDate, setReceivePoDate] = useState(new Date().toISOString().slice(0, 10));
  const receivePoMut = useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) =>
      fetch(`/api/farms/${safeFarmId}/seed-purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "received", actualDeliveryDate: date }),
      }).then(r => r.json()),
    onSuccess: () => { invalidate(); setReceivePoId(null); toast({ title: "Order marked as received — log the seed batch (GRN) in the Stock tab." }); },
  });

  const cancelPoMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${safeFarmId}/seed-purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Order cancelled" }); },
  });

  const savingBatch = saveMut.isPending;

  // ─── Seed Storage Segregation Checks (Red Tractor CR.ST.19) ───────────────
  const emptySegForm = {
    storageLocationId: "__none__",
    checkDate: new Date().toISOString().slice(0, 10),
    segregationMethod: "rigid_barrier",
    isCompliant: true,
    treatedSeedStoredLoose: false,
    notes: "",
    checkedBy: "",
  };
  const [showSegDialog, setShowSegDialog] = useState(false);
  const [editSeg, setEditSeg] = useState<any | null>(null);
  const [viewSeg, setViewSeg] = useState<any | null>(null);
  const [segForm, setSegForm] = useState<any>(emptySegForm);
  const [deleteSegTarget, setDeleteSegTarget] = useState<any>(null);

  const invalidateSeg = () => qc.invalidateQueries({ queryKey: ["seed-storage-checks", safeFarmId] });

  function openSegAdd() {
    setEditSeg(null);
    setSegForm(emptySegForm);
    setShowSegDialog(true);
  }
  function openSegEdit(rec: any) {
    setEditSeg(rec);
    setSegForm({
      storageLocationId: rec.storageLocationId ? String(rec.storageLocationId) : "__none__",
      checkDate: rec.checkDate ? String(rec.checkDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
      segregationMethod: rec.segregationMethod ?? "rigid_barrier",
      isCompliant: rec.isCompliant !== false,
      treatedSeedStoredLoose: !!rec.treatedSeedStoredLoose,
      notes: rec.notes ?? "",
      checkedBy: rec.checkedBy ?? "",
    });
    setShowSegDialog(true);
  }

  const segMut = useMutation({
    mutationFn: async (data: any) => {
      const url = editSeg ? `/api/farms/${safeFarmId}/seed-storage-checks/${editSeg.id}` : `/api/farms/${safeFarmId}/seed-storage-checks`;
      const res = await fetch(url, { method: editSeg ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidateSeg(); setShowSegDialog(false); toast({ title: editSeg ? "Check updated" : "Segregation check logged" }); },
    onError: () => toast({ title: "Failed to save check", variant: "destructive" }),
  });

  const deleteSegMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${safeFarmId}/seed-storage-checks/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidateSeg(); setDeleteSegTarget(null); toast({ title: "Check deleted" }); },
    onError: () => toast({ title: "Failed to delete check", variant: "destructive" }),
  });

  const nonCompliantSegChecks = useMemo(
    () => segChecks.filter((c: any) => c.isCompliant === false || c.treatedSeedStoredLoose === true),
    [segChecks]
  );

  return (
    <AppLayout title="Seed Store">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Manage seed purchase orders, log deliveries (GRN) and track stock levels for crop varieties.</p>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "stock"} onClick={() => setTab("stock")}>Seed Stock ({batches.length})</TabButton>
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
            <ShoppingCart className="w-3.5 h-3.5 mr-1 inline" />
            Seed Orders
            {overduePos.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4">
                {overduePos.length}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === "segregation"} onClick={() => setTab("segregation")}>
            <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
            Segregation Checks
            {nonCompliantSegChecks.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4">
                {nonCompliantSegChecks.length}
              </span>
            )}
          </TabButton>
        </TabBar>

        {tab === "stock" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <Input placeholder="Search by crop, variety, batch number or supplier..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
              </div>
              <Button
                variant={showInactive ? "default" : "outline"}
                size="sm"
                onClick={() => setShowInactive(s => !s)}
              >
                {showInactive ? "Hide" : "Show"} Used-Up Batches
              </Button>
              <Button size="sm" onClick={openAdd}>
                <Plus size={14} className="mr-1" />Log Seed Batch
              </Button>
            </div>

            {batchesQ.isLoading ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
            ) : filtered.length === 0 ? (
              <SeedStoreEmptyState
                icon={Package}
                title="No seed batches recorded yet"
                subtitle="Log seed batches as they arrive from suppliers to track TGW, stock and generate bag labels"
                action={<Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Log Seed Batch</Button>}
              />
            ) : (
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Crop / Variety", "Batch No.", "Supplier", "TGW", "Remaining / Received", "Bags", "Received", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((b: any) => {
                      const received = num(b.quantityReceivedKg);
                      const remaining = num(b.quantityRemainingKg);
                      const bagWeight = num(b.bagWeightKg) || 25;
                      const bagsRemaining = bagWeight > 0 ? remaining / bagWeight : 0;
                      const pctRemaining = received > 0 ? Math.max(0, Math.min(100, (remaining / received) * 100)) : 0;
                      const isLow = received > 0 && pctRemaining <= 15 && remaining > 0;
                      const isDepleted = remaining <= 0;
                      return (
                        <tr key={b.id} className={`hover:bg-gray-50 ${b.isActive === false ? "opacity-60" : ""}`}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="font-medium text-gray-900">{b.cropName}</span>
                            {b.varietyName && <span className="text-gray-500"> — {b.varietyName}</span>}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{b.batchNumber}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{b.supplierName || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap font-medium text-green-700">{num(b.tgwGrams).toFixed(1)}g</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {!!isLow && <AlertTriangle size={13} color="#f59e0b" />}
                              <span className={`font-medium ${isDepleted ? "text-gray-400" : isLow ? "text-amber-700" : "text-gray-900"}`}>
                                {remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(1)}kg
                              </span>
                              <span className="text-gray-400">/ {received % 1 === 0 ? received.toFixed(0) : received.toFixed(1)}kg</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{bagsRemaining.toFixed(1)} @ {bagWeight}kg</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">{fmt(b.dateReceived)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isDepleted ? (
                              <Badge className="text-xs bg-gray-100 text-gray-600 border-none">Used up</Badge>
                            ) : isLow ? (
                              <Badge className="text-xs bg-amber-100 text-amber-700 border-none">Low stock</Badge>
                            ) : (
                              <Badge className="text-xs bg-green-100 text-green-700 border-none">In stock</Badge>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setViewItem(b)} title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(b)} title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(b)} title="Delete" className="text-red-500 hover:text-red-600">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Seed Orders Register</h2>
                <p className="text-xs text-gray-500 mt-0.5">Track seed orders raised with suppliers. When delivery arrives, mark as received and log the seed batch (GRN) in the Stock tab.</p>
              </div>
              <Button size="sm" onClick={openPoAdd}><Plus className="w-3.5 h-3.5 mr-1" />Raise Seed Order</Button>
            </div>

            {activePos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1">
                  <Clock className="w-3 h-3" />{activePos.length} active order{activePos.length !== 1 ? "s" : ""}
                </div>
                {overduePos.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1">
                    <AlertCircle className="w-3 h-3" />{overduePos.length} overdue — chase supplier
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button onClick={() => setPoFilter("active")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${poFilter === "active" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Active ({activePos.length})
              </button>
              <button onClick={() => setPoFilter("all")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${poFilter === "all" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                All ({pos.length})
              </button>
            </div>

            {filteredPos.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-gray-500">{poFilter === "active" ? "No active seed orders" : "No seed orders on record"}</p>
                <p className="text-sm mt-1 mb-4">Raise a seed order when purchasing seed from a supplier.</p>
                <Button size="sm" onClick={openPoAdd}><Plus className="w-3.5 h-3.5 mr-1" />Raise Seed Order</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPos.map(po => {
                  const isOverdue = !INACTIVE_PO_STATUSES.includes(String(po.status)) && po.expectedDeliveryDate && String(po.expectedDeliveryDate).slice(0, 10) < today;
                  const isReceived = po.status === "received";
                  const isCancelled = po.status === "cancelled";
                  return (
                    <div key={String(po.id)} className={`rounded-lg border p-4 ${isOverdue ? "border-red-300 bg-red-50" : isReceived ? "border-green-200 bg-green-50/60" : isCancelled ? "border-gray-200 bg-gray-50/60" : "border-amber-200 bg-white"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {!!isOverdue && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                            {!!isReceived && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                            <span className="font-mono text-sm font-semibold text-gray-800">{String(po.poNumber)}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isReceived ? "bg-green-100 text-green-700" : po.status === "confirmed" ? "bg-blue-100 text-blue-700" : po.status === "sent" ? "bg-amber-100 text-amber-700" : po.status === "draft" ? "bg-gray-100 text-gray-600" : isCancelled ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                              {String(po.status).charAt(0).toUpperCase() + String(po.status).slice(1)}
                            </span>
                            {!!isOverdue && (
                              <span className="text-xs text-red-600 font-medium">Overdue since {fmt(po.expectedDeliveryDate)}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-800 mt-0.5">
                            {po.supplierName ? <><span className="font-medium">{String(po.supplierName)}</span> — </> : null}
                            {String(po.cropName ?? "")}{po.varietyName ? ` (${po.varietyName})` : ""}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {num(po.quantityKg).toFixed(0)}kg
                            {!!po.orderDate && <span> · Ordered {fmt(po.orderDate)}</span>}
                            {!!po.expectedDeliveryDate && !isOverdue && !isReceived && <span> · Expected {fmt(po.expectedDeliveryDate)}</span>}
                            {!!po.actualDeliveryDate && <span> · Delivered {fmt(po.actualDeliveryDate)}</span>}
                            {!!po.orderedBy && <span> · Raised by {String(po.orderedBy)}</span>}
                          </p>
                          {!!po.notes && <p className="text-xs text-gray-400 mt-1 italic truncate max-w-md">{String(po.notes)}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => setViewPo(po)} title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {!isReceived && !isCancelled && (
                            <button
                              className="text-xs font-medium px-2.5 py-1 rounded border border-green-300 text-green-700 bg-white hover:bg-green-50 flex items-center gap-1 transition-colors"
                              onClick={() => { setReceivePoId(Number(po.id)); setReceivePoDate(new Date().toISOString().slice(0, 10)); }}
                            >
                              <CheckCircle2 className="w-3 h-3" />Received
                            </button>
                          )}
                          {!isCancelled && !isReceived && (
                            <button
                              className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors"
                              onClick={() => { if (confirm("Cancel this seed order?")) cancelPoMut.mutate(Number(po.id)); }}
                            >
                              Cancel
                            </button>
                          )}
                          <button className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors" onClick={() => openPoEdit(po)}>
                            <Pencil className="w-3 h-3" />Edit
                          </button>
                          <button className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 bg-white hover:bg-red-50 flex items-center transition-colors" onClick={() => setDeletePoTarget(po)}>
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "segregation" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Seed Storage Segregation Checks</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Red Tractor CR.ST.19: treated seed must not contaminate stored grain — secure segregation via rigid barrier or 3m distance,
                  and treated seed must never be stored loose in a grain store. Log a check for each storage location holding treated seed.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => printSegregationRegister(segChecks, safeFarmId)} disabled={segChecks.length === 0}>
                  <Printer className="w-3.5 h-3.5 mr-1" />Print Register
                </Button>
                <Button size="sm" onClick={openSegAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Check</Button>
              </div>
            </div>

            {nonCompliantSegChecks.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 mb-4 w-fit">
                <AlertCircle className="w-3.5 h-3.5" />
                {nonCompliantSegChecks.length} check{nonCompliantSegChecks.length !== 1 ? "s" : ""} flagged non-compliant — resolve and re-check
              </div>
            )}

            {segChecksQ.isLoading ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
            ) : segChecks.length === 0 ? (
              <SeedStoreEmptyState
                icon={ShieldCheck}
                title="No segregation checks recorded yet"
                subtitle="Log a check to evidence CR.ST.19 compliance for each storage location holding treated seed"
                action={<Button size="sm" onClick={openSegAdd}><Plus size={14} className="mr-1" />Log Check</Button>}
              />
            ) : (
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Storage Location", "Check Date", "Method", "Compliant?", "Checked By", "Evidence", "Actions"].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {segChecks.map((c: any) => {
                      const nonCompliant = c.isCompliant === false || c.treatedSeedStoredLoose === true;
                      return (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{c.storageLocationName || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-600">{fmt(c.checkDate)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                            {c.segregationMethod === "rigid_barrier" ? "Rigid barrier" : c.segregationMethod === "distance_3m" ? "3m distance" : c.segregationMethod === "separate_store" ? "Separate store" : c.segregationMethod || "—"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {nonCompliant ? (
                              <Badge className="text-xs bg-red-100 text-red-700 border-none flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" />Non-compliant</Badge>
                            ) : (
                              <Badge className="text-xs bg-green-100 text-green-700 border-none flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" />Compliant</Badge>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-600">{c.checkedBy || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">{c.evidencePhotoName ? "Photo attached" : "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setViewSeg(c)} title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openSegEdit(c)} title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteSegTarget(c)} title="Delete" className="text-red-500 hover:text-red-600">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW SEGREGATION CHECK DIALOG ── */}
        <Dialog open={viewSeg !== null} onOpenChange={o => { if (!o) setViewSeg(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Segregation Check — {viewSeg?.storageLocationName || "—"}</DialogTitle></DialogHeader>
            {viewSeg && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1">
                <div><p className="text-xs text-gray-500">Storage Location</p><p className="font-medium">{viewSeg.storageLocationName || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Check Date</p><p className="font-medium">{fmt(viewSeg.checkDate)}</p></div>
                <div><p className="text-xs text-gray-500">Segregation Method</p><p className="font-medium">
                  {viewSeg.segregationMethod === "rigid_barrier" ? "Rigid barrier" : viewSeg.segregationMethod === "distance_3m" ? "3m distance" : viewSeg.segregationMethod === "separate_store" ? "Separate store" : viewSeg.segregationMethod || "—"}
                </p></div>
                <div><p className="text-xs text-gray-500">Compliant</p><p className="font-medium">{viewSeg.isCompliant === false ? "No" : "Yes"}</p></div>
                <div><p className="text-xs text-gray-500">Treated Seed Stored Loose</p><p className="font-medium">{viewSeg.treatedSeedStoredLoose ? "Yes — non-compliant" : "No"}</p></div>
                <div><p className="text-xs text-gray-500">Checked By</p><p className="font-medium">{viewSeg.checkedBy || "—"}</p></div>
                {viewSeg.notes && (
                  <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="font-medium">{viewSeg.notes}</p></div>
                )}
              </div>
            )}
            {viewSeg && (
              <div className="pt-2 border-t">
                <SeedStoreRecordAttachments farmId={safeFarmId} recordType="seed_storage_segregation_check" recordId={viewSeg.id} />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewSeg(null)}>Close</Button>
              <Button onClick={() => { const it = viewSeg; setViewSeg(null); if (it) openSegEdit(it); }}>Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── LOG / EDIT SEGREGATION CHECK DIALOG ── */}
        <Dialog open={showSegDialog} onOpenChange={v => { setShowSegDialog(v); if (!v) { setEditSeg(null); setSegForm(emptySegForm); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editSeg ? "Edit Segregation Check" : "Log Segregation Check"}</DialogTitle>
              <DialogDescription>Evidence for Red Tractor CR.ST.19 — treated seed segregation from stored grain.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <Label className="text-xs mb-1 block">Storage Location</Label>
                <Select value={segForm.storageLocationId ?? "__none__"} onValueChange={v => setSegForm((f: any) => ({ ...f, storageLocationId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select storage location..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not linked to a location</SelectItem>
                    {storageLocations.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Check Date *</Label>
                  <Input type="date" value={segForm.checkDate ?? ""} onChange={e => setSegForm((f: any) => ({ ...f, checkDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Segregation Method</Label>
                  <Select value={segForm.segregationMethod ?? "rigid_barrier"} onValueChange={v => setSegForm((f: any) => ({ ...f, segregationMethod: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rigid_barrier">Rigid barrier</SelectItem>
                      <SelectItem value="distance_3m">3m distance</SelectItem>
                      <SelectItem value="separate_store">Separate store</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Compliant?</Label>
                  <Select value={segForm.isCompliant ? "yes" : "no"} onValueChange={v => setSegForm((f: any) => ({ ...f, isCompliant: v === "yes" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes — compliant</SelectItem>
                      <SelectItem value="no">No — non-compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Treated Seed Stored Loose?</Label>
                  <Select value={segForm.treatedSeedStoredLoose ? "yes" : "no"} onValueChange={v => setSegForm((f: any) => ({ ...f, treatedSeedStoredLoose: v === "yes" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes — non-compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Checked By</Label>
                <StaffSelect value={segForm.checkedBy ?? ""} onChange={v => setSegForm((f: any) => ({ ...f, checkedBy: v }))} staffNames={staffNames} loading={membersLoading} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Notes</Label>
                <Textarea value={segForm.notes ?? ""} onChange={e => setSegForm((f: any) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Rigid steel bin used to separate treated seed from grain heap" rows={2} />
              </div>
              {editSeg && (
                <div className="pt-2 border-t">
                  <SeedStoreRecordAttachments farmId={safeFarmId} recordType="seed_storage_segregation_check" recordId={editSeg.id} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSegDialog(false)}>Cancel</Button>
              <Button
                disabled={!segForm.checkDate || segMut.isPending}
                onClick={() => {
                  const data: any = {
                    storageLocationId: segForm.storageLocationId && segForm.storageLocationId !== "__none__" ? Number(segForm.storageLocationId) : null,
                    checkDate: segForm.checkDate,
                    segregationMethod: segForm.segregationMethod || "rigid_barrier",
                    isCompliant: !!segForm.isCompliant,
                    treatedSeedStoredLoose: !!segForm.treatedSeedStoredLoose,
                    notes: segForm.notes || null,
                    checkedBy: segForm.checkedBy || null,
                  };
                  segMut.mutate(data);
                }}
              >
                {segMut.isPending ? "Saving…" : editSeg ? "Save Changes" : "Log Check"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteSegTarget} onOpenChange={(v) => !v && setDeleteSegTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Segregation Check?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this segregation check record. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteSegTarget && deleteSegMut.mutate(deleteSegTarget.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── VIEW SEED BATCH DIALOG ── */}
        <Dialog open={viewItem !== null} onOpenChange={o => { if (!o) setViewItem(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Seed Batch — {viewItem?.batchNumber}</DialogTitle></DialogHeader>
            {viewItem && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1">
                <div><p className="text-xs text-gray-500">Crop</p><p className="font-medium">{viewItem.cropName || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Variety</p><p className="font-medium">{viewItem.varietyName || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Supplier</p><p className="font-medium">{viewItem.supplierName || "—"}</p></div>
                <div><p className="text-xs text-gray-500">TGW</p><p className="font-medium">{num(viewItem.tgwGrams).toFixed(1)}g</p></div>
                <div><p className="text-xs text-gray-500">Quantity Received</p><p className="font-medium">{num(viewItem.quantityReceivedKg).toFixed(1)}kg</p></div>
                <div><p className="text-xs text-gray-500">Quantity Remaining</p><p className="font-medium">{num(viewItem.quantityRemainingKg).toFixed(1)}kg</p></div>
                <div><p className="text-xs text-gray-500">Bag Weight</p><p className="font-medium">{num(viewItem.bagWeightKg) || 25}kg</p></div>
                <div><p className="text-xs text-gray-500">Date Received</p><p className="font-medium">{fmt(viewItem.dateReceived)}</p></div>
                <div><p className="text-xs text-gray-500">Delivery Note No.</p><p className="font-medium">{viewItem.deliveryNoteNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Invoice Reference</p><p className="font-medium">{viewItem.invoiceReference || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Cost</p><p className="font-medium">{fmtGBP(viewItem.costPence)}</p></div>
                <div><p className="text-xs text-gray-500">Received By</p><p className="font-medium">{viewItem.receivedBy || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Linked Order</p><p className="font-medium">{pos.find(p => p.id === viewItem.poId)?.poNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><p className="font-medium">{viewItem.isActive === false ? "Used up" : "In stock"}</p></div>
                {viewItem.treatmentNotes && (
                  <div className="col-span-2"><p className="text-xs text-gray-500">Treatment / Notes</p><p className="font-medium">{viewItem.treatmentNotes}</p></div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
              <Button onClick={() => { const it = viewItem; setViewItem(null); if (it) openEdit(it); }}>Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── LOG / EDIT SEED BATCH DIALOG ── */}
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyForm); } }}>
          <DialogContent style={{ maxWidth: 480 }} className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Seed Batch" : "Log Seed Batch (GRN)"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              {!editing && (
                <div>
                  <Label>Link to Purchase Order</Label>
                  <Select value={form.poId} onValueChange={v => setForm((f: any) => applyPoToForm(v, { ...f }))}>
                    <SelectTrigger><SelectValue placeholder="No linked order..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No linked order</SelectItem>
                      {openPos.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.poNumber} — {p.cropName}{p.varietyName ? ` (${p.varietyName})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <Label>Crop *</Label>
                  <Select value={form.cropId} onValueChange={v => setForm((f: any) => ({ ...f, cropId: v, varietyId: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select crop..." /></SelectTrigger>
                    <SelectContent>{uniqueCrops.map(c => <SelectItem key={c.cropId} value={String(c.cropId)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Variety *</Label>
                  <Select value={form.varietyId} onValueChange={v => setForm((f: any) => ({ ...f, varietyId: v }))} disabled={!form.cropId}>
                    <SelectTrigger><SelectValue placeholder="Select variety..." /></SelectTrigger>
                    <SelectContent>{varietiesForCrop.map((v: any) => <SelectItem key={v.id} value={String(v.id)}>{v.variety || "—"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Supplier</Label>
                <Select value={form.supplierId} onValueChange={v => setForm((f: any) => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier (optional)..." /></SelectTrigger>
                  <SelectContent>{(suppliersQ.data ?? []).map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Batch Number *</Label>
                <Input value={form.batchNumber} onChange={e => setForm((f: any) => ({ ...f, batchNumber: e.target.value }))} placeholder="e.g. SK-2026-0417" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <Label>TGW (g) *</Label>
                  <Input type="number" step="0.1" value={form.tgwGrams} onChange={e => setForm((f: any) => ({ ...f, tgwGrams: e.target.value }))} placeholder="e.g. 48.5" />
                </div>
                <div>
                  <Label>Bag Weight (kg)</Label>
                  <Input type="number" step="0.5" value={form.bagWeightKg} onChange={e => setForm((f: any) => ({ ...f, bagWeightKg: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <Label>Quantity Received (kg) *</Label>
                  <Input type="number" step="0.1" value={form.quantityReceivedKg} onChange={e => setForm((f: any) => ({ ...f, quantityReceivedKg: e.target.value }))} disabled={!!editing} />
                </div>
                <div>
                  <Label>Date Received</Label>
                  <Input type="date" value={form.dateReceived} onChange={e => setForm((f: any) => ({ ...f, dateReceived: e.target.value }))} />
                </div>
              </div>
              {editing && (
                <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Quantity received is fixed once logged — stock is adjusted automatically as it's allocated to fields.</p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <Label>Delivery Note No.</Label>
                  <Input value={form.deliveryNoteNumber} onChange={e => setForm((f: any) => ({ ...f, deliveryNoteNumber: e.target.value }))} placeholder="e.g. DN-4471" />
                </div>
                <div>
                  <Label>Invoice Reference</Label>
                  <Input value={form.invoiceReference} onChange={e => setForm((f: any) => ({ ...f, invoiceReference: e.target.value }))} placeholder="e.g. INV-10234" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <Label>Cost (£)</Label>
                  <Input type="number" step="0.01" value={form.costPounds} onChange={e => setForm((f: any) => ({ ...f, costPounds: e.target.value }))} placeholder="e.g. 850.00" />
                </div>
                <div>
                  <Label>Received By</Label>
                  <StaffSelect value={form.receivedBy} onChange={v => setForm((f: any) => ({ ...f, receivedBy: v }))} staffNames={staffNames} loading={membersLoading} />
                </div>
              </div>
              <div>
                <Label>Treatment / Notes</Label>
                <Textarea rows={2} value={form.treatmentNotes} onChange={e => setForm((f: any) => ({ ...f, treatmentNotes: e.target.value }))} placeholder="e.g. Redigo Deter treated" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={savingBatch}>
                {savingBatch && <Loader2 size={14} className="mr-1 animate-spin" />}
                {editing ? "Save Changes" : "Log Batch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Seed Batch?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove batch "{deleteTarget?.batchNumber}". This cannot be undone. If field assignments still reference this batch, deletion may fail.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── VIEW SEED ORDER DIALOG ── */}
        <Dialog open={viewPo !== null} onOpenChange={o => { if (!o) setViewPo(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Seed Order — {viewPo?.poNumber}</DialogTitle></DialogHeader>
            {viewPo && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1">
                <div><p className="text-xs text-gray-500">Supplier</p><p className="font-medium">{viewPo.supplierName || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><p className="font-medium">{String(viewPo.status).charAt(0).toUpperCase() + String(viewPo.status).slice(1)}</p></div>
                <div><p className="text-xs text-gray-500">Crop</p><p className="font-medium">{viewPo.cropName || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Variety</p><p className="font-medium">{viewPo.varietyName || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium">{num(viewPo.quantityKg).toFixed(0)}kg</p></div>
                <div><p className="text-xs text-gray-500">Order Date</p><p className="font-medium">{fmt(viewPo.orderDate)}</p></div>
                <div><p className="text-xs text-gray-500">Expected Delivery</p><p className="font-medium">{fmt(viewPo.expectedDeliveryDate)}</p></div>
                <div><p className="text-xs text-gray-500">Actual Delivery</p><p className="font-medium">{fmt(viewPo.actualDeliveryDate)}</p></div>
                <div><p className="text-xs text-gray-500">Raised By</p><p className="font-medium">{viewPo.orderedBy || "—"}</p></div>
                {viewPo.notes && (
                  <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="font-medium">{viewPo.notes}</p></div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewPo(null)}>Close</Button>
              <Button onClick={() => { const it = viewPo; setViewPo(null); if (it) openPoEdit(it); }}>Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── SEED ORDER DIALOG ── */}
        <Dialog open={showPoDialog} onOpenChange={v => !v && setShowPoDialog(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editPo ? "Edit Seed Order" : "Raise Seed Order"}</DialogTitle>
              <DialogDescription>{editPo ? `Edit details for ${editPo.poNumber}` : "Record a seed purchase order raised with a supplier."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <Label className="text-xs mb-1 block">Supplier</Label>
                <Select value={poForm.supplierId ?? ""} onValueChange={v => setPoForm((f: any) => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier (optional)..." /></SelectTrigger>
                  <SelectContent>{(suppliersQ.data ?? []).map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Crop *</Label>
                  <Select value={poForm.cropId ?? ""} onValueChange={v => setPoForm((f: any) => ({ ...f, cropId: v, varietyId: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select crop..." /></SelectTrigger>
                    <SelectContent>{uniqueCrops.map(c => <SelectItem key={c.cropId} value={String(c.cropId)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Variety *</Label>
                  <Select value={poForm.varietyId ?? ""} onValueChange={v => setPoForm((f: any) => ({ ...f, varietyId: v }))} disabled={!poForm.cropId}>
                    <SelectTrigger><SelectValue placeholder="Select variety..." /></SelectTrigger>
                    <SelectContent>{poCropVarieties.map((v: any) => <SelectItem key={v.id} value={String(v.id)}>{v.variety || "—"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Quantity (kg) *</Label>
                <Input type="number" value={poForm.quantityKg ?? ""} onChange={e => setPoForm((f: any) => ({ ...f, quantityKg: e.target.value }))} placeholder="e.g. 500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Order Date *</Label>
                  <Input type="date" value={poForm.orderDate ?? ""} onChange={e => setPoForm((f: any) => ({ ...f, orderDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Expected Delivery</Label>
                  <Input type="date" value={poForm.expectedDeliveryDate ?? ""} onChange={e => setPoForm((f: any) => ({ ...f, expectedDeliveryDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Status</Label>
                  <Select value={poForm.status ?? "sent"} onValueChange={v => setPoForm((f: any) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent to Supplier</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Raised By</Label>
                  <StaffSelect value={poForm.orderedBy ?? ""} onChange={v => setPoForm((f: any) => ({ ...f, orderedBy: v }))} staffNames={staffNames} loading={membersLoading} />
                </div>
              </div>
              {poForm.status === "received" && (
                <div>
                  <Label className="text-xs mb-1 block">Actual Delivery Date</Label>
                  <Input type="date" value={poForm.actualDeliveryDate ?? ""} onChange={e => setPoForm((f: any) => ({ ...f, actualDeliveryDate: e.target.value }))} />
                </div>
              )}
              <div>
                <Label className="text-xs mb-1 block">Notes</Label>
                <Textarea value={poForm.notes ?? ""} onChange={e => setPoForm((f: any) => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this order…" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPoDialog(false)}>Cancel</Button>
              <Button
                disabled={!poForm.cropId || !poForm.varietyId || !poForm.quantityKg || !poForm.orderDate || poMut.isPending}
                onClick={() => {
                  const data: any = {
                    supplierId: poForm.supplierId ? Number(poForm.supplierId) : null,
                    cropId: Number(poForm.cropId),
                    varietyId: Number(poForm.varietyId),
                    quantityKg: poForm.quantityKg,
                    orderDate: poForm.orderDate,
                    expectedDeliveryDate: poForm.expectedDeliveryDate || null,
                    actualDeliveryDate: poForm.actualDeliveryDate || null,
                    status: poForm.status || "sent",
                    orderedBy: poForm.orderedBy || null,
                    notes: poForm.notes || null,
                  };
                  poMut.mutate(data);
                }}
              >
                {poMut.isPending ? "Saving…" : editPo ? "Save Changes" : "Raise Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── MARK AS RECEIVED DIALOG ── */}
        <Dialog open={receivePoId !== null} onOpenChange={v => !v && setReceivePoId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Mark Order as Received</DialogTitle>
              <DialogDescription>Confirm the actual delivery date. Then log the seed batch (GRN) in the Stock tab.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Actual Delivery Date</Label>
                <Input type="date" value={receivePoDate} onChange={e => setReceivePoDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceivePoId(null)}>Cancel</Button>
              <Button
                disabled={!receivePoDate || receivePoMut.isPending}
                onClick={() => { if (receivePoId !== null) receivePoMut.mutate({ id: receivePoId, date: receivePoDate }); }}
              >
                {receivePoMut.isPending ? "Saving…" : "Mark Received"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletePoTarget} onOpenChange={(v) => !v && setDeletePoTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Seed Order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove order "{deletePoTarget?.poNumber}". This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletePoTarget && deletePoMut.mutate(deletePoTarget.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
