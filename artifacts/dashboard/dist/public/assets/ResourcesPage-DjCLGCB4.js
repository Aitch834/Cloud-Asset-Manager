import { s as createLucideIcon, b as useAppStore, j as jsxRuntimeExports, R as Redirect, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, l as cn, aM as toast, X, T as Plus, n as Card, u as useLocation } from "./index-CDukCNha.js";
import { A as AppLayout, d as Wrench, j as Truck, C as CalendarDays, c as ClipboardList, R as RotateCcw } from "./AppLayout-CcF0mXKK.js";
import { u as usePersistedTab } from "./use-persisted-tab-DkF_8yn6.js";
import { u as useSensors, a as useSensor, D as DndContext, b as DragOverlay, G as GripVertical, P as PointerSensor, c as useDroppable, d as useDraggable } from "./core.esm-BtTL7-Qc.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-Bo5qd4F4.js";
import { T as Tractor, C as ChevronRight } from "./tractor-DBLqaPPG.js";
import { D as Droplets } from "./shield-alert-BdARTvO8.js";
import { P as Package } from "./use-safe-clerk-DFK3tOiq.js";
import { U as User } from "./user-QsVpoikF.js";
import { S as Search } from "./search-DlmD2G34.js";
import { C as ChevronLeft } from "./chevron-left-BrNd5x2m.js";
import { F as FileDown } from "./file-down-Cf1kRUQ5.js";
import { C as CircleAlert, a as Clock } from "./database-CCTTbwNA.js";
import { B as BadgeCheck } from "./badge-check-D6bY0RuC.js";
import { E as ExternalLink } from "./external-link-Dfwa3vp3.js";
import { H as History } from "./history-DojMKb26.js";
import { C as CircleCheck } from "./circle-check-DeOzX17T.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-DJlHKV9g.js";
import { B as BarChart } from "./BarChart-DBa6Utrl.js";
import { C as CartesianGrid } from "./CartesianGrid-BkS4Udbr.js";
import { S as Sparkles } from "./sparkles-Btz6pr52.js";
import { S as SquareCheckBig } from "./square-check-big-CVpzsWmu.js";
import { D as Download } from "./download-CfXxhQ_b.js";
import { C as ChevronDown } from "./trash-2-Cmi2RjiA.js";
import { P as Pencil } from "./pencil-iIMUFqn7.js";
import { A as Archive } from "./archive-ByqW7sNA.js";
import "./triangle-alert-CbSmXkg4.js";
import "./shield-check-SpObG-tw.js";
const __iconNode$4 = [
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M17 14h-6", key: "bkmgh3" }],
  ["path", { d: "M13 18H7", key: "bb0bb7" }],
  ["path", { d: "M7 14h.01", key: "1qa3f1" }],
  ["path", { d: "M17 18h.01", key: "1bdyru" }]
];
const CalendarRange = createLucideIcon("calendar-range", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M10.1 2.182a10 10 0 0 1 3.8 0", key: "5ilxe3" }],
  ["path", { d: "M13.9 21.818a10 10 0 0 1-3.8 0", key: "11zvb9" }],
  ["path", { d: "M17.609 3.721a10 10 0 0 1 2.69 2.7", key: "1iw5b2" }],
  ["path", { d: "M2.182 13.9a10 10 0 0 1 0-3.8", key: "c0bmvh" }],
  ["path", { d: "M20.279 17.609a10 10 0 0 1-2.7 2.69", key: "1ruxm7" }],
  ["path", { d: "M21.818 10.1a10 10 0 0 1 0 3.8", key: "qkgqxc" }],
  ["path", { d: "M3.721 6.391a10 10 0 0 1 2.7-2.69", key: "1mcia2" }],
  ["path", { d: "M6.391 20.279a10 10 0 0 1-2.69-2.7", key: "1fvljs" }]
];
const CircleDashed = createLucideIcon("circle-dashed", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",
      key: "1jaruq"
    }
  ]
];
const Flag = createLucideIcon("flag", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode$1);
const __iconNode = [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
];
const Undo2 = createLucideIcon("undo-2", __iconNode);
const RESOURCE_TYPES = [
  { value: "tractor", label: "Tractor", icon: Tractor },
  { value: "implement", label: "Implement", icon: Wrench },
  { value: "vehicle", label: "Vehicle", icon: Truck },
  { value: "sprayer", label: "Sprayer", icon: Droplets },
  { value: "trailer", label: "Trailer", icon: Package },
  { value: "staff", label: "Staff / Contractor", icon: User },
  { value: "other", label: "Other", icon: Package }
];
const COLOUR_OPTIONS = [
  { value: "slate", label: "Slate", bg: "bg-slate-500" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-500" },
  { value: "blue", label: "Blue", bg: "bg-blue-500" },
  { value: "green", label: "Green", bg: "bg-green-500" },
  { value: "emerald", label: "Emerald", bg: "bg-emerald-500" },
  { value: "amber", label: "Amber", bg: "bg-amber-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-500" },
  { value: "red", label: "Red", bg: "bg-red-500" },
  { value: "purple", label: "Purple", bg: "bg-purple-500" }
];
const DEFAULT_COLOUR = {
  tractor: "green",
  implement: "amber",
  vehicle: "blue",
  sprayer: "indigo",
  trailer: "orange",
  staff: "purple",
  other: "slate"
};
const REQ_TYPE_MAP = [
  { key: "req_tractors", type: "tractor" },
  { key: "req_implements", type: "implement" },
  { key: "req_vehicles", type: "vehicle" },
  { key: "req_sprayers", type: "sprayer" },
  { key: "req_trailers", type: "trailer" },
  { key: "req_staff", type: "staff" },
  { key: "req_other", type: "other" }
];
function getTypeInfo(type) {
  return RESOURCE_TYPES.find((t) => t.value === type) ?? { label: type, icon: Package };
}
function getColourBg(colour) {
  return COLOUR_OPTIONS.find((c) => c.value === colour)?.bg ?? "bg-slate-500";
}
function isoDate(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function weekStart(d) {
  const r = new Date(d);
  const dow = r.getDay();
  r.setDate(r.getDate() - (dow === 0 ? 6 : dow - 1));
  r.setHours(0, 0, 0, 0);
  return r;
}
function ImportPanel({ farmId, onImported }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const [dismissed, setDismissed] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["resources-importable", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/resources/importable`).then((r) => r.json())
  });
  const importMut = useMutation({
    mutationFn: (items) => fetch(`/api/farms/${farmId}/resources/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (result) => {
      const count = result.resources?.length ?? 0;
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      queryClient.invalidateQueries({ queryKey: ["resources-importable", farmId] });
      setSelected(/* @__PURE__ */ new Set());
      onImported();
      toast({ title: `${count} resource${count !== 1 ? "s" : ""} imported` });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  if (dismissed || isLoading) return null;
  const allItems = [...data?.equipment ?? [], ...data?.staff ?? []];
  if (allItems.length === 0) return null;
  const equipItems = data?.equipment ?? [];
  const staffItems = data?.staff ?? [];
  const key = (item) => `${item.sourceType}:${item.sourceId}`;
  function toggleItem(item) {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = key(item);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === allItems.length) {
      setSelected(/* @__PURE__ */ new Set());
    } else {
      setSelected(new Set(allItems.map(key)));
    }
  }
  function handleImport() {
    const toImport = allItems.filter((i) => selected.has(key(i))).map((i) => ({ name: i.name, type: i.resourceType, description: i.description ?? void 0 }));
    if (toImport.length === 0) return;
    importMut.mutate(toImport);
  }
  const allSelected = selected.size === allItems.length && allItems.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-indigo-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-foreground", children: "Import from your farm records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-0.5", children: [
            allItems.length,
            " item",
            allItems.length !== 1 ? "s" : "",
            " found — tick to add as resources."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDismissed(true), className: "w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleAll, className: "flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-3 transition-colors", children: [
      allSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-3.5 h-3.5" }),
      allSelected ? "Deselect all" : "Select all"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      equipItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2", children: "Equipment & Machinery" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: equipItems.map((item) => {
          const k = key(item);
          const isChecked = selected.has(k);
          const { icon: Icon } = getTypeInfo(item.resourceType);
          const colourBg = getColourBg(DEFAULT_COLOUR[item.resourceType] ?? "slate");
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleItem(item), className: cn("flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all", isChecked ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", colourBg + "/10"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-3.5 h-3.5", colourBg.replace("bg-", "text-")) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate", children: item.name }),
              item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 truncate", children: item.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors", isChecked ? "border-indigo-500 bg-indigo-500" : "border-border"), children: isChecked && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-2.5 h-2.5 text-white", viewBox: "0 0 10 8", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 4l3 3 5-6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
          ] }, k);
        }) })
      ] }),
      staffItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2", children: "Staff Members" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: staffItems.map((item) => {
          const k = key(item);
          const isChecked = selected.has(k);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleItem(item), className: cn("flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all", isChecked ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-purple-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate", children: item.name }),
              item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 truncate", children: item.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors", isChecked ? "border-indigo-500 bg-indigo-500" : "border-border"), children: isChecked && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-2.5 h-2.5 text-white", viewBox: "0 0 10 8", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 4l3 3 5-6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
          ] }, k);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4 pt-4 border-t border-indigo-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: selected.size > 0 ? `${selected.size} selected` : "Select items to import" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleImport, disabled: selected.size === 0 || importMut.isPending, className: "flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
        importMut.isPending ? "Importing…" : `Import ${selected.size > 0 ? selected.size : ""} selected`
      ] })
    ] })
  ] }) });
}
function ResourceCard({ resource, onEdit, onArchive, onRestore }) {
  const { icon: Icon, label } = getTypeInfo(resource.type);
  const colourBg = getColourBg(resource.colour);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("group relative flex items-start gap-3 rounded-xl border bg-white p-3.5 transition-all hover:shadow-md", resource.isActive ? "border-border hover:border-border/80" : "border-dashed border-border/50 opacity-60"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-1.5 self-stretch rounded-full flex-shrink-0", colourBg) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", colourBg + "/10"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-4.5 h-4.5", colourBg.replace("bg-", "text-")) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground truncate", children: resource.name }),
        !resource.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-foreground/40 flex-shrink-0", children: "Archived" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-foreground/50 font-medium mt-0.5", children: label }),
      resource.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2", children: resource.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: resource.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onEdit(resource), className: "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-foreground transition-colors", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onArchive(resource.id), className: "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-red-500 transition-colors", title: "Archive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRestore(resource.id), className: "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-green-600 transition-colors", title: "Restore", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }) }) })
  ] });
}
function ResourceForm({ initial, onSave, onCancel, isPending }) {
  const [name, setName] = reactExports.useState(initial?.name ?? "");
  const [type, setType] = reactExports.useState(initial?.type ?? "tractor");
  const [description, setDescription] = reactExports.useState(initial?.description ?? "");
  const [colour, setColour] = reactExports.useState(initial?.colour ?? "slate");
  const [error, setError] = reactExports.useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    onSave({ name: name.trim(), type, description: description.trim(), colour });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 border-indigo-200 bg-indigo-50/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-foreground", children: initial?.id ? "Edit Resource" : "Add Custom Resource" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. John Deere 6R 155", className: "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: type, onChange: (e) => setType(e.target.value), className: "w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8", children: RESOURCE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Colour" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: COLOUR_OPTIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setColour(c.value), className: cn("w-7 h-7 rounded-full transition-all", c.bg, colour === c.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"), title: c.label }, c.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Optional notes (e.g. reg number, serial, spec details)", rows: 2, className: "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isPending, className: "flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors", children: isPending ? "Saving…" : initial?.id ? "Save changes" : "Add resource" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onCancel, className: "text-sm font-semibold py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors", children: "Cancel" })
      ] })
    ] })
  ] });
}
function DraggableResourceChip({ resource, isCommitted }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `res:${resource.id}`,
    data: { resourceId: resource.id, resourceName: resource.name, resourceType: resource.type, resourceColour: resource.colour },
    disabled: isCommitted
  });
  const { icon: Icon } = getTypeInfo(resource.type);
  const colourBg = getColourBg(resource.colour);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: setNodeRef,
      ...listeners,
      ...attributes,
      className: cn(
        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all select-none",
        isCommitted ? "border-border/40 bg-muted/40 opacity-50 cursor-not-allowed" : "border-border bg-white shadow-sm hover:shadow hover:border-indigo-200 cursor-grab",
        isDragging && "opacity-30"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-3 h-3 text-foreground/30 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0", colourBg + "/15"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-3 h-3", colourBg.replace("bg-", "text-")) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground truncate max-w-[120px]", children: resource.name }),
        isCommitted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-foreground/40 flex-shrink-0", children: "busy" })
      ]
    }
  );
}
function RequirementSlot({
  id,
  type,
  filled,
  filledWith,
  onRemove
}) {
  const { setNodeRef: dropRef, isOver } = useDroppable({ id, disabled: filled });
  const { attributes, listeners, setNodeRef: dragRef, isDragging } = useDraggable({
    id: `alloc:${filledWith?.id ?? "none"}`,
    data: { allocationId: filledWith?.id, resourceName: filledWith?.resource_name ?? "", resourceType: filledWith?.resource_type ?? type, resourceColour: filledWith?.resource_colour ?? "", isReturn: true },
    disabled: !filled || !filledWith
  });
  const { icon: Icon } = getTypeInfo(type);
  const colourBg = filled && filledWith ? getColourBg(filledWith.resource_colour) : "bg-slate-400";
  if (filled && filledWith) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: dragRef,
        ...listeners,
        ...attributes,
        className: cn(
          "flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-800 group/slot cursor-grab active:cursor-grabbing",
          isDragging && "opacity-30"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-3 h-3 text-green-600/30 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-3.5 h-3.5 rounded-sm flex items-center justify-center flex-shrink-0", colourBg + "/20"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-2.5 h-2.5", colourBg.replace("bg-", "text-")) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[80px]", children: filledWith.resource_name }),
          onRemove && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRemove, className: "opacity-0 group-hover/slot:opacity-100 ml-auto transition-opacity text-green-600 hover:text-red-500 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: dropRef,
      className: cn(
        "flex items-center gap-1.5 rounded-md border border-dashed px-2 py-1 text-xs transition-all",
        isOver ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-border/60 bg-muted/30 text-foreground/40"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", children: [
          "Drop ",
          getTypeInfo(type).label.toLowerCase()
        ] })
      ]
    }
  );
}
function DroppablePoolZone({ children, isReturning }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: setNodeRef, className: cn(
    "rounded-xl transition-all",
    isReturning && isOver && "ring-2 ring-amber-400 ring-offset-1",
    isReturning && !isOver && "ring-2 ring-amber-200 ring-offset-1"
  ), children });
}
const REQ_FIELDS = [
  { label: "Tractors", k: "tractors" },
  { label: "Implements", k: "implements" },
  { label: "Vehicles", k: "vehicles" },
  { label: "Sprayers", k: "sprayers" },
  { label: "Trailers", k: "trailers" },
  { label: "Staff", k: "staff" }
];
function PlannerTaskCard({
  task,
  allocations,
  onRemoveAllocation,
  farmId,
  onReqsUpdated
}) {
  const [showEdit, setShowEdit] = reactExports.useState(false);
  const [reqs, setReqs] = reactExports.useState({
    tractors: task.req_tractors,
    implements: task.req_implements,
    vehicles: task.req_vehicles,
    sprayers: task.req_sprayers,
    trailers: task.req_trailers,
    staff: task.req_staff
  });
  const [others, setOthers] = reactExports.useState(() => {
    if (task.req_other_notes.length > 0) return [...task.req_other_notes];
    if (task.req_other > 0) return Array(task.req_other).fill("");
    return [];
  });
  const [materials, setMaterials] = reactExports.useState(
    () => task.req_materials.map((m) => ({ name: m.name, quantity: String(m.quantity || ""), unit: m.unit }))
  );
  const updateMut = useMutation({
    mutationFn: () => {
      const endpoint = task.source === "assignment" ? `/api/farms/${farmId}/task-assignments/${task.id}` : `/api/farms/${farmId}/planner-events/${task.id}`;
      return fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reqTractors: reqs.tractors,
          reqImplements: reqs.implements,
          reqVehicles: reqs.vehicles,
          reqSprayers: reqs.sprayers,
          reqTrailers: reqs.trailers,
          reqStaff: reqs.staff,
          reqOther: others.length,
          reqOtherNotes: others,
          reqMaterials: materials.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), quantity: parseFloat(m.quantity) || 0, unit: m.unit.trim() }))
        })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      toast({ title: "Requirements updated" });
      setShowEdit(false);
      onReqsUpdated();
    },
    onError: () => toast({ title: "Failed to update requirements", variant: "destructive" })
  });
  const dateLabel = task.due_date ? (/* @__PURE__ */ new Date(task.due_date + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "No date";
  const totalReqs = REQ_TYPE_MAP.reduce((sum, { key }) => sum + (Number(task[key]) || 0), 0);
  const hasResourceReqs = totalReqs > 0;
  const hasMaterials = task.req_materials.length > 0;
  const hasRequirements = hasResourceReqs || hasMaterials;
  function openEdit() {
    setReqs({
      tractors: task.req_tractors,
      implements: task.req_implements,
      vehicles: task.req_vehicles,
      sprayers: task.req_sprayers,
      trailers: task.req_trailers,
      staff: task.req_staff
    });
    setOthers(task.req_other_notes.length > 0 ? [...task.req_other_notes] : task.req_other > 0 ? Array(task.req_other).fill("") : []);
    setMaterials(task.req_materials.map((m) => ({ name: m.name, quantity: String(m.quantity || ""), unit: m.unit })));
    setShowEdit((e) => !e);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white shadow-sm overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-1 self-stretch rounded-full flex-shrink-0", getColourBg(task.colour)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground leading-snug", children: task.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-foreground/50 font-medium", children: dateLabel }),
              task.staff_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-foreground/40", children: [
                "→ ",
                task.staff_name
              ] }),
              task.estimated_hours && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-[10px] text-foreground/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-2.5 h-2.5" }),
                task.estimated_hours,
                "h"
              ] }),
              task.start_time && task.end_time && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-foreground/40", children: [
                task.start_time,
                "–",
                task.end_time
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: openEdit,
                title: hasRequirements ? "Edit requirements" : "Set requirements",
                className: cn(
                  "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition-colors",
                  showEdit ? "bg-indigo-100 border-indigo-300 text-indigo-700" : hasRequirements ? "border-border text-foreground/40 hover:text-foreground/70 hover:bg-muted" : "border-indigo-200 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-2.5 h-2.5" }),
                  !hasRequirements && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Set requirements" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              task.source === "assignment" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            ), children: task.module ?? "Task" })
          ] })
        ] }),
        hasResourceReqs && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5 flex flex-wrap gap-1.5", children: REQ_TYPE_MAP.flatMap(({ key, type }) => {
          const count = Number(task[key]) || 0;
          if (count === 0) return [];
          const typeAllocs = allocations.filter((a) => a.resource_type === type);
          return Array.from({ length: count }, (_, i) => {
            const alloc = typeAllocs[i];
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              RequirementSlot,
              {
                id: `slot:${task.taskRef}:${type}:${i}:${task.due_date}`,
                type,
                filled: !!alloc,
                filledWith: alloc,
                onRemove: alloc ? () => onRemoveAllocation(alloc.id) : void 0
              },
              `${task.taskRef}:${type}:${i}`
            );
          });
        }) }),
        hasMaterials && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: task.req_materials.filter((m) => m.name).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-2.5 h-2.5" }),
          m.quantity ? `${m.quantity}${m.unit ? " " + m.unit : ""} ` : "",
          m.name
        ] }, i)) })
      ] })
    ] }),
    showEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/50 bg-muted/20 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2.5", children: "How many of each resource does this task need?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5 mb-3", children: REQ_FIELDS.map(({ label, k }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 bg-white rounded-lg border border-border/70 px-2.5 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium text-foreground/60", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setReqs((r) => ({ ...r, [k]: Math.max(0, r[k] - 1) })),
              className: "w-5 h-5 rounded border border-border hover:bg-muted transition-colors text-sm font-bold text-foreground/50 flex items-center justify-center",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold w-4 text-center tabular-nums", children: reqs[k] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setReqs((r) => ({ ...r, [k]: r[k] + 1 })),
              className: "w-5 h-5 rounded border border-border hover:bg-muted transition-colors text-sm font-bold text-foreground/50 flex items-center justify-center",
              children: "+"
            }
          )
        ] })
      ] }, k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/40 pt-2.5 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40", children: "Other resources" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setOthers((o) => [...o, ""]),
              className: "flex items-center gap-0.5 text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3" }),
                "Add"
              ]
            }
          )
        ] }),
        others.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/30 italic", children: "None — click Add to note any other resource needed (e.g. water bowser, generator)." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: others.map((desc, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: desc,
              onChange: (e) => setOthers((o) => o.map((d, j) => j === i ? e.target.value : d)),
              placeholder: "e.g. Water bowser, generator, fuel bowser…",
              className: "flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setOthers((o) => o.filter((_, j) => j !== i)),
              className: "w-6 h-6 flex items-center justify-center text-foreground/30 hover:text-red-500 transition-colors flex-shrink-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
            }
          )
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/40 pt-2.5 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40", children: "Materials needed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setMaterials((m) => [...m, { name: "", quantity: "", unit: "" }]),
              className: "flex items-center gap-0.5 text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3" }),
                "Add"
              ]
            }
          )
        ] }),
        materials.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/30 italic", children: "None — click Add to record materials needed (e.g. herbicide, fertiliser, fuel)." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          materials.map((mat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: mat.name,
                onChange: (e) => setMaterials((m) => m.map((v, j) => j === i ? { ...v, name: e.target.value } : v)),
                placeholder: "Product / material name",
                className: "flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: mat.quantity,
                min: "0",
                step: "any",
                onChange: (e) => setMaterials((m) => m.map((v, j) => j === i ? { ...v, quantity: e.target.value } : v)),
                placeholder: "Qty",
                className: "w-14 text-xs px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white text-center"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: mat.unit,
                onChange: (e) => setMaterials((m) => m.map((v, j) => j === i ? { ...v, unit: e.target.value } : v)),
                placeholder: "Unit",
                list: "mat-units",
                className: "w-14 text-xs px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setMaterials((m) => m.filter((_, j) => j !== i)),
                className: "w-6 h-6 flex items-center justify-center text-foreground/30 hover:text-red-500 transition-colors flex-shrink-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
              }
            )
          ] }, i)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("datalist", { id: "mat-units", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "L" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ml" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "kg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "g" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "t" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bags" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cans" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "drums" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pallets" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rolls" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "m" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => updateMut.mutate(),
            disabled: updateMut.isPending,
            className: "flex-1 text-xs font-semibold py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors",
            children: updateMut.isPending ? "Saving…" : "Save requirements"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowEdit(false),
            className: "text-xs font-semibold py-1.5 px-3 rounded-lg border border-border hover:bg-muted transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] })
  ] });
}
function PinchPointPanel({ pinchPoints, hasTasksWithReqs }) {
  const [dismissed, setDismissed] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState(true);
  if (dismissed) return null;
  if (pinchPoints.length === 0) {
    if (!hasTasksWithReqs) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-green-200 bg-green-50/70", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-4 h-4 text-green-500 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 font-medium flex-1", children: "No pinch points this week — your available resources cover all task requirements." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDismissed(true), className: "text-green-400 hover:text-green-600 transition-colors flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] });
  }
  const byDate = /* @__PURE__ */ new Map();
  for (const pp of pinchPoints) {
    if (!byDate.has(pp.date)) byDate.set(pp.date, []);
    byDate.get(pp.date).push(pp);
  }
  const fmtDate = (iso) => (/* @__PURE__ */ new Date(iso + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-amber-200 bg-amber-50/40 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-start gap-3 p-4", expanded && "pb-2"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold text-amber-800", children: [
          pinchPoints.length,
          " resource pinch point",
          pinchPoints.length !== 1 ? "s" : "",
          " this week"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-amber-700/80 mt-0.5 leading-relaxed", children: "A pinch point is where tasks on the same day need more of a resource than you have available — tasks may not run as planned." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setExpanded((e) => !e),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-amber-100 transition-colors text-amber-500",
            title: expanded ? "Collapse" : "Expand",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("w-3.5 h-3.5 transition-transform", !expanded && "-rotate-90") })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setDismissed(true),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-amber-100 transition-colors text-amber-400",
            title: "Dismiss for this session",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-3", children: [
      Array.from(byDate).map(([date, pps]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1.5", children: fmtDate(date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: pps.map((pp, i) => {
          const rt = RESOURCE_TYPES.find((r) => r.value === pp.type);
          const Icon = rt?.icon ?? Package;
          const label = rt?.label ?? pp.type;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 bg-white/70 rounded-lg border border-amber-200 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-semibold text-foreground leading-snug", children: [
                pp.demand,
                " ",
                label.toLowerCase(),
                pp.demand !== 1 ? "s" : "",
                " needed · ",
                pp.supply === 0 ? "none registered" : `only ${pp.supply} available`,
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 ml-1.5 font-bold", children: [
                  pp.shortage,
                  " short"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/55 mt-1 leading-relaxed", children: pp.supply === 0 ? `You haven't added any ${label.toLowerCase()}s yet. Go to the Resources tab to register them.` : pp.shortage === 1 ? `You're one ${label.toLowerCase()} short on this day. Try spreading tasks across more days, or add another ${label.toLowerCase()} in Resources.` : `You're ${pp.shortage} ${label.toLowerCase()}s short. Consider moving some tasks to quieter days, or register additional resources.` })
            ] })
          ] }, i);
        }) })
      ] }, date)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-amber-600/70 leading-relaxed border-t border-amber-200/60 pt-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
        " Add or update resources in the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Resources" }),
        " tab, or adjust task dates in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Field Tasks" }),
        " or ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Week Ahead" }),
        " to spread demand more evenly."
      ] })
    ] })
  ] });
}
function MaterialWeeklySummary({ weekMaterials }) {
  const [dismissed, setDismissed] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState(true);
  if (dismissed || weekMaterials.size === 0) return null;
  const entries = Array.from(weekMaterials.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const totalTasks = new Set(entries.flatMap(([, { tasks }]) => tasks)).size;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-blue-200 bg-blue-50/40 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-start gap-3 p-4", expanded && "pb-2"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-blue-800", children: "Materials needed this week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-blue-700/80 mt-0.5", children: [
          entries.length,
          " material",
          entries.length !== 1 ? "s" : "",
          " across ",
          totalTasks,
          " task",
          totalTasks !== 1 ? "s" : "",
          " — use this as your preparation checklist."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setExpanded((e) => !e),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors text-blue-500",
            title: expanded ? "Collapse" : "Expand",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("w-3.5 h-3.5 transition-transform", !expanded && "-rotate-90") })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setDismissed(true),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors text-blue-400",
            title: "Dismiss",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5 mb-2.5", children: entries.map(([name, { total, unit, tasks }]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/70 rounded-lg border border-blue-200 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-foreground capitalize leading-tight", children: name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-blue-700 mt-0.5", children: [
          Number.isInteger(total) ? total : parseFloat(total.toFixed(3)),
          unit ? ` ${unit}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-foreground/40 mt-0.5", children: [
          tasks.length,
          " task",
          tasks.length !== 1 ? "s" : "",
          tasks.length <= 2 ? ` (${tasks.slice(0, 2).join(", ")})` : ""
        ] })
      ] }, name)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-blue-600/70 leading-relaxed border-t border-blue-200/60 pt-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
        " Quantities are totalled from what's entered on each task card. Check your chemical store, fuel, and other stocks before the week begins."
      ] })
    ] })
  ] });
}
function exportPlannerCSV(weekLabel, tasks, allocations) {
  const rows = [["Date", "Task", "Tractors Req", "Implements Req", "Vehicles Req", "Sprayers Req", "Trailers Req", "Staff Req", "Allocated Resources", "Materials"]];
  for (const t of tasks) {
    const taskAllocs = allocations.filter((a2) => a2.task_ref === t.taskRef).map((a2) => a2.resource_name ?? a2.resource_id).join("; ");
    const mats = t.req_materials.filter((m) => m.name).map((m) => `${m.quantity} ${m.unit} ${m.name}`).join("; ");
    rows.push([t.due_date, t.title, String(t.req_tractors || 0), String(t.req_implements || 0), String(t.req_vehicles || 0), String(t.req_sprayers || 0), String(t.req_trailers || 0), String(t.req_staff || 0), taskAllocs, mats]);
  }
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `week-plan-${weekLabel.replace(/[^a-z0-9]/gi, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function PlannerTab({ farmId, resources }) {
  const queryClient = useQueryClient();
  const [weekBase, setWeekBase] = reactExports.useState(() => weekStart(/* @__PURE__ */ new Date()));
  const [activeDrag, setActiveDrag] = reactExports.useState(null);
  const [poolFilter, setPoolFilter] = reactExports.useState(null);
  const jumpRef = reactExports.useRef(null);
  const fromDate = isoDate(weekBase);
  isoDate(addDays(weekBase, 6));
  const { data, isLoading, isError } = useQuery({
    queryKey: ["resource-planner", farmId, fromDate],
    queryFn: () => fetch(`/api/farms/${farmId}/resource-planner?from=${fromDate}&days=7`).then((r) => r.json())
  });
  const allocateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-resource-allocations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] }),
    onError: () => toast({ title: "Failed to assign resource", variant: "destructive" })
  });
  const removeMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/task-resource-allocations/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] }),
    onError: () => toast({ title: "Failed to remove allocation", variant: "destructive" })
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const tasks = data?.tasks ?? [];
  const allocations = data?.allocations ?? [];
  const committedIds = reactExports.useMemo(() => new Set(allocations.map((a) => a.resource_id)), [allocations]);
  const byDate = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const t of tasks) {
      const d = t.due_date;
      if (!m.has(d)) m.set(d, []);
      m.get(d).push(t);
    }
    return m;
  }, [tasks]);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekBase, i);
    return { date: d, iso: isoDate(d) };
  });
  function handleDragStart(event) {
    const data2 = event.active.data.current;
    setActiveDrag(data2);
  }
  function handleDragEnd(event) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const dragData = active.data.current;
    if (!dragData) return;
    if (overId === "pool") {
      if (dragData.isReturn && dragData.allocationId != null) {
        removeMut.mutate(dragData.allocationId);
      }
      return;
    }
    if (!overId.startsWith("slot:")) return;
    const [, taskRef, slotType, , allocDate] = overId.split(":");
    if (dragData.resourceType !== slotType) {
      toast({
        title: "Type mismatch",
        description: `This slot requires a ${getTypeInfo(slotType).label.toLowerCase()}`,
        variant: "destructive"
      });
      return;
    }
    if (!dragData.resourceId) return;
    const task = tasks.find((t) => t.taskRef === taskRef);
    allocateMut.mutate({
      resourceId: dragData.resourceId,
      taskRef,
      taskTitle: task?.title ?? null,
      allocatedDate: allocDate,
      taskAssignmentId: taskRef.startsWith("assign-") ? Number(taskRef.replace("assign-", "")) : null
    });
  }
  const activeResources = resources.filter((r) => r.isActive);
  const supplyByType = reactExports.useMemo(() => {
    const m = {};
    for (const r of activeResources) m[r.type] = (m[r.type] || 0) + 1;
    return m;
  }, [activeResources]);
  const demandByDayType = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const t of tasks) {
      if (!m.has(t.due_date)) m.set(t.due_date, {});
      const day = m.get(t.due_date);
      for (const { key, type } of REQ_TYPE_MAP) {
        const n = Number(t[key]) || 0;
        if (n > 0) day[type] = (day[type] || 0) + n;
      }
    }
    return m;
  }, [tasks]);
  const peakDemandByType = reactExports.useMemo(() => {
    const m = {};
    for (const [, dayMap] of demandByDayType)
      for (const [type, n] of Object.entries(dayMap))
        m[type] = Math.max(m[type] || 0, n);
    return m;
  }, [demandByDayType]);
  const pinchPoints = reactExports.useMemo(() => {
    const pp = [];
    for (const [date, dayMap] of demandByDayType) {
      for (const [type, demand] of Object.entries(dayMap)) {
        const supply = supplyByType[type] || 0;
        if (demand > supply) pp.push({ date, type, demand, supply, shortage: demand - supply });
      }
    }
    return pp.sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type));
  }, [demandByDayType, supplyByType]);
  const weekMaterials = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const t of tasks) {
      for (const mat of t.req_materials) {
        if (!mat.name.trim()) continue;
        const qty = Number(mat.quantity) || 0;
        const key = mat.name.trim().toLowerCase();
        if (!m.has(key)) m.set(key, { total: 0, unit: mat.unit || "", tasks: [] });
        const entry = m.get(key);
        entry.total += qty;
        if (!entry.tasks.includes(t.title)) entry.tasks.push(t.title);
      }
    }
    return m;
  }, [tasks]);
  const weekLabel = (() => {
    const endOfWeek = addDays(weekBase, 6);
    const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${fmt(weekBase)} – ${fmt(endOfWeek)}`;
  })();
  const totalTasks = tasks.length;
  const tasksWithReqs = tasks.filter((t) => REQ_TYPE_MAP.some(({ key }) => Number(t[key]) > 0)).length;
  const totalSlots = tasks.reduce((s, t) => s + REQ_TYPE_MAP.reduce((ts, { key }) => ts + (Number(t[key]) || 0), 0), 0);
  const filledSlots = allocations.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DndContext, { sensors, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWeekBase((w) => addDays(w, -7)), className: "w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setWeekBase(weekStart(/* @__PURE__ */ new Date())), className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5" }),
            "Today"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWeekBase((w) => addDays(w, 7)), className: "w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground ml-1", children: weekLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative ml-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => jumpRef.current?.showPicker?.(),
                className: "flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground/50",
                title: "Jump to date",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarRange, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Jump to" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: jumpRef,
                type: "date",
                className: "absolute inset-0 opacity-0 w-full h-full cursor-pointer",
                onChange: (e) => {
                  if (e.target.value) {
                    setWeekBase(weekStart(/* @__PURE__ */ new Date(e.target.value + "T12:00:00")));
                    e.target.value = "";
                  }
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-foreground/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            totalTasks,
            " task",
            totalTasks !== 1 ? "s" : ""
          ] }),
          totalSlots > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("font-semibold", filledSlots === totalSlots ? "text-green-600" : "text-amber-600"), children: [
            filledSlots,
            "/",
            totalSlots,
            " slots filled"
          ] }),
          tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => exportPlannerCSV(weekLabel, tasks, allocations),
              className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground/60",
              title: "Export week plan to CSV",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Export CSV" })
              ]
            }
          )
        ] })
      ] }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading planner data…" }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-red-200 bg-red-50/40 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-500 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700", children: "Failed to load planner data. The API may still be restarting." })
      ] }),
      !isLoading && !isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-4", children: [
          activeResources.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-amber-200 bg-amber-50/40 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-amber-500 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "Add resources in the Resources tab before assigning them to tasks." })
          ] }),
          tasksWithReqs === 0 && tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-indigo-200 bg-indigo-50/40 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-indigo-400 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-indigo-700", children: [
              "None of this week's tasks have resource requirements set. Click the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Set requirements" }),
              " button on any task card below to add them."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PinchPointPanel, { pinchPoints, hasTasksWithReqs: tasksWithReqs > 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MaterialWeeklySummary, { weekMaterials }),
          tasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-foreground/40 text-sm", children: "No tasks this week." }),
          days.map(({ date, iso }) => {
            const dayTasks = byDate.get(iso) ?? [];
            if (dayTasks.length === 0) return null;
            const dayLabel = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
            const isToday = iso === isoDate(/* @__PURE__ */ new Date());
            const dayPinches = pinchPoints.filter((pp) => pp.date === iso);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2 mb-2 flex-wrap"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs font-bold", isToday ? "text-indigo-600" : "text-foreground/50"), children: dayLabel }),
                isToday && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700", children: "TODAY" }),
                dayPinches.map((pp) => {
                  const rt = RESOURCE_TYPES.find((r) => r.value === pp.type);
                  const Icon = rt?.icon ?? Package;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      title: `${rt?.label ?? pp.type}: ${pp.demand} needed, ${pp.supply} available`,
                      className: "flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-2.5 h-2.5" }),
                        pp.shortage,
                        " short"
                      ]
                    },
                    pp.type
                  );
                })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: dayTasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                PlannerTaskCard,
                {
                  task,
                  allocations: allocations.filter((a) => a.task_ref === task.taskRef),
                  onRemoveAllocation: (id) => removeMut.mutate(id),
                  farmId,
                  onReqsUpdated: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] })
                },
                task.taskRef
              )) })
            ] }, iso);
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-56 flex-shrink-0 sticky top-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DroppablePoolZone, { isReturning: !!activeDrag?.isReturn, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-xs text-foreground/60 uppercase tracking-wider", children: "Resources" }),
            poolFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPoolFilter(null), className: "text-[10px] text-foreground/40 hover:text-foreground flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }),
              " All"
            ] })
          ] }),
          activeResources.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mb-3", children: RESOURCE_TYPES.filter((rt) => activeResources.some((r) => r.type === rt.value)).map((rt) => {
            const Icon = rt.icon;
            const active = poolFilter === rt.value;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setPoolFilter(active ? null : rt.value),
                className: cn(
                  "flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors",
                  active ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/50 hover:bg-muted"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-2.5 h-2.5" }),
                  rt.label
                ]
              },
              rt.value
            );
          }) }),
          activeResources.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic", children: "No resources added yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: RESOURCE_TYPES.map((rt) => {
            if (poolFilter && poolFilter !== rt.value) return null;
            const typeResources = activeResources.filter((r) => r.type === rt.value);
            if (typeResources.length === 0) return null;
            const supply = typeResources.length;
            const peak = peakDemandByType[rt.value] || 0;
            const isPinched = peak > supply;
            const isExact = peak > 0 && peak === supply;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40", children: rt.label }),
                peak > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                  isPinched ? "bg-red-100 text-red-600 border border-red-200" : isExact ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-green-100 text-green-700 border border-green-200"
                ), children: [
                  supply,
                  "/",
                  peak,
                  " needed"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: typeResources.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                DraggableResourceChip,
                {
                  resource: r,
                  isCommitted: committedIds.has(r.id)
                },
                r.id
              )) })
            ] }, rt.value);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-3 border-t border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 leading-relaxed", children: "Drag a resource onto an empty slot to assign it. Drag an assigned resource back here to unassign it." }) })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DragOverlay, { children: activeDrag && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
      "flex items-center gap-2 rounded-lg border shadow-lg px-2.5 py-1.5 text-xs font-medium text-foreground cursor-grabbing",
      activeDrag.isReturn ? "border-amber-300 bg-amber-50" : "border-indigo-300 bg-white"
    ), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: cn("w-3 h-3", activeDrag.isReturn ? "text-amber-400" : "text-indigo-400") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: activeDrag.resourceName }),
      activeDrag.isReturn && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-600 ml-0.5", children: "→ unassign" })
    ] }) })
  ] });
}
function ResourcesPage() {
  const { farmId } = useAppStore();
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = usePersistedTab({ page: "resources", farmId, validIds: ["resources", "planner", "status", "analytics"], defaultTab: "resources" });
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["resources", farmId, showArchived],
    queryFn: () => fetch(`/api/farms/${farmId}/resources?showAll=${showArchived}`).then((r) => r.json())
  });
  const archiveMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/resources/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      toast({ title: "Resource archived" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const restoreMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      toast({ title: "Resource restored" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const resources = data?.resources ?? [];
  const totalActive = resources.filter((r) => r.isActive).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Resource Planner", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50 mt-0.5", children: "Manage your farm's resources and assign them to tasks week-by-week." }),
      totalActive > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 mt-1", children: [
        totalActive,
        " active resource",
        totalActive !== 1 ? "s" : ""
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 border-b border-border overflow-x-auto", children: ["resources", "planner", "status", "analytics"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab),
        className: cn(
          "pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap flex items-center gap-1.5",
          activeTab === tab ? "border-primary text-primary" : "border-transparent text-foreground/50 hover:text-foreground"
        ),
        children: tab === "resources" ? "Resources" : tab === "planner" ? "Planner" : tab === "status" ? "Planning Status" : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-3.5 h-3.5" }),
          "Analytics"
        ] })
      },
      tab
    )) }),
    activeTab === "resources" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ResourcesTabSimple,
      {
        farmId,
        resources,
        isLoading,
        showArchived,
        setShowArchived,
        onArchive: archiveMut.mutate,
        onRestore: restoreMut.mutate,
        onInvalidate: () => queryClient.invalidateQueries({ queryKey: ["resources", farmId] })
      }
    ) : activeTab === "planner" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PlannerTab, { farmId, resources: resources.filter((r) => r.isActive) }) : activeTab === "status" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PlanningStatusTab, { farmId }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTab, { farmId, resources })
  ] }) });
}
function ResourcesTabSimple({ farmId, resources, isLoading, showArchived, setShowArchived, onArchive, onRestore, onInvalidate }) {
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingResource, setEditingResource] = reactExports.useState(null);
  const [resSearch, setResSearch] = reactExports.useState("");
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      onInvalidate();
      setShowForm(false);
      toast({ title: "Resource added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, ...body }) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      onInvalidate();
      setEditingResource(null);
      toast({ title: "Resource updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const q = resSearch.trim().toLowerCase();
  const filteredResources = q ? resources.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q)) : resources;
  const grouped = /* @__PURE__ */ new Map();
  for (const r of filteredResources) {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type).push(r);
  }
  const sortedGroups = [...grouped.entries()].sort(
    (a, b) => RESOURCE_TYPES.findIndex((t) => t.value === a[0]) - RESOURCE_TYPES.findIndex((t) => t.value === b[0])
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ImportPanel, { farmId, onImported: onInvalidate }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search resources…",
            value: resSearch,
            onChange: (e) => setResSearch(e.target.value),
            className: "w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
          }
        ),
        resSearch && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setResSearch(""), className: "absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setShowForm(true);
            setEditingResource(null);
          },
          className: "flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Add resource"
          ]
        }
      )
    ] }),
    showForm && !editingResource && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ResourceForm,
      {
        onSave: (data) => createMut.mutate(data),
        onCancel: () => setShowForm(false),
        isPending: createMut.isPending
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-foreground/40 text-sm", children: "Loading resources…" }) : resources.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/40 text-sm", children: "No resources yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/30 mt-1", children: "Add tractors, implements, vehicles, staff and more above." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: sortedGroups.map(([type, group]) => {
      const { label } = getTypeInfo(type);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: group.map(
          (r) => editingResource?.id === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ResourceForm,
            {
              initial: r,
              onSave: (data) => updateMut.mutate({ id: r.id, ...data }),
              onCancel: () => setEditingResource(null),
              isPending: updateMut.isPending
            },
            r.id
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            ResourceCard,
            {
              resource: r,
              onEdit: setEditingResource,
              onArchive,
              onRestore
            },
            r.id
          )
        ) })
      ] }, type);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setShowArchived(!showArchived),
        className: cn("text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors", showArchived ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"),
        children: showArchived ? "Hide archived" : "Show archived"
      }
    ) })
  ] });
}
function ActualCompletionModal({
  event,
  farmId,
  onClose,
  onSaved
}) {
  const [form, setForm] = reactExports.useState(() => ({
    actualDate: event.actualDate ?? event.eventDate.slice(0, 10),
    actualTractors: event.actualTractors || event.reqTractors,
    actualImplements: event.actualImplements || event.reqImplements,
    actualVehicles: event.actualVehicles || event.reqVehicles,
    actualSprayers: event.actualSprayers || event.reqSprayers,
    actualTrailers: event.actualTrailers || event.reqTrailers,
    actualStaff: event.actualStaff || event.reqStaff,
    actualMaterials: parseSafe(event.actualMaterials).length ? parseSafe(event.actualMaterials) : parseSafe(event.reqMaterials).map((m) => ({ ...m })),
    actualNotes: event.actualNotes ?? "",
    actualStatus: event.actualStatus ?? "completed"
  }));
  const mut = useMutation({
    mutationFn: (data) => fetch(`/api/farms/${farmId}/planner-events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, actualMaterials: data.actualMaterials })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Actuals recorded ✓" });
      onSaved();
      onClose();
    },
    onError: () => toast({ title: "Failed to save actuals", variant: "destructive" })
  });
  const clearMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/planner-events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearActuals: true })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Actuals cleared" });
      onSaved();
      onClose();
    },
    onError: () => toast({ title: "Failed to clear actuals", variant: "destructive" })
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fmtPlanned = (n) => n > 0 ? String(n) : "—";
  const resourceFields = [
    { key: "actualTractors", label: "Tractors", planned: event.reqTractors },
    { key: "actualImplements", label: "Implements", planned: event.reqImplements },
    { key: "actualVehicles", label: "Vehicles", planned: event.reqVehicles },
    { key: "actualSprayers", label: "Sprayers", planned: event.reqSprayers },
    { key: "actualTrailers", label: "Trailers", planned: event.reqTrailers },
    { key: "actualStaff", label: "Staff", planned: event.reqStaff }
  ].filter((f) => f.planned > 0 || form[f.key] > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-background border-b border-border px-6 py-4 flex items-start justify-between gap-3 rounded-t-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold", children: "Record Actuals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-0.5", children: event.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-foreground/40 hover:text-foreground mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["completed", "partial", "abandoned"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => set("actualStatus", s),
            className: cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              form.actualStatus === s ? s === "completed" ? "bg-green-600 text-white border-green-600" : s === "partial" ? "bg-amber-500 text-white border-amber-500" : "bg-red-500 text-white border-red-500" : "border-border text-foreground/50 hover:bg-muted"
            ),
            children: s === "completed" ? "✓ Completed" : s === "partial" ? "⚡ Partial" : "✕ Abandoned"
          },
          s
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: [
          "Actual date ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "normal-case font-normal text-foreground/40", children: [
            "(planned: ",
            new Date(event.eventDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: form.actualDate,
            onChange: (e) => set("actualDate", e.target.value),
            className: "border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 w-48"
          }
        )
      ] }),
      resourceFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Resources used" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: resourceFields.map((f) => {
          const actual = form[f.key];
          const delta = actual - f.planned;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs text-foreground/50 mb-1 block", children: [
              f.label,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/30", children: [
                "(planned: ",
                fmtPlanned(f.planned),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  value: actual,
                  onChange: (e) => set(f.key, Number(e.target.value)),
                  className: "w-16 border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-center"
                }
              ),
              delta !== 0 && f.planned > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] font-bold", delta > 0 ? "text-red-500" : "text-green-600"), children: delta > 0 ? `+${delta}` : delta })
            ] })
          ] }, f.key);
        }) })
      ] }),
      form.actualMaterials.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Materials used" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: form.actualMaterials.map((m, i) => {
          const planned = parseSafe(event.reqMaterials)[i];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-foreground/70", children: m.name || `Item ${i + 1}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "0.01",
                value: m.quantity,
                onChange: (e) => setForm((f) => {
                  const mats = [...f.actualMaterials];
                  mats[i] = { ...mats[i], quantity: Number(e.target.value) };
                  return { ...f, actualMaterials: mats };
                }),
                className: "w-20 border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-center"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50 text-xs", children: m.unit }),
            planned && Number(m.quantity) !== Number(planned.quantity) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] font-bold", Number(m.quantity) > Number(planned.quantity) ? "text-red-500" : "text-green-600"), children: Number(m.quantity) > Number(planned.quantity) ? `+${(Number(m.quantity) - Number(planned.quantity)).toFixed(2)}` : (Number(m.quantity) - Number(planned.quantity)).toFixed(2) })
          ] }, i);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Notes / deviation reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: form.actualNotes,
            onChange: (e) => set("actualNotes", e.target.value),
            placeholder: "e.g. Weather delay, additional resource required due to wet ground conditions…",
            rows: 3,
            className: "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-between gap-3 rounded-b-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: event.actualStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => clearMut.mutate(),
          disabled: clearMut.isPending,
          className: "text-xs text-foreground/40 hover:text-red-500 transition-colors disabled:opacity-40",
          children: "Clear actuals"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => mut.mutate(form),
            disabled: mut.isPending,
            className: "px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40",
            children: mut.isPending ? "Saving…" : "Save actuals"
          }
        )
      ] })
    ] })
  ] }) });
}
function parseSafe(s) {
  if (!s) return [];
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
function getPlanningStatus(e) {
  if (e.reqCommitted) return "committed";
  const hasReqs = e.reqTractors > 0 || e.reqImplements > 0 || e.reqVehicles > 0 || e.reqSprayers > 0 || e.reqTrailers > 0 || e.reqStaff > 0 || e.reqOther > 0;
  const otherNotes = parseSafe(e.reqOtherNotes);
  const materials = parseSafe(e.reqMaterials);
  if (hasReqs || otherNotes.length > 0 || materials.length > 0) return "planned";
  return "not_started";
}
function PlanningStatusTab({ farmId }) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { data: plannerData, isLoading } = useQuery({
    queryKey: ["planner-events-all", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/planner-events`).then((r) => r.json())
  });
  const events = plannerData?.events ?? [];
  const milestones = plannerData?.milestones ?? [];
  const commitMut = useMutation({
    mutationFn: ({ id, committed: committed2 }) => fetch(`/api/farms/${farmId}/planner-events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reqCommitted: committed2 })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] });
      toast({ title: vars.committed ? "Task committed ✓" : "Commitment removed" });
    },
    onError: () => toast({ title: "Failed to update task", variant: "destructive" })
  });
  const markMilestoneMut = useMutation({
    mutationFn: ({ id, projectId }) => fetch(`/api/farms/${farmId}/agri-env-projects/${projectId}/milestones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", completionDate: isoDate(/* @__PURE__ */ new Date()) })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] });
      toast({ title: "Milestone marked as complete ✓" });
    },
    onError: () => toast({ title: "Failed to update milestone", variant: "destructive" })
  });
  const [dateRange, setDateRange] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [showPast, setShowPast] = reactExports.useState(false);
  const [showPva, setShowPva] = reactExports.useState(false);
  const [actingOn, setActingOn] = reactExports.useState(null);
  const today = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const cutoff = reactExports.useMemo(() => {
    if (dateRange === "all") return null;
    const d = new Date(today);
    d.setDate(d.getDate() + { "1w": 7, "2w": 14, "4w": 28, "8w": 56 }[dateRange]);
    return d;
  }, [dateRange, today]);
  const sq = search.trim().toLowerCase();
  const allUpcoming = reactExports.useMemo(
    () => events.filter((e) => new Date(e.eventDate) >= today).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    [events, today]
  );
  const upcoming = reactExports.useMemo(
    () => allUpcoming.filter((e) => !cutoff || new Date(e.eventDate) <= cutoff).filter((e) => !sq || e.title.toLowerCase().includes(sq)),
    [allUpcoming, cutoff, sq]
  );
  const past = reactExports.useMemo(
    () => events.filter((e) => new Date(e.eventDate) < today).filter((e) => !sq || e.title.toLowerCase().includes(sq)).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
    [events, today, sq]
  );
  const notStarted = upcoming.filter((e) => getPlanningStatus(e) === "not_started");
  const planned = upcoming.filter((e) => getPlanningStatus(e) === "planned");
  const committed = upcoming.filter((e) => getPlanningStatus(e) === "committed");
  const upcomingMilestones = reactExports.useMemo(
    () => milestones.filter((m) => m.dueDate && /* @__PURE__ */ new Date(m.dueDate + "T12:00:00") >= today).filter((m) => !cutoff || /* @__PURE__ */ new Date(m.dueDate + "T12:00:00") <= cutoff).filter((m) => !sq || m.milestoneName.toLowerCase().includes(sq) || m.schemeName.toLowerCase().includes(sq)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [milestones, today, cutoff, sq]
  );
  const pastMilestones = reactExports.useMemo(
    () => milestones.filter((m) => m.dueDate && /* @__PURE__ */ new Date(m.dueDate + "T12:00:00") < today).filter((m) => !sq || m.milestoneName.toLowerCase().includes(sq) || m.schemeName.toLowerCase().includes(sq)).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [milestones, today, sq]
  );
  const overdueMilestones = reactExports.useMemo(
    () => milestones.filter(
      (m) => m.dueDate && /* @__PURE__ */ new Date(m.dueDate + "T12:00:00") < today && m.status !== "completed" && m.status !== "submitted" && m.status !== "paid"
    ),
    [milestones, today]
  );
  const fmtDate = (s) => new Date(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  function exportStatusCSV() {
    const rows = [["Type", "Date", "Task / Milestone", "Scheme", "Status", "Requirements", "Committed By", "Committed At"]];
    for (const e of upcoming) {
      const status = getPlanningStatus(e);
      const parts = [];
      if (e.reqTractors > 0) parts.push(`${e.reqTractors} tractors`);
      if (e.reqImplements > 0) parts.push(`${e.reqImplements} implements`);
      if (e.reqVehicles > 0) parts.push(`${e.reqVehicles} vehicles`);
      if (e.reqSprayers > 0) parts.push(`${e.reqSprayers} sprayers`);
      if (e.reqTrailers > 0) parts.push(`${e.reqTrailers} trailers`);
      if (e.reqStaff > 0) parts.push(`${e.reqStaff} staff`);
      rows.push(["Planner task", e.eventDate, e.title, "", status, parts.join("; "), e.reqCommittedBy ?? "", e.reqCommittedAt ? new Date(e.reqCommittedAt).toLocaleDateString("en-GB") : ""]);
    }
    if (upcomingMilestones.length > 0) {
      rows.push(["", "", "", "", "", "", "", ""]);
      for (const m of upcomingMilestones) {
        rows.push(["Agri-environment milestone", m.dueDate, m.milestoneName, m.schemeName, m.status, "", "", ""]);
      }
    }
    if (pastMilestones.length > 0) {
      rows.push(["", "", "", "", "", "", "", ""]);
      for (const m of pastMilestones) {
        rows.push(["Agri-environment milestone (past)", m.dueDate, m.milestoneName, m.schemeName, m.status, "", "", ""]);
      }
    }
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "planning-status.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-foreground/50 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 animate-spin" }),
      " Loading tasks…"
    ] });
  }
  if (upcoming.length === 0 && upcomingMilestones.length === 0 && past.length === 0 && pastMilestones.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-sm text-foreground/50", children: "No upcoming planner tasks found. Add tasks in the Planner tab first." });
  }
  function ReqSummary({ e }) {
    const parts = [];
    if (e.reqTractors > 0) parts.push(`${e.reqTractors} tractor${e.reqTractors > 1 ? "s" : ""}`);
    if (e.reqImplements > 0) parts.push(`${e.reqImplements} implement${e.reqImplements > 1 ? "s" : ""}`);
    if (e.reqVehicles > 0) parts.push(`${e.reqVehicles} vehicle${e.reqVehicles > 1 ? "s" : ""}`);
    if (e.reqSprayers > 0) parts.push(`${e.reqSprayers} sprayer${e.reqSprayers > 1 ? "s" : ""}`);
    if (e.reqTrailers > 0) parts.push(`${e.reqTrailers} trailer${e.reqTrailers > 1 ? "s" : ""}`);
    if (e.reqStaff > 0) parts.push(`${e.reqStaff} staff`);
    const others = parseSafe(e.reqOtherNotes);
    if (others.length > 0) parts.push(`${others.length} other`);
    const mats = parseSafe(e.reqMaterials);
    if (mats.length > 0) parts.push(`${mats.length} material${mats.length > 1 ? "s" : ""}`);
    if (parts.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 italic", children: "No requirements entered yet" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60", children: parts.join(" · ") });
  }
  function EventRow({ e, showActualsBtn }) {
    const status = getPlanningStatus(e);
    const pending = commitMut.isPending && commitMut.variables?.id === e.id;
    const hasActuals = !!e.actualStatus;
    const ActualBadge = () => {
      if (!hasActuals) return null;
      const cfg = e.actualStatus === "completed" ? { cls: "bg-green-100 text-green-700", label: "✓ Completed" } : e.actualStatus === "partial" ? { cls: "bg-amber-100 text-amber-700", label: "⚡ Partial" } : { cls: "bg-red-100 text-red-600", label: "✕ Abandoned" };
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", cfg.cls), children: cfg.label });
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 px-4 py-3 border-b border-border last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
        "w-1 self-stretch rounded-full flex-shrink-0 mt-0.5",
        status === "committed" ? "bg-green-400" : status === "planned" ? "bg-amber-400" : "bg-red-300"
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium leading-snug", children: e.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActualBadge, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: fmtDate(e.eventDate) }),
          e.actualDate && e.actualDate !== e.eventDate.slice(0, 10) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 text-xs", children: "→" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/50", children: [
              "actual: ",
              (/* @__PURE__ */ new Date(e.actualDate + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 text-xs", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReqSummary, { e })
        ] }),
        e.actualNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 italic mt-1 leading-snug", children: [
          '"',
          e.actualNotes,
          '"'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
        showActualsBtn && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActingOn(e),
            className: cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors border",
              hasActuals ? "border-primary/30 text-primary hover:bg-primary/10" : "border-border text-foreground/50 hover:bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }),
              hasActuals ? "Edit actuals" : "Record actuals"
            ]
          }
        ),
        status === "committed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex flex-col items-end gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-3.5 h-3.5" }),
              " Committed"
            ] }),
            (e.reqCommittedBy || e.reqCommittedAt) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-foreground/40 leading-tight", children: [
              e.reqCommittedBy ?? "",
              e.reqCommittedBy && e.reqCommittedAt ? " · " : "",
              e.reqCommittedAt ? new Date(e.reqCommittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => commitMut.mutate({ id: e.id, committed: false }),
              disabled: pending,
              className: "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-foreground/50 hover:bg-muted border border-border transition-colors disabled:opacity-40",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "w-3 h-3" }),
                " Uncommit"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
            "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
            status === "planned" ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-500"
          ), children: status === "planned" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
            " Needs sign-off"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "w-3.5 h-3.5" }),
            " Not started"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => commitMut.mutate({ id: e.id, committed: true }),
              disabled: pending || status === "not_started",
              title: status === "not_started" ? "Enter resource or material requirements before committing" : "Mark planning complete for this task",
              className: cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                status === "planned" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-foreground/40 border border-border"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
                " Commit"
              ]
            }
          )
        ] })
      ] })
    ] });
  }
  function Section({ title, icon, items, accent }) {
    if (items.length === 0) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold", accent), children: [
        icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-normal opacity-70", children: [
          items.length,
          " task",
          items.length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: items.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventRow, { e }, e.id)) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 flex-wrap", children: ["1w", "2w", "4w", "8w", "all"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setDateRange(r),
          className: cn(
            "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
            dateRange === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/50 hover:bg-muted"
          ),
          children: r === "all" ? "All upcoming" : r === "1w" ? "Next week" : r === "2w" ? "2 weeks" : r === "4w" ? "4 weeks" : "8 weeks"
        },
        r
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-0 sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search tasks…",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
          }
        ),
        search && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSearch(""), className: "absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
      ] }),
      (upcoming.length > 0 || upcomingMilestones.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: exportStatusCSV,
          className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-foreground/60 shrink-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5" }),
            " Export CSV"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("grid gap-3", overdueMilestones.length > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"), children: [
      [
        { label: "Not started", count: notStarted.length, color: "bg-red-50 border-red-200 text-red-600", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "w-4 h-4" }) },
        { label: "Needs sign-off", count: planned.length, color: "bg-amber-50 border-amber-200 text-amber-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4" }) },
        { label: "Committed", count: committed.length, color: "bg-green-50 border-green-200 text-green-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-4 h-4" }) }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: cn("flex items-center gap-3 px-4 py-3 border", s.color), children: [
        s.icon,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold leading-none", children: s.count }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80 mt-0.5", children: s.label })
        ] })
      ] }, s.label)),
      overdueMilestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex items-center gap-3 px-4 py-3 border bg-red-50 border-red-300 text-red-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold leading-none", children: overdueMilestones.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80 mt-0.5", children: "Overdue milestones" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 -mt-2", children: [
      "Enter resource and material requirements on a task, then click ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Commit" }),
      " to mark it as fully planned.",
      dateRange !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " Showing tasks in the next ",
        dateRange === "1w" ? "week" : dateRange === "2w" ? "2 weeks" : dateRange === "4w" ? "4 weeks" : "8 weeks",
        "."
      ] })
    ] }),
    upcoming.length === 0 && upcomingMilestones.length === 0 && !showPast ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-sm text-foreground/50", children: "No tasks match this filter. Try a wider date range or clear the search." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Section,
          {
            title: "Not started — planning required",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "w-3.5 h-3.5" }),
            items: notStarted,
            accent: "bg-red-50 text-red-700"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Section,
          {
            title: "Requirements entered — awaiting sign-off",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
            items: planned,
            accent: "bg-amber-50 text-amber-700"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Section,
          {
            title: "Committed — planning complete",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-3.5 h-3.5" }),
            items: committed,
            accent: "bg-green-50 text-green-700"
          }
        )
      ] }),
      upcomingMilestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "w-3.5 h-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Agri-environment milestones" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-normal opacity-70", children: [
            upcomingMilestones.length,
            " due"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: upcomingMilestones.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-border last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 self-stretch rounded-full flex-shrink-0 mt-0.5 bg-teal-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium leading-snug", children: m.milestoneName }),
              m.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-100 text-green-700", children: "✓ Completed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: fmtDate(m.dueDate + "T12:00:00") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 text-xs", children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-teal-600 font-medium", children: m.schemeName })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate(`/grants?tab=agrienv&project=${m.projectId}`),
              className: "flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-teal-700 hover:bg-teal-50 border border-teal-200 transition-colors",
              title: "Open in Grants & Funding",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" }),
                " View"
              ]
            }
          )
        ] }, m.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 px-1", children: [
          "Read-only. Manage milestones in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/grants?tab=agrienv"), className: "underline underline-offset-2 hover:text-foreground/60", children: "Grants & Funding → Agri-environment Schemes" }),
          "."
        ] })
      ] })
    ] }),
    overdueMilestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-red-700", children: [
          overdueMilestones.length,
          " overdue agri-environment milestone",
          overdueMilestones.length !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-600 mt-0.5", children: [
          overdueMilestones.length === 1 ? "1 milestone has passed its deadline without being marked complete — this may affect your grant claim." : `${overdueMilestones.length} milestones have passed their deadlines without being marked complete — this may affect your grant claim.`,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setShowPast(true),
              className: "underline underline-offset-2 hover:text-red-800 font-semibold",
              children: "Review below"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowPast((p) => !p),
          className: cn(
            "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
            showPast ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3.5 h-3.5" }),
            showPast ? "Hide past tasks" : `Show past tasks${past.length + pastMilestones.length > 0 ? ` (${past.length + pastMilestones.length})` : ""}`
          ]
        }
      ),
      showPast && past.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3.5 h-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Past tasks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-normal opacity-70", children: [
            past.length,
            " task",
            past.length !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: past.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventRow, { e, showActualsBtn: true }, e.id)) })
      ] }),
      showPast && pastMilestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "w-3.5 h-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Past agri-environment milestones" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto font-normal opacity-70", children: pastMilestones.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: pastMilestones.map((m) => {
          const isOverdue = m.status !== "completed" && m.status !== "submitted" && m.status !== "paid";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-3 px-4 py-3 border-b border-border last:border-0", isOverdue ? "bg-red-50/40" : "opacity-60"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-1 self-stretch rounded-full flex-shrink-0 mt-0.5", isOverdue ? "bg-red-400" : "bg-teal-300") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium leading-snug", children: m.milestoneName }),
                isOverdue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-100 text-red-700 border-red-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-2.5 h-2.5" }),
                  " Overdue"
                ] }) : m.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-100 text-green-700", children: "✓ Completed" }) : m.status === "paid" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-100 text-green-700", children: "✓ Paid" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-teal-100 text-teal-700", children: "↑ Submitted" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: fmtDate(m.dueDate + "T12:00:00") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 text-xs", children: "·" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-teal-600", children: m.schemeName })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex items-center gap-1.5", children: [
              isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => markMilestoneMut.mutate({ id: m.id, projectId: m.projectId }),
                  disabled: markMilestoneMut.isPending && markMilestoneMut.variables?.id === m.id,
                  className: "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-green-700 hover:bg-green-50 border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                    markMilestoneMut.isPending && markMilestoneMut.variables?.id === m.id ? "Saving…" : "Mark complete"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => navigate(`/grants?tab=agrienv&project=${m.projectId}`),
                  className: "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-teal-700 hover:bg-teal-50 border border-teal-200 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" }),
                    " View"
                  ]
                }
              )
            ] })
          ] }, m.id);
        }) })
      ] }),
      showPast && past.length === 0 && pastMilestones.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-foreground/40 px-1", children: "No past tasks found." })
    ] }),
    (() => {
      const withActuals = events.filter((e) => !!e.actualStatus);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowPva((p) => !p),
            className: cn(
              "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
              showPva ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-3.5 h-3.5" }),
              showPva ? "Hide plan vs actual" : `Plan vs Actual${withActuals.length > 0 ? ` (${withActuals.length} task${withActuals.length !== 1 ? "s" : ""} recorded)` : " — record actuals on past tasks above"}`
            ]
          }
        ),
        showPva && withActuals.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-foreground/40 px-1", children: 'No actuals recorded yet. Use the "Record actuals" button on past tasks above.' }),
        showPva && withActuals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 overflow-x-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs min-w-[640px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 font-semibold text-foreground/50", children: "Task" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Planned date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Actual date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Date slip" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Planned res." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Actual res." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Res. delta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 font-semibold text-foreground/50", children: "Outcome" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: withActuals.sort((a, b) => (a.actualDate ?? a.eventDate).localeCompare(b.actualDate ?? b.eventDate)).map((e) => {
              const plannedDate = /* @__PURE__ */ new Date(e.eventDate.slice(0, 10) + "T12:00:00");
              const actualDate = e.actualDate ? /* @__PURE__ */ new Date(e.actualDate + "T12:00:00") : null;
              const slipDays = actualDate ? Math.round((actualDate.getTime() - plannedDate.getTime()) / 864e5) : null;
              const plannedRes = e.reqTractors + e.reqImplements + e.reqVehicles + e.reqSprayers + e.reqTrailers + e.reqStaff;
              const actualRes = e.actualTractors + e.actualImplements + e.actualVehicles + e.actualSprayers + e.actualTrailers + e.actualStaff;
              const resDelta = actualRes - plannedRes;
              const fmtD = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              const outcomeCfg = e.actualStatus === "completed" ? "text-green-600 font-semibold" : e.actualStatus === "partial" ? "text-amber-600 font-semibold" : "text-red-500 font-semibold";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium max-w-[180px] truncate", title: e.title, children: e.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: fmtD(plannedDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: actualDate ? fmtD(actualDate) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: slipDays === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "—" }) : slipDays === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-semibold", children: "On time" }) : slipDays > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-500 font-semibold", children: [
                  "+",
                  slipDays,
                  "d"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-600 font-semibold", children: [
                  slipDays,
                  "d early"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: plannedRes || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: actualRes || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: plannedRes === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "—" }) : resDelta === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-semibold", children: "=" }) : resDelta > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-500 font-semibold", children: [
                  "+",
                  resDelta
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-semibold", children: resDelta }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("py-2 px-3", outcomeCfg), children: [
                  e.actualStatus === "completed" ? "✓ Completed" : e.actualStatus === "partial" ? "⚡ Partial" : "✕ Abandoned",
                  e.actualCompletedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/40 font-normal", children: [
                    " · ",
                    e.actualCompletedBy
                  ] })
                ] })
              ] }, e.id);
            }) })
          ] }),
          withActuals.some((e) => e.actualNotes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/50 px-1", children: "Deviation notes" }),
            withActuals.filter((e) => e.actualNotes).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 bg-muted/40 rounded-lg text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: e.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/40", children: " — " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60 italic", children: e.actualNotes })
            ] }, e.id))
          ] })
        ] })
      ] });
    })(),
    actingOn && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ActualCompletionModal,
      {
        event: actingOn,
        farmId,
        onClose: () => setActingOn(null),
        onSaved: () => queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] })
      }
    )
  ] });
}
function AnalyticsTab({ farmId, resources }) {
  const today = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const start = isoDate(addDays(today, -365));
  const end = isoDate(addDays(today, 365));
  const { data: plannerData2 } = useQuery({
    queryKey: ["planner-events-all", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/planner-events`).then((r) => r.json())
  });
  const events = plannerData2?.events ?? [];
  const { data: allocData, isLoading: allocLoading } = useQuery({
    queryKey: ["analytics-allocs", farmId, start, end],
    queryFn: () => fetch(`/api/farms/${farmId}/task-resource-allocations?start=${start}&end=${end}`).then((r) => r.json()),
    staleTime: 2 * 60 * 1e3
  });
  const allocations = allocData?.allocations ?? [];
  const upcoming = reactExports.useMemo(() => events.filter((e) => new Date(e.eventDate) >= today), [events, today]);
  const statusCounts = reactExports.useMemo(() => {
    let notStarted = 0, planned = 0, committed = 0;
    for (const e of upcoming) {
      const s = getPlanningStatus(e);
      if (s === "not_started") notStarted++;
      else if (s === "planned") planned++;
      else committed++;
    }
    return [
      { name: "Not started", value: notStarted, fill: "#fca5a5" },
      { name: "Needs sign-off", value: planned, fill: "#fcd34d" },
      { name: "Committed", value: committed, fill: "#86efac" }
    ];
  }, [upcoming]);
  const demandByType = reactExports.useMemo(() => {
    const totals = {};
    for (const e of upcoming) {
      if (e.reqTractors > 0) totals["Tractors"] = (totals["Tractors"] || 0) + e.reqTractors;
      if (e.reqImplements > 0) totals["Implements"] = (totals["Implements"] || 0) + e.reqImplements;
      if (e.reqVehicles > 0) totals["Vehicles"] = (totals["Vehicles"] || 0) + e.reqVehicles;
      if (e.reqSprayers > 0) totals["Sprayers"] = (totals["Sprayers"] || 0) + e.reqSprayers;
      if (e.reqTrailers > 0) totals["Trailers"] = (totals["Trailers"] || 0) + e.reqTrailers;
      if (e.reqStaff > 0) totals["Staff"] = (totals["Staff"] || 0) + e.reqStaff;
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [upcoming]);
  const byWeek = reactExports.useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 8; i++) {
      const ws = addDays(weekStart(today), i * 7);
      const we = addDays(ws, 6);
      const wsStr = isoDate(ws);
      const weStr = isoDate(we);
      const label = ws.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      let notStarted = 0, planned = 0, committed = 0;
      for (const e of upcoming) {
        if (e.eventDate >= wsStr && e.eventDate <= weStr) {
          const s = getPlanningStatus(e);
          if (s === "not_started") notStarted++;
          else if (s === "planned") planned++;
          else committed++;
        }
      }
      if (notStarted + planned + committed > 0) weeks.push({ label, notStarted, planned, committed });
    }
    return weeks;
  }, [upcoming, today]);
  const utilisationData = reactExports.useMemo(() => {
    const counts = {};
    for (const r of resources) {
      counts[r.id] = { name: r.name, type: r.type, colour: r.colour || "#6366f1", count: 0 };
    }
    for (const a of allocations) {
      if (counts[a.resource_id]) counts[a.resource_id].count++;
      else counts[a.resource_id] = { name: a.resource_name, type: a.resource_type, colour: a.resource_colour || "#6366f1", count: 1 };
    }
    return Object.values(counts).filter((r) => r.count > 0).sort((a, b) => b.count - a.count).slice(0, 12);
  }, [allocations, resources]);
  const materialTotals = reactExports.useMemo(() => {
    const acc = {};
    for (const e of upcoming) {
      const mats = parseSafe(e.reqMaterials);
      for (const m of mats) {
        if (!m.name) continue;
        const key = `${m.name}__${m.unit}`;
        if (!acc[key]) acc[key] = { name: m.name, unit: m.unit, total: 0 };
        acc[key].total += Number(m.quantity) || 0;
      }
    }
    return Object.values(acc).sort((a, b) => a.name.localeCompare(b.name));
  }, [upcoming]);
  const totalUpcoming = upcoming.length;
  const committedPct = totalUpcoming > 0 ? Math.round(statusCounts[2].value / totalUpcoming * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Upcoming tasks", value: totalUpcoming, sub: "from today", color: "text-foreground" },
      { label: "Planning complete", value: `${committedPct}%`, sub: `${statusCounts[2].value} committed`, color: committedPct === 100 ? "text-green-600" : committedPct >= 50 ? "text-amber-600" : "text-red-500" },
      { label: "Resources on file", value: resources.filter((r) => r.isActive).length, sub: `${resources.length} total`, color: "text-foreground" },
      { label: "Allocations (±1yr)", value: allocLoading ? "…" : allocations.length, sub: "resource assignments", color: "text-foreground" }
    ].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold leading-none ${k.color}`, children: k.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold mt-1", children: k.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-foreground/40 mt-0.5", children: k.sub })
    ] }, k.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-4 h-4 text-foreground/50" }),
          "Planning Status — Upcoming"
        ] }),
        totalUpcoming === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No upcoming tasks yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 140, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: statusCounts, layout: "vertical", margin: { left: 16, right: 16, top: 4, bottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { horizontal: false, stroke: "currentColor", strokeOpacity: 0.06 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 90 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} task${v !== 1 ? "s" : ""}`, ""] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], children: statusCounts.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.fill }, i)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-foreground/50 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Overall planning progress" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                committedPct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-green-400 transition-all", style: { width: `${committedPct}%` } }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 text-foreground/50" }),
          "Tasks by Week — Next 8 Weeks"
        ] }),
        byWeek.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No upcoming tasks in this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: byWeek, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "committed", stackId: "a", fill: "#86efac", name: "Committed", radius: [0, 0, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "planned", stackId: "a", fill: "#fcd34d", name: "Needs sign-off", radius: [0, 0, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "notStarted", stackId: "a", fill: "#fca5a5", name: "Not started", radius: [4, 4, 0, 0] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-4 h-4 text-foreground/50" }),
          "Resource Demand — Upcoming Tasks"
        ] }),
        demandByType.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No resource requirements entered yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: demandByType, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} slot${v !== 1 ? "s" : ""}`, "Required"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "#818cf8", radius: [4, 4, 0, 0], name: "Required" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-foreground/50" }),
          "Resource Utilisation — Allocations (±1yr)"
        ] }),
        allocLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-foreground/40 py-6 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 animate-spin" }),
          " Loading…"
        ] }) : utilisationData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No allocation data yet. Assign resources to tasks in the Planner." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: utilisationData, layout: "vertical", margin: { left: 0, right: 16, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { horizontal: false, stroke: "currentColor", strokeOpacity: 0.06 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 90 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} assignment${v !== 1 ? "s" : ""}`, "Used"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", radius: [0, 4, 4, 0], name: "Assignments", children: utilisationData.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.colour }, i)) })
        ] }) })
      ] })
    ] }),
    materialTotals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-foreground/50" }),
        "Material Requirements — Upcoming Tasks"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs font-semibold text-foreground/50", children: "Material" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-3 text-xs font-semibold text-foreground/50", children: "Total qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs font-semibold text-foreground/50", children: "Unit" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: materialTotals.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: m.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-right tabular-nums", children: m.total % 1 === 0 ? m.total : m.total.toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-foreground/60", children: m.unit })
        ] }, `${m.name}__${m.unit}`)) })
      ] }) })
    ] }),
    materialTotals.length === 0 && upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 text-center text-sm text-foreground/40", children: "No material requirements entered on upcoming tasks yet. Add materials when editing tasks in the Planner tab." }),
    (() => {
      const withActuals = events.filter((e) => !!e.actualStatus);
      if (withActuals.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 text-center text-sm text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground/60 mb-1", children: "Plan vs Actual analytics will appear here" }),
        "Record actuals on completed tasks in the Planning Status tab to start tracking planning accuracy."
      ] });
      const slipData = [
        { label: "Early", count: 0, fill: "#60a5fa" },
        { label: "On time", count: 0, fill: "#86efac" },
        { label: "1–3d late", count: 0, fill: "#fcd34d" },
        { label: "4–7d late", count: 0, fill: "#fb923c" },
        { label: ">7d late", count: 0, fill: "#f87171" }
      ];
      let totalSlip = 0;
      let slipCount = 0;
      for (const e of withActuals) {
        if (!e.actualDate) continue;
        const slip = Math.round(((/* @__PURE__ */ new Date(e.actualDate + "T12:00:00")).getTime() - (/* @__PURE__ */ new Date(e.eventDate.slice(0, 10) + "T12:00:00")).getTime()) / 864e5);
        totalSlip += slip;
        slipCount++;
        if (slip < 0) slipData[0].count++;
        else if (slip === 0) slipData[1].count++;
        else if (slip <= 3) slipData[2].count++;
        else if (slip <= 7) slipData[3].count++;
        else slipData[4].count++;
      }
      const avgSlip = slipCount > 0 ? (totalSlip / slipCount).toFixed(1) : "—";
      const resVariance = {
        Tractors: { planned: 0, actual: 0 },
        Implements: { planned: 0, actual: 0 },
        Vehicles: { planned: 0, actual: 0 },
        Sprayers: { planned: 0, actual: 0 },
        Trailers: { planned: 0, actual: 0 },
        Staff: { planned: 0, actual: 0 }
      };
      for (const e of withActuals) {
        resVariance.Tractors.planned += e.reqTractors;
        resVariance.Tractors.actual += e.actualTractors;
        resVariance.Implements.planned += e.reqImplements;
        resVariance.Implements.actual += e.actualImplements;
        resVariance.Vehicles.planned += e.reqVehicles;
        resVariance.Vehicles.actual += e.actualVehicles;
        resVariance.Sprayers.planned += e.reqSprayers;
        resVariance.Sprayers.actual += e.actualSprayers;
        resVariance.Trailers.planned += e.reqTrailers;
        resVariance.Trailers.actual += e.actualTrailers;
        resVariance.Staff.planned += e.reqStaff;
        resVariance.Staff.actual += e.actualStaff;
      }
      const resData = Object.entries(resVariance).filter(([, v]) => v.planned > 0 || v.actual > 0).map(([name, v]) => ({ name, planned: v.planned, actual: v.actual }));
      const outcomeCounts = [
        { name: "Completed", value: withActuals.filter((e) => e.actualStatus === "completed").length, fill: "#86efac" },
        { name: "Partial", value: withActuals.filter((e) => e.actualStatus === "partial").length, fill: "#fcd34d" },
        { name: "Abandoned", value: withActuals.filter((e) => e.actualStatus === "abandoned").length, fill: "#f87171" }
      ].filter((o) => o.value > 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-4 h-4 text-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-foreground/80", children: [
            "Plan vs Actual — ",
            withActuals.length,
            " task",
            withActuals.length !== 1 ? "s" : "",
            " recorded"
          ] }),
          slipCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("ml-auto text-xs font-bold px-2 py-0.5 rounded-full", Number(avgSlip) > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"), children: [
            "Avg slip: ",
            Number(avgSlip) > 0 ? `+${avgSlip}d` : Number(avgSlip) < 0 ? `${avgSlip}d early` : "On time"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4", children: "Date Slip Distribution" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: slipData.filter((d) => d.count > 0), margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} task${v !== 1 ? "s" : ""}`, ""] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", radius: [4, 4, 0, 0], name: "Tasks", children: slipData.filter((d) => d.count > 0).map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.fill }, i)) })
            ] }) })
          ] }),
          resData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4", children: "Resource Planned vs Actual (totals)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: resData, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "planned", fill: "#a5b4fc", name: "Planned", radius: [2, 2, 0, 0] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "actual", fill: "#6366f1", name: "Actual", radius: [2, 2, 0, 0] })
            ] }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4", children: "Task Outcomes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: outcomeCounts, layout: "vertical", margin: { left: 16, right: 16, top: 4, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { horizontal: false, stroke: "currentColor", strokeOpacity: 0.06 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 80 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} task${v !== 1 ? "s" : ""}`, ""] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], name: "Tasks", children: outcomeCounts.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.fill }, i)) })
            ] }) })
          ] })
        ] })
      ] });
    })()
  ] });
}
export {
  ResourcesPage as default
};
