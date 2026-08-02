import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LabSelector } from "@/components/ui/LabSelector";
import { BlockBoundaryMapDialog } from "@/components/fields/BlockBoundaryMapDialog";
import { FreshProduceReports } from "@/components/FreshProduceReports";
import { Plus, Pencil, Trash2, Loader2, LayoutGrid, Leaf, Droplets, Package, Eye, Warehouse, AlertTriangle, Thermometer, Map, Archive, RotateCcw, XCircle, TrendingUp, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DataTable({ cols, rows, onEdit, onDelete, onView }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView) && <td className="py-2 text-right space-x-1 whitespace-nowrap">
                {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
                {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                {onDelete && <Button size="icon" variant="ghost" onClick={() => setPendingDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
              </td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This cannot be undone."
        onConfirm={() => { if (pendingDelete && onDelete) { onDelete(pendingDelete); } setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

// ── BLOCKS ─────────────────────────────────────────────────────────────────

const RETIREMENT_REASONS = [
  "Absorbed back into parent field",
  "Amalgamated with adjacent block",
  "Converted to arable / combinable crops use",
  "Converted to non-agricultural use",
  "Infrastructure or development",
  "No longer in production",
  "Other",
];

function suggestBlockCode(blocks: Record<string, unknown>[]): string {
  const existing = new Set((blocks as { blockCode?: string }[]).map(b => (b.blockCode ?? "").toUpperCase()));
  for (let i = 1; i <= 999; i++) {
    const candidate = `BLOCK-${String(i).padStart(3, "0")}`;
    if (!existing.has(candidate)) return candidate;
  }
  return "";
}

function BlocksTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [codeError, setCodeError] = useState<string | null>(null);
  const [mapBlock, setMapBlock] = useState<{ id: number; name: string } | null>(null);
  const [showRetired, setShowRetired] = useState(false);
  const [retireRecord, setRetireRecord] = useState<Record<string, unknown> | null>(null);
  const [retireForm, setRetireForm] = useState({ retirementReason: "", retiredBy: "", retirementNotes: "" });
  const [reactivateRecord, setReactivateRecord] = useState<Record<string, unknown> | null>(null);

  const { data: allBlocks = [], isLoading } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks?includeRetired=true`), { credentials: "include" }).then(r => r.json()),
  });
  const blocks = showRetired
    ? (allBlocks as Record<string, unknown>[])
    : (allBlocks as Record<string, unknown>[]).filter(b => b.isActive !== false);
  const retiredCount = (allBlocks as Record<string, unknown>[]).filter(b => b.isActive === false).length;

  const { data: farmFields = [] } = useQuery({
    queryKey: ["farm-fields", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fields`), { credentials: "include" }).then(r => r.ok ? r.json().then((d: { records?: unknown[] } | unknown[]) => (Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? [])) : []),
  });

  useEffect(() => {
    if (open && !editing) {
      setForm(f => ({ ...f, blockCode: f.blockCode || suggestBlockCode(allBlocks as Record<string, unknown>[]) }));
    }
  }, [open, editing, allBlocks]);

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => {
      const code = (b.blockCode as string ?? "").trim().toUpperCase();
      const duplicate = (allBlocks as { id: unknown; blockCode?: string }[]).some(
        bl => bl.blockCode?.toUpperCase() === code && String(bl.id) !== String(editing?.id)
      );
      if (code && duplicate) {
        setCodeError(`Block code "${code}" is already in use. Please choose a unique code.`);
        return Promise.reject(new Error("duplicate"));
      }
      setCodeError(null);
      return fetch(editing ? api(`farms/${farmId}/horticulture-blocks/${editing.id}`) : api(`farms/${farmId}/horticulture-blocks`), {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...b, blockCode: code || null, fieldId: b.fieldId ? parseInt(b.fieldId as string) : null }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }); setOpen(false); setForm({}); setEditing(null); setCodeError(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-blocks/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const retire = useMutation({
    mutationFn: ({ id, ...body }: { id: number; retirementReason: string; retiredBy: string; retirementNotes: string }) =>
      fetch(api(`farms/${farmId}/horticulture-blocks/${id}/retire`), {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(body),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }); setRetireRecord(null); setRetireForm({ retirementReason: "", retiredBy: "", retirementNotes: "" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const reactivate = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-blocks/${id}/reactivate`), { method: "POST", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }); setReactivateRecord(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r); setCodeError(null);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Growing Blocks / Field Sections</h3>
          {retiredCount > 0 && (
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowRetired(v => !v)}
            >
              <Eye className={`w-3.5 h-3.5 ${showRetired ? "" : "opacity-40"}`} />
              {showRetired ? "Hide retired" : `Show retired (${retiredCount})`}
            </button>
          )}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setCodeError(null); setForm({}); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Block
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Block Name</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Code</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Parent Field</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Area (ha)</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Soil Type</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Irrigation</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Water Source</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {blocks.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center text-sm text-muted-foreground italic">No blocks yet. Add one using the button above.</td></tr>
              )}
              {(blocks as Record<string, unknown>[]).map((row, i) => {
                const isRetired = row.isActive === false;
                return (
                  <tr key={i} className={`border-b last:border-0 ${isRetired ? "opacity-50" : ""}`}>
                    <td className="py-2 pr-4">
                      <span className={isRetired ? "line-through text-muted-foreground" : ""}>{fmt(row.blockName)}</span>
                      {isRetired && <span className="ml-2 text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 no-underline not-italic">Retired</span>}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{fmt(row.blockCode)}</td>
                    <td className="py-2 pr-4">{row.fieldId ? <span className="text-xs">{fmt(row.fieldName)}{row.fieldReference ? <span className="text-muted-foreground"> ({fmt(row.fieldReference)})</span> : null}</span> : <span className="text-muted-foreground text-xs">—</span>}</td>
                    <td className="py-2 pr-4">{fmt(row.areaHa)}</td>
                    <td className="py-2 pr-4">{fmt(row.soilType)}</td>
                    <td className="py-2 pr-4">{fmt(row.irrigationSystem)}</td>
                    <td className="py-2 pr-4">{fmt(row.waterSource)}</td>
                    <td className="py-2 text-right space-x-1 whitespace-nowrap">
                      <Button size="icon" variant="ghost" title="View" onClick={() => setViewRecord(row)}><Eye className="w-3.5 h-3.5" /></Button>
                      {!isRetired && <>
                        <Button size="icon" variant="ghost" title="Draw boundary on map" onClick={() => setMapBlock({ id: row.id as number, name: String(row.blockName) })}><Map className="w-3.5 h-3.5 text-blue-600" /></Button>
                        <Button size="icon" variant="ghost" title="Edit" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" title="Retire block" onClick={() => { setRetireRecord(row); setRetireForm({ retirementReason: "", retiredBy: "", retirementNotes: "" }); }}><Archive className="w-3.5 h-3.5 text-amber-600" /></Button>
                      </>}
                      {isRetired && <Button size="icon" variant="ghost" title="Reactivate block" onClick={() => setReactivateRecord(row)}><RotateCcw className="w-3.5 h-3.5 text-green-600" /></Button>}
                      <Button size="icon" variant="ghost" title="Delete" onClick={() => del.mutate(row.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                View Block
                {viewRecord.isActive === false && <span className="text-xs bg-amber-100 text-amber-700 rounded px-2 py-0.5 font-normal">Retired</span>}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block Name</p><p className="font-medium">{fmt(viewRecord.blockName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block Code</p><p className="font-mono text-sm">{fmt(viewRecord.blockCode)}</p></div>
              {!!viewRecord.fieldId && (
                <div className="col-span-2 bg-muted/40 rounded p-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Parent Field</p>
                  <p className="font-medium">{fmt(viewRecord.fieldName)}{viewRecord.fieldReference ? <span className="text-muted-foreground text-xs ml-1">({fmt(viewRecord.fieldReference)})</span> : null}</p>
                  <div className="flex gap-3 mt-1">
                    {!!viewRecord.fieldIsNvz && <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">NVZ</span>}
                    {!!viewRecord.fieldIsOrganic && <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Organic</span>}
                  </div>
                </div>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Area (ha)</p><p className="font-medium">{fmt(viewRecord.areaHa)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Soil Type</p><p className="font-medium">{fmt(viewRecord.soilType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Irrigation System</p><p className="font-medium">{fmt(viewRecord.irrigationSystem)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Water Source</p><p className="font-medium">{fmt(viewRecord.waterSource)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
              {viewRecord.isActive === false && (
                <div className="col-span-2 border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Retirement Record</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Retired On</p><p className="font-medium">{fmtDate(viewRecord.retiredAt)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Retired By</p><p className="font-medium">{fmt(viewRecord.retiredBy)}</p></div>
                    <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Reason</p><p className="font-medium">{fmt(viewRecord.retirementReason)}</p></div>
                    {!!viewRecord.retirementNotes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.retirementNotes)}</p></div>}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {viewRecord.isActive !== false && <>
                <Button variant="outline" onClick={() => setMapBlock({ id: viewRecord.id as number, name: String(viewRecord.blockName) })}><Map className="w-4 h-4 mr-1" />Draw Boundary</Button>
                <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              </>}
              {viewRecord.isActive === false && (
                <Button variant="outline" onClick={() => { setReactivateRecord(viewRecord); setViewRecord(null); }}>
                  <RotateCcw className="w-4 h-4 mr-1" />Reactivate
                </Button>
              )}
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setCodeError(null); } }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Block" : "Add Growing Block"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Block Name *</Label><Input value={form.blockName ?? ""} onChange={e => setForm(f => ({ ...f, blockName: e.target.value }))} /></div>
            <div>
              <Label>Block Code</Label>
              <Input
                value={form.blockCode ?? ""}
                onChange={e => { setCodeError(null); setForm(f => ({ ...f, blockCode: e.target.value })); }}
                placeholder="e.g. BLOCK-001"
                className={codeError ? "border-red-500" : ""}
              />
              {codeError && <p className="text-xs text-red-600 mt-1">{codeError}</p>}
              {!editing && <p className="text-xs text-muted-foreground mt-1">Auto-suggested — you can change this to match your farm plan.</p>}
            </div>
            <div className="col-span-2">
              <Label>Parent Field <span className="text-muted-foreground font-normal">(optional — for mixed farms)</span></Label>
              <Select value={form.fieldId ?? ""} onValueChange={v => setForm(f => ({ ...f, fieldId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Not linked to a field" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not linked to a field</SelectItem>
                  {(farmFields as { id: number; name: string; fieldReference?: string }[]).map(f => (
                    <SelectItem key={f.id} value={String(f.id)}>{f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Link this block to a farm field to inherit NVZ / organic status.</p>
            </div>
            <div><Label>Area (ha)</Label><Input value={form.areaHa ?? ""} onChange={e => setForm(f => ({ ...f, areaHa: e.target.value }))} placeholder="Will update when boundary is drawn" /></div>
            <div><Label>Soil Type</Label>
              <Select value={form.soilType ?? ""} onValueChange={v => setForm(f => ({ ...f, soilType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                <SelectContent>{["Sandy","Loamy sand","Sandy loam","Loam","Clay loam","Silty clay loam","Silty clay","Clay","Peat","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Irrigation System</Label>
              <Select value={form.irrigationSystem ?? ""} onValueChange={v => setForm(f => ({ ...f, irrigationSystem: v }))}>
                <SelectTrigger><SelectValue placeholder="Select irrigation system" /></SelectTrigger>
                <SelectContent>{["Overhead sprinkler","Drip / trickle irrigation","Seep hose","Boom / boom reel","Flood irrigation","Furrow irrigation","None – rainfed"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Water Source</Label>
              <Select value={form.waterSource ?? ""} onValueChange={v => setForm(f => ({ ...f, waterSource: v }))}>
                <SelectTrigger><SelectValue placeholder="Select water source" /></SelectTrigger>
                <SelectContent>{["Borehole","Reservoir","River / stream","Mains (potable)","Rainwater harvesting","Pond / lake","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setCodeError(null); }}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.blockName}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retire dialog */}
      {retireRecord && (
        <Dialog open onOpenChange={() => setRetireRecord(null)}>
          <DialogContent style={{ maxWidth: "34rem" }}>
            <DialogHeader><DialogTitle>Retire Block — {fmt(retireRecord.blockName)}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This block will be marked as permanently out of production. It will be hidden from active crop and record selectors, but its full history is preserved and it can be reactivated at any time.</p>
            <div className="space-y-3">
              <div>
                <Label>Reason *</Label>
                <Select value={retireForm.retirementReason} onValueChange={v => setRetireForm(f => ({ ...f, retirementReason: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>{RETIREMENT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Retired By</Label>
                <Input value={retireForm.retiredBy} onChange={e => setRetireForm(f => ({ ...f, retiredBy: e.target.value }))} placeholder="Name of person retiring this block" />
              </div>
              <div>
                <Label>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea value={retireForm.retirementNotes} onChange={e => setRetireForm(f => ({ ...f, retirementNotes: e.target.value }))} rows={2} placeholder="e.g. Reabsorbed into North Field for winter wheat rotation" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRetireRecord(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={retire.isPending || !retireForm.retirementReason}
                onClick={() => retire.mutate({ id: retireRecord.id as number, ...retireForm })}
              >
                {retire.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Archive className="w-4 h-4 mr-1" />Retire Block</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reactivate confirm */}
      {reactivateRecord && (
        <ConfirmDialog
          open
          title={`Reactivate Block — ${fmt(reactivateRecord.blockName)}`}
          message="This will mark the block as active again, making it available in all crop and record selectors."
          onConfirm={() => reactivate.mutate(reactivateRecord.id as number)}
          onCancel={() => setReactivateRecord(null)}
          confirmLabel="Reactivate"
        />
      )}

      {mapBlock && (
        <BlockBoundaryMapDialog
          blockId={mapBlock.id}
          blockName={mapBlock.name}
          open={!!mapBlock}
          onClose={() => setMapBlock(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }); setMapBlock(null); }}
        />
      )}
    </div>
  );
}

// ── CROPS ──────────────────────────────────────────────────────────────────

const PLANTING_METHODS = ["Direct Seed", "Seedling (own propagation)", "Plug Plant (nursery)", "Bare Root Cane", "Crown / Rootstock", "Sapling", "Other"] as const;
type PlantingMethod = typeof PLANTING_METHODS[number];

function isSeedMethod(m: string) { return !m || m === "Direct Seed"; }
function isNurseryMethod(m: string) { return !!m && m !== "Direct Seed" && m !== "Seedling (own propagation)"; }

function sowingLabel(m: string) {
  if (m === "Bare Root Cane" || m === "Crown / Rootstock" || m === "Sapling") return "Planting Date";
  if (m === "Plug Plant (nursery)" || m === "Seedling (own propagation)") return "Potting / Tray Date";
  return "Sowing Date";
}

function printCropEstablishmentRegister(farmName: string, crops: Record<string, unknown>[], blocks: Record<string, unknown>[]) {
  const blockName = (id: unknown) => (blocks as any[]).find(b => String(b.id) === String(id))?.blockName ?? "—";
  const rows = (crops as Record<string, unknown>[]).map(c => `
    <tr>
      <td>${fmt(c.cropName)}</td>
      <td>${fmt(c.variety)}</td>
      <td>${blockName(c.blockId)}</td>
      <td>${fmt(c.plantingMethod) !== "—" ? fmt(c.plantingMethod) : "Direct Seed"}</td>
      <td>${c.quantityPlanted != null ? Number(c.quantityPlanted).toLocaleString() : "—"}</td>
      <td>${fmt(c.plantSupplier) !== "—" ? fmt(c.plantSupplier) : fmt(c.seedSupplier)}</td>
      <td>${fmt(c.nurseryBatchRef) !== "—" ? fmt(c.nurseryBatchRef) : fmt(c.seedLotNumber)}</td>
      <td>${fmtDate(c.sowingDate)}</td>
      <td>${fmtDate(c.transplantingDate)}</td>
      <td>${fmtDate(c.expectedHarvestDate)}</td>
      <td>${fmt(c.growingMethod)}</td>
      <td>${fmt(c.status)}</td>
    </tr>`).join("");
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>Crop Establishment Register — ${farmName}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #111; }
    h1 { font-size: 16px; margin-bottom: 2px; }
    h2 { font-size: 13px; font-weight: normal; color: #555; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #1a3c2a; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; white-space: nowrap; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; }
    @media print { .no-print { display: none; } }
  </style></head><body>
  <button class="no-print" onclick="window.print()" style="margin-bottom:16px;padding:6px 16px;background:#1a3c2a;color:#fff;border:none;border-radius:4px;cursor:pointer;">Print / Save PDF</button>
  <h1>Crop Establishment Register</h1>
  <h2>${farmName} &mdash; Printed ${new Date().toLocaleDateString("en-GB")}</h2>
  <table>
    <thead><tr>
      <th>Crop</th><th>Variety</th><th>Block</th><th>Planting Method</th>
      <th>Qty Planted</th><th>Supplier</th><th>Batch / Lot Ref</th>
      <th>Sow / Plant Date</th><th>Transplant Date</th><th>Expected Harvest</th>
      <th>Growing Method</th><th>Status</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Generated by BDE Farm Trac &bull; ${new Date().toLocaleString("en-GB")}</div>
  </body></html>`);
  w.document.close();
}

export function CropsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: farmInfo } = useQuery({ queryKey: ["farms-list"], queryFn: () => fetch(api("tenants/current/farms"), { credentials: "include" }).then(r => r.json()) });
  const farmName = (farmInfo as any)?.farms?.[0]?.name ?? "Farm";
  const { data: blocks = [] } = useQuery({ queryKey: ["horti-blocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then(r => r.json()) });
  const { data: crops = [], isLoading } = useQuery({ queryKey: ["horti-crops", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-crops`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/horticulture-crops/${editing.id}`) : api(`farms/${farmId}/horticulture-crops`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-crops", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-crops/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-crops", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r: Record<string, unknown>) => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v as string | boolean]))); setOpen(true); };
  const pm = String(form.plantingMethod ?? "");
  const isSeed = isSeedMethod(pm);
  const isNursery = isNurseryMethod(pm);
  const blockName = (id: unknown) => (blocks as any[]).find(b => String(b.id) === String(id))?.blockName ?? "—";
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Crop Register</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => printCropEstablishmentRegister(farmName, crops as Record<string, unknown>[], blocks as Record<string, unknown>[])}>
            <Printer className="w-3.5 h-3.5 mr-1" />Print Register
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ seedTreated: false, status: "growing" }); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Crop
          </Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "cropName", label: "Crop" },
          { key: "variety", label: "Variety" },
          { key: "plantingMethod", label: "Source", fmt: r => fmt(r.plantingMethod) !== "—" ? fmt(r.plantingMethod) : "Direct Seed" },
          { key: "quantityPlanted", label: "Qty", fmt: r => r.quantityPlanted != null ? Number(r.quantityPlanted).toLocaleString() : "—" },
          { key: "sowingDate", label: "Sow / Plant", fmt: r => fmtDate(r.sowingDate) },
          { key: "expectedHarvestDate", label: "Expected Harvest", fmt: r => fmtDate(r.expectedHarvestDate) },
          { key: "status", label: "Status" },
        ]}
        rows={crops as Record<string, unknown>[]} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }}>
            <DialogHeader><DialogTitle>View Crop Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop Name</p><p className="font-medium">{fmt(viewRecord.cropName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Variety</p><p className="font-medium">{fmt(viewRecord.variety)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block / Field</p><p className="font-medium">{blockName(viewRecord.blockId)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Growing Method</p><p className="font-medium">{fmt(viewRecord.growingMethod)}</p></div>
              <div className="col-span-2 border-t pt-3 mt-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Establishment</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Planting Method</p><p className="font-medium">{fmt(viewRecord.plantingMethod) !== "—" ? fmt(viewRecord.plantingMethod) : "Direct Seed"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Planted</p><p className="font-medium">{viewRecord.quantityPlanted != null ? Number(viewRecord.quantityPlanted).toLocaleString() : "—"}</p></div>
              {!isSeedMethod(String(viewRecord.plantingMethod ?? "")) && (<>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Nursery / Plant Supplier</p><p className="font-medium">{fmt(viewRecord.plantSupplier)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Nursery Batch Ref</p><p className="font-medium">{fmt(viewRecord.nurseryBatchRef)}</p></div>
              </>)}
              {isSeedMethod(String(viewRecord.plantingMethod ?? "")) && (<>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Supplier</p><p className="font-medium">{fmt(viewRecord.seedSupplier)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Lot Number</p><p className="font-medium">{fmt(viewRecord.seedLotNumber)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Treated</p><p className="font-medium">{viewRecord.seedTreated ? "Yes" : "No"}</p></div>
                {viewRecord.seedTreated && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Details</p><p className="font-medium">{fmt(viewRecord.seedTreatmentDetails)}</p></div>}
              </>)}
              <div className="col-span-2 border-t pt-3 mt-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dates &amp; Yield</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">{sowingLabel(String(viewRecord.plantingMethod ?? ""))}</p><p className="font-medium">{fmtDate(viewRecord.sowingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Transplanting Date</p><p className="font-medium">{fmtDate(viewRecord.transplantingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Harvest Date</p><p className="font-medium">{fmtDate(viewRecord.expectedHarvestDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Yield (kg/ha)</p><p className="font-medium">{fmt(viewRecord.targetYieldKgHa)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmt(viewRecord.status)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Crop Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Crop Name *</Label><Input value={String(form.cropName ?? "")} onChange={e => setForm(f => ({ ...f, cropName: e.target.value }))} /></div>
            <div><Label>Variety</Label><Input value={String(form.variety ?? "")} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))} /></div>
            <div><Label>Block</Label>
              <Select value={String(form.blockId ?? "")} onValueChange={v => setForm(f => ({ ...f, blockId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                <SelectContent>{(blocks as Record<string, unknown>[]).map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Growing Method</Label>
              <Select value={String(form.growingMethod ?? "")} onValueChange={v => setForm(f => ({ ...f, growingMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Open Field", "Protected Cropping", "Polytunnel", "Glasshouse", "Hydroponics", "Raised Bed"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Establishment / Planting Source</p>
            </div>
            <div><Label>Planting Method</Label>
              <Select value={pm} onValueChange={v => setForm(f => ({ ...f, plantingMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>{PLANTING_METHODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Quantity Planted</Label><Input type="number" min="0" value={String(form.quantityPlanted ?? "")} onChange={e => setForm(f => ({ ...f, quantityPlanted: e.target.value }))} placeholder="No. of plants / canes / crowns" /></div>

            {isNursery && (<>
              <div><Label>Nursery / Plant Supplier</Label><Input value={String(form.plantSupplier ?? "")} onChange={e => setForm(f => ({ ...f, plantSupplier: e.target.value }))} /></div>
              <div><Label>Nursery Batch / Delivery Ref</Label><Input value={String(form.nurseryBatchRef ?? "")} onChange={e => setForm(f => ({ ...f, nurseryBatchRef: e.target.value }))} /></div>
            </>)}

            {isSeed && (<>
              <div><Label>Seed Supplier</Label><Input value={String(form.seedSupplier ?? "")} onChange={e => setForm(f => ({ ...f, seedSupplier: e.target.value }))} /></div>
              <div><Label>Seed Lot Number</Label><Input value={String(form.seedLotNumber ?? "")} onChange={e => setForm(f => ({ ...f, seedLotNumber: e.target.value }))} /></div>
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox id="treated" checked={Boolean(form.seedTreated)} onCheckedChange={v => setForm(f => ({ ...f, seedTreated: Boolean(v) }))} />
                <Label htmlFor="treated">Seed treated?</Label>
              </div>
              {Boolean(form.seedTreated) && <div className="col-span-2"><Label>Treatment Details</Label><Input value={String(form.seedTreatmentDetails ?? "")} onChange={e => setForm(f => ({ ...f, seedTreatmentDetails: e.target.value }))} /></div>}
            </>)}

            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dates &amp; Yield</p>
            </div>
            <div><Label>{sowingLabel(pm)}</Label><Input type="date" value={String(form.sowingDate ?? "")} onChange={e => setForm(f => ({ ...f, sowingDate: e.target.value }))} /></div>
            {!isSeedMethod(pm) && <div><Label>Transplanting Date</Label><Input type="date" value={String(form.transplantingDate ?? "")} onChange={e => setForm(f => ({ ...f, transplantingDate: e.target.value }))} /></div>}
            <div><Label>Expected Harvest Date</Label><Input type="date" value={String(form.expectedHarvestDate ?? "")} onChange={e => setForm(f => ({ ...f, expectedHarvestDate: e.target.value }))} /></div>
            <div><Label>Target Yield (kg/ha)</Label><Input type="number" min="0" value={String(form.targetYieldKgHa ?? "")} onChange={e => setForm(f => ({ ...f, targetYieldKgHa: e.target.value }))} /></div>

            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Status &amp; Notes</p>
            </div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "growing")} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["growing", "harvested", "failed", "retired"].map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── WATER TESTS ────────────────────────────────────────────────────────────

export function WaterTestsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"log" | "result" | "edit">("log");
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [labSupplierId, setLabSupplierId] = useState<number | null>(null);
  const { data: tests = [], isLoading } = useQuery({ queryKey: ["horti-water", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-water-tests`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/horticulture-water-tests/${editing.id}`) : api(`farms/${farmId}/horticulture-water-tests`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-water", farmId] }); setOpen(false); setForm({}); setEditing(null); setLabSupplierId(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-water-tests/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-water", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openAdd() { setEditing(null); setMode("log"); setForm({}); setLabSupplierId(null); setOpen(true); }
  const openEdit = (r: Record<string, unknown>) => { setEditing(r); setMode("edit"); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setLabSupplierId((r.labSupplierId as number | null) ?? null); setOpen(true); };
  const openEnterResult = (r: Record<string, unknown>) => { setEditing(r); setMode("result"); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setLabSupplierId((r.labSupplierId as number | null) ?? null); setOpen(true); };
  const allWaterRows = tests as Record<string, unknown>[];
  const [yearFilterWater, setYearFilterWater] = useState("all");
  const yearsWater = useMemo(() => Array.from(new Set(allWaterRows.map(r => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allWaterRows]);
  const rows = yearFilterWater === "all" ? allWaterRows : allWaterRows.filter(r => String(r.testDate ?? "").startsWith(yearFilterWater));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Irrigation Water Quality Tests</h3>
        <div className="flex items-center gap-2"><Select value={yearFilterWater} onValueChange={setYearFilterWater}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsWater.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Sample</Button></div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No water test records yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{["Date", "Source", "Lab", "E.coli", "Coliform", "Overall Result", "Next Due", ""].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{fmtDate(r.testDate)}</td>
                  <td className="px-3 py-2 text-xs">{r.waterSource ? String(r.waterSource) : "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.testingLab ? String(r.testingLab) : "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.ecoli ? String(r.ecoli) : "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.totalColiform ? String(r.totalColiform) : "—"}</td>
                  <td className="px-3 py-2">
                    {!r.overallResult ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Awaiting results</span>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${String(r.overallResult).startsWith("Pass") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{String(r.overallResult)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{fmtDate(r.nextTestDueDate)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {!r.overallResult && <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => openEnterResult(r)}>Enter results</Button>}
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setViewRecord(r)}><Eye className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Water Test</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Date</p><p className="font-medium">{fmtDate(viewRecord.testDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Water Source</p><p className="font-medium">{fmt(viewRecord.waterSource)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Testing Lab</p><p className="font-medium">{fmt(viewRecord.testingLab)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Reference</p><p className="font-medium">{fmt(viewRecord.sampleReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">E.coli Result</p><p className="font-medium">{fmt(viewRecord.ecoli)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Coliform</p><p className="font-medium">{fmt(viewRecord.totalColiform)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Salmonella</p><p className="font-medium">{fmt(viewRecord.salmonella)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cryptosporidium</p><p className="font-medium">{fmt(viewRecord.cryptosporidium)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">pH</p><p className="font-medium">{fmt(viewRecord.ph)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Nitrates (mg/L)</p><p className="font-medium">{fmt(viewRecord.nitratesMgL)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Result</p><p className="font-medium">{fmt(viewRecord.overallResult)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">{fmtDate(viewRecord.nextTestDueDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Corrective Action</p><p className="font-medium">{fmt(viewRecord.correctiveAction)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setLabSupplierId(null); } }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>{mode === "log" ? "Log Water Test Sample" : mode === "result" ? "Enter Water Test Results" : "Edit Water Test Record"}</DialogTitle>
          </DialogHeader>
          {mode === "log" && <p className="text-xs text-muted-foreground -mt-1">Record the sample collection now. Return to enter laboratory results once the report arrives.</p>}
          {mode === "result" && editing && <p className="text-xs text-muted-foreground -mt-1">Sample from <strong>{fmtDate(editing.testDate)}</strong>{editing.waterSource ? ` · ${editing.waterSource}` : ""}{editing.testingLab ? ` · ${editing.testingLab}` : ""}. Enter results from your lab report.</p>}
          <div className="grid grid-cols-2 gap-3">
            {mode !== "result" && <>
              <div><Label>Test Date *</Label><Input type="date" value={form.testDate ?? ""} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} /></div>
              <div><Label>Water Source *</Label>
                <Select value={form.waterSource ?? ""} onValueChange={v => setForm(f => ({ ...f, waterSource: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>{["Borehole","Reservoir","River / stream","Mains (potable)","Rainwater harvesting","Pond / lake","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <LabSelector farmId={farmId} value={labSupplierId} labName={form.testingLab ?? null} onChange={(id, name) => { setLabSupplierId(id); setForm(f => ({ ...f, testingLab: name ?? "" })); }} />
              </div>
              <div><Label>Sample Reference</Label><Input value={form.sampleReference ?? ""} onChange={e => setForm(f => ({ ...f, sampleReference: e.target.value }))} placeholder="Lab submission ref (if known)" /></div>
            </>}
            {mode !== "log" && <>
              {[["ecoli", "E.coli Result"], ["totalColiform", "Total Coliform"], ["salmonella", "Salmonella"], ["cryptosporidium", "Cryptosporidium"]].map(([k, l]) => <div key={k}><Label>{l}</Label><Input value={form[k] ?? ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>)}
              <div><Label>pH</Label><Input type="number" step="0.1" value={form.ph ?? ""} onChange={e => setForm(f => ({ ...f, ph: e.target.value }))} /></div>
              <div><Label>Nitrates (mg/L)</Label><Input type="number" step="0.01" value={form.nitratesMgL ?? ""} onChange={e => setForm(f => ({ ...f, nitratesMgL: e.target.value }))} /></div>
              <div><Label>Overall Result *</Label>
                <Select value={form.overallResult ?? ""} onValueChange={v => setForm(f => ({ ...f, overallResult: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["Pass", "Pass with Conditions", "Fail", "Retest Required"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Next Test Due</Label><Input type="date" value={form.nextTestDueDate ?? ""} onChange={e => setForm(f => ({ ...f, nextTestDueDate: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Corrective Action</Label><Textarea value={form.correctiveAction ?? ""} onChange={e => setForm(f => ({ ...f, correctiveAction: e.target.value }))} rows={2} /></div>
            </>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setLabSupplierId(null); }}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form, labSupplierId: labSupplierId ?? null })} disabled={save.isPending}>{mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── HARVEST ────────────────────────────────────────────────────────────────

export function HarvestTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-harvest", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-harvest-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/horticulture-harvest-records/${editing.id}`) : api(`farms/${farmId}/horticulture-harvest-records`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-harvest", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-harvest-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-harvest", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r: Record<string, unknown>) => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const allHarvestRecords = records as Record<string, unknown>[];
  const [yearFilterHarvest, setYearFilterHarvest] = useState("all");
  const yearsHarvest = useMemo(() => Array.from(new Set(allHarvestRecords.map(r => String(r.harvestDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allHarvestRecords]);
  const filteredHarvestRecords = yearFilterHarvest === "all" ? allHarvestRecords : allHarvestRecords.filter(r => String(r.harvestDate ?? "").startsWith(yearFilterHarvest));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-sm">Harvest Records</h3><div className="flex items-center gap-2"><Select value={yearFilterHarvest} onValueChange={setYearFilterHarvest}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsHarvest.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Harvest</Button></div></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "harvestDate", label: "Date", fmt: r => fmtDate(r.harvestDate) }, { key: "harvestBatchRef", label: "Batch Ref" }, { key: "quantityKg", label: "Total (kg)" }, { key: "gradeA", label: "Grade A (kg)" }, { key: "gradeB", label: "Grade B (kg)" }, { key: "preHarvestInterval", label: "PHI (days)" }, { key: "destination", label: "Destination" }]} rows={filteredHarvestRecords} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Harvest Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Harvest Date</p><p className="font-medium">{fmtDate(viewRecord.harvestDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Batch Reference</p><p className="font-medium">{fmt(viewRecord.harvestBatchRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block / Field</p><p className="font-medium">{fmt(viewRecord.blockOrField)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Quantity (kg)</p><p className="font-medium">{fmt(viewRecord.quantityKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Grade A (kg)</p><p className="font-medium">{fmt(viewRecord.gradeA)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Grade B (kg)</p><p className="font-medium">{fmt(viewRecord.gradeB)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Grade C (kg)</p><p className="font-medium">{fmt(viewRecord.gradeC)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Waste (kg)</p><p className="font-medium">{fmt(viewRecord.waste)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PHI (days)</p><p className="font-medium">{fmt(viewRecord.preHarvestInterval)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Harvested By</p><p className="font-medium">{fmt(viewRecord.harvestedBy)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Destination</p><p className="font-medium">{fmt(viewRecord.destination)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Reference</p><p className="font-medium">{fmt(viewRecord.customerReference)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Harvest Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Harvest Date *</Label><Input type="date" value={form.harvestDate ?? ""} onChange={e => setForm(f => ({ ...f, harvestDate: e.target.value }))} /></div>
            <div><Label>Batch Reference *</Label><Input value={form.harvestBatchRef ?? ""} onChange={e => setForm(f => ({ ...f, harvestBatchRef: e.target.value }))} /></div>
            <div><Label>Total Quantity (kg) *</Label><Input type="number" step="0.01" value={form.quantityKg ?? ""} onChange={e => setForm(f => ({ ...f, quantityKg: e.target.value }))} /></div>
            <div><Label>Grade A (kg)</Label><Input type="number" step="0.01" value={form.gradeA ?? ""} onChange={e => setForm(f => ({ ...f, gradeA: e.target.value }))} /></div>
            <div><Label>Grade B (kg)</Label><Input type="number" step="0.01" value={form.gradeB ?? ""} onChange={e => setForm(f => ({ ...f, gradeB: e.target.value }))} /></div>
            <div><Label>Waste (kg)</Label><Input type="number" step="0.01" value={form.waste ?? ""} onChange={e => setForm(f => ({ ...f, waste: e.target.value }))} /></div>
            <div><Label>PHI (days)</Label><Input type="number" value={form.preHarvestInterval ?? ""} onChange={e => setForm(f => ({ ...f, preHarvestInterval: e.target.value }))} /></div>
            <div><Label>Harvested By</Label><Input value={form.harvestedBy ?? ""} onChange={e => setForm(f => ({ ...f, harvestedBy: e.target.value }))} /></div>
            <div><Label>Destination</Label>
              <Select value={form.destination ?? ""} onValueChange={v => setForm(f => ({ ...f, destination: v }))}>
                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>{["Packing house – own","Packing house – third party","Direct retail (supermarket)","Wholesale market","Processor","Export","Farm shop / direct sale","Food bank / donation","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Customer Reference</Label><Input value={form.customerReference ?? ""} onChange={e => setForm(f => ({ ...f, customerReference: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── INTAKE ─────────────────────────────────────────────────────────────────

type HarvestRecord = { id: number; harvestBatchRef: string; harvestDate: string; quantityKg: string };

function useHarvestRecords(farmId: number) {
  return useQuery<HarvestRecord[]>({
    queryKey: ["horti-harvest", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-harvest-records`), { credentials: "include" }).then(r => r.json()),
  });
}

const COND_STYLE = (cond: unknown) => {
  if (cond === "Rejected") return { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
  if (cond === "Poor")     return { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" };
  if (cond === "Good" || cond === "Acceptable") return { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
  return { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" };
};

export function IntakeTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [manageLocOpen, setManageLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState("");

  const { data: records = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["fp-intake", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fresh-produce-intake`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: harvestRecords = [] } = useHarvestRecords(farmId);
  const { data: crops = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["horti-crops", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-crops`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: storageLocs = [], refetch: refetchLocs } = useQuery<Record<string, unknown>[]>({
    queryKey: ["fp-storage-locs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fresh-produce-storage-locations`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: fpMembersData, isLoading: fpMembersLoading } = useFarmMembers(farmId);
  const fpStaffNames = (fpMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const knownStaff = [...new Set(records.map(r => r.receivedBy as string).filter(Boolean))].sort() as string[];

  // Fire a toast when pre-cooling end time is reached (and no achieved temp recorded yet)
  useEffect(() => {
    const endTime = String(form.preCoolingEndTime ?? "");
    if (!endTime || form.achievedTemperatureC) return;
    const [h, m] = endTime.split(":").map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return;
    const timerId = setTimeout(() => {
      toast({ title: "Pre-cooling end time reached", description: "Record the achieved temperature for this batch.", variant: "destructive" });
    }, diff);
    return () => clearTimeout(timerId);
  }, [form.preCoolingEndTime, form.achievedTemperatureC]);

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/fresh-produce-intake`), {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fp-intake", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
      setOpen(false);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/fresh-produce-intake/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fp-intake", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const addLoc = useMutation({
    mutationFn: (name: string) => fetch(api(`farms/${farmId}/fresh-produce-storage-locations`), {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name }),
    }),
    onSuccess: () => { refetchLocs(); setNewLocName(""); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delLoc = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/fresh-produce-storage-locations/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => refetchLocs(),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function onHarvestSelect(harvestId: string) {
    if (harvestId === "__none__") { setForm(f => ({ ...f, harvestRecordId: "", harvestBatchRef: "" })); return; }
    const hr = harvestRecords.find(h => String(h.id) === harvestId);
    if (hr) setForm(f => ({ ...f, harvestRecordId: String(hr.id), harvestBatchRef: hr.harvestBatchRef, quantityKg: hr.quantityKg }));
  }

  const conditionBad = form.conditionOnArrival === "Poor" || form.conditionOnArrival === "Rejected";
  const batchRejected = form.accepted === false;

  const today = new Date().toISOString().slice(0, 10);
  const allIntakeRecords = records;
  const [yearFilterIntake, setYearFilterIntake] = useState("all");
  const yearsIntake = useMemo(() => Array.from(new Set(allIntakeRecords.map(r => String(r.intakeDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allIntakeRecords]);
  const filteredIntakeRecords = yearFilterIntake === "all" ? allIntakeRecords : allIntakeRecords.filter(r => String(r.intakeDate ?? "").startsWith(yearFilterIntake));

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Pre-Cooling / Intake Records</h3>
        <div className="flex gap-2 items-center">
          <Select value={yearFilterIntake} onValueChange={setYearFilterIntake}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsIntake.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          <Button size="sm" variant="outline" onClick={() => setManageLocOpen(true)}>
            <Warehouse className="w-3.5 h-3.5 mr-1" />Locations
          </Button>
          <Button size="sm" onClick={() => { setForm({ foreignBodyCheck: false, pestDamageCheck: false, accepted: true }); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Intake Record
          </Button>
        </div>
      </div>

      {/* ── Intake list ── */}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : filteredIntakeRecords.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No intake records yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {(["Date", "Batch", "Product", "Qty (kg)", "Condition", "Temp (°C)", "Accepted", "Checks", ""] as string[]).map(h => (
                  <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredIntakeRecords.map(r => {
                const condBad    = r.conditionOnArrival === "Poor" || r.conditionOnArrival === "Rejected";
                const notAccepted = r.accepted === false || r.accepted === "false";
                const fbMissing  = !r.foreignBodyCheck || r.foreignBodyCheck === "false";
                const pdMissing  = !r.pestDamageCheck  || r.pestDamageCheck  === "false";
                const preCoolingAlert = (() => {
                  if (!r.preCoolingEndTime || r.achievedTemperatureC) return false;
                  if (r.intakeDate !== today) return false;
                  const [hh, mm] = String(r.preCoolingEndTime).split(":").map(Number);
                  const end = new Date(); end.setHours(hh, mm, 0, 0);
                  return end < new Date();
                })();
                const cs = COND_STYLE(r.conditionOnArrival);
                const rowBg = notAccepted ? "#fef2f2" : condBad ? "#fff7ed" : "";
                return (
                  <tr key={String(r.id)} style={{ borderBottom: "1px solid #f3f4f6", background: rowBg }}>
                    <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{fmtDate(r.intakeDate)}</td>
                    <td className="py-2 pr-3">
                      {fmt(r.harvestBatchRef)}
                      {!!r.harvestRecordId && <span className="ml-1 text-xs text-green-600" title="Linked to harvest record">●</span>}
                    </td>
                    <td className="py-2 pr-3">{fmt(r.productName)}</td>
                    <td className="py-2 pr-3">{fmt(r.quantityKg)}</td>
                    <td className="py-2 pr-3">
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 6px", borderRadius: 4, display: "inline-block", background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                        {fmt(r.conditionOnArrival)}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      {fmt(r.intakeTemperatureC)}
                      {preCoolingAlert && <span className="ml-1 text-red-500 font-bold text-xs" title="Pre-cooling end time passed — achieved temp not yet recorded">⚠</span>}
                    </td>
                    <td className="py-2 pr-3">
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 6px", borderRadius: 4, display: "inline-block", background: notAccepted ? "#fef2f2" : "#f0fdf4", color: notAccepted ? "#991b1b" : "#15803d", border: `1px solid ${notAccepted ? "#fecaca" : "#bbf7d0"}` }}>
                        {notAccepted ? "Rejected" : "Yes"}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <div style={{ display: "flex", gap: 3 }}>
                        {([["FB", fbMissing, "Foreign body check"], ["PD", pdMissing, "Pest damage check"]] as [string, boolean, string][]).map(([label, missing, title]) => (
                          <span key={label} title={title} style={{ fontSize: "0.68rem", fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: missing ? "#fef2f2" : "#f0fdf4", color: missing ? "#991b1b" : "#15803d", border: `1px solid ${missing ? "#fecaca" : "#bbf7d0"}` }}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── View dialog ── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }}>
            <DialogHeader><DialogTitle>Intake Record — {fmtDate(viewRecord.intakeDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Intake Date</p><p className="font-medium">{fmtDate(viewRecord.intakeDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Harvest Batch Ref</p><p className="font-medium">{fmt(viewRecord.harvestBatchRef)}{!!viewRecord.harvestRecordId && <span className="ml-1.5 text-xs text-green-600">● Linked</span>}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmt(viewRecord.productName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity (kg)</p><p className="font-medium">{fmt(viewRecord.quantityKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Condition on Arrival</p><p className="font-medium">{fmt(viewRecord.conditionOnArrival)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Accepted</p><p className="font-medium">{viewRecord.accepted ? "Yes" : "Rejected"}</p></div>
              {!viewRecord.accepted && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Rejection Reason</p><p className="font-medium">{fmt(viewRecord.rejectionReason)}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Intake Temp (°C)</p><p className="font-medium">{fmt(viewRecord.intakeTemperatureC)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Storage Temp (°C)</p><p className="font-medium">{fmt(viewRecord.targetStorageTemperatureC)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pre-Cooling Start</p><p className="font-medium">{fmt(viewRecord.preCoolingStartTime)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pre-Cooling End</p><p className="font-medium">{fmt(viewRecord.preCoolingEndTime)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Achieved Temp (°C)</p><p className="font-medium">{fmt(viewRecord.achievedTemperatureC)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Storage Location</p><p className="font-medium">{fmt(viewRecord.storageLocation)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Received By</p><p className="font-medium">{fmt(viewRecord.receivedBy)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Foreign Body Check</p><p className="font-medium">{viewRecord.foreignBodyCheck ? "✓ Yes" : "✗ No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pest Damage Check</p><p className="font-medium">{viewRecord.pestDamageCheck ? "✓ Yes" : "✗ No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Manage Packhouse Locations dialog ── */}
      <Dialog open={manageLocOpen} onOpenChange={setManageLocOpen}>
        <DialogContent style={{ maxWidth: "32rem" }}>
          <DialogHeader><DialogTitle>Packhouse / Cold Store Locations</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Define your packhouse and cold store locations. These appear as a pick-list in the Storage Location field for full traceability (e.g. "Cold Store A — Bay 3").</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Cold Store A, Pre-cooling Chamber 1…"
                value={newLocName}
                onChange={e => setNewLocName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newLocName.trim()) addLoc.mutate(newLocName.trim()); }}
              />
              <Button onClick={() => { if (newLocName.trim()) addLoc.mutate(newLocName.trim()); }} disabled={addLoc.isPending || !newLocName.trim()}>
                <Plus className="w-4 h-4 mr-1" />Add
              </Button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {storageLocs.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">No locations yet — add your first above.</p>
              )}
              {storageLocs.map(loc => (
                <div key={String(loc.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                  <span className="text-sm">{String(loc.name)}</span>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => delLoc.mutate(loc.id as number)} disabled={delLoc.isPending}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={() => setManageLocOpen(false)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Intake Record dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Pre-Cooling / Intake Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            {/* Harvest link */}
            <div className="col-span-2">
              <Label>Link to Harvest Record</Label>
              <Select value={form.harvestRecordId ? String(form.harvestRecordId) : "__none__"} onValueChange={onHarvestSelect}>
                <SelectTrigger><SelectValue placeholder="Select harvest record…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Enter batch ref manually —</SelectItem>
                  {harvestRecords.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.harvestBatchRef} — {fmtDate(h.harvestDate)} ({fmt(h.quantityKg)} kg)</SelectItem>)}
                </SelectContent>
              </Select>
              {form.harvestRecordId && <p className="text-xs text-green-700 mt-1">✓ Linked — batch ref and quantity auto-filled. Full field-to-packhouse traceability maintained.</p>}
            </div>

            <div><Label>Intake Date *</Label><Input type="date" value={String(form.intakeDate ?? "")} onChange={e => setForm(f => ({ ...f, intakeDate: e.target.value }))} /></div>
            <div><Label>Harvest Batch Ref *</Label><Input value={String(form.harvestBatchRef ?? "")} onChange={e => setForm(f => ({ ...f, harvestBatchRef: e.target.value }))} /></div>

            {/* Product Name — datalist from crop register */}
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input
                list="fp-crop-names"
                value={String(form.productName ?? "")}
                onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                placeholder="Type or select from crop register…"
              />
              <datalist id="fp-crop-names">
                {crops.map(c => (
                  <option key={String(c.id)} value={`${String(c.cropName)}${c.variety ? ` — ${String(c.variety)}` : ""}`} />
                ))}
              </datalist>
              {crops.length > 0 && !form.productName && <p className="text-xs text-muted-foreground mt-1">Suggestions from your crop register — or type a custom name.</p>}
            </div>

            <div><Label>Quantity (kg)</Label><Input type="number" step="0.01" value={String(form.quantityKg ?? "")} onChange={e => setForm(f => ({ ...f, quantityKg: e.target.value }))} /></div>

            {/* Condition on arrival */}
            <div>
              <Label>Condition on Arrival</Label>
              <Select value={String(form.conditionOnArrival ?? "")} onValueChange={v => setForm(f => ({ ...f, conditionOnArrival: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{["Good", "Acceptable", "Poor", "Rejected"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Received By */}
            <div>
              <Label>Received By</Label>
              <StaffSelect value={String(form.receivedBy ?? "")} onChange={v => setForm(f => ({ ...f, receivedBy: v }))} staffNames={fpStaffNames} loading={fpMembersLoading} />
            </div>

            {/* Condition warning */}
            {conditionBad && (
              <div className="col-span-2" style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, fontSize: "0.82rem", color: "#9a3412", alignItems: "flex-start" }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>Poor or Rejected condition selected.</strong> Segregate this batch immediately, document the issue in full, and notify your quality/compliance manager before intake proceeds.</span>
              </div>
            )}

            <div><Label>Intake Temperature (°C)</Label><Input type="number" step="0.1" value={String(form.intakeTemperatureC ?? "")} onChange={e => setForm(f => ({ ...f, intakeTemperatureC: e.target.value }))} /></div>
            <div><Label>Target Storage Temp (°C)</Label><Input type="number" step="0.1" value={String(form.targetStorageTemperatureC ?? "")} onChange={e => setForm(f => ({ ...f, targetStorageTemperatureC: e.target.value }))} /></div>
            <div><Label>Pre-Cooling Start Time</Label><Input type="time" value={String(form.preCoolingStartTime ?? "")} onChange={e => setForm(f => ({ ...f, preCoolingStartTime: e.target.value }))} /></div>
            <div>
              <Label>Pre-Cooling End Time</Label>
              <Input type="time" value={String(form.preCoolingEndTime ?? "")} onChange={e => setForm(f => ({ ...f, preCoolingEndTime: e.target.value }))} />
              {form.preCoolingEndTime && !form.achievedTemperatureC && (
                <p className="text-xs text-blue-600 mt-1">⏰ An alert will appear when this time is reached if no achieved temperature has been recorded.</p>
              )}
            </div>
            <div><Label>Achieved Temperature (°C)</Label><Input type="number" step="0.1" value={String(form.achievedTemperatureC ?? "")} onChange={e => setForm(f => ({ ...f, achievedTemperatureC: e.target.value }))} /></div>

            {/* Storage Location — managed pick-list or free-text fallback */}
            <div>
              <Label>Storage Location</Label>
              {storageLocs.length > 0 ? (
                <Select value={String(form.storageLocation ?? "")} onValueChange={v => setForm(f => ({ ...f, storageLocation: v === "__other__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select location…" /></SelectTrigger>
                  <SelectContent>
                    {storageLocs.map(loc => <SelectItem key={String(loc.id)} value={String(loc.name)}>{String(loc.name)}</SelectItem>)}
                    <SelectItem value="__other__">Other / free text…</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input value={String(form.storageLocation ?? "")} onChange={e => setForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="Enter location…" className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => setManageLocOpen(true)} title="Add managed locations">
                    <Warehouse className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              {storageLocs.length === 0 && <p className="text-xs text-muted-foreground mt-1">Add managed locations via the Locations button for a consistent pick-list.</p>}
            </div>

            {/* Checkboxes with inline warnings */}
            <div className="col-span-2 space-y-3 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox id="foreignBodyCheck" checked={Boolean(form.foreignBodyCheck)} onCheckedChange={v => setForm(f => ({ ...f, foreignBodyCheck: Boolean(v) }))} />
                  <Label htmlFor="foreignBodyCheck">Foreign body check completed?</Label>
                </div>
                {!form.foreignBodyCheck && (
                  <p style={{ marginLeft: 24, marginTop: 4, fontSize: "0.78rem", color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }}>
                    This check is required — inspect produce thoroughly for foreign bodies before intake is recorded.
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox id="pestDamageCheck" checked={Boolean(form.pestDamageCheck)} onCheckedChange={v => setForm(f => ({ ...f, pestDamageCheck: Boolean(v) }))} />
                  <Label htmlFor="pestDamageCheck">Pest damage check completed?</Label>
                </div>
                {!form.pestDamageCheck && (
                  <p style={{ marginLeft: 24, marginTop: 4, fontSize: "0.78rem", color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }}>
                    Inspect produce for pest damage and contamination before storing.
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox id="accepted" checked={form.accepted !== false} onCheckedChange={v => setForm(f => ({ ...f, accepted: Boolean(v) }))} />
                  <Label htmlFor="accepted">Batch accepted into store?</Label>
                </div>
                {batchRejected && (
                  <p style={{ marginLeft: 24, marginTop: 4, fontSize: "0.78rem", color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }}>
                    <strong>Rejection:</strong> Quarantine this batch, complete the rejection reason below, and notify your quality/compliance manager immediately.
                  </p>
                )}
              </div>
            </div>

            {form.accepted === false && (
              <div className="col-span-2">
                <Label>Rejection Reason</Label>
                <Textarea value={String(form.rejectionReason ?? "")} onChange={e => setForm(f => ({ ...f, rejectionReason: e.target.value }))} rows={2} placeholder="Describe why this batch was rejected…" />
              </div>
            )}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form as Record<string, unknown>)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── PACKHOUSE ──────────────────────────────────────────────────────────────

export function PackhouseTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-packhouse", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: harvestRecords = [] } = useHarvestRecords(farmId);
  const { data: intakeRecords = [] } = useQuery<Record<string, unknown>[]>({ queryKey: ["fp-intake", farmId], queryFn: () => fetch(api(`farms/${farmId}/fresh-produce-intake`), { credentials: "include" }).then(r => r.json()) });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] }); setOpen(false); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-packhouse-records/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function onHarvestSelect(harvestId: string) {
    if (harvestId === "__none__") { setForm(f => ({ ...f, harvestRecordId: "", harvestBatchRef: "" })); return; }
    const hr = harvestRecords.find(h => String(h.id) === harvestId);
    if (hr) setForm(f => ({ ...f, harvestRecordId: String(hr.id), harvestBatchRef: hr.harvestBatchRef }));
  }

  function onIntakeSelect(intakeId: string) {
    if (intakeId === "__none__") { setForm(f => ({ ...f, intakeRecordId: "" })); return; }
    const ir = intakeRecords.find(r => String(r.id) === intakeId);
    if (ir) setForm(f => ({ ...f, intakeRecordId: String(ir.id), harvestBatchRef: String(ir.harvestBatchRef ?? f.harvestBatchRef), productName: String(ir.productName ?? f.productName) }));
  }

  const allPackhouseRecords = records as Record<string, unknown>[];
  const [yearFilterPackhouse, setYearFilterPackhouse] = useState("all");
  const yearsPackhouse = useMemo(() => Array.from(new Set(allPackhouseRecords.map(r => String(r.packingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allPackhouseRecords]);
  const filteredPackhouseRecords = yearFilterPackhouse === "all" ? allPackhouseRecords : allPackhouseRecords.filter(r => String(r.packingDate ?? "").startsWith(yearFilterPackhouse));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Packhouse & Despatch Records</h3>
        <div className="flex items-center gap-2"><Select value={yearFilterPackhouse} onValueChange={setYearFilterPackhouse}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsPackhouse.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={() => { setForm({ labelChecked: false, metalDetectorCheck: false, allergenCheck: false }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Record
        </Button></div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "packingDate", label: "Packing Date", fmt: r => fmtDate(r.packingDate) },
            { key: "harvestBatchRef", label: "Batch Ref" },
            { key: "productName", label: "Product" },
            { key: "traceabilityCode", label: "Traceability Code" },
            { key: "quantityPackedKg", label: "Qty (kg)" },
            { key: "customerName", label: "Customer" },
          ]}
          rows={filteredPackhouseRecords}
          onView={setViewRecord}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }}>
            <DialogHeader><DialogTitle>Packhouse Record — {fmtDate(viewRecord.packingDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Packing Date</p><p className="font-medium">{fmtDate(viewRecord.packingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Harvest Batch Ref</p><p className="font-medium">{fmt(viewRecord.harvestBatchRef)}{!!viewRecord.harvestRecordId && <span className="ml-1.5 text-xs text-green-600">● Linked to harvest</span>}</p></div>
              {!!viewRecord.intakeRecordId && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Intake Record</p><p className="font-medium text-green-700">● Linked to pre-cooling intake record</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmt(viewRecord.productName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Traceability Code</p><p className="font-medium">{fmt(viewRecord.traceabilityCode)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Packed (kg)</p><p className="font-medium">{fmt(viewRecord.quantityPackedKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pack Format</p><p className="font-medium">{fmt(viewRecord.packFormat)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cold Store Temp (°C)</p><p className="font-medium">{fmt(viewRecord.coldStoreTemperature)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Name</p><p className="font-medium">{fmt(viewRecord.customerName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Despatch Date</p><p className="font-medium">{fmtDate(viewRecord.dispatchDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Despatch Note No.</p><p className="font-medium">{fmt(viewRecord.despatchNoteNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Label Checked</p><p className="font-medium">{viewRecord.labelChecked ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Metal Detector Check</p><p className="font-medium">{viewRecord.metalDetectorCheck ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Allergen Check</p><p className="font-medium">{viewRecord.allergenCheck ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Packhouse Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Link to Harvest Record</Label>
              <Select value={form.harvestRecordId ? String(form.harvestRecordId) : "__none__"} onValueChange={onHarvestSelect}>
                <SelectTrigger><SelectValue placeholder="Select harvest record…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Enter batch ref manually —</SelectItem>
                  {harvestRecords.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.harvestBatchRef} — {fmtDate(h.harvestDate)} ({fmt(h.quantityKg)} kg)</SelectItem>)}
                </SelectContent>
              </Select>
              {form.harvestRecordId && <p className="text-xs text-green-700 mt-1">✓ Linked to harvest record.</p>}
            </div>
            {intakeRecords.length > 0 && (
              <div className="col-span-2">
                <Label>Link to Pre-Cooling / Intake Record</Label>
                <Select value={form.intakeRecordId ? String(form.intakeRecordId) : "__none__"} onValueChange={onIntakeSelect}>
                  <SelectTrigger><SelectValue placeholder="Select intake record…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No intake record —</SelectItem>
                    {intakeRecords.map((r: Record<string, unknown>) => <SelectItem key={r.id as number} value={String(r.id)}>{String(r.harvestBatchRef)} — {fmtDate(r.intakeDate)} — {String(r.productName)}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.intakeRecordId && <p className="text-xs text-green-700 mt-1">✓ Linked — full field → intake → packhouse chain complete.</p>}
              </div>
            )}
            <div><Label>Packing Date *</Label><Input type="date" value={String(form.packingDate ?? "")} onChange={e => setForm(f => ({ ...f, packingDate: e.target.value }))} /></div>
            <div><Label>Harvest Batch Ref *</Label><Input value={String(form.harvestBatchRef ?? "")} onChange={e => setForm(f => ({ ...f, harvestBatchRef: e.target.value }))} /></div>
            <div><Label>Product Name *</Label><Input value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Traceability Code *</Label><Input value={String(form.traceabilityCode ?? "")} onChange={e => setForm(f => ({ ...f, traceabilityCode: e.target.value }))} /></div>
            <div><Label>Quantity Packed (kg)</Label><Input type="number" step="0.01" value={String(form.quantityPackedKg ?? "")} onChange={e => setForm(f => ({ ...f, quantityPackedKg: e.target.value }))} /></div>
            <div><Label>Pack Format</Label><Input value={String(form.packFormat ?? "")} onChange={e => setForm(f => ({ ...f, packFormat: e.target.value }))} /></div>
            <div><Label>Cold Store Temp (°C)</Label><Input type="number" step="0.1" value={String(form.coldStoreTemperature ?? "")} onChange={e => setForm(f => ({ ...f, coldStoreTemperature: e.target.value }))} /></div>
            <div><Label>Customer Name</Label><Input value={String(form.customerName ?? "")} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} /></div>
            <div><Label>Despatch Date</Label><Input type="date" value={String(form.dispatchDate ?? "")} onChange={e => setForm(f => ({ ...f, dispatchDate: e.target.value }))} /></div>
            <div><Label>Despatch Note No.</Label><Input value={String(form.despatchNoteNumber ?? "")} onChange={e => setForm(f => ({ ...f, despatchNoteNumber: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2">
              {([["labelChecked", "Label checked?"], ["metalDetectorCheck", "Metal detector check?"], ["allergenCheck", "Allergen check completed?"]] as [string, string][]).map(([k, l]) => (
                <div key={k} className="flex items-center gap-2"><Checkbox id={k} checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: Boolean(v) }))} /><Label htmlFor={k}>{l}</Label></div>
              ))}
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form as Record<string, unknown>)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── ALLERGENS ──────────────────────────────────────────────────────────────

export function AllergenTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-allergen", farmId], queryFn: () => fetch(api(`farms/${farmId}/allergen-management`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/allergen-management`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] }); setOpen(false); setForm({}); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/allergen-management/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const allAllergenRecords = records as Record<string, unknown>[];
  const [yearFilterAllergen, setYearFilterAllergen] = useState("all");
  const yearsAllergen = useMemo(() => Array.from(new Set(allAllergenRecords.map(r => String(r.reviewDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allAllergenRecords]);
  const filteredAllergenRecords = yearFilterAllergen === "all" ? allAllergenRecords : allAllergenRecords.filter(r => String(r.reviewDate ?? "").startsWith(yearFilterAllergen));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-sm">Allergen Management Reviews</h3><div className="flex items-center gap-2"><Select value={yearFilterAllergen} onValueChange={setYearFilterAllergen}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsAllergen.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={() => { setForm({ labellingVerified: false }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Review</Button></div></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "reviewDate", label: "Review Date", fmt: r => fmtDate(r.reviewDate) }, { key: "reviewedBy", label: "Reviewed By" }, { key: "crossContaminationRisk", label: "Cross-Contamination Risk" }, { key: "nextReviewDate", label: "Next Review", fmt: r => fmtDate(r.nextReviewDate) }, { key: "labellingVerified", label: "Labelling Verified", fmt: r => r.labellingVerified ? "Yes" : "No" }]} rows={filteredAllergenRecords} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Allergen Review — {fmtDate(viewRecord.reviewDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p><p className="font-medium">{fmtDate(viewRecord.reviewDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reviewed By</p><p className="font-medium">{fmt(viewRecord.reviewedBy)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cross Contamination Risk</p><p className="font-medium">{fmt(viewRecord.crossContaminationRisk)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Staff Training Date</p><p className="font-medium">{fmtDate(viewRecord.staffTrainingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Review Date</p><p className="font-medium">{fmtDate(viewRecord.nextReviewDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Labelling Verified</p><p className="font-medium">{viewRecord.labellingVerified ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Control Measures</p><p className="font-medium">{fmt(viewRecord.controlMeasures)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Allergen Management Review</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Review Date *</Label><Input type="date" value={String(form.reviewDate ?? "")} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} /></div>
            <div><Label>Reviewed By *</Label><Input value={String(form.reviewedBy ?? "")} onChange={e => setForm(f => ({ ...f, reviewedBy: e.target.value }))} /></div>
            <div><Label>Cross-Contamination Risk *</Label>
              <Select value={String(form.crossContaminationRisk ?? "")} onValueChange={v => setForm(f => ({ ...f, crossContaminationRisk: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["None", "Low", "Medium", "High"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Staff Training Date</Label><Input type="date" value={String(form.staffTrainingDate ?? "")} onChange={e => setForm(f => ({ ...f, staffTrainingDate: e.target.value }))} /></div>
            <div><Label>Next Review Date</Label><Input type="date" value={String(form.nextReviewDate ?? "")} onChange={e => setForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4"><Checkbox id="label" checked={Boolean(form.labellingVerified)} onCheckedChange={v => setForm(f => ({ ...f, labellingVerified: Boolean(v) }))} /><Label htmlFor="label">Labelling verified?</Label></div>
            <div className="col-span-2"><Label>Control Measures</Label><Textarea value={String(form.controlMeasures ?? "")} onChange={e => setForm(f => ({ ...f, controlMeasures: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form as Record<string, unknown>)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────

type Tab = "blocks" | "crops" | "water" | "harvest" | "intake" | "packhouse" | "allergen" | "reports";

export default function FreshProducePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab") as Tab | null;
    const valid: Tab[] = ["blocks", "crops", "water", "harvest", "intake", "packhouse", "allergen", "reports"];
    return t && valid.includes(t) ? t : "blocks";
  });
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Fresh Produce">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")}><LayoutGrid className="w-3.5 h-3.5 mr-1" />Blocks</TabButton>
          <TabButton active={tab === "crops"} onClick={() => setTab("crops")}><Leaf className="w-3.5 h-3.5 mr-1" />Crops</TabButton>
          <TabButton active={tab === "water"} onClick={() => setTab("water")}><Droplets className="w-3.5 h-3.5 mr-1" />Water Tests</TabButton>
          <TabButton active={tab === "harvest"} onClick={() => setTab("harvest")}><Package className="w-3.5 h-3.5 mr-1" />Harvest</TabButton>
          <TabButton active={tab === "intake"} onClick={() => setTab("intake")}><Thermometer className="w-3.5 h-3.5 mr-1" />Intake</TabButton>
          <TabButton active={tab === "packhouse"} onClick={() => setTab("packhouse")}><Warehouse className="w-3.5 h-3.5 mr-1" />Packhouse</TabButton>
          <TabButton active={tab === "allergen"} onClick={() => setTab("allergen")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Allergens</TabButton>
          <TabButton active={tab === "reports"} onClick={() => setTab("reports")}><TrendingUp className="w-3.5 h-3.5 mr-1" />Season Report</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "blocks" && <BlocksTab farmId={farmId} />}
          {tab === "crops" && <CropsTab farmId={farmId} />}
          {tab === "water" && <WaterTestsTab farmId={farmId} />}
          {tab === "harvest" && <HarvestTab farmId={farmId} />}
          {tab === "intake" && <IntakeTab farmId={farmId} />}
          {tab === "packhouse" && <PackhouseTab farmId={farmId} />}
          {tab === "allergen" && <AllergenTab farmId={farmId} />}
          {tab === "reports" && <FreshProduceReports farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
