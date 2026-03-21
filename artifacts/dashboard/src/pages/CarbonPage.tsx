import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, BarChart3, Flame, Trees, Zap, FileBarChart } from "lucide-react";
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete) && <th />}</tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} className="border-b last:border-0">
            {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
            {(onEdit || onDelete) && <td className="py-2 text-right space-x-1">
              {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
              {onDelete && <Button size="icon" variant="ghost" onClick={() => onDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
            </td>}
          </tr>
        ))}</tbody>
      </table>
    </div>
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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Carbon Audits</h3><Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Audit</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "auditYear", label: "Year" }, { key: "auditDate", label: "Audit Date", fmt: r => fmtDate(r.auditDate) }, { key: "conductedBy", label: "Conducted By" }, { key: "auditTool", label: "Audit Tool" }, { key: "totalTonnesCo2e", label: "Total tCO₂e" }, { key: "netTonnesCo2e", label: "Net tCO₂e" }, { key: "supplyChainRequirement", label: "Supply Chain" }]} rows={audits as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
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
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "emissionYear", label: "Year" }, { key: "category", label: "Category" }, { key: "subcategory", label: "Sub-category" }, { key: "activityDescription", label: "Activity" }, { key: "quantity", label: "Quantity" }, { key: "unit", label: "Unit" }, { key: "tonnesCo2e", label: "tCO₂e" }, { key: "scope", label: "Scope" }]} rows={records as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
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
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "sequestrationYear", label: "Year" }, { key: "featureType", label: "Feature Type" }, { key: "featureName", label: "Feature" }, { key: "areaHaOrLengthM", label: "Area/Length" }, { key: "unit", label: "Unit" }, { key: "tonnesCo2eSequestered", label: "tCO₂e Sequestered" }]} rows={records as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
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
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "actionTitle", label: "Action" }, { key: "category", label: "Category" }, { key: "targetReductionTonnesCo2e", label: "Target tCO₂e" }, { key: "status", label: "Status" }, { key: "plannedCompletionDate", label: "Target Date", fmt: r => fmtDate(r.plannedCompletionDate) }, { key: "responsiblePerson", label: "Responsible" }]} rows={actions as Record<string, unknown>[]} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
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
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "reportYear", label: "Year" }, { key: "reportTitle", label: "Title" }, { key: "supplyChainCustomer", label: "Customer" }, { key: "submittedToCustomer", label: "Submitted", fmt: r => r.submittedToCustomer ? "Yes" : "No" }, { key: "submissionDate", label: "Submission Date", fmt: r => fmtDate(r.submissionDate) }, { key: "customerReference", label: "Ref" }]} rows={reports as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
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

type Tab = "audits" | "emissions" | "sequestration" | "actions" | "reports";

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
          <TabButton active={tab === "reports"} onClick={() => setTab("reports")}><FileBarChart className="w-3.5 h-3.5 mr-1" />Reports</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "audits" && <AuditsTab farmId={farmId} />}
          {tab === "emissions" && <EmissionsTab farmId={farmId} />}
          {tab === "sequestration" && <SequestrationTab farmId={farmId} />}
          {tab === "actions" && <ReductionActionsTab farmId={farmId} />}
          {tab === "reports" && <ReportsTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
