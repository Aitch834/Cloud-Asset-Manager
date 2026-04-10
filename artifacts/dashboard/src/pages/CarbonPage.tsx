import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, BarChart3, Flame, Trees, Zap, FileBarChart, SunMedium, Sprout } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
function DataTable({ cols, rows, onEdit, onDelete }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete) && <td className="py-2 text-right space-x-1">
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

function AuditsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: audits = [], isLoading } = useQuery({ queryKey: ["carbon-audits", farmId], queryFn: () => fetch(api(`farms/${farmId}/carbon-audits`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/carbon-audits/${editing.id}`) : api(`farms/${farmId}/carbon-audits`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-audits/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] }) });

  const chartData = (audits as Record<string, unknown>[])
    .filter(a => a.auditYear && a.totalTonnesCo2e != null)
    .sort((a, b) => Number(a.auditYear) - Number(b.auditYear))
    .map(a => ({
      year: String(a.auditYear),
      gross: a.totalTonnesCo2e != null ? parseFloat(String(a.totalTonnesCo2e)) : 0,
      net: a.netTonnesCo2e != null ? parseFloat(String(a.netTonnesCo2e)) : 0,
      seq: a.sequestrationTonnesCo2e != null ? parseFloat(String(a.sequestrationTonnesCo2e)) : 0,
    }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Carbon Audits</h3><Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Audit</Button></div>

      {chartData.length >= 2 && (
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Year-on-Year Carbon Trend (tCO₂e)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="t" />
              <Tooltip formatter={(v: number, name: string) => [`${v.toFixed(1)} tCO₂e`, name]} contentStyle={{ fontSize: "0.8rem" }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: "0.75rem" }} />
              <Bar dataKey="gross" name="Gross Emissions" fill="#f97316" radius={[3, 3, 0, 0]} />
              <Bar dataKey="seq" name="Sequestration" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="net" name="Net Emissions" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "auditYear", label: "Year" }, { key: "auditDate", label: "Audit Date", fmt: r => fmtDate(r.auditDate) }, { key: "conductedBy", label: "Conducted By" }, { key: "auditTool", label: "Audit Tool" }, { key: "totalTonnesCo2e", label: "Total tCO₂e" }, { key: "netTonnesCo2e", label: "Net tCO₂e" }, { key: "supplyChainRequirement", label: "Supply Chain" }]} rows={audits as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Carbon Audit</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Audit Year *</Label><Input type="number" value={form.auditYear ?? ""} onChange={e => setForm(f => ({ ...f, auditYear: e.target.value }))} /></div>
            <div><Label>Audit Date *</Label><Input type="date" value={form.auditDate ?? ""} onChange={e => setForm(f => ({ ...f, auditDate: e.target.value }))} /></div>
            <div><Label>Conducted By *</Label><Input value={form.conductedBy ?? ""} onChange={e => setForm(f => ({ ...f, conductedBy: e.target.value }))} /></div>
            <div><Label>Audit Tool / Methodology</Label><Input value={form.auditTool ?? ""} onChange={e => setForm(f => ({ ...f, auditTool: e.target.value }))} /></div>
            <div><Label>Supply Chain Customer</Label><Input value={form.supplyChainRequirement ?? ""} onChange={e => setForm(f => ({ ...f, supplyChainRequirement: e.target.value }))} /></div>
            <div><Label>Certification Body</Label><Input value={form.certificationBody ?? ""} onChange={e => setForm(f => ({ ...f, certificationBody: e.target.value }))} /></div>
            {[["totalScope1TonnesCo2e", "Scope 1 tCO₂e"], ["totalScope2TonnesCo2e", "Scope 2 tCO₂e"], ["totalScope3TonnesCo2e", "Scope 3 tCO₂e"], ["totalTonnesCo2e", "Total tCO₂e"], ["sequestrationTonnesCo2e", "Sequestration tCO₂e"], ["netTonnesCo2e", "Net tCO₂e"], ["reductionTargetPct", "Reduction Target (%)"]].map(([k, l]) => <div key={k}><Label>{l}</Label><Input type="number" step="0.001" value={form[k] ?? ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>)}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmissionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["carbon-emissions", farmId], queryFn: () => fetch(api(`farms/${farmId}/carbon-emissions`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/carbon-emissions`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-emissions/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] }) });
  const CATEGORIES = ["Fuel & Energy", "Livestock Enteric Fermentation", "Livestock Manure", "Soil & Fertiliser N₂O", "Land Use Change", "Purchased Inputs", "Transport", "Buildings & Infrastructure", "Other"];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Emissions Records</h3><Button size="sm" onClick={() => { setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "emissionYear", label: "Year" }, { key: "category", label: "Category" }, { key: "subcategory", label: "Sub-category" }, { key: "activityDescription", label: "Activity" }, { key: "quantity", label: "Quantity" }, { key: "unit", label: "Unit" }, { key: "tonnesCo2e", label: "tCO₂e" }, { key: "scope", label: "Scope" }]} rows={records as Record<string, unknown>[]} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Emissions Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Year *</Label><Input type="number" value={form.emissionYear ?? ""} onChange={e => setForm(f => ({ ...f, emissionYear: e.target.value }))} /></div>
            <div><Label>Scope *</Label>
              <Select value={form.scope ?? ""} onValueChange={v => setForm(f => ({ ...f, scope: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Scope 1", "Scope 2", "Scope 3"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Category *</Label>
              <Select value={form.category ?? ""} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Sub-category</Label><Input value={form.subcategory ?? ""} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Activity Description *</Label><Input value={form.activityDescription ?? ""} onChange={e => setForm(f => ({ ...f, activityDescription: e.target.value }))} /></div>
            <div><Label>Quantity</Label><Input type="number" step="0.001" value={form.quantity ?? ""} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            <div><Label>Unit</Label><Input value={form.unit ?? ""} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
            <div><Label>Emission Factor Source</Label><Input value={form.emissionFactorSource ?? ""} onChange={e => setForm(f => ({ ...f, emissionFactorSource: e.target.value }))} /></div>
            <div><Label>tCO₂e *</Label><Input type="number" step="0.0001" value={form.tonnesCo2e ?? ""} onChange={e => setForm(f => ({ ...f, tonnesCo2e: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SequestrationTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["carbon-seq", farmId], queryFn: () => fetch(api(`farms/${farmId}/carbon-sequestration`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/carbon-sequestration`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-sequestration/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Carbon Sequestration</h3><Button size="sm" onClick={() => { setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "sequestrationYear", label: "Year" }, { key: "featureType", label: "Feature Type" }, { key: "featureName", label: "Feature" }, { key: "areaHaOrLengthM", label: "Area/Length" }, { key: "unit", label: "Unit" }, { key: "tonnesCo2eSequestered", label: "tCO₂e Sequestered" }]} rows={records as Record<string, unknown>[]} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Sequestration Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Year *</Label><Input type="number" value={form.sequestrationYear ?? ""} onChange={e => setForm(f => ({ ...f, sequestrationYear: e.target.value }))} /></div>
            <div><Label>Feature Type *</Label>
              <Select value={form.featureType ?? ""} onValueChange={v => setForm(f => ({ ...f, featureType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Woodland", "Hedgerow", "Peatland", "Permanent Grassland", "Wildflower Meadow", "Riparian Buffer", "Agroforestry", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Feature Name</Label><Input value={form.featureName ?? ""} onChange={e => setForm(f => ({ ...f, featureName: e.target.value }))} /></div>
            <div><Label>Area/Length</Label><Input type="number" step="0.001" value={form.areaHaOrLengthM ?? ""} onChange={e => setForm(f => ({ ...f, areaHaOrLengthM: e.target.value }))} /></div>
            <div><Label>Unit</Label>
              <Select value={form.unit ?? ""} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["ha", "km", "linear m", "trees"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>tCO₂e Sequestered *</Label><Input type="number" step="0.0001" value={form.tonnesCo2eSequestered ?? ""} onChange={e => setForm(f => ({ ...f, tonnesCo2eSequestered: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Emission Factor Source</Label><Input value={form.sequestrationFactorSource ?? ""} onChange={e => setForm(f => ({ ...f, sequestrationFactorSource: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReductionActionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: actions = [], isLoading } = useQuery({ queryKey: ["carbon-actions", farmId], queryFn: () => fetch(api(`farms/${farmId}/carbon-reduction-actions`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/carbon-reduction-actions/${editing.id}`) : api(`farms/${farmId}/carbon-reduction-actions`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-reduction-actions/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Carbon Reduction Actions</h3><Button size="sm" onClick={() => { setEditing(null); setForm({ status: "planned" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Action</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "actionTitle", label: "Action" }, { key: "category", label: "Category" }, { key: "targetReductionTonnesCo2e", label: "Target tCO₂e" }, { key: "status", label: "Status" }, { key: "plannedCompletionDate", label: "Target Date", fmt: r => fmtDate(r.plannedCompletionDate) }, { key: "responsiblePerson", label: "Responsible" }]} rows={actions as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Reduction Action</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Action Title *</Label><Input value={form.actionTitle ?? ""} onChange={e => setForm(f => ({ ...f, actionTitle: e.target.value }))} /></div>
            <div><Label>Category *</Label>
              <Select value={form.category ?? ""} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Renewable Energy", "Energy Efficiency", "Fertiliser Reduction", "Livestock Feed", "Woodland Planting", "Wetland Restoration", "Transport Efficiency", "Equipment Upgrade", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status ?? "planned"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["planned", "in-progress", "completed", "cancelled"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Target Reduction (tCO₂e)</Label><Input type="number" step="0.001" value={form.targetReductionTonnesCo2e ?? ""} onChange={e => setForm(f => ({ ...f, targetReductionTonnesCo2e: e.target.value }))} /></div>
            <div><Label>Responsible Person</Label><Input value={form.responsiblePerson ?? ""} onChange={e => setForm(f => ({ ...f, responsiblePerson: e.target.value }))} /></div>
            <div><Label>Planned Start</Label><Input type="date" value={form.plannedStartDate ?? ""} onChange={e => setForm(f => ({ ...f, plannedStartDate: e.target.value }))} /></div>
            <div><Label>Planned Completion</Label><Input type="date" value={form.plannedCompletionDate ?? ""} onChange={e => setForm(f => ({ ...f, plannedCompletionDate: e.target.value }))} /></div>
            <div><Label>Estimated Cost (£)</Label><Input type="number" step="0.01" value={form.estimatedCost ?? ""} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} /></div>
            <div><Label>Funding Source</Label><Input value={form.fundingSource ?? ""} onChange={e => setForm(f => ({ ...f, fundingSource: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: reports = [], isLoading } = useQuery({ queryKey: ["sustainability-reports", farmId], queryFn: () => fetch(api(`farms/${farmId}/sustainability-reports`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/sustainability-reports`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sustainability-reports/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Sustainability Reports Submitted</h3><Button size="sm" onClick={() => { setForm({ submittedToCustomer: false }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Report</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "reportYear", label: "Year" }, { key: "reportTitle", label: "Title" }, { key: "supplyChainCustomer", label: "Customer" }, { key: "submittedToCustomer", label: "Submitted", fmt: r => r.submittedToCustomer ? "Yes" : "No" }, { key: "submissionDate", label: "Submission Date", fmt: r => fmtDate(r.submissionDate) }, { key: "customerReference", label: "Ref" }]} rows={reports as Record<string, unknown>[]} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Sustainability Report</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Report Year *</Label><Input type="number" value={String(form.reportYear ?? "")} onChange={e => setForm(f => ({ ...f, reportYear: e.target.value }))} /></div>
            <div><Label>Report Title *</Label><Input value={String(form.reportTitle ?? "")} onChange={e => setForm(f => ({ ...f, reportTitle: e.target.value }))} /></div>
            <div><Label>Generated Date *</Label><Input type="date" value={String(form.generatedDate ?? "")} onChange={e => setForm(f => ({ ...f, generatedDate: e.target.value }))} /></div>
            <div><Label>Supply Chain Customer</Label><Input value={String(form.supplyChainCustomer ?? "")} onChange={e => setForm(f => ({ ...f, supplyChainCustomer: e.target.value }))} /></div>
            <div className="flex items-center gap-2 col-span-2 mt-2"><Checkbox id="sub" checked={Boolean(form.submittedToCustomer)} onCheckedChange={v => setForm(f => ({ ...f, submittedToCustomer: Boolean(v) }))} /><Label htmlFor="sub">Submitted to customer?</Label></div>
            <div><Label>Submission Date</Label><Input type="date" value={String(form.submissionDate ?? "")} onChange={e => setForm(f => ({ ...f, submissionDate: e.target.value }))} /></div>
            <div><Label>Customer Reference</Label><Input value={String(form.customerReference ?? "")} onChange={e => setForm(f => ({ ...f, customerReference: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RenewableEnergyTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["renewable-energy", farmId], queryFn: () => fetch(api(`farms/${farmId}/renewable-energy-production`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/renewable-energy-production/${editing.id}`) : api(`farms/${farmId}/renewable-energy-production`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/renewable-energy-production/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] }) });
  const TECH_TYPES = ["Solar PV", "Wind Turbine", "Anaerobic Digestion (AD)", "Hydro", "Biomass Boiler", "Ground Source Heat Pump", "Air Source Heat Pump", "Other"];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Renewable Energy Production Log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record generation, self-consumption and export for all on-farm renewable systems — solar PV, wind turbines and anaerobic digestion. FIT/RO and export revenue tracked for financial reporting.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ productionYear: String(new Date().getFullYear()) }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "technologyType", label: "Technology" }, { key: "systemName", label: "System" }, { key: "periodStart", label: "Period", fmt: r => `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}` }, { key: "generationKwh", label: "Generated (kWh)" }, { key: "selfConsumedKwh", label: "Self-used (kWh)" }, { key: "exportedKwh", label: "Exported (kWh)" }, { key: "exportRevenueGbp", label: "Export Revenue" }, { key: "co2AvoidedTonnes", label: "CO₂ Avoided (t)" }]} rows={records as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Renewable Energy Production</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Technology Type *</Label>
              <Select value={form.technologyType ?? ""} onValueChange={v => setForm(f => ({ ...f, technologyType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{TECH_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>System Name</Label><Input placeholder="e.g. South Barn Solar Array" value={form.systemName ?? ""} onChange={e => setForm(f => ({ ...f, systemName: e.target.value }))} /></div>
            <div><Label>Production Year *</Label><Input type="number" value={form.productionYear ?? ""} onChange={e => setForm(f => ({ ...f, productionYear: e.target.value }))} /></div>
            <div><Label>Installed Capacity (kW)</Label><Input type="number" step="0.01" value={form.installedCapacityKw ?? ""} onChange={e => setForm(f => ({ ...f, installedCapacityKw: e.target.value }))} /></div>
            <div><Label>Period Start *</Label><Input type="date" value={form.periodStart ?? ""} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} /></div>
            <div><Label>Period End *</Label><Input type="date" value={form.periodEnd ?? ""} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} /></div>
            <div><Label>Generation (kWh) *</Label><Input type="number" step="0.01" value={form.generationKwh ?? ""} onChange={e => setForm(f => ({ ...f, generationKwh: e.target.value }))} /></div>
            <div><Label>Self-consumed (kWh)</Label><Input type="number" step="0.01" value={form.selfConsumedKwh ?? ""} onChange={e => setForm(f => ({ ...f, selfConsumedKwh: e.target.value }))} /></div>
            <div><Label>Exported (kWh)</Label><Input type="number" step="0.01" value={form.exportedKwh ?? ""} onChange={e => setForm(f => ({ ...f, exportedKwh: e.target.value }))} /></div>
            <div><Label>Export Tariff (p/kWh)</Label><Input type="number" step="0.01" value={form.exportTariffPencePerKwh ?? ""} onChange={e => setForm(f => ({ ...f, exportTariffPencePerKwh: e.target.value }))} /></div>
            <div><Label>Export Revenue (£)</Label><Input type="number" step="0.01" value={form.exportRevenueGbp ?? ""} onChange={e => setForm(f => ({ ...f, exportRevenueGbp: e.target.value }))} /></div>
            <div><Label>CO₂ Avoided (tonnes)</Label><Input type="number" step="0.001" value={form.co2AvoidedTonnes ?? ""} onChange={e => setForm(f => ({ ...f, co2AvoidedTonnes: e.target.value }))} /></div>
            <div><Label>FIT / RO Reference</Label><Input value={form.fitRocReference ?? ""} onChange={e => setForm(f => ({ ...f, fitRocReference: e.target.value }))} /></div>
            <div><Label>Meter Reading (Start)</Label><Input type="number" step="0.01" value={form.meterReadingStart ?? ""} onChange={e => setForm(f => ({ ...f, meterReadingStart: e.target.value }))} /></div>
            <div><Label>Meter Reading (End)</Label><Input type="number" step="0.01" value={form.meterReadingEnd ?? ""} onChange={e => setForm(f => ({ ...f, meterReadingEnd: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BngTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["bng", farmId], queryFn: () => fetch(api(`farms/${farmId}/biodiversity-net-gain`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/biodiversity-net-gain/${editing.id}`) : api(`farms/${farmId}/biodiversity-net-gain`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["bng", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/biodiversity-net-gain/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["bng", farmId] }) });
  const HABITATS = ["Arable Field Margins", "Deciduous Woodland", "Hedgerow", "Grassland (neutral)", "Grassland (calcareous)", "Grassland (acid)", "Heathland", "Bog / Mire", "Fen", "Wetland / Reed Bed", "Pond / Lake", "River / Stream", "Wildflower Meadow", "Woodland Edge", "Other"];
  const CONDITIONS = ["Distinctly sub-optimal", "Moderate", "Fairly good", "Good", "Excellent"];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Biodiversity Net Gain (BNG) Tracker</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record habitat baseline assessments and post-creation progress using Defra Metric 4.0. Mandatory 10% BNG is required for most new planning permissions from April 2024. Units scored per Defra's Biodiversity Metric.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ assessmentTool: "Defra Metric 4.0", recordType: "baseline", status: "active" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "assessmentDate", label: "Assessment Date", fmt: r => fmtDate(r.assessmentDate) }, { key: "habitatType", label: "Habitat Type" }, { key: "areaHa", label: "Area (ha)" }, { key: "baselineCondition", label: "Baseline Condition" }, { key: "targetCondition", label: "Target Condition" }, { key: "baselineUnits", label: "Baseline Units" }, { key: "targetUnits", label: "Target Units" }, { key: "netGainUnits", label: "Net Gain" }, { key: "recordType", label: "Type" }, { key: "status", label: "Status" }]} rows={records as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Biodiversity Net Gain Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate ?? ""} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Assessment Tool</Label><Input value={form.assessmentTool ?? "Defra Metric 4.0"} onChange={e => setForm(f => ({ ...f, assessmentTool: e.target.value }))} /></div>
            <div><Label>Assessor Name</Label><Input value={form.assessorName ?? ""} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
            <div><Label>Record Type</Label>
              <Select value={form.recordType ?? "baseline"} onValueChange={v => setForm(f => ({ ...f, recordType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["baseline", "post-creation", "annual-monitoring", "final-assessment"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Habitat Type *</Label>
              <Select value={form.habitatType ?? ""} onValueChange={v => setForm(f => ({ ...f, habitatType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select habitat" /></SelectTrigger>
                <SelectContent>{HABITATS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Area (ha) *</Label><Input type="number" step="0.0001" value={form.areaHa ?? ""} onChange={e => setForm(f => ({ ...f, areaHa: e.target.value }))} /></div>
            <div><Label>Baseline Condition *</Label>
              <Select value={form.baselineCondition ?? ""} onValueChange={v => setForm(f => ({ ...f, baselineCondition: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{Conditions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Target Condition</Label>
              <Select value={form.targetCondition ?? ""} onValueChange={v => setForm(f => ({ ...f, targetCondition: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{Conditions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Baseline Units</Label><Input type="number" step="0.001" value={form.baselineUnits ?? ""} onChange={e => setForm(f => ({ ...f, baselineUnits: e.target.value }))} /></div>
            <div><Label>Target Units</Label><Input type="number" step="0.001" value={form.targetUnits ?? ""} onChange={e => setForm(f => ({ ...f, targetUnits: e.target.value }))} /></div>
            <div><Label>Net Gain Units</Label><Input type="number" step="0.001" value={form.netGainUnits ?? ""} onChange={e => setForm(f => ({ ...f, netGainUnits: e.target.value }))} /></div>
            <div><Label>Management Commitment (years)</Label><Input type="number" value={form.managementCommitmentYears ?? ""} onChange={e => setForm(f => ({ ...f, managementCommitmentYears: e.target.value }))} /></div>
            <div><Label>Legal Agreement Type</Label><Input placeholder="e.g. Section 106, Conservation Covenant" value={form.legalAgreementType ?? ""} onChange={e => setForm(f => ({ ...f, legalAgreementType: e.target.value }))} /></div>
            <div><Label>Planning Reference</Label><Input value={form.planningReference ?? ""} onChange={e => setForm(f => ({ ...f, planningReference: e.target.value }))} /></div>
            <div><Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "completed", "monitoring", "lapsed"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Habitat Description</Label><Textarea value={form.habitatDescription ?? ""} onChange={e => setForm(f => ({ ...f, habitatDescription: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Conditions = ["Distinctly sub-optimal", "Moderate", "Fairly good", "Good", "Excellent"];

type Tab = "audits" | "emissions" | "sequestration" | "actions" | "reports" | "renewable" | "bng";

export default function CarbonPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("audits");
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Carbon & Sustainability">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "audits"} onClick={() => setTab("audits")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Carbon Audits</TabButton>
          <TabButton active={tab === "emissions"} onClick={() => setTab("emissions")}><Flame className="w-3.5 h-3.5 mr-1" />Emissions</TabButton>
          <TabButton active={tab === "sequestration"} onClick={() => setTab("sequestration")}><Trees className="w-3.5 h-3.5 mr-1" />Sequestration</TabButton>
          <TabButton active={tab === "actions"} onClick={() => setTab("actions")}><Zap className="w-3.5 h-3.5 mr-1" />Reduction Actions</TabButton>
          <TabButton active={tab === "renewable"} onClick={() => setTab("renewable")}><SunMedium className="w-3.5 h-3.5 mr-1" />Renewable Energy</TabButton>
          <TabButton active={tab === "bng"} onClick={() => setTab("bng")}><Sprout className="w-3.5 h-3.5 mr-1" />Biodiversity Net Gain</TabButton>
          <TabButton active={tab === "reports"} onClick={() => setTab("reports")}><FileBarChart className="w-3.5 h-3.5 mr-1" />Reports</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "audits" && <AuditsTab farmId={farmId} />}
          {tab === "emissions" && <EmissionsTab farmId={farmId} />}
          {tab === "sequestration" && <SequestrationTab farmId={farmId} />}
          {tab === "actions" && <ReductionActionsTab farmId={farmId} />}
          {tab === "renewable" && <RenewableEnergyTab farmId={farmId} />}
          {tab === "bng" && <BngTab farmId={farmId} />}
          {tab === "reports" && <ReportsTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
