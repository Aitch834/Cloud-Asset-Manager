import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LabSelector } from "@/components/ui/LabSelector";
import { Plus, Pencil, Trash2, Loader2, LayoutGrid, Leaf, Droplets, Package, Warehouse, AlertTriangle, Eye } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }
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

function BlocksTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: blocks = [], isLoading } = useQuery({ queryKey: ["horti-blocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/horticulture-blocks/${editing.id}`) : api(`farms/${farmId}/horticulture-blocks`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-blocks/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Growing Blocks / Field Sections</h3><Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Block</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "blockName", label: "Block Name" }, { key: "blockCode", label: "Code" }, { key: "areaHa", label: "Area (ha)" }, { key: "soilType", label: "Soil Type" }, { key: "irrigationSystem", label: "Irrigation" }, { key: "waterSource", label: "Water Source" }]} rows={blocks as Record<string, unknown>[]} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Block</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block Name</p><p className="font-medium">{fmt(viewRecord.blockName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block Code</p><p className="font-medium">{fmt(viewRecord.blockCode)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Area (ha)</p><p className="font-medium">{fmt(viewRecord.areaHa)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Soil Type</p><p className="font-medium">{fmt(viewRecord.soilType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Irrigation System</p><p className="font-medium">{fmt(viewRecord.irrigationSystem)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Water Source</p><p className="font-medium">{fmt(viewRecord.waterSource)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Block" : "Add Growing Block"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[["blockName", "Block Name *"], ["blockCode", "Block Code"], ["areaHa", "Area (ha)"], ["soilType", "Soil Type"], ["irrigationSystem", "Irrigation System"], ["waterSource", "Water Source"]].map(([k, l]) => <div key={k}><Label>{l}</Label><Input value={form[k] ?? ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>)}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CropsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: blocks = [] } = useQuery({ queryKey: ["horti-blocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then(r => r.json()) });
  const { data: crops = [], isLoading } = useQuery({ queryKey: ["horti-crops", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-crops`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/horticulture-crops/${editing.id}`) : api(`farms/${farmId}/horticulture-crops`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-crops", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-crops/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-crops", farmId] }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v as string | boolean])));
    setOpen(true);
  };

  const STATUS_COLOUR: Record<string, string> = { growing: "bg-green-100 text-green-700", harvested: "bg-blue-100 text-blue-700", failed: "bg-red-100 text-red-700", planned: "bg-gray-100 text-gray-600" };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Crop Register</h3><Button size="sm" onClick={() => { setEditing(null); setForm({ seedTreated: false, status: "growing" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Crop</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "cropName", label: "Crop" }, { key: "variety", label: "Variety" }, { key: "sowingDate", label: "Sowing", fmt: r => fmtDate(r.sowingDate) }, { key: "expectedHarvestDate", label: "Expected Harvest", fmt: r => fmtDate(r.expectedHarvestDate) }, { key: "growingMethod", label: "Method" }, { key: "status", label: "Status", fmt: r => { const s = String(r.status ?? ""); const c = STATUS_COLOUR[s] ?? "bg-gray-100 text-gray-600"; return `[${s}]`; } }]} rows={crops as Record<string, unknown>[]} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Crop</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop Name</p><p className="font-medium">{fmt(viewRecord.cropName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Variety</p><p className="font-medium">{fmt(viewRecord.variety)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block / Field</p><p className="font-medium">{(blocks as any[]).find(b => String(b.id) === String(viewRecord.blockId))?.blockName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Growing Method</p><p className="font-medium">{fmt(viewRecord.growingMethod)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sowing Date</p><p className="font-medium">{fmtDate(viewRecord.sowingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Transplanting Date</p><p className="font-medium">{fmtDate(viewRecord.transplantingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Harvest Date</p><p className="font-medium">{fmtDate(viewRecord.expectedHarvestDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Yield (kg/ha)</p><p className="font-medium">{fmt(viewRecord.targetYieldKgHa)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmt(viewRecord.status)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Supplier</p><p className="font-medium">{fmt(viewRecord.seedSupplier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Lot Number</p><p className="font-medium">{fmt(viewRecord.seedLotNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Treated</p><p className="font-medium">{viewRecord.seedTreated ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Crop Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
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
            {[["sowingDate", "Sowing Date", "date"], ["transplantingDate", "Transplanting Date", "date"], ["expectedHarvestDate", "Expected Harvest", "date"]].map(([k, l, t]) => <div key={k}><Label>{l}</Label><Input type={t} value={String(form[k] ?? "")} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>)}
            <div><Label>Seed Supplier</Label><Input value={String(form.seedSupplier ?? "")} onChange={e => setForm(f => ({ ...f, seedSupplier: e.target.value }))} /></div>
            <div><Label>Seed Lot Number</Label><Input value={String(form.seedLotNumber ?? "")} onChange={e => setForm(f => ({ ...f, seedLotNumber: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4"><Checkbox id="treated" checked={Boolean(form.seedTreated)} onCheckedChange={v => setForm(f => ({ ...f, seedTreated: Boolean(v) }))} /><Label htmlFor="treated">Seed treated?</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WaterTestsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [labSupplierId, setLabSupplierId] = useState<number | null>(null);
  const { data: tests = [], isLoading } = useQuery({ queryKey: ["horti-water", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-water-tests`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/horticulture-water-tests/${editing.id}`) : api(`farms/${farmId}/horticulture-water-tests`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-water", farmId] }); setOpen(false); setForm({}); setEditing(null); setLabSupplierId(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-water-tests/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-water", farmId] }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setLabSupplierId((r.labSupplierId as number | null) ?? null);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Irrigation Water Quality Tests</h3><Button size="sm" onClick={() => { setEditing(null); setForm({}); setLabSupplierId(null); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Test</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "testDate", label: "Date", fmt: r => fmtDate(r.testDate) }, { key: "waterSource", label: "Source" }, { key: "testingLab", label: "Lab" }, { key: "ecoli", label: "E.coli" }, { key: "totalColiform", label: "Coliform" }, { key: "overallResult", label: "Result" }, { key: "nextTestDueDate", label: "Next Due", fmt: r => fmtDate(r.nextTestDueDate) }]} rows={tests as Record<string, unknown>[]} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} />}
      
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
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setLabSupplierId(null); } }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Water Test Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Test Date *</Label><Input type="date" value={form.testDate ?? ""} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} /></div>
            <div><Label>Water Source *</Label><Input value={form.waterSource ?? ""} onChange={e => setForm(f => ({ ...f, waterSource: e.target.value }))} /></div>
            <div className="col-span-2">
              <LabSelector
                farmId={farmId}
                value={labSupplierId}
                labName={form.testingLab ?? null}
                onChange={(id, name) => { setLabSupplierId(id); setForm(f => ({ ...f, testingLab: name ?? "" })); }}
              />
            </div>
            <div><Label>Sample Reference</Label><Input value={form.sampleReference ?? ""} onChange={e => setForm(f => ({ ...f, sampleReference: e.target.value }))} /></div>
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
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setOpen(false); setLabSupplierId(null); }}>Cancel</Button><Button onClick={() => save.mutate({ ...form, labSupplierId: labSupplierId ?? null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HarvestTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-harvest", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-harvest-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/horticulture-harvest-records/${editing.id}`) : api(`farms/${farmId}/horticulture-harvest-records`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-harvest", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-harvest-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-harvest", farmId] }) });
  
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Harvest Records</h3><Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Harvest</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "harvestDate", label: "Date", fmt: r => fmtDate(r.harvestDate) }, { key: "harvestBatchRef", label: "Batch Ref" }, { key: "quantityKg", label: "Total (kg)" }, { key: "gradeA", label: "Grade A (kg)" }, { key: "gradeB", label: "Grade B (kg)" }, { key: "preHarvestInterval", label: "PHI (days)" }, { key: "destination", label: "Destination" }]} rows={records as Record<string, unknown>[]} onView={setViewRecord} onEdit={openEdit} onDelete={r => del.mutate(r.id as number)} />}
      
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
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
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
            <div><Label>Destination</Label><Input value={form.destination ?? ""} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} /></div>
            <div><Label>Customer Reference</Label><Input value={form.customerReference ?? ""} onChange={e => setForm(f => ({ ...f, customerReference: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackhouseTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-packhouse", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-packhouse-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Packhouse & Despatch Records</h3><Button size="sm" onClick={() => { setForm({ labelChecked: false, metalDetectorCheck: false, allergenCheck: false }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "packingDate", label: "Packing Date", fmt: r => fmtDate(r.packingDate) }, { key: "harvestBatchRef", label: "Batch Ref" }, { key: "productName", label: "Product" }, { key: "traceabilityCode", label: "Traceability Code" }, { key: "quantityPackedKg", label: "Qty (kg)" }, { key: "customerName", label: "Customer" }]} rows={records as Record<string, unknown>[]} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Packhouse Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Packing Date</p><p className="font-medium">{fmtDate(viewRecord.packingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Harvest Batch Ref</p><p className="font-medium">{fmt(viewRecord.harvestBatchRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmt(viewRecord.productName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Traceability Code</p><p className="font-medium">{fmt(viewRecord.traceabilityCode)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Packed (kg)</p><p className="font-medium">{fmt(viewRecord.quantityPackedKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pack Format</p><p className="font-medium">{fmt(viewRecord.packFormat)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Packaging Type</p><p className="font-medium">{fmt(viewRecord.packagingType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cold Store Temp (°C)</p><p className="font-medium">{fmt(viewRecord.coldStoreTemperature)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Name</p><p className="font-medium">{fmt(viewRecord.customerName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle Reg</p><p className="font-medium">{fmt(viewRecord.vehicleRegistration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Label Checked</p><p className="font-medium">{viewRecord.labelChecked ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Metal Detector Check</p><p className="font-medium">{viewRecord.metalDetectorCheck ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Allergen Check</p><p className="font-medium">{viewRecord.allergenCheck ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Packhouse Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AllergenTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-allergen", farmId], queryFn: () => fetch(api(`farms/${farmId}/allergen-management`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/allergen-management`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/allergen-management/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Allergen Management Reviews</h3><Button size="sm" onClick={() => { setForm({ labellingVerified: false }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Review</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "reviewDate", label: "Review Date", fmt: r => fmtDate(r.reviewDate) }, { key: "reviewedBy", label: "Reviewed By" }, { key: "crossContaminationRisk", label: "Cross-Contamination Risk" }, { key: "nextReviewDate", label: "Next Review", fmt: r => fmtDate(r.nextReviewDate) }, { key: "labellingVerified", label: "Labelling Verified", fmt: r => r.labellingVerified ? "Yes" : "No" }]} rows={records as Record<string, unknown>[]} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Allergen Review</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p><p className="font-medium">{fmtDate(viewRecord.reviewDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reviewed By</p><p className="font-medium">{fmt(viewRecord.reviewedBy)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cross Contamination Risk</p><p className="font-medium">{fmt(viewRecord.crossContaminationRisk)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Staff Training Date</p><p className="font-medium">{fmtDate(viewRecord.staffTrainingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Review Date</p><p className="font-medium">{fmtDate(viewRecord.nextReviewDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Labelling Verified</p><p className="font-medium">{viewRecord.labellingVerified ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Control Measures</p><p className="font-medium">{fmt(viewRecord.controlMeasures)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
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
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Tab = "blocks" | "crops" | "water" | "harvest" | "packhouse" | "allergen";

export default function HorticulturePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["blocks","crops","water","harvest","packhouse","allergen"]; return t && valid.includes(t) ? t : "blocks"; });
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Horticulture & Fresh Produce">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")}><LayoutGrid className="w-3.5 h-3.5 mr-1" />Blocks</TabButton>
          <TabButton active={tab === "crops"} onClick={() => setTab("crops")}><Leaf className="w-3.5 h-3.5 mr-1" />Crops</TabButton>
          <TabButton active={tab === "water"} onClick={() => setTab("water")}><Droplets className="w-3.5 h-3.5 mr-1" />Water Tests</TabButton>
          <TabButton active={tab === "harvest"} onClick={() => setTab("harvest")}><Package className="w-3.5 h-3.5 mr-1" />Harvest</TabButton>
          <TabButton active={tab === "packhouse"} onClick={() => setTab("packhouse")}><Warehouse className="w-3.5 h-3.5 mr-1" />Packhouse</TabButton>
          <TabButton active={tab === "allergen"} onClick={() => setTab("allergen")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Allergens</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "blocks" && <BlocksTab farmId={farmId} />}
          {tab === "crops" && <CropsTab farmId={farmId} />}
          {tab === "water" && <WaterTestsTab farmId={farmId} />}
          {tab === "harvest" && <HarvestTab farmId={farmId} />}
          {tab === "packhouse" && <PackhouseTab farmId={farmId} />}
          {tab === "allergen" && <AllergenTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
