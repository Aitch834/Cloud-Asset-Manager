import { fetchWineryJson, today, CLEAN_TYPE_OPTIONS, fmtDate, fmt, useCrud, exportCSV, csvComment, QueryErrorNotice, EmptyState, fmtNum, NotesCell, VESSEL_TYPE_OPTIONS, VESSEL_STATUS_OPTIONS, SectionLabel, TOASTING_OPTIONS, ViewField } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
import { useFarmName } from "@/hooks/use-farm-name";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { BOTTLING_COLUMNS, BOTTLING_IMPORT_HEADERS, resolveBottlingField, bottlingImportRecord, parseCsvText, parseBottlingCsv } from "@/lib/bottling-csv";
import { computePrimaryPhTa, computePhTaStagePoints } from "@/lib/ph-ta-stages";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Eye, FlaskConical, Wine, Beaker, Gauge, Thermometer, Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Wrench, ShieldCheck, FileDown, Printer, Settings2, RefreshCw, GitBranch, Leaf, Search, Upload, PenLine, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import SignatureCanvas from "react-signature-canvas";

import { apiUrl as api } from "@/lib/api";

// ─── Barrel Fill History ──────────────────────────────────────────────────────
function fillOakLabel(fillNumber: number): { label: string; cls: string } {
  if (fillNumber === 1) return { label: "New oak", cls: "bg-amber-100 text-amber-800" };
  if (fillNumber === 2) return { label: "2nd fill", cls: "bg-yellow-100 text-yellow-800" };
  if (fillNumber === 3) return { label: "3rd fill", cls: "bg-lime-100 text-lime-700" };
  if (fillNumber === 4) return { label: "4th fill", cls: "bg-blue-100 text-blue-700" };
  return { label: `${fillNumber}th fill – neutral`, cls: "bg-gray-100 text-gray-600" };
}

function durationLabel(fillDate: unknown, rackOutDate: unknown): string {
  const start = fillDate ? new Date(String(fillDate)) : null;
  if (!start || isNaN(start.getTime())) return "—";
  const end = rackOutDate ? new Date(String(rackOutDate)) : new Date();
  const days = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (days < 0) return "—";
  if (days < 31) return `${days}d`;
  const months = Math.floor(days / 30.44);
  return months < 12 ? `${months} mo` : `${Math.floor(months / 12)}y ${months % 12}mo`;
}

export function BarrelFillHistory({ farmId, vesselId, maxExistingFill }: { farmId: number; vesselId: number; maxExistingFill: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const qKey = ["winery-barrel-fills", farmId, vesselId];

  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/fills`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load fill history");
      return ((await res.json()).records ?? []) as Record<string, unknown>[];
    },
    enabled: !!vesselId,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingFill, setEditingFill] = useState<Record<string, unknown> | null>(null);
  const nextFill = Math.max(maxExistingFill, (data ?? []).length > 0 ? Math.max(...(data ?? []).map(d => Number(d.fill_number))) : 0) + 1;
  const blankForm = () => ({ fillNumber: String(nextFill) });
  const [form, setForm] = useState<Record<string, string>>(blankForm());
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setEditingFill(null); setForm({ fillNumber: String(nextFill) }); setShowAdd(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditingFill(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setShowAdd(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const isEdit = !!editingFill;
      const url = isEdit
        ? api(`farms/${farmId}/winery-vessels/${vesselId}/fills/${editingFill!.id}`)
        : api(`farms/${farmId}/winery-vessels/${vesselId}/fills`);
      const r = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
      setShowAdd(false); setEditingFill(null); setForm(blankForm());
      toast({ title: editingFill ? "Fill record updated" : "Fill record added" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: async (fillId: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/fills/${fillId}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] }); },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const highestFill = (data ?? []).length > 0 ? Math.max(...(data ?? []).map(d => Number(d.fill_number))) : 0;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fill History</p>
          {highestFill >= 4 && (
            <span className="text-xs bg-orange-100 text-orange-700 rounded px-1.5 py-0.5 font-medium">
              ⚠ Fill {highestFill} — approaching neutral oak
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openAdd}>
          <Plus className="w-3 h-3 mr-1" />Log Fill
        </Button>
      </div>

      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{editingFill ? "Edit fill record" : "New fill record"}</p>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Fill Number *</Label><Input type="number" min="1" value={form.fillNumber ?? ""} onChange={e => sf("fillNumber", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Vintage Year</Label><Input type="number" min="1900" max="2100" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} className="h-8 text-xs" placeholder="e.g. 2024" /></div>
            <div><Label className="text-xs">Wine Name</Label><Input value={form.wineName ?? ""} onChange={e => sf("wineName", e.target.value)} className="h-8 text-xs" placeholder="e.g. Bacchus 2024" /></div>
            <div><Label className="text-xs">Variety</Label><Input value={form.variety ?? ""} onChange={e => sf("variety", e.target.value)} className="h-8 text-xs" placeholder="e.g. Chardonnay" /></div>
            <div><Label className="text-xs">Volume (L)</Label><Input type="number" step="0.5" value={form.volumeLitres ?? ""} onChange={e => sf("volumeLitres", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Batch Ref</Label><Input value={form.batchRef ?? ""} onChange={e => sf("batchRef", e.target.value)} className="h-8 text-xs" placeholder="e.g. WB-2024-01" /></div>
            <div><Label className="text-xs">Fill Date (wine in)</Label><Input type="date" value={form.fillDate ?? ""} onChange={e => sf("fillDate", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Rack-out Date (wine out)</Label><Input type="date" value={form.rackOutDate ?? ""} onChange={e => sf("rackOutDate", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Operator</Label><Input value={form.operatorName ?? ""} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <DialogMutationError mutation={saveMut} />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => saveMut.mutate()} disabled={!form.fillNumber || saveMut.isPending}>
              {saveMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setShowAdd(false); setEditingFill(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
       isError ? <QueryErrorNotice label="fill history" error={error} /> :
       (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No fill records yet. Log the first fill to start the barrel's history.</p> : (
        <div className="space-y-2">
          {(data ?? []).map(f => {
            const oak = fillOakLabel(Number(f.fill_number));
            const stillIn = !f.rack_out_date;
            return (
              <div key={String(f.id)} className="border rounded-lg px-3 py-2 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 font-semibold text-xs ${oak.cls}`}>{oak.label}</span>
                    {!!f.wine_name && <span className="font-medium">{String(f.wine_name)}</span>}
                    {!!f.vintage_year && <span className="text-muted-foreground">({String(f.vintage_year)})</span>}
                    {!!f.variety && <span className="text-muted-foreground">— {String(f.variety)}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(f)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(f.id))}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  {!!f.fill_date && <span>In: {fmtDate(f.fill_date)}</span>}
                  {f.rack_out_date ? <span>Out: {fmtDate(f.rack_out_date)}</span> : <span className="text-green-700 font-medium">Still maturing</span>}
                  <span className="font-medium text-foreground">{durationLabel(f.fill_date, f.rack_out_date)}{stillIn ? " so far" : ""}</span>
                  {!!f.volume_litres && <span>{fmtNum(f.volume_litres, 0)} L</span>}
                  {!!f.batch_ref && <span>Batch: {String(f.batch_ref)}</span>}
                </div>
                {!!f.notes && <p className="text-muted-foreground italic">{String(f.notes)}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const MAINTENANCE_WORK_TYPE_OPTIONS = [
  "Inspection",
  "Stave repair",
  "Head replacement",
  "Re-toast",
  "Re-char",
  "Re-cooper",
  "Condemned",
];

export function BarrelMaintenanceLog({ farmId, vesselId }: { farmId: number; vesselId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const qKey = ["winery-barrel-maintenance", farmId, vesselId];

  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/maintenance`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load maintenance log");
      return ((await res.json()).records ?? []) as Record<string, unknown>[];
    },
    enabled: !!vesselId,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ maintenanceDate: today });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addMut = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { ...form };
      if (form.costGbp) payload.costPence = String(Math.round(parseFloat(form.costGbp) * 100));
      delete payload.costGbp;
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/maintenance`), {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string,string>).error || "Save failed"); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      setShowAdd(false);
      setForm({ maintenanceDate: today });
      toast({ title: "Maintenance record added" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/maintenance/${id}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const totalSpendPence = useMemo(() => (data ?? []).reduce((sum, m) => sum + (m.cost_pence != null ? Number(m.cost_pence) : 0), 0), [data]);
  const recordsWithCost = useMemo(() => (data ?? []).filter(m => m.cost_pence != null).length, [data]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cooperage / Maintenance</p>
          {!isLoading && !isError && recordsWithCost > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Total spend: <span className="font-medium text-foreground">£{(totalSpendPence / 100).toFixed(2)}</span> across {recordsWithCost} record{recordsWithCost !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(s => !s)}>
          <Plus className="w-3 h-3 mr-1" />Log Work
        </Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Date *</Label><Input type="date" max={today} value={form.maintenanceDate ?? ""} onChange={e => sf("maintenanceDate", e.target.value)} className="h-8 text-xs" /></div>
            <div>
              <Label className="text-xs">Work Type *</Label>
              <Select value={form.workType ?? ""} onValueChange={v => sf("workType", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{MAINTENANCE_WORK_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Cooperage Name</Label><Input value={form.cooperageName ?? ""} onChange={e => sf("cooperageName", e.target.value)} className="h-8 text-xs" placeholder="e.g. Demptos, local cooper" /></div>
            <div><Label className="text-xs">Cost (£)</Label><Input type="number" step="0.01" min="0" value={form.costGbp ?? ""} onChange={e => sf("costGbp", e.target.value)} className="h-8 text-xs" placeholder="e.g. 45.00" /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <DialogMutationError mutation={addMut} />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!form.maintenanceDate || !form.workType || addMut.isPending}>
              {addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
       isError ? <QueryErrorNotice label="maintenance records" error={error} /> :
       (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No cooperage or maintenance records yet.</p> : (
        <div className="space-y-1">
          {(data ?? []).map(m => (
            <div key={String(m.id)} className="flex items-start justify-between text-xs border rounded px-3 py-2 gap-2">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{fmtDate(m.maintenance_date)}</span>
                  <span className="text-foreground font-semibold">{String(m.work_type)}</span>
                  {!!m.cooperage_name && <span className="text-muted-foreground">— {String(m.cooperage_name)}</span>}
                </div>
                {m.cost_pence != null && <div className="text-muted-foreground">Cost: £{(Number(m.cost_pence) / 100).toFixed(2)}</div>}
                {!!m.notes && <div className="italic text-muted-foreground">{String(m.notes)}</div>}
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500 shrink-0" onClick={() => delMut.mutate(Number(m.id))}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MOVEMENT_REASON_OPTIONS = [
  "Move within cellar",
  "Move to fermentation area",
  "Move to maturation cellar",
  "Transfer to bonded warehouse",
  "Return from bonded warehouse",
  "Move to cold store",
  "Maintenance move",
  "Other",
];

export function BarrelMovementLog({ farmId, vesselId, currentZone, currentPosition }: {
  farmId: number; vesselId: number; currentZone?: string; currentPosition?: string;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const qKey = ["winery-barrel-movements", farmId, vesselId];

  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/movements`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load movement log");
      return ((await res.json()).records ?? []) as Record<string, unknown>[];
    },
    enabled: !!vesselId,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ movedDate: today, fromZone: currentZone ?? "", fromPosition: currentPosition ?? "" });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/movements`), {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
      setShowAdd(false);
      setForm({ movedDate: today, fromZone: form.toZone ?? "", fromPosition: form.toPosition ?? "" });
      toast({ title: "Movement logged" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/movements/${id}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] }); },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location History</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(s => !s)}>
          <Plus className="w-3 h-3 mr-1" />Log Move
        </Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Date *</Label><Input type="date" max={today} value={form.movedDate ?? ""} onChange={e => sf("movedDate", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Reason</Label>
              <Select value={form.reason ?? ""} onValueChange={v => sf("reason", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{MOVEMENT_REASON_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">From Zone</Label><Input value={form.fromZone ?? ""} onChange={e => sf("fromZone", e.target.value)} className="h-8 text-xs" placeholder="e.g. Cellar A" /></div>
            <div><Label className="text-xs">From Position</Label><Input value={form.fromPosition ?? ""} onChange={e => sf("fromPosition", e.target.value)} className="h-8 text-xs" placeholder="e.g. R2-P4" /></div>
            <div><Label className="text-xs">To Zone *</Label><Input value={form.toZone ?? ""} onChange={e => sf("toZone", e.target.value)} className="h-8 text-xs" placeholder="e.g. Bonded Warehouse" /></div>
            <div><Label className="text-xs">To Position</Label><Input value={form.toPosition ?? ""} onChange={e => sf("toPosition", e.target.value)} className="h-8 text-xs" placeholder="e.g. Bay 3-Shelf 2" /></div>
            <div><Label className="text-xs">Operator</Label><Input value={form.operatorName ?? ""} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <DialogMutationError mutation={addMut} />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!form.movedDate || !form.toZone || addMut.isPending}>
              {addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save Move
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
       isError ? <QueryErrorNotice label="movement log" error={error} /> :
       (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No movements recorded yet. Log a move to start tracking this barrel's location history.</p> : (
        <div className="space-y-1">
          {(data ?? []).map(m => (
            <div key={String(m.id)} className="flex items-start justify-between text-xs border rounded px-3 py-2 gap-2">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{fmtDate(m.moved_date)}</span>
                  {!!m.reason && <span className="text-muted-foreground">{String(m.reason)}</span>}
                </div>
                <div className="text-muted-foreground">
                  {!!m.from_zone && <span>From: <span className="text-foreground font-medium">{String(m.from_zone)}{m.from_position ? ` / ${String(m.from_position)}` : ""}</span> → </span>}
                  To: <span className="text-foreground font-medium">{String(m.to_zone)}{m.to_position ? ` / ${String(m.to_position)}` : ""}</span>
                </div>
                {!!m.operator_name && <div className="text-muted-foreground">By: {String(m.operator_name)}</div>}
                {!!m.notes && <div className="italic text-muted-foreground">{String(m.notes)}</div>}
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500 shrink-0" onClick={() => delMut.mutate(Number(m.id))}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VesselCleanRow({ farmId, vesselId }: { farmId: number; vesselId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-vessel-cleans", farmId, vesselId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-vessels/${vesselId}/cleans`)).records ?? []) as Record<string, unknown>[],
    enabled: !!vesselId,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({ cleanDate: today, rinseCompleted: "true" });
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const addMut = useMutation({
    mutationFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/cleans`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); } },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-vessel-cleans", farmId, vesselId] }); setShowAdd(false); setForm({ cleanDate: today, rinseCompleted: "true" }); toast({ title: "Clean record added" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: async (cleanId: number) => { const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/cleans/${cleanId}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["winery-vessel-cleans", farmId, vesselId] }),
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cleaning History</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(s => !s)}><Plus className="w-3 h-3 mr-1" />Log Clean</Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Clean Date *</Label><Input type="date" max={today} value={String(form.cleanDate ?? "")} onChange={e => sf("cleanDate", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Clean Type</Label>
              <Select value={String(form.cleanType ?? "")} onValueChange={v => sf("cleanType", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CLEAN_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Cleaning Product</Label><Input value={String(form.cleaningProduct ?? "")} onChange={e => sf("cleaningProduct", e.target.value)} className="h-8 text-xs" placeholder="e.g. Citric acid 2%" /></div>
            <div><Label className="text-xs">Concentration (%)</Label><Input type="number" step="0.01" value={String(form.concentrationPct ?? "")} onChange={e => sf("concentrationPct", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Water Temp (°C)</Label><Input type="number" step="0.1" value={String(form.waterTempC ?? "")} onChange={e => sf("waterTempC", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Contact Time (min)</Label><Input type="number" value={String(form.contactTimeMin ?? "")} onChange={e => sf("contactTimeMin", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Operator</Label><Input value={String(form.operatorName ?? "")} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="rinse-chk" checked={form.rinseCompleted !== "false" && form.rinseCompleted !== false} onCheckedChange={v => sf("rinseCompleted", v ? "true" : "false")} />
            <Label htmlFor="rinse-chk" className="text-xs cursor-pointer">Final rinse completed</Label>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!form.cleanDate || addMut.isPending}>{addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save Clean</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isError ? <QueryErrorNotice label="cleaning records" error={error} /> : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No cleaning records yet.</p> : (
        <div className="space-y-1">
          {(data ?? []).map(c => (
            <div key={String(c.id)} className="flex items-center justify-between text-xs border rounded px-3 py-1.5">
              <span className="font-medium">{fmtDate(c.clean_date)}</span>
              <span className="text-muted-foreground">{fmt(c.clean_type)}</span>
              <span className="text-muted-foreground">{fmt(c.cleaning_product)}</span>
              <span>{c.rinse_completed ? <span className="text-green-700">Rinse ✓</span> : <span className="text-red-600">No rinse</span>}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(c.id))}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VesselRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const farmNameVessels = useFarmName(farmId);
  const crud = useCrud(farmId, "winery-vessels", "winery-vessels");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isBarrel = form.vesselType?.toLowerCase().includes("barrel") || form.vesselType?.toLowerCase().includes("barrique");

  const openAdd = () => { setEditing(null); setForm({ status: "active" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...form } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(form);
      toast({ title: "Saved" }); setOpen(false);
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const statusBadge = (s: unknown) => {
    const v = String(s ?? "active");
    if (v === "active") return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Active</span>;
    if (v === "retired") return <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Retired</span>;
    return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">{v}</span>;
  };
  const vesselCsvCols = [
    { key: "vessel_ref", label: "Vessel Ref" },
    { key: "vessel_type", label: "Vessel Type" },
    { key: "capacity_litres", label: "Capacity (L)" },
    { key: "location", label: "Location" },
    { key: "current_contents", label: "Current Contents" },
    { key: "volume_current_litres", label: "Current Volume (L)" },
    { key: "status", label: "Status" },
    { key: "last_cleaned_date", label: "Last Cleaned", fmt: (r: Record<string, unknown>) => fmtDate(r.last_cleaned_date) },
    { key: "notes", label: "Notes" },
  ];

  // Cellar stock summary — barrels only, grouped by cellar_zone
  const barrels = crud.data.filter(r => {
    const t = String(r.vessel_type ?? "").toLowerCase();
    return t.includes("barrel") || t.includes("barrique");
  });
  const cellarZones = Array.from(new Set(barrels.map(r => String(r.cellar_zone || "Unassigned")))).sort();
  const [zoneFilter, setZoneFilter] = useState<string | null>(null);

  // Fill-tier + idle summary filter
  type FlagFilter = "fill-1" | "fill-2" | "fill-3" | "fill-4" | "fill-5plus" | "approaching-neutral" | "idle" | null;
  const [flagFilter, setFlagFilter] = useState<FlagFilter>(null);

  // Helper: days since a date string
  function daysSince(dateStr: unknown): number | null {
    if (!dateStr) return null;
    const d = new Date(String(dateStr));
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  // Barrel health stats derived from vessel data (fill_number kept in sync by API)
  const barrelStats = useMemo(() => {
    const tier: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5plus": 0 };
    let approaching = 0;
    let idle = 0;
    for (const r of barrels) {
      if (String(r.status ?? "active") !== "active") continue;
      const fill = Number(r.fill_number ?? 0);
      if (fill === 1) tier["1"]++;
      else if (fill === 2) tier["2"]++;
      else if (fill === 3) tier["3"]++;
      else if (fill === 4) tier["4"]++;
      else if (fill >= 5) tier["5plus"]++;
      if (fill >= 4) approaching++;
      // Idle: no open fill (is_full=false) AND empty for >90 days
      const isEmpty = !r.is_full;
      if (isEmpty) {
        const since = daysSince(r.empty_since);
        if (since !== null && since > 90) idle++;
      }
    }
    return { tier, approaching, idle };
  }, [barrels]);

  // Check if a barrel matches the active flag filter
  function matchesFlagFilter(r: Record<string, unknown>): boolean {
    if (!flagFilter) return true;
    const fill = Number(r.fill_number ?? 0);
    const isEmpty = !r.is_full;
    const since = daysSince(r.empty_since);
    if (flagFilter === "fill-1") return fill === 1;
    if (flagFilter === "fill-2") return fill === 2;
    if (flagFilter === "fill-3") return fill === 3;
    if (flagFilter === "fill-4") return fill === 4;
    if (flagFilter === "fill-5plus") return fill >= 5;
    if (flagFilter === "approaching-neutral") return fill >= 4;
    if (flagFilter === "idle") return isEmpty && since !== null && since > 90;
    return true;
  }

  const filteredData = crud.data.filter(r => {
    const t = String(r.vessel_type ?? "").toLowerCase();
    const isBarrelType = t.includes("barrel") || t.includes("barrique");
    if (zoneFilter) {
      if (!isBarrelType) return false;
      if (String(r.cellar_zone || "Unassigned") !== zoneFilter) return false;
    }
    if (flagFilter) {
      if (!isBarrelType) return false;
      if (!matchesFlagFilter(r)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Tank & Vessel Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Register all winery vessels — tanks, barrels, amphorae — with capacity, current contents, and cleaning history. Used as a reference in fermentation, cellar ops, SO₂ testing, and bottling records.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "vessels.csv", vesselCsvCols, [
            csvComment(`Tank & Vessel Register — ${farmNameVessels}`),
            csvComment("Scope: All vessels (no filters on this register)"),
          ])} disabled={!crud.data.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Vessel</Button>
        </div>
      </div>

      {/* Cellar Stock Summary — only shown when barrel-type vessels exist */}
      {barrels.length > 0 && (
        <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cellar Stock — Barrels</p>
            {(zoneFilter || flagFilter) && (
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { setZoneFilter(null); setFlagFilter(null); }}>
                Show all
              </Button>
            )}
          </div>

          {/* Barrel health CSV export — respects active zone/flag filter */}
          {(() => {
            const exportBarrels = barrels.filter(r => {
              if (String(r.status ?? "active") !== "active") return false;
              if (zoneFilter && String(r.cellar_zone || "Unassigned") !== zoneFilter) return false;
              if (flagFilter && !matchesFlagFilter(r)) return false;
              return true;
            });
            const scopeParts: string[] = [];
            if (zoneFilter) scopeParts.push(`Zone: ${zoneFilter}`);
            if (flagFilter === "approaching-neutral") scopeParts.push("Flag: approaching neutral (fill 4+)");
            else if (flagFilter === "idle") scopeParts.push("Flag: idle >90 days");
            else if (flagFilter) scopeParts.push(`Fill tier: ${flagFilter}`);
            const barrelHealthCols: { key: string; label: string; fmt: (r: Record<string, unknown>) => string }[] = [
              { key: "vessel_ref", label: "Vessel Ref", fmt: r => String(r.vessel_ref ?? "") },
              { key: "vessel_type", label: "Vessel Type", fmt: r => String(r.vessel_type ?? "") },
              { key: "cellar_zone", label: "Cellar Zone", fmt: r => String(r.cellar_zone ?? "") },
              { key: "fill_number", label: "Fill Number", fmt: r => r.fill_number != null ? String(r.fill_number) : "" },
              { key: "_fill_tier", label: "Fill Tier", fmt: r => fillOakLabel(Number(r.fill_number ?? 0)).label },
              { key: "is_full", label: "Is Full", fmt: r => r.is_full ? "Yes" : "No" },
              { key: "empty_since", label: "Empty Since", fmt: r => r.empty_since ? fmtDate(r.empty_since) : "" },
              { key: "_idle_days", label: "Idle Days", fmt: r => { const d = daysSince(r.empty_since); return !r.is_full && d !== null ? String(d) : ""; } },
              { key: "_approaching_neutral", label: "Approaching Neutral", fmt: r => Number(r.fill_number ?? 0) >= 4 ? "Yes" : "No" },
            ];
            return (
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  disabled={exportBarrels.length === 0}
                  onClick={() => exportCSV(
                    exportBarrels,
                    "barrel-health-summary.csv",
                    barrelHealthCols,
                    [
                      csvComment(`Barrel Health Summary — ${farmNameVessels}`),
                      csvComment(`Scope: Active barrels${scopeParts.length ? " — " + scopeParts.join(", ") : " (all)"}`),
                    ],
                  )}
                >
                  <FileDown className="w-3 h-3 mr-1" />Export CSV
                </Button>
              </div>
            );
          })()}

          {/* Fill-tier breakdown */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Oak age — active barrels by fill number (click to filter)</p>
            <div className="flex flex-wrap gap-1.5">
              {([
                { key: "fill-1" as FlagFilter, label: "New oak", count: barrelStats.tier["1"], cls: "bg-amber-100 text-amber-800 border-amber-200" },
                { key: "fill-2" as FlagFilter, label: "2nd fill", count: barrelStats.tier["2"], cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                { key: "fill-3" as FlagFilter, label: "3rd fill", count: barrelStats.tier["3"], cls: "bg-lime-100 text-lime-700 border-lime-200" },
                { key: "fill-4" as FlagFilter, label: "4th fill", count: barrelStats.tier["4"], cls: "bg-blue-100 text-blue-700 border-blue-200" },
                { key: "fill-5plus" as FlagFilter, label: "Neutral (5th+)", count: barrelStats.tier["5plus"], cls: "bg-gray-100 text-gray-600 border-gray-200" },
              ]).map(({ key, label, count, cls }) => (
                <button
                  key={key!}
                  onClick={() => setFlagFilter(flagFilter === key ? null : key)}
                  className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all ${cls} ${flagFilter === key ? "ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"}`}
                >
                  <span>{label}</span>
                  <span className="font-bold">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert flags */}
          {(barrelStats.approaching > 0 || barrelStats.idle > 0) && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Flags requiring attention</p>
              <div className="flex flex-wrap gap-1.5">
                {barrelStats.approaching > 0 && (
                  <button
                    onClick={() => setFlagFilter(flagFilter === "approaching-neutral" ? null : "approaching-neutral")}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-orange-50 text-orange-700 border-orange-200 ${flagFilter === "approaching-neutral" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-orange-100"}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>{barrelStats.approaching} approaching neutral</span>
                    <span className="text-orange-500 text-xs font-normal">(fill 4+)</span>
                  </button>
                )}
                {barrelStats.idle > 0 && (
                  <button
                    onClick={() => setFlagFilter(flagFilter === "idle" ? null : "idle")}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-red-50 text-red-700 border-red-200 ${flagFilter === "idle" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-red-100"}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>{barrelStats.idle} idle barrel{barrelStats.idle !== 1 ? "s" : ""}</span>
                    <span className="text-red-500 text-xs font-normal">(empty &gt;90 days)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Zone filter chips */}
          {cellarZones.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Filter by cellar zone</p>
              <div className="flex flex-wrap gap-1.5">
                {cellarZones.map(zone => {
                  const zoneBarrels = barrels.filter(r => String(r.cellar_zone || "Unassigned") === zone);
                  const full = zoneBarrels.filter(r => r.is_full).length;
                  const empty = zoneBarrels.length - full;
                  const isSelected = zoneFilter === zone;
                  return (
                    <button
                      key={zone}
                      onClick={() => setZoneFilter(isSelected ? null : zone)}
                      className={`flex items-center gap-2 rounded border px-2 py-1 text-xs text-left transition-colors ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-1" : "bg-background hover:bg-muted/40"}`}
                    >
                      <span className="font-semibold">{zone}</span>
                      <span className="text-green-700 font-medium">● {full}</span>
                      <span className="text-slate-400">○ {empty}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(zoneFilter || flagFilter) && (
            <p className="text-xs text-muted-foreground">
              Showing filtered barrels
              {zoneFilter && <> in <span className="font-medium">{zoneFilter}</span></>}
              {flagFilter && zoneFilter && <> · </>}
              {flagFilter === "approaching-neutral" && <> flagged as <span className="font-medium">approaching neutral (fill 4+)</span></>}
              {flagFilter === "idle" && <> flagged as <span className="font-medium">idle &gt;90 days</span></>}
              {flagFilter && flagFilter.startsWith("fill-") && <> on <span className="font-medium">{flagFilter === "fill-1" ? "new oak" : flagFilter === "fill-5plus" ? "neutral oak (5th+ fill)" : flagFilter.replace("fill-", "") + (flagFilter === "fill-2" ? "nd" : flagFilter === "fill-3" ? "rd" : "th") + " fill"}</span></>}
              {" "}— click "Show all" to clear.
            </p>
          )}
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.isError ? <QueryErrorNotice label="vessels" error={crud.error} />
        : crud.data.length === 0 ? <EmptyState icon={Package} title="No vessels registered yet" sub="Add your tanks, barrels, and other winery vessels to the register." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Ref</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Capacity (L)</th>
              <th className="text-left p-3 font-medium">Location</th>
              <th className="text-left p-3 font-medium">Current Contents</th>
              <th className="text-right p-3 font-medium">Volume (L)</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filteredData.map(r => {
                const isBarrelRow = String(r.vessel_type ?? "").toLowerCase().includes("barrel") || String(r.vessel_type ?? "").toLowerCase().includes("barrique");
                const locationDisplay = r.cellar_zone
                  ? `${String(r.cellar_zone)}${r.cellar_position ? ` / ${String(r.cellar_position)}` : ""}`
                  : fmt(r.location);
                return (
                  <tr key={String(r.id)} className="hover:bg-muted/20">
                    <td className="p-3 font-mono font-semibold">{fmt(r.vessel_ref)}</td>
                    <td className="p-3 text-muted-foreground">
                      <div>{fmt(r.vessel_type)}</div>
                      {isBarrelRow && (() => {
                        const fill = Number(r.fill_number ?? 0);
                        const isIdle = !r.is_full && (() => { const d = daysSince(r.empty_since); return d !== null && d > 90; })();
                        const isApproaching = fill >= 4;
                        return (
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            {r.is_full
                              ? <span className="text-xs text-green-700 font-medium">● Full</span>
                              : <span className="text-xs text-slate-400">○ Empty</span>}
                            {fill >= 1 && (() => {
                              const { label, cls } = fillOakLabel(fill);
                              return <span className={`text-xs rounded px-1 py-0.5 ${cls}`}>{label}</span>;
                            })()}
                            {isApproaching && <span className="text-xs rounded px-1 py-0.5 bg-orange-50 text-orange-700 font-medium">⚠ Approaching neutral</span>}
                            {isIdle && <span className="text-xs rounded px-1 py-0.5 bg-red-50 text-red-700 font-medium">⚠ Idle</span>}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-right">{fmtNum(r.capacity_litres, 0)}</td>
                    <td className="p-3 text-muted-foreground text-xs">{locationDisplay}</td>
                    <td className="p-3">{fmt(r.current_contents)}</td>
                    <td className="p-3 text-right">{r.current_volume_litres ? fmtNum(r.current_volume_litres, 0) : "—"}</td>
                    <td className="p-3">{statusBadge(r.status)}</td>
                    <NotesCell notes={r.notes} />
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Register"} Vessel</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vessel Reference *</Label><Input value={form.vesselRef ?? ""} onChange={e => sf("vesselRef", e.target.value)} placeholder="e.g. T1, Barrel-B12, A1" /></div>
              <div>
                <Label>Vessel Type</Label>
                <Select value={form.vesselType ?? ""} onValueChange={v => sf("vesselType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{VESSEL_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Capacity (L)</Label><Input type="number" step="0.1" value={form.capacityLitres ?? ""} onChange={e => sf("capacityLitres", e.target.value)} /></div>
              <div><Label>Material</Label><Input value={form.material ?? ""} onChange={e => sf("material", e.target.value)} placeholder="e.g. 316L stainless, French oak" /></div>
              <div><Label>Year Purchased</Label><Input type="number" value={form.yearPurchased ?? ""} onChange={e => sf("yearPurchased", e.target.value)} /></div>
              <div><Label>Manufacturer</Label><Input value={form.manufacturer ?? ""} onChange={e => sf("manufacturer", e.target.value)} /></div>
              <div><Label>Location</Label><Input value={form.location ?? ""} onChange={e => sf("location", e.target.value)} placeholder="e.g. Winery floor, East cellar" /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "active"} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VESSEL_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {isBarrel && (
              <>
                <SectionLabel>Barrel details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Oak Origin</Label><Input value={form.oakOrigin ?? ""} onChange={e => sf("oakOrigin", e.target.value)} placeholder="e.g. French Allier, American" /></div>
                  <div><Label>Cooperage</Label><Input value={form.cooperage ?? ""} onChange={e => sf("cooperage", e.target.value)} placeholder="e.g. Demptos, François Frères" /></div>
                  <div><Label>Fill Number</Label><Input type="number" min="1" value={form.fillNumber ?? ""} onChange={e => sf("fillNumber", e.target.value)} placeholder="How many vintages used" /></div>
                  <div>
                    <Label>Toasting Level</Label>
                    <Select value={form.toastingLevel ?? ""} onValueChange={v => sf("toastingLevel", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{TOASTING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <SectionLabel>Cellar location</SectionLabel>
                <p className="text-xs text-muted-foreground -mt-2">Set the initial location here. Use the Location History log to track moves — each logged move updates the location automatically.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cellar Zone</Label><Input value={form.cellarZone ?? ""} onChange={e => sf("cellarZone", e.target.value)} placeholder="e.g. Cellar A, Bonded Store" /></div>
                  <div><Label>Position within Zone</Label><Input value={form.cellarPosition ?? ""} onChange={e => sf("cellarPosition", e.target.value)} placeholder="e.g. R4-P3, Bay 2" /></div>
                </div>
              </>
            )}
            <SectionLabel>Current state</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Current Contents</Label><Input value={form.currentContents ?? ""} onChange={e => sf("currentContents", e.target.value)} placeholder="e.g. Bacchus 2024, empty" /></div>
              <div><Label>Current Volume (L)</Label><Input type="number" step="0.1" value={form.currentVolumeLitres ?? ""} onChange={e => sf("currentVolumeLitres", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.vesselRef || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Vessel — {fmt(view.vessel_ref)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Vessel Ref" value={<span className="font-mono">{fmt(view.vessel_ref)}</span>} />
              <ViewField label="Type" value={fmt(view.vessel_type)} />
              <ViewField label="Capacity" value={view.capacity_litres ? `${fmtNum(view.capacity_litres, 0)} L` : "—"} />
              <ViewField label="Material" value={fmt(view.material)} />
              <ViewField label="Year Purchased" value={fmt(view.year_purchased)} />
              <ViewField label="Manufacturer" value={fmt(view.manufacturer)} />
              <ViewField label="Location" value={fmt(view.location)} />
              <ViewField label="Status" value={statusBadge(view.status)} />
              {String(view.vessel_type ?? "").toLowerCase().includes("barrel") && (
                <>
                  <ViewField label="Oak Origin" value={fmt(view.oak_origin)} />
                  <ViewField label="Cooperage" value={fmt(view.cooperage)} />
                  <ViewField label="Fill Number" value={fmt(view.fill_number)} />
                  <ViewField label="Toasting" value={fmt(view.toasting_level)} />
                  {!!view.cellar_zone && <ViewField label="Cellar Zone" value={fmt(view.cellar_zone)} />}
                  {!!view.cellar_position && <ViewField label="Position" value={fmt(view.cellar_position)} />}
                  <ViewField label="Barrel Status" value={
                    view.is_full
                      ? <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-medium">● Full</span>
                      : <span className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-medium">○ Empty</span>
                  } />
                </>
              )}
              <ViewField label="Current Contents" value={fmt(view.current_contents)} />
              <ViewField label="Current Volume" value={view.current_volume_litres ? `${fmtNum(view.current_volume_litres, 0)} L` : "—"} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {(String(view.vessel_type ?? "").toLowerCase().includes("barrel") || String(view.vessel_type ?? "").toLowerCase().includes("barrique")) && (
              <>
                <BarrelMovementLog farmId={farmId} vesselId={view.id as number} currentZone={String(view.cellar_zone ?? "")} currentPosition={String(view.cellar_position ?? "")} />
                <BarrelFillHistory farmId={farmId} vesselId={view.id as number} maxExistingFill={Number(view.fill_number ?? 0)} />
                <BarrelMaintenanceLog farmId={farmId} vesselId={view.id as number} />
              </>
            )}
            <VesselCleanRow farmId={farmId} vesselId={view.id as number} />
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Vessel</DialogTitle><DialogDescription>Remove vessel {fmt(deleting?.vessel_ref)} from the register? All associated cleaning records will also be deleted.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Cellar Operations Log ────────────────────────────────────────────────────
