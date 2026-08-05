import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, B as Building2, U as FlaskConical, M as MapPin, j as jsxRuntimeExports, p as Link, d as Button, K as Map, T as Plus, n as Card, I as Input, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, N as DialogMutationError } from "./index-iq9ilfc7.js";
import { W as Warehouse, g as TreePine, U as Users, A as AppLayout } from "./AppLayout-eELRhB5g.js";
import { B as Badge } from "./badge-BJoMVK-j.js";
import { T as Textarea } from "./textarea-MP1xSHBo.js";
import { S as StorageLocationMapPicker } from "./StorageLocationMapPicker-CaUGp5nc.js";
import { Q as QRCodeSVG } from "./index-DbeNW1rb.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { T as Tractor } from "./tractor-B2-VvUem.js";
import { L as LayoutGrid } from "./layout-grid-Cr0Z9NI_.js";
import { S as Search } from "./search-Cc8hbmm7.js";
import { E as Eye } from "./eye-D_-66IgA.js";
import { Q as QrCode } from "./qr-code-BC4R--mU.js";
import { P as Pencil } from "./pencil-BgZ2DFIC.js";
import { T as Trash2 } from "./trash-2-BchfcGNz.js";
import { P as Printer } from "./printer-CKt0INUb.js";
import "./use-safe-clerk-D6uzyRTb.js";
import "./database-C9sXLKeU.js";
import "./shield-alert-ColxLlz4.js";
import "./triangle-alert-D6G2sUlj.js";
import "./shield-check-J8KLQ7YF.js";
const LABEL_CSS = `
  @page{size:62mm 90mm;margin:0}
  body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}
  .brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em;margin-bottom:3px}
  .divider{border:none;border-top:1px solid #e5e7eb;margin:4px 0}
  .farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}
  svg{display:block;margin:0 auto}
  .code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}
  .iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}
  .desc{font-size:9px;color:#9ca3af;margin-top:2px}
  .hint{font-size:8px;color:#d1d5db;margin-top:4px}
`;
const LOCATION_TYPES = [
  { value: "livestock_building", label: "Livestock Building", icon: Building2, colour: "bg-blue-100 text-blue-800" },
  { value: "grain_store", label: "Crop & Feed Store", icon: Warehouse, colour: "bg-yellow-100 text-yellow-800" },
  { value: "workshop", label: "Equipment & Workshop", icon: Tractor, colour: "bg-orange-100 text-orange-800" },
  { value: "chemical_store", label: "Chemical & Fuel Store", icon: FlaskConical, colour: "bg-red-100 text-red-800" },
  { value: "yard", label: "Outdoor Area / Yard", icon: TreePine, colour: "bg-green-100 text-green-800" },
  { value: "field", label: "Field", icon: TreePine, colour: "bg-lime-100 text-lime-800" },
  { value: "welfare_facility", label: "Welfare Facility", icon: Users, colour: "bg-purple-100 text-purple-800" },
  { value: "office", label: "Office / Farm Building", icon: LayoutGrid, colour: "bg-slate-100 text-slate-700" },
  { value: "other", label: "Other", icon: MapPin, colour: "bg-gray-100 text-gray-700" }
];
const typeMap = Object.fromEntries(LOCATION_TYPES.map((t) => [t.value, t]));
const EMPTY_FORM = {
  name: "",
  locationType: "",
  description: "",
  notes: "",
  isActive: true,
  pin: null
};
function FarmLocationsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = reactExports.useState("");
  const [filterType, setFilterType] = reactExports.useState("");
  const [showInactive, setShowInactive] = reactExports.useState(false);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_FORM);
  const [showMap, setShowMap] = reactExports.useState(false);
  const [qrLoc, setQrLoc] = reactExports.useState(null);
  const printRef = reactExports.useRef(null);
  const { data: farmData } = useQuery({
    queryKey: ["farm-for-print", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmData?.record?.name ?? "Farm";
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/farm-locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name,
        locationType: body.locationType,
        description: body.description,
        notes: body.notes,
        isActive: body.isActive,
        latitude: body.pin?.lat ?? null,
        longitude: body.pin?.lng ?? null
      })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-locations", farmId] });
      closeDialog();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/farm-locations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name,
        locationType: body.locationType,
        description: body.description,
        notes: body.notes,
        isActive: body.isActive,
        latitude: body.pin?.lat ?? null,
        longitude: body.pin?.lng ?? null
      })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-locations", farmId] });
      closeDialog();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/farm-locations/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-locations", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowMap(false);
    setDialogOpen(true);
  }
  function openEdit(loc) {
    setEditing(loc);
    setForm({
      name: loc.name,
      locationType: loc.locationType,
      description: loc.description ?? "",
      notes: loc.notes ?? "",
      isActive: loc.isActive,
      pin: loc.latitude != null && loc.longitude != null ? { lat: loc.latitude, lng: loc.longitude } : null
    });
    setShowMap(loc.latitude != null && loc.longitude != null);
    setDialogOpen(true);
  }
  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowMap(false);
    createMut.reset();
    updateMut.reset();
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, body: form });
    } else {
      createMut.mutate(form);
    }
  }
  const filtered = locations.filter((loc) => {
    if (!showInactive && !loc.isActive) return false;
    if (filterType && loc.locationType !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return loc.name.toLowerCase().includes(s) || (loc.description ?? "").toLowerCase().includes(s);
    }
    return true;
  });
  const activeCount = locations.filter((l) => l.isActive).length;
  const pinnedCount = locations.filter((l) => l.latitude != null).length;
  const byType = LOCATION_TYPES.map((t) => ({
    ...t,
    count: locations.filter((l) => l.locationType === t.value && l.isActive).length
  })).filter((t) => t.count > 0);
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64 text-foreground/50", children: "Please select a farm to manage locations." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-6 h-6 text-primary" }),
            "Farm Buildings & Areas"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 mt-1", children: "Define the buildings, yards, and areas on your farm. These are used across Cleaning, Pest Control, Risk Assessments, and COSHH to build a complete location history." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          pinnedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/farm-map", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-4 h-4" }),
            " View Map"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            " Add Location"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: activeCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-foreground/60", children: "Active Locations" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: pinnedCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-foreground/60", children: "Map Pins Set" })
        ] }),
        byType.slice(0, 2).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: t.count }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-foreground/60", children: t.label })
        ] }, t.value))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-0 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex flex-col sm:flex-row gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search locations…",
                className: "pl-9 bg-white",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
              value: filterType,
              onChange: (e) => setFilterType(e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All types" }),
                LOCATION_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm text-foreground/70 cursor-pointer whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: showInactive,
                onChange: (e) => setShowInactive(e.target.checked),
                className: "rounded"
              }
            ),
            "Show inactive"
          ] })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-foreground/50", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-foreground/50", children: locations.length === 0 ? "No locations defined yet. Add your first farm building or area to get started." : "No locations match your search." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: filtered.map((loc) => {
          const t = typeMap[loc.locationType];
          const Icon = t?.icon ?? MapPin;
          const hasPIn = loc.latitude != null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-lg ${t?.colour ?? "bg-gray-100"} flex-shrink-0`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: loc.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: t?.label ?? loc.locationType }),
                hasPIn && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3" }),
                  " Pinned"
                ] }),
                !loc.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Inactive" })
              ] }),
              loc.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 mt-0.5 truncate", children: loc.description }),
              hasPIn && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 mt-0.5", children: [
                loc.latitude.toFixed(5),
                ", ",
                loc.longitude.toFixed(5)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRecord(loc), title: "View details", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setQrLoc(loc), title: "QR code", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(loc), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeleteId(loc.id), className: "text-destructive hover:text-destructive", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
            ] })
          ] }, loc.id);
        }) })
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Location" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.name ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Location Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: typeMap[viewRecord.locationType]?.label ?? viewRecord.locationType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.description ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Latitude" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.latitude ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Longitude" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.longitude ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isActive ? "Active" : "Inactive" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (o) => {
      if (!o) closeDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-primary" }),
          editing ? "Edit Location" : "Add Farm Location"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Define a building or area on your farm. Once added, it will appear in dropdown selectors across Cleaning, Pest Control, COSHH, and Risk Assessments." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
            "Location Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. Dairy Parlour, Cattle Shed 2, Grain Store",
              value: form.name,
              onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
            "Location Type ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
              value: form.locationType,
              onChange: (e) => setForm((f) => ({ ...f, locationType: e.target.value })),
              required: true,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select type…" }),
                LOCATION_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. 200-cow loose housing, cleaned between groups",
              value: form.description,
              onChange: (e) => setForm((f) => ({ ...f, description: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              rows: 2,
              placeholder: "Any additional information about this location…",
              value: form.notes,
              onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "w-full flex items-center justify-between px-3 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium text-foreground/70",
              onClick: () => setShowMap((v) => !v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4" }),
                  "Map pin (optional)",
                  form.pin && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary font-normal", children: [
                    "— ",
                    form.pin.lat.toFixed(5),
                    ", ",
                    form.pin.lng.toFixed(5)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/40 text-xs", children: showMap ? "▲ Hide" : "▼ Show" })
              ]
            }
          ),
          showMap && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mb-2", children: "Click on the map to drop a pin. Drag the pin to adjust its position. Use the locate button to jump to your current GPS position." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StorageLocationMapPicker,
              {
                value: form.pin,
                onChange: (pin) => setForm((f) => ({ ...f, pin })),
                mapHeight: 260
              }
            )
          ] })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: form.isActive,
              onChange: (e) => setForm((f) => ({ ...f, isActive: e.target.checked })),
              className: "rounded"
            }
          ),
          "Active (appears in dropdowns)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: closeDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMut.isPending || updateMut.isPending, children: editing ? "Save Changes" : "Add Location" })
        ] })
      ] })
    ] }) }),
    qrLoc && (() => {
      const t = typeMap[qrLoc.locationType];
      const locCode = `LOC-${String(qrLoc.id).padStart(4, "0")}`;
      const qrValue = `BDE:F${farmId}:${locCode}`;
      function handlePrint() {
        if (!printRef.current) return;
        openPrintWindow(`<html><head><title>Location Label — ${locCode}</title><style>${LABEL_CSS}</style></head><body>${printRef.current.innerHTML}</body></html>`);
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setQrLoc(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-4 h-4 text-teal-600" }),
          " Location QR Label"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 border rounded-xl bg-white px-5 py-3 shadow-sm", ref: printRef, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "brand text-[11px] font-bold text-teal-700 tracking-widest mt-1", children: "🌿 BDE Farm Trac" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "divider w-full border-gray-200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "farm text-sm font-bold text-gray-900 uppercase tracking-wider", children: farmName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { value: qrValue, size: 180, bgColor: "#ffffff", fgColor: "#0f766e", level: "M" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "code font-mono text-xl font-bold tracking-widest text-teal-700 mt-1", children: locCode }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "iname text-sm font-semibold text-gray-700", children: qrLoc.name }),
          t && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "desc text-xs text-gray-400", children: t.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hint text-[10px] text-gray-300 mb-1", children: "Scan to identify farm location" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setQrLoc(null), children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            " Print Label"
          ] })
        ] })
      ] }) });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Location?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This will remove the location from the registry. Existing records that referenced this location by name will not be affected." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            onClick: () => deleteId !== null && deleteMut.mutate(deleteId),
            disabled: deleteMut.isPending,
            children: "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  FarmLocationsPage as default
};
