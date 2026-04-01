import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, ScrollText, BarChart3, Drill, Droplets, Tractor, CloudRain, AlertTriangle, FileCheck } from "lucide-react";
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

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }

function DataTable({ cols, rows, onEdit, onDelete }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void }) {
  if (!rows.length) return <Empty msg="No records yet." />;
  return (
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete) && <th />}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i} className="border-b last:border-0">
        {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
        {(onEdit || onDelete) && <td className="py-2 text-right space-x-1">
          {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
          {onDelete && <Button size="icon" variant="ghost" onClick={() => onDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
        </td>}
      </tr>)}</tbody>
    </table></div>
  );
}

function LicencesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: licences = [], isLoading } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/water-abstraction-licences/${editing.id}`) : api(`farms/${farmId}/water-abstraction-licences`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-licences", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/water-abstraction-licences/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["water-licences", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Abstraction Licences</h3><Button size="sm" onClick={() => { setEditing(null); setForm({ meterRequired: true, returnRequired: true, issuingAuthority: "Environment Agency" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Licence</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "licenceNumber", label: "Licence No." }, { key: "issuingAuthority", label: "Issuing Authority" }, { key: "waterSource", label: "Source" }, { key: "purposeOfUse", label: "Purpose" }, { key: "annualLicencedVolumeM3", label: "Annual m³" }, { key: "licenceExpiryDate", label: "Expiry", fmt: r => fmtDate(r.licenceExpiryDate) }]} rows={licences as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); }} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Abstraction Licence</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Licence Number *</Label><Input value={String(form.licenceNumber ?? "")} onChange={e => setForm(f => ({ ...f, licenceNumber: e.target.value }))} /></div>
            <div><Label>Issuing Authority *</Label><Input value={String(form.issuingAuthority ?? "Environment Agency")} onChange={e => setForm(f => ({ ...f, issuingAuthority: e.target.value }))} /></div>
            <div><Label>Water Source *</Label>
              <Select value={String(form.waterSource ?? "")} onValueChange={v => setForm(f => ({ ...f, waterSource: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["River / Stream", "Borehole / Well", "Reservoir", "Ditch / Drain", "Pond / Lake", "Mains Water"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Purpose of Use *</Label>
              <Select value={String(form.purposeOfUse ?? "")} onValueChange={v => setForm(f => ({ ...f, purposeOfUse: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Irrigation", "Livestock Watering", "Spray Washing", "Amenity", "Fish Farming", "Human Consumption"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Abstraction Point</Label><Textarea value={String(form.abstractionPointDescription ?? "")} onChange={e => setForm(f => ({ ...f, abstractionPointDescription: e.target.value }))} rows={2} /></div>
            <div className="space-y-3">
              <div><Label>Annual Volume (m³)</Label><Input type="number" value={String(form.annualLicencedVolumeM3 ?? "")} onChange={e => setForm(f => ({ ...f, annualLicencedVolumeM3: e.target.value }))} /></div>
              <div><Label>Daily Volume (m³)</Label><Input type="number" value={String(form.dailyLicencedVolumeM3 ?? "")} onChange={e => setForm(f => ({ ...f, dailyLicencedVolumeM3: e.target.value }))} /></div>
            </div>
            <div><Label>Licence Start Date</Label><Input type="date" value={String(form.licenceStartDate ?? "")} onChange={e => setForm(f => ({ ...f, licenceStartDate: e.target.value }))} /></div>
            <div><Label>Licence Expiry Date</Label><Input type="date" value={String(form.licenceExpiryDate ?? "")} onChange={e => setForm(f => ({ ...f, licenceExpiryDate: e.target.value }))} /></div>
            <div><Label>Meter Serial Number</Label><Input value={String(form.meterSerialNumber ?? "")} onChange={e => setForm(f => ({ ...f, meterSerialNumber: e.target.value }))} /></div>
            <div><Label>Return Deadline (e.g. 31 Jan)</Label><Input value={String(form.returnDeadline ?? "")} onChange={e => setForm(f => ({ ...f, returnDeadline: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Checkbox id="meter" checked={Boolean(form.meterRequired)} onCheckedChange={v => setForm(f => ({ ...f, meterRequired: Boolean(v) }))} /><Label htmlFor="meter">Meter required?</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="ret" checked={Boolean(form.returnRequired)} onCheckedChange={v => setForm(f => ({ ...f, returnRequired: Boolean(v) }))} /><Label htmlFor="ret">Return required?</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MeterReadingsTab({ farmId }: { farmId: number }) {
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: readings = [], isLoading } = useQuery({ queryKey: ["water-readings", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-meter-readings`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/water-meter-readings`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-readings", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/water-meter-readings/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["water-readings", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Abstraction Meter Readings</h3><Button size="sm" onClick={() => { setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Log Reading</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "readingDate", label: "Date", fmt: r => fmtDate(r.readingDate) }, { key: "meterReading", label: "Meter Reading" }, { key: "volumeAbstractedM3", label: "Abstracted (m³)" }, { key: "cumulativeYtdM3", label: "YTD (m³)" }, { key: "percentOfAnnualAllocation", label: "% of Allocation" }, { key: "readBy", label: "Read By" }]} rows={readings as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Meter Reading</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Reading Date *</Label><Input type="date" value={form.readingDate ?? ""} onChange={e => setForm(f => ({ ...f, readingDate: e.target.value }))} /></div>
            <div><Label>Licence *</Label>
              <Select value={form.licenceId ?? ""} onValueChange={v => setForm(f => ({ ...f, licenceId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select licence" /></SelectTrigger>
                <SelectContent>{(licences as Record<string, unknown>[]).map(l => <SelectItem key={String(l.id)} value={String(l.id)}>{String(l.licenceNumber)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Meter Reading *</Label><Input type="number" step="0.01" value={form.meterReading ?? ""} onChange={e => setForm(f => ({ ...f, meterReading: e.target.value }))} /></div>
            <div><Label>Volume Abstracted (m³)</Label><Input type="number" step="0.01" value={form.volumeAbstractedM3 ?? ""} onChange={e => setForm(f => ({ ...f, volumeAbstractedM3: e.target.value }))} /></div>
            <div><Label>YTD Cumulative (m³)</Label><Input type="number" step="0.01" value={form.cumulativeYtdM3 ?? ""} onChange={e => setForm(f => ({ ...f, cumulativeYtdM3: e.target.value }))} /></div>
            <div><Label>% of Annual Allocation</Label><Input type="number" step="0.1" value={form.percentOfAnnualAllocation ?? ""} onChange={e => setForm(f => ({ ...f, percentOfAnnualAllocation: e.target.value }))} /></div>
            <div><Label>Read By</Label><Input value={form.readBy ?? ""} onChange={e => setForm(f => ({ ...f, readBy: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BoreholeTestsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: tests = [], isLoading } = useQuery({ queryKey: ["borehole-tests", farmId], queryFn: () => fetch(api(`farms/${farmId}/borehole-tests`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/borehole-tests`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["borehole-tests", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/borehole-tests/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["borehole-tests", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Borehole & Well Tests</h3><Button size="sm" onClick={() => { setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Test</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "testDate", label: "Date", fmt: r => fmtDate(r.testDate) }, { key: "testingCompany", label: "Testing Company" }, { key: "bacteriologicalResult", label: "Bacteriological" }, { key: "chemicalResult", label: "Chemical" }, { key: "overallResult", label: "Overall Result" }, { key: "nextTestDueDate", label: "Next Test", fmt: r => fmtDate(r.nextTestDueDate) }]} rows={tests as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Borehole Test</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Test Date *</Label><Input type="date" value={form.testDate ?? ""} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} /></div>
            <div><Label>Testing Company</Label><Input value={form.testingCompany ?? ""} onChange={e => setForm(f => ({ ...f, testingCompany: e.target.value }))} /></div>
            <div><Label>Static Water Level (m)</Label><Input type="number" step="0.01" value={form.staticWaterLevelM ?? ""} onChange={e => setForm(f => ({ ...f, staticWaterLevelM: e.target.value }))} /></div>
            <div><Label>Pumping Water Level (m)</Label><Input type="number" step="0.01" value={form.pumpingWaterLevelM ?? ""} onChange={e => setForm(f => ({ ...f, pumpingWaterLevelM: e.target.value }))} /></div>
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
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IrrigationRecordsTab({ farmId }: { farmId: number }) {
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["irrig-records", farmId], queryFn: () => fetch(api(`farms/${farmId}/irrigation-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/irrigation-records`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["irrig-records", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/irrigation-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["irrig-records", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Irrigation Application Records</h3><Button size="sm" onClick={() => { setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Log Application</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "irrigationDate", label: "Date", fmt: r => fmtDate(r.irrigationDate) }, { key: "fieldOrBlockDescription", label: "Field / Block" }, { key: "cropType", label: "Crop" }, { key: "irrigationMethod", label: "Method" }, { key: "applicationDepthMm", label: "Depth (mm)" }, { key: "volumeAppliedM3", label: "Volume (m³)" }]} rows={records as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Irrigation Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={form.irrigationDate ?? ""} onChange={e => setForm(f => ({ ...f, irrigationDate: e.target.value }))} /></div>
            <div><Label>Licence</Label>
              <Select value={form.licenceId ?? ""} onValueChange={v => setForm(f => ({ ...f, licenceId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select licence" /></SelectTrigger>
                <SelectContent>{(licences as Record<string, unknown>[]).map(l => <SelectItem key={String(l.id)} value={String(l.id)}>{String(l.licenceNumber)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Field / Block Description *</Label><Input value={form.fieldOrBlockDescription ?? ""} onChange={e => setForm(f => ({ ...f, fieldOrBlockDescription: e.target.value }))} /></div>
            <div><Label>Area Irrigated (ha)</Label><Input type="number" step="0.001" value={form.areaIrrigatedHa ?? ""} onChange={e => setForm(f => ({ ...f, areaIrrigatedHa: e.target.value }))} /></div>
            <div><Label>Crop Type</Label><Input value={form.cropType ?? ""} onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))} /></div>
            <div><Label>Method *</Label>
              <Select value={form.irrigationMethod ?? ""} onValueChange={v => setForm(f => ({ ...f, irrigationMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Drip/Trickle", "Overhead Sprinkler", "Boom Irrigation", "Flood/Furrow", "Linear Move", "Rain Gun"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Application Depth (mm)</Label><Input type="number" step="0.1" value={form.applicationDepthMm ?? ""} onChange={e => setForm(f => ({ ...f, applicationDepthMm: e.target.value }))} /></div>
            <div><Label>Volume Applied (m³)</Label><Input type="number" step="0.01" value={form.volumeAppliedM3 ?? ""} onChange={e => setForm(f => ({ ...f, volumeAppliedM3: e.target.value }))} /></div>
            <div><Label>Soil Moisture Deficit (mm)</Label><Input type="number" step="0.1" value={form.soilMoistureDeficitMm ?? ""} onChange={e => setForm(f => ({ ...f, soilMoistureDeficitMm: e.target.value }))} /></div>
            <div><Label>Operator Name</Label><Input value={form.operatorName ?? ""} onChange={e => setForm(f => ({ ...f, operatorName: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IrrigationEquipmentTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: equipment = [], isLoading } = useQuery({ queryKey: ["irrig-equip", farmId], queryFn: () => fetch(api(`farms/${farmId}/irrigation-equipment`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/irrigation-equipment/${editing.id}`) : api(`farms/${farmId}/irrigation-equipment`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["irrig-equip", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/irrigation-equipment/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["irrig-equip", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Irrigation Equipment Register</h3><Button size="sm" onClick={() => { setEditing(null); setForm({ status: "active" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Equipment</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "equipmentName", label: "Name" }, { key: "equipmentType", label: "Type" }, { key: "manufacturer", label: "Manufacturer" }, { key: "applicationRateLph", label: "Rate (L/hr)" }, { key: "lastCalibrationDate", label: "Last Calibration", fmt: r => fmtDate(r.lastCalibrationDate) }, { key: "nextCalibrationDue", label: "Next Due", fmt: r => fmtDate(r.nextCalibrationDue) }, { key: "status", label: "Status" }]} rows={equipment as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
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
            <div><Label>Last Calibration Date</Label><Input type="date" value={form.lastCalibrationDate ?? ""} onChange={e => setForm(f => ({ ...f, lastCalibrationDate: e.target.value }))} /></div>
            <div><Label>Next Calibration Due</Label><Input type="date" value={form.nextCalibrationDue ?? ""} onChange={e => setForm(f => ({ ...f, nextCalibrationDue: e.target.value }))} /></div>
            <div><Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "maintenance", "out-of-service", "retired"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SoilMoistureTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["soil-moisture", farmId], queryFn: () => fetch(api(`farms/${farmId}/soil-moisture-readings`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/soil-moisture-readings/${editing.id}`) : api(`farms/${farmId}/soil-moisture-readings`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["soil-moisture", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/soil-moisture-readings/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["soil-moisture", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Soil Moisture Monitoring</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Log soil moisture readings to optimise irrigation scheduling and evidence good water management. Compatible sensor data can be entered manually or imported from Sentek, METER Group (TEROS) or AquaSpy platforms.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ readingMethod: "manual" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Reading</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "readingDate", label: "Date", fmt: r => fmtDate(r.readingDate) }, { key: "fieldOrBlockDescription", label: "Field / Block" }, { key: "sensorType", label: "Sensor Type" }, { key: "depthCm", label: "Depth (cm)" }, { key: "moisturePercent", label: "Moisture %" }, { key: "soilMoistureDeficitMm", label: "SMD (mm)" }, { key: "readingMethod", label: "Method" }, { key: "recordedBy", label: "Recorded By" }]} rows={records as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Soil Moisture Reading</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Reading Date *</Label><Input type="date" value={form.readingDate ?? ""} onChange={e => setForm(f => ({ ...f, readingDate: e.target.value }))} /></div>
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
            <div><Label>Recorded By</Label><Input value={form.recordedBy ?? ""} onChange={e => setForm(f => ({ ...f, recordedBy: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DroughtManagementTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["drought-plans", farmId], queryFn: () => fetch(api(`farms/${farmId}/drought-management-plans`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/drought-management-plans/${editing.id}`) : api(`farms/${farmId}/drought-management-plans`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["drought-plans", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/drought-management-plans/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["drought-plans", farmId] }) });
  const STAGES = ["normal", "prolonged dry spell", "drought", "severe drought", "exceptional drought"];
  const RESTRICTIONS = ["none", "voluntary reduction", "stage 1 restriction", "stage 2 restriction", "temporary use ban", "drought permit needed"];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Drought Management Plans</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record drought stages and restriction levels aligned to EA Drought Management Plans. Log actions taken and alternative water sources to demonstrate responsible management.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ droughtStage: "normal", restrictionLevel: "none", isActive: true }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Plan</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "planYear", label: "Year" }, { key: "planTitle", label: "Plan Title" }, { key: "droughtStage", label: "Drought Stage" }, { key: "restrictionLevel", label: "Restriction Level" }, { key: "isActive", label: "Active", fmt: r => r.isActive ? "Yes" : "No" }, { key: "reviewDate", label: "Review Date", fmt: r => fmtDate(r.reviewDate) }]} rows={records as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CamsReturnsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then(r => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["cams-returns", farmId], queryFn: () => fetch(api(`farms/${farmId}/cams-annual-returns`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/cams-annual-returns/${editing.id}`) : api(`farms/${farmId}/cams-annual-returns`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["cams-returns", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/cams-annual-returns/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["cams-returns", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">CAMS Annual Returns — EA Abstraction Compliance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record annual abstraction returns submitted to the Environment Agency under Catchment Abstraction Management Strategies (CAMS). Annual returns must be submitted by the deadline stated on your licence.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ submittedToEa: false, complianceStatus: "compliant", returnYear: String(new Date().getFullYear()) }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Return</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "returnYear", label: "Year" }, { key: "licenceId", label: "Licence", fmt: r => { const l = (licences as Record<string, unknown>[]).find(x => String(x.id) === String(r.licenceId)); return l ? String(l.licenceNumber) : fmt(r.licenceId); } }, { key: "totalAbstractedM3", label: "Total (m³)" }, { key: "submittedToEa", label: "Submitted", fmt: r => r.submittedToEa ? "Yes" : "No" }, { key: "submissionDate", label: "Submission Date", fmt: r => fmtDate(r.submissionDate) }, { key: "eaReturnReference", label: "EA Ref" }, { key: "complianceStatus", label: "Compliance" }]} rows={records as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
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
            <div><Label>Period Start *</Label><Input type="date" value={String(form.returnPeriodStart ?? "")} onChange={e => setForm(f => ({ ...f, returnPeriodStart: e.target.value }))} /></div>
            <div><Label>Period End *</Label><Input type="date" value={String(form.returnPeriodEnd ?? "")} onChange={e => setForm(f => ({ ...f, returnPeriodEnd: e.target.value }))} /></div>
            <div><Label>Total Abstracted (m³)</Label><Input type="number" step="1" value={String(form.totalAbstractedM3 ?? "")} onChange={e => setForm(f => ({ ...f, totalAbstractedM3: e.target.value }))} /></div>
            <div><Label>Compliance Status</Label>
              <Select value={String(form.complianceStatus ?? "compliant")} onValueChange={v => setForm(f => ({ ...f, complianceStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["compliant", "minor exceedance", "significant exceedance", "enforcement notice"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 col-span-2 mt-1"><Checkbox id="subEA" checked={Boolean(form.submittedToEa)} onCheckedChange={v => setForm(f => ({ ...f, submittedToEa: Boolean(v) }))} /><Label htmlFor="subEA">Submitted to Environment Agency?</Label></div>
            <div><Label>Submission Date</Label><Input type="date" value={String(form.submissionDate ?? "")} onChange={e => setForm(f => ({ ...f, submissionDate: e.target.value }))} /></div>
            <div><Label>EA Return Reference</Label><Input value={String(form.eaReturnReference ?? "")} onChange={e => setForm(f => ({ ...f, eaReturnReference: e.target.value }))} /></div>
            <div><Label>Submitted By</Label><Input value={String(form.submittedBy ?? "")} onChange={e => setForm(f => ({ ...f, submittedBy: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Exceedance / Non-compliance Notes</Label><Textarea value={String(form.exceedanceNotes ?? "")} onChange={e => setForm(f => ({ ...f, exceedanceNotes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Tab = "licences" | "readings" | "borehole" | "records" | "equipment" | "soil-moisture" | "drought" | "cams";

export default function WaterIrrigationPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("licences");
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Water & Irrigation Management">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "licences"} onClick={() => setTab("licences")}><ScrollText className="w-3.5 h-3.5 mr-1" />Licences</TabButton>
          <TabButton active={tab === "readings"} onClick={() => setTab("readings")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Meter Readings</TabButton>
          <TabButton active={tab === "borehole"} onClick={() => setTab("borehole")}><Drill className="w-3.5 h-3.5 mr-1" />Borehole Tests</TabButton>
          <TabButton active={tab === "records"} onClick={() => setTab("records")}><Droplets className="w-3.5 h-3.5 mr-1" />Applications</TabButton>
          <TabButton active={tab === "equipment"} onClick={() => setTab("equipment")}><Tractor className="w-3.5 h-3.5 mr-1" />Equipment</TabButton>
          <TabButton active={tab === "soil-moisture"} onClick={() => setTab("soil-moisture")}><CloudRain className="w-3.5 h-3.5 mr-1" />Soil Moisture</TabButton>
          <TabButton active={tab === "drought"} onClick={() => setTab("drought")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Drought Plans</TabButton>
          <TabButton active={tab === "cams"} onClick={() => setTab("cams")}><FileCheck className="w-3.5 h-3.5 mr-1" />CAMS Returns</TabButton>
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
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
