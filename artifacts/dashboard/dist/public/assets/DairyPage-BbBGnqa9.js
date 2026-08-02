import { q as createLucideIcon, t as useQueryClient, a as useToast, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, d as LoaderCircle, T as FlaskConical, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, b as useAppStore, R as Redirect, Q as React, m as Card, n as CardContent, M as MapPin, ay as Check, B as Building2 } from "./index-D3H5W-P7.js";
import { P as Package, u as useSafeUser } from "./use-safe-clerk-CcZe2WCU.js";
import { j as Truck, A as AppLayout, T as TrendingUp, c as ClipboardList } from "./AppLayout-we-CWlqp.js";
import { T as TabBar, a as TabButton } from "./tab-button-DQN4lFnh.js";
import { R as RecordAttachments } from "./RecordAttachments-BhW_uBX_.js";
import { D as DocAttach } from "./DocAttach-CgxDc9vs.js";
import { T as Textarea } from "./textarea-mA8VmOCt.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BoNYmsrx.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-B0Cu7dRt.js";
import { Q as QrCode, a as QRCodeSVG } from "./index-D2ykYRu-.js";
import { u as useFarmMembers } from "./use-farm-members-DhOOimlL.js";
import { S as StaffSelect } from "./staff-select-2Akoue9I.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CmoAZVO7.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { V as VMD_MEDICINES } from "./vmdMedicines-mq70NSvP.js";
import { S as ShoppingCart } from "./shopping-cart-FGfKfw6D.js";
import { C as CircleX } from "./circle-x-C9eRUxX2.js";
import { C as CircleCheck } from "./circle-check-hc9Ga-tm.js";
import { a as Clock } from "./database-B7ZGashD.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-DgRcAdK_.js";
import { P as Printer } from "./printer-SaIiU-5G.js";
import { C as ChevronUp } from "./chevron-up-Ctm2G01_.js";
import { T as TriangleAlert } from "./triangle-alert-IjI2B0qK.js";
import { C as ChevronRight } from "./tractor-CRuQBNn1.js";
import { P as Pencil } from "./pencil-D4IFUNZ_.js";
import { F as FileDown } from "./file-down-DZJvquFC.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, _ as ReferenceLine, B as Bar, L as Legend, C as Cell } from "./generateCategoricalChart-CbxZdpbl.js";
import { C as ComposedChart } from "./ComposedChart-DQ0ObBR-.js";
import { C as CartesianGrid } from "./CartesianGrid-r_88a7rk.js";
import { L as Line } from "./Line-Cr-09irw.js";
import { E as Eye } from "./eye-CnANy0t-.js";
import { D as Download } from "./download-OillvfwM.js";
import { P as Paperclip } from "./paperclip-pFpcRF01.js";
import { D as Droplets } from "./shield-alert-GJUj-aTE.js";
import { T as TrendingDown } from "./trending-down-DGGT3tBu.js";
import { C as ChevronLeft } from "./chevron-left-DskCZui_.js";
import { S as Sparkles } from "./sparkles-CwVCmznJ.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-DAEqlp4u.js";
import { P as PieChart, a as Pie } from "./PieChart-Cmt-ggst.js";
import { R as Receipt } from "./receipt-BVVvbuX_.js";
import { T as Thermometer } from "./thermometer-Yk4hO0Is.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-DDBUNfDt.js";
import { B as BadgeCheck } from "./badge-check-DsRF1eCQ.js";
const __iconNode = [
  ["path", { d: "m16 16 2 2 4-4", key: "gfu2re" }],
  [
    "path",
    {
      d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
      key: "e7tb2h"
    }
  ],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "12", key: "a4e8g8" }]
];
const PackageCheck = createLucideIcon("package-check", __iconNode);
const BASE$1 = "/dashboard/";
const api$1 = (path) => `${BASE$1}api/${path}`;
const DAIRY_LABELS = {
  cattle: "Cattle Dairy",
  sheep: "Sheep Dairy",
  goat: "Goat Dairy",
  "organic-cattle": "Organic Cattle Dairy",
  "organic-sheep": "Organic Sheep Dairy",
  "organic-goat": "Organic Goat Dairy"
};
const USAGE_CONTEXTS = [
  { value: "milking", label: "Milking session" },
  { value: "cip-cleaning", label: "CIP cleaning (pipeline/clusters)" },
  { value: "teat-prep", label: "Teat preparation (pre/post dip)" },
  { value: "calving-kidding", label: "Calving / kidding" },
  { value: "equipment-cleaning", label: "Equipment / surface cleaning" },
  { value: "general", label: "General dairy use" }
];
const URGENCY_META = {
  low: { label: "Low", colour: "bg-gray-100 text-gray-700 border-gray-200" },
  normal: { label: "Normal", colour: "bg-blue-50 text-blue-700 border-blue-200" },
  urgent: { label: "Urgent", colour: "bg-amber-50 text-amber-700 border-amber-200" },
  critical: { label: "Critical", colour: "bg-red-50 text-red-700 border-red-200" }
};
const STATUS_META = {
  pending: { label: "Pending", icon: Clock, colour: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", icon: CircleCheck, colour: "bg-blue-50 text-blue-700 border-blue-200" },
  ordered: { label: "Ordered", icon: Truck, colour: "bg-purple-50 text-purple-700 border-purple-200" },
  received: { label: "Received", icon: CircleCheck, colour: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Rejected", icon: CircleX, colour: "bg-red-50 text-red-700 border-red-200" }
};
const today$1 = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
function LowStockAlert({ ppeItems, chemItems }) {
  const lowPpe = ppeItems.filter((p) => p.quantityInStock <= 5);
  const lowChem = chemItems.filter((c) => (c.currentQty ?? 0) <= 5);
  if (!lowPpe.length && !lowChem.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 flex-shrink-0" }),
      "Low stock alert"
    ] }),
    lowPpe.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-6 text-xs", children: [
      "PPE — ",
      p.ppeType,
      p.description ? ` (${p.description})` : "",
      ": ",
      p.quantityInStock,
      " items remaining"
    ] }, p.id)),
    lowChem.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-6 text-xs", children: [
      "Chemical — ",
      c.productName,
      ": ",
      c.currentQty ?? 0,
      " ",
      c.unit || "units",
      " remaining"
    ] }, c.id))
  ] });
}
function DairySuppliesTab({ farmId, dairyType }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [drawdownOpen, setDrawdownOpen] = reactExports.useState(false);
  const [restockOpen, setRestockOpen] = reactExports.useState(false);
  const [showHistory, setShowHistory] = reactExports.useState(false);
  const [historyYear, setHistoryYear] = reactExports.useState("all");
  const [historyItemType, setHistoryItemType] = reactExports.useState("all");
  const blankDrawdown = { drawdownDate: today$1(), itemType: "ppe", itemName: "", ppeStockItemId: "", chemStockItemId: "", quantityUsed: "", unit: "items", usedBy: "", usageContext: "", notes: "" };
  const [dForm, setDForm] = reactExports.useState(blankDrawdown);
  const blankRestock = { requestDate: today$1(), itemType: "ppe", itemName: "", ppeStockItemId: "", chemStockItemId: "", requestedQty: "", unit: "items", urgency: "normal", requestedBy: "", supplierName: "", reason: "" };
  const [rForm, setRForm] = reactExports.useState(blankRestock);
  const stockQ = useQuery({
    queryKey: ["dairy-supplies-stock", farmId],
    queryFn: () => fetch(api$1(`farms/${farmId}/dairy-supplies/stock`)).then((r) => r.json())
  });
  const staffQ = useQuery({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api$1(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then((r) => r.json())
  });
  const staffNames = staffQ.data?.names ?? [];
  const abrSuppliersQ = useQuery({
    queryKey: ["dairy-abr-suppliers", farmId],
    queryFn: () => fetch(api$1(`farms/${farmId}/dairy/abr-suppliers`), { credentials: "include" }).then((r) => r.json())
  });
  const supplierNames = (Array.isArray(abrSuppliersQ.data) ? abrSuppliersQ.data : []).map((s) => s.companyName);
  const drawdownsQ = useQuery({
    queryKey: ["dairy-supplies-drawdowns", farmId, dairyType],
    queryFn: () => fetch(api$1(`farms/${farmId}/dairy-supplies/drawdowns?dairyType=${dairyType}`)).then((r) => r.json())
  });
  const requestsQ = useQuery({
    queryKey: ["dairy-restock-requests", farmId, dairyType],
    queryFn: () => fetch(api$1(`farms/${farmId}/dairy-supplies/restock-requests?dairyType=${dairyType}`)).then((r) => r.json())
  });
  const ppeItems = stockQ.data?.ppeItems ?? [];
  const chemItems = stockQ.data?.chemItems ?? [];
  const drawdowns = drawdownsQ.data?.drawdowns ?? [];
  const requests = requestsQ.data?.requests ?? [];
  const addDrawdown = useMutation({
    mutationFn: (body) => fetch(api$1(`farms/${farmId}/dairy-supplies/drawdowns`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, dairyType }) }).then((r) => {
      if (!r.ok) throw new Error("Request failed");
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-supplies-drawdowns", farmId, dairyType] });
      qc.invalidateQueries({ queryKey: ["dairy-supplies-stock", farmId] });
      setDrawdownOpen(false);
      toast({ title: "Usage logged" });
    },
    onError: () => toast({ title: "Failed to log usage", variant: "destructive" })
  });
  const delDrawdown = useMutation({
    mutationFn: (id) => fetch(api$1(`farms/${farmId}/dairy-supplies/drawdowns/${id}`), { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error("Request failed");
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-supplies-drawdowns", farmId, dairyType] });
      qc.invalidateQueries({ queryKey: ["dairy-supplies-stock", farmId] });
      toast({ title: "Record removed" });
    },
    onError: () => toast({ title: "Failed to remove record", variant: "destructive" })
  });
  const addRequest = useMutation({
    mutationFn: (body) => fetch(api$1(`farms/${farmId}/dairy-supplies/restock-requests`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, dairyType }) }).then((r) => {
      if (!r.ok) throw new Error("Request failed");
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock-requests", farmId, dairyType] });
      setRestockOpen(false);
      toast({ title: "Restock request raised" });
    },
    onError: () => toast({ title: "Failed to raise request", variant: "destructive" })
  });
  const updateRequest = useMutation({
    mutationFn: ({ id, ...body }) => fetch(api$1(`farms/${farmId}/dairy-supplies/restock-requests/${id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => {
      if (!r.ok) throw new Error("Request failed");
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock-requests", farmId, dairyType] });
      toast({ title: "Request updated" });
    },
    onError: () => toast({ title: "Failed to update request", variant: "destructive" })
  });
  const delRequest = useMutation({
    mutationFn: (id) => fetch(api$1(`farms/${farmId}/dairy-supplies/restock-requests/${id}`), { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error("Request failed");
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock-requests", farmId, dairyType] });
      toast({ title: "Request deleted" });
    },
    onError: () => toast({ title: "Failed to delete request", variant: "destructive" })
  });
  const historyYears = reactExports.useMemo(() => {
    const s = new Set(drawdowns.map((d) => d.drawdownDate.slice(0, 4)));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [drawdowns]);
  const filteredHistory = reactExports.useMemo(() => {
    return drawdowns.filter((d) => {
      if (historyYear !== "all" && !d.drawdownDate.startsWith(historyYear)) return false;
      if (historyItemType !== "all" && d.itemType !== historyItemType) return false;
      return true;
    });
  }, [drawdowns, historyYear, historyItemType]);
  requests.filter((r) => r.status === "pending").length;
  const activeCount = requests.filter((r) => r.status !== "received" && r.status !== "rejected").length;
  function handleDrawdownItemType(t) {
    const unit = t === "ppe" ? "items" : "litres";
    setDForm((p) => ({ ...p, itemType: t, unit, itemName: "", ppeStockItemId: "", chemStockItemId: "" }));
  }
  function handleDrawdownPpeSelect(id) {
    const item = ppeItems.find((p) => String(p.id) === id);
    if (item) setDForm((p) => ({ ...p, ppeStockItemId: id, itemName: [item.ppeType, item.description, item.size].filter(Boolean).join(" — ") }));
    else setDForm((p) => ({ ...p, ppeStockItemId: id }));
  }
  function handleDrawdownChemSelect(id) {
    const item = chemItems.find((c) => String(c.id) === id);
    if (item) setDForm((p) => ({ ...p, chemStockItemId: id, itemName: item.productName }));
    else setDForm((p) => ({ ...p, chemStockItemId: id }));
  }
  function printReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const label = DAIRY_LABELS[dairyType] || dairyType;
    const rows = filteredHistory.map((d) => `<tr><td>${fmt(d.drawdownDate)}</td><td>${d.itemType === "ppe" ? "PPE" : "Chemical"}</td><td>${d.itemName}</td><td>${d.quantityUsed} ${d.unit}</td><td>${USAGE_CONTEXTS.find((c) => c.value === d.usageContext)?.label || d.usageContext || "—"}</td><td>${d.usedBy || "—"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Dairy Supply Usage — ${label}</title><style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{font-size:14px}h2{font-size:11px;color:#555}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e5e7eb;padding:4px 6px;text-align:left}th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase}.note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:12px}</style></head><body><h1>Dairy Supply Usage Log — ${label}</h1><h2>Printed: ${printedDate}${historyYear !== "all" ? ` · Year: ${historyYear}` : ""}${historyItemType !== "all" ? ` · Type: ${historyItemType === "ppe" ? "PPE" : "Chemical"}` : ""}</h2><table><tr><th>Date</th><th>Type</th><th>Item</th><th>Qty Used</th><th>Context</th><th>Used By</th></tr>${rows || "<tr><td colspan='6'>No records</td></tr>"}</table><p class="note">Dairy supply usage log — BDE Farm Trac. Retain for 3 years. Printed: ${printedDate}.</p></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LowStockAlert, { ppeItems, chemItems }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-blue-600" }),
          "Available Supplies"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setRForm(blankRestock);
            setRestockOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3.5 h-3.5 mr-1" }),
            "Request Restock"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
            setDForm(blankDrawdown);
            setDrawdownOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
            "Log Usage"
          ] })
        ] })
      ] }),
      stockQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-gray-400" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2", children: "PPE" }),
          ppeItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No PPE stock items set up. Add items in the PPE Store." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: ppeItems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: p.ppeType }),
              p.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500 ml-1 text-xs", children: [
                "— ",
                p.description
              ] }),
              p.size && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 ml-1 text-xs", children: [
                "(",
                p.size,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold tabular-nums ${p.quantityInStock <= 5 ? "text-red-600" : p.quantityInStock <= 15 ? "text-amber-600" : "text-green-700"}`, children: [
              p.quantityInStock,
              " items"
            ] })
          ] }, p.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2", children: "Chemicals" }),
          chemItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No chemical stock items set up. Add products in the Chemical Store." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: chemItems.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.productName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold tabular-nums ${(c.currentQty ?? 0) <= 5 ? "text-red-600" : (c.currentQty ?? 0) <= 20 ? "text-amber-600" : "text-green-700"}`, children: c.currentQty != null ? `${Number(c.currentQty).toLocaleString("en-GB", { maximumFractionDigits: 1 })} ${c.unit || "L"}` : "—" })
          ] }, c.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-4 h-4 text-purple-600" }),
          "Restock Requests",
          activeCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold", children: activeCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setRForm(blankRestock);
          setRestockOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "New Request"
        ] })
      ] }),
      requestsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-gray-400" }) }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "No restock requests yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Item" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Qty Requested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Urgency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Requested By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: requests.map((r) => {
          const sm = STATUS_META[r.status] ?? STATUS_META.pending;
          const um = URGENCY_META[r.urgency] ?? URGENCY_META.normal;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.requestDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${r.itemType === "ppe" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`, children: [
              r.itemType === "ppe" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3" }),
              r.itemType === "ppe" ? "PPE" : "Chemical"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: r.itemName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
              r.requestedQty,
              " ",
              r.unit
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded text-xs font-medium border ${um.colour}`, children: um.label }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-500", children: r.requestedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${sm.colour}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(sm.icon, { className: "w-3 h-3" }),
              sm.label
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
              r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-6 text-xs px-2", onClick: () => updateRequest.mutate({ id: r.id, status: "approved" }), children: "Approve" }),
              r.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-6 text-xs px-2", onClick: () => updateRequest.mutate({ id: r.id, status: "ordered" }), children: "Mark Ordered" }),
              r.status === "ordered" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-6 text-xs px-2 text-green-700 border-green-300", onClick: () => updateRequest.mutate({ id: r.id, status: "received" }), children: "Mark Received" }),
              r.status !== "received" && r.status !== "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs px-2 text-red-500", onClick: () => updateRequest.mutate({ id: r.id, status: "rejected" }), children: "Reject" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs text-red-400 px-1", onClick: () => delRequest.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
            ] }) })
          ] }, r.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", onClick: () => setShowHistory((h) => !h), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Usage History (",
          drawdowns.length,
          " records)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: (e) => {
            e.stopPropagation();
            printReport();
          }, className: "h-7", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
            "Print"
          ] }),
          showHistory ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })
        ] })
      ] }),
      showHistory && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: historyYear, onValueChange: setHistoryYear, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
              historyYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: historyItemType, onValueChange: setHistoryItemType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All types" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ppe", children: "PPE only" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chemical", children: "Chemical only" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
            filteredHistory.length,
            " records"
          ] })
        ] }),
        drawdownsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-gray-400" }) }) : filteredHistory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: 'No usage records yet. Use "Log Usage" to record PPE or chemical consumption.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Qty Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Context" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Used By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Del" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredHistory.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(d.drawdownDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${d.itemType === "ppe" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`, children: [
              d.itemType === "ppe" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3" }),
              d.itemType === "ppe" ? "PPE" : "Chemical"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: d.itemName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3 tabular-nums", children: [
              d.quantityUsed,
              " ",
              d.unit
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-500 capitalize", children: USAGE_CONTEXTS.find((c) => c.value === d.usageContext)?.label || d.usageContext || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-500", children: d.usedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-400 text-xs max-w-[120px] truncate", children: d.notes || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-400 h-7 w-7 p-0", onClick: () => delDrawdown.mutate(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) }) })
          ] }, d.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: drawdownOpen, onOpenChange: setDrawdownOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "34rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Supply Usage" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: dForm.drawdownDate, onChange: (e) => setDForm((p) => ({ ...p, drawdownDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Item Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dForm.itemType, onValueChange: handleDrawdownItemType, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "ppe", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 inline mr-1" }),
                  "PPE"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "chemical", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3.5 h-3.5 inline mr-1" }),
                  "Chemical"
                ] })
              ] })
            ] })
          ] })
        ] }),
        dForm.itemType === "ppe" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "PPE Item (from stock)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dForm.ppeStockItemId, onValueChange: handleDrawdownPpeSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from PPE store..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__freeform__", children: "— Enter manually below —" }),
                ppeItems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                  p.ppeType,
                  p.description ? ` — ${p.description}` : "",
                  p.size ? ` (${p.size})` : "",
                  " · ",
                  p.quantityInStock,
                  " in stock"
                ] }, p.id))
              ] })
            ] })
          ] }),
          (dForm.ppeStockItemId === "__freeform__" || !dForm.ppeStockItemId) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Item Name (manual)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Nitrile gloves (medium)", value: dForm.itemName, onChange: (e) => setDForm((p) => ({ ...p, itemName: e.target.value })) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Chemical (from store)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dForm.chemStockItemId, onValueChange: handleDrawdownChemSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from chemical store..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__freeform__", children: "— Enter manually below —" }),
                chemItems.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                  c.productName,
                  c.currentQty != null ? ` · ${Number(c.currentQty).toFixed(1)} ${c.unit || "L"} in stock` : ""
                ] }, c.id))
              ] })
            ] })
          ] }),
          (dForm.chemStockItemId === "__freeform__" || !dForm.chemStockItemId) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Chemical Name (manual)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. CIP Acid Cleaner", value: dForm.itemName, onChange: (e) => setDForm((p) => ({ ...p, itemName: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Quantity Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.1", placeholder: "0", value: dForm.quantityUsed, onChange: (e) => setDForm((p) => ({ ...p, quantityUsed: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dForm.unit, onValueChange: (v) => setDForm((p) => ({ ...p, unit: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "items", children: "items" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pairs", children: "pairs" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "litres", children: "litres" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ml", children: "ml" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "kg", children: "kg" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "g", children: "g" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Usage Context" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dForm.usageContext, onValueChange: (v) => setDForm((p) => ({ ...p, usageContext: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select context..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: USAGE_CONTEXTS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Used By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Staff name or initials", value: dForm.usedBy, onChange: (e) => setDForm((p) => ({ ...p, usedBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Any observations...", value: dForm.notes, onChange: (e) => setDForm((p) => ({ ...p, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDrawdownOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: addDrawdown.isPending || !dForm.itemName && !dForm.ppeStockItemId && !dForm.chemStockItemId || !dForm.quantityUsed, onClick: () => {
          const ppeId = dForm.itemType === "ppe" && dForm.ppeStockItemId && dForm.ppeStockItemId !== "__freeform__" ? Number(dForm.ppeStockItemId) : void 0;
          const chemId = dForm.itemType === "chemical" && dForm.chemStockItemId && dForm.chemStockItemId !== "__freeform__" ? Number(dForm.chemStockItemId) : void 0;
          const name = dForm.itemName || (ppeId ? ppeItems.find((p) => p.id === ppeId)?.ppeType : "") || (chemId ? chemItems.find((c) => c.id === chemId)?.productName : "") || "";
          addDrawdown.mutate({ ...dForm, itemName: name, ppeStockItemId: ppeId, chemStockItemId: chemId, quantityUsed: dForm.quantityUsed });
        }, children: addDrawdown.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Log Usage" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: restockOpen, onOpenChange: setRestockOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "34rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Request Restock" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date Needed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: rForm.requestDate, onChange: (e) => setRForm((p) => ({ ...p, requestDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Item Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rForm.itemType, onValueChange: (t) => setRForm((p) => ({ ...p, itemType: t, unit: t === "ppe" ? "items" : "litres", itemName: "" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "ppe", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 inline mr-1" }),
                  "PPE"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "chemical", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3.5 h-3.5 inline mr-1" }),
                  "Chemical"
                ] })
              ] })
            ] })
          ] })
        ] }),
        rForm.itemType === "ppe" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "PPE Item" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rForm.ppeStockItemId, onValueChange: (id) => {
            const it = ppeItems.find((p) => String(p.id) === id);
            setRForm((p) => ({ ...p, ppeStockItemId: id, itemName: it ? [it.ppeType, it.description, it.size].filter(Boolean).join(" — ") : p.itemName }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select or enter below..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__freeform__", children: "— Enter manually below —" }),
              ppeItems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                p.ppeType,
                p.description ? ` — ${p.description}` : "",
                p.size ? ` (${p.size})` : ""
              ] }, p.id))
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Chemical" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rForm.chemStockItemId, onValueChange: (id) => {
            const it = chemItems.find((c) => String(c.id) === id);
            setRForm((p) => ({ ...p, chemStockItemId: id, itemName: it ? it.productName : p.itemName }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select or enter below..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__freeform__", children: "— Enter manually below —" }),
              chemItems.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.productName }, c.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
            "Item Name ",
            (rForm.ppeStockItemId === "__freeform__" || rForm.chemStockItemId === "__freeform__" || !rForm.ppeStockItemId && !rForm.chemStockItemId) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Exact item name / product", value: rForm.itemName, onChange: (e) => setRForm((p) => ({ ...p, itemName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Quantity Required" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", placeholder: "0", value: rForm.requestedQty, onChange: (e) => setRForm((p) => ({ ...p, requestedQty: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rForm.unit, onValueChange: (v) => setRForm((p) => ({ ...p, unit: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "items", children: "items" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "boxes", children: "boxes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "litres", children: "litres" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "kg", children: "kg" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "drums", children: "drums" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Urgency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rForm.urgency, onValueChange: (v) => setRForm((p) => ({ ...p, urgency: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low — within a month" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "normal", children: "Normal — within 2 weeks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgent", children: "Urgent — within 3 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical — needed immediately" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Requested By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "ds-restock-staff", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "ds-restock-staff", placeholder: "Select or type name…", value: rForm.requestedBy, onChange: (e) => setRForm((p) => ({ ...p, requestedBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
            "Preferred Supplier ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "ds-restock-supplier", children: supplierNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "ds-restock-supplier", placeholder: "Supplier name", value: rForm.supplierName, onChange: (e) => setRForm((p) => ({ ...p, supplierName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reason / Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Why is this needed? Current stock level?", value: rForm.reason, onChange: (e) => setRForm((p) => ({ ...p, reason: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRestockOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: addRequest.isPending || !rForm.itemName || !rForm.requestedQty, onClick: () => addRequest.mutate({ ...rForm }), children: addRequest.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Raise Request" })
      ] })
    ] }) })
  ] });
}
const BASE = "/dashboard/";
const api = (path) => `${BASE}api/${path}`;
function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return v;
  }
}
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function SccBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const ok = v < 200;
  const warn = v >= 200 && v < 400;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: [
    v.toLocaleString(),
    " k/mL"
  ] });
}
function EaseScoreBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const colours = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const labels = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[v] || "bg-gray-100 text-gray-700"}`, children: [
    v,
    " — ",
    labels[v] || "Unknown"
  ] });
}
function OutcomeBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const map = { cured: "bg-green-100 text-green-800", recovered: "bg-green-100 text-green-800", "dried-off": "bg-blue-100 text-blue-800", "culled": "bg-red-100 text-red-800", chronic: "bg-amber-100 text-amber-800", ongoing: "bg-yellow-100 text-yellow-800" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || "bg-gray-100 text-gray-700"}`, children: v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ") });
}
function BcsBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const n = parseFloat(v);
  const ok = n >= 2.5 && n <= 3.5;
  const low = n < 2.5;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : low ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: v });
}
function DairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState("milk");
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Dairy Records", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dairy Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Red Tractor Dairy scheme compliance — milk recording, mastitis, calving, body condition, mobility, bulk tank, and dry cow therapy. Supports dairy cattle and water buffalo herds (both regulated as bovines under BCMS)." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "milk", onClick: () => setTab("milk"), children: "Milk Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mastitis", onClick: () => setTab("mastitis"), children: "Mastitis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "calving", onClick: () => setTab("calving"), children: "Calving" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "bcs", onClick: () => setTab("bcs"), children: "Body Condition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mobility", onClick: () => setTab("mobility"), children: "Mobility Scoring" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tank", onClick: () => setTab("tank"), children: "Bulk Tank" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "dct", onClick: () => setTab("dct"), children: "Dry Cow Therapy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "johnes", onClick: () => setTab("johnes"), children: "Johne's Monitoring" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "recording", onClick: () => setTab("recording"), children: "Recording Visits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: "Enterprise Report" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "abr-kit", onClick: () => setTab("abr-kit"), children: "ABR Kit Stock" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "scc-equipment", onClick: () => setTab("scc-equipment"), children: "SCC Equipment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "supplies", onClick: () => setTab("supplies"), children: "Supplies" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "milk" && /* @__PURE__ */ jsxRuntimeExports.jsx(MilkRecordsTab, { farmId }),
      tab === "mastitis" && /* @__PURE__ */ jsxRuntimeExports.jsx(MastitisTab, { farmId }),
      tab === "calving" && /* @__PURE__ */ jsxRuntimeExports.jsx(CalvingTab, { farmId }),
      tab === "bcs" && /* @__PURE__ */ jsxRuntimeExports.jsx(BcsTab, { farmId }),
      tab === "mobility" && /* @__PURE__ */ jsxRuntimeExports.jsx(MobilityTab, { farmId }),
      tab === "tank" && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkTankTab, { farmId }),
      tab === "dct" && /* @__PURE__ */ jsxRuntimeExports.jsx(DctTab, { farmId }),
      tab === "johnes" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairyJohnesTab, { farmId }),
      tab === "recording" && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordingVisitsTab, { farmId }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairyEnterpriseReport, { farmId }),
      tab === "abr-kit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrKitStockSection, { farmId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId })
      ] }),
      tab === "scc-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(SccEquipmentSection, { farmId, species: "cattle" }),
      tab === "supplies" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairySuppliesTab, { farmId, dairyType: "cattle" })
    ] })
  ] }) });
}
function LabResultsBadge({ status }) {
  if (!status || status === "not-applicable") return null;
  const map = {
    pending: { label: "Lab Results Pending", cls: "bg-amber-100 text-amber-800" },
    received: { label: "Lab Results Received", cls: "bg-green-100 text-green-800" },
    concern: { label: "Lab Results — Action Needed", cls: "bg-red-100 text-red-800" }
  };
  const m = map[status];
  if (!m) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`, children: m.label });
}
function MilkMonthlySummary({ records, monthLabel: monthLabel2 }) {
  const printRef = reactExports.useRef(null);
  const totalYield = records.reduce((s, r) => s + (parseFloat(r.yieldLitres || "0") || 0), 0);
  const uniqueDays = new Set(records.map((r) => r.recordDate?.slice(0, 10)).filter(Boolean)).size;
  const avgDaily = uniqueDays > 0 ? totalYield / uniqueDays : 0;
  const sccReadings = records.map((r) => r.buyerSccThousands ?? r.sccThousands).filter((v) => v != null);
  const avgScc = sccReadings.length > 0 ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;
  const abrTests = records.filter((r) => r.antibioticResidueTestResult);
  const abrPositives = abrTests.filter((r) => r.antibioticResidueTestResult === "positive").length;
  const byDay = /* @__PURE__ */ new Map();
  for (const r of records) {
    const day = r.recordDate?.slice(0, 10);
    if (!day) continue;
    const yld = parseFloat(r.yieldLitres || "0") || 0;
    const scc = r.buyerSccThousands ?? r.sccThousands ?? null;
    const ex = byDay.get(day) ?? { yield: 0, sccSum: 0, sccCount: 0 };
    byDay.set(day, {
      yield: ex.yield + yld,
      sccSum: scc != null ? ex.sccSum + scc : ex.sccSum,
      sccCount: scc != null ? ex.sccCount + 1 : ex.sccCount
    });
  }
  const chartData = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({
    day: parseInt(date.slice(8, 10)),
    date,
    yield: Math.round(v.yield * 10) / 10,
    scc: v.sccCount > 0 ? Math.round(v.sccSum / v.sccCount) : null
  }));
  const hasScc = chartData.some((d) => d.scc != null);
  function handlePrint() {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Milk Records — ${monthLabel2}</title>
      <style>body{font-family:sans-serif;font-size:13px;color:#111;padding:24px}
      h2{margin:0 0 16px}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
      .stat{border:1px solid #e5e7eb;border-radius:6px;padding:10px}
      .stat-label{font-size:11px;color:#6b7280;margin-bottom:2px}
      .stat-value{font-size:20px;font-weight:600}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;padding:6px 8px;border-bottom:2px solid #e5e7eb}
      td{padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px}
      </style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }, 400);
  }
  const sccColour = (v) => v == null ? "text-gray-400" : v > 400 ? "text-red-700" : v > 200 ? "text-amber-700" : "text-green-700";
  const sccBg = (v) => v == null ? "bg-gray-50 border-gray-200" : v > 400 ? "bg-red-50 border-red-200" : v > 200 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-md border border-gray-200 bg-white shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-4 w-4 text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-800", children: [
          "Monthly Summary — ",
          monthLabel2
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
        "Print Report"
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-8", children: "No records for this month to summarise." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: printRef, style: { display: "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
          "Milk Records — ",
          monthLabel2
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Yield" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
              " L"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Daily Average" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              uniqueDays > 0 ? Math.round(avgDaily).toLocaleString() : "—",
              " L"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Avg SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: avgScc != null ? avgScc.toLocaleString() : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "ABR Tests" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              abrTests.length,
              abrPositives > 0 ? ` (${abrPositives} pos)` : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Session" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Yield (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Temp (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "ABR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Buyer Lab Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Buyer" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.sort((a, b) => (a.recordDate ?? "").localeCompare(b.recordDate ?? "")).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: new Date(r.recordDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.sessionType ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.yieldLitres ? parseFloat(r.yieldLitres).toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.milkTemperatureCelsius ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.antibioticResidueTestResult ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: (r.buyerSccThousands ?? r.sccThousands)?.toLocaleString() ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.buyerLabResultsStatus ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.milkBuyer ?? "—" })
          ] }, r.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mb-0.5", children: "Total Yield" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-blue-800", children: [
            totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-gray-50 border border-gray-200 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Daily Average" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-800", children: [
            uniqueDays > 0 ? Math.round(avgDaily).toLocaleString() : "—",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
          ] }),
          uniqueDays > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            "across ",
            uniqueDays,
            " day",
            uniqueDays !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border px-3 py-2.5 ${sccBg(avgScc)}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mb-0.5 ${avgScc == null ? "text-gray-500" : avgScc > 400 ? "text-red-600" : avgScc > 200 ? "text-amber-600" : "text-green-600"}`, children: "Avg SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${sccColour(avgScc)}`, children: avgScc != null ? avgScc.toLocaleString() : "—" }),
          avgScc != null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs ${sccColour(avgScc)}`, children: avgScc <= 200 ? "Within threshold" : avgScc <= 400 ? "Above 200k — monitor" : "High — action needed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border px-3 py-2.5 ${abrPositives > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mb-0.5 ${abrPositives > 0 ? "text-red-600" : "text-gray-500"}`, children: "ABR Tests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${abrPositives > 0 ? "text-red-700" : "text-gray-700"}`, children: abrTests.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs ${abrPositives > 0 ? "text-red-600 font-medium" : "text-gray-400"}`, children: abrTests.length === 0 ? "No tests recorded" : abrPositives > 0 ? `${abrPositives} positive result${abrPositives > 1 ? "s" : ""}` : "All negative" })
        ] })
      ] }),
      chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide", children: [
          "Daily Yield",
          hasScc ? " & SCC Trend" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: hasScc ? 52 : 12, bottom: 0, left: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tick: { fontSize: 11, fill: "#9ca3af" }, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "yield", tick: { fontSize: 11, fill: "#9ca3af" }, tickLine: false, axisLine: false, width: 50, tickFormatter: (v) => `${v}L` }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "scc", orientation: "right", tick: { fontSize: 11, fill: "#fb923c" }, tickLine: false, axisLine: false, width: 44, tickFormatter: (v) => `${v}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              content: ({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-md shadow px-3 py-2 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700 mb-1", children: (/* @__PURE__ */ new Date(d.date + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) }),
                  d.yield > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-600", children: [
                    "Yield: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      d.yield.toLocaleString(),
                      " L"
                    ] })
                  ] }),
                  d.scc != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-orange-500", children: [
                    "SCC: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      d.scc.toLocaleString(),
                      " k/mL"
                    ] })
                  ] })
                ] });
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "yield", dataKey: "yield", fill: "#3b82f6", fillOpacity: 0.8, radius: [3, 3, 0, 0], name: "Yield (L)", maxBarSize: 32 }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "scc", type: "monotone", dataKey: "scc", stroke: "#f97316", strokeWidth: 2.5, dot: { r: 3.5, fill: "#f97316", strokeWidth: 0 }, connectNulls: true, name: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { yAxisId: "scc", y: 200, stroke: "#f97316", strokeDasharray: "5 3", strokeOpacity: 0.45, label: { value: "200k", position: "right", fontSize: 10, fill: "#f97316" } })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-blue-500 opacity-80" }),
            "Daily yield (L)"
          ] }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-4 border-t-2 border-orange-400" }),
            "SCC (k/mL) — dashed line = 200k threshold"
          ] })
        ] })
      ] })
    ] })
  ] });
}
const UK_MILK_BUYERS = [
  "Arla Foods UK",
  "Müller Milk & Ingredients",
  "First Milk",
  "Crediton Dairy",
  "Dale Farm",
  "Freshways Dairy",
  "Glanbia Cheese",
  "Graham's The Family Dairy",
  "Hook & Son",
  "Medina Dairy",
  "Norseland",
  "Saputo Dairy UK",
  "The Collective Dairy",
  "Yeo Valley Farms"
];
function MilkRecordsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [abrKitStockId, setAbrKitStockId] = reactExports.useState("");
  const now = /* @__PURE__ */ new Date();
  const [filterYear, setFilterYear] = reactExports.useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = reactExports.useState(now.getMonth());
  function stepMonth(dir) {
    setFilterMonth((m) => {
      const next = m + dir;
      if (next < 0) {
        setFilterYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setFilterYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  }
  const monthLabel2 = new Date(filterYear, filterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-milk", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-records`), { credentials: "include" }).then((r) => r.json())
  });
  const abrStockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`), { credentials: "include" }).then((r) => r.json())
  });
  const abrStock = abrStockQ.data?.stock ?? [];
  const staffNamesQ = useQuery({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const staffNames = staffNamesQ.data?.names ?? [];
  const filteredRecords = (data?.records ?? []).filter((r) => {
    if (!r.recordDate) return false;
    const d = new Date(r.recordDate);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/milk-records/${editing.id}`) : api(`farms/${farmId}/dairy/milk-records`);
      const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...body, abrKitStockId: abrKitStockId || void 0 }) });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setAbrKitStockId("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/milk-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ recordDate: today(), recordType: "bulk-tank", buyerLabResultsStatus: "not-applicable" });
    setAbrKitStockId("");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setAbrKitStockId("");
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const labStatus = form.buyerLabResultsStatus;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
      "Add Record"
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Milk Record — ",
        formatDate(viewRecord.recordDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-sm overflow-y-auto max-h-[70vh]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Collection Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Record Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewRecord.recordType ?? "—").replace(/-/g, " ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Milking Session" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewRecord.sessionType ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Milk Buyer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.milkBuyer ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Yield (litres)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.yieldLitres ? `${parseFloat(viewRecord.yieldLitres).toLocaleString()} L` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Collector Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.collectorReference ?? "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "On-Farm Measurements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Milk Temperature (°C)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.milkTemperatureCelsius ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Temp Tested By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.tempTestedBy ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Test Result" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.antibioticResidueTestResult ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Tested By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.abrTestedBy ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Kit Lot No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.abrTestKitLot ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Kit Batch No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.abrTestKitBatch ?? "—" })
            ] }),
            (viewRecord.sccThousands || viewRecord.tbcCfuMl || viewRecord.fatPercent) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "SCC (k/mL) — On-farm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: viewRecord.sccThousands })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "TBC (cfu/mL)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.tbcCfuMl?.toLocaleString() ?? "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fat %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fatPercent ?? "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Protein %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.proteinPercent ?? "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Lactose %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.lactosePercent ?? "—" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Buyer Lab Results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LabResultsBadge, { status: viewRecord.buyerLabResultsStatus }),
              (!viewRecord.buyerLabResultsStatus || viewRecord.buyerLabResultsStatus === "not-applicable") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-400", children: "Not applicable" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Results Received Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLabResultsDate ? formatDate(viewRecord.buyerLabResultsDate) : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Buyer Lab Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLabRef ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "SCC (k/mL) — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: viewRecord.buyerSccThousands })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "TBC (cfu/mL) — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerTbcCfuMl?.toLocaleString() ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fat % — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerFatPercent ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Protein % — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerProteinPercent ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Lactose % — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLactosePercent ?? "—" })
            ] })
          ] })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Documents & Attachments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "dairy_milk_record", recordId: viewRecord.id, farmId })
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => stepMonth(-1), className: "p-1 rounded hover:bg-gray-200 transition-colors", "aria-label": "Previous month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 text-gray-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: monthLabel2 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => stepMonth(1), className: "p-1 rounded hover:bg-gray-200 transition-colors", "aria-label": "Next month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-600" }) })
    ] }),
    !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(MilkMonthlySummary, { records: filteredRecords, monthLabel: monthLabel2 }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      filteredRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: data?.records?.length ? `No records for ${monthLabel2} — use the arrows to browse other months.` : "No milk records yet — click Add Record to begin." }) }),
      filteredRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: formatDate(r.recordDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 capitalize", children: [
              r.recordType.replace(/-/g, " "),
              r.sessionType ? ` · ${r.sessionType}` : ""
            ] }),
            r.milkBuyer && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded", children: r.milkBuyer }),
            r.yieldLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700", children: [
              parseFloat(r.yieldLitres).toLocaleString(),
              " L"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: r.sccThousands || r.buyerSccThousands }),
            r.antibioticResidueTestResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.antibioticResidueTestResult === "negative" ? "bg-green-100 text-green-700" : r.antibioticResidueTestResult === "positive" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: [
              r.antibioticResidueTestResult === "negative" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "ABR: ",
              r.antibioticResidueTestResult
            ] }),
            r.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700", children: "↩ Retest" }),
            !r.isRetest && (data?.records ?? []).some((rt) => rt.retestOfId === r.id && rt.antibioticResidueTestResult === "negative") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "✓ Retested — Negative" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(LabResultsBadge, { status: r.buyerLabResultsStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "dairy/milk-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["dairy-milk", farmId], compact: true }),
            (r.antibioticResidueTestResult && r.antibioticResidueTestResult !== "negative" || r.sccThousands && Number(r.sccThousands ?? 0) > 200 || r.buyerSccThousands && Number(r.buyerSccThousands ?? 0) > 200) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-purple-600", title: "Raise Task — quality alert", onClick: () => setRaiseTaskFor(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1 truncate", children: r.notes })
      ] }) }, r.id))
    ] }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Milk Quality Alert — ${raiseTaskFor.antibioticResidueTestResult && raiseTaskFor.antibioticResidueTestResult !== "negative" ? `ABR ${raiseTaskFor.antibioticResidueTestResult.charAt(0).toUpperCase()}${raiseTaskFor.antibioticResidueTestResult.slice(1)}` : "High SCC"}`,
        defaultDescription: `Date: ${raiseTaskFor.recordDate ?? "—"} · ABR: ${raiseTaskFor.antibioticResidueTestResult ?? "—"} · SCC: ${raiseTaskFor.sccThousands ?? raiseTaskFor.buyerSccThousands ?? "—"} k/mL · Buyer: ${raiseTaskFor.milkBuyer ?? "—"}`,
        module: "dairy"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "64rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Milk Record" : "Add Milk Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "session", className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "session", children: "Milking Session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "collection", children: "Collection & Buyer Lab" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "session", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto max-h-[68vh] space-y-5 pr-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3", children: "Milking Event" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.recordDate || "", onChange: (e) => set("recordDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Record Type *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.recordType || "bulk-tank", onValueChange: (v) => set("recordType", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bulk-tank", children: "Bulk Tank (Quality Sample)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "individual-cow", children: "Individual Cow" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "herd-total", children: "Herd Total" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milking Session" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sessionType || "", onValueChange: (v) => set("sessionType", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "morning", children: "Morning" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "afternoon", children: "Afternoon" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "evening", children: "Evening" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily-total", children: "Daily Total" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yield (litres)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.yieldLitres || "", onChange: (e) => set("yieldLitres", e.target.value) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-100 bg-blue-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3", children: "On-Farm Measurements" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Temperature (°C)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.milkTemperatureCelsius || "", onChange: (e) => set("milkTemperatureCelsius", e.target.value), placeholder: "Target ≤4°C" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature Tested By" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "staff-names-list", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "staff-names-list", placeholder: "Name of person who took reading", value: form.tempTestedBy || "", onChange: (e) => set("tempTestedBy", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Result" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.antibioticResidueTestResult || "", onValueChange: (v) => set("antibioticResidueTestResult", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not tested" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative (safe to supply)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive (milk discarded)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borderline", children: "Borderline" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invalid", children: "Invalid (test void)" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Tested By" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "staff-names-list", placeholder: "Name of tester", value: form.abrTestedBy || "", onChange: (e) => set("abrTestedBy", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Stock Record" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: abrKitStockId, onValueChange: setAbrKitStockId, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link kit (auto-decrements stock)" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / not tracking" }),
                    abrStock.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                      s.productName,
                      s.lotNumber ? ` · Lot ${s.lotNumber}` : "",
                      " (",
                      s.quantityRemaining,
                      " remaining)"
                    ] }, s.id))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Lot Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit packaging", value: form.abrTestKitLot || "", onChange: (e) => set("abrTestKitLot", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Batch Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit packaging", value: form.abrTestKitBatch || "", onChange: (e) => set("abrTestKitBatch", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 border-t border-amber-100 pt-3 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "is-retest-abr", checked: !!form.isRetest, onChange: (e) => {
                    set("isRetest", e.target.checked);
                    if (!e.target.checked) set("retestOfId", null);
                  }, className: "w-4 h-4 rounded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is-retest-abr", className: "font-normal cursor-pointer", children: "This is a follow-up retest of a previous non-negative result" })
                ] }),
                form.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Retest of (original concerning record)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.retestOfId ? String(form.retestOfId) : "", onValueChange: (v) => set("retestOfId", v ? Number(v) : null), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select the original record…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (data?.records ?? []).filter((r) => r.id !== editing?.id && ["positive", "borderline", "invalid"].includes(r.antibioticResidueTestResult ?? "")).slice(0, 40).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                      new Date(r.recordDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                      " — ABR ",
                      r.antibioticResidueTestResult
                    ] }, r.id)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "A Negative retest will auto-resolve the alert for the original record." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 border-t border-blue-200 pt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mb-2 font-medium", children: "On-farm quality measurements (optional — if tested on-farm separately from buyer)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC (k/mL)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccThousands || "", onChange: (e) => set("sccThousands", e.target.value ? parseInt(e.target.value) : void 0) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TBC (cfu/mL)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.tbcCfuMl || "", onChange: (e) => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : void 0) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fat %" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.fatPercent || "", onChange: (e) => set("fatPercent", e.target.value) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein %" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.proteinPercent || "", onChange: (e) => set("proteinPercent", e.target.value) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lactose %" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.lactosePercent || "", onChange: (e) => set("lactosePercent", e.target.value) })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 3 })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "collection", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto max-h-[68vh] space-y-5 pr-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-200 bg-amber-50 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800 mb-1", children: "One collection covers multiple milkings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "A tanker typically collects from the bulk tank every 2–3 days. Enter the same Collector / Tanker Reference on every milking session that went into one collection load. The buyer's lab results are tied to the collection event, not to each individual milking." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3", children: "Collection Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Buyer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "milk-buyer-list", children: UK_MILK_BUYERS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b }, b)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "milk-buyer-list", placeholder: "Type or select buyer…", value: form.milkBuyer || "", onChange: (e) => set("milkBuyer", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collector / Tanker Ref" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.collectorReference || "", onChange: (e) => set("collectorReference", e.target.value) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-purple-100 bg-purple-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1", children: "Buyer Lab Results" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-purple-600 mb-3", children: "Transcribe results from your milk buyer's lab report. These are the official figures used for payment and compliance." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Results Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: labStatus || "not-applicable", onValueChange: (v) => set("buyerLabResultsStatus", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "not-applicable", children: "Not applicable (no buyer lab for this record)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending — awaiting results from buyer" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received — results logged below" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "concern", children: "Concern — results require action" })
                  ] })
                ] })
              ] }),
              (labStatus === "received" || labStatus === "concern") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Results Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.buyerLabResultsDate || "", onChange: (e) => set("buyerLabResultsDate", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lab Reference" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Lab report reference / slip number", value: form.buyerLabRef || "", onChange: (e) => set("buyerLabRef", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC (k/mL) — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerSccThousands || "", onChange: (e) => set("buyerSccThousands", e.target.value ? parseInt(e.target.value) : void 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TBC (cfu/mL) — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerTbcCfuMl || "", onChange: (e) => set("buyerTbcCfuMl", e.target.value ? parseInt(e.target.value) : void 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fat % — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerFatPercent || "", onChange: (e) => set("buyerFatPercent", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein % — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerProteinPercent || "", onChange: (e) => set("buyerProteinPercent", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lactose % — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerLactosePercent || "", onChange: (e) => set("buyerLactosePercent", e.target.value) })
                ] })
              ] })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.recordDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Record"
        ] })
      ] })
    ] }) })
  ] });
}
function normalizeGrade(g) {
  if (!g) return "";
  const s = g.trim();
  if (s === "1" || /grade\s*1/i.test(s) || /^mild/i.test(s)) return "Mild";
  if (s === "2" || /grade\s*2/i.test(s) || /^moderate/i.test(s)) return "Moderate";
  if (s === "3" || /grade\s*3/i.test(s) || /^severe/i.test(s)) return "Severe";
  if (s === "4" || /grade\s*4/i.test(s) || /^subclinical/i.test(s)) return "Subclinical";
  return s;
}
const GRADE_PIE_COLOURS = ["#6366f1", "#f59e0b", "#f97316", "#ef4444", "#94a3b8"];
const OUTCOME_PIE_COLOURS = ["#22c55e", "#eab308", "#f97316", "#3b82f6", "#ef4444", "#94a3b8"];
function MastitisTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [filterPreset, setFilterPreset] = reactExports.useState("12m");
  const [filterEarTag, setFilterEarTag] = reactExports.useState("");
  const [filterOutcome, setFilterOutcome] = reactExports.useState("");
  const [filterGrade, setFilterGrade] = reactExports.useState("");
  const [showReports, setShowReports] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-mastitis", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mastitis-records`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const mastitisAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "mastitis").map((c) => [c.recordId, c.count]));
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/mastitis-records/${editing.id}`) : api(`farms/${farmId}/dairy/mastitis-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/mastitis-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ onsetDate: today() });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, treatmentStartDate: r.treatmentStartDate?.slice(0, 10), withdrawalEndDate: r.withdrawalEndDate?.slice(0, 10), outcomeDate: r.outcomeDate?.slice(0, 10) });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const allRecords = data?.records ?? [];
  const presetFrom = React.useMemo(() => {
    if (filterPreset === "all") return null;
    const d = /* @__PURE__ */ new Date();
    if (filterPreset === "30d") d.setDate(d.getDate() - 30);
    else if (filterPreset === "90d") d.setDate(d.getDate() - 90);
    else d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  }, [filterPreset]);
  const filtered = React.useMemo(() => allRecords.filter((r) => {
    const d = r.onsetDate.slice(0, 10);
    if (presetFrom && d < presetFrom) return false;
    if (filterEarTag && !r.earTagNumber?.toLowerCase().includes(filterEarTag.toLowerCase())) return false;
    if (filterOutcome && r.outcome !== filterOutcome) return false;
    if (filterGrade && normalizeGrade(r.clinicalGrade) !== filterGrade) return false;
    return true;
  }), [allRecords, presetFrom, filterEarTag, filterOutcome, filterGrade]);
  const kpis = React.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const activeCases = filtered.filter((r) => r.outcome === "ongoing" || !r.outcome).length;
    const inWithdrawal = filtered.filter((r) => r.withdrawalEndDate && new Date(r.withdrawalEndDate) >= now).length;
    const tagCounts = {};
    filtered.forEach((r) => {
      if (r.earTagNumber) tagCounts[r.earTagNumber] = (tagCounts[r.earTagNumber] || 0) + 1;
    });
    const recurrentCows = Object.values(tagCounts).filter((c) => c >= 2).length;
    const pathogenCounts = {};
    filtered.forEach((r) => {
      if (r.bacterialCultureResult?.trim()) {
        const p = r.bacterialCultureResult.trim();
        pathogenCounts[p] = (pathogenCounts[p] || 0) + 1;
      }
    });
    const topPathogen = Object.entries(pathogenCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const quarterCounts = {};
    filtered.forEach((r) => {
      if (r.quartersAffected) quarterCounts[r.quartersAffected] = (quarterCounts[r.quartersAffected] || 0) + 1;
    });
    const topQuarter = Object.entries(quarterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { total: filtered.length, activeCases, inWithdrawal, recurrentCows, topPathogen, topQuarter, tagCounts };
  }, [filtered]);
  const outbreakWindow = React.useMemo(() => {
    if (filtered.length < 3) return null;
    const sorted = [...filtered].sort((a, b) => a.onsetDate.localeCompare(b.onsetDate));
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = new Date(sorted[i].onsetDate);
      const windowEnd = new Date(windowStart);
      windowEnd.setDate(windowEnd.getDate() + 14);
      const inWindow = sorted.filter((r) => {
        const d = new Date(r.onsetDate);
        return d >= windowStart && d <= windowEnd;
      });
      if (inWindow.length >= 3) return { count: inWindow.length, start: sorted[i].onsetDate, end: inWindow[inWindow.length - 1].onsetDate };
    }
    return null;
  }, [filtered]);
  const reportData = React.useMemo(() => {
    const monthMap = {};
    filtered.forEach((r) => {
      const d = new Date(r.onsetDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const monthlyTrend = Object.keys(monthMap).sort().map((m) => ({
      month: (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      cases: monthMap[m]
    }));
    const gradeMap = {};
    filtered.forEach((r) => {
      const g = normalizeGrade(r.clinicalGrade);
      if (g) gradeMap[g] = (gradeMap[g] || 0) + 1;
    });
    const gradeData = Object.entries(gradeMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const pathMap = {};
    filtered.forEach((r) => {
      if (r.bacterialCultureResult?.trim()) {
        const p = r.bacterialCultureResult.trim();
        pathMap[p] = (pathMap[p] || 0) + 1;
      }
    });
    const pathogenData = Object.entries(pathMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const outcomeMap = {};
    filtered.forEach((r) => {
      const o = r.outcome || "not recorded";
      outcomeMap[o] = (outcomeMap[o] || 0) + 1;
    });
    const outcomeData = Object.entries(outcomeMap).map(([name, value]) => ({ name, value }));
    const cowMap = {};
    filtered.forEach((r) => {
      if (!r.earTagNumber) return;
      if (!cowMap[r.earTagNumber]) cowMap[r.earTagNumber] = { count: 0, grades: [], lastDate: "" };
      cowMap[r.earTagNumber].count++;
      const ng = normalizeGrade(r.clinicalGrade);
      if (ng) cowMap[r.earTagNumber].grades.push(ng);
      if (!cowMap[r.earTagNumber].lastDate || r.onsetDate > cowMap[r.earTagNumber].lastDate) cowMap[r.earTagNumber].lastDate = r.onsetDate;
    });
    const problemCows = Object.entries(cowMap).filter(([, v]) => v.count >= 2).map(([tag, v]) => ({ tag, ...v })).sort((a, b) => b.count - a.count);
    return { monthlyTrend, gradeData, pathogenData, outcomeData, problemCows };
  }, [filtered]);
  function generateMastitisReport() {
    const periodLabel = filterPreset === "30d" ? "Last 30 days" : filterPreset === "90d" ? "Last 90 days" : filterPreset === "12m" ? "Last 12 months" : "All records";
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const rows = filtered.map((r) => `<tr>
      <td>${fmtD(r.onsetDate)}</td>
      <td>${r.earTagNumber || "—"}</td>
      <td>${r.quartersAffected || "—"}</td>
      <td>${r.clinicalGrade || "—"}</td>
      <td>${r.bacterialCultureResult || "—"}</td>
      <td>${r.treatmentProduct || "—"}</td>
      <td>${r.outcome ? r.outcome.charAt(0).toUpperCase() + r.outcome.slice(1).replace("-", " ") : "Ongoing"}</td>
      <td>${fmtD(r.withdrawalEndDate)}</td>
    </tr>`).join("");
    const pathRows = reportData.pathogenData.map((p) => `<tr><td>${p.name}</td><td>${p.value}</td><td>${filtered.length > 0 ? (p.value / filtered.length * 100).toFixed(0) : 0}%</td></tr>`).join("");
    const problemRows = reportData.problemCows.map((c) => `<tr><td>${c.tag}</td><td>${c.count}</td><td>${c.grades.join(", ") || "—"}</td><td>${fmtD(c.lastDate)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Mastitis Records — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}
  .kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="hdr">
  <div><h1>Mastitis Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2><p style="margin:4px 0;font-size:9px;color:#6b7280">Period: <strong>${periodLabel}</strong></p></div>
  <div class="hdr-r"><b>${filtered.length} record${filtered.length !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${kpis.total}</div><div class="kpi-lbl">Total cases</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.activeCases}</div><div class="kpi-lbl">Active / ongoing</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.recurrentCows}</div><div class="kpi-lbl">Recurrent cows (≥2 cases)</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.topPathogen ?? "—"}</div><div class="kpi-lbl">Most common pathogen</div></div>
</div>
${pathRows ? `<h3>Pathogen Breakdown</h3><table><tr><th>Pathogen</th><th>Cases</th><th>% of total</th></tr>${pathRows}</table>` : ""}
${problemRows ? `<h3>Recurrent Cows (2+ episodes in period)</h3><table><tr><th>Ear Tag</th><th>Episodes</th><th>Grades</th><th>Last case</th></tr>${problemRows}</table>` : ""}
<h3>All Records — ${periodLabel}</h3>
<table>
  <tr><th>Date</th><th>Ear Tag</th><th>Quarter</th><th>Grade</th><th>Pathogen</th><th>Treatment</th><th>Outcome</th><th>Withdrawal ends</th></tr>
  ${rows || "<tr><td colspan='8'>No records</td></tr>"}
</table>
<p class="note">This mastitis records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Dairy audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  const filtersActive = filterEarTag || filterOutcome || filterGrade || filterPreset !== "12m";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-lg border border-gray-200 overflow-hidden text-xs", children: ["30d", "90d", "12m", "all"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setFilterPreset(p),
          className: `px-3 py-1.5 font-medium transition-colors ${filterPreset === p ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`,
          children: p === "30d" ? "30 days" : p === "90d" ? "90 days" : p === "12m" ? "12 months" : "All time"
        },
        p
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-44 h-8 text-sm", placeholder: "Search ear tag…", value: filterEarTag, onChange: (e) => setFilterEarTag(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: filterOutcome,
          onChange: (e) => setFilterOutcome(e.target.value),
          className: "h-8 rounded-md border border-input bg-background px-2 text-sm text-gray-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All outcomes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ongoing", children: "Ongoing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cured", children: "Cured" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "chronic", children: "Chronic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dried-off", children: "Dried off" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "culled", children: "Culled" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: filterGrade,
          onChange: (e) => setFilterGrade(e.target.value),
          className: "h-8 rounded-md border border-input bg-background px-2 text-sm text-gray-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All grades" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Subclinical", children: "Subclinical" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mild", children: "Mild" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Moderate", children: "Moderate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Severe", children: "Severe" })
          ]
        }
      ),
      filtersActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setFilterEarTag("");
            setFilterOutcome("");
            setFilterGrade("");
            setFilterPreset("12m");
          },
          className: "text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2",
          children: "Clear"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowReports((v) => !v),
            className: `h-8 px-3 rounded-md border text-sm font-medium transition-colors flex items-center gap-1.5 ${showReports ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-3.5 w-3.5" }),
              showReports ? "Hide Reports" : "Reports"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateMastitisReport, disabled: filtered.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: kpis.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Total cases" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${kpis.activeCases > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${kpis.activeCases > 0 ? "text-yellow-700" : "text-gray-800"}`, children: kpis.activeCases }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Active cases" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${kpis.inWithdrawal > 0 ? "bg-amber-50 border-amber-200" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${kpis.inWithdrawal > 0 ? "text-amber-700" : "text-gray-800"}`, children: kpis.inWithdrawal }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "In withdrawal" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${kpis.recurrentCows > 0 ? "bg-orange-50 border-orange-200" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${kpis.recurrentCows > 0 ? "text-orange-700" : "text-gray-800"}`, children: kpis.recurrentCows }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Recurrent cows" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 truncate", title: kpis.topPathogen ?? "", children: kpis.topPathogen ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Top pathogen" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800", children: kpis.topQuarter ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Top quarter" })
      ] })
    ] }),
    outbreakWindow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-red-800", children: "Possible outbreak detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700 mt-0.5", children: [
          outbreakWindow.count,
          " new cases recorded within a 14-day window (",
          formatDate(outbreakWindow.start),
          " – ",
          formatDate(outbreakWindow.end),
          "). This pattern may indicate an environmental pathogen spreading through the herd. Review bacterial culture results and consult your vet."
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: showReports ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No records match the current filters." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Monthly Case Trend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "New mastitis cases per calendar month in the selected period" }),
        reportData.monthlyTrend.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-8", children: "Not enough data across multiple months. Widen the date filter to see a trend." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: reportData.monthlyTrend, margin: { top: 4, right: 8, left: -20, bottom: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "cases", name: "Cases", fill: "#fca5a5", radius: [3, 3, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "cases", name: "Trend", stroke: "#dc2626", strokeWidth: 2, dot: { fill: "#dc2626", r: 3 } })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Clinical Grade" }),
          reportData.gradeData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-6", children: "No grade data recorded" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: reportData.gradeData, cx: "50%", cy: "50%", outerRadius: 60, dataKey: "value", labelLine: false, children: reportData.gradeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: GRADE_PIE_COLOURS[i % GRADE_PIE_COLOURS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: reportData.gradeData.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full inline-block flex-shrink-0", style: { background: GRADE_PIE_COLOURS[i % GRADE_PIE_COLOURS.length] } }),
                g.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-700", children: g.value })
            ] }, i)) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Outcome Breakdown" }),
          reportData.outcomeData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-6", children: "No outcome data recorded" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: reportData.outcomeData, cx: "50%", cy: "50%", outerRadius: 60, dataKey: "value", labelLine: false, children: reportData.outcomeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: OUTCOME_PIE_COLOURS[i % OUTCOME_PIE_COLOURS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: reportData.outcomeData.map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full inline-block flex-shrink-0", style: { background: OUTCOME_PIE_COLOURS[i % OUTCOME_PIE_COLOURS.length] } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: o.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-700", children: o.value })
            ] }, i)) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Pathogen Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Culture results only" }),
          reportData.pathogenData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-6", children: "No culture results recorded yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 mt-1", children: reportData.pathogenData.map((p, i) => {
            const maxVal = reportData.pathogenData[0].value;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-28 truncate text-gray-700 font-mono text-[11px]", title: p.name, children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-gray-100 rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-purple-500 rounded-full", style: { width: `${p.value / maxVal * 100}%` } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-right text-gray-600 font-semibold", children: p.value })
            ] }, i);
          }) })
        ] }) })
      ] }),
      reportData.problemCows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Recurrent Cases — Problem Cows" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Animals with 2 or more mastitis episodes in the selected period. Key candidates for selective dry cow therapy review and veterinary discussion." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Ear Tag" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Episodes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Grades seen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Last episode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: reportData.problemCows.map((cow) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 font-mono text-gray-800 font-medium", children: cow.tag }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cow.count >= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: cow.count }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-gray-600 text-xs", children: [...new Set(cow.grades)].join(", ") || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-gray-600", children: formatDate(cow.lastDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setFilterEarTag(cow.tag);
                  setShowReports(false);
                },
                className: "text-xs text-green-700 hover:underline",
                children: "View records"
              }
            ) })
          ] }, cow.tag)) })
        ] }) })
      ] }) })
    ] }) }) : (
      /* ── Record list ── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: allRecords.length === 0 ? "No mastitis records yet." : "No records match the current filters." }) }),
        filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.onsetDate) }),
              r.earTagNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 font-mono", children: r.earTagNumber }),
              r.earTagNumber && (kpis.tagCounts[r.earTagNumber] ?? 0) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium", children: [
                kpis.tagCounts[r.earTagNumber],
                "× recurring"
              ] }),
              r.quartersAffected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded", children: r.quartersAffected }),
              r.clinicalGrade && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                "Grade: ",
                normalizeGrade(r.clinicalGrade)
              ] }),
              r.treatmentProduct && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.treatmentProduct }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { v: r.outcome }),
              r.withdrawalEndDate && new Date(r.withdrawalEndDate) >= /* @__PURE__ */ new Date() && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium", children: [
                "Withdrawal ends ",
                formatDate(r.withdrawalEndDate)
              ] }),
              (mastitisAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
                mastitisAttachMap[r.id]
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
        ] }) }, r.id))
      ] })
    ) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Mastitis Record — ",
        viewRecord.earTagNumber || formatDate(viewRecord.onsetDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Onset Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.onsetDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cow Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.earTagNumber || "—" }),
            viewRecord.earTagNumber && (kpis.tagCounts[viewRecord.earTagNumber] ?? 0) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full", children: [
              kpis.tagCounts[viewRecord.earTagNumber],
              "× recurring"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quarters Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.quartersAffected || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Clinical Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: normalizeGrade(viewRecord.clinicalGrade) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bacterial Culture" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.bacterialCultureResult || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC at Onset" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.sccAtOnset ? `${viewRecord.sccAtOnset.toLocaleString()} k/mL` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.treatmentProduct || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.treatmentStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Duration (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.treatmentDurationDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.withdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.outcome || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.outcomeDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Consulted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetConsulted ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetName || "—" })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "mastitis", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Mastitis Record" : "Add Mastitis Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Onset Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.onsetDate?.slice(0, 10) || "", onChange: (e) => set("onsetDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Ear Tag" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.earTagNumber || "", onChange: (e) => set("earTagNumber", e.target.value), placeholder: "e.g. UK123456 000001" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quarters Affected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.quartersAffected || "", onValueChange: (v) => set("quartersAffected", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select quarters..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LF", children: "Left Front (LF)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RF", children: "Right Front (RF)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LR", children: "Left Rear (LR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RR", children: "Right Rear (RR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LF, RF", children: "Both Fronts (LF + RF)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LR, RR", children: "Both Rears (LR + RR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LF, LR", children: "Left Side (LF + LR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RF, RR", children: "Right Side (RF + RR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "All quarters", children: "All Four Quarters" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clinical Grade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.clinicalGrade || "", onValueChange: (v) => set("clinicalGrade", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select grade..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Subclinical", children: "Subclinical (high SCC, no visible signs)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Mild", children: "Mild (clots in milk, slight swelling)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Moderate", children: "Moderate (swollen quarter, cow lame/off-feed)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Severe", children: "Severe (toxic cow, systemic signs)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Onset (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtOnset || "", onChange: (e) => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : void 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bacterial Culture Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bacterialCultureResult || "", onChange: (e) => set("bacterialCultureResult", e.target.value), placeholder: "e.g. Staph. aureus, E. coli, Strep. uberis" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-gray-200 self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Treatment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.treatmentProduct || "", onChange: (e) => set("treatmentProduct", e.target.value), placeholder: "e.g. Ubrolexin intramammary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.treatmentStartDate || "", onChange: (e) => set("treatmentStartDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Duration (days)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.treatmentDurationDays || "", onChange: (e) => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : void 0) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Withdrawal End Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.withdrawalEndDate || "", onChange: (e) => set("withdrawalEndDate", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Outcome & Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome || "", onValueChange: (v) => set("outcome", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select outcome..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ongoing", children: "Ongoing (still treating)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cured", children: "Cured" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chronic", children: "Chronic (no cure achieved)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dried-off", children: "Quarter/Cow Dried Off" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "culled", children: "Culled" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.outcomeDate || "", onChange: (e) => set("outcomeDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "vc", checked: !!form.vetConsulted, onChange: (e) => set("vetConsulted", e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vc", children: "Vet consulted" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 3 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.onsetDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Record"
        ] })
      ] })
    ] }) })
  ] });
}
function CalvingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [showManualEarTag, setShowManualEarTag] = reactExports.useState(false);
  const [showManualVet, setShowManualVet] = reactExports.useState(false);
  const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = reactExports.useState(String(CURRENT_YEAR));
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/calving-records`), { credentials: "include" }).then((r) => r.json())
  });
  const animalsQ = useQuery({
    queryKey: ["calving-animals", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const CATTLE_SPECIES = ["cattle", "bovine"];
  const cows = (animalsQ.data?.records ?? []).filter(
    (a) => CATTLE_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber
  );
  const vetVisitsQ = useQuery({
    queryKey: ["calving-vet-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/vet-visits`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!form.vetAttended
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map((v) => v.vetName).filter(Boolean))];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter((v) => v.vetName && v.vetPractice).map((v) => [v.vetName, v.vetPractice])
  );
  const siresQ = useQuery({
    queryKey: ["calving-sires", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sires`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && form.conceptionMethod === "natural"
  });
  const activeSires = (siresQ.data?.records ?? []).filter((s) => s.isActive !== false && s.species?.toLowerCase() === "cattle");
  const strawsQ = useQuery({
    queryKey: ["calving-straws", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/straws`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && form.conceptionMethod === "ai"
  });
  const cattleStraws = (strawsQ.data?.records ?? []).filter((s) => s.sireSpecies?.toLowerCase() === "cattle");
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const calvingAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "calving").map((c) => [c.recordId, c.count]));
  const contractorsQ = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fallen-stock-contractors`), { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const contractors = contractorsQ.data ?? [];
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/calving-records/${editing.id}`) : api(`farms/${farmId}/dairy/calving-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setShowManualEarTag(false);
      setShowManualVet(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/calving-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ calvingDate: today(), numberOfCalves: 1 });
    setShowManualEarTag(false);
    setShowManualVet(false);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, calvingDate: r.calvingDate.slice(0, 10) });
    setShowManualEarTag(!r.cowAnimalId && !!r.cowEarTag);
    setShowManualVet(!!r.vetAttended && !!r.vetName);
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const hasDeadCalf = (r) => r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" || r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h";
  function generateCalvingReport() {
    const records = data?.records ?? [];
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const fv2 = (v) => v === null || v === void 0 || v === "" ? "—" : String(v);
    const easeLabel = (n) => n ? ["", "1 — Unassisted", "2 — Easy pull", "3 — Hard pull", "4 — Mech. assistance", "5 — C-section"][n] ?? String(n) : "—";
    const yesNo = (v) => v === true ? "Yes" : v === false ? "No" : "—";
    const rows = records.map((r) => {
      const calves = r.numberOfCalves && r.numberOfCalves > 1 ? `${r.calfOutcome ?? "—"} (${r.calfSex ?? "?"}) ${r.calfEarTag ?? ""} + ${r.calfOutcome2 ?? "—"} (${r.calfSex2 ?? "?"}) ${r.calfEarTag2 ?? ""}` : `${r.calfOutcome ?? "—"} · ${r.calfSex === "male" ? "Bull" : r.calfSex === "female" ? "Heifer" : r.calfSex ?? "?"} · ${r.calfEarTag ?? "no tag"}`;
      const deadCount = (r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" ? 1 : 0) + (r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h" ? 1 : 0);
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}` : deadCount > 0 ? "<span style='color:#b91c1c'>NOT RECORDED</span>" : "—";
      return `<tr>
        <td>${fmtD(r.calvingDate)}</td>
        <td>${fv2(r.cowEarTag)}</td>
        <td>${easeLabel(r.calvingEaseScore)}</td>
        <td>${r.numberOfCalves ?? 1} calf${(r.numberOfCalves ?? 1) > 1 ? "ves" : ""}</td>
        <td>${calves}</td>
        <td>${r.calfBirthWeightKg ? `${r.calfBirthWeightKg} kg` : "—"}</td>
        <td>${yesNo(r.colostrumGivenWithin2Hours)} / ${yesNo(r.colostrumGivenWithin6Hours)}</td>
        <td>${r.colostrumVolumeFirstFeedLitres ? `${r.colostrumVolumeFirstFeedLitres} L` : "—"}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td>${yesNo(r.vetAttended)}</td>
        <td>${yesNo(r.bcmsPassportApplied)}</td>
        <td style="font-size:9px">${disposalCell}</td>
        <td style="color:#888;font-size:9px">${fv2(r.notes).slice(0, 80)}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Calving Records — Red Tractor Dairy Audit</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Calving Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<table>
  <thead><tr>
    <th>Date</th><th>Dam Tag</th><th>Ease Score</th><th>No. Calves</th><th>Calf Outcome / Tag</th>
    <th>Birth Wt</th><th>Colostrum ≤2h / ≤6h</th><th>Col. Volume</th><th>Assisted</th><th>Vet</th><th>BCMS Applied</th><th>ABP Disposal</th><th>Notes</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="note">This calving records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Dairy audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    (() => {
      const allCalvingRecords = data?.records ?? [];
      const calvingRecords = yearFilter === "all" ? allCalvingRecords : allCalvingRecords.filter((r) => r.calvingDate?.startsWith(yearFilter));
      const calvingYears = [...new Set(allCalvingRecords.map((r) => r.calvingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
      if (!calvingYears.includes(String(CURRENT_YEAR))) calvingYears.unshift(String(CURRENT_YEAR));
      function calvingStats(recs) {
        const cows2 = recs.length;
        const totalCalves = recs.reduce((s, r) => s + (r.numberOfCalves ?? 1), 0);
        const stillborns = recs.reduce((s, r) => s + (r.calfOutcome === "stillborn" ? 1 : 0) + (r.calfOutcome2 === "stillborn" ? 1 : 0), 0);
        const died24h = recs.reduce((s, r) => s + (r.calfOutcome === "died-within-24h" ? 1 : 0) + (r.calfOutcome2 === "died-within-24h" ? 1 : 0), 0);
        const perinatal = stillborns + died24h;
        const pct = (n) => totalCalves > 0 ? (n / totalCalves * 100).toFixed(1) : "—";
        return { cows: cows2, totalCalves, stillborns, died24h, perinatal, pct };
      }
      const currentCalvingStats = calvingStats(calvingRecords);
      const calvingYearlyStats = calvingYears.map((y) => ({ year: y, ...calvingStats(allCalvingRecords.filter((r) => r.calvingDate?.startsWith(y))) }));
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Calving records including ease score, calf details, colostrum management, and BCMS passport application." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red Tractor Dairy: calving performance must be recorded and available at audit. Retain records for a minimum of 3 years." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                calvingYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateCalvingReport, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
              "Audit Report"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
              "Add Calving"
            ] })
          ] })
        ] }),
        allCalvingRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2 mb-3", children: [
            { label: "Cows Calved", value: String(currentCalvingStats.cows), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
            { label: "Total Calves Born", value: String(currentCalvingStats.totalCalves), sub: "", colour: "" },
            { label: "Stillborn", value: `${currentCalvingStats.stillborns}`, sub: `${currentCalvingStats.pct(currentCalvingStats.stillborns)}% of born`, colour: currentCalvingStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
            { label: "Died Within 24h", value: `${currentCalvingStats.died24h}`, sub: `${currentCalvingStats.pct(currentCalvingStats.died24h)}% of born`, colour: currentCalvingStats.died24h > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
            { label: "Perinatal Loss", value: `${currentCalvingStats.perinatal}`, sub: `${currentCalvingStats.pct(currentCalvingStats.perinatal)}% of born`, colour: currentCalvingStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" }
          ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`, children: s.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mt-0.5", children: s.label }),
            s.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: s.sub })
          ] }, s.label)) }),
          calvingYearlyStats.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Year-by-Year Perinatal Mortality Trend" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b border-gray-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Year" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Cows" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Calves Born" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Stillborn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Died <24h" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Perinatal Loss" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Bar" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: calvingYearlyStats.map((s, i) => {
                const maxRate = Math.max(...calvingYearlyStats.map((x) => Number(x.pct(x.perinatal)) || 0), 0.1);
                const rate = Number(s.pct(s.perinatal)) || 0;
                const barWidth = Math.round(rate / maxRate * 100);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i % 2 === 0 ? "bg-white" : "bg-gray-50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: s.year }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.cows }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.totalCalves }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
                    s.stillborns,
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                      "(",
                      s.pct(s.stillborns),
                      "%)"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
                    s.died24h,
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                      "(",
                      s.pct(s.died24h),
                      "%)"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `px-3 py-2 text-right font-semibold ${rate > 5 ? "text-red-600" : rate > 2 ? "text-amber-600" : "text-green-700"}`, children: [
                    s.perinatal,
                    " (",
                    s.pct(s.perinatal),
                    "%)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-gray-100 rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded ${rate > 5 ? "bg-red-400" : rate > 2 ? "bg-amber-400" : "bg-green-400"}`, style: { width: `${barWidth}%` } }) }) })
                ] }, s.year);
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 bg-gray-50 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red >5% perinatal loss · Amber 2–5% · Green <2%. Red Tractor Dairy and BCMS may query rates significantly above industry benchmarks." }) })
          ] })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          !calvingRecords.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No calving records yet." }) }),
          calvingRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.calvingDate) }),
                r.cowEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700 font-mono", children: [
                  "Dam: ",
                  r.cowEarTag
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(EaseScoreBadge, { v: r.calvingEaseScore }),
                r.numberOfCalves && r.numberOfCalves > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded", children: [
                  "Twins × ",
                  r.numberOfCalves
                ] }),
                r.calfOutcome && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${r.calfOutcome === "live" ? "bg-green-100 text-green-700" : r.calfOutcome === "stillborn" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`, children: r.calfOutcome.charAt(0).toUpperCase() + r.calfOutcome.slice(1) }),
                r.calfSex && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.calfSex === "male" ? "Bull calf" : r.calfSex === "female" ? "Heifer calf" : r.calfSex }),
                r.calfEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 font-mono", children: [
                  "Calf: ",
                  r.calfEarTag
                ] }),
                r.calfOutcome === "live" && !r.calfEarTag && (() => {
                  const hoursOld = (Date.now() - new Date(r.calvingDate).getTime()) / 36e5;
                  if (hoursOld >= 36) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: [
                    "⚠ Tag 1 overdue (",
                    Math.floor(hoursOld),
                    "h)"
                  ] });
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                    "Tag 1 due in ",
                    Math.ceil(36 - hoursOld),
                    "h"
                  ] });
                })(),
                r.calfOutcome === "live" && (() => {
                  if (r.calfEarTag2) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: "Tag 2 ✓" });
                  const daysOld = Math.floor((Date.now() - new Date(r.calvingDate).getTime()) / 864e5);
                  if (daysOld >= 20) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: [
                    "⚠ Tag 2 overdue (",
                    daysOld,
                    "d)"
                  ] });
                  if (daysOld >= 15) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                    "Tag 2 due in ",
                    20 - daysOld,
                    "d"
                  ] });
                  return null;
                })(),
                r.calfAnimalId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded", children: "In Livestock Register ✓" }),
                r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`, children: r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h" }),
                r.bcmsPassportApplied ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded", children: "Passport applied ✓" }) : (() => {
                  const daysOld = Math.floor((Date.now() - new Date(r.calvingDate).getTime()) / 864e5);
                  if (daysOld >= 27) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: [
                    "⚠ Passport overdue (",
                    daysOld,
                    "d)"
                  ] });
                  if (daysOld >= 20) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                    "Passport due in ",
                    27 - daysOld,
                    "d"
                  ] });
                  return null;
                })(),
                hasDeadCalf(r) && (r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: "ABP disposal ✓" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: "⚠ ABP disposal not recorded" })),
                (calvingAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
                  calvingAttachMap[r.id]
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
          ] }) }, r.id))
        ] })
      ] });
    })(),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Calving Record — ",
        viewRecord.cowEarTag || `Record #${viewRecord.id}`
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calving Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.calvingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dam Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.cowEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.calvingEaseScore ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][viewRecord.calvingEaseScore] ?? viewRecord.calvingEaseScore : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "No. of Calves" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.numberOfCalves ?? 1 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.calfOutcome || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.calfSex || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.calfEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.calfBirthWeightKg || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assistance Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assistanceRequired ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Attended" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetAttended ? viewRecord.vetName || "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "BCMS Passport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.bcmsPassportApplied ? "Applied ✓" : "Pending" })
        ] }),
        hasDeadCalf(viewRecord) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border rounded-md bg-amber-50 border-amber-200 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2", children: "ABP Perinatal Disposal (Category 3)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collection Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalCollectionDate ? new Date(viewRecord.perinatalCollectionDate).toLocaleDateString("en-GB") : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Consignment / NFAS Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalCollectionRef || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalDisposalMethod || "—" })
            ] }),
            viewRecord.perinatalDisposalNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalDisposalNotes })
            ] })
          ] })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "calving", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "62rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Calving Record" : "Add Calving Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Cow Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calving Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.calvingDate?.slice(0, 10) || "", onChange: (e) => set("calvingDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dam Ear Tag" }),
                cows.length > 0 && !showManualEarTag ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.cowAnimalId ? String(form.cowAnimalId) : "__none__",
                    onValueChange: (v) => {
                      if (v === "__manual__") {
                        setShowManualEarTag(true);
                        set("cowAnimalId", null);
                        return;
                      }
                      const animal = cows.find((a) => a.id === parseInt(v));
                      set("cowAnimalId", v === "__none__" ? null : parseInt(v));
                      set("cowEarTag", animal?.earTagNumber ?? null);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select cow..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        cows.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.earTagNumber }, a.id)),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Enter tag manually…" })
                      ] })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cowEarTag || "", onChange: (e) => set("cowEarTag", e.target.value), placeholder: "Cow's BCMS ear tag" }),
                  cows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "shrink-0 text-xs", onClick: () => {
                    setShowManualEarTag(false);
                    set("cowAnimalId", null);
                    set("cowEarTag", null);
                  }, children: "↩" })
                ] }),
                cows.length === 0 && animalsQ.isSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No cattle registered. Add animals in the Livestock page, or type the ear tag above." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calving Ease Score *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.calvingEaseScore || ""), onValueChange: (v) => set("calvingEaseScore", v ? parseInt(v) : null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select score..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Unassisted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Minor assistance (1 person)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Major assistance (calving aid)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Vet/caesarean required" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Complications" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cowComplications || "", onChange: (e) => set("cowComplications", e.target.value), placeholder: "e.g. retained placenta, hypocalcaemia" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "ar", checked: !!form.assistanceRequired, onChange: (e) => {
                  set("assistanceRequired", e.target.checked);
                  if (!e.target.checked) set("assistanceType", null);
                }, className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ar", children: "Assistance required" })
              ] }),
              form.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type of Assistance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assistanceType || "__none__", onValueChange: (v) => set("assistanceType", v === "__none__" ? null : v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual-1-person", children: "Manual — 1 person" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual-2-person", children: "Manual — 2 persons" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "calving-aid", children: "Calving aid / jack" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vet-assisted", children: "Vet-assisted delivery" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "caesarean", children: "Caesarean section" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "embryotomy", children: "Embryotomy" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "va", checked: !!form.vetAttended, onChange: (e) => {
                  set("vetAttended", e.target.checked);
                  if (!e.target.checked) {
                    set("vetName", null);
                    setShowManualVet(false);
                  }
                }, className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "va", children: "Vet attended" })
              ] }),
              form.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
                uniqueVetNames.length > 0 && !showManualVet ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.vetName && uniqueVetNames.includes(form.vetName) ? form.vetName : "__none__",
                    onValueChange: (v) => {
                      if (v === "__manual__") {
                        setShowManualVet(true);
                        set("vetName", "");
                        return;
                      }
                      set("vetName", v === "__none__" ? null : v);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        uniqueVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: n, children: [
                          n,
                          vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""
                        ] }, n)),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Enter new vet name…" })
                      ] })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Vet's name" }),
                  uniqueVetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "shrink-0 text-xs", onClick: () => {
                    setShowManualVet(false);
                    set("vetName", null);
                  }, children: "↩" })
                ] }),
                vetVisitsQ.isSuccess && uniqueVetNames.length === 0 && !showManualVet && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "No previous vets on record — type the name above." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Calf Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Calves" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "4", value: form.numberOfCalves || 1, onChange: (e) => {
                const n = parseInt(e.target.value);
                set("numberOfCalves", n);
                if (n < 2) {
                  set("calfOutcome2", null);
                  set("calfSex2", null);
                  set("calfEarTag2", null);
                  set("calfBirthWeightKg2", null);
                }
              } })
            ] }) }),
            (form.numberOfCalves ?? 1) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500", children: "Calf 1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Outcome" : "Calf Outcome" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfOutcome || "", onValueChange: (v) => set("calfOutcome", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died-within-24h", children: "Died within 24 hours" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Sex" : "Calf Sex" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfSex || "", onValueChange: (v) => set("calfSex", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Heifer (Female)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Bull Calf (Male)" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Ear Tag" : "Calf Ear Tag" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calfEarTag || "", onChange: (e) => set("calfEarTag", e.target.value), placeholder: "BCMS ear tag number" }),
                form.calfOutcome === "live" && form.calfEarTag && !form.calfAnimalId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-teal-600 mt-1", children: "Live calf will be auto-registered in the Livestock module on save — no double entry needed." }),
                form.calfAnimalId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 mt-1", children: [
                  "Already in Livestock Register (ID #",
                  form.calfAnimalId,
                  "). Movements & destination tracked there."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Birth Weight (kg)" : "Birth Weight (kg)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.calfBirthWeightKg || "", onChange: (e) => set("calfBirthWeightKg", e.target.value) })
              ] })
            ] }),
            (form.numberOfCalves ?? 1) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500 pt-1 border-t", children: "Calf 2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Outcome" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfOutcome2 || "", onValueChange: (v) => set("calfOutcome2", v), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died-within-24h", children: "Died within 24 hours" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Sex" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfSex2 || "", onValueChange: (v) => set("calfSex2", v), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Heifer (Female)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Bull Calf (Male)" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Ear Tag" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calfEarTag2 || "", onChange: (e) => set("calfEarTag2", e.target.value), placeholder: "BCMS ear tag number" }),
                  form.calfOutcome2 === "live" && form.calfEarTag2 && !form.calfAnimalId2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-teal-600 mt-1", children: "Live calf will be auto-registered in the Livestock module on save." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Birth Weight (kg)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.calfBirthWeightKg2 || "", onChange: (e) => set("calfBirthWeightKg2", e.target.value) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conception Method" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.conceptionMethod || "__none__",
                    onValueChange: (v) => {
                      const method = v === "__none__" ? null : v;
                      set("conceptionMethod", method);
                      set("sireRegisterId", null);
                      set("strawInventoryId", null);
                      set("sireBreed", "");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "natural", children: "Natural Service (bull)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ai", children: "AI — Artificial Insemination" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "embryo-transfer", children: "Embryo Transfer (ET)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unknown", children: "Unknown" })
                      ] })
                    ]
                  }
                )
              ] }),
              form.conceptionMethod === "natural" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sire (from Sire Register)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.sireRegisterId ? String(form.sireRegisterId) : "__none__",
                    onValueChange: (v) => {
                      if (v === "__none__") {
                        set("sireRegisterId", null);
                        set("sireBreed", "");
                        return;
                      }
                      const sire = activeSires.find((s) => s.id === parseInt(v));
                      set("sireRegisterId", parseInt(v));
                      set("sireBreed", sire?.breed ?? "");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select sire..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        activeSires.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                          s.name,
                          s.breed ? ` (${s.breed})` : "",
                          s.tagNumber ? ` — ${s.tagNumber}` : ""
                        ] }, s.id))
                      ] })
                    ]
                  }
                ),
                siresQ.isSuccess && activeSires.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No bulls in Sire Register. Add them via the Livestock → Breeding section." }),
                form.sireBreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                  "Breed auto-filled: ",
                  form.sireBreed
                ] })
              ] }),
              form.conceptionMethod === "ai" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "AI Straw (from Inventory)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.strawInventoryId ? String(form.strawInventoryId) : "__none__",
                    onValueChange: (v) => {
                      if (v === "__none__") {
                        set("strawInventoryId", null);
                        set("sireBreed", "");
                        return;
                      }
                      const straw = cattleStraws.find((s) => s.id === parseInt(v));
                      set("strawInventoryId", parseInt(v));
                      set("sireBreed", straw?.sireBreed ?? "");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select straw batch..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        cattleStraws.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                          s.sireName,
                          s.sireBreed ? ` (${s.sireBreed})` : "",
                          " — Batch ",
                          s.batchNumber
                        ] }, s.id))
                      ] })
                    ]
                  }
                ),
                strawsQ.isSuccess && cattleStraws.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No AI straws in inventory. Add them via the Livestock → Breeding section." }),
                form.sireBreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                  "Sire breed auto-filled: ",
                  form.sireBreed
                ] })
              ] }),
              (!form.conceptionMethod || form.conceptionMethod === "unknown") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sire Breed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sireBreed || "", onChange: (e) => set("sireBreed", e.target.value), placeholder: "e.g. Aberdeen Angus" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Calf Disposition ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-gray-400", children: "(optional — can be updated later)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfDisposition || "__none__", onValueChange: (v) => set("calfDisposition", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not yet decided..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not yet decided" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "retained", children: "Retained on farm (rear)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sold", children: "Sold" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "market", children: "To market / auction" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died", children: "Died post-birth" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Only needed for calves leaving the holding (sold/market) or that die post-birth. Calves retained on farm have their movements tracked automatically through the Livestock module — no need to record disposition here." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "bpp", checked: !!form.bcmsPassportApplied, onChange: (e) => set("bcmsPassportApplied", e.target.checked), className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bpp", children: "BCMS passport applied" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 ml-6", children: "UK rules: passport must be applied within 36 days of birth (or within 7 days if the calf leaves the farm of birth before day 36). Tick once submitted to BCMS/CTS." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-gray-200 self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Colostrum Management" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "c2h", checked: !!form.colostrumGivenWithin2Hours, onChange: (e) => set("colostrumGivenWithin2Hours", e.target.checked), className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c2h", children: "Colostrum given within 2 hours" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "c6h", checked: !!form.colostrumGivenWithin6Hours, onChange: (e) => set("colostrumGivenWithin6Hours", e.target.checked), className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c6h", children: "Colostrum given within 6 hours" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First Feed Volume (L)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.colostrumVolumeFirstFeedLitres || "", onChange: (e) => set("colostrumVolumeFirstFeedLitres", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Brix Quality (%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.colostrumQualityBrix || "", onChange: (e) => set("colostrumQualityBrix", e.target.value), placeholder: "≥22% = good" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum Source" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumSource || "", onValueChange: (v) => set("colostrumSource", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "own-dam", children: "Own dam" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other-cow", children: "Other cow on farm" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "frozen-stored", children: "Frozen/stored colostrum" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "colostrum-supplement", children: "Commercial colostrum supplement" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 5 })
          ] })
        ] })
      ] }),
      hasDeadCalf(form) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-amber-300 bg-amber-50 rounded-md p-4 space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800", children: "ABP Perinatal Disposal — Category 3 (Required)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "Stillborn and died-within-24h calves are Category 3 Animal By-Product waste (Regulation (EC) 1069/2009). They must be collected by a licensed fallen stock contractor or disposed of via another approved route. Retain the collection/consignment note for at least 3 years. These calves may not enter the food chain." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fallen Stock Contractor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.perinatalDisposalContractorId ? String(form.perinatalDisposalContractorId) : "", onValueChange: (v) => set("perinatalDisposalContractorId", v ? Number(v) : null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select contractor…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                contractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                  c.name,
                  " (",
                  c.approvalNumber,
                  ")"
                ] }, c.id)),
                contractors.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", disabled: true, children: "No contractors set up — add in Livestock settings" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.perinatalCollectionDate?.slice(0, 10) || "", onChange: (e) => set("perinatalCollectionDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consignment / NFAS Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalCollectionRef || "", onChange: (e) => set("perinatalCollectionRef", e.target.value), placeholder: "e.g. NFAS-LIN-0042-240317" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method (if no contractor)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalMethod || "", onChange: (e) => set("perinatalDisposalMethod", e.target.value), placeholder: "e.g. Hunt kennels, on-farm incinerator" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalNotes || "", onChange: (e) => set("perinatalDisposalNotes", e.target.value), placeholder: "Any additional disposal notes…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.calvingDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Calving"
        ] })
      ] })
    ] }) })
  ] });
}
function BcsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: bcsMembersData, isLoading: bcsMembersLoading } = useFarmMembers(farmId);
  const bcsStaffNames = (bcsMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-bcs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bcs-records`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/bcs-records/${editing.id}`) : api(`farms/${farmId}/dairy/bcs-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/bcs-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ assessmentDate: today(), assessedBy: myName });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10) });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const LIFE_STAGES = ["Early lactation (0-60 DIM)", "Mid lactation (60-200 DIM)", "Late lactation (>200 DIM)", "Dry period", "At dry-off", "At calving", "Heifers pre-calving"];
  const allBcsRecords = data?.records ?? [];
  const [yearFilterBcs, setYearFilterBcs] = reactExports.useState("all");
  const yearsBcs = reactExports.useMemo(() => {
    const s = new Set(allBcsRecords.map((r) => r.assessmentDate?.slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allBcsRecords]);
  const filteredBcsRecords = reactExports.useMemo(
    () => yearFilterBcs === "all" ? allBcsRecords : allBcsRecords.filter((r) => r.assessmentDate?.startsWith(yearFilterBcs)),
    [allBcsRecords, yearFilterBcs]
  );
  const bcsTrendData = React.useMemo(() => {
    const monthMap = {};
    for (const r of allBcsRecords) {
      if (!r.assessmentDate || !r.bcsScore) continue;
      const d = new Date(r.assessmentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const score = parseFloat(r.bcsScore);
      if (isNaN(score)) continue;
      if (!monthMap[key]) monthMap[key] = { sum: 0, count: 0, inRange: 0, outRange: 0 };
      monthMap[key].sum += score;
      monthMap[key].count++;
      if (score >= 2.5 && score <= 3.5) monthMap[key].inRange++;
      else monthMap[key].outRange++;
    }
    return Object.keys(monthMap).sort().map((m) => ({
      month: (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      avg: Math.round(monthMap[m].sum / monthMap[m].count * 10) / 10,
      inRange: monthMap[m].inRange,
      outRange: monthMap[m].outRange,
      total: monthMap[m].count
    }));
  }, [allBcsRecords]);
  function generateBcsReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const total = allBcsRecords.length;
    const inRange = allBcsRecords.filter((r) => r.bcsScore && parseFloat(r.bcsScore) >= 2.5 && parseFloat(r.bcsScore) <= 3.5).length;
    const actionsNeeded = allBcsRecords.filter((r) => r.actionRequired).length;
    const rows = allBcsRecords.map((r) => `<tr>
      <td>${r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${r.earTagNumber || "Group / all"}</td>
      <td>${r.lifeStage || "—"}</td>
      <td>${r.bcsScore || "—"}</td>
      <td>${r.targetScore || "—"}</td>
      <td>${r.bcsScore && parseFloat(r.bcsScore) >= 2.5 && parseFloat(r.bcsScore) <= 3.5 ? "In range" : r.bcsScore ? "<b style='color:#b45309'>Outside range</b>" : "—"}</td>
      <td>${r.assessedBy || "—"}</td>
      <td>${r.actionRequired ? "Yes" : "No"}</td>
      <td>${r.actionTaken || "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>BCS Records — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:10px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="hdr">
  <div><h1>Body Condition Scoring (BCS) Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${total} record${total !== 1 ? "s" : ""}</b><br>Target: 2.5–3.5 (1–5 scale)<br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${total}</div><div class="kpi-lbl">Total assessments</div></div>
  <div class="kpi-box"><div class="kpi-val">${total > 0 ? Math.round(inRange / total * 100) : 0}%</div><div class="kpi-lbl">Scores in target range (2.5–3.5)</div></div>
  <div class="kpi-box"><div class="kpi-val">${actionsNeeded}</div><div class="kpi-lbl">Actions flagged</div></div>
</div>
<h3>All BCS Records</h3>
<table>
  <tr><th>Date</th><th>Ear Tag / Group</th><th>Life Stage</th><th>Score</th><th>Target</th><th>Range</th><th>Assessed By</th><th>Action?</th><th>Action Taken</th></tr>
  ${rows || "<tr><td colspan='9'>No records</td></tr>"}
</table>
<p class="note">Body Condition Scoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires BCS assessed at dry-off, calving, and mid-lactation. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Body Condition Scoring (BCS) — document at dry-off, calving, and mid-lactation. Target range: 2.5–3.5 on a 1–5 scale." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterBcs, onValueChange: setYearFilterBcs, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsBcs.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateBcsReport, disabled: allBcsRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add BCS"
        ] })
      ] })
    ] }),
    bcsTrendData.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-0.5", children: "Average BCS by Month" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Monthly average body condition score — target band 2.5–3.5 shown in green" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: bcsTrendData, margin: { top: 4, right: 8, left: -20, bottom: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [1, 5], tick: { fontSize: 11 }, ticks: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [String(v), "Avg BCS"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 2.5, stroke: "#16a34a", strokeDasharray: "4 3", strokeWidth: 1.5, label: { value: "Min 2.5", position: "right", fontSize: 9, fill: "#16a34a" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 3.5, stroke: "#16a34a", strokeDasharray: "4 3", strokeWidth: 1.5, label: { value: "Max 3.5", position: "right", fontSize: 9, fill: "#16a34a" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "inRange", name: "In range", fill: "#bbf7d0", stackId: "a", radius: [0, 0, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "outRange", name: "Outside range", fill: "#fecaca", stackId: "a", radius: [3, 3, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "avg", name: "Avg BCS", stroke: "#1d4ed8", strokeWidth: 2, dot: { fill: "#1d4ed8", r: 3 } })
      ] }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View BCS Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.assessmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ear Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.earTagNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Life Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewRecord.lifeStage ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "BCS Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.bcsScore ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Target Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.targetScore ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.assessedBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.actionRequired ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.actionTaken ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes ?? "—") })
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
    !isLoading && filteredBcsRecords.length > 0 && (() => {
      const scores = filteredBcsRecords.map((r) => r.bcsScore ? parseFloat(r.bcsScore) : null).filter((v) => v !== null);
      const avgBcs = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const inRange = scores.filter((s) => s >= 2.5 && s <= 3.5).length;
      const inRangePct = scores.length > 0 ? Math.round(inRange / scores.length * 100) : null;
      const actionsNeeded = filteredBcsRecords.filter((r) => r.actionRequired).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Assessments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: filteredBcsRecords.length })
        ] }),
        avgBcs !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Avg BCS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: avgBcs.toFixed(2) })
        ] }),
        inRangePct !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: inRangePct >= 70 ? "#f0fdf4" : "#fef9c3", border: `1px solid ${inRangePct >= 70 ? "#bbf7d0" : "#fef08a"}`, borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: inRangePct >= 70 ? "#15803d" : "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "In Target Range (2.5–3.5)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: inRangePct >= 70 ? "#14532d" : "#78350f", lineHeight: 1, margin: 0 }, children: [
            inRangePct,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.65rem", color: inRangePct >= 70 ? "#15803d" : "#92400e", margin: "2px 0 0" }, children: [
            inRange,
            " of ",
            scores.length,
            " scored"
          ] })
        ] }),
        actionsNeeded > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: actionsNeeded })
        ] })
      ] });
    })(),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      !filteredBcsRecords.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: [
        "No BCS records",
        yearFilterBcs !== "all" ? ` for ${yearFilterBcs}` : "",
        " yet."
      ] }) }),
      filteredBcsRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.assessmentDate) }),
            r.earTagNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 font-mono", children: r.earTagNumber }),
            r.lifeStage && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.lifeStage }),
            r.bcsScore && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BcsBadge, { v: r.bcsScore }),
              r.targetScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "Target: ",
                r.targetScore
              ] })
            ] }),
            r.assessedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              "by ",
              r.assessedBy
            ] }),
            r.actionRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "Action needed"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "dairy-bcs-records", recordId: r.id, compact: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        r.actionTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
          "Action: ",
          r.actionTaken
        ] })
      ] }) }, r.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit BCS Record" : "Add BCS Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate?.slice(0, 10) || "", onChange: (e) => set("assessmentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Ear Tag (or leave blank for group)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.earTagNumber || "", onChange: (e) => set("earTagNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Life Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.lifeStage || "", onValueChange: (v) => set("lifeStage", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select life stage..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LIFE_STAGES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BCS Score (1–5 scale)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.bcsScore || "", onValueChange: (v) => set("bcsScore", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select score..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.targetScore || "", onValueChange: (v) => set("targetScore", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Optional target..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["2.0", "2.5", "3.0", "3.5", "4.0"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.assessedBy || "", onChange: (v) => set("assessedBy", v), staffNames: bcsStaffNames, loading: bcsMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "acreq", checked: !!form.actionRequired, onChange: (e) => set("actionRequired", e.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "acreq", children: "Management action required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.actionTaken || "", onChange: (e) => set("actionTaken", e.target.value), placeholder: "e.g. Moved to higher energy group, supplemented" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.assessmentDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add BCS"
        ] })
      ] })
    ] }) })
  ] });
}
function MobilityTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [animals, setAnimals] = reactExports.useState([]);
  const [pendingTag, setPendingTag] = reactExports.useState("");
  const [pendingScore, setPendingScore] = reactExports.useState(3);
  const [pendingNotes, setPendingNotes] = reactExports.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-mobility", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mobility-scorings`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: staffData } = useQuery({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then((r) => r.json())
  });
  const staffNames = staffData?.names ?? [];
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/mobility-scorings/${editing.id}`) : api(`farms/${farmId}/dairy/mobility-scorings`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setAnimals([]);
      setPendingTag("");
      setPendingNotes("");
      setPendingScore(3);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/mobility-scorings/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: cattleData } = useQuery({
    queryKey: ["farm-cattle", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then((r) => r.json()).catch(() => ({ records: [] })),
    enabled: open
  });
  const cattleList = (cattleData?.records ?? []).filter((a) => a.status === "active");
  const cattleTagListId = `cattle-tags-${farmId}`;
  function openAdd() {
    setEditing(null);
    setForm({ assessmentDate: today(), score0Count: 0, score1Count: 0, score2Count: 0, score3Count: 0, assessedBy: myName });
    setAnimals([]);
    setPendingTag("");
    setPendingScore(3);
    setPendingNotes("");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10), nextAssessmentDue: r.nextAssessmentDue?.slice(0, 10) });
    setAnimals((r.animals ?? []).map((a) => ({ ...a, scoreGrade: a.scoreGrade === 2 ? 2 : 3 })));
    setPendingTag("");
    setPendingScore(3);
    setPendingNotes("");
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function addAnimal() {
    const tag = pendingTag.trim();
    if (!tag) return;
    const matched = cattleList.find((c) => (c.tagNumber || "").toLowerCase() === tag.toLowerCase() || (c.earTagNumber || "").toLowerCase() === tag.toLowerCase());
    setAnimals((prev) => [...prev, {
      animalTag: tag,
      earTagNumber: matched?.earTagNumber ?? null,
      animalId: matched?.id ?? null,
      scoreGrade: pendingScore,
      notes: pendingNotes.trim() || null
    }]);
    setPendingTag("");
    setPendingNotes("");
  }
  function removeAnimal(idx) {
    setAnimals((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleAssessmentDateChange(dateStr) {
    const updates = { assessmentDate: dateStr };
    if (dateStr) {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + 91);
      updates.nextAssessmentDue = d.toISOString().slice(0, 10);
    }
    setForm((f) => ({ ...f, ...updates }));
  }
  const total = (form.score0Count || 0) + (form.score1Count || 0) + (form.score2Count || 0) + (form.score3Count || 0);
  const prevalence = total > 0 ? ((form.score3Count || 0) / total * 100).toFixed(1) : null;
  const score2Pct = total > 0 ? ((form.score2Count || 0) / total * 100).toFixed(1) : null;
  const staffListId = `mobility-staff-${farmId}`;
  const allMobilityRecords = data?.records ?? [];
  const [yearFilterMob, setYearFilterMob] = reactExports.useState("all");
  const yearsMob = reactExports.useMemo(() => {
    const s = new Set(allMobilityRecords.map((r) => r.assessmentDate?.slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allMobilityRecords]);
  const filteredMobilityRecords = reactExports.useMemo(
    () => yearFilterMob === "all" ? allMobilityRecords : allMobilityRecords.filter((r) => r.assessmentDate?.startsWith(yearFilterMob)),
    [allMobilityRecords, yearFilterMob]
  );
  const mobilityTrend = React.useMemo(() => {
    return [...allMobilityRecords].filter((r) => r.assessmentDate && r.lamenessPrevalencePercent != null).sort((a, b) => a.assessmentDate.localeCompare(b.assessmentDate)).map((r) => ({
      date: new Date(r.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }),
      lameness: parseFloat(r.lamenessPrevalencePercent),
      total: r.totalCowsScored
    }));
  }, [allMobilityRecords]);
  function generateMobilityReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const records = [...allMobilityRecords].sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate));
    const total2 = records.length;
    const aboveTarget = records.filter((r) => r.lamenessPrevalencePercent && parseFloat(r.lamenessPrevalencePercent) >= 10).length;
    const avgLameness = total2 > 0 ? (records.reduce((s, r) => s + (r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : 0), 0) / total2).toFixed(1) : "—";
    const rows = records.map((r) => {
      const lam = r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null;
      const lamCell = lam != null ? `<span style="color:${lam >= 10 ? "#b91c1c" : "#166534"};font-weight:600">${lam.toFixed(1)}%${lam >= 10 ? " ⚠" : ""}</span>` : "—";
      return `<tr>
        <td>${new Date(r.assessmentDate).toLocaleDateString("en-GB")}</td>
        <td>${r.assessedBy || "—"}</td>
        <td>${r.totalCowsScored}</td>
        <td>${r.score0Count}</td>
        <td>${r.score1Count}</td>
        <td>${r.score2Count}</td>
        <td>${r.score3Count}</td>
        <td>${lamCell}</td>
        <td style="font-size:9px">${r.animals && r.animals.length > 0 ? r.animals.map((a) => `[${a.scoreGrade}] ${a.animalTag}`).join(", ") : r.score3AnimalTags || r.score2AnimalTags || "—"}</td>
        <td style="font-size:9px">${r.actionTaken || "—"}</td>
        <td>${r.nextAssessmentDue ? new Date(r.nextAssessmentDue).toLocaleDateString("en-GB") : "—"}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Mobility Scoring — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:10px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Mobility / Lameness Scoring Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2><p style="margin:4px 0;font-size:9px;color:#6b7280">Quarterly assessment required. Score 3 (lame) target: below 10% of herd.</p></div>
  <div class="hdr-r"><b>${total2} assessment${total2 !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${total2}</div><div class="kpi-lbl">Total assessments</div></div>
  <div class="kpi-box"><div class="kpi-val">${avgLameness}%</div><div class="kpi-lbl">Average lameness prevalence</div></div>
  <div class="kpi-box"><div class="kpi-val">${aboveTarget}</div><div class="kpi-lbl">Sessions above 10% target</div></div>
</div>
<h3>All Mobility Assessments</h3>
<table>
  <tr><th>Date</th><th>Assessed By</th><th>Total</th><th>Score 0</th><th>Score 1</th><th>Score 2</th><th>Score 3</th><th>Lameness %</th><th>Lame tags</th><th>Action Taken</th><th>Next Due</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Mobility scoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires quarterly mobility scoring. Score 3 (severely lame) target: below 10% of herd. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: staffListId, children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Quarterly mobility/lameness scoring — score cows 0–3 as they walk from the parlour. Red Tractor target: score 3 (lame) cows below 10% of herd. Next assessment date auto-calculates at 13 weeks." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterMob, onValueChange: setYearFilterMob, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsMob.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateMobilityReport, disabled: allMobilityRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Assessment"
        ] })
      ] })
    ] }),
    mobilityTrend.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-0.5", children: "Lameness Prevalence Trend" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Score 3 (lame) cows as a % of herd per assessment session — Red Tractor target below 10%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: mobilityTrend, margin: { top: 4, right: 8, left: -20, bottom: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, "auto"], tick: { fontSize: 11 }, unit: "%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}%`, "Lameness"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 10, stroke: "#dc2626", strokeDasharray: "4 3", strokeWidth: 1.5, label: { value: "10% target", position: "right", fontSize: 9, fill: "#dc2626" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "lameness", name: "Lameness %", fill: "#fca5a5", radius: [3, 3, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "lameness", name: "Trend", stroke: "#dc2626", strokeWidth: 2, dot: { fill: "#dc2626", r: 3 } })
      ] }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Mobility Assessment — ",
        formatDate(viewRecord.assessmentDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.assessmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assessedBy || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Scored" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.totalCowsScored })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lameness Prevalence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `font-semibold ${viewRecord.lamenessPrevalencePercent && parseFloat(viewRecord.lamenessPrevalencePercent) >= 10 ? "text-red-600" : "text-green-700"}`, children: [
            viewRecord.lamenessPrevalencePercent ? `${parseFloat(viewRecord.lamenessPrevalencePercent).toFixed(1)}%` : "—",
            viewRecord.lamenessPrevalencePercent && parseFloat(viewRecord.lamenessPrevalencePercent) >= 10 ? " — Above target" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1", children: "Score Distribution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-green-100 text-green-800 px-2 py-1 rounded font-medium", children: [
              "Score 0 (Normal): ",
              viewRecord.score0Count
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-lime-100 text-lime-800 px-2 py-1 rounded font-medium", children: [
              "Score 1: ",
              viewRecord.score1Count
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium", children: [
              "Score 2 (Impaired): ",
              viewRecord.score2Count
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-red-100 text-red-800 px-2 py-1 rounded font-medium", children: [
              "Score 3 (Lame): ",
              viewRecord.score3Count
            ] })
          ] })
        ] }),
        viewRecord.animals && viewRecord.animals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-2", children: "Individual Animal Records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            viewRecord.animals.filter((a) => a.scoreGrade === 3).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-red-700 uppercase tracking-wide", children: "Score 3 — Lame" }),
              viewRecord.animals.filter((a) => a.scoreGrade === 3).map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 rounded px-2 py-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-red-500 text-white rounded px-1.5 py-0.5 font-bold text-xs", children: "3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium text-red-900", children: a.animalTag }),
                a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 italic", children: a.notes })
              ] }, i))
            ] }),
            viewRecord.animals.filter((a) => a.scoreGrade === 2).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-700 uppercase tracking-wide mt-1", children: "Score 2 — Impaired (Monitor)" }),
              viewRecord.animals.filter((a) => a.scoreGrade === 2).map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-2 py-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-amber-500 text-white rounded px-1.5 py-0.5 font-bold text-xs", children: "2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium text-amber-900", children: a.animalTag }),
                a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 italic", children: a.notes })
              ] }, i))
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          viewRecord.score3AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Score 3 — Ear Tag Numbers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-red-700 bg-red-50 rounded px-2 py-1 text-xs mt-1", children: viewRecord.score3AnimalTags })
          ] }),
          viewRecord.score2AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Score 2 — Ear Tag Numbers (Monitor)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-700 bg-amber-50 rounded px-2 py-1 text-xs mt-1", children: viewRecord.score2AnimalTags })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.actionTaken || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Assessment Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            formatDate(viewRecord.nextAssessmentDue),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(auto-calculated 13 weeks)" })
          ] })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
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
    !isLoading && filteredMobilityRecords.length > 0 && (() => {
      const totalCows = filteredMobilityRecords.reduce((s, r) => s + (r.totalCowsScored ?? 0), 0);
      const lamValues = filteredMobilityRecords.map((r) => r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null).filter((v) => v !== null);
      const avgLameness = lamValues.length > 0 ? lamValues.reduce((a, b) => a + b, 0) / lamValues.length : null;
      const aboveTarget = lamValues.filter((v) => v >= 10).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Assessments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: filteredMobilityRecords.length })
        ] }),
        totalCows > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Cows Scored" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: totalCows.toLocaleString("en-GB") })
        ] }),
        avgLameness !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: avgLameness >= 10 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${avgLameness >= 10 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 160 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: avgLameness >= 10 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Avg Lameness Prevalence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: avgLameness >= 10 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }, children: [
            avgLameness.toFixed(1),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "%" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", color: avgLameness >= 10 ? "#b91c1c" : "#15803d", margin: "2px 0 0" }, children: avgLameness >= 10 ? "Above 10% target" : "Within target" })
        ] }),
        aboveTarget > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Above 10% Target" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }, children: [
            aboveTarget,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: [
              "session",
              aboveTarget !== 1 ? "s" : ""
            ] })
          ] })
        ] })
      ] });
    })(),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      !filteredMobilityRecords.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: [
        "No mobility assessments",
        yearFilterMob !== "all" ? ` for ${yearFilterMob}` : "",
        " yet. Assessments should be carried out at least quarterly."
      ] }) }),
      filteredMobilityRecords.map((r) => {
        const lam = r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null;
        const s2pct = r.totalCowsScored > 0 ? r.score2Count / r.totalCowsScored * 100 : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "cursor-pointer hover:shadow-sm transition-shadow", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.assessmentDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                r.totalCowsScored,
                " cows scored"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-green-100 text-green-700 px-1.5 py-0.5 rounded", children: [
                  "0: ",
                  r.score0Count
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded", children: [
                  "1: ",
                  r.score1Count
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded", children: [
                  "2: ",
                  r.score2Count
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-red-100 text-red-700 px-1.5 py-0.5 rounded", children: [
                  "3: ",
                  r.score3Count
                ] })
              ] }),
              lam !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${lam >= 10 ? "bg-red-100 text-red-700" : lam >= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: [
                "Lameness: ",
                lam.toFixed(1),
                "%",
                lam >= 10 ? " ⚠ above target" : ""
              ] }),
              s2pct >= 20 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700", children: [
                "Score 2: ",
                s2pct.toFixed(1),
                "% — monitor"
              ] }),
              r.assessedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "by ",
                r.assessedBy
              ] }),
              r.nextAssessmentDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "Next: ",
                formatDate(r.nextAssessmentDue)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-2", onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "dairy-mobility-scorings", recordId: r.id, compact: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          r.actionTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
            "Action: ",
            r.actionTaken
          ] }),
          r.animals && r.animals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-1.5", children: r.animals.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded font-medium ${a.scoreGrade === 3 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`, children: [
            "[",
            a.scoreGrade,
            "] ",
            a.animalTag,
            a.notes ? ` — ${a.notes}` : ""
          ] }, i)) }) : r.score3AnimalTags || r.score2AnimalTags ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-1.5", children: [
            r.score3AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded", children: [
              "Score 3: ",
              r.score3AnimalTags
            ] }),
            r.score2AnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded", children: [
              "Score 2: ",
              r.score2AnimalTags
            ] })
          ] }) : null
        ] }) }, r.id);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "60rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Mobility Assessment" : "Add Mobility Assessment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Score cows 0–3 as they walk from the milking parlour. Next assessment date is calculated automatically at 13 weeks (Red Tractor quarterly requirement)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate?.slice(0, 10) || "", onChange: (e) => handleAssessmentDateChange(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StaffSelect,
                {
                  value: form.assessedBy || "",
                  onChange: (v) => set("assessedBy", v),
                  staffNames,
                  loading: false
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1", children: "Score counts — observe each cow walking from parlour" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-green-700 mb-0.5", children: "Score 0 — Normal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 mb-2", children: "Perfect gait, even weight bearing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score0Count || 0, onChange: (e) => set("score0Count", parseInt(e.target.value) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-lime-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-lime-700 mb-0.5", children: "Score 1 — Imperfect" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-lime-600 mb-2", children: "Minor gait imperfection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score1Count || 0, onChange: (e) => set("score1Count", parseInt(e.target.value) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-700 mb-0.5", children: "Score 2 — Impaired" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mb-2", children: "Clear gait impairment, arched back" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score2Count || 0, onChange: (e) => set("score2Count", parseInt(e.target.value) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-red-700 mb-0.5", children: "Score 3 — Lame" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: "Severely lame, reluctant to bear weight" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "text-center", value: form.score3Count || 0, onChange: (e) => set("score3Count", parseInt(e.target.value) || 0) })
            ] })
          ] }),
          total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg text-sm text-center space-y-0.5 ${prevalence && parseFloat(prevalence) >= 10 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `font-semibold ${prevalence && parseFloat(prevalence) >= 10 ? "text-red-700" : "text-green-700"}`, children: [
              total,
              " cows scored — Lameness (score 3): ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                prevalence,
                "%"
              ] }),
              prevalence && parseFloat(prevalence) >= 10 ? " ⚠ above 10% target" : " — within target"
            ] }),
            score2Pct && parseFloat(score2Pct) >= 20 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
              "Score 2 impaired: ",
              score2Pct,
              "% — above advisory 20% threshold"
            ] })
          ] }),
          ((form.score3Count || 0) > 0 || (form.score2Count || 0) > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 bg-gray-50 rounded-lg p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-700 uppercase tracking-wide", children: "Individual Animal Records" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Record each Score 2 or 3 animal individually by ear tag. Matched animals update their record in the livestock register." })
            ] }),
            animals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: animals.map((a, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 p-2 rounded border text-xs ${a.scoreGrade === 3 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold px-1.5 py-0.5 rounded text-white text-xs ${a.scoreGrade === 3 ? "bg-red-500" : "bg-amber-500"}`, children: a.scoreGrade }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800 flex-1", children: a.animalTag }),
              a.animalId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 text-xs", children: "✓ matched" }),
              a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 italic truncate max-w-[120px]", children: a.notes }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removeAnimal(idx), className: "text-gray-400 hover:text-red-500 ml-auto", children: "✕" })
            ] }, idx)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Ear tag number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    list: cattleTagListId,
                    value: pendingTag,
                    onChange: (e) => setPendingTag(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAnimal();
                      }
                    },
                    placeholder: "e.g. UK123456 001234",
                    className: "w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: cattleTagListId, children: cattleList.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.tagNumber || c.earTagNumber || "", children: c.earTagNumber ? `${c.tagNumber || ""} / ${c.earTagNumber}` : c.tagNumber || "" }, c.id)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Score" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingScore(2), className: `px-3 py-1.5 text-xs rounded border font-medium ${pendingScore === 2 ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-700 border-amber-300"}`, children: "2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingScore(3), className: `px-3 py-1.5 text-xs rounded border font-medium ${pendingScore === 3 ? "bg-red-500 text-white border-red-500" : "bg-white text-red-700 border-red-300"}`, children: "3" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Notes (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    value: pendingNotes,
                    onChange: (e) => setPendingNotes(e.target.value),
                    placeholder: "e.g. left rear",
                    className: "w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: addAnimal, disabled: !pendingTag.trim(), className: "px-3 py-1.5 text-xs rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap", children: "+ Add" })
            ] }),
            animals.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No animals added yet — use the form above to add each Score 2 or 3 animal individually." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-gray-200 self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.actionTaken || "", onChange: (e) => set("actionTaken", e.target.value), placeholder: "e.g. Score 3 cows referred to vet for foot trimming and examination", rows: 4 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Assessment Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextAssessmentDue?.slice(0, 10) || "", onChange: (e) => set("nextAssessmentDue", e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Auto-calculated 13 weeks from assessment date — override if vet specifies a shorter interval." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 4, placeholder: "e.g. Wet conditions in yard increased scores this month. Foot-bathing frequency increased to 3×/week." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 bg-gray-50 rounded p-3 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-500", children: "Threshold reminders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Score 3 ≥ 10% → critical alert + SMS sent to farm managers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Score 2 ≥ 20% → advisory notification to review foot bathing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Next assessment date appears in the Week Ahead Planner" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate({ ...form, totalCowsScored: total, animals }), disabled: save.isPending || !form.assessmentDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Assessment"
        ] })
      ] })
    ] }) })
  ] });
}
function AbrKitStockSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editingItem, setEditingItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [panelOpen, setPanelOpen] = reactExports.useState(false);
  const stockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`), { credentials: "include" }).then((r) => r.json())
  });
  const stock = stockQ.data?.stock ?? [];
  const lowStock = stock.filter((s) => s.quantityRemaining <= s.lowStockThreshold && s.quantityRemaining >= 0);
  const save = useMutation({
    mutationFn: (body) => {
      const url = editingItem ? api(`farms/${farmId}/dairy/abr-test-kit-stock/${editingItem.id}`) : api(`farms/${farmId}/dairy/abr-test-kit-stock`);
      return fetch(url, { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setEditingItem(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditingItem(null);
    setForm({ quantityPurchased: 0, quantityUsed: 0, lowStockThreshold: 5 });
    setOpen(true);
  }
  function openEdit(s) {
    setEditingItem(s);
    setForm({ ...s });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
        onClick: () => setPanelOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "ABR Test Kit Stock (",
              stock.length,
              " products)"
            ] }),
            lowStock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              lowStock.length,
              " low stock"
            ] })
          ] }),
          panelOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-500" })
        ]
      }
    ),
    panelOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Track antibiotic residue test kit batches, lot numbers, expiry dates, and remaining stock. When linked to a milk record, stock automatically decrements." }),
      stockQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : stock.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No kit stock logged yet. Add your first kit batch below." }) : stock.map((s) => {
        const isLow = s.quantityRemaining <= s.lowStockThreshold;
        const isOut = s.quantityRemaining === 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start justify-between rounded-md border px-3 py-2.5 ${isOut ? "bg-red-50 border-red-200" : isLow ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: s.productName }),
              s.supplier && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: s.supplier }),
              isOut ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full", children: "Out of stock" }) : isLow ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                "Low stock"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                "In stock"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-gray-500", children: [
              s.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Lot: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: s.lotNumber })
              ] }),
              s.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Batch: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: s.batchNumber })
              ] }),
              s.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Expires: ",
                formatDate(s.expiryDate)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
                s.quantityRemaining,
                " of ",
                s.quantityPurchased,
                " remaining"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "(",
                s.quantityUsed,
                " used)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, s.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Kit Batch"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingItem ? "Edit Kit Batch" : "Add ABR Test Kit Batch" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Delvotest Accelerator, BRT Tube Kit", value: form.productName || "", onChange: (e) => set("productName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Neogen, Charm Sciences", value: form.supplier || "", onChange: (e) => set("supplier", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate || "", onChange: (e) => set("expiryDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit box", value: form.lotNumber || "", onChange: (e) => set("lotNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit box", value: form.batchNumber || "", onChange: (e) => set("batchNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty Purchased" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.quantityPurchased ?? "", onChange: (e) => set("quantityPurchased", parseInt(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty Used (to date)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.quantityUsed ?? "", onChange: (e) => set("quantityUsed", parseInt(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Low Stock Alert Threshold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.lowStockThreshold ?? 5, onChange: (e) => set("lowStockThreshold", parseInt(e.target.value) || 5) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.productName?.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editingItem ? "Save Changes" : "Add Batch"
        ] })
      ] })
    ] }) })
  ] });
}
function AbrBadge({ result }) {
  if (!result) return null;
  const ok = result === "negative";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded flex items-center gap-1 ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`, children: [
    ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
    "ABR: ",
    result
  ] });
}
function TempBadge({ v }) {
  if (!v) return null;
  const n = parseFloat(v);
  const cls = n <= 4 ? "bg-green-100 text-green-700" : n <= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded flex items-center gap-1 ${cls}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "h-3 w-3" }),
    v,
    "°C"
  ] });
}
function BulkTankTab({ farmId, showCollections = true }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tanksOpen, setTanksOpen] = reactExports.useState(true);
  const [tankDialog, setTankDialog] = reactExports.useState(false);
  const [editingTank, setEditingTank] = reactExports.useState(null);
  const [tankForm, setTankForm] = reactExports.useState({});
  const [qrTank, setQrTank] = reactExports.useState(null);
  const tanksQ = useQuery({
    queryKey: ["dairy-tanks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/tanks`), { credentials: "include" }).then((r) => r.json())
  });
  const tanks = tanksQ.data?.tanks ?? [];
  const saveTank = useMutation({
    mutationFn: (body) => {
      const url = editingTank ? api(`farms/${farmId}/dairy/tanks/${editingTank.id}`) : api(`farms/${farmId}/dairy/tanks`);
      return fetch(url, { method: editingTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] });
      setTankDialog(false);
      setEditingTank(null);
      setTankForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delTank = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/tanks/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddTank() {
    setEditingTank(null);
    setTankForm({});
    setTankDialog(true);
  }
  function openEditTank(t) {
    setEditingTank(t);
    setTankForm({ ...t });
    setTankDialog(true);
  }
  const [monDialog, setMonDialog] = reactExports.useState(false);
  const [editingMon, setEditingMon] = reactExports.useState(null);
  const [viewMon, setViewMon] = reactExports.useState(null);
  const [monForm, setMonForm] = reactExports.useState({});
  const [monYearFilter, setMonYearFilter] = reactExports.useState("all");
  const monQ = useQuery({
    queryKey: ["dairy-tank-records", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bulk-tank-records`), { credentials: "include" }).then((r) => r.json())
  });
  const saveMon = useMutation({
    mutationFn: (body) => {
      const url = editingMon ? api(`farms/${farmId}/dairy/bulk-tank-records/${editingMon.id}`) : api(`farms/${farmId}/dairy/bulk-tank-records`);
      return fetch(url, { method: editingMon ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] });
      setMonDialog(false);
      setEditingMon(null);
      setMonForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delMon = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/bulk-tank-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddMon() {
    setEditingMon(null);
    setMonForm({ recordDate: today(), recordType: "daily-temperature" });
    setMonDialog(true);
  }
  function openEditMon(r) {
    setEditingMon(r);
    setMonForm({ ...r, recordDate: r.recordDate.slice(0, 10) });
    setMonDialog(true);
  }
  function setMon(k, v) {
    setMonForm((f) => ({ ...f, [k]: v }));
  }
  const [collDialog, setCollDialog] = reactExports.useState(false);
  const [editingColl, setEditingColl] = reactExports.useState(null);
  const [collForm, setCollForm] = reactExports.useState({});
  const [showCollQuality, setShowCollQuality] = reactExports.useState(false);
  const collQ = useQuery({
    queryKey: ["dairy-milk-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-collections`), { credentials: "include" }).then((r) => r.json())
  });
  const saveColl = useMutation({
    mutationFn: (body) => {
      const url = editingColl ? api(`farms/${farmId}/dairy/milk-collections/${editingColl.id}`) : api(`farms/${farmId}/dairy/milk-collections`);
      return fetch(url, { method: editingColl ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] });
      setCollDialog(false);
      setEditingColl(null);
      setCollForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delColl = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/milk-collections/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddColl() {
    setEditingColl(null);
    setCollForm({ collectionDate: today() });
    setShowCollQuality(false);
    setCollDialog(true);
  }
  function openEditColl(c) {
    setEditingColl(c);
    setCollForm({ ...c, collectionDate: c.collectionDate.slice(0, 10) });
    setShowCollQuality(!!(c.buyerSccThousands || c.buyerBactoscanThousands || c.buyerFatPercent));
    setCollDialog(true);
  }
  function setColl(k, v) {
    setCollForm((f) => ({ ...f, [k]: v }));
  }
  const tankName = (id) => tanks.find((t) => t.id === id)?.name ?? null;
  const allMonRecords = monQ.data?.records ?? [];
  const monYears = React.useMemo(() => {
    const s = new Set(allMonRecords.map((r) => r.recordDate.slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allMonRecords]);
  const monRecords = React.useMemo(
    () => monYearFilter === "all" ? allMonRecords : allMonRecords.filter((r) => r.recordDate.startsWith(monYearFilter)),
    [allMonRecords, monYearFilter]
  );
  const collRecords = collQ.data?.collections ?? [];
  const tankComplianceSummary = React.useMemo(() => {
    const tempRecords = monRecords.filter((r) => r.recordType === "daily-temperature" && r.tankTemperatureCelsius != null);
    const tempInRange = tempRecords.filter((r) => Number(r.tankTemperatureCelsius) <= 4).length;
    const cleaningCount = monRecords.filter((r) => r.tankCleaned).length;
    const abrTests = monRecords.filter((r) => r.antibioticResidueResult);
    const abrPositive = abrTests.filter((r) => r.antibioticResidueResult === "positive").length;
    const abrNegative = abrTests.filter((r) => r.antibioticResidueResult === "negative").length;
    const totalCollVol = collRecords.reduce((s, c) => s + (c.volumeCollectedLitres ? parseFloat(String(c.volumeCollectedLitres)) : 0), 0);
    return { tempTotal: tempRecords.length, tempInRange, cleaningCount, abrTests: abrTests.length, abrPositive, abrNegative, totalCollVol: Math.round(totalCollVol) };
  }, [monRecords, collRecords]);
  function generateTankReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const s = tankComplianceSummary;
    const tempPct = s.tempTotal > 0 ? Math.round(s.tempInRange / s.tempTotal * 100) : null;
    const monRows = [...monRecords].sort((a, b) => b.recordDate.localeCompare(a.recordDate)).map((r) => `<tr>
      <td>${new Date(r.recordDate).toLocaleDateString("en-GB")}</td>
      <td>${tanks.find((t) => t.id === r.tankId)?.name ?? "—"}</td>
      <td>${r.recordType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td>
      <td>${r.tankTemperatureCelsius != null ? `${r.tankTemperatureCelsius}°C${Number(r.tankTemperatureCelsius) <= 4 ? "" : " ⚠"}` : "—"}</td>
      <td>${r.tankCleaned ? "Yes" : "No"}</td>
      <td>${r.cleaningProductUsed || "—"}</td>
      <td>${r.antibioticResidueResult ? r.antibioticResidueResult === "positive" ? "<b style='color:#b91c1c'>POSITIVE ⚠</b>" : "Negative" : "—"}</td>
      <td style="font-size:9px">${r.notes || "—"}</td>
    </tr>`).join("");
    const collRows = [...collRecords].sort((a, b) => b.collectionDate.localeCompare(a.collectionDate)).map((c) => `<tr>
      <td>${new Date(c.collectionDate).toLocaleDateString("en-GB")}</td>
      <td>${tanks.find((t) => t.id === c.tankId)?.name ?? "—"}</td>
      <td>${c.volumeCollectedLitres ? `${Number(c.volumeCollectedLitres).toLocaleString()} L` : "—"}</td>
      <td>${c.milkBuyer || "—"}</td>
      <td>${c.collectionRef || "—"}</td>
      <td>${c.abtResultBeforeCollection ? c.abtResultBeforeCollection === "positive" ? "<b style='color:#b91c1c'>POSITIVE ⚠</b>" : "Negative" : "—"}</td>
      <td>${c.pencePerLitre ? `${parseFloat(c.pencePerLitre).toFixed(2)}ppl` : "—"}</td>
      <td>${c.netPaymentPence != null ? `£${(c.netPaymentPence / 100).toFixed(2)}` : "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Bulk Tank — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:18px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Bulk Tank — Monitoring &amp; Compliance Report</h1><h2>Red Tractor Dairy Scheme</h2></div>
  <div class="hdr-r">${tanks.length} tank${tanks.length !== 1 ? "s" : ""} registered<br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${tempPct != null ? `${tempPct}%` : "—"}</div><div class="kpi-lbl">Temp ≤4°C compliance (${s.tempInRange}/${s.tempTotal} checks)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.cleaningCount}</div><div class="kpi-lbl">Cleaning records</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.abrPositive > 0 ? `<span style="color:#b91c1c">${s.abrPositive} POSITIVE</span>` : s.abrNegative}</div><div class="kpi-lbl">ABR tests (tank monitoring)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.totalCollVol.toLocaleString()} L</div><div class="kpi-lbl">Total milk collected</div></div>
</div>
${monRows ? `<h3>Tank Monitoring Records</h3><table><tr><th>Date</th><th>Tank</th><th>Type</th><th>Temperature</th><th>Cleaned</th><th>Product</th><th>ABR Result</th><th>Notes</th></tr>${monRows}</table>` : ""}
${collRows ? `<h3>Milk Collections</h3><table><tr><th>Date</th><th>Tank</th><th>Volume</th><th>Buyer</th><th>Ref</th><th>ABR (pre-collection)</th><th>ppl</th><th>Net payment</th></tr>${collRows}</table>` : ""}
<p class="note">Bulk tank compliance report produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires daily temperature records, regular cleaning logs, and pre-collection ABR testing. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-gray-800", children: "Compliance Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateTankReport, disabled: monRecords.length === 0 && collRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: tankComplianceSummary.tempTotal > 0 ? `${Math.round(tankComplianceSummary.tempInRange / tankComplianceSummary.tempTotal * 100)}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Temp ≤4°C compliance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            tankComplianceSummary.tempInRange,
            "/",
            tankComplianceSummary.tempTotal,
            " checks"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: tankComplianceSummary.cleaningCount || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Cleaning records" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          tankComplianceSummary.abrPositive > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-red-700", children: [
            tankComplianceSummary.abrPositive,
            " positive"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: tankComplianceSummary.abrNegative || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "ABR tests" }),
          tankComplianceSummary.abrPositive > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 font-medium", children: "Action required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-blue-700", children: tankComplianceSummary.totalCollVol > 0 ? `${tankComplianceSummary.totalCollVol.toLocaleString()} L` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Total milk collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            collRecords.length,
            " collection",
            collRecords.length !== 1 ? "s" : ""
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
          onClick: () => setTanksOpen((o) => !o),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "Registered Bulk Tanks (",
              tanks.length,
              ")"
            ] }),
            tanksOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-500" })
          ]
        }
      ),
      tanksOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Register each bulk tank on the holding. Once registered, select the tank when logging monitoring records or milk collections." }),
        tanksQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : tanks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No tanks registered yet. Add your first tank below." }) : tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-white border rounded px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: t.name }),
            t.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              "· ",
              t.location
            ] }),
            t.capacityLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              "· ",
              Number(t.capacityLitres).toLocaleString(),
              " L"
            ] }),
            t.latitudeDeg != null && t.longitudeDeg != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `https://maps.google.com/?q=${t.latitudeDeg},${t.longitudeDeg}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline",
                title: "View on Google Maps",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                  "GPS"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", title: "View QR code", onClick: () => setQrTank(t), children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEditTank(t), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => delTank.mutate(t.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, t.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAddTank, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          "Add Tank"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-gray-800", children: "Tank Monitoring Records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Daily temperature checks, cleaning, antibiotic residue tests, and maintenance logs." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monYearFilter, onValueChange: setMonYearFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[110px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
              monYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddMon, disabled: tanksQ.isLoading || tanks.length === 0, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Add Record"
          ] })
        ] })
      ] }),
      !tanksQ.isLoading && tanks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-500 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "No tanks registered." }),
          " You must register at least one bulk tank before adding monitoring records. Use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Registered Bulk Tanks" }),
          " section above to add your first tank."
        ] })
      ] }),
      monQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : !monRecords.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: allMonRecords.length ? "No records for selected year." : "No monitoring records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: monRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.recordDate) }),
            r.tankId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: tankName(r.tankId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 capitalize", children: r.recordType.replace(/-/g, " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TempBadge, { v: r.tankTemperatureCelsius }),
            r.tankCleaned && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              "Cleaned"
            ] }),
            r.cleaningProductUsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: r.cleaningProductUsed }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AbrBadge, { result: r.antibioticResidueResult }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "dairy/bulk-tank-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["dairy-tank-records", farmId], compact: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewMon(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEditMon(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => delMon.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
      ] }) }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: tankDialog, onOpenChange: setTankDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingTank ? "Edit Tank" : "Add Bulk Tank" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank Name / Designation *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Tank 1, Main Tank, Overflow Tank", value: tankForm.name || "", onChange: (e) => setTankForm((f) => ({ ...f, name: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location on Holding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Main Dairy, North Unit", value: tankForm.location || "", onChange: (e) => setTankForm((f) => ({ ...f, location: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "e.g. 12000", value: tankForm.capacityLitres || "", onChange: (e) => setTankForm((f) => ({ ...f, capacityLitres: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-blue-500" }),
            "GPS Location (optional)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1.5", children: "Set coordinates so the tank appears on the farm map. Use the mobile app to capture GPS automatically, or enter manually below." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-normal text-gray-500", children: "Latitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.000001", placeholder: "e.g. 51.507351", value: tankForm.latitudeDeg ?? "", onChange: (e) => setTankForm((f) => ({ ...f, latitudeDeg: e.target.value ? parseFloat(e.target.value) : null })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-normal text-gray-500", children: "Longitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.000001", placeholder: "e.g. -0.127758", value: tankForm.longitudeDeg ?? "", onChange: (e) => setTankForm((f) => ({ ...f, longitudeDeg: e.target.value ? parseFloat(e.target.value) : null })) })
            ] })
          ] }),
          tankForm.latitudeDeg != null && tankForm.longitudeDeg != null && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `https://maps.google.com/?q=${tankForm.latitudeDeg},${tankForm.longitudeDeg}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline mt-1 inline-block", children: "Preview on Google Maps →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: tankForm.notes || "", onChange: (e) => setTankForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTankDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveTank.mutate(tankForm), disabled: saveTank.isPending || !tankForm.name?.trim(), children: [
          saveTank.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editingTank ? "Save Changes" : "Add Tank"
        ] })
      ] })
    ] }) }),
    qrTank && (() => {
      const qrValue = `BDE:F${farmId}:TNK-${qrTank.id}`;
      function downloadQr() {
        const svg = document.getElementById(`tank-qr-${qrTank.id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 400, 480);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 50, 40, 300, 300);
          ctx.fillStyle = "#111827";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(qrTank.name, 200, 380);
          ctx.font = "14px sans-serif";
          ctx.fillStyle = "#6b7280";
          ctx.fillText("BDE Farm Trac · Bulk Tank", 200, 406);
          ctx.fillText(`TNK-${qrTank.id}`, 200, 430);
          const link = document.createElement("a");
          link.download = `tank-qr-${qrTank.name.replace(/\s+/g, "-")}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setQrTank(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "24rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-4 w-4" }),
          "QR Label — ",
          qrTank.name
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { id: `tank-qr-${qrTank.id}`, value: qrValue, size: 220, level: "H", includeMargin: false }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-gray-800", children: qrTank.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "BDE Farm Trac · Bulk Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-mono text-gray-400 mt-0.5", children: [
              "TNK-",
              qrTank.id
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 text-center", children: "Scan with the BDE Farm Trac mobile app to log monitoring records, cleaning events, or view tank details without manual selection." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setQrTank(null), children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: downloadQr, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1.5" }),
            "Download PNG"
          ] })
        ] })
      ] }) });
    })(),
    viewMon && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewMon(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Monitoring Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewMon.recordDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Tank" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: tankName(viewMon.tankId) ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Record Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewMon.recordType.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.tankTemperatureCelsius ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Tank Cleaned" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.tankCleaned ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cleaning Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.cleaningProductUsed ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cleaning Batch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.cleaningProductBatch ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewMon.antibioticResidueResult ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Test Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.antibioticResidueTestRef ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMon.notes ?? "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEditMon(viewMon);
          setViewMon(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewMon(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: monDialog, onOpenChange: setMonDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingMon ? "Edit Monitoring Record" : "Add Monitoring Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: monForm.recordDate?.slice(0, 10) || "", onChange: (e) => setMon("recordDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.tankId ? String(monForm.tankId) : "__none__", onValueChange: (v) => setMon("tankId", v !== "__none__" ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(t.id), children: [
                t.name,
                t.location ? ` — ${t.location}` : ""
              ] }, t.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Record Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.recordType || "daily-temperature", onValueChange: (v) => setMon("recordType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily-temperature", children: "Daily Temperature Check" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cleaning", children: "Tank Cleaning" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "antibiotic-residue-test", children: "Antibiotic Residue Test" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "maintenance", children: "Tank Maintenance" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: monForm.tankTemperatureCelsius || "", onChange: (e) => setMon("tankTemperatureCelsius", e.target.value), placeholder: "Target ≤4°C" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "tc", checked: !!monForm.tankCleaned, onChange: (e) => setMon("tankCleaned", e.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tc", children: "Tank cleaned and sanitised" })
        ] }),
        monForm.tankCleaned && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cleaning Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.cleaningProductUsed || "", onChange: (e) => setMon("cleaningProductUsed", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.cleaningProductBatch || "", onChange: (e) => setMon("cleaningProductBatch", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Antibiotic Residue Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.antibioticResidueResult || "", onValueChange: (v) => setMon("antibioticResidueResult", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not tested" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borderline", children: "Borderline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invalid", children: "Invalid (test void)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.antibioticResidueTestRef || "", onChange: (e) => setMon("antibioticResidueTestRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: monForm.notes || "", onChange: (e) => setMon("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMonDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveMon.mutate(monForm), disabled: saveMon.isPending || !monForm.recordDate, children: [
          saveMon.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editingMon ? "Save Changes" : "Add Record"
        ] })
      ] })
    ] }) }),
    showCollections && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm text-gray-800", children: [
              "Milk Collections (",
              collRecords.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Record each milk uplift with volumes, financial settlement, and buyer quality results." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddColl, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Log Collection"
          ] })
        ] }),
        collQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) }) : collRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-6 text-center text-sm text-gray-400 italic", children: "No milk collections recorded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: [...collRecords].sort((a, b) => b.collectionDate.localeCompare(a.collectionDate)).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(c.collectionDate) }),
            c.tankId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: tankName(c.tankId) }),
            c.milkBuyer && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: c.milkBuyer }),
            c.volumeCollectedLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded", children: [
              parseFloat(String(c.volumeCollectedLitres)).toLocaleString(),
              " L"
            ] }),
            c.pencePerLitre && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              parseFloat(String(c.pencePerLitre)).toFixed(2),
              "ppl"
            ] }),
            c.buyerSccThousands != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded ${c.buyerSccThousands < 100 ? "bg-green-50 text-green-700" : c.buyerSccThousands < 200 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`, children: [
              "SCC: ",
              c.buyerSccThousands,
              "k"
            ] }),
            c.buyerBactoscanThousands != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded", children: [
              "Bact: ",
              c.buyerBactoscanThousands,
              "k"
            ] }),
            c.buyerTvcCfuMl != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: [
              "TVC: ",
              c.buyerTvcCfuMl.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => openEditColl(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-red-500 hover:text-red-700", onClick: () => {
              if (confirm("Delete this collection record?")) delColl.mutate(c.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: collDialog, onOpenChange: setCollDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editingColl ? "Edit" : "Log",
          " Milk Collection"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1", children: "Collection Details" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: collForm.collectionDate || "", onChange: (e) => setColl("collectionDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bulk Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(collForm.tankId ?? "__none__"), onValueChange: (v) => setColl("tankId", v === "__none__" ? null : parseInt(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tank" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No tank" }),
                tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: t.name }, t.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume Collected (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: collForm.volumeCollectedLitres ?? "", onChange: (e) => setColl("volumeCollectedLitres", e.target.value), placeholder: "e.g. 8500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Buyer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.milkBuyer || "", onChange: (e) => setColl("milkBuyer", e.target.value), placeholder: "e.g. Müller, Arla" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tanker Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.tankerRegistration || "", onChange: (e) => setColl("tankerRegistration", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tanker Driver" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.tankerDriverName || "", onChange: (e) => setColl("tankerDriverName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.collectionRef || "", onChange: (e) => setColl("collectionRef", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statement Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.statementRef || "", onChange: (e) => setColl("statementRef", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Result (pre-collection)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: collForm.abtResultBeforeCollection || "", onChange: (e) => setColl("abtResultBeforeCollection", e.target.value), placeholder: "e.g. Negative" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1", children: "Financial Settlement" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pence per Litre" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.pencePerLitre ?? "", onChange: (e) => setColl("pencePerLitre", e.target.value), placeholder: "e.g. 35.50" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.grossValuePence != null ? (collForm.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setColl("grossValuePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null), placeholder: "e.g. 3018.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Bonus (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.qualityBonusPence != null ? (collForm.qualityBonusPence / 100).toFixed(2) : "", onChange: (e) => setColl("qualityBonusPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Penalty (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.qualityPenaltyPence != null ? (collForm.qualityPenaltyPence / 100).toFixed(2) : "", onChange: (e) => setColl("qualityPenaltyPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport Deduction (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.transportDeductionPence != null ? (collForm.transportDeductionPence / 100).toFixed(2) : "", onChange: (e) => setColl("transportDeductionPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.netPaymentPence != null ? (collForm.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setColl("netPaymentPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium", onClick: () => setShowCollQuality((v) => !v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5" }),
            showCollQuality ? "Hide" : "Add",
            " Buyer Quality Results"
          ] }) }),
          showCollQuality && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-0.5", children: "Buyer Quality Results" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer SCC (k/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerSccThousands ?? "", onChange: (e) => setColl("buyerSccThousands", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 120" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bactoscan (k/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerBactoscanThousands ?? "", onChange: (e) => setColl("buyerBactoscanThousands", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TVC (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerTvcCfuMl ?? "", onChange: (e) => setColl("buyerTvcCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thermodurics (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerThermsCfuMl ?? "", onChange: (e) => setColl("buyerThermsCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Coliforms (cfu/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: collForm.buyerColiformsCfuMl ?? "", onChange: (e) => setColl("buyerColiformsCfuMl", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Fat%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerFatPercent ?? "", onChange: (e) => setColl("buyerFatPercent", e.target.value), placeholder: "e.g. 4.15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Protein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerProteinPercent ?? "", onChange: (e) => setColl("buyerProteinPercent", e.target.value), placeholder: "e.g. 3.30" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Casein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerCaseinPercent ?? "", onChange: (e) => setColl("buyerCaseinPercent", e.target.value), placeholder: "e.g. 2.60" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lactose%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: collForm.buyerLactosePercent ?? "", onChange: (e) => setColl("buyerLactosePercent", e.target.value), placeholder: "e.g. 4.70" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Urea (mmol/L)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: collForm.buyerUreaMillimolesPerLitre ?? "", onChange: (e) => setColl("buyerUreaMillimolesPerLitre", e.target.value), placeholder: "e.g. 4.5" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: collForm.notes || "", onChange: (e) => setColl("notes", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCollDialog(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveColl.mutate(collForm), disabled: saveColl.isPending || !collForm.collectionDate, children: [
            saveColl.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
            editingColl ? "Save Changes" : "Log Collection"
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
const DCT_WITHDRAWAL = {
  "Orbenin Extra Dry Cow": { milkDays: 7, meatDays: 28 },
  "Orbenin Quick Release": { milkDays: 4, meatDays: 10 },
  "Bovaclox DC Extra": { milkDays: 7, meatDays: 28 },
  "Bovaclox Milking": { milkDays: 4, meatDays: 14 },
  "Tetra-Delta": { milkDays: 7, meatDays: 60 },
  "Pirsue 5 mg/ml": { milkDays: 7, meatDays: 30 },
  "Mastiplan LC": { milkDays: 7, meatDays: 28 },
  "Kloxerate Plus": { milkDays: 7, meatDays: 28 },
  "Ubrolexin": { milkDays: 5, meatDays: 21 }
};
const INTRAMAMMARY_ANTIBIOTICS = VMD_MEDICINES.filter(
  (m) => m.category === "Intramammary" && !m.name.toLowerCase().includes("sealant") && !m.activeIngredient.toLowerCase().includes("bismuth")
);
const INTRAMAMMARY_SEALANTS = VMD_MEDICINES.filter(
  (m) => m.category === "Intramammary" && (m.name.toLowerCase().includes("sealant") || m.activeIngredient.toLowerCase().includes("bismuth"))
);
function ProductCombobox({
  value,
  onChange,
  options,
  placeholder
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const wrapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filtered = query.length >= 1 ? options.filter(
    (o) => o.name.toLowerCase().includes(query.toLowerCase()) || o.activeIngredient.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10) : options.slice(0, 10);
  function select(name) {
    onChange(name);
    setQuery("");
    setOpen(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: wrapRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value: open ? query : value || "",
        placeholder,
        onChange: (e) => {
          setQuery(e.target.value);
          setOpen(true);
          onChange(e.target.value);
        },
        onFocus: () => {
          setOpen(true);
          setQuery("");
        },
        className: "pr-7",
        autoComplete: "off"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto", children: [
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-3 text-xs text-gray-400 text-center", children: "No products match — type to enter custom name" }),
      filtered.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: `w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-start justify-between gap-2 ${value === o.name ? "bg-primary/10" : ""}`,
          onMouseDown: (e) => {
            e.preventDefault();
            select(o.name);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: o.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400", children: o.activeIngredient })
            ] }),
            value === o.name && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" })
          ]
        },
        o.name
      ))
    ] })
  ] });
}
function NameCombobox({
  value,
  onChange,
  names,
  placeholder,
  allowFreeType = true
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const wrapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filtered = query.length >= 1 ? names.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 12) : names.slice(0, 12);
  function select(name) {
    onChange(name);
    setQuery("");
    setOpen(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: wrapRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value: open ? query : value || "",
        placeholder,
        onChange: (e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (allowFreeType) onChange(e.target.value);
        },
        onFocus: () => {
          setOpen(true);
          setQuery("");
        },
        className: "pr-7",
        autoComplete: "off"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto", children: [
      filtered.length === 0 && names.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-3 text-xs text-gray-400 text-center", children: "No previous records — type name above" }),
      filtered.length === 0 && names.length > 0 && query.length >= 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 text-xs text-gray-400", children: [
        'No match — will use "',
        query,
        '"'
      ] }),
      filtered.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: `w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-center justify-between ${value === n ? "bg-primary/10" : ""}`,
          onMouseDown: (e) => {
            e.preventDefault();
            select(n);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: n }),
            value === n && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary shrink-0" })
          ]
        },
        n
      ))
    ] })
  ] });
}
function AnimalEarTagCombobox({
  value,
  onSelect,
  animals
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const wrapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filtered = query.length >= 1 ? animals.filter((a) => {
    const tag = (a.earTagNumber || a.tagNumber || "").toLowerCase();
    return tag.includes(query.toLowerCase());
  }).slice(0, 12) : animals.slice(0, 12);
  function select(a) {
    const tag = a.earTagNumber || a.tagNumber || "";
    onSelect(tag, a);
    setQuery("");
    setOpen(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: wrapRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value: open ? query : value || "",
        placeholder: "e.g. UK123456 78901",
        onChange: (e) => {
          setQuery(e.target.value);
          setOpen(true);
          onSelect(e.target.value, null);
        },
        onFocus: () => {
          setOpen(true);
          setQuery(value || "");
        },
        className: "pr-7",
        autoComplete: "off"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto", children: [
      animals.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-3 text-xs text-gray-400 text-center", children: "No animals in register — enter tag manually" }),
      filtered.length === 0 && query.length >= 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-3 text-xs text-gray-400 text-center", children: [
        'No match — enter "',
        query,
        '" manually'
      ] }),
      filtered.map((a) => {
        const tag = a.earTagNumber || a.tagNumber || "—";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: `w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-center justify-between gap-2 ${value === tag ? "bg-primary/10" : ""}`,
            onMouseDown: (e) => {
              e.preventDefault();
              select(a);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono font-medium", children: tag }),
                a.breed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400", children: a.breed })
              ] }),
              value === tag && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary shrink-0" })
            ]
          },
          a.id
        );
      })
    ] })
  ] });
}
function DctTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [hint, setHint] = reactExports.useState(null);
  const [hintLoading, setHintLoading] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-dct", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/dct-records`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: animalsData } = useQuery({
    queryKey: ["farm-animals-dct", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 6e4
  });
  const animals = (animalsData?.records ?? []).filter((a) => {
    const sp = (a.species || "").toLowerCase();
    return !sp || sp.includes("bovine") || sp.includes("cattle") || sp.includes("cow") || sp.includes("dairy");
  });
  const { data: vetNamesData } = useQuery({
    queryKey: ["dct-vet-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/dct-vet-names`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 12e4
  });
  const vetNames = vetNamesData?.names ?? [];
  const { data: staffNamesData } = useQuery({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 12e4
  });
  const staffNames = staffNamesData?.names ?? [];
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const dctAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "dct").map((c) => [c.recordId, c.count]));
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/dct-records/${editing.id}`) : api(`farms/${farmId}/dairy/dct-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setHint(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/dct-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ dryOffDate: today(), protocol: "selective" });
    setHint(null);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, dryOffDate: r.dryOffDate.slice(0, 10), expectedCalvingDate: r.expectedCalvingDate?.slice(0, 10) });
    setHint(null);
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const fetchHint = reactExports.useCallback(async (earTag) => {
    if (!earTag.trim()) {
      setHint(null);
      return;
    }
    setHintLoading(true);
    try {
      const res = await fetch(api(`farms/${farmId}/dairy/dct-animal-hint?earTag=${encodeURIComponent(earTag)}`), { credentials: "include" });
      const data2 = await res.json();
      setHint({ mastitisCount12m: data2.mastitisCount12m ?? 0, recentMastitisScc: data2.recentMastitisScc ?? null });
    } catch {
      setHint(null);
    }
    setHintLoading(false);
  }, [farmId]);
  function handleAnimalSelect(tag, animal) {
    setForm((f) => ({ ...f, cowEarTag: tag, animalId: animal?.id ?? null, herdId: animal?.herdId ?? f.herdId }));
    if (tag.trim().length >= 5) fetchHint(tag);
    else setHint(null);
  }
  function applyHint() {
    if (!hint) return;
    setForm((f) => ({
      ...f,
      mastitisEpisodes12Months: hint.mastitisCount12m,
      ...hint.recentMastitisScc && !f.sccAtDryOff ? { sccAtDryOff: hint.recentMastitisScc } : {}
    }));
  }
  function handleAntibioticProduct(name) {
    set("antibioticTubeProduct", name);
    const wd = DCT_WITHDRAWAL[name];
    if (wd) {
      setForm((f) => ({ ...f, antibioticTubeProduct: name, antibioticTubeWithdrawalMilkDays: wd.milkDays, antibioticTubeWithdrawalMeatDays: wd.meatDays }));
    }
  }
  const PROTOCOLS = [
    { value: "selective", label: "Selective DCT (antibiotic only where indicated)" },
    { value: "blanket", label: "Blanket DCT (all cows treated)" },
    { value: "teat-sealant-only", label: "Teat Sealant Only (no antibiotic)" },
    { value: "selective-sealant", label: "Selective DCT + Teat Sealant" },
    { value: "blanket-sealant", label: "Blanket DCT + Teat Sealant" }
  ];
  const needsVetAuth = form.protocol !== "teat-sealant-only";
  const canSave = !!form.dryOffDate && (!needsVetAuth || !!form.vetAuthorisation);
  const hasHintData = hint && (hint.mastitisCount12m > 0 || hint.recentMastitisScc);
  const [dctYear, setDctYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const allDctRecords = data?.records ?? [];
  const dctYearRecords = allDctRecords.filter((r) => r.dryOffDate && new Date(r.dryOffDate).getFullYear() === dctYear);
  const [dctListYear, setDctListYear] = reactExports.useState("all");
  const dctListYears = React.useMemo(() => Array.from(new Set(allDctRecords.map((r) => String(r.dryOffDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allDctRecords]);
  const filteredDctList = dctListYear === "all" ? allDctRecords : allDctRecords.filter((r) => String(r.dryOffDate ?? "").startsWith(dctListYear));
  const dctStats = React.useMemo(() => {
    const recs = dctYearRecords;
    const total = recs.length;
    const selective = recs.filter((r) => r.protocol === "selective" || r.protocol === "selective-sealant").length;
    const blanket = recs.filter((r) => r.protocol === "blanket" || r.protocol === "blanket-sealant").length;
    const sealantOnly = recs.filter((r) => r.protocol === "teat-sealant-only").length;
    const vetAuthorised = recs.filter((r) => r.vetAuthorisation).length;
    const sccValues = recs.filter((r) => r.sccAtDryOff != null).map((r) => r.sccAtDryOff);
    const avgScc = sccValues.length > 0 ? Math.round(sccValues.reduce((a, b) => a + b, 0) / sccValues.length) : null;
    const productCounts = {};
    recs.forEach((r) => {
      if (r.antibioticTubeProduct) productCounts[r.antibioticTubeProduct] = (productCounts[r.antibioticTubeProduct] || 0) + 1;
    });
    const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, selective, blanket, sealantOnly, vetAuthorised, avgScc, topProducts };
  }, [dctYearRecords]);
  function generateDctReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const s = dctStats;
    const recs = [...dctYearRecords].sort((a, b) => b.dryOffDate.localeCompare(a.dryOffDate));
    const productRows = s.topProducts.map(([p, c]) => `<tr><td>${p}</td><td>${c}</td><td>${s.total > 0 ? Math.round(c / s.total * 100) : 0}%</td></tr>`).join("");
    const rows = recs.map((r) => `<tr>
      <td>${new Date(r.dryOffDate).toLocaleDateString("en-GB")}</td>
      <td>${r.cowEarTag || "—"}</td>
      <td>${r.protocol.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td>
      <td>${r.antibioticTubeProduct || "—"}</td>
      <td>${r.teatSealantProduct || "—"}</td>
      <td>${r.sccAtDryOff?.toLocaleString() ?? "—"}</td>
      <td>${r.mastitisEpisodes12Months ?? "—"}</td>
      <td>${r.vetAuthorisation ? "Yes" : "<b style='color:#b91c1c'>No</b>"}</td>
      <td>${r.vetName || "—"}</td>
      <td style="font-size:9px">${r.treatmentJustification || "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>DCT Stewardship Report ${dctYear}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:18px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Dry Cow Therapy (DCT) — Antibiotic Stewardship Report</h1><h2>Red Tractor Dairy Scheme — Reporting Year: ${dctYear}</h2></div>
  <div class="hdr-r"><b>${s.total} dry-off record${s.total !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${s.total}</div><div class="kpi-lbl">Total dry-offs recorded</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.total > 0 ? Math.round(s.selective / s.total * 100) : 0}%</div><div class="kpi-lbl">Selective DCT (${s.selective} cows)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.total > 0 ? Math.round(s.vetAuthorised / s.total * 100) : 0}%</div><div class="kpi-lbl">Vet-authorised (${s.vetAuthorised}/${s.total})</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.avgScc != null ? s.avgScc.toLocaleString() + " k/mL" : "—"}</div><div class="kpi-lbl">Avg SCC at dry-off</div></div>
</div>
<p style="font-size:10px;margin-bottom:8px"><b>Protocol breakdown:</b> Selective DCT: ${s.selective} &nbsp;|&nbsp; Blanket DCT: ${s.blanket} &nbsp;|&nbsp; Teat sealant only: ${s.sealantOnly}</p>
${productRows ? `<h3>Antibiotic Products Used</h3><table><tr><th>Product</th><th>Cows treated</th><th>% of total</th></tr>${productRows}</table>` : ""}
<h3>All DCT Records — ${dctYear}</h3>
<table>
  <tr><th>Dry-off date</th><th>Ear Tag</th><th>Protocol</th><th>Antibiotic product</th><th>Sealant</th><th>SCC at dry-off</th><th>Mastitis eps 12m</th><th>Vet auth.</th><th>Vet</th><th>Justification</th></tr>
  ${rows || "<tr><td colspan='10'>No records for this year</td></tr>"}
</table>
<p class="note">DCT Antibiotic Stewardship Report produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). This report should be reviewed annually with your prescribing vet as part of your Veterinary Health Plan. Retain for a minimum of 5 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Dry Cow Therapy (DCT) — record treatment decisions at dry-off. Antibiotic stewardship requires documented justification for each cow treated." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dctListYear, onValueChange: setDctListYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            dctListYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateDctReport, disabled: dctYearRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add DCT Record"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700", children: "Annual Stewardship Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDctYear((y) => y - 1), className: "h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-800 w-12 text-center", children: dctYear }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDctYear((y) => y + 1), disabled: dctYear >= (/* @__PURE__ */ new Date()).getFullYear(), className: "h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      dctYearRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 text-center py-3", children: [
        "No DCT records for ",
        dctYear,
        "."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: dctStats.total }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Dry-offs recorded" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${dctStats.total > 0 && Math.round(dctStats.selective / dctStats.total * 100) >= 50 ? "bg-green-50 border-green-200" : "bg-white"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${dctStats.total > 0 && Math.round(dctStats.selective / dctStats.total * 100) >= 50 ? "text-green-700" : "text-gray-800"}`, children: dctStats.total > 0 ? `${Math.round(dctStats.selective / dctStats.total * 100)}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Selective DCT" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${dctStats.vetAuthorised < dctStats.total ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${dctStats.vetAuthorised < dctStats.total ? "text-amber-700" : "text-green-700"}`, children: dctStats.total > 0 ? `${Math.round(dctStats.vetAuthorised / dctStats.total * 100)}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Vet-authorised" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: dctStats.avgScc != null ? dctStats.avgScc.toLocaleString() : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Avg SCC at dry-off (k/mL)" })
        ] })
      ] }),
      dctStats.topProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: [
          "Antibiotic products used in ",
          dctYear
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: dctStats.topProducts.map(([p, c]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded", children: [
          p,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            "×",
            c
          ] })
        ] }, p)) })
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View DCT Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dry-Off Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.dryOffDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cow Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.cowEarTag ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Protocol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewRecord.protocol ?? "—").replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Antibiotic Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.antibioticTubeProduct || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Teat Sealant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.teatSealantProduct ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC at Dry-Off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.sccAtDryOff?.toLocaleString() ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mastitis Eps (12m)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.mastitisEpisodes12Months ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Authorisation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetAuthorisation ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Calving" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.expectedCalvingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.treatmentJustification ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "dct", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      !filteredDctList.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No DCT records yet. Record dry-off treatments for each cow at the end of lactation." }) }),
      filteredDctList.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.dryOffDate) }),
            r.cowEarTag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 font-mono", children: r.cowEarTag }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded capitalize", children: r.protocol.replace(/-/g, " ") }),
            r.antibioticTubeProduct && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.antibioticTubeProduct }),
            r.teatSealantProduct && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              "Sealant: ",
              r.teatSealantProduct
            ] }),
            r.sccAtDryOff && /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: r.sccAtDryOff }),
            r.mastitisEpisodes12Months !== null && r.mastitisEpisodes12Months !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              r.mastitisEpisodes12Months,
              " mastitis episodes (12m)"
            ] }),
            r.vetAuthorisation && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              "Vet authorised"
            ] }),
            r.expectedCalvingDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" }),
              "Expected calving ",
              formatDate(r.expectedCalvingDate)
            ] }),
            (dctAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
              dctAttachMap[r.id]
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        r.treatmentJustification && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Justification: ",
          r.treatmentJustification
        ] }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: r.notes })
      ] }) }, r.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "62rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit DCT Record" : "Add Dry Cow Therapy Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Ear Tag" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AnimalEarTagCombobox,
                {
                  value: form.cowEarTag || "",
                  onSelect: handleAnimalSelect,
                  animals
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dry-Off Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dryOffDate?.slice(0, 10) || "", onChange: (e) => set("dryOffDate", e.target.value) })
            ] })
          ] }),
          form.cowEarTag && form.cowEarTag.length >= 5 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-blue-100 bg-blue-50 p-2.5 flex items-center justify-between gap-2", children: hintLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-xs text-blue-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
            "Looking up animal history…"
          ] }) : hasHintData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-blue-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "From records:" }),
              " ",
              hint.mastitisCount12m,
              " mastitis episode",
              hint.mastitisCount12m !== 1 ? "s" : "",
              " in 12 months",
              hint.recentMastitisScc ? ` · most recent SCC at onset ${hint.recentMastitisScc.toLocaleString()} k/mL` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-6 text-xs px-2 border-blue-200 text-blue-700 hover:bg-blue-100", onClick: applyHint, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 mr-1" }),
              "Auto-fill"
            ] })
          ] }) : hint ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-blue-400", children: "No mastitis records found for this ear tag in the last 12 months." }) : null }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "DCT Protocol *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.protocol || "selective", onValueChange: (v) => set("protocol", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PROTOCOLS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, children: p.label }, p.value)) })
            ] })
          ] }),
          form.protocol !== "teat-sealant-only" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Antibiotic Tube" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ProductCombobox,
                  {
                    value: form.antibioticTubeProduct || "",
                    onChange: handleAntibioticProduct,
                    options: INTRAMAMMARY_ANTIBIOTICS,
                    placeholder: "Search VMD intramammary products…"
                  }
                ),
                form.antibioticTubeProduct && DCT_WITHDRAWAL[form.antibioticTubeProduct] && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-green-500" }),
                  "Standard withdrawal pre-filled — verify against the product datasheet"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.antibioticTubeBatch || "", onChange: (e) => set("antibioticTubeBatch", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Withdrawal (days)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.antibioticTubeWithdrawalMilkDays ?? "", onChange: (e) => set("antibioticTubeWithdrawalMilkDays", e.target.value ? parseInt(e.target.value) : null) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meat Withdrawal (days)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.antibioticTubeWithdrawalMeatDays ?? "", onChange: (e) => set("antibioticTubeWithdrawalMeatDays", e.target.value ? parseInt(e.target.value) : null) })
              ] })
            ] })
          ] }),
          form.protocol?.includes("sealant") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Teat Sealant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ProductCombobox,
                  {
                    value: form.teatSealantProduct || "",
                    onChange: (v) => set("teatSealantProduct", v),
                    options: INTRAMAMMARY_SEALANTS,
                    placeholder: "Search sealant products…"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.teatSealantBatch || "", onChange: (e) => set("teatSealantBatch", e.target.value) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-gray-200 self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Antibiotic Stewardship" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Dry-Off (k/mL)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtDryOff ?? "", onChange: (e) => set("sccAtDryOff", e.target.value ? parseInt(e.target.value) : null) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mastitis Episodes (12 mo)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.mastitisEpisodes12Months ?? "", onChange: (e) => set("mastitisEpisodes12Months", e.target.value ? parseInt(e.target.value) : null) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Justification" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.treatmentJustification || "", onChange: (e) => set("treatmentJustification", e.target.value), placeholder: "e.g. SCC consistently above 200k, 2 mastitis episodes in last lactation", rows: 2 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Vet & Administration" }),
            needsVetAuth && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-md border p-2.5 ${form.vetAuthorisation ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "vetauth",
                  checked: !!form.vetAuthorisation,
                  onChange: (e) => set("vetAuthorisation", e.target.checked),
                  className: "rounded mt-0.5 accent-green-600 h-4 w-4 shrink-0"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetauth", className: `font-semibold ${form.vetAuthorisation ? "text-green-800" : "text-red-800"}`, children: "Written vet prescription / authorisation obtained *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${form.vetAuthorisation ? "text-green-700" : "text-red-700"}`, children: form.vetAuthorisation ? "Confirmed — this product is covered by a valid vet prescription." : "Required by law: intramammary antibiotic tubes are POM-V medicines. A vet must examine the herd and issue a written prescription before the product can legally be obtained or used." })
              ] })
            ] }) }),
            !needsVetAuth && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "No antibiotic used — vet prescription not required for internal teat sealants." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescribing Vet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  NameCombobox,
                  {
                    value: form.vetName || "",
                    onChange: (v) => set("vetName", v),
                    names: vetNames,
                    placeholder: "Select or type vet name…"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Administered By" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  NameCombobox,
                  {
                    value: form.administeredBy || "",
                    onChange: (v) => set("administeredBy", v),
                    names: staffNames,
                    placeholder: "Select or type staff name…"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Calving Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedCalvingDate || "", onChange: (e) => set("expectedCalvingDate", e.target.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Used to determine withdrawal compliance — milk withdrawal for antibiotic dry cow tubes runs from calving, not from the date of administration." })
            ] }),
            needsVetAuth && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estimated Prescription Fee (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "0",
                  step: "0.01",
                  placeholder: "e.g. 45.00",
                  value: form.estimatedPrescriptionFee ?? "",
                  onChange: (e) => set("estimatedPrescriptionFee", e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Optional — this will appear against the vet visit in the Vet Ledger so finance can match it when the invoice arrives." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-100 bg-amber-50 p-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 font-medium mb-0.5", children: "Medicines Register" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "When saved, any antibiotic tube product will be automatically added to the farm's Medicine Records for this animal." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 3 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !canSave, title: !form.dryOffDate ? "Dry-off date is required" : needsVetAuth && !form.vetAuthorisation ? "Written vet prescription must be confirmed before saving" : void 0, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add DCT Record"
        ] })
      ] })
    ] }) })
  ] });
}
function calcFpr(fat, protein) {
  if (!fat || !protein) return null;
  const f = parseFloat(fat);
  const p = parseFloat(protein);
  if (!p) return null;
  return f / p;
}
function FprBadge({ fat, protein }) {
  const ratio = calcFpr(fat, protein);
  if (ratio === null) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const display = ratio.toFixed(2);
  let cls = "bg-green-100 text-green-800";
  let tip = "Target";
  if (ratio < 1) {
    cls = "bg-red-100 text-red-800";
    tip = "Acidosis Risk";
  } else if (ratio < 1.2) {
    cls = "bg-amber-100 text-amber-800";
    tip = "Below Target";
  } else if (ratio > 1.5) {
    cls = "bg-amber-100 text-amber-800";
    tip = "Check Energy";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`, children: [
    display,
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-60", children: [
      "(",
      tip,
      ")"
    ] })
  ] });
}
function RecordingVisitsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [showChart, setShowChart] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-recording-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/recording-visits`), { credentials: "include" }).then((r) => r.json())
  });
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const herds = herdsQ.data?.herds ?? [];
  const animalsQ = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const [animalSearch, setAnimalSearch] = reactExports.useState("");
  const allAnimals = animalsQ.data?.animals ?? [];
  const visits = data?.visits ?? [];
  const [yearFilterVisits, setYearFilterVisits] = reactExports.useState("all");
  const yearsVisits = React.useMemo(() => Array.from(new Set(visits.map((v) => String(v.visitDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [visits]);
  const filteredVisits = yearFilterVisits === "all" ? visits : visits.filter((v) => String(v.visitDate ?? "").startsWith(yearFilterVisits));
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/recording-visits/${editing.id}`) : api(`farms/${farmId}/dairy/recording-visits`);
      const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-recording-visits", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/recording-visits/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-recording-visits", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ visitDate: today() });
    setOpen(true);
  }
  function openEdit(v) {
    setEditing(v);
    setForm({ ...v });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const chartData = [...visits].reverse().slice(-24).map((v) => {
    const fpr = calcFpr(v.avgFatPercent, v.avgProteinPercent);
    return {
      date: new Date(v.visitDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      scc: v.avgSccThousands ?? null,
      fat: v.avgFatPercent != null ? parseFloat(v.avgFatPercent) : null,
      protein: v.avgProteinPercent != null ? parseFloat(v.avgProteinPercent) : null,
      lactose: v.avgLactosePercent != null ? parseFloat(v.avgLactosePercent) : null,
      fpr: fpr != null ? parseFloat(fpr.toFixed(2)) : null
    };
  });
  const hasTrend = chartData.some((d) => d.scc !== null || d.fat !== null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Log monthly NMR recording visits — herd average SCC, fat%, protein%, and Fat:Protein Ratio analysis." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterVisits, onValueChange: setYearFilterVisits, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsVisits.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        hasTrend && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowChart((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-4 w-4 mr-1" }),
          showChart ? "Hide" : "Trend",
          " Chart"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Log Visit"
        ] })
      ] })
    ] }),
    showChart && hasTrend && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: [
        "Herd Trends — Last ",
        chartData.length,
        " Recording Visits"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Herd Average SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, left: 0, bottom: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", strokeOpacity: 0.4 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} k/mL`, "SCC"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: 200, stroke: "#f97316", strokeDasharray: "5 3", strokeOpacity: 0.6, label: { value: "200k", position: "right", fontSize: 9, fill: "#f97316" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "scc", fill: "#3b82f6", fillOpacity: 0.75, radius: [3, 3, 0, 0], name: "SCC" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Fat%, Protein% & Fat:Protein Ratio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 30, left: 0, bottom: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", strokeOpacity: 0.4 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "pct", tick: { fontSize: 10 }, domain: [2, 6], unit: "%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "fpr", orientation: "right", tick: { fontSize: 10 }, domain: [0.8, 2] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [name === "F:P Ratio" ? v.toFixed(2) : `${v}%`, name] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { yAxisId: "fpr", y: 1.2, stroke: "#f97316", strokeDasharray: "4 3", strokeOpacity: 0.6, label: { value: "FPR 1.2", position: "right", fontSize: 9, fill: "#f97316" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "pct", type: "monotone", dataKey: "fat", stroke: "#f59e0b", strokeWidth: 2, dot: { r: 3 }, name: "Fat%", connectNulls: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "pct", type: "monotone", dataKey: "protein", stroke: "#10b981", strokeWidth: 2, dot: { r: 3 }, name: "Protein%", connectNulls: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "fpr", type: "monotone", dataKey: "fpr", stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "5 3", dot: { r: 3 }, name: "F:P Ratio", connectNulls: true })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2", children: "F:P Ratio target: 1.2–1.5. Below 1.2 may indicate subclinical acidosis; above 1.5 may indicate energy deficit or ketosis risk." })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-500 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      "Loading…"
    ] }) : filteredVisits.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-10 w-10 mx-auto mb-3 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No recording visits logged yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Log your first NMR recording visit to start tracking herd quality trends." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Visit Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Recorder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Cows Rec." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Avg SCC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Fat%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-600", children: "Protein%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-center font-medium text-gray-600", children: "F:P Ratio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Alert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredVisits.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => setViewRec(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: formatDate(v.visitDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: v.recorderName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
          v.cowsRecorded ?? "—",
          v.cowsInMilk ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 text-xs ml-1", children: [
            "/",
            v.cowsInMilk
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: v.avgSccThousands }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: v.avgFatPercent ? `${parseFloat(v.avgFatPercent).toFixed(2)}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: v.avgProteinPercent ? `${parseFloat(v.avgProteinPercent).toFixed(2)}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FprBadge, { fat: v.avgFatPercent, protein: v.avgProteinPercent }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: v.qualityAlert ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-amber-700 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          v.qualityAlert
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRec(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => {
            if (confirm("Delete this recording visit?")) del.mutate(v.id);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) })
      ] }, v.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Recording Visit — ",
        formatDate(viewRec.visitDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-sm overflow-y-auto max-h-[70vh]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Visit Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Visit Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRec.visitDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Recorder Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.recorderName || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Recorder Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.recorderNumber || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Next Visit Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRec.nextVisitDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cows in Milk" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.cowsInMilk ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cows Recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.cowsRecorded ?? "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Herd Averages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Avg Yield / Cow / Day" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgYieldLitresPerDay ? `${parseFloat(viewRec.avgYieldLitresPerDay).toFixed(1)} L` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Fat%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgFatPercent ? `${parseFloat(viewRec.avgFatPercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Protein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgProteinPercent ? `${parseFloat(viewRec.avgProteinPercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Lactose%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgLactosePercent ? `${parseFloat(viewRec.avgLactosePercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Casein%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgCaseinPercent ? `${parseFloat(viewRec.avgCaseinPercent).toFixed(2)}%` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Average Urea" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.avgUreaMillimolesPerLitre ? `${parseFloat(viewRec.avgUreaMillimolesPerLitre).toFixed(1)} mmol/L` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Herd Avg SCC" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: viewRec.avgSccThousands })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fat:Protein Ratio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FprBadge, { fat: viewRec.avgFatPercent, protein: viewRec.avgProteinPercent })
            ] })
          ] })
        ] }),
        (viewRec.highSccCount || viewRec.highSccAnimalTags) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "High-SCC Animals (>200k)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Count Above 200k" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-700", children: viewRec.highSccCount ?? "—" })
          ] }) }),
          viewRec.highSccAnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Animals Selected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: viewRec.highSccAnimalTags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono", children: tag }, tag)) })
          ] })
        ] }),
        (viewRec.qualityAlert || viewRec.notes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 space-y-2", children: [
          viewRec.qualityAlert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-700 mb-0.5", children: "Quality Alert" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-800", children: viewRec.qualityAlert })
            ] })
          ] }),
          viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-line", children: viewRec.notes })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRec(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Log",
        " Recording Visit"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Visit Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.visitDate || "", onChange: (e) => set("visitDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId ?? "__none__"), onValueChange: (v) => set("herdId", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All herds" }),
              herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorder Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.recorderName || "", onChange: (e) => set("recorderName", e.target.value), placeholder: "NMR recorder's name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorder Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.recorderNumber || "", onChange: (e) => set("recorderNumber", e.target.value), placeholder: "NMR employee number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cows in Milk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.cowsInMilk ?? "", onChange: (e) => set("cowsInMilk", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cows Recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.cowsRecorded ?? "", onChange: (e) => set("cowsRecorded", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1", children: "NMR Report Results" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Yield / Cow / Day (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.avgYieldLitresPerDay ?? "", onChange: (e) => set("avgYieldLitresPerDay", e.target.value), placeholder: "e.g. 28.5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.avgSccThousands ?? "", onChange: (e) => set("avgSccThousands", e.target.value), placeholder: "e.g. 150" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Fat%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgFatPercent ?? "", onChange: (e) => set("avgFatPercent", e.target.value), placeholder: "e.g. 4.15" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Protein%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgProteinPercent ?? "", onChange: (e) => set("avgProteinPercent", e.target.value), placeholder: "e.g. 3.30" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Lactose%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgLactosePercent ?? "", onChange: (e) => set("avgLactosePercent", e.target.value), placeholder: "e.g. 4.70" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Casein%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.avgCaseinPercent ?? "", onChange: (e) => set("avgCaseinPercent", e.target.value), placeholder: "e.g. 2.60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Urea (mmol/L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.avgUreaMillimolesPerLitre ?? "", onChange: (e) => set("avgUreaMillimolesPerLitre", e.target.value), placeholder: "e.g. 4.5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col justify-center pt-4", children: form.avgFatPercent && form.avgProteinPercent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Calculated F:P Ratio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FprBadge, { fat: form.avgFatPercent, protein: form.avgProteinPercent })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-2", children: "High-SCC Animals (>200k)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Count Above 200k" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.highSccCount ?? "", onChange: (e) => set("highSccCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Visit Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextVisitDate || "", onChange: (e) => set("nextVisitDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "High-SCC Animals — Livestock Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-1.5 mt-0.5", children: "Select animals flagged above 200k on this visit." }),
          (() => {
            const selectedTags = (form.highSccAnimalTags || "").split(",").map((t) => t.trim()).filter(Boolean);
            const herdAnimals = allAnimals.filter((a) => !form.herdId || a.herdId === form.herdId);
            const filteredA = herdAnimals.filter((a) => {
              if (!animalSearch) return true;
              const tag = (a.earTagNumber || a.tagNumber || "").toLowerCase();
              return tag.includes(animalSearch.toLowerCase());
            });
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by ear tag…", value: animalSearch, onChange: (e) => setAnimalSearch(e.target.value), className: "border-0 border-b rounded-none text-sm" }),
              selectedTags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 px-2 py-1.5 bg-amber-50 border-b", children: selectedTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800 text-xs font-mono", children: [
                tag,
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-amber-500 hover:text-red-600 ml-0.5 leading-none", onClick: () => {
                  const next = selectedTags.filter((t) => t !== tag);
                  set("highSccAnimalTags", next.join(", "));
                }, children: "×" })
              ] }, tag)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-36 overflow-y-auto", children: herdAnimals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 px-3 py-2 italic", children: animalsQ.isLoading ? "Loading animals…" : "No animals found — add animals to the livestock register first." }) : filteredA.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 px-3 py-2 italic", children: "No animals match your search." }) : filteredA.map((a) => {
                const tag = a.earTagNumber || a.tagNumber || `Animal #${a.id}`;
                const isSel = selectedTags.includes(tag);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: `w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${isSel ? "bg-amber-50" : ""}`,
                    onClick: () => {
                      const next = isSel ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];
                      set("highSccAnimalTags", next.join(", "));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${isSel ? "bg-amber-500 border-amber-500 text-white" : "border-gray-300 bg-white"}`, children: isSel && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-2.5 w-2.5" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: tag }),
                      a.animalCode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: a.animalCode })
                    ]
                  },
                  a.id
                );
              }) })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Alert / NMR Action Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.qualityAlert || "", onChange: (e) => set("qualityAlert", e.target.value), placeholder: "Any action note from the NMR report" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value), placeholder: "Additional observations…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Log Visit"
        ] })
      ] })
    ] }) })
  ] });
}
function penceToGBP(p) {
  if (p == null) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function PoBadge({ status }) {
  const map = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
    sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Sent" },
    "part-received": { bg: "bg-amber-100", text: "text-amber-700", label: "Part received" },
    received: { bg: "bg-green-100", text: "text-green-700", label: "Received" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" }
  };
  const s = map[status] ?? map.draft;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`, children: s.label });
}
function InvoiceBadge({ status }) {
  if (status === "paid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3 w-3" }),
    "Paid"
  ] });
  if (status === "part-paid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
    "Part paid"
  ] });
  if (status === "overdue") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
    "Overdue"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
    "Unpaid"
  ] });
}
function GrnConditionBadge({ condition }) {
  if (!condition) return null;
  if (condition === "good") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: "Good condition" });
  if (condition === "damaged") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700", children: "Damaged" });
  if (condition === "partial") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700", children: "Partial delivery" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: condition });
}
function AbrProcurementSection({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const suppliersQ = useQuery({
    queryKey: ["abr-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-suppliers`), { credentials: "include" }).then((r) => r.json())
  });
  const ordersQ = useQuery({
    queryKey: ["abr-purchase-orders", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders`), { credentials: "include" }).then((r) => r.json())
  });
  const grnsQ = useQuery({
    queryKey: ["abr-grns", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-grns`), { credentials: "include" }).then((r) => r.json())
  });
  const invoicesQ = useQuery({
    queryKey: ["abr-invoices", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-invoices`), { credentials: "include" }).then((r) => r.json())
  });
  const suppliers = suppliersQ.data?.suppliers ?? [];
  const orders = ordersQ.data?.orders ?? [];
  const grns = grnsQ.data?.grns ?? [];
  const invoices = invoicesQ.data?.invoices ?? [];
  const unpaidInvoices = invoices.filter((i) => i.paymentStatus === "unpaid" || i.paymentStatus === "overdue");
  const supplierName = (id) => suppliers.find((s) => s.id === id)?.companyName ?? null;
  const poRef = (id) => orders.find((o) => o.id === id)?.poNumber ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "ABR Kit Procurement (",
              suppliers.length,
              " suppliers, ",
              orders.length,
              " POs)"
            ] }),
            unpaidInvoices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              unpaidInvoices.length,
              " unpaid invoice",
              unpaidInvoices.length !== 1 ? "s" : ""
            ] })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-500" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierSubsection, { farmId, suppliers, loading: suppliersQ.isLoading, qc }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PurchaseOrderSubsection, { farmId, orders, suppliers, loading: ordersQ.isLoading, qc, supplierName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GrnSubsection, { farmId, grns, orders, loading: grnsQ.isLoading, qc, poRef }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceSubsection, { farmId, invoices, suppliers, orders, loading: invoicesQ.isLoading, qc, supplierName, poRef })
    ] })
  ] });
}
function SupplierSubsection({ farmId, suppliers, loading, qc }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-suppliers/${editing.id}`) : api(`farms/${farmId}/dairy/abr-suppliers`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-suppliers/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({});
    setDlgOpen(true);
  }
  function openEdit(s) {
    setEditing(s);
    setForm({ ...s });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Supplier Directory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: suppliers.length })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : suppliers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No suppliers added yet." }) : suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: s.companyName }),
            s.accountRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 font-mono", children: [
              "Acc: ",
              s.accountRef
            ] }),
            s.paymentTermsDays != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              s.paymentTermsDays,
              "-day terms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
            s.contactName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.contactName }),
            s.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${s.phone}`, className: "hover:text-blue-600", children: s.phone }),
            s.email && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${s.email}`, className: "hover:text-blue-600", children: s.email }),
            (s.city || s.postcode) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: [s.city, s.postcode].filter(Boolean).join(", ") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, s.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Supplier"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: setDlgOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Supplier" : "Add Supplier" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Company Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Neogen Europe Ltd", value: form.companyName || "", onChange: (e) => set("companyName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Account manager", value: form.contactName || "", onChange: (e) => set("contactName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your account number", value: form.accountRef || "", onChange: (e) => set("accountRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", placeholder: "01234 567890", value: form.phone || "", onChange: (e) => set("phone", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "orders@supplier.co.uk", value: form.email || "", onChange: (e) => set("email", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.addressLine1 || "", onChange: (e) => set("addressLine1", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.addressLine2 || "", onChange: (e) => set("addressLine2", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City / Town" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.city || "", onChange: (e) => set("city", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Postcode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.postcode || "", onChange: (e) => set("postcode", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Terms (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", placeholder: "30", value: form.paymentTermsDays ?? "", onChange: (e) => set("paymentTermsDays", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.companyName?.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Supplier"
        ] })
      ] })
    ] }) })
  ] });
}
function PurchaseOrderSubsection({ farmId, orders, suppliers, loading, qc, supplierName }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [lineItems, setLineItems] = reactExports.useState([]);
  const [expandedPo, setExpandedPo] = reactExports.useState(null);
  const [itemDlg, setItemDlg] = reactExports.useState(null);
  const [itemForm, setItemForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-purchase-orders/${editing.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
      setLineItems([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-grns", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveItem = useMutation({
    mutationFn: (body) => {
      const url = body.id ? api(`farms/${farmId}/dairy/abr-po-items/${body.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders/${body.poId}/items`);
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      setItemDlg(null);
      setItemForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delItem = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-po-items/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ orderDate: today(), status: "draft" });
    setLineItems([{ productName: "", quantityOrdered: 1 }]);
    setDlgOpen(true);
  }
  function openEdit(o) {
    setEditing(o);
    setForm({ ...o });
    setLineItems([]);
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const lineTotal = (items) => items.reduce((sum, it) => sum + (it.unitPricePence ?? 0) * (it.quantityOrdered ?? 1), 0);
  function addLineItem() {
    setLineItems((l) => [...l, { productName: "", quantityOrdered: 1 }]);
  }
  function removeLineItem(i) {
    setLineItems((l) => l.filter((_, idx) => idx !== i));
  }
  function setLineItem(i, k, v) {
    setLineItems((l) => l.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Purchase Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: orders.length })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No purchase orders yet." }) : orders.map((o) => {
        const isExpanded = expandedPo === o.id;
        const sName = supplierName(o.supplierId);
        const itemTotal = lineTotal(o.items);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-white overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex-1 text-left", onClick: () => setExpandedPo(isExpanded ? null : o.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: o.poNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(PoBadge, { status: o.status }),
                sName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: sName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Ordered: ",
                  formatDate(o.orderDate)
                ] }),
                o.expectedDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Expected: ",
                  formatDate(o.expectedDeliveryDate)
                ] }),
                o.items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  o.items.length,
                  " line item",
                  o.items.length !== 1 ? "s" : ""
                ] }),
                itemTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
                  "Est. ",
                  penceToGBP(itemTotal)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(o), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(o.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 px-3 py-2 bg-gray-50 space-y-1.5", children: [
            o.items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No line items." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-0.5", children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Unit price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Line total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-12" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: o.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-gray-800", children: it.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-gray-700", children: it.quantityOrdered }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-gray-700", children: it.unitPricePence != null ? penceToGBP(it.unitPricePence) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right font-medium text-gray-800", children: it.unitPricePence != null ? penceToGBP(it.unitPricePence * it.quantityOrdered) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-0.5 justify-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => {
                    setItemDlg({ poId: o.id, item: it });
                    setItemForm({ ...it });
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-red-400 hover:text-red-600", onClick: () => delItem.mutate(it.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
                ] }) })
              ] }, it.id)) }),
              o.items.some((it) => it.unitPricePence != null) && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "py-1 text-right text-xs font-medium text-gray-600", children: "Total estimated value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-xs font-bold text-gray-900", children: penceToGBP(itemTotal) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-6 text-xs", onClick: () => {
              setItemDlg({ poId: o.id });
              setItemForm({ productName: "", quantityOrdered: 1 });
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
              "Add line item"
            ] }),
            o.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 italic mt-1", children: [
              "Note: ",
              o.notes
            ] })
          ] })
        ] }, o.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "New Purchase Order"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: setDlgOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Purchase Order" : "New Purchase Order" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. PO-2026-001", value: form.poNumber || "", onChange: (e) => set("poNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status || "draft", onValueChange: (v) => set("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent to supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "part-received", children: "Part received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId?.toString() || "", onValueChange: (v) => set("supplierId", v ? parseInt(v) : null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.companyName }, s.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Order Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.orderDate || today(), onChange: (e) => set("orderDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedDeliveryDate || "", onChange: (e) => set("expectedDeliveryDate", e.target.value || null) })
          ] })
        ] }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Line Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: addLineItem, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
              "Add item"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            lineItems.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", placeholder: "Product name", value: it.productName || "", onChange: (e) => setLineItem(i, "productName", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "number", min: "1", value: it.quantityOrdered ?? 1, onChange: (e) => setLineItem(i, "quantityOrdered", parseInt(e.target.value) || 1) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit price (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "number", min: "0", step: "0.01", placeholder: "0.00", value: it.unitPricePence != null ? (it.unitPricePence / 100).toFixed(2) : "", onChange: (e) => setLineItem(i, "unitPricePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 flex justify-end pb-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-red-400", onClick: () => removeLineItem(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
            ] }, i)),
            lineItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No line items yet — add items above." }),
            lineTotal(lineItems) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm font-medium text-gray-700", children: [
              "Estimated total: ",
              penceToGBP(lineTotal(lineItems))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate({ ...form, items: editing ? void 0 : lineItems.filter((it) => it.productName?.trim()) }), disabled: save.isPending || !form.poNumber?.trim() || !form.orderDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Create PO"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!itemDlg, onOpenChange: (o) => {
      if (!o) {
        setItemDlg(null);
        setItemForm({});
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: itemDlg?.item ? "Edit Line Item" : "Add Line Item" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Delvotest Accelerator kit (50)", value: itemForm.productName || "", onChange: (e) => setItemForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Ordered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: itemForm.quantityOrdered ?? 1, onChange: (e) => setItemForm((f) => ({ ...f, quantityOrdered: parseInt(e.target.value) || 1 })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Price (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: itemForm.unitPricePence != null ? (itemForm.unitPricePence / 100).toFixed(2) : "", onChange: (e) => setItemForm((f) => ({ ...f, unitPricePence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: itemForm.notes || "", onChange: (e) => setItemForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setItemDlg(null);
          setItemForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveItem.mutate({ ...itemForm, poId: itemDlg.poId, id: itemDlg?.item?.id }), disabled: saveItem.isPending || !itemForm.productName?.trim(), children: [
          saveItem.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          itemDlg?.item ? "Save Changes" : "Add Item"
        ] })
      ] })
    ] }) })
  ] });
}
function GrnSubsection({ farmId, grns, orders, loading, qc, poRef }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-grns/${editing.id}`) : api(`farms/${farmId}/dairy/abr-grns`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-grns", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const { data: abrMembersData, isLoading: abrMembersLoading } = useFarmMembers(farmId);
  const abrStaffNames = (abrMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-grns/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-grns", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ receivedDate: today(), conditionOnArrival: "good" });
    setDlgOpen(true);
  }
  function openEdit(g) {
    setEditing(g);
    setForm({ ...g });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PackageCheck, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Goods Received Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: grns.length })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : grns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No goods received notes yet." }) : grns.map((g) => {
        const po = poRef(g.poId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
              g.grnNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: g.grnNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GrnConditionBadge, { condition: g.conditionOnArrival }),
              po && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                "PO: ",
                po
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Received: ",
                formatDate(g.receivedDate)
              ] }),
              g.receivedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "By: ",
                g.receivedBy
              ] }),
              g.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: g.notes })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(g), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(g.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, g.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add GRN"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: setDlgOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit GRN" : "Add Goods Received Note" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. GRN-2026-001", value: form.grnNumber || "", onChange: (e) => set("grnNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.receivedDate || today(), onChange: (e) => set("receivedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId?.toString() || "", onValueChange: (v) => set("poId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select PO (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id.toString(), children: o.poNumber }, o.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.receivedBy || "", onChange: (v) => set("receivedBy", v), staffNames: abrStaffNames, loading: abrMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition on Arrival" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.conditionOnArrival || "", onValueChange: (v) => set("conditionOnArrival", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select condition" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "good", children: "Good condition" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "damaged", children: "Damaged" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial delivery" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.receivedDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add GRN"
        ] })
      ] })
    ] }) })
  ] });
}
function InvoiceSubsection({ farmId, invoices, suppliers, orders, loading, qc, supplierName, poRef }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-invoices/${editing.id}`) : api(`farms/${farmId}/dairy/abr-invoices`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-invoices/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ invoiceDate: today(), paymentStatus: "unpaid" });
    setDlgOpen(true);
  }
  function openEdit(inv) {
    setEditing(inv);
    setForm({ ...inv });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const totalOutstanding = invoices.filter((i) => i.paymentStatus !== "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);
  const totalPaid = invoices.filter((i) => i.paymentStatus === "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Invoices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: invoices.length }),
        totalOutstanding > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full", children: [
          penceToGBP(totalOutstanding),
          " outstanding"
        ] })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      invoices.length > 1 && (totalOutstanding > 0 || totalPaid > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-100 rounded-md px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-600 font-medium", children: "Outstanding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-amber-800", children: penceToGBP(totalOutstanding) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-100 rounded-md px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-600 font-medium", children: "Total paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-green-800", children: penceToGBP(totalPaid) })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : invoices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No invoices recorded yet." }) : invoices.map((inv) => {
        const sName = supplierName(inv.supplierId);
        const po = poRef(inv.poId);
        const isOverdue = inv.paymentStatus === "unpaid" && inv.dueDate && new Date(inv.dueDate) < /* @__PURE__ */ new Date();
        const effectiveStatus = isOverdue ? "overdue" : inv.paymentStatus;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start justify-between rounded-md border px-3 py-2.5 ${effectiveStatus === "overdue" ? "border-red-200 bg-red-50" : effectiveStatus === "paid" ? "border-green-100 bg-white" : "border-gray-200 bg-white"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: inv.invoiceNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceBadge, { status: effectiveStatus }),
              sName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: sName }),
              po && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "PO: ",
                po
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Dated: ",
                formatDate(inv.invoiceDate)
              ] }),
              inv.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: effectiveStatus === "overdue" ? "text-red-600 font-medium" : "", children: [
                "Due: ",
                formatDate(inv.dueDate)
              ] }),
              inv.grossAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: penceToGBP(inv.grossAmountPence) }),
              inv.netAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Net: ",
                penceToGBP(inv.netAmountPence)
              ] }),
              inv.vatAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "VAT: ",
                penceToGBP(inv.vatAmountPence)
              ] }),
              inv.paymentDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600", children: [
                "Paid: ",
                formatDate(inv.paymentDate)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(inv), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(inv.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, inv.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Invoice"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: setDlgOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Invoice" : "Add Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-12345", value: form.invoiceNumber || "", onChange: (e) => set("invoiceNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentStatus || "unpaid", onValueChange: (v) => set("paymentStatus", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unpaid", children: "Unpaid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "part-paid", children: "Part paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId?.toString() || "", onValueChange: (v) => set("supplierId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.companyName }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked PO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId?.toString() || "", onValueChange: (v) => set("poId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select PO (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id.toString(), children: o.poNumber }, o.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.invoiceDate || today(), onChange: (e) => set("invoiceDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dueDate || "", onChange: (e) => set("dueDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.netAmountPence != null ? (form.netAmountPence / 100).toFixed(2) : "", onChange: (e) => {
            const net = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null;
            set("netAmountPence", net);
            if (net != null && form.vatAmountPence != null) set("grossAmountPence", net + form.vatAmountPence);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.vatAmountPence != null ? (form.vatAmountPence / 100).toFixed(2) : "", onChange: (e) => {
            const vat = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null;
            set("vatAmountPence", vat);
            if (vat != null && form.netAmountPence != null) set("grossAmountPence", form.netAmountPence + vat);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross / Total (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.grossAmountPence != null ? (form.grossAmountPence / 100).toFixed(2) : "", onChange: (e) => set("grossAmountPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
        ] }),
        (form.paymentStatus === "paid" || form.paymentStatus === "part-paid") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.paymentDate || "", onChange: (e) => set("paymentDate", e.target.value || null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. BACS ref, cheque no.", value: form.paymentReference || "", onChange: (e) => set("paymentReference", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.invoiceNumber?.trim() || !form.invoiceDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Invoice"
        ] })
      ] })
    ] }) })
  ] });
}
const PRINT_ID = "dairy-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}
function fmtGBP(p) {
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPpl(p) {
  return p == null ? "—" : `${p.toFixed(2)}p/L`;
}
function fmtVol(l) {
  return l >= 1e3 ? `${(l / 1e3).toFixed(1)}kL` : `${l.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
}
function monthLabel(m) {
  return (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}
function KpiCard({ label, value, sub, icon, highlight }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : ""}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: sub })
  ] });
}
function Collapsible({ title, open, setOpen, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors", onClick: () => setOpen(!open), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto border-t border-border", children })
  ] });
}
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground mb-1", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      p.name === "Gross Margin" ? fmtGBP(p.value) : fmtGBP(Math.abs(p.value))
    ] }, p.name))
  ] });
};
function DairyEnterpriseReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [showMonthly, setShowMonthly] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy-enterprise-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && (d.collectionCount > 0 || d.feedDeliveryCount > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const chartData = (d?.monthlyBreakdown ?? []).map((m) => ({
    label: monthLabel(m.month),
    "Milk Income": m.incomePence,
    "Feed Cost": m.feedCostPence,
    "Gross Margin": m.grossMarginPence
  }));
  const feedPct = d && d.totalMilkIncomePence > 0 ? (d.totalFeedCostPence / d.totalMilkIncomePence * 100).toFixed(1) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Dairy Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Cost of production · Gross margin · Per-litre analysis" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 rounded-lg border border-border bg-background px-3 text-sm", value: year, onChange: (e) => setYear(parseInt(e.target.value)), children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          ensurePrintStyle();
          window.print();
        }, className: "h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print:block hidden mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold", children: [
        "Dairy Enterprise Report — ",
        year
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Cost of production and gross margin analysis" })
    ] }),
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: [
      "No milk collection or feed delivery data found for ",
      year,
      ".",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Record milk collections and priced feed deliveries to generate this report." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Milk Produced", value: fmtVol(d.totalVolumeLitres), sub: `${d.collectionCount} collections`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-4 h-4 text-blue-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Milk Income", value: fmtGBP(d.totalMilkIncomePence), sub: fmtPpl(d.pencePerLitre), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Feed Cost", value: fmtGBP(d.totalFeedCostPence), sub: `${d.totalFeedKg.toLocaleString("en-GB")} kg · ${feedPct ? feedPct + "% of income" : ""}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-amber-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiCard,
          {
            label: "Gross Margin",
            value: fmtGBP(d.grossMarginPence),
            sub: fmtPpl(d.grossMarginPerLitrePence),
            icon: marginPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-red-500" }),
            highlight: marginPositive ? "emerald" : "red"
          }
        )
      ] }),
      chartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Monthly Income vs Feed Cost" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Milk Income", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Feed Cost", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "Gross Margin", stroke: "#3b82f6", strokeWidth: 2, dot: false })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Cost of Production Summary — ",
          d.year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "per Litre" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
            { label: "Milk income", value: d.totalMilkIncomePence, ppl: d.pencePerLitre, bold: false, positive: true },
            { label: `Feed cost (${d.feedDeliveryCount} deliveries · ${d.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d.totalFeedCostPence, ppl: d.feedCostPerLitrePence ? -d.feedCostPerLitrePence : null, bold: false },
            ...d.dairyPurchaseCostPence > 0 ? [{ label: "Livestock purchases (dairy)", value: -d.dairyPurchaseCostPence, ppl: null, bold: false }] : [],
            ...d.totalVetCostPence > 0 ? [{ label: "Vet & medicine (invoiced)", value: -d.totalVetCostPence, ppl: null, bold: false }] : [],
            { label: "Total variable costs", value: -d.totalVariableCostPence, ppl: null, bold: true, divider: true },
            { label: "Gross margin", value: d.grossMarginPence, ppl: d.grossMarginPerLitrePence, bold: true, highlight: marginPositive ? "emerald" : "red" }
          ].map((row, i) => {
            const ppl = row.ppl ?? (d.totalVolumeLitres > 0 && row.value !== 0 ? row.value / d.totalVolumeLitres : null);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.bold ? "font-semibold" : ""}`, children: row.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`, children: row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/40 text-xs", children: ppl != null ? `${ppl >= 0 ? "" : "-"}${Math.abs(ppl).toFixed(2)}p/L` : "" })
            ] }, i);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Feed cost from priced deliveries tagged to dairy/cattle. Vet, AI, contractor, and fixed costs not included — add via Financial for a complete P&L. Organic dairy farmers: NMR recording visit data is in the Recording Visits tab." })
      ] }),
      d.monthlyBreakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Monthly Breakdown (${d.monthlyBreakdown.length} months)`, open: showMonthly, setOpen: setShowMonthly, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Collections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Volume (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Income" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "p/L" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Feed Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Gross Margin" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          d.monthlyBreakdown.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 font-medium", children: monthLabel(m.month) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-foreground/60", children: m.collections }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: m.volumeLitres.toLocaleString("en-GB", { maximumFractionDigits: 0 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-emerald-700 font-medium", children: fmtGBP(m.incomePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-foreground/60", children: m.pplActual != null ? `${m.pplActual.toFixed(2)}p` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-amber-700", children: m.feedCostPence > 0 ? fmtGBP(m.feedCostPence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-1.5 text-right font-medium ${m.grossMarginPence >= 0 ? "text-emerald-700" : "text-red-600"}`, children: fmtGBP(m.grossMarginPence) })
          ] }, m.month)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border bg-muted/20 font-semibold text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: d.collectionCount }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtVol(d.totalVolumeLitres) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-emerald-700", children: fmtGBP(d.totalMilkIncomePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtPpl(d.pencePerLitre) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-amber-700", children: fmtGBP(d.totalFeedCostPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-2 text-right ${marginPositive ? "text-emerald-700" : "text-red-600"}`, children: fmtGBP(d.grossMarginPence) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
const JOHNES_TYPES = [
  { value: "bulk_milk_elisa", label: "Bulk Milk ELISA" },
  { value: "individual_milk_elisa", label: "Individual Milk ELISA" },
  { value: "individual_blood_elisa", label: "Individual Blood ELISA" },
  { value: "faecal_pcr", label: "Faecal PCR (individual)" },
  { value: "pooled_faecal_pcr", label: "Pooled Faecal PCR" },
  { value: "post_mortem", label: "Post-mortem confirmation" }
];
const JOHNES_RISK = [
  { value: "1_very_low", label: "1 — Very Low Risk" },
  { value: "2_low", label: "2 — Low Risk" },
  { value: "3_moderate", label: "3 — Moderate Risk" },
  { value: "4_high", label: "4 — High Risk" }
];
const JOHNES_SCHEMES = [
  { value: "johnes_management_in_milk", label: "Johne's Management in Milk (AHDB)" },
  { value: "farm_health_connect", label: "Farm Health Connect" },
  { value: "voluntary", label: "Voluntary / Vet-led" },
  { value: "other", label: "Other" }
];
const JOHNES_LABS_PRESETS_D = [
  "APHA Starcross",
  "APHA Weybridge",
  "APHA Lasswade (Scotland)",
  "SAC / SRUC Veterinary Services",
  "Biobest Laboratories",
  "Axiom Veterinary Laboratories",
  "Westgate Labs",
  "Quality Milk Laboratories"
];
const NJMP_STRATEGY_LABELS_D = {
  s1_test_cull: "S1 — Test & cull high-risk cows",
  s2_segregate: "S2 — Segregate high-risk cows",
  s3_purchased_animals: "S3 — Purchased animal management",
  s4_calf_colostrum: "S4 — Calf & colostrum management",
  s5_slurry_pasture: "S5 — Slurry & pasture management",
  s6_bespoke: "S6 — Bespoke vet-led strategy"
};
function johnesFmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB");
  } catch {
    return d;
  }
}
function johnesRiskLabel(v) {
  return JOHNES_RISK.find((r) => r.value === v)?.label ?? v ?? "—";
}
function johnesTypeLabel(v) {
  return JOHNES_TYPES.find((t) => t.value === v)?.label ?? v ?? "—";
}
function sccDueBadge(date) {
  if (!date) return null;
  const d = new Date(date);
  const today2 = /* @__PURE__ */ new Date();
  const daysUntil = Math.floor((d.getTime() - today2.getTime()) / 864e5);
  if (daysUntil < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700", children: "Overdue" });
  if (daysUntil <= 30) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: [
    "Due in ",
    daysUntil,
    "d"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: "OK" });
}
function SccEquipmentSection({ farmId, species }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { inService: true };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const qKey = ["scc-equipment", farmId, species];
  const { data, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () => fetch(api(`farms/${farmId}/scc-equipment?species=${species}`), { credentials: "include" }).then((r) => r.json())
  });
  const records = data?.equipment ?? [];
  const overdueCount = records.filter((r) => r.calibrationExpiryDate && new Date(r.calibrationExpiryDate) < /* @__PURE__ */ new Date()).length;
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/scc-equipment${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...body, species })
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      setOpen(false);
      setEditing(null);
      setForm(blank);
      toast({ title: editing ? "Equipment record updated" : "Equipment record added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/scc-equipment/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const speciesLabel = species === "cattle" ? "Cattle / Buffalo" : species === "sheep" ? "Sheep" : "Goat";
  const regulatoryLimit = species === "sheep" ? "1,500k" : species === "goat" ? "1,000k" : "400k";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SCC Test Equipment Register" }),
      " — ",
      speciesLabel,
      ". Record every piece of equipment used for on-site somatic cell count testing (e.g. PortaSCC, DeLaval DCC, Fossomatic portable). Keep calibration and service dates up to date to satisfy ",
      species === "cattle" ? "Red Tractor Dairy / NMR" : species === "sheep" ? "BSDA" : "BGS",
      " assurance requirements. UK regulatory SCC limit: ",
      regulatoryLimit,
      " cells/mL."
    ] }),
    overdueCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", children: [
      "⚠ ",
      overdueCount,
      " device",
      overdueCount > 1 ? "s have" : " has",
      " an overdue calibration. Check the records below."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Devices Registered" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: records.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "In Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: records.filter((r) => r.inService).length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Calibration Overdue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${overdueCount > 0 ? "text-red-700" : "text-gray-400"}`, children: overdueCount })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "SCC Test Equipment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
          const overdue = records.filter((r) => r.calibrationExpiryDate && new Date(r.calibrationExpiryDate) < /* @__PURE__ */ new Date());
          const rows = records.map((r) => {
            const expired = r.calibrationExpiryDate && new Date(r.calibrationExpiryDate) < /* @__PURE__ */ new Date();
            return `<tr${expired ? ' style="background:#fef2f2"' : ""}><td>${r.deviceName}</td><td>${r.testMethod || "—"}</td><td>${r.serialNumber || "—"}</td><td>${r.manufacturer || "—"}</td><td>${r.calibrationExpiryDate ? new Date(r.calibrationExpiryDate).toLocaleDateString("en-GB") : "—"}${expired ? ' <strong style="color:red">OVERDUE</strong>' : ""}</td><td>${r.nextServiceDueDate ? new Date(r.nextServiceDueDate).toLocaleDateString("en-GB") : "—"}</td><td>${r.inService ? "✓" : "✗"}</td></tr>`;
          }).join("");
          const html = `<!DOCTYPE html><html><head><title>SCC Equipment Calibration Schedule — ${speciesLabel}</title><style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{font-size:14px}h2{font-size:11px;color:#555}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e5e7eb;padding:4px 6px;text-align:left}th{background:#f9fafb;font-weight:700;text-transform:uppercase;font-size:9px}.alert{background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:4px;margin-bottom:12px;font-size:11px;color:#991b1b}.note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:12px}</style></head><body><h1>SCC Equipment Calibration Schedule — ${speciesLabel}</h1><h2>Printed: ${printedDate}</h2>${overdue.length > 0 ? `<div class="alert">⚠ ${overdue.length} device${overdue.length !== 1 ? "s" : ""} with overdue calibration: ${overdue.map((r) => r.deviceName).join(", ")}</div>` : ""}<table><tr><th>Device Name</th><th>Type</th><th>Serial No.</th><th>Manufacturer</th><th>Calibration Expiry</th><th>Next Service Due</th><th>In Service</th></tr>${rows || "<tr><td colspan='7'>No equipment recorded</td></tr>"}</table><p class="note">${speciesLabel} SCC test equipment register — BDE Farm Trac. Regulatory SCC limit: ${regulatoryLimit} cells/mL. Keep calibration certificates on file for ${species === "cattle" ? "Red Tractor Dairy / NMR" : species === "sheep" ? "BSDA" : "BGS"} assurance inspections. Printed: ${printedDate}.</p></body></html>`;
          const w = window.open("", "_blank");
          if (!w) return;
          w.document.write(html);
          w.document.close();
          w.print();
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print Schedule"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm(blank);
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Device"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No SCC test equipment registered yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Device" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Serial No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Test Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Last Calibration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Cal. Expiry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Next Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: r.deviceName }),
          r.manufacturer && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            r.manufacturer,
            r.modelNumber ? ` · ${r.modelNumber}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-xs", children: r.serialNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs capitalize", children: r.testMethod || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: r.lastCalibrationDate ? new Date(r.lastCalibrationDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3 text-xs", children: [
          r.calibrationExpiryDate ? new Date(r.calibrationExpiryDate).toLocaleDateString("en-GB") : "—",
          " ",
          sccDueBadge(r.calibrationExpiryDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3 text-xs", children: [
          r.nextServiceDueDate ? new Date(r.nextServiceDueDate).toLocaleDateString("en-GB") : "—",
          " ",
          sccDueBadge(r.nextServiceDueDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.inService ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: "In service" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500", children: "Retired" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(r);
            setForm({ ...r });
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => {
            if (confirm("Delete this equipment record?")) del.mutate(r.id);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: viewRec.deviceName }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Manufacturer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.manufacturer || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Model" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.modelNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Serial Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.serialNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.testMethod || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Last Calibration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.lastCalibrationDate ? new Date(viewRec.lastCalibrationDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calibration Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium flex items-center gap-1", children: [
            viewRec.calibrationExpiryDate ? new Date(viewRec.calibrationExpiryDate).toLocaleDateString("en-GB") : "—",
            " ",
            sccDueBadge(viewRec.calibrationExpiryDate)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calibrated By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.calibratedBy || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Last Service" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.lastServiceDate ? new Date(viewRec.lastServiceDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Service Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium flex items-center gap-1", children: [
            viewRec.nextServiceDueDate ? new Date(viewRec.nextServiceDueDate).toLocaleDateString("en-GB") : "—",
            " ",
            sccDueBadge(viewRec.nextServiceDueDate)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Service Provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.serviceProvider || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          viewRec.inService ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: "In service" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500", children: "Retired" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewRec);
          setForm({ ...viewRec });
          setOpen(true);
          setViewRec(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Equipment Record" : "Add SCC Test Equipment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Device Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.deviceName || "", onChange: (e) => set("deviceName", e.target.value), placeholder: "e.g. PortaSCC, DeLaval DCC, Fossomatic Portable" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manufacturer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.manufacturer || "", onChange: (e) => set("manufacturer", e.target.value), placeholder: "e.g. PortaCheck, DeLaval, Foss" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.modelNumber || "", onChange: (e) => set("modelNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serialNumber || "", onChange: (e) => set("serialNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testMethod || "__none__", onValueChange: (v) => set("testMethod", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fluorooptic", children: "Fluorooptic (e.g. PortaSCC)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "electronic-cell-counting", children: "Electronic cell counting (e.g. DCC)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "flow-cytometry", children: "Flow cytometry (e.g. Fossomatic)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cmrt", children: "California Mastitis Reagent Test (CMRT)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pcr", children: "PCR-based" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Calibration Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.lastCalibrationDate || "").slice(0, 10), onChange: (e) => set("lastCalibrationDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calibration Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.calibrationExpiryDate || "").slice(0, 10), onChange: (e) => set("calibrationExpiryDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calibrated By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calibratedBy || "", onChange: (e) => set("calibratedBy", e.target.value), placeholder: "Name or organisation" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Service Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.lastServiceDate || "").slice(0, 10), onChange: (e) => set("lastServiceDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Service Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.nextServiceDueDate || "").slice(0, 10), onChange: (e) => set("nextServiceDueDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Service Provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serviceProvider || "", onChange: (e) => set("serviceProvider", e.target.value), placeholder: "Name or company" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "scc-in-service", className: "rounded", checked: !!form.inService, onChange: (e) => set("inService", e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "scc-in-service", className: "text-sm cursor-pointer", children: "Currently in service" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2, placeholder: "Condition notes, certificate reference, etc." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.deviceName, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function DairyJohnesDeclarationSection({ farmId, allMonitoringRecords }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [ackOpen, setAckOpen] = reactExports.useState(false);
  const [ackRec, setAckRec] = reactExports.useState(null);
  const [ackForm, setAckForm] = reactExports.useState({});
  const [form, setForm] = reactExports.useState({});
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const qKey = ["johnes-declarations", farmId];
  const { data: declarations = [] } = useQuery({
    queryKey: qKey,
    queryFn: () => fetch(api(`farms/${farmId}/johnes-declarations`), { credentials: "include" }).then((r) => r.json()).then((d) => d.declarations ?? []),
    enabled: !!farmId
  });
  const latestNjmp = [...allMonitoringRecords].filter((r) => r.jmmEnrolled).sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0] ?? allMonitoringRecords.sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0];
  function openAdd() {
    setEditing(null);
    setForm({
      declarationYear: (/* @__PURE__ */ new Date()).getFullYear(),
      declarationDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      njmpSchemeRef: latestNjmp?.njmpSchemeRef ?? "",
      njmpRiskLevel: latestNjmp?.riskLevel ?? "",
      njmpControlStrategy: latestNjmp?.njmpControlStrategy ?? "",
      njmpPlanReviewedDate: latestNjmp?.njmpPlanDate ?? "",
      bajvaAdvisorName: latestNjmp?.njmpBajvaAdvisor ?? ""
    });
    setOpen(true);
  }
  async function saveDec() {
    const url = editing ? api(`farms/${farmId}/johnes-declarations/${editing.id}`) : api(`farms/${farmId}/johnes-declarations`);
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: qKey });
    setOpen(false);
    setEditing(null);
  }
  async function delDec(id) {
    if (!confirm("Delete this declaration record?")) return;
    await fetch(api(`farms/${farmId}/johnes-declarations/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: qKey });
  }
  async function saveAck() {
    await fetch(api(`farms/${farmId}/johnes-declarations/${ackRec.id}/acknowledge`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ackForm)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: qKey });
    setAckOpen(false);
    setAckRec(null);
  }
  function printDeclaration(rec) {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "[not recorded]";
    const stratLabel = rec.njmpControlStrategy ? NJMP_STRATEGY_LABELS_D[rec.njmpControlStrategy] ?? rec.njmpControlStrategy : "[not recorded]";
    const rl = JOHNES_RISK.find((r) => r.value === rec.njmpRiskLevel)?.label ?? rec.njmpRiskLevel ?? "[not recorded]";
    const html = `<!DOCTYPE html><html><head><title>NJMP Annual Declaration ${rec.declarationYear}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:32px 40px;max-width:680px}
  .logo-bar{border-bottom:3px solid #15803d;padding-bottom:8px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:15px;font-weight:700;margin:0}.scheme{font-size:10px;color:#15803d;font-weight:700;letter-spacing:0.04em;text-transform:uppercase}
  .to-block{margin:20px 0 16px;padding:10px 14px;border-left:3px solid #e5e7eb;font-size:10px;color:#374151}
  .ref-line{font-size:9px;color:#6b7280;margin-bottom:16px}
  .subject{font-size:12px;font-weight:700;text-decoration:underline;margin-bottom:14px}
  .body-para{margin:0 0 10px;line-height:1.55}
  table{width:100%;border-collapse:collapse;margin:14px 0}
  th,td{padding:5px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px}
  th{background:#f0fdf4;font-weight:700;color:#15803d;text-transform:uppercase;font-size:9px}
  .declaration-box{border:2px solid #15803d;border-radius:4px;padding:12px 16px;margin:18px 0;background:#f0fdf4}
  .declaration-box p{margin:0 0 4px;font-size:10.5px}
  .sig-block{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .sig-line{border-bottom:1px solid #000;height:24px;margin-bottom:4px}
  .sig-label{font-size:9px;color:#6b7280}
  .footer{margin-top:28px;font-size:8px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
  @media print{@page{margin:2cm;size:A4}}
</style></head><body>
<div class="logo-bar">
  <div><div class="scheme">National Johne's Management Plan (NJMP)</div><h1>Annual Declaration — ${rec.declarationYear}</h1></div>
  <div style="text-align:right;font-size:9px;color:#6b7280">Date: ${fmtD(rec.declarationDate)}<br>${rec.njmpSchemeRef ? `Scheme Ref: <strong>${rec.njmpSchemeRef}</strong>` : ""}</div>
</div>
<div class="to-block"><strong>To:</strong> ${rec.milkPurchaser || "[Milk Purchaser Name]"}<br>${rec.milkPurchaserAddress ? rec.milkPurchaserAddress.replace(/\n/g, "<br>") : "[Milk Purchaser Address]"}</div>
<div class="ref-line">From: ${rec.farmerName || "[Farmer / Herd Operator Name]"}</div>
<p class="subject">Re: NJMP Annual Declaration — Herd Johne's Disease Management Plan — Year ${rec.declarationYear}</p>
<p class="body-para">I, the undersigned, hereby declare that the above-named herd is enrolled in the National Johne's Management Plan (NJMP) as administered by AHDB / BCVA, and that the following information is correct and up to date as of the date of this declaration.</p>
<div class="declaration-box"><p><strong>NJMP Enrolled Herd Declaration</strong></p><p>This declaration confirms that the herd identified above has an active written Johne's disease control plan, which has been reviewed in the 12-month period prior to the date of this declaration.</p></div>
<table>
  <tr><th>Item</th><th>Detail</th></tr>
  <tr><td>NJMP Scheme / Enrolment Reference</td><td>${rec.njmpSchemeRef || "—"}</td></tr>
  <tr><td>Current NJMP Herd Risk Level</td><td>${rl}</td></tr>
  <tr><td>Active Control Strategy</td><td>${stratLabel}</td></tr>
  <tr><td>Written Plan Last Reviewed</td><td>${fmtD(rec.njmpPlanReviewedDate)}</td></tr>
  <tr><td>BAJVA / Accredited Veterinary Advisor</td><td>${rec.bajvaAdvisorName || "—"}</td></tr>
</table>
<p class="body-para">I confirm that the control plan has been formulated and is being implemented in conjunction with a BCVA Accredited Johne's Veterinary Advisor (BAJVA), that an annual on-farm risk assessment has been carried out within the past 12 months, and that the herd has been screened in accordance with NJMP requirements (minimum 60-cow individual milk ELISA — bulk milk ELISA alone is not accepted for NJMP risk status).</p>
<p class="body-para">I understand that this declaration must be submitted to my milk purchaser on an annual basis, and that failure to do so may affect my Red Tractor Dairy assurance status.</p>
${rec.notes ? `<p class="body-para"><em>Notes: ${rec.notes}</em></p>` : ""}
<div class="sig-block">
  <div><div class="sig-line"></div><div class="sig-label">Signature of Herd Operator / Farmer</div></div>
  <div><div class="sig-line"></div><div class="sig-label">Date</div></div>
  <div style="margin-top:16px"><div class="sig-line"></div><div class="sig-label">Print Name: ${rec.farmerName || "________________________________"}</div></div>
</div>
<div class="footer">NJMP Annual Declaration generated by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years.</div>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t pt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "NJMP Annual Declarations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Record and print the annual declaration submitted to your milk purchaser. Keep a history for assurance auditors." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
        "New Annual Declaration"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-3", children: [
      "The NJMP applies to enrolled ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "dairy cattle herds only" }),
      " — it is not applicable to sheep or goats. For Johne's disease (paratuberculosis) in sheep and goats, record vaccination with Gudair via the Vaccination Programmes tab in the Sheep / Goat Production modules. Cattle vaccination is not licensed in the UK due to cross-reactivity with the bovine TB skin test."
    ] }),
    declarations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 border-2 border-dashed rounded-lg text-sm text-gray-400", children: 'No declarations recorded yet. Click "New Annual Declaration" to log and print your first.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Year", "Date Submitted", "Milk Purchaser", "Risk Level", "Control Strategy", "BAJVA Advisor", "Acknowledged", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: declarations.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-semibold", children: d.declarationYear }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.declarationDate ? new Date(d.declarationDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.milkPurchaser || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: JOHNES_RISK.find((r) => r.value === d.njmpRiskLevel)?.label ?? d.njmpRiskLevel ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: NJMP_STRATEGY_LABELS_D[d.njmpControlStrategy] ?? d.njmpControlStrategy ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: d.bajvaAdvisorName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.acknowledgementReceived ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: [
          "✓ ",
          d.acknowledgementDate ? new Date(d.acknowledgementDate).toLocaleDateString("en-GB") : "Received"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500", children: "Pending" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs", onClick: () => printDeclaration(d), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3 h-3 mr-1" }),
            "Print"
          ] }),
          !d.acknowledgementReceived && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-green-700 border-green-300 hover:bg-green-50", onClick: () => {
            setAckRec(d);
            setAckForm({ acknowledgementDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
            setAckOpen(true);
          }, children: "Record Ack." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => {
            setEditing(d);
            setForm({ ...d });
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => delDec(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, d.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Annual Declaration" : "New NJMP Annual Declaration" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Fields are pre-filled from your most recent NJMP monitoring record. Review and adjust before saving and printing." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "2020", max: "2099", value: form.declarationYear ?? (/* @__PURE__ */ new Date()).getFullYear(), onChange: (e) => setF("declarationYear", parseInt(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.declarationDate || "", onChange: (e) => setF("declarationDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farmer / Operator Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.farmerName || "", onChange: (e) => setF("farmerName", e.target.value), placeholder: "Full name as will appear on declaration letter" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "NJMP Scheme Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "font-mono", value: form.njmpSchemeRef || "", onChange: (e) => setF("njmpSchemeRef", e.target.value), placeholder: "e.g. AHDB-JMM-123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Purchaser" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.milkPurchaser || "", onChange: (e) => setF("milkPurchaser", e.target.value), placeholder: "e.g. Arla Foods UK, Müller Milk" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current NJMP Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpRiskLevel || "__none__", onValueChange: (v) => setF("njmpRiskLevel", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              JOHNES_RISK.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Purchaser Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.milkPurchaserAddress || "", onChange: (e) => setF("milkPurchaserAddress", e.target.value), placeholder: "Purchaser address (appears on the printed declaration letter)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Control Strategy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpControlStrategy || "__none__", onValueChange: (v) => setF("njmpControlStrategy", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select strategy" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s1_test_cull", children: "S1 — Test & cull high-risk cows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s2_segregate", children: "S2 — Segregate high-risk cows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s3_purchased_animals", children: "S3 — Purchased animal management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s4_calf_colostrum", children: "S4 — Calf & colostrum management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s5_slurry_pasture", children: "S5 — Slurry & pasture management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s6_bespoke", children: "S6 — Bespoke vet-led strategy" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Written Plan Last Reviewed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.njmpPlanReviewedDate || "", onChange: (e) => setF("njmpPlanReviewedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BAJVA Advisor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bajvaAdvisorName || "", onChange: (e) => setF("bajvaAdvisorName", e.target.value), placeholder: "BCVA-accredited veterinary advisor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => setF("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveDec, children: editing ? "Save Changes" : "Save Declaration" })
      ] })
    ] }) }),
    ackOpen && ackRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => {
      setAckOpen(false);
      setAckRec(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "32rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Record Acknowledgement — ",
        ackRec.declarationYear,
        " Declaration"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Record when ",
        ackRec.milkPurchaser || "the milk purchaser",
        " confirmed receipt. The NJMP does not mandate a formal acknowledgement, but having it on file strengthens your audit trail."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Acknowledgement Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: ackForm.acknowledgementDate || "", onChange: (e) => setAckForm((f) => ({ ...f, acknowledgementDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Purchaser Reference ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal text-xs", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: ackForm.acknowledgementRef || "", onChange: (e) => setAckForm((f) => ({ ...f, acknowledgementRef: e.target.value })), placeholder: "e.g. email ref, letter ref" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAckOpen(false);
          setAckRec(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveAck, children: "Save Acknowledgement" })
      ] })
    ] }) })
  ] });
}
function DairyJohnesTab({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [mode, setMode] = reactExports.useState("log");
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["johnes-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/johnes-monitoring`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const allRecords = allRecordsRaw;
  const years = reactExports.useMemo(() => {
    const s = new Set(
      allRecords.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean)
    );
    return Array.from(s).sort().reverse();
  }, [allRecords]);
  const records = yearFilter === "all" ? allRecords : allRecords.filter((r) => String(r.testDate ?? "").startsWith(yearFilter));
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then((r) => r.json()).then(
      (d) => (d.records ?? []).filter((h) => {
        const t = String(h.type ?? "").toLowerCase();
        return ["cattle", "beef", "dairy", "suckler", "bovine"].some((k) => t.includes(k));
      })
    ),
    enabled: !!farmId
  });
  const uniqueVetNamesD = [...new Set(allRecords.map((r) => r.vetName).filter(Boolean))];
  function openAdd() {
    setEditing(null);
    setForm({ testType: "bulk_milk_elisa", jmmEnrolled: false, vetSignOff: false, njmpColostrumMgmt: false, njmpPurchasedTesting: false });
    setMode("log");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setMode("edit");
    setOpen(true);
  }
  function openEnterResult(r) {
    setEditing(r);
    setForm({ ...r });
    setMode("result");
    setOpen(true);
  }
  async function save() {
    const url = editing ? api(`farms/${farmId}/johnes-monitoring/${editing.id}`) : api(`farms/${farmId}/johnes-monitoring`);
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
    setOpen(false);
  }
  async function del(id) {
    if (!confirm("Delete this Johne's monitoring record?")) return;
    await fetch(api(`farms/${farmId}/johnes-monitoring/${id}`), {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
  }
  function printReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const rows = records.map(
      (r) => `<tr>
      <td>${johnesFmtDate(r.testDate)}</td>
      <td>${johnesTypeLabel(r.testType)}</td>
      <td>${r.herdId ? herds.find((h) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}` : "—"}</td>
      <td>${johnesRiskLabel(r.riskLevel)}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.positiveAnimalsCount ?? 0}</td>
      <td>${r.bulkMilkOd ?? "—"}</td>
      <td>${r.labName || "—"}</td>
      <td>${r.labRef || "—"}</td>
      <td>${johnesFmtDate(r.nextTestDue)}</td>
      <td>${r.jmmEnrolled ? "Yes" : "No"}</td>
    </tr>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><title>Johne's Disease Monitoring Register</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px}
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #e5e7eb}
  th{font-size:8px;text-transform:uppercase;color:#6b7280;background:#f9fafb}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Johne's Disease Monitoring Register</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b>${yearFilter !== "all" ? `<br>Year: ${yearFilter}` : ""}<br>Printed: ${printedDate}</div>
</div>
<table>
  <tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Risk Level</th><th>Tested</th><th>Positive</th><th>Bulk Milk OD</th><th>Lab</th><th>Lab Ref</th><th>Next Due</th><th>JMM</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Johne's monitoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires a documented Johne's monitoring programme. Retain for a minimum of 3 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  const totalAnimals = records.reduce(
    (s, r) => s + (r.animalsTestedCount ? Number(r.animalsTestedCount) : 0),
    0
  );
  const totalPositive = records.reduce(
    (s, r) => s + (r.positiveAnimalsCount ? Number(r.positiveAnimalsCount) : 0),
    0
  );
  const prevalence = totalAnimals > 0 ? (totalPositive / totalAnimals * 100).toFixed(1) : null;
  const highRisk = records.filter(
    (r) => r.riskLevel && (r.riskLevel.startsWith("3") || r.riskLevel.startsWith("4"))
  ).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Johne's Disease Monitoring Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Red Tractor Dairy requires a documented Johne's monitoring programme. Record each test with result and risk level classification." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: printReport,
            disabled: records.length === 0,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
              "Print"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Log Sample"
        ] })
      ] })
    ] }),
    !isLoading && records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Tests Recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: records.length })
      ] }),
      totalAnimals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Animals Tested" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: totalAnimals.toLocaleString() })
      ] }),
      totalAnimals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: totalPositive > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${totalPositive > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalPositive > 0 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: [
          "Positives",
          prevalence ? ` (${prevalence}%)` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: totalPositive > 0 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }, children: totalPositive })
      ] }),
      highRisk > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "High / Elevated Risk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }, children: highRisk })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-gray-600", children: [
        "No Johne's monitoring records",
        yearFilter !== "all" ? ` for ${yearFilter}` : "",
        " yet"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Log your first sample to start tracking your herd's Johne's status." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Test Date", "Test Type", "Herd", "Risk Level", "Animals Tested", "Positive", "Bulk Milk OD", "Next Test Due", "Doc", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesFmtDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesTypeLabel(r.testType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.herdId ? herds.find((h) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: !r.riskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.riskLevel.startsWith("4") ? "bg-red-100 text-red-800" : r.riskLevel.startsWith("3") ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`, children: johnesRiskLabel(r.riskLevel) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.animalsTestedCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.positiveAnimalsCount ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.bulkMilkOd ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesFmtDate(r.nextTestDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocAttach,
          {
            farmId,
            endpoint: "johnes-monitoring",
            recordId: r.id,
            documentPath: r.documentPath ?? null,
            documentName: r.documentName ?? null,
            queryKey: ["johnes-monitoring", farmId],
            compact: true
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          !r.riskLevel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => del(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Johne's Monitoring — ",
        johnesFmtDate(viewRec.testDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesFmtDate(viewRec.testDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesTypeLabel(viewRec.testType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.herdId ? herds.find((h) => h.id === viewRec.herdId)?.name ?? `Herd #${viewRec.herdId}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesRiskLabel(viewRec.riskLevel) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animals Tested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.animalsTestedCount ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Positive Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.positiveAnimalsCount ?? 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bulk Milk OD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.bulkMilkOd ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labRef || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: JOHNES_SCHEMES.find((s) => s.value === viewRec.scheme)?.label ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesFmtDate(viewRec.nextTestDue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "JMM Enrolled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.jmmEnrolled ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Sign-off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetSignOff ? "Yes" : "No" })
        ] }),
        viewRec.actionsTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.actionsTaken })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        viewRec.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "johnes-monitoring", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRec(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "log" ? "Log Johne’s Test Sample" : mode === "result" ? "Enter Johne’s Test Results" : "Edit Johne’s Monitoring Record" }) }),
      mode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Record the sampling event now. Return to enter laboratory results once the report arrives." }),
      mode === "result" && editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
        "Sample from ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: johnesFmtDate(editing.testDate) }),
        " · ",
        johnesTypeLabel(editing.testType),
        editing.labName ? ` · ${editing.labName}` : "",
        ". Enter results from your lab report."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate || "", onChange: (e) => set("testDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testType || "", onValueChange: (v) => set("testType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: JOHNES_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: String(form.herdId || "__none__"),
                onValueChange: (v) => set("herdId", v === "__none__" ? null : Number(v)),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd (optional)" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All herds" }),
                    herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: JOHNES_LABS_PRESETS_D.includes(form.labName || "") ? form.labName || "__none__" : form.labName ? "__other__" : "__none__",
                onValueChange: (v) => {
                  if (v === "__none__") set("labName", "");
                  else if (v !== "__other__") set("labName", v);
                  else set("labName", "");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select lab" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select lab" }),
                    JOHNES_LABS_PRESETS_D.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l, children: l }, l)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (type below)" })
                  ] })
                ]
              }
            ),
            !JOHNES_LABS_PRESETS_D.includes(form.labName || "") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.labName || "", onChange: (e) => set("labName", e.target.value), placeholder: "Type lab name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value), placeholder: "Lab submission reference (if known)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.scheme || "__none__",
                onValueChange: (v) => set("scheme", v === "__none__" ? null : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select scheme" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None" }),
                    JOHNES_SCHEMES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
            uniqueVetNamesD.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: uniqueVetNamesD.includes(form.vetName) ? form.vetName : form.vetName ? "__other__" : "",
                onValueChange: (v) => {
                  if (v !== "__other__") set("vetName", v);
                  else set("vetName", "");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    uniqueVetNamesD.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (type below)" })
                  ] })
                ]
              }
            ) : null,
            (!uniqueVetNamesD.length || !uniqueVetNamesD.includes(form.vetName)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: uniqueVetNamesD.length > 0 ? "mt-1" : "", value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Vet name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "jmm", checked: !!form.jmmEnrolled, onChange: (e) => set("jmmEnrolled", e.target.checked), className: "rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "jmm", children: "Enrolled in NJMP / JMM Scheme" })
          ] }),
          form.jmmEnrolled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 rounded-lg border border-green-200 bg-green-50/60 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 text-xs font-semibold text-green-800 -mb-1", children: "NJMP / JMM Details" }),
            form.testType === "bulk_milk_elisa" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1", children: "⚠ Bulk milk ELISA alone is not accepted for NJMP risk status — individual milk ELISA (60+ cows) is required." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "NJMP Scheme Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm font-mono", value: form.njmpSchemeRef || "", onChange: (e) => set("njmpSchemeRef", e.target.value), placeholder: "e.g. AHDB-JMM-123456" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "NJMP Risk Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpRiskLevel || "__none__", onValueChange: (v) => set("njmpRiskLevel", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Risk level" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not classified" }),
                  JOHNES_RISK.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Control Strategy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpControlStrategy || "__none__", onValueChange: (v) => set("njmpControlStrategy", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select strategy" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s1_test_cull", children: "S1 — Test & cull high-risk cows" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s2_segregate", children: "S2 — Segregate high-risk cows" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s3_purchased_animals", children: "S3 — Purchased animal management" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s4_calf_colostrum", children: "S4 — Calf & colostrum management" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s5_slurry_pasture", children: "S5 — Slurry & pasture management" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s6_bespoke", children: "S6 — Bespoke vet-led strategy" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Written Plan Reviewed Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "date", value: form.njmpPlanDate || "", onChange: (e) => set("njmpPlanDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "BAJVA Advisor Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", value: form.njmpBajvaAdvisor || "", onChange: (e) => set("njmpBajvaAdvisor", e.target.value), placeholder: "BCVA-accredited vet" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "njmpColostrum", checked: !!form.njmpColostrumMgmt, onChange: (e) => set("njmpColostrumMgmt", e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "njmpColostrum", className: "text-xs", children: "Colostrum management protocol in place" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "njmpPurchased", checked: !!form.njmpPurchasedTesting, onChange: (e) => set("njmpPurchasedTesting", e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "njmpPurchased", className: "text-xs", children: "Testing/quarantine of purchased cattle" })
            ] })
          ] })
        ] }),
        mode !== "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Risk Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.riskLevel || "__none__",
                onValueChange: (v) => set("riskLevel", v === "__none__" ? null : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not classified" }),
                    JOHNES_RISK.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Positive Animals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.positiveAnimalsCount ?? 0, onChange: (e) => set("positiveAnimalsCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bulk Milk OD" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.bulkMilkOd ?? "", onChange: (e) => set("bulkMilkOd", e.target.value), placeholder: "Optical density reading" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDue || "", onChange: (e) => set("nextTestDue", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "vetso", checked: !!form.vetSignOff, onChange: (e) => set("vetSignOff", e.target.checked), className: "rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetso", children: "Vet sign-off obtained" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                rows: 2,
                value: form.actionsTaken || "",
                onChange: (e) => set("actionsTaken", e.target.value),
                placeholder: "Management actions, culling decisions, biosecurity changes…"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DairyJohnesDeclarationSection, { farmId, allMonitoringRecords: allRecords })
  ] });
}
const DairyPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AbrKitStockSection,
  AbrProcurementSection,
  BcsTab,
  BulkTankTab,
  CalvingTab,
  DairyEnterpriseReport,
  DctTab,
  MastitisTab,
  MobilityTab,
  RecordingVisitsTab,
  SccEquipmentSection,
  default: DairyPage
}, Symbol.toStringTag, { value: "Module" }));
export {
  AbrKitStockSection as A,
  BcsTab as B,
  DairySuppliesTab as D,
  MobilityTab as M,
  PackageCheck as P,
  RecordingVisitsTab as R,
  SccEquipmentSection as S,
  BulkTankTab as a,
  DairyPage$1 as b
};
