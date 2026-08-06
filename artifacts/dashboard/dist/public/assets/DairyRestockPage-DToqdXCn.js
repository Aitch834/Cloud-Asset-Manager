import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, L as Label, I as Input, e as LoaderCircle, U as FlaskConical, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, N as DialogMutationError, J as DialogFooter } from "./index-CL7I2SfF.js";
import { A as AppLayout, j as Truck } from "./AppLayout-swjhJeIk.js";
import { B as Badge } from "./badge-xl1M8AUf.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C29E8xvM.js";
import { T as Textarea } from "./textarea-F9glM0Jr.js";
import { P as Package } from "./use-safe-clerk-VdTi7dYa.js";
import { T as TriangleAlert } from "./triangle-alert-gAXTnZz-.js";
import { C as CircleX } from "./circle-x-DRSW8IN7.js";
import { C as CircleCheck } from "./circle-check-O6Peh1Cq.js";
import { a as Clock } from "./database-BZBY5KTM.js";
import { S as ShoppingCart } from "./shopping-cart-B4aZzHpL.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-B9QM90sQ.js";
import { C as ChevronUp } from "./chevron-up-xjqksvvm.js";
import "./shield-alert-e7MkaN-1.js";
import "./shield-check-C2_xWcp4.js";
import "./tractor-DFDGZlbe.js";
import "./index-BIAhg7-a.js";
import "./index-Dr3FEjNy.js";
const BASE = "/dashboard/";
const api = (path) => `${BASE}api/${path}`;
const DAIRY_LABELS = {
  cattle: "Cattle Dairy",
  sheep: "Sheep Dairy",
  goat: "Goat Dairy",
  "organic-cattle": "Organic Cattle Dairy",
  "organic-sheep": "Organic Sheep Dairy",
  "organic-goat": "Organic Goat Dairy"
};
const URGENCY_META = {
  low: { label: "Low", className: "bg-gray-100 text-gray-700" },
  normal: { label: "Normal", className: "bg-blue-100 text-blue-700" },
  urgent: { label: "Urgent", className: "bg-amber-100 text-amber-800" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800" }
};
const STATUS_META = {
  pending: { label: "Pending", icon: Clock, className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", icon: CircleCheck, className: "bg-blue-100 text-blue-700" },
  ordered: { label: "Ordered", icon: Truck, className: "bg-purple-100 text-purple-700" },
  received: { label: "Received", icon: CircleCheck, className: "bg-green-100 text-green-800" },
  rejected: { label: "Cancelled", icon: CircleX, className: "bg-red-100 text-red-700" }
};
const UNIT_OPTIONS = ["items", "boxes", "litres", "kg", "drums", "pairs", "rolls", "sachets", "units"];
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const BLANK = {
  dairyType: "cattle",
  requestDate: today(),
  itemType: "ppe",
  ppeStockItemId: "",
  chemStockItemId: "",
  itemName: "",
  requestedQty: "",
  unit: "items",
  urgency: "normal",
  requestedBy: "",
  supplierName: "",
  reason: ""
};
function DairyRestockPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = reactExports.useState("pending");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(BLANK);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [orderDialog, setOrderDialog] = reactExports.useState(null);
  const [orderRef, setOrderRef] = reactExports.useState("");
  const [receiveDialog, setReceiveDialog] = reactExports.useState(null);
  const [receiveQty, setReceiveQty] = reactExports.useState("");
  const [receiveBy, setReceiveBy] = reactExports.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-restock", farmId, statusFilter],
    queryFn: () => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests?status=${statusFilter}`), {
      credentials: "include"
    }).then((r) => r.json()),
    enabled: !!farmId
  });
  const stockQ = useQuery({
    queryKey: ["dairy-supplies-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy-supplies/stock`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const ppeItems = stockQ.data?.ppeItems ?? [];
  const chemItems = stockQ.data?.chemItems ?? [];
  const staffQ = useQuery({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const staffNames = staffQ.data?.names ?? [];
  const suppliersQ = useQuery({
    queryKey: ["dairy-abr-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-suppliers`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const supplierNames = (Array.isArray(suppliersQ.data) ? suppliersQ.data : []).map((s) => s.companyName);
  const create = useMutation({
    mutationFn: (body) => {
      const ppeId = body.itemType === "ppe" && body.ppeStockItemId && body.ppeStockItemId !== "__freeform__" ? Number(body.ppeStockItemId) : void 0;
      const chemId = body.itemType === "chemical" && body.chemStockItemId && body.chemStockItemId !== "__freeform__" ? Number(body.chemStockItemId) : void 0;
      return fetch(api(`farms/${farmId}/dairy-supplies/restock-requests`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, ppeStockItemId: ppeId, chemStockItemId: chemId, requestedQty: Number(body.requestedQty) })
      }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      setForm(BLANK);
      setShowForm(false);
      toast({ title: "Request submitted" });
    },
    onError: () => toast({ title: "Failed to submit request", variant: "destructive" })
  });
  const patch = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests/${body.id}`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then((r) => {
      if (!r.ok) throw new Error("Failed");
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      toast({ title: "Request updated" });
    },
    onError: () => toast({ title: "Failed to update request", variant: "destructive" })
  });
  const markOrdered = useMutation({
    mutationFn: ({ id, supplierOrderRef }) => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests/${id}`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ordered", supplierOrderRef })
    }).then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      setOrderDialog(null);
      setOrderRef("");
      toast({ title: "Marked as ordered" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const markReceived = useMutation({
    mutationFn: ({ id, qtyReceived, receivedBy }) => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests/${id}`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "received", qtyReceived, receivedBy })
    }).then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-supplies-stock", farmId] });
      setReceiveDialog(null);
      setReceiveQty("");
      setReceiveBy("");
      toast({ title: "Stock updated — request marked received" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests/${id}`), {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      toast({ title: "Request deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const requests = data?.requests ?? [];
  const criticalCount = requests.filter((r) => r.urgency === "critical").length;
  const urgentCount = requests.filter((r) => r.urgency === "urgent").length;
  function field(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function handlePpeSelect(id) {
    const item = ppeItems.find((p) => String(p.id) === id);
    setForm((f) => ({
      ...f,
      ppeStockItemId: id,
      itemName: item ? [item.ppeType, item.description, item.size].filter(Boolean).join(" — ") : f.itemName,
      unit: "items"
    }));
  }
  function handleChemSelect(id) {
    const item = chemItems.find((c) => String(c.id) === id);
    setForm((f) => ({
      ...f,
      chemStockItemId: id,
      itemName: item ? item.productName : f.itemName,
      unit: item?.unit || "litres"
    }));
  }
  const showPpeManual = form.itemType === "ppe" && (form.ppeStockItemId === "__freeform__" || !form.ppeStockItemId);
  const showChemManual = form.itemType === "chemical" && (form.chemStockItemId === "__freeform__" || !form.chemStockItemId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "dr-staff-list", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "dr-supplier-list", children: supplierNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5 text-blue-600" }),
            "Dairy Supplies — Restock Requests"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Raise and track requests for PPE and chemical supply replenishment across your dairy operations." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowForm((s) => !s), className: "shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "New Request"
        ] })
      ] }),
      (criticalCount > 0 || urgentCount > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
        criticalCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
          criticalCount,
          " critical request",
          criticalCount > 1 ? "s" : "",
          " awaiting action"
        ] }),
        urgentCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
          urgentCount,
          " urgent request",
          urgentCount > 1 ? "s" : ""
        ] })
      ] }),
      showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-sm", children: "New Restock Request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Dairy type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.dairyType, onValueChange: (v) => field("dairyType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(DAIRY_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Request date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm", value: form.requestDate, onChange: (e) => field("requestDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Item type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.itemType, onValueChange: (v) => {
              setForm((f) => ({ ...f, itemType: v, ppeStockItemId: "", chemStockItemId: "", itemName: "", unit: v === "ppe" ? "items" : "litres" }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ppe", children: "PPE / Consumables" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chemical", children: "Chemical / Teat Dip" })
              ] })
            ] })
          ] }),
          form.itemType === "ppe" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2 sm:col-span-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "PPE item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ppeStockItemId, onValueChange: handlePpeSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from registered PPE stock…" }) }),
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
          form.itemType === "chemical" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2 sm:col-span-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Chemical" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.chemStockItemId, onValueChange: handleChemSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from registered chemicals…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__freeform__", children: "— Enter manually below —" }),
                chemItems.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                  c.productName,
                  c.currentQty != null ? ` · ${c.currentQty} ${c.unit || ""}` : ""
                ] }, c.id))
              ] })
            ] })
          ] }),
          (showPpeManual || showChemManual) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2 sm:col-span-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
              "Item name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", placeholder: "Exact item name / product", value: form.itemName, onChange: (e) => field("itemName", e.target.value) })
          ] }),
          !showPpeManual && !showChemManual && form.itemName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2 sm:col-span-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Item name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm bg-muted/60", value: form.itemName, onChange: (e) => field("itemName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Urgency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.urgency, onValueChange: (v) => field("urgency", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "normal", children: "Normal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgent", children: "Urgent — farm manager notified by SMS" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical — farm manager notified by SMS" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "h-8 text-sm", placeholder: "0", value: form.requestedQty, onChange: (e) => field("requestedQty", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.unit, onValueChange: (v) => field("unit", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: UNIT_OPTIONS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Requested by" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "dr-staff-list", className: "h-8 text-sm", placeholder: "Select or type name…", value: form.requestedBy, onChange: (e) => field("requestedBy", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
              "Preferred supplier ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "dr-supplier-list", className: "h-8 text-sm", placeholder: "Supplier name", value: form.supplierName, onChange: (e) => field("supplierName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2 sm:col-span-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reason / notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "text-sm", placeholder: "Why is this needed? Any additional context…", value: form.reason, onChange: (e) => field("reason", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setShowForm(false);
            setForm(BLANK);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              disabled: create.isPending || !form.itemName || !form.requestedQty || !form.unit,
              onClick: () => create.mutate(form),
              children: [
                create.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1 animate-spin" }),
                "Submit Request"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Status:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ordered", children: "Ordered" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Cancelled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          requests.length,
          " record",
          requests.length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-muted-foreground" }) }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground text-sm", children: [
        "No ",
        statusFilter === "all" ? "" : statusFilter,
        " restock requests."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Dairy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Item" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Urgency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-4 text-left", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: requests.map((r) => {
          const sm = STATUS_META[r.status] ?? STATUS_META.pending;
          const um = URGENCY_META[r.urgency] ?? URGENCY_META.normal;
          const expanded = expandedId === r.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-muted-foreground", children: fmt(r.requestDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-xs text-muted-foreground", children: DAIRY_LABELS[r.dairyType] ?? r.dairyType }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${r.itemType === "ppe" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`, children: [
                r.itemType === "ppe" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3" }),
                r.itemType === "ppe" ? "PPE" : "Chemical"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-4 font-medium max-w-[180px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate", title: r.itemName, children: r.itemName }),
                r.requestedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  "by ",
                  r.requestedBy
                ] }),
                r.supplierName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  "supplier: ",
                  r.supplierName
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 tabular-nums", children: r.status === "received" && r.qtyReceived ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: `Requested: ${r.requestedQty} ${r.unit}`, children: [
                r.qtyReceived,
                " ",
                r.unit,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(rcvd)" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                r.requestedQty,
                " ",
                r.unit
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: um.className, children: um.label }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sm.className}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(sm.icon, { className: "w-3 h-3" }),
                  sm.label
                ] }),
                r.supplierOrderRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  "ref: ",
                  r.supplierOrderRef
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap items-center", children: [
                r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-6 text-xs px-2",
                    onClick: () => {
                      setOrderDialog(r);
                      setOrderRef("");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3 h-3 mr-1" }),
                      "Mark Ordered"
                    ]
                  }
                ),
                r.status === "ordered" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-6 text-xs px-2 text-green-700 border-green-300",
                    onClick: () => {
                      setReceiveDialog(r);
                      setReceiveQty(r.requestedQty);
                      setReceiveBy("");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 mr-1" }),
                      "Mark Received"
                    ]
                  }
                ),
                (r.status === "pending" || r.status === "ordered") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-6 text-xs px-2 text-red-500",
                    onClick: () => patch.mutate({ id: r.id, status: "rejected" }),
                    children: "Cancel"
                  }
                ),
                r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-6 text-xs px-1.5 text-muted-foreground",
                    onClick: () => remove.mutate(r.id),
                    title: "Delete",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                  }
                ),
                (r.reason || r.adminNotes || r.receivedBy) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-6 text-xs px-1.5 text-muted-foreground",
                    onClick: () => setExpandedId(expanded ? null : r.id),
                    children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5" })
                  }
                )
              ] }) })
            ] }, r.id),
            expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 8, className: "px-4 py-3 text-sm space-y-1", children: [
              r.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-muted-foreground text-xs uppercase tracking-wide", children: "Reason: " }),
                r.reason
              ] }),
              r.adminNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-muted-foreground text-xs uppercase tracking-wide", children: "Notes: " }),
                r.adminNotes
              ] }),
              r.receivedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-muted-foreground text-xs uppercase tracking-wide", children: "Received by: " }),
                r.receivedBy
              ] }),
              r.resolvedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Resolved ",
                fmt(r.resolvedAt),
                r.resolvedBy ? ` by ${r.resolvedBy}` : ""
              ] })
            ] }) }, `${r.id}-detail`)
          ] });
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!orderDialog, onOpenChange: (o) => {
      if (!o) {
        setOrderDialog(null);
        setOrderRef("");
        markOrdered.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "28rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mark as Ordered" }) }),
      orderDialog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Confirm order placed for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: orderDialog.itemName }),
          " ",
          "(",
          orderDialog.requestedQty,
          " ",
          orderDialog.unit,
          ")",
          orderDialog.supplierName ? ` from ${orderDialog.supplierName}` : "",
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
            "Order / PO reference ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", placeholder: "e.g. PO-2024-0123 or supplier order ref", value: orderRef, onChange: (e) => setOrderRef(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: markOrdered, message: "Failed to update — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOrderDialog(null);
          setOrderRef("");
          markOrdered.reset();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: markOrdered.isPending, onClick: () => orderDialog && markOrdered.mutate({ id: orderDialog.id, supplierOrderRef: orderRef }), children: markOrdered.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Confirm Ordered" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!receiveDialog, onOpenChange: (o) => {
      if (!o) {
        setReceiveDialog(null);
        setReceiveQty("");
        setReceiveBy("");
        markReceived.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "28rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Confirm Receipt" }) }),
      receiveDialog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Confirm delivery received for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: receiveDialog.itemName }),
          ".",
          (receiveDialog.ppeStockItemId || receiveDialog.chemStockItemId) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block mt-1 text-green-700", children: "Stock levels will be updated automatically." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
              "Quantity actually received ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", className: "h-8 text-sm", value: receiveQty, onChange: (e) => setReceiveQty(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm bg-muted/60", value: receiveDialog.unit, readOnly: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Received by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "dr-staff-list", className: "h-8 text-sm", placeholder: "Select or type name…", value: receiveBy, onChange: (e) => setReceiveBy(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: markReceived, message: "Failed to update — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setReceiveDialog(null);
          setReceiveQty("");
          setReceiveBy("");
          markReceived.reset();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: markReceived.isPending || !receiveQty,
            onClick: () => receiveDialog && markReceived.mutate({ id: receiveDialog.id, qtyReceived: Number(receiveQty), receivedBy: receiveBy }),
            children: markReceived.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Confirm Received"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  DairyRestockPage as default
};
