import { b as useAppStore, r as reactExports, j as jsxRuntimeExports, a as useToast, t as useQueryClient, l as useQuery, O as useMutation, c as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, d as LoaderCircle, T as FlaskConical, ay as Check } from "./index-R4XICohc.js";
import { A as AppLayout, a as Wheat, c as ClipboardList } from "./AppLayout-p836YkSR.js";
import { T as Textarea } from "./textarea-COanlBw4.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-8zr33rK0.js";
import { C as Command, a as CommandInput, b as CommandList, c as CommandEmpty, d as CommandGroup, e as CommandItem } from "./command-tHJXvINa.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-FCcRri9L.js";
import { B as Badge } from "./badge-B-nhOm9J.js";
import { T as TabBar, a as TabButton } from "./tab-button-C_p-Tjj3.js";
import { b as buildProReport, o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { A as ArrowLeftRight } from "./arrow-left-right-3vquYIE4.js";
import { P as Printer } from "./printer-Nl0FSCcI.js";
import { a as ArrowDown, A as ArrowUp } from "./arrow-up-BKt2v6ky.js";
import { S as ShieldAlert, D as Droplets } from "./shield-alert-DLMzHCQQ.js";
import { S as ShieldCheck } from "./shield-check-CjTpMlqB.js";
import { D as Database } from "./database-Dj8SDLcA.js";
import { H as History } from "./history-XSlih-DS.js";
import { P as Pencil } from "./pencil-7kPRrtTL.js";
import { T as Trash2 } from "./trash-2-CW0p5gY-.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-D3GcBvu3.js";
import "./use-safe-clerk-9Diu1NTz.js";
import "./triangle-alert-DoYQtXrW.js";
import "./tractor-DsJv_0QH.js";
import "./index-BTvjRpbJ.js";
import "./index-DYWzTIYo.js";
import "./chevron-up-BUruL3pK.js";
import "./search-BZ_TeQF1.js";
const GRAIN_STORE_PRODUCTS = [
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
  { name: "Detaclean", activeIngredient: "Pyrethrin + Permethrin", defaultDilution: "As per product label", category: "Insecticide spray" }
];
function ProductCombobox({ value, onChange, onProductSelect, disabled }) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const matched = GRAIN_STORE_PRODUCTS.find((p) => p.name.toLowerCase() === value.toLowerCase()) ?? null;
  function handleSelect(productName) {
    const product = GRAIN_STORE_PRODUCTS.find((p) => p.name === productName) ?? null;
    onChange(productName);
    onProductSelect(product);
    setOpen(false);
    setQuery("");
  }
  function handleQueryChange(q) {
    setQuery(q);
    onChange(q);
    if (!GRAIN_STORE_PRODUCTS.find((p) => p.name.toLowerCase() === q.toLowerCase())) {
      onProductSelect(null);
    }
  }
  const filtered = query.trim() ? GRAIN_STORE_PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.activeIngredient.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())
  ) : GRAIN_STORE_PRODUCTS;
  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: open && !disabled, onOpenChange: (o) => {
      if (!disabled) setOpen(o);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          role: "combobox",
          "aria-expanded": open,
          disabled,
          className: "w-full justify-between font-normal text-left h-9 px-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `truncate ${!value ? "text-muted-foreground" : ""}`, children: value || "Search or type product name…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[420px] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { shouldFilter: false, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CommandInput,
          {
            placeholder: "Search by product name or active ingredient…",
            value: query,
            onValueChange: handleQueryChange
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "max-h-64", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 px-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-foreground mb-0.5", children: [
              '"',
              query,
              '" not in list'
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Press Enter or click below to use this as a custom product name." }),
            query && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "mt-2 h-7 text-xs", onClick: () => handleSelect(query), children: [
              'Use "',
              query,
              '"'
            ] })
          ] }) }),
          Object.entries(grouped).map(([category, products]) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: category, children: products.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            CommandItem,
            {
              value: product.name,
              onSelect: () => handleSelect(product.name),
              className: "flex items-start gap-2 py-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: `mt-0.5 h-3.5 w-3.5 shrink-0 ${value === product.name ? "opacity-100" : "opacity-0"}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm leading-tight", children: product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-tight", children: product.activeIngredient })
                ] })
              ]
            },
            product.name
          )) }, category))
        ] })
      ] }) })
    ] }),
    matched && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5 rounded-md bg-blue-50 border border-blue-100 px-2.5 py-1.5 text-xs text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3 mt-0.5 shrink-0 text-blue-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: matched.activeIngredient }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-600", children: [
          " · ",
          matched.category
        ] }),
        matched.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-600 mt-0.5", children: matched.notes })
      ] })
    ] })
  ] });
}
const GRAIN_COMMODITIES = [
  "Winter Wheat",
  "Spring Wheat",
  "Winter Barley",
  "Spring Barley",
  "Malting Barley",
  "Winter Oats",
  "Spring Oats",
  "Oilseed Rape",
  "Winter Beans",
  "Spring Beans",
  "Peas",
  "Maize",
  "Rye",
  "Triticale",
  "Linseed",
  "Other"
];
const VARIETY_MAP = {
  "Winter Wheat": [
    "Zyatt",
    "Gleam",
    "Extase",
    "Dawsum",
    "Elevation",
    "Skyscraper",
    "Skyfall",
    "Insitor",
    "Barrel",
    "Gravity",
    "LG Spotlight",
    "RGT Saki",
    "Kerrin",
    "Graham",
    "Theodore",
    "Crusoe",
    "Grafton",
    "Siskin",
    "Mulika",
    "KWS Zyatt",
    "KWS Cranium",
    "KWS Kinetic",
    "Bennington",
    "Illustrious",
    "Costello",
    "Paladin",
    "Other"
  ],
  "Spring Wheat": [
    "Mulika",
    "Tybalt",
    "Paragon",
    "Camelot",
    "Cochise",
    "Moxie",
    "Tabasco",
    "KWS Alderon",
    "Warden",
    "Other"
  ],
  "Winter Barley": [
    "SY Kingsbarn",
    "Volume",
    "Funky",
    "SY Venture",
    "Bazooka",
    "Orwell",
    "Cassata",
    "Glacier",
    "Craft",
    "Esterel",
    "Sequel",
    "KWS Meridian",
    "Shuffle",
    "Saffron",
    "Flagon",
    "Other"
  ],
  "Spring Barley": [
    "Laureate",
    "Planet",
    "KWS Irina",
    "Propino",
    "Concerto",
    "Diablo",
    "RGT Asteroid",
    "Electrum",
    "Overture",
    "Prestige",
    "Sassy",
    "KWS Cassia",
    "Odyssey",
    "Other"
  ],
  "Malting Barley": [
    "Laureate",
    "Propino",
    "Concerto",
    "Diablo",
    "RGT Asteroid",
    "Electrum",
    "Overture",
    "Prestige",
    "KWS Irina",
    "Sassy",
    "KWS Cassia",
    "Other"
  ],
  "Winter Oats": [
    "Mascani",
    "Boglarka",
    "Balado",
    "Husky",
    "Torino",
    "Canyon",
    "Dalguise",
    "Gerald",
    "Barra",
    "Other"
  ],
  "Spring Oats": [
    "Dancer",
    "Firth",
    "Steele",
    "Grafham",
    "Elyann",
    "Canyon",
    "Husky",
    "Other"
  ],
  "Oilseed Rape": [
    "Acacia",
    "Architect",
    "Aspire",
    "Aurelia",
    "Br11/0250",
    "CIQ Atlass",
    "DK Exstorm",
    "DK Exceptional",
    "DK Explosion",
    "Elgar",
    "ES Asteroid",
    "ES Ely",
    "ES Senator",
    "Genie",
    "Harnas",
    "Heros",
    "Hornet",
    "Incentive",
    "Inspiration",
    "Ionic",
    "Jet Set",
    "Kielder",
    "Limosa",
    "Mansion",
    "Mercedes",
    "Oksana",
    "Palazzo",
    "PT273",
    "Quartz",
    "Rohan",
    "Shooter",
    "SY Alister",
    "Templar",
    "Tribute",
    "Trooper",
    "Verona",
    "Viridian",
    "Other"
  ],
  "Winter Beans": [
    "Fuego",
    "Wizard",
    "Boxer",
    "Lynx",
    "Lynx Plus",
    "Vertigo",
    "Athena",
    "Other"
  ],
  "Spring Beans": [
    "Boxer",
    "Lynx",
    "Lynx Plus",
    "Fuego",
    "Tundra",
    "Fanfare",
    "Maris Bead",
    "Sutton",
    "Other"
  ],
  "Peas": [
    "Astro",
    "Arvica",
    "Classic",
    "Dovilio",
    "Enduro",
    "Grafila",
    "Iceberg",
    "Julia",
    "Kabuki",
    "Karito",
    "Kestrel",
    "Lagonda",
    "Livioletta",
    "Mascara",
    "Navarro",
    "Nimbus",
    "Orla",
    "Patrol",
    "Prophet",
    "Reward",
    "Serge",
    "Silky",
    "Solara",
    "Tyne",
    "Viscount",
    "Other"
  ],
  "Maize": ["LG30222", "DKC3939", "SY Telius", "P8400", "Absalon", "LGYM18", "Other"],
  "Rye": ["Balistic", "Dukato", "Guttino", "Conduct", "Visello", "Other"],
  "Triticale": ["Agostino", "Amarillo", "Dublet", "Grenado", "Kasyno", "Purdy", "Other"],
  "Linseed": ["Duchess", "Gleam", "Antares", "Ariane", "Liral Gold", "Other"],
  "Other": ["Other"]
};
const MOVEMENT_TYPES = [
  { value: "harvest_in", label: "Harvest In", direction: "in" },
  { value: "dispatch_out", label: "Dispatch Out", direction: "out" },
  { value: "transfer_in", label: "Transfer In", direction: "in" },
  { value: "transfer_out", label: "Transfer Out", direction: "out" },
  { value: "sample_out", label: "Sample Out", direction: "out" },
  { value: "drying_loss", label: "Drying Loss", direction: "out" },
  { value: "adjustment", label: "Manual Adjustment", direction: "in" }
];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
function deriveCropYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const yr = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${yr} Harvest`;
}
const todayISO = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function BinSelect({ farmId, value, onChange, placeholder }) {
  const q = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => Array.isArray(d) ? d : d.rows ?? d.records ?? []
  });
  const bins = q.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value ? String(value) : "__none__", onValueChange: (v) => {
    if (v === "__none__") {
      onChange(null, "");
      return;
    }
    const bin = bins.find((b) => String(b.id) === v);
    onChange(bin?.id ?? null, bin?.binName ?? "");
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: placeholder ?? "Select bin / store..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None (no specific bin) —" }),
      bins.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(b.id), children: [
        b.binName,
        b.binType ? ` (${b.binType})` : ""
      ] }, b.id))
    ] })
  ] });
}
function VarietySelect({ commodity, value, onChange }) {
  const varieties = VARIETY_MAP[commodity] ?? [];
  if (varieties.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Variety", value, onChange: (e) => onChange(e.target.value) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "__none__", onValueChange: (v) => onChange(v === "__none__" ? "" : v), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select variety..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select variety —" }),
      varieties.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v))
    ] })
  ] });
}
function StaffSelect({ farmId, value, onChange, placeholder }) {
  const q = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.members ?? []
  });
  const members = q.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "__none__", onValueChange: (v) => onChange(v === "__none__" ? "" : v), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: placeholder ?? "Select staff member..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
      members.map((m) => {
        const name = `${m.firstName} ${m.lastName}`.trim();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: name, children: [
          name,
          m.jobTitle ? ` (${m.jobTitle})` : ""
        ] }, m.id);
      })
    ] })
  ] });
}
function DirectionIcon({ dir }) {
  if (dir === "in") return /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { size: 14, style: { color: "#16a34a" } });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { size: 14, style: { color: "#dc2626" } });
}
function MovementHistoryModal({ parcel, movements, onClose }) {
  const movTypeLabel = (t) => MOVEMENT_TYPES.find((m) => m.value === t)?.label ?? t;
  const sorted = [...movements].sort((a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime());
  let bal = 0;
  const withBalance = sorted.map((m) => {
    const qty = parseFloat(m.quantityTonnes ?? "0");
    bal += m.direction === "in" ? qty : -qty;
    return { ...m, runningBalance: bal };
  }).reverse();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 720 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { fontSize: "1rem" }, children: [
      "Movement History — ",
      parcel.commodity,
      parcel.variety ? ` / ${parcel.variety}` : "",
      parcel.cropYear ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 6, fontSize: "0.75rem", color: "#6b7280", fontWeight: 400 }, children: [
        "(",
        parcel.cropYear,
        ")"
      ] }) : null
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, fontSize: "0.8rem", color: "#6b7280", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#374151" }, children: "Bin:" }),
        " ",
        parcel.binName ?? "Unassigned"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#374151" }, children: "Current balance:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#16a34a", fontWeight: 700 }, children: [
          parseFloat(parcel.quantityTonnes ?? "0").toFixed(3),
          " t"
        ] })
      ] })
    ] }),
    movements.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "2rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 28, style: { margin: "0 auto 8px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "No movements recorded for this parcel yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto", maxHeight: 380, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { position: "sticky", top: 0, zIndex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }, children: ["Date", "Type", "Movement", "Running Balance", "Performed By", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.7rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: withBalance.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < withBalance.length - 1 ? "1px solid #f3f4f6" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(m.movedAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { fontSize: "0.65rem", background: m.direction === "in" ? "#dcfce7" : "#fee2e2", color: m.direction === "in" ? "#166534" : "#991b1b", border: "none" }, children: movTypeLabel(m.movementType) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 700, color: m.direction === "in" ? "#16a34a" : "#dc2626" }, children: [
          m.direction === "in" ? "+" : "−",
          parseFloat(m.quantityTonnes ?? "0").toFixed(3),
          " t"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 600, color: "#374151" }, children: [
          m.runningBalance.toFixed(3),
          " t"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: m.performedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.notes || "—" })
      ] }, m.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { style: { marginTop: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })
  ] }) });
}
const CLEAN_TYPE_LABELS = {
  full_clean_and_treat: "Full Clean + Treatment",
  physical_clean: "Physical Clean",
  insecticide_treatment: "Insecticide Treatment",
  fumigation: "Fumigation",
  inspection_only: "Inspection Only"
};
const CLEAN_TYPE_COLORS = {
  full_clean_and_treat: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  physical_clean: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
  insecticide_treatment: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  fumigation: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  inspection_only: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" }
};
function CleanHistoryDialog({ farmId, bin, onClose }) {
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["clean-history", farmId, bin.id],
    queryFn: () => fetch(`/api/farms/${farmId}/cleaning?locationId=${bin.id}`).then((r) => r.json()),
    staleTime: 3e4
  });
  const records = data?.records ?? [];
  const filtered = reactExports.useMemo(() => {
    if (yearFilter === "all") return records;
    return records.filter((r) => r.cleanedDate && new Date(r.cleanedDate).getFullYear() === yearFilter);
  }, [records, yearFilter]);
  function handlePrint() {
    const rows = filtered.map((r) => {
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
      <p class="sub">Store: <strong>${bin.binName}</strong>${yearFilter !== "all" ? ` &nbsp;·&nbsp; Year: <strong>${yearFilter}</strong>` : ""} &nbsp;·&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
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
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (open) => {
    if (!open) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-green-700" }),
      "Cleaning History — ",
      bin.binName
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setYearFilter(y),
          style: {
            padding: "3px 12px",
            borderRadius: 99,
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb",
            background: yearFilter === y ? "#f0fdf4" : "#fff",
            color: yearFilter === y ? "#15803d" : "#6b7280"
          },
          children: y === "all" ? "All years" : y
        },
        y
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " record",
        filtered.length !== 1 ? "s" : "",
        yearFilter !== "all" ? ` in ${yearFilter}` : " total"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-12 text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
      " Loading records…"
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-muted-foreground gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-9 h-9 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
        "No cleaning records found",
        yearFilter !== "all" ? ` for ${yearFilter}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
        "Use the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Log Clean" }),
        " button on the bin to add the first record."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: filtered.map((r) => {
      const date = r.cleanedDate ? new Date(r.cleanedDate) : null;
      const typeColor = CLEAN_TYPE_COLORS[r.cleaningType] ?? CLEAN_TYPE_COLORS.inspection_only;
      const knownProduct = r.productsUsed ? GRAIN_STORE_PRODUCTS.find((p) => p.name.toLowerCase() === r.productsUsed.toLowerCase()) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 w-24 text-right", children: date ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 leading-tight", children: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: date.getFullYear() })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: typeColor.bg, color: typeColor.text, border: `1px solid ${typeColor.border}` }, children: CLEAN_TYPE_LABELS[r.cleaningType] ?? r.cleaningType }),
            r.cleanedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "by ",
              r.cleanedBy
            ] })
          ] }),
          r.productsUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3 mt-0.5 shrink-0 text-blue-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-700 leading-snug", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.productsUsed }),
              knownProduct && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-1.5", children: [
                "(",
                knownProduct.activeIngredient,
                ")"
              ] })
            ] })
          ] }),
          r.dilutionRate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-3 h-3 text-blue-300 shrink-0" }),
            r.dilutionRate
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic leading-snug", children: r.notes })
        ] })
      ] }) }, r.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "border-t pt-3 flex-row items-center gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex-1", children: [
        "Red Tractor: retain cleaning records for a minimum of ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 years" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function LogCleanDialog({ farmId, bin, onClose, onSaved }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [form, setForm] = reactExports.useState({
    cleaningType: "full_clean_and_treat",
    productsUsed: "",
    dilutionRate: "",
    cleanedBy: "",
    cleanedDate: today,
    notes: ""
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
        notes: form.notes || null
      })
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bin-cleaning-status", farmId, bin.id] });
      toast({ title: "Cleaning record saved", description: `${bin.binName} marked as cleaned.` });
      onSaved();
    },
    onError: () => toast({ title: "Failed to save cleaning record", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-4 h-4 text-blue-600" }),
      "Log Store Clean — ",
      bin.binName
    ] }) }) }),
    (() => {
      const noChemicals = form.cleaningType === "physical_clean" || form.cleaningType === "inspection_only";
      const isFumigation = form.cleaningType === "fumigation";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Cleaning Type ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.cleaningType, onValueChange: (v) => setForm((f) => ({ ...f, cleaningType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full_clean_and_treat", children: "Full clean + insecticide treatment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "physical_clean", children: "Physical clean only (sweep / vacuum)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "insecticide_treatment", children: "Insecticide treatment only" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fumigation", children: "Fumigation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inspection_only", children: "Inspection — no treatment required" })
            ] })
          ] })
        ] }),
        noChemicals ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-500 italic", children: "No chemical product required for this cleaning type." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Product Used",
              isFumigation ? " (Fumigant)" : " (Insecticide / Treatment)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ProductCombobox,
              {
                value: form.productsUsed,
                onChange: (v) => setForm((f) => ({ ...f, productsUsed: v })),
                onProductSelect: (product) => {
                  if (product) setForm((f) => ({ ...f, dilutionRate: product.defaultDilution }));
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Rate / Dilution" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. 15 ml in 5 L water per 100 m²",
                value: form.dilutionRate,
                onChange: (e) => setForm((f) => ({ ...f, dilutionRate: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Auto-filled from product selection — always verify against the product label." })
          ] }),
          isFumigation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠ Fumigation:" }),
            " Must be carried out by a BASIS/CoC certificated contractor. Ensure the store is sealed and all personnel are clear before treatment."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cleaned By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name", value: form.cleanedBy, onChange: (e) => setForm((f) => ({ ...f, cleanedBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date Cleaned ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.cleanedDate, onChange: (e) => setForm((f) => ({ ...f, cleanedDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Any additional observations or actions taken…", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#0369a1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor:" }),
          " Stores must be cleaned and treated with an approved grain store insecticide before each new fill. Keep this record for a minimum of 3 years."
        ] })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => mut.mutate(),
          disabled: !form.cleanedDate || mut.isPending,
          style: { background: "#2563eb", color: "#fff" },
          children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
            "Saving…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 mr-1.5" }),
            "Save Cleaning Record"
          ] })
        }
      )
    ] })
  ] }) });
}
function BinCard({ bin, farmId, parcels, allMovements, onEdit, onDelete, onHarvestIn }) {
  const [historyParcel, setHistoryParcel] = reactExports.useState(null);
  const [logCleanOpen, setLogCleanOpen] = reactExports.useState(false);
  const [cleanHistoryOpen, setCleanHistoryOpen] = reactExports.useState(false);
  const { data: cleaningStatus } = useQuery({
    queryKey: ["bin-cleaning-status", farmId, bin.id],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins/${bin.id}/cleaning-status`).then((r) => r.json()),
    enabled: !!farmId && !!bin.id,
    staleTime: 6e4
  });
  const lastCleaned = cleaningStatus?.lastCleaning?.cleanedDate ? new Date(cleaningStatus.lastCleaning.cleanedDate) : null;
  const daysSinceCleaning = lastCleaned ? Math.floor((Date.now() - lastCleaned.getTime()) / (1e3 * 60 * 60 * 24)) : null;
  const cleaningBadgeColor = daysSinceCleaning === null ? "#9ca3af" : daysSinceCleaning <= 30 ? "#15803d" : daysSinceCleaning <= 60 ? "#b45309" : "#dc2626";
  const binTotal = parcels.reduce((s, p) => s + parseFloat(p.quantityTonnes ?? "0"), 0);
  const cap = parseFloat(bin.capacityTonnes ?? "0");
  const available = cap > 0 ? Math.max(0, cap - binTotal) : null;
  const fillPct = cap > 0 ? Math.min(100, binTotal / cap * 100) : 0;
  const fillColor = fillPct >= 90 ? "#dc2626" : fillPct >= 70 ? "#f59e0b" : "#16a34a";
  const availColor = fillPct >= 90 ? "#dc2626" : fillPct >= 70 ? "#b45309" : "#15803d";
  const parcelMovements = (p) => allMovements.filter((m) => m.binId === bin.id && m.commodity === p.commodity && (m.variety ?? "") === (p.variety ?? ""));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 16, overflow: "hidden", background: "#fff" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { size: 15, style: { color: "#6b7280" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: bin.binName }),
        bin.binType && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { fontSize: "0.65rem", background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", textTransform: "capitalize" }, children: bin.binType.replace(/_/g, " ") }),
        bin.id > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            title: lastCleaned ? `Last cleaned ${lastCleaned.toLocaleDateString("en-GB")} (${daysSinceCleaning} days ago)` : "No cleaning record logged for this store",
            style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.65rem", fontWeight: 600, padding: "2px 7px", borderRadius: 99, border: `1px solid ${cleaningBadgeColor}20`, background: `${cleaningBadgeColor}12`, color: cleaningBadgeColor, cursor: "default" },
            children: daysSinceCleaning === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 9 }),
              "No clean record"
            ] }) : daysSinceCleaning <= 30 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 9 }),
              "Cleaned ",
              daysSinceCleaning,
              "d ago"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 9 }),
              "Cleaned ",
              daysSinceCleaning,
              "d ago"
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.9rem", fontWeight: 700, color: "#111827", lineHeight: 1.3 }, children: [
            binTotal.toFixed(1),
            " t stored",
            cap > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#9ca3af", fontWeight: 400 }, children: [
              " / ",
              cap.toFixed(0),
              " t cap"
            ] })
          ] }),
          available !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", fontWeight: 700, color: availColor, lineHeight: 1.2 }, children: [
            available.toFixed(1),
            " t available"
          ] })
        ] }),
        bin.id > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setCleanHistoryOpen(true),
              title: "View cleaning history for this store",
              style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 12 }),
                "Clean History"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setLogCleanOpen(true),
              title: "Log a cleaning record for this store",
              style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 12 }),
                "Log Clean"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onHarvestIn(bin.id),
            title: "Record harvest into this bin",
            style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { size: 12 }),
              "Harvest In"
            ]
          }
        )
      ] })
    ] }),
    cap > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.5rem 1rem 0.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 7, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${fillPct}%`, background: fillColor, borderRadius: 4, transition: "width 0.6s ease" } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", color: "#9ca3af" }, children: [
          fillPct.toFixed(0),
          "% full"
        ] }),
        available !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", fontWeight: 600, color: availColor }, children: [
          available.toFixed(1),
          " t remaining"
        ] })
      ] })
    ] }),
    parcels.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "1.5rem", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }, children: "No stock currently in this bin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#fafafa", borderTop: "1px solid #f3f4f6" }, children: ["Commodity", "Variety", "Crop Year", "Live Quantity", "Last Updated", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.45rem 1rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: parcels.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem", fontWeight: 600, color: "#111827" }, children: p.commodity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem", color: "#374151" }, children: p.variety || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem" }, children: p.cropYear ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { fontSize: "0.65rem", background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }, children: p.cropYear }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, color: parseFloat(p.quantityTonnes) > 0 ? "#16a34a" : "#dc2626", fontSize: "0.95rem" }, children: [
          parseFloat(p.quantityTonnes ?? "0").toFixed(3),
          " t"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem", color: "#9ca3af", fontSize: "0.8rem" }, children: fmt(p.lastUpdated) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "View movement history", onClick: () => setHistoryParcel({ ...p, binName: bin.binName }), style: { background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Edit stock record", onClick: () => onEdit(p), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Delete stock record", onClick: () => onDelete(p.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4, borderRadius: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] }) })
      ] }, p.id)) })
    ] }),
    historyParcel && /* @__PURE__ */ jsxRuntimeExports.jsx(
      MovementHistoryModal,
      {
        parcel: historyParcel,
        movements: parcelMovements(historyParcel),
        onClose: () => setHistoryParcel(null)
      }
    ),
    cleanHistoryOpen && bin.id > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CleanHistoryDialog,
      {
        farmId,
        bin,
        onClose: () => setCleanHistoryOpen(false)
      }
    ),
    logCleanOpen && bin.id > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LogCleanDialog,
      {
        farmId,
        bin,
        onClose: () => setLogCleanOpen(false),
        onSaved: () => {
          setLogCleanOpen(false);
        }
      }
    )
  ] });
}
function StockLevelsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRow, setEditRow] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [harvestOpen, setHarvestOpen] = reactExports.useState(false);
  const [harvestBinId, setHarvestBinId] = reactExports.useState(null);
  const emptyLevel = { binId: null, commodity: "", variety: "", quantityTonnes: "", notes: "" };
  const emptyHarvest = { binId: null, commodity: "", variety: "", harvestDate: todayISO(), quantityTonnes: "", performedBy: "", notes: "" };
  const [levelForm, setLevelForm] = reactExports.useState(emptyLevel);
  const [harvestForm, setHarvestForm] = reactExports.useState(emptyHarvest);
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => Array.isArray(d) ? d : d.rows ?? d.records ?? []
  });
  const bins = binsQ.data ?? [];
  const q = useQuery({
    queryKey: ["crop-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-levels`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const movQ = useQuery({
    queryKey: ["crop-stock-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-movements`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const saveLevelMut = useMutation({
    mutationFn: (body) => editRow ? fetch(`/api/farms/${farmId}/crop-stock-levels/${editRow.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) : fetch(`/api/farms/${farmId}/crop-stock-levels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: editRow ? "Stock record updated" : "Stock record created" });
      qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] });
      setAddOpen(false);
      setEditRow(null);
      setLevelForm(emptyLevel);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteLevelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/crop-stock-levels/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const harvestMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Harvest-in recorded — stock level updated" });
      qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] });
      qc.invalidateQueries({ queryKey: ["crop-stock-movements", farmId] });
      setHarvestOpen(false);
      setHarvestForm(emptyHarvest);
    },
    onError: () => toast({ title: "Failed to record harvest", variant: "destructive" })
  });
  const derivedCropYear = reactExports.useMemo(() => deriveCropYear(harvestForm.harvestDate), [harvestForm.harvestDate]);
  const records = q.data ?? [];
  const allMovements = movQ.data ?? [];
  const totalTonnes = records.reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);
  const byCommodity = reactExports.useMemo(() => {
    const m = {};
    for (const r of records) {
      const qty = parseFloat(r.quantityTonnes ?? "0");
      if (!m[r.commodity]) m[r.commodity] = { total: 0, varieties: [] };
      m[r.commodity].total += qty;
      const existing = m[r.commodity].varieties.find((v) => v.variety === (r.variety ?? "—") && v.cropYear === (r.cropYear ?? "—"));
      if (existing) existing.tonnes += qty;
      else m[r.commodity].varieties.push({ variety: r.variety ?? "—", tonnes: qty, cropYear: r.cropYear ?? "—" });
    }
    return Object.entries(m).sort((a, b) => b[1].total - a[1].total).map(([commodity, data]) => ({
      commodity,
      total: data.total,
      varieties: data.varieties.sort((a, b) => b.tonnes - a.tonnes)
    }));
  }, [records]);
  const byBin = reactExports.useMemo(() => {
    const m = {};
    for (const r of records) {
      const k = r.binId ?? 0;
      if (!m[k]) m[k] = [];
      m[k].push(r);
    }
    return m;
  }, [records]);
  const binOccupancyMap = reactExports.useMemo(() => {
    const m = {};
    for (const r of records) if (r.binId) m[r.binId] = r;
    return m;
  }, [records]);
  const openHarvestForBin = (binId) => {
    setHarvestBinId(binId);
    const existing = binOccupancyMap[binId];
    setHarvestForm({ ...emptyHarvest, binId, commodity: existing?.commodity ?? "", variety: existing?.variety ?? "" });
    setHarvestOpen(true);
  };
  const harvestExistingParcel = harvestForm.binId ? binOccupancyMap[harvestForm.binId] : null;
  const harvestCommodityConflict = !!(harvestExistingParcel && harvestForm.commodity && (harvestExistingParcel.commodity !== harvestForm.commodity || (harvestExistingParcel.variety ?? "") !== (harvestForm.variety ?? "")));
  const harvestCropYearConflict = !!(harvestExistingParcel && derivedCropYear && harvestExistingParcel.cropYear && harvestExistingParcel.cropYear !== derivedCropYear && !harvestCommodityConflict);
  const harvestHasConflict = harvestCommodityConflict || harvestCropYearConflict;
  const harvestBinIsEmpty = !!harvestForm.binId && !binOccupancyMap[harvestForm.binId];
  const { data: harvestCleanStatus } = useQuery({
    queryKey: ["bin-cleaning-status", farmId, harvestForm.binId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins/${harvestForm.binId}/cleaning-status`).then((r) => r.json()),
    enabled: harvestOpen && !!harvestForm.binId && harvestBinIsEmpty,
    staleTime: 3e4
  });
  const harvestCleaningWarning = harvestBinIsEmpty && harvestCleanStatus?.requiresCleaningLog === true;
  const harvestCleaningOk = harvestBinIsEmpty && harvestCleanStatus && !harvestCleanStatus.requiresCleaningLog;
  const levelExistingParcel = levelForm.binId && !editRow ? binOccupancyMap[levelForm.binId] : null;
  const levelHasConflict = levelExistingParcel && levelForm.commodity && (levelExistingParcel.commodity !== levelForm.commodity || (levelExistingParcel.variety ?? "") !== (levelForm.variety ?? ""));
  const handlePrintStock = () => {
    const fName = farmData?.record?.name ?? "Farm";
    const cph = farmData?.record?.cphNumber ?? void 0;
    const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const binLabel = (binId) => {
      if (!binId) return "Unassigned / Field Heap";
      return bins.find((b) => b.id === binId)?.binName ?? `Bin #${binId}`;
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
          ${records.map((r) => `
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
      footerNote: "Red Tractor requires a clear audit trail of all grain lots — commodity, variety, quantity, and location. Each bin should hold a single lot (one commodity/variety/harvest year). Retain all records for 3 years.",
      landscape: true
    });
    openPrintWindow(html);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.75rem 1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginRight: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.05em" }, children: "Total In Store" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.5rem", fontWeight: 800, color: "#14532d", lineHeight: 1 }, children: [
          totalTonnes.toFixed(1),
          " t"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 1, height: 32, background: "#bbf7d0" } }),
      byCommodity.map(({ commodity, total, varieties }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #d1fae5", borderRadius: 8, padding: "0.4rem 0.75rem", minWidth: 110 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 6, marginBottom: varieties.length > 1 ? 4 : 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", whiteSpace: "nowrap" }, children: commodity }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", fontWeight: 700, color: "#374151", marginLeft: "auto", whiteSpace: "nowrap" }, children: [
            total.toFixed(1),
            " t"
          ] })
        ] }),
        varieties.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 6, borderTop: "1px solid #f0fdf4", paddingTop: 3, marginTop: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }, children: v.variety }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", color: "#9ca3af", whiteSpace: "nowrap" }, children: v.cropYear })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#15803d", marginLeft: "auto", whiteSpace: "nowrap" }, children: [
            v.tonnes.toFixed(1),
            " t"
          ] })
        ] }, `${v.variety}-${v.cropYear}`))
      ] }, commodity)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginLeft: "auto", display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handlePrintStock, disabled: records.length === 0, title: "Print stock register", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 13, className: "mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          setHarvestBinId(null);
          setHarvestForm(emptyHarvest);
          setHarvestOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { size: 13, className: "mr-1", style: { color: "#16a34a" } }),
          "Record Harvest In"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          setEditRow(null);
          setLevelForm(emptyLevel);
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
          "Manual Entry"
        ] })
      ] })
    ] }),
    records.length === 0 && bins.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No crop stock records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: 'Use "Record Harvest In" to initialise grain stock levels.' })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      bins.map((bin) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        BinCard,
        {
          bin,
          farmId,
          parcels: byBin[bin.id] ?? [],
          allMovements,
          onEdit: (p) => {
            setEditRow(p);
            setLevelForm({ ...p });
            setAddOpen(true);
          },
          onDelete: (id) => setDeleteId(id),
          onHarvestIn: openHarvestForBin
        },
        bin.id
      )),
      (byBin[0] ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        BinCard,
        {
          bin: { id: 0, binName: "Unassigned / Field Heap", binType: null, capacityTonnes: null },
          farmId,
          parcels: byBin[0],
          allMovements,
          onEdit: (p) => {
            setEditRow(p);
            setLevelForm({ ...p });
            setAddOpen(true);
          },
          onDelete: (id) => setDeleteId(id),
          onHarvestIn: () => {
            setHarvestBinId(null);
            setHarvestForm(emptyHarvest);
            setHarvestOpen(true);
          }
        },
        0
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: harvestOpen, onOpenChange: (o) => {
      if (!o) setHarvestOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Harvest In" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Records incoming grain and updates the live stock level for the destination bin." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Harvest Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: harvestForm.harvestDate,
                onChange: (e) => setHarvestForm((f) => ({ ...f, harvestDate: e.target.value, variety: "" }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", height: 36, paddingLeft: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", color: derivedCropYear ? "#111827" : "#9ca3af" }, children: derivedCropYear || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }, children: "Derived automatically from harvest date" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Commodity ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: harvestForm.commodity || "__none__",
                onValueChange: (v) => setHarvestForm((f) => ({ ...f, commodity: v === "__none__" ? "" : v, variety: "" })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                    GRAIN_COMMODITIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              VarietySelect,
              {
                commodity: harvestForm.commodity,
                value: harvestForm.variety,
                onChange: (v) => setHarvestForm((f) => ({ ...f, variety: v }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Quantity (tonnes) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", min: "0", value: harvestForm.quantityTonnes, onChange: (e) => setHarvestForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Destination Bin / Store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            BinSelect,
            {
              farmId,
              value: harvestForm.binId,
              onChange: (id) => {
                const existing = id ? binOccupancyMap[id] : null;
                setHarvestForm((f) => ({
                  ...f,
                  binId: id,
                  commodity: existing ? existing.commodity : f.commodity,
                  variety: existing ? existing.variety ?? "" : f.variety
                }));
              },
              placeholder: "Select destination bin or store..."
            }
          ),
          harvestExistingParcel && !harvestHasConflict && (() => {
            const dialogBin = bins.find((b) => b.id === harvestForm.binId);
            const cap = parseFloat(dialogBin?.capacityTonnes ?? "0");
            const stored = parseFloat(harvestExistingParcel.quantityTonnes ?? "0");
            const avail = cap > 0 ? Math.max(0, cap - stored) : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "0.5rem 0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: "0.8rem", color: "#15803d" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Existing lot:" }),
              " ",
              harvestExistingParcel.commodity,
              " / ",
              harvestExistingParcel.variety ?? "—",
              " (",
              harvestExistingParcel.cropYear ?? "—",
              ") — ",
              stored.toFixed(1),
              " t in store",
              avail !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 8, fontWeight: 700 }, children: [
                "· ",
                avail.toFixed(1),
                " t space remaining"
              ] }),
              ". Harvest-in will add to this lot."
            ] });
          })(),
          harvestCommodityConflict && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, fontSize: "0.8rem", color: "#b91c1c" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor conflict — mixed crop:" }),
            " This bin already holds ",
            harvestExistingParcel.commodity,
            " / ",
            harvestExistingParcel.variety ?? "—",
            ". Each registered location must hold one commodity and variety only. Select a different bin, or clear the existing lot first."
          ] }),
          harvestCropYearConflict && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, fontSize: "0.8rem", color: "#b91c1c" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor conflict — harvest year mismatch:" }),
            " This bin holds ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: harvestExistingParcel.cropYear }),
            " grain. The date you have entered produces crop year ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: derivedCropYear }),
            ". Red Tractor requires each registered location to hold one crop year as a discrete traceable lot. Select a different bin, or clear and clean this location before the new harvest is stored."
          ] }),
          harvestCleaningWarning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "0.55rem 0.75rem", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, fontSize: "0.8rem", color: "#92400e", display: "flex", alignItems: "flex-start", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 14, style: { color: "#d97706", flexShrink: 0, marginTop: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cleaning not confirmed for this fill:" }),
              " No cleaning record has been logged since the bin was last emptied. Red Tractor requires stores to be cleaned and treated with an approved insecticide before each new fill. You can still record this harvest — log the clean on the bin card afterwards."
            ] })
          ] }),
          harvestCleaningOk && harvestCleanStatus?.lastCleaning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "0.45rem 0.75rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, fontSize: "0.78rem", color: "#15803d", display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13, style: { color: "#16a34a", flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cleaning confirmed" }),
              " — cleaned ",
              new Date(harvestCleanStatus.lastCleaning.cleanedDate).toLocaleDateString("en-GB"),
              harvestCleanStatus.lastCleaning.cleaningType && ` (${harvestCleanStatus.lastCleaning.cleaningType.replace(/_/g, " ")})`
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { farmId, value: harvestForm.performedBy, onChange: (v) => setHarvestForm((f) => ({ ...f, performedBy: v })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: harvestForm.notes, onChange: (e) => setHarvestForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setHarvestOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            style: { background: "#16a34a", color: "#fff" },
            onClick: () => harvestMut.mutate({
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
              movedAt: harvestForm.harvestDate ? new Date(harvestForm.harvestDate).toISOString() : void 0
            }),
            disabled: !harvestForm.commodity || !harvestForm.quantityTonnes || !harvestForm.harvestDate || !!harvestHasConflict || harvestMut.isPending,
            children: harvestMut.isPending ? "Recording…" : "Record Harvest In"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRow(null);
        setLevelForm(emptyLevel);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRow ? "Edit Stock Record" : "Manual Stock Entry" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: editRow ? "Update the live quantity for this stock record." : "Create a new stock level record directly. Use 'Record Harvest In' to add movements with a full audit trail." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Commodity ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: levelForm.commodity || "__none__", onValueChange: (v) => setLevelForm((f) => ({ ...f, commodity: v === "__none__" ? "" : v, variety: "" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                GRAIN_COMMODITIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VarietySelect, { commodity: levelForm.commodity, value: levelForm.variety ?? "", onChange: (v) => setLevelForm((f) => ({ ...f, variety: v })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Quantity (tonnes) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", min: "0", value: levelForm.quantityTonnes, onChange: (e) => setLevelForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bin / Store Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BinSelect, { farmId, value: levelForm.binId, onChange: (id) => setLevelForm((f) => ({ ...f, binId: id })) }),
          levelHasConflict && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, fontSize: "0.8rem", color: "#b91c1c" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor conflict:" }),
            " This bin already holds ",
            levelExistingParcel.commodity,
            " / ",
            levelExistingParcel.variety ?? "—",
            " (",
            levelExistingParcel.cropYear ?? "—",
            "). Each location must hold one commodity only. Select a different location, or clear the existing lot first."
          ] }),
          levelExistingParcel && !levelHasConflict && levelForm.commodity && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "0.5rem 0.75rem", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 6, fontSize: "0.8rem", color: "#854d0e" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
            " This bin already has a stock record for ",
            levelExistingParcel.commodity,
            " / ",
            levelExistingParcel.variety ?? "—",
            '. Saving will be blocked by the API — use "Record Harvest In" to add tonnage to the existing lot, or delete the existing record first.'
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: levelForm.notes, onChange: (e) => setLevelForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRow(null);
          setLevelForm(emptyLevel);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveLevelMut.mutate(levelForm), disabled: !levelForm.commodity || !levelForm.quantityTonnes || !!levelHasConflict || !!levelExistingParcel || saveLevelMut.isPending, children: saveLevelMut.isPending ? "Saving…" : editRow ? "Save Changes" : "Create Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Stock Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This removes the record. Stock movements are not reversed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteLevelMut.mutate(deleteId), disabled: deleteLevelMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function MovementsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adjOpen, setAdjOpen] = reactExports.useState(false);
  const emptyAdj = { binId: null, commodity: "", variety: "", movementType: "adjustment", direction: "in", quantityTonnes: "", performedBy: "", notes: "" };
  const [adjForm, setAdjForm] = reactExports.useState(emptyAdj);
  const [filterCropYear, setFilterCropYear] = reactExports.useState("__all__");
  const [filterFrom, setFilterFrom] = reactExports.useState("");
  const [filterTo, setFilterTo] = reactExports.useState("");
  const q = useQuery({
    queryKey: ["crop-stock-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-movements`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => Array.isArray(d) ? d : d.rows ?? d.records ?? []
  });
  const bins = binsQ.data ?? [];
  const binName = (id) => bins.find((b) => b.id === id)?.binName ?? "—";
  const adjMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Adjustment recorded" });
      qc.invalidateQueries({ queryKey: ["crop-stock-movements", farmId] });
      qc.invalidateQueries({ queryKey: ["crop-stock-levels", farmId] });
      setAdjOpen(false);
      setAdjForm(emptyAdj);
    },
    onError: () => toast({ title: "Failed", variant: "destructive" })
  });
  const records = q.data ?? [];
  const movTypeLabel = (t) => MOVEMENT_TYPES.find((m) => m.value === t)?.label ?? t;
  const cropYears = reactExports.useMemo(() => {
    const seen = /* @__PURE__ */ new Set();
    records.forEach((r) => {
      if (r.movedAt) seen.add(deriveCropYear(r.movedAt));
    });
    return Array.from(seen).sort().reverse();
  }, [records]);
  const filtered = reactExports.useMemo(() => {
    let result = [...records].sort((a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime());
    if (filterCropYear !== "__all__") {
      result = result.filter((r) => deriveCropYear(r.movedAt) === filterCropYear);
    }
    if (filterFrom) {
      const from = new Date(filterFrom).getTime();
      result = result.filter((r) => r.movedAt && new Date(r.movedAt).getTime() >= from);
    }
    if (filterTo) {
      const to = new Date(filterTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => r.movedAt && new Date(r.movedAt).getTime() <= to.getTime());
    }
    return result;
  }, [records, filterCropYear, filterFrom, filterTo]);
  const hasFilter = filterCropYear !== "__all__" || !!filterFrom || !!filterTo;
  const moveSummary = reactExports.useMemo(() => {
    const totalIn = filtered.filter((r) => r.direction === "in").reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);
    const totalOut = filtered.filter((r) => r.direction === "out").reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);
    const byType = {};
    filtered.forEach((r) => {
      const key = r.commodity ?? "Unknown";
      if (!byType[key]) byType[key] = { in: 0, out: 0 };
      const qty = parseFloat(r.quantityTonnes ?? "0");
      if (r.direction === "in") byType[key].in += qty;
      else byType[key].out += qty;
    });
    const rows = Object.entries(byType).sort((a, b) => b[1].in + b[1].out - (a[1].in + a[1].out));
    return { totalIn, totalOut, net: totalIn - totalOut, rows };
  }, [filtered]);
  const handlePrintMovements = () => {
    const fName = farmData?.record?.name ?? "Farm";
    const cph = farmData?.record?.cphNumber ?? void 0;
    const sorted = [...filtered];
    const filterDesc = filterCropYear !== "__all__" ? `Crop year ${filterCropYear}` : filterFrom || filterTo ? [filterFrom && `From ${new Date(filterFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, filterTo && `To ${new Date(filterTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`].filter(Boolean).join(" — ") : "All movements";
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
          <tbody>${moveSummary.rows.map(([c, v]) => {
      const n = v.in - v.out;
      return `<tr><td style="padding:2px 16px 2px 0;color:#374151;">${c}</td><td style="padding:2px 16px;text-align:right;color:#166534;">${v.in > 0 ? v.in.toFixed(3) : "—"}</td><td style="padding:2px 16px;text-align:right;color:#991b1b;">${v.out > 0 ? v.out.toFixed(3) : "—"}</td><td style="padding:2px 0;text-align:right;font-weight:700;color:${n >= 0 ? "#166534" : "#991b1b"};">${n >= 0 ? "+" : ""}${n.toFixed(3)}</td></tr>`;
    }).join("")}</tbody>
        </table>` : ""}
      </div>` : "";
    const dirBadge = (dir) => dir === "in" ? '<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-size:6px;font-weight:700;">IN</span>' : '<span style="background:#fee2e2;color:#991b1b;padding:1px 5px;border-radius:3px;font-size:6px;font-weight:700;">OUT</span>';
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
          ${sorted.map((m) => `
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
      footerNote: "This is an immutable audit log. All entries are permanent records of grain movements. Red Tractor requires full traceability from harvest through storage to dispatch. Retain for 3 years.",
      landscape: true
    });
    openPrintWindow(html);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280", flex: "1 1 auto" }, children: "Full immutable audit log of all crop stock changes — harvests, dispatches, transfers, and adjustments." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handlePrintMovements, disabled: filtered.length === 0, title: "Print movement audit log", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print Log"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setAdjOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Manual Adjustment"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 14, padding: "10px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Crop Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterCropYear, onValueChange: (v) => {
          setFilterCropYear(v);
          setFilterFrom("");
          setFilterTo("");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 120, height: 32, fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All years" }),
            cropYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "From" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filterFrom,
            onChange: (e) => {
              setFilterFrom(e.target.value);
              setFilterCropYear("__all__");
            },
            style: { height: 32, padding: "0 8px", fontSize: "0.8rem", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", color: "#374151" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filterTo,
            onChange: (e) => {
              setFilterTo(e.target.value);
              setFilterCropYear("__all__");
            },
            style: { height: 32, padding: "0 8px", fontSize: "0.8rem", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", color: "#374151" }
          }
        )
      ] }),
      hasFilter && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 32, alignSelf: "flex-end" }, onClick: () => {
        setFilterCropYear("__all__");
        setFilterFrom("");
        setFilterTo("");
      }, children: "Clear" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { alignSelf: "flex-end", marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af", paddingBottom: 6 }, children: [
        filtered.length,
        " of ",
        records.length,
        " movement",
        records.length !== 1 ? "s" : ""
      ] })
    ] }),
    filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 14 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total IN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: [
            moveSummary.totalIn.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "t" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total OUT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }, children: [
            moveSummary.totalOut.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "t" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: moveSummary.net >= 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${moveSummary.net >= 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "10px 14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: moveSummary.net >= 0 ? "#15803d" : "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Net Movement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: moveSummary.net >= 0 ? "#14532d" : "#7f1d1d", lineHeight: 1, margin: 0 }, children: [
            moveSummary.net >= 0 ? "+" : "",
            moveSummary.net.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "t" })
          ] })
        ] })
      ] }),
      moveSummary.rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "6px 14px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", margin: 0 }, children: "By Commodity" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }, children: "Commodity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#166534", fontSize: "0.7rem" }, children: "IN (t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#991b1b", fontSize: "0.7rem" }, children: "OUT (t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }, children: "NET (t)" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: moveSummary.rows.map(([comm, v]) => {
            const n = v.in - v.out;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f9fafb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", fontWeight: 500 }, children: comm }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", textAlign: "right", color: "#16a34a" }, children: v.in > 0 ? `${v.in.toFixed(3)} t` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", textAlign: "right", color: "#dc2626" }, children: v.out > 0 ? `${v.out.toFixed(3)} t` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 14px", textAlign: "right", fontWeight: 700, color: n >= 0 ? "#16a34a" : "#dc2626" }, children: [
                n >= 0 ? "+" : "",
                n.toFixed(3),
                " t"
              ] })
            ] }, comm);
          }) })
        ] })
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No movements recorded yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Movements are created automatically when dispatches and transfers are confirmed." })
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No movements match your filter" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Try adjusting or clearing the date filter above." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Type", "Dir", "Commodity", "Bin / Store", "Quantity (t)", "Reference", "By", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.movedAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: {
          fontSize: "0.7rem",
          border: "none",
          background: r.movementType === "adjustment" ? "#fef3c7" : r.direction === "in" ? "#dcfce7" : "#fee2e2",
          color: r.movementType === "adjustment" ? "#92400e" : r.direction === "in" ? "#166534" : "#991b1b"
        }, children: movTypeLabel(r.movementType) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionIcon, { dir: r.direction }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500 }, children: r.commodity }),
          r.variety && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: r.variety })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: binName(r.binId) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, color: r.direction === "in" ? "#16a34a" : "#dc2626" }, children: [
          r.direction === "in" ? "+" : "−",
          parseFloat(r.quantityTonnes ?? "0").toFixed(3),
          " t"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }, children: r.referenceType ? `${r.referenceType.replace(/_/g, " ")} #${r.referenceId ?? "—"}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.performedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.notes || "—" })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adjOpen, onOpenChange: (o) => {
      if (!o) setAdjOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manual Stock Adjustment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Use for corrections, dry matter losses, or opening balances. Full audit trail is kept." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Movement Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adjForm.movementType, onValueChange: (v) => {
              const mt = MOVEMENT_TYPES.find((m) => m.value === v);
              setAdjForm((f) => ({ ...f, movementType: v, direction: mt?.direction ?? "in" }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MOVEMENT_TYPES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adjForm.direction, onValueChange: (v) => setAdjForm((f) => ({ ...f, direction: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in", children: "In (increase stock)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "out", children: "Out (decrease stock)" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Commodity ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adjForm.commodity || "__none__", onValueChange: (v) => setAdjForm((f) => ({ ...f, commodity: v === "__none__" ? "" : v, variety: "" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                GRAIN_COMMODITIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Quantity (tonnes) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", min: "0", value: adjForm.quantityTonnes, onChange: (e) => setAdjForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(VarietySelect, { commodity: adjForm.commodity, value: adjForm.variety ?? "", onChange: (v) => setAdjForm((f) => ({ ...f, variety: v })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bin / Store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BinSelect, { farmId, value: adjForm.binId, onChange: (id) => setAdjForm((f) => ({ ...f, binId: id })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Performed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { farmId, value: adjForm.performedBy, onChange: (v) => setAdjForm((f) => ({ ...f, performedBy: v })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Notes / Reason ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: adjForm.notes, onChange: (e) => setAdjForm((f) => ({ ...f, notes: e.target.value })), placeholder: "Reason for adjustment..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAdjOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => adjMut.mutate(adjForm), disabled: !adjForm.commodity || !adjForm.quantityTonnes || !adjForm.notes || adjMut.isPending, children: adjMut.isPending ? "Saving…" : "Record Adjustment" })
      ] })
    ] }) })
  ] });
}
const MEASUREMENT_METHODS = [
  { value: "probe", label: "Probe measurement" },
  { value: "auger_sample", label: "Auger sample" },
  { value: "weighbridge", label: "Weighbridge" },
  { value: "visual_estimate", label: "Visual estimate" }
];
function CropStocktakesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const todayDate = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const emptyStForm = {
    binId: null,
    commodity: "",
    variety: "",
    cropYear: "",
    systemQtyTonnes: "",
    physicalQtyTonnes: "",
    measurementMethod: "probe",
    conductedBy: "",
    stocktakeDate: todayDate(),
    notes: ""
  };
  const [stForm, setStForm] = reactExports.useState(emptyStForm);
  const stocktakesQ = useQuery({
    queryKey: ["crop-stock-stocktakes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-stocktakes`).then((r) => r.json())
  });
  const stRecords = Array.isArray(stocktakesQ.data?.records) ? stocktakesQ.data.records : [];
  const levelsQ = useQuery({
    queryKey: ["crop-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-levels`).then((r) => r.json())
  });
  const levels = Array.isArray(levelsQ.data?.records) ? levelsQ.data.records : [];
  const binOccMap = reactExports.useMemo(() => {
    const m = {};
    for (const l of levels) if (l.binId) m[l.binId] = l;
    return m;
  }, [levels]);
  function handleStBinChange(binId) {
    const lvl = binId ? binOccMap[binId] : null;
    setStForm((f) => ({
      ...f,
      binId,
      commodity: lvl?.commodity ?? "",
      variety: lvl?.variety ?? "",
      cropYear: lvl?.cropYear ?? "",
      systemQtyTonnes: lvl ? String(parseFloat(lvl.quantityTonnes ?? "0").toFixed(3)) : ""
    }));
  }
  const saveMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-stock-stocktakes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Stocktake recorded" });
      qc.invalidateQueries({ queryKey: ["crop-stock-stocktakes", farmId] });
      setOpen(false);
      setStForm(emptyStForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  function handleStSubmit() {
    if (!stForm.physicalQtyTonnes || !stForm.stocktakeDate) {
      toast({ title: "Physical quantity and date are required", variant: "destructive" });
      return;
    }
    saveMut.mutate({
      binId: stForm.binId,
      commodity: stForm.commodity || null,
      variety: stForm.variety || null,
      cropYear: stForm.cropYear || null,
      systemQtyTonnes: stForm.systemQtyTonnes || null,
      physicalQtyTonnes: stForm.physicalQtyTonnes,
      measurementMethod: stForm.measurementMethod,
      conductedBy: stForm.conductedBy || null,
      stocktakeDate: stForm.stocktakeDate,
      notes: stForm.notes || null
    });
  }
  const stBinLabel = (r) => r.binName ?? (r.binId ? `Bin #${r.binId}` : "No bin");
  const fmtT = (v) => v === null || v === void 0 ? "—" : `${parseFloat(v).toFixed(3)} t`;
  function stVarianceBadge(sys, phys) {
    if (!sys || !phys) return null;
    const v = parseFloat(phys) - parseFloat(sys);
    const cls = Math.abs(v) < 1e-3 ? "bg-green-100 text-green-800" : v < 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`, children: [
      v >= 0 ? "+" : "",
      v.toFixed(3),
      " t"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Grain Store Stocktakes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Record physical measurements (probe, weighbridge, etc.) and reconcile against system stock totals." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Record Stocktake"
      ] })
    ] }),
    stocktakesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-gray-400" }) }) : stRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 36, className: "mx-auto mb-3 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No stocktakes recorded yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Use the button above to record your first physical measurement." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Bin / Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Commodity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Crop Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-gray-600", children: "System (t)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-gray-600", children: "Physical (t)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-gray-600", children: "Variance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Conducted By" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: stRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: r.stocktakeDate ? (/* @__PURE__ */ new Date(r.stocktakeDate + "T12:00:00")).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: stBinLabel(r) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5", children: [
          r.commodity ?? "—",
          r.variety ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 ml-1 text-xs", children: [
            "(",
            r.variety,
            ")"
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: r.cropYear ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right font-mono", children: fmtT(r.systemQtyTonnes) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right font-mono", children: fmtT(r.physicalQtyTonnes) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right", children: stVarianceBadge(r.systemQtyTonnes, r.physicalQtyTonnes) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 capitalize", children: r.measurementMethod?.replace(/_/g, " ") ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: r.conductedBy ?? "—" })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setStForm(emptyStForm);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Grain Store Stocktake" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bin / Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BinSelect, { farmId, value: stForm.binId, onChange: handleStBinChange })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commodity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stForm.commodity, onChange: (e) => setStForm((f) => ({ ...f, commodity: e.target.value })), placeholder: "e.g. Winter Wheat" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stForm.variety, onChange: (e) => setStForm((f) => ({ ...f, variety: e.target.value })), placeholder: "e.g. Skyfall" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stForm.cropYear, onChange: (e) => setStForm((f) => ({ ...f, cropYear: e.target.value })), placeholder: "e.g. 2024/25" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stocktake Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stForm.stocktakeDate, onChange: (e) => setStForm((f) => ({ ...f, stocktakeDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "System Quantity (t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: stForm.systemQtyTonnes, onChange: (e) => setStForm((f) => ({ ...f, systemQtyTonnes: e.target.value })), placeholder: "Auto-filled from stock levels" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Physical Quantity (t) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: stForm.physicalQtyTonnes, onChange: (e) => setStForm((f) => ({ ...f, physicalQtyTonnes: e.target.value })), placeholder: "Measured quantity" })
          ] })
        ] }),
        stForm.systemQtyTonnes && stForm.physicalQtyTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-md bg-gray-50 border border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Variance:" }),
          stVarianceBadge(stForm.systemQtyTonnes, stForm.physicalQtyTonnes),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "(physical − system)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Measurement Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stForm.measurementMethod, onValueChange: (v) => setStForm((f) => ({ ...f, measurementMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MEASUREMENT_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conducted By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stForm.conductedBy, onChange: (e) => setStForm((f) => ({ ...f, conductedBy: e.target.value })), placeholder: "Name of person" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: stForm.notes, onChange: (e) => setStForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "e.g. probe depth, sample location, drying rate applied" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setStForm(emptyStForm);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleStSubmit, disabled: saveMut.isPending, children: [
          saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
          "Save Stocktake"
        ] })
      ] })
    ] }) })
  ] });
}
function CropStockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState("stock");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Crop Stock", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "stock", onClick: () => setTab("stock"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 14, className: "mr-1" }),
        "Stock Levels"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "movements", onClick: () => setTab("movements"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 14, className: "mr-1" }),
        "Movement Log"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "stocktakes", onClick: () => setTab("stocktakes"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 14, className: "mr-1" }),
        "Stocktakes"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 20 }, children: [
      farmId && tab === "stock" && /* @__PURE__ */ jsxRuntimeExports.jsx(StockLevelsTab, { farmId }),
      farmId && tab === "movements" && /* @__PURE__ */ jsxRuntimeExports.jsx(MovementsTab, { farmId }),
      farmId && tab === "stocktakes" && /* @__PURE__ */ jsxRuntimeExports.jsx(CropStocktakesTab, { farmId })
    ] })
  ] });
}
export {
  CropStockPage as default
};
