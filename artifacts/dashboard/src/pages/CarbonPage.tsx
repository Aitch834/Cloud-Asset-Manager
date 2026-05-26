import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Pencil, Trash2, Loader2, BarChart3, Flame, Trees, Zap, FileBarChart, SunMedium, Sprout, Upload } from "lucide-react";
import { FctImportDialog } from "@/components/FctImportDialog";
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
function DataTable({ cols, rows, onEdit, onDelete, onView }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView) && <td className="py-2 text-right space-x-1">
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

function AuditsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
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
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Carbon Audits</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-1" />Import from FCT
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Audit
          </Button>
        </div>
      </div>
      <FctImportDialog open={showImport} farmId={farmId} onClose={() => setShowImport(false)} />

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

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "auditYear", label: "Year" }, { key: "auditDate", label: "Audit Date", fmt: r => fmtDate(r.auditDate) }, { key: "conductedBy", label: "Conducted By" }, { key: "auditTool", label: "Audit Tool" }, { key: "totalTonnesCo2e", label: "Total tCO₂e" }, { key: "netTonnesCo2e", label: "Net tCO₂e" }, { key: "supplyChainRequirement", label: "Supply Chain" }]} rows={audits as Record<string, unknown>[]} onView={setViewRecord} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => del.mutate(r.id as number)} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Carbon Audit</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Audit Year</p><p className="font-medium">{String(viewRecord.auditYear ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Audit Date</p><p className="font-medium">{fmtDate(viewRecord.auditDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conducted By</p><p className="font-medium">{String(viewRecord.conductedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Audit Tool / Methodology</p><p className="font-medium">{String(viewRecord.auditTool ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supply Chain Customer</p><p className="font-medium">{String(viewRecord.supplyChainRequirement ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Body</p><p className="font-medium">{String(viewRecord.certificationBody ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope 1 tCO₂e</p><p className="font-medium">{String(viewRecord.totalScope1TonnesCo2e ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope 2 tCO₂e</p><p className="font-medium">{String(viewRecord.totalScope2TonnesCo2e ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope 3 tCO₂e</p><p className="font-medium">{String(viewRecord.totalScope3TonnesCo2e ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total tCO₂e</p><p className="font-medium">{String(viewRecord.totalTonnesCo2e ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sequestration tCO₂e</p><p className="font-medium">{String(viewRecord.sequestrationTonnesCo2e ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net tCO₂e</p><p className="font-medium">{String(viewRecord.netTonnesCo2e ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reduction Target (%)</p><p className="font-medium">{String(viewRecord.reductionTargetPct ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { 
                setEditing(viewRecord); 
                setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v == null ? "" : String(v)]))); 
                setOpen(true); 
                setViewRecord(null); 
              }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Carbon Audit</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Audit Year *</Label>
              <Select value={form.auditYear ?? ""} onValueChange={v => setForm(f => ({ ...f, auditYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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

// ── Emissions taxonomy with DEFRA 2024 indicative conversion factors ──────────
const EM_YEARS = Array.from(
  { length: new Date().getFullYear() - 2014 },
  (_, i) => String(new Date().getFullYear() + 1 - i),
);

const EM_FACTOR_SOURCES = [
  "DEFRA UK GHG Conversion Factors 2024",
  "DEFRA UK GHG Conversion Factors 2023",
  "IPCC 2019 Guidelines",
  "AHDB Carbon Calculator",
  "Agrecalc",
  "Cool Farm Tool",
  "Other / manual",
];

type EmSubcat = { label: string; unit: string; factor?: number };
type EmCatDef = { scope: string; subcategories: EmSubcat[] };

const EMISSION_TAXONOMY: Record<string, EmCatDef> = {
  "Fuel & Energy": {
    scope: "Scope 1",
    subcategories: [
      { label: "Red diesel (Gas oil)",      unit: "litres",    factor: 0.002557 },
      { label: "White diesel (DERV)",       unit: "litres",    factor: 0.002542 },
      { label: "Petrol",                    unit: "litres",    factor: 0.002154 },
      { label: "LPG",                       unit: "litres",    factor: 0.001566 },
      { label: "Natural gas",               unit: "kWh",       factor: 0.000183 },
      { label: "Kerosene (heating)",        unit: "litres",    factor: 0.002530 },
      { label: "Grid electricity (Scope 2)", unit: "kWh",      factor: 0.000207 },
      { label: "Biogas / biomethane",       unit: "kWh",       factor: 0.000010 },
    ],
  },
  "Livestock Enteric Fermentation": {
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows",   unit: "head·year", factor: 1.90  },
      { label: "Beef cattle",  unit: "head·year", factor: 1.20  },
      { label: "Sheep",        unit: "head·year", factor: 0.083 },
      { label: "Pigs",         unit: "head·year", factor: 0.035 },
      { label: "Poultry",      unit: "head·year", factor: 0.001 },
    ],
  },
  "Livestock Manure": {
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows",            unit: "head·year", factor: 0.960  },
      { label: "Beef cattle",           unit: "head·year", factor: 0.460  },
      { label: "Sheep",                 unit: "head·year", factor: 0.032  },
      { label: "Pigs",                  unit: "head·year", factor: 0.420  },
      { label: "Poultry (broilers)",    unit: "head·year", factor: 0.006  },
      { label: "Cattle slurry storage", unit: "m³",        factor: 0.0015 },
    ],
  },
  "Soil & Fertiliser N₂O": {
    scope: "Scope 1",
    subcategories: [
      { label: "Synthetic N fertiliser — direct N₂O",     unit: "kg N", factor: 0.00440 },
      { label: "Organic N (slurry/FYM) — direct N₂O",    unit: "kg N", factor: 0.00220 },
      { label: "Crop residues — direct N₂O",              unit: "kg N", factor: 0.00220 },
      { label: "Indirect N₂O (leaching & run-off)",       unit: "kg N", factor: 0.00075 },
    ],
  },
  "Land Use Change": {
    scope: "Scope 1",
    subcategories: [
      { label: "Peat drainage — arable",    unit: "ha", factor: 10.50 },
      { label: "Peat drainage — grassland", unit: "ha", factor:  7.00 },
      { label: "Deforestation",             unit: "ha", factor: 55.00 },
    ],
  },
  "Purchased Inputs": {
    scope: "Scope 3",
    subcategories: [
      { label: "Synthetic N fertiliser (manufacture)", unit: "kg",      factor: 0.00448 },
      { label: "Compound fertiliser (manufacture)",    unit: "kg",      factor: 0.00200 },
      { label: "Pesticides / agrochemicals",           unit: "kg a.i.", factor: 0.00850 },
      { label: "Purchased animal feed",                unit: "tonne",   factor: 0.45    },
      { label: "Lime / ground limestone",              unit: "tonne",   factor: 0.140   },
      { label: "Plastic film & packaging",             unit: "kg",      factor: 0.00320 },
    ],
  },
  "Transport": {
    scope: "Scope 3",
    subcategories: [
      { label: "Road haulage — HGV",         unit: "tonne·km", factor: 0.0000820 },
      { label: "Road haulage — rigid lorry", unit: "tonne·km", factor: 0.0001100 },
      { label: "Employee car travel",        unit: "km",        factor: 0.0001700 },
      { label: "Air freight",                unit: "tonne·km", factor: 0.0006020 },
    ],
  },
  "Buildings & Infrastructure": {
    scope: "Scope 3",
    subcategories: [
      { label: "Concrete (embodied carbon)",   unit: "tonne", factor: 0.1070 },
      { label: "Steel (embodied carbon)",      unit: "tonne", factor: 1.770  },
      { label: "Timber (embodied carbon)",     unit: "m³",    factor: 0.0580 },
      { label: "Refrigerant leak — HFC-134a", unit: "kg",    factor: 1.300  },
      { label: "Refrigerant leak — R410A",    unit: "kg",    factor: 2.088  },
    ],
  },
  "Other": {
    scope: "Scope 3",
    subcategories: [
      { label: "Waste to landfill",    unit: "tonne", factor: 0.4670   },
      { label: "Water consumption",    unit: "m³",    factor: 0.000149 },
      { label: "Other (manual entry)", unit: "unit"                    },
    ],
  },
};

function EmissionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["carbon-emissions", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/carbon-emissions`), { credentials: "include" }).then(r => r.json()),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/carbon-emissions`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] }); setOpen(false); setForm({}); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-emissions/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] }),
  });

  const catDef = form.category ? EMISSION_TAXONOMY[form.category] : null;
  const subcatDef = catDef?.subcategories.find(s => s.label === form.subcategory) ?? null;
  const calcCo2e = subcatDef?.factor != null && form.quantity
    ? (parseFloat(form.quantity) * subcatDef.factor).toFixed(4)
    : null;

  const handleCategoryChange = (v: string) => {
    const def = EMISSION_TAXONOMY[v];
    setForm(f => ({ ...f, category: v, subcategory: "", unit: "", scope: def?.scope ?? "", tonnesCo2e: "" }));
  };

  const handleSubcategoryChange = (v: string) => {
    const def = catDef?.subcategories.find(s => s.label === v);
    const newScope = v.includes("Scope 2") ? "Scope 2" : (catDef?.scope ?? "");
    setForm(f => {
      const qty = parseFloat(f.quantity);
      const co2e = def?.factor != null && !isNaN(qty) ? (qty * def.factor).toFixed(4) : f.tonnesCo2e;
      return { ...f, subcategory: v, unit: def?.unit ?? "", scope: newScope, tonnesCo2e: co2e };
    });
  };

  const handleQuantityChange = (v: string) => {
    setForm(f => {
      const qty = parseFloat(v);
      const factor = catDef?.subcategories.find(s => s.label === f.subcategory)?.factor;
      const co2e = factor != null && !isNaN(qty) ? (qty * factor).toFixed(4) : f.tonnesCo2e;
      return { ...f, quantity: v, tonnesCo2e: co2e };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Emissions Records</h3>
        <Button size="sm" onClick={() => { setForm({}); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Record
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "emissionYear", label: "Year" },
            { key: "scope", label: "Scope" },
            { key: "category", label: "Category" },
            { key: "subcategory", label: "Sub-category" },
            { key: "activityDescription", label: "Activity" },
            { key: "quantity", label: "Qty" },
            { key: "unit", label: "Unit" },
            { key: "tonnesCo2e", label: "tCO₂e" },
          ]}
          rows={records as Record<string, unknown>[]}
          onView={setViewRecord}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Emissions Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Year</p><p className="font-medium">{String(viewRecord.emissionYear ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope</p><p className="font-medium">{String(viewRecord.scope ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{String(viewRecord.category ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sub-category</p><p className="font-medium">{String(viewRecord.subcategory ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Activity Description</p><p className="font-medium">{String(viewRecord.activityDescription ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p><p className="font-medium">{String(viewRecord.quantity ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p><p className="font-medium">{String(viewRecord.unit ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Emission Factor Source</p><p className="font-medium">{String(viewRecord.emissionFactorSource ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">tCO₂e</p><p className="font-medium">{String(viewRecord.tonnesCo2e ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Emissions Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            {/* Year — dropdown */}
            <div>
              <Label>Year *</Label>
              <Select value={form.emissionYear ?? ""} onValueChange={v => setForm(f => ({ ...f, emissionYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Scope — read-only, driven by category */}
            <div>
              <Label>Scope</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm gap-2">
                {form.scope
                  ? <><span className="font-medium">{form.scope}</span><span className="text-xs text-muted-foreground ml-1">(set from category)</span></>
                  : <span className="text-muted-foreground italic">Select a category first</span>}
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Select value={form.category ?? ""} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(EMISSION_TAXONOMY).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-category — cascading from category */}
            <div>
              <Label>Sub-category</Label>
              <Select value={form.subcategory ?? ""} onValueChange={handleSubcategoryChange} disabled={!catDef}>
                <SelectTrigger>
                  <SelectValue placeholder={catDef ? "Select sub-category" : "Select a category first"} />
                </SelectTrigger>
                <SelectContent>
                  {catDef?.subcategories.map(s => <SelectItem key={s.label} value={s.label}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Activity description */}
            <div className="col-span-2">
              <Label>Activity Description *</Label>
              <Input
                value={form.activityDescription ?? ""}
                onChange={e => setForm(f => ({ ...f, activityDescription: e.target.value }))}
                placeholder="e.g. Tractor fleet — mixed arable operations 2024"
              />
            </div>

            {/* Quantity */}
            <div>
              <Label>Quantity</Label>
              <Input type="number" step="0.001" value={form.quantity ?? ""} onChange={e => handleQuantityChange(e.target.value)} placeholder="0.000" />
            </div>

            {/* Unit — auto-filled from sub-category */}
            <div>
              <Label>Unit</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm">
                {form.unit
                  ? <span className="font-medium">{form.unit}</span>
                  : <span className="text-muted-foreground italic">Set by sub-category</span>}
              </div>
            </div>

            {/* Emission Factor Source — dropdown */}
            <div>
              <Label>Emission Factor Source</Label>
              <Select value={form.emissionFactorSource ?? ""} onValueChange={v => setForm(f => ({ ...f, emissionFactorSource: v }))}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>{EM_FACTOR_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* tCO₂e — auto-calculated, manually overridable */}
            <div>
              <Label>tCO₂e *</Label>
              <Input
                type="number"
                step="0.0001"
                value={form.tonnesCo2e ?? ""}
                onChange={e => setForm(f => ({ ...f, tonnesCo2e: e.target.value }))}
                placeholder="0.0000"
              />
              {calcCo2e && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Indicative: {calcCo2e} tCO₂e (qty × DEFRA 2024 factor)
                  {form.tonnesCo2e && form.tonnesCo2e !== calcCo2e && (
                    <button
                      type="button"
                      className="ml-1 text-primary underline"
                      onClick={() => setForm(f => ({ ...f, tonnesCo2e: calcCo2e }))}
                    >
                      use this
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sequestration feature types with indicative annual sequestration factors
const SEQ_FEATURES: Record<string, { unit: string; factorTco2ePerUnit?: number }> = {
  "Woodland":            { unit: "ha",  factorTco2ePerUnit: 3.50 },
  "Hedgerow":            { unit: "km",  factorTco2ePerUnit: 0.34 },
  "Peatland":            { unit: "ha",  factorTco2ePerUnit: 5.50 },
  "Permanent Grassland": { unit: "ha",  factorTco2ePerUnit: 0.50 },
  "Wildflower Meadow":   { unit: "ha",  factorTco2ePerUnit: 0.30 },
  "Riparian Buffer":     { unit: "ha",  factorTco2ePerUnit: 1.20 },
  "Agroforestry":        { unit: "ha",  factorTco2ePerUnit: 1.50 },
  "Other":               { unit: "ha" },
};

const SEQ_FACTOR_SOURCES = [...EM_FACTOR_SOURCES, "Woodland Carbon Code", "Peatland Code"];

function SequestrationTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["carbon-seq", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/carbon-sequestration`), { credentials: "include" }).then(r => r.json()),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/carbon-sequestration`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] }); setOpen(false); setForm({}); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-sequestration/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] }),
  });

  const featDef = form.featureType ? SEQ_FEATURES[form.featureType] : null;
  const calcSeq = featDef?.factorTco2ePerUnit != null && form.areaHaOrLengthM
    ? (parseFloat(form.areaHaOrLengthM) * featDef.factorTco2ePerUnit).toFixed(3)
    : null;

  const handleFeatureTypeChange = (v: string) => {
    const def = SEQ_FEATURES[v];
    setForm(f => {
      const qty = parseFloat(f.areaHaOrLengthM);
      const seq = def?.factorTco2ePerUnit != null && !isNaN(qty) ? (qty * def.factorTco2ePerUnit).toFixed(3) : f.tonnesCo2eSequestered;
      return { ...f, featureType: v, unit: def?.unit ?? "ha", tonnesCo2eSequestered: seq };
    });
  };

  const handleAreaChange = (v: string) => {
    setForm(f => {
      const qty = parseFloat(v);
      const factor = featDef?.factorTco2ePerUnit;
      const seq = factor != null && !isNaN(qty) ? (qty * factor).toFixed(3) : f.tonnesCo2eSequestered;
      return { ...f, areaHaOrLengthM: v, tonnesCo2eSequestered: seq };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Carbon Sequestration</h3>
        <Button size="sm" onClick={() => { setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable cols={[
          { key: "sequestrationYear", label: "Year" },
          { key: "featureType", label: "Feature Type" },
          { key: "featureName", label: "Feature" },
          { key: "areaHaOrLengthM", label: "Area/Length" },
          { key: "unit", label: "Unit" },
          { key: "tonnesCo2eSequestered", label: "tCO₂e Sequestered" },
        ]} rows={records as Record<string, unknown>[]} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Sequestration Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Year</p><p className="font-medium">{String(viewRecord.sequestrationYear ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feature Type</p><p className="font-medium">{String(viewRecord.featureType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feature Name</p><p className="font-medium">{String(viewRecord.featureName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Area/Length</p><p className="font-medium">{String(viewRecord.areaHaOrLengthM ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p><p className="font-medium">{String(viewRecord.unit ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">tCO₂e Sequestered</p><p className="font-medium">{String(viewRecord.tonnesCo2eSequestered ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Sequestration Factor Source</p><p className="font-medium">{String(viewRecord.sequestrationFactorSource ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Sequestration Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            {/* Year */}
            <div>
              <Label>Year *</Label>
              <Select value={form.sequestrationYear ?? ""} onValueChange={v => setForm(f => ({ ...f, sequestrationYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Feature Type — drives unit and calculation */}
            <div>
              <Label>Feature Type *</Label>
              <Select value={form.featureType ?? ""} onValueChange={handleFeatureTypeChange}>
                <SelectTrigger><SelectValue placeholder="Select feature" /></SelectTrigger>
                <SelectContent>{Object.keys(SEQ_FEATURES).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Feature Name */}
            <div className="col-span-2">
              <Label>Feature Name</Label>
              <Input value={form.featureName ?? ""} onChange={e => setForm(f => ({ ...f, featureName: e.target.value }))} placeholder="e.g. North Wood, Boundary Hedge A" />
            </div>

            {/* Area / Length — triggers auto-calc */}
            <div>
              <Label>Area / Length</Label>
              <Input type="number" step="0.001" value={form.areaHaOrLengthM ?? ""} onChange={e => handleAreaChange(e.target.value)} placeholder="0.000" />
            </div>

            {/* Unit — auto-filled from feature type */}
            <div>
              <Label>Unit</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm">
                {form.unit ? <span className="font-medium">{form.unit}</span> : <span className="text-muted-foreground italic">Set by feature type</span>}
              </div>
            </div>

            {/* tCO₂e Sequestered — auto-calculated, overridable */}
            <div>
              <Label>tCO₂e Sequestered *</Label>
              <Input
                type="number"
                step="0.001"
                value={form.tonnesCo2eSequestered ?? ""}
                onChange={e => setForm(f => ({ ...f, tonnesCo2eSequestered: e.target.value }))}
                placeholder="0.000"
              />
              {calcSeq && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Indicative: {calcSeq} tCO₂e (area × WCC/DEFRA factor)
                  {form.tonnesCo2eSequestered && form.tonnesCo2eSequestered !== calcSeq && (
                    <button type="button" className="ml-1 text-primary underline" onClick={() => setForm(f => ({ ...f, tonnesCo2eSequestered: calcSeq }))}>use this</button>
                  )}
                </p>
              )}
            </div>

            {/* Sequestration Factor Source — dropdown */}
            <div>
              <Label>Sequestration Factor Source</Label>
              <Select value={form.sequestrationFactorSource ?? ""} onValueChange={v => setForm(f => ({ ...f, sequestrationFactorSource: v }))}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>{SEQ_FACTOR_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReductionActionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: actions = [], isLoading } = useQuery({ queryKey: ["carbon-actions", farmId], queryFn: () => fetch(api(`farms/${farmId}/carbon-reduction-actions`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/carbon-reduction-actions/${editing.id}`) : api(`farms/${farmId}/carbon-reduction-actions`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-reduction-actions/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Carbon Reduction Actions</h3><Button size="sm" onClick={() => { setEditing(null); setForm({ status: "planned" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Action</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "actionTitle", label: "Action" }, { key: "category", label: "Category" }, { key: "targetReductionTonnesCo2e", label: "Target tCO₂e" }, { key: "status", label: "Status", fmt: r => String(r.status ?? "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) }, { key: "plannedCompletionDate", label: "Target Date", fmt: r => fmtDate(r.plannedCompletionDate) }, { key: "responsiblePerson", label: "Responsible" }]} rows={actions as Record<string, unknown>[]} onView={setViewRecord} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => del.mutate(r.id as number)} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Reduction Action</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Title</p><p className="font-medium">{String(viewRecord.actionTitle ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{String(viewRecord.category ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium text-capitalize">{String(viewRecord.status ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Reduction (tCO₂e)</p><p className="font-medium">{String(viewRecord.targetReductionTonnesCo2e ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Responsible Person</p><p className="font-medium">{String(viewRecord.responsiblePerson ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Planned Start</p><p className="font-medium">{fmtDate(viewRecord.plannedStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Planned Completion</p><p className="font-medium">{fmtDate(viewRecord.plannedCompletionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated Cost (£)</p><p className="font-medium">{String(viewRecord.estimatedCost ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Funding Source</p><p className="font-medium">{String(viewRecord.fundingSource ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p><p className="font-medium">{String(viewRecord.description ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { 
                setEditing(viewRecord); 
                setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v == null ? "" : String(v)]))); 
                setOpen(true); 
                setViewRecord(null); 
              }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                <SelectContent>
                  {[{ v: "planned", l: "Planned" }, { v: "in-progress", l: "In Progress" }, { v: "completed", l: "Completed" }, { v: "cancelled", l: "Cancelled" }].map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                </SelectContent>
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
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: reports = [], isLoading } = useQuery({ queryKey: ["sustainability-reports", farmId], queryFn: () => fetch(api(`farms/${farmId}/sustainability-reports`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/sustainability-reports`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sustainability-reports/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Sustainability Reports Submitted</h3><Button size="sm" onClick={() => { setForm({ submittedToCustomer: false }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Report</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "reportYear", label: "Year" }, { key: "reportTitle", label: "Title" }, { key: "supplyChainCustomer", label: "Customer" }, { key: "submittedToCustomer", label: "Submitted", fmt: r => r.submittedToCustomer ? "Yes" : "No" }, { key: "submissionDate", label: "Submission Date", fmt: r => fmtDate(r.submissionDate) }, { key: "customerReference", label: "Ref" }]} rows={reports as Record<string, unknown>[]} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />}
      
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Sustainability Report</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Report Year</p><p className="font-medium">{String(viewRecord.reportYear ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Report Title</p><p className="font-medium">{String(viewRecord.reportTitle ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supply Chain Customer</p><p className="font-medium">{String(viewRecord.supplyChainCustomer ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted to Customer</p><p className="font-medium">{viewRecord.submittedToCustomer ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submission Date</p><p className="font-medium">{fmtDate(viewRecord.submissionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Reference</p><p className="font-medium">{String(viewRecord.customerReference ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Report URL / Storage Link</p><p className="font-medium">{String(viewRecord.reportUrl ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Sustainability Report</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Report Year *</Label>
              <Select value={String(form.reportYear ?? "")} onValueChange={v => setForm(f => ({ ...f, reportYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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

const TECH_TYPE_MAP: Record<string, string> = {
  solar_pv: "Solar PV", wind_turbine: "Wind Turbine", hydro: "Hydro",
  biomass_boiler: "Biomass Boiler", anaerobic_digester: "Anaerobic Digestion (AD)",
  ground_source_heat_pump: "Ground Source Heat Pump", air_source_heat_pump: "Air Source Heat Pump",
  other: "Other",
};
const UK_GRID_KG_CO2E_PER_KWH = 0.207;

function RenewableEnergyTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ time: string; created: number } | null>(null);
  const hasSyncedRef = useRef(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["renewable-energy", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/renewable-energy-production`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
  });
  const { data: installations = [], isLoading: instLoading } = useQuery({
    queryKey: ["solar-installations", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/solar-installations`), { credentials: "include" }).then(r => r.json()).then(d => Array.isArray(d) ? d : (d.records ?? [])),
  });
  const { data: generationReadings = [], isLoading: genLoading } = useQuery({
    queryKey: ["solar-generation", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/solar-generation`), { credentials: "include" }).then(r => r.json()).then(d => Array.isArray(d) ? d : (d.records ?? [])),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/renewable-energy-production/${editing.id}`) : api(`farms/${farmId}/renewable-energy-production`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/renewable-energy-production/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] }),
  });

  const doSync = async (force = false) => {
    if (!installations.length && !generationReadings.length) { setSyncStatus({ time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), created: 0 }); return; }
    setSyncing(true);
    let created = 0;
    try {
      type InstRow = { id: number; installationName: string; technologyType: string; installedCapacityKw?: number; tariffRatePence?: number; fitOrSegContractRef?: string };
      type GenRow = { id: number; installationId: number; readingDate: string; generationKwh?: number; exportKwh?: number; selfConsumedKwh?: number; fitPaymentAmount?: number };
      type CarbonRow = { systemName?: string; productionYear?: number | string };

      const instMap = new Map<number, InstRow>();
      (installations as InstRow[]).forEach(i => instMap.set(i.id, i));

      type Group = { installationId: number; year: number; readings: GenRow[] };
      const groups = new Map<string, Group>();
      (generationReadings as GenRow[]).forEach(g => {
        if (!g.readingDate) return;
        const year = new Date(g.readingDate).getFullYear();
        const key = `${g.installationId}_${year}`;
        if (!groups.has(key)) groups.set(key, { installationId: g.installationId, year, readings: [] });
        groups.get(key)!.readings.push(g);
      });

      const existingKeys = new Set(
        (records as CarbonRow[]).map(r => `${String(r.systemName ?? "").trim().toLowerCase()}_${r.productionYear}`)
      );

      for (const { installationId, year, readings } of groups.values()) {
        const inst = instMap.get(installationId);
        if (!inst) continue;
        const existKey = `${inst.installationName.trim().toLowerCase()}_${year}`;
        if (!force && existingKeys.has(existKey)) continue;

        const totalGen = readings.reduce((s, r) => s + (Number(r.generationKwh) || 0), 0);
        const totalExport = readings.reduce((s, r) => s + (Number(r.exportKwh) || 0), 0);
        const totalSelf = readings.reduce((s, r) => s + (Number(r.selfConsumedKwh) || 0), 0);
        const totalRevenue = readings.reduce((s, r) => s + (Number(r.fitPaymentAmount) || 0), 0);
        const co2Avoided = parseFloat(((totalGen * UK_GRID_KG_CO2E_PER_KWH) / 1000).toFixed(3));
        const dates = readings.map(r => r.readingDate).sort();
        const periodStart = `${year}-01-01`;
        const periodEnd = `${year}-12-31`;

        await fetch(api(`farms/${farmId}/renewable-energy-production`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            technologyType: TECH_TYPE_MAP[inst.technologyType] ?? "Other",
            systemName: inst.installationName,
            productionYear: year,
            installedCapacityKw: inst.installedCapacityKw ?? null,
            periodStart,
            periodEnd,
            generationKwh: totalGen || null,
            selfConsumedKwh: totalSelf || null,
            exportedKwh: totalExport || null,
            exportTariffPencePerKwh: inst.tariffRatePence ?? null,
            exportRevenueGbp: totalRevenue ? parseFloat((totalRevenue / 100).toFixed(2)) : null,
            co2AvoidedTonnes: co2Avoided || null,
            fitRocReference: inst.fitOrSegContractRef ?? null,
            meterReadingStart: null,
            meterReadingEnd: null,
            notes: `Auto-synced from Fuel & Energy (${readings.length} reading${readings.length !== 1 ? "s" : ""}, ${dates[0]} – ${dates[dates.length - 1]})`,
          }),
        });
        created++;
      }

      if (created > 0) qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] });
      setSyncStatus({ time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), created });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!hasSyncedRef.current && !isLoading && !instLoading && !genLoading) {
      hasSyncedRef.current = true;
      doSync(false);
    }
  }, [isLoading, instLoading, genLoading]);

  const TECH_TYPES = ["Solar PV", "Wind Turbine", "Anaerobic Digestion (AD)", "Hydro", "Biomass Boiler", "Ground Source Heat Pump", "Air Source Heat Pump", "Other"];

  const calcCo2Avoided = form.generationKwh
    ? ((parseFloat(form.generationKwh) * UK_GRID_KG_CO2E_PER_KWH) / 1000).toFixed(3)
    : null;
  const calcExportRevenue = form.exportedKwh && form.exportTariffPencePerKwh
    ? ((parseFloat(form.exportedKwh) * parseFloat(form.exportTariffPencePerKwh)) / 100).toFixed(2)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Renewable Energy Production Log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Auto-synced from Fuel &amp; Energy. Generation, self-consumption and export from all on-farm renewables. CO₂ avoided calculated using the BEIS UK grid factor (0.207 kgCO₂e/kWh).</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ productionYear: String(new Date().getFullYear()) }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Manual Record</Button>
      </div>

      <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-xs text-green-800">
        {syncing ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /><span>Syncing from Fuel &amp; Energy…</span></>
        ) : syncStatus ? (
          <>
            <SunMedium className="w-3.5 h-3.5 shrink-0 text-green-600" />
            <span className="flex-1">
              {syncStatus.created > 0
                ? <><strong>{syncStatus.created} new record{syncStatus.created !== 1 ? "s" : ""}</strong> pulled from Fuel &amp; Energy · {syncStatus.time}</>
                : <>Up to date · last checked {syncStatus.time}</>}
            </span>
            <button className="underline text-green-700 hover:text-green-900" onClick={() => { hasSyncedRef.current = false; doSync(false); }}>Re-sync</button>
          </>
        ) : (
          <><SunMedium className="w-3.5 h-3.5 shrink-0" /><span>Checking Fuel &amp; Energy for new generation data…</span></>
        )}
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "technologyType", label: "Technology" },
            { key: "systemName", label: "System" },
            { key: "productionYear", label: "Year" },
            { key: "periodStart", label: "Period", fmt: r => `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}` },
            { key: "generationKwh", label: "Generated (kWh)" },
            { key: "selfConsumedKwh", label: "Self-used (kWh)" },
            { key: "exportedKwh", label: "Exported (kWh)" },
            { key: "exportRevenueGbp", label: "Export Revenue (£)" },
            { key: "co2AvoidedTonnes", label: "CO₂ Avoided (t)" },
          ]}
          rows={records as Record<string, unknown>[]}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

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
            <div><Label>Production Year *</Label>
              <Select value={form.productionYear ?? ""} onValueChange={v => setForm(f => ({ ...f, productionYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Installed Capacity (kW)</Label><Input type="number" step="0.01" value={form.installedCapacityKw ?? ""} onChange={e => setForm(f => ({ ...f, installedCapacityKw: e.target.value }))} /></div>
            <div><Label>Period Start *</Label><Input type="date" value={form.periodStart ?? ""} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} /></div>
            <div><Label>Period End *</Label><Input type="date" value={form.periodEnd ?? ""} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} /></div>
            <div>
              <Label>Generation (kWh) *</Label>
              <Input type="number" step="0.01" value={form.generationKwh ?? ""} onChange={e => {
                const gen = parseFloat(e.target.value);
                const co2 = !isNaN(gen) ? ((gen * UK_GRID_KG_CO2E_PER_KWH) / 1000).toFixed(3) : form.co2AvoidedTonnes;
                setForm(f => ({ ...f, generationKwh: e.target.value, co2AvoidedTonnes: co2 }));
              }} />
            </div>
            <div><Label>Self-consumed (kWh)</Label><Input type="number" step="0.01" value={form.selfConsumedKwh ?? ""} onChange={e => setForm(f => ({ ...f, selfConsumedKwh: e.target.value }))} /></div>
            <div>
              <Label>Exported (kWh)</Label>
              <Input type="number" step="0.01" value={form.exportedKwh ?? ""} onChange={e => {
                const exp = parseFloat(e.target.value);
                const tariff = parseFloat(form.exportTariffPencePerKwh ?? "");
                const rev = !isNaN(exp) && !isNaN(tariff) ? ((exp * tariff) / 100).toFixed(2) : form.exportRevenueGbp;
                setForm(f => ({ ...f, exportedKwh: e.target.value, exportRevenueGbp: rev }));
              }} />
            </div>
            <div>
              <Label>Export Tariff (p/kWh)</Label>
              <Input type="number" step="0.01" value={form.exportTariffPencePerKwh ?? ""} onChange={e => {
                const tariff = parseFloat(e.target.value);
                const exp = parseFloat(form.exportedKwh ?? "");
                const rev = !isNaN(tariff) && !isNaN(exp) ? ((exp * tariff) / 100).toFixed(2) : form.exportRevenueGbp;
                setForm(f => ({ ...f, exportTariffPencePerKwh: e.target.value, exportRevenueGbp: rev }));
              }} />
            </div>
            <div>
              <Label>Export Revenue (£)</Label>
              <Input type="number" step="0.01" value={form.exportRevenueGbp ?? ""} onChange={e => setForm(f => ({ ...f, exportRevenueGbp: e.target.value }))} />
              {calcExportRevenue && form.exportRevenueGbp !== calcExportRevenue && (
                <p className="text-xs text-muted-foreground mt-0.5">Calculated: £{calcExportRevenue} (exported kWh × tariff)
                  <button type="button" className="ml-1 text-primary underline" onClick={() => setForm(f => ({ ...f, exportRevenueGbp: calcExportRevenue }))}>use this</button>
                </p>
              )}
            </div>
            <div>
              <Label>CO₂ Avoided (tonnes)</Label>
              <Input type="number" step="0.001" value={form.co2AvoidedTonnes ?? ""} onChange={e => setForm(f => ({ ...f, co2AvoidedTonnes: e.target.value }))} />
              {calcCo2Avoided && form.co2AvoidedTonnes !== calcCo2Avoided && (
                <p className="text-xs text-muted-foreground mt-0.5">Calculated: {calcCo2Avoided} t (generation × 0.207 kgCO₂e/kWh)
                  <button type="button" className="ml-1 text-primary underline" onClick={() => setForm(f => ({ ...f, co2AvoidedTonnes: calcCo2Avoided }))}>use this</button>
                </p>
              )}
            </div>
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
            <div><Label>Assessment Tool</Label>
              <Select value={form.assessmentTool ?? "Defra Metric 4.0"} onValueChange={v => setForm(f => ({ ...f, assessmentTool: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Defra Metric 4.0", "Defra Metric 3.1", "Defra Metric 3.0", "CIEEM Rapid Assessment", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Assessor Name</Label><Input value={form.assessorName ?? ""} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
            <div><Label>Record Type</Label>
              <Select value={form.recordType ?? "baseline"} onValueChange={v => setForm(f => ({ ...f, recordType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[{ v: "baseline", l: "Baseline" }, { v: "post-creation", l: "Post-creation" }, { v: "annual-monitoring", l: "Annual Monitoring" }, { v: "final-assessment", l: "Final Assessment" }].map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                </SelectContent>
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
            <div>
              <Label>Baseline Units</Label>
              <Input type="number" step="0.001" value={form.baselineUnits ?? ""} onChange={e => {
                const baseline = parseFloat(e.target.value);
                const target = parseFloat(form.targetUnits ?? "");
                const net = !isNaN(baseline) && !isNaN(target) ? (target - baseline).toFixed(3) : form.netGainUnits;
                setForm(f => ({ ...f, baselineUnits: e.target.value, netGainUnits: net }));
              }} />
            </div>
            <div>
              <Label>Target Units</Label>
              <Input type="number" step="0.001" value={form.targetUnits ?? ""} onChange={e => {
                const target = parseFloat(e.target.value);
                const baseline = parseFloat(form.baselineUnits ?? "");
                const net = !isNaN(baseline) && !isNaN(target) ? (target - baseline).toFixed(3) : form.netGainUnits;
                setForm(f => ({ ...f, targetUnits: e.target.value, netGainUnits: net }));
              }} />
            </div>
            <div>
              <Label>Net Gain Units</Label>
              <Input type="number" step="0.001" value={form.netGainUnits ?? ""} onChange={e => setForm(f => ({ ...f, netGainUnits: e.target.value }))} placeholder="Auto-calculated from target − baseline" />
              {form.baselineUnits && form.targetUnits && (
                <p className="text-xs text-muted-foreground mt-0.5">= target ({form.targetUnits}) − baseline ({form.baselineUnits})</p>
              )}
            </div>
            <div><Label>Management Commitment (years)</Label><Input type="number" value={form.managementCommitmentYears ?? ""} onChange={e => setForm(f => ({ ...f, managementCommitmentYears: e.target.value }))} /></div>
            <div><Label>Legal Agreement Type</Label>
              <Select value={form.legalAgreementType ?? ""} onValueChange={v => setForm(f => ({ ...f, legalAgreementType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {["Section 106", "Conservation Covenant", "Management Agreement", "Habitat Bank Agreement", "Planning Condition", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Planning Reference</Label><Input value={form.planningReference ?? ""} onChange={e => setForm(f => ({ ...f, planningReference: e.target.value }))} /></div>
            <div><Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[{ v: "active", l: "Active" }, { v: "completed", l: "Completed" }, { v: "monitoring", l: "Monitoring" }, { v: "lapsed", l: "Lapsed" }].map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                </SelectContent>
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

type Tab = "audits" | "emissions" | "sequestration" | "actions" | "reports" | "renewable" | "bng" | "auto-calc";

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
          <TabButton active={tab === "auto-calc"} onClick={() => setTab("auto-calc")}><Zap className="w-3.5 h-3.5 mr-1" />Auto-Calculator</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "audits" && <AuditsTab farmId={farmId} />}
          {tab === "emissions" && <EmissionsTab farmId={farmId} />}
          {tab === "sequestration" && <SequestrationTab farmId={farmId} />}
          {tab === "actions" && <ReductionActionsTab farmId={farmId} />}
          {tab === "renewable" && <RenewableEnergyTab farmId={farmId} />}
          {tab === "bng" && <BngTab farmId={farmId} />}
          {tab === "reports" && <ReportsTab farmId={farmId} />}
          {tab === "auto-calc" && <CarbonAutoCalcTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}

// ─── T015: Carbon Auto-Calculator ─────────────────────────────────────────────
const DEFRA_EF: Record<string, { label: string; unit: string; kgCo2ePerUnit: number; scope: string; category: string }> = {
  diesel:     { label: "Red Diesel / Gas Oil",       unit: "litres",   kgCo2ePerUnit: 2.5437,  scope: "1", category: "Fuel" },
  petrol:     { label: "Petrol",                     unit: "litres",   kgCo2ePerUnit: 2.1555,  scope: "1", category: "Fuel" },
  lng:        { label: "LNG / Propane (heating)",    unit: "litres",   kgCo2ePerUnit: 1.1544,  scope: "1", category: "Fuel" },
  elec:       { label: "Grid Electricity",           unit: "kWh",      kgCo2ePerUnit: 0.20705, scope: "2", category: "Energy" },
  ammonium:   { label: "Ammonium Nitrate (34.5%N)",  unit: "kg",       kgCo2ePerUnit: 5.82,    scope: "3", category: "Fertiliser" },
  urea:       { label: "Urea (46%N)",                unit: "kg",       kgCo2ePerUnit: 4.70,    scope: "3", category: "Fertiliser" },
  can:        { label: "CAN (27%N)",                 unit: "kg",       kgCo2ePerUnit: 3.04,    scope: "3", category: "Fertiliser" },
  beef_head:  { label: "Beef cattle (per head/yr)",  unit: "head",     kgCo2ePerUnit: 3200,    scope: "1", category: "Livestock" },
  dairy_head: { label: "Dairy cows (per head/yr)",   unit: "head",     kgCo2ePerUnit: 5400,    scope: "1", category: "Livestock" },
  sheep_head: { label: "Sheep (per head/yr)",        unit: "head",     kgCo2ePerUnit: 320,     scope: "1", category: "Livestock" },
  pigs_head:  { label: "Pigs (per head/yr)",         unit: "head",     kgCo2ePerUnit: 310,     scope: "1", category: "Livestock" },
  poultry_k:  { label: "Poultry (per 1,000 birds)", unit: "k birds",  kgCo2ePerUnit: 280,     scope: "1", category: "Livestock" },
};

function CarbonAutoCalcTab({ farmId: _farmId }: { farmId: number }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const set = (key: string, val: string) => setInputs(p => ({ ...p, [key]: val }));

  const results = Object.entries(DEFRA_EF).map(([key, ef]) => {
    const qty = parseFloat(inputs[key] ?? "0") || 0;
    const tCo2e = (qty * ef.kgCo2ePerUnit) / 1000;
    return { key, ...ef, qty, tCo2e };
  });

  const s1 = results.filter(r => r.scope === "1").reduce((s, r) => s + r.tCo2e, 0);
  const s2 = results.filter(r => r.scope === "2").reduce((s, r) => s + r.tCo2e, 0);
  const s3 = results.filter(r => r.scope === "3").reduce((s, r) => s + r.tCo2e, 0);
  const total = s1 + s2 + s3;
  const fmt = (t: number) => t.toFixed(3);
  const cats = [...new Set(Object.values(DEFRA_EF).map(e => e.category))];

  return (
    <div className="space-y-5">
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <Zap className="w-4 h-4 mt-0.5 shrink-0" />
        <div><strong>DEFRA 2023 GHG Conversion Factors.</strong> Enter annual activity quantities — estimates update instantly. Record audited totals in the Carbon Audits tab.</div>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Scope 1 (Direct)", val: s1, bg: "#fef2f2", col: "#dc2626" },
            { label: "Scope 2 (Energy)", val: s2, bg: "#fffbeb", col: "#d97706" },
            { label: "Scope 3 (Indirect)", val: s3, bg: "#f5f3ff", col: "#7c3aed" },
            { label: "Total tCO₂e / yr", val: total, bg: "#f9fafb", col: "#111827" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border text-center" style={{ background: s.bg }}>
              <p className="text-2xl font-bold" style={{ color: s.col }}>{fmt(s.val)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {cats.map(cat => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{cat}</h3>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-600">
                  <th className="text-left px-4 py-2 font-medium">Activity</th>
                  <th className="text-left px-4 py-2 font-medium">Scope</th>
                  <th className="text-left px-4 py-2 font-medium">Quantity / year</th>
                  <th className="text-left px-4 py-2 font-medium">EF (kg CO₂e)</th>
                  <th className="text-right px-4 py-2 font-medium">tCO₂e</th>
                </tr>
              </thead>
              <tbody>
                {results.filter(r => r.category === cat).map((r, i, arr) => (
                  <tr key={r.key} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{r.label}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.scope === "1" ? "bg-red-100 text-red-700" : r.scope === "2" ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"}`}>S{r.scope}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="0" step="any" className="w-24 border rounded px-2 py-1 text-sm" value={inputs[r.key] ?? ""} onChange={e => set(r.key, e.target.value)} placeholder="0" />
                        <span className="text-xs text-gray-400">{r.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{r.kgCo2ePerUnit.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">{r.tCo2e > 0 ? fmt(r.tCo2e) : <span className="text-gray-300 font-normal">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {total > 0 && (
        <button
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90"
          onClick={() => {
            const lines = [`DEFRA Auto-Calc — Total: ${fmt(total)} tCO₂e/yr`, `Scope 1: ${fmt(s1)} | Scope 2: ${fmt(s2)} | Scope 3: ${fmt(s3)}`, ``, ...results.filter(r => r.qty > 0).map(r => `  ${r.label}: ${r.qty} ${r.unit} → ${fmt(r.tCo2e)} tCO₂e`)];
            navigator.clipboard.writeText(lines.join("\n"));
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
        >{copied ? "✓ Copied" : "Copy Results to Clipboard"}</button>
      )}
    </div>
  );
}
