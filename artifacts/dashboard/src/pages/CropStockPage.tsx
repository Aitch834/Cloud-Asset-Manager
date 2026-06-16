import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Wheat, Plus, ArrowDown, ArrowUp, ArrowLeftRight, Pencil, Trash2, History, Database, Printer, ShieldCheck, ShieldAlert, Loader2, Droplets, Check, ChevronsUpDown, FlaskConical } from "lucide-react";
import { openPrintWindow, buildProReport } from "@/lib/print-report";

// ─── UK Approved Grain Store Treatment Products ────────────────────────────────
const GRAIN_STORE_PRODUCTS: { name: string; activeIngredient: string; defaultDilution: string; category: string; notes?: string }[] = [
  { name: "Actellic 50 EC", activeIngredient: "Pirimiphos-methyl 50%", defaultDilution: "15 ml in 5 L water per 100 m²", category: "Insecticide spray", notes: "MAPP 16048 — most widely used grain store insecticide" },
  { name: "K-Othrine WG 25", activeIngredient: "Deltamethrin 25%", defaultDilution: "2 g per 1 L water per 100 m²", category: "Insecticide spray", notes: "MAPP 14228 — pyrethroid, good residual activity" },
  { name: "Storcide II", activeIngredient: "Chlorpyrifos-methyl + Deltamethrin", defaultDilution: "As per product label", category: "Insecticide spray", notes: "Combination product — check current UK approval status" },
  { name: "Pyrethrum 5 EC", activeIngredient: "Pyrethrin 5%", defaultDilution: "1 part product per 200 parts water", category: "Insecticide spray", notes: "Fast knockdown, short residual — suitable where harvest imminent" },
  { name: "Exell", activeIngredient: "Cypermethrin", defaultDilution: "As per product label", category: "Insecticide spray" },
  { name: "Coopex EC", activeIngredient: "Permethrin 25%", defaultDilution: "As per product label", category: "Insecticide spray" },
  { name: "Diacon IGR", activeIngredient: "S-methoprene", defaultDilution: "As per product label", category: "Insect growth regulator", notes: "Controls immature stages of storage insects — use alongside a contact insecticide" },
  { name: "Insecto (Diatomaceous Earth)", activeIngredient: "Diatomaceous earth 85%", defaultDilution: "Dry dust — per label rate", category: "Grain admixture / dust", notes: "Physical mode of action — approved for organic grain stores" },
  { name: "Pyrethrum 6% EC (Organic)", activeIngredient: "Pyrethrin 6%", defaultDilution: "As per product label", category: "Insecticide spray", notes: "Approved for organic use — check Organic Control Body acceptance" },
  { name: "Phostoxin", activeIngredient: "Aluminium phosphide 56%", defaultDilution: "Fumigation — licensed contractor only", category: "Fumigant", notes: "MAPP 12459 — must be applied by BASIS/CoC certificated contractor under PCS conditions" },
  { name: "Quickphos Pellets", activeIngredient: "Aluminium phosphide 56%", defaultDilution: "Fumigation — licensed contractor only", category: "Fumigant", notes: "Licensed fumigant — requires sealed store and gas-tight sheeting" },
  { name: "Magtoxin", activeIngredient: "Magnesium phosphide 66%", defaultDilution: "Fumigation — licensed contractor only", category: "Fumigant", notes: "MAPP 13863 — generates phosphine gas, trained operators only" },
  { name: "Detaclean", activeIngredient: "Pyrethrin + Permethrin", defaultDilution: "As per product label", category: "Insecticide spray" },
];

// ─── Product Combobox ──────────────────────────────────────────────────────────
function ProductCombobox({ value, onChange, onProductSelect, disabled }: {
  value: string;
  onChange: (v: string) => void;
  onProductSelect: (product: typeof GRAIN_STORE_PRODUCTS[0] | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const matched = GRAIN_STORE_PRODUCTS.find(p => p.name.toLowerCase() === value.toLowerCase()) ?? null;

  function handleSelect(productName: string) {
    const product = GRAIN_STORE_PRODUCTS.find(p => p.name === productName) ?? null;
    onChange(productName);
    onProductSelect(product);
    setOpen(false);
    setQuery("");
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    onChange(q);
    if (!GRAIN_STORE_PRODUCTS.find(p => p.name.toLowerCase() === q.toLowerCase())) {
      onProductSelect(null);
    }
  }

  const filtered = query.trim()
    ? GRAIN_STORE_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.activeIngredient.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : GRAIN_STORE_PRODUCTS;

  const grouped = filtered.reduce<Record<string, typeof GRAIN_STORE_PRODUCTS>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-1.5">
      <Popover open={open && !disabled} onOpenChange={o => { if (!disabled) setOpen(o); }}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal text-left h-9 px-3"
          >
            <span className={`truncate ${!value ? "text-muted-foreground" : ""}`}>
              {value || "Search or type product name…"}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by product name or active ingredient…"
              value={query}
              onValueChange={handleQueryChange}
            />
            <CommandList className="max-h-64">
              <CommandEmpty>
                <div className="py-3 px-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-0.5">"{query}" not in list</p>
                  <p>Press Enter or click below to use this as a custom product name.</p>
                  {query && (
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => handleSelect(query)}>
                      Use "{query}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              {Object.entries(grouped).map(([category, products]) => (
                <CommandGroup key={category} heading={category}>
                  {products.map(product => (
                    <CommandItem
                      key={product.name}
                      value={product.name}
                      onSelect={() => handleSelect(product.name)}
                      className="flex items-start gap-2 py-2"
                    >
                      <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${value === product.name ? "opacity-100" : "opacity-0"}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-tight">{product.name}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{product.activeIngredient}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {matched && (
        <div className="flex items-start gap-1.5 rounded-md bg-blue-50 border border-blue-100 px-2.5 py-1.5 text-xs text-blue-800">
          <FlaskConical className="w-3 h-3 mt-0.5 shrink-0 text-blue-500" />
          <div>
            <span className="font-medium">{matched.activeIngredient}</span>
            <span className="text-blue-600"> · {matched.category}</span>
            {matched.notes && <p className="text-blue-600 mt-0.5">{matched.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

type Tab = "stock" | "movements";

const GRAIN_COMMODITIES = [
  "Winter Wheat","Spring Wheat","Winter Barley","Spring Barley","Malting Barley",
  "Winter Oats","Spring Oats","Oilseed Rape","Winter Beans","Spring Beans",
  "Peas","Maize","Rye","Triticale","Linseed","Other",
];

// UK AHDB-based variety lists per commodity (recommended varieties 2024/25)
const VARIETY_MAP: Record<string, string[]> = {
  "Winter Wheat": [
    "Zyatt","Gleam","Extase","Dawsum","Elevation","Skyscraper","Skyfall",
    "Insitor","Barrel","Gravity","LG Spotlight","RGT Saki","Kerrin","Graham",
    "Theodore","Crusoe","Grafton","Siskin","Mulika","KWS Zyatt","KWS Cranium",
    "KWS Kinetic","Bennington","Illustrious","Costello","Paladin","Other",
  ],
  "Spring Wheat": [
    "Mulika","Tybalt","Paragon","Camelot","Cochise","Moxie","Tabasco",
    "KWS Alderon","Warden","Other",
  ],
  "Winter Barley": [
    "SY Kingsbarn","Volume","Funky","SY Venture","Bazooka","Orwell","Cassata",
    "Glacier","Craft","Esterel","Sequel","KWS Meridian","Shuffle","Saffron",
    "Flagon","Other",
  ],
  "Spring Barley": [
    "Laureate","Planet","KWS Irina","Propino","Concerto","Diablo","RGT Asteroid",
    "Electrum","Overture","Prestige","Sassy","KWS Cassia","Odyssey","Other",
  ],
  "Malting Barley": [
    "Laureate","Propino","Concerto","Diablo","RGT Asteroid","Electrum","Overture",
    "Prestige","KWS Irina","Sassy","KWS Cassia","Other",
  ],
  "Winter Oats": [
    "Mascani","Boglarka","Balado","Husky","Torino","Canyon","Dalguise",
    "Gerald","Barra","Other",
  ],
  "Spring Oats": [
    "Dancer","Firth","Steele","Grafham","Elyann","Canyon","Husky","Other",
  ],
  "Oilseed Rape": [
    "Acacia","Architect","Aspire","Aurelia","Br11/0250","CIQ Atlass","DK Exstorm",
    "DK Exceptional","DK Explosion","Elgar","ES Asteroid","ES Ely","ES Senator",
    "Genie","Harnas","Heros","Hornet","Incentive","Inspiration","Ionic",
    "Jet Set","Kielder","Limosa","Mansion","Mercedes","Oksana","Palazzo",
    "PT273","Quartz","Rohan","Shooter","SY Alister","Templar","Tribute",
    "Trooper","Verona","Viridian","Other",
  ],
  "Winter Beans": [
    "Fuego","Wizard","Boxer","Lynx","Lynx Plus","Vertigo","Athena","Other",
  ],
  "Spring Beans": [
    "Boxer","Lynx","Lynx Plus","Fuego","Tundra","Fanfare","Maris Bead",
    "Sutton","Other",
  ],
  "Peas": [
    "Astro","Arvica","Classic","Dovilio","Enduro","Grafila","Iceberg","Julia",
    "Kabuki","Karito","Kestrel","Lagonda","Livioletta","Mascara","Navarro",
    "Nimbus","Orla","Patrol","Prophet","Reward","Serge","Silky","Solara",
    "Tyne","Viscount","Other",
  ],
  "Maize": ["LG30222","DKC3939","SY Telius","P8400","Absalon","LGYM18","Other"],
  "Rye": ["Balistic","Dukato","Guttino","Conduct","Visello","Other"],
  "Triticale": ["Agostino","Amarillo","Dublet","Grenado","Kasyno","Purdy","Other"],
  "Linseed": ["Duchess","Gleam","Antares","Ariane","Liral Gold","Other"],
  "Other": ["Other"],
};

const MOVEMENT_TYPES = [
  { value: "harvest_in", label: "Harvest In", direction: "in" },
  { value: "dispatch_out", label: "Dispatch Out", direction: "out" },
  { value: "transfer_in", label: "Transfer In", direction: "in" },
  { value: "transfer_out", label: "Transfer Out", direction: "out" },
  { value: "sample_out", label: "Sample Out", direction: "out" },
  { value: "drying_loss", label: "Drying Loss", direction: "out" },
  { value: "adjustment", label: "Manual Adjustment", direction: "in" },
];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** Derive UK grain harvest year from a date string.
 *  Harvest month >= 7 (July onwards) → that calendar year.
 *  Harvest month < 7 (Jan–June, e.g. winter OSR harvested late) → previous year.
 *  Returns e.g. "2025 Harvest".
 */
function deriveCropYear(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const yr = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${yr} Harvest`;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// ─── Bin Select ───────────────────────────────────────────────────────────────
// API returns a plain array — handle both [] and {rows:[]} / {records:[]}
function BinSelect({ farmId, value, onChange, placeholder }: {
  farmId: number; value: number | null; onChange: (id: number | null, name: string) => void; placeholder?: string;
}) {
  const q = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => Array.isArray(d) ? d : (d.rows ?? d.records ?? []),
  });
  const bins: any[] = q.data ?? [];
  return (
    <Select value={value ? String(value) : "__none__"} onValueChange={v => {
      if (v === "__none__") { onChange(null, ""); return; }
      const bin = bins.find((b: any) => String(b.id) === v);
      onChange(bin?.id ?? null, bin?.binName ?? "");
    }}>
      <SelectTrigger><SelectValue placeholder={placeholder ?? "Select bin / store..."} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— None (no specific bin) —</SelectItem>
        {bins.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.binName}{b.binType ? ` (${b.binType})` : ""}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ─── Variety Select ───────────────────────────────────────────────────────────
function VarietySelect({ commodity, value, onChange }: {
  commodity: string; value: string; onChange: (v: string) => void;
}) {
  const varieties = VARIETY_MAP[commodity] ?? [];
  if (varieties.length === 0) {
    return <Input placeholder="Variety" value={value} onChange={e => onChange(e.target.value)} />;
  }
  return (
    <Select value={value || "__none__"} onValueChange={v => onChange(v === "__none__" ? "" : v)}>
      <SelectTrigger><SelectValue placeholder="Select variety..." /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Select variety —</SelectItem>
        {varieties.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ─── Staff Select (Recorded By) ───────────────────────────────────────────────
function StaffSelect({ farmId, value, onChange, placeholder }: {
  farmId: number; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const q = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => (d.members ?? []) as any[],
  });
  const members: any[] = q.data ?? [];

  return (
    <Select value={value || "__none__"} onValueChange={v => onChange(v === "__none__" ? "" : v)}>
      <SelectTrigger><SelectValue placeholder={placeholder ?? "Select staff member..."} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Select —</SelectItem>
        {members.map(m => {
          const name = `${m.firstName} ${m.lastName}`.trim();
          return <SelectItem key={m.id} value={name}>{name}{m.jobTitle ? ` (${m.jobTitle})` : ""}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );
}

function DirectionIcon({ dir }: { dir: string }) {
  if (dir === "in") return <ArrowDown size={14} style={{ color: "#16a34a" }} />;
  return <ArrowUp size={14} style={{ color: "#dc2626" }} />;
}

// ─── Movement History Modal ────────────────────────────────────────────────────
function MovementHistoryModal({ parcel, movements, onClose }: {
  parcel: any; movements: any[]; onClose: () => void;
}) {
  const movTypeLabel = (t: string) => MOVEMENT_TYPES.find(m => m.value === t)?.label ?? t;

  const sorted = [...movements].sort((a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime());
  let bal = 0;
  const withBalance = sorted.map(m => {
    const qty = parseFloat(m.quantityTonnes ?? "0");
    bal += m.direction === "in" ? qty : -qty;
    return { ...m, runningBalance: bal };
  }).reverse();

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 720 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: "1rem" }}>
            Movement History — {parcel.commodity}{parcel.variety ? ` / ${parcel.variety}` : ""}
            {parcel.cropYear ? <span style={{ marginLeft: 6, fontSize: "0.75rem", color: "#6b7280", fontWeight: 400 }}>({parcel.cropYear})</span> : null}
          </DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", gap: 16, fontSize: "0.8rem", color: "#6b7280", marginBottom: 12 }}>
          <span><strong style={{ color: "#374151" }}>Bin:</strong> {parcel.binName ?? "Unassigned"}</span>
          <span><strong style={{ color: "#374151" }}>Current balance:</strong> <span style={{ color: "#16a34a", fontWeight: 700 }}>{parseFloat(parcel.quantityTonnes ?? "0").toFixed(3)} t</span></span>
        </div>

        {movements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
            <History size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
            <p style={{ fontSize: "0.875rem" }}>No movements recorded for this parcel yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: 380, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  {["Date","Type","Movement","Running Balance","Performed By","Notes"].map(h => (
                    <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.7rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withBalance.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i < withBalance.length - 1 ? "1px solid #f3f4f6" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(m.movedAt)}</td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      <Badge style={{ fontSize: "0.65rem", background: m.direction === "in" ? "#dcfce7" : "#fee2e2", color: m.direction === "in" ? "#166534" : "#991b1b", border: "none" }}>
                        {movTypeLabel(m.movementType)}
                      </Badge>
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 700, color: m.direction === "in" ? "#16a34a" : "#dc2626" }}>
                      {m.direction === "in" ? "+" : "−"}{parseFloat(m.quantityTonnes ?? "0").toFixed(3)} t
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "#374151" }}>{m.runningBalance.toFixed(3)} t</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{m.performedBy || "—"}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter style={{ marginTop: 12 }}>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Clean History Dialog ──────────────────────────────────────────────────────
const CLEAN_TYPE_LABELS: Record<string, string> = {
  full_clean_and_treat: "Full Clean + Treatment",
  physical_clean: "Physical Clean",
  insecticide_treatment: "Insecticide Treatment",
  fumigation: "Fumigation",
  inspection_only: "Inspection Only",
};
const CLEAN_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  full_clean_and_treat: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  physical_clean:       { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
  insecticide_treatment:{ bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  fumigation:           { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  inspection_only:      { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
};

function CleanHistoryDialog({ farmId, bin, onClose }: { farmId: number; bin: any; onClose: () => void }) {
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["clean-history", farmId, bin.id],
    queryFn: () => fetch(`/api/farms/${farmId}/cleaning?locationId=${bin.id}`).then(r => r.json()),
    staleTime: 30_000,
  });

  const records: any[] = data?.records ?? [];

  const filtered = useMemo(() => {
    if (yearFilter === "all") return records;
    return records.filter(r => r.cleanedDate && new Date(r.cleanedDate).getFullYear() === yearFilter);
  }, [records, yearFilter]);

  function handlePrint() {
    const rows = filtered.map(r => {
      const date = r.cleanedDate ? new Date(r.cleanedDate).toLocaleDateString("en-GB") : "—";
      const type = CLEAN_TYPE_LABELS[r.cleaningType] ?? r.cleaningType;
      const product = r.productsUsed || "—";
      const dilution = r.dilutionRate || "—";
      const cleanedBy = r.cleanedBy || "—";
      const notes = r.notes || "";
      return `<tr>
        <td>${date}</td>
        <td>${type}</td>
        <td>${product}</td>
        <td>${dilution}</td>
        <td>${cleanedBy}</td>
        <td>${notes}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <title>Grain Store Cleaning History — ${bin.binName}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; margin: 20mm; color: #111; }
        h1 { font-size: 15pt; margin-bottom: 4px; }
        p.sub { font-size: 9pt; color: #555; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #166534; color: #fff; padding: 6px 8px; text-align: left; font-size: 9pt; }
        td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 9.5pt; vertical-align: top; }
        tr:nth-child(even) td { background: #f9fafb; }
        .footer { margin-top: 18px; font-size: 8pt; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        @media print { body { margin: 10mm; } }
      </style></head><body>
      <h1>Grain Store Cleaning History</h1>
      <p class="sub">Store: <strong>${bin.binName}</strong>${yearFilter !== "all" ? ` &nbsp;·&nbsp; Year: <strong>${yearFilter}</strong>` : ""} &nbsp;·&nbsp; Printed: ${new Date().toLocaleDateString("en-GB")}</p>
      <table>
        <thead><tr>
          <th>Date</th><th>Cleaning Type</th><th>Product Used</th>
          <th>Dilution / Rate</th><th>Cleaned By</th><th>Notes</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="footer">Red Tractor requirement: grain stores must be cleaned with an approved insecticide before each new fill. Records must be retained for a minimum of 3 years.</p>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
  }

  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-green-700" />
              Cleaning History — {bin.binName}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Year filter */}
        <div className="flex items-center gap-2 flex-wrap border-b pb-3">
          {(["all", ...recentYears] as (number | "all")[]).map(y => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              style={{
                padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb",
                background: yearFilter === y ? "#f0fdf4" : "#fff",
                color: yearFilter === y ? "#15803d" : "#6b7280",
              }}
            >
              {y === "all" ? "All years" : y}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            {yearFilter !== "all" ? ` in ${yearFilter}` : " total"}
          </span>
        </div>

        {/* Records */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading records…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
              <ShieldAlert className="w-9 h-9 text-gray-300" />
              <p className="text-sm font-medium">No cleaning records found{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</p>
              <p className="text-xs">Use the <strong>Log Clean</strong> button on the bin to add the first record.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((r: any) => {
                const date = r.cleanedDate ? new Date(r.cleanedDate) : null;
                const typeColor = CLEAN_TYPE_COLORS[r.cleaningType] ?? CLEAN_TYPE_COLORS.inspection_only;
                const knownProduct = r.productsUsed
                  ? GRAIN_STORE_PRODUCTS.find(p => p.name.toLowerCase() === r.productsUsed.toLowerCase())
                  : null;
                return (
                  <div key={r.id} className="py-3 px-1">
                    <div className="flex items-start gap-3">
                      {/* Date column */}
                      <div className="shrink-0 w-24 text-right">
                        {date ? (
                          <>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                              {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </p>
                            <p className="text-xs text-muted-foreground">{date.getFullYear()}</p>
                          </>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: typeColor.bg, color: typeColor.text, border: `1px solid ${typeColor.border}` }}>
                            {CLEAN_TYPE_LABELS[r.cleaningType] ?? r.cleaningType}
                          </span>
                          {r.cleanedBy && (
                            <span className="text-xs text-muted-foreground">by {r.cleanedBy}</span>
                          )}
                        </div>

                        {r.productsUsed && (
                          <div className="flex items-start gap-1.5">
                            <FlaskConical className="w-3 h-3 mt-0.5 shrink-0 text-blue-400" />
                            <div className="text-sm text-gray-700 leading-snug">
                              <span className="font-medium">{r.productsUsed}</span>
                              {knownProduct && (
                                <span className="text-xs text-muted-foreground ml-1.5">({knownProduct.activeIngredient})</span>
                              )}
                            </div>
                          </div>
                        )}

                        {r.dilutionRate && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Droplets className="w-3 h-3 text-blue-300 shrink-0" />
                            {r.dilutionRate}
                          </div>
                        )}

                        {r.notes && (
                          <p className="text-xs text-muted-foreground italic leading-snug">{r.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t pt-3 flex-row items-center gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground flex-1">
            Red Tractor: retain cleaning records for a minimum of <strong>3 years</strong>.
          </p>
          <div className="flex gap-2">
            {filtered.length > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" />Print / Export
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Log Clean Dialog ──────────────────────────────────────────────────────────
function LogCleanDialog({ farmId, bin, onClose, onSaved }: { farmId: number; bin: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    cleaningType: "full_clean_and_treat",
    productsUsed: "",
    dilutionRate: "",
    cleanedBy: "",
    cleanedDate: today,
    notes: "",
  });
  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/cleaning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmId,
        locationId: bin.id,
        area: bin.binName,
        cleaningType: form.cleaningType,
        productsUsed: form.productsUsed || null,
        dilutionRate: form.dilutionRate || null,
        cleanedBy: form.cleanedBy || null,
        cleanedDate: new Date(form.cleanedDate).toISOString(),
        notes: form.notes || null,
      }),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bin-cleaning-status", farmId, bin.id] });
      toast({ title: "Cleaning record saved", description: `${bin.binName} marked as cleaned.` });
      onSaved();
    },
    onError: () => toast({ title: "Failed to save cleaning record", variant: "destructive" }),
  });
  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-600" />Log Store Clean — {bin.binName}</span>
          </DialogTitle>
        </DialogHeader>
        {(() => {
          const noChemicals = form.cleaningType === "physical_clean" || form.cleaningType === "inspection_only";
          const isFumigation = form.cleaningType === "fumigation";
          return (
            <div className="space-y-3 py-1">
              <div>
                <Label>Cleaning Type <span className="text-red-500">*</span></Label>
                <Select value={form.cleaningType} onValueChange={v => setForm(f => ({ ...f, cleaningType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_clean_and_treat">Full clean + insecticide treatment</SelectItem>
                    <SelectItem value="physical_clean">Physical clean only (sweep / vacuum)</SelectItem>
                    <SelectItem value="insecticide_treatment">Insecticide treatment only</SelectItem>
                    <SelectItem value="fumigation">Fumigation</SelectItem>
                    <SelectItem value="inspection_only">Inspection — no treatment required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {noChemicals ? (
                <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-500 italic">
                  No chemical product required for this cleaning type.
                </div>
              ) : (
                <>
                  <div>
                    <Label>Product Used{isFumigation ? " (Fumigant)" : " (Insecticide / Treatment)"}</Label>
                    <ProductCombobox
                      value={form.productsUsed}
                      onChange={v => setForm(f => ({ ...f, productsUsed: v }))}
                      onProductSelect={product => {
                        if (product) setForm(f => ({ ...f, dilutionRate: product.defaultDilution }));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Application Rate / Dilution</Label>
                    <Input
                      placeholder="e.g. 15 ml in 5 L water per 100 m²"
                      value={form.dilutionRate}
                      onChange={e => setForm(f => ({ ...f, dilutionRate: e.target.value }))}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Auto-filled from product selection — always verify against the product label.</p>
                  </div>
                  {isFumigation && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                      <strong>⚠ Fumigation:</strong> Must be carried out by a BASIS/CoC certificated contractor. Ensure the store is sealed and all personnel are clear before treatment.
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cleaned By</Label>
                  <Input placeholder="Name" value={form.cleanedBy} onChange={e => setForm(f => ({ ...f, cleanedBy: e.target.value }))} />
                </div>
                <div>
                  <Label>Date Cleaned <span className="text-red-500">*</span></Label>
                  <Input type="date" value={form.cleanedDate} onChange={e => setForm(f => ({ ...f, cleanedDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={2} placeholder="Any additional observations or actions taken…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#0369a1" }}>
                <strong>Red Tractor:</strong> Stores must be cleaned and treated with an approved grain store insecticide before each new fill. Keep this record for a minimum of 3 years.
              </div>
            </div>
          );
        })()}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mut.mutate()}
            disabled={!form.cleanedDate || mut.isPending}
            style={{ background: "#2563eb", color: "#fff" }}
          >
            {mut.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</> : <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Save Cleaning Record</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bin Card ─────────────────────────────────────────────────────────────────
function BinCard({ bin, farmId, parcels, allMovements, onEdit, onDelete, onHarvestIn }: {
  bin: any; farmId: number; parcels: any[]; allMovements: any[];
  onEdit: (p: any) => void; onDelete: (id: number) => void; onHarvestIn: (binId: number) => void;
}) {
  const [historyParcel, setHistoryParcel] = useState<any | null>(null);
  const [logCleanOpen, setLogCleanOpen] = useState(false);
  const [cleanHistoryOpen, setCleanHistoryOpen] = useState(false);

  // Fetch cleaning status for this bin
  const { data: cleaningStatus } = useQuery({
    queryKey: ["bin-cleaning-status", farmId, bin.id],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins/${bin.id}/cleaning-status`).then(r => r.json()),
    enabled: !!farmId && !!bin.id,
    staleTime: 60_000,
  });

  const lastCleaned: Date | null = cleaningStatus?.lastCleaning?.cleanedDate
    ? new Date(cleaningStatus.lastCleaning.cleanedDate)
    : null;
  const daysSinceCleaning = lastCleaned
    ? Math.floor((Date.now() - lastCleaned.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const cleaningBadgeColor = daysSinceCleaning === null ? "#9ca3af"
    : daysSinceCleaning <= 30 ? "#15803d"
    : daysSinceCleaning <= 60 ? "#b45309"
    : "#dc2626";
  const binTotal = parcels.reduce((s, p) => s + parseFloat(p.quantityTonnes ?? "0"), 0);
  const cap = parseFloat(bin.capacityTonnes ?? "0");
  const available = cap > 0 ? Math.max(0, cap - binTotal) : null;
  const fillPct = cap > 0 ? Math.min(100, (binTotal / cap) * 100) : 0;
  const fillColor = fillPct >= 90 ? "#dc2626" : fillPct >= 70 ? "#f59e0b" : "#16a34a";
  const availColor = fillPct >= 90 ? "#dc2626" : fillPct >= 70 ? "#b45309" : "#15803d";

  const parcelMovements = (p: any) =>
    allMovements.filter(m => m.binId === bin.id && m.commodity === p.commodity && (m.variety ?? "") === (p.variety ?? ""));

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 16, overflow: "hidden", background: "#fff" }}>
      {/* Bin header */}
      <div style={{ background: "#f9fafb", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Database size={15} style={{ color: "#6b7280" }} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>{bin.binName}</span>
          {bin.binType && (
            <Badge style={{ fontSize: "0.65rem", background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", textTransform: "capitalize" }}>
              {bin.binType.replace(/_/g, " ")}
            </Badge>
          )}
          {/* Cleaning status badge */}
          {bin.id > 0 && (
            <span
              title={lastCleaned ? `Last cleaned ${lastCleaned.toLocaleDateString("en-GB")} (${daysSinceCleaning} days ago)` : "No cleaning record logged for this store"}
              style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.65rem", fontWeight: 600, padding: "2px 7px", borderRadius: 99, border: `1px solid ${cleaningBadgeColor}20`, background: `${cleaningBadgeColor}12`, color: cleaningBadgeColor, cursor: "default" }}
            >
              {daysSinceCleaning === null
                ? <><ShieldAlert size={9} />No clean record</>
                : daysSinceCleaning <= 30
                ? <><ShieldCheck size={9} />Cleaned {daysSinceCleaning}d ago</>
                : <><ShieldAlert size={9} />Cleaned {daysSinceCleaning}d ago</>}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
              {binTotal.toFixed(1)} t stored
              {cap > 0 && <span style={{ fontSize: "0.78rem", color: "#9ca3af", fontWeight: 400 }}> / {cap.toFixed(0)} t cap</span>}
            </div>
            {available !== null && (
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: availColor, lineHeight: 1.2 }}>
                {available.toFixed(1)} t available
              </div>
            )}
          </div>
          {bin.id > 0 && (
            <>
              <button
                onClick={() => setCleanHistoryOpen(true)}
                title="View cleaning history for this store"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
              >
                <History size={12} />Clean History
              </button>
              <button
                onClick={() => setLogCleanOpen(true)}
                title="Log a cleaning record for this store"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
              >
                <Droplets size={12} />Log Clean
              </button>
            </>
          )}
          <button
            onClick={() => onHarvestIn(bin.id)}
            title="Record harvest into this bin"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
          >
            <ArrowDown size={12} />Harvest In
          </button>
        </div>
      </div>

      {/* Fill bar */}
      {cap > 0 && (
        <div style={{ padding: "0.5rem 1rem 0.25rem" }}>
          <div style={{ height: 7, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${fillPct}%`, background: fillColor, borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{fillPct.toFixed(0)}% full</span>
            {available !== null && (
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: availColor }}>
                {available.toFixed(1)} t remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Parcels */}
      {parcels.length === 0 ? (
        <div style={{ padding: "1.5rem", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
          No stock currently in this bin
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6" }}>
              {["Commodity","Variety","Crop Year","Live Quantity","Last Updated",""].map(h => (
                <th key={h} style={{ padding: "0.45rem 1rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parcels.map((p, i) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "0.625rem 1rem", fontWeight: 600, color: "#111827" }}>{p.commodity}</td>
                <td style={{ padding: "0.625rem 1rem", color: "#374151" }}>{p.variety || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                <td style={{ padding: "0.625rem 1rem" }}>
                  {p.cropYear
                    ? <Badge style={{ fontSize: "0.65rem", background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }}>{p.cropYear}</Badge>
                    : <span style={{ color: "#9ca3af" }}>—</span>}
                </td>
                <td style={{ padding: "0.625rem 1rem" }}>
                  <span style={{ fontWeight: 700, color: parseFloat(p.quantityTonnes) > 0 ? "#16a34a" : "#dc2626", fontSize: "0.95rem" }}>
                    {parseFloat(p.quantityTonnes ?? "0").toFixed(3)} t
                  </span>
                </td>
                <td style={{ padding: "0.625rem 1rem", color: "#9ca3af", fontSize: "0.8rem" }}>{fmt(p.lastUpdated)}</td>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button title="View movement history" onClick={() => setHistoryParcel({ ...p, binName: bin.binName })} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 4 }}>
                      <History size={14} />
                    </button>
                    <button title="Edit stock record" onClick={() => onEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }}>
                      <Pencil size={13} />
                    </button>
                    <button title="Delete stock record" onClick={() => onDelete(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4, borderRadius: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {historyParcel && (
        <MovementHistoryModal
          parcel={historyParcel}
          movements={parcelMovements(historyParcel)}
          onClose={() => setHistoryParcel(null)}
        />
      )}

      {cleanHistoryOpen && bin.id > 0 && (
        <CleanHistoryDialog
          farmId={farmId}
          bin={bin}
          onClose={() => setCleanHistoryOpen(false)}
        />
      )}

      {logCleanOpen && bin.id > 0 && (
        <LogCleanDialog
          farmId={farmId}
          bin={bin}
          onClose={() => setLogCleanOpen(false)}
          onSaved={() => {
            setLogCleanOpen(false);
            // refresh history cache so it's up to date if opened next
          }}
        />
      )}
    </div>
  );
}

// ─── Stock Levels Tab ─────────────────────────────────────────────────────────
function StockLevelsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [harvestOpen, setHarvestOpen] = useState(false);
  const [harvestBinId, setHarvestBinId] = useState<number | null>(null);

  const emptyLevel = { binId: null as number | null, commodity: "", variety: "", quantityTonnes: "", notes: "" };
  const emptyHarvest = { binId: null as number | null, commodity: "", variety: "", harvestDate: todayISO(), quantityTonnes: "", performedBy: "", notes: "" };
  const [levelForm, setLevelForm] = useState<any>(emptyLevel);
  const [harvestForm, setHarvestForm] = useState<any>(emptyHarvest);

  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  // Bins
  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => Array.isArray(d) ? d : (d.rows ?? d.records ?? []),
  });
  const bins: any[] = binsQ.data ?? [];

  // Stock levels
  const q = useQuery({
    queryKey: ["crop-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-levels`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  // All movements (for drill-down history)
  const movQ = useQuery({
    queryKey: ["crop-stock-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-movements`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const saveLevelMut = useMutation({
    mutationFn: (body: any) => editRow
      ? fetch(`/api/farms/${farmId}/crop-stock-levels/${editRow.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : fetch(`/api/farms/${farmId}/crop-stock-levels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: editRow ? "Stock record updated" : "Stock record created" }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); setAddOpen(false); setEditRow(null); setLevelForm(emptyLevel); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteLevelMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/crop-stock-levels/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); setDeleteId(null); },
  });

  const harvestMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Harvest-in recorded — stock level updated" }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); qc.invalidateQueries({ queryKey: ["crop-stock-movements", farmId] }); setHarvestOpen(false); setHarvestForm(emptyHarvest); },
    onError: () => toast({ title: "Failed to record harvest", variant: "destructive" }),
  });

  const derivedCropYear = useMemo(() => deriveCropYear(harvestForm.harvestDate), [harvestForm.harvestDate]);

  const records: any[] = q.data ?? [];
  const allMovements: any[] = movQ.data ?? [];

  // Summary: total + per-commodity/variety breakdown
  const totalTonnes = records.reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);

  // Group by commodity, then by variety within each commodity
  const byCommodity = useMemo(() => {
    const m: Record<string, { total: number; varieties: { variety: string; tonnes: number; cropYear: string }[] }> = {};
    for (const r of records) {
      const qty = parseFloat(r.quantityTonnes ?? "0");
      if (!m[r.commodity]) m[r.commodity] = { total: 0, varieties: [] };
      m[r.commodity].total += qty;
      const existing = m[r.commodity].varieties.find(v => v.variety === (r.variety ?? "—") && v.cropYear === (r.cropYear ?? "—"));
      if (existing) existing.tonnes += qty;
      else m[r.commodity].varieties.push({ variety: r.variety ?? "—", tonnes: qty, cropYear: r.cropYear ?? "—" });
    }
    return Object.entries(m)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([commodity, data]) => ({
        commodity,
        total: data.total,
        varieties: data.varieties.sort((a, b) => b.tonnes - a.tonnes),
      }));
  }, [records]);

  // Group parcels by binId (0 = unassigned)
  const byBin = useMemo(() => {
    const m: Record<number, any[]> = {};
    for (const r of records) {
      const k = r.binId ?? 0;
      if (!m[k]) m[k] = [];
      m[k].push(r);
    }
    return m;
  }, [records]);

  // Map binId → existing parcel (Red Tractor: one lot per location)
  const binOccupancyMap = useMemo(() => {
    const m: Record<number, any> = {};
    for (const r of records) if (r.binId) m[r.binId] = r;
    return m;
  }, [records]);

  const openHarvestForBin = (binId: number) => {
    setHarvestBinId(binId);
    // Auto-fill commodity/variety from existing parcel in bin (Red Tractor: must match)
    const existing = binOccupancyMap[binId];
    setHarvestForm({ ...emptyHarvest, binId, commodity: existing?.commodity ?? "", variety: existing?.variety ?? "" });
    setHarvestOpen(true);
  };

  // Conflict detection — harvest dialog
  const harvestExistingParcel = harvestForm.binId ? binOccupancyMap[harvestForm.binId] : null;
  const harvestCommodityConflict = !!(harvestExistingParcel && harvestForm.commodity &&
    (harvestExistingParcel.commodity !== harvestForm.commodity ||
     (harvestExistingParcel.variety ?? "") !== (harvestForm.variety ?? "")));
  const harvestCropYearConflict = !!(harvestExistingParcel && derivedCropYear &&
    harvestExistingParcel.cropYear && harvestExistingParcel.cropYear !== derivedCropYear &&
    !harvestCommodityConflict); // only show year conflict when commodity/variety match
  const harvestHasConflict = harvestCommodityConflict || harvestCropYearConflict;

  // Cleaning status for the selected harvest-in bin (only when bin is empty / no current parcel)
  const harvestBinIsEmpty = !!harvestForm.binId && !binOccupancyMap[harvestForm.binId];
  const { data: harvestCleanStatus } = useQuery({
    queryKey: ["bin-cleaning-status", farmId, harvestForm.binId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins/${harvestForm.binId}/cleaning-status`).then(r => r.json()),
    enabled: harvestOpen && !!harvestForm.binId && harvestBinIsEmpty,
    staleTime: 30_000,
  });
  const harvestCleaningWarning = harvestBinIsEmpty && harvestCleanStatus?.requiresCleaningLog === true;
  const harvestCleaningOk = harvestBinIsEmpty && harvestCleanStatus && !harvestCleanStatus.requiresCleaningLog;

  // Conflict detection — manual stock entry dialog (skip when editing the same record)
  const levelExistingParcel = (levelForm.binId && !editRow) ? binOccupancyMap[levelForm.binId] : null;
  const levelHasConflict = levelExistingParcel && levelForm.commodity &&
    (levelExistingParcel.commodity !== levelForm.commodity ||
     (levelExistingParcel.variety ?? "") !== (levelForm.variety ?? ""));

  const handlePrintStock = () => {
    const fName = farmData?.record?.name ?? "Farm";
    const cph = farmData?.record?.cphNumber ?? undefined;
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    const binLabel = (binId: number | null | undefined) => {
      if (!binId) return "Unassigned / Field Heap";
      return bins.find((b: any) => b.id === binId)?.binName ?? `Bin #${binId}`;
    };

    const tableHtml = `
      <div class="section-head">Current Stock Levels — as at ${today}</div>
      <table>
        <thead>
          <tr>
            <th>Bin / Store</th>
            <th>Commodity</th>
            <th>Variety</th>
            <th>Crop Year</th>
            <th style="text-align:right;">Quantity (t)</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((r: any) => `
            <tr>
              <td>${binLabel(r.binId)}</td>
              <td><strong>${r.commodity ?? "—"}</strong></td>
              <td>${r.variety ?? "—"}</td>
              <td>${r.cropYear ?? "—"}</td>
              <td style="text-align:right;font-weight:700;">${parseFloat(r.quantityTonnes ?? "0").toFixed(3)}</td>
              <td style="color:#6b7280;">${r.notes ?? ""}</td>
            </tr>
          `).join("")}
          <tr style="background:#f0fdf4;font-weight:700;">
            <td colspan="4" style="text-align:right;color:#166534;">Total In Store</td>
            <td style="text-align:right;color:#166534;">${totalTonnes.toFixed(3)} t</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      ${records.length === 0 ? '<p style="color:#6b7280;font-size:8px;margin-top:12px;">No stock levels recorded.</p>' : ""}
    `;

    const html = buildProReport({
      title: "Crop Stock Register",
      subtitle: "Grain & Crop Storage Inventory",
      farmName: fName,
      cphNumber: cph,
      recordCount: records.length,
      recordLabel: "lot",
      tableHtml,
      footerNote: "Red Tractor requires a clear audit trail of all grain lots — commodity, variety, quantity, and location. " +
        "Each bin should hold a single lot (one commodity/variety/harvest year). Retain all records for 3 years.",
      landscape: true,
    });
    openPrintWindow(html);
  };

  return (
    <div>
      {/* ── Summary strip ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.75rem 1rem" }}>
        <div style={{ marginRight: 8 }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.05em" }}>Total In Store</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#14532d", lineHeight: 1 }}>{totalTonnes.toFixed(1)} t</p>
        </div>
        <div style={{ width: 1, height: 32, background: "#bbf7d0" }} />
        {byCommodity.map(({ commodity, total, varieties }) => (
          <div key={commodity} style={{ background: "#fff", border: "1px solid #d1fae5", borderRadius: 8, padding: "0.4rem 0.75rem", minWidth: 110 }}>
            {/* Commodity header with total */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: varieties.length > 1 ? 4 : 0 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{commodity}</p>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", marginLeft: "auto", whiteSpace: "nowrap" }}>{total.toFixed(1)} t</p>
            </div>
            {/* Variety rows */}
            {varieties.map(v => (
              <div key={`${v.variety}-${v.cropYear}`} style={{ display: "flex", alignItems: "baseline", gap: 6, borderTop: "1px solid #f0fdf4", paddingTop: 3, marginTop: 2 }}>
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{v.variety}</p>
                  <p style={{ fontSize: "0.6rem", color: "#9ca3af", whiteSpace: "nowrap" }}>{v.cropYear}</p>
                </div>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803d", marginLeft: "auto", whiteSpace: "nowrap" }}>{v.tonnes.toFixed(1)} t</p>
              </div>
            ))}
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button size="sm" variant="outline" onClick={handlePrintStock} disabled={records.length === 0} title="Print stock register">
            <Printer size={13} className="mr-1" />Print Register
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setHarvestBinId(null); setHarvestForm(emptyHarvest); setHarvestOpen(true); }}>
            <ArrowDown size={13} className="mr-1" style={{ color: "#16a34a" }} />Record Harvest In
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setEditRow(null); setLevelForm(emptyLevel); setAddOpen(true); }}>
            <Plus size={13} className="mr-1" />Manual Entry
          </Button>
        </div>
      </div>

      {/* ── Bin cards ─────────────────────────────────────────────── */}
      {records.length === 0 && bins.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Wheat size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No crop stock records yet</p>
          <p style={{ fontSize: "0.875rem" }}>Use "Record Harvest In" to initialise grain stock levels.</p>
        </div>
      ) : (
        <>
          {bins.map(bin => (
            <BinCard
              key={bin.id}
              bin={bin}
              farmId={farmId}
              parcels={byBin[bin.id] ?? []}
              allMovements={allMovements}
              onEdit={p => { setEditRow(p); setLevelForm({ ...p }); setAddOpen(true); }}
              onDelete={id => setDeleteId(id)}
              onHarvestIn={openHarvestForBin}
            />
          ))}
          {/* Unassigned parcels (no bin linked) */}
          {(byBin[0] ?? []).length > 0 && (
            <BinCard
              key={0}
              bin={{ id: 0, binName: "Unassigned / Field Heap", binType: null, capacityTonnes: null }}
              farmId={farmId}
              parcels={byBin[0]}
              allMovements={allMovements}
              onEdit={p => { setEditRow(p); setLevelForm({ ...p }); setAddOpen(true); }}
              onDelete={id => setDeleteId(id)}
              onHarvestIn={() => { setHarvestBinId(null); setHarvestForm(emptyHarvest); setHarvestOpen(true); }}
            />
          )}
        </>
      )}

      {/* Record Harvest In */}
      <Dialog open={harvestOpen} onOpenChange={o => { if (!o) setHarvestOpen(false); }}>
        <DialogContent style={{ maxWidth: 500 }}>
          <DialogHeader><DialogTitle>Record Harvest In</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Records incoming grain and updates the live stock level for the destination bin.</p>
          <div className="space-y-3 mt-2">

            {/* Harvest date — crop year is derived automatically */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Harvest Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input
                  type="date"
                  value={harvestForm.harvestDate}
                  onChange={e => setHarvestForm((f: any) => ({ ...f, harvestDate: e.target.value, variety: "" }))}
                />
              </div>
              <div>
                <Label>Crop Year</Label>
                <div style={{ display: "flex", alignItems: "center", height: 36, paddingLeft: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", color: derivedCropYear ? "#111827" : "#9ca3af" }}>
                  {derivedCropYear || "—"}
                </div>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }}>Derived automatically from harvest date</p>
              </div>
            </div>

            {/* Commodity + Variety (variety resets on commodity change) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Commodity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select
                  value={harvestForm.commodity || "__none__"}
                  onValueChange={v => setHarvestForm((f: any) => ({ ...f, commodity: v === "__none__" ? "" : v, variety: "" }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {GRAIN_COMMODITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety</Label>
                <VarietySelect
                  commodity={harvestForm.commodity}
                  value={harvestForm.variety}
                  onChange={v => setHarvestForm((f: any) => ({ ...f, variety: v }))}
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label>Quantity (tonnes) <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input type="number" step="0.001" min="0" value={harvestForm.quantityTonnes} onChange={e => setHarvestForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} />
            </div>

            {/* Destination bin */}
            <div>
              <Label>Destination Bin / Store</Label>
              <BinSelect
                farmId={farmId}
                value={harvestForm.binId}
                onChange={id => {
                  // Auto-fill commodity/variety from existing parcel to prevent mix
                  const existing = id ? binOccupancyMap[id] : null;
                  setHarvestForm((f: any) => ({
                    ...f,
                    binId: id,
                    commodity: existing ? existing.commodity : f.commodity,
                    variety: existing ? (existing.variety ?? "") : f.variety,
                  }));
                }}
                placeholder="Select destination bin or store..."
              />
              {harvestExistingParcel && !harvestHasConflict && (() => {
                const dialogBin = bins.find((b: any) => b.id === harvestForm.binId);
                const cap = parseFloat(dialogBin?.capacityTonnes ?? "0");
                const stored = parseFloat(harvestExistingParcel.quantityTonnes ?? "0");
                const avail = cap > 0 ? Math.max(0, cap - stored) : null;
                return (
                  <div style={{ marginTop: 6, padding: "0.5rem 0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: "0.8rem", color: "#15803d" }}>
                    <strong>Existing lot:</strong> {harvestExistingParcel.commodity} / {harvestExistingParcel.variety ?? "—"} ({harvestExistingParcel.cropYear ?? "—"}) — {stored.toFixed(1)} t in store
                    {avail !== null && <span style={{ marginLeft: 8, fontWeight: 700 }}>· {avail.toFixed(1)} t space remaining</span>}
                    . Harvest-in will add to this lot.
                  </div>
                );
              })()}
              {harvestCommodityConflict && (
                <div style={{ marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, fontSize: "0.8rem", color: "#b91c1c" }}>
                  <strong>Red Tractor conflict — mixed crop:</strong> This bin already holds {harvestExistingParcel!.commodity} / {harvestExistingParcel!.variety ?? "—"}. Each registered location must hold one commodity and variety only. Select a different bin, or clear the existing lot first.
                </div>
              )}
              {harvestCropYearConflict && (
                <div style={{ marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, fontSize: "0.8rem", color: "#b91c1c" }}>
                  <strong>Red Tractor conflict — harvest year mismatch:</strong> This bin holds <strong>{harvestExistingParcel!.cropYear}</strong> grain. The date you have entered produces crop year <strong>{derivedCropYear}</strong>. Red Tractor requires each registered location to hold one crop year as a discrete traceable lot. Select a different bin, or clear and clean this location before the new harvest is stored.
                </div>
              )}
              {/* Cleaning status for empty bin (Red Tractor gate) */}
              {harvestCleaningWarning && (
                <div style={{ marginTop: 6, padding: "0.55rem 0.75rem", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, fontSize: "0.8rem", color: "#92400e", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <ShieldAlert size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Cleaning not confirmed for this fill:</strong> No cleaning record has been logged since the bin was last emptied. Red Tractor requires stores to be cleaned and treated with an approved insecticide before each new fill. You can still record this harvest — log the clean on the bin card afterwards.
                  </div>
                </div>
              )}
              {harvestCleaningOk && harvestCleanStatus?.lastCleaning && (
                <div style={{ marginTop: 6, padding: "0.45rem 0.75rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, fontSize: "0.78rem", color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
                  <span>
                    <strong>Cleaning confirmed</strong> — cleaned {new Date(harvestCleanStatus.lastCleaning.cleanedDate).toLocaleDateString("en-GB")}
                    {harvestCleanStatus.lastCleaning.cleaningType && ` (${harvestCleanStatus.lastCleaning.cleaningType.replace(/_/g, " ")})`}
                  </span>
                </div>
              )}
            </div>

            {/* Recorded By — staff lookup */}
            <div>
              <Label>Recorded By</Label>
              <StaffSelect farmId={farmId} value={harvestForm.performedBy} onChange={v => setHarvestForm((f: any) => ({ ...f, performedBy: v }))} />
            </div>

            <div><Label>Notes</Label><Textarea rows={2} value={harvestForm.notes} onChange={e => setHarvestForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setHarvestOpen(false)}>Cancel</Button>
            <Button
              style={{ background: "#16a34a", color: "#fff" }}
              onClick={() => harvestMut.mutate({
                binId: harvestForm.binId,
                commodity: harvestForm.commodity,
                variety: harvestForm.variety || null,
                cropYear: derivedCropYear || null,
                movementType: "harvest_in",
                direction: "in",
                quantityTonnes: harvestForm.quantityTonnes,
                referenceType: "harvest_record",
                performedBy: harvestForm.performedBy || null,
                notes: harvestForm.notes || null,
                movedAt: harvestForm.harvestDate ? new Date(harvestForm.harvestDate).toISOString() : undefined,
              })}
              disabled={!harvestForm.commodity || !harvestForm.quantityTonnes || !harvestForm.harvestDate || !!harvestHasConflict || harvestMut.isPending}
            >
              {harvestMut.isPending ? "Recording…" : "Record Harvest In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Stock Entry */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRow(null); setLevelForm(emptyLevel); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>{editRow ? "Edit Stock Record" : "Manual Stock Entry"}</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{editRow ? "Update the live quantity for this stock record." : "Create a new stock level record directly. Use 'Record Harvest In' to add movements with a full audit trail."}</p>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Commodity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={levelForm.commodity || "__none__"} onValueChange={v => setLevelForm((f: any) => ({ ...f, commodity: v === "__none__" ? "" : v, variety: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {GRAIN_COMMODITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety</Label>
                <VarietySelect commodity={levelForm.commodity} value={levelForm.variety ?? ""} onChange={v => setLevelForm((f: any) => ({ ...f, variety: v }))} />
              </div>
            </div>
            <div>
              <Label>Quantity (tonnes) <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input type="number" step="0.001" min="0" value={levelForm.quantityTonnes} onChange={e => setLevelForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} />
            </div>
            <div>
              <Label>Bin / Store Location</Label>
              <BinSelect farmId={farmId} value={levelForm.binId} onChange={id => setLevelForm((f: any) => ({ ...f, binId: id }))} />
              {levelHasConflict && (
                <div style={{ marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, fontSize: "0.8rem", color: "#b91c1c" }}>
                  <strong>Red Tractor conflict:</strong> This bin already holds {levelExistingParcel.commodity} / {levelExistingParcel.variety ?? "—"} ({levelExistingParcel.cropYear ?? "—"}). Each location must hold one commodity only. Select a different location, or clear the existing lot first.
                </div>
              )}
              {levelExistingParcel && !levelHasConflict && levelForm.commodity && (
                <div style={{ marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 6, fontSize: "0.8rem", color: "#854d0e" }}>
                  <strong>Note:</strong> This bin already has a stock record for {levelExistingParcel.commodity} / {levelExistingParcel.variety ?? "—"}. Saving will be blocked by the API — use "Record Harvest In" to add tonnage to the existing lot, or delete the existing record first.
                </div>
              )}
            </div>
            <div><Label>Notes</Label><Textarea rows={2} value={levelForm.notes} onChange={e => setLevelForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRow(null); setLevelForm(emptyLevel); }}>Cancel</Button>
            <Button onClick={() => saveLevelMut.mutate(levelForm)} disabled={!levelForm.commodity || !levelForm.quantityTonnes || !!levelHasConflict || !!levelExistingParcel || saveLevelMut.isPending}>
              {saveLevelMut.isPending ? "Saving…" : editRow ? "Save Changes" : "Create Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Stock Record?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This removes the record. Stock movements are not reversed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteLevelMut.mutate(deleteId)} disabled={deleteLevelMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Movements Audit Log Tab ───────────────────────────────────────────────────
function MovementsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adjOpen, setAdjOpen] = useState(false);
  const emptyAdj = { binId: null as number | null, commodity: "", variety: "", movementType: "adjustment", direction: "in", quantityTonnes: "", performedBy: "", notes: "" };
  const [adjForm, setAdjForm] = useState<any>(emptyAdj);

  const [filterCropYear, setFilterCropYear] = useState<string>("__all__");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");

  const q = useQuery({
    queryKey: ["crop-stock-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-movements`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => Array.isArray(d) ? d : (d.rows ?? d.records ?? []),
  });
  const bins: any[] = binsQ.data ?? [];
  const binName = (id: number | null | undefined) => bins.find(b => b.id === id)?.binName ?? "—";

  const adjMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Adjustment recorded" }); qc.invalidateQueries({ queryKey: ["crop-stock-movements", farmId] }); qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] }); setAdjOpen(false); setAdjForm(emptyAdj); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const movTypeLabel = (t: string) => MOVEMENT_TYPES.find(m => m.value === t)?.label ?? t;

  const cropYears = useMemo(() => {
    const seen = new Set<string>();
    records.forEach(r => { if (r.movedAt) seen.add(deriveCropYear(r.movedAt)); });
    return Array.from(seen).sort().reverse();
  }, [records]);

  const filtered = useMemo(() => {
    let result = [...records].sort((a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime());
    if (filterCropYear !== "__all__") {
      result = result.filter(r => deriveCropYear(r.movedAt) === filterCropYear);
    }
    if (filterFrom) {
      const from = new Date(filterFrom).getTime();
      result = result.filter(r => r.movedAt && new Date(r.movedAt).getTime() >= from);
    }
    if (filterTo) {
      const to = new Date(filterTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(r => r.movedAt && new Date(r.movedAt).getTime() <= to.getTime());
    }
    return result;
  }, [records, filterCropYear, filterFrom, filterTo]);

  const hasFilter = filterCropYear !== "__all__" || !!filterFrom || !!filterTo;

  const moveSummary = useMemo(() => {
    const totalIn = filtered.filter(r => r.direction === "in").reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);
    const totalOut = filtered.filter(r => r.direction === "out").reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);
    const byType: Record<string, { in: number; out: number }> = {};
    filtered.forEach(r => {
      const key = r.commodity ?? "Unknown";
      if (!byType[key]) byType[key] = { in: 0, out: 0 };
      const qty = parseFloat(r.quantityTonnes ?? "0");
      if (r.direction === "in") byType[key].in += qty; else byType[key].out += qty;
    });
    const rows = Object.entries(byType).sort((a, b) => (b[1].in + b[1].out) - (a[1].in + a[1].out));
    return { totalIn, totalOut, net: totalIn - totalOut, rows };
  }, [filtered]);

  const handlePrintMovements = () => {
    const fName = farmData?.record?.name ?? "Farm";
    const cph = farmData?.record?.cphNumber ?? undefined;

    const sorted = [...filtered];

    const filterDesc = filterCropYear !== "__all__"
      ? `Crop year ${filterCropYear}`
      : filterFrom || filterTo
        ? [filterFrom && `From ${new Date(filterFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, filterTo && `To ${new Date(filterTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`].filter(Boolean).join(" — ")
        : "All movements";

    const pIn = moveSummary.totalIn;
    const pOut = moveSummary.totalOut;
    const pNet = moveSummary.net;
    const summaryHtml = sorted.length > 0 ? `
      <div style="margin-bottom:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;">
        <p style="font-size:7.5px;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:0.06em;margin:0 0 8px;">Movement Summary — ${filterDesc ?? "All movements"}</p>
        <table style="border-collapse:collapse;width:auto;margin-bottom:${moveSummary.rows.length > 1 ? "12px" : "0"};">
          <tbody><tr>
            <td style="padding:2px 24px 2px 0;"><p style="font-size:7px;font-weight:700;text-transform:uppercase;color:#15803d;margin:0 0 2px;">Total IN</p><p style="font-size:14px;font-weight:800;color:#14532d;margin:0;">${pIn.toFixed(3)} t</p></td>
            <td style="padding:2px 24px 2px 0;"><p style="font-size:7px;font-weight:700;text-transform:uppercase;color:#b91c1c;margin:0 0 2px;">Total OUT</p><p style="font-size:14px;font-weight:800;color:#7f1d1d;margin:0;">${pOut.toFixed(3)} t</p></td>
            <td style="padding:2px 0;"><p style="font-size:7px;font-weight:700;text-transform:uppercase;color:${pNet >= 0 ? "#15803d" : "#b91c1c"};margin:0 0 2px;">Net Movement</p><p style="font-size:14px;font-weight:800;color:${pNet >= 0 ? "#14532d" : "#7f1d1d"};margin:0;">${pNet >= 0 ? "+" : ""}${pNet.toFixed(3)} t</p></td>
          </tr></tbody>
        </table>
        ${moveSummary.rows.length > 1 ? `<table style="border-collapse:collapse;font-size:8px;">
          <thead><tr>
            <th style="padding:2px 16px 2px 0;text-align:left;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Commodity</th>
            <th style="padding:2px 16px;text-align:right;font-weight:600;color:#166534;border-bottom:1px solid #e5e7eb;">IN (t)</th>
            <th style="padding:2px 16px;text-align:right;font-weight:600;color:#991b1b;border-bottom:1px solid #e5e7eb;">OUT (t)</th>
            <th style="padding:2px 0;text-align:right;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">NET (t)</th>
          </tr></thead>
          <tbody>${moveSummary.rows.map(([c, v]) => { const n = v.in - v.out; return `<tr><td style="padding:2px 16px 2px 0;color:#374151;">${c}</td><td style="padding:2px 16px;text-align:right;color:#166534;">${v.in > 0 ? v.in.toFixed(3) : "—"}</td><td style="padding:2px 16px;text-align:right;color:#991b1b;">${v.out > 0 ? v.out.toFixed(3) : "—"}</td><td style="padding:2px 0;text-align:right;font-weight:700;color:${n >= 0 ? "#166534" : "#991b1b"};">${n >= 0 ? "+" : ""}${n.toFixed(3)}</td></tr>`; }).join("")}</tbody>
        </table>` : ""}
      </div>` : "";

    const dirBadge = (dir: string) => dir === "in"
      ? '<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-size:6px;font-weight:700;">IN</span>'
      : '<span style="background:#fee2e2;color:#991b1b;padding:1px 5px;border-radius:3px;font-size:6px;font-weight:700;">OUT</span>';

    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>Movement Type</th>
            <th>Direction</th>
            <th>Commodity</th>
            <th>Variety</th>
            <th>Bin / Store</th>
            <th style="text-align:right;">Quantity (t)</th>
            <th>Performed By</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((m: any) => `
            <tr>
              <td style="white-space:nowrap;">${m.movedAt ? new Date(m.movedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
              <td><strong>${movTypeLabel(m.movementType)}</strong></td>
              <td>${dirBadge(m.direction)}</td>
              <td>${m.commodity ?? "—"}</td>
              <td>${m.variety ?? "—"}</td>
              <td>${binName(m.binId)}</td>
              <td style="text-align:right;font-weight:700;">${parseFloat(m.quantityTonnes ?? "0").toFixed(3)}</td>
              <td>${m.performedBy ?? "—"}</td>
              <td style="color:#6b7280;">${m.notes ?? ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${sorted.length === 0 ? '<p style="color:#6b7280;font-size:8px;margin-top:12px;">No movements recorded.</p>' : ""}
    `;

    const html = buildProReport({
      title: "Crop Stock — Movement Audit Log",
      subtitle: `Immutable record of all grain stock changes — ${filterDesc}`,
      farmName: fName,
      cphNumber: cph,
      recordCount: sorted.length,
      recordLabel: "movement",
      tableHtml: summaryHtml + tableHtml,
      footerNote: "This is an immutable audit log. All entries are permanent records of grain movements. " +
        "Red Tractor requires full traceability from harvest through storage to dispatch. Retain for 3 years.",
      landscape: true,
    });
    openPrintWindow(html);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", flex: "1 1 auto" }}>Full immutable audit log of all crop stock changes — harvests, dispatches, transfers, and adjustments.</p>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button size="sm" variant="outline" onClick={handlePrintMovements} disabled={filtered.length === 0} title="Print movement audit log">
            <Printer size={14} className="mr-1" />Print Log
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAdjOpen(true)}><Plus size={14} className="mr-1" />Manual Adjustment</Button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 14, padding: "10px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Crop Year</label>
          <Select value={filterCropYear} onValueChange={v => { setFilterCropYear(v); setFilterFrom(""); setFilterTo(""); }}>
            <SelectTrigger style={{ width: 120, height: 32, fontSize: "0.8rem" }}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All years</SelectItem>
              {cropYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>From</label>
          <input
            type="date"
            value={filterFrom}
            onChange={e => { setFilterFrom(e.target.value); setFilterCropYear("__all__"); }}
            style={{ height: 32, padding: "0 8px", fontSize: "0.8rem", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", color: "#374151" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>To</label>
          <input
            type="date"
            value={filterTo}
            onChange={e => { setFilterTo(e.target.value); setFilterCropYear("__all__"); }}
            style={{ height: 32, padding: "0 8px", fontSize: "0.8rem", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", color: "#374151" }}
          />
        </div>
        {hasFilter && (
          <Button size="sm" variant="ghost" style={{ height: 32, alignSelf: "flex-end" }} onClick={() => { setFilterCropYear("__all__"); setFilterFrom(""); setFilterTo(""); }}>
            Clear
          </Button>
        )}
        <span style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af", paddingBottom: 6 }}>
          {filtered.length} of {records.length} movement{records.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total IN</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }}>{moveSummary.totalIn.toFixed(1)} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>t</span></p>
            </div>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total OUT</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }}>{moveSummary.totalOut.toFixed(1)} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>t</span></p>
            </div>
            <div style={{ background: moveSummary.net >= 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${moveSummary.net >= 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: moveSummary.net >= 0 ? "#15803d" : "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>Net Movement</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: moveSummary.net >= 0 ? "#14532d" : "#7f1d1d", lineHeight: 1, margin: 0 }}>{moveSummary.net >= 0 ? "+" : ""}{moveSummary.net.toFixed(1)} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>t</span></p>
            </div>
          </div>
          {moveSummary.rows.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "6px 14px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", margin: 0 }}>By Commodity</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <th style={{ padding: "5px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }}>Commodity</th>
                    <th style={{ padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#166534", fontSize: "0.7rem" }}>IN (t)</th>
                    <th style={{ padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#991b1b", fontSize: "0.7rem" }}>OUT (t)</th>
                    <th style={{ padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }}>NET (t)</th>
                  </tr>
                </thead>
                <tbody>
                  {moveSummary.rows.map(([comm, v]) => {
                    const n = v.in - v.out;
                    return (
                      <tr key={comm} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "4px 14px", fontWeight: 500 }}>{comm}</td>
                        <td style={{ padding: "4px 14px", textAlign: "right", color: "#16a34a" }}>{v.in > 0 ? `${v.in.toFixed(3)} t` : "—"}</td>
                        <td style={{ padding: "4px 14px", textAlign: "right", color: "#dc2626" }}>{v.out > 0 ? `${v.out.toFixed(3)} t` : "—"}</td>
                        <td style={{ padding: "4px 14px", textAlign: "right", fontWeight: 700, color: n >= 0 ? "#16a34a" : "#dc2626" }}>{n >= 0 ? "+" : ""}{n.toFixed(3)} t</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ArrowLeftRight size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No movements recorded yet</p>
          <p style={{ fontSize: "0.875rem" }}>Movements are created automatically when dispatches and transfers are confirmed.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ArrowLeftRight size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No movements match your filter</p>
          <p style={{ fontSize: "0.875rem" }}>Try adjusting or clearing the date filter above.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date","Type","Dir","Commodity","Bin / Store","Quantity (t)","Reference","By","Notes"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.movedAt)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <Badge style={{
                      fontSize: "0.7rem", border: "none",
                      background: r.movementType === "adjustment" ? "#fef3c7" : r.direction === "in" ? "#dcfce7" : "#fee2e2",
                      color: r.movementType === "adjustment" ? "#92400e" : r.direction === "in" ? "#166534" : "#991b1b",
                    }}>
                      {movTypeLabel(r.movementType)}
                    </Badge>
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><DirectionIcon dir={r.direction} /></td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <p style={{ fontWeight: 500 }}>{r.commodity}</p>
                    {r.variety && <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.variety}</p>}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{binName(r.binId)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, color: r.direction === "in" ? "#16a34a" : "#dc2626" }}>
                    {r.direction === "in" ? "+" : "−"}{parseFloat(r.quantityTonnes ?? "0").toFixed(3)} t
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }}>
                    {r.referenceType ? `${r.referenceType.replace(/_/g, " ")} #${r.referenceId ?? "—"}` : "—"}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.performedBy || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Adjustment Dialog */}
      <Dialog open={adjOpen} onOpenChange={o => { if (!o) setAdjOpen(false); }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Manual Stock Adjustment</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Use for corrections, dry matter losses, or opening balances. Full audit trail is kept.</p>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Movement Type</Label>
                <Select value={adjForm.movementType} onValueChange={v => {
                  const mt = MOVEMENT_TYPES.find(m => m.value === v);
                  setAdjForm((f: any) => ({ ...f, movementType: v, direction: mt?.direction ?? "in" }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MOVEMENT_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Direction</Label>
                <Select value={adjForm.direction} onValueChange={v => setAdjForm((f: any) => ({ ...f, direction: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">In (increase stock)</SelectItem>
                    <SelectItem value="out">Out (decrease stock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Commodity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={adjForm.commodity || "__none__"} onValueChange={v => setAdjForm((f: any) => ({ ...f, commodity: v === "__none__" ? "" : v, variety: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {GRAIN_COMMODITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Quantity (tonnes) <span style={{ color: "#ef4444" }}>*</span></Label><Input type="number" step="0.001" min="0" value={adjForm.quantityTonnes} onChange={e => setAdjForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Variety</Label>
              <VarietySelect commodity={adjForm.commodity} value={adjForm.variety ?? ""} onChange={v => setAdjForm((f: any) => ({ ...f, variety: v }))} />
            </div>
            <div><Label>Bin / Store</Label><BinSelect farmId={farmId} value={adjForm.binId} onChange={id => setAdjForm((f: any) => ({ ...f, binId: id }))} /></div>
            <div>
              <Label>Performed By</Label>
              <StaffSelect farmId={farmId} value={adjForm.performedBy} onChange={v => setAdjForm((f: any) => ({ ...f, performedBy: v }))} />
            </div>
            <div><Label>Notes / Reason <span style={{ color: "#ef4444" }}>*</span></Label><Textarea rows={2} value={adjForm.notes} onChange={e => setAdjForm((f: any) => ({ ...f, notes: e.target.value }))} placeholder="Reason for adjustment..." /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button>
            <Button onClick={() => adjMut.mutate(adjForm)} disabled={!adjForm.commodity || !adjForm.quantityTonnes || !adjForm.notes || adjMut.isPending}>
              {adjMut.isPending ? "Saving…" : "Record Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page Shell ──────────────────────────────────────────────────────────────
export default function CropStockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("stock");

  return (
    <AppLayout title="Crop Stock">
      <TabBar>
        <TabButton active={tab === "stock"} onClick={() => setTab("stock")}><Wheat size={14} className="mr-1" />Stock Levels</TabButton>
        <TabButton active={tab === "movements"} onClick={() => setTab("movements")}><ArrowLeftRight size={14} className="mr-1" />Movement Log</TabButton>
      </TabBar>
      <div style={{ marginTop: 20 }}>
        {farmId && tab === "stock" && <StockLevelsTab farmId={farmId} />}
        {farmId && tab === "movements" && <MovementsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
