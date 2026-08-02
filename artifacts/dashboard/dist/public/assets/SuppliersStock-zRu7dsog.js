import { r as reactExports, b as useAppStore, a as useToast, t as useQueryClient, l as useQuery, j as jsxRuntimeExports, O as useMutation, I as Input, c as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, J as DialogFooter, Q as React, B as Building2, d as LoaderCircle } from "./index-B29xzN8c.js";
import { TradeHistoryTab } from "./TradeHistory-YOHIHuDb.js";
import { T as TabBar, a as TabButton } from "./tab-button-D7CC4ehp.js";
import { A as AppLayout, I as Info, u as useUserRole, c as ClipboardList, j as Truck } from "./AppLayout-CgvcnQ0K.js";
import { u as useFarmMembers } from "./use-farm-members-IleQT0fq.js";
import { S as StaffSelect } from "./staff-select-CB3qmHcA.js";
import { T as Textarea } from "./textarea-35aL6BNx.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bj6__YM7.js";
import { B as Badge } from "./badge-p9tteMAM.js";
import { T as TriangleAlert } from "./triangle-alert-CSozXhwg.js";
import { S as Search } from "./search-DNKYTUTJ.js";
import { P as Package } from "./use-safe-clerk-CKiumuQD.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-Slv_6-D5.js";
import { R as RefreshCw } from "./refresh-cw-BKo98T5n.js";
import { A as ArrowUp, a as ArrowDown } from "./arrow-up-BgRrjihY.js";
import { E as Eye } from "./eye-DpojgBGJ.js";
import { C as ClipboardCheck } from "./shield-alert-CN7jb0o7.js";
import "./popover-Kshu1Up6.js";
import "./index-IULSniwa.js";
import "./shopping-cart-CMqqrPts.js";
import "./generateCategoricalChart-BDQFTh3T.js";
import "./LineChart-CuTm9m8m.js";
import "./Line-dXJQqMNx.js";
import "./CartesianGrid-BviIjJeX.js";
import "./BarChart-SGLLL4lg.js";
import "./arrow-up-down-Cz8NwZ2C.js";
import "./database-D2qZp8SP.js";
import "./shield-check-BLeL-jNL.js";
import "./tractor-BshaKszY.js";
import "./index-Ci6A4Juv.js";
import "./chevron-up-DVep38NW.js";
const PRODUCT_CATEGORIES = [
  "Fertiliser",
  "Pesticide / Herbicide",
  "Fungicide",
  "Insecticide",
  "Seed",
  "Feed",
  "Veterinary Medicine",
  "Fuel",
  "Lubricants",
  "Disinfectant",
  "Other"
];
const SUPPLIER_CATEGORIES = [
  "Agrochemicals",
  "Seeds",
  "Feed & Nutrition",
  "Fertilisers",
  "Machinery & Parts",
  "Fuel",
  "Veterinary",
  "Waste Carrier",
  "General"
];
const SERVICE_CATEGORIES = [
  "Agronomy",
  "Veterinary Services",
  "Haulage / Transport",
  "Contracting / Labour",
  "Waste Disposal",
  "Repairs & Maintenance",
  "Professional Services",
  "Other Services"
];
const ALL_UNITS = ["kg", "L", "t", "bags", "boxes", "units", "m³", "bales", "hours", "days", "visits", "loads", "items"];
const UNITS = ALL_UNITS;
function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB");
}
function fmtQty(q, unit) {
  if (q === null || q === void 0) return "—";
  const n = parseFloat(String(q));
  if (isNaN(n)) return "—";
  const formatted = n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
  return unit ? `${formatted} ${unit}` : formatted;
}
function fmtCost(pence) {
  if (!pence) return "—";
  return `£${(pence / 100).toFixed(2)}`;
}
function movementBadge(type, qty) {
  const q = parseFloat(qty);
  const isIn = q > 0;
  if (type === "received") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#d1fae5", color: "#065f46", border: "none" }, className: "text-xs", children: "Received" });
  if (type === "usage") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fee2e2", color: "#991b1b", border: "none" }, className: "text-xs", children: "Used" });
  if (type === "waste") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "none" }, className: "text-xs", children: "Waste" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: isIn ? "#dbeafe" : "#f3e8ff", color: isIn ? "#1e40af" : "#6b21a8", border: "none" }, className: "text-xs", children: "Adjustment" });
}
function EmptyState({ icon: Icon, title, subtitle }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f0fdf4", borderRadius: "50%", padding: "1.25rem", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 28, color: "#166534" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700 mb-1", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: subtitle })
  ] });
}
function SuppliersStockPage() {
  const [tab, setTab] = reactExports.useState("levels");
  const [prefilledPo, setPrefilledPo] = reactExports.useState(null);
  const { farmId } = useAppStore();
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("tab");
    const valid = ["suppliers", "products", "purchase-orders", "received", "levels", "movements", "trade-history", "stocktake"];
    if (requested && valid.includes(requested)) setTab(requested);
  }, []);
  const { toast } = useToast();
  const qc = useQueryClient();
  const handleRaisePo = (level) => {
    const reorder = level.stockItemReorderLevel ? parseFloat(level.stockItemReorderLevel) : 0;
    const current = parseFloat(level.currentQuantity ?? "0");
    const suggestedQty = Math.max(reorder * 2 - current, reorder).toFixed(2);
    setPrefilledPo({
      form: {
        supplierId: level.defaultSupplierId ? String(level.defaultSupplierId) : "",
        orderDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        expectedDeliveryDate: "",
        status: "draft",
        notes: `Raised from stock card: ${level.stockItemName} is at or below reorder level.`
      },
      lines: [{ stockItemId: String(level.stockItemId), quantityOrdered: suggestedQty, unitPricePence: "", notes: "" }]
    });
    setTab("purchase-orders");
  };
  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const productsQ = useQuery({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const deliveriesQ = useQuery({
    queryKey: ["stock-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const levelsQ = useQuery({
    queryKey: ["stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-levels`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const movementsQ = useQuery({
    queryKey: ["stock-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-movements`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const purchaseOrdersQ = useQuery({
    queryKey: ["purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const feedStockQ = useQuery({
    queryKey: ["feed-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["stock-items", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-levels", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-movements", farmId] });
    qc.invalidateQueries({ queryKey: ["suppliers", farmId] });
    qc.invalidateQueries({ queryKey: ["purchase-orders", farmId] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Trade Contacts & Stock", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Product catalogue, goods received, live stock levels and full movement history" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6 overflow-x-auto flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "levels", onClick: () => setTab("levels"), children: "Stock Levels" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "purchase-orders", onClick: () => setTab("purchase-orders"), children: "Purchase Orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "received", onClick: () => setTab("received"), children: "Goods Received (GRN)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "movements", onClick: () => setTab("movements"), children: "Movements" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "products", onClick: () => setTab("products"), children: "Product Catalogue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "suppliers", onClick: () => setTab("suppliers"), children: "Trade Contacts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "trade-history", onClick: () => setTab("trade-history"), children: "Trade History & Prices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "stocktake", onClick: () => setTab("stocktake"), children: "Stocktake" })
    ] }),
    tab === "levels" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      StockLevelsTab,
      {
        levels: levelsQ.data ?? [],
        products: productsQ.data ?? [],
        loading: levelsQ.isLoading,
        farmId,
        onRefresh: invalidate,
        toast,
        qc,
        onGoToProducts: () => setTab("products"),
        onRaisePo: handleRaisePo
      }
    ),
    tab === "purchase-orders" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PurchaseOrdersTab,
      {
        orders: purchaseOrdersQ.data ?? [],
        products: productsQ.data ?? [],
        suppliers: suppliersQ.data ?? [],
        feedStock: feedStockQ.data ?? [],
        loading: purchaseOrdersQ.isLoading,
        farmId,
        onRefresh: invalidate,
        toast,
        qc,
        onGoToGRN: () => setTab("received"),
        prefilledPo,
        onClearPrefilledPo: () => setPrefilledPo(null)
      }
    ),
    tab === "received" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      GoodsReceivedTab,
      {
        deliveries: deliveriesQ.data ?? [],
        products: productsQ.data ?? [],
        suppliers: suppliersQ.data ?? [],
        purchaseOrders: purchaseOrdersQ.data ?? [],
        loading: deliveriesQ.isLoading,
        farmId,
        onRefresh: invalidate,
        toast,
        onGoToProducts: () => setTab("products")
      }
    ),
    tab === "movements" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      MovementsTab,
      {
        movements: movementsQ.data ?? [],
        products: productsQ.data ?? [],
        loading: movementsQ.isLoading,
        farmId,
        onRefresh: invalidate,
        toast
      }
    ),
    tab === "products" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductsTab,
      {
        products: productsQ.data ?? [],
        suppliers: suppliersQ.data ?? [],
        loading: productsQ.isLoading,
        farmId,
        onRefresh: invalidate,
        toast
      }
    ),
    tab === "suppliers" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SuppliersTab,
      {
        suppliers: suppliersQ.data ?? [],
        loading: suppliersQ.isLoading,
        farmId,
        onRefresh: invalidate,
        toast
      }
    ),
    tab === "trade-history" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(TradeHistoryTab, { farmId }),
    tab === "stocktake" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(StocktakeTab, { farmId })
  ] }) });
}
function StockLevelsTab({ levels, products, loading, farmId, onRefresh, toast, qc, onGoToProducts, onRaisePo }) {
  const [adjOpen, setAdjOpen] = reactExports.useState(false);
  const [adjForm, setAdjForm] = reactExports.useState({ stockItemId: "", quantityChange: "", movementType: "adjustment", notes: "" });
  const [search, setSearch] = reactExports.useState("");
  const adjMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Adjustment saved" });
      onRefresh();
      setAdjOpen(false);
      setAdjForm({ stockItemId: "", quantityChange: "", movementType: "adjustment", notes: "" });
    },
    onError: () => toast({ title: "Failed to save adjustment", variant: "destructive" })
  });
  const filtered = (levels ?? []).filter((l) => !search || l.stockItemName?.toLowerCase().includes(search.toLowerCase()));
  const low = (levels ?? []).filter((l) => l.stockItemReorderLevel && parseFloat(l.currentQuantity) <= parseFloat(l.stockItemReorderLevel));
  const hasProducts = products.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    low.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, color: "#92400e" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.875rem", color: "#92400e", fontWeight: 500 }, children: [
        low.length,
        " product",
        low.length > 1 ? "s" : "",
        " at or below reorder level"
      ] })
    ] }),
    !hasProducts && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, color: "#1d4ed8", style: { flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.875rem", color: "#1e40af" }, children: [
        "To track stock levels, first add products to your",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onGoToProducts, style: { fontWeight: 600, textDecoration: "underline", background: "none", border: "none", color: "#1e40af", cursor: "pointer", padding: 0 }, children: "Product Catalogue" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search products...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
        if (!hasProducts) {
          onGoToProducts();
        } else {
          setAdjOpen(true);
        }
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Manual Adjustment"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Package, title: "No stock recorded yet", subtitle: "Add products to your catalogue and log Goods Received to see levels here" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }, children: filtered.map((l) => {
      const qty = parseFloat(l.currentQuantity ?? "0");
      const reorder = l.stockItemReorderLevel ? parseFloat(l.stockItemReorderLevel) : null;
      const isLow = reorder !== null && qty <= reorder;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: isLow ? "1.5px solid #f59e0b" : "1px solid #e5e7eb", borderRadius: 10, padding: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" }, children: l.stockItemName }),
          isLow && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, color: "#f59e0b" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 8, textTransform: "capitalize" }, children: l.stockItemCategory || "Uncategorised" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1.75rem", fontWeight: 700, color: isLow ? "#b45309" : "#166534" }, children: qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: l.stockItemUnit || "units" })
        ] }),
        reorder !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: [
          "Reorder at: ",
          reorder,
          " ",
          l.stockItemUnit
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#d1d5db", marginTop: 6 }, children: [
          "Updated ",
          fmt(l.lastUpdated)
        ] }),
        isLow && onRaisePo && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onRaisePo(l),
            style: { marginTop: 8, width: "100%", fontSize: "0.75rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "4px 0", cursor: "pointer" },
            children: "+ Raise Purchase Order"
          }
        )
      ] }, l.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adjOpen, onOpenChange: setAdjOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manual Stock Adjustment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adjForm.stockItemId, onValueChange: (v) => setAdjForm((f) => ({ ...f, stockItemId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: p.name }, p.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adjForm.movementType, onValueChange: (v) => setAdjForm((f) => ({ ...f, movementType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "adjustment", children: "Adjustment (+ or −)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "waste", children: "Waste / Loss" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Change (positive to add, negative to deduct)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "e.g. -5 or +10", value: adjForm.quantityChange, onChange: (e) => setAdjForm((f) => ({ ...f, quantityChange: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason / Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Optional reason...", value: adjForm.notes, onChange: (e) => setAdjForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAdjOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => adjMut.mutate(adjForm), disabled: !adjForm.stockItemId || !adjForm.quantityChange || adjMut.isPending, children: "Save Adjustment" })
      ] })
    ] }) })
  ] });
}
const FINANCIAL_CATEGORIES = [
  "Seeds & Seed Treatments",
  "Fertiliser",
  "Pesticides & Herbicides",
  "Fungicides",
  "Insecticides",
  "Veterinary & Medicine",
  "Feed & Bedding",
  "Fuel",
  "Machinery & Equipment",
  "Labour",
  "Agri-Environment Scheme",
  "Grant / Subsidy",
  "Crop Sales",
  "Livestock Sales",
  "Haulage",
  "Other Income",
  "Other Expense"
];
function GoodsReceivedTab({ deliveries, products, suppliers, purchaseOrders, loading, farmId, onRefresh, toast, onGoToProducts }) {
  const [open, setOpen] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const emptyForm = { stockItemId: "", supplierId: "", poId: "", deliveryDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), quantity: "", batchNumber: "", lotNumber: "", invoiceReference: "", receivedBy: "", costPence: "", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const [invoiceDelivery, setInvoiceDelivery] = reactExports.useState(null);
  const [invoiceForm, setInvoiceForm] = reactExports.useState({});
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/stock-deliveries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, costPence: body.costPence ? Math.round(parseFloat(body.costPence) * 100) : null }) }),
    onSuccess: () => {
      toast({ title: "Goods received logged (GRN auto-generated)" });
      onRefresh();
      setOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const invoiceMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/financial-transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        amountPence: body.amountPence ? Math.round(parseFloat(body.amountPence) * 100) : 0,
        vatAmountPence: body.vatAmountPence ? Math.round(parseFloat(body.vatAmountPence) * 100) : null
      })
    }),
    onSuccess: () => {
      toast({ title: "Invoice linked to Financial Records" });
      onRefresh();
      setInvoiceDelivery(null);
    },
    onError: () => toast({ title: "Failed to save invoice", variant: "destructive" })
  });
  const openRaiseInvoice = (d) => {
    setInvoiceDelivery(d);
    setInvoiceForm({
      stockDeliveryId: d.id,
      transactionType: "expense",
      transactionDate: d.deliveryDate ? d.deliveryDate.split("T")[0] : "",
      description: `Goods Received — ${d.stockItemName || "product"}${d.quantity ? ` (${d.quantity} ${d.stockItemUnit || ""})`.trim() : ""}`,
      category: "Other Expense",
      vendorCustomer: d.supplierName || "",
      reference: d.invoiceReference || "",
      amountPence: d.costPence ? (d.costPence / 100).toFixed(2) : "",
      vatAmountPence: "",
      paymentMethod: "",
      notes: d.batchNumber ? `Batch: ${d.batchNumber}` : ""
    });
  };
  const filtered = (deliveries ?? []).filter((d) => !search || d.stockItemName?.toLowerCase().includes(search.toLowerCase()) || d.supplierName?.toLowerCase().includes(search.toLowerCase()));
  const hasProducts = products.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    !hasProducts && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, color: "#1d4ed8", style: { flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.875rem", color: "#1e40af" }, children: [
        "Before logging a delivery, add your products in the",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onGoToProducts, style: { fontWeight: 600, textDecoration: "underline", background: "none", border: "none", color: "#1e40af", cursor: "pointer", padding: 0 }, children: "Product Catalogue" }),
        " ",
        "tab first."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search deliveries...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        if (!hasProducts) {
          onGoToProducts();
        } else {
          setOpen(true);
        }
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Log Goods Received"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Truck, title: "No deliveries recorded", subtitle: "Log goods received to track stock coming onto the farm" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["GRN No.", "Date", "Product", "Supplier / PO", "Quantity", "Batch No.", "Lot No.", "Invoice Ref", "Cost", "Financial Record"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.75rem", color: "#166534", fontWeight: 600 }, children: d.grnNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }, children: fmt(d.deliveryDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: d.stockItemName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: d.supplierName || "—" }),
          d.poNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#166534", fontFamily: "monospace", marginTop: 2 }, children: d.poNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: fmtQty(d.quantity, d.stockItemUnit) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }, children: d.batchNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }, children: d.lotNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: d.invoiceReference || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: fmtCost(d.costPence) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem" }, children: d.financialTransactionId ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "#dcfce7",
          color: "#166534",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: "0.75rem",
          fontWeight: 500
        }, children: "✓ Invoice Raised" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => openRaiseInvoice(d),
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: "0.75rem",
              color: "#1e40af",
              cursor: "pointer",
              fontWeight: 500,
              whiteSpace: "nowrap"
            },
            children: "+ Raise Invoice"
          }
        ) })
      ] }, d.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: invoiceDelivery !== null, onOpenChange: (o) => {
      if (!o) setInvoiceDelivery(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Raise Invoice — Link to Financial Records" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }, children: "Pre-filled from the goods received record. Adjust any fields as needed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Transaction Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: invoiceForm.transactionDate || "", onChange: (e) => setInvoiceForm((f) => ({ ...f, transactionDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Category ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: invoiceForm.category || "", onValueChange: (v) => setInvoiceForm((f) => ({ ...f, category: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FINANCIAL_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Description ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: invoiceForm.description || "", onChange: (e) => setInvoiceForm((f) => ({ ...f, description: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Amount (£) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: invoiceForm.amountPence || "", onChange: (e) => setInvoiceForm((f) => ({ ...f, amountPence: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: invoiceForm.vatAmountPence || "", onChange: (e) => setInvoiceForm((f) => ({ ...f, vatAmountPence: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: invoiceForm.vendorCustomer || "", onChange: (e) => setInvoiceForm((f) => ({ ...f, vendorCustomer: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: invoiceForm.reference || "", onChange: (e) => setInvoiceForm((f) => ({ ...f, reference: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: invoiceForm.notes || "", onChange: (e) => setInvoiceForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setInvoiceDelivery(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => invoiceMut.mutate(invoiceForm),
            disabled: !invoiceForm.transactionDate || !invoiceForm.description || !invoiceForm.category || !invoiceForm.amountPence || invoiceMut.isPending,
            children: "Save & Link Invoice"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Goods Received" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Product ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.stockItemId, onValueChange: (v) => setForm((f) => ({ ...f, stockItemId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: p.name }, p.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId, onValueChange: (v) => setForm((f) => ({ ...f, supplierId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
                suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Delivery Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryDate, onChange: (e) => setForm((f) => ({ ...f, deliveryDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Quantity ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: form.quantity, onChange: (e) => setForm((f) => ({ ...f, quantity: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Purchase Order (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId, onValueChange: (v) => setForm((f) => ({ ...f, poId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select PO (optional)..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No PO — standalone delivery" }),
              (purchaseOrders ?? []).filter((po) => po.status !== "cancelled" && po.status !== "fully_received").map((po) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(po.id), children: [
                po.poNumber,
                " — ",
                po.supplierName || "No supplier"
              ] }, po.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. BT240301", value: form.batchNumber, onChange: (e) => setForm((f) => ({ ...f, batchNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. LOT-2026-001", value: form.lotNumber, onChange: (e) => setForm((f) => ({ ...f, lotNumber: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-1234", value: form.invoiceReference, onChange: (e) => setForm((f) => ({ ...f, invoiceReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: form.costPence, onChange: (e) => setForm((f) => ({ ...f, costPence: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.receivedBy, onChange: (v) => setForm((f) => ({ ...f, receivedBy: v })), staffNames, loading: membersLoading })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Optional notes...", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(form), disabled: !form.stockItemId || !form.deliveryDate || !form.quantity || createMut.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function MovementsTab({ movements, products, loading, farmId, onRefresh, toast }) {
  const [search, setSearch] = reactExports.useState("");
  const [filterProduct, setFilterProduct] = reactExports.useState("all");
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const filtered = (movements ?? []).filter((m) => {
    if (filterProduct !== "all" && String(m.stockItemId) !== filterProduct) return false;
    if (search && !m.stockItemName?.toLowerCase().includes(search.toLowerCase()) && !m.notes?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search movements...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterProduct, onValueChange: setFilterProduct, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All products" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All products" }),
          products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: p.name }, p.id))
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: RefreshCw, title: "No movements recorded", subtitle: "Movements appear automatically when goods are received or spray / medicine records are saved" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Product", "Type", "Qty Change", "Source", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((m, i) => {
        const qty = parseFloat(m.quantityChange ?? "0");
        const isIn = qty > 0;
        const isExpanded = expandedId === m.id;
        const isLast = i === filtered.length - 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: isExpanded || isLast ? "none" : "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }, children: fmt(m.movedAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: m.stockItemName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: movementBadge(m.movementType, m.quantityChange) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4, color: isIn ? "#166534" : "#b91c1c", fontWeight: 600 }, children: [
              isIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { size: 12 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { size: 12 }),
              Math.abs(qty) % 1 === 0 ? Math.abs(qty).toFixed(0) : Math.abs(qty).toFixed(2),
              " ",
              m.stockItemUnit || ""
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.75rem" }, children: [
              m.referenceType === "spray_application" && "Spray Record",
              m.referenceType === "medicine_record" && "Medicine Record",
              m.referenceType === "delivery" && "Goods Received",
              (!m.referenceType || m.referenceType === "manual") && "Manual"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.notes || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem 0.5rem", textAlign: "center" }, children: m.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setExpandedId(isExpanded ? null : m.id),
                style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px", borderRadius: 4, display: "flex", alignItems: "center" },
                title: isExpanded ? "Collapse" : "Show full note",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14, style: { transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" } })
              }
            ) })
          ] }),
          isExpanded && m.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: isLast ? "none" : "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, style: { padding: "0 0.875rem 0.75rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.625rem 0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }, children: "Note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#374151", margin: 0, lineHeight: 1.5 }, children: m.notes })
          ] }) }) })
        ] }, m.id);
      }) })
    ] }) })
  ] });
}
function ProductsTab({ products, suppliers, loading, farmId, onRefresh, toast }) {
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [form, setForm] = reactExports.useState({ name: "", category: "", productCode: "", mappNumber: "", unit: "", reorderLevel: "", storageLocation: "", defaultSupplierId: "", notes: "", approvalRequired: false, approverId: "" });
  const resetForm = () => setForm({ name: "", category: "", productCode: "", mappNumber: "", unit: "", reorderLevel: "", storageLocation: "", defaultSupplierId: "", notes: "", approvalRequired: false, approverId: "" });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/stock-items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Product added" });
      onRefresh();
      setOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/stock-items/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Product updated" });
      onRefresh();
      setOpen(false);
      setEditItem(null);
      resetForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const { data: staffData } = useQuery({ queryKey: ["farm-staff", farmId], queryFn: () => fetch(`/api/farms/${farmId}/staff`).then((r) => r.json()), enabled: !!farmId, staleTime: 12e4 });
  const staffList = staffData?.staff ?? [];
  const filtered = (products ?? []).filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
  const openEdit = (p) => {
    setEditItem(p);
    setForm({ name: p.name, category: p.category || "", productCode: p.productCode || "", mappNumber: p.mappNumber || "", unit: p.unit || "", reorderLevel: p.reorderLevel || "", storageLocation: p.storageLocation || "", defaultSupplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", notes: p.notes || "", approvalRequired: p.approvalRequired || false, approverId: p.approverId ? String(p.approverId) : "" });
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search products...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        resetForm();
        setEditItem(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add Product"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f0fdf4", borderRadius: 8, padding: "0.625rem 0.875rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#166534" }, children: "Linking a product here to a Spray Product in Spray Records will automatically deduct stock when applications are saved." }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Package, title: "No products in catalogue", subtitle: "Add products to track stock for fertilisers, pesticides, seeds and more" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Product Name", "Category", "Code", "MAPP No.", "Unit", "Reorder At", "Default Supplier", "Approval", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: p.category || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }, children: p.productCode || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }, children: p.mappNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: p.unit || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: p.reorderLevel ? `${p.reorderLevel} ${p.unit || ""}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: p.defaultSupplierName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: p.approvalRequired ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#ede9fe", color: "#6d28d9", borderRadius: 20, padding: "2px 8px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }, children: [
          "✓ ",
          p.approverName || "Any manager"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontSize: "0.75rem" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6", onClick: () => setViewRecord(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(p), style: { fontSize: "0.75rem", color: "#166534", cursor: "pointer", background: "none", border: "none" }, children: "Edit" })
        ] }) })
      ] }, p.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditItem(null);
        resetForm();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Product" : "Add Product" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Product Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Ammonium Nitrate 34.5%", value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category, onValueChange: (v) => setForm((f) => ({ ...f, category: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRODUCT_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.unit, onValueChange: (v) => setForm((f) => ({ ...f, unit: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select unit..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AN345", value: form.productCode, onChange: (e) => setForm((f) => ({ ...f, productCode: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "MAPP Number (pesticides)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. MAPP 12345", value: form.mappNumber, onChange: (e) => setForm((f) => ({ ...f, mappNumber: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reorder Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: `qty in ${form.unit || "units"}`, value: form.reorderLevel, onChange: (e) => setForm((f) => ({ ...f, reorderLevel: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.defaultSupplierId, onValueChange: (v) => setForm((f) => ({ ...f, defaultSupplierId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
                suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Chemical Store A", value: form.storageLocation, onChange: (e) => setForm((f) => ({ ...f, storageLocation: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8f4ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "0.875rem 1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: form.approvalRequired ? 12 : 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#4c1d95" }, children: "Purchase Approval Required" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.75rem", color: "#6d28d9" }, children: "When ordering this product, a specific person must approve the PO" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setForm((f) => ({ ...f, approvalRequired: !f.approvalRequired, approverId: !f.approvalRequired ? f.approverId : "" })),
                style: {
                  width: 42,
                  height: 24,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  flexShrink: 0,
                  background: form.approvalRequired ? "#7c3aed" : "#d1d5db",
                  position: "relative"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  position: "absolute",
                  top: 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 0.2s",
                  left: form.approvalRequired ? 21 : 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                } })
              }
            )
          ] }),
          form.approvalRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.78rem", color: "#4c1d95" }, children: "Required Approver" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.approverId, onValueChange: (v) => setForm((f) => ({ ...f, approverId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No specific person (any manager)" }),
                staffList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                  s.name,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontSize: "0.75em" }, children: [
                    "· ",
                    s.role
                  ] })
                ] }, s.id))
              ] })
            ] }),
            staffList.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: "No staff assigned to this farm yet. Staff can be added in the Staff & Training section." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditItem(null);
          resetForm();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const body = { ...form, approverId: form.approverId && form.approverId !== "__none__" ? Number(form.approverId) : null };
          editItem ? updateMut.mutate(body) : createMut.mutate(body);
        }, disabled: !form.name || (editItem ? updateMut.isPending : createMut.isPending), children: editItem ? "Save Changes" : "Add Product" })
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Product Catalogue Entry" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-lg", children: viewRecord.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.category || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.unit || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.productCode || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "MAPP Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.mappNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reorder Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.reorderLevel ? `${viewRecord.reorderLevel} ${viewRecord.unit || ""}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Default Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.defaultSupplierName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.storageLocation || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: viewRecord.notes || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Purchase Approval" }),
          viewRecord.approvalRequired ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 8, padding: "4px 12px", marginTop: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6d28d9", fontWeight: 600, fontSize: "0.85rem" }, children: [
            "Approval required",
            viewRecord.approverName ? ` from ${viewRecord.approverName}` : " from any manager"
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-muted-foreground", children: "Not required" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) })
  ] });
}
function poStatusBadge(status) {
  const styles = {
    draft: { bg: "#f3f4f6", color: "#374151", label: "Draft" },
    submitted: { bg: "#ede9fe", color: "#6d28d9", label: "Awaiting Approval" },
    sent: { bg: "#dbeafe", color: "#1e40af", label: "Sent" },
    partially_received: { bg: "#fef3c7", color: "#92400e", label: "Part. Received" },
    fully_received: { bg: "#d1fae5", color: "#065f46", label: "Fully Received" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" }
  };
  const s = styles[status] ?? styles.draft;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", background: s.bg, color: s.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: s.label });
}
function PurchaseOrdersTab({ orders, products, suppliers, feedStock, loading, farmId, onRefresh, toast, qc, onGoToGRN, prefilledPo, onClearPrefilledPo }) {
  const { isAtLeast, displayName } = useUserRole();
  const emptyForm = { supplierId: "", orderDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), expectedDeliveryDate: "", status: "draft", notes: "" };
  const emptyLine = { lineType: "item", stockItemId: "", description: "", category: "", quantityOrdered: "", unit: "", unitPricePence: "", notes: "" };
  const [open, setOpen] = reactExports.useState(!!prefilledPo);
  const [viewPo, setViewPo] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [form, setForm] = reactExports.useState(prefilledPo ? prefilledPo.form : emptyForm);
  const [lines, setLines] = reactExports.useState(prefilledPo ? prefilledPo.lines : [emptyLine]);
  reactExports.useEffect(() => {
    if (prefilledPo) {
      setForm(prefilledPo.form);
      setLines(prefilledPo.lines);
      setOpen(true);
      onClearPrefilledPo?.();
    }
  }, []);
  const viewQ = useQuery({
    queryKey: ["purchase-order-detail", viewPo?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders/${viewPo.id}`).then((r) => r.json()),
    enabled: !!viewPo?.id
  });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/purchase-orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Purchase Order created" });
      onRefresh();
      setOpen(false);
      setForm(emptyForm);
      setLines([{ ...emptyLine }]);
    },
    onError: () => toast({ title: "Failed to create PO", variant: "destructive" })
  });
  const updateStatusMut = useMutation({
    mutationFn: ({ poId, status }) => fetch(`/api/farms/${farmId}/purchase-orders/${poId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    onSuccess: () => {
      toast({ title: "Status updated" });
      onRefresh();
      if (viewPo) qc.invalidateQueries({ queryKey: ["purchase-order-detail", viewPo.id] });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (poId) => fetch(`/api/farms/${farmId}/purchase-orders/${poId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "PO deleted" });
      onRefresh();
      setViewPo(null);
    },
    onError: () => toast({ title: "Failed to delete PO", variant: "destructive" })
  });
  const [statusFilter, setStatusFilter] = reactExports.useState("outstanding");
  const OUTSTANDING_STATUSES = ["draft", "submitted", "sent", "partially_received"];
  const statusCounts = (orders ?? []).reduce((acc, po) => {
    acc[po.status] = (acc[po.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    if (OUTSTANDING_STATUSES.includes(po.status)) acc.outstanding = (acc.outstanding || 0) + 1;
    return acc;
  }, {});
  const statusFiltered = (orders ?? []).filter((po) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "outstanding") return OUTSTANDING_STATUSES.includes(po.status);
    return po.status === statusFilter;
  });
  const filtered = statusFiltered.filter((po) => !search || po.poNumber?.toLowerCase().includes(search.toLowerCase()) || po.supplierName?.toLowerCase().includes(search.toLowerCase()));
  const addLine = () => setLines((ls) => [...ls, emptyLine]);
  const removeLine = (i) => setLines((ls) => ls.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  const handleCreate = () => {
    const validLines = lines.filter(
      (l) => l.lineType !== "service" && l.stockItemId && l.quantityOrdered || l.lineType === "service" && l.description && l.quantityOrdered
    );
    createMut.mutate({
      ...form,
      submittedByName: displayName || void 0,
      lines: validLines.map((l) => ({
        stockItemId: l.lineType !== "service" && l.stockItemId ? Number(l.stockItemId) : null,
        quantityOrdered: parseFloat(l.quantityOrdered),
        unitPricePence: l.unitPricePence ? Math.round(parseFloat(l.unitPricePence) * 100) : null,
        notes: l.lineType === "service" ? [l.description, l.category ? `[${l.category}]` : ""].filter(Boolean).join(" ") + (l.notes ? ` — ${l.notes}` : "") : l.notes || null,
        feedStockItemId: null
      }))
    });
  };
  const detail = viewQ.data;
  const STATUS_TABS = [
    { key: "outstanding", label: "Outstanding", color: "#166534", bg: "#f0fdf4" },
    { key: "submitted", label: "Awaiting Approval", color: "#6d28d9", bg: "#ede9fe" },
    { key: "draft", label: "Draft", color: "#374151", bg: "#f3f4f6" },
    { key: "sent", label: "Sent", color: "#1e40af", bg: "#dbeafe" },
    { key: "partially_received", label: "Part. Received", color: "#92400e", bg: "#fef3c7" },
    { key: "fully_received", label: "Fully Received", color: "#065f46", bg: "#d1fae5" },
    { key: "all", label: "All", color: "#6b7280", bg: "#f9fafb" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    isAtLeast("manager") && (statusCounts["submitted"] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "linear-gradient(135deg, #6d28d9, #7c3aed)", color: "white", borderRadius: 10, padding: "0.875rem 1rem", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: 6, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontWeight: 700, fontSize: "0.9rem" }, children: [
            statusCounts["submitted"],
            " Purchase Order",
            statusCounts["submitted"] !== 1 ? "s" : "",
            " awaiting your approval"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.78rem", opacity: 0.9 }, children: "Review, approve, or return to draft — click to filter the list below" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatusFilter("submitted"), style: { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 7, color: "white", cursor: "pointer", padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }, children: "Review POs →" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }, children: STATUS_TABS.map((tab) => {
      const count = tab.key === "outstanding" ? statusCounts.outstanding ?? 0 : tab.key === "all" ? statusCounts.all ?? 0 : statusCounts[tab.key] ?? 0;
      const active = statusFilter === tab.key;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setStatusFilter(tab.key),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 11px",
            borderRadius: 20,
            border: active ? `2px solid ${tab.color}` : "1px solid #e5e7eb",
            background: active ? tab.bg : "white",
            color: active ? tab.color : "#6b7280",
            fontWeight: active ? 700 : 500,
            fontSize: "0.78rem",
            cursor: "pointer",
            transition: "all 0.15s"
          },
          children: [
            tab.label,
            count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: active ? tab.color : "#e5e7eb", color: active ? "white" : "#374151", borderRadius: 10, padding: "0px 6px", fontSize: "0.7rem", fontWeight: 700 }, children: count })
          ]
        },
        tab.key
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by PO number or supplier...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm(emptyForm);
        setLines([{ ...emptyLine }]);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Raise Purchase Order"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : (orders ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: ClipboardList, title: "No purchase orders yet", subtitle: "Raise a PO to track what you've ordered from suppliers, then link GRNs when goods arrive" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: "0.85rem" }, children: [
      "No orders match this filter. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatusFilter("all"), style: { color: "#166534", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }, children: "Show all" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["PO Number", "Supplier", "Order Date", "Expected Delivery", ...statusFilter === "submitted" ? ["Submitted By"] : [], "Lines", "Est. Value", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((po, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none", background: po.status === "submitted" && isAtLeast("manager") ? "#faf5ff" : "white" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "#166534" }, children: po.poNumber }),
          po.poNumber?.startsWith("AUTO-") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.65rem", background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "1px 5px", fontWeight: 600, verticalAlign: "middle" }, children: "auto" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151" }, children: po.supplierName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }, children: fmt(po.orderDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: po.expectedDeliveryDate ? "#374151" : "#9ca3af" }, children: po.expectedDeliveryDate ? fmt(po.expectedDeliveryDate) : "Not set" }),
        statusFilter === "submitted" && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6d28d9", fontSize: "0.82rem" }, children: po.submittedByName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: [
          po.lineCount ?? 0,
          " line",
          po.lineCount !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: po.totalPence ? "#111827" : "#9ca3af", fontWeight: po.totalPence ? 600 : 400, whiteSpace: "nowrap" }, children: po.totalPence ? `£${(Number(po.totalPence) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: poStatusBadge(po.status) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewPo(po), style: { fontSize: "0.75rem", color: po.status === "submitted" && isAtLeast("manager") ? "#6d28d9" : "#166534", cursor: "pointer", background: "none", border: "none", fontWeight: 600 }, children: po.status === "submitted" && isAtLeast("manager") ? "Review" : "View" }) })
      ] }, po.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setForm(emptyForm);
        setLines([{ ...emptyLine }]);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 860, maxHeight: "92vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 17, style: { color: "#166534" } }),
          "Raise Purchase Order"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280", margin: 0 }, children: "Order stock items, goods or services from any supplier across the holding" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 10, padding: "0.875rem 1rem", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId, onValueChange: (v) => setForm((f) => ({ ...f, supplierId: v === "__none__" ? "" : v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No supplier / TBC" }),
                  suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "submitted", children: "Submit for Approval" }),
                  isAtLeast("manager") && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent to Supplier" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Order Date ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.orderDate, onChange: (e) => setForm((f) => ({ ...f, orderDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Delivery" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedDeliveryDate, onChange: (e) => setForm((f) => ({ ...f, expectedDeliveryDate: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes / Special Instructions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Deliver to grain store, call ahead — contract ref 2024-A", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.85rem", color: "#111827", margin: 0 }, children: "Order Lines" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", margin: "2px 0 0" }, children: "Mix catalogue stock items and free-text services or one-off goods on the same order" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: addLine, style: { fontSize: "0.75rem", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "4px 10px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
              "Add Line"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 110 }, children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem" }, children: "Product / Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 64 }, children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 76 }, children: "Unit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 88 }, children: "£ / Unit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.5rem", textAlign: "right", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 72 }, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { width: 30 } })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lines.map((l, i) => {
              const isService = l.lineType === "service";
              const selectedProduct = !isService && l.stockItemId ? (products ?? []).find((p) => String(p.id) === String(l.stockItemId)) : null;
              const lineTotal = l.quantityOrdered && l.unitPricePence ? parseFloat(l.quantityOrdered) * parseFloat(l.unitPricePence) : null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < lines.length - 1 ? "1px solid #f3f4f6" : "none", background: isService ? "#fafaf9" : "white" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem 0.5rem", verticalAlign: "top" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: l.lineType || "item", onValueChange: (v) => updateLine(i, "lineType", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { height: 30, fontSize: "0.72rem", borderColor: isService ? "#d97706" : "#166534", color: isService ? "#92400e" : "#166534", background: isService ? "#fffbeb" : "#f0fdf4" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "item", children: "📦 Stock Item" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "service", children: "🔧 Service / Other" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.375rem 0.5rem", verticalAlign: "top" }, children: [
                  isService ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        placeholder: "What are you ordering? e.g. Agronomy visit, Haulage, Lab testing...",
                        value: l.description,
                        onChange: (e) => updateLine(i, "description", e.target.value),
                        style: { height: 30, fontSize: "0.78rem" }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: l.category || "__none__", onValueChange: (v) => updateLine(i, "category", v === "__none__" ? "" : v), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { height: 26, fontSize: "0.72rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Category (optional)..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Uncategorised service" }),
                        SERVICE_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                      ] })
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: l.stockItemId, onValueChange: (v) => {
                    const prod = (products ?? []).find((p) => String(p.id) === v);
                    setLines((ls) => ls.map((ll, idx) => idx === i ? { ...ll, stockItemId: v, unit: prod?.unit || ll.unit } : ll));
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { height: 30, fontSize: "0.78rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from catalogue..." }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      (products ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__empty__", disabled: true, children: "No products in catalogue yet" }),
                      (products ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                        p.name,
                        p.category ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af" }, children: [
                          " · ",
                          p.category
                        ] }) : ""
                      ] }, p.id))
                    ] })
                  ] }),
                  !isService && l.stockItemId && (() => {
                    const prod = (products ?? []).find((p) => String(p.id) === l.stockItemId);
                    if (!prod?.approvalRequired) return null;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 4, display: "flex", alignItems: "center", gap: 4, background: "#ede9fe", borderRadius: 4, padding: "2px 7px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", color: "#6d28d9", fontWeight: 600 }, children: [
                      "⚠ Approval required",
                      prod.approverName ? ` from ${prod.approverName}` : ""
                    ] }) });
                  })()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem 0.5rem", verticalAlign: "top" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0", value: l.quantityOrdered, onChange: (e) => updateLine(i, "quantityOrdered", e.target.value), style: { height: 30, fontSize: "0.78rem" } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem 0.5rem", verticalAlign: "top" }, children: selectedProduct?.unit && !isService ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#6b7280", lineHeight: "30px", display: "block", paddingLeft: 4 }, children: selectedProduct.unit }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: l.unit || "__none__", onValueChange: (v) => updateLine(i, "unit", v === "__none__" ? "" : v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { height: 30, fontSize: "0.72rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Unit" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "—" }),
                    ALL_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem 0.5rem", verticalAlign: "top" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.7rem", pointerEvents: "none" }, children: "£" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: l.unitPricePence, onChange: (e) => updateLine(i, "unitPricePence", e.target.value), style: { height: 30, fontSize: "0.78rem", paddingLeft: 20 } })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem 0.5rem", textAlign: "right", verticalAlign: "top" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: lineTotal ? "#111827" : "#d1d5db", lineHeight: "30px" }, children: lineTotal != null ? `£${lineTotal.toFixed(2)}` : "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem 0.5rem", verticalAlign: "top" }, children: lines.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeLine(i), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2, marginTop: 2 }, title: "Remove line", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) }) })
              ] }, i);
            }) })
          ] }) }),
          (() => {
            const total = lines.reduce((sum, l) => {
              if (l.quantityOrdered && l.unitPricePence) return sum + parseFloat(l.quantityOrdered) * parseFloat(l.unitPricePence);
              return sum;
            }, 0);
            return total > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, paddingTop: 8, paddingRight: 36 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: "Estimated Order Total:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.9rem", fontWeight: 700, color: "#111827" }, children: [
                "£",
                total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              ] })
            ] }) : null;
          })()
        ] }),
        lines.some((l) => l.lineType !== "service" && l.stockItemId && (products ?? []).find((p) => String(p.id) === String(l.stockItemId) && p.category === "Feed")) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#166534", fontWeight: 600, margin: "0 0 4px" }, children: "🌾 Feed Stock Bin Links" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#4b7c6f", margin: 0 }, children: "Feed items on this PO will update Feed Stock awaiting quantities automatically when the order is active. To link a specific bin, record the GRN after delivery." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreate, disabled: !form.orderDate || createMut.isPending, children: createMut.isPending ? "Creating…" : "Create Purchase Order" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewPo, onOpenChange: (o) => {
      if (!o) setViewPo(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 740 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", color: "#166534" }, children: viewPo?.poNumber }),
        viewPo && poStatusBadge(viewPo.status)
      ] }) }),
      viewQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-6 text-center", children: "Loading..." }) : detail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.75rem" }, children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: detail.record?.supplierName || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.75rem" }, children: "Order Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(detail.record?.orderDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.75rem" }, children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: detail.record?.expectedDeliveryDate ? fmt(detail.record.expectedDeliveryDate) : "—" })
          ] }),
          detail.record?.submittedByName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.75rem" }, children: "Submitted By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#6d28d9" }, children: detail.record.submittedByName })
          ] })
        ] }),
        viewPo?.poNumber?.startsWith("AUTO-") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, color: "#92400e", style: { flexShrink: 0, marginTop: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", margin: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Auto-generated PO" }),
            " — this draft was created automatically when stock dropped below reorder level. Review the suggested quantity and submit for approval or edit as needed before sending to the supplier."
          ] })
        ] }),
        detail.record?.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", color: "#6b7280", background: "#f9fafb", borderRadius: 6, padding: "0.5rem 0.75rem" }, children: detail.record.notes }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#374151" }, children: "Order Lines" }),
          (detail.lines ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#9ca3af" }, children: "No lines recorded" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Product", "Ordered", "Received", "Unit Price", "Progress"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (detail.lines ?? []).map((l, i) => {
              const pct = l.quantityOrdered > 0 ? Math.min(100, Math.round(parseFloat(l.quantityReceived ?? 0) / parseFloat(l.quantityOrdered) * 100)) : 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < detail.lines.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 500 }, children: l.stockItemName ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.stockItemName }) : l.notes ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#374151" }, children: l.notes }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: fmtQty(l.quantityOrdered, l.stockItemUnit) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: pct >= 100 ? "#166534" : "#374151" }, children: fmtQty(l.quantityReceived ?? 0, l.stockItemUnit) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: l.unitPricePence ? `£${(l.unitPricePence / 100).toFixed(2)}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${pct}%`, height: "100%", background: pct >= 100 ? "#16a34a" : "#f59e0b", borderRadius: 3 } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", color: "#6b7280", minWidth: 28 }, children: [
                    pct,
                    "%"
                  ] })
                ] }) })
              ] }, l.id);
            }) })
          ] }) })
        ] }),
        (detail.grns ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#374151" }, children: "Goods Received (GRNs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["GRN No.", "Date", "Product", "Qty", "Batch", "Lot", "Invoice"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (detail.grns ?? []).map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < detail.grns.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "#166534", fontWeight: 600, fontSize: "0.75rem" }, children: g.grnNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: fmt(g.deliveryDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: g.stockItemName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: fmtQty(g.quantity, g.stockItemUnit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.72rem", color: "#6b7280" }, children: g.batchNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.72rem", color: "#6b7280" }, children: g.lotNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: g.invoiceReference || "—" })
            ] }, g.id)) })
          ] }) })
        ] }),
        viewPo?.status === "submitted" && isAtLeast("manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "linear-gradient(135deg, #6d28d9, #7c3aed)", borderRadius: 10, padding: "0.875rem 1rem", color: "white", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 4px", fontWeight: 700, fontSize: "0.9rem" }, children: "Approval Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 10px", fontSize: "0.78rem", opacity: 0.9 }, children: [
            viewPo?.submittedByName ? `Submitted by ${viewPo.submittedByName} — ` : "",
            "Review the order lines and either approve (send to supplier) or return to draft for amendment."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", style: { background: "rgba(255,255,255,0.95)", color: "#166534", fontWeight: 700 }, onClick: () => updateStatusMut.mutate({ poId: viewPo.id, status: "sent" }), disabled: updateStatusMut.isPending, children: "✓ Approve & Send to Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", style: { background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }, variant: "outline", onClick: () => updateStatusMut.mutate({ poId: viewPo.id, status: "draft" }), disabled: updateStatusMut.isPending, children: "Return to Draft" })
          ] })
        ] }),
        viewPo?.status === "submitted" && !isAtLeast("manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 10, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#6d28d9", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 14, color: "white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#4c1d95" }, children: "Awaiting Manager Approval" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.78rem", color: "#6d28d9" }, children: "This order has been submitted and is pending approval by a Farm Manager or Owner." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
          viewPo?.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { background: "#ede9fe", color: "#6d28d9", borderColor: "#c4b5fd" }, onClick: () => updateStatusMut.mutate({ poId: viewPo.id, status: "submitted" }), disabled: updateStatusMut.isPending, children: "Submit for Approval" }),
          viewPo?.status === "draft" && isAtLeast("manager") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => updateStatusMut.mutate({ poId: viewPo.id, status: "sent" }), disabled: updateStatusMut.isPending, children: "Mark as Sent" }),
          viewPo?.status !== "cancelled" && viewPo?.status !== "fully_received" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
              setViewPo(null);
              onGoToGRN();
            }, children: "Log Goods Received (GRN)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { color: "#b91c1c", borderColor: "#fecaca" }, onClick: () => updateStatusMut.mutate({ poId: viewPo.id, status: "cancelled" }), disabled: updateStatusMut.isPending, children: "Cancel PO" })
          ] }),
          (viewPo?.status === "draft" || viewPo?.status === "submitted") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { color: "#b91c1c", borderColor: "#fecaca" }, onClick: () => deleteMut.mutate(viewPo.id), disabled: deleteMut.isPending, children: "Delete Draft" })
        ] })
      ] }) : null
    ] }) })
  ] });
}
const SUPPLIER_TYPES = [
  { value: "general", label: "General" },
  { value: "feed", label: "Feed Supplier (UFAS/FEMAS)" },
  { value: "agchem", label: "Agrochemicals / Sprays" },
  { value: "fuel", label: "Fuel / Energy" },
  { value: "vet", label: "Veterinary" },
  { value: "seed", label: "Seeds" },
  { value: "machinery", label: "Machinery / Parts" },
  { value: "waste", label: "Waste Carrier" },
  { value: "grain_merchant", label: "Grain Merchant / Buyer" },
  { value: "milk_buyer", label: "Milk Buyer / Processor" },
  { value: "livestock_processor", label: "Livestock Processor / Abattoir" },
  { value: "livestock_mart", label: "Livestock Mart / Auction" },
  { value: "hatchery", label: "Hatchery / Chick Supplier" },
  { value: "poultry_integrator", label: "Poultry Integrator" },
  { value: "egg_packer", label: "Egg Packing Station" },
  { value: "pig_processor", label: "Pig Processor" },
  { value: "direct_customer", label: "Direct Customer / Wholesale Account" },
  { value: "landlord", label: "Landlord / Landowner" },
  { value: "other", label: "Other" }
];
function certExpiryStatus(expiry) {
  if (!expiry) return null;
  const d = new Date(expiry);
  const now = /* @__PURE__ */ new Date();
  const daysUntil = Math.round((d.getTime() - now.getTime()) / (1e3 * 86400));
  if (daysUntil < 0) return "expired";
  if (daysUntil <= 60) return "soon";
  return "ok";
}
function SuppliersTab({ suppliers, loading, farmId, onRefresh, toast }) {
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [filterType, setFilterType] = reactExports.useState("all");
  const { data: contractorsData } = useQuery({
    queryKey: ["contractors-hs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/contractors?showInactive=false`).then((r) => r.json())
  });
  const linkedSupplierIds = new Set((contractorsData?.contractors ?? []).map((c) => c.supplierId).filter(Boolean));
  const emptyForm = { name: "", contactName: "", email: "", phone: "", address: "", category: "", supplierType: "general", accountNumber: "", ufasNumber: "", femasNumber: "", aphaFeedRegNumber: "", certificationBody: "", certificationExpiry: "", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const resetForm = () => setForm(emptyForm);
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/suppliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Trade contact added" });
      onRefresh();
      setOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/suppliers/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Trade contact updated" });
      onRefresh();
      setOpen(false);
      setEditItem(null);
      resetForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deactivateMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/suppliers/${id}/deactivate`, { method: "PATCH" }),
    onSuccess: () => {
      toast({ title: "Contact deactivated — all historic records preserved" });
      onRefresh();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const reactivateMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/suppliers/${id}/reactivate`, { method: "PATCH" }),
    onSuccess: () => {
      toast({ title: "Contact reactivated" });
      onRefresh();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const allSuppliers = suppliers ?? [];
  const allActive = allSuppliers.filter((s) => s.isActive !== false);
  const filtered = allSuppliers.filter(
    (s) => (filterType === "all" || s.supplierType === filterType) && (!search || s.name?.toLowerCase().includes(search.toLowerCase()))
  );
  const expiringSoon = allActive.filter((s) => {
    const st = certExpiryStatus(s.certificationExpiry);
    return st === "expired" || st === "soon";
  });
  const openEdit = (s) => {
    setEditItem(s);
    setForm({
      name: s.name || "",
      contactName: s.contactName || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      category: s.category || "",
      supplierType: s.supplierType || "general",
      accountNumber: s.accountNumber || "",
      ufasNumber: s.ufasNumber || "",
      femasNumber: s.femasNumber || "",
      aphaFeedRegNumber: s.aphaFeedRegNumber || "",
      certificationBody: s.certificationBody || "",
      certificationExpiry: s.certificationExpiry ? String(s.certificationExpiry).substring(0, 10) : "",
      notes: s.notes || ""
    });
    setOpen(true);
  };
  const isFeedSupplier = form.supplierType === "feed";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    expiringSoon.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "flex-start", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, color: "#92400e", style: { marginTop: 2, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#92400e", fontWeight: 600, marginBottom: 2 }, children: "Trade contact certifications require attention:" }),
        expiringSoon.map((s) => {
          const st = certExpiryStatus(s.certificationExpiry);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#92400e" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: s.name }),
            " — ",
            st === "expired" ? "UFAS/certification EXPIRED" : "expires soon",
            " (",
            s.certificationExpiry ? new Date(s.certificationExpiry).toLocaleDateString("en-GB") : "",
            ")"
          ] }, s.id);
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1, minWidth: 180 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search trade contacts...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All types" }),
          SUPPLIER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        resetForm();
        setEditItem(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add Trade Contact"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Building2, title: "No trade contacts found", subtitle: "Add trade contacts — buyers, processors, input suppliers and more" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }, children: filtered.map((s) => {
      const certStatus = certExpiryStatus(s.certificationExpiry);
      const isActive = s.isActive !== false;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: isActive ? "#fff" : "#f9fafb", opacity: isActive ? 1 : 0.7, border: !isActive ? "1px solid #e5e7eb" : certStatus === "expired" ? "1.5px solid #ef4444" : certStatus === "soon" ? "1.5px solid #f59e0b" : "1px solid #e5e7eb", borderRadius: 10, padding: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, fontSize: "0.9rem", textDecoration: isActive ? "none" : "line-through", color: isActive ? void 0 : "#9ca3af" }, children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }, children: [
            !isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#f3f4f6", color: "#6b7280", border: "none", fontSize: "0.65rem", letterSpacing: "0.05em" }, children: "INACTIVE" }),
            isActive && s.isApproved && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#d1fae5", color: "#065f46", border: "none", fontSize: "0.7rem" }, children: "Approved" }),
            isActive && s.supplierType && s.supplierType !== "general" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#eff6ff", color: "#1d4ed8", border: "none", fontSize: "0.7rem" }, children: SUPPLIER_TYPES.find((t) => t.value === s.supplierType)?.label ?? s.supplierType }),
            isActive && linkedSupplierIds.has(s.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: "0.7rem" }, children: "H&S File" })
          ] })
        ] }),
        s.category && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4 }, children: s.category }),
        s.contactName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#374151" }, children: s.contactName }),
        s.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: s.phone }),
        s.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: s.email }),
        isActive && s.ufasNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#065f46", marginTop: 4, fontFamily: "monospace", background: "#d1fae5", borderRadius: 4, padding: "2px 6px", display: "inline-block" }, children: [
          "UFAS: ",
          s.ufasNumber
        ] }),
        isActive && s.femasNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#5b21b6", marginTop: 2, fontFamily: "monospace", background: "#ede9fe", borderRadius: 4, padding: "2px 6px", display: "inline-block" }, children: [
          "FEMAS: ",
          s.femasNumber
        ] }),
        isActive && s.certificationExpiry && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", marginTop: 4, color: certStatus === "expired" ? "#dc2626" : certStatus === "soon" ? "#d97706" : "#6b7280" }, children: [
          certStatus === "expired" ? "⚠ Cert EXPIRED" : certStatus === "soon" ? "⚠ Cert expires soon" : "Cert expires:",
          " ",
          new Date(s.certificationExpiry).toLocaleDateString("en-GB")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginTop: 8, alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6", onClick: () => setViewRecord(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(s), style: { fontSize: "0.75rem", color: "#166534", cursor: "pointer", background: "none", border: "none", padding: 0 }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => isActive ? deactivateMut.mutate(s.id) : reactivateMut.mutate(s.id),
              style: { fontSize: "0.75rem", color: isActive ? "#dc2626" : "#16a34a", cursor: "pointer", background: "none", border: "none", padding: 0 },
              children: isActive ? "Deactivate" : "Reactivate"
            }
          )
        ] })
      ] }, s.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditItem(null);
        resetForm();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Trade Contact" : "Add Trade Contact" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Company Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierType || "general", onValueChange: (v) => setForm((f) => ({ ...f, supplierType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SUPPLIER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category, onValueChange: (v) => setForm((f) => ({ ...f, category: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SUPPLIER_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.contactName, onChange: (e) => setForm((f) => ({ ...f, contactName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.email, onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: form.supplierType === "waste" ? "EA Carrier Reg No." : form.supplierType === "hatchery" ? "Hatchery Approval No." : "Account Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.accountNumber,
                onChange: (e) => setForm((f) => ({ ...f, accountNumber: e.target.value })),
                placeholder: form.supplierType === "waste" ? "e.g. CBDU01234" : "",
                style: form.supplierType === "waste" ? { fontFamily: "monospace" } : {}
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.address, onChange: (e) => setForm((f) => ({ ...f, address: e.target.value })) })
        ] }),
        isFeedSupplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800", children: "Feed Supplier Approvals — required for Red Tractor & APHA compliance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UFAS Approval Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ufasNumber, onChange: (e) => setForm((f) => ({ ...f, ufasNumber: e.target.value })), placeholder: "UFAS-XXXX-XXXXXX", className: "font-mono text-sm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Universal Feed Assurance Scheme — check supplier certificate" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "FEMAS Approval Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.femasNumber, onChange: (e) => setForm((f) => ({ ...f, femasNumber: e.target.value })), placeholder: "FEMAS-XXXX", className: "font-mono text-sm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Feed Materials Assurance Scheme (if applicable)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Feed Business Registration No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.aphaFeedRegNumber, onChange: (e) => setForm((f) => ({ ...f, aphaFeedRegNumber: e.target.value })), placeholder: "e.g. GB-XXXX-XXXXX", className: "font-mono text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification body" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificationBody, onChange: (e) => setForm((f) => ({ ...f, certificationBody: e.target.value })), placeholder: "e.g. UFAS Scheme" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification expiry" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.certificationExpiry, onChange: (e) => setForm((f) => ({ ...f, certificationExpiry: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditItem(null);
          resetForm();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const payload = { ...form };
          if (!payload.certificationExpiry) delete payload.certificationExpiry;
          editItem ? updateMut.mutate(payload) : createMut.mutate(payload);
        }, disabled: !form.name || (editItem ? updateMut.isPending : createMut.isPending), children: editItem ? "Save Changes" : "Add Supplier" })
      ] })
    ] }) })
  ] });
}
const VARIANCE_REASONS = [
  { value: "calibration", label: "Calibration / weighing error" },
  { value: "spillage", label: "Spillage / wastage" },
  { value: "theft", label: "Theft / loss" },
  { value: "data-entry", label: "Data entry error" },
  { value: "other", label: "Other" }
];
function ConfirmDialogStock({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: () => {
        onConfirm();
        onCancel();
      }, children: confirmLabel })
    ] })
  ] }) });
}
function StocktakeTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeId, setActiveId] = reactExports.useState(null);
  const [localCounts, setLocalCounts] = reactExports.useState({});
  const [newOpen, setNewOpen] = reactExports.useState(false);
  const [newForm, setNewForm] = reactExports.useState({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "" });
  const [confirmState, setConfirmState] = reactExports.useState({ open: false, title: "", message: "", onConfirm: () => {
  } });
  const showConfirm = (title, message, onConfirm, opts) => setConfirmState({ open: true, title, message, onConfirm, ...opts });
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["stocktakes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stocktakes`, { credentials: "include" }).then((r) => r.json())
  });
  const { data: activeSession } = useQuery({
    queryKey: ["stocktake-detail", farmId, activeId],
    queryFn: () => fetch(`/api/farms/${farmId}/stocktakes/${activeId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: activeId !== null
  });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/stocktakes`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["stocktakes", farmId] });
      setNewOpen(false);
      setLocalCounts({});
      setActiveId(data.id);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateItemMut = useMutation({
    mutationFn: ({ sessionId, itemId, body }) => fetch(`/api/farms/${farmId}/stocktakes/${sessionId}/items/${itemId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocktake-detail", farmId, activeId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const completeMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/stocktakes/${id}/complete`, { method: "POST", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocktakes", farmId] });
      qc.invalidateQueries({ queryKey: ["stocktake-detail", farmId, activeId] });
      qc.invalidateQueries({ queryKey: ["stock-levels", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/stocktakes/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocktakes", farmId] });
      setActiveId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const itemsMissingReason = (activeSession?.items ?? []).filter((i) => {
    const v = i.variance !== null ? parseFloat(i.variance) : 0;
    return Math.abs(v) > 1e-3 && !i.varianceReason;
  });
  const canComplete = (activeSession?.countedCount ?? 0) >= (activeSession?.itemCount ?? 0) && itemsMissingReason.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialogStock,
      {
        open: confirmState.open,
        title: confirmState.title,
        message: confirmState.message,
        onConfirm: confirmState.onConfirm,
        onCancel: () => setConfirmState((s) => ({ ...s, open: false })),
        confirmLabel: confirmState.confirmLabel,
        confirmVariant: confirmState.variant
      }
    ),
    activeId === null ? (
      /* ── List view ──────────────────────────────────────────────────── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-4 h-4" }),
              "Stocktake Records"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Physically count all farm inputs and compare against system quantities. Variance reasons are required for Red Tractor compliance." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setNewForm({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "" });
            setNewOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
            "New Stocktake"
          ] })
        ] }),
        sessionsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground text-sm", children: 'No stocktakes recorded yet. Click "New Stocktake" to begin your first count.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Date", "Status", "Progress", "Variance £", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sessions.map((s) => {
            const varVal = s.totalVarianceValue ? parseFloat(s.totalVarianceValue) : null;
            const isDraft = s.status === "draft";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30 cursor-pointer", onClick: () => {
              setLocalCounts({});
              setActiveId(s.id);
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs max-w-[180px] truncate", children: s.notes || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => {
                  setLocalCounts({});
                  setActiveId(s.id);
                }, children: isDraft ? "Continue" : "View" }),
                isDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => showConfirm("Delete Stocktake", "Delete this draft stocktake? All counts entered so far will be lost.", () => deleteMut.mutate(s.id), { confirmLabel: "Delete", variant: "destructive" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) })
              ] }) })
            ] }, s.id);
          }) })
        ] }) })
      ] })
    ) : (
      /* ── Detail view ────────────────────────────────────────────────── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
            setActiveId(null);
            qc.invalidateQueries({ queryKey: ["stocktakes", farmId] });
          }, children: "← Back" }),
          activeSession && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm", children: [
                  "Stocktake — ",
                  fmtDate(activeSession.stocktakeDate)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activeSession.status === "draft" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`, children: activeSession.status === "draft" ? "In Progress" : "Completed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  activeSession.countedCount ?? 0,
                  " / ",
                  activeSession.itemCount ?? 0,
                  " items counted"
                ] })
              ] }),
              activeSession.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: activeSession.notes })
            ] }),
            activeSession.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                disabled: !canComplete || completeMut.isPending,
                onClick: () => showConfirm("Complete Stocktake", "Stock levels will be updated to match your physical counts. This cannot be undone. Variance records will be created for Red Tractor audit.", () => completeMut.mutate(activeSession.id), { confirmLabel: "Complete Stocktake" }),
                children: [
                  completeMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin mr-1" }) : null,
                  "Complete Stocktake"
                ]
              }
            )
          ] })
        ] }),
        !activeSession ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : (activeSession.items ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground text-sm", children: "No stock items found. Add items to the Product Catalogue first, then start a new stocktake." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          (() => {
            const items = activeSession.items ?? [];
            const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
            const negCount = items.filter((i) => i.variance !== null && parseFloat(i.variance) < 0).length;
            const uncounted = items.filter((i) => i.countedQty === null).length;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
              { label: "Uncounted", value: String(uncounted), sub: "items remaining", color: uncounted > 0 ? "text-amber-600" : "text-green-600" },
              { label: "Total Variance", value: `${totalVar >= 0 ? "+" : ""}£${Math.abs(totalVar).toFixed(2)}`, sub: "cost value difference", color: totalVar < 0 ? "text-red-600" : totalVar > 0 ? "text-amber-600" : "text-green-600" },
              { label: "Shortfalls", value: String(negCount), sub: "lines below system qty", color: negCount > 0 ? "text-red-600" : "text-green-600" }
            ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: card.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${card.color}`, children: card.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: card.sub })
            ] }, card.label)) });
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Item", "Type", "Unit", "System Qty", "Counted", "Variance", "Variance £", "Reason *", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (activeSession.items ?? []).map((item) => {
              const varNum = item.variance !== null ? parseFloat(item.variance) : null;
              const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue) : null;
              const varColor = varNum === null ? "" : varNum < 0 ? "text-red-600 font-semibold" : varNum === 0 ? "text-green-600" : "text-amber-600 font-semibold";
              const rowBg = varNum === null ? "" : varNum < 0 ? "bg-red-50/40" : varNum > 0 ? "bg-amber-50/30" : "";
              const hasVariance = varNum !== null && Math.abs(varNum) > 1e-3;
              const isCompleted = activeSession.status === "completed";
              const localVal = localCounts[item.id] !== void 0 ? localCounts[item.id] : item.countedQty ?? "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b last:border-0 ${rowBg}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 font-medium whitespace-nowrap", children: item.itemName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs capitalize", children: item.stockType?.replace(/-/g, " ") || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs", children: item.unit || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: parseFloat(item.expectedQty).toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.countedQty ?? "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
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
                      updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, body: { countedQty: val } });
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 pr-3 ${varColor}`, children: varNum === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : `${varNum >= 0 ? "+" : ""}${varNum.toFixed(2)}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 pr-3 ${varColor}`, children: varVal === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : `${varVal >= 0 ? "+" : ""}£${Math.abs(varVal).toFixed(2)}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: hasVariance && !isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: item.varianceReason ?? "__none__", onValueChange: (val) => updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, body: { varianceReason: val === "__none__" ? null : val } }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reason" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— select —" }),
                    VARIANCE_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
                  ] })
                ] }) : hasVariance && isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: VARIANCE_REASONS.find((r) => r.value === item.varianceReason)?.label ?? item.varianceReason ?? "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: item.notes || "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    className: "h-7 text-xs w-32",
                    placeholder: "Optional",
                    defaultValue: item.notes ?? "",
                    onBlur: (e) => {
                      if (e.target.value !== (item.notes ?? "")) updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, body: { notes: e.target.value || null } });
                    }
                  }
                ) })
              ] }, item.id);
            }) })
          ] }) }),
          (activeSession.items ?? []).some((i) => i.unitCostPence === null) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground border-t pt-2", children: [
            "* Variance £ shows ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "—" }),
            " for items without a unit cost. Add unit costs in the Product Catalogue to see cost-value variance."
          ] }),
          activeSession.status === "draft" && itemsMissingReason.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              itemsMissingReason.length,
              " item",
              itemsMissingReason.length > 1 ? "s have" : " has",
              " a variance"
            ] }),
            " — a reason must be selected for each before completing (Red Tractor requirement)."
          ] }),
          activeSession.status === "draft" && (activeSession.countedCount ?? 0) < (activeSession.itemCount ?? 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center border-t pt-3", children: [
            "Count all ",
            (activeSession.itemCount ?? 0) - (activeSession.countedCount ?? 0),
            " remaining items before you can complete the stocktake."
          ] })
        ] })
      ] })
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: newOpen, onOpenChange: (o) => {
      if (!o) setNewOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New Stocktake" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Snaps the current system stock for all active farm inputs (excl. workshop parts). You'll then count and enter physical quantities." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stocktake Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: newForm.stocktakeDate, onChange: (e) => setNewForm((f) => ({ ...f, stocktakeDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newForm.notes, placeholder: "e.g. Monthly Red Tractor count", onChange: (e) => setNewForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setNewOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !newForm.stocktakeDate || createMut.isPending,
            onClick: () => createMut.mutate({ stocktakeDate: newForm.stocktakeDate, notes: newForm.notes || void 0 }),
            children: createMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Start Stocktake"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  SuppliersStockPage as default
};
