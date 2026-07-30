import { useState, useMemo, useEffect, useRef } from "react";
import { sumCellarSo2 } from "@/lib/so2-summary";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Eye, FlaskConical, Wine, Beaker, Gauge, Thermometer, Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Wrench, ShieldCheck, FileDown, Printer, Settings2, RefreshCw, GitBranch, Leaf, Search, Upload } from "lucide-react";
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
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

// ─── Local helpers ─────────────────────────────────────────────────────────────
const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
const fmtNum = (v: unknown, dp = 1) => (v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp));
const today = new Date().toISOString().split("T")[0];

function exportCSV(rows: Record<string, unknown>[], filename: string, cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]) {
  const header = cols.map(c => `"${c.label}"`).join(",");
  const body = rows.map(r => cols.map(c => {
    const v = c.fmt ? c.fmt(r) : (r[c.key] ?? "");
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

function useCrud<T extends Record<string, unknown>>(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const q = useQuery<T[]>({
    queryKey: [key, farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: [key, farmId] });
  const add = useMutation({
    mutationFn: async (body: Partial<T>) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); const err = new Error(e.error || "Save failed"); (err as Error & { code?: string }).code = e.code; throw err; }
      return r.json();
    },
    onSuccess: invalidate,
  });
  const edit = useMutation({
    mutationFn: async ({ id, ...body }: Partial<T> & { id: number }) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); const err = new Error(e.error || "Save failed"); (err as Error & { code?: string }).code = e.code; throw err; }
      return r.json();
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); } },
    onSuccess: invalidate,
  });
  return { data: q.data ?? [], isLoading: q.isLoading, add, edit, remove };
}

function useVessels(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-vessels", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels`), { credentials: "include" });
      const d = await r.json();
      return (d.records ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

function useEquipment(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-equipment", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-equipment`), { credentials: "include" });
      const d = await r.json();
      return (d.records ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

function usePressing(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing`), { credentials: "include" });
      const d = await r.json();
      return (d.records ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

function useAdditionsSummary(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-additions-summary", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/additions-summary`), { credentials: "include" });
      const d = await r.json();
      return (d.summary ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });
}

function useAllPressAdditions(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-all-additions", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/all-additions`), { credentials: "include" });
      const d = await r.json();
      return (d.additions ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });
}

function useStaff(farmId: number) {
  const { data, isLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  return {
    staffNames: (data?.staff ?? []).map((s: { name: string }) => s.name),
    isLoading,
  };
}

function ViewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium text-sm">{value ?? "—"}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t pt-3 mt-1">{children}</p>;
}

function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-40" />
      <p className="font-medium">{title}</p>
      <p className="text-xs mt-1">{sub}</p>
    </div>
  );
}

function So2Badge({ compliant }: { compliant: unknown }) {
  if (compliant === true || compliant === "true" || compliant === 1 || compliant === "1") {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />Compliant</span>;
  }
  if (compliant === false || compliant === "false" || compliant === 0 || compliant === "0") {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" />Exceeds Limit</span>;
  }
  return <span className="text-muted-foreground text-xs">—</span>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WINE_COLOUR_OPTIONS = ["Red", "White", "Rosé", "Sparkling", "Orange", "Other"];
const ORGANIC_MAX_SO2: Record<string, string> = { "Red": "100", "White": "150", "Rosé": "150", "Sparkling": "185", "Orange": "150" };
// Conventional (non-organic) total SO₂ ceilings — UK-retained Reg 1308/2013 Annex VIII Part B
const CONVENTIONAL_MAX_SO2: Record<string, string> = { "Red": "150", "White": "200", "Rosé": "200", "Sparkling": "235", "Orange": "200" };
const SOURCE_TYPE_OPTIONS = ["Own vineyard", "Contract grower", "Purchased grapes"];
const GRAPE_CONDITION_OPTIONS = ["Excellent", "Good", "Fair", "Poor"];
const PRESS_TYPE_OPTIONS = ["Pneumatic bladder", "Basket press", "Continuous screw", "Membrane press", "Other"];
const JUICE_TURBIDITY_OPTIONS = ["Clear", "Slightly turbid", "Turbid"];
const SETTLING_METHOD_OPTIONS = ["Static cold", "Static warm", "Centrifuge", "Flocculant", "None"];
const FERMENTATION_TYPE_OPTIONS = ["Wild / spontaneous fermentation", "Inoculated — commercial yeast", "Inoculated — cultured indigenous yeast"];
const VESSEL_TYPE_OPTIONS = ["Stainless steel tank", "Oak barrel (225L)", "Oak barrel (500L)", "Oak vat / foudre", "Amphora / clay", "Fibreglass tank", "HDPE tank", "Concrete tank", "Other"];
const VESSEL_STATUS_OPTIONS = ["active", "retired", "sold"];
const CLEAN_TYPE_OPTIONS = ["Rinse (water only)", "Hot water rinse", "CIP (Clean-in-place)", "Steam", "Chemical wash", "Ozone", "Other"];
const CELLAR_OP_TYPES = ["racking", "topping", "sulfiting", "fining", "filtering", "cold-stabilisation", "other"];
const CELLAR_OP_LABELS: Record<string, string> = {
  racking: "Racking (lees removal)", topping: "Topping up", sulfiting: "Sulfiting (SO₂ addition)",
  fining: "Fining", filtering: "Filtering", "cold-stabilisation": "Cold stabilisation", other: "Other",
};
const CLOSURE_TYPE_OPTIONS = ["Natural cork", "Technical cork", "Agglomerate cork", "Screw cap (Stelvin)", "Crown cap", "Waxed cork", "Glass stopper", "Other"];
const SO2_TEST_STAGES = ["at-pressing", "post-fermentation", "post-racking", "pre-bottling", "at-bottling", "other"];
const SO2_TEST_STAGE_LABELS: Record<string, string> = {
  "at-pressing": "At pressing", "post-fermentation": "Post-fermentation", "post-racking": "Post-racking",
  "pre-bottling": "Pre-bottling", "at-bottling": "At bottling line", "other": "Other",
};
const SO2_TEST_METHODS = ["On-site — Ripper titration", "On-site — Enzymatic kit", "On-site — Aeration-oxidation", "Third-party laboratory", "Not tested / not applicable"];
const EQUIPMENT_TYPES = ["Ripper burette / titrator", "Enzymatic SO₂ analyser", "Aeration-oxidation apparatus", "Refractometer (Brix)", "pH meter", "Hydrometer / densimeter", "Other analytical equipment"];
const EQUIPMENT_STATUS_OPTIONS = ["active", "out-of-service", "retired"];
const CALIBRATION_RESULT_OPTIONS = ["pass", "fail", "adjusted"];
const CALIBRATION_FREQ_OPTIONS = ["Per use", "Daily", "Weekly", "Monthly", "Quarterly", "Annually"];
const TOASTING_OPTIONS = ["Light (L)", "Medium (M)", "Medium+ (M+)", "Heavy (H)", "Extra Heavy (EH)", "None"];

// ─── Press Additive Catalogue ─────────────────────────────────────────────────
// Limits per retained EU Reg 2019/934 (UK-retained law).
// maxPerUnit: per-unit conventional ceiling (hard limit — API rejects above this).
// organicMaxPerUnit: lower organic limit (UI warning only, not API enforced at this stage).
interface PermittedAdditive {
  name: string; category: string; defaultUnit: string; units: string[];
  maxPerUnit?: Record<string, number>;
  organicMaxPerUnit?: Record<string, number>;
}
const PERMITTED_ADDITIVES: PermittedAdditive[] = [
  { name: "SO₂ / Potassium metabisulphite (KMS)", category: "so2",           defaultUnit: "mg/kg", units: ["mg/kg", "mg/L"],        maxPerUnit: { "mg/kg": 200, "mg/L": 200 }, organicMaxPerUnit: { "mg/kg": 90, "mg/L": 90 } },
  { name: "Ascorbic acid",                         category: "ascorbic_acid", defaultUnit: "mg/L",  units: ["mg/L"],                 maxPerUnit: { "mg/L": 250 },               organicMaxPerUnit: { "mg/L": 250 } },
  { name: "Pectolytic enzyme (Pectinase)",         category: "pectolytic",    defaultUnit: "g/hL",  units: ["g/hL", "mL/hL"] },
  { name: "Bentonite (white must only)",           category: "fining",        defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Activated charcoal (white must only)",  category: "fining",        defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Diammonium phosphate (DAP)",            category: "nutrient",      defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Tartaric acid",                         category: "acidification", defaultUnit: "g/L",   units: ["g/L", "g/hL"] },
  { name: "Other",                                 category: "other",         defaultUnit: "g/hL",  units: ["mg/kg", "mg/L", "g/hL", "g/L", "mL/hL"] },
];
const ALL_DOSE_UNITS = ["mg/kg", "mg/L", "g/hL", "g/L", "mL/hL"];
const ADDITIVE_CATEGORY_LABELS: Record<string, string> = {
  so2: "SO₂ / KMS",
  ascorbic_acid: "Ascorbic acid",
  pectolytic: "Pectolytic enzyme",
  fining: "Fining agents",
  nutrient: "Nutrients",
  acidification: "Acidification",
  other: "Other",
};
interface AdditionRow { tempId: number; id?: number; additiveName: string; category: string; dose: string; unit: string; notes: string }

// ─── Harvest Reception Tab ─────────────────────────────────────────────────────
export function HarvestReceptionTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const crud = useCrud(farmId, "winery-reception", "winery-reception");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const grossKg = parseFloat(String(form.grossWeightKg || "0"));
  const tareKg = parseFloat(String(form.tareWeightKg || "0"));
  const autoNet = !isNaN(grossKg) && !isNaN(tareKg) && grossKg > 0 ? grossKg - tareKg : null;

  const openAdd = () => { setEditing(null); setForm({ receptionDate: today, vintageYear: String(new Date().getFullYear()), accepted: "true" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    const payload = { ...form, netWeightKg: autoNet != null ? String(autoNet) : form.netWeightKg };
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filtered = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const harvestCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "reception_date", label: "Reception Date", fmt: (r: Record<string, unknown>) => fmtDate(r.reception_date) },
    { key: "grower_name", label: "Grower" },
    { key: "grape_variety", label: "Variety" },
    { key: "source_block", label: "Block/Source" },
    { key: "gross_weight_kg", label: "Gross Weight (kg)" },
    { key: "tare_weight_kg", label: "Tare (kg)" },
    { key: "net_weight_kg", label: "Net Weight (kg)" },
    { key: "sugar_brix", label: "Sugar (Brix)" },
    { key: "ph", label: "pH" },
    { key: "temperature_c", label: "Temp (°C)" },
    { key: "accepted", label: "Accepted", fmt: (r: Record<string, unknown>) => String(r.accepted) === "true" ? "Yes" : "No" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Winery Grape Intake Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Record each grape delivery at the winery gate — separate from the vineyard harvest log. Captures winery-scale weights, intake analysis, vehicle details, and condition on arrival.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Intake</Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => exportCSV(filtered, "harvest-reception.csv", harvestCsvCols)} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Wine} title="No intake records yet" sub="Log grape deliveries received at the winery gate." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Block / Variety</th>
              <th className="text-left p-3 font-medium">Source</th>
              <th className="text-right p-3 font-medium">Net Wt (kg)</th>
              <th className="text-right p-3 font-medium">Brix °</th>
              <th className="text-right p-3 font-medium">pH</th>
              <th className="text-left p-3 font-medium">Condition</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.reception_date)}</td>
                  <td className="p-3">{fmt(blocks.find(b => b.id === r.block_id)?.blockName ?? r.block_id)} {r.variety ? <span className="text-muted-foreground text-xs">— {String(r.variety)}</span> : ""}</td>
                  <td className="p-3 text-muted-foreground">{fmt(r.source_type)}</td>
                  <td className="p-3 text-right font-mono">{fmtNum(r.net_weight_kg, 0)}</td>
                  <td className="p-3 text-right">{fmtNum(r.brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.ph, 2)}</td>
                  <td className="p-3">{fmt(r.grape_condition)}</td>
                  <td className="p-3">{r.accepted === false || r.accepted === "false" ? <span className="text-xs bg-red-100 text-red-700 rounded px-2 py-0.5">Rejected</span> : <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">Accepted</span>}</td>
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "Edit" : "Log"} Grape Intake</DialogTitle>
            <DialogDescription>Record grape delivery details at the winery gate. Separate from vineyard harvest — this captures winery-scale data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Delivery identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reception Date *</Label><Input type="date" max={today} value={String(form.receptionDate ?? "")} onChange={e => sf("receptionDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} placeholder={String(new Date().getFullYear())} /></div>
              <div>
                <Label>Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => sf("blockId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                  <SelectContent>{blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Variety</Label><Input value={String(form.variety ?? "")} onChange={e => sf("variety", e.target.value)} placeholder="e.g. Bacchus, Pinot Noir" /></div>
              <div>
                <Label>Source Type</Label>
                <Select value={String(form.sourceType ?? "")} onValueChange={v => sf("sourceType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SOURCE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Grower Name</Label><Input value={String(form.growerName ?? "")} onChange={e => sf("growerName", e.target.value)} placeholder="If contract grower" /></div>
            </div>
            <SectionLabel>Vehicle & transport</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Reg</Label><Input value={String(form.vehicleReg ?? "")} onChange={e => sf("vehicleReg", e.target.value)} /></div>
              <div><Label>Driver Name</Label><Input value={String(form.driverName ?? "")} onChange={e => sf("driverName", e.target.value)} /></div>
              <div><Label>Intake Temperature (°C)</Label><Input type="number" step="0.1" value={String(form.intakeTemperatureC ?? "")} onChange={e => sf("intakeTemperatureC", e.target.value)} /></div>
            </div>
            <SectionLabel>Weights (winery scales)</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Gross Weight (kg)</Label><Input type="number" step="0.1" value={String(form.grossWeightKg ?? "")} onChange={e => sf("grossWeightKg", e.target.value)} /></div>
              <div><Label>Tare Weight (kg)</Label><Input type="number" step="0.1" value={String(form.tareWeightKg ?? "")} onChange={e => sf("tareWeightKg", e.target.value)} /></div>
              <div>
                <Label>Net Weight (kg)</Label>
                {autoNet !== null
                  ? <div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoNet.toFixed(1)} <span className="text-blue-600 text-xs">auto</span></div>
                  : <Input type="number" step="0.1" value={String(form.netWeightKg ?? "")} onChange={e => sf("netWeightKg", e.target.value)} placeholder="Or enter gross & tare" />}
              </div>
            </div>
            <SectionLabel>Intake analysis (at winery gate)</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Brix °</Label><Input type="number" step="0.1" value={String(form.brix ?? "")} onChange={e => sf("brix", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={e => sf("ph", e.target.value)} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => sf("titratableAcidityGl", e.target.value)} /></div>
              <div><Label>Potential Alcohol %</Label><Input type="number" step="0.1" value={String(form.potentialAlcohol ?? "")} onChange={e => sf("potentialAlcohol", e.target.value)} /></div>
            </div>
            <SectionLabel>Condition & allocation</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Grape Condition</Label>
                <Select value={String(form.grapeCondition ?? "")} onValueChange={v => sf("grapeCondition", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{GRAPE_CONDITION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Botrytis %</Label><Input type="number" min="0" max="100" value={String(form.botrytisPct ?? "")} onChange={e => sf("botrytisPct", e.target.value)} /></div>
              <div><Label>MOG % (material other than grapes)</Label><Input type="number" step="0.1" min="0" max="100" value={String(form.mogPct ?? "")} onChange={e => sf("mogPct", e.target.value)} /></div>
              <div><Label>Holding Bin / Tank allocated</Label><Input value={String(form.holdingBin ?? "")} onChange={e => sf("holdingBin", e.target.value)} placeholder="e.g. Bin 3, T2" /></div>
              <div><Label>Receiving Inspector</Label><Input value={String(form.inspectorName ?? "")} onChange={e => sf("inspectorName", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox id="accepted-chk" checked={form.accepted !== "false" && form.accepted !== false} onCheckedChange={v => sf("accepted", v ? "true" : "false")} />
              <Label htmlFor="accepted-chk" className="cursor-pointer">Grapes accepted at intake</Label>
            </div>
            {(form.accepted === "false" || form.accepted === false) && (
              <div><Label>Rejection Reason</Label><Textarea value={String(form.rejectionReason ?? "")} onChange={e => sf("rejectionReason", e.target.value)} rows={2} /></div>
            )}
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.receptionDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Grape Intake — {fmtDate(view.reception_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Reception Date" value={fmtDate(view.reception_date)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Block" value={fmt(blocks.find(b => b.id === view.block_id)?.blockName ?? view.block_id)} />
              <ViewField label="Variety" value={fmt(view.variety)} />
              <ViewField label="Source" value={fmt(view.source_type)} />
              <ViewField label="Grower" value={fmt(view.grower_name)} />
              <ViewField label="Vehicle Reg" value={fmt(view.vehicle_reg)} />
              <ViewField label="Driver" value={fmt(view.driver_name)} />
              <ViewField label="Gross Weight" value={view.gross_weight_kg ? `${fmtNum(view.gross_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Tare Weight" value={view.tare_weight_kg ? `${fmtNum(view.tare_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Net Weight" value={view.net_weight_kg ? `${fmtNum(view.net_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Intake Temp" value={view.intake_temperature_c ? `${fmtNum(view.intake_temperature_c, 1)} °C` : "—"} />
              <ViewField label="Brix °" value={fmtNum(view.brix, 1)} />
              <ViewField label="pH" value={fmtNum(view.ph, 2)} />
              <ViewField label="TA (g/L)" value={fmtNum(view.titratable_acidity_gl, 1)} />
              <ViewField label="Potential Alcohol %" value={fmtNum(view.potential_alcohol, 1)} />
              <ViewField label="Grape Condition" value={fmt(view.grape_condition)} />
              <ViewField label="Botrytis %" value={fmt(view.botrytis_pct)} />
              <ViewField label="MOG %" value={fmtNum(view.mog_pct, 1)} />
              <ViewField label="Holding Bin" value={fmt(view.holding_bin)} />
              <ViewField label="Inspector" value={fmt(view.inspector_name)} />
              <ViewField label="Status" value={view.accepted === false || view.accepted === "false" ? <span className="text-red-700">Rejected — {String(view.rejection_reason ?? "")}</span> : <span className="text-green-700">Accepted</span>} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-reception" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Intake Record</DialogTitle><DialogDescription>Remove the intake record for {fmtDate(deleting?.reception_date)}? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery Batch Settings hook ───────────────────────────────────────────────
function useWineryBatchSettings(farmId: number) {
  const qc = useQueryClient();
  const q = useQuery<{ settings: Record<string, unknown>; nextRef: string }>({
    queryKey: ["winery-batch-settings", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-batch-settings`), { credentials: "include" });
      return r.json();
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });
  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch(api(`farms/${farmId}/winery-batch-settings`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); }
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["winery-batch-settings", farmId] }),
  });
  return { data: q.data, isLoading: q.isLoading, save };
}

// ─── Batch Trail Quick Search ─────────────────────────────────────────────────
/**
 * A standalone "Find batch" bar that can be placed in any winery-tab header.
 * Typing or pasting a batch ref and pressing Enter (or clicking the button)
 * opens BatchTrailDialog directly — no need to locate the pressing record row.
 */
export function BatchTrailQuickSearch({ farmId }: { farmId: number }) {
  const [value, setValue] = useState("");
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const { data: farmsData } = useQuery<{ records?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmName: string =
    (Array.isArray(farmsData?.records)
      ? (farmsData.records.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)
          ?.name as string | undefined
      : undefined) ?? `Farm ${farmId}`;

  const open = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setActiveRef(trimmed);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8 h-8 w-56 text-sm"
          placeholder="Find batch by ref…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") open(); }}
        />
      </div>
      <Button variant="outline" size="sm" className="h-8" onClick={open} disabled={!value.trim()}>
        <GitBranch className="h-3.5 w-3.5 mr-1" />
        Open trail
      </Button>
      {activeRef && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={{ batch_ref: activeRef, vintage_year: null }}
          farmName={farmName}
          onClose={() => { setActiveRef(null); }}
        />
      )}
    </div>
  );
}

// ─── Batch Trail Dialog ───────────────────────────────────────────────────────
interface BatchTrailData {
  batchRef: string | null;
  vintageYear: number | null;
  scope: "batchRef" | "vintageYear";
  fermentation: Record<string, unknown>[];
  cellarOps: Record<string, unknown>[];
  so2Tests: Record<string, unknown>[];
  bottling: Record<string, unknown>[];
  pressAdditions: Record<string, unknown>[];
}

function TrailSection({ icon: Icon, title, count, children }: { icon: React.ElementType; title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-sm">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
      </div>
      {children}
    </div>
  );
}

// ─── SO₂ Summary helpers ──────────────────────────────────────────────────────
interface So2Summary {
  pressSo2MgKg: number;
  pressSo2MgL: number;
  hasPressingSo2: boolean;
  fermSo2Total: number;
  hasFermSo2: boolean;
  cellarSo2TotalG: number;
  cellarSo2MgL: number | null;
  hasCellarSo2: boolean;
  latestTestTotal: number | null;
  latestTestDate: string | null;
  wineColour: string | null;
  isOrganic: boolean;
  conventionalLimit: number;
  organicLimit: number;
  activeLimit: number;
  runningEstimate: number;
  hasAny: boolean;
}

function computeSo2Summary(pressing: Record<string, unknown>, data: BatchTrailData): So2Summary {
  // 1. Press SO₂ additions
  const pressSo2Items = data.pressAdditions.filter(a => String(a.category) === "so2");
  const pressSo2MgKg = pressSo2Items.filter(a => String(a.unit) === "mg/kg").reduce((s, a) => s + parseFloat(String(a.dose ?? 0)), 0);
  const pressSo2MgL  = pressSo2Items.filter(a => String(a.unit) === "mg/L").reduce((s, a) => s + parseFloat(String(a.dose ?? 0)), 0);
  const hasPressingSo2 = pressSo2Items.length > 0;

  // 2. Fermentation SO₂ (sum across all linked fermentation records)
  const fermVals = data.fermentation.filter(r => r.so2_at_fermentation_mg_l != null).map(r => parseFloat(String(r.so2_at_fermentation_mg_l)));
  const fermSo2Total = fermVals.reduce((s, v) => s + v, 0);
  const hasFermSo2 = fermVals.length > 0;

  // 3. Cellar sulfiting ops
  const sulfitingOps = data.cellarOps.filter(r => String(r.op_type) === "sulfiting" && r.so2_quantity_g != null);
  // sumCellarSo2: per-operation dose rates are summed independently (not aggregate grams / aggregate vol)
  const { totalG: cellarSo2TotalG, cumulativeMgL: cellarSo2MgL } = sumCellarSo2(sulfitingOps);
  const hasCellarSo2 = sulfitingOps.length > 0;

  // 4. Latest SO₂ test total (most recent by date)
  const testsWithTotal = [...data.so2Tests].filter(r => r.total_so2_mg_l != null).sort((a, b) =>
    new Date(String(b.test_date)).getTime() - new Date(String(a.test_date)).getTime()
  );
  const latestTest = testsWithTotal[0] ?? null;
  const latestTestTotal = latestTest ? parseFloat(String(latestTest.total_so2_mg_l)) : null;
  const latestTestDate = latestTest ? String(latestTest.test_date) : null;

  // 5. Wine colour: fermentation → bottling → pressing record
  const wineColour = (
    (data.fermentation.find(r => r.wine_colour) as Record<string, unknown> | undefined)?.wine_colour ??
    (data.bottling.find(r => r.wine_colour) as Record<string, unknown> | undefined)?.wine_colour ??
    pressing.wine_colour ??
    null
  );
  const colourStr = wineColour ? String(wineColour) : "White";

  // 6. Organic flag
  const isOrganic = pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1;

  // 7. Limits
  const conventionalLimit = parseInt(CONVENTIONAL_MAX_SO2[colourStr] ?? "200", 10);
  const organicLimit = parseInt(ORGANIC_MAX_SO2[colourStr] ?? "150", 10);
  const activeLimit = isOrganic ? organicLimit : conventionalLimit;

  // 8. Running estimate: press (mg/kg ≈ mg/L, density ≈ 1) + ferm + cellar estimate
  const pressEquiv = pressSo2MgKg + pressSo2MgL;
  const runningEstimate = pressEquiv + fermSo2Total + (cellarSo2MgL ?? 0);

  return {
    pressSo2MgKg, pressSo2MgL, hasPressingSo2,
    fermSo2Total, hasFermSo2,
    cellarSo2TotalG, cellarSo2MgL, hasCellarSo2,
    latestTestTotal, latestTestDate,
    wineColour: wineColour ? String(wineColour) : null,
    isOrganic, conventionalLimit, organicLimit, activeLimit,
    runningEstimate,
    hasAny: hasPressingSo2 || hasFermSo2 || hasCellarSo2 || latestTest !== null,
  };
}

function So2SummaryBlock({ summary }: { summary: So2Summary }) {
  if (!summary.hasAny) return null;

  // Compliance indicator against the most authoritative figure (test total > running estimate)
  const complianceValue = summary.latestTestTotal ?? summary.runningEstimate;
  const pct = summary.activeLimit > 0 ? (complianceValue / summary.activeLimit) * 100 : 0;
  const indicatorColor = complianceValue > summary.activeLimit
    ? "bg-red-50 border-red-200"
    : pct >= 75
    ? "bg-amber-50 border-amber-200"
    : "bg-green-50 border-green-200";
  const badgeColor = complianceValue > summary.activeLimit
    ? "bg-red-100 text-red-800"
    : pct >= 75
    ? "bg-amber-100 text-amber-800"
    : "bg-green-100 text-green-800";
  const statusText = complianceValue > summary.activeLimit
    ? "Exceeds limit"
    : pct >= 75
    ? "Approaching limit"
    : "Within limit";
  const StatusIcon = complianceValue > summary.activeLimit ? XCircle : pct >= 75 ? AlertTriangle : CheckCircle2;

  return (
    <div className={`rounded-lg border px-4 py-3 space-y-2 ${indicatorColor}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5" />SO₂ Compliance Summary
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${badgeColor}`}>
          <StatusIcon className="w-3 h-3" />{statusText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Press SO₂ */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">At pressing</p>
          {summary.hasPressingSo2 ? (
            <p className="font-mono font-semibold text-sm">
              {summary.pressSo2MgKg > 0 && `${summary.pressSo2MgKg.toFixed(1)} mg/kg`}
              {summary.pressSo2MgKg > 0 && summary.pressSo2MgL > 0 && " + "}
              {summary.pressSo2MgL > 0 && `${summary.pressSo2MgL.toFixed(1)} mg/L`}
            </p>
          ) : <p className="text-muted-foreground">—</p>}
        </div>

        {/* Fermentation SO₂ */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">At fermentation</p>
          {summary.hasFermSo2
            ? <p className="font-mono font-semibold text-sm">{summary.fermSo2Total.toFixed(1)} mg/L</p>
            : <p className="text-muted-foreground">—</p>}
        </div>

        {/* Cellar sulfiting */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">Cellar sulfiting</p>
          {summary.hasCellarSo2 ? (
            <div>
              <p className="font-mono font-semibold text-sm">{summary.cellarSo2TotalG.toFixed(1)} g total</p>
              {summary.cellarSo2MgL != null && (
                <p className="text-muted-foreground text-xs">≈ {summary.cellarSo2MgL.toFixed(1)} mg/L</p>
              )}
            </div>
          ) : <p className="text-muted-foreground">—</p>}
        </div>

        {/* SO₂ test total */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">
            {summary.latestTestTotal != null ? "Latest test total" : "Additions estimate"}
          </p>
          <p className="font-mono font-semibold text-sm">
            {summary.latestTestTotal != null
              ? `${summary.latestTestTotal.toFixed(1)} mg/L`
              : `~${summary.runningEstimate.toFixed(1)} mg/L`}
          </p>
          {summary.latestTestDate && (
            <p className="text-muted-foreground text-xs">{fmtDate(summary.latestTestDate)}</p>
          )}
        </div>
      </div>

      {/* Limit bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {summary.wineColour ? `${summary.wineColour} wine · ` : ""}
            {summary.isOrganic ? "Organic" : "Conventional"} limit: {summary.activeLimit} mg/L
          </span>
          <span className="font-mono">{Math.min(pct, 150).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${complianceValue > summary.activeLimit ? "bg-red-500" : pct >= 75 ? "bg-amber-400" : "bg-green-500"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {summary.latestTestTotal == null && (summary.hasPressingSo2 || summary.hasFermSo2 || summary.hasCellarSo2) && (
          <p className="text-xs text-muted-foreground italic">
            * Estimate from addition records. Run an SO₂ test to confirm the true total.
            {summary.cellarSo2MgL != null ? " Cellar figure uses volume moved as an approximation." : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function BatchTrailDialog({ farmId, pressing, farmName, onClose }: { farmId: number; pressing: Record<string, unknown>; farmName: string; onClose: () => void }) {
  const batchRef = pressing.batch_ref != null && String(pressing.batch_ref).trim() !== "" ? String(pressing.batch_ref).trim() : null;
  const vintageYear = pressing.vintage_year != null ? String(pressing.vintage_year) : null;
  const hasQuery = !!(batchRef || vintageYear);

  const queryUrl = batchRef
    ? api(`farms/${farmId}/winery-pressing/batch-trail?batchRef=${encodeURIComponent(batchRef)}`)
    : api(`farms/${farmId}/winery-pressing/batch-trail?vintageYear=${encodeURIComponent(vintageYear ?? "")}`);

  const { data, isLoading, isError } = useQuery<BatchTrailData>({
    queryKey: ["winery-batch-trail", farmId, batchRef ?? `vintage:${vintageYear}`],
    queryFn: async () => {
      const r = await fetch(queryUrl, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load batch trail");
      return r.json();
    },
    enabled: hasQuery,
    staleTime: 30_000,
  });

  const totalLinked = (data?.fermentation.length ?? 0) + (data?.cellarOps.length ?? 0) + (data?.so2Tests.length ?? 0) + (data?.bottling.length ?? 0);
  const isVintageScoped = data?.scope === "vintageYear";

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-blue-600" />
            Batch Trail — {batchRef ?? (vintageYear ? `Vintage ${vintageYear}` : "—")}
          </DialogTitle>
          <DialogDescription>
            {isVintageScoped
              ? `Showing all winery records for Vintage ${vintageYear} — no batch reference is set on this pressing record. Press date: ${fmtDate(pressing.press_date)}.`
              : `All records linked to this pressing batch${pressing.vintage_year ? ` (Vintage ${String(pressing.vintage_year)})` : ""}. Press date: ${fmtDate(pressing.press_date)}.`}
          </DialogDescription>
        </DialogHeader>

        {!hasQuery && <p className="text-sm text-muted-foreground py-4">No batch reference or vintage year available for this pressing record.</p>}
        {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
        {isError && <p className="text-sm text-red-600 py-4">Failed to load batch trail. Please try again.</p>}

        {isVintageScoped && data && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>This pressing record has no batch reference. Results show all winery records for Vintage {vintageYear} — they may span multiple batches.</span>
          </div>
        )}

        {data && (
          <div className="space-y-5 text-sm">

            {/* SO₂ cumulative summary */}
            <So2SummaryBlock summary={computeSo2Summary(pressing, data)} />

            {/* Press Additions at pressing */}
            {data.pressAdditions.length > 0 && (
              <div>
                <SectionLabel>Pressing Additives</SectionLabel>
                <div className="rounded border divide-y mt-2">
                  {data.pressAdditions.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <Beaker className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{fmt(a.additive_name)}</span>
                      <span className="text-muted-foreground text-xs">{a.dose != null ? `${fmtNum(a.dose, 2)} ${fmt(a.unit)}` : "—"}</span>
                      {!!a.notes && <span className="text-muted-foreground text-xs ml-auto truncate max-w-[160px]">{String(a.notes)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalLinked === 0 && !isLoading && (
              <EmptyState icon={GitBranch} title="No linked records yet" sub="Fermentation, cellar ops, SO₂ tests, and bottling runs sharing this batch reference will appear here." />
            )}

            {/* Fermentation */}
            {data.fermentation.length > 0 && (
              <TrailSection icon={FlaskConical} title="Fermentation" count={data.fermentation.length}>
                <div className="rounded border divide-y">
                  {data.fermentation.map(r => (
                    <div key={String(r.id)} className="px-3 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{r.start_date ? fmtDate(r.start_date) : "—"}{r.end_date ? ` → ${fmtDate(r.end_date)}` : ""}</span>
                          {!!r.wine_colour && <Badge variant="outline" className="text-xs">{String(r.wine_colour)}</Badge>}
                          {!!r.vessel_ref && <span className="text-xs text-muted-foreground">Vessel: {String(r.vessel_ref)}</span>}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        {!!r.operator_name && <span className="text-xs text-muted-foreground shrink-0">{String(r.operator_name)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {!!r.fermentation_type && <span>{String(r.fermentation_type)}</span>}
                        {!!r.yeast_strain && <span>Yeast: {String(r.yeast_strain)}</span>}
                        {!!r.inoculation_date && <span>Inoculated: {fmtDate(r.inoculation_date)}</span>}
                        {r.volume_litres != null && <span>{fmtNum(r.volume_litres, 0)} L</span>}
                        {r.so2_at_fermentation_mg_l != null && <span>SO₂: {fmtNum(r.so2_at_fermentation_mg_l, 1)} mg/L</span>}
                      </div>
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                  ))}
                </div>
              </TrailSection>
            )}

            {/* Cellar Ops */}
            {data.cellarOps.length > 0 && (
              <TrailSection icon={Wrench} title="Cellar Operations" count={data.cellarOps.length}>
                <div className="rounded border divide-y">
                  {data.cellarOps.map(r => (
                    <div key={String(r.id)} className="px-3 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{fmtDate(r.op_date)}</span>
                          <Badge variant="outline" className="text-xs">{CELLAR_OP_LABELS[String(r.op_type)] ?? fmt(r.op_type)}</Badge>
                          {!!r.from_vessel_ref && <span className="text-xs text-muted-foreground">{String(r.from_vessel_ref)}{r.to_vessel_ref ? ` → ${String(r.to_vessel_ref)}` : ""}</span>}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        {!!r.operator_name && <span className="text-xs text-muted-foreground shrink-0">{String(r.operator_name)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {r.volume_moved_litres != null && <span>{fmtNum(r.volume_moved_litres, 1)} L moved</span>}
                        {r.so2_quantity_g != null && <span>SO₂: {fmtNum(r.so2_quantity_g, 1)} g</span>}
                        {r.free_so2_before_mg_l != null && <span>Free SO₂ before: {fmtNum(r.free_so2_before_mg_l, 1)} mg/L</span>}
                        {r.free_so2_after_mg_l != null && <span>after: {fmtNum(r.free_so2_after_mg_l, 1)} mg/L</span>}
                        {!!r.fining_agent && <span>Fining: {String(r.fining_agent)}{r.fining_dose ? ` @ ${String(r.fining_dose)}` : ""}</span>}
                      </div>
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                  ))}
                </div>
              </TrailSection>
            )}

            {/* SO₂ Tests */}
            {data.so2Tests.length > 0 && (
              <TrailSection icon={Gauge} title="SO₂ Tests" count={data.so2Tests.length}>
                <div className="rounded border divide-y">
                  {data.so2Tests.map(r => (
                    <div key={String(r.id)} className="px-3 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{fmtDate(r.test_date)}</span>
                          <Badge variant="outline" className="text-xs">{SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? fmt(r.test_stage)}</Badge>
                          {!!r.vessel_ref && <span className="text-xs text-muted-foreground">Vessel: {String(r.vessel_ref)}</span>}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        <So2Badge compliant={r.so2_compliant} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {r.free_so2_mg_l != null && <span>Free SO₂: {fmtNum(r.free_so2_mg_l, 1)} mg/L</span>}
                        {r.total_so2_mg_l != null && <span>Total SO₂: {fmtNum(r.total_so2_mg_l, 1)} mg/L</span>}
                        {r.max_permitted_mg_l != null && <span>Max permitted: {fmtNum(r.max_permitted_mg_l, 0)} mg/L</span>}
                        {!!r.test_method && <span>{String(r.test_method)}</span>}
                      </div>
                      {!!r.action_taken && <p className="text-xs text-muted-foreground">Action: {String(r.action_taken)}</p>}
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                  ))}
                </div>
              </TrailSection>
            )}

            {/* Bottling */}
            {data.bottling.length > 0 && (
              <TrailSection icon={Package} title="Bottling Runs" count={data.bottling.length}>
                <div className="rounded border divide-y">
                  {data.bottling.map(r => (
                    <div key={String(r.id)} className="px-3 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{fmtDate(r.bottling_date)}</span>
                          {!!r.lot_code && <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Lot: {String(r.lot_code)}</span>}
                          {!!r.wine_colour && <Badge variant="outline" className="text-xs">{String(r.wine_colour)}</Badge>}
                          {(r.is_organic === true || r.is_organic === "true") && (
                            <Badge className="text-xs bg-green-100 text-green-800 border-0 inline-flex items-center gap-0.5"><Leaf className="w-3 h-3" />Organic limits</Badge>
                          )}
                          {(r.certified_organic === true || r.certified_organic === "true") && (
                            <Badge className="text-xs bg-green-100 text-green-800 border-0">Certified organic</Badge>
                          )}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        {!!r.operator_name && <span className="text-xs text-muted-foreground shrink-0">{String(r.operator_name)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {r.volume_bottled_litres != null && <span>{fmtNum(r.volume_bottled_litres, 1)} L</span>}
                        {r.bottles_produced != null && <span>{String(r.bottles_produced)} bottles</span>}
                        {r.cases_produced != null && <span>{String(r.cases_produced)} cases</span>}
                        {r.bottle_size_ml != null && <span>{String(r.bottle_size_ml)} mL</span>}
                        {!!r.closure_type && <span>{String(r.closure_type)}</span>}
                        {r.actual_abv_pct != null && <span>ABV: {fmtNum(r.actual_abv_pct, 1)}%</span>}
                        {r.free_so2_mg_l != null && <span>Free SO₂: {fmtNum(r.free_so2_mg_l, 1)} mg/L</span>}
                      </div>
                      {!!r.source_vessel_ref && <p className="text-xs text-muted-foreground">Source vessel: {String(r.source_vessel_ref)}</p>}
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                  ))}
                </div>
              </TrailSection>
            )}

          </div>
        )}

        <DialogFooter className="flex-wrap gap-2">
          {data && (
            <>
              <Button variant="outline" size="sm" onClick={() => exportBatchTrailCsv(pressing, data)}>
                <FileDown className="w-3.5 h-3.5 mr-1" />Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => printBatchTrail(pressing, data, farmName)}>
                <Printer className="w-3.5 h-3.5 mr-1" />Print / Export PDF
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Batch Trail — CSV export ─────────────────────────────────────────────────
function exportBatchTrailCsv(pressing: Record<string, unknown>, data: BatchTrailData) {
  const batchRef = String(pressing.batch_ref ?? "");
  const rows: string[][] = [];

  // Header
  rows.push(["Stage", "Date", "Type / Additive", "Detail", "SO₂ / Dose", "Unit", "Vessel", "Operator", "Notes"]);

  // Pressing additives
  for (const a of data.pressAdditions) {
    rows.push([
      "Pressing — Additive",
      fmtDate(pressing.press_date),
      String(a.additive_name ?? ""),
      String(a.category ?? ""),
      a.dose != null ? fmtNum(a.dose, 2) : "",
      String(a.unit ?? ""),
      "",
      String(pressing.operator_name ?? ""),
      String(a.notes ?? ""),
    ]);
  }

  // Fermentation
  for (const r of data.fermentation) {
    rows.push([
      "Fermentation",
      r.start_date ? fmtDate(r.start_date) : "",
      String(r.fermentation_type ?? ""),
      r.yeast_strain ? `Yeast: ${String(r.yeast_strain)}` : "",
      r.so2_at_fermentation_mg_l != null ? fmtNum(r.so2_at_fermentation_mg_l, 1) : "",
      r.so2_at_fermentation_mg_l != null ? "mg/L" : "",
      String(r.vessel_ref ?? ""),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
  }

  // Cellar ops
  for (const r of data.cellarOps) {
    const soDetails = r.so2_quantity_g != null ? fmtNum(r.so2_quantity_g, 1) : (r.free_so2_after_mg_l != null ? fmtNum(r.free_so2_after_mg_l, 1) : "");
    const soUnit = r.so2_quantity_g != null ? "g" : (r.free_so2_after_mg_l != null ? "mg/L (after)" : "");
    rows.push([
      "Cellar Operation",
      fmtDate(r.op_date),
      CELLAR_OP_LABELS[String(r.op_type)] ?? String(r.op_type ?? ""),
      r.fining_agent ? `Fining: ${String(r.fining_agent)}` : "",
      soDetails,
      soUnit,
      [r.from_vessel_ref, r.to_vessel_ref].filter(Boolean).join(" → "),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
  }

  // SO₂ tests
  for (const r of data.so2Tests) {
    rows.push([
      "SO₂ Test",
      fmtDate(r.test_date),
      SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? String(r.test_stage ?? ""),
      r.so2_compliant === true || r.so2_compliant === "true" ? "Compliant" : r.so2_compliant === false || r.so2_compliant === "false" ? "Exceeds Limit" : "",
      r.free_so2_mg_l != null ? fmtNum(r.free_so2_mg_l, 1) : "",
      "mg/L (free)",
      String(r.vessel_ref ?? ""),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
  }

  // Bottling
  for (const r of data.bottling) {
    rows.push([
      "Bottling",
      fmtDate(r.bottling_date),
      r.lot_code ? `Lot: ${String(r.lot_code)}` : "",
      r.bottles_produced != null ? `${String(r.bottles_produced)} bottles` : "",
      r.free_so2_mg_l != null ? fmtNum(r.free_so2_mg_l, 1) : "",
      r.free_so2_mg_l != null ? "mg/L (free SO₂)" : "",
      String(r.source_vessel_ref ?? ""),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
  }

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `batch-trail-${batchRef || "unknown"}.csv`;
  a.click();
}

// ─── Batch Trail — Print report ───────────────────────────────────────────────
function printBatchTrail(pressing: Record<string, unknown>, data: BatchTrailData, farmName: string) {
  const batchRef = String(pressing.batch_ref ?? "");
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const vintage = pressing.vintage_year ? String(pressing.vintage_year) : null;
  const pressDate = pressing.press_date ? fmtDate(pressing.press_date) : "—";

  const sectionHtml = (title: string, rows: string) =>
    rows ? `<div class="section"><h2>${escHtml(title)}</h2><table>${rows}</table></div>` : "";

  // ── SO₂ compliance summary (computed client-side, same logic as the dialog) ──
  const s2 = computeSo2Summary(pressing, data);
  const compValue = s2.latestTestTotal ?? s2.runningEstimate;
  const pctOfLimit = s2.activeLimit > 0 ? (compValue / s2.activeLimit) * 100 : 0;
  const so2StatusColor = compValue > s2.activeLimit ? "#b91c1c" : pctOfLimit >= 75 ? "#92400e" : "#166534";
  const so2BgColor     = compValue > s2.activeLimit ? "#fee2e2" : pctOfLimit >= 75 ? "#fef3c7" : "#dcfce7";
  const so2StatusText  = compValue > s2.activeLimit ? "⚠ Exceeds limit" : pctOfLimit >= 75 ? "⚠ Approaching limit" : "✓ Within limit";
  const barPct = Math.min(pctOfLimit, 100).toFixed(0);
  const barColor = compValue > s2.activeLimit ? "#ef4444" : pctOfLimit >= 75 ? "#f59e0b" : "#22c55e";

  const so2SummaryHtml = s2.hasAny ? `
<div class="section">
  <h2>SO₂ Compliance Summary</h2>
  <div style="background:${so2BgColor};border-radius:6px;padding:10px 12px;margin-bottom:4px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:11px;font-weight:600;color:#374151">Cumulative SO₂ additions vs. legal ceiling</span>
      <span style="font-size:11px;font-weight:700;color:${so2StatusColor}">${so2StatusText}</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb">Stage</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb;text-align:right">Amount</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb">Notes</th>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">SO₂ at pressing</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasPressingSo2 ? [s2.pressSo2MgKg > 0 ? `${s2.pressSo2MgKg.toFixed(1)} mg/kg` : "", s2.pressSo2MgL > 0 ? `${s2.pressSo2MgL.toFixed(1)} mg/L` : ""].filter(Boolean).join(" + ") : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">From press additions</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">SO₂ at fermentation</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasFermSo2 ? `${s2.fermSo2Total.toFixed(1)} mg/L` : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Sum across fermentation records</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">Cellar sulfiting</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasCellarSo2 ? `${s2.cellarSo2TotalG.toFixed(1)} g${s2.cellarSo2MgL != null ? ` (≈ ${s2.cellarSo2MgL.toFixed(1)} mg/L)` : ""}` : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">${s2.hasCellarSo2 && s2.cellarSo2MgL != null ? "Estimate using volume moved" : s2.hasCellarSo2 ? "Volume not recorded — no mg/L estimate" : "No sulfiting operations"}</td>
      </tr>
      <tr style="font-weight:700">
        <td style="padding:5px 8px">${s2.latestTestTotal != null ? "Latest SO₂ test total" : "Running additions estimate"}</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;color:${so2StatusColor}">${s2.latestTestTotal != null ? `${s2.latestTestTotal.toFixed(1)} mg/L` : `~${s2.runningEstimate.toFixed(1)} mg/L`}${s2.latestTestDate ? ` (${fmtDate(s2.latestTestDate)})` : ""}</td>
        <td style="padding:5px 8px;color:#6b7280">${s2.isOrganic ? "Organic" : "Conventional"} limit: ${s2.activeLimit} mg/L (${s2.wineColour ?? "wine"})</td>
      </tr>
    </table>
    <div style="margin-top:8px">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#6b7280;margin-bottom:2px">
        <span>${s2.wineColour ?? ""} · ${s2.isOrganic ? "Organic" : "Conventional"} ceiling: ${s2.activeLimit} mg/L${s2.isOrganic ? ` · Conv. ceiling: ${s2.conventionalLimit} mg/L` : ""}</span>
        <span>${barPct}% of limit</span>
      </div>
      <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
        <div style="height:6px;width:${barPct}%;background:${barColor};border-radius:3px"></div>
      </div>
    </div>
    ${s2.latestTestTotal == null ? `<p style="font-size:10px;color:#6b7280;font-style:italic;margin-top:6px">* Estimate from addition records only. Run a laboratory SO₂ test to confirm.</p>` : ""}
  </div>
</div>` : "";

  // Pressing summary
  const pressingNotes = pressing.notes ? String(pressing.notes) : "";
  const pressingRows = `<tr class="header-row"><th>Press Date</th><th>Batch Ref</th><th>Vintage</th><th>Press Type</th><th>Grapes (kg)</th><th>Juice (L)</th><th>Brix °</th><th>pH</th><th>Organic</th><th>Operator</th><th>Settling Method</th><th>Juice Turbidity</th></tr>
<tr>
  <td>${escHtml(pressDate)}</td>
  <td style="font-family:monospace;font-weight:600">${escHtml(batchRef)}</td>
  <td>${escHtml(vintage ?? "—")}</td>
  <td>${escHtml(pressing.press_type ?? "—")}</td>
  <td style="text-align:right">${pressing.grapes_pressed_kg != null ? parseFloat(String(pressing.grapes_pressed_kg)).toFixed(0) : "—"}</td>
  <td style="text-align:right">${pressing.total_juice_litres != null ? parseFloat(String(pressing.total_juice_litres)).toFixed(1) : "—"}</td>
  <td style="text-align:right">${pressing.juice_brix != null ? parseFloat(String(pressing.juice_brix)).toFixed(1) : "—"}</td>
  <td style="text-align:right">${pressing.juice_ph != null ? parseFloat(String(pressing.juice_ph)).toFixed(2) : "—"}</td>
  <td>${(pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1) ? "Yes" : "No"}</td>
  <td>${escHtml(pressing.operator_name ?? "—")}</td>
  <td>${escHtml(pressing.settling_method ?? "—")}</td>
  <td>${escHtml(pressing.juice_turbidity ?? "—")}</td>
</tr>${pressingNotes ? `
<tr>
  <td colspan="12" style="background:#f9fafb;padding:6px 7px;font-size:10px;color:#374151"><span style="font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280">Pressing notes: </span>${escHtml(pressingNotes)}</td>
</tr>` : ""}`;

  // Press additives
  const addRows = data.pressAdditions.map(a => `<tr>
    <td>${escHtml(a.additive_name)}</td>
    <td>${escHtml(ADDITIVE_CATEGORY_LABELS[String(a.category)] ?? a.category)}</td>
    <td style="text-align:right;font-family:monospace">${a.dose != null ? parseFloat(String(a.dose)).toFixed(2) : "—"}</td>
    <td>${escHtml(a.unit)}</td>
    <td>${escHtml(a.notes)}</td>
  </tr>`).join("");

  const addHeader = `<tr class="header-row"><th>Additive</th><th>Category</th><th style="text-align:right">Dose</th><th>Unit</th><th>Notes</th></tr>`;

  // Fermentation
  const fermRows = data.fermentation.map(r => `<tr>
    <td>${escHtml(r.start_date ? fmtDate(r.start_date) : "—")}${r.end_date ? ` → ${escHtml(fmtDate(r.end_date))}` : ""}</td>
    <td>${escHtml(r.wine_colour)}</td>
    <td>${escHtml(r.vessel_ref)}</td>
    <td>${escHtml(r.fermentation_type)}</td>
    <td>${escHtml(r.yeast_strain)}</td>
    <td style="text-align:right">${r.volume_litres != null ? parseFloat(String(r.volume_litres)).toFixed(0) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.so2_at_fermentation_mg_l != null ? `${parseFloat(String(r.so2_at_fermentation_mg_l)).toFixed(1)} mg/L` : "—"}</td>
    <td>${escHtml(r.operator_name)}</td>
  </tr>`).join("");

  const fermHeader = `<tr class="header-row"><th>Period</th><th>Colour</th><th>Vessel</th><th>Type</th><th>Yeast</th><th style="text-align:right">Volume (L)</th><th style="text-align:right">SO₂ @ ferm.</th><th>Operator</th></tr>`;

  // Cellar ops
  const cellarRows = data.cellarOps.map(r => {
    const isSulfiting = String(r.op_type) === "sulfiting";
    const so2Detail = r.so2_quantity_g != null
      ? `${parseFloat(String(r.so2_quantity_g)).toFixed(1)} g${r.free_so2_before_mg_l != null ? ` (${parseFloat(String(r.free_so2_before_mg_l)).toFixed(1)} → ${r.free_so2_after_mg_l != null ? parseFloat(String(r.free_so2_after_mg_l)).toFixed(1) : "?"} mg/L)` : ""}`
      : "—";
    return `<tr${isSulfiting ? ' style="background:#fefce8"' : ""}>
    <td>${escHtml(fmtDate(r.op_date))}</td>
    <td>${escHtml(CELLAR_OP_LABELS[String(r.op_type)] ?? r.op_type)}</td>
    <td>${[r.from_vessel_ref, r.to_vessel_ref].filter(Boolean).map(escHtml).join(" → ")}</td>
    <td style="text-align:right">${r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)).toFixed(1) : "—"}</td>
    <td style="font-family:monospace">${isSulfiting ? so2Detail : "—"}</td>
    <td>${escHtml(r.fining_agent)}</td>
    <td>${escHtml(r.operator_name)}</td>
  </tr>`;
  }).join("");

  const cellarHeader = `<tr class="header-row"><th>Date</th><th>Operation</th><th>Vessel(s)</th><th style="text-align:right">Volume (L)</th><th>SO₂ detail</th><th>Fining agent</th><th>Operator</th></tr>`;

  // SO₂ tests
  const so2Rows = data.so2Tests.map(r => {
    const compliant = r.so2_compliant === true || r.so2_compliant === "true" || r.so2_compliant === 1;
    const nonCompliant = r.so2_compliant === false || r.so2_compliant === "false" || r.so2_compliant === 0;
    const complianceStyle = nonCompliant ? ' style="color:#b91c1c;font-weight:600"' : (compliant ? ' style="color:#166534"' : "");
    return `<tr>
    <td>${escHtml(fmtDate(r.test_date))}</td>
    <td>${escHtml(SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? r.test_stage)}</td>
    <td>${escHtml(r.vessel_ref)}</td>
    <td style="text-align:right;font-family:monospace">${r.free_so2_mg_l != null ? parseFloat(String(r.free_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.total_so2_mg_l != null ? parseFloat(String(r.total_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${r.max_permitted_mg_l != null ? parseFloat(String(r.max_permitted_mg_l)).toFixed(0) : "—"}</td>
    <td${complianceStyle}>${nonCompliant ? "⚠ Exceeds limit" : compliant ? "✓ Compliant" : "—"}</td>
    <td>${escHtml(r.test_method)}</td>
  </tr>`;
  }).join("");

  const so2Header = `<tr class="header-row"><th>Date</th><th>Stage</th><th>Vessel</th><th style="text-align:right">Free SO₂ (mg/L)</th><th style="text-align:right">Total SO₂ (mg/L)</th><th style="text-align:right">Max permitted</th><th>Compliance</th><th>Method</th></tr>`;

  // Bottling
  const bottlingRows = data.bottling.map(r => {
    const organic = r.certified_organic === true || r.certified_organic === "true";
    return `<tr>
    <td>${escHtml(fmtDate(r.bottling_date))}</td>
    <td style="font-family:monospace">${escHtml(r.lot_code)}</td>
    <td>${escHtml(r.wine_colour)}</td>
    <td style="text-align:right">${r.volume_bottled_litres != null ? parseFloat(String(r.volume_bottled_litres)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${r.bottles_produced != null ? String(r.bottles_produced) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.free_so2_mg_l != null ? parseFloat(String(r.free_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${r.actual_abv_pct != null ? `${parseFloat(String(r.actual_abv_pct)).toFixed(1)}%` : "—"}</td>
    <td>${escHtml(r.closure_type)}</td>
    <td>${organic ? "Yes" : "No"}</td>
  </tr>`;
  }).join("");

  const bottlingHeader = `<tr class="header-row"><th>Date</th><th>Lot Code</th><th>Colour</th><th style="text-align:right">Volume (L)</th><th style="text-align:right">Bottles</th><th style="text-align:right">Free SO₂ (mg/L)</th><th style="text-align:right">ABV</th><th>Closure</th><th>Organic</th></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Batch Trail — ${escHtml(batchRef)} — ${escHtml(farmName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; padding: 20px 28px; }
  h1 { font-size: 17px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 10px; margin-bottom: 14px; }
  .meta span { margin-right: 14px; }
  .section { margin-bottom: 20px; }
  h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
       color: #374151; border-bottom: 2px solid #d1d5db; padding-bottom: 4px; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; text-align: left; padding: 5px 7px; font-size: 10px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.03em; }
  td { padding: 5px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr.header-row th { border-bottom: 1px solid #d1d5db; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 16mm 14mm; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>Batch Trail Report</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Batch ref: <strong>${escHtml(batchRef)}</strong></span>
  ${vintage ? `<span>Vintage: <strong>${escHtml(vintage)}</strong></span>` : ""}
  <span>Printed: ${escHtml(printedOn)}</span>
</p>

${so2SummaryHtml}
${sectionHtml("1. Pressing record", pressingRows)}
${addRows ? sectionHtml("2. Pressing additives", addHeader + addRows) : ""}
${fermRows ? sectionHtml("3. Fermentation", fermHeader + fermRows) : ""}
${cellarRows ? sectionHtml("4. Cellar operations", cellarHeader + cellarRows) : ""}
${so2Rows ? sectionHtml("5. SO₂ tests", so2Header + so2Rows) : ""}
${bottlingRows ? sectionHtml("6. Bottling runs", bottlingHeader + bottlingRows) : ""}

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the records contained in this batch trail report are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Role</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p class="footer">Generated by BDE Farm Trac · ${escHtml(printedOn)} · Batch: ${escHtml(batchRef)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Additions Report — Print helper ─────────────────────────────────────────
function escHtml(v: unknown): string {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const SOURCE_LABELS: Record<string, string> = { pressing: "Pressing", fermentation: "Fermentation", cellar: "Cellar" };

function printAdditionsReport(
  rows: Record<string, unknown>[],
  farmName: string,
  vintageLabel: string,
) {
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const showVintage = rows.length > 0 && rows.some((r, i) => i > 0 && r.vintage_year !== rows[0].vintage_year);

  // Detect mixed SO₂ units per vintage — totals are meaningless when mg/kg and mg/L are combined
  const so2UnitsByVintage = new Map<string, Set<string>>();
  rows.filter(r => r.category === "so2").forEach(r => {
    const v = String(r.vintage_year ?? "?");
    const u = String(r.unit ?? "");
    if (!so2UnitsByVintage.has(v)) so2UnitsByVintage.set(v, new Set());
    so2UnitsByVintage.get(v)!.add(u);
  });
  const mixedUnitVintages = Array.from(so2UnitsByVintage.entries())
    .filter(([, units]) => units.size > 1)
    .map(([v]) => v)
    .sort();
  const hasMixedSo2Units = mixedUnitVintages.length > 0;
  const mixedUnitsNotice = hasMixedSo2Units
    ? `<div style="margin-bottom:14px;padding:10px 14px;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;display:flex;align-items:flex-start;gap:10px">
  <span style="font-size:16px;line-height:1.2">⚠</span>
  <div>
    <strong style="color:#92400e;font-size:12px">Mixed SO₂ units detected${mixedUnitVintages.length === 1 ? ` — vintage ${escHtml(mixedUnitVintages[0])}` : `: vintages ${mixedUnitVintages.map(escHtml).join(", ")}`}</strong>
    <p style="color:#78350f;font-size:11px;margin-top:3px">This report contains SO₂ / KMS records measured in both <strong>mg/kg</strong> (at pressing) and <strong>mg/L</strong> (post-fermentation / cellar). Total and average dose figures combine different units and <strong>cannot be compared or summed</strong>. Use the per-row <em>Unit</em> column to interpret each figure individually.</p>
  </div>
</div>`
    : "";

  const tableRows = rows.map(row => {
    const avgDose = parseFloat(String(row.avg_dose ?? 0));
    const wineColour = String(row.wine_colour ?? "");
    // Use the per-colour organic limit when the colour is known; fall back to 90 (most conservative)
    const organicLimit = parseInt(ORGANIC_MAX_SO2[wineColour] ?? "90", 10);
    const warnConv  = row.category === "so2"          && avgDose > 200;
    const warnOrg   = row.category === "so2"          && !warnConv && avgDose > organicLimit;
    const warnAsc   = row.category === "ascorbic_acid" && avgDose > 250;
    const rowStyle  = warnConv ? 'style="background:#fee2e2"'
                    : (warnOrg || warnAsc) ? 'style="background:#fef3c7"' : "";

    // limitCell contains only trusted static text + escaped unit
    const unitEsc = escHtml(row.unit ?? "mg/kg");
    let limitCell = "";
    if (warnConv)      limitCell = `<span style="color:#b91c1c;font-weight:600">⚠ Avg exceeds conv. max (200 ${unitEsc})</span>`;
    else if (warnOrg)  limitCell = `<span style="color:#92400e">⚠ Avg exceeds organic limit (${organicLimit} ${unitEsc})</span>`;
    else if (warnAsc)  limitCell = `<span style="color:#b91c1c;font-weight:600">⚠ Avg exceeds max (250 mg/L)</span>`;
    else if (row.category === "so2")          limitCell = `Conv. max 200 ${unitEsc} · Organic ${organicLimit}`;
    else if (row.category === "ascorbic_acid") limitCell = "Max 250 mg/L";

    const vintageCell = showVintage ? `<td>${escHtml(row.vintage_year ?? "—")}</td>` : "";
    const colourBadge = wineColour
      ? `<span style="display:inline-block;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#f3e8ff;color:#6b21a8">${escHtml(wineColour)}</span>`
      : `<span style="color:#9ca3af">—</span>`;
    const src = String(row.source ?? "pressing");
    const sourceLabel = SOURCE_LABELS[src] ?? src;
    const sourceBadgeStyle = src === "pressing"
      ? 'background:#ede9fe;color:#5b21b6'
      : src === "fermentation"
      ? 'background:#dbeafe;color:#1d4ed8'
      : 'background:#d1fae5;color:#065f46';
    const sourceBadge = `<span style="display:inline-block;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;${sourceBadgeStyle}">${escHtml(sourceLabel)}</span>`;
    return `<tr ${rowStyle}>
      <td style="font-weight:500">${escHtml(row.additive_name)}</td>
      ${vintageCell}
      <td>${colourBadge}</td>
      <td>${sourceBadge}</td>
      <td style="text-align:right">${escHtml(row.batch_count)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.total_dose ?? 0)).toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${avgDose.toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.min_dose ?? 0)).toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.max_dose ?? 0)).toFixed(1)}</td>
      <td style="color:#6b7280;font-size:11px">${unitEsc}</td>
      <td style="font-size:11px">${limitCell}</td>
    </tr>`;
  }).join("");

  const vintageHeader = showVintage ? "<th>Vintage</th>" : "";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Additive Usage Report — ${escHtml(farmName)} — ${escHtml(vintageLabel)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 11px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #d1d5db; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .legend { margin-top: 16px; font-size: 10px; color: #6b7280; }
  .legend span { margin-right: 14px; }
  @media print {
    body { padding: 0; }
    @page { margin: 18mm 16mm; }
  }
</style>
</head>
<body>
<h1>Additive Usage Report</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Vintage: <strong>${escHtml(vintageLabel)}</strong></span>
  <span>Printed: ${escHtml(printedOn)}</span>
  <span>${rows.length} additive row${rows.length !== 1 ? "s" : ""}</span>
  <span>Covers: pressing, fermentation &amp; cellar SO₂</span>
</p>
${mixedUnitsNotice}<table>
  <thead><tr>
    <th>Additive</th>
    ${vintageHeader}
    <th>Wine Colour</th>
    <th>Stage</th>
    <th style="text-align:right">Records</th>
    <th style="text-align:right">Total dose</th>
    <th style="text-align:right">Avg / record</th>
    <th style="text-align:right">Min</th>
    <th style="text-align:right">Max</th>
    <th>Unit</th>
    <th>Limit reference</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<p class="legend">
  <span style="color:#b91c1c">⚠ Red = average dose exceeds conventional maximum</span>
  <span style="color:#92400e">⚠ Amber = average dose exceeds organic limit (per-colour: Red 100 · White/Rosé/Orange 150 · Sparkling 185 mg/kg)</span>
  <span>Source: EU Reg 2019/934 (UK-retained law)</span>
  <span>SO₂ units vary by stage: pressing mg/kg · fermentation mg/L · cellar g</span>
</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Pressing Records Tab ─────────────────────────────────────────────────────
export function PressingRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-pressing", "winery-pressing");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: equipment = [] } = useEquipment(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const batchSettings = useWineryBatchSettings(farmId);
  const { toast } = useToast();
  const { data: farmsData } = useQuery<{ records?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmName: string = (Array.isArray(farmsData?.records)
    ? (farmsData.records.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [pressingSearch, setPressingSearch] = useState("");
  const [pressTypeOther, setPressTypeOther] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [additionsRows, setAdditionsRows] = useState<AdditionRow[]>([]);
  const [batchRefError, setBatchRefError] = useState<string | null>(null);
  const addRowCounter = useRef(0);
  const [showReport, setShowReport] = useState(false);
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  const [nameSearch, setNameSearch] = useState("");
  const { data: additionsSummary = [] } = useAdditionsSummary(farmId);
  const { data: allAdditions = [] } = useAllPressAdditions(farmId);
  const sf = (k: string, v: string | boolean) => {
    if (k === "batchRef") setBatchRefError(null);
    setForm(f => ({ ...f, [k]: v }));
  };
  const ssf = (k: string, v: string) => setSettingsForm(f => ({ ...f, [k]: v }));

  // Fetch existing additions when editing a pressing record
  const { data: fetchedAdditions } = useQuery<AdditionRow[]>({
    queryKey: ["winery-pressing-additions", farmId, editing],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/${editing}/additions`), { credentials: "include" });
      const d = await r.json();
      return (d.additions ?? []).map((a: Record<string, unknown>) => ({
        tempId: ++addRowCounter.current,
        id: a.id as number,
        additiveName: String(a.additive_name ?? ""),
        category: String(a.category ?? "other"),
        dose: String(a.dose ?? ""),
        unit: String(a.unit ?? "mg/kg"),
        notes: String(a.notes ?? ""),
      }));
    },
    enabled: editing !== null && open,
    staleTime: 0,
  });
  useEffect(() => {
    if (open && editing !== null && fetchedAdditions) setAdditionsRows(fetchedAdditions);
  }, [fetchedAdditions, open, editing]);

  // Fetch additions for the view dialog
  const { data: viewAdditions } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-additions-view", farmId, view?.id],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/${view!.id}/additions`), { credentials: "include" });
      const d = await r.json();
      return d.additions ?? [];
    },
    enabled: !!view?.id,
    staleTime: 0,
  });

  const freeRun = parseFloat(String(form.freeRunLitres || "0"));
  const press = parseFloat(String(form.pressWineLitres || "0"));
  const total = !isNaN(freeRun) && !isNaN(press) && (freeRun > 0 || press > 0) ? freeRun + press : null;
  const gPressed = parseFloat(String(form.grapesPressedKg || "0"));
  const efficiency = total !== null && gPressed > 0 ? (total / gPressed).toFixed(3) : null;
  const freeRunSep = form.freeRunSeparated !== "false" && form.freeRunSeparated !== false;
  const batchIsOrganicFlag = form.isOrganic === true || form.isOrganic === "true";

  // Compute whether any addition row breaches its applicable hard limit (used to block Save).
  const hasBlockingAdditionError = additionsRows.some(row => {
    const def = PERMITTED_ADDITIVES.find(a => a.name === row.additiveName);
    if (!def || !row.unit) return false;
    const doseVal = parseFloat(row.dose);
    if (isNaN(doseVal)) return false;
    if (batchIsOrganicFlag) {
      const orgMax = def.organicMaxPerUnit?.[row.unit];
      return orgMax !== undefined && doseVal > orgMax;
    }
    const convMax = def.maxPerUnit?.[row.unit];
    return convMax !== undefined && doseVal > convMax;
  });

  // Instruments that could be used for juice analysis
  const analysisEquipmentList = equipment.filter(e =>
    ["refractometer", "ph-meter", "hydrometer", "ripper-burette", "enzymatic-analyser", "ao-apparatus"].includes(String(e.equipment_type))
  );
  const activeVessels = vessels.filter(v => String(v.status) === "active");

  const KNOWN_PRESS_TYPES = PRESS_TYPE_OPTIONS.slice(0, -1); // all except "Other"

  const openAdd = () => {
    setEditing(null);
    setForm({ pressDate: today, vintageYear: String(new Date().getFullYear()), freeRunSeparated: "true" });
    setPressTypeOther(false);
    setAdditionsRows([]);
    setBatchRefError(null);
    setOpen(true);
  };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setPressTypeOther(!!r.press_type && !KNOWN_PRESS_TYPES.includes(String(r.press_type)));
    setOpen(true);
  };
  const save = async () => {
    setBatchRefError(null);
    const payload = { ...form, totalJuiceLitres: total != null ? String(total) : form.totalJuiceLitres, pressEfficiencyLPerKg: efficiency ?? form.pressEfficiencyLPerKg };
    let pressingId: number;
    if (editing !== null) {
      try {
        await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      } catch (err) {
        const e = err as Error & { code?: string };
        if (e.code === "DUPLICATE_BATCH_REF") {
          setBatchRefError(e.message);
        } else {
          toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
        }
        return;
      }
      pressingId = editing;
    } else {
      let result: unknown;
      try {
        result = await crud.add.mutateAsync(payload);
      } catch (err) {
        const e = err as Error & { code?: string };
        if (e.code === "DUPLICATE_BATCH_REF") {
          setBatchRefError(e.message);
        } else {
          toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
        }
        return;
      }
      pressingId = (result as { record: { id: number } }).record?.id;
      // Switch immediately into edit mode so that if the additions save below fails,
      // retrying Save updates this record rather than creating a duplicate.
      setEditing(pressingId);
    }
    // Sync structured additions (batch replace) — check response and surface errors
    const validRows = additionsRows.filter(r => r.additiveName);
    const addRes = await fetch(api(`farms/${farmId}/winery-pressing/${pressingId}/additions/batch`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ additions: validRows }),
    });
    if (!addRes.ok) {
      const e = await addRes.json().catch(() => ({}));
      toast({ title: "Additions not saved", description: String(e.error || "Failed to save additions — please check dose limits and try again."), variant: "destructive" });
      return;
    }
    toast({ title: "Saved" }); setOpen(false);
  };
  const openSettings = () => {
    const s = batchSettings.data?.settings ?? {};
    setSettingsForm({
      prefix: String(s.prefix ?? "PRESS"),
      yearFormat: String(s.year_format ?? "YYYY"),
      paddingDigits: String(s.padding_digits ?? "3"),
      nextSequence: String(s.next_sequence ?? "1"),
    });
    setSettingsOpen(true);
  };
  const saveSettings = async () => {
    try {
      await batchSettings.save.mutateAsync({
        prefix: settingsForm.prefix || "PRESS",
        yearFormat: settingsForm.yearFormat,
        paddingDigits: parseInt(settingsForm.paddingDigits || "3", 10),
        nextSequence: parseInt(settingsForm.nextSequence || "1", 10),
      });
      toast({ title: "Batch settings saved" });
      setSettingsOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filteredByYear = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const filtered = pressingSearch.trim() === ""
    ? filteredByYear
    : filteredByYear.filter(r => {
        const q = pressingSearch.trim().toLowerCase();
        return String(r.batch_ref ?? "").toLowerCase().includes(q)
          || String(r.press_date ?? "").toLowerCase().includes(q);
      });

  // ── Additions Report derived data ────────────────────────────────────────────
  const filteredSummary = yearFilter === "all" ? additionsSummary : additionsSummary.filter(r => String(r.vintage_year) === yearFilter);
  // Category filter: empty set = show all
  const availableCategories = Array.from(new Set(filteredSummary.map(r => String(r.category ?? "other")))).filter(Boolean);
  const categoryFilteredSummary = categoryFilter.size === 0
    ? filteredSummary
    : filteredSummary.filter(r => categoryFilter.has(String(r.category ?? "other")));
  const searchFilteredSummary = nameSearch.trim() === ""
    ? categoryFilteredSummary
    : categoryFilteredSummary.filter(r =>
        String(r.additive_name ?? "").toLowerCase().includes(nameSearch.trim().toLowerCase())
      );
  const showSo2Chart = categoryFilter.size === 0 || categoryFilter.has("so2");
  const so2ByVintage = new Map<string, number>();
  additionsSummary.filter(r => r.category === "so2").forEach(r => {
    const v = String(r.vintage_year ?? "?");
    so2ByVintage.set(v, (so2ByVintage.get(v) ?? 0) + parseFloat(String(r.total_dose ?? 0)));
  });
  const so2ChartData = Array.from(so2ByVintage.entries()).map(([vintage, total]) => ({ vintage, total })).sort((a, b) => a.vintage.localeCompare(b.vintage));
  // Detect mixed units across SO₂ rows — if any vintage combines mg/kg and mg/L the totals are meaningless
  const so2UnitsByVintage = new Map<string, Set<string>>();
  additionsSummary.filter(r => r.category === "so2").forEach(r => {
    const v = String(r.vintage_year ?? "?");
    const u = String(r.unit ?? "");
    if (!so2UnitsByVintage.has(v)) so2UnitsByVintage.set(v, new Set());
    so2UnitsByVintage.get(v)!.add(u);
  });
  const so2MixedUnits = Array.from(so2UnitsByVintage.values()).some(units => units.size > 1);
  const summaryCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "additive_name", label: "Additive" },
    { key: "category", label: "Category" },
    { key: "wine_colour", label: "Wine Colour" },
    { key: "source", label: "Stage", fmt: (r: Record<string, unknown>) => SOURCE_LABELS[String(r.source ?? "pressing")] ?? String(r.source ?? "pressing") },
    { key: "unit", label: "Unit" },
    { key: "batch_count", label: "Records" },
    { key: "total_dose", label: "Total Dose" },
    { key: "avg_dose", label: "Avg Dose per Record" },
    { key: "min_dose", label: "Min Dose" },
    { key: "max_dose", label: "Max Dose" },
  ];

  const transactionLogCsvCols = [
    { key: "source", label: "Source", fmt: (r: Record<string, unknown>) => SOURCE_LABELS[String(r.source ?? "pressing")] ?? String(r.source ?? "pressing") },
    { key: "vintage_year", label: "Vintage" },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "record_date", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.record_date) },
    { key: "additive_name", label: "Additive" },
    { key: "category", label: "Category" },
    { key: "dose", label: "Dose" },
    { key: "unit", label: "Unit" },
    { key: "notes", label: "Notes" },
  ];

  const filteredTransactionLog = (yearFilter === "all"
    ? allAdditions
    : allAdditions.filter((r: Record<string, unknown>) => String(r.vintage_year) === yearFilter));

  const pressCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "press_date", label: "Press Date", fmt: (r: Record<string, unknown>) => fmtDate(r.press_date) },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "is_organic", label: "Certified Organic", fmt: (r: Record<string, unknown>) => (r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) ? "Yes" : "No" },
    { key: "press_type", label: "Press Type" },
    { key: "grapes_pressed_kg", label: "Grapes Pressed (kg)" },
    { key: "free_run_litres", label: "Free Run (L)" },
    { key: "press_wine_litres", label: "Press Wine (L)" },
    { key: "total_juice_litres", label: "Total Juice (L)" },
    { key: "press_efficiency_l_per_kg", label: "Efficiency (L/kg)" },
    { key: "juice_brix", label: "Brix °" },
    { key: "juice_ph", label: "pH" },
    { key: "juice_ta_gl", label: "TA (g/L)" },
    { key: "juice_analysis_source", label: "Analysis Source" },
    { key: "settling_method", label: "Settling Method" },
    { key: "settling_vessel", label: "Settling Vessel" },
    { key: "operator_name", label: "Operator" },
    { key: "additions_at_press", label: "Additions (legacy text)" },
    { key: "notes", label: "Notes" },
    { key: "structured_additions", label: "Structured Additions", fmt: (r: Record<string, unknown>) => {
      const rows = allAdditions.filter((a: Record<string, unknown>) => a.pressing_record_id === r.id);
      if (!rows.length) return "";
      return rows.map((a: Record<string, unknown>) => `${String(a.additive_name)}: ${String(a.dose ?? "")}${a.unit ? ` ${String(a.unit)}` : ""}${a.notes ? ` (${String(a.notes)})` : ""}`).join("; ");
    }},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Pressing Records</p>
          <p className="text-xs text-muted-foreground mt-0.5">Log each pressing session — press type, grape weight in, juice yield, analysis, and settling method. One record per pressing run.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={openSettings}><Settings2 className="w-3.5 h-3.5 mr-1" />Batch Settings</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Press Record</Button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setNameSearch(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 text-xs pl-7 w-48"
            placeholder="Batch ref or date…"
            value={pressingSearch}
            onChange={e => setPressingSearch(e.target.value)}
          />
        </div>
        <Button size="sm" variant={showReport ? "default" : "outline"} className="ml-auto" onClick={() => setShowReport(v => !v)}><Beaker className="w-3.5 h-3.5 mr-1" />Additions Report</Button>
        <Button size="sm" variant="outline" onClick={() => exportCSV(filtered, "pressing-records.csv", pressCsvCols)} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Gauge} title="No pressing records yet" sub="Add a record for each pressing run to track juice yield and composition." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Press Type</th>
              <th className="text-right p-3 font-medium">Pressed (kg)</th>
              <th className="text-right p-3 font-medium">Juice (L)</th>
              <th className="text-right p-3 font-medium">L/kg</th>
              <th className="text-right p-3 font-medium">Brix °</th>
              <th className="text-right p-3 font-medium">pH</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.press_date)}</td>
                  <td className="p-3 font-mono text-xs">
                    {fmt(r.batch_ref)}
                    {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-sans"><Leaf className="w-3 h-3" />Organic</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{fmt(r.press_type)}</td>
                  <td className="p-3 text-right">{fmtNum(r.grapes_pressed_kg, 0)}</td>
                  <td className="p-3 text-right">{fmtNum(r.total_juice_litres, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.press_efficiency_l_per_kg, 3)}</td>
                  <td className="p-3 text-right">{fmtNum(r.juice_brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.juice_ph, 2)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${r.batch_ref ? "text-blue-600" : "text-muted-foreground"}`} title={r.batch_ref ? `View batch trail for ${String(r.batch_ref)}` : "No batch reference — showing full vintage trail"} onClick={() => setTrailRecord(r)}><GitBranch className="h-4 w-4" /></Button>
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

      {/* ── Batch Trail Dialog ────────────────────────────────────────────────── */}
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmName}
          onClose={() => setTrailRecord(null)}
        />
      )}

      {/* ── Additions Report Panel ────────────────────────────────────────────── */}
      {showReport && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm flex items-center gap-1.5"><Beaker className="h-4 w-4 text-muted-foreground" />Additions Report</p>
              <p className="text-xs text-muted-foreground mt-0.5">Additive usage totals across pressing batches, fermentation records, and cellar sulfiting operations. SO₂ is captured at all three winemaking stages. Use the vintage filter above to scope results.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => printAdditionsReport(searchFilteredSummary, farmName, yearFilter === "all" ? "All vintages" : yearFilter)} disabled={!searchFilteredSummary.length}><FileDown className="w-3.5 h-3.5 mr-1" />Print / Export PDF</Button>
              <Button size="sm" variant="outline" onClick={() => exportCSV(searchFilteredSummary, `pressing-additions-report-${yearFilter}.csv`, summaryCsvCols)} disabled={!searchFilteredSummary.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export Summary CSV</Button>
              <Button size="sm" variant="outline" onClick={() => exportCSV(filteredTransactionLog, `so2-transaction-log-${yearFilter}.csv`, transactionLogCsvCols)} disabled={!filteredTransactionLog.length} title="Export every individual SO₂ and additive record from pressing, fermentation, and cellar as a flat transaction log"><FileDown className="w-3.5 h-3.5 mr-1" />Transaction Log CSV</Button>
            </div>
          </div>

          {/* Category filter chips + name search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Name search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={nameSearch}
                onChange={e => setNameSearch(e.target.value)}
                placeholder="Search additive…"
                className="h-7 pl-6 pr-2 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-400 w-40"
              />
            </div>
            {availableCategories.length > 1 && (
              <>
                <span className="text-xs text-muted-foreground shrink-0">Category:</span>
                {availableCategories.map(cat => {
                  const active = categoryFilter.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(prev => {
                        const next = new Set(prev);
                        if (next.has(cat)) next.delete(cat); else next.add(cat);
                        return next;
                      })}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-background text-muted-foreground border-border hover:border-indigo-400 hover:text-indigo-700"
                      }`}
                    >
                      {ADDITIVE_CATEGORY_LABELS[cat] ?? cat}
                    </button>
                  );
                })}
                {categoryFilter.size > 0 && (
                  <button
                    onClick={() => setCategoryFilter(new Set())}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </>
            )}
          </div>

          {/* SO₂ bar chart across vintages — only shown when there is data for >1 vintage */}
          {showSo2Chart && so2ChartData.length > 1 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">SO₂ / KMS — Total dose by vintage</p>
              <p className="text-xs text-muted-foreground mb-2">Stacked total across all pressing batches per vintage. Units may differ between records — check individual rows below.</p>
              {(() => {
                const allFilteredOrganic = filtered.length > 0 && filtered.every(r => r.is_organic === true || r.is_organic === "true" || r.is_organic === 1);
                const anyFilteredOrganic = filtered.some(r => r.is_organic === true || r.is_organic === "true" || r.is_organic === 1);
                const showConvLine = !allFilteredOrganic;
                const showOrgLine = anyFilteredOrganic || !showConvLine;
                return (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={so2ChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="vintage" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: unknown) => [typeof v === "number" ? v.toFixed(1) : String(v), "Total dose"]} />
                        {showConvLine && <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="4 2" />}
                        {showOrgLine && <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 2" />}
                        <Bar dataKey="total" fill="#6366f1" radius={[3, 3, 0, 0]} name="Total SO₂ dose" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      {showConvLine && <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-red-500" />Conv. max 200 mg/kg</span>}
                      {showOrgLine && <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-amber-500" />{allFilteredOrganic ? "Organic limit 90 mg/kg" : "Organic limit 90 mg/kg (🌿 batches)"}</span>}
                    </p>
                  </>
                );
              })()}
              {so2MixedUnits && (
                <p className="mt-2 flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span><strong>Mixed units detected.</strong> Some SO₂ records for this vintage use mg/kg and others use mg/L — the stacked totals above are numerically meaningless and should not be compared directly. Check the rows below for per-record units.</span>
                </p>
              )}
            </div>
          )}

          {filteredSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No structured additions recorded{yearFilter !== "all" ? ` for ${yearFilter}` : ""}. Add additives when logging a press record.</p>
          ) : searchFilteredSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No rows match the current filters. Try a different additive name or clear the category filter.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40"><tr>
                  <th className="text-left p-2.5 font-medium">Additive</th>
                  {yearFilter === "all" && <th className="text-left p-2.5 font-medium">Vintage</th>}
                  <th className="text-left p-2.5 font-medium">Wine Colour</th>
                  <th className="text-left p-2.5 font-medium">Stage</th>
                  <th className="text-right p-2.5 font-medium">Records</th>
                  <th className="text-right p-2.5 font-medium">Total dose</th>
                  <th className="text-right p-2.5 font-medium">Avg / record</th>
                  <th className="text-right p-2.5 font-medium">Min</th>
                  <th className="text-right p-2.5 font-medium">Max</th>
                  <th className="text-left p-2.5 font-medium">Unit</th>
                  <th className="text-left p-2.5 font-medium">Limit reference</th>
                </tr></thead>
                <tbody className="divide-y">
                  {searchFilteredSummary.map((row, i) => {
                    const avgDose = parseFloat(String(row.avg_dose ?? 0));
                    const wineColour = String(row.wine_colour ?? "");
                    const organicSo2Limit = row.category === "so2"
                      ? parseFloat(ORGANIC_MAX_SO2[wineColour] ?? "90")
                      : 0;
                    const warnConventional = row.category === "so2" && avgDose > 200;
                    const warnOrganic = row.category === "so2" && !warnConventional && avgDose > organicSo2Limit;
                    const warnAscorbic = row.category === "ascorbic_acid" && avgDose > 250;
                    const hasWarn = warnConventional || warnOrganic || warnAscorbic;
                    const src = String(row.source ?? "pressing");
                    const stageBadgeClass = src === "pressing"
                      ? "bg-violet-100 text-violet-800"
                      : src === "fermentation"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800";
                    return (
                      <tr key={i} className={warnConventional ? "bg-red-50" : warnOrganic || warnAscorbic ? "bg-amber-50" : "hover:bg-muted/20"}>
                        <td className="p-2.5 font-medium">{String(row.additive_name)}</td>
                        {yearFilter === "all" && <td className="p-2.5 text-muted-foreground">{String(row.vintage_year ?? "—")}</td>}
                        <td className="p-2.5">
                          {wineColour
                            ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">{wineColour}</span>
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageBadgeClass}`}>
                            {SOURCE_LABELS[src] ?? src}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">{String(row.batch_count)}</td>
                        <td className="p-2.5 text-right font-mono">{parseFloat(String(row.total_dose ?? 0)).toFixed(1)}</td>
                        <td className="p-2.5 text-right font-mono">{avgDose.toFixed(1)}</td>
                        <td className="p-2.5 text-right font-mono">{parseFloat(String(row.min_dose ?? 0)).toFixed(1)}</td>
                        <td className="p-2.5 text-right font-mono">{parseFloat(String(row.max_dose ?? 0)).toFixed(1)}</td>
                        <td className="p-2.5 text-muted-foreground text-xs">{String(row.unit ?? "—")}</td>
                        <td className="p-2.5 text-xs">
                          {warnConventional && <span className="text-red-700 font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />Avg exceeds conv. max (200 {String(row.unit ?? "mg/kg")})</span>}
                          {warnOrganic && <span className="text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />Avg exceeds organic limit ({organicSo2Limit} {String(row.unit ?? "mg/kg")})</span>}
                          {warnAscorbic && <span className="text-red-700 font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />Avg exceeds max (250 mg/L)</span>}
                          {!hasWarn && row.category === "so2" && <span className="text-muted-foreground">{wineColour ? `Organic max ${organicSo2Limit} · conv. max 200 ${String(row.unit ?? "mg/kg")}` : `Conv. max 200 ${String(row.unit ?? "mg/kg")}`}</span>}
                          {!hasWarn && row.category === "ascorbic_acid" && <span className="text-muted-foreground">Max 250 mg/L</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Press Record</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Session</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Press Date *</Label><Input type="date" max={today} value={String(form.pressDate ?? "")} onChange={e => sf("pressDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch / Lot Reference</Label>
                <div className="relative">
                  <Input
                    value={String(form.batchRef ?? "")}
                    onChange={e => sf("batchRef", e.target.value)}
                    placeholder={editing !== null ? "e.g. PRESS-2025-001" : (batchSettings.data?.nextRef ?? "e.g. PRESS-2025-001")}
                    className={batchRefError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                </div>
                {batchRefError ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />{batchRefError}</p>
                ) : editing === null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to auto-assign <span className="font-mono text-foreground">{batchSettings.data?.nextRef ?? "…"}</span>. Override by typing a custom reference.
                  </p>
                )}
              </div>
              <div>
                <Label>Press Type</Label>
                <Select
                  value={pressTypeOther ? "Other" : String(form.pressType ?? "")}
                  onValueChange={v => { if (v === "Other") { setPressTypeOther(true); sf("pressType", ""); } else { setPressTypeOther(false); sf("pressType", v); } }}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{PRESS_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                {pressTypeOther && <Input className="mt-1.5" placeholder="Describe your press type…" value={String(form.pressType ?? "")} onChange={e => sf("pressType", e.target.value)} />}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border px-3 py-2.5">
              <Checkbox id="organic-chk" checked={form.isOrganic === true || form.isOrganic === "true"} onCheckedChange={v => sf("isOrganic", v ? "true" : "false")} className="mt-0.5" />
              <div>
                <Label htmlFor="organic-chk" className="cursor-pointer">Certified organic batch</Label>
                <p className="text-xs text-muted-foreground mt-0.5">The SO₂ warning threshold will automatically switch to the organic limit (90 mg/kg) when this is ticked.</p>
              </div>
            </div>
            <div>
              <Label>Operator</Label>
              <StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} />
              <p className="text-xs text-muted-foreground mt-1">No specific certification is required for pressing in UK winemaking — any trained winery staff member may operate the press.</p>
            </div>
            <SectionLabel>Weights & Yield</SectionLabel>
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-md border px-3 py-2.5">
                <Checkbox id="frs-chk" checked={freeRunSep} onCheckedChange={v => sf("freeRunSeparated", v ? "true" : "false")} className="mt-0.5" />
                <div>
                  <Label htmlFor="frs-chk" className="cursor-pointer">Free run and press wine kept separate</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Tick if free run juice and press fractions are collected and tracked individually.</p>
                </div>
              </div>
              {!freeRunSep && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Free run and press wine will be blended — record only the total juice volume. Combined pressing may affect quality classification and organic certification traceability.</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Grapes Pressed (kg)</Label><Input type="number" step="0.1" value={String(form.grapesPressedKg ?? "")} onChange={e => sf("grapesPressedKg", e.target.value)} /></div>
              {freeRunSep && <div><Label>Free Run (L)</Label><Input type="number" step="0.1" value={String(form.freeRunLitres ?? "")} onChange={e => sf("freeRunLitres", e.target.value)} /></div>}
              {freeRunSep && <div><Label>Press Wine (L)</Label><Input type="number" step="0.1" value={String(form.pressWineLitres ?? "")} onChange={e => sf("pressWineLitres", e.target.value)} /></div>}
              <div className={freeRunSep ? "" : "col-span-2"}>
                <Label>Total Juice (L)</Label>
                {total !== null
                  ? <div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{total.toFixed(1)} <span className="text-blue-600 text-xs">auto</span></div>
                  : <Input type="number" step="0.1" value={String(form.totalJuiceLitres ?? "")} onChange={e => sf("totalJuiceLitres", e.target.value)} />}
              </div>
              {efficiency && <div className="col-span-2"><Label>Press Efficiency</Label><div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{efficiency} L/kg <span className="text-blue-600 text-xs">auto</span></div></div>}
            </div>
            <SectionLabel>Juice Analysis</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Brix °</Label><Input type="number" step="0.1" value={String(form.juiceBrix ?? "")} onChange={e => sf("juiceBrix", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.juicePh ?? "")} onChange={e => sf("juicePh", e.target.value)} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.juiceTaGl ?? "")} onChange={e => sf("juiceTaGl", e.target.value)} /></div>
              <div>
                <Label>Turbidity</Label>
                <Select value={String(form.juiceTurbidity ?? "")} onValueChange={v => sf("juiceTurbidity", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{JUICE_TURBIDITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Analysis Source (equipment or lab)</Label>
              <Input
                list="press-analysis-equip-list"
                value={String(form.juiceAnalysisSource ?? "")}
                onChange={e => sf("juiceAnalysisSource", e.target.value)}
                placeholder="e.g. Refractometer R1 or WineServices Lab, Bristol"
              />
              {analysisEquipmentList.length > 0 && (
                <datalist id="press-analysis-equip-list">
                  {analysisEquipmentList.map(e => <option key={String(e.id)} value={String(e.equipment_ref)} />)}
                </datalist>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {analysisEquipmentList.length > 0
                  ? "Select from registered equipment above, or type an external lab name."
                  : "Record which on-site instrument or external lab provided these values. Add instruments in the Equipment Register tab."}
              </p>
            </div>
            <SectionLabel>Additions at Press</SectionLabel>
            <div className="space-y-2">
              {(form.isOrganic === true || form.isOrganic === "true") ? (
                <p className="text-xs text-muted-foreground">UK-permitted additions (retained EU Reg 2019/934). <span className="font-medium text-amber-700">Organic batch — SO₂ limit is 90 mg/kg.</span> Ascorbic acid max: 250 mg/L.</p>
              ) : (
                <p className="text-xs text-muted-foreground">UK-permitted additions (retained EU Reg 2019/934). Conventional SO₂ max: 200 mg/kg; organic limit: 90 mg/kg. Ascorbic acid max: 250 mg/L.</p>
              )}
              {additionsRows.map((row) => {
                const additiveDef = PERMITTED_ADDITIVES.find(a => a.name === row.additiveName);
                const doseVal = parseFloat(row.dose);
                const batchIsOrganic = form.isOrganic === true || form.isOrganic === "true";
                let exceedsConventional = false;
                let exceedsOrganic = false;
                if (additiveDef && !isNaN(doseVal) && row.unit) {
                  const convMax = additiveDef.maxPerUnit?.[row.unit];
                  const orgMax = additiveDef.organicMaxPerUnit?.[row.unit];
                  if (batchIsOrganic) {
                    // For organic batches: warn at organic limit; API still enforces conventional ceiling
                    if (orgMax !== undefined && doseVal > orgMax) exceedsOrganic = true;
                  } else {
                    if (convMax !== undefined && doseVal > convMax) exceedsConventional = true;
                    else if (orgMax !== undefined && doseVal > orgMax) exceedsOrganic = true;
                  }
                }
                const setRow = (k: keyof AdditionRow, v: string) =>
                  setAdditionsRows(rs => rs.map(r => r.tempId === row.tempId ? { ...r, [k]: v } : r));
                return (
                  <div key={row.tempId} className="border rounded-md p-2 space-y-1.5 bg-muted/20">
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 min-w-0">
                        <Select value={row.additiveName} onValueChange={v => {
                          const def = PERMITTED_ADDITIVES.find(a => a.name === v);
                          setAdditionsRows(rs => rs.map(r => r.tempId === row.tempId ? { ...r, additiveName: v, category: def?.category ?? "other", unit: def?.defaultUnit ?? "g/hL" } : r));
                        }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select additive…" /></SelectTrigger>
                          <SelectContent>{PERMITTED_ADDITIVES.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <Input className="w-24 h-8 text-xs" type="number" step="0.1" min="0" placeholder="Dose" value={row.dose} onChange={e => setRow("dose", e.target.value)} />
                      <Select value={row.unit} onValueChange={v => setRow("unit", v)}>
                        <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{(additiveDef?.units ?? ALL_DOSE_UNITS).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0" type="button" onClick={() => setAdditionsRows(rs => rs.filter(r => r.tempId !== row.tempId))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                    {row.additiveName === "Other" && (
                      <Input className="h-7 text-xs" placeholder="Describe additive or product…" value={row.notes} onChange={e => setRow("notes", e.target.value)} />
                    )}
                    {exceedsConventional && (
                      <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />Exceeds conventional max ({additiveDef?.maxPerUnit?.[row.unit]} {row.unit})
                      </div>
                    )}
                    {!exceedsConventional && exceedsOrganic && batchIsOrganic && (
                      <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />Exceeds organic limit ({additiveDef?.organicMaxPerUnit?.[row.unit]} {row.unit}) — cannot save for a certified organic batch
                      </div>
                    )}
                    {!exceedsConventional && exceedsOrganic && !batchIsOrganic && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />Exceeds organic limit ({additiveDef?.organicMaxPerUnit?.[row.unit]} {row.unit}) — permitted for conventional wine only
                      </div>
                    )}
                  </div>
                );
              })}
              <Button size="sm" variant="outline" type="button" onClick={() => setAdditionsRows(rs => [...rs, { tempId: ++addRowCounter.current, additiveName: "", category: "other", dose: "", unit: "mg/kg", notes: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1" />Add Additive
              </Button>
            </div>
            <SectionLabel>Settling</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Settling Method</Label>
                <Select value={String(form.settlingMethod ?? "")} onValueChange={v => sf("settlingMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SETTLING_METHOD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Settling Vessel</Label>
                {activeVessels.length > 0 ? (
                  <Select value={String(form.settlingVessel ?? "")} onValueChange={v => sf("settlingVessel", v)}>
                    <SelectTrigger><SelectValue placeholder="Select registered vessel…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {activeVessels.map(v => (
                        <SelectItem key={String(v.id)} value={String(v.vessel_ref)}>
                          {String(v.vessel_ref)}{v.vessel_type ? ` — ${String(v.vessel_type).replace(/-/g, " ")}` : ""}{v.capacity_litres ? ` (${fmtNum(v.capacity_litres, 0)} L)` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={String(form.settlingVessel ?? "")} onChange={e => sf("settlingVessel", e.target.value)} placeholder="Register vessels in Tank Register" />
                )}
                {activeVessels.length === 0 && <p className="text-xs text-muted-foreground mt-1">Register your vessels in the Tank Register tab to enable the vessel picker here.</p>}
              </div>
              <div><Label>Settling Time (hours)</Label><Input type="number" value={String(form.settlingHours ?? "")} onChange={e => sf("settlingHours", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.pressDate || crud.add.isPending || crud.edit.isPending || hasBlockingAdditionError}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Press Record — {fmtDate(view.press_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Press Date" value={fmtDate(view.press_date)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Press Type" value={fmt(view.press_type)} />
              <ViewField label="Certified Organic" value={(view.is_organic === true || view.is_organic === "true" || view.is_organic === 1) ? <span className="inline-flex items-center gap-1 text-green-700 font-medium"><ShieldCheck className="h-3.5 w-3.5" />Yes — organic SO₂ limits apply</span> : "No"} />
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              <ViewField label="Free Run Separated" value={view.free_run_separated ? "Yes" : "No"} />
              <ViewField label="Grapes Pressed" value={view.grapes_pressed_kg ? `${fmtNum(view.grapes_pressed_kg, 0)} kg` : "—"} />
              <ViewField label="Free Run" value={view.free_run_litres ? `${fmtNum(view.free_run_litres, 1)} L` : "—"} />
              <ViewField label="Press Wine" value={view.press_wine_litres ? `${fmtNum(view.press_wine_litres, 1)} L` : "—"} />
              <ViewField label="Total Juice" value={view.total_juice_litres ? `${fmtNum(view.total_juice_litres, 1)} L` : "—"} />
              <ViewField label="Press Efficiency" value={view.press_efficiency_l_per_kg ? `${fmtNum(view.press_efficiency_l_per_kg, 3)} L/kg` : "—"} />
              <ViewField label="Juice Brix °" value={fmtNum(view.juice_brix, 1)} />
              <ViewField label="Juice pH" value={fmtNum(view.juice_ph, 2)} />
              <ViewField label="Juice TA (g/L)" value={fmtNum(view.juice_ta_gl, 1)} />
              <ViewField label="Turbidity" value={fmt(view.juice_turbidity)} />
              {!!view.juice_analysis_source && <div className="col-span-2"><ViewField label="Analysis Source" value={fmt(view.juice_analysis_source)} /></div>}
              {(viewAdditions?.length ?? 0) > 0 ? (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Additions at Press</p>
                  <div className="mt-1 space-y-1">
                    {(viewAdditions ?? []).map((a, i) => (
                      <div key={i} className="flex gap-2 text-sm flex-wrap">
                        <span className="font-medium">{String(a.additive_name)}</span>
                        {(a.dose != null && a.dose !== "") && <span className="text-muted-foreground">{String(a.dose)} {String(a.unit ?? "")}</span>}
                        {!!(a.notes) && <span className="text-xs text-muted-foreground">— {String(a.notes)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : !!view.additions_at_press ? (
                <div className="col-span-2"><ViewField label="Additions at Press" value={<span className="whitespace-pre-wrap">{fmt(view.additions_at_press)}</span>} /></div>
              ) : null}
              <ViewField label="Settling Method" value={fmt(view.settling_method)} />
              <ViewField label="Settling Vessel" value={fmt(view.settling_vessel)} />
              <ViewField label="Settling Time" value={view.settling_hours ? `${view.settling_hours} hours` : "—"} />
            </div>
            {!!view.notes && <p className="text-xs text-muted-foreground mt-2 border-t pt-2 whitespace-pre-wrap">{String(view.notes)}</p>}
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-pressing" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Press Record</DialogTitle><DialogDescription>Remove press record from {fmtDate(deleting?.press_date)}?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={o => !o && setSettingsOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Winery Batch Settings</DialogTitle>
            <DialogDescription>Configure how pressing batch references are auto-generated. Leave the Batch / Lot Reference blank when adding a press record to use the next number.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Prefix</Label>
              <Input value={settingsForm.prefix ?? ""} onChange={e => ssf("prefix", e.target.value.toUpperCase())} placeholder="PRESS" maxLength={12} />
              <p className="text-xs text-muted-foreground mt-1">Short code used at the start of each reference, e.g. PRESS, LOT, VIN.</p>
            </div>
            <div>
              <Label>Year Format</Label>
              <Select value={settingsForm.yearFormat ?? "YYYY"} onValueChange={v => ssf("yearFormat", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY">Full year — YYYY (e.g. 2025)</SelectItem>
                  <SelectItem value="YY">Short year — YY (e.g. 25)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sequence Padding</Label>
              <Select value={String(settingsForm.paddingDigits ?? "3")} onValueChange={v => ssf("paddingDigits", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 digit (1, 2, 3…)</SelectItem>
                  <SelectItem value="2">2 digits (01, 02…)</SelectItem>
                  <SelectItem value="3">3 digits (001, 002…)</SelectItem>
                  <SelectItem value="4">4 digits (0001, 0002…)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Next Sequence Number</Label>
              <Input type="number" min="1" value={settingsForm.nextSequence ?? "1"} onChange={e => ssf("nextSequence", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">The number that will be issued on the next auto-generated reference. Increase to skip ahead; reduce to reset (use with care).</p>
            </div>
            {(settingsForm.prefix || settingsForm.yearFormat) && (
              <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
                <span className="text-muted-foreground text-xs">Next ref preview: </span>
                <span className="font-mono font-semibold">
                  {(settingsForm.prefix || "PRESS")}-{settingsForm.yearFormat === "YY" ? String(new Date().getFullYear()).slice(-2) : new Date().getFullYear()}-{String(settingsForm.nextSequence || "1").padStart(parseInt(settingsForm.paddingDigits || "3", 10), "0")}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={saveSettings} disabled={batchSettings.save.isPending}>
              {batchSettings.save.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Fermentation Records Tab ─────────────────────────────────────────────────
export function FermentationRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-fermentation", "winery-fermentation");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isOrganicForm, setIsOrganicForm] = useState(false);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [so2FromPressing, setSo2FromPressing] = useState(false);
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const { data: farmsDataFerm } = useQuery<{ records?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameFerm: string = (Array.isArray(farmsDataFerm?.records)
    ? (farmsDataFerm.records.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Pressing records sorted newest-first for the link select
  const sortedPressingRecords = [...pressingRecords]
    .filter(r => r.batch_ref)
    .sort((a, b) => String(b.press_date ?? "").localeCompare(String(a.press_date ?? "")));

  const handlePressingLinkChange = async (val: string) => {
    sf("pressingRecordId", val);
    setSo2FromPressing(false);
    if (!val) return;
    const match = pressingRecords.find(p => String(p.id) === val);
    if (!match) return;
    // Auto-fill batch ref and vintage year when linking a pressing record
    if (!form.batchRef && match.batch_ref) sf("batchRef", String(match.batch_ref));
    if (!form.vintageYear && match.vintage_year) sf("vintageYear", String(match.vintage_year));
    if (!form.wineColour && match.wine_colour) sf("wineColour", String(match.wine_colour));
    // Inherit organic status from pressing record (user can override manually)
    setIsOrganicForm(!!(match.is_organic === true || match.is_organic === "true"));
    // Fetch pressing additions and pre-fill SO₂ if the field is currently empty
    try {
      const res = await fetch(api(`farms/${farmId}/winery-pressing/${val}/additions`), { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        const additions: Record<string, unknown>[] = d.additions ?? [];
        const so2Row = additions.find(a => String(a.category ?? "") === "so2");
        if (so2Row && so2Row.dose != null) {
          setForm(f => {
            if (f.so2AtFermentationMgL) return f; // don't overwrite if user already entered a value
            setSo2FromPressing(true);
            return { ...f, so2AtFermentationMgL: String(so2Row.dose) };
          });
        }
      }
    } catch {
      // non-critical — silently skip if fetch fails
    }
  };

  const openAdd = () => { setEditing(null); setForm({ vintageYear: String(new Date().getFullYear()) }); setIsOrganicForm(false); setSo2FromPressing(false); setOpen(true); };
  const openEdit = async (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm(Object.fromEntries(Object.entries(r).filter(([k]) => k !== "is_organic").map(([k, v]) => [k, v == null ? "" : String(v)])));
    setIsOrganicForm(!!(r.is_organic === true || r.is_organic === "true"));
    setSo2FromPressing(false);
    setOpen(true);
    // If the record is already linked to a pressing batch and has an SO₂ value,
    // check whether that value matches the pressing batch's SO₂ dose so we can
    // show the 'from pressing' badge without the user having to re-select.
    if (r.pressing_record_id && r.so2_at_fermentation_mg_l != null && r.so2_at_fermentation_mg_l !== "") {
      try {
        const res = await fetch(api(`farms/${farmId}/winery-pressing/${r.pressing_record_id}/additions`), { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          const additions: Record<string, unknown>[] = d.additions ?? [];
          const so2Row = additions.find(a => String(a.category ?? "") === "so2");
          if (so2Row && so2Row.dose != null) {
            const pressingDose = parseFloat(String(so2Row.dose));
            const savedDose = parseFloat(String(r.so2_at_fermentation_mg_l));
            if (!isNaN(pressingDose) && !isNaN(savedDose) && pressingDose === savedDose) {
              setSo2FromPressing(true);
            }
          }
        }
      } catch {
        // non-critical — silently skip if fetch fails
      }
    }
  };
  const save = async () => {
    try {
      const payload = { ...form, isOrganic: isOrganicForm };
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filtered = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const fermentCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "wine_colour", label: "Wine Colour" },
    { key: "is_organic", label: "Organic", fmt: (r: Record<string, unknown>) => (r.is_organic === true || r.is_organic === "true") ? "Yes" : "No" },
    { key: "volume_litres", label: "Volume (L)" },
    { key: "fermentation_type", label: "Fermentation Type" },
    { key: "yeast_strain", label: "Yeast Strain" },
    { key: "inoculation_date", label: "Inoculation Date", fmt: (r: Record<string, unknown>) => fmtDate(r.inoculation_date) },
    { key: "start_date", label: "Start Date", fmt: (r: Record<string, unknown>) => fmtDate(r.start_date) },
    { key: "end_date", label: "End Date", fmt: (r: Record<string, unknown>) => fmtDate(r.end_date) },
    { key: "start_brix", label: "Start Brix" },
    { key: "end_brix", label: "End Brix" },
    { key: "end_sg", label: "End SG" },
    { key: "residual_sugar_gl", label: "Residual Sugar (g/L)" },
    { key: "max_temp_c", label: "Max Temp (°C)" },
    { key: "min_temp_c", label: "Min Temp (°C)" },
    { key: "so2_at_fermentation_mg_l", label: "SO₂ at Fermentation (mg/L)" },
    { key: "operator_name", label: "Operator" },
    { key: "notes", label: "Notes" },
  ];

  const fermentStatus = (r: Record<string, unknown>) => {
    if (r.end_date) return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Complete</span>;
    if (r.start_date) return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Active</span>;
    return <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Pending</span>;
  };

  const brixChartData = filtered.filter(r => r.start_brix || r.end_brix).map(r => ({
    batch: String(r.batch_ref ?? r.id).slice(0, 12),
    "Start Brix": r.start_brix ? parseFloat(String(r.start_brix)) : null,
    "End Brix": r.end_brix ? parseFloat(String(r.end_brix)) : null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Fermentation Records</p>
          <p className="text-xs text-muted-foreground mt-0.5">Track each fermentation batch from inoculation to dryness. One record per batch per vessel. Links to your Tank Register for vessel assignment.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Fermentation</Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => exportCSV(filtered, "fermentation-records.csv", fermentCsvCols)} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} batch{filtered.length !== 1 ? "es" : ""}</span>
      </div>
      {brixChartData.length > 1 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Start vs End Brix by Batch</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={brixChartData} margin={{ top: 4, right: 12, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="batch" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} width={32} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Start Brix" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="End Brix" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Beaker} title="No fermentation records yet" sub="Add a record when you begin each fermentation batch." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Vintage</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Colour</th>
              <th className="text-left p-3 font-medium">Vessel</th>
              <th className="text-left p-3 font-medium">Start</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Start Brix</th>
              <th className="text-right p-3 font-medium">End Brix</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3">{fmt(r.vintage_year)}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.batch_ref)}</td>
                  <td className="p-3">
                    {r.wine_colour ? <span className="text-xs bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">{String(r.wine_colour)}</span> : "—"}
                    {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-sans"><Leaf className="w-3 h-3" />Organic</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">{fmt(r.vessel_ref ?? vessels.find(v => v.id === r.vessel_id)?.vessel_ref)}</td>
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.start_date)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{r.fermentation_type ? String(r.fermentation_type).split(" ")[0] : "—"}</td>
                  <td className="p-3 text-right">{fmtNum(r.start_brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.end_brix, 1)}</td>
                  <td className="p-3">{fermentStatus(r)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${r.batch_ref ? "text-blue-600" : "text-muted-foreground"}`} title={r.batch_ref ? `View batch trail for ${String(r.batch_ref)}` : "No batch reference — showing full vintage trail"} onClick={() => setTrailRecord(r)}><GitBranch className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Fermentation Record</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Batch identity</SectionLabel>
            {sortedPressingRecords.length > 0 && (
              <div>
                <Label>Link to Pressing Batch</Label>
                <Select value={String(form.pressingRecordId ?? "")} onValueChange={handlePressingLinkChange}>
                  <SelectTrigger><SelectValue placeholder="— Not linked to a pressing record —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Not linked —</SelectItem>
                    {sortedPressingRecords.map(p => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>
                        {String(p.batch_ref)}{p.is_organic === true || p.is_organic === "true" ? " 🌿" : ""}{p.vintage_year ? ` (${String(p.vintage_year)})` : ""}{p.press_date ? ` — ${new Date(String(p.press_date)).toLocaleDateString("en-GB")}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Linking a pressing batch makes its additions visible here and inherits the organic status.</p>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox
                id="ferm-organic-chk"
                checked={isOrganicForm}
                onCheckedChange={v => setIsOrganicForm(!!v)}
              />
              <div>
                <Label htmlFor="ferm-organic-chk" className="cursor-pointer">Organic batch</Label>
                <p className="text-xs text-muted-foreground">Automatically inherited from linked pressing record — you can override manually.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch / Lot Reference</Label>
                <Input
                  value={form.batchRef ?? ""}
                  onChange={e => sf("batchRef", e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
              </div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vessel</Label>
                <Select value={form.vesselId ?? ""} onValueChange={v => sf("vesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent>{vessels.filter(v => v.status === "active").map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}{v.vessel_type ? ` — ${String(v.vessel_type)}` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Volume (L)</Label><Input type="number" step="0.1" value={form.volumeLitres ?? ""} onChange={e => sf("volumeLitres", e.target.value)} /></div>
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <SectionLabel>Fermentation type</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Fermentation Type</Label>
                <Select value={form.fermentationType ?? ""} onValueChange={v => sf("fermentationType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{FERMENTATION_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Yeast Strain</Label><Input value={form.yeastStrain ?? ""} onChange={e => sf("yeastStrain", e.target.value)} placeholder="e.g. EC1118, Zymaflore F10, Wild" /></div>
              <div><Label>Inoculation Date</Label><Input type="date" max={today} value={form.inoculationDate ?? ""} onChange={e => sf("inoculationDate", e.target.value)} /></div>
              <div><Label>Inoculation Temp (°C)</Label><Input type="number" step="0.1" value={form.inoculationTempC ?? ""} onChange={e => sf("inoculationTempC", e.target.value)} /></div>
            </div>
            <SectionLabel>Fermentation progress</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" max={today} value={form.startDate ?? ""} onChange={e => sf("startDate", e.target.value)} /></div>
              <div><Label>Start Brix °</Label><Input type="number" step="0.1" value={form.startBrix ?? ""} onChange={e => sf("startBrix", e.target.value)} /></div>
              <div><Label>End Brix °</Label><Input type="number" step="0.01" value={form.endBrix ?? ""} onChange={e => sf("endBrix", e.target.value)} /></div>
              <div><Label>End SG</Label><Input type="number" step="0.0001" value={form.endSg ?? ""} onChange={e => sf("endSg", e.target.value)} placeholder="e.g. 0.9940" /></div>
              <div><Label>Residual Sugar (g/L)</Label><Input type="number" step="0.1" value={form.residualSugarGl ?? ""} onChange={e => sf("residualSugarGl", e.target.value)} /></div>
              <div><Label>End Date</Label><Input type="date" max={today} value={form.endDate ?? ""} onChange={e => sf("endDate", e.target.value)} /></div>
              <div><Label>Max Temp (°C)</Label><Input type="number" step="0.1" value={form.maxTempC ?? ""} onChange={e => sf("maxTempC", e.target.value)} /></div>
              <div><Label>Min Temp (°C)</Label><Input type="number" step="0.1" value={form.minTempC ?? ""} onChange={e => sf("minTempC", e.target.value)} /></div>
            </div>
            <div><Label>Nutrient additions</Label><Input value={form.nutrientAdditions ?? ""} onChange={e => sf("nutrientAdditions", e.target.value)} placeholder="e.g. DAP 20g/hL at inoculation, Thiamine..." /></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label>SO₂ addition at fermentation (mg/L)</Label>
                {so2FromPressing && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    from pressing
                  </span>
                )}
              </div>
              <Input
                type="number"
                step="0.1"
                value={form.so2AtFermentationMgL ?? ""}
                onChange={e => { setSo2FromPressing(false); sf("so2AtFermentationMgL", e.target.value); }}
              />
              {(() => {
                if (!isOrganicForm || !form.wineColour) return null;
                const orgLimit = ORGANIC_MAX_SO2[form.wineColour];
                if (!orgLimit) return null;
                const dose = parseFloat(form.so2AtFermentationMgL ?? "");
                const exceeds = !isNaN(dose) && dose > parseFloat(orgLimit);
                return exceeds ? (
                  <p className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Exceeds organic total SO₂ limit for {form.wineColour} ({orgLimit} mg/L)
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 mt-1">
                    <Leaf className="inline h-3 w-3 mr-0.5" />Organic limit for {form.wineColour}: {orgLimit} mg/L total SO₂ — monitor cumulative additions across all stages.
                  </p>
                );
              })()}
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Fermentation — {fmt(view.batch_ref) !== "—" ? String(view.batch_ref) : `Vintage ${String(view.vintage_year)}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
              <ViewField label="Organic" value={(view.is_organic === true || view.is_organic === "true") ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">✓ Organic</span> : <span className="text-muted-foreground text-xs">No</span>} />
              <ViewField label="Vessel" value={fmt(view.vessel_ref ?? vessels.find(v => v.id === view.vessel_id)?.vessel_ref)} />
              <ViewField label="Volume (L)" value={fmtNum(view.volume_litres, 0)} />
              <ViewField label="Fermentation Type" value={fmt(view.fermentation_type)} />
              <ViewField label="Yeast Strain" value={fmt(view.yeast_strain)} />
              <ViewField label="Inoculation Date" value={fmtDate(view.inoculation_date)} />
              <ViewField label="Inoculation Temp" value={view.inoculation_temp_c ? `${fmtNum(view.inoculation_temp_c, 1)} °C` : "—"} />
              <ViewField label="Start Date" value={fmtDate(view.start_date)} />
              <ViewField label="Start Brix °" value={fmtNum(view.start_brix, 1)} />
              <ViewField label="End Brix °" value={fmtNum(view.end_brix, 2)} />
              <ViewField label="End SG" value={fmtNum(view.end_sg, 4)} />
              <ViewField label="End Date" value={fmtDate(view.end_date)} />
              <ViewField label="Residual Sugar" value={view.residual_sugar_gl ? `${fmtNum(view.residual_sugar_gl, 1)} g/L` : "—"} />
              <ViewField label="Max Temp" value={view.max_temp_c ? `${fmtNum(view.max_temp_c, 1)} °C` : "—"} />
              <ViewField label="Min Temp" value={view.min_temp_c ? `${fmtNum(view.min_temp_c, 1)} °C` : "—"} />
              <ViewField label="SO₂ at Fermentation" value={view.so2_at_fermentation_mg_l ? `${fmtNum(view.so2_at_fermentation_mg_l, 0)} mg/L` : "—"} />
              {!!view.nutrient_additions && <div className="col-span-2"><ViewField label="Nutrient Additions" value={fmt(view.nutrient_additions)} /></div>}
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {/* Pressing additions — shown when this fermentation record is linked to a pressing batch */}
            {!!view.pressing_record_id && (() => {
              const additions = Array.isArray(view.pressing_additions) ? view.pressing_additions as Record<string, unknown>[] : [];
              // Find the pressing SO₂ addition for the SO₂ baseline callout
              const pressingSo2 = additions.find(a => String(a.category ?? "") === "so2");
              return (
                <div className="border-t pt-3 mt-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Additions added at pressing
                    {view.pressing_batch_ref ? ` — Batch ${String(view.pressing_batch_ref)}` : ""}
                    {view.pressing_press_date ? ` (${fmtDate(view.pressing_press_date)})` : ""}
                  </p>
                  {pressingSo2 && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                      <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <strong>SO₂ baseline at pressing:</strong>{" "}
                        {pressingSo2.dose != null ? `${String(pressingSo2.dose)} ${String(pressingSo2.unit ?? "")}` : "recorded"}
                        {pressingSo2.additive_name ? ` — ${String(pressingSo2.additive_name)}` : ""}
                      </span>
                    </div>
                  )}
                  {additions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No structured additions recorded for the linked pressing batch.</p>
                  ) : (
                    <div className="rounded-md border overflow-hidden text-xs">
                      <table className="w-full">
                        <thead className="bg-muted/40"><tr>
                          <th className="text-left p-2 font-medium">Additive</th>
                          <th className="text-left p-2 font-medium">Category</th>
                          <th className="text-right p-2 font-medium">Dose</th>
                          <th className="text-left p-2 font-medium">Unit</th>
                          <th className="text-left p-2 font-medium">Notes</th>
                        </tr></thead>
                        <tbody className="divide-y">
                          {additions.map((a, i) => (
                            <tr key={String(a.id ?? i)} className="hover:bg-muted/20">
                              <td className="p-2 font-medium">{fmt(a.additive_name)}</td>
                              <td className="p-2 text-muted-foreground">{fmt(a.category)}</td>
                              <td className="p-2 text-right font-mono">{fmt(a.dose)}</td>
                              <td className="p-2">{fmt(a.unit)}</td>
                              <td className="p-2 text-muted-foreground">{fmt(a.notes)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-fermentation" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Fermentation Record</DialogTitle><DialogDescription>Remove this fermentation batch record? Cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameFerm}
          onClose={() => setTrailRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Vessel Register Tab ──────────────────────────────────────────────────────
function VesselCleanRow({ farmId, vesselId }: { farmId: number; vesselId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-vessel-cleans", farmId, vesselId],
    queryFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/cleans`), { credentials: "include" }); return (await r.json()).records ?? []; },
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
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No cleaning records yet.</p> : (
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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Tank & Vessel Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Register all winery vessels — tanks, barrels, amphorae — with capacity, current contents, and cleaning history. Used as a reference in fermentation, cellar ops, SO₂ testing, and bottling records.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "vessels.csv", vesselCsvCols)} disabled={!crud.data.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Vessel</Button>
        </div>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
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
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {crud.data.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 font-mono font-semibold">{fmt(r.vessel_ref)}</td>
                  <td className="p-3 text-muted-foreground">{fmt(r.vessel_type)}</td>
                  <td className="p-3 text-right">{fmtNum(r.capacity_litres, 0)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{fmt(r.location)}</td>
                  <td className="p-3">{fmt(r.current_contents)}</td>
                  <td className="p-3 text-right">{r.current_volume_litres ? fmtNum(r.current_volume_litres, 0) : "—"}</td>
                  <td className="p-3">{statusBadge(r.status)}</td>
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
                </>
              )}
              <ViewField label="Current Contents" value={fmt(view.current_contents)} />
              <ViewField label="Current Volume" value={view.current_volume_litres ? `${fmtNum(view.current_volume_litres, 0)} L` : "—"} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
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
export function CellarOpsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-cellar-ops", "winery-cellar-ops");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [opFilter, setOpFilter] = useState("all");
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const { data: farmsDataCellar } = useQuery<{ records?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameCellar: string = (Array.isArray(farmsDataCellar?.records)
    ? (farmsDataCellar.records.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cellarPressingRefs = pressingRecords
    .filter(r => r.batch_ref)
    .map(r => ({ batchRef: String(r.batch_ref), vintageYear: String(r.vintage_year ?? ""), wineColour: String(r.wine_colour ?? ""), isOrganic: !!(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) }))
    .sort((a, b) => b.batchRef.localeCompare(a.batchRef));

  const handleCellarBatchRefChange = (val: string) => {
    sf("batchRef", val);
    const match = cellarPressingRefs.find(p => p.batchRef === val);
    if (match) {
      if (!form.vintageYear) sf("vintageYear", match.vintageYear);
      if (!form.wineColour && match.wineColour) sf("wineColour", match.wineColour);
      sf("_batchIsOrganic", match.isOrganic ? "true" : "false");
    } else {
      sf("_batchIsOrganic", "");
    }
  };

  // Organic SO₂ hint for cellar sulfiting form
  const cellarBatchIsOrganic = form._batchIsOrganic === "true";
  const cellarWineColour = form.wineColour ?? "";
  const cellarOrgLimit = cellarBatchIsOrganic && cellarWineColour ? ORGANIC_MAX_SO2[cellarWineColour] : null;
  const cellarFreeSo2After = form.freeSo2AfterMgL ? parseFloat(form.freeSo2AfterMgL) : null;
  const cellarSo2OverOrganic = cellarOrgLimit != null && cellarFreeSo2After != null && cellarFreeSo2After > parseFloat(cellarOrgLimit);

  const opType = form.opType ?? "";
  const isRacking = opType === "racking";
  const isTopping = opType === "topping";
  const isSulfiting = opType === "sulfiting";
  const isFining = opType === "fining";
  const isFiltering = opType === "filtering";
  const vRef = (id: unknown) => vessels.find(v => String(v.id) === String(id))?.vessel_ref ?? id;

  const openAdd = () => { setEditing(null); setForm({ opDate: today, vintageYear: String(new Date().getFullYear()) }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    if (!form.opType) { toast({ title: "Please select an operation type", variant: "destructive" }); return; }
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...form } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(form);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filtered = crud.data
    .filter(r => yearFilter === "all" || String(r.vintage_year) === yearFilter)
    .filter(r => opFilter === "all" || String(r.op_type) === opFilter);
  const cellarCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "op_date", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.op_date) },
    { key: "op_type", label: "Operation Type" },
    { key: "volume_l", label: "Volume (L)" },
    { key: "product_used", label: "Product Used" },
    { key: "quantity_used", label: "Quantity Used" },
    { key: "so2_added_mg_l", label: "SO₂ Added (mg/L)" },
    { key: "operator_name", label: "Operator" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Cellar Operations Log</p>
          <p className="text-xs text-muted-foreground mt-0.5">Record all winemaking interventions — racking, topping, sulfiting, fining, filtering, and cold stabilisation. The SO₂ addition records here feed into your SO₂ compliance audit trail.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Operation</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">Operation:</span>
        <Select value={opFilter} onValueChange={setOpFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All types</SelectItem>{CELLAR_OP_TYPES.map(o => <SelectItem key={o} value={o}>{CELLAR_OP_LABELS[o]}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => exportCSV(filtered, "cellar-ops.csv", cellarCsvCols)} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Wrench} title="No cellar operations logged" sub="Log racking, topping, sulfiting and other interventions here." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Colour</th>
              <th className="text-left p-3 font-medium">Operation</th>
              <th className="text-left p-3 font-medium">From</th>
              <th className="text-left p-3 font-medium">To</th>
              <th className="text-left p-3 font-medium">Detail</th>
              <th className="text-left p-3 font-medium">Operator</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => {
                const detail = r.op_type === "sulfiting" ? (r.free_so2_before_mg_l ? `${fmtNum(r.free_so2_before_mg_l, 0)}→${fmtNum(r.free_so2_after_mg_l, 0)} mg/L` : r.so2_quantity_g ? `${fmtNum(r.so2_quantity_g, 1)} g SO₂` : "") : r.op_type === "topping" ? (r.top_up_volume_litres ? `${fmtNum(r.top_up_volume_litres, 1)} L` : "") : r.op_type === "fining" ? fmt(r.fining_agent) : r.op_type === "filtering" ? fmt(r.filter_type) : "";
                return (
                  <tr key={String(r.id)} className="hover:bg-muted/20">
                    <td className="p-3 whitespace-nowrap">{fmtDate(r.op_date)}</td>
                    <td className="p-3 font-mono text-xs">
                    {fmt(r.batch_ref)}
                    {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-sans"><Leaf className="w-3 h-3" />Organic</span>
                    )}
                  </td>
                    <td className="p-3 text-xs text-muted-foreground">{r.wine_colour ? fmt(r.wine_colour) : "—"}</td>
                    <td className="p-3"><span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">{CELLAR_OP_LABELS[String(r.op_type)] ?? fmt(r.op_type)}</span></td>
                    <td className="p-3 font-mono text-xs">{fmt(r.from_vessel_ref ?? vRef(r.from_vessel_id))}</td>
                    <td className="p-3 font-mono text-xs">{fmt(r.to_vessel_ref ?? vRef(r.to_vessel_id))}</td>
                    <td className="p-3 text-muted-foreground text-xs">{detail}</td>
                    <td className="p-3 text-muted-foreground">{fmt(r.operator_name)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" className={`h-7 w-7 ${r.batch_ref ? "text-blue-600" : "text-muted-foreground"}`} title={r.batch_ref ? `View batch trail for ${String(r.batch_ref)}` : "No batch reference — showing full vintage trail"} onClick={() => setTrailRecord(r)}><GitBranch className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Log"} Cellar Operation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Operation Date *</Label><Input type="date" max={today} value={form.opDate ?? ""} onChange={e => sf("opDate", e.target.value)} /></div>
              <div>
                <Label>Operation Type *</Label>
                <Select value={form.opType ?? ""} onValueChange={v => sf("opType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select operation" /></SelectTrigger>
                  <SelectContent>{CELLAR_OP_TYPES.map(o => <SelectItem key={o} value={o}>{CELLAR_OP_LABELS[o]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select colour" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Not specified —</SelectItem>
                    {WINE_COLOUR_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Batch Reference</Label>
                <Input
                  list="cellar-pressing-refs"
                  value={form.batchRef ?? ""}
                  onChange={e => handleCellarBatchRefChange(e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
                {cellarPressingRefs.length > 0 && (
                  <datalist id="cellar-pressing-refs">
                    {cellarPressingRefs.map(p => (
                      <option key={p.batchRef} value={p.batchRef} label={p.vintageYear ? `Vintage ${p.vintageYear}` : undefined} />
                    ))}
                  </datalist>
                )}
                {cellarPressingRefs.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Select a pressing batch ref to link, or type a custom reference.</p>
                )}
              </div>
              <div>
                <Label>{isTopping ? "Top-up Source Vessel" : "From Vessel"}</Label>
                <Select value={form.fromVesselId ?? ""} onValueChange={v => sf("fromVesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!isTopping && (
                <div>
                  <Label>To Vessel</Label>
                  <Select value={form.toVesselId ?? ""} onValueChange={v => sf("toVesselId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                    <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {(isRacking || !opType) && <div><Label>Volume Moved (L)</Label><Input type="number" step="0.1" value={form.volumeMovedLitres ?? ""} onChange={e => sf("volumeMovedLitres", e.target.value)} /></div>}
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            {isRacking && (
              <>
                <SectionLabel>Racking details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Clarity Before</Label><Input value={form.clarityBefore ?? ""} onChange={e => sf("clarityBefore", e.target.value)} placeholder="e.g. Hazy with lees" /></div>
                  <div><Label>Clarity After</Label><Input value={form.clarityAfter ?? ""} onChange={e => sf("clarityAfter", e.target.value)} placeholder="e.g. Bright" /></div>
                  <div><Label>Lees Depth (cm)</Label><Input type="number" step="0.1" value={form.leesDepthCm ?? ""} onChange={e => sf("leesDepthCm", e.target.value)} /></div>
                </div>
              </>
            )}
            {isTopping && (
              <>
                <SectionLabel>Topping up details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Top-up Volume (L)</Label><Input type="number" step="0.1" value={form.topUpVolumeLitres ?? ""} onChange={e => sf("topUpVolumeLitres", e.target.value)} /></div>
                  <div><Label>Source of top-up wine</Label><Input value={form.topUpSource ?? ""} onChange={e => sf("topUpSource", e.target.value)} placeholder="e.g. Same batch, Barrel T-spare" /></div>
                </div>
              </>
            )}
            {isSulfiting && (
              <>
                <SectionLabel>Sulfiting details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>SO₂ Product</Label><Input value={form.so2Product ?? ""} onChange={e => sf("so2Product", e.target.value)} placeholder="e.g. Potassium Metabisulphite" /></div>
                  <div><Label>SO₂ Added (g)</Label><Input type="number" step="0.01" value={form.so2QuantityG ?? ""} onChange={e => sf("so2QuantityG", e.target.value)} /></div>
                  <div><Label>Free SO₂ Before (mg/L)</Label><Input type="number" step="0.1" value={form.freeSo2BeforeMgL ?? ""} onChange={e => sf("freeSo2BeforeMgL", e.target.value)} /></div>
                  <div><Label>Free SO₂ After (mg/L)</Label><Input type="number" step="0.1" value={form.freeSo2AfterMgL ?? ""} onChange={e => sf("freeSo2AfterMgL", e.target.value)} /></div>
                </div>
                {cellarBatchIsOrganic && cellarOrgLimit && (
                  <div className={`rounded-md border px-3 py-2 text-sm flex items-start gap-2 ${cellarSo2OverOrganic ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-200 text-green-800"}`}>
                    {cellarSo2OverOrganic ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" /> : <Leaf className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />}
                    <span>
                      <strong>Organic batch</strong> — {cellarWineColour} ceiling: <strong>{cellarOrgLimit} mg/L</strong> free SO₂.
                      {cellarSo2OverOrganic && cellarFreeSo2After != null && (
                        <> The entered post-addition value ({cellarFreeSo2After.toFixed(1)} mg/L) exceeds the organic limit. Review before saving.</>
                      )}
                      {!cellarSo2OverOrganic && <> This addition is within the organic limit.</>}
                    </span>
                  </div>
                )}
              </>
            )}
            {isFining && (
              <>
                <SectionLabel>Fining details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Fining Agent</Label><Input value={form.finingAgent ?? ""} onChange={e => sf("finingAgent", e.target.value)} placeholder="e.g. Bentonite, Casein, Isinglass" /></div>
                  <div><Label>Dose</Label><Input value={form.finingDose ?? ""} onChange={e => sf("finingDose", e.target.value)} placeholder="e.g. 50 g/hL" /></div>
                  <div><Label>Contact Time (hours)</Label><Input type="number" value={form.contactTimeHours ?? ""} onChange={e => sf("contactTimeHours", e.target.value)} /></div>
                  <div><Label>Volume moved (L)</Label><Input type="number" step="0.1" value={form.volumeMovedLitres ?? ""} onChange={e => sf("volumeMovedLitres", e.target.value)} /></div>
                </div>
              </>
            )}
            {isFiltering && (
              <>
                <SectionLabel>Filtering details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Filter Type</Label><Input value={form.filterType ?? ""} onChange={e => sf("filterType", e.target.value)} placeholder="e.g. Plate filter, Crossflow, DE" /></div>
                  <div><Label>Filter Pore Size (µm)</Label><Input type="number" step="0.01" value={form.filterPoreUm ?? ""} onChange={e => sf("filterPoreUm", e.target.value)} /></div>
                  <div><Label>Volume Filtered (L)</Label><Input type="number" step="0.1" value={form.volumeMovedLitres ?? ""} onChange={e => sf("volumeMovedLitres", e.target.value)} /></div>
                  <div><Label>Clarity Before</Label><Input value={form.clarityBefore ?? ""} onChange={e => sf("clarityBefore", e.target.value)} /></div>
                  <div><Label>Clarity After</Label><Input value={form.clarityAfter ?? ""} onChange={e => sf("clarityAfter", e.target.value)} /></div>
                </div>
              </>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.opDate || !form.opType || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{CELLAR_OP_LABELS[String(view.op_type)] ?? fmt(view.op_type)} — {fmtDate(view.op_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Date" value={fmtDate(view.op_date)} />
              <ViewField label="Operation" value={CELLAR_OP_LABELS[String(view.op_type)] ?? fmt(view.op_type)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              {!!view.wine_colour && <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />}
              <ViewField label="From Vessel" value={fmt(view.from_vessel_ref ?? vRef(view.from_vessel_id))} />
              <ViewField label="To Vessel" value={fmt(view.to_vessel_ref ?? vRef(view.to_vessel_id))} />
              {!!view.volume_moved_litres && <ViewField label="Volume" value={`${fmtNum(view.volume_moved_litres, 1)} L`} />}
              {!!view.lees_depth_cm && <ViewField label="Lees Depth" value={`${fmtNum(view.lees_depth_cm, 1)} cm`} />}
              {!!view.top_up_volume_litres && <ViewField label="Top-up Volume" value={`${fmtNum(view.top_up_volume_litres, 1)} L`} />}
              {!!view.top_up_source && <ViewField label="Top-up Source" value={fmt(view.top_up_source)} />}
              {!!view.so2_product && <ViewField label="SO₂ Product" value={fmt(view.so2_product)} />}
              {!!view.so2_quantity_g && <ViewField label="SO₂ Added" value={`${fmtNum(view.so2_quantity_g, 2)} g`} />}
              {!!view.free_so2_before_mg_l && <ViewField label="Free SO₂ Before" value={`${fmtNum(view.free_so2_before_mg_l, 0)} mg/L`} />}
              {!!view.free_so2_after_mg_l && <ViewField label="Free SO₂ After" value={`${fmtNum(view.free_so2_after_mg_l, 0)} mg/L`} />}
              {!!view.fining_agent && <ViewField label="Fining Agent" value={fmt(view.fining_agent)} />}
              {!!view.fining_dose && <ViewField label="Fining Dose" value={fmt(view.fining_dose)} />}
              {!!view.contact_time_hours && <ViewField label="Contact Time" value={`${view.contact_time_hours} hours`} />}
              {!!view.filter_type && <ViewField label="Filter Type" value={fmt(view.filter_type)} />}
              {!!view.filter_pore_um && <ViewField label="Filter Pore" value={`${fmtNum(view.filter_pore_um, 2)} µm`} />}
              {!!view.clarity_before && <ViewField label="Clarity Before" value={fmt(view.clarity_before)} />}
              {!!view.clarity_after && <ViewField label="Clarity After" value={fmt(view.clarity_after)} />}
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-cellar-op" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Operation</DialogTitle><DialogDescription>Remove this {CELLAR_OP_LABELS[String(deleting?.op_type)] ?? "cellar operation"} record?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameCellar}
          onClose={() => setTrailRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Bottling Records Tab ─────────────────────────────────────────────────────
export function BottlingRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-bottling", "winery-bottling");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [so2FromTest, setSo2FromTest] = useState(false);
  const [phTaFromAnalysis, setPhTaFromAnalysis] = useState(false);
  const [organicAutoSource, setOrganicAutoSource] = useState<"fermentation" | "pressing" | null>(null);
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const [lotCodeError, setLotCodeError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importParsed, setImportParsed] = useState<Record<string, string>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ insertedCount: number; rejectedCount: number; rejected: { row: number; lotCode: string; reason: string }[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const CSV_IMPORT_HEADERS = ["Bottling Date", "Vintage", "Batch Ref", "Lot Code", "Wine Colour", "Organic (Yes/No)", "Volume Bottled (L)", "Bottle Size (ml)", "Bottles", "Cases", "Closure Type", "Free SO2 (mg/L)", "Total SO2 (mg/L)", "Notes"];

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportResult(null);
    setImportParsed([]);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { setImportError("CSV must have a header row and at least one data row."); return; }
      const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim());
      const rows: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV split — handles quoted fields with no embedded commas
        const cells = lines[i].match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(c => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? [];
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = cells[idx] ?? ""; });
        rows.push(row);
      }
      if (rows.length > 500) { setImportError("Maximum 500 rows per import."); return; }
      setImportParsed(rows);
    };
    reader.readAsText(file);
  };

  const submitImport = async () => {
    if (!importParsed.length) return;
    setImportLoading(true);
    setImportError(null);
    try {
      const records = importParsed.map(row => ({
        bottlingDate: row["Bottling Date"] || row["bottling_date"] || undefined,
        vintageYear: row["Vintage"] || row["vintage_year"] || undefined,
        batchRef: row["Batch Ref"] || row["batch_ref"] || undefined,
        lotCode: row["Lot Code"] || row["lot_code"] || undefined,
        wineColour: row["Wine Colour"] || row["wine_colour"] || undefined,
        isOrganic: (row["Organic (Yes/No)"] || row["Organic SO₂ Limits"] || row["is_organic"] || "").toLowerCase() === "yes" ? "true" : "false",
        volumeBottledLitres: row["Volume Bottled (L)"] || row["volume_bottled_litres"] || undefined,
        bottleSizeMl: row["Bottle Size (ml)"] || row["bottle_size_ml"] || undefined,
        bottlesProduced: row["Bottles"] || row["bottles_produced"] || undefined,
        casesProduced: row["Cases"] || row["cases_produced"] || undefined,
        closureType: row["Closure Type"] || row["closure_type"] || undefined,
        freeSo2MgL: row["Free SO2 (mg/L)"] || row["free_so2_mg_l"] || undefined,
        totalSo2MgL: row["Total SO2 (mg/L)"] || row["total_so2_mg_l"] || undefined,
        notes: row["Notes"] || row["notes"] || undefined,
      }));
      const r = await fetch(api(`farms/${farmId}/winery-bottling/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Import failed"); }
      const result = await r.json();
      setImportResult(result);
      if (result.insertedCount > 0) qc.invalidateQueries({ queryKey: ["winery-bottling", farmId] });
    } catch (err) {
      setImportError((err as Error).message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const resetImportDialog = () => {
    setImportParsed([]);
    setImportError(null);
    setImportResult(null);
    setImportLoading(false);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const { data: farmsDataBottling } = useQuery<{ records?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameBottling: string = (Array.isArray(farmsDataBottling?.records)
    ? (farmsDataBottling.records.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  // Read SO₂ test records to enable pre-fill on batch ref selection
  const { data: so2TestRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-so2-tests", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-so2-tests`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });

  // Fermentation records for organic-status lookup when a batch ref is selected
  const { data: fermentationRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-fermentation", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-fermentation`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });

  const bottlingPressingRefs = pressingRecords
    .filter(r => r.batch_ref)
    .map(r => ({ batchRef: String(r.batch_ref), vintageYear: String(r.vintage_year ?? ""), wineColour: String(r.wine_colour ?? ""), isOrganic: !!(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) }))
    .sort((a, b) => b.batchRef.localeCompare(a.batchRef));

  const handleBottlingBatchRefChange = (val: string) => {
    const pressMatch = bottlingPressingRefs.find(p => p.batchRef === val);
    // Organic: prefer fermentation record for this batch ref, fall back to pressing
    const fermMatch = val
      ? fermentationRecords.find(f => String(f.batch_ref ?? "") === val)
      : null;
    const inheritedOrganic = fermMatch != null
      ? (fermMatch.is_organic === true || fermMatch.is_organic === "true" || fermMatch.is_organic === 1)
      : (pressMatch?.isOrganic ?? false);
    const organicSource: "fermentation" | "pressing" | null = fermMatch != null ? "fermentation" : (pressMatch ? "pressing" : null);
    // Find most recent pre-bottling or at-bottling SO₂ test for this batch
    const latestTest = val
      ? so2TestRecords
          .filter(t => String(t.batch_ref ?? "") === val && (t.test_stage === "pre-bottling" || t.test_stage === "at-bottling"))
          .sort((a, b) => String(b.test_date ?? "").localeCompare(String(a.test_date ?? "")))[0] ?? null
      : null;
    // Find the pressing record for this batch to source pH and TA
    const pressingRecord = val
      ? pressingRecords.find(p => String(p.batch_ref ?? "") === val) ?? null
      : null;
    setOrganicAutoSource(organicSource);
    setForm(f => {
      const next: Record<string, string | boolean> = { ...f, batchRef: val };
      if (pressMatch && !f.vintageYear) next.vintageYear = pressMatch.vintageYear;
      if (pressMatch && !f.wineColour && pressMatch.wineColour) next.wineColour = pressMatch.wineColour;
      if (organicSource) next.isOrganic = inheritedOrganic ? "true" : "false";
      let filled = false;
      if (latestTest) {
        if (!f.freeSo2MgL && latestTest.free_so2_mg_l != null) { next.freeSo2MgL = String(latestTest.free_so2_mg_l); filled = true; }
        if (!f.totalSo2MgL && latestTest.total_so2_mg_l != null) { next.totalSo2MgL = String(latestTest.total_so2_mg_l); filled = true; }
      }
      if (filled) setSo2FromTest(true);
      // Pre-fill pH and TA from the pressing record's juice analysis
      let phTaFilled = false;
      if (pressingRecord) {
        if (!f.ph && pressingRecord.juice_ph != null) { next.ph = String(pressingRecord.juice_ph); phTaFilled = true; }
        if (!f.titratableAcidityGl && pressingRecord.juice_ta_gl != null) { next.titratableAcidityGl = String(pressingRecord.juice_ta_gl); phTaFilled = true; }
      }
      if (phTaFilled) setPhTaFromAnalysis(true);
      return next;
    });
  };

  // Auto-calculate bottles from volume and size
  const volL = parseFloat(String(form.volumeBottledLitres || "0"));
  const sizeMl = parseInt(String(form.bottleSizeMl || "0"), 10);
  const autoBottles = volL > 0 && sizeMl > 0 ? Math.floor((volL * 1000) / sizeMl) : null;
  const autoCases = autoBottles != null ? Math.floor(autoBottles / 12) : null;

  const openAdd = () => { setEditing(null); setForm({ bottlingDate: today, vintageYear: String(new Date().getFullYear()), isOrganic: "false", certifiedOrganic: "false", bottleSizeMl: "750" }); setSo2FromTest(false); setPhTaFromAnalysis(false); setOrganicAutoSource(null); setLotCodeError(null); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    const raw = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]));
    // API returns snake_case; normalize organic boolean fields to camelCase so form checkboxes read them correctly
    if (raw.isOrganic === undefined || raw.isOrganic === "") raw.isOrganic = raw.is_organic ?? "false";
    if (raw.certifiedOrganic === undefined || raw.certifiedOrganic === "") raw.certifiedOrganic = raw.certified_organic ?? "false";
    setForm(raw);
    setSo2FromTest(false);
    setPhTaFromAnalysis(false);
    setOrganicAutoSource(null);
    setLotCodeError(null);
    setOpen(true);
  };
  const save = async () => {
    const payload = {
      ...form,
      bottlesProduced: autoBottles != null ? String(autoBottles) : form.bottlesProduced,
      casesProduced: autoCases != null ? String(autoCases) : form.casesProduced,
    };
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === "DUPLICATE_LOT_CODE") {
        setLotCodeError(e.message);
      } else {
        toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
      }
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filtered = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);

  const bottlingCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "bottling_date", label: "Bottling Date", fmt: (r: Record<string, unknown>) => fmtDate(r.bottling_date) },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "lot_code", label: "Lot Code" },
    { key: "wine_colour", label: "Wine Colour" },
    { key: "is_organic", label: "Organic SO₂ Limits", fmt: (r: Record<string, unknown>) => (r.is_organic === true || r.is_organic === "true") ? "Yes" : "No" },
    { key: "volume_bottled_litres", label: "Volume Bottled (L)" },
    { key: "bottle_size_ml", label: "Bottle Size (ml)" },
    { key: "bottles_produced", label: "Bottles" },
    { key: "cases_produced", label: "Cases" },
    { key: "closure_type", label: "Closure Type" },
    { key: "free_so2_mg_l", label: "Free SO₂ (mg/L)" },
    { key: "total_so2_mg_l", label: "Total SO₂ (mg/L)" },
    { key: "certified_organic", label: "Certified Organic", fmt: (r: Record<string, unknown>) => r.certified_organic ? "Yes" : "No" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Bottling Records</p>
          <p className="text-xs text-muted-foreground mt-0.5">Record each bottling run — lot code, volume, bottle format, closure type, and pre-bottling analysis. The lot code is used for excise duty returns and batch traceability.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Bottling Run</Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => exportCSV(filtered, "bottling-records.csv", bottlingCsvCols)} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <Button size="sm" variant="outline" onClick={() => { resetImportDialog(); setImportOpen(true); }}><Upload className="w-3.5 h-3.5 mr-1" />Import CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} run{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Wine} title="No bottling records yet" sub="Add a record for each bottling run." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Lot Code</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Colour</th>
              <th className="text-right p-3 font-medium">Volume (L)</th>
              <th className="text-right p-3 font-medium">Bottles</th>
              <th className="text-left p-3 font-medium">Closure</th>
              <th className="text-right p-3 font-medium">Free SO₂</th>
              <th className="text-right p-3 font-medium">Total SO₂</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.bottling_date)}</td>
                  <td className="p-3 font-mono font-semibold text-xs">{fmt(r.lot_code)}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.batch_ref)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {r.wine_colour ? <span className="text-xs bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">{String(r.wine_colour)}</span> : <span className="text-muted-foreground">—</span>}
                      {(r.is_organic === true || r.is_organic === "true") && <span className="inline-flex items-center gap-0.5 text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5"><Leaf className="w-3 h-3" />Organic</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right">{fmtNum(r.volume_bottled_litres, 0)}</td>
                  <td className="p-3 text-right">{fmt(r.bottles_produced)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{fmt(r.closure_type)}</td>
                  <td className="p-3 text-right">{r.free_so2_mg_l ? `${fmtNum(r.free_so2_mg_l, 0)} mg/L` : "—"}</td>
                  <td className="p-3 text-right">{r.total_so2_mg_l ? `${fmtNum(r.total_so2_mg_l, 0)} mg/L` : "—"}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${r.batch_ref ? "text-blue-600" : "text-muted-foreground"}`} title={r.batch_ref ? `View batch trail for ${String(r.batch_ref)}` : "No batch reference — showing full vintage trail"} onClick={() => setTrailRecord(r)}><GitBranch className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Bottling Record</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Batch identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bottling Date *</Label><Input type="date" max={today} value={String(form.bottlingDate ?? "")} onChange={e => sf("bottlingDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch Reference</Label>
                <Input
                  list="bottling-pressing-refs"
                  value={String(form.batchRef ?? "")}
                  onChange={e => handleBottlingBatchRefChange(e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
                <datalist id="bottling-pressing-refs">
                  {bottlingPressingRefs.map(p => (
                    <option key={p.batchRef} value={p.batchRef} label={p.vintageYear ? `Vintage ${p.vintageYear}` : undefined} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Lot Code *</Label>
                <Input
                  value={String(form.lotCode ?? "")}
                  onChange={e => { sf("lotCode", e.target.value); setLotCodeError(null); }}
                  placeholder="e.g. LOT2024001A"
                  className={lotCodeError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {lotCodeError && <p className="text-xs text-red-600 mt-1">{lotCodeError}</p>}
              </div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={String(form.wineColour ?? "")} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source Vessel</Label>
                <Select value={String(form.sourceVesselId ?? "")} onValueChange={v => sf("sourceVesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Operator</Label><StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <SectionLabel>Volume & format</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Volume Bottled (L)</Label><Input type="number" step="0.1" value={String(form.volumeBottledLitres ?? "")} onChange={e => sf("volumeBottledLitres", e.target.value)} /></div>
              <div><Label>Bottle Size (ml)</Label>
                <Select value={String(form.bottleSizeMl ?? "750")} onValueChange={v => sf("bottleSizeMl", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="187">187ml (quarter bottle)</SelectItem>
                    <SelectItem value="375">375ml (half bottle)</SelectItem>
                    <SelectItem value="500">500ml</SelectItem>
                    <SelectItem value="750">750ml (standard)</SelectItem>
                    <SelectItem value="1500">1500ml (magnum)</SelectItem>
                    <SelectItem value="3000">3000ml (double magnum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {autoBottles != null && (
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div><Label>Bottles Produced</Label><div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoBottles.toLocaleString()} <span className="text-blue-600 text-xs">auto</span></div></div>
                  <div><Label>Full Cases (12s)</Label><div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoCases} <span className="text-blue-600 text-xs">auto</span></div></div>
                </div>
              )}
              <div>
                <Label>Closure Type</Label>
                <Select value={String(form.closureType ?? "")} onValueChange={v => sf("closureType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CLOSURE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Cork Grade</Label><Input value={String(form.corkGrade ?? "")} onChange={e => sf("corkGrade", e.target.value)} placeholder="e.g. 1+1, Grade 1, Technical" /></div>
              <div><Label>Label Batch</Label><Input value={String(form.labelBatch ?? "")} onChange={e => sf("labelBatch", e.target.value)} placeholder="e.g. Label-v3" /></div>
            </div>
            <SectionLabel>Organic SO₂ limits</SectionLabel>
            <div className="rounded-md border px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is-organic-chk"
                  checked={form.isOrganic === "true" || form.isOrganic === true}
                  onCheckedChange={v => { sf("isOrganic", v ? "true" : "false"); setOrganicAutoSource(null); }}
                />
                <Label htmlFor="is-organic-chk" className="cursor-pointer">Apply organic SO₂ limits to this batch</Label>
              </div>
              {organicAutoSource && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Leaf className="h-3 w-3 shrink-0" />
                  Inherited from {organicAutoSource} record — override with the checkbox above
                </p>
              )}
              {(form.isOrganic === "true" || form.isOrganic === true) && form.wineColour && ORGANIC_MAX_SO2[String(form.wineColour)] && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Leaf className="h-3 w-3 shrink-0" />
                  Organic ceiling for {String(form.wineColour)}: <strong>{ORGANIC_MAX_SO2[String(form.wineColour)]} mg/L</strong> total SO₂
                  {form.totalSo2MgL && parseFloat(String(form.totalSo2MgL)) > parseFloat(ORGANIC_MAX_SO2[String(form.wineColour)]) && (
                    <span className="ml-1 text-red-600 font-medium">⚠ Entered value exceeds this limit</span>
                  )}
                </p>
              )}
            </div>
            <SectionLabel>Pre-bottling analysis</SectionLabel>
            {so2FromTest && (
              <p className="text-xs text-blue-600 flex items-center gap-1 -mt-1">
                <FlaskConical className="h-3 w-3 shrink-0" />
                SO₂ pre-filled from the most recent SO₂ test for this batch — edit to override
              </p>
            )}
            {phTaFromAnalysis && (
              <p className="text-xs text-blue-600 flex items-center gap-1 -mt-1">
                <FlaskConical className="h-3 w-3 shrink-0" />
                pH / TA pre-filled from the pressing juice analysis for this batch — edit to override
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Free SO₂ (mg/L)</Label><Input type="number" step="0.1" value={String(form.freeSo2MgL ?? "")} onChange={e => { setSo2FromTest(false); sf("freeSo2MgL", e.target.value); }} /></div>
              <div><Label>Total SO₂ (mg/L)</Label><Input type="number" step="0.1" value={String(form.totalSo2MgL ?? "")} onChange={e => { setSo2FromTest(false); sf("totalSo2MgL", e.target.value); }} /></div>
              <div><Label>Actual ABV %</Label><Input type="number" step="0.01" value={String(form.actualAbvPct ?? "")} onChange={e => sf("actualAbvPct", e.target.value)} /></div>
              <div><Label>Residual Sugar (g/L)</Label><Input type="number" step="0.1" value={String(form.residualSugarGl ?? "")} onChange={e => sf("residualSugarGl", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={e => { setPhTaFromAnalysis(false); sf("ph", e.target.value); }} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => { setPhTaFromAnalysis(false); sf("titratableAcidityGl", e.target.value); }} /></div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox id="cert-org-chk" checked={form.certifiedOrganic === "true" || form.certifiedOrganic === true} onCheckedChange={v => sf("certifiedOrganic", v ? "true" : "false")} />
              <Label htmlFor="cert-org-chk" className="cursor-pointer">This batch is certified organic</Label>
            </div>
            {(form.certifiedOrganic === "true" || form.certifiedOrganic === true) && (
              <div><Label>Certifier Reference</Label><Input value={String(form.certifierRef ?? "")} onChange={e => sf("certifierRef", e.target.value)} placeholder="Batch certification reference" /></div>
            )}
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.bottlingDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Bottling — {fmt(view.lot_code)} ({fmtDate(view.bottling_date)})</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Bottling Date" value={fmtDate(view.bottling_date)} />
              <ViewField label="Lot Code" value={<span className="font-mono font-semibold">{fmt(view.lot_code)}</span>} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
              <ViewField label="Source Vessel" value={fmt(view.source_vessel_ref ?? vessels.find(v => v.id === view.source_vessel_id)?.vessel_ref)} />
              <ViewField label="Volume Bottled" value={view.volume_bottled_litres ? `${fmtNum(view.volume_bottled_litres, 0)} L` : "—"} />
              <ViewField label="Bottle Size" value={view.bottle_size_ml ? `${view.bottle_size_ml} ml` : "—"} />
              <ViewField label="Bottles Produced" value={view.bottles_produced ? Number(view.bottles_produced).toLocaleString() : "—"} />
              <ViewField label="Cases (12s)" value={fmt(view.cases_produced)} />
              <ViewField label="Closure" value={fmt(view.closure_type)} />
              <ViewField label="Cork Grade" value={fmt(view.cork_grade)} />
              <ViewField label="Label Batch" value={fmt(view.label_batch)} />
              <ViewField label="Free SO₂" value={view.free_so2_mg_l ? `${fmtNum(view.free_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Total SO₂" value={view.total_so2_mg_l ? `${fmtNum(view.total_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Actual ABV" value={view.actual_abv_pct ? `${fmtNum(view.actual_abv_pct, 2)} %` : "—"} />
              <ViewField label="Residual Sugar" value={view.residual_sugar_gl ? `${fmtNum(view.residual_sugar_gl, 1)} g/L` : "—"} />
              <ViewField label="pH" value={fmtNum(view.ph, 2)} />
              <ViewField label="TA" value={view.titratable_acidity_gl ? `${fmtNum(view.titratable_acidity_gl, 1)} g/L` : "—"} />
              <ViewField label="Organic SO₂ Limits" value={(view.is_organic === true || view.is_organic === "true")
                ? <span className="inline-flex items-center gap-1 text-green-700 font-medium"><Leaf className="w-3.5 h-3.5" />Organic limits apply{view.wine_colour && ORGANIC_MAX_SO2[String(view.wine_colour)] ? ` (max ${ORGANIC_MAX_SO2[String(view.wine_colour)]} mg/L)` : ""}</span>
                : "No — conventional limits"} />
              <ViewField label="Certified Organic" value={view.certified_organic ? <span className="text-green-700 font-medium">Yes — {fmt(view.certifier_ref)}</span> : "No"} />
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-bottling" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Bottling Record</DialogTitle><DialogDescription>Remove lot {fmt(deleting?.lot_code)}?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameBottling}
          onClose={() => setTrailRecord(null)}
        />
      )}

      {/* CSV Import Dialog */}
      <Dialog open={importOpen} onOpenChange={o => { if (!o) { setImportOpen(false); resetImportDialog(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Bottling Records from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk-create bottling records. Duplicate lot codes — both within the file and against existing records — will be reported and skipped. Other rows will be imported.
            </DialogDescription>
          </DialogHeader>

          {!importResult && (
            <div className="space-y-4">
              <div className="rounded-md border border-dashed p-4 bg-muted/30 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Expected CSV columns (header row required):</p>
                <p className="font-mono">{CSV_IMPORT_HEADERS.join(", ")}</p>
                <p className="mt-1">Exports from this register use a compatible format and can be re-imported directly.</p>
              </div>
              <div>
                <Label>Select CSV file</Label>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImportFile}
                  className="mt-1 block w-full text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
              {importError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
              {importParsed.length > 0 && !importError && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  <p className="font-medium">{importParsed.length} row{importParsed.length !== 1 ? "s" : ""} parsed from file.</p>
                  {importParsed.length > 0 && (
                    <p className="text-xs mt-1 text-blue-600">
                      Lot codes found: {importParsed.filter(r => r["Lot Code"] || r["lot_code"]).length} of {importParsed.length} rows have a lot code.
                    </p>
                  )}
                  <div className="mt-2 max-h-32 overflow-y-auto rounded border border-blue-200 bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-blue-100"><tr>
                        <th className="text-left p-1.5 font-medium">Date</th>
                        <th className="text-left p-1.5 font-medium">Lot Code</th>
                        <th className="text-left p-1.5 font-medium">Batch Ref</th>
                        <th className="text-left p-1.5 font-medium">Colour</th>
                        <th className="text-right p-1.5 font-medium">Volume (L)</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {importParsed.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-muted/10">
                            <td className="p-1.5">{row["Bottling Date"] || row["bottling_date"] || "—"}</td>
                            <td className="p-1.5 font-mono">{row["Lot Code"] || row["lot_code"] || "—"}</td>
                            <td className="p-1.5 font-mono">{row["Batch Ref"] || row["batch_ref"] || "—"}</td>
                            <td className="p-1.5">{row["Wine Colour"] || row["wine_colour"] || "—"}</td>
                            <td className="p-1.5 text-right">{row["Volume Bottled (L)"] || row["volume_bottled_litres"] || "—"}</td>
                          </tr>
                        ))}
                        {importParsed.length > 10 && (
                          <tr><td colSpan={5} className="p-1.5 text-center text-muted-foreground">… and {importParsed.length - 10} more rows</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className="space-y-3">
              <div className={`rounded-md p-3 border flex items-start gap-2 ${importResult.insertedCount > 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                {importResult.insertedCount > 0 ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium text-sm">
                    {importResult.insertedCount} record{importResult.insertedCount !== 1 ? "s" : ""} imported successfully.
                    {importResult.rejectedCount > 0 && ` ${importResult.rejectedCount} row${importResult.rejectedCount !== 1 ? "s" : ""} skipped due to duplicate lot codes.`}
                  </p>
                </div>
              </div>
              {importResult.rejected.length > 0 && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-red-800 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />Skipped rows — duplicate lot codes:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.rejected.map((r, i) => (
                      <div key={i} className="text-xs text-red-700 bg-red-100 rounded px-2 py-1">
                        <span className="font-medium">Row {r.row}</span>{r.lotCode ? <span className="font-mono ml-1">[{r.lotCode}]</span> : ""}: {r.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); resetImportDialog(); }}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button
                onClick={submitImport}
                disabled={importParsed.length === 0 || importLoading || !!importError}
              >
                {importLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Import {importParsed.length > 0 ? `${importParsed.length} Row${importParsed.length !== 1 ? "s" : ""}` : ""}
              </Button>
            )}
            {importResult && importResult.rejected.length > 0 && (
              <Button variant="outline" onClick={resetImportDialog}>
                Import Another File
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── SO₂ Testing Register ─────────────────────────────────────────────────────
export function So2TestingTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-so2-tests", "winery-so2-tests");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: equipment = [] } = useEquipment(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const { data: farmsDataSo2 } = useQuery<{ records?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameSo2: string = (Array.isArray(farmsDataSo2?.records)
    ? (farmsDataSo2.records.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const so2PressingRefs = pressingRecords
    .filter(r => r.batch_ref)
    .map(r => ({ batchRef: String(r.batch_ref), vintageYear: String(r.vintage_year ?? ""), wineColour: String(r.wine_colour ?? ""), isOrganic: !!(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) }))
    .sort((a, b) => b.batchRef.localeCompare(a.batchRef));

  const [isSo2BatchOrganic, setIsSo2BatchOrganic] = useState(false);

  const handleSo2BatchRefChange = (val: string) => {
    sf("batchRef", val);
    const match = so2PressingRefs.find(p => p.batchRef === val);
    const organic = match?.isOrganic ?? false;
    setIsSo2BatchOrganic(organic);
    if (match && !form.vintageYear) sf("vintageYear", match.vintageYear);
    if (match && !form.wineColour && match.wineColour) handleColourChangeWithOrganic(match.wineColour, organic);
  };

  const isLab = form.testMethod === "Third-party laboratory";
  const isOnSite = form.testMethod?.startsWith("On-site");

  const autoCompliant: boolean | null = useMemo(() => {
    const total = parseFloat(form.totalSo2MgL ?? "");
    const max = parseFloat(form.maxPermittedMgL ?? "");
    if (isNaN(total) || isNaN(max)) return null;
    return total <= max;
  }, [form.totalSo2MgL, form.maxPermittedMgL]);

  const allSo2LimitValues = [...Object.values(ORGANIC_MAX_SO2), ...Object.values(CONVENTIONAL_MAX_SO2)];

  const handleColourChangeWithOrganic = (colour: string, organic: boolean) => {
    const autoMax = organic ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour];
    setForm(f => ({
      ...f,
      wineColour: colour,
      ...(!f.maxPermittedMgL || allSo2LimitValues.includes(f.maxPermittedMgL) ? { maxPermittedMgL: autoMax ?? f.maxPermittedMgL } : {}),
    }));
  };

  const handleColourChange = (colour: string) => handleColourChangeWithOrganic(colour, isSo2BatchOrganic);

  const openAdd = () => { setEditing(null); setIsSo2BatchOrganic(false); setForm({ testDate: today, vintageYear: String(new Date().getFullYear()), testMethod: "On-site — Ripper titration", testStage: "pre-bottling" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    // Determine organic status from linked pressing batch (if any)
    const batchRef = String(r.batch_ref ?? "");
    const match = so2PressingRefs.find(p => p.batchRef === batchRef);
    setIsSo2BatchOrganic(match?.isOrganic ?? false);
    setOpen(true);
  };
  const save = async () => {
    const payload = { ...form, so2Compliant: autoCompliant != null ? String(autoCompliant) : form.so2Compliant };
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filtered = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const so2CsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "test_date", label: "Test Date", fmt: (r: Record<string, unknown>) => fmtDate(r.test_date) },
    { key: "wine_name", label: "Wine Name" },
    { key: "wine_colour", label: "Colour" },
    { key: "test_stage", label: "Stage" },
    { key: "free_so2_mg_l", label: "Free SO₂ (mg/L)" },
    { key: "total_so2_mg_l", label: "Total SO₂ (mg/L)" },
    { key: "max_permitted_mg_l", label: "Max Permitted (mg/L)" },
    { key: "so2_compliant", label: "Compliant", fmt: (r: Record<string, unknown>) => r.so2_compliant ? "Yes" : "No" },
    { key: "test_method", label: "Test Method" },
    { key: "notes", label: "Notes" },
  ];

  const so2ChartData = [...filtered]
    .sort((a, b) => String(a.test_date ?? "").localeCompare(String(b.test_date ?? "")))
    .map(r => ({
      date: r.test_date ? new Date(String(r.test_date)).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—",
      "Free SO₂": r.free_so2_mg_l ? parseFloat(String(r.free_so2_mg_l)) : null,
      "Total SO₂": r.total_so2_mg_l ? parseFloat(String(r.total_so2_mg_l)) : null,
      max: r.max_permitted_mg_l ? parseFloat(String(r.max_permitted_mg_l)) : null,
    }));
  const so2MaxLimit = so2ChartData.length > 0 ? Math.max(...so2ChartData.map(d => d.max ?? 0)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">SO₂ Testing Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Standalone register of every SO₂ measurement taken across all wines — at pressing, through winemaking, and pre-bottling. This is the primary organic certification audit document. Total SO₂ against the organic limit is auto-assessed.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Test</Button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
        <p><strong>Organic limits (UK-retained Reg 203/2012):</strong> Red 100 mg/L · White/Rosé 150 mg/L · Sparkling 185 mg/L</p>
        <p><strong>Conventional limits (Reg 1308/2013):</strong> Red 150 mg/L · White/Rosé 200 mg/L · Sparkling 235 mg/L</p>
        <p>These are <em>total</em> SO₂ limits. The max permitted field auto-fills from the linked batch's organic status — edit it to override.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => exportCSV(filtered, "so2-testing.csv", so2CsvCols)} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} test{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {so2ChartData.length > 1 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">SO₂ Levels Over Time (mg/L)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={so2ChartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {so2MaxLimit > 0 && <ReferenceLine y={so2MaxLimit} stroke="#ef4444" strokeDasharray="4 2" label={{ value: `Limit ${so2MaxLimit}`, position: "insideTopRight", fontSize: 9, fill: "#ef4444" }} />}
              <Line type="monotone" dataKey="Total SO₂" stroke="#8b5cf6" dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="Free SO₂" stroke="#3b82f6" dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={FlaskConical} title="No SO₂ tests logged" sub="Record each SO₂ analysis here — at pressing, post-racking, and pre-bottling." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Vessel</th>
              <th className="text-left p-3 font-medium">Stage</th>
              <th className="text-left p-3 font-medium">Method</th>
              <th className="text-right p-3 font-medium">Free SO₂</th>
              <th className="text-right p-3 font-medium">Total SO₂</th>
              <th className="text-right p-3 font-medium">Max (mg/L)</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.test_date)}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.batch_ref)}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.vessel_ref ?? vessels.find(v => v.id === r.vessel_id)?.vessel_ref)}</td>
                  <td className="p-3 text-xs">{SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? fmt(r.test_stage)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{fmt(r.test_method)}</td>
                  <td className="p-3 text-right">{r.free_so2_mg_l ? `${fmtNum(r.free_so2_mg_l, 0)}` : "—"}</td>
                  <td className="p-3 text-right font-semibold">{r.total_so2_mg_l ? `${fmtNum(r.total_so2_mg_l, 0)}` : "—"}</td>
                  <td className="p-3 text-right text-muted-foreground">{r.max_permitted_mg_l ? `${fmtNum(r.max_permitted_mg_l, 0)}` : "—"}</td>
                  <td className="p-3"><So2Badge compliant={r.so2_compliant} /></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${r.batch_ref ? "text-blue-600" : "text-muted-foreground"}`} title={r.batch_ref ? `View batch trail for ${String(r.batch_ref)}` : "No batch reference — showing full vintage trail"} onClick={() => setTrailRecord(r)}><GitBranch className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Log"} SO₂ Test</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Sample identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Test Date *</Label><Input type="date" max={today} value={form.testDate ?? ""} onChange={e => sf("testDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch Reference</Label>
                <Input
                  list="so2-pressing-refs"
                  value={form.batchRef ?? ""}
                  onChange={e => handleSo2BatchRefChange(e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
                <datalist id="so2-pressing-refs">
                  {so2PressingRefs.map(p => (
                    <option key={p.batchRef} value={p.batchRef} label={p.vintageYear ? `Vintage ${p.vintageYear}` : undefined} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={handleColourChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vessel</Label>
                <Select value={form.vesselId ?? ""} onValueChange={v => sf("vesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Test Stage</Label>
                <Select value={form.testStage ?? ""} onValueChange={v => sf("testStage", v)}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>{SO2_TEST_STAGES.map(o => <SelectItem key={o} value={o}>{SO2_TEST_STAGE_LABELS[o]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <SectionLabel>Test method</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Test Method</Label>
                <Select value={form.testMethod ?? ""} onValueChange={v => sf("testMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>{SO2_TEST_METHODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isOnSite && equipment.length > 0 && (
                <div className="col-span-2">
                  <Label>Equipment Used</Label>
                  <Select value={form.equipmentId ?? ""} onValueChange={v => sf("equipmentId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                    <SelectContent><SelectItem value="">— Not specified —</SelectItem>{equipment.map(e => <SelectItem key={String(e.id)} value={String(e.id)}>{String(e.equipment_ref)} — {String(e.equipment_type ?? "")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {isLab && (
                <>
                  <div><Label>Laboratory Name</Label><Input value={form.labName ?? ""} onChange={e => sf("labName", e.target.value)} placeholder="e.g. WineLab UK Ltd" /></div>
                  <div><Label>Lab Report Reference</Label><Input value={form.labRef ?? ""} onChange={e => sf("labRef", e.target.value)} placeholder="Report or sample ref" /></div>
                </>
              )}
            </div>
            <SectionLabel>Results</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Free SO₂ (mg/L)</Label><Input type="number" step="0.1" value={form.freeSo2MgL ?? ""} onChange={e => sf("freeSo2MgL", e.target.value)} /></div>
              <div><Label>Total SO₂ (mg/L)</Label><Input type="number" step="0.1" value={form.totalSo2MgL ?? ""} onChange={e => sf("totalSo2MgL", e.target.value)} /></div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Max Permitted (mg/L)</Label>
                  {form.wineColour && (ORGANIC_MAX_SO2[form.wineColour] || CONVENTIONAL_MAX_SO2[form.wineColour]) && (
                    <span className="text-xs text-blue-600">{isSo2BatchOrganic ? "🌿 organic limit" : "conv. limit"} auto from colour</span>
                  )}
                </div>
                <Input type="number" step="1" value={form.maxPermittedMgL ?? ""} onChange={e => sf("maxPermittedMgL", e.target.value)} placeholder={isSo2BatchOrganic ? "100 / 150 / 185 (organic)" : "150 / 200 / 235 (conv.)"} />
              </div>
              {autoCompliant !== null && (
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Compliance:</span>
                  <So2Badge compliant={autoCompliant} />
                  <span className="text-xs text-muted-foreground">({form.totalSo2MgL} mg/L {autoCompliant ? "≤" : ">"} {form.maxPermittedMgL} mg/L limit)</span>
                </div>
              )}
            </div>
            <div><Label>Action Taken (if any)</Label><Input value={form.actionTaken ?? ""} onChange={e => sf("actionTaken", e.target.value)} placeholder="e.g. Added 15mg/L SO₂ before bottling" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.testDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>SO₂ Test — {fmtDate(view.test_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Test Date" value={fmtDate(view.test_date)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
              <ViewField label="Vessel" value={fmt(view.vessel_ref ?? vessels.find(v => v.id === view.vessel_id)?.vessel_ref)} />
              <ViewField label="Test Stage" value={SO2_TEST_STAGE_LABELS[String(view.test_stage)] ?? fmt(view.test_stage)} />
              <ViewField label="Test Method" value={fmt(view.test_method)} />
              <ViewField label="Equipment" value={fmt(view.equipment_ref ?? equipment.find(e => e.id === view.equipment_id)?.equipment_ref)} />
              {!!view.lab_name && <ViewField label="Laboratory" value={fmt(view.lab_name)} />}
              {!!view.lab_ref && <ViewField label="Lab Ref" value={fmt(view.lab_ref)} />}
              <ViewField label="Free SO₂" value={view.free_so2_mg_l ? `${fmtNum(view.free_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Total SO₂" value={view.total_so2_mg_l ? `${fmtNum(view.total_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Max Permitted" value={view.max_permitted_mg_l ? `${fmtNum(view.max_permitted_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Compliance" value={<So2Badge compliant={view.so2_compliant} />} />
              {!!view.action_taken && <div className="col-span-2"><ViewField label="Action Taken" value={fmt(view.action_taken)} /></div>}
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-so2-test" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete SO₂ Test</DialogTitle><DialogDescription>Remove SO₂ test record from {fmtDate(deleting?.test_date)}?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameSo2}
          onClose={() => setTrailRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Equipment Register Tab ───────────────────────────────────────────────────
function CalibrationRows({ farmId, equipmentId }: { farmId: number; equipmentId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-equipment-cals", farmId, equipmentId],
    queryFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations`), { credentials: "include" }); return (await r.json()).records ?? []; },
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
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No calibration records yet.</p> : (
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
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "equipment.csv", equipCsvCols)} disabled={!crud.data.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
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
              <div><Label>Last Calibration Date</Label><Input type="date" max={today} value={form.lastCalibrationDate ?? ""} onChange={e => sf("lastCalibrationDate", e.target.value)} /></div>
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
