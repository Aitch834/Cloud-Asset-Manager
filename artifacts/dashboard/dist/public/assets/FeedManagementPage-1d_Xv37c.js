import { r as reactExports, b as useAppStore, a as useToast, t as useQueryClient, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, M as MapPin, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, H as DialogDescription } from "./index-R4XICohc.js";
import { A as AppLayout, I as Info, j as Truck } from "./AppLayout-p836YkSR.js";
import { T as TabBar, a as TabButton } from "./tab-button-C_p-Tjj3.js";
import { T as Textarea } from "./textarea-COanlBw4.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-8zr33rK0.js";
import { R as RecordAttachments } from "./RecordAttachments-BScDrQTS.js";
import { B as Badge } from "./badge-B-nhOm9J.js";
import { S as StaffSelect } from "./staff-select-6e2Jznve.js";
import { T as TriangleAlert } from "./triangle-alert-DoYQtXrW.js";
import { C as CircleX } from "./circle-x-BOOcMqaN.js";
import { P as Package } from "./use-safe-clerk-9Diu1NTz.js";
import { C as CircleCheck } from "./circle-check-6m9i0MuK.js";
import { C as CircleAlert, a as Clock } from "./database-Dj8SDLcA.js";
import { G as GitBranch } from "./git-branch-wdJBXWfg.js";
import { S as ShoppingCart } from "./shopping-cart-BAi4fEs9.js";
import { S as ShieldCheck } from "./shield-check-CjTpMlqB.js";
import { P as Pen } from "./pen-DPuDRmCv.js";
import { T as Trash2 } from "./trash-2-CW0p5gY-.js";
import { S as Search } from "./search-BZ_TeQF1.js";
import { a as ArrowDown, A as ArrowUp } from "./arrow-up-BKt2v6ky.js";
import { E as Eye } from "./eye-B_nB7cVZ.js";
import "./shield-alert-DLMzHCQQ.js";
import "./tractor-DsJv_0QH.js";
import "./index-BTvjRpbJ.js";
import "./index-DYWzTIYo.js";
import "./chevron-up-BUruL3pK.js";
import "./use-upload-D3wwqzeM.js";
import "./paperclip-BR1m5H2-.js";
import "./upload-DMph6Doi.js";
import "./image-S631RKhq.js";
import "./download-D4TX3UqA.js";
const FEED_TYPES = [
  { value: "compound_pellets", label: "Compound Pellets / Nuts" },
  { value: "compound_meal", label: "Compound Meal" },
  { value: "straights", label: "Straights (e.g. Soya, Maize, Barley)" },
  { value: "mineral_supplement", label: "Mineral / Vitamin Supplement" },
  { value: "mineral_bucket", label: "Mineral / Lick Bucket" },
  { value: "silage", label: "Silage / Wholecrop" },
  { value: "hay_straw", label: "Hay / Straw" },
  { value: "tmr", label: "TMR / Mixed Ration" },
  { value: "creep_feed", label: "Creep Feed" },
  { value: "medicated_feed", label: "Medicated Feed" },
  { value: "liquid_feed", label: "Liquid Feed / Molasses" },
  { value: "other", label: "Other" }
];
const SPECIES = ["cattle", "sheep", "pigs", "poultry", "horses", "mixed", "other"];
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function fmtKg(v) {
  if (v === null || v === void 0 || v === "") return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return `${n.toLocaleString("en-GB")} kg`;
}
function fmtCost(p) {
  if (!p) return "—";
  return `£${(p / 100).toFixed(2)}`;
}
function getStockStatus(s) {
  if (s.awaitingDelivery) return "awaiting";
  const current = parseFloat(String(s.currentStockKg ?? 0));
  if (current <= 0) return "out";
  const reorder = s.reorderThresholdKg ? parseFloat(String(s.reorderThresholdKg)) : null;
  if (reorder !== null && current <= reorder) return "low";
  return "ok";
}
function StatusBadge({ status }) {
  if (status === "ok") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dcfce7", color: "#166534", border: "none" }, children: "In Stock" });
  if (status === "low") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fed7aa", color: "#9a3412", border: "none" }, children: "Low Stock" });
  if (status === "out") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Out of Stock" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dbeafe", color: "#1e40af", border: "none" }, children: "Awaiting Delivery" });
}
function UfasBadge({ number }) {
  if (!number) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "No UFAS on note" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#d1fae5", color: "#065f46", border: "none" }, children: [
    "UFAS: ",
    number
  ] });
}
function MedicatedBadge({ medicated }) {
  if (!medicated) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Medicated" });
}
function StockBar({ current, reorder, capacity }) {
  const max = capacity ?? (reorder ? reorder * 4 : current * 1.5 || 1e3);
  const pct = Math.min(100, current / max * 100);
  const isLow = reorder !== null && current <= reorder;
  const isOut = current <= 0;
  const barColor = isOut ? "#ef4444" : isLow ? "#f97316" : "#22c55e";
  const reorderPct = reorder ? Math.min(100, reorder / max * 100) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-500 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtKg(current) }),
      capacity && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
        "Capacity: ",
        fmtKg(capacity)
      ] }),
      !capacity && reorder && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
        "Reorder at ",
        fmtKg(reorder)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-gray-100 rounded-full h-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full transition-all", style: { width: `${pct}%`, background: barColor } }),
      reorderPct !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 h-2 w-0.5 bg-orange-400", style: { left: `${reorderPct}%` }, title: "Reorder level" })
    ] }),
    reorder !== null && capacity !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 mt-0.5", children: [
      "Reorder at ",
      fmtKg(reorder)
    ] })
  ] });
}
function FeedManagementPage() {
  const [tab, setTab] = reactExports.useState(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab");
    const valid = ["stock", "deliveries", "trace", "orders"];
    return t && valid.includes(t) ? t : "stock";
  });
  const [stockFilter, setStockFilter] = reactExports.useState("all");
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const deliveriesQ = useQuery({
    queryKey: ["feed-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-deliveries`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const stockQ = useQuery({
    queryKey: ["feed-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const purchaseOrdersQ = useQuery({
    queryKey: ["purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const feedFpoQ = useQuery({
    queryKey: ["feed-purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-purchase-orders`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const membersQ = useQuery({
    queryKey: ["members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()).then((d) => d.members ?? []),
    enabled: !!farmId
  });
  const staffNames = (membersQ.data ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["feed-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-stock", farmId] });
    qc.invalidateQueries({ queryKey: ["purchase-orders", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-purchase-orders", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] });
  };
  const [showFpoDialog, setShowFpoDialog] = reactExports.useState(false);
  const [editFpo, setEditFpo] = reactExports.useState(null);
  const [fpoForm, setFpoForm] = reactExports.useState({});
  const [fpoFilter, setFpoFilter] = reactExports.useState("active");
  const [receiveId, setReceiveId] = reactExports.useState(null);
  const [receiveDate, setReceiveDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().substring(0, 10));
  function openFpoAdd() {
    setEditFpo(null);
    setFpoForm({
      supplierName: "",
      productName: "",
      feedType: "compound_pellets",
      speciesIntended: "__none__",
      quantityKg: "",
      orderDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10),
      expectedDeliveryDate: "",
      status: "sent",
      orderedBy: "",
      notes: ""
    });
    setShowFpoDialog(true);
  }
  function openFpoEdit(fpo) {
    setEditFpo(fpo);
    setFpoForm({
      supplierName: String(fpo.supplierName ?? ""),
      productName: String(fpo.productName ?? ""),
      feedType: String(fpo.feedType ?? "compound_pellets"),
      speciesIntended: String(fpo.speciesIntended ?? "__none__"),
      quantityKg: String(fpo.quantityKg ?? ""),
      orderDate: fpo.orderDate ? String(fpo.orderDate).substring(0, 10) : "",
      expectedDeliveryDate: fpo.expectedDeliveryDate ? String(fpo.expectedDeliveryDate).substring(0, 10) : "",
      status: String(fpo.status ?? "sent"),
      orderedBy: String(fpo.orderedBy ?? ""),
      notes: String(fpo.notes ?? "")
    });
    setShowFpoDialog(true);
  }
  const fpoMut = useMutation({
    mutationFn: async (data) => {
      const url = editFpo ? `/api/farms/${farmId}/feed-purchase-orders/${editFpo.id}` : `/api/farms/${farmId}/feed-purchase-orders`;
      const res = await fetch(url, { method: editFpo ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowFpoDialog(false);
      toast({ title: editFpo ? "Order updated" : "Feed order raised" });
    },
    onError: () => toast({ title: "Error saving order", variant: "destructive" })
  });
  const deleteFpoMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/feed-purchase-orders/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Order removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const receiveFpoMut = useMutation({
    mutationFn: ({ id, date }) => fetch(`/api/farms/${farmId}/feed-purchase-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "received", actualDeliveryDate: date })
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      setReceiveId(null);
      toast({ title: "Order marked as received — remember to log the delivery receipt in the Delivery Records tab." });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const [traceBinId, setTraceBinId] = reactExports.useState(null);
  const traceQ = useQuery({
    queryKey: ["feed-bin-trace", farmId, traceBinId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock/${traceBinId}/trace`).then((r) => r.json()),
    enabled: !!farmId && !!traceBinId
  });
  const [batchSearch, setBatchSearch] = reactExports.useState("");
  const [batchQuery, setBatchQuery] = reactExports.useState("");
  const batchTraceQ = useQuery({
    queryKey: ["feed-batch-trace", farmId, batchQuery],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-batch-trace?batch=${encodeURIComponent(batchQuery)}`).then((r) => r.json()),
    enabled: !!farmId && batchQuery.length >= 2
  });
  const [showDeliveryDialog, setShowDeliveryDialog] = reactExports.useState(false);
  const [editDelivery, setEditDelivery] = reactExports.useState(null);
  const [deliveryForm, setDeliveryForm] = reactExports.useState({});
  function openDeliveryAdd() {
    setEditDelivery(null);
    setDeliveryForm({ feedType: "compound_pellets", medicatedFeed: "false", deliveryDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) });
    setShowDeliveryDialog(true);
  }
  function openDeliveryEdit(d) {
    setEditDelivery(d);
    setDeliveryForm({
      deliveryDate: d.deliveryDate ? String(d.deliveryDate).substring(0, 10) : "",
      supplierId: String(d.supplierId ?? ""),
      supplierName: String(d.supplierName ?? ""),
      ufasNumberOnNote: String(d.ufasNumberOnNote ?? ""),
      femasNumberOnNote: String(d.femasNumberOnNote ?? ""),
      deliveryNoteNumber: String(d.deliveryNoteNumber ?? ""),
      invoiceReference: String(d.invoiceReference ?? ""),
      feedType: String(d.feedType ?? "compound_pellets"),
      productName: String(d.productName ?? ""),
      batchNumber: String(d.batchNumber ?? ""),
      lotNumber: String(d.lotNumber ?? ""),
      quantityKg: String(d.quantityKg ?? ""),
      costPence: d.costPence ? String(Math.round(Number(d.costPence) / 100)) : "",
      storageLocation: String(d.storageLocation ?? ""),
      bestBeforeDate: d.bestBeforeDate ? String(d.bestBeforeDate).substring(0, 10) : "",
      medicatedFeed: d.medicatedFeed ? "true" : "false",
      medicationDetails: String(d.medicationDetails ?? ""),
      withdrawalPeriodDays: String(d.withdrawalPeriodDays ?? ""),
      speciesIntended: String(d.speciesIntended ?? ""),
      receivedBy: String(d.receivedBy ?? ""),
      notes: String(d.notes ?? ""),
      isOrganicApproved: d.isOrganicApproved ? "true" : "false",
      organicSupplierApprovalNumber: String(d.organicSupplierApprovalNumber ?? ""),
      organicPercentage: String(d.organicPercentage ?? ""),
      nonOrganicIngredientDerogation: String(d.nonOrganicIngredientDerogation ?? "")
    });
    setShowDeliveryDialog(true);
  }
  const deliveryMut = useMutation({
    mutationFn: async (data) => {
      const url = editDelivery ? `/api/farms/${farmId}/feed-deliveries/${editDelivery.id}` : `/api/farms/${farmId}/feed-deliveries`;
      const res = await fetch(url, { method: editDelivery ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowDeliveryDialog(false);
      toast({ title: editDelivery ? "Delivery updated" : "Delivery recorded" });
    },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" })
  });
  const delDeliveryMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/feed-deliveries/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Delivery removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [showStockDialog, setShowStockDialog] = reactExports.useState(false);
  const [editStock, setEditStock] = reactExports.useState(null);
  const [stockForm, setStockForm] = reactExports.useState({});
  const [stockAdjustment, setStockAdjustment] = reactExports.useState("");
  const [stockAdjustReason, setStockAdjustReason] = reactExports.useState("");
  function openStockAdd() {
    setEditStock(null);
    setStockAdjustment("");
    setStockAdjustReason("");
    setStockForm({ feedType: "compound_pellets", currentStockKg: "0", awaitingDelivery: "false" });
    setShowStockDialog(true);
  }
  function openStockEdit(s) {
    setEditStock(s);
    setStockAdjustment("");
    setStockAdjustReason("");
    setStockForm({
      feedType: String(s.feedType ?? "compound_pellets"),
      productName: String(s.productName ?? ""),
      storageLocation: String(s.storageLocation ?? ""),
      currentStockKg: String(s.currentStockKg ?? "0"),
      capacityKg: String(s.capacityKg ?? ""),
      reorderThresholdKg: String(s.reorderThresholdKg ?? ""),
      speciesIntended: String(s.speciesIntended ?? ""),
      supplierName: String(s.supplierName ?? ""),
      awaitingDelivery: s.awaitingDelivery ? "true" : "false",
      expectedDeliveryDate: s.expectedDeliveryDate ? String(s.expectedDeliveryDate).substring(0, 10) : "",
      notes: String(s.notes ?? "")
    });
    setShowStockDialog(true);
  }
  const stockMut = useMutation({
    mutationFn: async (data) => {
      const url = editStock ? `/api/farms/${farmId}/feed-stock/${editStock.id}` : `/api/farms/${farmId}/feed-stock`;
      const res = await fetch(url, { method: editStock ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowStockDialog(false);
      toast({ title: editStock ? "Feed bin updated" : "Feed bin registered" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const delStockMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/feed-stock/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      toast({ title: "Bin removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [highlightBinId, setHighlightBinId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const binParam = params.get("bin");
    if (binParam) {
      const id = parseInt(binParam, 10);
      if (!isNaN(id)) {
        setHighlightBinId(id);
        setTab("stock");
        setTimeout(() => {
          const el = document.querySelector(`[data-bin-id="${id}"]`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 400);
        setTimeout(() => setHighlightBinId(null), 4e3);
      }
    }
  }, []);
  const [reorderBin, setReorderBin] = reactExports.useState(null);
  const [reorderDate, setReorderDate] = reactExports.useState("");
  const [reorderNotes, setReorderNotes] = reactExports.useState("");
  const [reorderMemberId, setReorderMemberId] = reactExports.useState("__none__");
  const [reorderDueDate, setReorderDueDate] = reactExports.useState("");
  const [reorderAssignNote, setReorderAssignNote] = reactExports.useState("");
  const reorderMut = useMutation({
    mutationFn: async ({ id, expectedDeliveryDate, notes, memberId, dueDate, assignNote, binName, supplierName }) => {
      const binRes = await fetch(`/api/farms/${farmId}/feed-stock/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awaitingDelivery: true, expectedDeliveryDate: expectedDeliveryDate || null, notes: notes || null })
      });
      if (!binRes.ok) throw new Error("Failed to update bin");
      let taskResult = null;
      if (memberId && memberId !== "__none__") {
        const duePart = expectedDeliveryDate ? ` Delivery expected by ${expectedDeliveryDate}.` : "";
        const supplierPart = supplierName ? ` Supplier: ${supplierName}.` : "";
        const taskRes = await fetch(`/api/farms/${farmId}/task-assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignedToMemberId: Number(memberId),
            taskType: "feed_reorder",
            title: `Feed Reorder — ${binName}`,
            description: `A reorder has been raised for the feed bin: ${binName}.${supplierPart}${duePart} Please confirm the order has been placed and update the bin once the delivery is received.`,
            dueDate: dueDate || null,
            module: "Feed Management",
            href: `/feed?bin=${id}`,
            assignmentNote: assignNote || null
          })
        });
        if (taskRes.ok) taskResult = await taskRes.json();
      }
      return taskResult;
    },
    onSuccess: (taskResult) => {
      invalidate();
      setReorderBin(null);
      if (taskResult) {
        const smsMsg = taskResult.smsSent ? " SMS notification sent to staff member." : taskResult.smsReason === "no_phone" ? " Staff member has no phone number — no SMS sent." : "";
        toast({ title: `Reorder raised & task assigned.${smsMsg}` });
      } else {
        toast({ title: "Reorder raised — bin status updated to Awaiting Delivery" });
      }
    },
    onError: () => toast({ title: "Error raising reorder", variant: "destructive" })
  });
  const deliveries = deliveriesQ.data ?? [];
  const stock = stockQ.data ?? [];
  const feedSuppliers = suppliersQ.data ?? [];
  const suppliers = feedSuppliers.filter((s) => s.supplierType === "feed" || s.category === "Feed & Nutrition");
  const knownLocations = Array.from(/* @__PURE__ */ new Set([
    ...stock.map((s) => String(s.storageLocation ?? "")).filter(Boolean),
    ...deliveries.map((d) => String(d.storageLocation ?? "")).filter(Boolean)
  ])).sort();
  const knownProducts = Array.from(/* @__PURE__ */ new Set([
    ...stock.map((s) => String(s.productName ?? "")).filter(Boolean),
    ...deliveries.map((d) => String(d.productName ?? "")).filter(Boolean)
  ])).sort();
  const medicatedDeliveries = deliveries.filter((d) => d.medicatedFeed);
  const noUfasDeliveries = deliveries.filter((d) => !d.ufasNumberOnNote);
  const stockWithStatus = stock.map((s) => ({ ...s, _status: getStockStatus(s) }));
  const countOk = stockWithStatus.filter((s) => s._status === "ok").length;
  const countLow = stockWithStatus.filter((s) => s._status === "low").length;
  const countOut = stockWithStatus.filter((s) => s._status === "out").length;
  const countAwaiting = stockWithStatus.filter((s) => s._status === "awaiting").length;
  const filteredStock = stockFilter === "all" ? stockWithStatus : stockWithStatus.filter((s) => s._status === stockFilter);
  const fpos = feedFpoQ.data ?? [];
  const today = (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
  const INACTIVE_FPO_STATUSES = ["received", "cancelled"];
  const activeFpos = fpos.filter((o) => !INACTIVE_FPO_STATUSES.includes(String(o.status)));
  const overdueFpos = activeFpos.filter((o) => o.expectedDeliveryDate && String(o.expectedDeliveryDate).substring(0, 10) < today);
  const filteredFpos = fpoFilter === "active" ? activeFpos : fpos;
  const locations = Array.from(new Set(filteredStock.map((s) => String(s.storageLocation || "")))).sort();
  const stockByLocation = {};
  for (const loc of locations) {
    stockByLocation[loc] = filteredStock.filter((s) => String(s.storageLocation || "") === loc);
  }
  const feedTypeLabel = (v) => FEED_TYPES.find((ft) => ft.value === v)?.label ?? v;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Feed Management", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Feed goods-received records with full UFAS/FEMAS traceability — required for Red Tractor, APHA and cross-compliance audits" }),
      noUfasDeliveries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            noUfasDeliveries.length,
            " deliver",
            noUfasDeliveries.length > 1 ? "ies" : "y",
            " without a UFAS/FEMAS number recorded."
          ] }),
          " Red Tractor and APHA require the supplier approval number from the delivery note to be on your records."
        ] })
      ] }),
      medicatedDeliveries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-red-600 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            medicatedDeliveries.length,
            " medicated feed deliver",
            medicatedDeliveries.length > 1 ? "ies" : "y",
            " on record."
          ] }),
          " Ensure withdrawal periods are recorded and observed before slaughter or sale of treated animals."
        ] })
      ] }),
      countOut > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-600 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            countOut,
            " feed",
            countOut > 1 ? "s" : "",
            " out of stock."
          ] }),
          " Check whether animals are affected and arrange deliveries urgently."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Feeds tracked" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-800", children: stock.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            locations.length,
            " location",
            locations.length !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-green-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "In stock" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-700", children: countOk }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "feeds" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 ${countLow > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-orange-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Low stock" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-orange-600", children: countLow }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "below reorder level" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 ${countOut > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Out of stock" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-red-600", children: countOut }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "feeds" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 ${countAwaiting > 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-4 h-4 text-blue-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Awaiting delivery" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-blue-600", children: countAwaiting }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "orders placed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "stock", onClick: () => setTab("stock"), children: [
          "Feed Bins (",
          stock.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "deliveries", onClick: () => setTab("deliveries"), children: [
          "Delivery Records / GRN (",
          deliveries.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "trace", onClick: () => setTab("trace"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "w-3.5 h-3.5 mr-1 inline" }),
          "Batch Trace"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "orders", onClick: () => setTab("orders"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3.5 h-3.5 mr-1 inline" }),
          "Feed Orders",
          overdueFpos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 min-w-[1.25rem]", children: overdueFpos.length }),
          overdueFpos.length === 0 && activeFpos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 min-w-[1.25rem]", children: activeFpos.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "medicated", onClick: () => setTab("medicated"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 mr-1 inline" }),
          "Medicated Feed"
        ] })
      ] }),
      tab === "stock" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Registered Feed Bins" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Each entry is a physical storage bin or location on your farm. Stock levels update automatically when deliveries are recorded and feed usage is logged." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openStockAdd, className: "bg-green-800 hover:bg-green-900 text-white shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Register Feed Bin"
          ] })
        ] }),
        stock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap mb-5", children: ["all", "low", "out", "awaiting"].map((f) => {
          const labels = { all: `All (${stock.length})`, low: `Low Stock (${countLow})`, out: `Out of Stock (${countOut})`, awaiting: `Awaiting Delivery (${countAwaiting})` };
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setStockFilter(f),
              className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${stockFilter === f ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-600 border-gray-300 hover:border-green-700 hover:text-green-700"}`,
              children: labels[f]
            },
            f
          );
        }) }),
        stock.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No feed bins registered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Register a bin for each feed type and storage location you hold on farm. Deliveries and feed usage records will then update its stock level automatically." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openStockAdd, className: "mt-4 bg-green-800 hover:bg-green-900 text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Register Feed Bin"
          ] })
        ] }) : filteredStock.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No feeds match this filter" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: locations.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-600 uppercase tracking-wide", children: loc || "No location specified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-gray-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              stockByLocation[loc].length,
              " feed",
              stockByLocation[loc].length !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: stockByLocation[loc].map((s) => {
            const status = s._status;
            const current = parseFloat(String(s.currentStockKg ?? 0));
            const reorder = s.reorderThresholdKg ? parseFloat(String(s.reorderThresholdKg)) : null;
            const capacity = s.capacityKg ? parseFloat(String(s.capacityKg)) : null;
            const cardBg = status === "out" ? "bg-red-50 border-red-200" : status === "low" ? "bg-orange-50 border-orange-200" : status === "awaiting" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200";
            const isHighlighted = highlightBinId === Number(s.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-bin-id": String(s.id),
                className: `rounded-xl border p-4 transition-all duration-500 ${cardBg}${isHighlighted ? " ring-2 ring-orange-400 ring-offset-2" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900 leading-tight", children: String(s.productName || feedTypeLabel(String(s.feedType ?? ""))) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
                        feedTypeLabel(String(s.feedType ?? "")),
                        s.speciesIntended ? ` — ${s.speciesIntended}` : ""
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setTraceBinId(Number(s.id)), className: "h-7 px-2 text-blue-600", title: "View traceability ledger", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "w-3 h-3" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openStockEdit(s), className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delStockMut.mutate(Number(s.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800 mt-2", children: fmtKg(s.currentStockKg) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StockBar, { current, reorder, capacity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500", children: [
                    !!s.supplierName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-3 h-3" }),
                      "Supplier: ",
                      String(s.supplierName)
                    ] }),
                    !!s.awaitingDelivery && !!s.expectedDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-blue-600 font-medium", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                      "Delivery expected ",
                      fmtDate(String(s.expectedDeliveryDate))
                    ] }),
                    !!s.awaitingDelivery && !s.expectedDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-blue-600", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-3 h-3" }),
                      "Order placed — delivery date TBC"
                    ] })
                  ] }),
                  !!s.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2 italic", children: String(s.notes) }),
                  !s.awaitingDelivery && (status === "low" || status === "out") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 pt-3 border-t border-current border-opacity-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      className: "h-7 text-xs gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50",
                      onClick: () => {
                        setReorderBin(s);
                        setReorderDate("");
                        setReorderNotes("");
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3 h-3" }),
                        "Raise Reorder"
                      ]
                    }
                  ) })
                ]
              },
              String(s.id)
            );
          }) })
        ] }, loc)) })
      ] }),
      tab === "deliveries" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Feed Delivery Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Record every delivery with UFAS/FEMAS number from the delivery note — batch traceability for Red Tractor and APHA audits" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openDeliveryAdd, className: "bg-green-800 hover:bg-green-900 text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Record Delivery"
          ] })
        ] }),
        deliveries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No feed deliveries recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Record your first delivery to build traceability" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: deliveries.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: String(d.productName || feedTypeLabel(String(d.feedType ?? "other"))) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#eff6ff", color: "#1d4ed8", border: "none" }, children: feedTypeLabel(String(d.feedType ?? "")) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MedicatedBadge, { medicated: d.medicatedFeed })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700", children: String(d.supplierName ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UfasBadge, { number: d.ufasNumberOnNote }),
                !!d.femasNumberOnNote && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#ede9fe", color: "#5b21b6", border: "none" }, children: [
                  "FEMAS: ",
                  d.femasNumberOnNote
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-green-700", children: fmtKg(d.quantityKg) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: fmtCost(d.costPence) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openDeliveryEdit(d), className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delDeliveryMut.mutate(Number(d.id)), className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Date:" }),
              " ",
              fmtDate(String(d.deliveryDate ?? ""))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "DN:" }),
              " ",
              String(d.deliveryNoteNumber ?? "—")
            ] }),
            !!d.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Batch:" }),
              " ",
              String(d.batchNumber)
            ] }),
            !!d.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Lot:" }),
              " ",
              String(d.lotNumber)
            ] }),
            !!d.storageLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Stored:" }),
              " ",
              String(d.storageLocation)
            ] }),
            !!d.bestBeforeDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Best before:" }),
              " ",
              fmtDate(String(d.bestBeforeDate))
            ] }),
            !!d.speciesIntended && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "For:" }),
              " ",
              String(d.speciesIntended)
            ] }),
            !!d.receivedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Received by:" }),
              " ",
              String(d.receivedBy)
            ] }),
            !!d.medicatedFeed && !!d.withdrawalPeriodDays && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 font-medium col-span-2", children: [
              "Withdrawal period: ",
              String(d.withdrawalPeriodDays),
              " days"
            ] }),
            !!d.isOrganicApproved && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700 font-medium col-span-2", children: [
              "🌿 Organic Approved",
              d.organicPercentage ? ` — ${String(d.organicPercentage)}% organic` : ""
            ] })
          ] }),
          !!d.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2 italic", children: String(d.notes) }),
          !!d.medicationDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700 mt-1 font-medium", children: [
            "Medication: ",
            String(d.medicationDetails)
          ] })
        ] }, String(d.id))) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDeliveryDialog, onOpenChange: setShowDeliveryDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editDelivery ? "Edit Delivery" : "Record Feed Delivery" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-800 text-xs font-semibold", children: "Link to Feed Stock Bin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryForm.feedStockItemId ?? "__none__", onValueChange: (v) => {
              const id = v === "__none__" ? "" : v;
              if (id) {
                const bin = (stockQ.data ?? []).find((s) => String(s.id) === id);
                if (bin) setDeliveryForm((f) => ({ ...f, feedStockItemId: id, feedType: String(bin.feedType ?? f.feedType), productName: String(bin.productName ?? f.productName ?? ""), storageLocation: String(bin.storageLocation ?? f.storageLocation ?? "") }));
                else setDeliveryForm((f) => ({ ...f, feedStockItemId: id }));
              } else setDeliveryForm((f) => ({ ...f, feedStockItemId: "" }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Optional — auto-updates stock levels" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked" }),
                (stockQ.data ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                  String(s.productName || s.feedType),
                  " — ",
                  String(s.storageLocation || "no location")
                ] }, String(s.id)))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mt-1", children: "Stock level auto-updates on save" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-800 text-xs font-semibold", children: "Link to Purchase Order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryForm.poId ?? "__none__", onValueChange: (v) => setDeliveryForm((f) => ({ ...f, poId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Optional — closes PO receipt" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked to a PO" }),
                (purchaseOrdersQ.data ?? []).filter((po) => !["cancelled", "fully_received"].includes(String(po.status))).map((po) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(po.id), children: [
                  String(po.poNumber),
                  " — ",
                  String(po.supplierName || "No supplier")
                ] }, String(po.id)))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mt-1", children: "Marks PO as received on save" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deliveryForm.deliveryDate ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, deliveryDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryForm.feedType ?? "compound_pellets", onValueChange: (v) => setDeliveryForm((f) => ({ ...f, feedType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEED_TYPES.map((ft) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ft.value, children: ft.label }, ft.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.productName ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, productName: e.target.value })), placeholder: "e.g. Beef Finisher 18% Nuts" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800 mb-2", children: "Supplier & Traceability — required for compliance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.supplierName ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "Supplier name" }) }),
              suppliers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: (v) => {
                const sup = feedSuppliers.find((s) => String(s.id) === v);
                if (sup) setDeliveryForm((f) => ({
                  ...f,
                  supplierId: String(sup.id ?? ""),
                  supplierName: String(sup.name ?? ""),
                  ufasNumberOnNote: String(sup.ufasNumber ?? ""),
                  femasNumberOnNote: String(sup.femasNumber ?? "")
                }));
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1 h-7 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Auto-fill from supplier register" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: feedSuppliers.filter((s) => s.isActive).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: String(s.name) }, String(s.id))) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UFAS number (from delivery note)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.ufasNumberOnNote ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, ufasNumberOnNote: e.target.value })), placeholder: "UFAS-XXXX-XXXXXX" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "FEMAS number (if applicable)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.femasNumberOnNote ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, femasNumberOnNote: e.target.value })), placeholder: "FEMAS-XXXX" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery note number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.deliveryNoteNumber ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, deliveryNoteNumber: e.target.value })), placeholder: "DN-0001" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: deliveryForm.quantityKg ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, quantityKg: e.target.value })), placeholder: "3000" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: deliveryForm.costPence ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, costPence: e.target.value })), placeholder: "870.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.invoiceReference ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, invoiceReference: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.batchNumber ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, batchNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.lotNumber ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, lotNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Best before" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deliveryForm.bestBeforeDate ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, bestBeforeDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.storageLocation ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, storageLocation: e.target.value })), placeholder: "e.g. Grain store Bay 4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species intended" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: SPECIES.filter((s) => s !== "other").includes(deliveryForm.speciesIntended ?? "") ? deliveryForm.speciesIntended ?? "__none__" : deliveryForm.speciesIntended && deliveryForm.speciesIntended !== "__none__" ? "other" : "__none__", onValueChange: (v) => setDeliveryForm((f) => ({ ...f, speciesIntended: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s }, s))
              ] })
            ] }),
            (deliveryForm.speciesIntended === "other" || deliveryForm.speciesIntended && deliveryForm.speciesIntended !== "__none__" && !SPECIES.filter((s) => s !== "other").includes(deliveryForm.speciesIntended)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: deliveryForm.speciesIntended === "other" ? "" : deliveryForm.speciesIntended, onChange: (e) => setDeliveryForm((f) => ({ ...f, speciesIntended: e.target.value || "other" })), placeholder: "Please specify species…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medicated feed?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deliveryForm.medicatedFeed ?? "false", onValueChange: (v) => setDeliveryForm((f) => ({ ...f, medicatedFeed: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes — medicated" })
              ] })
            ] })
          ] }),
          deliveryForm.medicatedFeed === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal period (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: deliveryForm.withdrawalPeriodDays ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, withdrawalPeriodDays: e.target.value })) })
          ] })
        ] }),
        deliveryForm.medicatedFeed === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medication details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.medicationDetails ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, medicationDetails: e.target.value })), placeholder: "Active ingredient, dose, veterinary authorisation" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: deliveryForm.receivedBy ?? "", onChange: (v) => setDeliveryForm((f) => ({ ...f, receivedBy: v })), staffNames, loading: membersQ.isLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: deliveryForm.notes ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full border-t pt-3 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "isOrganicApproved",
                checked: deliveryForm.isOrganicApproved === "true",
                onChange: (e) => setDeliveryForm((f) => ({ ...f, isOrganicApproved: e.target.checked ? "true" : "false" })),
                className: "h-4 w-4 rounded border-gray-300"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "isOrganicApproved", className: "text-sm font-medium text-green-800 cursor-pointer", children: "🌿 Organic Approved Feed" })
          ] }),
          deliveryForm.isOrganicApproved === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 bg-green-50 border border-green-200 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Organic Approval No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.organicSupplierApprovalNumber ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, organicSupplierApprovalNumber: e.target.value })), placeholder: "e.g. SA-ORG-1234" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic % of Feed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", max: "100", value: deliveryForm.organicPercentage ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, organicPercentage: e.target.value })), placeholder: "e.g. 95" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Non-Organic Ingredient Derogation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: deliveryForm.nonOrganicIngredientDerogation ?? "", onChange: (e) => setDeliveryForm((f) => ({ ...f, nonOrganicIngredientDerogation: e.target.value })), placeholder: "Certifier derogation ref / reason if <100% organic" })
            ] })
          ] })
        ] })
      ] }),
      editDelivery && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "feed_delivery", recordId: editDelivery.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowDeliveryDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!deliveryForm.deliveryDate || !deliveryForm.quantityKg || !deliveryForm.supplierName) {
            toast({ title: "Date, supplier and quantity required", variant: "destructive" });
            return;
          }
          const costPence = deliveryForm.costPence ? Math.round(parseFloat(deliveryForm.costPence) * 100) : void 0;
          const data = {
            ...deliveryForm,
            costPence,
            medicatedFeed: deliveryForm.medicatedFeed === "true",
            isOrganicApproved: deliveryForm.isOrganicApproved === "true",
            organicPercentage: deliveryForm.organicPercentage ? Number(deliveryForm.organicPercentage) : void 0
          };
          if (!data.supplierId) delete data.supplierId;
          if (!data.femasNumberOnNote) delete data.femasNumberOnNote;
          if (!data.bestBeforeDate) delete data.bestBeforeDate;
          if (!data.speciesIntended || data.speciesIntended === "__none__") delete data.speciesIntended;
          if (!data.feedStockItemId) delete data.feedStockItemId;
          if (!data.poId) delete data.poId;
          deliveryMut.mutate(data);
        }, children: editDelivery ? "Save Changes" : "Record Delivery" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showStockDialog, onOpenChange: setShowStockDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editStock ? "Edit Feed Bin" : "Register Feed Bin" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-800 leading-relaxed", children: editStock ? "This is the bin's configuration record. Stock level is managed automatically by deliveries and feed usage. Use the adjustment section below only to correct an error." : "This registers a physical bin or storage location so the system can track its stock level. To record feed arriving, use “Record Delivery”. To record feed being used, use the Feed Records section in Livestock." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.feedType ?? "compound_pellets", onValueChange: (v) => setStockForm((f) => ({ ...f, feedType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEED_TYPES.map((ft) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ft.value, children: ft.label }, ft.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species intended" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: SPECIES.filter((s) => s !== "other").includes(stockForm.speciesIntended ?? "") ? stockForm.speciesIntended ?? "__none__" : stockForm.speciesIntended && stockForm.speciesIntended !== "__none__" ? "other" : "__none__", onValueChange: (v) => setStockForm((f) => ({ ...f, speciesIntended: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any species" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s }, s))
              ] })
            ] }),
            (stockForm.speciesIntended === "other" || stockForm.speciesIntended && stockForm.speciesIntended !== "__none__" && !SPECIES.filter((s) => s !== "other").includes(stockForm.speciesIntended)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: stockForm.speciesIntended === "other" ? "" : stockForm.speciesIntended, onChange: (e) => setStockForm((f) => ({ ...f, speciesIntended: e.target.value || "other" })), placeholder: "Please specify species…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: stockForm.productName ?? "",
              onChange: (e) => setStockForm((f) => ({ ...f, productName: e.target.value })),
              placeholder: "e.g. Beef Finisher 18% Nuts",
              list: "known-products"
            }
          ),
          knownProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "known-products", children: knownProducts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p }, p)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage location *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: stockForm.storageLocation ?? "",
              onChange: (e) => setStockForm((f) => ({ ...f, storageLocation: e.target.value })),
              placeholder: "e.g. Grain Store Bay 4, Cattle Shed Bin",
              list: "known-locations"
            }
          ),
          knownLocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "known-locations", children: knownLocations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: l }, l)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Bins in the same location are grouped together on the stock page." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Preferred supplier" }),
          suppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: stockForm.supplierName || "__none__",
              onValueChange: (v) => setStockForm((f) => ({ ...f, supplierName: v === "__none__" ? "" : v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                  suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.name), children: String(s.name) }, String(s.id)))
                ] })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: stockForm.supplierName ?? "",
              onChange: (e) => setStockForm((f) => ({ ...f, supplierName: e.target.value })),
              placeholder: "Who to contact when reordering"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: suppliers.length === 0 ? "Add suppliers in the Suppliers section to get a dropdown here." : "The supplier you typically order this feed from." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mb-2.5", children: "Stock thresholds" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reorder at (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: stockForm.reorderThresholdKg ?? "", onChange: (e) => setStockForm((f) => ({ ...f, reorderThresholdKg: e.target.value })), placeholder: "e.g. 500", min: "0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Triggers a Low Stock alert when reached." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bin capacity (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: stockForm.capacityKg ?? "", onChange: (e) => setStockForm((f) => ({ ...f, capacityKg: e.target.value })), placeholder: "Optional — silo/bin size", min: "0" })
            ] })
          ] })
        ] }),
        !editStock ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800 mb-1", children: "Opening balance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mb-2", children: "If you already have feed in this bin, enter the current amount. Set to 0 if the bin is empty or you'll be recording the first delivery separately." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: stockForm.currentStockKg ?? "0", onChange: (e) => setStockForm((f) => ({ ...f, currentStockKg: e.target.value })), min: "0" })
          ] }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mb-1", children: "Current stock level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800 mb-1", children: fmtKg(stockForm.currentStockKg) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Managed automatically by delivery records and feed usage. Only adjust below if correcting a data error." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manual adjustment (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: stockAdjustment,
                  onChange: (e) => setStockAdjustment(e.target.value),
                  placeholder: "+500 to add, −200 to remove"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: stockAdjustReason,
                  onChange: (e) => setStockAdjustReason(e.target.value),
                  placeholder: "e.g. Stocktake correction"
                }
              )
            ] })
          ] }),
          stockAdjustment && !isNaN(parseFloat(stockAdjustment)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700 mt-2", children: [
            "New stock level will be: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtKg(Math.max(0, parseFloat(stockForm.currentStockKg ?? "0") + parseFloat(stockAdjustment))) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 mb-1", children: "Awaiting delivery flag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mb-2", children: "This flag is set automatically when a linked Purchase Order is sent or confirmed. Only set it manually here if you have placed an order outside the system." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Order placed outside system?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.awaitingDelivery ?? "false", onValueChange: (v) => setStockForm((f) => ({ ...f, awaitingDelivery: v, expectedDeliveryDate: v === "false" ? "" : f.expectedDeliveryDate })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "No — not awaiting" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Yes — awaiting delivery" })
                ] })
              ] })
            ] }),
            stockForm.awaitingDelivery === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected delivery date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stockForm.expectedDeliveryDate ?? "", onChange: (e) => setStockForm((f) => ({ ...f, expectedDeliveryDate: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: stockForm.notes ?? "", onChange: (e) => setStockForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "Any notes about this bin or feed type" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowStockDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          if (!stockForm.storageLocation?.trim()) {
            toast({ title: "Storage location is required", variant: "destructive" });
            return;
          }
          const data = {
            ...stockForm,
            awaitingDelivery: stockForm.awaitingDelivery === "true"
          };
          if (editStock && stockAdjustment && !isNaN(parseFloat(stockAdjustment))) {
            const newKg = Math.max(0, parseFloat(stockForm.currentStockKg ?? "0") + parseFloat(stockAdjustment));
            data.currentStockKg = String(newKg);
            if (stockAdjustReason) {
              data.notes = [stockForm.notes, `Stock adjusted by ${stockAdjustment} kg: ${stockAdjustReason}`].filter(Boolean).join(" | ");
            }
          }
          if (!data.capacityKg) delete data.capacityKg;
          if (!data.reorderThresholdKg) delete data.reorderThresholdKg;
          if (!data.expectedDeliveryDate || data.awaitingDelivery === false) delete data.expectedDeliveryDate;
          if (!data.supplierName) delete data.supplierName;
          if (!data.speciesIntended || data.speciesIntended === "__none__") delete data.speciesIntended;
          stockMut.mutate(data);
        }, children: editStock ? "Save Changes" : "Register Bin" })
      ] })
    ] }) }),
    tab === "trace" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800 mb-1", children: "Batch Recall Trace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Enter a batch or lot number to trace it from supplier delivery through to the herds it was fed to. Essential for APHA recall responses." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 max-w-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: "pl-9",
                placeholder: "Batch or lot number…",
                value: batchSearch,
                onChange: (e) => setBatchSearch(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") setBatchQuery(batchSearch.trim());
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setBatchQuery(batchSearch.trim()), className: "bg-green-800 hover:bg-green-900 text-white", children: "Trace" })
        ] })
      ] }),
      batchQuery.length >= 2 && (batchTraceQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-gray-400 text-sm", children: "Searching…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "w-4 h-4 text-green-700" }),
            'Deliveries matching "',
            batchQuery,
            '"',
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-gray-400", children: [
              "(",
              (batchTraceQ.data?.deliveries ?? []).length,
              " found)"
            ] })
          ] }),
          (batchTraceQ.data?.deliveries ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 pl-6", children: "No deliveries found with this batch / lot number." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Supplier", "Product", "Batch", "Lot", "Qty", "Storage Bin", "Medicated"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-500", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: (batchTraceQ.data?.deliveries ?? []).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: fmtDate(d.deliveryDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.supplierName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.productName || d.feedType }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono font-semibold", children: d.batchNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: d.lotNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: fmtKg(d.quantityKg) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.bin ? `${d.bin.productName || "Bin"} — ${d.bin.storageLocation || "—"}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "Not linked" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.medicatedFeed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "YES" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "No" }) })
            ] }, d.id)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-4 h-4 text-orange-600" }),
            'Feeding events matching "',
            batchQuery,
            '"',
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-gray-400", children: [
              "(",
              (batchTraceQ.data?.usage ?? []).length,
              " found)"
            ] })
          ] }),
          (batchTraceQ.data?.usage ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 pl-6", children: "No feeding events recorded with this batch number." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date Fed", "Herd / Group", "Qty Fed", "Source Bin", "Batch"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-500", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: (batchTraceQ.data?.usage ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: fmtDate(u.feedDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: u.herdName || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtKg(u.quantityKg) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: u.bin ? `${u.bin.productName || "Bin"} — ${u.bin.storageLocation || "—"}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "Not linked" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: u.batchNumber || "—" })
            ] }, u.id)) })
          ] }) })
        ] }),
        (batchTraceQ.data?.deliveries ?? []).length === 0 && (batchTraceQ.data?.usage ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            'No records found for "',
            batchQuery,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Check the batch number and try again." })
        ] })
      ] })),
      batchQuery.length < 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500", children: "Enter a batch or lot number to begin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Enter at least 2 characters to search across all delivery and feeding records" })
      ] })
    ] }),
    tab === "orders" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Feed Orders Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Track feed orders raised with suppliers. When delivery arrives, mark as received and log a delivery receipt." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openFpoAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Feed Order"
        ] })
      ] }),
      activeFpos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
          activeFpos.length,
          " active order",
          activeFpos.length !== 1 ? "s" : ""
        ] }),
        overdueFpos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
          overdueFpos.length,
          " overdue — chase supplier"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFpoFilter("active"), className: `text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${fpoFilter === "active" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`, children: [
          "Active (",
          activeFpos.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFpoFilter("all"), className: `text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${fpoFilter === "all" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`, children: [
          "All (",
          fpos.length,
          ")"
        ] })
      ] }),
      filteredFpos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-10 h-10 mx-auto mb-3 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500", children: fpoFilter === "active" ? "No active feed orders" : "No feed orders on record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1 mb-4", children: "Raise a feed order when purchasing feed from a supplier." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openFpoAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Feed Order"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredFpos.map((fpo) => {
        const isOverdue = !INACTIVE_FPO_STATUSES.includes(String(fpo.status)) && fpo.expectedDeliveryDate && String(fpo.expectedDeliveryDate).substring(0, 10) < today;
        const isReceived = fpo.status === "received";
        const isCancelled = fpo.status === "cancelled";
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-lg border p-4 ${isOverdue ? "border-red-300 bg-red-50" : isReceived ? "border-green-200 bg-green-50/60" : isCancelled ? "border-gray-200 bg-gray-50/60" : "border-amber-200 bg-white"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              !!isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-500 flex-shrink-0" }),
              !!isReceived && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-500 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold text-gray-800", children: String(fpo.poNumber) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full ${isReceived ? "bg-green-100 text-green-700" : fpo.status === "confirmed" ? "bg-blue-100 text-blue-700" : fpo.status === "sent" ? "bg-amber-100 text-amber-700" : fpo.status === "draft" ? "bg-gray-100 text-gray-600" : isCancelled ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`, children: String(fpo.status).charAt(0).toUpperCase() + String(fpo.status).slice(1) }),
              !!isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-red-600 font-medium", children: [
                "Overdue since ",
                fmtDate(String(fpo.expectedDeliveryDate))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-800 mt-0.5", children: [
              fpo.supplierName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(fpo.supplierName) }),
                " — "
              ] }) : null,
              String(fpo.productName)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
              fmtKg(fpo.quantityKg),
              !!fpo.speciesIntended && fpo.speciesIntended !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · For ",
                String(fpo.speciesIntended).charAt(0).toUpperCase() + String(fpo.speciesIntended).slice(1)
              ] }),
              !!fpo.feedType && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · ",
                FEED_TYPES.find((t) => t.value === fpo.feedType)?.label ?? String(fpo.feedType)
              ] }),
              !!fpo.expectedDeliveryDate && !isOverdue && !isReceived && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · Expected ",
                fmtDate(String(fpo.expectedDeliveryDate))
              ] }),
              !!fpo.actualDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · Delivered ",
                fmtDate(String(fpo.actualDeliveryDate))
              ] }),
              !!fpo.orderedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · Raised by ",
                String(fpo.orderedBy)
              ] })
            ] }),
            !!fpo.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1 italic truncate max-w-md", children: String(fpo.notes) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
            !isReceived && !isCancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "text-xs font-medium px-2.5 py-1 rounded border border-green-300 text-green-700 bg-white hover:bg-green-50 flex items-center gap-1 transition-colors",
                onClick: () => {
                  setReceiveId(Number(fpo.id));
                  setReceiveDate((/* @__PURE__ */ new Date()).toISOString().substring(0, 10));
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                  "Received"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors", onClick: () => openFpoEdit(fpo), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs px-2 py-1 rounded border border-red-200 text-red-600 bg-white hover:bg-red-50 flex items-center transition-colors", onClick: () => {
              if (confirm("Remove this feed order?")) deleteFpoMut.mutate(Number(fpo.id));
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
          ] })
        ] }) }, String(fpo.id));
      }) })
    ] }),
    traceBinId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setTraceBinId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "54rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "w-4 h-4 text-blue-600" }),
        traceQ.data?.bin ? `${traceQ.data.bin.productName || traceQ.data.bin.feedType} — ${traceQ.data.bin.storageLocation || "no location"}` : "Bin Ledger"
      ] }) }),
      traceQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-gray-400 text-sm", children: "Loading ledger…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 max-h-[70vh] overflow-y-auto pr-1", children: [
        traceQ.data?.bin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
          { label: "Total IN", value: fmtKg((traceQ.data.deliveries ?? []).reduce((s, d) => s + parseFloat(d.quantityKg ?? 0), 0)), color: "text-green-700" },
          { label: "Total OUT", value: fmtKg((traceQ.data.usage ?? []).reduce((s, u) => s + parseFloat(u.quantityKg ?? 0), 0)), color: "text-orange-600" },
          { label: "Current Stock", value: fmtKg(traceQ.data.bin.currentStockKg), color: "text-gray-800" }
        ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: card.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${card.color}`, children: card.value })
        ] }, card.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "w-3.5 h-3.5 text-green-600" }),
            " Deliveries IN (",
            (traceQ.data?.deliveries ?? []).length,
            ")"
          ] }),
          (traceQ.data?.deliveries ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 pl-5", children: "No deliveries linked to this bin yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-green-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Supplier", "Batch No.", "Lot No.", "Qty IN", "Del. Note", "Medicated"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-green-800", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: (traceQ.data?.deliveries ?? []).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-green-50/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: fmtDate(d.deliveryDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.supplierName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono font-semibold", children: d.batchNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: d.lotNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 font-medium text-green-700", children: [
                "+",
                fmtKg(d.quantityKg)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: d.deliveryNoteNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.medicatedFeed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "YES" }) : "No" })
            ] }, d.id)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-3.5 h-3.5 text-orange-600" }),
            " Feeding Events OUT (",
            (traceQ.data?.usage ?? []).length,
            ")"
          ] }),
          (traceQ.data?.usage ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 pl-5", children: "No feeding events linked to this bin yet. Record feed usage in Livestock → Feed Records." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-orange-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date Fed", "Herd / Group", "Qty OUT", "Batch", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-orange-800", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: (traceQ.data?.usage ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-orange-50/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: fmtDate(u.feedDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: u.herdName || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "No herd linked" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 font-medium text-orange-700", children: [
                "-",
                fmtKg(u.quantityKg)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: u.batchNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500", children: u.notes || "—" })
            ] }, u.id)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTraceBinId(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!reorderBin, onOpenChange: (open) => {
      if (!open) {
        setReorderBin(null);
        setReorderMemberId("__none__");
        setReorderDueDate("");
        setReorderAssignNote("");
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-4 h-4 text-orange-600" }),
        "Raise Reorder"
      ] }) }),
      reorderBin && (() => {
        const binName = String(reorderBin.productName || feedTypeLabel(String(reorderBin.feedType ?? "")));
        const supplierNameStr = String(reorderBin.supplierName ?? "");
        const members = membersQ.data ?? [];
        const selectedMember = members.find((m) => String(m.id) === reorderMemberId);
        const selectedPhone = selectedMember ? String(selectedMember.phone ?? "") : "";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: binName }),
            !!supplierNameStr && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-0.5 text-orange-600", children: [
              "Supplier: ",
              supplierNameStr
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-0.5", children: [
              "Current stock: ",
              fmtKg(reorderBin.currentStockKg)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
              "Expected Delivery Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: reorderDate, onChange: (e) => setReorderDate(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
              "Bin Notes ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                className: "mt-1 text-sm",
                rows: 2,
                placeholder: "e.g. quantity needed, urgency, contact details...",
                value: reorderNotes,
                onChange: (e) => setReorderNotes(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
              "Assign to Staff Member ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reorderMemberId, onValueChange: setReorderMemberId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— No assignment —" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No assignment —" }),
                members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                  String(m.firstName ?? ""),
                  " ",
                  String(m.lastName ?? ""),
                  m.role ? ` — ${String(m.role)}` : ""
                ] }, String(m.id)))
              ] })
            ] }),
            reorderMemberId !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
                  "Task Due Date ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: reorderDueDate, onChange: (e) => setReorderDueDate(e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
                  "Note to Staff Member ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    className: "mt-1 text-sm",
                    rows: 2,
                    placeholder: "e.g. call supplier on 01234 567890, min order 1 tonne...",
                    value: reorderAssignNote,
                    onChange: (e) => setReorderAssignNote(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md px-3 py-2 text-xs flex items-start gap-2 ${selectedPhone ? "bg-green-50 border border-green-200 text-green-700" : "bg-gray-50 border border-gray-200 text-gray-500"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3 h-3 mt-0.5 shrink-0" }),
                selectedPhone ? `SMS notification will be sent to ${String(selectedMember?.firstName ?? "")} at ${selectedPhone}.` : "No phone number registered for this staff member — SMS cannot be sent."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            "Confirming will mark this bin as ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Awaiting Delivery" }),
            " and suppress reorder alerts until the delivery is received."
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setReorderBin(null);
          setReorderMemberId("__none__");
          setReorderDueDate("");
          setReorderAssignNote("");
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "bg-orange-600 hover:bg-orange-700 text-white",
            disabled: reorderMut.isPending,
            onClick: () => {
              if (!reorderBin) return;
              const binName = String(reorderBin.productName || feedTypeLabel(String(reorderBin.feedType ?? "")));
              reorderMut.mutate({
                id: Number(reorderBin.id),
                expectedDeliveryDate: reorderDate,
                notes: reorderNotes,
                memberId: reorderMemberId,
                dueDate: reorderDueDate,
                assignNote: reorderAssignNote,
                binName,
                supplierName: String(reorderBin.supplierName ?? "")
              });
            },
            children: reorderMut.isPending ? "Saving…" : "Confirm Reorder Raised"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showFpoDialog, onOpenChange: (v) => !v && setShowFpoDialog(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editFpo ? "Edit Feed Order" : "Raise Feed Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editFpo ? `Edit details for ${editFpo.poNumber}` : "Record a feed purchase order raised with a supplier." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 max-h-[60vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Supplier Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fpoForm.supplierName ?? "", onChange: (e) => setFpoForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "e.g. J&H Feeds Ltd" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Product Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fpoForm.productName ?? "", onChange: (e) => setFpoForm((f) => ({ ...f, productName: e.target.value })), placeholder: "e.g. Sheep Nut 16%" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Feed Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fpoForm.feedType ?? "compound_pellets", onValueChange: (v) => setFpoForm((f) => ({ ...f, feedType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEED_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Species Intended" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["cattle", "sheep", "pigs", "poultry"].includes(fpoForm.speciesIntended ?? "") ? fpoForm.speciesIntended ?? "__none__" : fpoForm.speciesIntended && fpoForm.speciesIntended !== "__none__" ? "other" : fpoForm.speciesIntended ?? "__none__", onValueChange: (v) => setFpoForm((f) => ({ ...f, speciesIntended: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any / not specified" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cattle", children: "Cattle" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sheep", children: "Sheep" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pigs", children: "Pigs" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "poultry", children: "Poultry" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
              ] })
            ] }),
            (fpoForm.speciesIntended === "other" || fpoForm.speciesIntended && fpoForm.speciesIntended !== "__none__" && !["cattle", "sheep", "pigs", "poultry"].includes(fpoForm.speciesIntended)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: fpoForm.speciesIntended === "other" ? "" : fpoForm.speciesIntended, onChange: (e) => setFpoForm((f) => ({ ...f, speciesIntended: e.target.value || "other" })), placeholder: "Please specify species…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Quantity (kg) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: fpoForm.quantityKg ?? "", onChange: (e) => setFpoForm((f) => ({ ...f, quantityKg: e.target.value })), placeholder: "e.g. 1000" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Order Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fpoForm.orderDate ?? "", onChange: (e) => setFpoForm((f) => ({ ...f, orderDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fpoForm.expectedDeliveryDate ?? "", onChange: (e) => setFpoForm((f) => ({ ...f, expectedDeliveryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fpoForm.status ?? "sent", onValueChange: (v) => setFpoForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent to Supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "confirmed", children: "Confirmed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Raised By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: fpoForm.orderedBy ?? "", onChange: (v) => setFpoForm((f) => ({ ...f, orderedBy: v })), staffNames, loading: membersQ.isLoading })
          ] })
        ] }),
        fpoForm.status === "received" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Actual Delivery Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fpoForm.actualDeliveryDate ?? "", onChange: (e) => setFpoForm((f) => ({ ...f, actualDeliveryDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: fpoForm.notes ?? "", onChange: (e) => setFpoForm((f) => ({ ...f, notes: e.target.value })), placeholder: "Any notes about this order…", rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowFpoDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !fpoForm.productName?.trim() || !fpoForm.quantityKg || !fpoForm.orderDate || fpoMut.isPending,
            onClick: () => {
              const data = {
                supplierName: fpoForm.supplierName || null,
                productName: fpoForm.productName,
                feedType: fpoForm.feedType || null,
                speciesIntended: fpoForm.speciesIntended === "__none__" ? null : fpoForm.speciesIntended || null,
                quantityKg: fpoForm.quantityKg,
                orderDate: fpoForm.orderDate,
                expectedDeliveryDate: fpoForm.expectedDeliveryDate || null,
                actualDeliveryDate: fpoForm.actualDeliveryDate || null,
                status: fpoForm.status || "sent",
                orderedBy: fpoForm.orderedBy || null,
                notes: fpoForm.notes || null
              };
              fpoMut.mutate(data);
            },
            children: fpoMut.isPending ? "Saving…" : editFpo ? "Save Changes" : "Raise Order"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: receiveId !== null, onOpenChange: (v) => !v && setReceiveId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mark Order as Received" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Confirm the actual delivery date. Then log a delivery receipt in the Delivery Records tab." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Actual Delivery Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: receiveDate, onChange: (e) => setReceiveDate(e.target.value) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReceiveId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !receiveDate || receiveFpoMut.isPending,
            onClick: () => {
              if (receiveId !== null) receiveFpoMut.mutate({ id: receiveId, date: receiveDate });
            },
            children: receiveFpoMut.isPending ? "Saving…" : "Mark Received"
          }
        )
      ] })
    ] }) }),
    tab === "medicated" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(MedicatedFeedTab, { farmId })
  ] });
}
function MedicatedFeedTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm = {
    startDate: "",
    endDate: "",
    species: "",
    medicament: "",
    activeIngredient: "",
    withdrawalDays: "",
    dosageKgPerTonne: "",
    quantityKg: "",
    supplierName: "",
    batchNumber: "",
    prescribingVet: "",
    animalGroup: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState({ ...emptyForm });
  const q = useQuery({
    queryKey: ["medicated-feed", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicated-feed`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = Array.isArray(q.data?.records) ? q.data.records : [];
  const today = /* @__PURE__ */ new Date();
  const activeRecords = records.filter((r) => {
    if (!r.endDate || !r.withdrawalDays) return false;
    const endPlus = new Date(r.endDate);
    endPlus.setDate(endPlus.getDate() + Number(r.withdrawalDays));
    return endPlus >= today;
  });
  const saveMut = useMutation({
    mutationFn: (data) => {
      const id = editItem?.id;
      return fetch(id ? `/api/farms/${farmId}/medicated-feed/${id}` : `/api/farms/${farmId}/medicated-feed`, {
        method: id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicated-feed", farmId] });
      setOpen(false);
      toast({ title: "Record saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/medicated-feed/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicated-feed", farmId] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openAdd = () => {
    setEditItem(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditItem(r);
    setForm({
      startDate: r.startDate?.slice(0, 10) ?? "",
      endDate: r.endDate?.slice(0, 10) ?? "",
      species: r.species ?? "",
      medicament: r.medicament ?? "",
      activeIngredient: r.activeIngredient ?? "",
      withdrawalDays: r.withdrawalDays ?? "",
      dosageKgPerTonne: r.dosageKgPerTonne ?? "",
      quantityKg: r.quantityKg ?? "",
      supplierName: r.supplierName ?? "",
      batchNumber: r.batchNumber ?? "",
      prescribingVet: r.prescribingVet ?? "",
      animalGroup: r.animalGroup ?? "",
      notes: r.notes ?? ""
    });
    setOpen(true);
  };
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const withdrawalStatus = (r) => {
    if (!r.endDate || !r.withdrawalDays) return null;
    const clearDate = new Date(r.endDate);
    clearDate.setDate(clearDate.getDate() + Number(r.withdrawalDays));
    const daysLeft = Math.ceil((clearDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    if (daysLeft <= 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full", children: "Clear" });
    if (daysLeft <= 3) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-semibold", children: [
      daysLeft,
      "d left — HOLD"
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full", children: [
      daysLeft,
      "d withdrawal"
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Medicated Feed Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Track medicated compound feeds — includes withdrawal period status for food safety compliance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
        "Add Record"
      ] })
    ] }),
    activeRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-amber-800 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
        " ",
        activeRecords.length,
        " active withdrawal period",
        activeRecords.length !== 1 ? "s" : "",
        " in progress"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mt-0.5", children: "Do not send affected animals for slaughter until withdrawal period is complete." })
    ] }),
    q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Loading…" }),
    !q.isLoading && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed rounded-xl p-10 text-center text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "No medicated feed records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Record medicated compound feeds and track withdrawal periods." })
    ] }),
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600", children: "Start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600", children: "End" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600", children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600 hidden sm:table-cell", children: "Medicament" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600 hidden md:table-cell", children: "Animal Group" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600", children: "Withdrawal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtD(r.startDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtD(r.endDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.species }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden sm:table-cell", children: r.medicament }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden md:table-cell", children: r.animalGroup || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: withdrawalStatus(r) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteId(r.id), title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) setOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl", "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editItem ? "Edit" : "Add",
        " Medicated Feed Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.startDate, onChange: (e) => f("startDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.endDate, onChange: (e) => f("endDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["Cattle", "Sheep", "Pigs", "Poultry"].includes(form.species) ? form.species : form.species ? "Other" : "", onValueChange: (v) => f("species")(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Cattle", "Sheep", "Pigs", "Poultry", "Other"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] }),
          (form.species === "Other" || form.species && !["Cattle", "Sheep", "Pigs", "Poultry"].includes(form.species)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.species === "Other" ? "" : form.species, onChange: (e) => f("species")(e.target.value || "Other"), placeholder: "Please specify species…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animal Group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalGroup, onChange: (e) => f("animalGroup")(e.target.value), placeholder: "e.g. Finishers shed 2" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medicament Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.medicament, onChange: (e) => f("medicament")(e.target.value), placeholder: "Product name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.activeIngredient, onChange: (e) => f("activeIngredient")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Period (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.withdrawalDays, onChange: (e) => f("withdrawalDays")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dosage (kg/tonne)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.dosageKgPerTonne, onChange: (e) => f("dosageKgPerTonne")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Used (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.quantityKg, onChange: (e) => f("quantityKg")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierName, onChange: (e) => f("supplierName")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchNumber, onChange: (e) => f("batchNumber")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescribing Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.prescribingVet, onChange: (e) => f("prescribingVet")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes, onChange: (e) => f("notes")(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.startDate || !form.species || !form.medicament || saveMut.isPending, onClick: () => saveMut.mutate(form), children: saveMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewItem !== null, onOpenChange: (o) => {
      if (!o) setViewItem(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Medicated Feed Record" }) }),
      viewItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtD(viewItem.startDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtD(viewItem.endDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.species })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Animal Group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.animalGroup || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Medicament" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.medicament })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.activeIngredient || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.withdrawalDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Dosage (kg/t)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.dosageKgPerTonne ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.quantityKg ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.supplierName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.batchNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Prescribing Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.prescribingVet || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Withdrawal Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: withdrawalStatus(viewItem) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.notes || "—" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: deleteMut.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  FeedManagementPage as default
};
