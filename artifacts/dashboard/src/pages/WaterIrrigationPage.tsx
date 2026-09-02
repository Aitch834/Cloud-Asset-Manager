import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, ScrollText, BarChart3, Drill, Droplets, Tractor, CloudRain, AlertTriangle, FileCheck, Eye, ClipboardList, Play, Upload, FileText, X, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { apiUrl as api } from "@/lib/api";
import { IrrigationAdvisorTab } from "@/components/irrigation/IrrigationAdvisorTab";
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }
type DeleteMutation = { isError: boolean; isPending: boolean; error: unknown; isSuccess: boolean; reset: () => void };
function DataTable({ cols, rows, onEdit, onDelete, onView, deleteMutation }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void; deleteMutation?: DeleteMutation }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { if (deleteMutation?.isSuccess) setPendingDelete(null); }, [deleteMutation?.isSuccess]);
  if (!rows.length) return <Empty msg="No records yet." />;
  return (
    <>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-b last:border-0">
          {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
          {(onEdit || onDelete || onView) && <td className="py-2 text-right space-x-1 whitespace-nowrap">
            {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
            {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
            {onDelete && <Button size="icon" variant="ghost" onClick={() => { deleteMutation?.reset(); setPendingDelete(row); }}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
          </td>}
        </tr>)}</tbody>
      </table></div>
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This cannot be undone."
        mutation={deleteMutation}
        onConfirm={() => { if (pendingDelete && onDelete) { onDelete(pendingDelete); if (!deleteMutation) setPendingDelete(null); } }}
        onCancel={() => { setPendingDelete(null); deleteMutation?.reset(); }}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

function LicencesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [raiseTaskFor, setRaiseTaskFor] = useState<Record<string, unknown> | null>(null);
  const { data: licences = [], isLoading } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/water-abstraction-licences/${editing.id}`) : api(`farms/${farmId}/water-abstraction-licences`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-licences", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/water-abstraction-licences/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["water-licences", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Water Sources &amp; Abstraction Licences</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each licence defines a water source (borehole, river pump, reservoir, etc.). Set a cost per m³ here to enable automatic water cost calculation on irrigation records and season reports.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ meterRequired: true, returnRequired: true, issuingAuthority: "Environment Agency" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Source / Licence</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "licenceNumber", label: "Licence No." }, { key: "sourceType", label: "Source Type" }, { key: "waterSource", label: "Source Description" }, { key: "purposeOfUse", label: "Purpose" }, { key: "annualLicencedVolumeM3", label: "Annual m³" }, { key: "costPerM3", label: "£/m³" }, { key: "licenceExpiryDate", label: "Expiry", fmt: r => fmtDate(r.licenceExpiryDate) }]} rows={licences as Record<string, unknown>[]} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Licence</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Licence Number</p><p className="font-medium">{fmt(viewRecord.licenceNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Issuing Authority</p><p className="font-medium">{fmt(viewRecord.issuingAuthority)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Source Type</p><p className="font-medium">{fmt(viewRecord.sourceType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Water Source Description</p><p className="font-medium">{fmt(viewRecord.waterSource)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purpose of Use</p><p className="font-medium">{fmt(viewRecord.purposeOfUse)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cost per m³ (£)</p><p className="font-medium">{viewRecord.costPerM3 ? `£${parseFloat(String(viewRecord.costPerM3)).toFixed(4)}` : "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Abstraction Point</p><p className="font-medium">{fmt(viewRecord.abstractionPointDescription)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Volume (m³)</p><p className="font-medium">{fmt(viewRecord.annualLicencedVolumeM3)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Daily Volume (m³)</p><p className="font-medium">{fmt(viewRecord.dailyLicencedVolumeM3)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</p><p className="font-medium">{fmtDate(viewRecord.licenceStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry Date</p><p className="font-medium">{fmtDate(viewRecord.licenceExpiryDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Meter Serial Number</p><p className="font-medium">{fmt(viewRecord.meterSerialNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Return Deadline</p><p className="font-medium">{fmt(viewRecord.returnDeadline)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Meter Required</p><p className="font-medium">{viewRecord.meterRequired ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Return Required</p><p className="font-medium">{viewRecord.returnRequired ? "Yes" : "No"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => { setRaiseTaskFor(viewRecord); setViewRecord(null); }}><ClipboardList className="w-3.5 h-3.5 mr-1" />Raise Task</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "48rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Water Source &amp; Abstraction Licence</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Source Type *</Label>
              <Select value={String(form.sourceType ?? "")} onValueChange={v => setForm(f => ({ ...f, sourceType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select source type" /></SelectTrigger>
                <SelectContent>{["Borehole / Well", "River / Stream", "Reservoir / Pond", "Ditch / Drain", "Mains / Public Supply", "Recycled / Rainwater Harvesting", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Licence Number *</Label><Input value={String(form.licenceNumber ?? "")} onChange={e => setForm(f => ({ ...f, licenceNumber: e.target.value }))} placeholder="e.g. 12/54/18/0012" /></div>
            <div className="col-span-2"><Label>Source Location / Description *</Label><Input value={String(form.waterSource ?? "")} onChange={e => setForm(f => ({ ...f, waterSource: e.target.value }))} placeholder="e.g. North borehole at GR SP123456, river pump on River Evenlode" /></div>
            <div><Label>Issuing Authority *</Label><Input value={String(form.issuingAuthority ?? "Environment Agency")} onChange={e => setForm(f => ({ ...f, issuingAuthority: e.target.value }))} /></div>
            <div><Label>Purpose of Use *</Label>
              <Select value={String(form.purposeOfUse ?? "")} onValueChange={v => setForm(f => ({ ...f, purposeOfUse: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Irrigation", "Livestock Watering", "Spray Washing", "Amenity", "Fish Farming", "Human Consumption"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Abstraction Point Detail</Label><Textarea value={String(form.abstractionPointDescription ?? "")} onChange={e => setForm(f => ({ ...f, abstractionPointDescription: e.target.value }))} rows={2} placeholder="Grid reference, OS coordinates, or description of the intake" /></div>
            <div className="space-y-3">
              <div><Label>Annual Licensed Volume (m³)</Label><Input type="number" value={String(form.annualLicencedVolumeM3 ?? "")} onChange={e => setForm(f => ({ ...f, annualLicencedVolumeM3: e.target.value }))} /></div>
              <div><Label>Daily Licensed Volume (m³)</Label><Input type="number" value={String(form.dailyLicencedVolumeM3 ?? "")} onChange={e => setForm(f => ({ ...f, dailyLicencedVolumeM3: e.target.value }))} /></div>
            </div>
            <div><Label>Cost per m³ (£) — for cost reporting</Label><Input type="number" step="0.0001" value={String(form.costPerM3 ?? "")} onChange={e => setForm(f => ({ ...f, costPerM3: e.target.value }))} placeholder="e.g. 0.0150" /></div>
            <div><Label>Flow Rate (litres/sec)</Label><Input type="number" step="0.01" value={String(form.flowRateLitresPerSec ?? "")} onChange={e => setForm(f => ({ ...f, flowRateLitresPerSec: e.target.value }))} /></div>
            <div><Label>Licence Start Date</Label><Input type="date" value={String(form.licenceStartDate ?? "")} onChange={e => setForm(f => ({ ...f, licenceStartDate: e.target.value }))} /></div>
            <div><Label>Licence Expiry Date</Label><Input type="date" value={String(form.licenceExpiryDate ?? "")} onChange={e => setForm(f => ({ ...f, licenceExpiryDate: e.target.value }))} /></div>
            <div><Label>Meter Serial Number</Label><Input value={String(form.meterSerialNumber ?? "")} onChange={e => setForm(f => ({ ...f, meterSerialNumber: e.target.value }))} /></div>
            <div><Label>Return Deadline (e.g. 31 Jan)</Label><Input value={String(form.returnDeadline ?? "")} onChange={e => setForm(f => ({ ...f, returnDeadline: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Checkbox id="meter" checked={Boolean(form.meterRequired)} onCheckedChange={v => setForm(f => ({ ...f, meterRequired: Boolean(v) }))} /><Label htmlFor="meter">Meter required?</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="ret" checked={Boolean(form.returnRequired)} onCheckedChange={v => setForm(f => ({ ...f, returnRequired: Boolean(v) }))} /><Label htmlFor="ret">Return required?</Label></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Licence Review — ${raiseTaskFor.licenceNumber ?? "Water Abstraction Licence"}`}
          defaultDescription={`Authority: ${raiseTaskFor.issuingAuthority ?? "—"} · Expiry: ${raiseTaskFor.licenceExpiryDate ? new Date(String(raiseTaskFor.licenceExpiryDate)).toLocaleDateString("en-GB") : "—"} · Return deadline: ${raiseTaskFor.returnDeadline ?? "—"}`}
          module="water-irrigation"
        />
      )}
    </div>
  );
}

function MeterReadingsTab({ farmId }: { farmId: number }) {
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [licenceManuallySelected, setLicenceManuallySelected] = useState(false);
  const { data: readings = [], isLoading } = useQuery({ queryKey: ["water-readings", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-meter-readings`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/water-meter-readings`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-readings", farmId] }); setOpen(false); setForm({}); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/water-meter-readings/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["water-readings", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const allReadings = readings as Record<string, unknown>[];

  // MRU licence: most recently used across all meter readings, or single-licence shortcut
  const derivedLicenceId = useMemo(() => {
    const licArr = licences as Record<string, unknown>[];
    const recs = allReadings as Record<string, unknown>[];
    const mru = [...recs].sort((a, b) => String(b.readingDate ?? "").localeCompare(String(a.readingDate ?? ""))).find(r => r.licenceId != null);
    if (mru?.licenceId != null && licArr.some(l => String(l.id) === String(mru.licenceId))) return String(mru.licenceId);
    if (licArr.length === 1) return String(licArr[0].id);
    return null;
  }, [licences, allReadings]);

  // Auto-fill licence when the dialog opens for a new reading
  useEffect(() => {
    if (!open || licenceManuallySelected) return;
    if (derivedLicenceId) setForm(f => ({ ...f, licenceId: derivedLicenceId }));
  }, [derivedLicenceId, open, licenceManuallySelected]);

  // Hint label shown under the select when auto-filled
  const licenceHint = useMemo(() => {
    if (!derivedLicenceId || !form.licenceId || form.licenceId !== derivedLicenceId || licenceManuallySelected) return null;
    const recs = allReadings as Record<string, unknown>[];
    const hasMru = recs.some(r => r.licenceId != null && String(r.licenceId) === derivedLicenceId);
    return hasMru ? "pre-filled from last use" : "pre-filled — only licence on farm";
  }, [derivedLicenceId, form.licenceId, licenceManuallySelected, allReadings]);

  useEffect(() => {
    const licId = form.licenceId;
    const reading = parseFloat(form.meterReading);
    if (!licId || isNaN(reading) || !form.meterReading) return;
    const licence = (licences as Record<string, unknown>[]).find(l => String(l.id) === licId);
    const licReadings = allReadings
      .filter(r => String(r.licenceId) === licId)
      .sort((a, b) => String(a.readingDate ?? "").localeCompare(String(b.readingDate ?? "")));
    const prevReading = licReadings.length > 0 ? parseFloat(String(licReadings[licReadings.length - 1]?.meterReading ?? "0")) : 0;
    const volume = Math.max(0, reading - prevReading);
    const yearStr = (form.readingDate ?? new Date().toISOString()).slice(0, 4);
    const ytdBefore = licReadings
      .filter(r => String(r.readingDate ?? "").startsWith(yearStr))
      .reduce((s, r) => s + parseFloat(String(r.volumeAbstractedM3 ?? "0")), 0);
    const cumYtd = ytdBefore + volume;
    const annualVol = parseFloat(String((licence as Record<string, unknown>)?.annualLicencedVolumeM3 ?? "0"));
    setForm(f => ({
      ...f,
      volumeAbstractedM3: volume.toFixed(2),
      cumulativeYtdM3: cumYtd.toFixed(2),
      percentOfAnnualAllocation: annualVol > 0 ? ((cumYtd / annualVol) * 100).toFixed(1) : f.percentOfAnnualAllocation,
    }));
  }, [form.licenceId, form.meterReading, form.readingDate]);

  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "water-meter-readings", filter: "year", farmId, defaultValue: "all" });
  const years = useMemo(() => Array.from(new Set(allReadings.map(r => String(r.readingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allReadings]);
  const filteredReadings = yearFilter === "all" ? allReadings : allReadings.filter(r => String(r.readingDate ?? "").startsWith(yearFilter));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-sm">Abstraction Meter Readings</h3><div className="flex items-center gap-2"><Select value={yearFilter} onValueChange={setYearFilter}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={() => { setLicenceManuallySelected(false); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Log Reading</Button></div></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "readingDate", label: "Date", fmt: r => fmtDate(r.readingDate) }, { key: "licenceId", label: "Licence", fmt: r => { const l = (licences as Record<string, unknown>[]).find(x => String(x.id) === String(r.licenceId)); return l ? `${String(l.licenceNumber)}${l.sourceType ? ` (${String(l.sourceType)})` : ""}` : fmt(r.licenceId); } }, { key: "meterReading", label: "Meter Reading" }, { key: "volumeAbstractedM3", label: "Abstracted (m³)" }, { key: "cumulativeYtdM3", label: "YTD (m³)" }, { key: "percentOfAnnualAllocation", label: "% of Allocation" }, { key: "readBy", label: "Read By" }]} rows={filteredReadings} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} />}

      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Meter Reading</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reading Date</p><p className="font-medium">{fmtDate(viewRecord.readingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Licence</p><p className="font-medium">{(() => { const l = (licences as Record<string, unknown>[]).find(x => String(x.id) === String(viewRecord.licenceId)); return l ? `${String(l.licenceNumber)}${l.sourceType ? ` (${String(l.sourceType)})` : ""}` : "—"; })()}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Meter Reading</p><p className="font-medium">{fmt(viewRecord.meterReading)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume Abstracted (m³)</p><p className="font-medium">{fmt(viewRecord.volumeAbstractedM3)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">YTD Cumulative (m³)</p><p className="font-medium">{fmt(viewRecord.cumulativeYtdM3)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">% of Annual Allocation</p><p className="font-medium">{fmt(viewRecord.percentOfAnnualAllocation)}%</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Read By</p><p className="font-medium">{fmt(viewRecord.readBy)}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Meter Reading</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Reading Date *</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.readingDate ?? ""} onChange={e => setForm(f => ({ ...f, readingDate: e.target.value }))} /></div>
            <div><Label>Licence *</Label>
              <Select value={form.licenceId ?? ""} onValueChange={v => { setLicenceManuallySelected(true); setForm(f => ({ ...f, licenceId: v })); }}>
                <SelectTrigger><SelectValue placeholder="Select licence" /></SelectTrigger>
                <SelectContent>{(licences as Record<string, unknown>[]).map(l => <SelectItem key={String(l.id)} value={String(l.id)}>{String(l.licenceNumber)}{l.sourceType ? ` (${String(l.sourceType)})` : ""}</SelectItem>)}</SelectContent>
              </Select>
              {licenceHint && <p className="text-[11px] text-blue-600 mt-1">{licenceHint}</p>}
            </div>
            <div><Label>Meter Reading *</Label><Input type="number" step="0.01" value={form.meterReading ?? ""} onChange={e => setForm(f => ({ ...f, meterReading: e.target.value }))} /></div>
            <div><Label>Volume Abstracted (m³) <span className="text-xs text-muted-foreground">(auto)</span></Label><Input type="number" step="0.01" value={form.volumeAbstractedM3 ?? ""} onChange={e => setForm(f => ({ ...f, volumeAbstractedM3: e.target.value }))} placeholder="Auto-calculated from reading" /></div>
            <div><Label>YTD Cumulative (m³) <span className="text-xs text-muted-foreground">(auto)</span></Label><Input type="number" step="0.01" value={form.cumulativeYtdM3 ?? ""} onChange={e => setForm(f => ({ ...f, cumulativeYtdM3: e.target.value }))} placeholder="Auto-calculated" /></div>
            <div><Label>% of Annual Allocation <span className="text-xs text-muted-foreground">(auto)</span></Label><Input type="number" step="0.1" value={form.percentOfAnnualAllocation ?? ""} onChange={e => setForm(f => ({ ...f, percentOfAnnualAllocation: e.target.value }))} placeholder="Auto-calculated" /></div>
            <div><Label>Read By</Label><Input value={form.readBy ?? ""} onChange={e => setForm(f => ({ ...f, readBy: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BoreholeTestsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<"log" | "result" | "edit">("log");
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: tests = [], isLoading } = useQuery({ queryKey: ["borehole-tests", farmId], queryFn: () => fetch(api(`farms/${farmId}/borehole-tests`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/borehole-tests/${editing.id}`) : api(`farms/${farmId}/borehole-tests`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["borehole-tests", farmId] }); setOpen(false); setEditing(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/borehole-tests/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["borehole-tests", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  function openAdd() { setEditing(null); setMode("log"); setForm({}); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setMode("edit"); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }
  function openEnterResult(r: Record<string, unknown>) { setEditing(r); setMode("result"); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  const allBoreRows = tests as Record<string, unknown>[];
  const [yearFilterBore, setYearFilterBore] = usePersistedFilter({ page: "water-borehole-tests", filter: "year", farmId, defaultValue: "all" });
  const yearsBore = useMemo(() => Array.from(new Set(allBoreRows.map(r => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allBoreRows]);
  const rows = yearFilterBore === "all" ? allBoreRows : allBoreRows.filter(r => String(r.testDate ?? "").startsWith(yearFilterBore));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Borehole &amp; Well Tests</h3>
        <div className="flex items-center gap-2"><Select value={yearFilterBore} onValueChange={setYearFilterBore}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsBore.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Sample</Button></div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No borehole test records yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Test Date", "Testing Company", "Bacteriological", "Chemical", "Overall Result", "Next Test Due", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{fmtDate(r.testDate)}</td>
                  <td className="px-4 py-3 text-xs">{fmt(r.testingCompany)}</td>
                  <td className="px-4 py-3 text-xs">{r.bacteriologicalResult ? String(r.bacteriologicalResult) : <span className="text-amber-600 font-medium">Awaiting results</span>}</td>
                  <td className="px-4 py-3 text-xs">{r.chemicalResult ? String(r.chemicalResult) : "—"}</td>
                  <td className="px-4 py-3">
                    {!r.overallResult ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Awaiting results</span>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${String(r.overallResult).startsWith("Pass") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{String(r.overallResult)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{fmtDate(r.nextTestDueDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {!r.overallResult && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => openEnterResult(r)}>Enter results</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
            <DialogHeader><DialogTitle>View Borehole Test</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Date</p><p className="font-medium">{fmtDate(viewRecord.testDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Testing Company</p><p className="font-medium">{fmt(viewRecord.testingCompany)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Static Water Level (m)</p><p className="font-medium">{fmt(viewRecord.staticWaterLevelM)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pumping Water Level (m)</p><p className="font-medium">{fmt(viewRecord.pumpingWaterLevelM)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bacteriological Result</p><p className="font-medium">{fmt(viewRecord.bacteriologicalResult)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Chemical Result</p><p className="font-medium">{fmt(viewRecord.chemicalResult)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Result</p><p className="font-medium">{fmt(viewRecord.overallResult)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">{fmtDate(viewRecord.nextTestDueDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Corrective Action</p><p className="font-medium">{fmt(viewRecord.correctiveAction)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); save.reset(); } }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>{mode === "log" ? "Log Borehole Test Sample" : mode === "result" ? "Enter Borehole Test Results" : "Edit Borehole Test Record"}</DialogTitle>
          </DialogHeader>
          {mode === "log" && <p className="text-xs text-muted-foreground -mt-1">Record the sampling visit now. Return to enter laboratory results once the report arrives.</p>}
          {mode === "result" && editing && <p className="text-xs text-muted-foreground -mt-1">Sample from <strong>{fmtDate(editing.testDate)}</strong>{editing.testingCompany ? ` · ${editing.testingCompany}` : ""}. Enter results from your lab report.</p>}
          <div className="grid grid-cols-2 gap-3">
            {mode !== "result" && <>
              <div><Label>Test Date *</Label><Input type="date" value={form.testDate ?? ""} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} /></div>
              <div><Label>Testing Company</Label><Input value={form.testingCompany ?? ""} onChange={e => setForm(f => ({ ...f, testingCompany: e.target.value }))} /></div>
              <div><Label>Static Water Level (m)</Label><Input type="number" step="0.01" value={form.staticWaterLevelM ?? ""} onChange={e => setForm(f => ({ ...f, staticWaterLevelM: e.target.value }))} /></div>
              <div><Label>Pumping Water Level (m)</Label><Input type="number" step="0.01" value={form.pumpingWaterLevelM ?? ""} onChange={e => setForm(f => ({ ...f, pumpingWaterLevelM: e.target.value }))} /></div>
            </>}
            {mode !== "log" && <>
              <div><Label>Bacteriological Result</Label>
                <Select value={form.bacteriologicalResult ?? ""} onValueChange={v => setForm(f => ({ ...f, bacteriologicalResult: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["Pass", "Pass with treatment", "Fail", "Retest required"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Chemical Result</Label>
                <Select value={form.chemicalResult ?? ""} onValueChange={v => setForm(f => ({ ...f, chemicalResult: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["Pass", "Pass with treatment", "Fail", "Retest required"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Overall Result *</Label>
                <Select value={form.overallResult ?? ""} onValueChange={v => setForm(f => ({ ...f, overallResult: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["Pass", "Pass with treatment", "Fail", "Retest required"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Next Test Due</Label><Input type="date" value={form.nextTestDueDate ?? ""} onChange={e => setForm(f => ({ ...f, nextTestDueDate: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Corrective Action</Label><Textarea value={form.correctiveAction ?? ""} onChange={e => setForm(f => ({ ...f, correctiveAction: e.target.value }))} rows={2} /></div>
            </>}
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>{mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Irrigation method persistence (shared key with Advisor tab) ──────────────
const LS_IRRIG_METHOD_KEY = (farmId: number) => `irrigation-advisor-method-${farmId}`;
const DEFAULT_IRRIG_METHOD = "Overhead sprinkler";
function loadLastMethod(farmId: number): string {
  try { return localStorage.getItem(LS_IRRIG_METHOD_KEY(farmId)) ?? DEFAULT_IRRIG_METHOD; } catch { /* ignore */ }
  return DEFAULT_IRRIG_METHOD;
}
function saveLastMethod(farmId: number, method: string) {
  try { localStorage.setItem(LS_IRRIG_METHOD_KEY(farmId), method); } catch { /* ignore */ }
}

function IrrigationRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [viewTab, setViewTab] = useState<"details" | "documents">("details");
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
  const [confirmClose, setConfirmClose] = useState<Record<string, unknown> | null>(null);
  const [licenceManuallySelected, setLicenceManuallySelected] = useState(false);

  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const { data: fieldsData } = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(api(`farms/${farmId}/fields`), { credentials: "include" }).then(r => r.json()) });
  const { data: contactsData } = useQuery({ queryKey: ["contacts", farmId], queryFn: () => fetch(api(`farms/${farmId}/contacts`), { credentials: "include" }).then(r => r.json()).then(d => d.contacts ?? []) });
  const { data: equipmentData = [] } = useQuery({ queryKey: ["irrig-equip", farmId], queryFn: () => fetch(api(`farms/${farmId}/irrigation-equipment`), { credentials: "include" }).then(r => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["irrig-records", farmId], queryFn: () => fetch(api(`farms/${farmId}/irrigation-records`), { credentials: "include" }).then(r => r.json()) });

  // MRU licence lookup — enabled only when adding a new record with a field selected
  const mruFieldIdNum = !editing && open && form.fieldId && form.fieldId !== "__none__" ? parseInt(String(form.fieldId)) : null;
  const { data: fieldIrrigRecords = [] } = useQuery({
    queryKey: ["irrig-records-field", farmId, mruFieldIdNum],
    queryFn: () => fetch(api(`farms/${farmId}/irrigation-records?fieldId=${mruFieldIdNum}`), { credentials: "include" }).then(r => r.json()),
    enabled: !!mruFieldIdNum,
  });

  // Priority: (1) MRU licence for this field, (2) single licence on the farm, (3) none
  const derivedLicenceId = useMemo(() => {
    if (editing) return null;
    const licArr = licences as Record<string, unknown>[];
    if (mruFieldIdNum) {
      const fieldRecs = fieldIrrigRecords as Record<string, unknown>[];
      const mru = fieldRecs.find(r => r.licenceId != null);
      if (mru?.licenceId != null && licArr.some(l => String(l.id) === String(mru.licenceId))) return String(mru.licenceId);
    }
    if (licArr.length === 1) return String(licArr[0].id);
    return null;
  }, [editing, mruFieldIdNum, fieldIrrigRecords, licences]);

  // Auto-fill the licence when opening a new record or when the field changes,
  // but never overwrite a licence the grower has already selected manually.
  useEffect(() => {
    if (!open || editing || licenceManuallySelected) return;
    if (derivedLicenceId) setForm(f => ({ ...f, licenceId: derivedLicenceId }));
  }, [derivedLicenceId, open, editing, licenceManuallySelected]);

  const fields: Record<string, unknown>[] = Array.isArray(fieldsData?.records) ? fieldsData.records : [];
  const contacts: Record<string, unknown>[] = Array.isArray(contactsData) ? contactsData : [];
  const equipment: Record<string, unknown>[] = Array.isArray(equipmentData) ? equipmentData : [];

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/irrigation-records/${editing.id}`) : api(`farms/${farmId}/irrigation-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }).then(async r => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: (_data, variables) => {
      if (variables.irrigationMethod && variables.irrigationMethod !== "__none__") saveLastMethod(farmId, String(variables.irrigationMethod));
      qc.invalidateQueries({ queryKey: ["irrig-records", farmId] }); setOpen(false); setEditing(null); setForm({}); setEquipmentIds([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/irrigation-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["irrig-records", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const closeEvent = useMutation({
    mutationFn: (id: number) =>
      fetch(api(`farms/${farmId}/irrigation-records/${id}`), {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "closed", endDate: new Date().toISOString().slice(0, 10) }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["irrig-records", farmId] }); setConfirmClose(null); },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  function handleFieldSelect(fieldId: string) {
    // Reset manual-selection flag so MRU can re-derive for the new field
    setLicenceManuallySelected(false);
    if (!fieldId || fieldId === "__none__") { setForm(f => ({ ...f, fieldId: "", areaIrrigatedHa: "", cropType: "", licenceId: "__none__" })); return; }
    const field = fields.find(f => String(f.id) === fieldId);
    if (field) {
      setForm(f => ({ ...f, fieldId, areaIrrigatedHa: field.areaHectares ? String(field.areaHectares) : String(f.areaIrrigatedHa ?? ""), cropType: field.currentUse ? String(field.currentUse) : String(f.cropType ?? ""), licenceId: "__none__" }));
    } else {
      setForm(f => ({ ...f, fieldId, licenceId: "__none__" }));
    }
  }

  function openAdd() {
    setEditing(null);
    setLicenceManuallySelected(false);
    setForm({ irrigationDate: new Date().toISOString().slice(0, 10), status: "open", irrigationMethod: loadLastMethod(farmId) });
    setEquipmentIds([]);
    setOpen(true);
  }

  function openEdit(r: Record<string, unknown>) {
    setEditing(r);
    setForm({ ...r });
    try { const ids = r.equipmentIdsJson ? JSON.parse(String(r.equipmentIdsJson)) : []; setEquipmentIds(Array.isArray(ids) ? ids.map(Number) : []); } catch { setEquipmentIds([]); }
    setOpen(true);
  }

  function handleSave() {
    const payload: Record<string, unknown> = { ...form };
    if (equipmentIds.length > 0) payload.equipmentIdsJson = JSON.stringify(equipmentIds);
    else delete payload.equipmentIdsJson;
    const meterVol = form.meterStartReading && form.meterEndReading
      ? Math.max(0, parseFloat(String(form.meterEndReading)) - parseFloat(String(form.meterStartReading))) : null;
    if (meterVol !== null) payload.volumeAppliedM3 = meterVol.toFixed(2);
    const vol = meterVol ?? (form.volumeAppliedM3 ? parseFloat(String(form.volumeAppliedM3)) : null);
    const area = form.areaIrrigatedHa ? parseFloat(String(form.areaIrrigatedHa)) : null;
    if (vol && area && area > 0) payload.applicationDepthMm = ((vol / (area * 10000)) * 1000).toFixed(1);
    if (form.fieldId && form.fieldId !== "__none__") payload.fieldId = parseInt(String(form.fieldId)); else delete payload.fieldId;
    if (form.licenceId && form.licenceId !== "__none__") payload.licenceId = parseInt(String(form.licenceId)); else delete payload.licenceId;
    if (form.startOperatorId && form.startOperatorId !== "__none__") payload.startOperatorId = parseInt(String(form.startOperatorId)); else delete payload.startOperatorId;
    if (form.endOperatorId && form.endOperatorId !== "__none__") payload.endOperatorId = parseInt(String(form.endOperatorId)); else delete payload.endOperatorId;
    save.mutate(payload);
  }

  function fieldLabel(r: Record<string, unknown>) {
    if (r.fieldName) return String(r.fieldName);
    if (r.fieldId) { const f = fields.find(x => String(x.id) === String(r.fieldId)); if (f) return String(f.name); }
    return r.fieldOrBlockDescription ? String(r.fieldOrBlockDescription) : "—";
  }
  function fieldEditHref(r: Record<string, unknown>) {
    const fieldId = Number(r.fieldId);
    return Number.isInteger(fieldId) && fieldId > 0 ? `/fields?editFieldId=${fieldId}` : null;
  }
  function licenceLabel(r: Record<string, unknown>) {
    const l = (licences as Record<string, unknown>[]).find(x => String(x.id) === String(r.licenceId));
    if (!l) return "—";
    return `${String(l.licenceNumber)}${l.sourceType ? ` (${String(l.sourceType)})` : ""}`;
  }
  function contactName(id: unknown) {
    if (!id) return "—";
    const c = contacts.find(x => String(x.id) === String(id));
    return c ? String(c.name) : "—";
  }
  function equipmentNames(r: Record<string, unknown>) {
    try {
      const ids: number[] = r.equipmentIdsJson ? JSON.parse(String(r.equipmentIdsJson)) : [];
      if (ids.length) return ids.map(id => { const e = equipment.find(x => String(x.id) === String(id)); return e ? String(e.equipmentName) : `#${id}`; }).join(", ");
    } catch { /* ignore */ }
    if (r.irrigationEquipmentId) { const e = equipment.find(x => String(x.id) === String(r.irrigationEquipmentId)); return e ? String(e.equipmentName) : "—"; }
    return "—";
  }

  const selectedLicence = form.licenceId && form.licenceId !== "__none__"
    ? (licences as Record<string, unknown>[]).find(l => String(l.id) === String(form.licenceId)) : null;
  const licenceHint = useMemo(() => {
    if (editing || !derivedLicenceId || !form.licenceId || form.licenceId !== derivedLicenceId) return null;
    const fieldRecs = fieldIrrigRecords as Record<string, unknown>[];
    const mru = fieldRecs.find(r => r.licenceId != null && String(r.licenceId) === form.licenceId);
    return mru ? "pre-filled from last use on this field" : "pre-filled — only licence on farm";
  }, [editing, derivedLicenceId, form.licenceId, fieldIrrigRecords]);
  const meterVolume = form.meterStartReading && form.meterEndReading
    ? Math.max(0, parseFloat(String(form.meterEndReading)) - parseFloat(String(form.meterStartReading))) : null;
  const effectiveVolume = meterVolume ?? (form.volumeAppliedM3 ? parseFloat(String(form.volumeAppliedM3)) : null);
  const effectiveArea = form.areaIrrigatedHa ? parseFloat(String(form.areaIrrigatedHa)) : null;
  const autoDepth = effectiveVolume && effectiveArea && effectiveArea > 0
    ? ((effectiveVolume / (effectiveArea * 10000)) * 1000).toFixed(1) : null;
  const costPerM3 = form.costPerM3Override
    ? parseFloat(String(form.costPerM3Override))
    : (selectedLicence?.costPerM3 ? parseFloat(String(selectedLicence.costPerM3)) : null);
  const estimatedCost = effectiveVolume && costPerM3 ? (effectiveVolume * costPerM3).toFixed(2) : null;

  const allIrrigRecords = records as Record<string, unknown>[];
  const [yearFilterIrrig, setYearFilterIrrig] = usePersistedFilter({ page: "water-irrigation-records", filter: "year", farmId, defaultValue: "all" });
  const yearsIrrig = useMemo(() => Array.from(new Set(allIrrigRecords.map(r => String(r.irrigationDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allIrrigRecords]);
  const filteredIrrigRecords = yearFilterIrrig === "all" ? allIrrigRecords : allIrrigRecords.filter(r => String(r.irrigationDate ?? "").startsWith(yearFilterIrrig));
  const openCount = filteredIrrigRecords.filter(r => r.status === "open").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Irrigation Application Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Log each irrigation event — track start/end operators, equipment and volume applied.</p>
        </div>
        <div className="flex items-center gap-2"><Select value={yearFilterIrrig} onValueChange={setYearFilterIrrig}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsIrrig.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={openAdd}><Play className="w-4 h-4 mr-1" />Log Application</Button></div>
      </div>

      {openCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {openCount} open event{openCount !== 1 ? "s" : ""} — mark complete when irrigation finishes.
        </div>
      )}

      {/* Summary strip */}
      {!isLoading && filteredIrrigRecords.length > 0 && (() => {
        const recs = filteredIrrigRecords;
        const totalVol = recs.reduce((s, r) => s + (r.volumeAppliedM3 ? parseFloat(String(r.volumeAppliedM3)) : 0), 0);
        const totalArea = recs.reduce((s, r) => s + (r.areaIrrigatedHa ? parseFloat(String(r.areaIrrigatedHa)) : 0), 0);
        const openN = recs.filter(r => r.status === "open").length;
        return (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }}>Applications</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }}>{recs.length}</p>
            </div>
            {totalVol > 0 && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 150 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Volume</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }}>{totalVol.toFixed(1)} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>m³</span></p>
              </div>
            )}
            {totalArea > 0 && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Area Covered</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }}>{totalArea.toFixed(1)} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>ha</span></p>
              </div>
            )}
            {openN > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 100 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }}>Open</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }}>{openN}</p>
              </div>
            )}
          </div>
        );
      })()}

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <div className="overflow-x-auto">
          {!filteredIrrigRecords.length ? (
            <Empty msg="No irrigation records yet." />
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Field</th>
                <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Water Source</th>
                <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Vol (m³)</th>
                <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Status</th>
                <th />
              </tr></thead>
              <tbody>
                {filteredIrrigRecords.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-3">{fmtDate(r.irrigationDate)}</td>
                    <td className="py-2 pr-3">
                      {fieldEditHref(r) ? (
                        <a
                          href={fieldEditHref(r) ?? undefined}
                          className="text-green-700 underline underline-offset-2 hover:text-green-900"
                          aria-label={`Edit field ${fieldLabel(r)}`}
                        >
                          {fieldLabel(r)}
                        </a>
                      ) : fieldLabel(r)}
                    </td>
                    <td className="py-2 pr-3">{licenceLabel(r)}</td>
                    <td className="py-2 pr-3">{fmt(r.volumeAppliedM3)}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "open" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {r.status === "open" ? "Open" : "Complete"}
                      </span>
                    </td>
                    <td className="py-2 text-right space-x-1 whitespace-nowrap">
                      <Button size="icon" variant="ghost" onClick={() => { setViewRecord(r); setViewTab("details"); }}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      {r.status === "open" && (
                        <Button size="icon" variant="ghost" title="Mark complete" onClick={() => { closeEvent.reset(); setConfirmClose(r); }}><FileCheck className="w-3.5 h-3.5 text-green-600" /></Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── View Dialog ──────────────────────────────────────────────────────── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "52rem" }}>
            <DialogHeader><DialogTitle>Irrigation Record — {fmtDate(viewRecord.irrigationDate)}</DialogTitle></DialogHeader>
            <div className="flex gap-1 mb-3 border-b pb-2">
              {(["details", "documents"] as const).map(t => (
                <button key={t} onClick={() => setViewTab(t)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium capitalize ${viewTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {t}
                </button>
              ))}
            </div>
            {viewTab === "details" && (
              <div className="grid grid-cols-2 gap-3 text-sm overflow-y-auto max-h-[60vh] pr-1">
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${viewRecord.status === "open" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    {viewRecord.status === "open" ? "Open" : "Complete"}
                  </span>
                </div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmtDate(viewRecord.irrigationDate)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Start Time</p><p className="font-medium">{fmt(viewRecord.startTime)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">End Date</p><p className="font-medium">{viewRecord.endDate ? fmtDate(viewRecord.endDate) : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">End Time</p><p className="font-medium">{fmt(viewRecord.endTime)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Field</p><p className="font-medium">{fieldLabel(viewRecord)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Water Source</p><p className="font-medium">{licenceLabel(viewRecord)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop Type</p><p className="font-medium">{fmt(viewRecord.cropType)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Method</p><p className="font-medium">{fmt(viewRecord.irrigationMethod)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Equipment</p><p className="font-medium">{equipmentNames(viewRecord)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Area (ha)</p><p className="font-medium">{fmt(viewRecord.areaIrrigatedHa)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume (m³)</p><p className="font-medium">{fmt(viewRecord.volumeAppliedM3)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Depth (mm)</p><p className="font-medium">{fmt(viewRecord.applicationDepthMm)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Meter Start</p><p className="font-medium">{fmt(viewRecord.meterStartReading)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Meter End</p><p className="font-medium">{fmt(viewRecord.meterEndReading)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Start Operator</p><p className="font-medium">{contactName(viewRecord.startOperatorId) !== "—" ? contactName(viewRecord.startOperatorId) : fmt(viewRecord.operatorName)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">End Operator</p><p className="font-medium">{contactName(viewRecord.endOperatorId)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Rainfall (7d mm)</p><p className="font-medium">{viewRecord.rainfallLast7DaysMm ? `${viewRecord.rainfallLast7DaysMm} mm` : "—"}</p></div>
                {!!viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes)}</p></div>}
              </div>
            )}
            {viewTab === "documents" && (
              <RecordAttachments farmId={farmId} recordType="irrigation_record" recordId={viewRecord.id as number} />
            )}
            <DialogFooter className="mt-4">
              {viewRecord.status === "open" && (
                <Button variant="outline" className="mr-auto text-green-700 border-green-300" onClick={() => { setViewRecord(null); closeEvent.reset(); setConfirmClose(viewRecord); }}>
                  <FileCheck className="w-4 h-4 mr-1" />Mark Complete
                </Button>
              )}
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Confirm Close ────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!confirmClose}
        title="Mark irrigation complete?"
        message={`This will set the record for ${fmtDate(confirmClose?.irrigationDate)} to "Complete" and record today as the end date.`}
        confirmLabel="Mark Complete"
        mutation={closeEvent}
        onConfirm={() => closeEvent.mutate(confirmClose!.id as number)}
        onCancel={() => { setConfirmClose(null); closeEvent.reset(); }}
      />

      {/* ── Add / Edit Dialog ────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={v => { if (!v) { setOpen(false); setEditing(null); setForm({}); setEquipmentIds([]); save.reset(); } }}>
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Irrigation Record" : "Log Irrigation Application"}</DialogTitle></DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] space-y-4 pr-1">

            {/* ── EVENT TIMING ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Event Timing</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={String(form.status ?? "open")} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open (in progress)</SelectItem>
                      <SelectItem value="closed">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Start Date *</Label><Input type="date" value={String(form.irrigationDate ?? "")} onChange={e => setForm(f => ({ ...f, irrigationDate: e.target.value }))} /></div>
                <div><Label>Start Time</Label><Input type="time" value={String(form.startTime ?? "")} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
                <div>
                  <Label>Start Operator</Label>
                  <Select value={String(form.startOperatorId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, startOperatorId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select contact…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— not specified —</SelectItem>
                      {contacts.map(c => <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name)}{c.role ? ` (${String(c.role)})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>End Date</Label><Input type="date" value={String(form.endDate ?? "")} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
                <div><Label>End Time</Label><Input type="time" value={String(form.endTime ?? "")} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
                <div>
                  <Label>End Operator</Label>
                  <Select value={String(form.endOperatorId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, endOperatorId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select contact…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— not specified —</SelectItem>
                      {contacts.map(c => <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name)}{c.role ? ` (${String(c.role)})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ── FIELD + SOURCE ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Field &amp; Water Source</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Field / Block</Label>
                  <Select value={String(form.fieldId ?? "__none__")} onValueChange={handleFieldSelect}>
                    <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— manual entry —</SelectItem>
                      {fields.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.name)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(!form.fieldId || form.fieldId === "__none__") && (
                  <div><Label>Field / Block Description</Label><Input value={String(form.fieldOrBlockDescription ?? "")} onChange={e => setForm(f => ({ ...f, fieldOrBlockDescription: e.target.value }))} placeholder="e.g. North paddock" /></div>
                )}
                <div>
                  <Label>Water Source / Licence</Label>
                  <Select value={String(form.licenceId ?? "__none__")} onValueChange={v => { setLicenceManuallySelected(true); setForm(f => ({ ...f, licenceId: v })); }}>
                    <SelectTrigger><SelectValue placeholder="Select licence…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— not linked —</SelectItem>
                      {(licences as Record<string, unknown>[]).map(l => <SelectItem key={String(l.id)} value={String(l.id)}>{String(l.licenceNumber)}{l.sourceType ? ` (${String(l.sourceType)})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {licenceHint && <p className="text-[11px] text-blue-600 mt-1">{licenceHint}</p>}
                </div>
                <div><Label>Crop Type</Label><Input value={String(form.cropType ?? "")} onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))} placeholder="Auto-filled from field" /></div>
                <div>
                  <Label>Area Irrigated (ha)</Label>
                  <Input type="number" step="0.01" value={String(form.areaIrrigatedHa ?? "")} onChange={e => setForm(f => ({ ...f, areaIrrigatedHa: e.target.value }))} />
                  {(() => {
                    const fr = fields.find(f => String(f.id) === String(form.fieldId));
                    const area = form.areaIrrigatedHa ? parseFloat(String(form.areaIrrigatedHa)) : null;
                    if ((fr as any)?.areaHectares && area && area > Number((fr as any).areaHectares)) {
                      return <p className="text-[11px] text-red-600 mt-1">Exceeds {(fr as any).name}&apos;s total area ({Number((fr as any).areaHectares).toFixed(2)} ha) — please correct before saving.</p>;
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* ── METHOD + EQUIPMENT ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Method &amp; Equipment</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Irrigation Method</Label>
                  <Select value={String(form.irrigationMethod ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, irrigationMethod: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— select —</SelectItem>
                      {["Overhead sprinkler", "Drip / trickle", "Furrow / flood", "Pivot", "Boom", "Traveller", "Hand-held", "Other"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(equipment as Record<string, unknown>[]).length > 0 && (
                  <div className="col-span-2">
                    <Label className="mb-2 block">Equipment Used</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(equipment as Record<string, unknown>[]).map(e => (
                        <label key={String(e.id)} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={equipmentIds.includes(Number(e.id))}
                            onCheckedChange={checked => {
                              const id = Number(e.id);
                              setEquipmentIds(ids => checked ? [...ids, id] : ids.filter(x => x !== id));
                            }}
                          />
                          {String(e.equipmentName)}{e.equipmentType ? ` — ${String(e.equipmentType)}` : ""}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── VOLUME + METER ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Volume Applied</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Meter Start Reading (m³)</Label><Input type="number" step="0.01" value={String(form.meterStartReading ?? "")} onChange={e => setForm(f => ({ ...f, meterStartReading: e.target.value }))} placeholder="Leave blank if no meter" /></div>
                <div><Label>Meter End Reading (m³)</Label><Input type="number" step="0.01" value={String(form.meterEndReading ?? "")} onChange={e => setForm(f => ({ ...f, meterEndReading: e.target.value }))} /></div>
                {meterVolume !== null && (
                  <div className="col-span-2 flex items-center gap-2 rounded bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
                    <Droplets className="w-4 h-4 shrink-0" />
                    Meter volume: <strong>{meterVolume.toFixed(2)} m³</strong> — will be saved as volume applied.
                  </div>
                )}
                <div><Label>Volume Applied (m³){meterVolume !== null ? " — set by meter" : ""}</Label><Input type="number" step="0.01" value={String(form.volumeAppliedM3 ?? "")} onChange={e => setForm(f => ({ ...f, volumeAppliedM3: e.target.value }))} disabled={meterVolume !== null} placeholder={meterVolume !== null ? `${meterVolume.toFixed(2)} (from meter)` : ""} /></div>
                <div><Label>Application Depth (mm){autoDepth ? " — auto" : ""}</Label><Input type="number" step="0.1" value={autoDepth ?? String(form.applicationDepthMm ?? "")} readOnly={!!autoDepth} onChange={e => !autoDepth && setForm(f => ({ ...f, applicationDepthMm: e.target.value }))} /></div>
              </div>
            </div>

            {/* ── COST ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cost</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cost per m³ Override (£)</Label><Input type="number" step="0.0001" value={String(form.costPerM3Override ?? "")} onChange={e => setForm(f => ({ ...f, costPerM3Override: e.target.value }))} placeholder={selectedLicence?.costPerM3 ? `${parseFloat(String(selectedLicence.costPerM3)).toFixed(4)} from source` : "Leave blank to use source rate"} /></div>
                {estimatedCost && (
                  <div className="flex flex-col justify-center rounded-lg bg-blue-50 border border-blue-200 px-4 py-2">
                    <p className="text-xs text-blue-600">Estimated water cost</p>
                    <p className="text-xl font-bold text-blue-700">£{estimatedCost}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── OTHER ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Other</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Rainfall Last 7 Days (mm)</Label><Input type="number" step="0.1" value={String(form.rainfallLast7DaysMm ?? "")} onChange={e => setForm(f => ({ ...f, rainfallLast7DaysMm: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
            </div>

          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({}); setEquipmentIds([]); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Log Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IrrigationEquipmentTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: equipment = [], isLoading } = useQuery({ queryKey: ["irrig-equip", farmId], queryFn: () => fetch(api(`farms/${farmId}/irrigation-equipment`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/irrigation-equipment/${editing.id}`) : api(`farms/${farmId}/irrigation-equipment`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["irrig-equip", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/irrigation-equipment/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["irrig-equip", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Irrigation Equipment Register</h3><Button size="sm" onClick={() => { setEditing(null); setForm({ status: "active" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Equipment</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "equipmentName", label: "Name" }, { key: "equipmentType", label: "Type" }, { key: "manufacturer", label: "Manufacturer" }, { key: "applicationRateLph", label: "Rate (L/hr)" }, { key: "lastCalibrationDate", label: "Last Calibration", fmt: r => fmtDate(r.lastCalibrationDate) }, { key: "nextCalibrationDue", label: "Next Due", fmt: r => fmtDate(r.nextCalibrationDue) }, { key: "status", label: "Status" }]} rows={equipment as Record<string, unknown>[]} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Equipment</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Equipment Name</p><p className="font-medium">{fmt(viewRecord.equipmentName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Equipment Type</p><p className="font-medium">{fmt(viewRecord.equipmentType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Manufacturer</p><p className="font-medium">{fmt(viewRecord.manufacturer)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Model Number</p><p className="font-medium">{fmt(viewRecord.modelNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Application Rate (L/hr)</p><p className="font-medium">{fmt(viewRecord.applicationRateLph)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Last Calibration Date</p><p className="font-medium">{fmtDate(viewRecord.lastCalibrationDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Calibration Due</p><p className="font-medium">{fmtDate(viewRecord.nextCalibrationDue)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calibrated By</p><p className="font-medium">{fmt(viewRecord.calibratedBy)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmt(viewRecord.status)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Irrigation Equipment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Equipment Name *</Label><Input value={form.equipmentName ?? ""} onChange={e => setForm(f => ({ ...f, equipmentName: e.target.value }))} /></div>
            <div><Label>Equipment Type *</Label>
              <Select value={form.equipmentType ?? ""} onValueChange={v => setForm(f => ({ ...f, equipmentType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Drip System", "Sprinkler", "Boom", "Linear Move", "Rain Gun", "Pump", "Filter", "Pressure Regulator"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Manufacturer</Label><Input value={form.manufacturer ?? ""} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} /></div>
            <div><Label>Serial Number</Label><Input value={form.serialNumber ?? ""} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} /></div>
            <div><Label>Application Rate (L/hr)</Label><Input type="number" step="0.1" value={form.applicationRateLph ?? ""} onChange={e => setForm(f => ({ ...f, applicationRateLph: e.target.value }))} /></div>
            <div><Label>Uniformity Coefficient</Label><Input type="number" step="0.1" value={form.uniformityCoefficient ?? ""} onChange={e => setForm(f => ({ ...f, uniformityCoefficient: e.target.value }))} /></div>
            <div><Label>Last Calibration Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.lastCalibrationDate ?? ""} onChange={e => setForm(f => ({ ...f, lastCalibrationDate: e.target.value }))} /></div>
            <div><Label>Next Calibration Due</Label><Input type="date" min={new Date().toISOString().slice(0, 10)} value={form.nextCalibrationDue ?? ""} onChange={e => setForm(f => ({ ...f, nextCalibrationDue: e.target.value }))} /></div>
            <div><Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "maintenance", "out-of-service", "retired"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SoilMoistureTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: soilMembersData, isLoading: soilMembersLoading } = useFarmMembers(farmId);
  const soilStaffNames = (soilMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["soil-moisture", farmId], queryFn: () => fetch(api(`farms/${farmId}/soil-moisture-readings`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/soil-moisture-readings/${editing.id}`) : api(`farms/${farmId}/soil-moisture-readings`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["soil-moisture", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/soil-moisture-readings/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["soil-moisture", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  const allSoilRecords = records as Record<string, unknown>[];
  const [yearFilterSoil, setYearFilterSoil] = usePersistedFilter({ page: "water-soil-moisture", filter: "year", farmId, defaultValue: "all" });
  const yearsSoil = useMemo(() => Array.from(new Set(allSoilRecords.map(r => String(r.readingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allSoilRecords]);
  const filteredSoilRecords = yearFilterSoil === "all" ? allSoilRecords : allSoilRecords.filter(r => String(r.readingDate ?? "").startsWith(yearFilterSoil));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Soil Moisture Monitoring</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Log soil moisture readings to optimise irrigation scheduling and evidence good water management. Compatible sensor data can be entered manually or imported from Sentek, METER Group (TEROS) or AquaSpy platforms.</p>
        </div>
        <div className="flex items-center gap-2"><Select value={yearFilterSoil} onValueChange={setYearFilterSoil}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsSoil.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={() => { setEditing(null); setForm({ readingMethod: "manual" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Reading</Button></div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "readingDate", label: "Date", fmt: r => fmtDate(r.readingDate) }, { key: "fieldOrBlockDescription", label: "Field / Block" }, { key: "sensorType", label: "Sensor Type" }, { key: "depthCm", label: "Depth (cm)" }, { key: "moisturePercent", label: "Moisture %" }, { key: "soilMoistureDeficitMm", label: "SMD (mm)" }, { key: "readingMethod", label: "Method" }, { key: "recordedBy", label: "Recorded By" }]} rows={filteredSoilRecords} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Soil Moisture Reading</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reading Date</p><p className="font-medium">{fmtDate(viewRecord.readingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Field / Block Description</p><p className="font-medium">{fmt(viewRecord.fieldOrBlockDescription)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sensor Type</p><p className="font-medium">{fmt(viewRecord.sensorType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Depth (cm)</p><p className="font-medium">{fmt(viewRecord.depthCm)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Moisture (%)</p><p className="font-medium">{fmt(viewRecord.moisturePercent)}%</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Soil Moisture Deficit (mm)</p><p className="font-medium">{fmt(viewRecord.soilMoistureDeficitMm)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reading Method</p><p className="font-medium">{fmt(viewRecord.readingMethod)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Recorded By</p><p className="font-medium">{fmt(viewRecord.recordedBy)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Soil Moisture Reading</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Reading Date *</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.readingDate ?? ""} onChange={e => setForm(f => ({ ...f, readingDate: e.target.value }))} /></div>
            <div><Label>Depth (cm)</Label><Input type="number" value={form.depthCm ?? ""} onChange={e => setForm(f => ({ ...f, depthCm: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Field / Block *</Label><Input value={form.fieldOrBlockDescription ?? ""} onChange={e => setForm(f => ({ ...f, fieldOrBlockDescription: e.target.value }))} /></div>
            <div><Label>Sensor ID</Label><Input value={form.sensorId ?? ""} onChange={e => setForm(f => ({ ...f, sensorId: e.target.value }))} /></div>
            <div><Label>Sensor Type</Label>
              <Select value={form.sensorType ?? ""} onValueChange={v => setForm(f => ({ ...f, sensorType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Sentek EnviroScan", "METER TEROS 12", "AquaSpy", "Vegetronix", "Tensiometer", "Capacitance Probe", "Neutron Probe", "Manual / Gravimetric"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Moisture (%)</Label><Input type="number" step="0.1" value={form.moisturePercent ?? ""} onChange={e => setForm(f => ({ ...f, moisturePercent: e.target.value }))} /></div>
            <div><Label>Soil Moisture Deficit (mm)</Label><Input type="number" step="0.1" value={form.soilMoistureDeficitMm ?? ""} onChange={e => setForm(f => ({ ...f, soilMoistureDeficitMm: e.target.value }))} /></div>
            <div><Label>Field Capacity (mm)</Label><Input type="number" step="0.1" value={form.fieldCapacityMm ?? ""} onChange={e => setForm(f => ({ ...f, fieldCapacityMm: e.target.value }))} /></div>
            <div><Label>Wilting Point (mm)</Label><Input type="number" step="0.1" value={form.wiltingPointMm ?? ""} onChange={e => setForm(f => ({ ...f, wiltingPointMm: e.target.value }))} /></div>
            <div><Label>Reading Method</Label>
              <Select value={form.readingMethod ?? "manual"} onValueChange={v => setForm(f => ({ ...f, readingMethod: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["manual", "sensor-auto", "sensor-manual-import"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Recorded By</Label><StaffSelect value={form.recordedBy ?? ""} onChange={v => setForm(f => ({ ...f, recordedBy: v }))} staffNames={soilStaffNames} loading={soilMembersLoading} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DroughtManagementTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["drought-plans", farmId], queryFn: () => fetch(api(`farms/${farmId}/drought-management-plans`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/drought-management-plans/${editing.id}`) : api(`farms/${farmId}/drought-management-plans`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["drought-plans", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/drought-management-plans/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["drought-plans", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  const STAGES = ["normal", "prolonged dry spell", "drought", "severe drought", "exceptional drought"];
  const RESTRICTIONS = ["none", "voluntary reduction", "stage 1 restriction", "stage 2 restriction", "temporary use ban", "drought permit needed"];
  const allDroughtRecords = records as Record<string, unknown>[];
  const [yearFilterDrought, setYearFilterDrought] = usePersistedFilter({ page: "water-drought-management", filter: "year", farmId, defaultValue: "all" });
  const yearsDrought = useMemo(() => Array.from(new Set(allDroughtRecords.map(r => String(r.planYear ?? "")).filter(Boolean))).sort().reverse(), [allDroughtRecords]);
  const filteredDroughtRecords = yearFilterDrought === "all" ? allDroughtRecords : allDroughtRecords.filter(r => String(r.planYear ?? "") === yearFilterDrought);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Drought Management Plans</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record drought stages and restriction levels aligned to EA Drought Management Plans. Log actions taken and alternative water sources to demonstrate responsible management.</p>
        </div>
        <div className="flex items-center gap-2"><Select value={yearFilterDrought} onValueChange={setYearFilterDrought}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsDrought.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={() => { setEditing(null); setForm({ droughtStage: "normal", restrictionLevel: "none", isActive: true }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Plan</Button></div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "planYear", label: "Year" }, { key: "planTitle", label: "Plan Title" }, { key: "droughtStage", label: "Drought Stage" }, { key: "restrictionLevel", label: "Restriction Level" }, { key: "isActive", label: "Active", fmt: r => r.isActive ? "Yes" : "No" }, { key: "reviewDate", label: "Review Date", fmt: r => fmtDate(r.reviewDate) }]} rows={filteredDroughtRecords} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Drought Management Plan</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Plan Year</p><p className="font-medium">{fmt(viewRecord.planYear)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p><p className="font-medium">{fmtDate(viewRecord.reviewDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Plan Title</p><p className="font-medium">{fmt(viewRecord.planTitle)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Drought Stage</p><p className="font-medium">{fmt(viewRecord.droughtStage)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Restriction Level</p><p className="font-medium">{fmt(viewRecord.restrictionLevel)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Trigger Conditions</p><p className="font-medium">{fmt(viewRecord.triggerCondition)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Taken</p><p className="font-medium">{fmt(viewRecord.actionsTaken)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Linked Licence</p><p className="font-medium">{(licences as any[]).find(l => String(l.id) === String(viewRecord.licenceId))?.licenceNumber ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EA Contact Name</p><p className="font-medium">{fmt(viewRecord.eaContactName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EA Contact Reference</p><p className="font-medium">{fmt(viewRecord.eaContactRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Alternative Water Source</p><p className="font-medium">{fmt(viewRecord.alternativeSourceDescription)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Alternative Source Available</p><p className="font-medium">{viewRecord.alternativeSourceAvailable ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Currently Active</p><p className="font-medium">{viewRecord.isActive ? "Yes" : "No"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Drought Management Plan</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Plan Year *</Label><Input type="number" value={String(form.planYear ?? "")} onChange={e => setForm(f => ({ ...f, planYear: e.target.value }))} /></div>
            <div><Label>Review Date</Label><Input type="date" value={String(form.reviewDate ?? "")} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Plan Title *</Label><Input value={String(form.planTitle ?? "")} onChange={e => setForm(f => ({ ...f, planTitle: e.target.value }))} /></div>
            <div><Label>Drought Stage</Label>
              <Select value={String(form.droughtStage ?? "normal")} onValueChange={v => setForm(f => ({ ...f, droughtStage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Restriction Level</Label>
              <Select value={String(form.restrictionLevel ?? "none")} onValueChange={v => setForm(f => ({ ...f, restrictionLevel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RESTRICTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Trigger Conditions</Label><Textarea value={String(form.triggerCondition ?? "")} onChange={e => setForm(f => ({ ...f, triggerCondition: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Actions Taken</Label><Textarea value={String(form.actionsTaken ?? "")} onChange={e => setForm(f => ({ ...f, actionsTaken: e.target.value }))} rows={2} /></div>
            <div><Label>Linked Licence</Label>
              <Select value={String(form.licenceId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, licenceId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select licence" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— None —</SelectItem>{(licences as Record<string, unknown>[]).map(l => <SelectItem key={String(l.id)} value={String(l.id)}>{String(l.licenceNumber)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>EA Contact Name</Label><Input value={String(form.eaContactName ?? "")} onChange={e => setForm(f => ({ ...f, eaContactName: e.target.value }))} /></div>
            <div><Label>EA Contact Reference</Label><Input value={String(form.eaContactRef ?? "")} onChange={e => setForm(f => ({ ...f, eaContactRef: e.target.value }))} /></div>
            <div><Label>Alternative Water Source</Label><Input value={String(form.alternativeSourceDescription ?? "")} onChange={e => setForm(f => ({ ...f, alternativeSourceDescription: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Checkbox id="altSrc" checked={Boolean(form.alternativeSourceAvailable)} onCheckedChange={v => setForm(f => ({ ...f, alternativeSourceAvailable: Boolean(v) }))} /><Label htmlFor="altSrc">Alternative source available?</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="isAct" checked={form.isActive !== "false" && form.isActive !== false} onCheckedChange={v => setForm(f => ({ ...f, isActive: Boolean(v) }))} /><Label htmlFor="isAct">Currently active?</Label></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CamsReturnsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["cams-returns", farmId], queryFn: () => fetch(api(`farms/${farmId}/cams-annual-returns`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/cams-annual-returns/${editing.id}`) : api(`farms/${farmId}/cams-annual-returns`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["cams-returns", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/cams-annual-returns/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["cams-returns", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  const allCamsRecords = records as Record<string, unknown>[];
  const [yearFilterCams, setYearFilterCams] = usePersistedFilter({ page: "water-cams-returns", filter: "year", farmId, defaultValue: "all" });
  const yearsCams = useMemo(() => Array.from(new Set(allCamsRecords.map(r => String(r.returnYear ?? "")).filter(Boolean))).sort().reverse(), [allCamsRecords]);
  const filteredCamsRecords = yearFilterCams === "all" ? allCamsRecords : allCamsRecords.filter(r => String(r.returnYear ?? "") === yearFilterCams);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">CAMS Annual Returns — EA Abstraction Compliance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record annual abstraction returns submitted to the Environment Agency under Catchment Abstraction Management Strategies (CAMS). Annual returns must be submitted by the deadline stated on your licence.</p>
        </div>
        <div className="flex items-center gap-2"><Select value={yearFilterCams} onValueChange={setYearFilterCams}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsCams.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={() => { setEditing(null); setForm({ submittedToEa: false, complianceStatus: "compliant", returnYear: String(new Date().getFullYear()) }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Return</Button></div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "returnYear", label: "Year" }, { key: "licenceId", label: "Licence", fmt: r => { const l = (licences as Record<string, unknown>[]).find(x => String(x.id) === String(r.licenceId)); return l ? String(l.licenceNumber) : fmt(r.licenceId); } }, { key: "totalAbstractedM3", label: "Total (m³)" }, { key: "submittedToEa", label: "Submitted", fmt: r => r.submittedToEa ? "Yes" : "No" }, { key: "submissionDate", label: "Submission Date", fmt: r => fmtDate(r.submissionDate) }, { key: "eaReturnReference", label: "EA Ref" }, { key: "complianceStatus", label: "Compliance" }]} rows={filteredCamsRecords} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View CAMS Annual Return</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Return Year</p><p className="font-medium">{fmt(viewRecord.returnYear)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Licence</p><p className="font-medium">{(licences as any[]).find(l => String(l.id) === String(viewRecord.licenceId))?.licenceNumber ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Period Start</p><p className="font-medium">{fmtDate(viewRecord.returnPeriodStart)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Period End</p><p className="font-medium">{fmtDate(viewRecord.returnPeriodEnd)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Abstracted (m³)</p><p className="font-medium">{fmt(viewRecord.totalAbstractedM3)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Compliance Status</p><p className="font-medium">{fmt(viewRecord.complianceStatus)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted to EA</p><p className="font-medium">{viewRecord.submittedToEa ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submission Date</p><p className="font-medium">{fmtDate(viewRecord.submissionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EA Return Reference</p><p className="font-medium">{fmt(viewRecord.eaReturnReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted By</p><p className="font-medium">{fmt(viewRecord.submittedBy)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Exceedance / Non-compliance Notes</p><p className="font-medium">{fmt(viewRecord.exceedanceNotes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>CAMS Annual Return</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Return Year *</Label><Input type="number" value={String(form.returnYear ?? "")} onChange={e => setForm(f => ({ ...f, returnYear: e.target.value }))} /></div>
            <div><Label>Licence *</Label>
              <Select value={String(form.licenceId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, licenceId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select licence" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Select —</SelectItem>{(licences as Record<string, unknown>[]).map(l => <SelectItem key={String(l.id)} value={String(l.id)}>{String(l.licenceNumber)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Period Start *</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={String(form.returnPeriodStart ?? "")} onChange={e => setForm(f => ({ ...f, returnPeriodStart: e.target.value }))} /></div>
            <div><Label>Period End *</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={String(form.returnPeriodEnd ?? "")} onChange={e => setForm(f => ({ ...f, returnPeriodEnd: e.target.value }))} /></div>
            <div><Label>Total Abstracted (m³)</Label><Input type="number" step="1" value={String(form.totalAbstractedM3 ?? "")} onChange={e => setForm(f => ({ ...f, totalAbstractedM3: e.target.value }))} /></div>
            <div><Label>Compliance Status</Label>
              <Select value={String(form.complianceStatus ?? "compliant")} onValueChange={v => setForm(f => ({ ...f, complianceStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["compliant", "minor exceedance", "significant exceedance", "enforcement notice"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 col-span-2 mt-1"><Checkbox id="subEA" checked={Boolean(form.submittedToEa)} onCheckedChange={v => setForm(f => ({ ...f, submittedToEa: Boolean(v) }))} /><Label htmlFor="subEA">Submitted to Environment Agency?</Label></div>
            <div><Label>Submission Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={String(form.submissionDate ?? "")} onChange={e => setForm(f => ({ ...f, submissionDate: e.target.value }))} /></div>
            <div><Label>EA Return Reference</Label><Input value={String(form.eaReturnReference ?? "")} onChange={e => setForm(f => ({ ...f, eaReturnReference: e.target.value }))} /></div>
            <div><Label>Submitted By</Label><Input value={String(form.submittedBy ?? "")} onChange={e => setForm(f => ({ ...f, submittedBy: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Exceedance / Non-compliance Notes</Label><Textarea value={String(form.exceedanceNotes ?? "")} onChange={e => setForm(f => ({ ...f, exceedanceNotes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Tab = "licences" | "readings" | "borehole" | "records" | "equipment" | "soil-moisture" | "drought" | "cams" | "advisor";
const WATER_TAB_IDS: Tab[] = ["licences", "readings", "borehole", "records", "equipment", "soil-moisture", "drought", "cams", "advisor"];

export default function WaterIrrigationPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({ page: "water-irrigation", farmId, validIds: WATER_TAB_IDS, defaultTab: "licences", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Water & Irrigation Management">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "licences"} onClick={() => setTab("licences")}><ScrollText className="w-3.5 h-3.5 mr-1" />Water Sources</TabButton>
          <TabButton active={tab === "readings"} onClick={() => setTab("readings")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Meter Readings</TabButton>
          <TabButton active={tab === "borehole"} onClick={() => setTab("borehole")}><Drill className="w-3.5 h-3.5 mr-1" />Borehole Tests</TabButton>
          <TabButton active={tab === "records"} onClick={() => setTab("records")}><Droplets className="w-3.5 h-3.5 mr-1" />Applications</TabButton>
          <TabButton active={tab === "equipment"} onClick={() => setTab("equipment")}><Tractor className="w-3.5 h-3.5 mr-1" />Equipment</TabButton>
          <TabButton active={tab === "soil-moisture"} onClick={() => setTab("soil-moisture")}><CloudRain className="w-3.5 h-3.5 mr-1" />Soil Moisture</TabButton>
          <TabButton active={tab === "drought"} onClick={() => setTab("drought")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Drought Plans</TabButton>
          <TabButton active={tab === "cams"} onClick={() => setTab("cams")}><FileCheck className="w-3.5 h-3.5 mr-1" />CAMS Returns</TabButton>
          <TabButton active={tab === "advisor"} onClick={() => setTab("advisor")}><Sprout className="w-3.5 h-3.5 mr-1" />Irrigation Advisor</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "licences" && <LicencesTab farmId={farmId} />}
          {tab === "readings" && <MeterReadingsTab farmId={farmId} />}
          {tab === "borehole" && <BoreholeTestsTab farmId={farmId} />}
          {tab === "records" && <IrrigationRecordsTab farmId={farmId} />}
          {tab === "equipment" && <IrrigationEquipmentTab farmId={farmId} />}
          {tab === "soil-moisture" && <SoilMoistureTab farmId={farmId} />}
          {tab === "drought" && <DroughtManagementTab farmId={farmId} />}
          {tab === "cams" && <CamsReturnsTab farmId={farmId} />}
          {tab === "advisor" && <IrrigationAdvisorTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
