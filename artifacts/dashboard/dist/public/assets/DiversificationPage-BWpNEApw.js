import { s as createLucideIcon, b as useAppStore, j as jsxRuntimeExports, R as Redirect, n as Card, o as CardContent, r as reactExports, d as Button, T as Plus, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input, N as DialogMutationError, c as useQueryClient, a as useToast, m as useQuery, S as useMutation, C as Checkbox } from "./index-SssA5mtq.js";
import { u as usePersistedTab } from "./use-persisted-tab-DW4ag1mS.js";
import { o as openPrintWindow } from "./print-report-slff5PK4.js";
import { A as AppLayout, l as ShoppingBag, _ as Crosshair, T as TrendingUp } from "./AppLayout-z4vlO8Mn.js";
import { C as ConfirmDialog } from "./confirm-dialog-s2h_i-La.js";
import { T as Textarea } from "./textarea-bflUIEaw.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-6dhlsG3x.js";
import { T as TabBar, a as TabButton } from "./tab-button-BJC6GdxH.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { L as LayoutList } from "./layout-list-D6B0-qfD.js";
import { P as PoundSterling, C as ClipboardCheck } from "./shield-alert-RVT43Iez.js";
import { P as PawPrint } from "./paw-print-CtK97tbJ.js";
import { P as Printer } from "./printer-oFmjmgap.js";
import { T as TriangleAlert } from "./triangle-alert-BMFOvC2o.js";
import { E as Eye } from "./eye-BxQZR4g-.js";
import { P as Pencil } from "./pencil-BNLLWb9Z.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-B4GqgECm.js";
import { P as Package } from "./use-safe-clerk-BqXwrZKf.js";
import { C as ChevronRight } from "./tractor-BQszadta.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-BiVsPlGG.js";
import { B as BarChart } from "./BarChart-BHVr4IVx.js";
import { C as CartesianGrid } from "./CartesianGrid-ChqJ8BTT.js";
import { P as PieChart, a as Pie } from "./PieChart-C6hzl33b.js";
import "./database-BSrZwwIC.js";
import "./shield-check-C9TcxGVx.js";
import "./index-DO0E5EPi.js";
import "./index-BpvZ74Dt.js";
import "./chevron-up-CNp919WB.js";
const __iconNode = [
  ["path", { d: "M16 16h6", key: "100bgy" }],
  ["path", { d: "M19 13v6", key: "85cyf1" }],
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
const PackagePlus = createLucideIcon("package-plus", __iconNode);
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
function Empty({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: msg });
}
function DataTable({ cols, rows, onEdit, onDelete, onView, deleteMutation }) {
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (deleteMutation?.isSuccess) setPendingDelete(null);
  }, [deleteMutation?.isSuccess]);
  if (!rows.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No records yet." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: c.label }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: c.fmt ? c.fmt(row) : fmt(row[c.key]) }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1", children: [
          onView && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onView(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            deleteMutation?.reset();
            setPendingDelete(row);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingDelete,
        title: "Delete Record",
        message: "Are you sure you want to delete this record? This cannot be undone.",
        mutation: deleteMutation,
        onConfirm: () => {
          if (pendingDelete && onDelete) {
            onDelete(pendingDelete);
            if (!deleteMutation) setPendingDelete(null);
          }
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteMutation?.reset();
        },
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    )
  ] });
}
function useCrud(farmId, endpoint, key) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data = [], isLoading } = useQuery({ queryKey: [key, farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/${endpoint}`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/${endpoint}/${editing.id}`) : apiUrl(`farms/${farmId}/${endpoint}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: [key, farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: [key, farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openAdd(def = {}) {
    setEditing(null);
    setForm(def);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])));
    setOpen(true);
  }
  return { data, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit };
}
function ActivitiesTab({ farmId }) {
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const { data: acts, isLoading, open, setOpen, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "diversification-activities", "div-activities");
  const TYPES = ["Farm Shop / Direct Sales", "Holiday Accommodation / Glamping", "Equine / Livery", "Renewable Energy", "Shooting & Game", "Leisure & Recreation", "Food Processing", "Dairy / Artisan Processing", "Events / Weddings", "Storage / Industrial Let", "Other"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Diversification Activities" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => openAdd({ status: "active" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Activity"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "activityName", label: "Activity" }, { key: "activityType", label: "Type" }, { key: "startDate", label: "Start Date", fmt: (r) => fmtDate(r.startDate) }, { key: "planningPermissionRef", label: "Planning Ref" }, { key: "status", label: "Status" }, { key: "annualTurnover", label: "Annual Turnover (£)" }], rows: acts, onView: setViewRecord, onEdit: (r) => openEdit(r), onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Activity" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Activity Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.activityName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Activity Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.activityType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.status) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.startDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Annual Turnover (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.annualTurnover) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Planning Permission Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.planningPermissionRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Insurance Policy No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.insurancePolicyNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Insurance Renewal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.insuranceRenewalDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Diversification Activity" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Activity Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.activityName ?? ""), onChange: (e) => setForm((f) => ({ ...f, activityName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Activity Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: TYPES.filter((t) => t !== "Other").includes(String(form.activityType ?? "")) ? String(form.activityType) : form.activityType ? "Other" : "", onValueChange: (v) => setForm((f) => ({ ...f, activityType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          form.activityType === "Other" || form.activityType && !TYPES.filter((t) => t !== "Other").includes(String(form.activityType)) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.activityType === "Other" ? "" : String(form.activityType), onChange: (e) => setForm((f) => ({ ...f, activityType: e.target.value || "Other" })), placeholder: "Please specify activity type…" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.status ?? "active"), onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["active", "planned", "suspended", "ceased"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.startDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, startDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual Turnover (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.annualTurnover ?? ""), onChange: (e) => setForm((f) => ({ ...f, annualTurnover: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Planning Permission Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.planningPermissionRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, planningPermissionRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Insurance Policy No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.insurancePolicyNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, insurancePolicyNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Insurance Renewal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.insuranceRenewalDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, insuranceRenewalDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
const SHOP_CATEGORIES = ["Meat & Poultry", "Dairy & Eggs", "Fruit & Vegetables", "Cereals & Bread", "Jams & Preserves", "Honey", "Alcohol", "Plants & Flowers", "Gifts & Crafts", "Other"];
function FarmShopTab({ farmId }) {
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [shopTab, setShopTab] = reactExports.useState("products");
  const [confirmState, setConfirmState] = reactExports.useState({ open: false, title: "", message: "", onConfirm: () => {
  } });
  const showConfirm = (title, message, onConfirm, opts) => setConfirmState({ open: true, title, message, onConfirm, ...opts });
  reactExports.useEffect(() => {
    if (confirmState.mutation?.isSuccess) setConfirmState((s) => ({ ...s, open: false }));
  }, [confirmState.mutation?.isSuccess]);
  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ["shop-products", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/farm-shop-products`), { credentials: "include" }).then((r) => r.json())
  });
  const [prodOpen, setProdOpen] = reactExports.useState(false);
  const [prodEditing, setProdEditing] = reactExports.useState(null);
  const [prodForm, setProdForm] = reactExports.useState({});
  const saveProd = useMutation({
    mutationFn: (b) => fetch(prodEditing ? apiUrl(`farms/${farmId}/farm-shop-products/${prodEditing.id}`) : apiUrl(`farms/${farmId}/farm-shop-products`), { method: prodEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-products", farmId] });
      setProdOpen(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delProd = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/farm-shop-products/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-products", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [stockTarget, setStockTarget] = reactExports.useState(null);
  const [stockQty, setStockQty] = reactExports.useState("");
  const adjustStock = useMutation({
    mutationFn: ({ id, adjustment }) => fetch(apiUrl(`farms/${farmId}/shop-products/${id}/adjust-stock`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ adjustment }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-products", farmId] });
      setStockTarget(null);
      setStockQty("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const { data: sessions = [], isLoading: sessLoading } = useQuery({
    queryKey: ["shop-sales", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/shop-sales`), { credentials: "include" }).then((r) => r.json()),
    enabled: shopTab === "history"
  });
  const [saleDate, setSaleDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [saleNotes, setSaleNotes] = reactExports.useState("");
  const [saleItems, setSaleItems] = reactExports.useState([{ productId: void 0, productName: "", quantity: "", unitOfSale: "", pricePerUnit: "", lineTotal: 0 }]);
  const [expandedSessions, setExpandedSessions] = reactExports.useState(/* @__PURE__ */ new Set());
  const saleTotal = saleItems.reduce((s, i) => s + (i.lineTotal || 0), 0);
  function updateSaleItem(idx, patch) {
    setSaleItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...patch };
      const qty = parseFloat(updated.quantity) || 0;
      const price = parseFloat(updated.pricePerUnit) || 0;
      updated.lineTotal = parseFloat((qty * price).toFixed(2));
      return updated;
    }));
  }
  function pickProduct(idx, productId) {
    const prod = products.find((p) => String(p.id) === productId);
    if (prod) {
      updateSaleItem(idx, {
        productId: prod.id,
        productName: String(prod.productName),
        unitOfSale: String(prod.unitOfSale ?? ""),
        pricePerUnit: String(prod.pricePerUnit ?? "")
      });
    }
  }
  const saveSale = useMutation({
    mutationFn: () => fetch(apiUrl(`farms/${farmId}/shop-sales`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ saleDate, notes: saleNotes || void 0, items: saleItems.filter((i) => i.productName && parseFloat(i.quantity) > 0).map((i) => ({ ...i, quantity: parseFloat(i.quantity), pricePerUnit: parseFloat(i.pricePerUnit), lineTotal: i.lineTotal })) })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-products", farmId] });
      qc.invalidateQueries({ queryKey: ["shop-sales", farmId] });
      setSaleItems([{ productId: void 0, productName: "", quantity: "", unitOfSale: "", pricePerUnit: "", lineTotal: 0 }]);
      setSaleNotes("");
      setShopTab("history");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delSession = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/shop-sales/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-sales", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: suppliers = [], isLoading: suppLoading } = useQuery({
    queryKey: ["shop-suppliers", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/shop-suppliers`), { credentials: "include" }).then((r) => r.json())
  });
  const [suppOpen, setSuppOpen] = reactExports.useState(false);
  const [suppEditing, setSuppEditing] = reactExports.useState(null);
  const [suppForm, setSuppForm] = reactExports.useState({});
  const saveSupp = useMutation({
    mutationFn: (b) => fetch(suppEditing ? apiUrl(`farms/${farmId}/shop-suppliers/${suppEditing.id}`) : apiUrl(`farms/${farmId}/shop-suppliers`), { method: suppEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-suppliers", farmId] });
      setSuppOpen(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const toggleSuppActive = useMutation({
    mutationFn: ({ id, active }) => fetch(apiUrl(`farms/${farmId}/shop-suppliers/${id}/${active ? "reactivate" : "deactivate"}`), { method: "PATCH", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-suppliers", farmId] }),
    onError: () => toast({ title: "Update failed", variant: "destructive" })
  });
  const { data: purchases = [], isLoading: purchLoading } = useQuery({
    queryKey: ["shop-purchases", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/shop-purchases`), { credentials: "include" }).then((r) => r.json()),
    enabled: shopTab === "purchases"
  });
  const [purchOpen, setPurchOpen] = reactExports.useState(false);
  const [purchEditing, setPurchEditing] = reactExports.useState(null);
  const [purchForm, setPurchForm] = reactExports.useState({});
  const savePurch = useMutation({
    mutationFn: (b) => fetch(purchEditing ? apiUrl(`farms/${farmId}/shop-purchases/${purchEditing.id}`) : apiUrl(`farms/${farmId}/shop-purchases`), { method: purchEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-purchases", farmId] });
      qc.invalidateQueries({ queryKey: ["shop-products", farmId] });
      setPurchOpen(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delPurch = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/shop-purchases/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-purchases", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: stocktakes = [], isLoading: stocktakesLoading } = useQuery({
    queryKey: ["shop-stocktakes", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/farm-shop/stocktakes`), { credentials: "include" }).then((r) => r.json()),
    enabled: shopTab === "stocktakes"
  });
  const [activeStocktakeId, setActiveStocktakeId] = reactExports.useState(null);
  const { data: activeStocktake, refetch: refetchStocktake } = useQuery({
    queryKey: ["shop-stocktake-detail", farmId, activeStocktakeId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/farm-shop/stocktakes/${activeStocktakeId}`), { credentials: "include" }).then((r) => r.json()),
    enabled: activeStocktakeId !== null
  });
  const [stocktakeNewOpen, setStocktakeNewOpen] = reactExports.useState(false);
  const [stocktakeForm, setStocktakeForm] = reactExports.useState({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "" });
  const [localCounts, setLocalCounts] = reactExports.useState({});
  const createStocktakeMut = useMutation({
    mutationFn: (body) => fetch(apiUrl(`farms/${farmId}/farm-shop/stocktakes`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] });
      setStocktakeNewOpen(false);
      setLocalCounts({});
      setActiveStocktakeId(data.id);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateStocktakeItemMut = useMutation({
    mutationFn: ({ sessionId, itemId, countedQty }) => fetch(apiUrl(`farms/${farmId}/farm-shop/stocktakes/${sessionId}/items/${itemId}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ countedQty }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-stocktake-detail", farmId, activeStocktakeId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const completeStocktakeMut = useMutation({
    mutationFn: (sessionId) => fetch(apiUrl(`farms/${farmId}/farm-shop/stocktakes/${sessionId}/complete`), { method: "POST", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] });
      qc.invalidateQueries({ queryKey: ["shop-stocktake-detail", farmId, activeStocktakeId] });
      qc.invalidateQueries({ queryKey: ["shop-products", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteStocktakeMut = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/farm-shop/stocktakes/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] });
      setActiveStocktakeId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const activeProducts = products.filter((p) => p.active !== false);
  const fmtGbp = (v) => v ? `£${parseFloat(String(v)).toFixed(2)}` : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 border-b pb-0 flex-wrap", children: ["products", "sales", "history", "suppliers", "purchases", "stocktakes"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => {
          setShopTab(t);
          if (t !== "stocktakes") setActiveStocktakeId(null);
        },
        className: `px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${shopTab === t ? "bg-background border border-b-background -mb-px text-foreground" : "text-muted-foreground hover:text-foreground"}`,
        children: t === "products" ? "Products & Stock" : t === "sales" ? "Record Sales" : t === "history" ? "Sales History" : t === "suppliers" ? "Suppliers" : t === "purchases" ? "Purchases" : "Stocktakes"
      },
      t
    )) }),
    shopTab === "products" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Product Catalogue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setProdEditing(null);
          setProdForm({ active: true });
          setProdOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Product"
        ] })
      ] }),
      viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Product" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.productName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.category) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Unit of Sale" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.unitOfSale) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cost Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtGbp(viewRecord.costPrice) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Retail Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtGbp(viewRecord.pricePerUnit) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reorder Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.reorderLevel) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Current Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.currentStock) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Is Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.active !== false ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setProdEditing(viewRecord);
            setProdForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v ?? ""])));
            setProdOpen(true);
            setViewRecord(null);
          }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
        ] })
      ] }) }),
      prodLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Product", "Category", "Unit", "Cost", "Price", "Margin", "In Stock", "Reorder At", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          products.map((p, i) => {
            const stock = parseFloat(String(p.currentStock ?? "0")) || 0;
            const reorder = parseFloat(String(p.reorderLevel ?? "0")) || 0;
            const low = stock > 0 && reorder > 0 && stock <= reorder;
            const zero = stock === 0 && p.active;
            const costP = parseFloat(String(p.costPrice ?? "")) || 0;
            const sellP = parseFloat(String(p.pricePerUnit ?? "")) || 0;
            const margin = costP > 0 && sellP > 0 ? (sellP - costP) / sellP * 100 : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 font-medium", children: String(p.productName) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: String(p.category) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: fmt(p.unitOfSale) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: costP > 0 ? fmtGbp(p.costPrice) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-xs", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmtGbp(p.pricePerUnit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: margin !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-medium ${margin >= 40 ? "text-emerald-700" : margin >= 20 ? "text-amber-600" : "text-red-600"}`, children: [
                margin.toFixed(0),
                "%"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${zero ? "text-red-600" : low ? "text-amber-600" : "text-emerald-700"}`, children: stock % 1 === 0 ? stock.toFixed(0) : stock.toFixed(1) }),
                !!zero && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "inline w-3 h-3 ml-1 text-red-500" }),
                !!low && !zero && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "inline w-3 h-3 ml-1 text-amber-500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: reorder > 0 ? reorder % 1 === 0 ? reorder.toFixed(0) : reorder.toFixed(1) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-1.5 py-0.5 rounded-full ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`, children: p.active ? "Active" : "Inactive" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setViewRecord(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Stock In", onClick: () => {
                  setStockTarget(p);
                  setStockQty("");
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { className: "w-3.5 h-3.5 text-emerald-600" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                  setProdEditing(p);
                  setProdForm(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? ""])));
                  setProdOpen(true);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                  delProd.reset();
                  showConfirm("Delete Product", "Remove this product from the catalogue? Stock history and purchase records will be retained.", () => delProd.mutate(p.id), { confirmLabel: "Delete", variant: "destructive", mutation: delProd });
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
              ] })
            ] }, i);
          }),
          products.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "py-6 text-center text-sm text-muted-foreground italic", children: "No products yet." }) })
        ] })
      ] }) }),
      products.some((p) => {
        const s = parseFloat(String(p.currentStock ?? "0")) || 0;
        const r = parseFloat(String(p.reorderLevel ?? "0")) || 0;
        return s === 0 || r > 0 && s <= r;
      }) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-amber-800 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
          "Stock alerts"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 space-y-0.5", children: products.filter((p) => {
          const s = parseFloat(String(p.currentStock ?? "0")) || 0;
          const r = parseFloat(String(p.reorderLevel ?? "0")) || 0;
          return s === 0 || r > 0 && s <= r;
        }).map((p, i) => {
          const s = parseFloat(String(p.currentStock ?? "0")) || 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `text-xs ${s === 0 ? "text-red-700 font-medium" : "text-amber-700"}`, children: [
            String(p.productName),
            ": ",
            s === 0 ? "Out of stock" : `Low stock (${s} remaining, reorder at ${p.reorderLevel})`
          ] }, i);
        }) })
      ] })
    ] }),
    shopTab === "sales" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Record Today's Sales" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: saleDate, onChange: (e) => setSaleDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: saleNotes, onChange: (e) => setSaleNotes(e.target.value), placeholder: "e.g. Saturday market" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-4", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-2", children: "Qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-2", children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-2", children: "Price (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-1 text-right", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-1" })
        ] }),
        saleItems.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: item.productId ? String(item.productId) : "__none__", onValueChange: (v) => v !== "__none__" ? pickProduct(idx, v) : updateSaleItem(idx, { productId: void 0, productName: "", unitOfSale: "", pricePerUnit: "" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick product…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select product —" }),
              activeProducts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: String(p.productName) }, String(p.id)))
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", type: "number", min: "0", step: "0.5", placeholder: "0", value: item.quantity, onChange: (e) => updateSaleItem(idx, { quantity: e.target.value }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "unit", value: item.unitOfSale, onChange: (e) => updateSaleItem(idx, { unitOfSale: e.target.value }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", type: "number", min: "0", step: "0.01", placeholder: "0.00", value: item.pricePerUnit, onChange: (e) => updateSaleItem(idx, { pricePerUnit: e.target.value }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 text-right text-xs font-semibold", children: item.lineTotal > 0 ? `£${item.lineTotal.toFixed(2)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 text-right", children: saleItems.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => setSaleItems((prev) => prev.filter((_, i) => i !== idx)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3 text-red-400" }) }) })
        ] }, idx)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setSaleItems((prev) => [...prev, { productId: void 0, productName: "", quantity: "", unitOfSale: "", pricePerUnit: "", lineTotal: 0 }]), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Add Line"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
          "Session Total: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg text-emerald-700", children: [
            "£",
            saleTotal.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => saveSale.mutate(),
            disabled: saveSale.isPending || saleItems.filter((i) => i.productName && parseFloat(i.quantity) > 0).length === 0 || !saleDate,
            children: [
              saveSale.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 mr-1" }),
              "Save Sales Record"
            ]
          }
        )
      ] })
    ] }),
    shopTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Sales History" }),
      sessLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No sales recorded yet. Use 'Record Sales' to log your first session." }) : sessions.map((sess) => {
        const expanded = expandedSessions.has(sess.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer", onClick: () => setExpandedSessions((prev) => {
            const s = new Set(prev);
            s.has(sess.id) ? s.delete(sess.id) : s.add(sess.id);
            return s;
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: fmtDate(sess.saleDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                sess.items.length,
                " item",
                sess.items.length !== 1 ? "s" : ""
              ] }),
              sess.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground italic", children: [
                "— ",
                sess.notes
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-emerald-700", children: [
                "£",
                parseFloat(sess.totalNet).toFixed(2)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: (e) => {
                e.stopPropagation();
                delSession.reset();
                showConfirm("Delete Sales Session", "This session and all its line items will be removed. Stock levels will be restored to pre-sale quantities.", () => delSession.mutate(sess.id), { confirmLabel: "Delete", variant: "destructive", mutation: delSession });
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) })
            ] })
          ] }),
          expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5 font-medium text-muted-foreground", children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5 font-medium text-muted-foreground", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5 font-medium text-muted-foreground", children: "Unit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5 font-medium text-muted-foreground", children: "Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1.5 font-medium text-muted-foreground", children: "Line Total" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sess.items.map((item, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 font-medium", children: String(item.productName) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5", children: String(item.quantity) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 text-muted-foreground", children: fmt(item.unitOfSale) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5", children: fmtGbp(item.pricePerUnit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 text-right font-semibold", children: fmtGbp(item.lineTotal) })
            ] }, j)) })
          ] }) })
        ] }, sess.id);
      })
    ] }),
    shopTab === "suppliers" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Suppliers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setSuppEditing(null);
          setSuppForm({ name: "", contactName: "", phone: "", email: "", notes: "" });
          setSuppOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          " Add Supplier"
        ] })
      ] }),
      viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Supplier" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.supplierName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Contact Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.contactName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.phone) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.email) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setSuppEditing(viewRecord);
            setSuppForm({ name: String(viewRecord.supplierName ?? ""), contactName: String(viewRecord.contactName ?? ""), phone: String(viewRecord.phone ?? ""), email: String(viewRecord.email ?? ""), notes: String(viewRecord.notes ?? "") });
            setSuppOpen(true);
            setViewRecord(null);
          }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
        ] })
      ] }) }),
      suppLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : suppliers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No suppliers yet. Add one to start recording purchases." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Supplier", "Contact", "Phone", "Email", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: suppliers.map((s, i) => {
          const isActive = s.active !== false;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b last:border-0 ${isActive ? "" : "opacity-50"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${isActive ? "" : "line-through text-muted-foreground"}`, children: String(s.supplierName) }),
              !isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium uppercase tracking-wide", children: "Inactive" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: fmt(s.contactName) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: fmt(s.phone) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: s.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${s.email}`, className: "underline underline-offset-2", children: String(s.email) }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground max-w-[200px] truncate", children: fmt(s.notes) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => setViewRecord(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => {
                setSuppEditing(s);
                setSuppForm({ name: String(s.supplierName ?? ""), contactName: s.contactName ?? "", phone: s.phone ?? "", email: s.email ?? "", notes: s.notes ?? "" });
                setSuppOpen(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-xs", onClick: () => toggleSuppActive.mutate({ id: s.id, active: !isActive }), children: isActive ? "Deactivate" : "Reactivate" })
            ] }) })
          ] }, i);
        }) })
      ] }) })
    ] }),
    shopTab === "purchases" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Purchase Ledger" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setPurchEditing(null);
          setPurchForm({ purchaseDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), supplierId: "__none__", productId: "__none__", quantityPurchased: "", costPerUnit: "", totalCost: "", invoiceRef: "", notes: "", updateCostPrice: false });
          setPurchOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          " Record Purchase"
        ] })
      ] }),
      viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Purchase" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Purchase Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(String(viewRecord.purchaseDate)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.supplierName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.productName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.quantity) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cost Per Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtGbp(viewRecord.costPerUnit) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtGbp(viewRecord.totalCost) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.invoiceRef) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setPurchEditing(viewRecord);
            setPurchForm({ purchaseDate: String(viewRecord.purchaseDate ?? "").slice(0, 10), supplierId: viewRecord.supplierId ? String(viewRecord.supplierId) : "__none__", productId: viewRecord.productId ? String(viewRecord.productId) : "__none__", quantityPurchased: String(viewRecord.quantity ?? ""), costPerUnit: String(viewRecord.costPerUnit ?? ""), totalCost: String(viewRecord.totalCost ?? ""), invoiceRef: String(viewRecord.invoiceRef ?? ""), notes: String(viewRecord.notes ?? ""), updateCostPrice: false });
            setPurchOpen(true);
            setViewRecord(null);
          }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
        ] })
      ] }) }),
      purchLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : purchases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No purchases recorded. Hit 'Record Purchase' to log your first order." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Date", "Supplier", "Product", "Qty", "Cost/Unit", "Total", "Invoice Ref", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: purchases.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap", children: fmtDate(String(p.purchaseDate)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: p.supplierName ? fmt(p.supplierName) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-xs text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 font-medium", children: fmt(p.productName) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmt(p.quantity) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmtGbp(p.costPerUnit) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 font-semibold", children: fmtGbp(p.totalCost) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground", children: fmt(p.invoiceRef) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => setViewRecord(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => {
              setPurchEditing(p);
              setPurchForm({ purchaseDate: String(p.purchaseDate ?? "").slice(0, 10), supplierId: p.supplierId ? String(p.supplierId) : "__none__", productId: p.productId ? String(p.productId) : "__none__", quantityPurchased: String(p.quantity ?? ""), costPerUnit: String(p.costPerUnit ?? ""), totalCost: String(p.totalCost ?? ""), invoiceRef: String(p.invoiceRef ?? ""), notes: String(p.notes ?? ""), updateCostPrice: false });
              setPurchOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => {
              delPurch.reset();
              showConfirm("Delete Purchase", "Remove this purchase record? Note: any stock that was added when this was logged will not be automatically reversed.", () => delPurch.mutate(p.id), { confirmLabel: "Delete", variant: "destructive", mutation: delPurch });
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) })
          ] }) })
        ] }, i)) })
      ] }) })
    ] }),
    shopTab === "stocktakes" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: activeStocktakeId === null ? (
      /* ── List view ─────────────────────────────────────────────── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Stocktake Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Count physical stock and compare against system quantities to detect theft, mis-sales, or data errors." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setStocktakeForm({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "" });
            setStocktakeNewOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
            " New Stocktake"
          ] })
        ] }),
        viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Stocktake" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Stocktake Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(String(viewRecord.stocktakeDate)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.status) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
        ] }) }),
        stocktakesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : stocktakes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No stocktakes recorded yet. Start your first count with 'New Stocktake'." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Date", "Status", "Progress", "Variance £", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: stocktakes.map((s) => {
            const varVal = s.totalVarianceValue ? parseFloat(s.totalVarianceValue) : null;
            const isDraft = s.status === "draft";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30 cursor-pointer", onClick: () => {
              setLocalCounts({});
              setActiveStocktakeId(s.id);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap font-medium", children: fmtDate(s.stocktakeDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDraft ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`, children: isDraft ? "In Progress" : "Completed" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3 text-muted-foreground", children: [
                s.countedCount ?? 0,
                " / ",
                s.itemCount ?? 0,
                " counted"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: varVal === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: varVal < 0 ? "text-red-600 font-medium" : varVal > 0 ? "text-amber-600 font-medium" : "text-green-600", children: [
                varVal >= 0 ? "+" : "",
                "£",
                Math.abs(varVal).toFixed(2)
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs", children: s.notes || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => setViewRecord(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => {
                  setLocalCounts({});
                  setActiveStocktakeId(s.id);
                }, children: isDraft ? "Continue" : "View" }),
                isDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => {
                  deleteStocktakeMut.reset();
                  showConfirm("Delete Stocktake", "Delete this draft stocktake? All counts entered so far will be lost.", () => deleteStocktakeMut.mutate(s.id), { confirmLabel: "Delete", variant: "destructive", mutation: deleteStocktakeMut });
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) })
              ] }) })
            ] }, s.id);
          }) })
        ] }) })
      ] })
    ) : (
      /* ── Detail view ────────────────────────────────────────────── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
            setActiveStocktakeId(null);
            qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] });
          }, children: "← Back" }),
          activeStocktake && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm", children: [
                  "Stocktake — ",
                  fmtDate(activeStocktake.stocktakeDate)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activeStocktake.status === "draft" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`, children: activeStocktake.status === "draft" ? "In Progress" : "Completed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  activeStocktake.countedCount ?? 0,
                  " / ",
                  activeStocktake.itemCount ?? 0,
                  " products counted"
                ] })
              ] }),
              activeStocktake.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: activeStocktake.notes })
            ] }),
            activeStocktake.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                disabled: (activeStocktake.countedCount ?? 0) < (activeStocktake.itemCount ?? 0) || completeStocktakeMut.isPending,
                onClick: () => {
                  completeStocktakeMut.reset();
                  showConfirm("Complete Stocktake", "Stock levels will be updated to match your physical counts. This cannot be undone.", () => completeStocktakeMut.mutate(activeStocktake.id), { confirmLabel: "Complete Stocktake", mutation: completeStocktakeMut });
                },
                children: [
                  completeStocktakeMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin mr-1" }) : null,
                  "Complete Stocktake"
                ]
              }
            )
          ] })
        ] }),
        !activeStocktake ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : (activeStocktake.items ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No products found. Add products to the catalogue first, then start a new stocktake." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          (() => {
            const items = activeStocktake.items ?? [];
            const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
            const negCount = items.filter((i) => i.variance !== null && parseFloat(i.variance) < 0).length;
            const uncounted = items.filter((i) => i.countedQty === null).length;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
              { label: "Uncounted", value: String(uncounted), sub: "products remaining", color: uncounted > 0 ? "text-amber-600" : "text-green-600" },
              { label: "Total Variance", value: `${totalVar >= 0 ? "+" : ""}£${Math.abs(totalVar).toFixed(2)}`, sub: "cost value difference", color: totalVar < 0 ? "text-red-600" : totalVar > 0 ? "text-amber-600" : "text-green-600" },
              { label: "Shortfalls", value: String(negCount), sub: "lines below system qty", color: negCount > 0 ? "text-red-600" : "text-green-600" }
            ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: card.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${card.color}`, children: card.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: card.sub })
            ] }, card.label)) });
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Product", "Unit", "System Qty", "Counted", "Variance", "Variance £"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (activeStocktake.items ?? []).map((item) => {
              const varNum = item.variance !== null ? parseFloat(item.variance) : null;
              const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue) : null;
              const varColor = varNum === null ? "" : varNum < 0 ? "text-red-600 font-semibold" : varNum === 0 ? "text-green-600" : "text-amber-600 font-semibold";
              const rowBg = varNum === null ? "" : varNum < 0 ? "bg-red-50/40" : varNum > 0 ? "bg-amber-50/30" : "";
              const isCounted = item.countedQty !== null;
              const localVal = localCounts[item.id] !== void 0 ? localCounts[item.id] : item.countedQty ?? "";
              const isCompleted = activeStocktake.status === "completed";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b last:border-0 ${rowBg}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 font-medium", children: item.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs", children: item.unitOfSale || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: parseFloat(item.expectedQty).toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isCounted ? "" : "text-muted-foreground italic", children: item.countedQty ?? "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: "0",
                    step: "0.01",
                    className: "h-7 w-24 text-sm",
                    placeholder: "0",
                    value: localVal,
                    onChange: (e) => setLocalCounts((prev) => ({ ...prev, [item.id]: e.target.value })),
                    onBlur: () => {
                      const raw = localCounts[item.id];
                      if (raw === void 0) return;
                      const val = raw.trim() === "" ? null : raw;
                      updateStocktakeItemMut.mutate({ sessionId: activeStocktake.id, itemId: item.id, countedQty: val });
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 pr-3 ${varColor}`, children: varNum === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : `${varNum >= 0 ? "+" : ""}${varNum.toFixed(2)}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 ${varColor}`, children: varVal === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : `${varVal >= 0 ? "+" : ""}£${Math.abs(varVal).toFixed(2)}` })
              ] }, item.id);
            }) })
          ] }) }),
          (activeStocktake.items ?? []).some((i) => i.costPrice === null) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground border-t pt-2", children: [
            "* Variance £ shows ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "—" }),
            " for products without a cost price set. Add cost prices in the Products & Stock tab to see cost-value variance."
          ] }),
          activeStocktake.status === "draft" && (activeStocktake.countedCount ?? 0) < (activeStocktake.itemCount ?? 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center border-t pt-3", children: [
            "Count all ",
            (activeStocktake.itemCount ?? 0) - (activeStocktake.countedCount ?? 0),
            " remaining products before you can complete the stocktake."
          ] })
        ] })
      ] })
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: stocktakeNewOpen, onOpenChange: (o) => {
      if (!o) {
        setStocktakeNewOpen(false);
        createStocktakeMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New Stocktake" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Snaps the current system stock for all active products. You'll then count and enter the physical quantities." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stocktake Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stocktakeForm.stocktakeDate, onChange: (e) => setStocktakeForm((f) => ({ ...f, stocktakeDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stocktakeForm.notes, placeholder: "e.g. Monthly count, post-market", onChange: (e) => setStocktakeForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createStocktakeMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStocktakeNewOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !stocktakeForm.stocktakeDate || createStocktakeMut.isPending, onClick: () => createStocktakeMut.mutate({ stocktakeDate: stocktakeForm.stocktakeDate, notes: stocktakeForm.notes || void 0 }), children: createStocktakeMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Start Stocktake" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: suppOpen, onOpenChange: (o) => {
      if (!o) {
        setSuppOpen(false);
        saveSupp.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "26rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: suppEditing ? "Edit Supplier" : "Add Supplier" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(suppForm.name ?? ""), onChange: (e) => setSuppForm((f) => ({ ...f, name: e.target.value })), placeholder: "e.g. Green Valley Feeds" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(suppForm.contactName ?? ""), onChange: (e) => setSuppForm((f) => ({ ...f, contactName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(suppForm.phone ?? ""), onChange: (e) => setSuppForm((f) => ({ ...f, phone: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: String(suppForm.email ?? ""), onChange: (e) => setSuppForm((f) => ({ ...f, email: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(suppForm.notes ?? ""), onChange: (e) => setSuppForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveSupp, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSuppOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveSupp.isPending || !String(suppForm.name ?? "").trim(), onClick: () => saveSupp.mutate({ name: suppForm.name, contactName: suppForm.contactName || void 0, phone: suppForm.phone || void 0, email: suppForm.email || void 0, notes: suppForm.notes || void 0 }), children: saveSupp.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: purchOpen, onOpenChange: (o) => {
      if (!o) {
        setPurchOpen(false);
        savePurch.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "28rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: purchEditing ? "Edit Purchase" : "Record Purchase" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(purchForm.purchaseDate ?? ""), onChange: (e) => setPurchForm((f) => ({ ...f, purchaseDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(purchForm.supplierId ?? "__none__"), onValueChange: (v) => setPurchForm((f) => ({ ...f, supplierId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No supplier" }),
              suppliers.filter((s) => s.active !== false).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: String(s.supplierName) }, String(s.id)))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(purchForm.productId ?? "__none__"), onValueChange: (v) => {
            const prod = products.find((p) => String(p.id) === v);
            setPurchForm((f) => ({
              ...f,
              productId: v,
              costPerUnit: prod && prod.costPrice ? String(prod.costPrice) : f.costPerUnit
            }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link to product…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No product" }),
              products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: String(p.productName) }, String(p.id)))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: String(purchForm.quantityPurchased ?? ""), onChange: (e) => {
              const q = parseFloat(e.target.value) || 0;
              const cpu = parseFloat(String(purchForm.costPerUnit ?? "")) || 0;
              setPurchForm((f) => ({ ...f, quantityPurchased: e.target.value, totalCost: q && cpu ? String((q * cpu).toFixed(2)) : f.totalCost }));
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost/Unit (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: String(purchForm.costPerUnit ?? ""), onChange: (e) => {
              const cpu = parseFloat(e.target.value) || 0;
              const q = parseFloat(String(purchForm.quantityPurchased ?? "")) || 0;
              setPurchForm((f) => ({ ...f, costPerUnit: e.target.value, totalCost: q && cpu ? String((q * cpu).toFixed(2)) : f.totalCost }));
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: String(purchForm.totalCost ?? ""), onChange: (e) => setPurchForm((f) => ({ ...f, totalCost: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(purchForm.invoiceRef ?? ""), onChange: (e) => setPurchForm((f) => ({ ...f, invoiceRef: e.target.value })), placeholder: "e.g. INV-2024-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(purchForm.notes ?? ""), onChange: (e) => setPurchForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "updateCostPrice", checked: !!purchForm.updateCostPrice, onChange: (e) => setPurchForm((f) => ({ ...f, updateCostPrice: e.target.checked })), className: "w-4 h-4 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "updateCostPrice", className: "text-sm", children: "Update product's cost price to this cost/unit" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: savePurch, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPurchOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: savePurch.isPending || !String(purchForm.purchaseDate ?? "").trim(), onClick: () => savePurch.mutate({
          purchaseDate: purchForm.purchaseDate,
          supplierId: purchForm.supplierId && purchForm.supplierId !== "__none__" ? parseInt(String(purchForm.supplierId)) : void 0,
          productId: purchForm.productId && purchForm.productId !== "__none__" ? parseInt(String(purchForm.productId)) : void 0,
          quantityPurchased: purchForm.quantityPurchased || void 0,
          costPerUnit: purchForm.costPerUnit || void 0,
          totalCost: purchForm.totalCost || void 0,
          invoiceRef: purchForm.invoiceRef || void 0,
          notes: purchForm.notes || void 0,
          updateCostPrice: !!purchForm.updateCostPrice
        }), children: savePurch.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!stockTarget, onOpenChange: (o) => {
      if (!o) {
        setStockTarget(null);
        adjustStock.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Stock In — ",
        stockTarget ? String(stockTarget.productName) : ""
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Current stock: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          parseFloat(String(stockTarget?.currentStock ?? "0")).toFixed(0),
          " ",
          fmt(stockTarget?.unitOfSale)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity to add *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: stockQty, onChange: (e) => setStockQty(e.target.value), placeholder: "e.g. 24" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: adjustStock, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStockTarget(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => adjustStock.mutate({ id: stockTarget.id, adjustment: parseFloat(stockQty) }), disabled: adjustStock.isPending || !stockQty || parseFloat(stockQty) <= 0, children: [
          adjustStock.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
          "Add Stock"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: confirmState.open,
        title: confirmState.title,
        message: confirmState.message,
        mutation: confirmState.mutation,
        onConfirm: () => {
          confirmState.onConfirm();
          if (!confirmState.mutation) setConfirmState((s) => ({ ...s, open: false }));
        },
        onCancel: () => {
          confirmState.mutation?.reset();
          setConfirmState((s) => ({ ...s, open: false }));
        },
        confirmLabel: confirmState.confirmLabel ?? "Confirm",
        confirmVariant: confirmState.variant ?? "default"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: prodOpen, onOpenChange: (o) => {
      setProdOpen(o);
      if (!o) saveProd.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: prodEditing ? "Edit Product" : "Add Product" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(prodForm.productName ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: SHOP_CATEGORIES.filter((c) => c !== "Other").includes(String(prodForm.category ?? "")) ? String(prodForm.category) : prodForm.category ? "Other" : "", onValueChange: (v) => setProdForm((f) => ({ ...f, category: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SHOP_CATEGORIES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          prodForm.category === "Other" || prodForm.category && !SHOP_CATEGORIES.filter((c) => c !== "Other").includes(String(prodForm.category)) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: prodForm.category === "Other" ? "" : String(prodForm.category), onChange: (e) => setProdForm((f) => ({ ...f, category: e.target.value || "Other" })), placeholder: "Please specify category…" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit of Sale" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(prodForm.unitOfSale ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, unitOfSale: e.target.value })), placeholder: "e.g. dozen, kg, jar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost Price (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(prodForm.costPrice ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, costPrice: e.target.value })), placeholder: "What you pay" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Selling Price (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(prodForm.pricePerUnit ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, pricePerUnit: e.target.value })), placeholder: "What you charge" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", min: "0", value: String(prodForm.currentStock ?? "0"), onChange: (e) => setProdForm((f) => ({ ...f, currentStock: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reorder Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", min: "0", value: String(prodForm.reorderLevel ?? "0"), onChange: (e) => setProdForm((f) => ({ ...f, reorderLevel: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country of Origin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(prodForm.countryOfOrigin ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, countryOfOrigin: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Best Before (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(prodForm.bestBeforeDays ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, bestBeforeDays: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Requirements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(prodForm.storageRequirements ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, storageRequirements: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "active-prod", checked: Boolean(prodForm.active), onCheckedChange: (v) => setProdForm((f) => ({ ...f, active: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "active-prod", children: "Active product?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(prodForm.description ?? ""), onChange: (e) => setProdForm((f) => ({ ...f, description: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveProd, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setProdOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveProd.mutate(prodForm), disabled: saveProd.isPending || !prodForm.productName || !prodForm.category, children: "Save" })
      ] })
    ] }) })
  ] });
}
const HYGIENE_RELATES_TO = ["Farm Shop", "Food Processing", "Dairy / Artisan Processing", "Events / Catering", "Farm Kitchen", "Equine / Livery", "Other"];
function HygieneInspectionsTab({ farmId }) {
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const { data: records, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "farm-shop-hygiene-inspections", "shop-hygiene");
  function printHygieneRegister() {
    const rows = records.map((r) => `<tr>
      <td>${fmt(r.relatesTo)}</td>
      <td>${fmtDate(r.inspectionDate)}</td>
      <td>${fmt(r.inspectionType)}</td>
      <td>${fmt(r.inspectorName)}</td>
      <td>${fmt(r.inspectorOrganisation)}</td>
      <td>${r.hygieneRating != null ? `${r.hygieneRating} / 5` : "—"}</td>
      <td>${r.reinspectionRequired ? "Yes" : "No"}</td>
      <td>${fmtDate(r.reinspectionDate)}</td>
      <td>${fmt(r.findingsSummary)}</td>
      <td>${fmt(r.correctiveActions)}</td>
    </tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Hygiene & Food Safety Inspection Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top}tr:nth-child(even) td{background:#fafafa}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Hygiene &amp; Food Safety Inspection Register</h1>
<h2>${records.length} inspection${records.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Relates To</th><th>Date</th><th>Type</th><th>Inspector</th><th>Organisation</th><th>Rating</th><th>Reinspection</th><th>Reinspection Date</th><th>Findings</th><th>Corrective Actions</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Hygiene & Food Safety Inspections" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Log all hygiene and food safety inspections across diversification activities — Farm Shop, food processing, events catering and more." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printHygieneRegister, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => openAdd({ reinspectionRequired: false }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Inspection"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "relatesTo", label: "Relates To" },
          { key: "inspectionDate", label: "Date", fmt: (r) => fmtDate(r.inspectionDate) },
          { key: "inspectionType", label: "Type" },
          { key: "inspectorOrganisation", label: "Organisation" },
          { key: "hygieneRating", label: "Rating" },
          { key: "reinspectionRequired", label: "Reinspection", fmt: (r) => r.reinspectionRequired ? "Yes" : "No" }
        ],
        rows: records,
        onView: setViewRecord,
        onEdit: (r) => openEdit(r),
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Hygiene Inspection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Relates To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.relatesTo) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Inspection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.inspectionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Inspection Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.inspectionType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Food Hygiene Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.hygieneRating != null ? `${viewRecord.hygieneRating} / 5` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Inspector Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.inspectorName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organisation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.inspectorOrganisation) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reinspection Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.reinspectionRequired ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reinspection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.reinspectionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Findings Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: fmt(viewRecord.findingsSummary) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Corrective Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: fmt(viewRecord.correctiveActions) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: fmt(viewRecord.notes) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Hygiene Inspection"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relates To *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: HYGIENE_RELATES_TO.filter((o) => o !== "Other").includes(String(form.relatesTo ?? "")) ? String(form.relatesTo) : form.relatesTo ? "Other" : "", onValueChange: (v) => setForm((f) => ({ ...f, relatesTo: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select activity this inspection covers" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HYGIENE_RELATES_TO.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          form.relatesTo === "Other" || form.relatesTo && !HYGIENE_RELATES_TO.filter((o) => o !== "Other").includes(String(form.relatesTo)) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.relatesTo === "Other" ? "" : String(form.relatesTo), onChange: (e) => setForm((f) => ({ ...f, relatesTo: e.target.value || "Other" })), placeholder: "Please specify…" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.inspectionDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, inspectionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.inspectionType ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, inspectionType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Local Authority Routine", "Allergen Compliance", "HACCP Audit", "Red Tractor", "Self-Audit", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.inspectorName ?? ""), onChange: (e) => setForm((f) => ({ ...f, inspectorName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organisation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.inspectorOrganisation ?? ""), onChange: (e) => setForm((f) => ({ ...f, inspectorOrganisation: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Food Hygiene Rating (0–5)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", max: "5", value: String(form.hygieneRating ?? ""), onChange: (e) => setForm((f) => ({ ...f, hygieneRating: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 self-end pb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "reinsp", checked: Boolean(form.reinspectionRequired), onCheckedChange: (v) => setForm((f) => ({ ...f, reinspectionRequired: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reinsp", children: "Reinspection required?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reinspection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.reinspectionDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, reinspectionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Findings Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.findingsSummary ?? ""), onChange: (e) => setForm((f) => ({ ...f, findingsSummary: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.correctiveActions ?? ""), onChange: (e) => setForm((f) => ({ ...f, correctiveActions: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function EquineTab({ farmId }) {
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [viewEvent, setViewEvent] = reactExports.useState(null);
  const { data: horses, isLoading, open, setOpen, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "equine-records", "equine");
  const { data: events, isLoading: evL, open: evOpen, setOpen: setEvOpen, form: evForm, setForm: setEvForm, save: evSave, del: evDel, openAdd: evOpenAdd } = useCrud(farmId, "equine-health-events", "equine-health");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Equine Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => openAdd({ status: "active" }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Horse"
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "horseName", label: "Name" }, { key: "breed", label: "Breed" }, { key: "sex", label: "Sex" }, { key: "passportNumber", label: "Passport No." }, { key: "microchipNumber", label: "Microchip" }, { key: "ownerName", label: "Owner" }, { key: "liveryType", label: "Livery Type" }, { key: "box", label: "Box" }], rows: horses, onView: setViewRecord, onEdit: (r) => openEdit(r), onDelete: (r) => del.mutate(r.id), deleteMutation: del })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Health Events (Worming, Farrier, Vaccination)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => evOpenAdd(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Event"
        ] })
      ] }),
      evL ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "eventDate", label: "Date", fmt: (r) => fmtDate(r.eventDate) }, { key: "eventType", label: "Type" }, { key: "vetOrFarrierName", label: "Vet / Farrier" }, { key: "treatmentGiven", label: "Treatment" }, { key: "productUsed", label: "Product" }, { key: "cost", label: "Cost (£)" }], rows: events, onView: setViewEvent, onDelete: (r) => evDel.mutate(r.id), deleteMutation: evDel })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Equine Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Horse Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.horseName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.breed) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.sex) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colour" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.colour) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date of Birth" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.dateOfBirth) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Passport Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.passportNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "UELN Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.uelnNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Microchip Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.microchipNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Owner Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.ownerName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Livery Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.liveryType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Box / Stable" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.box) })
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
    viewEvent && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewEvent(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Health Event" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewEvent.eventDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Event Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewEvent.eventType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet / Farrier Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewEvent.vetOrFarrierName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Given" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewEvent.treatmentGiven) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewEvent.productUsed) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cost (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewEvent.cost) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewEvent(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Equine Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Horse Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.horseName ?? ""), onChange: (e) => setForm((f) => ({ ...f, horseName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.breed ?? ""), onChange: (e) => setForm((f) => ({ ...f, breed: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colour" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.colour ?? ""), onChange: (e) => setForm((f) => ({ ...f, colour: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.sex ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, sex: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Stallion", "Gelding", "Mare", "Colt", "Filly"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Birth" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.dateOfBirth ?? ""), onChange: (e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Passport Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.passportNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, passportNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UELN Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.uelnNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, uelnNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Microchip Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.microchipNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, microchipNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Owner Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.ownerName ?? ""), onChange: (e) => setForm((f) => ({ ...f, ownerName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Livery Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.liveryType ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, liveryType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Full Livery", "Part Livery", "DIY Livery", "Grass Livery", "Own Horses"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Box / Stable" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.box ?? ""), onChange: (e) => setForm((f) => ({ ...f, box: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: evOpen, onOpenChange: (o) => {
      setEvOpen(o);
      if (!o) evSave.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Health Event" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(evForm.eventDate ?? ""), onChange: (e) => setEvForm((f) => ({ ...f, eventDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(evForm.eventType ?? ""), onValueChange: (v) => setEvForm((f) => ({ ...f, eventType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Worming", "Farrier", "Vaccination", "Dental", "Veterinary Treatment", "Physiotherapy", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet / Farrier Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(evForm.vetOrFarrierName ?? ""), onChange: (e) => setEvForm((f) => ({ ...f, vetOrFarrierName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Given" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(evForm.treatmentGiven ?? ""), onChange: (e) => setEvForm((f) => ({ ...f, treatmentGiven: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(evForm.productUsed ?? ""), onChange: (e) => setEvForm((f) => ({ ...f, productUsed: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(evForm.cost ?? ""), onChange: (e) => setEvForm((f) => ({ ...f, cost: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: evSave, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEvOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => evSave.mutate(evForm), disabled: evSave.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function ShootingTab({ farmId }) {
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "shooting-game-records", "shooting");
  function printShootRegister() {
    const rows = records.map((r) => `<tr>
      <td>${fmtDate(r.shootDate)}</td>
      <td>${fmt(r.shootType)}</td>
      <td>${fmt(r.organiser)}</td>
      <td>${fmt(r.gamekeeperName)}</td>
      <td>${fmt(r.numberOfGuns)}</td>
      <td>${fmt(r.bagsPheasant)}</td>
      <td>${fmt(r.bagsPartridge)}</td>
      <td>${fmt(r.bagsGrouse)}</td>
      <td>${fmt(r.bagsDuck)}</td>
      <td>${fmt(r.bagsWoodcock)}</td>
      <td>${fmt(r.bagsOther)}</td>
      <td>${fmt(r.totalBag)}</td>
      <td>${fmt(r.gameDealer)}</td>
      <td>${r.incomeLeaseFee ? `£${parseFloat(String(r.incomeLeaseFee)).toFixed(2)}` : "—"}</td>
    </tr>`).join("");
    const totalIncome = records.reduce((s, r) => s + (parseFloat(String(r.incomeLeaseFee ?? 0)) || 0), 0);
    openPrintWindow(`<!DOCTYPE html><html><head><title>Shooting & Game Day Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}tfoot td{font-weight:700;border-top:2px solid #d1d5db}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Shooting &amp; Game Day Register</h1>
<h2>${records.length} shoot day${records.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Type</th><th>Organiser</th><th>Gamekeeper</th><th>Guns</th><th>Pheasant</th><th>Partridge</th><th>Grouse</th><th>Duck</th><th>Woodcock</th><th>Other</th><th>Total Bag</th><th>Game Dealer</th><th>Income</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="13">Total Income</td><td>£${totalIncome.toFixed(2)}</td></tr></tfoot>
</table>
</body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Shooting & Game Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printShootRegister, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => openAdd({ bagsPheasant: "0", bagsPartridge: "0", bagsGrouse: "0", bagsDuck: "0", bagsWoodcock: "0", bagsOther: "0", totalBag: "0" }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Shoot"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "shootDate", label: "Date", fmt: (r) => fmtDate(r.shootDate) }, { key: "shootType", label: "Type" }, { key: "organiser", label: "Organiser" }, { key: "numberOfGuns", label: "Guns" }, { key: "totalBag", label: "Total Bag" }, { key: "gameDealer", label: "Game Dealer" }, { key: "incomeLeaseFee", label: "Income (£)" }], rows: records, onView: setViewRecord, onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Shoot Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Shoot Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.shootDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Shoot Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.shootType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organiser" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.organiser) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Guns" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.numberOfGuns) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Gamekeeper Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.gamekeeperName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Game Dealer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.gameDealer) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Bag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.totalBag) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Income / Lease Fee (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.incomeLeaseFee) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 grid grid-cols-3 gap-2", children: [["bagsPheasant", "Pheasant"], ["bagsPartridge", "Partridge"], ["bagsGrouse", "Grouse"], ["bagsDuck", "Duck"], ["bagsWoodcock", "Woodcock"], ["bagsOther", "Other"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord[k]) })
        ] }, k)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Shoot Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shoot Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.shootDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, shootDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shoot Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.shootType ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, shootType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Driven Pheasant", "Rough Shoot", "Duck Flighting", "Walked-up", "Day Let", "Own Shoot"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organiser / Tenant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.organiser ?? ""), onChange: (e) => setForm((f) => ({ ...f, organiser: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Guns" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.numberOfGuns ?? ""), onChange: (e) => setForm((f) => ({ ...f, numberOfGuns: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gamekeeper Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.gamekeeperName ?? ""), onChange: (e) => setForm((f) => ({ ...f, gamekeeperName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Game Dealer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.gameDealer ?? ""), onChange: (e) => setForm((f) => ({ ...f, gameDealer: e.target.value })) })
        ] }),
        [["bagsPheasant", "Pheasant"], ["bagsPartridge", "Partridge"], ["bagsGrouse", "Grouse"], ["bagsDuck", "Duck"], ["bagsWoodcock", "Woodcock"], ["bagsOther", "Other"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: String(form[k] ?? "0"), onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) })
        ] }, k)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Bag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: String(form.totalBag ?? "0"), onChange: (e) => setForm((f) => ({ ...f, totalBag: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Income / Lease Fee (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.incomeLeaseFee ?? ""), onChange: (e) => setForm((f) => ({ ...f, incomeLeaseFee: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
const INCOME_TYPES = [
  "Farm Shop Sales",
  "Holiday Accommodation",
  "Livery / Equine",
  "Shoot Day / Let",
  "FIT / SEG Payment",
  "Event Hire",
  "Storage Let",
  "Tourism & Recreation",
  "Food Processing",
  "Other"
];
const VAT_RATES = [
  { value: "exempt", label: "Exempt" },
  { value: "zero", label: "Zero Rated (0%)" },
  { value: "reduced", label: "Reduced (5%)" },
  { value: "standard", label: "Standard (20%)" },
  { value: "outside_scope", label: "Outside Scope" }
];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function IncomeTab({ farmId }) {
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(null);
  const [selectedType, setSelectedType] = reactExports.useState(null);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: activities = [] } = useQuery({
    queryKey: ["div-activities", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/diversification-activities`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["div-income", farmId, year],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/diversification-income${year ? `?year=${year}` : ""}`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/diversification-income/${editing.id}`) : apiUrl(`farms/${farmId}/diversification-income`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["div-income", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/diversification-income/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["div-income", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ vatRate: "exempt", incomeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])));
    setOpen(true);
  }
  const fmtGbp = (v) => v ? `£${parseFloat(String(v)).toFixed(2)}` : "—";
  function printIncomeRegister() {
    const tableRows = records.map((r) => `<tr>
      <td>${fmtDate(r.incomeDate)}</td>
      <td>${fmt(r.incomeType)}</td>
      <td>${fmt(r.activityId)}</td>
      <td>${fmt(r.description)}</td>
      <td>${r.grossAmount ? `£${parseFloat(String(r.grossAmount)).toFixed(2)}` : "—"}</td>
      <td>${r.vatRate ? String(r.vatRate).replace(/_/g, " ") : "—"}</td>
      <td>${r.netAmount ? `£${parseFloat(String(r.netAmount)).toFixed(2)}` : "—"}</td>
      <td>${fmt(r.paymentMethod)}</td>
      <td>${fmt(r.reference)}</td>
    </tr>`).join("");
    const totalGross = records.reduce((s, r) => s + (parseFloat(String(r.grossAmount ?? 0)) || 0), 0);
    const totalNet = records.reduce((s, r) => s + (parseFloat(String(r.netAmount ?? 0)) || 0), 0);
    openPrintWindow(`<!DOCTYPE html><html><head><title>Diversification Income Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}tfoot td{font-weight:700;border-top:2px solid #d1d5db}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Diversification Income Register</h1>
<h2>${records.length} record${records.length !== 1 ? "s" : ""}${year ? ` · ${year}` : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Type</th><th>Activity</th><th>Description</th><th>Gross</th><th>VAT Rate</th><th>Net</th><th>Payment Method</th><th>Reference</th></tr></thead>
<tbody>${tableRows}</tbody>
<tfoot><tr><td colspan="4">Total</td><td>£${totalGross.toFixed(2)}</td><td></td><td>£${totalNet.toFixed(2)}</td><td colspan="2"></td></tr></tfoot>
</table>
</body></html>`);
  }
  const fmtGbpLong = (v) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const summary = reactExports.useMemo(() => {
    const totals = {};
    const counts = {};
    let grand = 0;
    for (const r of records) {
      const type = String(r.incomeType ?? "Other");
      const net = parseFloat(String(r.amountNet ?? "0")) || 0;
      totals[type] = (totals[type] ?? 0) + net;
      counts[type] = (counts[type] ?? 0) + 1;
      grand += net;
    }
    return { totals, counts, grand };
  }, [records]);
  const displayRecords = reactExports.useMemo(
    () => selectedType ? records.filter((r) => r.incomeType === selectedType) : records,
    [records, selectedType]
  );
  const drillDown = reactExports.useMemo(() => {
    if (!selectedType) return null;
    const filtered = records.filter((r) => r.incomeType === selectedType);
    const amounts = filtered.map((r) => parseFloat(String(r.amountNet ?? "0")) || 0);
    const total = amounts.reduce((a, b) => a + b, 0);
    const count = filtered.length;
    const avg = count ? total / count : 0;
    const largest = Math.max(...amounts, 0);
    const byMonth = {};
    for (const r of filtered) {
      const d = String(r.incomeDate ?? "");
      if (!d) continue;
      const key = d.slice(0, 7);
      const net = parseFloat(String(r.amountNet ?? "0")) || 0;
      byMonth[key] = { total: (byMonth[key]?.total ?? 0) + net, count: (byMonth[key]?.count ?? 0) + 1 };
    }
    const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => {
      const [yr, mo] = k.split("-");
      return { label: `${MONTH_NAMES[parseInt(mo, 10) - 1]} ${yr}`, ...v };
    });
    const byCustomer = {};
    for (const r of filtered) {
      const name = String(r.customerName ?? "Unknown");
      byCustomer[name] = (byCustomer[name] ?? 0) + (parseFloat(String(r.amountNet ?? "0")) || 0);
    }
    const customers = Object.entries(byCustomer).sort((a, b) => b[1] - a[1]);
    const maxBar = Math.max(...months.map((m) => m.total), 1);
    return { total, count, avg, largest, months, customers, maxBar };
  }, [records, selectedType]);
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Diversification Income" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "text-sm border rounded-md px-2 py-1.5 bg-background",
            value: year ?? "",
            onChange: (e) => {
              setYear(e.target.value ? parseInt(e.target.value) : null);
              setSelectedType(null);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Years" }),
              yearOptions.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
            ]
          }
        ),
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printIncomeRegister, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Income"
        ] })
      ] })
    ] }),
    summary.grand > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSelectedType(null),
          className: `col-span-2 sm:col-span-3 lg:col-span-4 p-4 rounded-xl border flex items-center justify-between transition-all text-left ${selectedType === null ? "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400" : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 text-emerald-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-emerald-900", children: [
                "Total Net Income ",
                year ? year : "— All Time"
              ] }),
              selectedType === null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium", children: "All sources" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-emerald-700", children: fmtGbpLong(summary.grand) })
          ]
        }
      ),
      Object.entries(summary.totals).sort((a, b) => b[1] - a[1]).map(([type, total]) => {
        const isActive = selectedType === type;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setSelectedType(isActive ? null : type),
            className: `p-3 rounded-lg border text-left transition-all ${isActive ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400 shadow-sm" : "bg-muted/30 hover:bg-muted/60 hover:border-blue-200"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs truncate font-medium ${isActive ? "text-blue-700" : "text-muted-foreground"}`, children: type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-bold text-sm mt-0.5 ${isActive ? "text-blue-900" : ""}`, children: fmtGbpLong(total) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-[10px] ${isActive ? "text-blue-600" : "text-muted-foreground"}`, children: [
                (total / summary.grand * 100).toFixed(1),
                "% · ",
                summary.counts[type],
                " transaction",
                summary.counts[type] !== 1 ? "s" : ""
              ] })
            ]
          },
          type
        );
      })
    ] }),
    drillDown && selectedType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-sm text-blue-900", children: [
          selectedType,
          " — Breakdown"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-xs text-blue-700 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            drillDown.count,
            " transactions"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Avg ",
            fmtGbp(drillDown.avg)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Largest ",
            fmtGbp(drillDown.largest)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-blue-800 mb-2", children: "Monthly Income" }),
          drillDown.months.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No monthly data" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: drillDown.months.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-16 shrink-0", children: m.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-4 bg-blue-100 rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full bg-blue-400 rounded transition-all",
                style: { width: `${m.total / drillDown.maxBar * 100}%` }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-blue-900 w-20 text-right shrink-0", children: fmtGbp(m.total) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground w-12 shrink-0", children: [
              "×",
              m.count
            ] })
          ] }, m.label)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-blue-800 mb-2", children: "By Customer / Payer" }),
          drillDown.customers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No customer data" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: drillDown.customers.map(([name, total], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 py-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-blue-400 w-4 shrink-0", children: [
                "#",
                i + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs truncate", children: name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-blue-900", children: fmtGbp(total) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground ml-1", children: [
                (total / drillDown.total * 100).toFixed(0),
                "%"
              ] })
            ] })
          ] }, name)) })
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      selectedType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-blue-700 font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Showing: ",
          selectedType
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedType(null), className: "text-xs text-muted-foreground hover:text-foreground underline", children: "Clear filter" })
      ] }),
      viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Income Record" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Income Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.incomeDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Income Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.incomeType) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Activity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.activityName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer / Payer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.customerName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtGbp(viewRecord.amountNet) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "VAT Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: VAT_RATES.find((v) => v.value === viewRecord.vatRate)?.label ?? String(viewRecord.vatRate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "VAT Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.vatAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Invoice / Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.invoiceRef) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.description) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          cols: [
            { key: "incomeDate", label: "Date", fmt: (r) => fmtDate(r.incomeDate) },
            { key: "activityName", label: "Activity" },
            ...!selectedType ? [{ key: "incomeType", label: "Type" }] : [],
            { key: "description", label: "Description" },
            { key: "customerName", label: "Customer" },
            { key: "amountNet", label: "Net Amount", fmt: (r) => fmtGbp(r.amountNet) },
            { key: "vatRate", label: "VAT", fmt: (r) => VAT_RATES.find((v) => v.value === r.vatRate)?.label ?? String(r.vatRate) },
            { key: "invoiceRef", label: "Invoice Ref" }
          ],
          rows: displayRecords,
          onView: setViewRecord,
          onEdit: (r) => openEdit(r),
          onDelete: (r) => del.mutate(r.id),
          deleteMutation: del
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Income Record" : "Add Income Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Income Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.incomeDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, incomeDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Income Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: INCOME_TYPES.filter((t) => t !== "Other").includes(String(form.incomeType ?? "")) ? String(form.incomeType) : form.incomeType ? "Other" : "", onValueChange: (v) => setForm((f) => ({ ...f, incomeType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INCOME_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          form.incomeType === "Other" || form.incomeType && !INCOME_TYPES.filter((t) => t !== "Other").includes(String(form.incomeType)) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.incomeType === "Other" ? "" : String(form.incomeType), onChange: (e) => setForm((f) => ({ ...f, incomeType: e.target.value || "Other" })), placeholder: "Please specify income type…" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.activityId ?? "__none__"), onValueChange: (v) => setForm((f) => ({ ...f, activityId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
              activities.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: String(a.activityName) }, String(a.id)))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer / Payer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.customerName ?? ""), onChange: (e) => setForm((f) => ({ ...f, customerName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Amount (£) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: String(form.amountNet ?? ""), onChange: (e) => setForm((f) => ({ ...f, amountNet: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.vatRate ?? "exempt"), onValueChange: (v) => setForm((f) => ({ ...f, vatRate: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: VAT_RATES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: String(form.vatAmount ?? ""), onChange: (e) => setForm((f) => ({ ...f, vatAmount: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice / Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.invoiceRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, invoiceRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.description ?? ""), onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.incomeDate || !form.incomeType || !form.amountNet, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
const DIV_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function DiversificationAnalyticsTab({ farmId }) {
  const { data: incomeRaw } = useQuery({ queryKey: ["div-income", farmId], queryFn: () => fetch(`/api/farms/${farmId}/diversification-income`, { credentials: "include" }).then((r) => r.json()) });
  const { data: activitiesRaw } = useQuery({ queryKey: ["div-activities", farmId], queryFn: () => fetch(`/api/farms/${farmId}/diversification-activities`, { credentials: "include" }).then((r) => r.json()) });
  const { data: hygieneRaw } = useQuery({ queryKey: ["hygiene-inspections", farmId], queryFn: () => fetch(`/api/farms/${farmId}/diversification-hygiene-inspections`, { credentials: "include" }).then((r) => r.json()) });
  const income = reactExports.useMemo(() => incomeRaw?.records ?? incomeRaw ?? [], [incomeRaw]);
  const activities = reactExports.useMemo(() => activitiesRaw?.records ?? activitiesRaw ?? [], [activitiesRaw]);
  const hygiene = reactExports.useMemo(() => hygieneRaw?.records ?? hygieneRaw ?? [], [hygieneRaw]);
  const totalIncome = reactExports.useMemo(() => income.reduce((s, r) => s + (Number(r.amount) || Number(r.value) || Number(r.revenue) || 0), 0), [income]);
  const incomeByCategory = reactExports.useMemo(() => {
    const map = {};
    income.forEach((r) => {
      const c = String(r.category || r.source || r.activityType || "Other");
      map[c] = (map[c] || 0) + (Number(r.amount) || Number(r.value) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 13) + "…" : name, value: +value.toFixed(2) }));
  }, [income]);
  const incomeByMonth = reactExports.useMemo(() => {
    const map = {};
    income.forEach((r) => {
      const d = String(r.date || r.incomeDate || "");
      const k = d.slice(0, 7);
      if (!k || k.length < 7) return;
      map[k] = (map[k] || 0) + (Number(r.amount) || Number(r.value) || 0);
    });
    return Object.entries(map).sort().slice(-12).map(([m, val]) => ({ month: m.slice(5), income: +val.toFixed(2) }));
  }, [income]);
  const hygienePassRate = reactExports.useMemo(() => {
    const passed = hygiene.filter((r) => r.result === "pass" || r.rating === 5 || Number(r.rating) >= 4 || r.passed === true).length;
    return hygiene.length ? Math.round(passed / hygiene.length * 100) : null;
  }, [hygiene]);
  const noData = income.length === 0 && activities.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add income or activity records to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Income Records", value: income.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "Total Revenue", value: `£${totalIncome.toLocaleString(void 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
      { label: "Activities", value: activities.length, bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
      { label: "Hygiene Pass Rate", value: hygienePassRate !== null ? `${hygienePassRate}%` : "—", bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      incomeByMonth.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Monthly Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: incomeByMonth, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, tickFormatter: (v) => `£${v}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${Number(v).toLocaleString()}`, "Revenue"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "income", fill: "#15803d", radius: [3, 3, 0, 0] })
        ] }) }) })
      ] }),
      incomeByCategory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Income Mix by Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: incomeByCategory, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: incomeByCategory.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: DIV_COLORS[i % DIV_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${Number(v).toLocaleString()}`, ""] })
        ] }) }) })
      ] })
    ] })
  ] });
}
function DiversificationPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "diversification", farmId, validIds: ["activities", "income", "shop", "hygiene", "equine", "shooting", "analytics"], defaultTab: "activities", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Farm Diversification", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "activities", onClick: () => setTab("activities"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutList, { className: "w-3.5 h-3.5 mr-1" }),
        "Activities"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "income", onClick: () => setTab("income"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-3.5 h-3.5 mr-1" }),
        "Income"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "shop", onClick: () => setTab("shop"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-3.5 h-3.5 mr-1" }),
        "Farm Shop"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "hygiene", onClick: () => setTab("hygiene"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-3.5 h-3.5 mr-1" }),
        "Hygiene"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "equine", onClick: () => setTab("equine"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PawPrint, { className: "w-3.5 h-3.5 mr-1" }),
        "Equine"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "shooting", onClick: () => setTab("shooting"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "w-3.5 h-3.5 mr-1" }),
        "Shooting"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 mr-1" }),
        "Analytics"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
      tab === "activities" && /* @__PURE__ */ jsxRuntimeExports.jsx(ActivitiesTab, { farmId }),
      tab === "income" && /* @__PURE__ */ jsxRuntimeExports.jsx(IncomeTab, { farmId }),
      tab === "shop" && /* @__PURE__ */ jsxRuntimeExports.jsx(FarmShopTab, { farmId }),
      tab === "hygiene" && /* @__PURE__ */ jsxRuntimeExports.jsx(HygieneInspectionsTab, { farmId }),
      tab === "equine" && /* @__PURE__ */ jsxRuntimeExports.jsx(EquineTab, { farmId }),
      tab === "shooting" && /* @__PURE__ */ jsxRuntimeExports.jsx(ShootingTab, { farmId }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(DiversificationAnalyticsTab, { farmId })
    ] }) })
  ] }) });
}
export {
  DiversificationPage as default
};
