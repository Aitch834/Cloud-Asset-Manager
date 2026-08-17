import { fetchWineryJson, today, CLEAN_TYPE_OPTIONS, fmtDate, fmt, useWineryCrud, useIsViticultureActive, exportCSV, csvComment, QueryErrorNotice, EmptyState, fmtNum, NotesCell, VESSEL_TYPE_OPTIONS, VESSEL_STATUS_OPTIONS, SectionLabel, TOASTING_OPTIONS, ViewField } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
import { usePersistedFilter, usePersistedArrayFilter } from "@/hooks/use-persisted-filter";
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
import { Tooltip as RadixTooltip, TooltipContent as RadixTooltipContent, TooltipProvider as RadixTooltipProvider, TooltipTrigger as RadixTooltipTrigger } from "@/components/ui/tooltip";

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

export function BarrelFillHistory({ farmId, vesselId, maxExistingFill, readOnly, approachingNeutralFills: neutralFillsThreshold }: { farmId: number; vesselId: number; maxExistingFill: number; readOnly?: boolean; approachingNeutralFills?: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const viticultureActive = useIsViticultureActive(farmId);
  const qKey = ["winery-barrel-fills", farmId, vesselId];

  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/fills`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load fill history");
      return ((await res.json()).records ?? []) as Record<string, unknown>[];
    },
    enabled: !!vesselId && viticultureActive,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingFill, setEditingFill] = useState<Record<string, unknown> | null>(null);
  const nextFill = Math.max(maxExistingFill, (data ?? []).length > 0 ? Math.max(...(data ?? []).map(d => Number(d.fill_number))) : 0) + 1;
  const blankForm = () => ({ fillNumber: String(nextFill) });
  const [form, setForm] = useState<Record<string, string>>(blankForm());
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Rack-out quick action state
  const [rackOutFillId, setRackOutFillId] = useState<number | null>(null);
  const [rackOutDate, setRackOutDate] = useState<string>(today);

  const openAdd = () => { setEditingFill(null); setForm({ fillNumber: String(nextFill) }); setShowAdd(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditingFill(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setShowAdd(true);
  };

  const rackOutMut = useMutation({
    mutationFn: async ({ fill, date }: { fill: Record<string, unknown>; date: string }) => {
      // The PUT endpoint does a full-row overwrite and requires fillNumber.
      // Mirror the same camelCase mapping that openEdit uses so all fields are preserved.
      const payload = {
        fillNumber:    fill.fill_number   != null ? String(fill.fill_number)   : "",
        wineName:      fill.wine_name     != null ? String(fill.wine_name)     : "",
        vintageYear:   fill.vintage_year  != null ? String(fill.vintage_year)  : "",
        variety:       fill.variety       != null ? String(fill.variety)       : "",
        volumeLitres:  fill.volume_litres != null ? String(fill.volume_litres) : "",
        fillDate:      fill.fill_date     != null ? String(fill.fill_date).slice(0, 10) : "",
        batchRef:      fill.batch_ref     != null ? String(fill.batch_ref)     : "",
        operatorName:  fill.operator_name != null ? String(fill.operator_name) : "",
        notes:         fill.notes         != null ? String(fill.notes)         : "",
        rackOutDate:   date,
      };
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/fills/${Number(fill.id)}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string,string>).error || "Save failed"); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
      setRackOutFillId(null);
      setRackOutDate(today);
      toast({ title: "Rack-out date recorded" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

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
          {highestFill >= (neutralFillsThreshold ?? 4) && (
            <span className="text-xs bg-orange-100 text-orange-700 rounded px-1.5 py-0.5 font-medium">
              ⚠ Fill {highestFill} — approaching neutral oak
            </span>
          )}
        </div>
        {!readOnly && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openAdd}>
            <Plus className="w-3 h-3 mr-1" />Log Fill
          </Button>
        )}
      </div>

      {!readOnly && showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{editingFill ? "Edit fill record" : "New fill record"}</p>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Fill Number *</Label><Input type="number" min="1" value={form.fillNumber ?? ""} onChange={e => sf("fillNumber", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Vintage Year</Label><Input type="number" min="1900" max="2100" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} className="h-8 text-xs" placeholder="e.g. 2024" /></div>
            <div><Label className="text-xs">Wine Name</Label><Input value={form.wineName ?? ""} onChange={e => sf("wineName", e.target.value)} className="h-8 text-xs" placeholder="e.g. Bacchus 2024" /></div>
            <div><Label className="text-xs">Variety</Label><Input value={form.variety ?? ""} onChange={e => sf("variety", e.target.value)} className="h-8 text-xs" placeholder="e.g. Chardonnay" /></div>
            <div><Label className="text-xs">Volume (L)</Label><Input type="number" step="0.5" value={form.volumeLitres ?? ""} onChange={e => sf("volumeLitres", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Batch Ref</Label><Input value={form.batchRef ?? ""} onChange={e => sf("batchRef", e.target.value)} className="h-8 text-xs" placeholder="e.g. WB-2024-01" /></div>
            <div>
              <Label className="text-xs">Fill Date (wine in)</Label>
              <Input type="date" value={form.fillDate ?? ""} onChange={e => sf("fillDate", e.target.value)} className="h-8 text-xs" />
            </div>
            {editingFill !== null ? (
              <div>
                <Label className="text-xs">Rack-out Date (wine out)</Label>
                <Input type="date" value={form.rackOutDate ?? ""} onChange={e => sf("rackOutDate", e.target.value)} className="h-8 text-xs" />
                <p className="text-xs text-muted-foreground mt-0.5">Update this when the wine leaves the barrel.</p>
              </div>
            ) : (
              <div className="flex items-end pb-1">
                <p className="text-xs text-muted-foreground italic border border-dashed border-muted-foreground/30 rounded px-2 py-1.5 w-full leading-snug">
                  Rack-out Date — edit this record when the wine is racked out.
                </p>
              </div>
            )}
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
            const fillId = Number(f.id);
            const isRackingOut = rackOutFillId === fillId;
            return (
              <div key={String(f.id)} className="border rounded-lg px-3 py-2 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 font-semibold text-xs ${oak.cls}`}>{oak.label}</span>
                    {!!f.wine_name && <span className="font-medium">{String(f.wine_name)}</span>}
                    {!!f.vintage_year && <span className="text-muted-foreground">({String(f.vintage_year)})</span>}
                    {!!f.variety && <span className="text-muted-foreground">— {String(f.variety)}</span>}
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      {stillIn && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 text-xs px-1.5 py-0 text-amber-700 border-amber-300 hover:bg-amber-50"
                          onClick={() => {
                            if (isRackingOut) {
                              setRackOutFillId(null);
                            } else {
                              setRackOutFillId(fillId);
                              setRackOutDate(today);
                              rackOutMut.reset();
                            }
                          }}
                        >
                          Rack out
                        </Button>
                      )}
                      <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(f)}><Pencil className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Edit fill record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                      <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(f.id))}><Trash2 className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Delete fill record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  {!!f.fill_date && <span>In: {fmtDate(f.fill_date)}</span>}
                  {f.rack_out_date ? <span>Out: {fmtDate(f.rack_out_date)}</span> : <span className="text-green-700 font-medium">Still maturing</span>}
                  <span className="font-medium text-foreground">{durationLabel(f.fill_date, f.rack_out_date)}{stillIn ? " so far" : ""}</span>
                  {!!f.volume_litres && <span>{fmtNum(f.volume_litres, 0)} L</span>}
                  {!!f.batch_ref && <span>Batch: {String(f.batch_ref)}</span>}
                </div>
                {!!f.notes && <p className="text-muted-foreground italic">{String(f.notes)}</p>}
                {!readOnly && isRackingOut && (
                  <div className="mt-2 pt-2 border-t border-dashed border-amber-200 space-y-2">
                    <p className="text-xs font-medium text-amber-800">Record rack-out date</p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={rackOutDate}
                        max={today}
                        onChange={e => setRackOutDate(e.target.value)}
                        className="h-7 text-xs w-36"
                      />
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        disabled={!rackOutDate || rackOutMut.isPending}
                        onClick={() => rackOutMut.mutate({ fill: f, date: rackOutDate })}
                      >
                        {rackOutMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => { setRackOutFillId(null); rackOutMut.reset(); }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <DialogMutationError mutation={rackOutMut} />
                  </div>
                )}
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

export function BarrelMaintenanceLog({ farmId, vesselId, readOnly }: { farmId: number; vesselId: number; readOnly?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const viticultureActive = useIsViticultureActive(farmId);
  const qKey = ["winery-barrel-maintenance", farmId, vesselId];

  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/maintenance`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load maintenance log");
      return ((await res.json()).records ?? []) as Record<string, unknown>[];
    },
    enabled: !!vesselId && viticultureActive,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ maintenanceDate: today });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openAddForm = () => {
    const savedCooperage = localStorage.getItem("last_cooperage_name") ?? "";
    setEditingRecord(null);
    setForm({ maintenanceDate: today, ...(savedCooperage ? { cooperageName: savedCooperage } : {}) });
    setShowAdd(true);
  };

  const openEdit = (m: Record<string, unknown>) => {
    setEditingRecord(m);
    setForm({
      maintenanceDate: m.maintenance_date != null ? String(m.maintenance_date).slice(0, 10) : today,
      workType:        m.work_type        != null ? String(m.work_type)        : "",
      cooperageName:   m.cooperage_name   != null ? String(m.cooperage_name)   : "",
      operatorName:    m.operator_name    != null ? String(m.operator_name)    : "",
      costGbp:         m.cost_pence       != null ? (Number(m.cost_pence) / 100).toFixed(2) : "",
      notes:           m.notes            != null ? String(m.notes)            : "",
    });
    setShowAdd(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const isEdit = !!editingRecord;
      const payload: Record<string, unknown> = { ...form };
      if (form.costGbp) payload.costPence = String(Math.round(parseFloat(form.costGbp) * 100));
      delete payload.costGbp;
      const url = isEdit
        ? api(`farms/${farmId}/winery-vessels/${vesselId}/maintenance/${editingRecord!.id}`)
        : api(`farms/${farmId}/winery-vessels/${vesselId}/maintenance`);
      const r = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string,string>).error || "Save failed"); }
    },
    onSuccess: () => {
      if (form.cooperageName?.trim()) {
        localStorage.setItem("last_cooperage_name", form.cooperageName.trim());
      }
      qc.invalidateQueries({ queryKey: qKey });
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
      setShowAdd(false);
      setEditingRecord(null);
      setForm({ maintenanceDate: today });
      toast({ title: editingRecord ? "Maintenance record updated" : "Maintenance record added" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/maintenance/${id}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
    },
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
        {!readOnly && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openAddForm}>
            <Plus className="w-3 h-3 mr-1" />Log Work
          </Button>
        )}
      </div>
      {!readOnly && showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{editingRecord ? "Edit maintenance record" : "Log new work"}</p>
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
            <div><Label className="text-xs">Operator</Label><Input value={form.operatorName ?? ""} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <DialogMutationError mutation={saveMut} />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => saveMut.mutate()} disabled={!form.maintenanceDate || !form.workType || saveMut.isPending}>
              {saveMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setShowAdd(false); setEditingRecord(null); saveMut.reset(); }}>Cancel</Button>
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
                {!!m.operator_name && <div className="text-muted-foreground">By: {String(m.operator_name)}</div>}
                {!!m.notes && <div className="italic text-muted-foreground">{String(m.notes)}</div>}
              </div>
              {!readOnly && (
                <div className="flex items-center gap-1 shrink-0">
                  <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(m)}><Pencil className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Edit maintenance record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                  <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(m.id))}><Trash2 className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Delete maintenance record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                </div>
              )}
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

export function BarrelMovementLog({ farmId, vesselId, currentZone, currentPosition, readOnly, onMoveLogged }: {
  farmId: number; vesselId: number; currentZone?: string; currentPosition?: string; readOnly?: boolean;
  onMoveLogged?: (toZone: string, toPosition: string) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const viticultureActive = useIsViticultureActive(farmId);
  const qKey = ["winery-barrel-movements", farmId, vesselId];

  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/movements`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load movement log");
      return ((await res.json()).records ?? []) as Record<string, unknown>[];
    },
    enabled: !!vesselId && viticultureActive,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ movedDate: today, fromZone: currentZone ?? "", fromPosition: currentPosition ?? "" });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Re-sync fromZone/fromPosition when the parent's vessel query refreshes the prop
  // (e.g. after a previous move invalidates winery-vessels), but only while the add
  // form is closed so mid-entry values are never clobbered.
  useEffect(() => {
    if (!showAdd) {
      setForm(f => ({ ...f, fromZone: currentZone ?? "", fromPosition: currentPosition ?? "" }));
    }
  }, [currentZone, currentPosition, showAdd]);

  const openAdd = () => {
    setEditingRecord(null);
    setForm({ movedDate: today, fromZone: currentZone ?? "", fromPosition: currentPosition ?? "" });
    setShowAdd(true);
  };

  const openEdit = (m: Record<string, unknown>) => {
    setEditingRecord(m);
    setForm({
      movedDate:     m.moved_date    != null ? String(m.moved_date).slice(0, 10)    : today,
      fromZone:      m.from_zone     != null ? String(m.from_zone)     : "",
      fromPosition:  m.from_position != null ? String(m.from_position) : "",
      toZone:        m.to_zone       != null ? String(m.to_zone)       : "",
      toPosition:    m.to_position   != null ? String(m.to_position)   : "",
      reason:        m.reason        != null ? String(m.reason)        : "",
      operatorName:  m.operator_name != null ? String(m.operator_name) : "",
      notes:         m.notes         != null ? String(m.notes)         : "",
    });
    addMut.reset();
    setShowAdd(true);
  };

  const addMut = useMutation({
    // Accept a snapshot of the form so onSuccess can safely read the submitted
    // destination values even if the user edits fields while the request is in-flight.
    mutationFn: async (snapshot: Record<string, string>) => {
      const isEdit = !!editingRecord;
      const url = isEdit
        ? api(`farms/${farmId}/winery-vessels/${vesselId}/movements/${editingRecord!.id}`)
        : api(`farms/${farmId}/winery-vessels/${vesselId}/movements`);
      const r = await fetch(url, {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(snapshot),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); }
    },
    onSuccess: (_data, snapshot) => {
      qc.invalidateQueries({ queryKey: qKey });
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
      if (editingRecord) {
        // After an edit, close the form and reset.
        setEditingRecord(null);
        setShowAdd(false);
        toast({ title: "Movement updated" });
      } else {
        // Keep the panel open so the winemaker can log a second consecutive move.
        // Use snapshot (the values that were actually sent) — not live form state —
        // to advance fromZone/fromPosition to the confirmed destination.
        setForm(f => ({
          movedDate: today,
          fromZone: snapshot.toZone ?? "",
          fromPosition: snapshot.toPosition ?? "",
          operatorName: f.operatorName ?? "",
          toZone: "",
          toPosition: "",
          reason: "",
          notes: "",
        }));
        // Immediately notify the parent so the identity grid ViewFields update
        // without waiting for the winery-vessels refetch to complete.
        // Only for new moves — edits to historical records don't necessarily
        // change the current location (the API derives it from the latest-dated
        // movement), so we let the query invalidation handle that case.
        onMoveLogged?.(snapshot.toZone ?? "", snapshot.toPosition ?? "");
        toast({ title: "Movement logged" });
      }
      addMut.reset();
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
        {!readOnly && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openAdd}>
            <Plus className="w-3 h-3 mr-1" />Log Move
          </Button>
        )}
      </div>
      {!readOnly && showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{editingRecord ? "Edit movement record" : "Log new move"}</p>
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
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate({ ...form })} disabled={!form.movedDate || !form.toZone || addMut.isPending}>
              {addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}{editingRecord ? "Save Changes" : "Save Move"}
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setShowAdd(false); setEditingRecord(null); }}>Cancel</Button>
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
              {!readOnly && (
                <div className="flex items-center gap-1 shrink-0">
                  <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(m)}><Pencil className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Edit movement record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                  <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(m.id))}><Trash2 className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Delete movement record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VesselCleanRow({ farmId, vesselId, readOnly }: { farmId: number; vesselId: number; readOnly?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const viticultureActive = useIsViticultureActive(farmId);
  const qKey = ["winery-vessel-cleans", farmId, vesselId];
  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: qKey,
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-vessels/${vesselId}/cleans`)).records ?? []) as Record<string, unknown>[],
    enabled: !!vesselId && viticultureActive,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingClean, setEditingClean] = useState<Record<string, unknown> | null>(null);
  const blankForm = () => ({ cleanDate: today, rinseCompleted: "true" });
  const [form, setForm] = useState<Record<string, string | boolean>>(blankForm());
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setEditingClean(null); setForm(blankForm()); setShowForm(true); };
  const openEdit = (c: Record<string, unknown>) => {
    setEditingClean(c);
    setForm({
      cleanDate:        c.clean_date        != null ? String(c.clean_date)        : "",
      cleanType:        c.clean_type        != null ? String(c.clean_type)        : "",
      cleaningProduct:  c.cleaning_product  != null ? String(c.cleaning_product)  : "",
      concentrationPct: c.concentration_pct != null ? String(c.concentration_pct) : "",
      waterTempC:       c.water_temp_c      != null ? String(c.water_temp_c)      : "",
      contactTimeMin:   c.contact_time_min  != null ? String(c.contact_time_min)  : "",
      operatorName:     c.operator_name     != null ? String(c.operator_name)     : "",
      notes:            c.notes             != null ? String(c.notes)             : "",
      rinseCompleted:   c.rinse_completed === false || c.rinse_completed === "false" ? "false" : "true",
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingClean(null); saveMut.reset(); };

  const saveMut = useMutation({
    mutationFn: async () => {
      const isEdit = !!editingClean;
      const url = isEdit
        ? api(`farms/${farmId}/winery-vessels/${vesselId}/cleans/${editingClean!.id}`)
        : api(`farms/${farmId}/winery-vessels/${vesselId}/cleans`);
      const r = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string, string>).error || "Save failed"); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
      closeForm();
      toast({ title: editingClean ? "Clean record updated" : "Clean record added" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: async (cleanId: number) => { const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/cleans/${cleanId}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string, string>).error || "Delete failed"); } },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] }); },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cleaning History</p>
        {!readOnly && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openAdd}><Plus className="w-3 h-3 mr-1" />Log Clean</Button>}
      </div>
      {!readOnly && showForm && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{editingClean ? "Edit clean record" : "New clean record"}</p>
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
          <DialogMutationError mutation={saveMut} />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => saveMut.mutate()} disabled={!form.cleanDate || saveMut.isPending}>{saveMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}{editingClean ? "Save Changes" : "Save Clean"}</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isError ? <QueryErrorNotice label="cleaning records" error={error} /> : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No cleaning records yet.</p> : (
        <div className="space-y-1">
          {(data ?? []).map(c => (
            <div key={String(c.id)} className="flex items-center justify-between text-xs border rounded px-3 py-1.5 gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-medium shrink-0">{fmtDate(c.clean_date)}</span>
                <span className="text-muted-foreground shrink-0">{fmt(c.clean_type)}</span>
                <span className="text-muted-foreground truncate">{fmt(c.cleaning_product)}</span>
                {(c.concentration_pct != null || c.water_temp_c != null || c.contact_time_min != null) && (
                  <span className="text-muted-foreground shrink-0">
                    {[
                      c.concentration_pct != null ? `${c.concentration_pct}%` : null,
                      c.water_temp_c      != null ? `${c.water_temp_c}°C` : null,
                      c.contact_time_min  != null ? `${c.contact_time_min} min` : null,
                    ].filter(Boolean).join(" · ")}
                  </span>
                )}
                <span className="shrink-0">{c.rinse_completed ? <span className="text-green-700">Rinse ✓</span> : <span className="text-red-600">No rinse</span>}</span>
              </div>
              {!readOnly && (
                <div className="flex items-center gap-1 shrink-0">
                  <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Edit clean record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                  <RadixTooltipProvider><RadixTooltip><RadixTooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(c.id))}><Trash2 className="h-3 w-3" /></Button></RadixTooltipTrigger><RadixTooltipContent>Delete clean record</RadixTooltipContent></RadixTooltip></RadixTooltipProvider>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Returns true if the vessel type string indicates a barrel or barrique. */
function isBarrelVessel(vesselType: unknown): boolean {
  const t = String(vesselType ?? "").toLowerCase();
  return t.includes("barrel") || t.includes("barrique");
}

export function VesselRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const farmNameVessels = useFarmName(farmId);

  const handleBarrelPrint = async (vessel: Record<string, unknown>) => {
    // Open the window synchronously within the click handler so popup
    // blockers treat it as user-initiated, then populate after fetching.
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Loading…</title></head><body><p style=\"font-family:Arial,sans-serif;font-size:13px;margin:30px\">Loading barrel history…</p></body></html>");
    win.document.close();

    const vid = vessel.id as number;
    let fills: Record<string, unknown>[] = [];
    let maint: Record<string, unknown>[] = [];
    let movs: Record<string, unknown>[] = [];
    let cleans: Record<string, unknown>[] = [];
    const fetchErrors: string[] = [];
    try {
      const [fillsRes, maintRes, movRes, cleansRes] = await Promise.all([
        fetch(api(`farms/${farmId}/winery-vessels/${vid}/fills`), { credentials: "include" }),
        fetch(api(`farms/${farmId}/winery-vessels/${vid}/maintenance`), { credentials: "include" }),
        fetch(api(`farms/${farmId}/winery-vessels/${vid}/movements`), { credentials: "include" }),
        fetch(api(`farms/${farmId}/winery-vessels/${vid}/cleans`), { credentials: "include" }),
      ]);
      if (fillsRes.ok) { fills = ((await fillsRes.json()).records ?? []) as Record<string, unknown>[]; }
      else { fetchErrors.push(`Fill history (HTTP ${fillsRes.status})`); }
      if (maintRes.ok) { maint = ((await maintRes.json()).records ?? []) as Record<string, unknown>[]; }
      else { fetchErrors.push(`Maintenance log (HTTP ${maintRes.status})`); }
      if (movRes.ok) { movs = ((await movRes.json()).records ?? []) as Record<string, unknown>[]; }
      else { fetchErrors.push(`Location history (HTTP ${movRes.status})`); }
      if (cleansRes.ok) { cleans = ((await cleansRes.json()).records ?? []) as Record<string, unknown>[]; }
      else { fetchErrors.push(`Cleaning history (HTTP ${cleansRes.status})`); }
    } catch (err) {
      win.document.body.innerHTML = `<p style="font-family:Arial,sans-serif;font-size:13px;margin:30px;color:red">Failed to load barrel history: ${String(err)}</p>`;
      return;
    }

    const doc = win.document;
    doc.open();
    doc.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Barrel History</title><style>" +
      "body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}" +
      "h1{font-size:15px;font-weight:700;margin:0 0 2px}" +
      "h2{font-size:12px;font-weight:700;margin:18px 0 6px;padding-bottom:3px;border-bottom:1px solid #ccc}" +
      ".meta{font-size:10px;color:#555;margin-bottom:14px}" +
      ".identity{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 16px;margin-bottom:4px}" +
      ".field{font-size:11px}.field .lbl{color:#555;font-size:10px;display:block}" +
      "table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:6px}" +
      "th{background:#f0f0f0;font-weight:700;text-align:left;padding:4px 7px;border:1px solid #ccc}" +
      "td{padding:3px 7px;border:1px solid #ddd;vertical-align:top}" +
      "tr:nth-child(even) td{background:#fafafa}" +
      ".empty{color:#888;font-style:italic;font-size:11px}" +
      ".footer{margin-top:14px;font-size:9px;color:#888}" +
      "@media print{body{margin:10mm}}" +
      "</style></head><body></body></html>");
    doc.close();

    // Title
    const h1 = doc.createElement("h1");
    h1.textContent = `Barrel History — ${String(vessel.vessel_ref ?? "")}`;
    doc.body.appendChild(h1);
    const meta = doc.createElement("div");
    meta.className = "meta";
    meta.textContent = `${farmNameVessels}  ·  Printed: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
    doc.body.appendChild(meta);

    // Fetch error warning
    if (fetchErrors.length > 0) {
      const warn = doc.createElement("div");
      warn.style.cssText = "background:#fff3cd;border:1px solid #f0ad4e;border-radius:4px;padding:6px 10px;margin-bottom:10px;font-size:10px;color:#856404";
      warn.textContent = `⚠ The following sections could not be loaded and are missing from this report: ${fetchErrors.join(", ")}. Please try again or contact support.`;
      doc.body.appendChild(warn);
    }

    // Identity grid
    const identityFields: [string, string][] = [
      ["Vessel Ref", String(vessel.vessel_ref ?? "—")],
      ["Type", String(vessel.vessel_type ?? "—")],
      ["Capacity", vessel.capacity_litres ? `${fmtNum(vessel.capacity_litres, 0)} L` : "—"],
      ["Oak Origin", String(vessel.oak_origin ?? "—")],
      ["Cooperage", String(vessel.cooperage ?? "—")],
      ["Toasting", String(vessel.toasting_level ?? "—")],
      ["Cellar Zone", String(vessel.cellar_zone ?? "—")],
      ["Position", String(vessel.cellar_position ?? "—")],
      ["Status", vessel.is_full ? "Full" : "Empty"],
      ["Current Contents", String(vessel.current_contents ?? "—")],
      ["Current Volume", vessel.current_volume_litres ? `${fmtNum(vessel.current_volume_litres, 0)} L` : "—"],
      ["Year Purchased", String(vessel.year_purchased ?? "—")],
    ];
    const grid = doc.createElement("div");
    grid.className = "identity";
    for (const [lbl, val] of identityFields) {
      const d = doc.createElement("div");
      d.className = "field";
      const s = doc.createElement("span");
      s.className = "lbl";
      s.textContent = lbl;
      d.appendChild(s);
      d.appendChild(doc.createTextNode(val));
      grid.appendChild(d);
    }
    doc.body.appendChild(grid);

    // Helper: section heading
    const addH2 = (text: string) => {
      const h2 = doc.createElement("h2");
      h2.textContent = text;
      doc.body.appendChild(h2);
    };

    // Helper: table
    const addTable = (headers: string[], rows: string[][], emptyMsg: string) => {
      if (rows.length === 0) {
        const p = doc.createElement("p");
        p.className = "empty";
        p.textContent = emptyMsg;
        doc.body.appendChild(p);
        return;
      }
      const table = doc.createElement("table");
      const thead = doc.createElement("thead");
      const hRow = doc.createElement("tr");
      for (const h of headers) { const th = doc.createElement("th"); th.textContent = h; hRow.appendChild(th); }
      thead.appendChild(hRow);
      table.appendChild(thead);
      const tbody = doc.createElement("tbody");
      for (const cells of rows) {
        const tr = doc.createElement("tr");
        for (const cell of cells) { const td = doc.createElement("td"); td.textContent = cell; tr.appendChild(td); }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      doc.body.appendChild(table);
    };

    // Fill history
    addH2(`Fill History (${fills.length} record${fills.length !== 1 ? "s" : ""})`);
    addTable(
      ["Fill No.", "Wine / Variety", "Vintage", "Batch Ref", "Fill Date", "Rack-out Date", "Duration", "Volume (L)", "Operator", "Notes"],
      fills.map(f => [
        String(f.fill_number ?? "—"),
        [f.wine_name, f.variety].filter(Boolean).join(" / ") || "—",
        String(f.vintage_year ?? "—"),
        String(f.batch_ref ?? "—"),
        f.fill_date ? fmtDate(f.fill_date) : "—",
        f.rack_out_date ? fmtDate(f.rack_out_date) : "Still maturing",
        durationLabel(f.fill_date, f.rack_out_date),
        f.volume_litres ? fmtNum(f.volume_litres, 0) : "—",
        String(f.operator_name ?? "—"),
        String(f.notes ?? ""),
      ]),
      "No fill records logged.",
    );

    // Maintenance log
    const totalSpend = maint.reduce((s, m) => s + (m.cost_pence != null ? Number(m.cost_pence) : 0), 0);
    const maintHdr = `Cooperage / Maintenance (${maint.length} record${maint.length !== 1 ? "s" : ""}${totalSpend > 0 ? ` · Total: £${(totalSpend / 100).toFixed(2)}` : ""})`;
    addH2(maintHdr);
    addTable(
      ["Date", "Work Type", "Cooperage", "Cost (£)", "Operator", "Notes"],
      maint.map(m => [
        m.maintenance_date ? fmtDate(m.maintenance_date) : "—",
        String(m.work_type ?? "—"),
        String(m.cooperage_name ?? "—"),
        m.cost_pence != null ? `£${(Number(m.cost_pence) / 100).toFixed(2)}` : "—",
        String(m.operator_name ?? "—"),
        String(m.notes ?? ""),
      ]),
      "No cooperage or maintenance records logged.",
    );

    // Location movements
    addH2(`Location History (${movs.length} move${movs.length !== 1 ? "s" : ""})`);
    addTable(
      ["Date", "Reason", "From", "To", "Operator", "Notes"],
      movs.map(m => [
        m.moved_date ? fmtDate(m.moved_date) : "—",
        String(m.reason ?? "—"),
        [m.from_zone, m.from_position].filter(Boolean).join(" / ") || "—",
        [m.to_zone, m.to_position].filter(Boolean).join(" / ") || "—",
        String(m.operator_name ?? "—"),
        String(m.notes ?? ""),
      ]),
      "No movements recorded.",
    );

    // Cleaning history
    addH2(`Cleaning History (${cleans.length} record${cleans.length !== 1 ? "s" : ""})`);
    addTable(
      ["Clean Date", "Clean Type", "Rinse Completed", "Agent / Concentration", "Operator", "Notes"],
      cleans.map(c => [
        c.clean_date ? fmtDate(c.clean_date) : "—",
        String(c.clean_type ?? "—"),
        c.rinse_completed === true || c.rinse_completed === "true" ? "Yes" : c.rinse_completed === false || c.rinse_completed === "false" ? "No" : "—",
        [c.cleaning_product, c.concentration_pct != null ? `${String(c.concentration_pct)}%` : null].filter(Boolean).join(" / ") || "—",
        String(c.operator_name ?? "—"),
        String(c.notes ?? ""),
      ]),
      "No cleaning records logged.",
    );

    const footer = doc.createElement("div");
    footer.className = "footer";
    footer.textContent = `BDE Farm Trac · ${farmNameVessels} · Barrel ref: ${String(vessel.vessel_ref ?? "")}`;
    doc.body.appendChild(footer);

    win.focus();
    win.print();
  };
  const crud = useWineryCrud(farmId, "winery-vessels", "winery-vessels");

  // Fetch farm settings to resolve per-farm barrel alert thresholds
  const { data: farmSettingsData } = useQuery<{ record: Record<string, unknown> }>({
    queryKey: ["farm-settings", farmId],
    queryFn: async () => {
      const res = await fetch(api(`farms/${farmId}`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load farm settings");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const idleBarrelDays: number =
    farmSettingsData?.record?.idleBarrelDays != null
      ? Number(farmSettingsData.record.idleBarrelDays)
      : 90;
  const approachingNeutralFills: number =
    farmSettingsData?.record?.approachingNeutralFills != null
      ? Number(farmSettingsData.record.approachingNeutralFills)
      : 4;

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);

  // Persist the last-viewed vessel ID so the detail dialog can be restored on return.
  // We use the hook for writes only; reads in the restore effect go directly to
  // localStorage to avoid a stale-state race with usePersistedFilter's own re-sync effect
  // (which runs in the same commit cycle as ours, so its setState isn't visible yet).
  const [, setLastViewedVesselId] = usePersistedFilter({
    page: "vessel-register",
    filter: "last-viewed-vessel",
    farmId,
    defaultValue: "",
    isValid: v => v === "" || /^\d+$/.test(v),
  });
  const lastViewedStorageKey = `vessel-register-last-viewed-vessel-filter-${farmId ?? 0}`;

  // Close dialog and reset restoration flag when the farm changes so the incoming
  // farm's saved vessel is not shadowed by the outgoing farm's restoration state.
  const viewRestoredForFarm = useRef<number | null>(null);
  const prevFarmId = useRef<number | null>(null);
  useEffect(() => {
    if (prevFarmId.current !== null && prevFarmId.current !== farmId) {
      setView(null);
      viewRestoredForFarm.current = null;
    }
    prevFarmId.current = farmId;
  }, [farmId]);

  // Restore the last-viewed vessel dialog once per farm after data loads.
  // Read directly from localStorage (not hook state) to avoid the stale-state
  // race described above — the storage key is already scoped to the current farmId.
  useEffect(() => {
    if (viewRestoredForFarm.current === farmId) return;
    if (crud.isLoading || !crud.data.length) return;
    viewRestoredForFarm.current = farmId;
    let savedId = "";
    try { savedId = localStorage.getItem(lastViewedStorageKey) ?? ""; } catch { /* ignore */ }
    if (!savedId || !/^\d+$/.test(savedId)) return;
    const vessel = crud.data.find(r => String(r.id) === savedId);
    if (vessel) setView(vessel);
  }, [farmId, crud.data, crud.isLoading, lastViewedStorageKey]);

  // Keep the open detail dialog in sync with the vessel list after any mutation
  // (e.g. a movement PUT/DELETE) re-fetches the winery-vessels query.  Without
  // this, the `view` snapshot stays stale so the zone badge in the table row
  // updates but the detail panel (and the currentZone prop fed to
  // BarrelMovementLog) still shows the pre-movement value.
  useEffect(() => {
    if (!view) return;
    const fresh = crud.data.find(r => r.id === view.id);
    if (fresh && fresh !== view) setView(fresh);
  }, [crud.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Opens the vessel detail dialog and persists the vessel ID.
  // Closing the dialog does NOT clear the persisted ID — it stays until a different
  // vessel is opened, so the winemaker can restore it on their next visit.
  const openView = (r: Record<string, unknown>) => {
    setView(r);
    setLastViewedVesselId(String(r.id));
  };
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isBarrel = isBarrelVessel(form.vesselType);

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
  const barrels = crud.data.filter(r => isBarrelVessel(r.vessel_type));
  const cellarZones = Array.from(new Set(barrels.map(r => String(r.cellar_zone || "Unassigned")))).sort();
  // Persisted barrel filters — "" = show all; restored when the winemaker returns to this tab
  const FILL_TIER_VALUES = ["fill-1", "fill-2", "fill-3", "fill-4", "fill-5plus"] as const;
  const ALERT_FLAG_VALUES = ["approaching-neutral", "idle", "no-fills-maintenance", "no-fills-none"] as const;
  const IS_FULL_VALUES = ["true", "false"] as const;

  const [zoneFilter, setZoneFilter] = usePersistedArrayFilter({ page: "vessel-register", filter: "zone", farmId });
  const [fillTierFilter, setFillTierFilter] = usePersistedFilter({ page: "vessel-register", filter: "fill-tier", farmId, defaultValue: "", validValues: FILL_TIER_VALUES });
  const [alertFlagFilter, setAlertFlagFilter] = usePersistedFilter({ page: "vessel-register", filter: "alert-flag", farmId, defaultValue: "", validValues: ALERT_FLAG_VALUES });
  // isFullFilter: "" = show all, "true" = full only, "false" = empty only
  const [isFullFilter, setIsFullFilter] = usePersistedFilter({ page: "vessel-register", filter: "is-full", farmId, defaultValue: "", validValues: IS_FULL_VALUES });

  // Persisted sort — remembered across page visits and navigation
  const SORT_COL_VALUES = ["vessel_ref", "vessel_type", "capacity_litres", "location", "current_contents", "current_volume_litres", "status"] as const;
  const SORT_DIR_VALUES = ["asc", "desc"] as const;
  const [sortCol, setSortCol] = usePersistedFilter({ page: "vessel-register", filter: "sort-col", farmId, defaultValue: "vessel_ref", validValues: SORT_COL_VALUES });
  const [sortDir, setSortDir] = usePersistedFilter({ page: "vessel-register", filter: "sort-dir", farmId, defaultValue: "asc", validValues: SORT_DIR_VALUES });

  function handleSort(col: typeof SORT_COL_VALUES[number]) {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortCol !== col) return <ArrowUpDown className="inline ml-1 h-3 w-3 text-muted-foreground opacity-50" />;
    return sortDir === "asc"
      ? <ArrowUp className="inline ml-1 h-3 w-3 text-primary" />
      : <ArrowDown className="inline ml-1 h-3 w-3 text-primary" />;
  }

  // Barrel health CSV export loading state
  const [csvExporting, setCsvExporting] = useState(false);

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
    let noFillsWithMaintenance = 0; // fill_count=0 but has cooperage records
    let noFillsNoRecords = 0;       // fill_count=0 and no cooperage records either
    for (const r of barrels) {
      if (String(r.status ?? "active") !== "active") continue;
      const fill = Number(r.fill_number ?? 0);
      if (Number(r.fill_count ?? 0) === 0) {
        if (Number(r.maintenance_count ?? 0) > 0) noFillsWithMaintenance++;
        else noFillsNoRecords++;
      } else if (fill === 1) tier["1"]++;
      else if (fill === 2) tier["2"]++;
      else if (fill === 3) tier["3"]++;
      else if (fill === 4) tier["4"]++;
      else if (fill >= 5) tier["5plus"]++;
      if (fill >= approachingNeutralFills) approaching++;
      // Idle: no open fill (is_full=false) AND empty for longer than the farm threshold
      const isEmpty = !r.is_full;
      if (isEmpty) {
        const since = daysSince(r.empty_since);
        if (since !== null && since > idleBarrelDays) idle++;
      }
    }
    return { tier, approaching, idle, noFillsWithMaintenance, noFillsNoRecords };
  }, [barrels, idleBarrelDays, approachingNeutralFills]);

  // Check if a barrel matches the active fill-tier filter
  function matchesFillTierFilter(r: Record<string, unknown>): boolean {
    if (!fillTierFilter) return true;
    const fill = Number(r.fill_number ?? 0);
    if (fillTierFilter === "fill-1") return fill === 1;
    if (fillTierFilter === "fill-2") return fill === 2;
    if (fillTierFilter === "fill-3") return fill === 3;
    if (fillTierFilter === "fill-4") return fill === 4;
    if (fillTierFilter === "fill-5plus") return fill >= 5;
    return true;
  }

  // Check if a barrel matches the active alert-flag filter
  function matchesAlertFlagFilter(r: Record<string, unknown>): boolean {
    if (!alertFlagFilter) return true;
    const fill = Number(r.fill_number ?? 0);
    const isEmpty = !r.is_full;
    const since = daysSince(r.empty_since);
    if (alertFlagFilter === "approaching-neutral") return fill >= approachingNeutralFills;
    if (alertFlagFilter === "idle") return isEmpty && since !== null && since > idleBarrelDays;
    if (alertFlagFilter === "no-fills-maintenance") return Number(r.fill_count ?? 0) === 0 && Number(r.maintenance_count ?? 0) > 0;
    if (alertFlagFilter === "no-fills-none") return Number(r.fill_count ?? 0) === 0 && Number(r.maintenance_count ?? 0) === 0;
    return true;
  }

  const filteredData = crud.data.filter(r => {
    const isBarrelType = isBarrelVessel(r.vessel_type);
    if (zoneFilter.length > 0) {
      if (!isBarrelType) return false;
      if (!zoneFilter.includes(String(r.cellar_zone || "Unassigned"))) return false;
    }
    if (fillTierFilter) {
      if (!isBarrelType) return false;
      if (!matchesFillTierFilter(r)) return false;
    }
    if (alertFlagFilter) {
      if (!isBarrelType) return false;
      if (!matchesAlertFlagFilter(r)) return false;
    }
    if (isFullFilter !== "") {
      if (!isBarrelType) return false;
      if (!!r.is_full !== (isFullFilter === "true")) return false;
    }
    return true;
  });

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal: unknown = a[sortCol] ?? "";
      let bVal: unknown = b[sortCol] ?? "";
      if (sortCol === "capacity_litres" || sortCol === "current_volume_litres") {
        const aNum = aVal !== "" ? Number(aVal) : -Infinity;
        const bNum = bVal !== "" ? Number(bVal) : -Infinity;
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }
      if (sortCol === "location") {
        aVal = a.cellar_zone ? `${String(a.cellar_zone)}${a.cellar_position ? `/${String(a.cellar_position)}` : ""}` : String(a.location ?? "");
        bVal = b.cellar_zone ? `${String(b.cellar_zone)}${b.cellar_position ? `/${String(b.cellar_position)}` : ""}` : String(b.location ?? "");
      }
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, sortCol, sortDir]);

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
            {(zoneFilter.length > 0 || fillTierFilter || alertFlagFilter || isFullFilter !== "") && (
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { setZoneFilter([]); setFillTierFilter(""); setAlertFlagFilter(""); setIsFullFilter(""); }}>
                Show all
              </Button>
            )}
          </div>

          {/* Barrel health CSV export — respects active zone/flag filter */}
          {(() => {
            const exportBarrels = barrels.filter(r => {
              if (String(r.status ?? "active") !== "active") return false;
              if (zoneFilter.length > 0 && !zoneFilter.includes(String(r.cellar_zone || "Unassigned"))) return false;
              if (fillTierFilter && !matchesFillTierFilter(r)) return false;
              if (alertFlagFilter && !matchesAlertFlagFilter(r)) return false;
              if (isFullFilter !== "" && !!r.is_full !== (isFullFilter === "true")) return false;
              return true;
            });
            const scopeParts: string[] = [];
            if (zoneFilter.length > 0) scopeParts.push(`Zone: ${zoneFilter.join(", ")}`);
            if (fillTierFilter) scopeParts.push(`Fill tier: ${fillTierFilter}`);
            if (alertFlagFilter === "approaching-neutral") scopeParts.push(`Flag: approaching neutral (fill ${approachingNeutralFills}+)`);
            else if (alertFlagFilter === "idle") scopeParts.push(`Flag: idle >${idleBarrelDays} days`);
            else if (alertFlagFilter === "no-fills-maintenance") scopeParts.push("Flag: no fills — cooperage only");
            else if (alertFlagFilter === "no-fills-none") scopeParts.push("Flag: no records at all");
            if (isFullFilter === "true") scopeParts.push("Is Full: Yes");
            else if (isFullFilter === "false") scopeParts.push("Is Full: No (empty)");
            const barrelHealthCols: { key: string; label: string; fmt: (r: Record<string, unknown>) => string }[] = [
              { key: "vessel_ref", label: "Vessel Ref", fmt: r => String(r.vessel_ref ?? "") },
              { key: "vessel_type", label: "Vessel Type", fmt: r => String(r.vessel_type ?? "") },
              { key: "cellar_zone", label: "Cellar Zone", fmt: r => String(r.cellar_zone ?? "") },
              { key: "fill_number", label: "Fill Number", fmt: r => r.fill_number != null ? String(r.fill_number) : "" },
              { key: "_fill_tier", label: "Fill Tier", fmt: r => {
                if (Number(r.fill_count ?? 0) === 0) {
                  return Number(r.maintenance_count ?? 0) > 0 ? "No fills \u2014 cooperage only" : "No records at all";
                }
                return fillOakLabel(Number(r.fill_number)).label;
              } },
              { key: "is_full", label: "Is Full", fmt: r => r.is_full ? "Yes" : "No" },
              { key: "empty_since", label: "Empty Since", fmt: r => r.empty_since ? fmtDate(r.empty_since) : "" },
              { key: "_idle_days", label: "Idle Days", fmt: r => { const d = daysSince(r.empty_since); return !r.is_full && d !== null ? String(d) : ""; } },
              { key: "_approaching_neutral", label: "Approaching Neutral", fmt: r => Number(r.fill_number ?? 0) >= approachingNeutralFills ? "Yes" : "No" },
            ];
            const handlePrint = () => {
              const scope = `Active barrels${scopeParts.length ? " \u2014 " + scopeParts.join(", ") : " (all)"}`;
              const headers = ["Vessel Ref", "Type", "Cellar Zone", "Fill No.", "Fill Tier", "Is Full", "Empty Since", "Idle Days", "Approaching Neutral"];
              const rows = exportBarrels.map(r => {
                const idleDays = !r.is_full && daysSince(r.empty_since) !== null ? String(daysSince(r.empty_since)) : "\u2014";
                return [
                  String(r.vessel_ref ?? ""),
                  String(r.vessel_type ?? ""),
                  String(r.cellar_zone ?? ""),
                  r.fill_number != null ? String(r.fill_number) : "\u2014",
                  (() => {
                    if (Number(r.fill_count ?? 0) === 0) {
                      return Number(r.maintenance_count ?? 0) > 0 ? "No fills \u2014 cooperage only" : "No records at all";
                    }
                    return fillOakLabel(Number(r.fill_number)).label;
                  })(),
                  r.is_full ? "Yes" : "No",
                  r.empty_since ? fmtDate(r.empty_since) : "\u2014",
                  idleDays,
                  Number(r.fill_number ?? 0) >= approachingNeutralFills ? "Yes" : "No",
                ];
              });

              const win = window.open("", "_blank");
              if (!win) return;
              const doc = win.document;

              // Build document with DOM APIs so no user data is interpolated into HTML
              doc.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Barrel Health Summary</title><style>" +
                "body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}" +
                "h1{font-size:14px;font-weight:700;margin:0 0 2px}" +
                ".meta{font-size:10px;color:#555;margin-bottom:12px}" +
                "table{width:100%;border-collapse:collapse;font-size:11px}" +
                "th{background:#f0f0f0;font-weight:700;text-align:left;padding:5px 8px;border:1px solid #ccc}" +
                "td{padding:4px 8px;border:1px solid #ddd;vertical-align:top}" +
                "tr:nth-child(even) td{background:#fafafa}" +
                ".footer{margin-top:14px;font-size:9px;color:#888}" +
                "@media print{body{margin:10mm}}" +
                "</style></head><body></body></html>");
              doc.close();

              const h1 = doc.createElement("h1");
              h1.textContent = `Barrel Health Summary \u2014 ${farmNameVessels}`;
              doc.body.appendChild(h1);

              const meta = doc.createElement("div");
              meta.className = "meta";
              meta.textContent = `Scope: ${scope}  \u00b7  Printed: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
              doc.body.appendChild(meta);

              const noFillsCooperageCount = exportBarrels.filter(r => Number(r.fill_count ?? 0) === 0 && Number(r.maintenance_count ?? 0) > 0).length;
              const noFillsNoneCount = exportBarrels.filter(r => Number(r.fill_count ?? 0) === 0 && Number(r.maintenance_count ?? 0) === 0).length;
              const noFillsPrintCount = noFillsCooperageCount + noFillsNoneCount;
              if (noFillsPrintCount > 0) {
                const note = doc.createElement("div");
                note.style.cssText = "background:#f3e8ff;border:1px solid #c084fc;border-radius:4px;padding:6px 10px;margin-bottom:10px;font-size:10px;color:#6b21a8";
                const parts: string[] = [];
                if (noFillsCooperageCount > 0) parts.push(`${noFillsCooperageCount} \u201cNo fills \u2014 cooperage only\u201d`);
                if (noFillsNoneCount > 0) parts.push(`${noFillsNoneCount} \u201cNo records at all\u201d`);
                note.textContent = `Note: ${parts.join(", ")} barrel${noFillsPrintCount !== 1 ? "s" : ""} have no fill history \u2014 see Fill Tier column for details.`;
                doc.body.appendChild(note);
              }

              const table = doc.createElement("table");
              const thead = doc.createElement("thead");
              const hRow = doc.createElement("tr");
              for (const h of headers) {
                const th = doc.createElement("th");
                th.textContent = h;
                hRow.appendChild(th);
              }
              thead.appendChild(hRow);
              table.appendChild(thead);

              const tbody = doc.createElement("tbody");
              for (const cells of rows) {
                const tr = doc.createElement("tr");
                for (const cell of cells) {
                  const td = doc.createElement("td");
                  td.textContent = cell;
                  tr.appendChild(td);
                }
                tbody.appendChild(tr);
              }
              table.appendChild(tbody);
              doc.body.appendChild(table);

              const footer = doc.createElement("div");
              footer.className = "footer";
              footer.textContent = `${exportBarrels.length} barrel${exportBarrels.length !== 1 ? "s" : ""} shown`;
              doc.body.appendChild(footer);

              win.focus();
              win.print();
            };
            return (
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  disabled={exportBarrels.length === 0}
                  onClick={handlePrint}
                >
                  <Printer className="w-3 h-3 mr-1" />Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  disabled={exportBarrels.length === 0 || csvExporting}
                  onClick={async () => {
                    setCsvExporting(true);
                    try {
                      // Parallel aggregate queries — clean summary + fill summary
                      const [summaryRes, fillSummaryRes] = await Promise.all([
                        fetch(api(`farms/${farmId}/winery-vessels-clean-summary`), { credentials: "include" }),
                        fetch(api(`farms/${farmId}/winery-vessels-fill-summary`), { credentials: "include" }),
                      ]);
                      if (!summaryRes.ok || !fillSummaryRes.ok) {
                        toast({ title: "Export failed", description: "Could not load barrel history. Please try again.", variant: "destructive" });
                        return;
                      }
                      const [summaryBody, fillSummaryBody] = await Promise.all([summaryRes.json(), fillSummaryRes.json()]);
                      // Build lookup: vesselId → { lastCleanDate, cleanCount }
                      const cleanMap = new Map<number, { lastCleanDate: string; cleanCount: number }>();
                      for (const row of (summaryBody.records ?? []) as Record<string, unknown>[]) {
                        cleanMap.set(Number(row.vessel_id), {
                          lastCleanDate: row.last_clean_date ? fmtDate(row.last_clean_date) : "",
                          cleanCount: Number(row.clean_count ?? 0),
                        });
                      }
                      // Build lookup: vesselId → { lastFillDate, lastRackOutDate }
                      const fillMap = new Map<number, { lastFillDate: string; lastRackOutDate: string }>();
                      for (const row of (fillSummaryBody.records ?? []) as Record<string, unknown>[]) {
                        fillMap.set(Number(row.vessel_id), {
                          lastFillDate: row.last_fill_date ? fmtDate(row.last_fill_date) : "",
                          lastRackOutDate: row.last_rack_out_date ? fmtDate(row.last_rack_out_date) : "",
                        });
                      }
                      const colsWithCleans: { key: string; label: string; fmt: (r: Record<string, unknown>) => string }[] = [
                        ...barrelHealthCols,
                        { key: "_last_fill_date", label: "Last Fill Date", fmt: (r) => fillMap.get(Number(r.id))?.lastFillDate ?? "" },
                        { key: "_last_rack_out_date", label: "Last Rack-out Date", fmt: (r) => fillMap.get(Number(r.id))?.lastRackOutDate ?? "" },
                        { key: "_last_clean_date", label: "Last Clean Date", fmt: (r) => cleanMap.get(Number(r.id))?.lastCleanDate ?? "" },
                        { key: "_clean_count", label: "Total Clean Count", fmt: (r) => String(cleanMap.get(Number(r.id))?.cleanCount ?? 0) },
                      ];
                      const noFillsCooperageCsvCount = exportBarrels.filter(r => Number(r.fill_count ?? 0) === 0 && Number(r.maintenance_count ?? 0) > 0).length;
                      const noFillsNoneCsvCount = exportBarrels.filter(r => Number(r.fill_count ?? 0) === 0 && Number(r.maintenance_count ?? 0) === 0).length;
                      const noFillsCsvParts: string[] = [];
                      if (noFillsCooperageCsvCount > 0) noFillsCsvParts.push(`${noFillsCooperageCsvCount} "No fills — cooperage only"`);
                      if (noFillsNoneCsvCount > 0) noFillsCsvParts.push(`${noFillsNoneCsvCount} "No records at all"`);
                      exportCSV(
                        exportBarrels,
                        "barrel-health-summary.csv",
                        colsWithCleans,
                        [
                          csvComment(`Barrel Health Summary — ${farmNameVessels}`),
                          csvComment(`Scope: Active barrels${scopeParts.length ? " — " + scopeParts.join(", ") : " (all)"}`),
                          ...(noFillsCsvParts.length > 0 ? [csvComment(`Warning: ${noFillsCsvParts.join(", ")} barrel${(noFillsCooperageCsvCount + noFillsNoneCsvCount) !== 1 ? "s" : ""} have no fill history — see Fill Tier column for details`)] : []),
                        ],
                      );
                    } catch {
                      toast({ title: "Export failed", description: "An unexpected error occurred loading cleaning history. Please try again.", variant: "destructive" });
                    } finally {
                      setCsvExporting(false);
                    }
                  }}
                >
                  {csvExporting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <FileDown className="w-3 h-3 mr-1" />}Export CSV
                </Button>
              </div>
            );
          })()}

          {/* Fill-tier breakdown */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Oak age — active barrels by fill number (click to filter)</p>
            <div className="flex flex-wrap gap-1.5">
              {([
                { key: "fill-1", label: "New oak", count: barrelStats.tier["1"], cls: "bg-amber-100 text-amber-800 border-amber-200" },
                { key: "fill-2", label: "2nd fill", count: barrelStats.tier["2"], cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                { key: "fill-3", label: "3rd fill", count: barrelStats.tier["3"], cls: "bg-lime-100 text-lime-700 border-lime-200" },
                { key: "fill-4", label: "4th fill", count: barrelStats.tier["4"], cls: "bg-blue-100 text-blue-700 border-blue-200" },
                { key: "fill-5plus", label: "Neutral (5th+)", count: barrelStats.tier["5plus"], cls: "bg-gray-100 text-gray-600 border-gray-200" },
              ]).map(({ key, label, count, cls }) => (
                <button
                  key={key}
                  onClick={() => setFillTierFilter(fillTierFilter === key ? "" : key)}
                  className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all ${cls} ${fillTierFilter === key ? "ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"}`}
                >
                  <span>{label}</span>
                  <span className="font-bold">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert flags */}
          {(barrelStats.approaching > 0 || barrelStats.idle > 0 || barrelStats.noFillsWithMaintenance > 0 || barrelStats.noFillsNoRecords > 0) && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Flags requiring attention</p>
              <div className="flex flex-wrap gap-1.5">
                {barrelStats.noFillsWithMaintenance > 0 && (
                  <button
                    onClick={() => setAlertFlagFilter(alertFlagFilter === "no-fills-maintenance" ? "" : "no-fills-maintenance")}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-amber-50 text-amber-700 border-amber-200 ${alertFlagFilter === "no-fills-maintenance" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-amber-100"}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>No fills — cooperage only</span>
                    <span className="font-bold">{barrelStats.noFillsWithMaintenance}</span>
                  </button>
                )}
                {barrelStats.noFillsNoRecords > 0 && (
                  <button
                    onClick={() => setAlertFlagFilter(alertFlagFilter === "no-fills-none" ? "" : "no-fills-none")}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-gray-100 text-gray-600 border-gray-300 ${alertFlagFilter === "no-fills-none" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-gray-200"}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>No records at all</span>
                    <span className="font-bold">{barrelStats.noFillsNoRecords}</span>
                  </button>
                )}
                {barrelStats.approaching > 0 && (
                  <button
                    onClick={() => setAlertFlagFilter(alertFlagFilter === "approaching-neutral" ? "" : "approaching-neutral")}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-orange-50 text-orange-700 border-orange-200 ${alertFlagFilter === "approaching-neutral" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-orange-100"}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>{barrelStats.approaching} approaching neutral</span>
                    <span className="text-orange-500 text-xs font-normal">(fill {approachingNeutralFills}+)</span>
                  </button>
                )}
                {barrelStats.idle > 0 && (
                  <button
                    onClick={() => setAlertFlagFilter(alertFlagFilter === "idle" ? "" : "idle")}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-red-50 text-red-700 border-red-200 ${alertFlagFilter === "idle" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-red-100"}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>{barrelStats.idle} idle barrel{barrelStats.idle !== 1 ? "s" : ""}</span>
                    <span className="text-red-500 text-xs font-normal">(empty &gt;{idleBarrelDays} days)</span>
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
                {(() => {
                  // Build zone data rows first so we can sort when a flag filter is active
                  const zoneRows = cellarZones.map(zone => {
                    const zoneBarrels = barrels.filter(r => String(r.cellar_zone || "Unassigned") === zone);
                    // Apply the active alert-flag and fill-status filters so counts match what the table will show
                    const zoneFiltered = zoneBarrels.filter(r => {
                      if (alertFlagFilter && !matchesAlertFlagFilter(r)) return false;
                      if (isFullFilter !== "" && !!r.is_full !== (isFullFilter === "true")) return false;
                      return true;
                    });
                    const full = zoneFiltered.filter(r => r.is_full).length;
                    const empty = zoneFiltered.length - full;
                    const flaggedCount = alertFlagFilter ? zoneFiltered.length : null;
                    return { zone, full, empty, flaggedCount };
                  });

                  // When a flag filter is active, sort zones by flagged count descending so the worst-affected appear first
                  const sortedRows = alertFlagFilter
                    ? [...zoneRows].sort((a, b) => (b.flaggedCount ?? 0) - (a.flaggedCount ?? 0))
                    : zoneRows;

                  const flagLabel = alertFlagFilter === "no-fills-maintenance" ? "no fills"
                    : alertFlagFilter === "no-fills-none" ? "no records"
                    : alertFlagFilter === "approaching-neutral" ? "approaching neutral"
                    : alertFlagFilter === "idle" ? "idle"
                    : null;

                  return sortedRows.map(({ zone, full, empty, flaggedCount }) => {
                    const isSelected = zoneFilter.includes(zone);
                    const isDimmed = alertFlagFilter && flaggedCount === 0 && !isSelected;
                    return (
                      <button
                        key={zone}
                        onClick={() => setZoneFilter(isSelected ? zoneFilter.filter(z => z !== zone) : [...zoneFilter, zone])}
                        className={`flex items-center gap-2 rounded border px-2 py-1 text-xs text-left transition-colors ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-1" : "bg-background hover:bg-muted/40"} ${isDimmed ? "opacity-40" : ""}`}
                      >
                        <span className="font-semibold">{zone}</span>
                        {flaggedCount !== null
                          ? <span className={`font-bold ${flaggedCount > 0 ? "text-amber-700" : "text-slate-400"}`}>{flaggedCount} {flagLabel}</span>
                          : isFullFilter === "false"
                          ? <span className="text-slate-500">○ {empty}</span>
                          : isFullFilter === "true"
                          ? <span className="text-green-700 font-medium">● {full}</span>
                          : <><span className="text-green-700 font-medium">● {full}</span><span className="text-slate-400">○ {empty}</span></>}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Is-full filter chips */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Filter by fill status</p>
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                // Respect the active zone and alert-flag filters so counts match what the table will show
                const scopedBarrels = barrels.filter(r => {
                  if (zoneFilter.length > 0 && !zoneFilter.includes(String(r.cellar_zone || "Unassigned"))) return false;
                  if (alertFlagFilter && !matchesAlertFlagFilter(r)) return false;
                  return true;
                });
                const fullCount = scopedBarrels.filter(r => r.is_full).length;
                const emptyCount = scopedBarrels.length - fullCount;
                return (
                  <>
                    <button
                      onClick={() => setIsFullFilter(isFullFilter === "true" ? "" : "true")}
                      className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-green-50 text-green-700 border-green-200 ${isFullFilter === "true" ? "ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"}`}
                    >
                      <span>● Full</span>
                      <span className="font-bold">{fullCount}</span>
                    </button>
                    <button
                      onClick={() => setIsFullFilter(isFullFilter === "false" ? "" : "false")}
                      className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium transition-all bg-slate-50 text-slate-600 border-slate-200 ${isFullFilter === "false" ? "ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"}`}
                    >
                      <span>○ Empty</span>
                      <span className="font-bold">{emptyCount}</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          {(zoneFilter.length > 0 || fillTierFilter || alertFlagFilter || isFullFilter !== "") && (
            <p className="text-xs text-muted-foreground">
              {/* Build a readable sentence: "Showing [full] barrels [in Zone A, Zone B] [on 2nd fill] [flagged as …]" */}
              Showing{isFullFilter === "true" && <> <span className="font-medium">full</span></>}{isFullFilter === "false" && <> <span className="font-medium">empty</span></>} barrels
              {zoneFilter.length > 0 && <> in <span className="font-medium">{zoneFilter.join(", ")}</span></>}
              {fillTierFilter && <>{zoneFilter.length > 0 && <> · </>}on <span className="font-medium">{fillTierFilter === "fill-1" ? "new oak" : fillTierFilter === "fill-5plus" ? "neutral oak (5th+ fill)" : fillTierFilter.replace("fill-", "") + (fillTierFilter === "fill-2" ? "nd" : fillTierFilter === "fill-3" ? "rd" : "th") + " fill"}</span></>}
              {alertFlagFilter && <>{(zoneFilter.length > 0 || fillTierFilter) && <> · </>}{alertFlagFilter === "approaching-neutral" && <>flagged as <span className="font-medium">approaching neutral (fill {approachingNeutralFills}+)</span></>}{alertFlagFilter === "idle" && <>flagged as <span className="font-medium">idle &gt;{idleBarrelDays} days</span></>}{alertFlagFilter === "no-fills" && <>flagged as <span className="font-medium">no fills logged</span></>}</>}
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
              <th className="text-left p-3 font-medium cursor-pointer select-none hover:bg-muted/60" onClick={() => handleSort("vessel_ref")}>Ref<SortIcon col="vessel_ref" /></th>
              <th className="text-left p-3 font-medium cursor-pointer select-none hover:bg-muted/60" onClick={() => handleSort("vessel_type")}>Type<SortIcon col="vessel_type" /></th>
              <th className="text-right p-3 font-medium cursor-pointer select-none hover:bg-muted/60" onClick={() => handleSort("capacity_litres")}>Capacity (L)<SortIcon col="capacity_litres" /></th>
              <th className="text-left p-3 font-medium cursor-pointer select-none hover:bg-muted/60" onClick={() => handleSort("location")}>Location<SortIcon col="location" /></th>
              <th className="text-left p-3 font-medium cursor-pointer select-none hover:bg-muted/60" onClick={() => handleSort("current_contents")}>Current Contents<SortIcon col="current_contents" /></th>
              <th className="text-right p-3 font-medium cursor-pointer select-none hover:bg-muted/60" onClick={() => handleSort("current_volume_litres")}>Volume (L)<SortIcon col="current_volume_litres" /></th>
              <th className="text-left p-3 font-medium cursor-pointer select-none hover:bg-muted/60" onClick={() => handleSort("status")}>Status<SortIcon col="status" /></th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {sortedData.map(r => {
                const isBarrelRow = isBarrelVessel(r.vessel_type);
                const locationDisplay = r.cellar_zone
                  ? `${String(r.cellar_zone)}${r.cellar_position ? ` / ${String(r.cellar_position)}` : ""}`
                  : fmt(r.location);
                return (
                  <tr key={String(r.id)} className="hover:bg-muted/20">
                    <td className="p-3 font-mono font-semibold">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>{fmt(r.vessel_ref)}</span>
                        {isBarrelRow && Number(r.fill_count ?? 0) === 0 && (
                          <span className="text-xs rounded border px-1.5 py-0.5 bg-amber-50 text-amber-700 border-amber-200 font-medium normal-case tracking-normal">No fills logged</span>
                        )}
                        {isBarrelRow && Number(r.clean_count ?? 0) === 0 && (
                          <span className="text-xs rounded border px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200 font-medium normal-case tracking-normal">Never cleaned</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <div>{fmt(r.vessel_type)}</div>
                      {isBarrelRow && (() => {
                        const fill = Number(r.fill_number ?? 0);
                        const isIdle = !r.is_full && (() => { const d = daysSince(r.empty_since); return d !== null && d > idleBarrelDays; })();
                        const isApproaching = fill >= approachingNeutralFills;
                        return (
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            {r.is_full
                              ? <span className="text-xs text-green-700 font-medium">● Full</span>
                              : <span className="text-xs text-slate-400">○ Empty</span>}
                            {fill >= 1 && (() => {
                              const { label, cls } = fillOakLabel(fill);
                              return <span className={`text-xs rounded px-1 py-0.5 ${cls}`}>{label}</span>;
                            })()}
                            {Number(r.fill_count ?? 0) > 0 && (
                              <span className="text-xs rounded px-1 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                                {Number(r.fill_count)} fill{Number(r.fill_count) !== 1 ? "s" : ""}
                              </span>
                            )}
                            {(() => {
                              const cc = Number(r.clean_count ?? 0);
                              return (
                                <span className={`text-xs rounded px-1 py-0.5 border font-medium ${cc === 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                  {cc} clean{cc !== 1 ? "s" : ""}
                                </span>
                              );
                            })()}
                            {r.last_cleaned_date != null && (
                               <span className="text-xs text-muted-foreground">Last cleaned {fmtDate(r.last_cleaned_date)}</span>
                             )}
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
                      <RadixTooltipProvider>
                        <RadixTooltip>
                          <RadixTooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openView(r)}><Eye className="h-4 w-4" /></Button>
                          </RadixTooltipTrigger>
                          <RadixTooltipContent>View details</RadixTooltipContent>
                        </RadixTooltip>
                      </RadixTooltipProvider>
                      {isBarrelRow && (
                        <RadixTooltipProvider>
                          <RadixTooltip>
                            <RadixTooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBarrelPrint(r)}><Printer className="h-4 w-4" /></Button>
                            </RadixTooltipTrigger>
                            <RadixTooltipContent>Print barrel history</RadixTooltipContent>
                          </RadixTooltip>
                        </RadixTooltipProvider>
                      )}
                      <RadixTooltipProvider>
                        <RadixTooltip>
                          <RadixTooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                          </RadixTooltipTrigger>
                          <RadixTooltipContent>Edit vessel</RadixTooltipContent>
                        </RadixTooltip>
                      </RadixTooltipProvider>
                      <RadixTooltipProvider>
                        <RadixTooltip>
                          <RadixTooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                          </RadixTooltipTrigger>
                          <RadixTooltipContent>Delete vessel</RadixTooltipContent>
                        </RadixTooltip>
                      </RadixTooltipProvider>
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
              {isBarrelVessel(view.vessel_type) && (
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
            {isBarrelVessel(view.vessel_type) && (
              <>
                <BarrelMovementLog farmId={farmId} vesselId={view.id as number} currentZone={String(view.cellar_zone ?? "")} currentPosition={String(view.cellar_position ?? "")} onMoveLogged={(toZone, toPosition) => setView(v => v ? { ...v, cellar_zone: toZone, cellar_position: toPosition } : v)} />
                <BarrelFillHistory farmId={farmId} vesselId={view.id as number} maxExistingFill={Number(view.fill_number ?? 0)} approachingNeutralFills={approachingNeutralFills} />
                <BarrelMaintenanceLog farmId={farmId} vesselId={view.id as number} />
              </>
            )}
            <VesselCleanRow farmId={farmId} vesselId={view.id as number} />
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {isBarrelVessel(view.vessel_type) && (
                <Button variant="outline" size="sm" onClick={() => handleBarrelPrint(view)}>
                  <Printer className="w-3 h-3 mr-1" />Print Barrel History
                </Button>
              )}
              <Button onClick={() => setView(null)}>Close</Button>
            </DialogFooter>
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
