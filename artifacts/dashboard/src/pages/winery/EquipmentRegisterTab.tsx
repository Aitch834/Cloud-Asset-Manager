import { fetchWineryJson, today, CALIBRATION_RESULT_OPTIONS, fmtDate, fmt, useWineryCrud, useIsViticultureActive, exportCSV, csvComment, QueryErrorNotice, EmptyState, NotesCell, EQUIPMENT_TYPES, CALIBRATION_FREQ_OPTIONS, EQUIPMENT_STATUS_OPTIONS, ViewField } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
import { useFarmName } from "@/hooks/use-farm-name";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { BOTTLING_COLUMNS, BOTTLING_IMPORT_HEADERS, resolveBottlingField, bottlingImportRecord, parseCsvText, parseBottlingCsv } from "@/lib/bottling-csv";
import { computePrimaryPhTa, computePhTaStagePoints } from "@/lib/ph-ta-stages";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Eye, FlaskConical, Wine, Beaker, Gauge, Thermometer, Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Wrench, ShieldCheck, FileDown, Printer, Settings2, RefreshCw, GitBranch, Leaf, Search, Upload, PenLine, ArrowUp, ArrowDown, ArrowUpDown, Factory, Droplets } from "lucide-react";
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

export function CalibrationRows({ farmId, equipmentId }: { farmId: number; equipmentId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const viticultureActive = useIsViticultureActive(farmId);
  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-equipment-cals", farmId, equipmentId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations`)).records ?? []) as Record<string, unknown>[],
    enabled: !!equipmentId && viticultureActive,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ calibrationDate: today, result: "pass" });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addMut = useMutation({
    mutationFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); } },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-equipment-cals", farmId, equipmentId] }); qc.invalidateQueries({ queryKey: ["winery-equipment", farmId] }); setShowAdd(false); setForm({ calibrationDate: today, result: "pass" }); toast({ title: "Calibration recorded" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: async (calId: number) => { const r = await fetch(api(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations/${calId}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["winery-equipment-cals", farmId, equipmentId] }),
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Calibration Records</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(s => !s)}><Plus className="w-3 h-3 mr-1" />Log Calibration</Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Calibration Date *</Label><Input type="date" max={today} value={form.calibrationDate ?? ""} onChange={e => sf("calibrationDate", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Result</Label>
              <Select value={form.result ?? "pass"} onValueChange={v => sf("result", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{CALIBRATION_RESULT_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Standard Used</Label><Input value={form.standardUsed ?? ""} onChange={e => sf("standardUsed", e.target.value)} className="h-8 text-xs" placeholder="e.g. HANNA buffer pH 7.01" /></div>
            <div><Label className="text-xs">Expected Value</Label><Input type="number" step="0.001" value={form.expectedValue ?? ""} onChange={e => sf("expectedValue", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Pre-cal Reading</Label><Input type="number" step="0.001" value={form.preCalibrationReading ?? ""} onChange={e => sf("preCalibrationReading", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Post-cal Reading</Label><Input type="number" step="0.001" value={form.postCalibrationReading ?? ""} onChange={e => sf("postCalibrationReading", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Next Cal Due</Label><Input type="date" value={form.nextCalibrationDue ?? ""} onChange={e => sf("nextCalibrationDue", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Operator</Label><Input value={form.operatorName ?? ""} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Certificate Ref</Label><Input value={form.certificateRef ?? ""} onChange={e => sf("certificateRef", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Action Taken</Label><Input value={form.actionTaken ?? ""} onChange={e => sf("actionTaken", e.target.value)} className="h-8 text-xs" placeholder="e.g. Adjusted" /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!form.calibrationDate || addMut.isPending}>{addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isError ? <QueryErrorNotice label="calibration records" error={error} /> : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No calibration records yet.</p> : (
        <div className="space-y-1">
          {(data ?? []).map(c => {
            const res = String(c.result ?? "pass");
            const badge = res === "pass" ? <span className="text-xs text-green-700 font-medium">✓ Pass</span> : res === "fail" ? <span className="text-xs text-red-700 font-medium">✗ Fail</span> : <span className="text-xs text-amber-700 font-medium">~ Adjusted</span>;
            return (
              <div key={String(c.id)} className="flex items-center justify-between text-xs border rounded px-3 py-1.5 gap-2">
                <span className="font-medium whitespace-nowrap">{fmtDate(c.calibration_date)}</span>
                <span className="text-muted-foreground">{fmt(c.standard_used)}</span>
                {badge}
                <span className="text-muted-foreground">{c.operator_name ? fmt(c.operator_name) : ""}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500 shrink-0" onClick={() => delMut.mutate(Number(c.id))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BOTTLING_MACHINE_TYPES = ["filler", "capper", "labeller", "bag-in-box", "sparkling-line", "other"];
const CIP_TIMING_OPTIONS = ["pre-run", "post-run", "routine"];
const MAINTENANCE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "planned-service",    label: "Planned Service" },
  { value: "filter-change",      label: "Filter Change" },
  { value: "nozzle-replacement", label: "Nozzle Replacement" },
  { value: "capper-adjustment",  label: "Capper Adjustment" },
  { value: "repair",             label: "Repair" },
  { value: "inspection",         label: "Inspection" },
  { value: "other",              label: "Other" },
];

function CipForm({ form, sf, machineId, isEdit = false }: { form: Record<string, string | boolean>; sf: (k: string, v: string | boolean) => void; machineId: number; isEdit?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">Clean Date *</Label><Input type="date" max={today} value={String(form.cleanDate ?? "")} onChange={e => sf("cleanDate", e.target.value)} className="h-8 text-xs" /></div>
        <div><Label className="text-xs">Timing</Label>
          <Select value={String(form.timing ?? "pre-run")} onValueChange={v => sf("timing", v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{CIP_TIMING_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Chemical Used</Label><Input value={String(form.chemicalUsed ?? "")} onChange={e => sf("chemicalUsed", e.target.value)} className="h-8 text-xs" placeholder="e.g. Diversol BX, IPA 70%" /></div>
        <div><Label className="text-xs">Concentration (%)</Label><Input type="number" step="0.1" min="0" value={String(form.concentrationPct ?? "")} onChange={e => sf("concentrationPct", e.target.value)} className="h-8 text-xs" /></div>
        <div><Label className="text-xs">Contact Time (mins)</Label><Input type="number" step="1" min="0" value={String(form.contactTimeMins ?? "")} onChange={e => sf("contactTimeMins", e.target.value)} className="h-8 text-xs" /></div>
        <div><Label className="text-xs">Temperature (°C)</Label><Input type="number" step="0.5" value={String(form.temperatureC ?? "")} onChange={e => sf("temperatureC", e.target.value)} className="h-8 text-xs" /></div>
        <div><Label className="text-xs">Operator</Label><Input value={String(form.operatorName ?? "")} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
        <div className="flex items-center gap-2 pt-5">
          <Checkbox id={`rinse-${machineId}-${isEdit ? "edit" : "add"}`} checked={!!form.rinseConfirmed} onCheckedChange={v => sf("rinseConfirmed", !!v)} />
          <Label htmlFor={`rinse-${machineId}-${isEdit ? "edit" : "add"}`} className="text-xs cursor-pointer">Rinse confirmed</Label>
        </div>
      </div>
      <div><Label className="text-xs">Notes</Label><Input value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} className="h-8 text-xs" placeholder="Optional" /></div>
    </div>
  );
}

export function CipRows({ farmId, machineId }: { farmId: number; machineId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const viticultureActive = useIsViticultureActive(farmId);
  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-bottling-machine-cleans", farmId, machineId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-bottling-machines/${machineId}/cleans`)).records ?? []) as Record<string, unknown>[],
    enabled: !!machineId && viticultureActive,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, string | boolean>>({ cleanDate: today, timing: "pre-run", rinseConfirmed: true });
  const sfa = (k: string, v: string | boolean) => setAddForm(f => ({ ...f, [k]: v }));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | boolean>>({});
  const sfe = (k: string, v: string | boolean) => setEditForm(f => ({ ...f, [k]: v }));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["winery-bottling-machine-cleans", farmId, machineId] });
    qc.invalidateQueries({ queryKey: ["winery-bottling-machines", farmId] });
  };

  const addMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-bottling-machines/${machineId}/cleans`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(addForm) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); }
    },
    onSuccess: () => { invalidate(); setShowAdd(false); setAddForm({ cleanDate: today, timing: "pre-run", rinseConfirmed: true }); toast({ title: "CIP record logged" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const editMut = useMutation({
    mutationFn: async (cleanId: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-bottling-machines/${machineId}/cleans/${cleanId}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(editForm) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); }
    },
    onSuccess: () => { invalidate(); setEditingId(null); toast({ title: "CIP record updated" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: async (cleanId: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-bottling-machines/${machineId}/cleans/${cleanId}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); }
    },
    onSuccess: () => invalidate(),
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  const startEdit = (c: Record<string, unknown>) => {
    setEditingId(Number(c.id));
    setEditForm({
      cleanDate: String(c.clean_date ?? ""),
      timing: String(c.timing ?? "pre-run"),
      chemicalUsed: String(c.chemical_used ?? ""),
      concentrationPct: String(c.concentration_pct ?? ""),
      contactTimeMins: String(c.contact_time_mins ?? ""),
      temperatureC: String(c.temperature_c ?? ""),
      rinseConfirmed: !!c.rinse_confirmed,
      operatorName: String(c.operator_name ?? ""),
      notes: String(c.notes ?? ""),
    });
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Droplets className="w-3 h-3" />CIP / Cleaning Log</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setShowAdd(s => !s); setEditingId(null); }}><Plus className="w-3 h-3 mr-1" />Log Clean</Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20">
          <CipForm form={addForm} sf={sfa} machineId={machineId} />
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!addForm.cleanDate || addMut.isPending}>{addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" />
        : isError ? <QueryErrorNotice label="CIP records" error={error} />
        : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No CIP records yet.</p>
        : (
        <div className="space-y-1">
          {(data ?? []).map(c => editingId === Number(c.id) ? (
            <div key={String(c.id)} className="border rounded-lg p-3 bg-muted/20">
              <CipForm form={editForm} sf={sfe} machineId={machineId} isEdit />
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="h-7 text-xs" onClick={() => editMut.mutate(Number(c.id))} disabled={!editForm.cleanDate || editMut.isPending}>{editMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div key={String(c.id)} className="flex items-center justify-between text-xs border rounded px-3 py-1.5 gap-2 flex-wrap">
              <span className="font-medium whitespace-nowrap">{fmtDate(c.clean_date)}</span>
              <span className="text-muted-foreground capitalize">{fmt(c.timing)}</span>
              {!!c.chemical_used && <span>{fmt(c.chemical_used)}{c.concentration_pct ? ` @ ${c.concentration_pct}%` : ""}</span>}
              {!!c.contact_time_mins && <span className="text-muted-foreground">{String(c.contact_time_mins)} min</span>}
              {!!c.temperature_c && <span className="text-muted-foreground">{String(c.temperature_c)}°C</span>}
              {c.rinse_confirmed ? <span className="text-green-700 font-medium">✓ Rinsed</span> : <span className="text-amber-700">Rinse unconfirmed</span>}
              {!!c.operator_name && <span className="text-muted-foreground">{fmt(c.operator_name)}</span>}
              <div className="flex gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => startEdit(c)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(c.id))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MaintenanceRows({ farmId, machineId }: { farmId: number; machineId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const viticultureActive = useIsViticultureActive(farmId);
  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-bottling-machine-maintenance", farmId, machineId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-bottling-machines/${machineId}/maintenance`)).records ?? []) as Record<string, unknown>[],
    enabled: !!machineId && viticultureActive,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, string>>({ maintenanceDate: today, maintenanceType: "planned-service" });
  const sfa = (k: string, v: string) => setAddForm(f => ({ ...f, [k]: v }));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const sfe = (k: string, v: string) => setEditForm(f => ({ ...f, [k]: v }));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["winery-bottling-machine-maintenance", farmId, machineId] });
    qc.invalidateQueries({ queryKey: ["winery-bottling-machines", farmId] });
  };

  const addMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-bottling-machines/${machineId}/maintenance`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(addForm) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string, string>).error || "Save failed"); }
    },
    onSuccess: () => { invalidate(); setShowAdd(false); setAddForm({ maintenanceDate: today, maintenanceType: "planned-service" }); toast({ title: "Maintenance entry logged" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const editMut = useMutation({
    mutationFn: async (entryId: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-bottling-machines/${machineId}/maintenance/${entryId}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(editForm) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string, string>).error || "Save failed"); }
    },
    onSuccess: () => { invalidate(); setEditingId(null); toast({ title: "Maintenance entry updated" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: async (entryId: number) => {
      const r = await fetch(api(`farms/${farmId}/winery-bottling-machines/${machineId}/maintenance/${entryId}`), { method: "DELETE", credentials: "include" });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string, string>).error || "Delete failed"); }
    },
    onSuccess: () => invalidate(),
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  const startEdit = (c: Record<string, unknown>) => {
    setEditingId(Number(c.id));
    setEditForm({
      maintenanceDate: String(c.maintenance_date ?? ""),
      maintenanceType: String(c.maintenance_type ?? "planned-service"),
      description: String(c.description ?? ""),
      carriedOutBy: String(c.carried_out_by ?? ""),
      nextServiceDue: String(c.next_service_due ?? ""),
      notes: String(c.notes ?? ""),
    });
  };

  const MaintenanceForm = ({ form, sf }: { form: Record<string, string>; sf: (k: string, v: string) => void }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">Date *</Label><Input type="date" max={today} value={form.maintenanceDate ?? ""} onChange={e => sf("maintenanceDate", e.target.value)} className="h-8 text-xs" /></div>
        <div><Label className="text-xs">Type</Label>
          <Select value={form.maintenanceType ?? "planned-service"} onValueChange={v => sf("maintenanceType", v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{MAINTENANCE_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2"><Label className="text-xs">Description</Label><Input value={form.description ?? ""} onChange={e => sf("description", e.target.value)} className="h-8 text-xs" placeholder="What was done?" /></div>
        <div><Label className="text-xs">Carried Out By</Label><Input value={form.carriedOutBy ?? ""} onChange={e => sf("carriedOutBy", e.target.value)} className="h-8 text-xs" placeholder="Name or contractor" /></div>
        <div><Label className="text-xs">Next Service Due</Label><Input type="date" value={form.nextServiceDue ?? ""} onChange={e => sf("nextServiceDue", e.target.value)} className="h-8 text-xs" /></div>
      </div>
      <div><Label className="text-xs">Notes</Label><Input value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} className="h-8 text-xs" placeholder="Optional" /></div>
    </div>
  );

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Wrench className="w-3 h-3" />Maintenance Log</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setShowAdd(s => !s); setEditingId(null); }}><Plus className="w-3 h-3 mr-1" />Log Entry</Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20">
          <MaintenanceForm form={addForm} sf={sfa} />
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!addForm.maintenanceDate || addMut.isPending}>{addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" />
        : isError ? <QueryErrorNotice label="maintenance records" error={error} />
        : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No maintenance entries yet.</p>
        : (
        <div className="space-y-1">
          {(data ?? []).map(c => editingId === Number(c.id) ? (
            <div key={String(c.id)} className="border rounded-lg p-3 bg-muted/20">
              <MaintenanceForm form={editForm} sf={sfe} />
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="h-7 text-xs" onClick={() => editMut.mutate(Number(c.id))} disabled={!editForm.maintenanceDate || editMut.isPending}>{editMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div key={String(c.id)} className="flex items-center justify-between text-xs border rounded px-3 py-1.5 gap-2 flex-wrap">
              <span className="font-medium whitespace-nowrap">{fmtDate(c.maintenance_date)}</span>
              {!!c.maintenance_type && <span className="text-muted-foreground capitalize">{MAINTENANCE_TYPE_OPTIONS.find(o => o.value === String(c.maintenance_type))?.label ?? String(c.maintenance_type)}</span>}
              {!!c.description && <span className="truncate max-w-[200px]">{String(c.description)}</span>}
              {!!c.carried_out_by && <span className="text-muted-foreground">{String(c.carried_out_by)}</span>}
              {!!c.next_service_due && <span className="text-muted-foreground whitespace-nowrap">Next: {fmtDate(c.next_service_due)}</span>}
              <div className="flex gap-0.5 shrink-0 ml-auto">
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => startEdit(c)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(c.id))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BottlingMachinesSection({ farmId }: { farmId: number }) {
  const farmName = useFarmName(farmId);
  const crud = useWineryCrud(farmId, "winery-bottling-machines", "winery-bottling-machines");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const now = new Date();
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysFromNow = new Date(); fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

  const openAdd = () => { setEditing(null); setForm({}); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm({
      machineRef: String(r.machine_ref ?? ""),
      machineType: String(r.machine_type ?? ""),
      manufacturer: String(r.manufacturer ?? ""),
      model: String(r.model ?? ""),
      serialNumber: String(r.serial_number ?? ""),
      commissionedDate: String(r.commissioned_date ?? ""),
      notes: String(r.notes ?? ""),
    });
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...form } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(form);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) { toast({ title: "Save failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); }
  };

  const cleanStatus = (r: Record<string, unknown>) => {
    if (!r.last_clean_date) return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Never cleaned</span>;
    const d = new Date(r.last_clean_date as string);
    if (d < sevenDaysAgo) return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Clean overdue</span>;
    return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Recently cleaned</span>;
  };

  const serviceStatus = (r: Record<string, unknown>) => {
    if (!r.next_service_due) return null;
    const d = new Date(r.next_service_due as string);
    if (d < now) return <span className="text-xs bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />Service overdue</span>;
    if (d <= fourteenDaysFromNow) return <span className="text-xs bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />Service due soon</span>;
    return null;
  };

  const overdueClean = crud.data.filter(m => {
    if (!m.last_clean_date) return true;
    return new Date(m.last_clean_date as string) < sevenDaysAgo;
  });

  const overdueService = crud.data.filter(m => {
    if (!m.next_service_due) return false;
    const d = new Date(m.next_service_due as string);
    return d < now || d <= fourteenDaysFromNow;
  });

  const machineCsvCols = [
    { key: "machine_ref", label: "Machine Ref" },
    { key: "machine_type", label: "Type" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "model", label: "Model" },
    { key: "serial_number", label: "Serial Number" },
    { key: "commissioned_date", label: "Commissioned", fmt: (r: Record<string, unknown>) => fmtDate(r.commissioned_date) },
    { key: "last_clean_date", label: "Last Cleaned", fmt: (r: Record<string, unknown>) => fmtDate(r.last_clean_date) },
    { key: "next_service_due", label: "Next Service Due", fmt: (r: Record<string, unknown>) => fmtDate(r.next_service_due) },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4 pt-6 border-t mt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm flex items-center gap-1.5"><Factory className="w-4 h-4" />Bottling Machine Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Register bottling lines with CIP / cleaning and maintenance logs for each machine. Required for hygiene scheme compliance and organic certification traceability.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "bottling-machines.csv", machineCsvCols, [
            csvComment(`Bottling Machine Register — ${farmName}`),
          ])} disabled={!crud.data.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Machine</Button>
        </div>
      </div>

      {overdueClean.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">CIP overdue: {overdueClean.map(m => String(m.machine_ref)).join(", ")}</p>
            <p className="text-xs text-amber-700 mt-0.5">Machines not cleaned in the last 7 days should be CIP'd before the next bottling run.</p>
          </div>
        </div>
      )}

      {overdueService.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Wrench className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Service due: {overdueService.map(m => `${String(m.machine_ref)} (${fmtDate(m.next_service_due)})`).join(", ")}</p>
            <p className="text-xs text-amber-700 mt-0.5">Scheduled service is overdue or due within 14 days. Log a maintenance entry once completed.</p>
          </div>
        </div>
      )}

      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.isError ? <QueryErrorNotice label="bottling machines" error={crud.error} />
        : crud.data.length === 0 ? <EmptyState icon={Factory} title="No bottling machines registered" sub="Add your bottling line(s) to track CIP cleaning and maintenance records." />
        : (
        <div className="space-y-2">
          {crud.data.map(r => {
            const isExpanded = expanded.has(r.id as number);
            const svcBadge = serviceStatus(r);
            return (
              <div key={String(r.id)} className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 p-3 bg-muted/20 hover:bg-muted/30">
                  <button className="flex items-center gap-1 text-muted-foreground shrink-0" onClick={() => setExpanded(s => { const n = new Set(s); isExpanded ? n.delete(r.id as number) : n.add(r.id as number); return n; })}>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <span className="font-mono font-semibold text-sm flex-shrink-0">{fmt(r.machine_ref)}</span>
                  {!!r.machine_type && <span className="text-xs text-muted-foreground capitalize">{String(r.machine_type).replace(/-/g, " ")}</span>}
                  <span className="text-xs text-muted-foreground hidden sm:block">{[r.manufacturer, r.model].filter(Boolean).map(String).join(" ")}</span>
                  <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="whitespace-nowrap">{r.last_clean_date ? `Last cleaned ${fmtDate(r.last_clean_date)}` : "Never cleaned"}</span>
                    {!!r.next_service_due && <span className="whitespace-nowrap">· Next service {fmtDate(r.next_service_due)}</span>}
                  </div>
                  <div className="shrink-0">{cleanStatus(r)}</div>
                  {svcBadge && <div className="shrink-0">{svcBadge}</div>}
                  <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-2 divide-y">
                    {!!r.notes && <p className="text-xs text-muted-foreground pb-2">{String(r.notes)}</p>}
                    <CipRows farmId={farmId} machineId={r.id as number} />
                    <MaintenanceRows farmId={farmId} machineId={r.id as number} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Register"} Bottling Machine</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Machine Reference *</Label><Input value={form.machineRef ?? ""} onChange={e => sf("machineRef", e.target.value)} placeholder="e.g. FILLER-01, LINE-A" /></div>
              <div>
                <Label>Machine Type</Label>
                <Select value={form.machineType ?? ""} onValueChange={v => sf("machineType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{BOTTLING_MACHINE_TYPES.map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace(/-/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Manufacturer</Label><Input value={form.manufacturer ?? ""} onChange={e => sf("manufacturer", e.target.value)} placeholder="e.g. Enos, PE Labellers" /></div>
              <div><Label>Model</Label><Input value={form.model ?? ""} onChange={e => sf("model", e.target.value)} /></div>
              <div><Label>Serial Number</Label><Input value={form.serialNumber ?? ""} onChange={e => sf("serialNumber", e.target.value)} /></div>
              <div><Label>Commissioned Date</Label><Input type="date" max={today} value={form.commissionedDate ?? ""} onChange={e => sf("commissionedDate", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} placeholder="Speed, configuration, special notes…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.machineRef || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Machine</DialogTitle><DialogDescription>Remove {fmt(deleting?.machine_ref)} and all its CIP and maintenance records?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EquipmentRegisterTab({ farmId }: { farmId: number }) {
  const farmNameEquip = useFarmName(farmId);
  const crud = useWineryCrud(farmId, "winery-equipment", "winery-equipment");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const now = new Date();
  const soon = new Date(); soon.setDate(soon.getDate() + 30);
  const overdue = crud.data.filter(e => e.next_calibration_due && new Date(e.next_calibration_due as string) < now);
  const dueSoon = crud.data.filter(e => {
    if (!e.next_calibration_due) return false;
    const d = new Date(e.next_calibration_due as string);
    return d >= now && d <= soon;
  });

  const openAdd = () => { setEditing(null); setForm({ status: "active" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...form } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(form);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const calStatus = (r: Record<string, unknown>) => {
    if (!r.next_calibration_due) return null;
    const d = new Date(r.next_calibration_due as string);
    if (d < now) return <span className="text-xs bg-red-100 text-red-700 rounded px-1.5 py-0.5">Overdue</span>;
    if (d <= soon) return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Due soon</span>;
    return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Current</span>;
  };
  const equipCsvCols = [
    { key: "equipment_ref", label: "Equipment Ref" },
    { key: "equipment_type", label: "Equipment Type" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "model", label: "Model" },
    { key: "serial_number", label: "Serial Number" },
    { key: "status", label: "Status" },
    { key: "last_calibration_date", label: "Last Calibrated", fmt: (r: Record<string, unknown>) => fmtDate(r.last_calibration_date) },
    { key: "next_calibration_due", label: "Next Calibration Due", fmt: (r: Record<string, unknown>) => fmtDate(r.next_calibration_due) },
    { key: "calibration_interval_months", label: "Interval (months)" },
    { key: "location", label: "Location" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Lab Equipment Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Register all winemaking analytical equipment with calibration records. Required for traceability of on-site SO₂ testing results. Third-party lab results don't require this — their accreditation covers traceability.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "equipment.csv", equipCsvCols, [
            csvComment(`Lab Equipment Register — ${farmNameEquip}`),
            csvComment("Scope: All equipment (no filters on this register)"),
          ])} disabled={!crud.data.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Equipment</Button>
        </div>
      </div>
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div><p className="font-semibold text-red-800 text-sm">Overdue calibration: {overdue.map(e => String(e.equipment_ref)).join(", ")}</p><p className="text-xs text-red-700 mt-0.5">Equipment with overdue calibration should not be used for compliance testing until recalibrated.</p></div>
        </div>
      )}
      {dueSoon.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div><p className="font-semibold text-amber-800 text-sm">Calibration due within 30 days: {dueSoon.map(e => String(e.equipment_ref)).join(", ")}</p></div>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.isError ? <QueryErrorNotice label="equipment records" error={crud.error} />
        : crud.data.length === 0 ? <EmptyState icon={ShieldCheck} title="No equipment registered" sub="Add analytical equipment (Ripper burette, pH meter, refractometer, etc.) to track calibration records." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Ref</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Manufacturer / Model</th>
              <th className="text-left p-3 font-medium">Serial No.</th>
              <th className="text-left p-3 font-medium">Last Cal.</th>
              <th className="text-left p-3 font-medium">Next Due</th>
              <th className="text-left p-3 font-medium">Cal Status</th>
              <th className="text-left p-3 font-medium">Equip Status</th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {crud.data.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 font-mono font-semibold">{fmt(r.equipment_ref)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{fmt(r.equipment_type)}</td>
                  <td className="p-3 text-xs">{[r.manufacturer, r.model].filter(Boolean).map(String).join(" ")}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.serial_number)}</td>
                  <td className="p-3 whitespace-nowrap text-xs">{fmtDate(r.last_calibration_date)}</td>
                  <td className="p-3 whitespace-nowrap text-xs">{fmtDate(r.next_calibration_due)}</td>
                  <td className="p-3">{calStatus(r)}</td>
                  <td className="p-3">{r.status === "active" ? <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Active</span> : <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{fmt(r.status)}</span>}</td>
                  <NotesCell notes={r.notes} />
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Register"} Equipment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Equipment Reference *</Label><Input value={form.equipmentRef ?? ""} onChange={e => sf("equipmentRef", e.target.value)} placeholder="e.g. RIPPER-01, PH-METER-A" /></div>
              <div>
                <Label>Equipment Type</Label>
                <Select value={form.equipmentType ?? ""} onValueChange={v => sf("equipmentType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{EQUIPMENT_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Manufacturer</Label><Input value={form.manufacturer ?? ""} onChange={e => sf("manufacturer", e.target.value)} placeholder="e.g. HANNA, CDR WineLab" /></div>
              <div><Label>Model</Label><Input value={form.model ?? ""} onChange={e => sf("model", e.target.value)} /></div>
              <div><Label>Serial Number</Label><Input value={form.serialNumber ?? ""} onChange={e => sf("serialNumber", e.target.value)} /></div>
              <div><Label>Purchase Date</Label><Input type="date" max={today} value={form.purchaseDate ?? ""} onChange={e => sf("purchaseDate", e.target.value)} /></div>
              <div>
                <Label>Calibration Frequency</Label>
                <Select value={form.calibrationFrequency ?? ""} onValueChange={v => sf("calibrationFrequency", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CALIBRATION_FREQ_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Last Calibration Date</Label>
                <Input type="date" max={today} value={form.lastCalibrationDate ?? ""} onChange={e => sf("lastCalibrationDate", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Seed from paper records when first registering. Subsequent calibrations are logged below in the Calibration Log.</p>
              </div>
              <div><Label>Next Calibration Due</Label><Input type="date" value={form.nextCalibrationDue ?? ""} onChange={e => sf("nextCalibrationDue", e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "active"} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EQUIPMENT_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.replace(/-/g, " ").slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.equipmentRef || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Equipment — {fmt(view.equipment_ref)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Reference" value={<span className="font-mono">{fmt(view.equipment_ref)}</span>} />
              <ViewField label="Type" value={fmt(view.equipment_type)} />
              <ViewField label="Manufacturer" value={fmt(view.manufacturer)} />
              <ViewField label="Model" value={fmt(view.model)} />
              <ViewField label="Serial Number" value={<span className="font-mono">{fmt(view.serial_number)}</span>} />
              <ViewField label="Purchase Date" value={fmtDate(view.purchase_date)} />
              <ViewField label="Calibration Frequency" value={fmt(view.calibration_frequency)} />
              <ViewField label="Last Calibration" value={fmtDate(view.last_calibration_date)} />
              <ViewField label="Next Cal Due" value={fmtDate(view.next_calibration_due)} />
              <ViewField label="Calibration Status" value={calStatus(view)} />
              <ViewField label="Equipment Status" value={view.status === "active" ? <span className="text-green-700">Active</span> : fmt(view.status)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            <CalibrationRows farmId={farmId} equipmentId={view.id as number} />
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Equipment</DialogTitle><DialogDescription>Remove {fmt(deleting?.equipment_ref)} and all its calibration records?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottlingMachinesSection farmId={farmId} />
    </div>
  );
}

