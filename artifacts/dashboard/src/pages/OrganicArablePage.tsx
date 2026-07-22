import React, { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Loader2, Pencil, Trash2, AlertTriangle, Wheat,
  ShieldCheck, FileText, Sprout, Package, CheckCircle2,
  Eye, Printer, Download, ArrowDownToLine, ArrowUpFromLine,
  BarChart3, BookOpen,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { useLookupStrings } from "@/hooks/use-lookup";
import { downloadCsvFile } from "@/lib/csv";
import { printProReport } from "@/lib/print-report";

// ─── Utilities ────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return val; }
}
function fmtN(val: unknown, suffix = ""): string {
  if (val == null || val === "") return "—";
  return `${val}${suffix}`;
}
function str(v: unknown): string { return v == null ? "" : String(v); }
function conversionProgress(start: string | null | undefined, end: string | null | undefined): number {
  if (!start) return 0;
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : s + 2 * 365.25 * 24 * 3600 * 1000;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - s) / (e - s)) * 100)));
}
function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const t = new Date(dateStr); t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 86400000);
}
function currentYear() { return new Date().getFullYear(); }
function yearOptions() {
  const y = currentYear(); return [y + 1, y, y - 1, y - 2, y - 3].map(String);
}

const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`/api/${path}`, { credentials: "include", ...opts });

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_ARABLE_CROPS = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Malting Barley", "Oilseed Rape (OSR)", "Winter Oats", "Spring Oats",
  "Winter Beans", "Spring Beans", "Peas", "Maize", "Sugar Beet",
  "Potatoes", "Linseed", "Rye", "Triticale", "Other",
];

const CERTIFIERS = [
  "Soil Association", "Organic Farmers & Growers (OF&G)", "OCIS",
  "Biodynamic Association (Demeter)", "Other",
];

const CERT_STATUSES = [
  { value: "all", label: "All" },
  { value: "certified", label: "Certified", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "in-conversion", label: "In Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "suspended", label: "Suspended", cls: "bg-red-50 text-red-700 border-red-300" },
  { value: "withdrawn", label: "Withdrawn", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

const CONV_STATUSES = [
  { value: "all", label: "All" },
  { value: "pre-conversion", label: "Pre-Conversion", cls: "bg-blue-50 text-blue-700 border-blue-300" },
  { value: "in-conversion", label: "In Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "certified", label: "Certified", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "lapsed", label: "Lapsed", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

const SEED_TYPES = [
  { value: "organic", label: "Certified Organic", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "untreated-conventional", label: "Untreated Conventional", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "treated-conventional-derogation", label: "Treated Conventional (Derogation)", cls: "bg-red-50 text-red-700 border-red-300" },
];

const HARVEST_STATUSES = [
  { value: "all", label: "All" },
  { value: "certified", label: "Certified Organic", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "in-conversion", label: "In-Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "conventional", label: "Conventional", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

const PERMITTED_STATUSES = [
  { value: "all", label: "All" },
  { value: "permitted", label: "Permitted (Annex II)", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "restricted", label: "Restricted — notify certifier", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "prohibited", label: "Prohibited", cls: "bg-red-50 text-red-700 border-red-300" },
];

const INPUT_TYPES_ALL = [
  "Fertiliser / Soil Amendment", "Crop Protection / Pesticide",
  "Biological Control", "Seed Treatment", "Cleaning & Disinfection", "Other",
];

const QUANTITY_UNITS = ["kg/ha", "l/ha", "t/ha", "kg", "l", "t", "g/ha", "units/ha"];

const ANNEX_INPUTS: { name: string; activeIngredient: string }[] = [
  { name: "Farmyard Manure (FYM) — composted or well-rotted", activeIngredient: "Nitrogen, Phosphorus, Potassium (NPK); Organic matter" },
  { name: "Composted Plant & Animal Material", activeIngredient: "Nitrogen, Phosphorus, Potassium (NPK); Organic matter" },
  { name: "Green Manure / Cover Crop Residue", activeIngredient: "Nitrogen (fixed); Organic matter" },
  { name: "Slurry (composted; restricted from non-organic units)", activeIngredient: "Nitrogen, Phosphorus, Potassium (NPK)" },
  { name: "Dried Blood (Blood Meal)", activeIngredient: "Nitrogen (~12–14% N)" },
  { name: "Bone Meal / Steamed Bone Flour", activeIngredient: "Phosphorus (P₂O₅ 20–25%); Nitrogen (~4% N)" },
  { name: "Fish Meal / Fish Emulsion", activeIngredient: "Nitrogen (~10% N); Phosphorus; Trace elements" },
  { name: "Seaweed Meal", activeIngredient: "Potassium; Cytokinins; Trace elements" },
  { name: "Calcified Seaweed (Lithothamnium)", activeIngredient: "Calcium carbonate; Magnesium; Trace elements" },
  { name: "Seaweed Extract (liquid)", activeIngredient: "Cytokinins; Auxins; Betaines; Trace elements" },
  { name: "Rock Phosphate (soft / reactive)", activeIngredient: "Phosphorus (P₂O₅ 28–35%)" },
  { name: "Potassium Sulphate (natural mineral extraction, low chloride)", activeIngredient: "Potassium (K₂O 48–52%); Sulphur" },
  { name: "Kieserite (Magnesium Sulphate, natural mineral)", activeIngredient: "Magnesium (MgO 27%); Sulphur (SO₃ 55%)" },
  { name: "Wood Ash (from untreated wood only)", activeIngredient: "Potassium; Calcium; Phosphorus" },
  { name: "Ground Limestone / Calcium Carbonate", activeIngredient: "Calcium carbonate (CaCO₃)" },
  { name: "Dolomitic Limestone / Magnesium Limestone", activeIngredient: "Calcium carbonate; Magnesium carbonate" },
  { name: "Gypsum (natural calcium sulphate)", activeIngredient: "Calcium sulphate (CaSO₄); Sulphur" },
  { name: "Elemental Sulphur", activeIngredient: "Sulphur (S)" },
  { name: "Copper Hydroxide", activeIngredient: "Copper (Cu(OH)₂)" },
  { name: "Copper Oxychloride", activeIngredient: "Copper (Cu₂(OH)₃Cl)" },
  { name: "Copper Sulphate / Bordeaux Mixture", activeIngredient: "Copper sulphate (CuSO₄); Calcium hydroxide" },
  { name: "Pyrethrin (from Chrysanthemum cinerariaefolium)", activeIngredient: "Pyrethrin I and II (natural pyrethroid)" },
  { name: "Spinosad (restricted — certifier notification required)", activeIngredient: "Spinosyn A and D (fermentation-derived)" },
  { name: "Bacillus thuringiensis (Bt)", activeIngredient: "Bacillus thuringiensis delta-endotoxin (biological)" },
  { name: "Beauveria bassiana", activeIngredient: "Beauveria bassiana spores (entomopathogenic fungus)" },
  { name: "Entomopathogenic Nematodes", activeIngredient: "Steinernema / Heterorhabditis spp." },
  { name: "Iron Phosphate (slug pellets)", activeIngredient: "Iron(III) phosphate (FePO₄)" },
  { name: "Kaolin (particle film)", activeIngredient: "Hydrated aluminium silicate (Al₂Si₂O₅(OH)₄)" },
  { name: "Diatomaceous Earth / Kieselgur", activeIngredient: "Amorphous silica (SiO₂)" },
  { name: "Potassium Bicarbonate", activeIngredient: "Potassium bicarbonate (KHCO₃)" },
  { name: "Sulphur (wettable / dust)", activeIngredient: "Sulphur (S)" },
  { name: "Soft Soap / Potassium Soap", activeIngredient: "Potassium salts of fatty acids" },
  { name: "Rapeseed Oil / Plant Oil", activeIngredient: "Triglycerides / fatty acids (plant-derived)" },
  { name: "Pheromones (mating disruption traps only)", activeIngredient: "Insect sex pheromones (species-specific)" },
];

// ─── Scope constants + helpers ────────────────────────────────────────────────

const SCOPE_GROUPS = [
  {
    group: "Arable",
    items: [
      { key: "arable:cereals",  label: "Cereals" },
      { key: "arable:oilseeds", label: "Oilseeds" },
      { key: "arable:pulses",   label: "Pulses" },
      { key: "arable:potatoes", label: "Potatoes" },
      { key: "arable:forage",   label: "Forage / Cover Crops" },
    ],
  },
  {
    group: "Horticulture",
    items: [
      { key: "hort:field-veg",  label: "Field Vegetables" },
      { key: "hort:protected",  label: "Protected Crops (polytunnel/glass)" },
      { key: "hort:herbs",      label: "Herbs & Botanicals" },
      { key: "hort:soft-fruit", label: "Soft Fruit" },
      { key: "hort:top-fruit",  label: "Top Fruit" },
    ],
  },
  {
    group: "Livestock",
    items: [
      { key: "livestock:beef",        label: "Beef Cattle" },
      { key: "livestock:dairy",       label: "Dairy Cattle" },
      { key: "livestock:sheep-meat",  label: "Sheep (Meat)" },
      { key: "livestock:sheep-wool",  label: "Sheep (Wool)" },
      { key: "livestock:pigs",        label: "Pigs" },
      { key: "livestock:laying-hens", label: "Laying Hens (Eggs)" },
      { key: "livestock:broilers",    label: "Broilers (Meat Poultry)" },
      { key: "livestock:goats-dairy", label: "Goats (Dairy)" },
      { key: "livestock:goats-meat",  label: "Goats (Meat)" },
      { key: "livestock:deer",        label: "Deer" },
      { key: "livestock:bees",        label: "Bees / Apiculture" },
    ],
  },
  {
    group: "Land",
    items: [
      { key: "land:in-conversion", label: "In-Conversion Land" },
      { key: "land:certified",     label: "Fully Certified Land" },
      { key: "land:woodland",      label: "Woodland" },
      { key: "land:conservation",  label: "Conservation / Wildflower Headlands" },
    ],
  },
  {
    group: "On-Farm Handling",
    items: [
      { key: "handling:grain-storage", label: "Grain Storage & Drying" },
      { key: "handling:milling",       label: "On-Farm Milling / Processing" },
      { key: "handling:packing",       label: "Packing & Preparation" },
    ],
  },
];

function parseScopeKeys(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}

function getScopeLabel(key: string): string {
  for (const g of SCOPE_GROUPS) {
    const item = g.items.find(i => i.key === key);
    if (item) return item.label;
  }
  return key;
}

function formatScopeSummary(raw: string | null | undefined): string {
  const keys = parseScopeKeys(raw);
  if (keys.length === 0) return "—";
  const groups = new Set(keys.map(k => SCOPE_GROUPS.find(g => g.items.some(i => i.key === k))?.group ?? k.split(":")[0]));
  const labels = [...groups];
  return labels.length <= 2 ? labels.join(", ") : `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatusBadge({ value, options }: {
  value: string;
  options: { value: string; label: string; cls?: string }[];
}) {
  const opt = options.filter(o => o.value !== "all").find(o => o.value === value)
    ?? { label: value, cls: "bg-gray-100 text-gray-600 border-gray-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${opt.cls ?? "bg-gray-100 text-gray-600 border-gray-300"}`}>
      {opt.label}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-10 h-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function DeleteConfirmDialog({ open, onClose, onConfirm, saving }: {
  open: boolean; onClose: () => void; onConfirm: () => void; saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />Delete Record
          </DialogTitle>
          <DialogDescription>This action cannot be undone. Are you sure?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium min-w-[150px] shrink-0">{label}</span>
      <span className="text-sm flex-1">{value || "—"}</span>
    </div>
  );
}

function FilterPills({ options, value, onChange, counts }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${value === o.value ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted"}`}
        >
          {o.label}
          {counts && counts[o.value] != null && (
            <span className={`ml-1.5 ${value === o.value ? "opacity-80" : "text-muted-foreground"}`}>({counts[o.value]})</span>
          )}
        </button>
      ))}
    </div>
  );
}

function ReportBar({ onPrint, onCsv, onAdd, addLabel }: {
  onPrint: () => void; onCsv: () => void; onAdd: () => void; addLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="w-3.5 h-3.5 mr-1.5" />Print Register
        </Button>
        <Button variant="outline" size="sm" onClick={onCsv}>
          <Download className="w-3.5 h-3.5 mr-1.5" />Export CSV
        </Button>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-1.5" />{addLabel}
      </Button>
    </div>
  );
}

// ─── Field Selector ────────────────────────────────────────────────────────────

function FieldSelector({ value, onChange, fields }: {
  value: string; onChange: (v: string) => void; fields: { id: number; name: string; areaHectares?: string | null }[];
}) {
  const inList = fields.some(f => f.name === value);
  const showText = !inList || fields.length === 0;
  return (
    <div className="space-y-1.5">
      {fields.length > 0 && (
        <Select value={inList ? value : "__other__"} onValueChange={v => {
          if (v === "__other__") onChange("");
          else onChange(v);
        }}>
          <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
          <SelectContent>
            {fields.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
            <SelectItem value="__other__">Other / Manual entry</SelectItem>
          </SelectContent>
        </Select>
      )}
      {showText && (
        <Input placeholder="Field / parcel name" value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ─── Substance Picker ─────────────────────────────────────────────────────────

function SubstancePicker({ value, onChange, onIngredient }: {
  value: string; onChange: (v: string) => void; onIngredient?: (ingredient: string) => void;
}) {
  const inList = ANNEX_INPUTS.some(s => s.name === value);
  const [custom, setCustom] = useState(!inList && value !== "");
  return (
    <div className="space-y-1.5">
      <select
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={inList ? value : custom ? "__other__" : ""}
        onChange={e => {
          if (e.target.value === "__other__") { setCustom(true); onChange(""); onIngredient?.(""); }
          else if (e.target.value === "") { setCustom(false); onChange(""); onIngredient?.(""); }
          else {
            setCustom(false);
            onChange(e.target.value);
            const match = ANNEX_INPUTS.find(s => s.name === e.target.value);
            onIngredient?.(match?.activeIngredient ?? "");
          }
        }}
      >
        <option value="">Select Annex II approved input…</option>
        {ANNEX_INPUTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
        <option value="__other__">Other / specify below</option>
      </select>
      {custom && (
        <Input autoFocus placeholder="Enter product / substance name" value={inList ? "" : value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "certification" | "field-conversion" | "seed-sourcing" | "input-log" | "harvest-declarations";

export default function OrganicArablePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  // ── Lookups ──
  const cropOptions = useLookupStrings("commodity_types", DEFAULT_ARABLE_CROPS);
  const { data: varietyLookup } = useQuery<{ items: { value: string; groupLabel?: string }[] }>({
    queryKey: ["lookups", "crop_varieties"],
    queryFn: () => apiFetch("lookups/crop_varieties").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const allVarietyItems = varietyLookup?.items ?? [];

  const { data: fieldsData } = useQuery<{ records: { id: number; name: string; areaHectares?: string | null }[] }>({
    queryKey: ["farm-fields", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
  });
  const fieldOptions = fieldsData?.records ?? [];

  const suppliersQ = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const allSuppliers: any[] = suppliersQ.data ?? [];

  const deliveriesQ = useQuery({
    queryKey: ["stock-deliveries-all", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/stock-deliveries`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const allDeliveries: any[] = deliveriesQ.data ?? [];

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<Tab>("certification");

  // ── Certification ──
  const [certFilter, setCertFilter] = useState("all");
  const [viewCert, setViewCert] = useState<Row | null>(null);
  const [certOpen, setCertOpen] = useState(false);
  const [certEditing, setCertEditing] = useState<Row | null>(null);
  const [certDeleting, setCertDeleting] = useState<number | null>(null);
  const [certForm, setCertForm] = useState<Record<string, string>>({});
  const [certScopeKeys, setCertScopeKeys] = useState<string[]>([]);

  // ── Field Conversion ──
  const [convFilter, setConvFilter] = useState("all");
  const [viewConv, setViewConv] = useState<Row | null>(null);
  const [convOpen, setConvOpen] = useState(false);
  const [convEditing, setConvEditing] = useState<Row | null>(null);
  const [convDeleting, setConvDeleting] = useState<number | null>(null);
  const [convForm, setConvForm] = useState<Record<string, string>>({});

  // ── Seed Sourcing ──
  const [seedSubTab, setSeedSubTab] = useState<"declarations" | "stock">("declarations");
  const [seedFilterCrop, setSeedFilterCrop] = useState("all");
  const [seedFilterType, setSeedFilterType] = useState("all");
  const [viewSeed, setViewSeed] = useState<Row | null>(null);
  const [seedOpen, setSeedOpen] = useState(false);
  const [seedEditing, setSeedEditing] = useState<Row | null>(null);
  const [seedDeleting, setSeedDeleting] = useState<number | null>(null);
  const [seedForm, setSeedForm] = useState<Record<string, string>>({});

  // ── Seed Stock ──
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [stockEditing, setStockEditing] = useState<Row | null>(null);
  const [stockDeleting, setStockDeleting] = useState<number | null>(null);
  const [stockForm, setStockForm] = useState<Record<string, string>>({});
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveType, setMoveType] = useState<"goods_in" | "consumption" | "adjustment" | "waste">("goods_in");
  const [moveStockId, setMoveStockId] = useState<number | null>(null);
  const [moveForm, setMoveForm] = useState<Record<string, string>>({});
  const [moveDeleting, setMoveDeleting] = useState<number | null>(null);

  // ── Input Log ──
  const [inputFilterYear, setInputFilterYear] = useState(String(currentYear()));
  const [inputFilterType, setInputFilterType] = useState("all");
  const [inputFilterStatus, setInputFilterStatus] = useState("all");
  const [viewInput, setViewInput] = useState<Row | null>(null);
  const [inputOpen, setInputOpen] = useState(false);
  const [inputEditing, setInputEditing] = useState<Row | null>(null);
  const [inputDeleting, setInputDeleting] = useState<number | null>(null);
  const [inputForm, setInputForm] = useState<Record<string, string>>({});
  const [inputCustomProduct, setInputCustomProduct] = useState(false);
  const [inputAreaAutoFilled, setInputAreaAutoFilled] = useState(false);

  // ── Harvest Declarations ──
  const [harvestFilterYear, setHarvestFilterYear] = useState(String(currentYear()));
  const [harvestFilterCrop, setHarvestFilterCrop] = useState("all");
  const [harvestFilterStatus, setHarvestFilterStatus] = useState("all");
  const [viewHarvest, setViewHarvest] = useState<Row | null>(null);
  const [harvestOpen, setHarvestOpen] = useState(false);
  const [harvestEditing, setHarvestEditing] = useState<Row | null>(null);
  const [harvestDeleting, setHarvestDeleting] = useState<number | null>(null);
  const [harvestForm, setHarvestForm] = useState<Record<string, string>>({});

  // ── Buyer Declaration (separate dialog) ──
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [buyerRecord, setBuyerRecord] = useState<Row | null>(null);
  const [buyerForm, setBuyerForm] = useState<Record<string, string>>({});

  // ── Queries ──
  const certQ = useQuery<Row[]>({ queryKey: ["oa-cert", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/certification`).then(r => r.json()).then(d => d.records), enabled: !!farmId });
  const convQ = useQuery<Row[]>({ queryKey: ["oa-conv", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/field-conversion`).then(r => r.json()).then(d => d.records), enabled: !!farmId });
  const seedQ = useQuery<Row[]>({ queryKey: ["oa-seed", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/seed-records`).then(r => r.json()).then(d => d.records), enabled: !!farmId });
  const stockQ = useQuery<Row[]>({ queryKey: ["oa-seed-stock", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/seed-stock`).then(r => r.json()).then(d => d.records), enabled: !!farmId });
  const movementsQ = useQuery<Row[]>({ queryKey: ["oa-seed-movements", farmId, selectedStockId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/seed-movements${selectedStockId ? `?stockId=${selectedStockId}` : ""}`).then(r => r.json()).then(d => d.records), enabled: !!farmId && seedSubTab === "stock" });
  const inputQ = useQuery<Row[]>({ queryKey: ["oa-input", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/input-records`).then(r => r.json()).then(d => d.records), enabled: !!farmId });
  const harvestQ = useQuery<Row[]>({ queryKey: ["oa-harvest", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/harvest-declarations`).then(r => r.json()).then(d => d.records), enabled: !!farmId });

  // ── Generic CRUD factory ──
  function useCrud(endpoint: string, keys: string[]) {
    const save = useMutation({
      mutationFn: ({ id, body }: { id?: number; body: Record<string, unknown> }) =>
        apiFetch(id ? `farms/${farmId}/${endpoint}/${id}` : `farms/${farmId}/${endpoint}`, {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json()),
      onSuccess: () => { keys.forEach(k => qc.invalidateQueries({ queryKey: [k, farmId] })); toast({ title: "Saved" }); },
      onError: () => toast({ title: "Error saving", variant: "destructive" }),
    });
    const del = useMutation({
      mutationFn: (id: number) => apiFetch(`farms/${farmId}/${endpoint}/${id}`, { method: "DELETE" }),
      onSuccess: () => { keys.forEach(k => qc.invalidateQueries({ queryKey: [k, farmId] })); toast({ title: "Deleted" }); },
      onError: () => toast({ title: "Error deleting", variant: "destructive" }),
    });
    return { save, del };
  }

  const certMut = useCrud("organic-arable/certification", ["oa-cert"]);
  const convMut = useCrud("organic-arable/field-conversion", ["oa-conv"]);
  const seedMut = useCrud("organic-arable/seed-records", ["oa-seed"]);
  const stockMut = useCrud("organic-arable/seed-stock", ["oa-seed-stock"]);
  const inputMut = useCrud("organic-arable/input-records", ["oa-input"]);
  const harvestMut = useCrud("organic-arable/harvest-declarations", ["oa-harvest"]);

  const moveSaveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`farms/${farmId}/organic-arable/seed-movements`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oa-seed-stock", farmId] });
      qc.invalidateQueries({ queryKey: ["oa-seed-movements", farmId] });
      toast({ title: "Movement recorded" });
      setMoveOpen(false); setMoveForm({});
    },
    onError: () => toast({ title: "Error recording movement", variant: "destructive" }),
  });
  const moveDelMut = useMutation({
    mutationFn: (id: number) => apiFetch(`farms/${farmId}/organic-arable/seed-movements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oa-seed-stock", farmId] });
      qc.invalidateQueries({ queryKey: ["oa-seed-movements", farmId] });
      toast({ title: "Movement deleted" });
      setMoveDeleting(null);
    },
    onError: () => toast({ title: "Error deleting", variant: "destructive" }),
  });

  // ── Filtered data ──
  const certs = certQ.data ?? [];
  const convs = convQ.data ?? [];
  const seeds = seedQ.data ?? [];
  const stockLines = stockQ.data ?? [];
  const movements = movementsQ.data ?? [];
  const selectedStock = selectedStockId ? stockLines.find(s => Number(s.id) === selectedStockId) ?? null : null;
  const inputs = inputQ.data ?? [];
  const harvests = harvestQ.data ?? [];

  const filteredCerts = useMemo(() => certs.filter(c => certFilter === "all" || c.status === certFilter), [certs, certFilter]);
  const filteredConvs = useMemo(() => convs.filter(c => convFilter === "all" || c.status === convFilter), [convs, convFilter]);
  const filteredSeeds = useMemo(() => seeds.filter(s =>
    (seedFilterCrop === "all" || s.cropName === seedFilterCrop) &&
    (seedFilterType === "all" || s.seedType === seedFilterType)
  ), [seeds, seedFilterCrop, seedFilterType]);
  const filteredInputs = useMemo(() => inputs.filter(i =>
    (inputFilterYear === "all" || str(i.applicationDate).startsWith(inputFilterYear)) &&
    (inputFilterType === "all" || i.inputType === inputFilterType) &&
    (inputFilterStatus === "all" || i.permittedStatus === inputFilterStatus)
  ), [inputs, inputFilterYear, inputFilterType, inputFilterStatus]);
  const filteredHarvests = useMemo(() => harvests.filter(h =>
    (harvestFilterYear === "all" || str(h.harvestDate).startsWith(harvestFilterYear)) &&
    (harvestFilterCrop === "all" || h.cropName === harvestFilterCrop) &&
    (harvestFilterStatus === "all" || h.organicStatus === harvestFilterStatus)
  ), [harvests, harvestFilterYear, harvestFilterCrop, harvestFilterStatus]);

  // ─── Certification form functions ─────────────────────────────────────────

  function openCertForm(row?: Row) {
    if (row) {
      setCertEditing(row);
      setCertForm({
        certifier: str(row.certifier), certificateNumber: str(row.certificateNumber),
        operatorNumber: str(row.operatorNumber), certificationDate: str(row.certificationDate),
        renewalDate: str(row.renewalDate), annualInspectionDate: str(row.annualInspectionDate),
        nextInspectionDue: str(row.nextInspectionDue), status: str(row.status) || "certified",
        notes: str(row.notes),
      });
      setCertScopeKeys(parseScopeKeys(str(row.scope)));
    } else {
      setCertEditing(null);
      setCertForm({ status: "certified", certifier: CERTIFIERS[0] });
      setCertScopeKeys([]);
    }
    setCertOpen(true);
  }
  function saveCert() {
    const INACTIVE = ["suspended", "withdrawn"];
    const otherActive = certs.filter(r => {
      const isSelf = certEditing && Number(r.id) === Number(certEditing.id);
      return !isSelf && !INACTIVE.includes(str(r.status));
    });
    const conflicts: string[] = [];
    for (const other of otherActive) {
      if (str(other.certifier) === certForm.certifier) continue;
      const otherKeys = parseScopeKeys(str(other.scope));
      const overlapping = certScopeKeys.filter(k => otherKeys.includes(k));
      if (overlapping.length > 0)
        conflicts.push(`${str(other.certifier)} already holds: ${overlapping.map(getScopeLabel).join(", ")}`);
    }
    if (conflicts.length > 0) {
      toast({ title: "Scope conflict", description: conflicts.join(" | "), variant: "destructive" });
      return;
    }
    const body = { ...certForm, scope: JSON.stringify(certScopeKeys) };
    certMut.save.mutate({ id: certEditing ? Number(certEditing.id) : undefined, body }, {
      onSuccess: () => { setCertOpen(false); setCertEditing(null); setCertForm({}); setCertScopeKeys([]); },
    });
  }

  // ─── Conversion form functions ────────────────────────────────────────────

  function openConvForm(row?: Row) {
    if (row) {
      setConvEditing(row);
      setConvForm({
        fieldName: str(row.fieldName), areaHa: str(row.areaHa),
        conversionStartDate: str(row.conversionStartDate),
        expectedCertificationDate: str(row.expectedCertificationDate),
        actualCertificationDate: str(row.actualCertificationDate),
        status: str(row.status) || "in-conversion", certifierRef: str(row.certifierRef),
        parallelProduction: row.parallelProduction ? "true" : "false",
        parallelProductionJustification: str(row.parallelProductionJustification),
        previousLandUse: str(row.previousLandUse), notes: str(row.notes),
      });
    } else {
      setConvEditing(null);
      setConvForm({ status: "in-conversion", conversionStartDate: today, parallelProduction: "false" });
    }
    setConvOpen(true);
  }
  function saveConv() {
    const body = { ...convForm, parallelProduction: convForm.parallelProduction === "true" };
    convMut.save.mutate({ id: convEditing ? Number(convEditing.id) : undefined, body }, {
      onSuccess: () => { setConvOpen(false); setConvEditing(null); setConvForm({}); },
    });
  }

  // ─── Seed form functions ──────────────────────────────────────────────────

  function openSeedForm(row?: Row) {
    if (row) {
      setSeedEditing(row);
      setSeedForm({
        purchaseDate: str(row.purchaseDate), cropName: str(row.cropName),
        variety: str(row.variety), quantityKg: str(row.quantityKg),
        supplierName: str(row.supplierName), supplierAddress: str(row.supplierAddress),
        seedType: str(row.seedType) || "organic",
        derogationGranted: row.derogationGranted ? "true" : "false",
        derogationReference: str(row.derogationReference),
        derogationExpiryDate: str(row.derogationExpiryDate),
        certifierApproval: str(row.certifierApproval),
        batchLotNumber: str(row.batchLotNumber),
        poReference: str(row.poReference), grnReference: str(row.grnReference),
        notes: str(row.notes),
      });
    } else {
      setSeedEditing(null);
      setSeedForm({ purchaseDate: today, seedType: "organic", derogationGranted: "false" });
    }
    setSeedOpen(true);
  }
  function saveSeed() {
    const body = {
      ...seedForm,
      derogationGranted: seedForm.derogationGranted === "true",
      variety: seedForm.variety === "__other__" ? "" : (seedForm.variety || ""),
    };
    seedMut.save.mutate({ id: seedEditing ? Number(seedEditing.id) : undefined, body }, {
      onSuccess: () => { setSeedOpen(false); setSeedEditing(null); setSeedForm({}); },
    });
  }
  const seedVarieties = allVarietyItems
    .filter(v => !seedForm.cropName || !v.groupLabel || v.groupLabel === seedForm.cropName)
    .map(v => v.value);

  // ─── Input form functions ─────────────────────────────────────────────────

  function openInputForm(row?: Row) {
    if (row) {
      setInputEditing(row);
      setInputForm({
        fieldName: str(row.fieldName), applicationDate: str(row.applicationDate),
        productName: str(row.productName), activeIngredient: str(row.activeIngredient),
        inputType: str(row.inputType), permittedStatus: str(row.permittedStatus) || "permitted",
        regulatoryBasis: str(row.regulatoryBasis), supplierName: str(row.supplierName),
        supplierId: str(row.supplierId), stockDeliveryId: str(row.stockDeliveryId),
        batchNumber: str(row.batchNumber), lotNumber: str(row.lotNumber), grnNumber: str(row.grnNumber),
        quantityApplied: str(row.quantityApplied), quantityUnit: str(row.quantityUnit) || "kg/ha",
        areaAppliedHa: str(row.areaAppliedHa), certifierApproval: str(row.certifierApproval),
        notes: str(row.notes),
      });
      setInputCustomProduct(!ANNEX_INPUTS.some(s => s.name === str(row.productName)));
      setInputAreaAutoFilled(false);
    } else {
      setInputEditing(null);
      setInputForm({ applicationDate: today, permittedStatus: "permitted", quantityUnit: "kg/ha" });
      setInputCustomProduct(false);
      setInputAreaAutoFilled(false);
    }
    setInputOpen(true);
  }
  function saveInput() {
    inputMut.save.mutate({ id: inputEditing ? Number(inputEditing.id) : undefined, body: inputForm }, {
      onSuccess: () => { setInputOpen(false); setInputEditing(null); setInputForm({}); },
    });
  }

  // ─── Harvest form functions ───────────────────────────────────────────────

  function openHarvestForm(row?: Row) {
    if (row) {
      setHarvestEditing(row);
      setHarvestForm({
        fieldName: str(row.fieldName), harvestDate: str(row.harvestDate),
        cropName: str(row.cropName), variety: str(row.variety),
        yieldTonnes: str(row.yieldTonnes), moisturePercent: str(row.moisturePercent),
        storageLocation: str(row.storageLocation),
        organicStatus: str(row.organicStatus) || "certified",
        certifierRef: str(row.certifierRef), notes: str(row.notes),
      });
    } else {
      setHarvestEditing(null);
      setHarvestForm({ harvestDate: today, organicStatus: "certified" });
    }
    setHarvestOpen(true);
  }
  function saveHarvest() {
    const body = {
      ...harvestForm,
      variety: harvestForm.variety === "__other__" ? "" : (harvestForm.variety || ""),
    };
    harvestMut.save.mutate({ id: harvestEditing ? Number(harvestEditing.id) : undefined, body }, {
      onSuccess: () => { setHarvestOpen(false); setHarvestEditing(null); setHarvestForm({}); },
    });
  }
  const harvestVarieties = allVarietyItems
    .filter(v => !harvestForm.cropName || !v.groupLabel || v.groupLabel === harvestForm.cropName)
    .map(v => v.value);

  // ─── Buyer Declaration functions ──────────────────────────────────────────

  function openBuyer(row: Row) {
    setBuyerRecord(row);
    setBuyerForm({
      buyerName: str(row.buyerName), buyerOrganisation: str(row.buyerOrganisation),
      buyerAddress: str(row.buyerAddress), saleDate: str(row.saleDate),
      quantitySoldTonnes: str(row.quantitySoldTonnes),
      pricePoundPerTonne: str(row.pricePoundPerTonne),
      organicPremiumPercent: str(row.organicPremiumPercent),
      declarationDate: str(row.declarationDate),
      declarationReference: str(row.declarationReference),
    });
    setBuyerOpen(true);
  }
  function saveBuyer() {
    if (!buyerRecord) return;
    harvestMut.save.mutate({ id: Number(buyerRecord.id), body: buyerForm }, {
      onSuccess: () => { setBuyerOpen(false); setBuyerRecord(null); setBuyerForm({}); },
    });
  }

  // ─── Print functions ──────────────────────────────────────────────────────

  function printCerts() {
    printProReport({
      title: "Organic Arable — Certification Register",
      recordCount: filteredCerts.length, recordLabel: "certificate",
      footerNote: "Organic Arable Certification Register — UK Retained EU Organic Regulation",
      tableHtml: `<table><thead><tr><th>Certifier</th><th>Certificate No.</th><th>Operator No.</th><th>Status</th><th>Certified</th><th>Renewal Due</th><th>Next Inspection</th><th>Scope</th></tr></thead><tbody>${
        filteredCerts.map(r => `<tr><td>${str(r.certifier)}</td><td>${str(r.certificateNumber)||"—"}</td><td>${str(r.operatorNumber)||"—"}</td><td>${str(r.status)}</td><td>${fmt(str(r.certificationDate))}</td><td>${fmt(str(r.renewalDate))}</td><td>${fmt(str(r.nextInspectionDue))}</td><td>${str(r.scope)||"—"}</td></tr>`).join("")
      }</tbody></table>`,
    });
  }
  function printConvs() {
    printProReport({
      title: "Organic Arable — Field Conversion Register",
      recordCount: filteredConvs.length, recordLabel: "field",
      footerNote: "Organic Arable Field Conversion Register — UK Retained EU Organic Regulation",
      landscape: false,
      tableHtml: `<table><thead><tr><th>Field / Parcel</th><th>Area (ha)</th><th>Status</th><th>Conversion Start</th><th>Expected Cert.</th><th>Actual Cert.</th><th>Certifier Ref</th><th>Previous Land Use</th></tr></thead><tbody>${
        filteredConvs.map(r => `<tr><td>${str(r.fieldName)}</td><td>${fmtN(r.areaHa)}</td><td>${str(r.status)}</td><td>${fmt(str(r.conversionStartDate))}</td><td>${fmt(str(r.expectedCertificationDate))}</td><td>${fmt(str(r.actualCertificationDate))}</td><td>${str(r.certifierRef)||"—"}</td><td>${str(r.previousLandUse)||"—"}</td></tr>`).join("")
      }</tbody></table>`,
    });
  }
  function printSeeds() {
    printProReport({
      title: "Organic Arable — Seed Sourcing Log",
      recordCount: filteredSeeds.length, recordLabel: "record",
      footerNote: "Organic seed sourcing log — derogation records must be retained for inspection",
      tableHtml: `<table><thead><tr><th>Date</th><th>Crop</th><th>Variety</th><th>Seed Type</th><th>Qty (kg)</th><th>Supplier</th><th>PO Ref</th><th>GRN Ref</th><th>Derogation Ref</th><th>Batch/Lot</th></tr></thead><tbody>${
        filteredSeeds.map(r => `<tr><td>${fmt(str(r.purchaseDate))}</td><td>${str(r.cropName)}</td><td>${str(r.variety)||"—"}</td><td>${str(r.seedType)}</td><td>${fmtN(r.quantityKg)}</td><td>${str(r.supplierName)||"—"}</td><td>${str(r.poReference)||"—"}</td><td>${str(r.grnReference)||"—"}</td><td>${str(r.derogationReference)||"—"}</td><td>${str(r.batchLotNumber)||"—"}</td></tr>`).join("")
      }</tbody></table>`,
    });
  }
  function printInputs() {
    printProReport({
      title: "Organic Arable — Permitted Input Register",
      recordCount: filteredInputs.length, recordLabel: "application",
      footerNote: "Organic Arable Input Register — Annex II permitted inputs only (UK Retained EU Reg 2018/848)",
      tableHtml: `<table><thead><tr><th>Date</th><th>Product / Substance</th><th>Type</th><th>Status</th><th>Field</th><th>Qty Applied</th><th>Area (ha)</th><th>Certifier Approval</th></tr></thead><tbody>${
        filteredInputs.map(r => `<tr><td>${fmt(str(r.applicationDate))}</td><td>${str(r.productName)}</td><td>${str(r.inputType)||"—"}</td><td>${str(r.permittedStatus)}</td><td>${str(r.fieldName)||"—"}</td><td>${fmtN(r.quantityApplied)} ${str(r.quantityUnit)}</td><td>${fmtN(r.areaAppliedHa)}</td><td>${str(r.certifierApproval)||"—"}</td></tr>`).join("")
      }</tbody></table>`,
    });
  }
  function printHarvests() {
    printProReport({
      title: "Organic Arable — Harvest Declarations",
      recordCount: filteredHarvests.length, recordLabel: "declaration",
      footerNote: "Organic Arable Harvest Declarations — retain for 5 years and make available at certifier inspection",
      tableHtml: `<table><thead><tr><th>Harvest Date</th><th>Crop</th><th>Variety</th><th>Field</th><th>Yield (t)</th><th>Status</th><th>Buyer</th><th>Sale Date</th><th>Price (£/t)</th><th>Premium %</th><th>Decl. Ref</th></tr></thead><tbody>${
        filteredHarvests.map(r => `<tr><td>${fmt(str(r.harvestDate))}</td><td>${str(r.cropName)}</td><td>${str(r.variety)||"—"}</td><td>${str(r.fieldName)||"—"}</td><td>${fmtN(r.yieldTonnes)}</td><td>${str(r.organicStatus)}</td><td>${str(r.buyerName)||"—"} ${str(r.buyerOrganisation) ? `(${str(r.buyerOrganisation)})` : ""}</td><td>${fmt(str(r.saleDate))}</td><td>${fmtN(r.pricePoundPerTonne)}</td><td>${fmtN(r.organicPremiumPercent)}</td><td>${str(r.declarationReference)||"—"}</td></tr>`).join("")
      }</tbody></table>`,
    });
  }

  // ─── CSV export functions ─────────────────────────────────────────────────

  function exportCertsCsv() {
    downloadCsvFile("organic-arable-certification.csv", [
      ["Certifier","Certificate No.","Operator No.","Status","Certified Date","Renewal Date","Next Inspection","Scope","Notes"],
      ...filteredCerts.map(r => [str(r.certifier),str(r.certificateNumber),str(r.operatorNumber),str(r.status),str(r.certificationDate),str(r.renewalDate),str(r.nextInspectionDue),str(r.scope),str(r.notes)]),
    ]);
  }
  function exportConvsCsv() {
    downloadCsvFile("organic-arable-field-conversion.csv", [
      ["Field","Area (ha)","Status","Conversion Start","Expected Cert.","Actual Cert.","Certifier Ref","Prev. Land Use","Parallel Production","Notes"],
      ...filteredConvs.map(r => [str(r.fieldName),str(r.areaHa),str(r.status),str(r.conversionStartDate),str(r.expectedCertificationDate),str(r.actualCertificationDate),str(r.certifierRef),str(r.previousLandUse),str(r.parallelProduction),str(r.notes)]),
    ]);
  }
  function exportSeedsCsv() {
    downloadCsvFile("organic-arable-seed-records.csv", [
      ["Date","Crop","Variety","Seed Type","Qty (kg)","Supplier","Supplier Address","PO Reference","GRN Reference","Derogation Granted","Derogation Ref","Derogation Expiry","Certifier Approval","Batch/Lot","Notes"],
      ...filteredSeeds.map(r => [str(r.purchaseDate),str(r.cropName),str(r.variety),str(r.seedType),str(r.quantityKg),str(r.supplierName),str(r.supplierAddress),str(r.poReference),str(r.grnReference),str(r.derogationGranted),str(r.derogationReference),str(r.derogationExpiryDate),str(r.certifierApproval),str(r.batchLotNumber),str(r.notes)]),
    ]);
  }
  function exportInputsCsv() {
    downloadCsvFile("organic-arable-input-records.csv", [
      ["Date","Field","Product","Active Ingredient","Type","Status","Regulatory Basis","Supplier","Qty Applied","Unit","Area (ha)","Certifier Approval","Notes"],
      ...filteredInputs.map(r => [str(r.applicationDate),str(r.fieldName),str(r.productName),str(r.activeIngredient),str(r.inputType),str(r.permittedStatus),str(r.regulatoryBasis),str(r.supplierName),str(r.quantityApplied),str(r.quantityUnit),str(r.areaAppliedHa),str(r.certifierApproval),str(r.notes)]),
    ]);
  }
  function exportHarvestsCsv() {
    downloadCsvFile("organic-arable-harvest-declarations.csv", [
      ["Harvest Date","Crop","Variety","Field","Yield (t)","Moisture %","Storage","Status","Certifier Ref","Buyer","Buyer Org","Sale Date","Qty Sold (t)","Price (£/t)","Premium %","Decl. Date","Decl. Ref","Notes"],
      ...filteredHarvests.map(r => [str(r.harvestDate),str(r.cropName),str(r.variety),str(r.fieldName),str(r.yieldTonnes),str(r.moisturePercent),str(r.storageLocation),str(r.organicStatus),str(r.certifierRef),str(r.buyerName),str(r.buyerOrganisation),str(r.saleDate),str(r.quantitySoldTonnes),str(r.pricePoundPerTonne),str(r.organicPremiumPercent),str(r.declarationDate),str(r.declarationReference),str(r.notes)]),
    ]);
  }

  // ─── Derived summary stats ────────────────────────────────────────────────
  const certsDueThisYear = certs.filter(c => { const d = daysUntil(str(c.renewalDate)); return d !== null && d >= 0 && d <= 365; }).length;
  const certifiedHa = convs.filter(c => c.status === "certified").reduce((s, c) => s + (parseFloat(str(c.areaHa)) || 0), 0);
  const conversionHa = convs.filter(c => c.status === "in-conversion").reduce((s, c) => s + (parseFloat(str(c.areaHa)) || 0), 0);
  const derogationCount = seeds.filter(s => s.seedType !== "organic").length;
  const restrictedInputs = inputs.filter(i => i.permittedStatus === "restricted").length;
  const totalYield = harvests.reduce((s, h) => s + (parseFloat(str(h.yieldTonnes)) || 0), 0);
  const certifiedHarvests = harvests.filter(h => h.organicStatus === "certified").length;

  // ─── Crop filter options for harvest tab ─────────────────────────────────
  const harvestCropOptions = useMemo(() => {
    const unique = [...new Set(harvests.map(h => str(h.cropName)).filter(Boolean))].sort();
    return [{ value: "all", label: "All Crops" }, ...unique.map(c => ({ value: c, label: c }))];
  }, [harvests]);

  const seedCropOptions = useMemo(() => {
    const unique = [...new Set(seeds.map(s => str(s.cropName)).filter(Boolean))].sort();
    return [{ value: "all", label: "All Crops" }, ...unique.map(c => ({ value: c, label: c }))];
  }, [seeds]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wheat className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Organic Arable</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Conversion register, seed sourcing, permitted inputs, harvest declarations and certification records
          </p>
        </div>

        <TabBar>
          <TabButton active={activeTab === "certification"} onClick={() => setActiveTab("certification")}>
            <ShieldCheck className="w-3.5 h-3.5" />Certification
          </TabButton>
          <TabButton active={activeTab === "field-conversion"} onClick={() => setActiveTab("field-conversion")}>
            <Sprout className="w-3.5 h-3.5" />Field Conversion
          </TabButton>
          <TabButton active={activeTab === "seed-sourcing"} onClick={() => setActiveTab("seed-sourcing")}>
            <Package className="w-3.5 h-3.5" />Seed Sourcing
          </TabButton>
          <TabButton active={activeTab === "input-log"} onClick={() => setActiveTab("input-log")}>
            <FileText className="w-3.5 h-3.5" />Input Log
          </TabButton>
          <TabButton active={activeTab === "harvest-declarations"} onClick={() => setActiveTab("harvest-declarations")}>
            <Wheat className="w-3.5 h-3.5" />Harvest Declarations
          </TabButton>
        </TabBar>

        {/* ── Certification ── */}
        {activeTab === "certification" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={ShieldCheck} label="Certification Records" value={certs.length} />
              <SummaryCard icon={CheckCircle2} label="Active Certifications" value={certs.filter(c => c.status === "certified").length} />
              <SummaryCard icon={AlertTriangle} label="Renewals Due (12 months)" value={certsDueThisYear} sub={certsDueThisYear > 0 ? "check renewal dates" : "none due"} />
            </div>
            <FilterPills
              options={CERT_STATUSES.map(s => ({ value: s.value, label: s.label }))}
              value={certFilter}
              onChange={setCertFilter}
              counts={Object.fromEntries(CERT_STATUSES.map(s => [s.value, s.value === "all" ? certs.length : certs.filter(c => c.status === s.value).length]))}
            />
            <ReportBar onPrint={printCerts} onCsv={exportCertsCsv} onAdd={() => openCertForm()} addLabel="Add Certificate" />
            {certQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filteredCerts.length === 0 ? (
              <EmptyState icon={ShieldCheck} message={certFilter === "all" ? "No certification records yet. Add your certifying body certificate." : `No ${certFilter} records.`} />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Certifier</th>
                      <th className="px-4 py-3 text-left">Certificate No.</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Certified</th>
                      <th className="px-4 py-3 text-left">Renewal Due</th>
                      <th className="px-4 py-3 text-left">Next Inspection</th>
                      <th className="px-4 py-3 text-left">Scope</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCerts.map(row => {
                      const d = daysUntil(str(row.renewalDate));
                      const urgent = d !== null && d >= 0 && d <= 60;
                      return (
                        <tr key={String(row.id)} className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer ${urgent ? "bg-amber-50/50" : ""}`} onClick={() => setViewCert(row)}>
                          <td className="px-4 py-3 font-medium">{str(row.certifier)}</td>
                          <td className="px-4 py-3 font-mono text-xs">{str(row.certificateNumber) || "—"}</td>
                          <td className="px-4 py-3"><StatusBadge value={str(row.status)} options={CERT_STATUSES.slice(1)} /></td>
                          <td className="px-4 py-3">{fmt(str(row.certificationDate))}</td>
                          <td className="px-4 py-3"><span className={urgent ? "text-amber-700 font-medium" : ""}>{fmt(str(row.renewalDate))}</span></td>
                          <td className="px-4 py-3">{fmt(str(row.nextInspectionDue))}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatScopeSummary(str(row.scope))}</td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewCert(row)}><Eye className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setCertDeleting(Number(row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
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

        {/* ── Field Conversion ── */}
        {activeTab === "field-conversion" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={Sprout} label="Fields in Register" value={convs.length} />
              <SummaryCard icon={CheckCircle2} label="Certified Ha" value={certifiedHa > 0 ? `${certifiedHa.toFixed(2)} ha` : 0} />
              <SummaryCard icon={AlertTriangle} label="In Conversion Ha" value={conversionHa > 0 ? `${conversionHa.toFixed(2)} ha` : 0} sub="2-year minimum period" />
            </div>
            <FilterPills
              options={CONV_STATUSES.map(s => ({ value: s.value, label: s.label }))}
              value={convFilter}
              onChange={setConvFilter}
              counts={Object.fromEntries(CONV_STATUSES.map(s => [s.value, s.value === "all" ? convs.length : convs.filter(c => c.status === s.value).length]))}
            />
            <ReportBar onPrint={printConvs} onCsv={exportConvsCsv} onAdd={() => openConvForm()} addLabel="Add Field" />
            {convQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filteredConvs.length === 0 ? (
              <EmptyState icon={Sprout} message={convFilter === "all" ? "No fields in the conversion register. Add each field or parcel and its conversion start date." : `No ${convFilter} fields.`} />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Field / Parcel</th>
                      <th className="px-4 py-3 text-left">Area (ha)</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Conversion Start</th>
                      <th className="px-4 py-3 text-left">Expected Cert.</th>
                      <th className="px-4 py-3 text-left">Progress</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConvs.map(row => {
                      const pct = row.status === "certified" ? 100 : conversionProgress(str(row.conversionStartDate), str(row.expectedCertificationDate));
                      return (
                        <tr key={String(row.id)} className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => setViewConv(row)}>
                          <td className="px-4 py-3 font-medium">{str(row.fieldName)}</td>
                          <td className="px-4 py-3">{fmtN(row.areaHa, " ha")}</td>
                          <td className="px-4 py-3"><StatusBadge value={str(row.status)} options={CONV_STATUSES.slice(1)} /></td>
                          <td className="px-4 py-3">{fmt(str(row.conversionStartDate))}</td>
                          <td className="px-4 py-3">{fmt(str(row.expectedCertificationDate))}</td>
                          <td className="px-4 py-3 min-w-[130px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full ${pct === 100 ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewConv(row)}><Eye className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setConvDeleting(Number(row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
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

        {/* ── Seed Sourcing ── */}
        {activeTab === "seed-sourcing" && (
          <div className="space-y-5">
            {/* Sub-tab bar */}
            <div className="flex gap-1 border-b border-border pb-0">
              {([
                { key: "declarations", label: "Sourcing Declarations", icon: BookOpen },
                { key: "stock", label: "Seed Stock Ledger", icon: BarChart3 },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSeedSubTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${seedSubTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {/* ── Sourcing Declarations sub-tab ── */}
            {seedSubTab === "declarations" && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <SummaryCard icon={Package} label="Seed Records" value={seeds.length} />
                  <SummaryCard icon={CheckCircle2} label="Certified Organic" value={seeds.filter(s => s.seedType === "organic").length} />
                  <SummaryCard icon={AlertTriangle} label="Derogations / Non-Organic" value={derogationCount} sub={derogationCount > 0 ? "certifier approval required" : "none recorded"} />
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                  {seedCropOptions.length > 2 && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Crop</Label>
                      <Select value={seedFilterCrop} onValueChange={setSeedFilterCrop}>
                        <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{seedCropOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  <FilterPills
                    options={[{ value: "all", label: "All Types" }, ...SEED_TYPES.map(s => ({ value: s.value, label: s.label }))]}
                    value={seedFilterType}
                    onChange={setSeedFilterType}
                    counts={Object.fromEntries([["all", seeds.length], ...SEED_TYPES.map(s => [s.value, seeds.filter(x => x.seedType === s.value).length])])}
                  />
                </div>
                <ReportBar onPrint={printSeeds} onCsv={exportSeedsCsv} onAdd={() => openSeedForm()} addLabel="Add Seed Record" />
                {seedQ.isLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : filteredSeeds.length === 0 ? (
                  <EmptyState icon={Package} message="No seed records. Log all seed purchases — organic certified or with derogation approval." />
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Crop</th>
                          <th className="px-4 py-3 text-left">Variety</th>
                          <th className="px-4 py-3 text-left">Seed Type</th>
                          <th className="px-4 py-3 text-left">Qty (kg)</th>
                          <th className="px-4 py-3 text-left">Supplier</th>
                          <th className="px-4 py-3 text-left">PO / GRN</th>
                          <th className="px-4 py-3 text-left">Derogation</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSeeds.map(row => (
                          <tr key={String(row.id)} className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => setViewSeed(row)}>
                            <td className="px-4 py-3">{fmt(str(row.purchaseDate))}</td>
                            <td className="px-4 py-3 font-medium">{str(row.cropName)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{str(row.variety) || "—"}</td>
                            <td className="px-4 py-3"><StatusBadge value={str(row.seedType)} options={SEED_TYPES} /></td>
                            <td className="px-4 py-3">{fmtN(row.quantityKg)}</td>
                            <td className="px-4 py-3">{str(row.supplierName) || "—"}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                              {str(row.poReference) ? <span>PO: {str(row.poReference)}</span> : null}
                              {str(row.poReference) && str(row.grnReference) ? <br /> : null}
                              {str(row.grnReference) ? <span>GRN: {str(row.grnReference)}</span> : null}
                              {!str(row.poReference) && !str(row.grnReference) ? <span className="text-muted-foreground">—</span> : null}
                            </td>
                            <td className="px-4 py-3">
                              {row.derogationGranted
                                ? <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-300">Yes — {str(row.derogationReference) || "ref pending"}</span>
                                : <span className="text-xs text-muted-foreground">No</span>}
                            </td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewSeed(row)}><Eye className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setSeedDeleting(Number(row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ── Seed Stock Ledger sub-tab ── */}
            {seedSubTab === "stock" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <SummaryCard icon={Package} label="Stock Lines" value={stockLines.length} />
                  <SummaryCard icon={CheckCircle2} label="In Stock" value={stockLines.filter(s => parseFloat(str(s.currentStockKg)) > 0).length} />
                  <SummaryCard icon={AlertTriangle} label="Low / Empty" value={stockLines.filter(s => parseFloat(str(s.currentStockKg)) <= 0).length} sub="zero balance" />
                  <SummaryCard icon={BarChart3} label="Total Stock" value={`${stockLines.reduce((a, s) => a + (parseFloat(str(s.currentStockKg)) || 0), 0).toFixed(0)} kg`} />
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={() => { setStockEditing(null); setStockForm({ seedType: "organic" }); setStockOpen(true); }}>
                    <Plus className="w-4 h-4 mr-1.5" />New Stock Line
                  </Button>
                </div>

                {stockQ.isLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : stockLines.length === 0 ? (
                  <EmptyState icon={Package} message="No stock lines. Create a stock line for each crop/variety/batch you hold, then record goods-in and consumption movements." />
                ) : (
                  <div className="space-y-3">
                    {stockLines.map(line => {
                      const kg = parseFloat(str(line.currentStockKg)) || 0;
                      const threshold = parseFloat(str(line.reorderThresholdKg)) || 0;
                      const isLow = threshold > 0 && kg <= threshold;
                      const isSelected = selectedStockId === Number(line.id);
                      return (
                        <div key={String(line.id)} className="bg-card border border-border rounded-xl overflow-hidden">
                          {/* Stock line header */}
                          <div
                            className={`flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors ${isSelected ? "bg-green-50/60" : ""}`}
                            onClick={() => setSelectedStockId(isSelected ? null : Number(line.id))}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${kg <= 0 ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-green-400"}`} />
                              <div className="min-w-0">
                                <p className="font-medium text-sm">{str(line.cropName)}{str(line.variety) ? ` — ${str(line.variety)}` : ""}</p>
                                <p className="text-xs text-muted-foreground">
                                  {str(line.batchLotNumber) ? `Batch: ${str(line.batchLotNumber)} · ` : ""}
                                  <StatusBadge value={str(line.seedType)} options={SEED_TYPES} />
                                  {str(line.supplierName) ? ` · ${str(line.supplierName)}` : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <p className={`text-lg font-bold tabular-nums ${kg <= 0 ? "text-red-600" : isLow ? "text-amber-600" : "text-green-600"}`}>{kg.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">kg in stock</p>
                              </div>
                              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setMoveType("goods_in"); setMoveStockId(Number(line.id)); setMoveForm({ movementDate: today, quantityKg: "" }); setMoveOpen(true); }}>
                                  <ArrowDownToLine className="w-3 h-3" />Goods In
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setMoveType("consumption"); setMoveStockId(Number(line.id)); setMoveForm({ movementDate: today, quantityKg: "" }); setMoveOpen(true); }}>
                                  <ArrowUpFromLine className="w-3 h-3" />Consumed
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStockEditing(line); setStockForm({ cropName: str(line.cropName), variety: str(line.variety), batchLotNumber: str(line.batchLotNumber), seedType: str(line.seedType) || "organic", supplierName: str(line.supplierName), reorderThresholdKg: str(line.reorderThresholdKg), storageLocation: str(line.storageLocation), notes: str(line.notes) }); setStockOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setStockDeleting(Number(line.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </div>
                            </div>
                          </div>

                          {/* Movements ledger — expanded when selected */}
                          {isSelected && (
                            <div className="border-t border-border">
                              <div className="flex items-center justify-between px-4 py-2 bg-muted/20">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Movement History</p>
                                <div className="flex gap-1.5">
                                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => { setMoveType("adjustment"); setMoveStockId(Number(line.id)); setMoveForm({ movementDate: today, quantityKg: "" }); setMoveOpen(true); }}>Adjustment</Button>
                                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => { setMoveType("waste"); setMoveStockId(Number(line.id)); setMoveForm({ movementDate: today, quantityKg: "" }); setMoveOpen(true); }}>Waste</Button>
                                </div>
                              </div>
                              {movementsQ.isLoading ? (
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                              ) : movements.filter(m => Number(m.stockId) === Number(line.id)).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-5">No movements yet — record a Goods In to start the ledger.</p>
                              ) : (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-border bg-muted/10 text-[10px] uppercase tracking-wider text-muted-foreground">
                                      <th className="px-4 py-2 text-left">Date</th>
                                      <th className="px-4 py-2 text-left">Type</th>
                                      <th className="px-4 py-2 text-right">Qty (kg)</th>
                                      <th className="px-4 py-2 text-left">Reference</th>
                                      <th className="px-4 py-2 text-left">Field / Operator</th>
                                      <th className="px-4 py-2" />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {movements.filter(m => Number(m.stockId) === Number(line.id)).map(mv => {
                                      const isIn = mv.movementType === "goods_in" || mv.movementType === "adjustment";
                                      return (
                                        <tr key={String(mv.id)} className="border-b border-border last:border-0 hover:bg-muted/10">
                                          <td className="px-4 py-2">{fmt(str(mv.movementDate))}</td>
                                          <td className="px-4 py-2">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${mv.movementType === "goods_in" ? "bg-green-50 text-green-700" : mv.movementType === "consumption" ? "bg-blue-50 text-blue-700" : mv.movementType === "waste" ? "bg-red-50 text-red-700" : "bg-muted text-muted-foreground"}`}>
                                              {mv.movementType === "goods_in" ? <ArrowDownToLine className="w-2.5 h-2.5" /> : <ArrowUpFromLine className="w-2.5 h-2.5" />}
                                              {String(mv.movementType).replace("_", " ")}
                                            </span>
                                          </td>
                                          <td className={`px-4 py-2 text-right font-mono font-semibold ${isIn ? "text-green-600" : "text-red-600"}`}>
                                            {isIn ? "+" : "-"}{str(mv.quantityKg)} kg
                                          </td>
                                          <td className="px-4 py-2 font-mono text-muted-foreground">
                                            {[str(mv.poReference) ? `PO:${str(mv.poReference)}` : "", str(mv.grnReference) ? `GRN:${str(mv.grnReference)}` : "", str(mv.invoiceReference) ? `Inv:${str(mv.invoiceReference)}` : "", str(mv.reference) || ""].filter(Boolean).join(" · ") || "—"}
                                          </td>
                                          <td className="px-4 py-2 text-muted-foreground">
                                            {[str(mv.fieldName), str(mv.operatorName), str(mv.reason)].filter(Boolean).join(" · ") || "—"}
                                          </td>
                                          <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setMoveDeleting(Number(mv.id))}><Trash2 className="w-3 h-3" /></Button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Input Log ── */}
        {activeTab === "input-log" && (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-semibold mb-1">Annex II Permitted Inputs — UK Retained EU Organic Regulation</p>
              <p className="text-xs">Only listed inputs may be used on certified or in-conversion land. Restricted substances require prior certifier notification. All applications must be recorded here as evidence for inspection.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={FileText} label="Input Applications" value={inputs.length} />
              <SummaryCard icon={CheckCircle2} label="Fully Permitted" value={inputs.filter(i => i.permittedStatus === "permitted").length} />
              <SummaryCard icon={AlertTriangle} label="Restricted (notify certifier)" value={restrictedInputs} sub={restrictedInputs > 0 ? "ensure approvals filed" : "none recorded"} />
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Year</Label>
                <Select value={inputFilterYear} onValueChange={setInputFilterYear}>
                  <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {yearOptions().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Type</Label>
                <Select value={inputFilterType} onValueChange={setInputFilterType}>
                  <SelectTrigger className="w-52 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {INPUT_TYPES_ALL.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <FilterPills
                options={PERMITTED_STATUSES.map(s => ({ value: s.value, label: s.label.split(" —")[0] }))}
                value={inputFilterStatus}
                onChange={setInputFilterStatus}
                counts={Object.fromEntries(PERMITTED_STATUSES.map(s => [s.value, s.value === "all" ? inputs.length : inputs.filter(i => i.permittedStatus === s.value).length]))}
              />
            </div>
            <ReportBar onPrint={printInputs} onCsv={exportInputsCsv} onAdd={() => openInputForm()} addLabel="Log Input" />
            {inputQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filteredInputs.length === 0 ? (
              <EmptyState icon={FileText} message="No input records for this filter. Log every fertiliser, soil amendment, and crop protection product applied." />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Field</th>
                      <th className="px-4 py-3 text-left">Qty Applied</th>
                      <th className="px-4 py-3 text-left">Area (ha)</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInputs.map(row => (
                      <tr key={String(row.id)} className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer ${row.permittedStatus === "restricted" ? "bg-amber-50/40" : row.permittedStatus === "prohibited" ? "bg-red-50/40" : ""}`} onClick={() => setViewInput(row)}>
                        <td className="px-4 py-3">{fmt(str(row.applicationDate))}</td>
                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">{str(row.productName)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{str(row.inputType) || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge value={str(row.permittedStatus)} options={PERMITTED_STATUSES.slice(1)} /></td>
                        <td className="px-4 py-3">{str(row.fieldName) || "—"}</td>
                        <td className="px-4 py-3">{fmtN(row.quantityApplied)} {str(row.quantityUnit)}</td>
                        <td className="px-4 py-3">{fmtN(row.areaAppliedHa, " ha")}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewInput(row)}><Eye className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setInputDeleting(Number(row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Harvest Declarations ── */}
        {activeTab === "harvest-declarations" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={Wheat} label="Harvest Records" value={harvests.length} />
              <SummaryCard icon={CheckCircle2} label="Certified Organic" value={certifiedHarvests} />
              <SummaryCard icon={FileText} label="Total Recorded Yield" value={totalYield > 0 ? `${totalYield.toFixed(2)} t` : "—"} sub="all status types" />
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Year</Label>
                <Select value={harvestFilterYear} onValueChange={setHarvestFilterYear}>
                  <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {yearOptions().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {harvestCropOptions.length > 2 && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Crop</Label>
                  <Select value={harvestFilterCrop} onValueChange={setHarvestFilterCrop}>
                    <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{harvestCropOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <FilterPills
                options={HARVEST_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                value={harvestFilterStatus}
                onChange={setHarvestFilterStatus}
                counts={Object.fromEntries(HARVEST_STATUSES.map(s => [s.value, s.value === "all" ? harvests.length : harvests.filter(h => h.organicStatus === s.value).length]))}
              />
            </div>
            <ReportBar onPrint={printHarvests} onCsv={exportHarvestsCsv} onAdd={() => openHarvestForm()} addLabel="Log Harvest" />
            {harvestQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filteredHarvests.length === 0 ? (
              <EmptyState icon={Wheat} message="No harvest records for this filter. Log each organic harvest with field and yield details." />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Harvest Date</th>
                      <th className="px-4 py-3 text-left">Crop</th>
                      <th className="px-4 py-3 text-left">Variety</th>
                      <th className="px-4 py-3 text-left">Field</th>
                      <th className="px-4 py-3 text-left">Yield (t)</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Buyer Declaration</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHarvests.map(row => (
                      <tr key={String(row.id)} className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => setViewHarvest(row)}>
                        <td className="px-4 py-3">{fmt(str(row.harvestDate))}</td>
                        <td className="px-4 py-3 font-medium">{str(row.cropName)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{str(row.variety) || "—"}</td>
                        <td className="px-4 py-3">{str(row.fieldName) || "—"}</td>
                        <td className="px-4 py-3">{fmtN(row.yieldTonnes, " t")}</td>
                        <td className="px-4 py-3"><StatusBadge value={str(row.organicStatus)} options={HARVEST_STATUSES.slice(1)} /></td>
                        <td className="px-4 py-3">
                          {row.buyerName
                            ? <span className="text-xs text-green-700 font-medium">{str(row.buyerName)}</span>
                            : <span className="text-xs text-muted-foreground italic">Not recorded</span>}
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewHarvest(row)}><Eye className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setHarvestDeleting(Number(row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          VIEW DIALOGS
      ════════════════════════════════════════════════ */}

      {/* View: Certification */}
      {viewCert && (
        <Dialog open onOpenChange={() => setViewCert(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Certification Record</DialogTitle>
              <DialogDescription>{str(viewCert.certifier)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-0.5">
              <DetailRow label="Certifying Body" value={str(viewCert.certifier)} />
              <DetailRow label="Certificate No." value={<span className="font-mono text-xs">{str(viewCert.certificateNumber) || "—"}</span>} />
              <DetailRow label="Operator No." value={<span className="font-mono text-xs">{str(viewCert.operatorNumber) || "—"}</span>} />
              <DetailRow label="Status" value={<StatusBadge value={str(viewCert.status)} options={CERT_STATUSES.slice(1)} />} />
              <DetailRow label="Certified Date" value={fmt(str(viewCert.certificationDate))} />
              <DetailRow label="Renewal Date" value={fmt(str(viewCert.renewalDate))} />
              <DetailRow label="Annual Inspection" value={fmt(str(viewCert.annualInspectionDate))} />
              <DetailRow label="Next Inspection Due" value={fmt(str(viewCert.nextInspectionDue))} />
              <DetailRow label="Scope" value={
                parseScopeKeys(str(viewCert.scope)).length > 0
                  ? <div className="flex flex-wrap gap-1 mt-0.5">
                      {parseScopeKeys(str(viewCert.scope)).map(k => (
                        <span key={k} className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                          {getScopeLabel(k)}
                        </span>
                      ))}
                    </div>
                  : "—"
              } />
              <DetailRow label="Notes" value={str(viewCert.notes) || "—"} />
            </div>
            {farmId && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Supporting Documents</p>
                <RecordAttachments farmId={farmId} recordType="organic-arable-cert" recordId={Number(viewCert.id)} compact />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewCert(null)}>Close</Button>
              <Button onClick={() => { openCertForm(viewCert); setViewCert(null); }}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View: Field Conversion */}
      {viewConv && (
        <Dialog open onOpenChange={() => setViewConv(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Field Conversion Record</DialogTitle>
              <DialogDescription>{str(viewConv.fieldName)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-0.5">
              <DetailRow label="Field / Parcel" value={str(viewConv.fieldName)} />
              <DetailRow label="Area" value={fmtN(viewConv.areaHa, " ha")} />
              <DetailRow label="Status" value={<StatusBadge value={str(viewConv.status)} options={CONV_STATUSES.slice(1)} />} />
              <DetailRow label="Conversion Start" value={fmt(str(viewConv.conversionStartDate))} />
              <DetailRow label="Expected Certification" value={fmt(str(viewConv.expectedCertificationDate))} />
              <DetailRow label="Actual Certification" value={fmt(str(viewConv.actualCertificationDate))} />
              <DetailRow label="Certifier Reference" value={str(viewConv.certifierRef) || "—"} />
              <DetailRow label="Previous Land Use" value={str(viewConv.previousLandUse) || "—"} />
              <DetailRow label="Parallel Production" value={viewConv.parallelProduction ? "Yes" : "No"} />
              {!!viewConv.parallelProduction && <DetailRow label="Justification" value={str(viewConv.parallelProductionJustification)} />}
              {viewConv.status !== "certified" && (
                <DetailRow label="Conversion Progress" value={
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-amber-500" style={{ width: `${conversionProgress(str(viewConv.conversionStartDate), str(viewConv.expectedCertificationDate))}%` }} />
                    </div>
                    <span className="text-xs">{conversionProgress(str(viewConv.conversionStartDate), str(viewConv.expectedCertificationDate))}%</span>
                  </div>
                } />
              )}
              <DetailRow label="Notes" value={str(viewConv.notes) || "—"} />
            </div>
            {farmId && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Supporting Documents</p>
                <RecordAttachments farmId={farmId} recordType="organic-arable-field-conversion" recordId={Number(viewConv.id)} compact />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewConv(null)}>Close</Button>
              <Button onClick={() => { openConvForm(viewConv); setViewConv(null); }}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View: Seed Record */}
      {viewSeed && (
        <Dialog open onOpenChange={() => setViewSeed(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Seed Sourcing Record</DialogTitle>
              <DialogDescription>{str(viewSeed.cropName)} — {fmt(str(viewSeed.purchaseDate))}</DialogDescription>
            </DialogHeader>
            <div className="space-y-0.5">
              <DetailRow label="Purchase Date" value={fmt(str(viewSeed.purchaseDate))} />
              <DetailRow label="Crop" value={str(viewSeed.cropName)} />
              <DetailRow label="Variety" value={str(viewSeed.variety) || "—"} />
              <DetailRow label="Seed Type" value={<StatusBadge value={str(viewSeed.seedType)} options={SEED_TYPES} />} />
              <DetailRow label="Quantity" value={fmtN(viewSeed.quantityKg, " kg")} />
              <DetailRow label="Batch / Lot No." value={str(viewSeed.batchLotNumber) || "—"} />
              <DetailRow label="PO Reference" value={str(viewSeed.poReference) || "—"} />
              <DetailRow label="GRN Reference" value={str(viewSeed.grnReference) || "—"} />
              <DetailRow label="Supplier" value={str(viewSeed.supplierName) || "—"} />
              <DetailRow label="Supplier Address" value={str(viewSeed.supplierAddress) || "—"} />
              <DetailRow label="Derogation Granted" value={viewSeed.derogationGranted ? "Yes" : "No"} />
              {!!viewSeed.derogationGranted && <>
                <DetailRow label="Derogation Reference" value={str(viewSeed.derogationReference) || "—"} />
                <DetailRow label="Derogation Expiry" value={fmt(str(viewSeed.derogationExpiryDate))} />
                <DetailRow label="Certifier Approval" value={str(viewSeed.certifierApproval) || "—"} />
              </>}
              <DetailRow label="Notes" value={str(viewSeed.notes) || "—"} />
            </div>
            {farmId && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Supporting Documents & Invoices</p>
                <RecordAttachments farmId={farmId} recordType="organic-arable-seed" recordId={Number(viewSeed.id)} compact />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewSeed(null)}>Close</Button>
              <Button onClick={() => { openSeedForm(viewSeed); setViewSeed(null); }}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View: Input Record */}
      {viewInput && (
        <Dialog open onOpenChange={() => setViewInput(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Input Application Record</DialogTitle>
              <DialogDescription>{str(viewInput.productName)} — {fmt(str(viewInput.applicationDate))}</DialogDescription>
            </DialogHeader>
            <div className="space-y-0.5">
              <DetailRow label="Application Date" value={fmt(str(viewInput.applicationDate))} />
              <DetailRow label="Field / Parcel" value={str(viewInput.fieldName) || "—"} />
              <DetailRow label="Product / Substance" value={str(viewInput.productName)} />
              <DetailRow label="Active Ingredient" value={str(viewInput.activeIngredient) || "—"} />
              <DetailRow label="Input Type" value={str(viewInput.inputType) || "—"} />
              <DetailRow label="Permitted Status" value={<StatusBadge value={str(viewInput.permittedStatus)} options={PERMITTED_STATUSES.slice(1)} />} />
              <DetailRow label="Regulatory Basis" value={str(viewInput.regulatoryBasis) || "—"} />
              <DetailRow label="Supplier" value={str(viewInput.supplierName) || "—"} />
              {str(viewInput.grnNumber) && <DetailRow label="GRN Reference" value={<span className="font-mono">{str(viewInput.grnNumber)}</span>} />}
              {str(viewInput.batchNumber) && <DetailRow label="Batch Number" value={<span className="font-mono">{str(viewInput.batchNumber)}</span>} />}
              {str(viewInput.lotNumber) && <DetailRow label="Lot Number" value={<span className="font-mono">{str(viewInput.lotNumber)}</span>} />}
              <DetailRow label="Quantity Applied" value={`${fmtN(viewInput.quantityApplied)} ${str(viewInput.quantityUnit)}`} />
              <DetailRow label="Area Applied" value={fmtN(viewInput.areaAppliedHa, " ha")} />
              {(viewInput.permittedStatus === "restricted" || viewInput.permittedStatus === "derogation") && (
                <DetailRow label="Certifier Approval Ref" value={str(viewInput.certifierApproval) || "—"} />
              )}
              <DetailRow label="Notes" value={str(viewInput.notes) || "—"} />
            </div>
            {farmId && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Supporting Documents</p>
                <RecordAttachments farmId={farmId} recordType="organic-arable-input" recordId={Number(viewInput.id)} compact />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewInput(null)}>Close</Button>
              <Button onClick={() => { openInputForm(viewInput); setViewInput(null); }}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View: Harvest Declaration */}
      {viewHarvest && (
        <Dialog open onOpenChange={() => setViewHarvest(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Harvest Declaration</DialogTitle>
              <DialogDescription>{str(viewHarvest.cropName)} — {fmt(str(viewHarvest.harvestDate))}</DialogDescription>
            </DialogHeader>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1 pb-1">Harvest Details</p>
              <DetailRow label="Harvest Date" value={fmt(str(viewHarvest.harvestDate))} />
              <DetailRow label="Crop" value={str(viewHarvest.cropName)} />
              <DetailRow label="Variety" value={str(viewHarvest.variety) || "—"} />
              <DetailRow label="Field / Parcel" value={str(viewHarvest.fieldName) || "—"} />
              <DetailRow label="Yield" value={fmtN(viewHarvest.yieldTonnes, " t")} />
              <DetailRow label="Moisture %" value={fmtN(viewHarvest.moisturePercent, "%")} />
              <DetailRow label="Storage Location" value={str(viewHarvest.storageLocation) || "—"} />
              <DetailRow label="Organic Status" value={<StatusBadge value={str(viewHarvest.organicStatus)} options={HARVEST_STATUSES.slice(1)} />} />
              <DetailRow label="Certifier Reference" value={str(viewHarvest.certifierRef) || "—"} />
              <DetailRow label="Notes" value={str(viewHarvest.notes) || "—"} />
            </div>
            <div className="pt-3 border-t border-border space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1">Buyer Declaration</p>
              {viewHarvest.buyerName ? (
                <>
                  <DetailRow label="Buyer" value={str(viewHarvest.buyerName)} />
                  <DetailRow label="Organisation" value={str(viewHarvest.buyerOrganisation) || "—"} />
                  <DetailRow label="Address" value={str(viewHarvest.buyerAddress) || "—"} />
                  <DetailRow label="Sale Date" value={fmt(str(viewHarvest.saleDate))} />
                  <DetailRow label="Qty Sold" value={fmtN(viewHarvest.quantitySoldTonnes, " t")} />
                  <DetailRow label="Price" value={fmtN(viewHarvest.pricePoundPerTonne, " £/t")} />
                  <DetailRow label="Organic Premium" value={fmtN(viewHarvest.organicPremiumPercent, "%")} />
                  <DetailRow label="Declaration Date" value={fmt(str(viewHarvest.declarationDate))} />
                  <DetailRow label="Declaration Ref" value={str(viewHarvest.declarationReference) || "—"} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-2 italic">No buyer declaration recorded yet.</p>
              )}
            </div>
            {farmId && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Supporting Documents</p>
                <RecordAttachments farmId={farmId} recordType="organic-arable-harvest" recordId={Number(viewHarvest.id)} compact />
              </div>
            )}
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={() => setViewHarvest(null)}>Close</Button>
              <Button variant="outline" onClick={() => { openBuyer(viewHarvest); setViewHarvest(null); }}>
                <FileText className="w-3.5 h-3.5 mr-1.5" />{viewHarvest.buyerName ? "Edit Buyer Declaration" : "Add Buyer Declaration"}
              </Button>
              <Button onClick={() => { openHarvestForm(viewHarvest); setViewHarvest(null); }}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit Harvest
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ════════════════════════════════════════════════
          FORM DIALOGS
      ════════════════════════════════════════════════ */}

      {/* Form: Certification */}
      <Dialog open={certOpen} onOpenChange={v => !v && setCertOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{certEditing ? "Edit" : "Add"} Certification Record</DialogTitle>
            <DialogDescription>Record your certifying body certificate and key dates</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Certifying Body *</Label>
              <Select value={certForm.certifier || ""} onValueChange={v => setCertForm(f => ({ ...f, certifier: v }))}>
                <SelectTrigger><SelectValue placeholder="Select certifier…" /></SelectTrigger>
                <SelectContent>{CERTIFIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certificate Number</Label>
              <Input value={certForm.certificateNumber || ""} onChange={e => setCertForm(f => ({ ...f, certificateNumber: e.target.value }))} placeholder="e.g. SA-1234567" />
            </div>
            <div>
              <Label>Operator Number</Label>
              <Input value={certForm.operatorNumber || ""} onChange={e => setCertForm(f => ({ ...f, operatorNumber: e.target.value }))} placeholder="e.g. GB-ORG-01-XXXX" />
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={certForm.status || "certified"} onValueChange={v => setCertForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CERT_STATUSES.slice(1).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certification Date</Label>
              <Input type="date" value={certForm.certificationDate || ""} onChange={e => setCertForm(f => ({ ...f, certificationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Renewal Date</Label>
              <Input type="date" value={certForm.renewalDate || ""} onChange={e => setCertForm(f => ({ ...f, renewalDate: e.target.value }))} />
            </div>
            <div>
              <Label>Annual Inspection Date</Label>
              <Input type="date" value={certForm.annualInspectionDate || ""} onChange={e => setCertForm(f => ({ ...f, annualInspectionDate: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Next Inspection Due</Label>
              <Input type="date" value={certForm.nextInspectionDue || ""} onChange={e => setCertForm(f => ({ ...f, nextInspectionDue: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Certification Scope</Label>
              <p className="text-xs text-muted-foreground mb-2 mt-0.5">Select the enterprise areas this certificate covers. No two certifiers can hold the same scope item simultaneously on this holding.</p>
              <div className="border border-border rounded-xl overflow-hidden">
                {SCOPE_GROUPS.map((group, gi) => (
                  <div key={group.group} className={gi > 0 ? "border-t border-border" : ""}>
                    <div className="px-3 py-1.5 bg-muted/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.group}</span>
                    </div>
                    <div className="px-3 py-2.5 flex flex-wrap gap-x-5 gap-y-2">
                      {group.items.map(item => {
                        const checked = certScopeKeys.includes(item.key);
                        return (
                          <label key={item.key} className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded accent-primary"
                              checked={checked}
                              onChange={e => {
                                if (e.target.checked) setCertScopeKeys(k => [...k, item.key]);
                                else setCertScopeKeys(k => k.filter(x => x !== item.key));
                              }}
                            />
                            <span className="text-sm">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={certForm.notes || ""} onChange={e => setCertForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertOpen(false)}>Cancel</Button>
            <Button onClick={saveCert} disabled={certMut.save.isPending || !certForm.certifier}>
              {certMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : certEditing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form: Field Conversion */}
      <Dialog open={convOpen} onOpenChange={v => !v && setConvOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{convEditing ? "Edit" : "Add"} Field Conversion Record</DialogTitle>
            <DialogDescription>Track the organic conversion status for each field or parcel</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Field / Parcel *</Label>
              <FieldSelector value={convForm.fieldName || ""} onChange={v => { const fld = fieldOptions.find(x => x.name === v); setConvForm(f => ({ ...f, fieldName: v, areaHa: fld?.areaHectares ? String(fld.areaHectares) : f.areaHa })); }} fields={fieldOptions} />
            </div>
            <div>
              <Label>Area (ha)</Label>
              <Input type="number" step="0.001" value={convForm.areaHa || ""} onChange={e => setConvForm(f => ({ ...f, areaHa: e.target.value }))} placeholder="0.000" />
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={convForm.status || "in-conversion"} onValueChange={v => setConvForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONV_STATUSES.slice(1).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conversion Start Date *</Label>
              <Input type="date" value={convForm.conversionStartDate || ""} onChange={e => setConvForm(f => ({ ...f, conversionStartDate: e.target.value }))} />
            </div>
            <div>
              <Label>Expected Certification Date</Label>
              <Input type="date" value={convForm.expectedCertificationDate || ""} onChange={e => setConvForm(f => ({ ...f, expectedCertificationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Actual Certification Date</Label>
              <Input type="date" value={convForm.actualCertificationDate || ""} onChange={e => setConvForm(f => ({ ...f, actualCertificationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Certifier Reference</Label>
              <Input value={convForm.certifierRef || ""} onChange={e => setConvForm(f => ({ ...f, certifierRef: e.target.value }))} placeholder="e.g. SA-CONV-2024-001" />
            </div>
            <div className="col-span-2">
              <Label>Previous Land Use</Label>
              <Input value={convForm.previousLandUse || ""} onChange={e => setConvForm(f => ({ ...f, previousLandUse: e.target.value }))} placeholder="e.g. Conventional arable — winter wheat" />
            </div>
            <div className="col-span-2 flex items-center gap-3 pt-1">
              <input type="checkbox" id="pp" checked={convForm.parallelProduction === "true"} onChange={e => setConvForm(f => ({ ...f, parallelProduction: e.target.checked ? "true" : "false" }))} className="w-4 h-4" />
              <Label htmlFor="pp" className="cursor-pointer font-normal">Parallel production — same crop variety on both organic and conventional land</Label>
            </div>
            {convForm.parallelProduction === "true" && (
              <div className="col-span-2">
                <Label>Parallel Production Justification</Label>
                <Textarea rows={2} value={convForm.parallelProductionJustification || ""} onChange={e => setConvForm(f => ({ ...f, parallelProductionJustification: e.target.value }))} placeholder="Certifier approval required — explain justification" />
              </div>
            )}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={convForm.notes || ""} onChange={e => setConvForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvOpen(false)}>Cancel</Button>
            <Button onClick={saveConv} disabled={convMut.save.isPending || !convForm.fieldName || !convForm.conversionStartDate}>
              {convMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : convEditing ? "Save Changes" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form: Seed Stock Line */}
      <Dialog open={stockOpen} onOpenChange={v => !v && setStockOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{stockEditing ? "Edit" : "New"} Seed Stock Line</DialogTitle>
            <DialogDescription>A stock line represents a specific crop / variety / batch you hold in store. Goods-in and consumption movements debit and credit this line.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label>Crop *</Label>
              <Select value={stockForm.cropName || ""} onValueChange={v => setStockForm(f => ({ ...f, cropName: v }))}>
                <SelectTrigger><SelectValue placeholder="Select crop…" /></SelectTrigger>
                <SelectContent>{cropOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Variety</Label>
              <Input value={stockForm.variety || ""} onChange={e => setStockForm(f => ({ ...f, variety: e.target.value }))} placeholder="e.g. KWS Zyatt" />
            </div>
            <div>
              <Label>Seed Type</Label>
              <Select value={stockForm.seedType || "organic"} onValueChange={v => setStockForm(f => ({ ...f, seedType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEED_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch / Lot Number</Label>
              <Input value={stockForm.batchLotNumber || ""} onChange={e => setStockForm(f => ({ ...f, batchLotNumber: e.target.value }))} placeholder="e.g. BL-2024-001" />
            </div>
            <div>
              <Label>Supplier</Label>
              {allSuppliers.length > 0 ? (
                <Select value={stockForm.supplierName || "__none__"} onValueChange={v => setStockForm(f => ({ ...f, supplierName: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {allSuppliers.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={stockForm.supplierName || ""} onChange={e => setStockForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="Supplier name" />
              )}
            </div>
            <div>
              <Label>Reorder Threshold (kg)</Label>
              <Input type="number" step="1" value={stockForm.reorderThresholdKg || ""} onChange={e => setStockForm(f => ({ ...f, reorderThresholdKg: e.target.value }))} placeholder="e.g. 500" />
            </div>
            <div className="col-span-2">
              <Label>Storage Location</Label>
              <Input value={stockForm.storageLocation || ""} onChange={e => setStockForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Grain store bay 3" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={stockForm.notes || ""} onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockOpen(false)}>Cancel</Button>
            <Button disabled={!stockForm.cropName || stockMut.save.isPending} onClick={() => {
              stockMut.save.mutate({ id: stockEditing ? Number(stockEditing.id) : undefined, body: stockForm }, {
                onSuccess: () => { setStockOpen(false); setStockEditing(null); setStockForm({}); },
              });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form: Seed Movement */}
      <Dialog open={moveOpen} onOpenChange={v => !v && setMoveOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {moveType === "goods_in" ? "Record Goods In" : moveType === "consumption" ? "Record Consumption" : moveType === "waste" ? "Record Waste" : "Stock Adjustment"}
            </DialogTitle>
            <DialogDescription>
              {moveType === "goods_in" && "Record seed delivered to store. Include PO and GRN references for a full audit trail."}
              {moveType === "consumption" && "Record seed used for drilling. Link to field and operator."}
              {moveType === "waste" && "Record seed disposed of — include reason for inspection records."}
              {moveType === "adjustment" && "Correct stock balance — include reason (e.g. stock count, spillage)."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={moveForm.movementDate || today} onChange={e => setMoveForm(f => ({ ...f, movementDate: e.target.value }))} />
            </div>
            <div>
              <Label>Quantity (kg) *</Label>
              <Input type="number" step="0.01" value={moveForm.quantityKg || ""} onChange={e => setMoveForm(f => ({ ...f, quantityKg: e.target.value }))} />
            </div>
            {(moveType === "goods_in") && (<>
              <div>
                <Label>PO Reference</Label>
                <Input value={moveForm.poReference || ""} onChange={e => setMoveForm(f => ({ ...f, poReference: e.target.value }))} placeholder="e.g. PO-2024-007" />
              </div>
              <div>
                <Label>GRN Reference</Label>
                <Input value={moveForm.grnReference || ""} onChange={e => setMoveForm(f => ({ ...f, grnReference: e.target.value }))} placeholder="e.g. GRN-2024-042" />
              </div>
              <div>
                <Label>Supplier</Label>
                {allSuppliers.length > 0 ? (
                  <Select value={moveForm.supplierName || "__none__"} onValueChange={v => setMoveForm(f => ({ ...f, supplierName: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {allSuppliers.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={moveForm.supplierName || ""} onChange={e => setMoveForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="Supplier name" />
                )}
              </div>
              <div>
                <Label>Invoice Reference</Label>
                <Input value={moveForm.invoiceReference || ""} onChange={e => setMoveForm(f => ({ ...f, invoiceReference: e.target.value }))} placeholder="e.g. INV-2024-1234" />
              </div>
              <div>
                <Label>Unit Cost (£/tonne)</Label>
                <Input type="number" step="0.01" value={moveForm.unitCostPoundPerTonne || ""} onChange={e => setMoveForm(f => ({ ...f, unitCostPoundPerTonne: e.target.value }))} placeholder="e.g. 850.00" />
              </div>
            </>)}
            {(moveType === "consumption") && (<>
              <div>
                <Label>Field</Label>
                <Select value={moveForm.fieldId || "__none__"} onValueChange={v => {
                  const f = fieldOptions.find(x => String(x.id) === v);
                  setMoveForm(fm => ({ ...fm, fieldId: v === "__none__" ? "" : v, fieldName: f ? f.name : fm.fieldName }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {fieldOptions.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operator</Label>
                <Input value={moveForm.operatorName || ""} onChange={e => setMoveForm(f => ({ ...f, operatorName: e.target.value }))} placeholder="Name of driller" />
              </div>
              <div>
                <Label>Seed Rate (kg/ha)</Label>
                <Input type="number" step="0.1" value={moveForm.seedRateKgHa || ""} onChange={e => setMoveForm(f => ({ ...f, seedRateKgHa: e.target.value }))} />
              </div>
              <div>
                <Label>Area Drilled (ha)</Label>
                <Input type="number" step="0.01" value={moveForm.areaDrilledHa || ""} onChange={e => setMoveForm(f => ({ ...f, areaDrilledHa: e.target.value }))} />
              </div>
            </>)}
            {(moveType === "adjustment" || moveType === "waste") && (
              <div className="col-span-2">
                <Label>Reason *</Label>
                <Input value={moveForm.reason || ""} onChange={e => setMoveForm(f => ({ ...f, reason: e.target.value }))} placeholder={moveType === "waste" ? "e.g. Condemned — contamination" : "e.g. Stocktake correction"} />
              </div>
            )}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={moveForm.notes || ""} onChange={e => setMoveForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>Cancel</Button>
            <Button disabled={!moveForm.quantityKg || !moveStockId || moveSaveMut.isPending} onClick={() => {
              moveSaveMut.mutate({
                stockId: moveStockId,
                movementType: moveType,
                movementDate: moveForm.movementDate || today,
                quantityKg: moveForm.quantityKg,
                poReference: moveForm.poReference || null,
                grnReference: moveForm.grnReference || null,
                supplierName: moveForm.supplierName || null,
                invoiceReference: moveForm.invoiceReference || null,
                unitCostPoundPerTonne: moveForm.unitCostPoundPerTonne || null,
                fieldId: moveForm.fieldId ? Number(moveForm.fieldId) : null,
                fieldName: moveForm.fieldName || null,
                seedRateKgHa: moveForm.seedRateKgHa || null,
                areaDrilledHa: moveForm.areaDrilledHa || null,
                operatorName: moveForm.operatorName || null,
                reason: moveForm.reason || null,
                notes: moveForm.notes || null,
              });
            }}>Save Movement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form: Seed Sourcing */}
      <Dialog open={seedOpen} onOpenChange={v => !v && setSeedOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{seedEditing ? "Edit" : "Add"} Seed Record</DialogTitle>
            <DialogDescription>Log all seed purchases — organic certified preferred; derogation required for non-organic seed</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Purchase Date *</Label>
              <Input type="date" value={seedForm.purchaseDate || ""} onChange={e => setSeedForm(f => ({ ...f, purchaseDate: e.target.value }))} />
            </div>
            <div>
              <Label>Seed Type *</Label>
              <Select value={seedForm.seedType || "organic"} onValueChange={v => setSeedForm(f => ({ ...f, seedType: v, derogationGranted: v === "organic" ? "false" : f.derogationGranted }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEED_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Crop *</Label>
              <Select value={seedForm.cropName || ""} onValueChange={v => setSeedForm(f => ({ ...f, cropName: v, variety: "" }))}>
                <SelectTrigger><SelectValue placeholder="Select crop…" /></SelectTrigger>
                <SelectContent>{cropOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Variety</Label>
              {seedVarieties.length > 0 ? (
                <div className="space-y-1.5">
                  <Select
                    value={seedVarieties.includes(seedForm.variety || "") ? (seedForm.variety || "") : seedForm.variety === "__other__" ? "__other__" : ""}
                    onValueChange={v => setSeedForm(f => ({ ...f, variety: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
                    <SelectContent>
                      {seedVarieties.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      <SelectItem value="__other__">Other / unregistered</SelectItem>
                    </SelectContent>
                  </Select>
                  {(seedForm.variety === "__other__" || (seedForm.variety && !seedVarieties.includes(seedForm.variety))) && (
                    <Input
                      placeholder="Enter variety name"
                      value={seedForm.variety === "__other__" ? "" : seedForm.variety}
                      onChange={e => setSeedForm(f => ({ ...f, variety: e.target.value }))}
                    />
                  )}
                </div>
              ) : (
                <Input value={seedForm.variety || ""} onChange={e => setSeedForm(f => ({ ...f, variety: e.target.value }))} placeholder="e.g. KWS Zyatt" />
              )}
            </div>
            <div>
              <Label>Quantity (kg)</Label>
              <Input type="number" step="0.01" value={seedForm.quantityKg || ""} onChange={e => setSeedForm(f => ({ ...f, quantityKg: e.target.value }))} />
            </div>
            <div>
              <Label>Batch / Lot Number</Label>
              <Input value={seedForm.batchLotNumber || ""} onChange={e => setSeedForm(f => ({ ...f, batchLotNumber: e.target.value }))} placeholder="e.g. BL-2024-001" />
            </div>
            <div>
              <Label>PO Reference</Label>
              <Input value={seedForm.poReference || ""} onChange={e => setSeedForm(f => ({ ...f, poReference: e.target.value }))} placeholder="e.g. PO-2024-007" />
            </div>
            <div>
              <Label>GRN Reference</Label>
              <Input value={seedForm.grnReference || ""} onChange={e => setSeedForm(f => ({ ...f, grnReference: e.target.value }))} placeholder="e.g. GRN-2024-042" />
            </div>
            <div className="col-span-2">
              <Label>Supplier</Label>
              {allSuppliers.length > 0 ? (
                <Select
                  value={seedForm.supplierName || "__none__"}
                  onValueChange={v => {
                    if (v === "__none__") { setSeedForm(f => ({ ...f, supplierName: "", supplierAddress: "" })); return; }
                    const s = allSuppliers.find((x: any) => x.name === v);
                    setSeedForm(f => ({
                      ...f,
                      supplierName: v,
                      supplierAddress: s ? [s.addressLine1, s.addressLine2, s.town, s.county, s.postcode].filter(Boolean).join(", ") : f.supplierAddress,
                    }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {allSuppliers.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={seedForm.supplierName || ""} onChange={e => setSeedForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="e.g. Organic Seed Store Ltd — add suppliers in Trade Contacts &amp; Stock" />
              )}
            </div>
            <div className="col-span-2">
              <Label>Supplier Address</Label>
              <Input value={seedForm.supplierAddress || ""} onChange={e => setSeedForm(f => ({ ...f, supplierAddress: e.target.value }))} placeholder="Auto-filled from supplier register, or enter manually" />
            </div>
            {seedForm.seedType !== "organic" && (
              <>
                <div className="col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <p className="font-semibold mb-1">Derogation Required</p>
                  <p>Non-organic seed requires prior written approval from your certifying body before use. Attach the approval letter in the record view.</p>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="derog" checked={seedForm.derogationGranted === "true"} onChange={e => setSeedForm(f => ({ ...f, derogationGranted: e.target.checked ? "true" : "false" }))} className="w-4 h-4" />
                  <Label htmlFor="derog" className="cursor-pointer font-normal">Derogation granted by certifier</Label>
                </div>
                {seedForm.derogationGranted === "true" && (
                  <>
                    <div>
                      <Label>Derogation Reference</Label>
                      <Input value={seedForm.derogationReference || ""} onChange={e => setSeedForm(f => ({ ...f, derogationReference: e.target.value }))} placeholder="e.g. SA-DER-2024-007" />
                    </div>
                    <div>
                      <Label>Derogation Expiry</Label>
                      <Input type="date" value={seedForm.derogationExpiryDate || ""} onChange={e => setSeedForm(f => ({ ...f, derogationExpiryDate: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <Label>Certifier Approval Reference</Label>
                      <Input value={seedForm.certifierApproval || ""} onChange={e => setSeedForm(f => ({ ...f, certifierApproval: e.target.value }))} />
                    </div>
                  </>
                )}
              </>
            )}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={seedForm.notes || ""} onChange={e => setSeedForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeedOpen(false)}>Cancel</Button>
            <Button onClick={saveSeed} disabled={seedMut.save.isPending || !seedForm.purchaseDate || !seedForm.cropName}>
              {seedMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : seedEditing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form: Input Log */}
      <Dialog open={inputOpen} onOpenChange={v => !v && setInputOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{inputEditing ? "Edit" : "Log"} Input Application</DialogTitle>
            <DialogDescription>Record all fertilisers, soil amendments, and crop protection products applied to organic fields</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Application Date *</Label>
              <Input type="date" value={inputForm.applicationDate || ""} onChange={e => setInputForm(f => ({ ...f, applicationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Field / Parcel</Label>
              <FieldSelector
                value={inputForm.fieldName || ""}
                onChange={v => {
                  const field = fieldOptions.find(f => f.name === v);
                  setInputForm(f => ({
                    ...f,
                    fieldName: v,
                    areaAppliedHa: field?.areaHectares ? String(field.areaHectares) : f.areaAppliedHa,
                  }));
                  setInputAreaAutoFilled(!!field?.areaHectares);
                }}
                fields={fieldOptions}
              />
            </div>
            <div className="col-span-2">
              <Label>Product / Substance *</Label>
              <SubstancePicker
                value={inputForm.productName || ""}
                onChange={v => setInputForm(f => ({ ...f, productName: v }))}
                onIngredient={ingredient => setInputForm(f => ({ ...f, activeIngredient: ingredient }))}
              />
            </div>
            <div>
              <Label>Active Ingredient</Label>
              <Input
                value={inputForm.activeIngredient || ""}
                onChange={e => setInputForm(f => ({ ...f, activeIngredient: e.target.value }))}
                placeholder="Auto-filled from selected substance"
              />
              {inputForm.activeIngredient && ANNEX_INPUTS.some(s => s.name === inputForm.productName) && (
                <p className="text-xs text-green-700 mt-1">&#10003; Auto-filled from Annex II substance list — edit to override</p>
              )}
            </div>
            <div>
              <Label>Input Type *</Label>
              <Select value={inputForm.inputType || ""} onValueChange={v => setInputForm(f => ({ ...f, inputType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>{INPUT_TYPES_ALL.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Permitted Status *</Label>
              <Select value={inputForm.permittedStatus || "permitted"} onValueChange={v => setInputForm(f => ({ ...f, permittedStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PERMITTED_STATUSES.slice(1).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Regulatory Basis</Label>
              <Input value={inputForm.regulatoryBasis || ""} onChange={e => setInputForm(f => ({ ...f, regulatoryBasis: e.target.value }))} placeholder="e.g. Annex II EU Reg 2018/848" />
            </div>
            <div>
              <Label>Qty Applied</Label>
              <Input type="number" step="0.001" value={inputForm.quantityApplied || ""} onChange={e => setInputForm(f => ({ ...f, quantityApplied: e.target.value }))} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={inputForm.quantityUnit || "kg/ha"} onValueChange={v => setInputForm(f => ({ ...f, quantityUnit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{QUANTITY_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Area Applied (ha)</Label>
              <Input
                type="number" step="0.001"
                value={inputForm.areaAppliedHa || ""}
                onChange={e => { setInputForm(f => ({ ...f, areaAppliedHa: e.target.value })); setInputAreaAutoFilled(false); }}
              />
              {inputAreaAutoFilled && (
                <p className="text-xs text-green-700 mt-1">&#10003; Auto-filled from field register — edit to override</p>
              )}
            </div>
            <div>
              <Label>Supplier</Label>
              {(() => {
                const agchemSuppliers = allSuppliers.filter((s: any) => s.supplierType === "agrochemicals");
                return (
                  <>
                    <Select
                      value={inputForm.supplierId || "__none__"}
                      onValueChange={v => {
                        if (v === "__none__") {
                          setInputForm(f => ({ ...f, supplierId: "", supplierName: "", stockDeliveryId: "", grnNumber: "", batchNumber: "", lotNumber: "" }));
                        } else {
                          const supplier = allSuppliers.find((s: any) => String(s.id) === v);
                          setInputForm(f => ({ ...f, supplierId: v, supplierName: supplier?.name || "", stockDeliveryId: "", grnNumber: "", batchNumber: "", lotNumber: "" }));
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not specified</SelectItem>
                        {agchemSuppliers.length === 0 ? (
                          <SelectItem value="__empty__" disabled>No agrochemical suppliers — add in Trade Contacts</SelectItem>
                        ) : agchemSuppliers.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {agchemSuppliers.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Add agrochemical suppliers in Trade Contacts to enable this field.</p>
                    )}
                  </>
                );
              })()}
            </div>
            {inputForm.supplierId && inputForm.supplierId !== "__none__" && (
              <div className="col-span-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                  <p className="text-xs font-semibold text-green-800">Batch / Lot Traceability — Link to Goods Received Note</p>
                  <div>
                    <Label className="text-xs text-gray-600">Select Delivery (GRN)</Label>
                    {(() => {
                      const supplierDeliveries = allDeliveries.filter((d: any) => String(d.supplierId) === inputForm.supplierId);
                      return (
                        <Select
                          value={inputForm.stockDeliveryId || "__none__"}
                          onValueChange={v => {
                            if (v === "__none__") {
                              setInputForm(f => ({ ...f, stockDeliveryId: "", grnNumber: "", batchNumber: "", lotNumber: "" }));
                            } else {
                              const del = supplierDeliveries.find((d: any) => String(d.id) === v);
                              setInputForm(f => ({
                                ...f,
                                stockDeliveryId: v,
                                grnNumber: del?.grnNumber || "",
                                batchNumber: del?.batchNumber || f.batchNumber,
                                lotNumber: del?.lotNumber || f.lotNumber,
                              }));
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select from GRN deliveries…" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No specific GRN</SelectItem>
                            {supplierDeliveries.length === 0 ? (
                              <SelectItem value="__no_grn__" disabled>No deliveries on file for this supplier</SelectItem>
                            ) : supplierDeliveries.map((d: any) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                {d.grnNumber ? `${d.grnNumber} — ` : ""}{d.stockItemName || d.productName || "Delivery"}{d.batchNumber ? ` · Batch: ${d.batchNumber}` : ""} ({new Date(d.deliveryDate).toLocaleDateString("en-GB")})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600">Batch Number</Label>
                      <Input className="h-8 text-sm" placeholder="e.g. BT240301" value={inputForm.batchNumber || ""} onChange={e => setInputForm(f => ({ ...f, batchNumber: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Lot Number</Label>
                      <Input className="h-8 text-sm" placeholder="e.g. LOT-2026-001" value={inputForm.lotNumber || ""} onChange={e => setInputForm(f => ({ ...f, lotNumber: e.target.value }))} />
                    </div>
                  </div>
                  {inputForm.stockDeliveryId && inputForm.stockDeliveryId !== "__none__" && (
                    <p className="text-xs text-green-700">&#10003; Linked to GRN — batch and lot auto-filled from delivery record</p>
                  )}
                </div>
              </div>
            )}
            {inputForm.permittedStatus === "restricted" && (
              <div className="col-span-2">
                <Label>Certifier Approval Reference</Label>
                <Input value={inputForm.certifierApproval || ""} onChange={e => setInputForm(f => ({ ...f, certifierApproval: e.target.value }))} placeholder="Reference from certifier written approval" />
              </div>
            )}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={inputForm.notes || ""} onChange={e => setInputForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInputOpen(false)}>Cancel</Button>
            <Button onClick={saveInput} disabled={inputMut.save.isPending || !inputForm.applicationDate || !inputForm.productName || !inputForm.inputType}>
              {inputMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : inputEditing ? "Save Changes" : "Log Input"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form: Harvest Details */}
      <Dialog open={harvestOpen} onOpenChange={v => !v && setHarvestOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{harvestEditing ? "Edit" : "Log"} Harvest</DialogTitle>
            <DialogDescription>Record organic harvest details for a field or parcel. Add the buyer declaration separately from the record view.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Harvest Date *</Label>
              <Input type="date" value={harvestForm.harvestDate || ""} onChange={e => setHarvestForm(f => ({ ...f, harvestDate: e.target.value }))} />
            </div>
            <div>
              <Label>Organic Status *</Label>
              <Select value={harvestForm.organicStatus || "certified"} onValueChange={v => setHarvestForm(f => ({ ...f, organicStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HARVEST_STATUSES.slice(1).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Crop *</Label>
              <Select value={harvestForm.cropName || ""} onValueChange={v => setHarvestForm(f => ({ ...f, cropName: v, variety: "" }))}>
                <SelectTrigger><SelectValue placeholder="Select crop…" /></SelectTrigger>
                <SelectContent>{cropOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Variety</Label>
              {harvestVarieties.length > 0 ? (
                <div className="space-y-1.5">
                  <Select
                    value={harvestVarieties.includes(harvestForm.variety || "") ? (harvestForm.variety || "") : harvestForm.variety === "__other__" ? "__other__" : ""}
                    onValueChange={v => setHarvestForm(f => ({ ...f, variety: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
                    <SelectContent>
                      {harvestVarieties.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      <SelectItem value="__other__">Other / unregistered</SelectItem>
                    </SelectContent>
                  </Select>
                  {(harvestForm.variety === "__other__" || (harvestForm.variety && !harvestVarieties.includes(harvestForm.variety))) && (
                    <Input
                      placeholder="Enter variety name"
                      value={harvestForm.variety === "__other__" ? "" : harvestForm.variety}
                      onChange={e => setHarvestForm(f => ({ ...f, variety: e.target.value }))}
                    />
                  )}
                </div>
              ) : (
                <Input value={harvestForm.variety || ""} onChange={e => setHarvestForm(f => ({ ...f, variety: e.target.value }))} placeholder="e.g. KWS Zyatt" />
              )}
            </div>
            <div className="col-span-2">
              <Label>Field / Parcel</Label>
              <FieldSelector value={harvestForm.fieldName || ""} onChange={v => setHarvestForm(f => ({ ...f, fieldName: v }))} fields={fieldOptions} />
            </div>
            <div>
              <Label>Yield (tonnes)</Label>
              <Input type="number" step="0.001" value={harvestForm.yieldTonnes || ""} onChange={e => setHarvestForm(f => ({ ...f, yieldTonnes: e.target.value }))} />
            </div>
            <div>
              <Label>Moisture %</Label>
              <Input type="number" step="0.1" value={harvestForm.moisturePercent || ""} onChange={e => setHarvestForm(f => ({ ...f, moisturePercent: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Storage Location</Label>
              <Input value={harvestForm.storageLocation || ""} onChange={e => setHarvestForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Grain store A — segregated organic bay" />
            </div>
            <div className="col-span-2">
              <Label>Certifier Reference</Label>
              <Input value={harvestForm.certifierRef || ""} onChange={e => setHarvestForm(f => ({ ...f, certifierRef: e.target.value }))} placeholder="e.g. SA-CROP-2025-001" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={harvestForm.notes || ""} onChange={e => setHarvestForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHarvestOpen(false)}>Cancel</Button>
            <Button onClick={saveHarvest} disabled={harvestMut.save.isPending || !harvestForm.harvestDate || !harvestForm.cropName}>
              {harvestMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : harvestEditing ? "Save Changes" : "Log Harvest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form: Buyer Declaration */}
      <Dialog open={buyerOpen} onOpenChange={v => !v && setBuyerOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{buyerRecord?.buyerName ? "Edit" : "Add"} Buyer Declaration</DialogTitle>
            <DialogDescription>
              Record the buyer details and sale declaration for:{" "}
              <strong>{str(buyerRecord?.cropName)}</strong> harvested {fmt(str(buyerRecord?.harvestDate))}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Buyer Name</Label>
              <Input value={buyerForm.buyerName || ""} onChange={e => setBuyerForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="e.g. John Smith" />
            </div>
            <div>
              <Label>Buyer Organisation</Label>
              <Input value={buyerForm.buyerOrganisation || ""} onChange={e => setBuyerForm(f => ({ ...f, buyerOrganisation: e.target.value }))} placeholder="e.g. Organic Grain Merchants Ltd" />
            </div>
            <div className="col-span-2">
              <Label>Buyer Address</Label>
              <Input value={buyerForm.buyerAddress || ""} onChange={e => setBuyerForm(f => ({ ...f, buyerAddress: e.target.value }))} />
            </div>
            <div>
              <Label>Sale Date</Label>
              <Input type="date" value={buyerForm.saleDate || ""} onChange={e => setBuyerForm(f => ({ ...f, saleDate: e.target.value }))} />
            </div>
            <div>
              <Label>Quantity Sold (t)</Label>
              <Input type="number" step="0.001" value={buyerForm.quantitySoldTonnes || ""} onChange={e => setBuyerForm(f => ({ ...f, quantitySoldTonnes: e.target.value }))} />
            </div>
            <div>
              <Label>Price (£/tonne)</Label>
              <Input type="number" step="0.01" value={buyerForm.pricePoundPerTonne || ""} onChange={e => setBuyerForm(f => ({ ...f, pricePoundPerTonne: e.target.value }))} />
            </div>
            <div>
              <Label>Organic Premium %</Label>
              <Input type="number" step="0.1" value={buyerForm.organicPremiumPercent || ""} onChange={e => setBuyerForm(f => ({ ...f, organicPremiumPercent: e.target.value }))} placeholder="e.g. 25" />
            </div>
            <div>
              <Label>Declaration Date</Label>
              <Input type="date" value={buyerForm.declarationDate || ""} onChange={e => setBuyerForm(f => ({ ...f, declarationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Declaration Reference</Label>
              <Input value={buyerForm.declarationReference || ""} onChange={e => setBuyerForm(f => ({ ...f, declarationReference: e.target.value }))} placeholder="e.g. DEC-2025-001" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyerOpen(false)}>Cancel</Button>
            <Button onClick={saveBuyer} disabled={harvestMut.save.isPending}>
              {harvestMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Declaration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <DeleteConfirmDialog open={certDeleting !== null} onClose={() => setCertDeleting(null)} saving={certMut.del.isPending}
        onConfirm={() => certMut.del.mutate(certDeleting!, { onSuccess: () => setCertDeleting(null) })} />
      <DeleteConfirmDialog open={convDeleting !== null} onClose={() => setConvDeleting(null)} saving={convMut.del.isPending}
        onConfirm={() => convMut.del.mutate(convDeleting!, { onSuccess: () => setConvDeleting(null) })} />
      <DeleteConfirmDialog open={seedDeleting !== null} onClose={() => setSeedDeleting(null)} saving={seedMut.del.isPending}
        onConfirm={() => seedMut.del.mutate(seedDeleting!, { onSuccess: () => setSeedDeleting(null) })} />
      <DeleteConfirmDialog open={stockDeleting !== null} onClose={() => setStockDeleting(null)} saving={stockMut.del.isPending}
        onConfirm={() => stockMut.del.mutate(stockDeleting!, { onSuccess: () => setStockDeleting(null) })} />
      <DeleteConfirmDialog open={moveDeleting !== null} onClose={() => setMoveDeleting(null)} saving={moveDelMut.isPending}
        onConfirm={() => moveDelMut.mutate(moveDeleting!)} />
      <DeleteConfirmDialog open={inputDeleting !== null} onClose={() => setInputDeleting(null)} saving={inputMut.del.isPending}
        onConfirm={() => inputMut.del.mutate(inputDeleting!, { onSuccess: () => setInputDeleting(null) })} />
      <DeleteConfirmDialog open={harvestDeleting !== null} onClose={() => setHarvestDeleting(null)} saving={harvestMut.del.isPending}
        onConfirm={() => harvestMut.del.mutate(harvestDeleting!, { onSuccess: () => setHarvestDeleting(null) })} />
    </AppLayout>
  );
}
