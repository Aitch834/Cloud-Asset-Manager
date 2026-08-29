import { s as createLucideIcon, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, e as LoaderCircle, U as FlaskConical, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, O as React, n as Card, o as CardContent, N as DialogMutationError } from "./index-DSdbWWue.js";
import { a as usePersistedFilter, u as usePersistedNumberFilter } from "./use-persisted-filter-mXmElOb6.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-mbE4Xd2N.js";
import { T as Textarea } from "./textarea-CP7f0gNT.js";
import { P as Package } from "./use-safe-clerk-DUn6dsFD.js";
import { S as ShoppingCart } from "./shopping-cart-D_7mPpaW.js";
import { C as CircleX } from "./circle-x-Bgp8THuH.js";
import { C as CircleCheck } from "./circle-check-rWqkW12L.js";
import { j as Truck } from "./AppLayout-Bm9Jacz4.js";
import { a as Clock } from "./database-O5mB7owv.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-Cdo_ftvH.js";
import { P as Printer } from "./printer-Cu4qncps.js";
import { C as ChevronUp } from "./chevron-up-Bk9uSuPE.js";
import { T as TriangleAlert } from "./triangle-alert-qmdOC9ih.js";
import { R as RecordAttachments } from "./RecordAttachments-CEzOVBRR.js";
import { o as openPrintWindow } from "./print-report-ClU8-1P0.js";
import { V as VMD_MEDICINES } from "./vmdMedicines-mq70NSvP.js";
import { F as FileDown } from "./file-down-Gnuqapjd.js";
import { C as ChevronLeft } from "./chevron-left-CvSXi3e1.js";
import { C as ChevronRight } from "./tractor-DtgeQObp.js";
import { P as Paperclip } from "./paperclip-B-Uvb9Zg.js";
import { E as Eye } from "./eye-BmbU5KrF.js";
import { P as Pencil } from "./pencil-_mi9pi4E.js";
import { S as Sparkles } from "./sparkles-DnAfLHCj.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-772GQ_Bk.js";
import { C as ConfirmDialog } from "./confirm-dialog-Daamsduu.js";
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
  const [historyYear, setHistoryYear] = usePersistedFilter({ page: "dairy-supplies", filter: "year", farmId, defaultValue: "all" });
  const [historyItemType, setHistoryItemType] = usePersistedFilter({ page: "dairy-supplies", filter: "item-type", farmId, defaultValue: "all" });
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
  const [dctYear, setDctYear] = usePersistedNumberFilter({ page: "dairy-dct", filter: "chart-year", farmId, defaultValue: (/* @__PURE__ */ new Date()).getFullYear() });
  const allDctRecords = data?.records ?? [];
  const dctYearRecords = allDctRecords.filter((r) => r.dryOffDate && new Date(r.dryOffDate).getFullYear() === dctYear);
  const [dctListYear, setDctListYear] = usePersistedFilter({ page: "dairy-dct", filter: "year", farmId, defaultValue: "all" });
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDctYear(dctYear - 1), className: "h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-800 w-12 text-center", children: dctYear }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDctYear(dctYear + 1), disabled: dctYear >= (/* @__PURE__ */ new Date()).getFullYear(), className: "h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" }) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "62rem" }, children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
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
  const [pendingDel, setPendingDel] = reactExports.useState(null);
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => setPendingDel(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.deviceName, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDel !== null,
        title: "Delete equipment record",
        message: "Delete this equipment record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (pendingDel !== null) del.mutate(pendingDel, { onSuccess: () => setPendingDel(null) });
        },
        onCancel: () => {
          setPendingDel(null);
          del.reset();
        }
      }
    )
  ] });
}
export {
  BcsBadge as B,
  DctTab as D,
  EaseScoreBadge as E,
  OutcomeBadge as O,
  PackageCheck as P,
  SccBadge as S,
  api as a,
  SccEquipmentSection as b,
  DairySuppliesTab as c,
  formatDate as f,
  today as t
};
