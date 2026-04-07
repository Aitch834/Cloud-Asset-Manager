import React, { useState } from "react";
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
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Wheat, Plus, ArrowDown, ArrowUp, ArrowLeftRight, Pencil, Trash2 } from "lucide-react";

type Tab = "stock" | "movements";

const GRAIN_COMMODITIES = [
  "Winter Wheat","Spring Wheat","Winter Barley","Spring Barley","Malting Barley",
  "Winter Oats","Spring Oats","Oilseed Rape","Winter Beans","Spring Beans",
  "Peas","Maize","Rye","Triticale","Linseed","Other",
];

const MOVEMENT_TYPES = [
  { value: "harvest_in", label: "Harvest In", direction: "in" },
  { value: "dispatch_out", label: "Dispatch Out", direction: "out" },
  { value: "transfer_in", label: "Transfer In", direction: "in" },
  { value: "transfer_out", label: "Transfer Out", direction: "out" },
  { value: "sample_out", label: "Sample Out", direction: "out" },
  { value: "drying_loss", label: "Drying Loss", direction: "out" },
  { value: "adjustment", label: "Manual Adjustment", direction: "in" },
];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function BinSelect({ farmId, value, onChange, placeholder }: {
  farmId: number; value: number | null; onChange: (id: number | null, name: string) => void; placeholder?: string;
}) {
  const q = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.rows ?? d.records ?? [],
  });
  const bins: any[] = q.data ?? [];
  return (
    <Select value={value ? String(value) : "__none__"} onValueChange={v => {
      if (v === "__none__") { onChange(null, ""); return; }
      const bin = bins.find((b: any) => String(b.id) === v);
      onChange(bin?.id ?? null, bin?.binName ?? "");
    }}>
      <SelectTrigger><SelectValue placeholder={placeholder ?? "Select bin / store..."} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— None (no specific bin) —</SelectItem>
        {bins.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.binName}{b.binType ? ` (${b.binType})` : ""}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function DirectionIcon({ dir }: { dir: string }) {
  if (dir === "in") return <ArrowDown size={14} style={{ color: "#16a34a" }} />;
  return <ArrowUp size={14} style={{ color: "#dc2626" }} />;
}

// ─── Stock Levels Tab ─────────────────────────────────────────────────────────
function StockLevelsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [harvestOpen, setHarvestOpen] = useState(false);

  const emptyLevel = { binId: null as number | null, commodity: "", variety: "", cropYear: "", quantityTonnes: "", notes: "" };
  const emptyHarvest = { binId: null as number | null, commodity: "", variety: "", cropYear: "", quantityTonnes: "", performedBy: "", notes: "" };
  const [levelForm, setLevelForm] = useState<any>(emptyLevel);
  const [harvestForm, setHarvestForm] = useState<any>(emptyHarvest);

  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.rows ?? d.records ?? [],
  });
  const bins: any[] = binsQ.data ?? [];
  const binName = (id: number | null | undefined) => bins.find(b => b.id === id)?.binName ?? "—";

  const q = useQuery({
    queryKey: ["crop-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-levels`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const saveLevelMut = useMutation({
    mutationFn: (body: any) => editRow
      ? fetch(`/api/farms/${farmId}/crop-stock-levels/${editRow.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : fetch(`/api/farms/${farmId}/crop-stock-levels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: editRow ? "Stock record updated" : "Stock record created" }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); setAddOpen(false); setEditRow(null); setLevelForm(emptyLevel); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteLevelMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/crop-stock-levels/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); setDeleteId(null); },
  });

  const harvestMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Harvest-in recorded — stock level updated" }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); qc.invalidateQueries({ queryKey: ["crop-stock-movements", farmId] }); setHarvestOpen(false); setHarvestForm(emptyHarvest); },
    onError: () => toast({ title: "Failed to record harvest", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const totalTonnes = records.reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);

  // Group by commodity for summary
  const byCommodity: Record<string, number> = {};
  for (const r of records) {
    byCommodity[r.commodity] = (byCommodity[r.commodity] ?? 0) + parseFloat(r.quantityTonnes ?? "0");
  }

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.875rem", gridColumn: "span 1" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "#16a34a" }}>Total in Store</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#14532d" }}>{totalTonnes.toFixed(1)} t</p>
        </div>
        {Object.entries(byCommodity).sort((a, b) => b[1] - a[1]).map(([commodity, tonnes]) => (
          <div key={commodity} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.875rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "#6b7280" }}>{commodity}</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>{tonnes.toFixed(1)} t</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" variant="outline" onClick={() => { setHarvestForm(emptyHarvest); setHarvestOpen(true); }}>
          <ArrowDown size={14} className="mr-1" style={{ color: "#16a34a" }} />Record Harvest In
        </Button>
        <Button size="sm" onClick={() => { setEditRow(null); setLevelForm(emptyLevel); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" />Manual Stock Entry
        </Button>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Wheat size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No crop stock records yet</p>
          <p style={{ fontSize: "0.875rem" }}>Use "Record Harvest In" to initialise your grain stock levels, or confirm dispatches and transfers to update them automatically.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Commodity","Variety","Crop Year","Bin / Store","Live Quantity","Last Updated",""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{r.commodity}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.variety || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.cropYear || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{binName(r.binId)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <span style={{ fontWeight: 700, color: parseFloat(r.quantityTonnes) > 0 ? "#16a34a" : "#dc2626", fontSize: "1rem" }}>
                      {parseFloat(r.quantityTonnes ?? "0").toFixed(3)} t
                    </span>
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }}>{fmt(r.lastUpdated)}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { setEditRow(r); setLevelForm({ ...r, quantityTonnes: r.quantityTonnes }); setAddOpen(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Harvest In */}
      <Dialog open={harvestOpen} onOpenChange={o => { if (!o) setHarvestOpen(false); }}>
        <DialogContent style={{ maxWidth: 500 }}>
          <DialogHeader><DialogTitle>Record Harvest In</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>This will add to the live stock level for the selected bin and commodity.</p>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Commodity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={harvestForm.commodity || "__none__"} onValueChange={v => setHarvestForm((f: any) => ({ ...f, commodity: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {GRAIN_COMMODITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Variety</Label><Input placeholder="e.g. Skyfall" value={harvestForm.variety} onChange={e => setHarvestForm((f: any) => ({ ...f, variety: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity (tonnes) <span style={{ color: "#ef4444" }}>*</span></Label><Input type="number" step="0.001" min="0" value={harvestForm.quantityTonnes} onChange={e => setHarvestForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} /></div>
              <div><Label>Crop Year</Label><Input placeholder="e.g. 2024/25" value={harvestForm.cropYear} onChange={e => setHarvestForm((f: any) => ({ ...f, cropYear: e.target.value }))} /></div>
            </div>
            <div><Label>Destination Bin / Store</Label><BinSelect farmId={farmId} value={harvestForm.binId} onChange={(id) => setHarvestForm((f: any) => ({ ...f, binId: id }))} /></div>
            <div><Label>Recorded By</Label><Input value={harvestForm.performedBy} onChange={e => setHarvestForm((f: any) => ({ ...f, performedBy: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea rows={2} value={harvestForm.notes} onChange={e => setHarvestForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setHarvestOpen(false)}>Cancel</Button>
            <Button
              style={{ background: "#16a34a", color: "#fff" }}
              onClick={() => harvestMut.mutate({ binId: harvestForm.binId, commodity: harvestForm.commodity, variety: harvestForm.variety || null, cropYear: harvestForm.cropYear || null, movementType: "harvest_in", direction: "in", quantityTonnes: harvestForm.quantityTonnes, referenceType: "harvest_record", performedBy: harvestForm.performedBy || null, notes: harvestForm.notes || null })}
              disabled={!harvestForm.commodity || !harvestForm.quantityTonnes || harvestMut.isPending}
            >
              {harvestMut.isPending ? "Recording…" : "Record Harvest In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Stock Entry */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRow(null); setLevelForm(emptyLevel); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>{editRow ? "Edit Stock Record" : "Manual Stock Entry"}</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{editRow ? "Update the live quantity for this stock record." : "Create a new stock level record directly. Use 'Record Harvest In' to add movements with a full audit trail."}</p>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Commodity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={levelForm.commodity || "__none__"} onValueChange={v => setLevelForm((f: any) => ({ ...f, commodity: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {GRAIN_COMMODITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Variety</Label><Input value={levelForm.variety} onChange={e => setLevelForm((f: any) => ({ ...f, variety: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity (tonnes) <span style={{ color: "#ef4444" }}>*</span></Label><Input type="number" step="0.001" min="0" value={levelForm.quantityTonnes} onChange={e => setLevelForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} /></div>
              <div><Label>Crop Year</Label><Input placeholder="e.g. 2024/25" value={levelForm.cropYear} onChange={e => setLevelForm((f: any) => ({ ...f, cropYear: e.target.value }))} /></div>
            </div>
            <div><Label>Bin / Store Location</Label><BinSelect farmId={farmId} value={levelForm.binId} onChange={(id) => setLevelForm((f: any) => ({ ...f, binId: id }))} /></div>
            <div><Label>Notes</Label><Textarea rows={2} value={levelForm.notes} onChange={e => setLevelForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRow(null); setLevelForm(emptyLevel); }}>Cancel</Button>
            <Button onClick={() => saveLevelMut.mutate(levelForm)} disabled={!levelForm.commodity || !levelForm.quantityTonnes || saveLevelMut.isPending}>
              {saveLevelMut.isPending ? "Saving…" : editRow ? "Save Changes" : "Create Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Stock Record?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This removes the record. Stock movements are not reversed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteLevelMut.mutate(deleteId)} disabled={deleteLevelMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Movements Audit Log Tab ───────────────────────────────────────────────────
function MovementsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({ binId: null as number | null, commodity: "", variety: "", cropYear: "", movementType: "adjustment", direction: "in", quantityTonnes: "", performedBy: "", notes: "" });

  const q = useQuery({
    queryKey: ["crop-stock-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-movements`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.rows ?? d.records ?? [],
  });
  const bins: any[] = binsQ.data ?? [];
  const binName = (id: number | null | undefined) => bins.find(b => b.id === id)?.binName ?? "—";

  const adjMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Adjustment recorded" }); qc.invalidateQueries({ queryKey: ["crop-stock-movements", farmId] }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); setAdjOpen(false); setAdjForm({ binId: null, commodity: "", variety: "", cropYear: "", movementType: "adjustment", direction: "in", quantityTonnes: "", performedBy: "", notes: "" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];

  const movTypeLabel = (t: string) => MOVEMENT_TYPES.find(m => m.value === t)?.label ?? t;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Full immutable audit log of all crop stock changes — harvests, dispatches, transfers, and adjustments.</p>
        <Button size="sm" variant="outline" onClick={() => setAdjOpen(true)}><Plus size={14} className="mr-1" />Manual Adjustment</Button>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ArrowLeftRight size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No movements recorded yet</p>
          <p style={{ fontSize: "0.875rem" }}>Movements are created automatically when dispatches and transfers are confirmed.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date","Type","Dir","Commodity","Bin / Store","Quantity (t)","Reference","By","Notes"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.movedAt)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <Badge style={{ fontSize: "0.7rem", background: r.direction === "in" ? "#dcfce7" : "#fee2e2", color: r.direction === "in" ? "#166534" : "#991b1b", border: "none" }}>
                      {movTypeLabel(r.movementType)}
                    </Badge>
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><DirectionIcon dir={r.direction} /></td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <p style={{ fontWeight: 500 }}>{r.commodity}</p>
                    {r.variety && <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.variety}</p>}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{binName(r.binId)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, color: r.direction === "in" ? "#16a34a" : "#dc2626" }}>
                    {r.direction === "in" ? "+" : "−"}{parseFloat(r.quantityTonnes ?? "0").toFixed(3)} t
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }}>
                    {r.referenceType ? `${r.referenceType.replace(/_/g, " ")} #${r.referenceId ?? "—"}` : "—"}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.performedBy || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Adjustment Dialog */}
      <Dialog open={adjOpen} onOpenChange={o => { if (!o) setAdjOpen(false); }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Manual Stock Adjustment</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Use for corrections, dry matter losses, or opening balances. Full audit trail is kept.</p>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Movement Type</Label>
                <Select value={adjForm.movementType} onValueChange={v => {
                  const mt = MOVEMENT_TYPES.find(m => m.value === v);
                  setAdjForm(f => ({ ...f, movementType: v, direction: mt?.direction ?? "in" }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MOVEMENT_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Direction</Label>
                <Select value={adjForm.direction} onValueChange={v => setAdjForm(f => ({ ...f, direction: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">In (add to stock)</SelectItem>
                    <SelectItem value="out">Out (deduct from stock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Commodity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={adjForm.commodity || "__none__"} onValueChange={v => setAdjForm(f => ({ ...f, commodity: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {GRAIN_COMMODITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Quantity (tonnes) <span style={{ color: "#ef4444" }}>*</span></Label><Input type="number" step="0.001" min="0" value={adjForm.quantityTonnes} onChange={e => setAdjForm(f => ({ ...f, quantityTonnes: e.target.value }))} /></div>
            </div>
            <div><Label>Bin / Store</Label><BinSelect farmId={farmId} value={adjForm.binId} onChange={id => setAdjForm(f => ({ ...f, binId: id }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Crop Year</Label><Input placeholder="e.g. 2024/25" value={adjForm.cropYear} onChange={e => setAdjForm(f => ({ ...f, cropYear: e.target.value }))} /></div>
              <div><Label>Performed By</Label><Input value={adjForm.performedBy} onChange={e => setAdjForm(f => ({ ...f, performedBy: e.target.value }))} /></div>
            </div>
            <div><Label>Notes / Reason <span style={{ color: "#ef4444" }}>*</span></Label><Textarea rows={2} value={adjForm.notes} onChange={e => setAdjForm(f => ({ ...f, notes: e.target.value }))} placeholder="Reason for adjustment..." /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button>
            <Button onClick={() => adjMut.mutate(adjForm)} disabled={!adjForm.commodity || !adjForm.quantityTonnes || !adjForm.notes || adjMut.isPending}>
              {adjMut.isPending ? "Saving…" : "Record Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page Shell ──────────────────────────────────────────────────────────────
export default function CropStockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("stock");

  return (
    <AppLayout title="Crop Stock">
      <TabBar>
        <TabButton active={tab === "stock"} onClick={() => setTab("stock")}><Wheat size={14} className="mr-1" />Stock Levels</TabButton>
        <TabButton active={tab === "movements"} onClick={() => setTab("movements")}><ArrowLeftRight size={14} className="mr-1" />Movement Log</TabButton>
      </TabBar>
      <div style={{ marginTop: 20 }}>
        {farmId && tab === "stock" && <StockLevelsTab farmId={farmId} />}
        {farmId && tab === "movements" && <MovementsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
