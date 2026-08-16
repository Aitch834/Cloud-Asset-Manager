import { fetchWineryJson, today, CALIBRATION_RESULT_OPTIONS, fmtDate, fmt, useCrud, exportCSV, csvComment, QueryErrorNotice, EmptyState, NotesCell, EQUIPMENT_TYPES, CALIBRATION_FREQ_OPTIONS, EQUIPMENT_STATUS_OPTIONS, ViewField } from "./shared";
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

export function CalibrationRows({ farmId, equipmentId }: { farmId: number; equipmentId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-equipment-cals", farmId, equipmentId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations`)).records ?? []) as Record<string, unknown>[],
    enabled: !!equipmentId,
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

export function EquipmentRegisterTab({ farmId }: { farmId: number }) {
  const farmNameEquip = useFarmName(farmId);
  const crud = useCrud(farmId, "winery-equipment", "winery-equipment");
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
    </div>
  );
}

