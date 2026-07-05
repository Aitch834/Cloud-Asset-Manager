import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCrops } from "@/hooks/use-crops";
import {
  useListSeedBatches,
  useCreateSeedBatch,
  useUpdateSeedBatch,
  useDeleteSeedBatch,
  getListSeedBatchesQueryKey,
} from "@workspace/api-client-react/src/generated/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Package, Plus, Search, AlertTriangle, Pencil, Trash2, Loader2 } from "lucide-react";

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div style={{ background: "#f0fdf4", borderRadius: "50%", padding: "1.25rem", marginBottom: "1rem" }}>
        <Icon size={28} color="#166534" />
      </div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

const emptyForm = {
  cropId: "",
  varietyId: "",
  supplierId: "",
  batchNumber: "",
  tgwGrams: "",
  bagWeightKg: "25",
  quantityReceivedKg: "",
  dateReceived: new Date().toISOString().slice(0, 10),
  treatmentNotes: "",
};

export default function SeedStorePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const safeFarmId = farmId ?? 0;

  const { data: cropsData } = useCrops(safeFarmId);
  const cropRows: any[] = (cropsData as any)?.records ?? [];

  const suppliersQ = useQuery({
    queryKey: ["suppliers", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!safeFarmId,
  });

  const batchesQ = useListSeedBatches(safeFarmId, undefined, { query: { enabled: !!safeFarmId } as any });
  const batches: any[] = (batchesQ.data as any)?.records ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: getListSeedBatchesQueryKey(safeFarmId) });

  const createMut = useCreateSeedBatch({
    mutation: {
      onSuccess: () => { toast({ title: "Seed batch added" }); invalidate(); setOpen(false); setForm(emptyForm); setEditing(null); },
      onError: () => toast({ title: "Failed to save batch", variant: "destructive" }),
    },
  });
  const updateMut = useUpdateSeedBatch({
    mutation: {
      onSuccess: () => { toast({ title: "Seed batch updated" }); invalidate(); setOpen(false); setForm(emptyForm); setEditing(null); },
      onError: () => toast({ title: "Failed to update batch", variant: "destructive" }),
    },
  });
  const deleteMut = useDeleteSeedBatch({
    mutation: {
      onSuccess: () => { toast({ title: "Seed batch deleted" }); invalidate(); setDeleteTarget(null); },
      onError: () => toast({ title: "Failed to delete batch", variant: "destructive" }),
    },
  });

  const varietiesForCrop = useMemo(() => {
    if (!form.cropId) return [];
    return cropRows.filter(c => String(c.cropId) === String(form.cropId));
  }, [cropRows, form.cropId]);

  const uniqueCrops = useMemo(() => {
    const seen = new Map<number, { cropId: number; name: string }>();
    for (const c of cropRows) {
      if (!seen.has(c.cropId)) seen.set(c.cropId, { cropId: c.cropId, name: c.name });
    }
    return Array.from(seen.values());
  }, [cropRows]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      cropId: String(b.cropId),
      varietyId: String(b.varietyId),
      supplierId: b.supplierId ? String(b.supplierId) : "",
      batchNumber: b.batchNumber ?? "",
      tgwGrams: String(b.tgwGrams ?? ""),
      bagWeightKg: String(b.bagWeightKg ?? "25"),
      quantityReceivedKg: String(b.quantityReceivedKg ?? ""),
      dateReceived: b.dateReceived ? String(b.dateReceived).slice(0, 10) : "",
      treatmentNotes: b.treatmentNotes ?? "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.cropId || !form.varietyId || !form.batchNumber || !form.tgwGrams || !form.quantityReceivedKg) {
      toast({ title: "Crop, variety, batch number, TGW and quantity received are required", variant: "destructive" });
      return;
    }
    const body: any = {
      cropId: Number(form.cropId),
      varietyId: Number(form.varietyId),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      batchNumber: form.batchNumber,
      tgwGrams: form.tgwGrams,
      bagWeightKg: form.bagWeightKg || "25",
      quantityReceivedKg: form.quantityReceivedKg,
      dateReceived: form.dateReceived || null,
      treatmentNotes: form.treatmentNotes || null,
    };
    if (editing) {
      updateMut.mutate({ farmId: safeFarmId, recordId: editing.id, data: body });
    } else {
      createMut.mutate({ farmId: safeFarmId, data: body });
    }
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

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <AppLayout title="Seed Store">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Seed batches received from suppliers — used to auto-fill TGW when assigning crops and to generate bag labels.</p>
        </div>

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
          <EmptyState icon={Package} title="No seed batches recorded yet" subtitle="Log seed batches as they arrive from suppliers to track TGW, stock and generate bag labels" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {filtered.map((b: any) => {
              const received = num(b.quantityReceivedKg);
              const remaining = num(b.quantityRemainingKg);
              const bagWeight = num(b.bagWeightKg) || 25;
              const bagsRemaining = bagWeight > 0 ? remaining / bagWeight : 0;
              const pctRemaining = received > 0 ? Math.max(0, Math.min(100, (remaining / received) * 100)) : 0;
              const isLow = received > 0 && pctRemaining <= 15 && remaining > 0;
              const isDepleted = remaining <= 0;
              return (
                <div
                  key={b.id}
                  style={{
                    background: "#fff",
                    border: isDepleted ? "1px solid #e5e7eb" : isLow ? "1.5px solid #f59e0b" : "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "1rem",
                    opacity: b.isActive === false ? 0.65 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{b.cropName}</span>
                      {b.varietyName && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}> — {b.varietyName}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {isLow && <AlertTriangle size={14} color="#f59e0b" />}
                      <button onClick={() => openEdit(b)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(b)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 8 }}>
                    Batch {b.batchNumber} {b.supplierName ? `· ${b.supplierName}` : ""}
                  </p>
                  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#166534" }}>{num(b.tgwGrams).toFixed(1)}g</span>
                      <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>TGW</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: isDepleted ? "#9ca3af" : isLow ? "#b45309" : "#111827" }}>{remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(1)}kg</span>
                      <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>of {received % 1 === 0 ? received.toFixed(0) : received.toFixed(1)}kg remaining</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>{bagsRemaining.toFixed(1)}</span>
                      <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>bags @ {bagWeight}kg</p>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "#f3f4f6", overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${pctRemaining}%`, background: isDepleted ? "#d1d5db" : isLow ? "#f59e0b" : "#22c55e" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "0.7rem", color: "#d1d5db" }}>Received {fmt(b.dateReceived)}</p>
                    {isDepleted && <Badge style={{ background: "#f3f4f6", color: "#6b7280", border: "none" }} className="text-xs">Used up</Badge>}
                  </div>
                  {b.treatmentNotes && (
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 8, borderTop: "1px solid #f3f4f6", paddingTop: 6 }}>{b.treatmentNotes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyForm); } }}>
          <DialogContent style={{ maxWidth: 480 }}>
            <DialogHeader><DialogTitle>{editing ? "Edit Seed Batch" : "Log Seed Batch"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
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
              <div>
                <Label>Treatment / Notes</Label>
                <Textarea rows={2} value={form.treatmentNotes} onChange={e => setForm((f: any) => ({ ...f, treatmentNotes: e.target.value }))} placeholder="e.g. Redigo Deter treated" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 size={14} className="mr-1 animate-spin" />}
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
              <AlertDialogAction onClick={() => deleteTarget && deleteMut.mutate({ farmId: safeFarmId, recordId: deleteTarget.id })}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
